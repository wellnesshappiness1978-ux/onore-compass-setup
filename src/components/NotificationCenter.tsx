import { BellRing, Crown, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeatureNotifySwitch from "./FeatureNotifySwitch";
import { todayNotifyEmoji, todayTitles } from "./TodayGuide";
import { canUseToday, planOrder, todayFeatures } from "@/lib/plans";
import { biorhythm } from "@/lib/team-analysis";
import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";
import type { UserProfile } from "./Onboarding";

const rank = (p: Plan) => planOrder.indexOf(p);
/** Daily BGM refresh reminder is a VIP+ perk. */
export const canUseBgmNotify = (plan: Plan) => rank(plan) >= rank("vip");

const copy = {
  ja: { title: "通知設定センター", intro: "今日の占い・星音のBGM・バイオリズム警戒日の通知を、ここでまとめて設定できます。アプリを開いている間にお届けし、同じ時刻の通知は1通にまとめます。", today: "今日の占い通知", bgm: "星音のBGM 毎日リフレッシュ通知", bgmBody: "星音のBGMを1曲流して、深呼吸でリフレッシュしましょう。", bgmLocked: "VIP限定特典：星音のBGM 毎日リフレッシュ通知機能", bgmUpsell: "VIPプラン以上で、好きな時刻に星音のBGMリフレッシュをお知らせします。", alert: "バイオリズム警戒日通知", alertLow: "今日はバイオリズムが低めの警戒日です。予定を詰めすぎず、休息を優先してくださいね。", alertOk: "今日のバイオリズムを確認して、無理のない一日を。", see: "プランを見る", body: (t: string) => `「${t}」が更新されました。今日の占いタブでご確認ください。` },
  en: { title: "Notification Center", intro: "Set Today's reading, Star-Sound BGM and biorhythm caution reminders in one place. They arrive while the app is open; reminders at the same time are combined.", today: "Today's reading reminders", bgm: "Star-Sound BGM daily refresh", bgmBody: "Play one Star-Sound BGM track and refresh with a deep breath.", bgmLocked: "VIP perk: Star-Sound BGM daily refresh reminder", bgmUpsell: "With VIP or higher, get a Star-Sound BGM refresh reminder at your chosen time.", alert: "Biorhythm caution-day reminder", alertLow: "Today is a low-biorhythm caution day. Keep plans light and prioritise rest.", alertOk: "Check today's biorhythm and keep the day comfortable.", see: "View plans", body: (t: string) => `"${t}" is ready. Open the Today tab to see it.` },
};

export default function NotificationCenter({ language, plan, profile, onUpgrade }: { language: Language; plan: Plan; profile: UserProfile; onUpgrade: () => void }) {
  const ja = language === "ja";
  const t = ja ? copy.ja : copy.en;
  const bgmOpen = canUseBgmNotify(plan);
  const day = new Date().toLocaleDateString("en-CA");
  const r = profile.birthDate ? biorhythm(profile.birthDate, day) : null;
  return (
    <section id="notification-center" className="scroll-mt-28 rounded-lg border-2 border-primary/50 bg-card/60 p-4 sm:p-5" aria-labelledby="notify-center-title">
      <h3 id="notify-center-title" className="flex items-center gap-2 font-serif text-xl text-primary"><BellRing className="size-5" />{t.title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.intro}</p>

      <h4 className="mt-4 flex items-center gap-2 text-sm font-bold text-primary"><Music className="size-4" />{t.bgm}</h4>
      {bgmOpen
        ? <FeatureNotifySwitch variant="center" id="bgm" title={`🎵 ${t.bgm}`} body={t.bgmBody} language={language} />
        : <div className="mt-2 rounded-xl border border-primary/50 bg-primary/10 p-3 text-sm"><p className="flex items-center gap-2 font-bold text-primary"><Crown className="size-4" />{t.bgmLocked}</p><p className="mt-1 text-xs leading-5 text-foreground">{t.bgmUpsell}</p><Button size="sm" variant="champagne" className="mt-2" onClick={onUpgrade}>{t.see}</Button></div>}

      <h4 className="mt-4 text-sm font-bold text-primary">📉 {t.alert}</h4>
      <FeatureNotifySwitch variant="center" id="biorhythmAlert" title={`📉 ${t.alert}`} body={r && r.total < 45 ? t.alertLow : t.alertOk} language={language} />

      <h4 className="mt-4 text-sm font-bold text-primary">🧭 {t.today}</h4>
      {todayFeatures.map(({ id }) => {
        const title = ja ? todayTitles[id].ja : todayTitles[id].en;
        return <FeatureNotifySwitch key={id} variant="center" id={id} title={`${todayNotifyEmoji[id] ?? "🧭"} ${title}`} body={t.body(title)} language={language} disabled={!canUseToday(plan, id)} />;
      })}
    </section>
  );
}
