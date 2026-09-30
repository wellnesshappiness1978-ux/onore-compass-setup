import { useEffect, useState } from "react";
import { BellRing, Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";
import { planOrder } from "@/lib/plans";

type Settings = { morning: boolean; morningTime: string; night: boolean; nightTime: string };
const KEY = "onore-reminders";
const DEFAULTS: Settings = { morning: false, morningTime: "08:00", night: false, nightTime: "21:00" };
type Slot = "morning" | "night";
type Tier = "free" | "vip" | "business";
type Template = { title: string; body: string; open: "compass" | "mandala" };

const rank = (p: Plan) => planOrder.indexOf(p);
export const tierOf = (p: Plan): Tier => (rank(p) >= rank("b2b") ? "business" : rank(p) >= rank("vip") ? "vip" : "free");

const templates: Record<"ja" | "en", Record<Slot, Record<Tier, Template>>> = {
  ja: {
    morning: {
      free: { title: "🧭 今日のあなたの「開運テーマ」が届きました", body: "今日の地球暦バイオリズムを更新。あなたが今日向くべき最高の方角をコンパスで確認しましょう！", open: "compass" },
      vip: { title: "🔮 今日の吉方位をチェック！最高の一日にする直感ナビ", body: "デスクの向きや移動の吉方位を合わせて、潜在能力を全開にしましょう。", open: "compass" },
      business: { title: "💼 【ビジネス羅針盤】本日のチーム動向＆推奨アクション", body: "本日のチームバイオリズムと商談・1on1の最適タイミングをチェック！", open: "compass" },
    },
    night: {
      free: { title: "🕊️ 今日1日のエネルギーリセット。心を調律する夜の時間", body: "今日の振り返りと、明日のバイオリズムの波を事前にチェックしておきましょう。", open: "compass" },
      vip: { title: "🎨 528Hzの波動音響と曼陀羅アートで、心を深層リセット", body: "あなた専用の曼陀羅アートを開き、ソルフェジオBGMとともにリラックスタイムを過ごしましょう。", open: "mandala" },
      business: { title: "🎨 528Hzの波動音響と曼陀羅アートで、心を深層リセット", body: "あなた専用の曼陀羅アートを開き、ソルフェジオBGMとともにリラックスタイムを過ごしましょう。", open: "mandala" },
    },
  },
  en: {
    morning: {
      free: { title: "🧭 Your lucky theme for today has arrived", body: "Today's Earth Calendar biorhythm is updated. Check your best direction on the compass!", open: "compass" },
      vip: { title: "🔮 Check today's lucky direction — your intuition nav", body: "Align your desk and travel with today's lucky direction and unlock your potential.", open: "compass" },
      business: { title: "💼 [Business compass] Today's team trends & actions", body: "Check today's team biorhythm and the best timing for deals and 1on1s!", open: "compass" },
    },
    night: {
      free: { title: "🕊️ Reset today's energy — time to tune your heart", body: "Reflect on today and preview tomorrow's biorhythm wave.", open: "compass" },
      vip: { title: "🎨 Deep reset with 528Hz sound and mandala art", body: "Open your mandala art and relax with Solfeggio music.", open: "mandala" },
      business: { title: "🎨 Deep reset with 528Hz sound and mandala art", body: "Open your mandala art and relax with Solfeggio music.", open: "mandala" },
    },
  },
};

const copy = {
  ja: { title: "毎日のコンパス＆バイオリズム通知", sub: "朝8:00と夜21:00、あなたの会員ランクに合わせたお知らせ", morning: "朝の開運アクション", night: "夜のエネルギーリセット", test: "テスト通知", denied: "ブラウザの通知が許可されていません。端末の設定から許可してください。", unsupported: "この端末は通知に対応していません。", note: "※通知はこのアプリを開いている間に届きます（アプリを閉じている間のプッシュ配信は準備中）。タップするとコンパスまたは曼陀羅アート画面が開きます。文面はプラン表示テストに連動し、課金権限ではありません。", time: "時刻", preview: "届く文面", opens: { compass: "タップ → 今日のコンパス", mandala: "タップ → 曼陀羅アート＆ヒーリング音響" } },
  en: { title: "Daily compass & biorhythm reminders", sub: "8:00 and 21:00 messages tailored to your plan", morning: "Morning lucky action", night: "Evening energy reset", test: "Test", denied: "Notifications are blocked. Allow them in your device settings.", unsupported: "This device doesn't support notifications.", note: "Reminders arrive while the app is open (background push coming soon). Tapping opens the compass or mandala art. Text follows the preview plan, not a paid entitlement.", time: "Time", preview: "Message", opens: { compass: "Tap → Today's compass", mandala: "Tap → Mandala art & healing sound" } },
};

function openTarget(target: Template["open"]) {
  window.focus();
  window.dispatchEvent(new CustomEvent("onore-open", { detail: target }));
}

export default function DailyReminderPanel({ language, plan }: { language: Language; plan: Plan }) {
  const ja = language === "ja";
  const t = ja ? copy.ja : copy.en;
  const tpl = ja ? templates.ja : templates.en;
  const tier = tierOf(plan);
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
  const notify = (m: Template) => {
    try {
      const n = new Notification(m.title, { body: m.body, icon: "/favicon.ico", tag: `onore-${m.open}` });
      n.onclick = () => { openTarget(m.open); n.close(); };
    } catch { /* */ }
  };

  useEffect(() => {
    if (!s.morning && !s.night) return;
    const tick = () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const now = new Date(); const hm = now.toTimeString().slice(0, 5); const day = now.toDateString();
      for (const slot of ["morning", "night"] as const) {
        const k = `${KEY}-sent-${slot}`;
        if (s[slot] && hm === s[`${slot}Time`] && localStorage.getItem(k) !== day) { localStorage.setItem(k, day); notify(tpl[slot][tier]); }
      }
    };
    tick(); const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [s, tpl, tier]);

  const toggle = async (slot: Slot, v: boolean) => { setMsg(""); if (v && !(await ensurePermission())) return; save({ ...s, [slot]: v }); };

  return (
    <section className="mt-5 rounded-2xl border border-primary/25 bg-primary/5 p-4" aria-label={t.title}>
      <p className="flex items-center gap-2 font-serif text-sm text-primary"><BellRing className="size-4" />{t.title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{t.sub}</p>
      <div className="mt-3 space-y-2">
        {(["morning", "night"] as const).map((slot) => {
          const m = tpl[slot][tier]; const Icon = slot === "morning" ? Sun : Moon;
          return (
            <div key={slot} className="rounded-xl border border-primary/15 bg-background/40 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm"><Icon className="size-4 text-primary" />{t[slot]}</span>
                <Switch checked={s[slot]} onCheckedChange={(v) => void toggle(slot, v)} aria-label={t[slot]} />
              </div>
              <div className="mt-2 rounded-lg border border-primary/10 bg-card/60 p-2.5">
                <p className="text-[10px] text-muted-foreground">{t.preview}</p>
                <p className="mt-0.5 text-xs font-medium text-foreground">{m.title}</p>
                <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{m.body}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <button type="button" onClick={() => openTarget(m.open)} className="text-[11px] text-primary underline-offset-2 hover:underline">{t.opens[m.open]}</button>
                  <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={async () => { if (await ensurePermission()) notify(m); }}>{t.test}</Button>
                </div>
              </div>
              {s[slot] && <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">{t.time}
                <input type="time" value={s[`${slot}Time`]} onChange={(e) => save({ ...s, [`${slot}Time`]: e.target.value })} className="rounded-md border border-input bg-background/60 px-2 py-1 text-foreground" />
              </label>}
            </div>
          );
        })}
      </div>
      {msg && <p role="alert" className="mt-2 text-xs text-destructive">{msg}</p>}
      <p className="mt-2 text-[10px] leading-4 text-muted-foreground">{t.note}</p>
    </section>
  );
}
