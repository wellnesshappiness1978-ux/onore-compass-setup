import { supabase } from "@/integrations/supabase/client";
import { getPushConfig, removePushDevice, savePushDevice } from "./push.functions";
import { readReminderSettings, remindersPaused } from "./daily-reminders";

export const PUSH_TOKEN_KEY = "onore-push-token";
export type PushResult = "registered" | "signin" | "not-configured" | "unsupported" | "open-in-new-tab" | "denied";
type Entry = { title: string; body: string };

export function pushToken(): string | null {
  try { return localStorage.getItem(PUSH_TOKEN_KEY); } catch { return null; }
}

/** Must run from a click: registers this device for background delivery (signed-in users only). */
export async function enablePush(): Promise<PushResult> {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  const { data } = await supabase.auth.getSession();
  if (!data.session) return "signin";
  const { isSupported, getMessaging, getToken } = await import("firebase/messaging");
  if (!(await isSupported())) return "unsupported";
  if (window.top !== window.self) return "open-in-new-tab";
  const cfg = await getPushConfig();
  const senderId = cfg.appId.split(":")[1] ?? "";
  if (!cfg.ready || !senderId) return "not-configured";
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return "denied";
  const firebaseConfig = { apiKey: cfg.apiKey, appId: cfg.appId, messagingSenderId: senderId, projectId: "agolmen-compass" };
  const { initializeApp, getApps } = await import("firebase/app");
  // projectId must match the real Firebase project; it is derived from the sender via Installations if wrong, so prefer the SW query too.
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const reg = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${new URLSearchParams(firebaseConfig).toString()}`);
  const token = await getToken(getMessaging(app), { vapidKey: cfg.vapidKey, serviceWorkerRegistration: reg });
  if (!token) return "denied";
  localStorage.setItem(PUSH_TOKEN_KEY, token);
  await syncPushNow();
  window.dispatchEvent(new Event("onore-push-change"));
  return "registered";
}

let entries: Record<string, Entry> = {};
let timer: ReturnType<typeof setTimeout> | null = null;
export function setPushEntries(next: Record<string, Entry>) { entries = next; schedulePushSync(); }

export function schedulePushSync() {
  if (typeof window === "undefined" || !pushToken()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void syncPushNow(); }, 800);
}

export async function syncPushNow() {
  const token = pushToken(); if (!token) return;
  const settings = readReminderSettings();
  const reminders = Object.fromEntries(Object.entries(entries).flatMap(([id, e]) => {
    const s = settings[id]; if (!s) return [];
    return [[id, { on: s.on, time: s.time, title: e.title.slice(0, 200), body: e.body.slice(0, 600) }]];
  }));
  try {
    await savePushDevice({ data: { token, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo", language: document.documentElement.lang || "ja", paused: remindersPaused(), reminders } });
  } catch (e) { console.warn("push sync failed", e); }
}

export async function disablePush() {
  const token = pushToken(); if (!token) return;
  try { await removePushDevice({ data: { token } }); } catch { /* signed out */ }
  localStorage.removeItem(PUSH_TOKEN_KEY);
  window.dispatchEvent(new Event("onore-push-change"));
}
