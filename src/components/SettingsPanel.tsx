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
  PenLine,
  ScrollText,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { languages, type Language } from "@/lib/translations";
import { settingsTranslations } from "@/lib/settings-translations";
import type { UserProfile } from "./Onboarding";

type Plan = "free" | "vip" | "b2b";
type Props = {
  profile: UserProfile;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onEdit: () => void;
  onVip: () => void;
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

export default function SettingsPanel({
  profile,
  language,
  onLanguageChange,
  onEdit,
  onVip,
}: Props) {
  const t = settingsTranslations[language];
  const [plan, setPlan] = useState<Plan>("free");
  const [yearly, setYearly] = useState(false);
  const [openTier, setOpenTier] = useState<string | null>("vip");
  const [b2b, setB2b] = useState(false);
  const [notifyTiming, setNotifyTiming] = useState(true);
  const [notifyBio, setNotifyBio] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const planLabel = plan === "vip" ? t.planVip : plan === "b2b" ? t.planB2b : t.planFree;
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
              {plan === "b2b" ? <Building2 className="size-3" /> : <Crown className="size-3" />}
              {planLabel}
            </span>
          </div>
        </div>
        <div className="mt-4 border-t border-primary/10 pt-3">
          <p className="mb-2 text-xs text-muted-foreground">{t.planTest}</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t.planTest}>
            {(["free", "vip", "b2b"] as Plan[]).map((p) => (
              <Button
                key={p}
                role="radio"
                aria-checked={plan === p}
                variant="outline"
                size="sm"
                onClick={() => setPlan(p)}
                className={`text-[11px] ${plan === p ? "border-primary bg-primary/15 text-primary" : "border-primary/20 bg-transparent"}`}
              >
                {p === "free" ? t.planFree : p === "vip" ? "VIP" : "B2B"}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{t.planTestNote}</p>
        </div>
      </section>

      <section className={card}>
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
          {t.tiers.map((tier) => {
            const isVip = tier.id === "vip";
            const isB2b = tier.id === "b2b";
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
                      onClick={() => (isVip ? onVip() : setNotice(`${tier.name}: ${t.soon}`))}
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
    </div>
  );
}
