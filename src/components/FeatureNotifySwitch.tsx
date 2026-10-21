import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Language } from "@/lib/translations";
import { effectiveReminder, migrateEveningReminder, PAUSE_KEY, REMINDER_KEY, readReminderSettings, remindersPaused } from '@/lib/daily-reminders';
import { reminderCopy } from '@/lib/reminder-copy';

type Setting = { on: boolean; time: string };
const KEY = REMINDER_KEY;

function readAll(): Record<string, Setting> {
  return readReminderSettings();
}

/** Small round icon tinted with today's lucky color; falls back to the brand icon. */
function colorIcon(color?: string) {
  if (!color) return "/favicon.png";
  try {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"); if (!g) return "/favicon.png";
    const grad = g.createRadialGradient(48, 44, 8, 64, 64, 64); grad.addColorStop(0, "#FFFFFF"); grad.addColorStop(0.35, color); grad.addColorStop(1, color);
    g.fillStyle = grad; g.beginPath(); g.arc(64, 64, 60, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#F4D03F"; g.lineWidth = 6; g.stroke();
    return c.toDataURL("image/png");
  } catch { return "/favicon.png"; }
}

type Entry = { title: string; body: string; color?: string | undefined };
const registry = new Map<string, Entry>();
/** Allowed catalogue survives tab navigation; live Today content wins when present. */
const fallbacks = new Map<string, Entry>();
export function registerReminderFallbacks(entries: Record<string, Entry>): () => void {
  migrateEveningReminder();
  fallbacks.clear();
  for (const [id, entry] of Object.entries(entries)) fallbacks.set(id, entry);
  startScheduler();
  return () => { fallbacks.clear(); if (timer) clearInterval(timer); timer = null; };
}
let timer: ReturnType<typeof setInterval> | null = null;
/** One shared scheduler: all reminders set for the same minute are merged into a single bulleted notification. */
function startScheduler() {
  if (timer || typeof window === "undefined") return;
  const tick = () => {
    if (remindersPaused() || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const now = new Date(); const hm = now.toTimeString().slice(0, 5); const day = now.toDateString();
    const settings = readAll();
    const due = [...fallbacks.entries()].map(([fid, fallback]) => [fid, registry.get(fid) ?? fallback] as const).filter(([fid]) => effectiveReminder(settings[fid], false) && settings[fid]?.time === hm);
    const sentKey = `${KEY}-sent-${hm}`;
    if (!due.length || localStorage.getItem(sentKey) === day) return;
    const ja = (document.documentElement.lang || "ja").startsWith("ja");
    const locale = document.documentElement.lang as Language;
    const head = ja ? "【アゴルメンの羅針盤】本日の開運サマリー" : `Agolmen's Compass · ${reminderCopy[locale]?.today ?? reminderCopy.en.today}`;
    const body = due.map(([, e]) => `・${e.title}：${e.body}`).join("\n");
    const color = due.find(([, e]) => e.color)?.[1].color;
    try { const n = new Notification(head, { body, icon: colorIcon(color), badge: colorIcon(color), tag: `onore-summary-${hm}` }); localStorage.setItem(sentKey, day); n.onclick = () => { window.focus(); window.dispatchEvent(new CustomEvent("onore-open", { detail: "compass" })); n.close(); }; } catch { /* unsupported; retry next tick */ }
  };
  tick(); timer = setInterval(tick, 30_000);
}

/** Per-feature daily reminder. Delivers only while the app is open; no background push provider is connected. */
export default function FeatureNotifySwitch({ id, title, body, language, disabled, color, variant = "full", lockedNote }: { id: string; title: string; body: string; language: Language; disabled?: boolean; color?: string | undefined; variant?: "full" | "link" | "center"; lockedNote?: string }) {
  const t = { ...reminderCopy[language], note: reminderCopy[language].openOnly, locked: reminderCopy[language].nightTeaser };
  const [paused, setPaused] = useState(false);
  const [s, setS] = useState<Setting>({ on: false, time: "07:00" });
  const [msg, setMsg] = useState("");
  const [help, setHelp] = useState(false);
  useEffect(() => { const v = readAll()[id]; if (v) setS(v); else setS({ on: false, time: id === 'eveningReset' ? '21:00' : '07:00' }); }, [id]);
  const save = (next: Setting) => { setS(next); try { localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [id]: next })); window.dispatchEvent(new Event("onore-notify-change")); } catch { /* storage disabled */ } };

  useEffect(() => {
    const map = registry;
    if (disabled) { map.delete(id); return; }
    map.set(id, { title, body, color });
    startScheduler();
    return () => { map.delete(id); };
  }, [id, title, body, disabled, color, variant]);
  useEffect(() => {
    const sync = () => { const v = readAll()[id]; setS(v ?? { on: false, time: id === 'eveningReset' ? '21:00' : '07:00' }); setPaused(remindersPaused()); };
    const storage = (e: StorageEvent) => { if (!e.key || e.key === KEY || e.key === PAUSE_KEY) sync(); };
    sync();
    window.addEventListener("onore-notify-change", sync);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener("onore-notify-change", sync); window.removeEventListener('storage', storage); };
  }, [id]);

  const toggle = async (on: boolean) => {
    setMsg("");
    if (on) {
      if (typeof Notification === "undefined") { setMsg(t.unsupported); setHelp(true); return; }
      if (Notification.permission !== "granted") {
        if (Notification.permission === "denied") { setHelp(true); return; }
        if (window.top !== window.self) { setMsg(t.tab); return; }
        if ((await Notification.requestPermission()) !== "granted") { setHelp(true); return; }
      }
    }
    save({ ...s, on });
  };

  /** Retries the permission prompt; browsers cannot open OS settings directly, so a denied state keeps the step guide visible. */
  const retry = async () => {
    if (typeof Notification === "undefined") { setMsg(t.unsupported); return; }
    if (window.top !== window.self) { window.open(window.location.href, "_blank", "noopener"); return; }
    const p = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (p === "granted") { save({ ...s, on: true }); setHelp(false); setMsg(""); }
    else setMsg(t.helpBody);
  };

  return (
    <div className={`feature-notify mt-3 rounded-lg border p-3 text-foreground transition-all ${effectiveReminder(s, paused, !disabled) ? "border-primary bg-background/95" : "border-primary/40 bg-background/95"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-foreground">
          <span className={`grid size-9 shrink-0 place-items-center rounded-full border ${effectiveReminder(s, paused, !disabled) ? "notify-on border-primary bg-primary text-primary-foreground" : "border-muted-foreground/60 bg-muted text-muted-foreground"}`}><BellRing className="size-5" /></span>
          <span className="font-semibold">{variant === "center" ? title : t.label}</span>
          <Switch className="h-7 w-12 shrink-0 border border-primary data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/40" checked={effectiveReminder(s, paused, !disabled)} disabled={disabled || paused} onCheckedChange={(v) => void toggle(v)} aria-label={`${title} · ${t.label}`} />
          <span className="min-w-10 text-xs font-bold text-primary">{paused ? t.paused : s.on && !disabled ? 'ON' : 'OFF'}</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">{t.time}
          <input aria-label={`${title} · ${t.time}`} type="time" value={s.time} disabled={disabled || paused} onChange={(e) => { if (e.target.value) save({ ...s, time: e.target.value }); }} className="h-9 min-w-0 rounded-md border border-primary bg-background px-2 text-base font-bold text-foreground" />
        </label>
      </div>
      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{paused ? t.pauseNote : disabled ? (lockedNote ?? t.locked) : t.note}</p>
      {msg && <p role="status" className="mt-1 text-xs text-primary">{msg}</p>}
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="w-[calc(100%-1.5rem)] rounded-lg border-primary/40 sm:max-w-md">
          <DialogHeader className="text-left"><DialogTitle className="flex items-center gap-2 font-serif"><BellRing className="size-5 text-primary" />{t.help}</DialogTitle>
            <DialogDescription>{t.helpBody}</DialogDescription></DialogHeader>
          <Button variant="outline" className="border-2 border-primary/60" onClick={() => void retry()}>{t.retry}</Button>
          {msg && <p role="status" className="text-xs text-primary">{msg}</p>}
          <p className="text-xs text-muted-foreground">{t.note}</p>
          <Button variant="champagne" onClick={() => setHelp(false)}>{t.close}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
