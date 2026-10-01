import { ArtsGuide } from "./ArtsGuide";
import ProfileEditor, { NameAnalysisPreview } from "./ProfileEditor";
import PersonPortrait from "./PersonPortrait";
import SelfCoreCard from "./SelfCoreCard";
import DayCompass from "./DayCompass";
import ShareCardButton from "./ShareCardButton";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Compass,
  Crown,
  HeartHandshake,
  Home,
  LockKeyhole,
  MapPin,
  Network,
  Orbit,
  Palette,
  Settings2,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import ConsultationPanel from "@/components/ConsultationPanel";
import NineStarsPanel from "@/components/NineStarsPanel";
import SettingsPanel from "@/components/SettingsPanel";
import { canPreviewDesign, designCopy, type DesignMode, type Plan } from "@/lib/design-modes";
import { canManageDebugPlan, getMyMembership } from "@/lib/membership.functions";
import { planOrder, quickCompatibilityLimit } from "@/lib/plans";
import { quickReading, quickUsageKey } from "@/lib/quick-compatibility";
import { quickCompatibilityCopy } from "@/lib/quick-compatibility-copy";
import { generateHomeReading } from "@/lib/ai/home-reading.functions";
import { homeReadingCopy } from "@/lib/home-reading-copy";
import DailyLifeGuide from "./DailyLifeGuide";
import BirthColorGuide from "./BirthColorGuide";
import { inputClass, PREFECTURES, type UserProfile } from "./Onboarding";
import {
  dashboardTranslations,
  prefecturesRomanized,
  torisetsuTranslations,
  translations,
  type Language,
} from "@/lib/translations";

type Props = {
  profile: UserProfile;
  onEdit: () => void;
  onProfileChange: (profile: UserProfile) => Promise<void>;
  language: Language;
  onLanguageChange: (language: Language) => void;
  signedIn?: boolean;
};
type Tab = "home" | "arts" | "consult" | "mandala" | "settings";

function ProfileRows({ profile, language }: { profile: UserProfile; language: Language }) {
  const t = translations[language];
  const rows = [
    [
      t.birthDate,
      profile.birthDate
        ? new Date(`${profile.birthDate}T12:00:00`).toLocaleDateString(language, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
    ],
    [t.birthTime, profile.birthTimeUnknown ? t.unknown : profile.birthTime || "—"],
    [
      t.birthPlace,
      ["en", "es", "fr"].includes(language) && profile.birthPlace
        ? prefecturesRomanized[PREFECTURES.indexOf(profile.birthPlace)] || profile.birthPlace
        : profile.birthPlace || "—",
    ],
    [t.bloodType, profile.bloodType ? `${profile.bloodType}${t.bloodSuffix}` : "—"],
    [
      t.siblingOrder,
      t.siblings[["first", "middle", "last", "only"].indexOf(profile.siblingOrder)] || "—",
    ],
  ];
  return (
    <div>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between gap-4 border-b border-primary/10 py-3 last:border-0"
        >
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-right text-sm text-foreground">{value}</span>
        </div>
      ))}
    </div>
  );
}

const swatchClasses = [
  "profile-swatch-overall",
  "profile-swatch-wealth",
  "profile-swatch-work",
  "profile-swatch-love",
  "profile-swatch-social",
  "profile-swatch-health",
];

function TorisetsuPanel({
  profile,
  language,
  onVip,
  initialMode = "manual",
  plan,
}: {
  profile: UserProfile;
  language: Language;
  onVip: () => void;
  initialMode?: "manual" | "compatibility";
  plan: Plan;
}) {
  const t = torisetsuTranslations[language];
  const base = translations[language];
  const q = quickCompatibilityCopy[language];
  const [mode, setMode] = useState<"manual" | "compatibility">(initialMode);
  const generate = useServerFn(generateHomeReading);
  const manualReading = useQuery({ queryKey: ["home-reading-five-v3", profile, language], queryFn: () => generate({ data: { profile, language } }), staleTime: Infinity, retry: false, enabled: mode === "manual" });
  const [partnerName, setPartnerName] = useState("");
  const [partnerDate, setPartnerDate] = useState("");
  const [partnerTime, setPartnerTime] = useState("");
  const [partnerTimeUnknown, setPartnerTimeUnknown] = useState(false);
  const [partnerPlace, setPartnerPlace] = useState("");
  const [relation, setRelation] = useState<number | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [used, setUsed] = useState(0);
  useEffect(() => { try { setUsed(Number(localStorage.getItem(quickUsageKey(profile.birthDate, plan))) || 0); } catch { setUsed(0); } }, [profile.birthDate, plan]);
  const remaining = quickCompatibilityLimit[plan] - used;
  const quick = partnerDate ? quickReading(profile.birthDate, partnerDate) : null;
  const canAnalyze = partnerDate !== "" && relation !== null;
  const score = quick?.score ?? 0;
  const advice = score >= 84 ? t.advice[2] : score >= 70 ? t.advice[1] : t.advice[0];
  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div>
      <div
        className="mx-auto grid max-w-xl grid-cols-2 rounded-lg border border-primary/20 bg-background/55 p-1 shadow-champagne"
        role="tablist"
        aria-label={base.artsTitle}
      >
        <Button
          type="button"
          variant="ghost"
          role="tab"
          aria-selected={mode === "manual"}
          onClick={() => setMode("manual")}
          className={`min-h-11 whitespace-normal rounded-md px-2 text-xs sm:text-sm ${mode === "manual" ? "bg-champagne-gradient text-primary-foreground shadow-champagne hover:text-primary-foreground" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"}`}
        >
          {t.manual}
        </Button>
        <Button
          type="button"
          variant="ghost"
          role="tab"
          aria-selected={mode === "compatibility"}
          onClick={() => setMode("compatibility")}
          className={`min-h-11 whitespace-normal rounded-md px-2 text-xs sm:text-sm ${mode === "compatibility" ? "bg-champagne-gradient text-primary-foreground shadow-champagne hover:text-primary-foreground" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"}`}
        >
          {q.title}
        </Button>
      </div>

      {mode === "manual" ? (
        <div className="mt-7">
          <div className="text-center">
            <Sparkles className="mx-auto size-5 text-primary" strokeWidth={1.2} />
            <h3 className="mx-auto mt-3 max-w-xl font-serif text-xl leading-relaxed text-gradient-gold sm:text-2xl">
              {t.manualTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t.manualIntro}
            </p>
          </div>
          <section
            className="card-lux relative mt-7 overflow-hidden rounded-lg px-5 py-7 sm:px-9 sm:py-9"
            aria-label={t.manualTitle}
          >
            <div
              className="pointer-events-none absolute right-5 top-3 font-serif text-7xl leading-none text-primary/10"
              aria-hidden="true"
            >
              ✧
            </div>
            <div className="relative space-y-0">
              {[
                { title: t.coreTitle, body: manualReading.data?.manualCore, symbol: "✦" },
                { title: t.decisionTitle, body: manualReading.data?.manualDecision, symbol: "◇" },
                { title: t.timingTitle, body: manualReading.data?.manualTiming, symbol: "☼" },
              ].map((part, index) => (
                <div
                  key={part.title}
                  className={`grid gap-3 py-6 first:pt-0 last:pb-0 sm:grid-cols-[4rem_1fr] sm:gap-5 ${index > 0 ? "border-t border-primary/20" : ""}`}
                >
                  <div
                    className="flex size-11 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-serif text-2xl text-primary shadow-champagne"
                    aria-hidden="true"
                  >
                    {part.symbol}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] text-primary/65">0{index + 1} / 03</p>
                    <h4 className="font-serif text-base text-gold-glow sm:text-lg">{part.title}</h4>
                     <p className="mt-3 text-base leading-8 text-foreground/80" role={!part.body ? "status" : undefined}>{part.body ?? (manualReading.isError ? homeReadingCopy[language].error : homeReadingCopy[language].loading)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="mt-6 border-y border-primary/15 py-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                <Palette className="size-5" strokeWidth={1.2} />
              </span>
              <div>
                <h3 className="font-serif text-lg text-foreground">{t.colorsTitle}</h3>
                <p className="text-xs text-muted-foreground">{t.colorsIntro}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
              {t.colorLabels.map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className={`size-9 shrink-0 rounded-full border-2 border-foreground/20 shadow-champagne ${swatchClasses[index]}`}
                  />
                  <span>
                    <span className="block text-xs text-muted-foreground">{label}</span>
                    <strong className="mt-0.5 block text-xs font-medium text-foreground">
                      {t.colorNames[index]}
                    </strong>
                  </span>
                </div>
              ))}
            </div>
          </section>
          <p className="mt-5 text-center text-[11px] text-muted-foreground/80">{t.preview}</p>
        </div>
      ) : (
        <div className="mx-auto mt-7 max-w-2xl">
          <div className="text-center">
            <HeartHandshake className="mx-auto size-6 text-primary" strokeWidth={1.2} />
            <h3 className="mt-3 font-serif text-xl text-gradient-gold sm:text-2xl">
               {q.title}
            </h3>
             <p className="mt-2 text-sm text-muted-foreground">{q.hint}</p><p className="mt-2 text-xs text-primary">{q.remaining(remaining)}</p>
          </div>
          <section className="card-lux mt-6 rounded-lg p-5 sm:p-7" aria-label={language === "ja" ? "クイック相性診断" : t.compatibility}>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="partner-name"
                  className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary"
                >
                  <UserRound className="size-4 stroke-[1.4]" aria-hidden="true" />
                  {t.partnerName}{" "}
                  <span className="text-xs font-normal text-primary/70">{t.optional}</span>
                </label>
                <input
                  id="partner-name"
                  type="text"
                  maxLength={40}
                  placeholder={t.partnerNamePlaceholder}
                  value={partnerName}
                  onChange={(event) => setPartnerName(event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="partner-birth-date"
                  className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary"
                >
                  <CalendarDays className="size-4 stroke-[1.4]" aria-hidden="true" />
                  {t.partnerBirthDate}{" "}
                  <span className="text-xs font-normal text-primary/70">{base.required}</span>
                </label>
                <input
                  id="partner-birth-date"
                  type="date"
                  min="1900-01-01"
                  max={today}
                  value={partnerDate}
                  onChange={(event) => {
                    setPartnerDate(event.target.value);
                    setAnalyzed(false);
                  }}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="partner-birth-time"
                    className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary"
                  >
                    <Clock3 className="size-4 stroke-[1.4]" aria-hidden="true" />
                    {t.partnerTime}{" "}
                    <span className="text-xs font-normal text-primary/70">{t.optional}</span>
                  </label>
                  <input
                    id="partner-birth-time"
                    type="time"
                    value={partnerTime}
                    disabled={partnerTimeUnknown}
                    onChange={(event) => setPartnerTime(event.target.value)}
                    className={inputClass}
                  />
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={partnerTimeUnknown}
                      onChange={(event) => {
                        setPartnerTimeUnknown(event.target.checked);
                        if (event.target.checked) setPartnerTime("");
                      }}
                      className="size-4 rounded border-input accent-[var(--primary)]"
                    />
                    {base.timeUnknown}
                  </label>
                </div>
                <div>
                  <label
                    htmlFor="partner-birth-place"
                    className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary"
                  >
                    <MapPin className="size-4 stroke-[1.4]" aria-hidden="true" />
                    {t.partnerPlace}{" "}
                    <span className="text-xs font-normal text-primary/70">{t.optional}</span>
                  </label>
                  <select
                    id="partner-birth-place"
                    value={partnerPlace}
                    onChange={(event) => setPartnerPlace(event.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">{base.selectPlace}</option>
                    {PREFECTURES.map((pref, index) => (
                      <option key={pref} value={pref}>
                        {["en", "es", "fr"].includes(language) ? prefecturesRomanized[index] : pref}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-primary">
                  <Network className="size-4 stroke-[1.4]" aria-hidden="true" />
                  {t.relationLabel}{" "}
                  <span className="text-xs font-normal text-primary/70">{base.required}</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {t.relations.map((rel, index) => (
                    <Button
                      key={rel}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRelation(index);
                        setAnalyzed(false);
                      }}
                      aria-pressed={relation === index}
                      className={`min-h-11 whitespace-normal rounded-lg border px-2 text-xs font-medium transition-all duration-300 sm:text-sm ${relation === index ? "border-primary/80 bg-primary/15 text-primary shadow-champagne" : "border-primary/15 bg-background/40 text-foreground hover:border-primary/45 hover:bg-primary/5"}`}
                    >
                      {rel}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                type="button"
                variant="champagne"
                disabled={!canAnalyze || remaining <= 0}
                onClick={() => { if (!canAnalyze || remaining <= 0) return; const next = used + 1; try { localStorage.setItem(quickUsageKey(profile.birthDate, plan), String(next)); } catch { /* private browsing */ } setUsed(next); setAnalyzed(true); }}
                className="h-14 w-full whitespace-normal rounded-lg px-3 text-sm font-bold transition-all duration-300 disabled:opacity-35 disabled:shadow-none sm:text-base"
              >
                <Sparkles className="size-4 shrink-0" aria-hidden="true" />
                 {remaining <= 0 ? q.limit : q.action}
              </Button>
            </div>
          </section>
           {remaining <= 0 && !analyzed && <p role="status" className="mt-3 text-center text-sm text-primary">{q.refresh}</p>}
          {analyzed && canAnalyze ? (
            <section className="py-8 text-center" aria-live="polite">
              {partnerName ? (
                <p className="mb-4 text-sm text-muted-foreground">{partnerName}</p>
              ) : null}
              <div
                className="compatibility-meter relative mx-auto flex size-44 items-center justify-center rounded-full p-2 shadow-champagne"
                style={{ "--compatibility-score": `${score * 3.6}deg` } as CSSProperties}
              >
                <div className="flex size-full flex-col items-center justify-center rounded-full border border-primary/15 bg-background">
                  <span className="text-xs text-muted-foreground">{t.score}</span>
                  <strong className="mt-1 font-serif text-4xl text-gradient-gold">{score}%</strong>
                </div>
              </div>
              <div className="mx-auto mt-6 max-w-lg rounded-lg border border-primary/20 bg-primary/5 px-5 py-4 text-left">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80">
                  {t.coreLabel}
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  {t.coreDynamics[relation ?? 0]}
                </p>
              </div>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-foreground">{advice}</p>
               {quick && <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">{q.headings.map((title, i) => <article key={title} className="rounded-md border border-primary/25 bg-card/50 p-4"><h4 className="font-serif text-lg text-primary">{title}</h4><p className="mt-2 text-base leading-7 text-foreground">{language === "ja" ? [quick.love, quick.friend, quick.business, quick.overall][i] : quick.same ? q.messages[i] : q.contrast?.[i] ?? q.messages[i]}</p></article>)}</div>}
              <ShareCardButton className="mt-6" language={language} data={{ kicker: language === "ja" ? "ソウルマッチ相性診断" : "Soul match", title: t.compatibility, score, names: partnerName ? [partnerName] : [], lines: [t.coreDynamics[relation ?? 0] ?? ""] }} />
            </section>
          ) : null}
          <section className="card-lux relative mt-2 min-h-56 overflow-hidden rounded-lg p-6 text-center">
            <div className="select-none space-y-3 opacity-20 blur-[2px]" aria-hidden="true">
              <div className="mx-auto h-3 w-3/4 rounded-full bg-primary/40" />
              <div className="mx-auto h-3 w-full rounded-full bg-foreground/30" />
              <div className="mx-auto h-3 w-5/6 rounded-full bg-foreground/30" />
              <div className="grid grid-cols-2 gap-3 pt-5">
                <div className="h-16 rounded-md border border-primary/20" />
                <div className="h-16 rounded-md border border-primary/20" />
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/55 px-6 backdrop-blur-sm">
              <span className="flex size-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <LockKeyhole className="size-5" />
              </span>
              <h4 className="mt-3 font-serif text-lg text-foreground">{t.lockedTitle}</h4>
              <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">
                {t.lockedBody}
              </p>
              <Button
                variant="champagne"
                onClick={onVip}
                className="mt-5 min-h-10 whitespace-normal px-5"
              >
                <Crown className="size-4" />
                {t.unlock}
              </Button>
            </div>
          </section>
          <p className="mt-5 text-center text-[11px] text-muted-foreground/80">{t.preview}</p>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ profile, onEdit, onProfileChange, language, onLanguageChange, signedIn = false }: Props) {
  const t = dashboardTranslations[language];
  const base = translations[language];
  const [tab, setTab] = useState<Tab>("home");
  useEffect(() => {
    const open = (target: string | null) => {
      if (target === "compass") { setTab("home"); setTimeout(() => document.getElementById("day-compass")?.scrollIntoView({ behavior: "smooth", block: "start" }), 250); }
      else if (target === "mandala") { setTab("mandala"); window.scrollTo({ top: 0, behavior: "smooth" }); }
    };
    const q = new URLSearchParams(window.location.search).get("open");
    if (q) { open(q); window.history.replaceState(null, "", window.location.pathname); }
    const onEvt = (e: Event) => open((e as CustomEvent<string>).detail);
    window.addEventListener("onore-open", onEvt);
    return () => window.removeEventListener("onore-open", onEvt);
  }, []);
  const [artsEntry, setArtsEntry] = useState<"manual" | "compatibility">("manual");
  const [teamEntry, setTeamEntry] = useState(false);
  useEffect(() => {
    if (tab !== "settings" || !teamEntry) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById("team-studio-entry")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTeamEntry(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [tab, teamEntry]);
  // Strict entitlement: the read-only membership row decides access. The switch may only preview equal or lower plans.
  const [selectedPlan, setPreviewPlan] = useState<Plan>("b2b-premium");
  const [serverPlan, setActualPlan] = useState<Plan>("free");
  // Dev-only override (localStorage devPlanOverride). Disabled in published builds so it can't unlock paid features in production.
  const devOverrideEnabled = import.meta.env.DEV;
  const [devPlanOverride, setDevPlanOverride] = useState<Plan | null>(null);
  useEffect(() => {
    if (!devOverrideEnabled) return;
    try { const v = window.localStorage.getItem("devPlanOverride") as Plan | null; if (v && planOrder.includes(v)) { setDevPlanOverride(v); setPreviewPlan(v); } } catch { /* ignore */ }
  }, [devOverrideEnabled]);
  const applyDevOverride = (next: Plan) => {
    try { window.localStorage.setItem("devPlanOverride", next); } catch { /* ignore */ }
    setDevPlanOverride(next);
    setPreviewPlan(next);
    if (!canPreviewDesign(next, designMode)) setDesignMode("classic");
  };
  const actualPlan: Plan = devOverrideEnabled && devPlanOverride ? devPlanOverride : serverPlan;
  const [debugAllowed, setDebugAllowed] = useState(false);
  const previewPlan: Plan = planOrder.indexOf(selectedPlan) <= planOrder.indexOf(actualPlan) ? selectedPlan : actualPlan;
  const membership = useServerFn(getMyMembership);
  const checkDebugAccess = useServerFn(canManageDebugPlan);
  useEffect(() => {
    let active = true;
    setActualPlan("free");
    setDebugAllowed(false);
    if (signedIn) {
      membership().then((plan) => { if (active) setActualPlan(plan); }).catch(() => { if (active) setActualPlan("free"); });
      checkDebugAccess().then((allowed) => { if (active) setDebugAllowed(allowed); }).catch(() => { if (active) setDebugAllowed(false); });
    }
    return () => { active = false; };
  }, [signedIn, membership, checkDebugAccess]);
  const [designMode, setDesignMode] = useState<DesignMode>("classic");
  const [modal, setModal] = useState<"profile" | "notifications" | "vip" | "timing" | null>(null);
  const navigation: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "home", label: t.home, icon: Home },
    { id: "arts", label: t.arts, icon: Compass },
    { id: "consult", label: t.consult, icon: WandSparkles },
    { id: "mandala", label: t.mandala, icon: Orbit },
    { id: "settings", label: t.settings, icon: Settings2 },
  ];
  const meters = [
    { label: t.momentum, value: 78 },
    { label: t.clarity, value: 64 },
    { label: t.intuition, value: 86 },
  ];

  return (
    <div data-design={designMode} data-tier={previewPlan} className="design-canvas celestial-scene relative min-h-screen overflow-hidden bg-background pb-32 text-foreground">
      <div className="celestial-stars" aria-hidden="true" />
      <header className="design-header relative z-10 border-b border-primary/10 bg-background/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 pb-4 pt-4 sm:px-8 sm:pb-5">
          <div className="flex h-10 items-center justify-between pr-28 sm:pr-36">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setModal("profile")}
              aria-label={t.profile}
              title={t.profile}
              className="size-10 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 hover:text-primary"
            >
              <UserRound className="size-5" />
            </Button>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModal("vip")}
                aria-label={t.vip}
                title={t.vip}
                className="size-9 text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Crown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModal("notifications")}
                aria-label={t.notifications}
                title={t.notifications}
                className="size-9 text-foreground hover:bg-primary/10 hover:text-primary"
              >
                <Bell className="size-4" />
              </Button>
            </div>
          </div>
          <div className="design-heading mt-2 text-center">
            <p className="design-wordmark text-[9px] uppercase text-primary/70">ONORE COMPASS</p>
            <h1 className="design-title font-serif text-2xl font-bold text-gradient-gold sm:text-3xl">
              {language === "ja" ? "自分を知るコンパス" : "Self Compass"}
            </h1>
            <p className="design-mode-caption mt-1 text-[10px] text-muted-foreground">{designCopy[language].names[designMode]} · {designCopy[language].note}</p>
          </div>
        </div>
      </header>

      <main className="design-main relative z-10 mx-auto max-w-5xl px-4 pt-5 sm:px-8 sm:pt-8">
        {tab === "home" ? (
          <>
            <div className="mb-5"><SelfCoreCard profile={profile} language={language} onProfileChange={onProfileChange} onDiagnosis={() => { setArtsEntry("manual"); setTab("arts"); window.scrollTo({ top: 0, behavior: "smooth" }); }} /></div>
            <div className="mb-5"><DailyLifeGuide profile={profile} language={language} plan={previewPlan} signedIn={signedIn} onUpgrade={() => { setTab("settings"); window.scrollTo({ top: 0, behavior: "smooth" }); }} /></div>
            <section className="design-compass-section text-center" aria-label={t.today}>
              <div className="flex items-center justify-center gap-3 text-primary/70">
                <span className="h-px w-8 bg-primary/30" />
                <Sparkles className="size-3" />
                <span className="h-px w-8 bg-primary/30" />
              </div>
              <h2 className="mt-2 font-serif text-xl text-gradient-gold sm:text-2xl">{t.today}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(language, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }).format(new Date())}
              </p>
              <DayCompass profile={profile} language={language} plan={previewPlan} onUpgrade={() => { setTab("settings"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </section>
            <div className="design-daily-grid mx-auto mt-7 grid max-w-4xl gap-4 md:grid-cols-[1.2fr_1fr]">
              <section className="design-daily-panel card-lux rounded-lg p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">
                      {language === "ja" ? "地球暦" : "EARTH CALENDAR"}
                    </p>
                    <h3 className="mt-1 font-serif text-lg text-foreground">{t.biorhythm}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{t.rhythmSubtitle}</p>
                  </div>
                  <Orbit className="size-6 shrink-0 text-primary/70" strokeWidth={1} />
                </div>
                <div className="mt-6 space-y-4">
                  {meters.map((meter) => (
                    <div key={meter.label}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-muted-foreground">{meter.label}</span>
                        <span className="text-primary">{meter.value}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-primary/10">
                        <div
                          className="h-full rounded-full bg-champagne-gradient"
                          style={{ width: `${meter.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-primary/15 pt-4 text-sm">
                  <span className="text-muted-foreground">{t.actionFocus}</span>
                  <strong className="text-primary">
                    {t.attack} <span aria-hidden="true">↗</span>
                  </strong>
                </div>
              </section>
              <section className="design-daily-panel card-lux flex flex-col justify-between rounded-lg p-5 sm:p-6">
                <div>
                  <div className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                    <Compass className="size-5" strokeWidth={1.2} />
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-primary/70">
                  {language === "ja" ? "決断コンパス" : "DECISION COMPASS"}
                  </p>
                  <h3 className="mt-1 font-serif text-xl text-foreground">{t.decision}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.decisionSubtitle}</p>
                </div>
                <Button
                  variant="champagne"
                  onClick={() => setModal("timing")}
                  className="mt-6 h-11 w-full justify-between whitespace-normal rounded-md px-4 text-xs font-semibold sm:text-sm"
                >
                  {t.timing}
                  <ChevronRight className="size-4 shrink-0" />
                </Button>
              </section>
            </div>
            <p className="mt-5 text-center text-[11px] text-muted-foreground/80">{t.demo}</p>
          </>
        ) : (
          <section className="mx-auto max-w-3xl pt-6 sm:pt-10">
            <div className="mb-8 text-center">
              <Sparkles className="mx-auto size-6 text-primary" strokeWidth={1} />
              <h2 className="mt-3 font-serif text-2xl text-gradient-gold">
                {navigation.find((n) => n.id === tab)?.label}
              </h2>
            </div>
            {tab === "arts" ? (
              <>
                <ArtsGuide />
                <div className="mb-6"><PersonPortrait profile={profile} language={language} /></div>
                <ProfileEditor profile={profile} language={language} onSave={onProfileChange} />
                <NameAnalysisPreview profile={profile} language={language} />
                <BirthColorGuide profile={profile} />
                <TorisetsuPanel key={artsEntry} initialMode={artsEntry} plan={actualPlan} profile={profile} language={language} onVip={() => setModal("vip")} />
              </>
            ) : tab === "consult" ? (
              <>
              <ProfileEditor profile={profile} language={language} onSave={onProfileChange} />
              <ConsultationPanel
                profile={profile}
                language={language}
                plan={previewPlan}
                onVip={() => { setTab("settings"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              />
              </>
            ) : tab === "mandala" ? (
              <NineStarsPanel language={language} birthDate={profile.birthDate} bloodType={profile.bloodType} onVip={() => setModal("vip")} testUnlocked={previewPlan === "vip" || previewPlan === "b2b" || previewPlan === "b2b-premium"} />
            ) : tab === "settings" ? (
              <SettingsPanel
                profile={profile}
                language={language}
                plan={previewPlan}
                actualPlan={actualPlan}
                debugAllowed={debugAllowed}
                devOverrideEnabled={devOverrideEnabled}
                onDebugPlanChanged={(next) => { setActualPlan(next); setPreviewPlan(next); if (!canPreviewDesign(next, designMode)) setDesignMode("classic"); }}
                onPlanChange={(next) => {
                  if (devOverrideEnabled) { applyDevOverride(next); return; }
                  setPreviewPlan(next);
                  if (!canPreviewDesign(next, designMode)) setDesignMode("classic");
                }}
                designMode={designMode}
                onDesignModeChange={setDesignMode}
                onLanguageChange={onLanguageChange}
                onEdit={onEdit}
                onVip={() => setModal("vip")}
                signedIn={signedIn}
              />
            ) : (
              <div className="border-y border-primary/15 py-12 text-center text-sm text-muted-foreground">
                {t.comingFeature}
              </div>
            )}
          </section>
        )}
      </main>

      <nav
        className="design-navigation fixed bottom-3 left-1/2 z-30 w-[min(94vw,560px)] -translate-x-1/2 rounded-2xl border border-primary/25 bg-card/85 p-1.5 shadow-2xl backdrop-blur-xl sm:bottom-5"
        aria-label={language === "ja" ? "メインナビゲーション" : "Main navigation"}
      >
        <div className="grid grid-cols-5">
          {navigation.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => {
                setTab(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-current={tab === item.id ? "page" : undefined}
              className={`flex h-14 min-w-0 flex-col gap-1 rounded-xl px-0.5 text-[9px] sm:text-[11px] ${tab === item.id ? "bg-primary/12 text-primary hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"}`}
            >
              <item.icon className="size-5 shrink-0" strokeWidth={tab === item.id ? 2 : 1.5} />
              <span className="max-w-full truncate">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
      >
        <DialogContent className="card-lux mx-auto w-[calc(100%-2rem)] max-w-sm rounded-lg border-primary/30 bg-card p-6 text-foreground">
          <DialogTitle className="pr-8 font-serif text-xl text-gradient-gold">
            {modal === "profile"
              ? t.profile
              : modal === "notifications"
                ? t.notifications
                : modal === "vip"
                  ? t.vip
                  : t.decision}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {modal === "profile"
              ? t.profile
              : modal === "notifications"
                ? t.notifications
                : modal === "vip"
                  ? t.vip
                  : t.decision}
          </DialogDescription>
          {modal === "profile" ? (
            <>
              <ProfileRows profile={profile} language={language} />
              <Button
                variant="champagne"
                onClick={() => {
                  setModal(null);
                  onEdit();
                }}
                className="mt-2 w-full"
              >
                {base.edit}
              </Button>
            </>
          ) : modal === "notifications" ? (
            <p className="py-7 text-center text-sm text-muted-foreground">{t.noNotifications}</p>
          ) : modal === "vip" ? (
            <p className="py-7 text-center text-sm text-muted-foreground">{t.comingFeature}</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm leading-7 text-foreground">{t.timingResult}</p>
              <p className="border-t border-primary/15 pt-3 text-xs text-muted-foreground">
                {t.demo}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
