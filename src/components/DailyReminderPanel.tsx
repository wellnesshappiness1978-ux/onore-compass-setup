import { useEffect, useState } from "react";
import { BellRing, Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/translations";

type Settings = { morning: boolean; morningTime: string; night: boolean; nightTime: string };
const KEY = "onore-reminders";
const DEFAULTS: Settings = { morning: false, morningTime: "07:00", night: false, nightTime: "22:00" };

const copy = {
  ja: { title: "毎日のコンパス＆バイオリズム通知", sub: "朝と夜の2回、あなたのリズムを整えるお知らせ", morning: "朝の開運アクション", morningDesc: "今日の運気と吉方位をチェック", night: "夜のエネルギーリセット", nightDesc: "一日を振り返り、心を整える", test: "テスト通知を送る", denied: "ブラウザの通知が許可されていません。端末の設定から許可してください。", unsupported: "この端末は通知に対応していません。", note: "※通知はこのアプリを開いている間に届きます（アプリを閉じている間の通知は準備中）。設定はこの端末に保存されます。", mTitle: "☀ 朝の開運アクション", mBody: "今日のコンパスを開いて、吉方位と今日の心がけをチェックしましょう。", nTitle: "🌙 夜のエネルギーリセット", nBody: "深呼吸をして、今日の自分をねぎらいましょう。", time: "時刻" },
  en: { title: "Daily compass & biorhythm reminders", sub: "Two gentle nudges to keep your rhythm", morning: "Morning lucky action", morningDesc: "Check today's energy and direction", night: "Evening energy reset", nightDesc: "Reflect and unwind", test: "Send test notification", denied: "Notifications are blocked. Allow them in your device settings.", unsupported: "This device doesn't support notifications.", note: "Reminders arrive while the app is open (background delivery coming soon). Saved on this device.", mTitle: "☀ Morning lucky action", mBody: "Open today's compass and check your direction.", nTitle: "🌙 Evening energy reset", nBody: "Take a deep breath and appreciate today.", time: "Time" },
};

export default function DailyReminderPanel({ language }: { language: Language }) {
  const t = language === "ja" ? copy.ja : copy.en;
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [msg, setMsg] = useState("");

  useEffect(() => { try { setS({ ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }); } catch { /* */ } }, []);
  const save = (next: Settings) => { setS(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* */ } };

  const ensurePermission = async () => {
    if (typeof Notification === "undefined") { setMsg(t.unsupported); return false; }
    if (Notification.permission === "granted") return true;
    const p = await Notification.requestPermission();
    if (p !== "granted") { setMsg(t.denied); return false; }
    return true;
  };
  const notify = (title: string, body: string) => { try { new Notification(title, { body, icon: "/favicon.ico" }); } catch { /* */ } };

  useEffect(() => {
    if (!s.morning && !s.night) return;
    const tick = () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const now = new Date(); const hm = now.toTimeString().slice(0, 5); const day = now.toDateString();
      for (const [on, time, id, title, body] of [[s.morning, s.morningTime, "m", t.mTitle, t.mBody], [s.night, s.nightTime, "n", t.nTitle, t.nBody]] as const) {
        const k = `${KEY}-sent-${id}`;
        if (on && hm === time && localStorage.getItem(k) !== day) { localStorage.setItem(k, day); notify(title, body); }
      }
    };
    tick(); const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [s, t]);

  const toggle = async (field: "morning" | "night", v: boolean) => { setMsg(""); if (v && !(await ensurePermission())) return; save({ ...s, [field]: v }); };

  const rows = [
    { field: "morning" as const, timeField: "morningTime" as const, icon: Sun, label: t.morning, desc: t.morningDesc },
    { field: "night" as const, timeField: "nightTime" as const, icon: Moon, label: t.night, desc: t.nightDesc },
  ];
  return (
    <section className="mt-5 rounded-2xl border border-primary/25 bg-primary/5 p-4" aria-label={t.title}>
      <p className="flex items-center gap-2 font-serif text-sm text-primary"><BellRing className="size-4" />{t.title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{t.sub}</p>
      <div className="mt-3 space-y-2">
        {rows.map(({ field, timeField, icon: Icon, label, desc }) => (
          <div key={field} className="rounded-xl border border-primary/15 bg-background/40 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm"><Icon className="size-4 text-primary" /><span><span className="block">{label}</span><span className="block text-[11px] text-muted-foreground">{desc}</span></span></span>
              <Switch checked={s[field]} onCheckedChange={(v) => void toggle(field, v)} aria-label={label} />
            </div>
            {s[field] && <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">{t.time}
              <input type="time" value={s[timeField]} onChange={(e) => save({ ...s, [timeField]: e.target.value })} className="rounded-md border border-input bg-background/60 px-2 py-1 text-foreground" />
            </label>}
          </div>
        ))}
      </div>
      <Button type="button" size="sm" variant="outline" className="mt-3" onClick={async () => { if (await ensurePermission()) notify(t.mTitle, t.mBody); }}>{t.test}</Button>
      {msg && <p role="alert" className="mt-2 text-xs text-destructive">{msg}</p>}
      <p className="mt-2 text-[10px] leading-4 text-muted-foreground">{t.note}</p>
    </section>
  );
}
