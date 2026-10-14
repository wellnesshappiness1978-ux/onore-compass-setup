import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Sparkles } from "lucide-react";
import ShareCardButton from "./ShareCardButton";
import type { UserProfile } from "./Onboarding";
import { generateHomeReading } from "@/lib/ai/home-reading.functions";
import { homeReadingCopy } from "@/lib/home-reading-copy";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";
import { AgolmenLoading } from "./AgolmenSpiral";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { approachKeys, visibleApproachKeys, type ApproachKey, traitReadingCopy } from "@/lib/trait-reading";

const titles: Record<Language, [string, string]> = {
  ja: ["多層総合診断", "あなたの診断カードをSNSでシェア"],
  en: ["Multi-layer grand reading", "Share this reading (create a card)"],
  "zh-CN": ["多层统合占术总评", "分享此解读（生成卡片）"],
  "zh-TW": ["多層統合占術總評", "分享此解讀（生成卡片）"],
  ko: ["다층 통합 점술 종합 분석", "이 결과 공유하기 (카드 만들기)"],
  es: ["Lectura multicapa integral", "Compartir esta lectura (crear tarjeta)"],
  fr: ["Lecture multicouche intégrale", "Partager cette lecture (créer une carte)"],
};

export default function GrandSummaryCard({ profile, language, plan, embedded = false }: { profile: UserProfile; language: Language; plan: Plan; embedded?: boolean }) {
  const [selected, setSelected] = useState<ApproachKey | null>(null);
  const generate = useServerFn(generateHomeReading);
  const { data, isPending, isError } = useQuery({
    queryKey: ["home-reading-six-v14", profile, language],
    queryFn: () => generate({ data: { profile, language } }),
    staleTime: Infinity,
    retry: false,
  });
  const copy = homeReadingCopy[language];
  const [title, share] = titles[language];
  const palette = birthColorSpectrum(profile);
  const traits = traitReadingCopy[language];
  const text = data?.axisSummary;
  const colors = palette ? (plan === "free" ? [palette.main] : [palette.main, palette.sub, palette.money, palette.work, palette.love, palette.health, palette.mind]) : [];
  return (
    <section id="grand-summary" aria-label={title} className={embedded ? "border-t border-primary/30 px-5 py-8 sm:px-8 sm:py-10" : "card-lux relative mt-8 overflow-hidden rounded-lg px-5 py-8 sm:px-10 sm:py-12"}>
      <div className="text-center">
        <Sparkles className="mx-auto size-6 text-primary" strokeWidth={1.2} aria-hidden="true" />
        <h2 className="mt-3 font-serif text-2xl text-gradient-gold sm:text-3xl">{title}</h2>

      </div>
      {isPending ? <AgolmenLoading compact label={copy.loading} /> : data ? <>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleApproachKeys(data.approachAvailability, data.approaches).map((key, i) => <Button key={key} variant="outline" aria-haspopup="dialog" onClick={() => setSelected(key)} className="h-auto min-h-24 min-w-0 flex-col items-start justify-between whitespace-normal border-primary/30 p-4 text-left [overflow-wrap:anywhere]">
            <span className="flex w-full items-center justify-between text-primary"><span className="font-mono text-xs">{String(i + 1).padStart(2, "0")}</span><ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></span>
            <span className="mt-3 font-serif text-sm leading-6 text-primary">{traits.methods[approachKeys.indexOf(key)]}</span>
          </Button>)}
        </div>
        <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
          <DialogContent className="z-[200] max-h-[85dvh] w-[calc(100%-1.5rem)] min-w-0 overflow-y-auto border-primary/40 bg-card [overflow-wrap:anywhere]">
            <DialogTitle className="pr-6 font-serif text-xl leading-8 text-primary">{selected ? traits.methods[approachKeys.indexOf(selected)] : ""}</DialogTitle>
            <DialogDescription>{selected && data.approachAvailability[selected] === "context" ? traits.symbolic : traits.statuses.reference}</DialogDescription>
            <p className="whitespace-pre-line text-base leading-8 text-foreground">{selected ? data.approaches[selected] : ""}</p>
          </DialogContent>
        </Dialog>
        <section className="mt-6 border-y border-primary/40 py-6 [overflow-wrap:anywhere]">
          <h3 className="font-serif text-xl leading-9 text-primary">{traits.final}</h3>
          <p className="mt-4 whitespace-pre-line text-lg leading-9 text-foreground">{text}</p>
        </section>
      </> : <p role="status" className="mt-6 text-foreground">{copy.error}</p>}
      <p className="mt-5 text-center text-[11px] text-muted-foreground">{copy.preview}</p>
      <ShareCardButton
        className="mt-6 h-auto min-h-12 w-full whitespace-normal px-4 py-3 text-base"
        language={language}
        loading={isPending}
        label={share}
        autoOpen={false}
        data={text && data?.caution ? { kicker: "", title: "", names: [], lines: [data.keySummary || text.slice(0, 120)], caution: data.caution, palette: colors.map((c) => ({ label: c.name ?? "", code: c.code })), score: 0, kind: "identity" } : null}
      />
    </section>
  );
}
