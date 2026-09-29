import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Brain, Compass, Heart, Lightbulb, Rocket, Shield, Sparkles, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateHomeReading } from "@/lib/ai/home-reading.functions";
import { homeReadingCopy } from "@/lib/home-reading-copy";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";

export default function SelfCoreCard({ profile, language, onDiagnosis }: { profile: UserProfile; language: Language; onDiagnosis: () => void }) {
  const t = homeReadingCopy[language];
  const generate = useServerFn(generateHomeReading);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home-reading", profile, language],
    queryFn: () => generate({ data: { profile, language } }),
    staleTime: Infinity,
    retry: false,
  });
  const short = data ? [data.perspective, data.selfCare, data.nextStep] : [];
  const long = data ? [data.identity, data.decisions, data.rhythm] : [];
  const shortIcons = [Lightbulb, Sprout, Rocket];
  const longIcons = [Heart, Brain, Shield];

  return (
    <section aria-label={t.title} className="min-w-0 rounded-lg border border-primary/35 bg-card/75 p-4 shadow-champagne backdrop-blur-md sm:p-7">
      <header className="flex items-start gap-3 border-b border-primary/20 pb-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary"><Compass className="size-5" aria-hidden="true" /></div>
        <div className="min-w-0"><p className="text-[10px] uppercase text-primary/75">ONORE COMPASS</p><h2 className="mt-1 break-words font-serif text-xl leading-snug text-gradient-gold sm:text-2xl">{t.title}</h2></div>
      </header>
      {isPending ? <div role="status" className="flex min-h-40 items-center gap-3 text-sm text-muted-foreground"><Sparkles className="size-5 animate-pulse text-primary" />{t.loading}</div> : isError || !data ? (
        <div className="flex min-h-40 flex-col items-start justify-center gap-3" role="alert"><p className="text-sm text-muted-foreground">{t.error}</p><Button variant="outline" onClick={() => void refetch()}>{t.retry}</Button></div>
      ) : <>
        <div className="py-5"><h3 className="font-serif text-lg text-foreground">{t.portrait}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">{short.map((value, index) => {
            const Icon = shortIcons[index] ?? Sparkles;
            return <div key={index} className="min-w-0 border-l-2 border-primary/45 bg-primary/5 px-4 py-3"><div className="flex items-center gap-2 text-primary"><Icon className="size-4 shrink-0" aria-hidden="true" /><h4 className="text-xs font-semibold">{t.labels[index]}</h4></div><p className="mt-2 break-words text-sm leading-7 text-foreground/90">{value}</p></div>;
          })}</div>
        </div>
        <div className="border-t border-primary/20 py-5"><h3 className="font-serif text-lg text-foreground">{t.core}</h3>
          <div className="mt-3 grid gap-5 lg:grid-cols-3">{long.map((value, index) => {
            const Icon = longIcons[index] ?? Sparkles;
            return <article key={index} className="min-w-0 border-t border-primary/30 pt-3"><div className="flex items-start gap-2 text-primary"><Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><h4 className="text-sm font-semibold leading-5">{t.labels[index + 3]}</h4></div><p className="mt-3 break-words text-sm leading-7 text-foreground/90">{value}</p></article>;
          })}</div>
        </div>
      </>}
      <footer className="flex flex-col gap-4 border-t border-primary/20 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-2xl text-xs leading-5 text-muted-foreground">{t.preview}</p>
        <Button variant="champagne" className="shrink-0 justify-between gap-3" onClick={onDiagnosis}>{t.goToArts}<ArrowUpRight className="size-4" /></Button>
      </footer>
    </section>
  );
}
