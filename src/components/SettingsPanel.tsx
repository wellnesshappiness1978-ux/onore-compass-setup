import { planDetails } from "@/lib/plan-details";
import { planOrder as tierOrder } from "@/lib/plans";
import ReminderMasterSwitch from "./ReminderMasterSwitch";
import { FocusSettingsCard } from "./FocusPanels";
import TodayReminders from "./TodayReminders";
import DailyRelationshipGuide from "./DailyRelationshipGuide";
import { ThemeSample } from "./ThemeSample";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { usePlan } from "./PlanProvider";
import {
  Bell,
  HeartHandshake,
  Check,
  Crown,
  Gem,
  LockKeyhole,
  PenLine,
  Sparkles,
  Sprout,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { type Language } from "@/lib/translations";
import { settingsTranslations, type SettingsTranslation, type PricingTier } from "@/lib/settings-translations";
import DebugPlanSwitcher from "@/components/DebugPlanSwitcher";
import { teamCopy } from "@/lib/team-copy";
import { canPreviewDesign, designCopy, designModes, type DesignMode, type Plan } from "@/lib/design-modes";
import { memberLimit, planOrder, nextPlan } from "@/lib/plans";
import { planCardsCopy, type PaidPlanId } from "@/lib/plan-cards";
import type { UserProfile } from "./Onboarding";
import { profileUiCopy } from "@/lib/profile-ui-copy";
import { AppearanceFitting } from "./AppearanceFitting";
import { NautilusIcon } from './NautilusIcon';
import type { AppearanceSelection } from '@/lib/appearance-customization';
import { appearanceUiCopy } from '@/lib/appearance-ui-copy';
import { planReadingLines } from '@/lib/today-access-copy';
import { useFontSize } from '@/hooks/use-font-size';
import { fontSizeCopy, fontSizes } from '@/lib/font-size';

type Props = {
  profile: UserProfile;
  language: Language;
  onEdit: () => void;
  plan: Plan;
  actualPlan: Plan;
  debugAllowed: boolean;
  devOverrideEnabled?: boolean;
  onDebugPlanChanged: (plan: Plan) => void;
  onPlanChange: (plan: Plan) => void;
  designMode: DesignMode;
  onDesignModeChange: (mode: DesignMode) => void;
  appearance: AppearanceSelection;
  onAppearanceSave: (selection: AppearanceSelection) => void;
  signedIn?: boolean;
};

const card = "border-b border-primary/20 py-6";

export default function SettingsPanel({
  profile,
  language,
  onEdit,
  plan,
  actualPlan,
  debugAllowed,
  devOverrideEnabled = false,
  onDebugPlanChanged,
  onPlanChange,
  designMode,
  onDesignModeChange,
  appearance,
  onAppearanceSave,
  signedIn = false,
}: Props) {
  const t = settingsTranslations[language];
  const font = useFontSize();
  const fontCopy = fontSizeCopy[language];
  const dc = designCopy[language];
  const appearanceCopy = appearanceUiCopy[language];
  const profileUi = profileUiCopy[language];
  const [yearly, setYearly] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<string | null>(null);
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
  const planTabName = (id: PaidPlanId) => appearanceCopy.plans[id];
  const planIcon: Record<PaidPlanId, typeof Crown> = {
    standard: Sprout,
    vip: Gem,
    b2b: HeartHandshake,
    "b2b-premium": Crown,
  };
  const premiumFeatures: Record<Language, string[]> = {
    ja: ["ファミリーを最大100人登録", "100人規模の組織コンサル全7タブ", "AI回答の優先生成（提供準備中）", "ファミリープランの全機能"],
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
  const freeTier = allTiers.find(tr => tr.id === "free");
  const carouselCards: { id: PaidPlanId | "free"; badge?: string; tagline?: string; features: string[] }[] = [
    ...(freeTier ? [{ id: "free" as const, features: freeTier.features }] : []),
    ...pc.cards,
  ];
  const pd = planDetails[language];
  const currentMembership = signedIn ? actualPlan : plan;
  const recommendation = nextPlan(currentMembership);
  // Comparisons show the current plan and higher tiers only; lower plans stay hidden.
  const visibleCards = carouselCards.filter(c => tierOrder.indexOf(c.id as Plan) >= tierOrder.indexOf(currentMembership)).slice().sort((a,b)=>Number(b.id===recommendation)-Number(a.id===recommendation));
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const onCarouselScroll = () => {
    const el = carouselRef.current; if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-plan-card]"));
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0, dist = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center); if (d < dist) { dist = d; best = i; } });
    setActiveIndex(best);
  };
  const scrollToCard = (index: number) => {
    const el = carouselRef.current; const c = el?.querySelectorAll<HTMLElement>("[data-plan-card]")[index];
    if (el && c) el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2, behavior: "smooth" });
    setActiveIndex(index);
  };
  const previewPlan = usePlan();
  const demoCopy: Record<Language, { badge: string; toast: string }> = {
    ja: { badge: "各プランの登録受付は準備中です（表示確認用）", toast: "現在は表示確認用のデモモードです。決済・契約は行われません。" },
    en: { badge: "Plan sign-up is coming soon (preview only)", toast: "This is a preview demo. No payment or contract is made." },
    "zh-CN": { badge: "各方案的注册即将开放（仅供预览）", toast: "当前为预览演示模式，不会进行付款或签约。" },
    "zh-TW": { badge: "各方案的註冊即將開放（僅供預覽）", toast: "目前為預覽示範模式，不會進行付款或簽約。" },
    ko: { badge: "각 플랜 가입은 준비 중입니다 (표시 확인용)", toast: "현재 표시 확인용 데모 모드입니다. 결제나 계약은 진행되지 않습니다." },
    es: { badge: "La suscripción a los planes llegará pronto (solo vista previa)", toast: "Modo demo de vista previa. No se realiza ningún pago ni contrato." },
    fr: { badge: "L’inscription aux forfaits arrive bientôt (aperçu uniquement)", toast: "Mode démo d’aperçu. Aucun paiement ni contrat n’est effectué." },
  };
  const planLabel = appearanceCopy.plans[plan];
  const birth = [
    profile.birthDate || "—",
    profile.birthTimeUnknown ? "--:--" : profile.birthTime || "--:--",
    profile.birthPlace || "—",
  ].join(" · ");

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-gradient-gold">{t.title}</h2>

      <div className="grid min-w-0 items-start gap-4 md:grid-cols-2" data-settings-overview>
      <section className="min-w-0 rounded-lg border border-primary/20 bg-card/60 p-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 shadow-[0_0_20px_var(--gold-glow)]">
            <User className="size-7 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg">{profile.nameKanji || profile.nameRomaji || t.guest}</p>
            <p className="text-xs leading-6 text-muted-foreground">{birth}</p>
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
      </section>

      <FocusSettingsCard language={language} plan={plan} />
      </div>

      {signedIn && debugAllowed && <DebugPlanSwitcher plan={actualPlan} language={language} onChanged={onDebugPlanChanged} />}

      <section className="border-y border-primary/20 py-4" aria-labelledby="design-heading">
        <div className="flex items-center gap-2">
          <NautilusIcon className="size-7 text-primary" />
          <h3 id="design-heading" className="font-serif text-xl text-primary">{dc.title}</h3>
        </div>
        <AppearanceFitting plan={plan} language={language} selection={appearance} onSave={onAppearanceSave} onModeChange={onDesignModeChange} onUpgrade={() => setUpgradePlan(t.plansHeading)} />
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h4 className="min-w-0 text-xs text-muted-foreground">{appearanceCopy.palettes}</h4>
          <span className="max-w-48 truncate text-[11px] text-primary">{dc.names[designMode]}</span>
        </div>
        <div className="mt-2 grid grid-cols-8 gap-1.5 sm:grid-cols-15" role="group" aria-label={appearanceCopy.palettes}>
          {designModes.map(mode => {
            const available = canPreviewDesign(plan, mode.id);
            return <Button key={mode.id} variant="outline" title={`${dc.names[mode.id]} · ${appearanceCopy.plans[mode.tier]}`} aria-label={`${dc.names[mode.id]} · ${appearanceCopy.plans[mode.tier]}`} aria-pressed={designMode === mode.id} onClick={() => available ? onDesignModeChange(mode.id) : setLockedMode(mode.id)} className={`relative h-8 min-w-0 overflow-hidden rounded-md p-0 ${designMode === mode.id ? 'ring-2 ring-primary' : ''}`}>
              <span data-design={mode.id} className="palette-chip absolute inset-0" />
              {!available ? <LockKeyhole className="relative size-3 text-foreground" aria-label={dc.requires} /> : designMode === mode.id ? <Check className="relative size-3 text-foreground" /> : null}
            </Button>;
          })}
        </div>
      </section>

      <section id="membership-plans" className={card}>
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

        {!recommendation && (
          <p className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-4 py-3 text-center font-serif text-sm text-primary shadow-champagne">
            <Crown className="size-4 shrink-0" aria-hidden="true" />{pd.topPlan}
          </p>
        )}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t.plansHeading}>
          {visibleCards.map((item, index) => {
            const active = activeIndex === index;
            const TabIcon = item.id === "free" ? User : planIcon[item.id];
            return (
              <Button variant="outline" key={item.id} role="tab" aria-selected={active} onClick={() => scrollToCard(index)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${active ? "border-primary bg-primary/20 text-primary" : "border-primary/15 bg-background/40 text-muted-foreground"}`}>
                <TabIcon className="size-3.5" aria-hidden="true" />{item.id === "free" ? t.planFree : planTabName(item.id)}
              </Button>
            );
          })}
        </div>
        <p className="mt-2 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] text-primary">{demoCopy[language].badge}</p>
        <div ref={carouselRef} onScroll={onCarouselScroll} className="plan-carousel -mx-1 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-1 pb-3">
          {visibleCards.map((item) => {
            const tier = allTiers.find(tr => tr.id === item.id);
            if (!tier) return null;
            const isVip = item.id === recommendation;
            const isCurrent = currentMembership === item.id;
            const price = yearly ? tier.priceYearly : tier.priceMonthly;
            const period = yearly ? t.perYear : t.perMonth;
            const CardIcon = item.id === "free" ? User : planIcon[item.id];
            const name = item.id === "free" ? t.planFree : appearanceCopy.plans[item.id];
            return (
              <div key={item.id} data-plan-card aria-label={name}
                className={`relative flex w-[85%] min-w-0 max-w-[340px] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border p-4 sm:p-5 ${isVip ? "border-primary/70 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent shadow-[0_0_34px_-8px_var(--gold-glow)]" : "border-primary/25 bg-gradient-to-br from-primary/10 via-card/60 to-background/40"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <CardIcon className="size-6 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className={`truncate font-serif text-base ${isVip ? "text-gradient-gold" : "text-foreground"}`}>{name}</p>
                      {item.tagline && <p className="mt-0.5 text-[11px] text-primary/80">{item.tagline}</p>}
                    </div>
                  </div>
                  {(isCurrent || item.badge) && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isVip ? "bg-champagne-gradient text-primary-foreground" : "border border-primary/40 bg-primary/10 text-primary"}`}>{isCurrent ? profileUi.settings.active : item.badge}</span>}
                </div>
                <p className="mt-3 flex flex-wrap items-baseline gap-1">
                  <span className={`text-2xl font-semibold ${isVip ? "text-gradient-gold" : "text-foreground"}`}>{price}</span>
                  <span className="text-[11px] text-muted-foreground">{tier.id === "b2b" ? tier.priceNote : period}</span>
                  {tier.priceNote && tier.id !== "b2b" && <span className="text-[10px] text-primary">{tier.priceNote}</span>}
                </p>
                <ul className="mt-3 flex-1 space-y-2">
                  {[...item.features, ...planReadingLines(item.id, language)].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs leading-5">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Check className="size-2.5" strokeWidth={3} /></span>
                      <span className="min-w-0 break-words text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <details className="group mt-3 rounded-lg border border-primary/25 bg-background/40">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-semibold text-primary">{pd.label}<span className="transition-transform group-open:rotate-180" aria-hidden="true">▾</span></summary>
                  <ul className="space-y-1.5 px-3 pb-3 text-xs leading-5 text-foreground/90">{pd.items[item.id as Plan].map(d => <li key={d}>・{d}</li>)}</ul>
                </details>
                {(item.id !== "free" || previewPlan.enabled) && <Button
                  onClick={() => previewPlan.enabled ? previewPlan.selectPlan(item.id as Plan) : toast(demoCopy[language].toast, { description: name })}
                  disabled={isCurrent}
                  size="sm" variant={isVip ? "default" : "outline"}
                  className="mt-4 h-10 w-full whitespace-normal text-xs">
                  <Sparkles className="size-4 shrink-0" /> {isCurrent ? profileUi.settings.active : pc.unlockCta}
                </Button>}
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex justify-center gap-1.5" aria-hidden="true">
          {visibleCards.map((item, index) => <span key={item.id} className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-5 bg-primary" : "w-1.5 bg-primary/30"}`} />)}
        </div>

        {!devOverrideEnabled && <p className="mt-3 text-center text-[11px] text-muted-foreground">{t.upgradeNote}</p>}
      </section>

      <section className={card}>
        <h3 className="mb-3 font-serif text-lg text-primary">{t.account}</h3>
        <Button
          variant="outline"
          onClick={onEdit}
          className="w-full justify-start border-primary/20 bg-transparent"
        >
          <PenLine className="size-4 text-primary" /> {t.editBirth}
        </Button>

        {notice && (
          <p role="status" className="mt-2 text-xs text-muted-foreground">
            {notice}: {t.soon}
          </p>
        )}
      </section>
      <div className="space-y-4" data-settings-reminders>
        <TodayReminders kind="bgm" language={language} plan={plan} onUpgrade={() => document.getElementById('membership-plans')?.scrollIntoView({ behavior: 'smooth' })} />
        <DailyRelationshipGuide language={language} plan={plan} onUpgrade={() => document.getElementById('membership-plans')?.scrollIntoView({ behavior: 'smooth' })} />
      </div>
      <section className="border-t border-primary/20 pt-4" data-settings-font-size>
        <h4 className="mb-3 font-serif text-base text-primary">{fontCopy.title}</h4>
        <div role="radiogroup" aria-label={fontCopy.title} className="grid grid-cols-3 gap-2">
          {fontSizes.map(size => <Button key={size} role="radio" aria-checked={font.size === size} variant={font.size === size ? 'default' : 'outline'} onClick={() => font.select(size)} className="h-auto min-h-12 min-w-0 whitespace-normal px-2 py-2 text-xs leading-relaxed">{fontCopy.labels[size]}</Button>)}
        </div>
      </section>
      <div data-settings-pause><ReminderMasterSwitch language={language} /></div>
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
