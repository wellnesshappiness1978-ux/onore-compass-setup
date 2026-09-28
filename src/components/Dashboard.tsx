import { useRef, useState } from "react";
import { Bell, ChevronRight, Compass, Crown, Home, Orbit, Settings2, Sparkles, UserRound, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PREFECTURES, type UserProfile } from "./Onboarding";
import { dashboardTranslations, prefecturesRomanized, translations, type Language } from "@/lib/translations";

type Props = { profile: UserProfile; onEdit: () => void; language: Language };
type Tab = "home" | "arts" | "consult" | "mandala" | "settings";

const zodiac = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const trigrams = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];
const positions = (count: number, radius: number) => Array.from({ length: count }, (_, index) => {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius };
});
const zodiacPositions = positions(12, 43);
const trigramPositions = positions(8, 32);

function CompassWheel({ language }: { language: Language }) {
  const t = dashboardTranslations[language];
  const [angle, setAngle] = useState(0);
  const start = useRef<{ pointer: number; angle: number } | null>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const pointerAngle = (x: number, y: number) => {
    const rect = wheel.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.atan2(y - (rect.top + rect.height / 2), x - (rect.left + rect.width / 2)) * 180 / Math.PI;
  };

  return (
    <div className="compass-wheel relative mx-auto aspect-square w-full max-w-[410px] touch-none select-none" ref={wheel}
      role="slider" tabIndex={0} aria-label={t.rotate} aria-valuemin={0} aria-valuemax={359} aria-valuenow={Math.round(((angle % 360) + 360) % 360)}
      onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); setAngle(a => a + (event.key === "ArrowRight" ? 15 : -15)); } }}
      onPointerDown={(event) => { start.current = { pointer: pointerAngle(event.clientX, event.clientY), angle }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={(event) => { if (start.current) setAngle(start.current.angle + pointerAngle(event.clientX, event.clientY) - start.current.pointer); }}
      onPointerUp={() => { start.current = null; }} onPointerCancel={() => { start.current = null; }}>
      <div className="compass-halo absolute inset-[5%] rounded-full" />
      <div className="compass-rotor absolute inset-[5%] rounded-full" style={{ transform: `rotate(${angle}deg)` }}>
        <div className="absolute inset-0 rounded-full border border-primary/45" />
        <div className="absolute inset-[3%] rounded-full border border-primary/20" />
        <div className="absolute inset-[15%] rounded-full border border-primary/20" />
        <div className="absolute inset-[23%] rounded-full border border-primary/35" />
        <div className="absolute inset-[36%] rounded-full border border-primary/20" />
        <div className="absolute inset-[49%] bg-primary/60" />
        <div className="absolute inset-0 rounded-full compass-ticks" />
        <div className="absolute left-1/2 top-[-1%] -translate-x-1/2 text-primary text-lg">✦</div>
        <div className="absolute left-1/2 bottom-[-1%] -translate-x-1/2 text-primary/70 text-sm">✧</div>
        {zodiac.map((sign, i) => <span key={sign} className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center font-serif text-lg text-primary/80" style={{ left: `${zodiacPositions[i]?.x ?? 50}%`, top: `${zodiacPositions[i]?.y ?? 50}%`, transform: `translate(-50%, -50%) rotate(${-angle}deg)` }}>{sign}</span>)}
        {trigrams.map((symbol, i) => <span key={symbol} className="absolute -translate-x-1/2 -translate-y-1/2 font-serif text-lg text-gold-glow/55" style={{ left: `${trigramPositions[i]?.x ?? 50}%`, top: `${trigramPositions[i]?.y ?? 50}%`, transform: `translate(-50%, -50%) rotate(${-angle}deg)` }}>{symbol}</span>)}
        <div className="absolute inset-[28%] compass-cross pointer-events-none" />
      </div>
      <div className="compass-center pointer-events-none absolute inset-[33%] flex flex-col items-center justify-center rounded-full border border-primary/40 text-center shadow-champagne">
        <span className="mb-1 text-[10px] text-primary/80 sm:text-xs">{t.theme}</span>
        <strong className="font-serif text-3xl text-gradient-gold sm:text-4xl">{t.attack}</strong>
        <span className="mt-1 text-[9px] text-muted-foreground sm:text-[11px]">{t.energy} / {t.expansion}</span>
      </div>
    </div>
  );
}

function ProfileRows({ profile, language }: { profile: UserProfile; language: Language }) {
  const t = translations[language];
  const rows = [
    [t.birthDate, profile.birthDate ? new Date(`${profile.birthDate}T12:00:00`).toLocaleDateString(language, { year: "numeric", month: "long", day: "numeric" }) : "—"],
    [t.birthTime, profile.birthTimeUnknown ? t.unknown : profile.birthTime || "—"],
    [t.birthPlace, ["en", "es", "fr"].includes(language) && profile.birthPlace ? prefecturesRomanized[PREFECTURES.indexOf(profile.birthPlace)] || profile.birthPlace : profile.birthPlace || "—"],
    [t.bloodType, profile.bloodType ? `${profile.bloodType}${t.bloodSuffix}` : "—"],
    [t.siblingOrder, t.siblings[["first", "middle", "last", "only"].indexOf(profile.siblingOrder)] || "—"],
  ];
  return <div>{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 border-b border-primary/10 py-3 last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-right text-sm text-foreground">{value}</span></div>)}</div>;
}

export default function Dashboard({ profile, onEdit, language }: Props) {
  const t = dashboardTranslations[language];
  const base = translations[language];
  const [tab, setTab] = useState<Tab>("home");
  const [modal, setModal] = useState<"profile" | "notifications" | "vip" | "timing" | null>(null);
  const navigation: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "home", label: t.home, icon: Home }, { id: "arts", label: t.arts, icon: Compass },
    { id: "consult", label: t.consult, icon: WandSparkles }, { id: "mandala", label: t.mandala, icon: Orbit },
    { id: "settings", label: t.settings, icon: Settings2 },
  ];
  const meters = [{ label: t.momentum, value: 78 }, { label: t.clarity, value: 64 }, { label: t.intuition, value: 86 }];

  return <div className="celestial-scene relative min-h-screen overflow-hidden bg-background pb-32 text-foreground">
    <div className="celestial-stars" aria-hidden="true" />
    <header className="relative z-10 border-b border-primary/10 bg-background/40 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 pb-4 pt-4 sm:px-8 sm:pb-5">
        <div className="flex h-10 items-center justify-between pr-28 sm:pr-36">
          <Button variant="ghost" size="icon" onClick={() => setModal("profile")} aria-label={t.profile} title={t.profile} className="size-10 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 hover:text-primary"><UserRound className="size-5" /></Button>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={() => setModal("vip")} aria-label={t.vip} title={t.vip} className="size-9 text-primary hover:bg-primary/10 hover:text-primary"><Crown className="size-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setModal("notifications")} aria-label={t.notifications} title={t.notifications} className="size-9 text-foreground hover:bg-primary/10 hover:text-primary"><Bell className="size-4" /></Button>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-primary/70">ONORE COMPASS</p>
          <h1 className="font-serif text-2xl font-bold text-gradient-gold sm:text-3xl">Self Compass</h1>
        </div>
      </div>
    </header>

    <main className="relative z-10 mx-auto max-w-5xl px-4 pt-5 sm:px-8 sm:pt-8">
      {tab === "home" ? <>
        <section className="text-center" aria-label={t.today}>
          <div className="flex items-center justify-center gap-3 text-primary/70"><span className="h-px w-8 bg-primary/30" /><Sparkles className="size-3" /><span className="h-px w-8 bg-primary/30" /></div>
          <h2 className="mt-2 font-serif text-xl text-gradient-gold sm:text-2xl">{t.today}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric" }).format(new Date())}</p>
          <CompassWheel language={language} />
          <p className="-mt-2 text-xs text-muted-foreground">{t.wheelHint}</p>
        </section>
        <div className="mx-auto mt-7 grid max-w-4xl gap-4 md:grid-cols-[1.2fr_1fr]">
          <section className="card-lux rounded-lg p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">EARTH CALENDAR</p><h3 className="mt-1 font-serif text-lg text-foreground">{t.biorhythm}</h3><p className="mt-1 text-xs text-muted-foreground">{t.rhythmSubtitle}</p></div><Orbit className="size-6 shrink-0 text-primary/70" strokeWidth={1} /></div>
            <div className="mt-6 space-y-4">{meters.map(meter => <div key={meter.label}><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{meter.label}</span><span className="text-primary">{meter.value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-champagne-gradient" style={{ width: `${meter.value}%` }} /></div></div>)}</div>
            <div className="mt-6 flex items-center justify-between border-t border-primary/15 pt-4 text-sm"><span className="text-muted-foreground">{t.actionFocus}</span><strong className="text-primary">{t.attack} <span aria-hidden="true">↗</span></strong></div>
          </section>
          <section className="card-lux flex flex-col justify-between rounded-lg p-5 sm:p-6"><div><div className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"><Compass className="size-5" strokeWidth={1.2} /></div><p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-primary/70">DECISION COMPASS</p><h3 className="mt-1 font-serif text-xl text-foreground">{t.decision}</h3><p className="mt-2 text-sm text-muted-foreground">{t.decisionSubtitle}</p></div><Button variant="champagne" onClick={() => setModal("timing")} className="mt-6 h-11 w-full justify-between whitespace-normal rounded-md px-4 text-xs font-semibold sm:text-sm">{t.timing}<ChevronRight className="size-4 shrink-0" /></Button></section>
        </div>
        <p className="mt-5 text-center text-[11px] text-muted-foreground/80">{t.demo}</p>
      </> : <section className="mx-auto max-w-3xl pt-6 sm:pt-10">
        <div className="mb-8 text-center"><Sparkles className="mx-auto size-6 text-primary" strokeWidth={1} /><h2 className="mt-3 font-serif text-2xl text-gradient-gold">{navigation.find(n => n.id === tab)?.label}</h2></div>
        {tab === "arts" ? <><p className="mb-6 text-center text-sm text-muted-foreground">{t.artsSubtitle}</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{base.arts.map((art, i) => <div key={art} className="card-lux flex min-h-24 flex-col justify-between rounded-lg p-4"><span className="text-xs text-primary/70">{String(i + 1).padStart(2, "0")}</span><span className="font-serif text-sm text-foreground">{art}</span></div>)}</div><p className="mt-6 text-center text-xs text-muted-foreground">{t.comingFeature}</p></> : tab === "settings" ? <section className="border-y border-primary/15 py-5"><h3 className="font-serif text-lg text-primary">{t.profile}</h3><ProfileRows profile={profile} language={language} /><Button variant="outline" onClick={onEdit} className="mt-5 w-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary">{base.edit}</Button></section> : <div className="border-y border-primary/15 py-12 text-center text-sm text-muted-foreground">{t.comingFeature}</div>}
      </section>}
    </main>

    <nav className="fixed bottom-3 left-1/2 z-30 w-[min(94vw,560px)] -translate-x-1/2 rounded-2xl border border-primary/25 bg-card/85 p-1.5 shadow-2xl backdrop-blur-xl sm:bottom-5" aria-label="Main navigation">
      <div className="grid grid-cols-5">{navigation.map(item => <Button key={item.id} variant="ghost" onClick={() => { setTab(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-current={tab === item.id ? "page" : undefined} className={`flex h-14 min-w-0 flex-col gap-1 rounded-xl px-0.5 text-[9px] sm:text-[11px] ${tab === item.id ? "bg-primary/12 text-primary hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"}`}><item.icon className="size-5 shrink-0" strokeWidth={tab === item.id ? 2 : 1.5} /><span className="max-w-full truncate">{item.label}</span></Button>)}</div>
    </nav>

    <Dialog open={modal !== null} onOpenChange={open => { if (!open) setModal(null); }}>
      <DialogContent className="card-lux mx-auto w-[calc(100%-2rem)] max-w-sm rounded-lg border-primary/30 bg-card p-6 text-foreground">
        <DialogTitle className="pr-8 font-serif text-xl text-gradient-gold">{modal === "profile" ? t.profile : modal === "notifications" ? t.notifications : modal === "vip" ? t.vip : t.decision}</DialogTitle>
        <DialogDescription className="sr-only">{modal === "profile" ? t.profile : modal === "notifications" ? t.notifications : modal === "vip" ? t.vip : t.decision}</DialogDescription>
        {modal === "profile" ? <><ProfileRows profile={profile} language={language} /><Button variant="champagne" onClick={() => { setModal(null); onEdit(); }} className="mt-2 w-full">{base.edit}</Button></> : modal === "notifications" ? <p className="py-7 text-center text-sm text-muted-foreground">{t.noNotifications}</p> : modal === "vip" ? <p className="py-7 text-center text-sm text-muted-foreground">{t.comingFeature}</p> : <div className="space-y-4"><p className="text-sm leading-7 text-foreground">{t.timingResult}</p><p className="border-t border-primary/15 pt-3 text-xs text-muted-foreground">{t.demo}</p></div>}
      </DialogContent>
    </Dialog>
  </div>;
}
