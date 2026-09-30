import { Fragment, useState } from "react";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  Crown,
  Globe2,
  HelpCircle,
  Lock,
  LockKeyhole,
  Orbit,
  PenLine,
  ScrollText,
  Shield,
  Sparkles,
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
import { teamCopy } from "@/lib/team-copy";
import { canPreviewDesign, designCopy, designModes, type DesignMode, type Plan } from "@/lib/design-modes";
import { memberLimit, planOrder } from "@/lib/plans";
import type { UserProfile } from "./Onboarding";

type Props = {
  profile: UserProfile;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onEdit: () => void;
  onVip: () => void;
  plan: Plan;
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

const card = "rounded-2xl border border-primary/20 bg-card/60 p-5 shadow-2xl backdrop-blur-md";

// Deterministic sample waveform for the plan display test — not a real reading.
function BiorhythmPreview({
  plan,
  profile,
  t,
  language,
  onVip,
}: {
  plan: Plan;
  profile: UserProfile;
  t: SettingsTranslation;
  language: Language;
  onVip: () => void;
}) {
  const seed = Array.from(profile.birthDate).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  const value = (index: number, count: number) => {
    const v =
      Math.sin((index / count) * Math.PI * 4 + seed) * 0.6 +
      Math.sin((index / count) * Math.PI * 9 + seed / 2) * 0.4;
    return Math.round((v + 1) * 50);
  };
  const wavePath = (count: number) =>
    Array.from(
      { length: count },
      (_, index) =>
        `${index === 0 ? "M" : "L"}${((index / (count - 1)) * 100).toFixed(2)} ${(
          100 - value(index, count)
        ).toFixed(2)}`,
    ).join(" ");
  const monthLabel = (offset: number) =>
    new Intl.DateTimeFormat(language, { month: "short" }).format(
      new Date(new Date().getFullYear(), new Date().getMonth() + offset, 1),
    );
  const dayLabel = (offsetDays: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return new Intl.DateTimeFormat(language, { month: "numeric", day: "numeric" }).format(date);
  };
  const svg = (count: number) => (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-28 w-full text-primary sm:h-32"
      aria-hidden="true"
    >
      <path
        d={wavePath(count)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        className="drop-shadow-[0_0_8px_var(--gold-glow)]"
      />
    </svg>
  );
  const dayType = (index: number): "push" | "calm" | "adjust" | "decision" => {
    const score = value(index, 30);
    return score > 76 ? "decision" : score > 52 ? "push" : score < 30 ? "calm" : "adjust";
  };

  if (plan === "free") {
    return (
      <div className="overflow-hidden rounded-lg border border-primary/15 bg-background/40 p-4">
        <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{t.bioWeek}</span><span>{t.bioFuture}</span>
        </div>
        <div className="flex h-28 items-center gap-1" aria-label={t.bioWeek}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="w-full rounded-t-sm bg-primary/70" style={{ height: `${Math.max(15, value(i, 30))}%` }} />
              <span className="text-[9px] text-muted-foreground">{new Date(Date.now() + i * 86400000).getDate()}</span>
            </div>
          ))}
          <div className="relative flex h-full flex-[3] items-center justify-center overflow-hidden rounded-md border border-primary/10 bg-card/50">
            <div className="absolute inset-0 flex items-end gap-1 p-2 opacity-40 blur-md" aria-hidden="true">
              {Array.from({ length: 9 }, (_, i) => <span key={i} className="flex-1 bg-primary/60" style={{ height: `${Math.max(15, value(i + 7, 30))}%` }} />)}
            </div>
            <LockKeyhole className="relative size-5 text-primary" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-[0_0_18px_var(--gold-glow)]">
            <LockKeyhole className="size-4" />
          </span>
          <p className="text-xs font-medium text-primary">{t.bioLock}</p>
          <Button variant="champagne" size="sm" onClick={onVip} className="min-h-9">
            {t.bioUnlockCta}
          </Button>
        </div>
      </div>
    );
  }

  if (plan === "standard") {
    const count = 30;
    const todayIndex = 0;
    const labels = { push: t.push, calm: t.calm, adjust: t.bioAdjust, decision: t.bioLucky };
    const decisionDays = Array.from({ length: count }, (_, i) => i).filter((i) => dayType(i) === "decision").slice(0, 4);
    return (
      <div className="rounded-lg border border-primary/15 bg-background/40 p-4">
        <p className="mb-2 text-xs font-medium text-primary">{t.bioMonthTitle}</p>
        <div className="relative">
          {svg(count)}
          <span
            className="absolute top-0 h-full w-px bg-primary/70"
            style={{ left: `${(todayIndex / (count - 1)) * 100}%` }}
            aria-hidden="true"
          />
          <span
            className="absolute left-0 top-0 rounded-full border border-primary/40 bg-background px-1.5 py-0.5 text-[9px] text-primary"
          >
            {t.bioToday}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-10 gap-1" aria-label={t.bioMonthTitle}>
          {Array.from({ length: count }, (_, index) => {
            const type = dayType(index);
            return <div key={index} title={`${dayLabel(index)} · ${labels[type]}`} className={`flex min-w-0 flex-col items-center rounded-sm py-1 text-[9px] ${type === "decision" ? "bg-primary/25 text-primary" : type === "push" ? "bg-profile-wealth/20 text-profile-wealth" : type === "calm" ? "bg-profile-work/20 text-profile-work" : "bg-muted text-muted-foreground"}`}><span>{index + 1}</span><span aria-hidden="true">{type === "decision" ? "✦" : type === "push" ? "↑" : type === "calm" ? "↓" : "•"}</span></div>;
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          {(["push", "calm", "adjust", "decision"] as const).map((type) => <span key={type} className="flex items-center gap-1"><span className={`size-1.5 rounded-full ${type === "decision" ? "bg-primary" : type === "push" ? "bg-profile-wealth" : type === "calm" ? "bg-profile-work" : "bg-muted-foreground"}`} />{labels[type]}</span>)}
        </div>
        <p className="mt-2 text-xs">
          <span className="text-muted-foreground">{t.bioDecision}: </span>
          <span className="font-medium text-primary">
            {decisionDays.map(dayLabel).join(" · ")}
          </span>
        </p>
      </div>
    );
  }

  if (plan === "vip") {
    const count = 90;
    const indices = [...Array(count).keys()];
    const peaks = indices.slice().sort((a, b) => value(b, count) - value(a, count)).slice(0, 2).sort((a, b) => a - b);
    const preps = indices.slice().sort((a, b) => value(a, count) - value(b, count)).slice(0, 2).sort((a, b) => a - b);
    const x = (index: number) => (index / (count - 1)) * 100;
    return (
      <div className="rounded-lg border border-primary/15 bg-background/40 p-4">
        <p className="mb-2 text-xs font-medium text-primary">{t.bioQuarterTitle}</p>
        <div className="relative">
          {svg(count)}
          {peaks.map((index) => (
            <span
              key={`peak-${index}`}
              className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gradient shadow-champagne"
              style={{ left: `${x(index)}%`, top: `${100 - value(index, count)}%` }}
              aria-hidden="true"
            />
          ))}
          {preps.map((index) => (
            <span
              key={`prep-${index}`}
              className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50 bg-background"
              style={{ left: `${x(index)}%`, top: `${100 - value(index, count)}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          {[0, 1, 2].map((offset) => (
            <span key={offset}>{monthLabel(offset)}</span>
          ))}
        </div>
        <div className="mt-3 space-y-1.5 text-xs">
          <p className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-champagne-gradient" aria-hidden="true" />
            <span className="text-muted-foreground">{t.bioPeak}: </span>
            <span className="font-medium text-primary">{peaks.map(dayLabel).join("・")}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full border border-primary/50" aria-hidden="true" />
            <span className="text-muted-foreground">{t.bioPrep}: </span>
            <span className="font-medium text-primary">{preps.map(dayLabel).join("・")}</span>
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: t.bioPeak, date: dayLabel(peaks[0] ?? 0), Icon: Target, color: "text-primary" },
            { label: t.bioPrep, date: dayLabel(preps[0] ?? 0), Icon: SlidersHorizontal, color: "text-profile-work" },
            { label: t.bioRefresh, date: dayLabel(preps[1] ?? 0), Icon: Moon, color: "text-profile-wealth" },
            { label: t.bioAiDay, date: dayLabel(peaks[1] ?? 0), Icon: Sparkles, color: "text-profile-social" },
          ].map(({ label, date, Icon, color }) => <div key={label} className="rounded-md border border-primary/15 bg-card/40 p-2"><Icon className={`mb-2 size-4 ${color}`} aria-hidden="true" /><p className="text-[10px] text-muted-foreground">{label}</p><p className="text-xs text-foreground">{date}</p></div>)}
        </div>
      </div>
    );
  }

  const months = Array.from({ length: 12 }, (_, index) => value(index, 12));
  const indicatorMonths = t.bioIndicators.map((_, index) => (seed + index * 5) % 12);
  const eventIcons = [Rocket, Moon, Target, Users, AlertTriangle, Lightbulb];
  const eventColors = ["text-primary", "text-profile-wealth", "text-profile-love", "text-profile-work", "text-destructive", "text-profile-social"];
  const eventBackgrounds = ["bg-primary", "bg-profile-wealth", "bg-profile-love", "bg-profile-work", "bg-destructive", "bg-profile-social"];
  return (
    <div className="rounded-lg border border-primary/15 bg-background/40 p-4">
      <p className="mb-3 text-xs font-medium text-primary">{t.bioAnnualTitle}</p>
      <div className="flex h-24 items-end gap-1" aria-hidden="true">
        {months.map((v, index) => (
          <div key={index} className="flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${Math.max(v, 12)}%`,
                backgroundColor: `color-mix(in oklab, var(--primary) ${Math.round(v * 0.9)}%, transparent)`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-center text-[9px] text-muted-foreground">
        {months.map((_, index) => (
          <span key={index} className="min-w-0 flex-1 truncate">
            {monthLabel(index)}
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-1" aria-label={t.bioAnnualTitle}>
        {months.map((_, index) => <div key={index} className="flex min-w-0 flex-1 flex-wrap justify-center gap-0.5">{indicatorMonths.map((month, eventIndex) => month === index ? <span key={eventIndex} className={`size-1.5 rounded-full ${eventBackgrounds[eventIndex]}`} title={t.bioIndicators[eventIndex]} /> : null)}</div>)}
      </div>
      <ul className="mt-4 space-y-1.5">
        {t.bioIndicators.map((indicator, index) => (
          <li
            key={indicator}
            className="flex items-center justify-between gap-2 rounded-md border border-primary/15 bg-background/40 px-3 py-2 text-xs"
          >
            {(() => { const Icon = eventIcons[index] ?? Target; return <Icon className={`size-4 shrink-0 ${eventColors[index]}`} aria-hidden="true" />; })()}
            <span className="min-w-0 flex-1 leading-5">{indicator.replace(/^[^\p{L}\p{N}]+/u, "")}</span>
            <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
              {monthLabel(indicatorMonths[index] ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SettingsPanel({
  profile,
  language,
  onLanguageChange,
  onEdit,
  onVip,
  plan,
  onPlanChange,
  designMode,
  onDesignModeChange,
  signedIn = false,
}: Props) {
  const t = settingsTranslations[language];
  const dc = designCopy[language];
  const [bioPlan, setBioPlan] = useState<Plan>("free");
  const [yearly, setYearly] = useState(false);
  const [openTier, setOpenTier] = useState<string | null>("vip");
  const [b2b, setB2b] = useState(false);
  const [notifyTiming, setNotifyTiming] = useState(true);
  const [notifyBio, setNotifyBio] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [lockedMode, setLockedMode] = useState<DesignMode | null>(null);

  const tc = teamCopy[language];
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
        <div className="mt-4 border-t border-primary/10 pt-3">
          <p className="mb-2 text-xs text-muted-foreground">{t.planTest}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="radiogroup" aria-label={t.planTest}>
            {planOrder.map((p) => (
              <Button
                key={p}
                role="radio"
                aria-checked={plan === p}
                variant="outline"
                size="sm"
                 onClick={() => onPlanChange(p)}
                className={`text-[10px] ${plan === p ? "border-primary bg-primary/15 text-primary" : "border-primary/20 bg-transparent"}`}
              >
                {p === "free" ? t.free : p === "standard" ? t.standard : p === "vip" ? "VIP" : p === "b2b" ? t.planB2b : tc.planNames["b2b-premium"]}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{t.planTestNote}</p>
        </div>
      </section>

      <section className="border-y border-primary/20 py-6" aria-labelledby="design-heading">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          <h3 id="design-heading" className="font-serif text-xl text-primary">{dc.title}</h3>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{dc.note}</p>
        <div className="mt-5 space-y-5">
          {(["free", "standard", "vip", "b2b"] as Plan[]).map((tier, index) => (
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
                       className={`design-choice design-choice--${mode.id} h-auto min-h-28 flex-col items-stretch gap-0 overflow-hidden rounded-md p-0 text-left ${selected ? "ring-2 ring-primary" : ""}`}
                    >
                      <span className="design-choice-scene relative flex h-12 w-full items-center justify-center text-xl" aria-hidden="true">
                        <span>{mode.icon}</span>
                        {!available && <LockKeyhole className="absolute right-3 top-3 size-3.5" />}
                      </span>
                      <span className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs text-foreground">
                        <span className="min-w-0 whitespace-normal leading-4">{dc.names[mode.id]}<span className="mt-0.5 block text-[10px] text-muted-foreground">{dc.groups[index]}</span></span>
                        {selected && <Check className="size-4 shrink-0 text-primary" aria-label={dc.selected} />}
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

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg border border-primary/20 bg-background/60 p-1 sm:grid-cols-4" role="tablist" aria-label={t.bioTitle}>
          {t.bioRanges.map((range) => (
            <Button key={range.tier} id={`bio-tab-${range.tier}`} role="tab" aria-selected={bioPlan === range.tier} aria-controls="bio-preview" size="sm" variant="ghost" onClick={() => setBioPlan(range.tier)} className={`h-auto min-h-10 whitespace-normal rounded-md px-2 py-1 text-center text-[11px] leading-4 ${bioPlan === range.tier ? "bg-primary/20 text-primary shadow-[inset_0_0_0_1px_var(--primary)]" : "text-muted-foreground hover:text-primary"}`}>
              {range.tier === "free" ? t.free : range.tier === "standard" ? t.standard : range.tier === "vip" ? "VIP" : t.bioEnterpriseTab} ({range.range})
            </Button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {t.bioRanges.map((range) => {
            const active = range.tier === bioPlan;
            const tierName = t.tiers.find((tier) => tier.id === range.tier)?.name;
            return (
              <div
                key={range.tier}
                className={`rounded-xl border p-3 text-center ${
                  active
                    ? "border-primary/70 bg-primary/10 shadow-[0_0_22px_-6px_var(--gold-glow)]"
                    : "border-primary/15 bg-background/40"
                }`}
              >
                <p className={`font-serif text-sm ${active ? "text-gradient-gold" : "text-foreground"}`}>
                  {range.range}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{tierName}</p>
                <p className="mt-1.5 text-left text-[10px] leading-4 text-muted-foreground">
                  {range.scope}
                </p>
              </div>
            );
          })}
        </div>

        <div id="bio-preview" role="tabpanel" aria-labelledby={`bio-tab-${bioPlan}`} className="mt-4">
          <BiorhythmPreview plan={bioPlan} profile={profile} t={t} language={language} onVip={onVip} />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">{t.bioSample}</p>
      </section>

      <section id="membership-plans" className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-lg text-primary">{t.plansHeading}</h3>
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

        <div className="mt-4 space-y-3">
            {allTiers.map((tier) => {
            const isVip = tier.id === "vip";
            const isB2b = tier.id === "b2b" || tier.id === "b2b-premium";
            const open = openTier === tier.id;
            const price = yearly ? tier.priceYearly : tier.priceMonthly;
            const period = yearly ? t.perYear : t.perMonth;
            return (
              <div
                key={tier.id}
                className={`overflow-hidden rounded-2xl border transition-shadow ${
                  isVip
                    ? "border-primary/70 bg-primary/10 shadow-[0_0_28px_-6px_var(--gold-glow)]"
                    : "border-primary/15 bg-background/40"
                }`}
              >
                <button
                  onClick={() => setOpenTier(open ? null : tier.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-serif text-sm ${isVip ? "text-gradient-gold" : ""}`}>
                        {tier.name}
                      </p>
                      {isVip && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-champagne-gradient px-2 py-0.5 text-[10px] font-semibold text-[#10131a] shadow-champagne">
                          <Crown className="size-3" /> {t.popular}
                        </span>
                      )}
                      {isB2b && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                          <Building2 className="size-3" /> {t.corporate}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{language === "ja" ? `登録上限 ${memberLimit[tier.id]}人${tier.id === "free" ? " · 本人専用" : ""}` : tc.limit(0, memberLimit[tier.id])}</p>
                    <p className="mt-1 flex items-baseline gap-1">
                      <span
                        className={`text-xl font-semibold ${isVip ? "text-gradient-gold" : "text-foreground"}`}
                      >
                        {price}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {tier.id === "b2b" ? tier.priceNote : period}
                      </span>
                      {tier.priceNote && tier.id !== "b2b" && (
                        <span className="ml-1 text-[10px] text-primary">{tier.priceNote}</span>
                      )}
                    </p>
                  </div>
                  <ChevronDown
                    className={`size-4 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="border-t border-primary/10 px-4 pb-4 pt-3">
                    <ul className="space-y-1.5">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs">
                          <Check
                            className={`mt-0.5 size-3.5 shrink-0 ${isVip ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <span className={isVip ? "text-foreground" : "text-muted-foreground"}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => { setNotice(`${tier.name}: ${t.upgradeNote}`); }}
                      disabled={tier.id === "free"}
                      size="sm"
                      className={`mt-3 h-9 w-full ${isVip ? "shadow-champagne-strong" : ""}`}
                      variant={isVip ? "default" : "outline"}
                    >
                      {tier.cta}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">{t.upgradeNote}</p>
      </section>

      <div id="team-studio-entry"><TeamStudio plan={plan} language={language} signedIn={signedIn} ownerBirthDate={profile.birthDate} onPlanChange={onPlanChange} /></div>

      <section className={card}>
        <h3 className="font-serif text-lg text-primary">{t.b2bTitle}</h3>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-background/40 p-3 text-sm">
          <span className={b2b ? "text-muted-foreground" : "text-primary"}>{t.personal}</span>
          <Switch checked={b2b} onCheckedChange={setB2b} aria-label={t.b2b} />
          <span className={`text-right ${b2b ? "text-primary" : "text-muted-foreground"}`}>
            {t.b2b}
          </span>
        </div>

        {b2b && (
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

        <div className="mt-5 divide-y divide-primary/10 border-t border-primary/10">
          {[
            [t.terms, ScrollText],
            [t.privacy, Shield],
            [t.help, HelpCircle],
          ].map(([label, Icon]) => {
            const I = Icon as typeof Lock;
            return (
              <button
                key={label as string}
                onClick={() => setNotice(label as string)}
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
      <Dialog open={lockedMode !== null} onOpenChange={(open) => { if (!open) setLockedMode(null); }}>
        <DialogContent className="max-w-sm border-primary/30 bg-card text-foreground">
          <DialogTitle className="font-serif text-xl text-primary">{dc.title}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            {lockedMode && dc.locked(dc.planNames[["standard", "vip", "b2b"].indexOf(designModes.find((mode) => mode.id === lockedMode)?.tier ?? "standard")] ?? dc.planNames[0] ?? "")}
          </DialogDescription>
          <p className="text-xs text-muted-foreground">{dc.note}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setLockedMode(null)}>{dc.later}</Button>
            <Button onClick={() => { setLockedMode(null); document.getElementById("membership-plans")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{dc.upgrade}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
