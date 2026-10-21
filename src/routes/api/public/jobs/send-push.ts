import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

type Reminder = { on: boolean; time: string; title: string; body: string };
const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";
const HEAD: Record<string, string> = { ja: "【アゴルメンの羅針盤】本日の開運サマリー", en: "Agolmen's Compass · Today's reading", "zh-CN": "Agolmen's Compass · 今日解读", "zh-TW": "Agolmen's Compass · 今日解讀", ko: "Agolmen's Compass · 오늘의 해석", es: "Agolmen's Compass · Lectura de hoy", fr: "Agolmen's Compass · Lecture du jour" };

function localParts(tz: string, now: Date) {
  try {
    const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
    return { hm: `${p["hour"]}:${p["minute"]}`, day: `${p["year"]}-${p["month"]}-${p["day"]}` };
  } catch { return null; }
}

export const Route = createFileRoute("/api/public/jobs/send-push")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const lovableKey = process.env["LOVABLE_API_KEY"];
        const fcmKey = process.env["FIREBASE_MESSAGING_API_KEY"];
        if (!lovableKey || !fcmKey) return new Response("Push not configured", { status: 500 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: devices, error } = await supabaseAdmin.from("push_devices").select("token,timezone,language,reminders,paused,last_sent").eq("paused", false);
        if (error) return new Response(error.message, { status: 500 });
        const now = new Date();
        let sent = 0;
        for (const d of devices ?? []) {
          const lp = localParts(d.timezone, now); if (!lp) continue;
          const last = (d.last_sent ?? {}) as Record<string, string>;
          if (last[lp.hm] === lp.day) continue;
          const due = Object.values((d.reminders ?? {}) as Record<string, Reminder>).filter((r) => r.on && r.time === lp.hm);
          if (!due.length) continue;
          const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
            method: "POST",
            headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": fcmKey, "Content-Type": "application/json" },
            body: JSON.stringify({ message: {
              token: d.token,
              notification: { title: HEAD[d.language] ?? HEAD["en"], body: due.map((r) => `・${r.title}：${r.body}`).join("\n").slice(0, 1000) },
              webpush: { notification: { icon: "/pwa-icon-192.png", tag: `onore-summary-${lp.hm}` }, fcm_options: { link: "/" } },
            } }),
          });
          if (res.ok) {
            sent++;
            await supabaseAdmin.from("push_devices").update({ last_sent: { ...last, [lp.hm]: lp.day } }).eq("token", d.token);
          } else {
            const text = await res.text();
            console.error(`FCM send failed [${res.status}]: ${text}`);
            if (res.status === 404 || (res.status === 400 && text.includes("registration token"))) await supabaseAdmin.from("push_devices").delete().eq("token", d.token);
          }
        }
        return Response.json({ success: true, sent });
      },
    },
  },
});
