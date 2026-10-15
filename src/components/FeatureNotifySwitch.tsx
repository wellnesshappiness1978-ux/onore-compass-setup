import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Language } from "@/lib/translations";

type Setting = { on: boolean; time: string };
const KEY = "onore-feature-notify";
const times = Array.from({ length: 38 }, (_, i) => { const m = 5 * 60 + i * 30; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 ? "30" : "00"}`; });

const copy = {
  ja: { label: "この診断を毎日通知", time: "通知時刻", note: "アプリまたはブラウザが開いている間に通知が届きます。同じ時刻の通知は1通にまとめてお届けします。", locked: "プランを開放すると通知を設定できます。", allow: "通知を許可すると、指定の時刻にお届けします。端末の設定から許可してくださいね。", tab: "通知を許可するには、アプリを別タブで開いてください。", unsupported: "この端末では通知の代わりに画面でご確認ください。" },
  en: { label: "Notify me daily", time: "Time", note: "Notifications arrive while the app or browser is open. Reminders at the same time are combined into one.", locked: "Unlock this plan to set a notification.", allow: "Allow notifications in your device settings to receive them at your chosen time.", tab: "Open the app in its own tab to allow notifications.", unsupported: "This device shows the guide on screen instead of notifications." },
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

type Entry = { title: string; body: string; color?: string | undefined };
const registry = new Map<string, Entry>();
let timer: ReturnType<typeof setInterval> | null = null;
/** One shared scheduler: all reminders set for the same minute are merged into a single bulleted notification. */
function startScheduler() {
  if (timer || typeof window === "undefined") return;
  const tick = () => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const now = new Date(); const hm = now.toTimeString().slice(0, 5); const day = now.toDateString();
    const settings = readAll();
    const due = [...registry.entries()].filter(([fid]) => settings[fid]?.on && settings[fid]?.time === hm);
    const sentKey = `${KEY}-sent-${hm}`;
    if (!due.length || localStorage.getItem(sentKey) === day) return;
    localStorage.setItem(sentKey, day);
    const ja = (document.documentElement.lang || "ja").startsWith("ja");
    const head = ja ? "【アゴルメンの羅針盤】本日の開運サマリー" : "Agolmen's Compass · Today's summary";
    const body = due.map(([, e]) => `・${e.title}：${e.body}`).join("\n");
    const color = due.find(([, e]) => e.color)?.[1].color;
    try { const n = new Notification(head, { body, icon: colorIcon(color), badge: colorIcon(color), tag: `onore-summary-${hm}` }); n.onclick = () => { window.focus(); window.dispatchEvent(new CustomEvent("onore-open", { detail: "compass" })); n.close(); }; } catch { /* unsupported */ }
  };
  tick(); timer = setInterval(tick, 30_000);
}

/** Per-feature daily reminder. Delivers only while the app is open; no background push provider is connected. */
export default function FeatureNotifySwitch({ id, title, body, language, disabled, color }: { id: string; title: string; body: string; language: Language; disabled?: boolean; color?: string | undefined }) {
  const t = language === "ja" ? copy.ja : copy.en;
  const [s, setS] = useState<Setting>({ on: false, time: "07:00" });
  const [msg, setMsg] = useState("");
  const [help, setHelp] = useState(false);
  useEffect(() => { const v = readAll()[id]; if (v) setS({ on: !!v.on, time: times.includes(v.time) ? v.time : "07:00" }); }, [id]);
  const save = (next: Setting) => { setS(next); try { localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [id]: next })); } catch { /* storage disabled */ } };

  useEffect(() => {
    if (disabled) { registry.delete(id); return; }
    registry.set(id, { title, body, color });
    startScheduler();
    return () => { registry.delete(id); };
  }, [id, title, body, disabled, color]);

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
    else setMsg(language === "ja" ? "ブラウザが再確認を止めています。上の手順で「許可」に切り替えてから、もう一度押してくださいね。" : "Your browser paused the prompt. Switch to Allow using the steps above, then tap again.");
  };

  return (
    <div className={`feature-notify mt-3 rounded-xl border-2 p-3 text-foreground transition-all ${s.on && !disabled ? "border-primary bg-background/95 shadow-champagne ring-2 ring-primary/40" : "border-primary/70 bg-background/95 shadow-md"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <span className={`grid size-9 place-items-center rounded-full border-2 ${s.on && !disabled ? "border-primary bg-primary text-primary-foreground shadow-champagne" : "border-muted-foreground/60 bg-muted text-muted-foreground"}`}><BellRing className="size-5" /></span>
          <span className="font-semibold">{t.label}</span>
          <Switch className="h-7 w-12 border-2 border-primary data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/40" checked={s.on && !disabled} disabled={disabled} onCheckedChange={(v) => void toggle(v)} aria-label={`${title} · ${t.label}`} />
          <span className={`min-w-10 rounded-md border-2 px-1.5 py-0.5 text-center text-xs font-bold ${s.on && !disabled ? "border-primary bg-primary text-primary-foreground" : "border-destructive/70 bg-background text-destructive"}`}>{s.on && !disabled ? "ON" : "OFF"}</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">{t.time}
          <select value={s.time} disabled={disabled} onChange={(e) => save({ ...s, time: e.target.value })} className="h-9 rounded-md border-2 border-primary bg-background px-2 text-base font-bold text-foreground">
            {times.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{disabled ? t.locked : t.note}</p>
      {msg && <p role="status" className="mt-1 text-xs text-primary">{msg}</p>}
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="w-[calc(100%-1.5rem)] rounded-lg border-primary/40 sm:max-w-md">
          <DialogHeader className="text-left"><DialogTitle className="flex items-center gap-2 font-serif"><BellRing className="size-5 text-primary" />{language === "ja" ? "通知を有効にするには" : "Turn on notifications"}</DialogTitle>
            <DialogDescription>{language === "ja" ? "通知を有効にするには、端末またはブラウザの設定で通知を許可してください。" : "To turn on notifications, allow them in your device or browser settings."}</DialogDescription></DialogHeader>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-6">{(language === "ja" ? ["パソコン：アドレスバー左の鍵（またはサイト情報）マーク →「通知」を「許可」にします。", "iPhone：ホーム画面に追加したアプリを開き、設定 → 通知 → このアプリ → 「通知を許可」をオンにします。", "Android：設定 → アプリ → ブラウザ（Chromeなど）→ 通知 → このサイトを許可します。", "許可したら画面を読み込み直し、もう一度スイッチをオンにしてください。"] : ["Desktop: click the lock/site-info icon in the address bar → set Notifications to Allow.", "iPhone: open the app from your Home Screen, then Settings → Notifications → this app → Allow.", "Android: Settings → Apps → your browser → Notifications → allow this site.", "Reload the page and turn the switch on again."]).map((x) => <li key={x}>{x}</li>)}</ol>
          <Button variant="outline" className="border-2 border-primary/60" onClick={() => void retry()}>{language === "ja" ? "ワンタップで通知設定を開く" : "Open notification settings"}</Button>
          {msg && <p role="status" className="text-xs text-primary">{msg}</p>}
          <p className="text-xs text-muted-foreground">{t.note}</p>
          <Button variant="champagne" onClick={() => setHelp(false)}>{language === "ja" ? "わかりました" : "Got it"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
