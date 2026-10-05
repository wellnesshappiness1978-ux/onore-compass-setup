import DailyReminderPanel from "./DailyReminderPanel";
import { AgolmenLogo, SpiralLines } from "./AgolmenSpiral";
import HelioCalendar from "./HelioCalendar";
import { Fragment, useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Crown,
  Globe2,
  Gem,
  HelpCircle,
  Lock,
  LockKeyhole,
  Orbit,
  PenLine,
  ScrollText,
  Shield,
  Sparkles,
  Sprout,
  Target,
  Moon,
  SlidersHorizontal,
  AlertTriangle,
  Lightbulb,
  Rocket,
  Users,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { languages, type Language } from "@/lib/translations";
import { settingsTranslations, type SettingsTranslation, type PricingTier } from "@/lib/settings-translations";
import TeamStudio from "@/components/team/TeamStudio";
import DebugPlanSwitcher from "@/components/DebugPlanSwitcher";
import { teamCopy } from "@/lib/team-copy";
import { canPreviewDesign, designCopy, designModes, type DesignMode, type Plan } from "@/lib/design-modes";
import { isUpgradePlan, memberLimit, planOrder } from "@/lib/plans";
import { planCardsCopy, type PaidPlanId } from "@/lib/plan-cards";
import type { UserProfile } from "./Onboarding";

type Props = {
  profile: UserProfile;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onEdit: () => void;
  onVip: () => void;
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

const SAMPLE_TEAM = ["M. Sato", "K. Tanaka", "Y. Suzuki", "R. Ito"];
// Illustrative fixed values — not calculated from any birth data.
const SAMPLE_MATRIX = [
  [null, 86, 72, 64],
  [86, null, 78, 81],
  [72, 78, null, 69],
  [64, 81, 69, null],
];
const SAMPLE_WEEK: ("push" | "hold" | "calm")[] = [
  "push",
  "hold",
  "push",
  "calm",
  "push",
  "hold",
  "calm",
];

const card = "border-b border-primary/20 py-6";

export default function SettingsPanel({
  profile,
  language,
  onLanguageChange,
  onEdit,
  onVip,
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
  const [yearly, setYearly] = useState(false);
  const [cardPlan, setCardPlan] = useState<PaidPlanId>("vip");
  const [upgradePlan, setUpgradePlan] = useState<string | null>(null);
  const [b2b, setB2b] = useState(false);
  const [notifyTiming, setNotifyTiming] = useState(true);
  const [notifyBio, setNotifyBio] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [lockedMode, setLockedMode] = useState<DesignMode | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const tc = teamCopy[language];
  const pc = planCardsCopy[language];
  const planTabName = (id: PaidPlanId) =>
    id === "standard" ? t.standard : id === "vip" ? "VIP" : id === "b2b" ? t.planB2b : tc.planNames["b2b-premium"];
  const planIcon: Record<PaidPlanId, typeof Crown> = {
    standard: Sprout,
    vip: Gem,
    b2b: Building2,
    "b2b-premium": Crown,
  };
  const premiumFeatures: Record<Language, string[]> = {
    ja: ["関係者を最大100人登録", "100人規模の組織コンサル全7タブ", "AI回答の優先生成（提供準備中）", "ビジネスプランの全機能"],
    en: ["Register up to 100 members", "All seven organization tools for 100 people", "Priority AI generation (coming soon)", "Everything in Business"],
    "zh-CN": ["最多登记100人", "100人规模的全部7项组织咨询功能", "优先生成AI回答（准备中）", "包含商务方案所有功能"],
    "zh-TW": ["最多登錄100人", "100人規模的全部7項組織顧問功能", "優先生成AI回答（準備中）", "包含商務方案所有功能"],
    ko: ["최대 100명 등록", "100명 규모의 조직 컨설팅 7개 탭 전체", "AI 답변 우선 생성 (준비 중)", "비즈니스 플랜의 모든 기능"],
    es: ["Registra hasta 100 personas", "Las siete herramientas de organización para 100 personas", "Generación prioritaria de IA (próximamente)", "Todas las funciones de Empresa"],
    fr: ["Enregistrez jusqu’à 100 personnes", "Les sept outils de conseil pour 100 personnes", "Génération IA prioritaire (à venir)", "Toutes les fonctions Entreprise"],
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
  const days = SAMPLE_WEEK.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return new Intl.DateTimeFormat(language, { weekday: "short", day: "numeric" }).format(d);
  });

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
                <Building2 className="size-3" />
              ) : plan === "standard" ? (
                <Sparkles className="size-3" />
              ) : (
                <Crown className="size-3" />
              )}
              {planLabel}
            </span>
          </div>
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
            ? <p className="mt-2 text-[11px] text-primary">開発モード：選んだプランの機能がこの端末で実際に解放されます（公開版では無効）。</p>
            : <p className="mt-2 text-[11px] text-muted-foreground">{t.planTestNote}</p>}
        </div>}
      </section>

      {signedIn && debugAllowed && <DebugPlanSwitcher plan={actualPlan} onChanged={onDebugPlanChanged} />}

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
                       title={!available ? `${dc.requires}: ${dc.groups[index]}` : dc.names[mode.id]}
                       onClick={() => available ? onDesignModeChange(mode.id) : setLockedMode(mode.id)}
                       className={`design-choice design-choice--${mode.id} h-auto min-h-32 flex-col items-stretch gap-0 overflow-hidden rounded-md p-0 text-left ${selected ? "ring-2 ring-primary" : ""}`}
                    >
                      <span className="design-choice-scene relative flex h-12 w-full items-center justify-center text-xl" aria-hidden="true">
                        <span>{mode.icon}</span>
                        {!available && <LockKeyhole className="design-choice-unlock absolute right-3 top-3 size-3.5" />}
                        <span className="design-choice-palette absolute bottom-1 left-2 flex gap-1" aria-hidden="true"><span className="size-2 rounded-full border border-primary/30" /><span className="size-2 rounded-full border border-primary/30" /><span className="size-2 rounded-full border border-primary/30" /></span>
                      </span>
                      <span className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs text-foreground">
                        <span className="min-w-0 whitespace-normal leading-4">{dc.names[mode.id]}<span className="mt-0.5 block text-[10px] text-muted-foreground">{dc.groups[index]}</span></span>
                        {selected ? <Check className="size-4 shrink-0 text-primary" aria-label={dc.selected} /> : !available ? <span className="shrink-0 rounded-sm border border-primary/40 bg-primary/10 px-1 py-0.5 text-[9px] text-primary">{dc.planNames[["standard", "vip", "b2b", "b2b-premium"].indexOf(mode.tier)] ?? dc.requires}</span> : null}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <Orbit className="size-5" strokeWidth={1.4} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">{language === "ja" ? "地球暦" : "EARTH CALENDAR"}</p>
            <h3 className="font-serif text-lg text-primary">{t.bioTitle}</h3>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t.bioIntro}</p>

        <HelioCalendar date={new Date()} profile={profile} plan={plan} onUpgrade={() => document.getElementById("membership-plans")?.scrollIntoView({ behavior: "smooth" })} />
        <p className="mt-3 text-[11px] text-muted-foreground">{t.bioSample}</p>
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
                <Sparkles className="size-4" /> {devOverrideEnabled && plan === item.id ? "利用中" : pc.unlockCta}
              </Button>
            </div>
          );
        })()}

        {!devOverrideEnabled && <p className="mt-3 text-center text-[11px] text-muted-foreground">{t.upgradeNote}</p>}
      </section>}

      {devOverrideEnabled && <p className="text-xs text-primary">開発テストの関係者編集はこの端末に保存します。ログイン中の本番データ・登録権限は変更しません。</p>}
      <div id="team-studio-entry"><TeamStudio plan={plan} actualPlan={actualPlan} language={language} signedIn={signedIn && !devOverrideEnabled} ownerBirthDate={profile.birthDate} /></div>

      <section className={card}>
        <h3 className="font-serif text-lg text-primary">{t.b2bTitle}</h3>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-background/40 p-3 text-sm">
          <span className={b2b ? "text-muted-foreground" : "text-primary"}>{t.personal}</span>
          <Switch checked={b2b} onCheckedChange={value => { if (plan === "b2b" || plan === "b2b-premium") setB2b(value); else document.getElementById("membership-plans")?.scrollIntoView({ behavior: "smooth" }); }} aria-label={t.b2b} />
          <span className={`text-right ${b2b ? "text-primary" : "text-muted-foreground"}`}>
            {t.b2b}
          </span>
        </div>

        {b2b && (plan === "b2b" || plan === "b2b-premium") && (
          <div className="mt-5 space-y-6">
            <p className="text-[11px] text-muted-foreground">{t.b2bSample}</p>
            <div>
              <h4 className="mb-2 text-sm text-primary">{t.team}</h4>
              <ul className="grid grid-cols-2 gap-2">
                {SAMPLE_TEAM.map((name, i) => (
                  <li
                    key={name}
                    className="rounded-lg border border-primary/15 bg-background/40 px-3 py-2"
                  >
                    <p className="text-sm">{name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.roles[i]}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm text-primary">{t.matrix}</h4>
              <div className="grid grid-cols-5 gap-1 text-center text-[11px]">
                <span />
                {SAMPLE_TEAM.map((n) => (
                  <span key={n} className="truncate text-muted-foreground">
                    {n.split(" ")[1]}
                  </span>
                ))}
                {SAMPLE_MATRIX.map((row, r) => (
                  <Fragment key={r}>
                    <span className="truncate text-left text-muted-foreground">
                      {SAMPLE_TEAM[r]?.split(" ")[1]}
                    </span>
                    {row.map((v, c) => (
                      <span
                        key={`${r}-${c}`}
                        className="rounded-md border border-primary/10 py-2"
                        style={{
                          backgroundColor: v
                            ? `color-mix(in oklab, var(--primary) ${Math.round((v - 50) * 1.2)}%, transparent)`
                            : undefined,
                        }}
                      >
                        {v ?? "—"}
                      </span>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm text-primary">{t.roleMap}</h4>
              <div className="grid grid-cols-2 gap-2">
                {t.roleAreas.map((area, i) => (
                  <div key={area} className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <p className="text-[11px] text-muted-foreground">{area}</p>
                    <p className="font-serif text-primary">{SAMPLE_TEAM[i]}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm text-primary">{t.calendar}</h4>
              <div className="grid grid-cols-7 gap-1 text-center">
                {SAMPLE_WEEK.map((s, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border px-0.5 py-2 ${s === "push" ? "border-primary/50 bg-primary/15 text-primary" : "border-primary/10 text-muted-foreground"}`}
                  >
                    <p className="text-[10px]">{days[i]}</p>
                    <p className="mt-1 text-[10px] font-medium">{t[s]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-sm">
            <Globe2 className="size-4 text-primary" /> {t.language}
          </p>
          <div className="flex flex-wrap gap-2">
            {languages.map((l) => (
              <Button
                key={l.code}
                size="sm"
                variant="outline"
                aria-pressed={language === l.code}
                onClick={() => onLanguageChange(l.code)}
                className={`text-xs ${language === l.code ? "border-primary bg-primary/15 text-primary" : "border-primary/20 bg-transparent"}`}
              >
                {l.flag} {l.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <p className="flex items-center gap-2 text-sm">
            <Bell className="size-4 text-primary" /> {t.notifications}
          </p>
          <label className="flex items-center justify-between gap-3 rounded-md border border-primary/20 px-3 py-2.5 text-sm">
            <span>{language === "ja" ? "毎朝8時のプッシュ通知" : language === "zh-TW" ? "每日早上8點推播通知" : "8 AM push notifications"}</span>
            <Switch checked={false} disabled aria-label={language === "ja" ? "毎朝8時のプッシュ通知（配信サービス未接続）" : "8 AM push notifications (delivery unavailable)"} />
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
          <p className="text-[11px] text-muted-foreground">{t.notifyNote}</p>
        </div>
        <DailyReminderPanel language={language} plan={plan} profile={profile} />

        <div className="mt-5 divide-y divide-primary/10 border-t border-primary/10">
          <Button variant="ghost" className="h-auto w-full justify-start gap-3 rounded-none py-3 text-left text-sm" onClick={() => setAboutOpen(true)}><Orbit className="size-4 text-primary" />{language === "ja" ? "アプリについて · アゴルメンの物語" : "About · The story of Agolmen"}</Button>
          {[
            [t.terms, ScrollText],
            [t.privacy, Shield],
            [t.help, HelpCircle],
          ].map(([label, Icon]) => {
            const I = Icon as typeof Lock;
            return (
              <button
                key={label as string}
                onClick={() => window.dispatchEvent(new CustomEvent("onore-legal", { detail: label === t.terms ? "terms" : label === t.privacy ? "privacy" : "support" }))}
                className="flex w-full items-center gap-3 py-3 text-left text-sm transition-colors hover:text-primary"
              >
                <I className="size-4 text-primary" /> {label as string}
              </button>
            );
          })}
        </div>
        {notice && (
          <p role="status" className="mt-2 text-xs text-muted-foreground">
            {notice}: {t.soon}
          </p>
        )}
      </section>
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="agolmen-story-dialog max-w-lg overflow-hidden border-primary/40 bg-card text-foreground">
          <div className="relative mx-auto size-40" aria-hidden="true"><SpiralLines className="absolute inset-0 size-full text-primary/70" /><AgolmenLogo className="absolute inset-[18%] size-[64%] object-contain" /></div>
          <DialogTitle className="text-center font-serif text-2xl text-primary">{language === "ja" ? "アゴルメンの物語" : "The story of Agolmen"}</DialogTitle>
          <DialogDescription className="text-center text-sm leading-8 text-foreground/80">{language === "ja" ? "カタツムリは、どこへ向かうときも自分の殻を携えています。その姿に、自分を守る揺るぎない軸を重ねました。殻の螺旋は、自然の調和を想うための象徴。宝石を抱く羅針盤とともに、あなた自身の歩幅で選ぶ時間に寄り添います。" : "The snail carries its shell wherever it goes: a symbol of a steady center that protects us. Its spiral evokes the harmony we imagine in nature. Joined with a jeweled compass, it invites each person to find a direction at their own pace."}</DialogDescription>
        </DialogContent>
      </Dialog>
      <Dialog open={lockedMode !== null} onOpenChange={(open) => { if (!open) setLockedMode(null); }}>
        <DialogContent className="max-w-sm border-primary/30 bg-card text-foreground">
          <DialogTitle className="font-serif text-xl text-primary">{dc.title}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            {lockedMode && dc.locked(dc.planNames[["standard", "vip", "b2b", "b2b-premium"].indexOf(designModes.find((mode) => mode.id === lockedMode)?.tier ?? "standard")] ?? dc.planNames[0] ?? "")}
          </DialogDescription>
          <p className="text-xs text-muted-foreground">{dc.note}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setLockedMode(null)}>{dc.later}</Button>
            <Button onClick={() => { setLockedMode(null); document.getElementById("membership-plans")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{dc.upgrade}</Button>
          </div>
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
