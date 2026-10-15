import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Language } from "@/lib/translations";

type Setting = { on: boolean; time: string };
const KEY = "onore-feature-notify";
const times = Array.from({ length: 38 }, (_, i) => { const m = 5 * 60 + i * 30; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 ? "30" : "00"}`; });

const copy = {
  ja: { label: "この診断を毎日通知", time: "通知時刻", note: "アプリまたはブラウザが開いている間に通知が届きます。", locked: "プランを開放すると通知を設定できます。", allow: "通知を許可すると、指定の時刻にお届けします。端末の設定から許可してくださいね。", tab: "通知を許可するには、アプリを別タブで開いてください。", unsupported: "この端末では通知の代わりに画面でご確認ください。" },
  en: { label: "Notify me daily", time: "Time", note: "Notifications arrive while the app or browser is open.", locked: "Unlock this plan to set a notification.", allow: "Allow notifications in your device settings to receive them at your chosen time.", tab: "Open the app in its own tab to allow notifications.", unsupported: "This device shows the guide on screen instead of notifications." },
};

function readAll(): Record<string, Setting> {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? "{}"); return v && typeof v === "object" ? v : {}; } catch { return {}; }
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

/** Per-feature daily reminder. Delivers only while the app is open; no background push provider is connected. */
export default function FeatureNotifySwitch({ id, title, body, language, disabled, color }: { id: string; title: string; body: string; language: Language; disabled?: boolean; color?: string | undefined }) {
  const t = language === "ja" ? copy.ja : copy.en;
  const [s, setS] = useState<Setting>({ on: false, time: "07:00" });
  const [msg, setMsg] = useState("");
  useEffect(() => { const v = readAll()[id]; if (v) setS({ on: !!v.on, time: times.includes(v.time) ? v.time : "07:00" }); }, [id]);
  const save = (next: Setting) => { setS(next); try { localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [id]: next })); } catch { /* storage disabled */ } };

  useEffect(() => {
    if (!s.on || disabled) return;
    const tick = () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const now = new Date(); const hm = now.toTimeString().slice(0, 5); const day = now.toDateString();
      const sent = `${KEY}-sent-${id}`;
      if (hm !== s.time || localStorage.getItem(sent) === day) return;
      localStorage.setItem(sent, day);
      try { const n = new Notification(title, { body, icon: colorIcon(color), badge: colorIcon(color), tag: `onore-feature-${id}` }); n.onclick = () => { window.focus(); window.dispatchEvent(new CustomEvent("onore-open", { detail: "compass" })); n.close(); }; } catch { /* unsupported */ }
    };
    tick(); const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [s, id, title, body, disabled, color]);

  const toggle = async (on: boolean) => {
    setMsg("");
    if (on) {
      if (typeof Notification === "undefined") { setMsg(t.unsupported); return; }
      if (Notification.permission !== "granted") {
        if (window.top !== window.self) { setMsg(t.tab); return; }
        if ((await Notification.requestPermission()) !== "granted") { setMsg(t.allow); return; }
      }
    }
    save({ ...s, on });
  };

  return (
    <div className="feature-notify mt-3 border-t border-primary/20 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-foreground"><BellRing className="size-4 text-primary" />{t.label}
          <Switch checked={s.on && !disabled} disabled={disabled} onCheckedChange={(v) => void toggle(v)} aria-label={`${title} · ${t.label}`} />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">{t.time}
          <select value={s.time} disabled={disabled} onChange={(e) => save({ ...s, time: e.target.value })} className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground">
            {times.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{disabled ? t.locked : t.note}</p>
      {msg && <p role="status" className="mt-1 text-xs text-primary">{msg}</p>}
    </div>
  );
}
