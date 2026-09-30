import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Brain, Compass, Heart, Lightbulb, Orbit, Rocket, Shield, Sparkles, Sprout, Users, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateHomeReading } from "@/lib/ai/home-reading.functions";
import { homeReadingCopy } from "@/lib/home-reading-copy";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";

export default function SelfCoreCard({ profile, language, onDiagnosis, onConsult, onArt, onTeam }: { profile: UserProfile; language: Language; onDiagnosis: () => void; onConsult: () => void; onArt: () => void; onTeam: () => void }) {
  const t = homeReadingCopy[language];
  const generate = useServerFn(generateHomeReading);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home-reading-v3", profile, language],
    queryFn: () => generate({ data: { profile, language } }),
    staleTime: Infinity,
    retry: false,
  });
  const short = data ? [data.perspective, data.selfCare, data.nextStep] : [];
  const long = data ? [data.identity, data.decisions, data.rhythm] : [];
  const shortIcons = [Lightbulb, Sprout, Rocket];
  const longIcons = [Heart, Brain, Shield];

  return (
    <section aria-label={t.title} className="min-w-0 overflow-hidden rounded-lg border border-primary/35 bg-card/75 shadow-champagne backdrop-blur-md">
      <header className="flex items-start gap-3 border-b border-primary/20 bg-primary/5 p-5 sm:p-8">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary"><Compass className="size-5" aria-hidden="true" /></div>
        <div className="min-w-0"><p className="text-[10px] uppercase text-primary/75">ONORE COMPASS · {t.openToAll}</p><h2 className="mt-2 break-words font-serif text-xl leading-snug text-gradient-gold sm:text-2xl">{t.title}</h2></div>
      </header>
      <div className="px-5 sm:px-8">
      {isPending ? <div role="status" className="flex min-h-40 items-center gap-3 text-sm text-muted-foreground"><Sparkles className="size-5 animate-pulse text-primary" />{t.loading}</div> : isError || !data ? (
        <div className="flex min-h-40 flex-col items-start justify-center gap-3" role="alert"><p className="text-sm text-muted-foreground">{t.error}</p><Button variant="outline" onClick={() => void refetch()}>{t.retry}</Button></div>
      ) : <>
        <div className="py-7 sm:py-10"><div className="flex items-center gap-3"><span className="font-serif text-xs text-primary/70">01 / 03</span><span className="h-px w-8 bg-primary/40" /><h3 className="font-serif text-xl text-primary sm:text-2xl">{t.portrait}</h3></div>
          <p className="mt-6 max-w-3xl whitespace-pre-line break-words font-serif text-[1.0625rem] leading-[2.1] text-foreground sm:text-xl sm:leading-[2.05]">{data.portrait}</p>
        </div>
        <div className="border-t border-primary/20 py-7"><div className="flex items-center gap-3"><span className="font-serif text-xs text-primary/70">02 / 03</span><span className="h-px w-8 bg-primary/40" /><h3 className="font-serif text-lg text-foreground">{t.core}</h3></div>
          <div className="mt-3 grid gap-5 lg:grid-cols-3">{long.map((value, index) => {
            const Icon = longIcons[index] ?? Sparkles;
            return <article key={index} className="min-w-0 border-t border-primary/30 pt-3"><div className="flex items-start gap-2 text-primary"><Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><h4 className="text-sm font-semibold leading-5">{t.labels[index + 3]}</h4></div><p className="mt-3 break-words text-sm leading-7 text-foreground/90">{value}</p></article>;
          })}</div>
        </div>
        <section aria-label={t.action} className="border-t border-primary/20 py-7">
          <div className="flex items-center gap-3"><span className="font-serif text-xs text-primary/70">03 / 03</span><span className="h-px w-8 bg-primary/40" /><h3 className="font-serif text-lg text-primary">{t.action}</h3></div>
          <div className="mt-4 grid gap-5 md:grid-cols-3">{short.map((value, index) => {
            const Icon = shortIcons[index] ?? Sparkles;
            return <article key={index} className="min-w-0 border-l-2 border-primary/45 pl-4"><div className="flex items-center gap-2 text-primary"><Icon className="size-4 shrink-0" aria-hidden="true" /><h4 className="text-sm font-semibold">{t.labels[index]}</h4></div><p className="mt-2 break-words text-sm leading-7 text-foreground/90">{value}</p></article>;
          })}</div>
        </section>
      </>}
      <p className="border-t border-primary/20 py-4 text-xs leading-6 text-muted-foreground">{t.preview}</p>
      </div>
      {data && !isError && <footer className="border-t border-primary/25 bg-background/40 p-5 sm:p-8">
        <div className="flex items-center gap-3"><Sparkles className="size-5 text-primary" aria-hidden="true" /><h3 className="font-serif text-lg text-primary sm:text-xl">{t.nextStepTitle}</h3></div>
        <div className="mt-5 grid gap-2.5">
          {([ [WandSparkles, t.consultCta, onConsult, t.vipLabel], [Orbit, t.artCta, onArt, t.vipLabel], [Users, t.teamCta, onTeam, t.businessLabel] ] as const).map(([Icon, label, action, badge]) => <Button key={label} type="button" variant="outline" onClick={action} className="group h-auto min-h-16 w-full justify-start gap-3 whitespace-normal border-primary/25 bg-card/50 px-4 py-3 text-left text-foreground hover:border-primary/65 hover:bg-primary/10 hover:text-foreground sm:px-5">
            <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1 break-words text-sm leading-6">{label}</span><span className="shrink-0 text-[10px] text-primary">{badge}</span><ArrowUpRight className="size-4 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
          </Button>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><p className="text-xs leading-5 text-muted-foreground">{t.nextStepNote}</p><Button variant="link" className="h-auto p-0 text-xs" onClick={onDiagnosis}>{t.goToArts}<ArrowUpRight className="size-3" /></Button></div>
      </footer>}
    </section>
  );
}
