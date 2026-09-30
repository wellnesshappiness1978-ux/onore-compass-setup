import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Compass, Dna, Fingerprint, Heart, Orbit, Sparkles, Users, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateHomeReading } from "@/lib/ai/home-reading.functions";
import { fiveElementsCopy } from "@/lib/five-elements-copy";
import { homeReadingCopy } from "@/lib/home-reading-copy";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";

export default function SelfCoreCard({ profile, language, onDiagnosis, onConsult, onArt, onTeam }: { profile: UserProfile; language: Language; onDiagnosis: () => void; onConsult: () => void; onArt: () => void; onTeam: () => void }) {
  const t = homeReadingCopy[language];
  const f = fiveElementsCopy[language];
  const generate = useServerFn(generateHomeReading);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home-reading-five-v1", profile, language],
    queryFn: () => generate({ data: { profile, language } }),
    staleTime: Infinity,
    retry: false,
  });
  const e = data?.elements;
  const values = e ? [e.name ? `${e.name.sky} · ${e.name.person} · ${e.name.earth} · ${e.name.total}` : null, e.zodiac, e.eto, e.blood, e.animal] : [];
  const sections = data ? [data.synthesis, data.name, data.mind, data.instinct, data.strength] : [];
  const icons = [Dna, Fingerprint, Orbit, Heart, Sparkles];

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
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-primary/20 py-6 sm:grid-cols-5 sm:gap-5">
            {f.axes.map((label, i) => <div key={label} className="min-w-0 border-l border-primary/35 pl-3"><p className="text-xs text-primary">{label}</p><p className="mt-2 break-words font-serif text-sm leading-6 text-foreground">{values[i] ?? f.missing}</p></div>)}
          </div>
          {sections.map((text, i) => {
            const Icon = icons[i] ?? Sparkles;
            return <article key={i} className="border-b border-primary/20 py-7 last:border-b-0 sm:py-9">
              <div className="flex items-start gap-3"><span className="pt-0.5 font-serif text-xs text-primary/70">0{i + 1}</span><Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /><h3 className="min-w-0 break-words font-serif text-lg leading-snug text-primary sm:text-xl">{f.sections[i]}</h3></div>
              <p className={`mt-5 max-w-3xl whitespace-pre-line break-words text-foreground ${i === 0 ? "font-serif text-[1.0625rem] leading-[2.1] sm:text-xl sm:leading-[2.05]" : "text-sm leading-8 sm:text-base"}`}>{text}</p>
            </article>;
          })}
        </>}
        <div className="space-y-1 border-t border-primary/20 py-4 text-xs leading-6 text-muted-foreground"><p>{t.preview}</p><p>{f.nameNote} {e?.zodiacBoundary ? f.boundaryNote : ""} {e?.uncertainYear ? f.yearNote : ""}</p><p>{f.method}</p></div>
      </div>
      {data && !isError && <footer className="border-t border-primary/25 bg-background/40 p-5 sm:p-8">
        <div className="flex items-center gap-3"><Sparkles className="size-5 text-primary" aria-hidden="true" /><h3 className="font-serif text-lg text-primary sm:text-xl">{t.nextStepTitle}</h3></div>
        <div className="mt-5 grid gap-2.5">
          {([[WandSparkles, t.consultCta, onConsult, t.vipLabel], [Orbit, t.artCta, onArt, t.vipLabel], [Users, t.teamCta, onTeam, t.businessLabel]] as const).map(([Icon, label, action, badge]) => <Button key={label} type="button" variant="outline" onClick={action} className="group h-auto min-h-16 w-full justify-start gap-3 whitespace-normal border-primary/25 bg-card/50 px-4 py-3 text-left text-foreground hover:border-primary/65 hover:bg-primary/10 hover:text-foreground sm:px-5">
            <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1 break-words text-sm leading-6">{label}</span><span className="shrink-0 text-[10px] text-primary">{badge}</span><ArrowUpRight className="size-4 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
          </Button>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><p className="text-xs leading-5 text-muted-foreground">{t.nextStepNote}</p><Button variant="link" className="h-auto p-0 text-xs" onClick={onDiagnosis}>{t.goToArts}<ArrowUpRight className="size-3" /></Button></div>
      </footer>}
    </section>
  );
}
