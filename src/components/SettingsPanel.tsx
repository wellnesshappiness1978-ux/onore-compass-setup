import DailyReminderPanel from "./DailyReminderPanel";
import { ThemeSample } from "./ThemeSample";
import { useState } from "react";
import {
  Bell,
  HeartHandshake,
  Check,
  Crown,
  Globe2,
  Gem,
  LockKeyhole,
  PenLine,
  Sparkles,
  Sprout,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { languages, type Language } from "@/lib/translations";
import { settingsTranslations, type SettingsTranslation, type PricingTier } from "@/lib/settings-translations";
import DebugPlanSwitcher from "@/components/DebugPlanSwitcher";
import { teamCopy } from "@/lib/team-copy";
import { canPreviewDesign, designCopy, designModes, type DesignMode, type Plan } from "@/lib/design-modes";
import { isUpgradePlan, memberLimit, planOrder } from "@/lib/plans";
import { planCardsCopy, type PaidPlanId } from "@/lib/plan-cards";
import type { UserProfile } from "./Onboarding";
import { profileUiCopy } from "@/lib/profile-ui-copy";
import SolfeggioPlayer from "./SolfeggioPlayer";

type Props = {
  profile: UserProfile;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onEdit: () => void;
  plan: Plan;
  actualPlan: Plan;
  debugAllowed: boolean;
  devOverrideEnabled?: boolean;
  onDebugPlanChanged: (plan: Plan) => void;
  onPlanChange: (plan: Plan) => void;
  designMode: DesignMode;
  onDesignModeChange: (mode: DesignMode) => void;
  signedIn?: boolean;
};

const card = "border-b border-primary/20 py-6";

export default function SettingsPanel({
  profile,
  language,
  onLanguageChange,
  onEdit,
  plan,
  actualPlan,
  debugAllowed,
  devOverrideEnabled = false,
  onDebugPlanChanged,
  onPlanChange,
  designMode,
  onDesignModeChange,
  signedIn = false,
}: Props) {
  const t = settingsTranslations[language];
  const dc = designCopy[language];
  const profileUi = profileUiCopy[language];
  const [yearly, setYearly] = useState(false);
  const [cardPlan, setCardPlan] = useState<PaidPlanId>("vip");
  const [upgradePlan, setUpgradePlan] = useState<string | null>(null);
  const [notifyTiming, setNotifyTiming] = useState(true);
  const [notifyBio, setNotifyBio] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [lockedMode, setLockedMode] = useState<DesignMode | null>(null);

  const tc = teamCopy[language];
  const previewModeNote: Record<Language, string> = {
    ja: "開発モード：選んだプランの機能がこの端末で実際に解放されます（公開版では無効）。",
    en: "Development mode: the selected plan is enabled on this device only and never applies to the published app.",
    "zh-CN": "开发模式：所选方案仅在此设备启用，不会应用于正式发布版。",
    "zh-TW": "開發模式：所選方案僅在此裝置啟用，不會套用至正式發布版。",
    ko: "개발 모드: 선택한 플랜은 이 기기에서만 활성화되며 공개 앱에는 적용되지 않습니다.",
    es: "Modo de desarrollo: el plan elegido solo se activa en este dispositivo y no afecta a la aplicación publicada.",
    fr: "Mode développement : l’offre choisie est activée uniquement sur cet appareil et n’affecte pas l’application publiée.",
  };
  const lockedTheme = designModes.find(mode => mode.id === lockedMode);
  const lockedTierName = lockedTheme?.tier === "free" ? t.planFree : lockedTheme ? teamCopy[language].planNames[lockedTheme.tier] : "";
  const pc = planCardsCopy[language];
  const planTabName = (id: PaidPlanId) =>
    id === "standard" ? t.standard : id === "vip" ? "VIP" : id === "b2b" ? t.planB2b : tc.planNames["b2b-premium"];
  const planIcon: Record<PaidPlanId, typeof Crown> = {
    standard: Sprout,
    vip: Gem,
    b2b: HeartHandshake,
    "b2b-premium": Crown,
  };
  const premiumFeatures: Record<Language, string[]> = {
    ja: ["ファミリーを最大100人登録", "100人規模の組織コンサル全7タブ", "AI回答の優先生成（提供準備中）", "ビジネスプランの全機能"],
    en: ["Register up to 100 family members", "All seven organization tools for 100 people", "Priority AI generation (coming soon)", "Everything in Family"],
    "zh-CN": ["最多登记100位家人", "100人规模的全部7项组织咨询功能", "优先生成AI回答（准备中）", "包含家庭方案所有功能"],
    "zh-TW": ["最多登錄100位家人", "100人規模的全部7項組織顧問功能", "優先生成AI回答（準備中）", "包含家庭方案所有功能"],
    ko: ["패밀리 최대 100명 등록", "100명 규모의 조직 컨설팅 7개 탭 전체", "AI 답변 우선 생성 (준비 중)", "패밀리 플랜의 모든 기능"],
    es: ["Registra hasta 100 familiares", "Las siete herramientas de organización para 100 personas", "Generación prioritaria de IA (próximamente)", "Todas las funciones de Familia"],
    fr: ["Enregistrez jusqu’à 100 proches", "Les sept outils de conseil pour 100 personnes", "Génération IA prioritaire (à venir)", "Toutes les fonctions Famille"],
  };
  const premiumTier: PricingTier = {
    id: "b2b-premium", name: tc.planNames["b2b-premium"], priceMonthly: "¥8,888", priceYearly: "¥88,880",
    features: premiumFeatures[language],
    cta: tc.switchPlan,
  };
  const allTiers = [...t.tiers, premiumTier];
  const upgradeCards = pc.cards.filter(c => isUpgradePlan(plan, c.id));
  const selectedCard = upgradeCards.find(c => c.id === cardPlan) ?? upgradeCards[0];
  const selectedTier = allTiers.find(tr => tr.id === selectedCard?.id);
  const planLabel =
    plan === "b2b-premium" ? tc.planNames["b2b-premium"] : plan === "vip"
      ? t.planVip
      : plan === "b2b"
        ? t.planB2b
        : plan === "standard"
          ? t.planStandard
          : t.planFree;
  const birth = [
    profile.birthDate || "—",
    profile.birthTimeUnknown ? "--:--" : profile.birthTime || "--:--",
    profile.birthPlace || "—",
  ].join(" · ");

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-gradient-gold">{t.title}</h2>

      <section className={card}>
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-full border border-primary/40 bg-primary/10 shadow-[0_0_20px_var(--gold-glow)]">
            <User className="size-7 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg">{t.guest}</p>
            <p className="truncate text-xs text-muted-foreground">{birth}</p>
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${plan === "free" ? "border-border text-muted-foreground" : "border-primary/60 bg-primary/15 text-primary shadow-[0_0_16px_var(--gold-glow)]"}`}
            >
              {plan === "b2b" ? (
                <HeartHandshake className="size-3" />
              ) : plan === "standard" ? (
                <Sparkles className="size-3" />
              ) : (
                <Crown className="size-3" />
              )}
              {planLabel}
            </span>
          </div>
        </div>
        <div className="mt-5 border-t border-primary/15 pt-4">
          <label className="mb-2 flex items-center gap-2 text-sm" htmlFor="settings-language">
            <Globe2 className="size-4 text-primary" /> {t.language}
          </label>
          <Select value={language} onValueChange={(value) => onLanguageChange(value as Language)}>
            <SelectTrigger id="settings-language" aria-label={t.language} className="h-12 border-primary/30 bg-background/40 text-foreground focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-primary/30 bg-popover text-popover-foreground">
              {languages.map((item) => <SelectItem key={item.code} value={item.code}>{item.flag} {item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {devOverrideEnabled && <div className="mt-4 border-t border-primary/10 pt-3">
          <p className="mb-2 text-xs text-muted-foreground">{t.planTest}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="radiogroup" aria-label={t.planTest}>
            {planOrder.map((p) => (
              <Button
                key={p}
                role="radio"
                aria-checked={plan === p}
                variant="outline"
                size="sm"
                disabled={!devOverrideEnabled && planOrder.indexOf(p) > planOrder.indexOf(actualPlan)}
                onClick={() => onPlanChange(p)}
                className={`text-[10px] ${plan === p ? "border-primary bg-primary/15 text-primary" : "border-primary/20 bg-transparent"}`}
              >
                {p === "free" ? t.free : p === "standard" ? t.standard : p === "vip" ? "VIP" : p === "b2b" ? t.planB2b : tc.planNames["b2b-premium"]}
              </Button>
            ))}
          </div>
          {devOverrideEnabled
            ? <p className="mt-2 text-[11px] text-primary">{previewModeNote[language]}</p>
            : <p className="mt-2 text-[11px] text-muted-foreground">{t.planTestNote}</p>}
        </div>}
      </section>

      {signedIn && debugAllowed && <DebugPlanSwitcher plan={actualPlan} language={language} onChanged={onDebugPlanChanged} />}

      {planOrder.indexOf(plan) >= planOrder.indexOf("vip") && <section className={card}><SolfeggioPlayer language={language} /></section>}

      <section className="border-y border-primary/20 py-6" aria-labelledby="design-heading">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          <h3 id="design-heading" className="font-serif text-xl text-primary">{dc.title}</h3>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{dc.note}</p>
        <div className="mt-5 space-y-5">
          {(["free", "standard", "vip", "b2b", "b2b-premium"] as Plan[]).map((tier, index) => (
            <div key={tier}>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-px w-5 bg-primary/40" />{dc.groups[index]}
              </div>
              <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
                {designModes.filter((mode) => mode.tier === tier).map((mode) => {
                  const available = canPreviewDesign(plan, mode.id);
                  const selected = designMode === mode.id;
                  return (
                    <Button
                      key={mode.id}
                      type="button"
                      variant="outline"
                      aria-pressed={selected}
                      aria-label={`${dc.names[mode.id]} · ${dc.groups[index]}`}
                      title={dc.names[mode.id]}
                      onClick={() => available ? onDesignModeChange(mode.id) : setLockedMode(mode.id)}
                      className={`theme-choice h-auto min-h-48 flex-col items-stretch gap-0 overflow-hidden rounded-md p-0 text-left ${selected ? "ring-2 ring-primary" : ""}`}
                    >
                      <ThemeSample mode={mode.id} tier={mode.tier} name={dc.names[mode.id]} />
                      <span className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs text-foreground">
                        <span className="min-w-0 whitespace-normal leading-5">{dc.names[mode.id]}<span className="mt-0.5 block text-[10px] text-muted-foreground">{dc.groups[index]}</span></span>
                        {selected ? <Check className="size-4 shrink-0 text-primary" aria-label={dc.selected} /> : !available ? <LockKeyhole className="size-4 shrink-0 text-primary" aria-label={dc.requires} /> : null}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {upgradeCards.length > 0 && <section id="membership-plans" className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-xl text-gradient-gold">{pc.sectionTitle}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.plansHeading} — {pc.sectionSub}</p>
          </div>
          <div
            className="flex rounded-full border border-primary/25 bg-background/50 p-1 text-xs"
            role="radiogroup"
            aria-label={t.plansHeading}
          >
            {(
              [
                [false, t.billingMonthly],
                [true, t.billingYearly],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={label}
                role="radio"
                aria-checked={yearly === value}
                size="sm"
                variant="ghost"
                onClick={() => setYearly(value)}
                className={`h-7 rounded-full px-3 text-xs ${
                  yearly === value ? "bg-primary/20 text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t.plansHeading}>
          {upgradeCards.map((item) => {
            const active = cardPlan === item.id;
            const TabIcon = planIcon[item.id];
            return (
              <Button
                variant="outline"
                key={item.id}
                role="tab"
                aria-selected={active}
                onClick={() => setCardPlan(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all ${
                  active
                    ? "border-primary bg-primary/20 text-primary shadow-[0_0_18px_-4px_var(--gold-glow)]"
                    : "border-primary/15 bg-background/40 text-muted-foreground hover:text-primary"
                }`}
              >
                <TabIcon className={`size-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
                {planTabName(item.id)}
              </Button>
            );
          })}
        </div>

        {(() => {
          const item = selectedCard;
          const tier = selectedTier;
          if (!item || !tier) return null;
          const isVip = item.id === "vip";
          const price = yearly ? tier.priceYearly : tier.priceMonthly;
          const period = yearly ? t.perYear : t.perMonth;
          return (
            <div
              key={item.id}
              role="tabpanel"
              aria-label={tier.name}
              className={`relative mt-4 overflow-hidden rounded-2xl border p-5 transition-all ${
                isVip
                  ? "border-primary/70 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent shadow-[0_0_34px_-8px_var(--gold-glow)]"
                  : item.id === "b2b-premium"
                    ? "border-primary/50 bg-gradient-to-br from-primary/15 via-card/60 to-background/40"
                    : "border-primary/25 bg-gradient-to-br from-primary/10 via-card/60 to-background/40"
              }`}
            >
              <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-2xl" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {(() => { const CardIcon = planIcon[item.id]; return <CardIcon className="size-7 shrink-0 text-primary" aria-hidden="true" />; })()}
                  <div className="min-w-0">
                    <p className={`font-serif text-base ${isVip ? "text-gradient-gold" : "text-foreground"}`}>{tier.name}</p>
                    <p className="mt-0.5 text-xs text-primary/80">{item.tagline}</p>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      isVip
                        ? "bg-champagne-gradient text-primary-foreground shadow-champagne"
                        : "border border-primary/40 bg-primary/10 text-primary"
                    }`}
                  >
                    {isVip && <Crown className="size-3" />} {item.badge}
                  </span>
                )}
              </div>
              <p className="mt-3 flex items-baseline gap-1">
                <span className={`text-2xl font-semibold ${isVip ? "text-gradient-gold" : "text-foreground"}`}>
                  {price}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {tier.id === "b2b" ? tier.priceNote : period}
                </span>
                {tier.priceNote && tier.id !== "b2b" && (
                  <span className="ml-1 text-[10px] text-primary">{tier.priceNote}</span>
                )}
              </p>
              <ul className="mt-4 space-y-2">
                {item.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs leading-5">
                    <span
                      className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
                        isVip ? "bg-champagne-gradient text-primary-foreground" : "bg-primary/15 text-primary"
                      }`}
                    >
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => devOverrideEnabled ? onPlanChange(item.id as Plan) : setUpgradePlan(tier.name)}
                disabled={devOverrideEnabled && plan === item.id}
                size="sm"
                className={`mt-5 h-10 w-full text-sm ${isVip ? "shadow-champagne-strong" : ""}`}
                variant={isVip ? "default" : "outline"}
              >
                <Sparkles className="size-4" /> {devOverrideEnabled && plan === item.id ? profileUi.settings.active : pc.unlockCta}
              </Button>
            </div>
          );
        })()}

        {!devOverrideEnabled && <p className="mt-3 text-center text-[11px] text-muted-foreground">{t.upgradeNote}</p>}
      </section>}

      <section className={card}>
        <h3 className="mb-3 font-serif text-lg text-primary">{t.account}</h3>
        <Button
          variant="outline"
          onClick={onEdit}
          className="w-full justify-start border-primary/20 bg-transparent"
        >
          <PenLine className="size-4 text-primary" /> {t.editBirth}
        </Button>

        <div className="mt-5 space-y-3">
          <p className="flex items-center gap-2 text-sm">
            <Bell className="size-4 text-primary" /> {t.notifications}
          </p>
          <label className="flex items-center justify-between gap-3 rounded-md border border-primary/20 px-3 py-2.5 text-sm">
            <span>{profileUi.settings.morningPush}</span>
            <Switch checked={false} disabled aria-label={profileUi.settings.morningPushUnavailable} />
          </label>
          {[
            [t.notifyTiming, notifyTiming, setNotifyTiming] as const,
            [t.notifyBio, notifyBio, setNotifyBio] as const,
          ].map(([label, value, set]) => (
            <label
              key={label}
              className="flex items-center justify-between rounded-lg border border-primary/10 px-3 py-2.5 text-sm"
            >
              {label}
              <Switch checked={value} onCheckedChange={set} aria-label={label} />
            </label>
          ))}
        </div>
        <DailyReminderPanel language={language} plan={plan} profile={profile} />
        {notice && (
          <p role="status" className="mt-2 text-xs text-muted-foreground">
            {notice}: {t.soon}
          </p>
        )}
      </section>
      <Dialog open={lockedMode !== null} onOpenChange={(open) => { if (!open) setLockedMode(null); }}>
        <DialogContent className="theme-preview-dialog flex h-[min(92dvh,900px)] w-[min(100vw,760px)] max-w-none flex-col gap-0 overflow-hidden border-primary/30 bg-card p-0 text-foreground">
          {lockedTheme && <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ThemeSample mode={lockedTheme.id} tier={lockedTheme.tier} name={dc.names[lockedTheme.id]} large />
              <div className="px-5 py-5 text-center">
                <DialogTitle className="font-serif text-xl text-primary">{dc.names[lockedTheme.id]}</DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">{profileUi.settings.themeLocked(lockedTierName)}</DialogDescription>
              </div>
            </div>
            <div className="flex shrink-0 justify-center gap-2 border-t border-primary/20 bg-card px-5 py-4">
              <Button variant="outline" onClick={() => setLockedMode(null)}>{dc.later}</Button>
              <Button onClick={() => { setLockedMode(null); window.setTimeout(() => document.getElementById("membership-plans")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }}>{dc.upgrade}</Button>
            </div>
          </>}
        </DialogContent>
      </Dialog>
      <Dialog open={upgradePlan !== null} onOpenChange={(open) => { if (!open) setUpgradePlan(null); }}>
        <DialogContent className="max-w-sm border-primary/30 bg-card text-foreground">
          <DialogTitle className="font-serif text-xl text-primary">{upgradePlan}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            {t.upgradeNote}
          </DialogDescription>
          <p className="text-xs text-muted-foreground">{t.planTestNote}</p>
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setUpgradePlan(null)}>{dc.later}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
