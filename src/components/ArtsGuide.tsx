import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Language } from "@/lib/translations";
import { artsGuideCopy } from "@/lib/arts-guide-copy";
import { allBranches, allSigns } from "@/lib/zodiac-signs";

const stars = [
  { top: "8%", left: "8%", size: 2, delay: "0s" },
  { top: "18%", left: "20%", size: 1.5, delay: "0.8s", soft: true },
  { top: "6%", left: "36%", size: 1.5, delay: "1.6s", soft: true },
  { top: "14%", left: "58%", size: 2, delay: "0.4s" },
  { top: "9%", left: "78%", size: 2.5, delay: "1.1s" },
  { top: "22%", left: "90%", size: 1.5, delay: "2s", soft: true },
  { top: "34%", left: "5%", size: 1.5, delay: "1.4s" },
  { top: "44%", left: "14%", size: 2, delay: "2.6s", soft: true },
  { top: "40%", left: "86%", size: 1.5, delay: "0.6s" },
  { top: "58%", left: "92%", size: 2, delay: "1.9s", soft: true },
  { top: "70%", left: "7%", size: 2, delay: "2.2s" },
  { top: "78%", left: "26%", size: 1.5, delay: "1s", soft: true },
  { top: "84%", left: "70%", size: 2, delay: "0.3s" },
  { top: "74%", left: "88%", size: 1.5, delay: "2.4s", soft: true },
];

const jaWelcome = [
  "ようこそ、アゴルメンの羅針盤へ。",
  "私たちは誰もが、誕生したその瞬間から太陽系10天体をはじめとする星々の壮大な引力と、自然の循環の中で生を得ています。",
  "このアプリは、単なる運勢の良し悪しを占うものではありません。",
  "西洋占星術や易学、数秘術、バースカラーなど、多層に及ぶ伝統的視点と最新テクノロジーを融合し、あなたの中に眠る固有の波動と『絶対自分軸』を明晰に映し出す人生の象徴的なナビゲーションシステムです。",
  "迷いが生じたとき、己の真の輝きを思い出したいとき、どうぞこの羅針盤を開いてください。",
  "あなただけの美しく確かな航路が、ここから始まります。",
];

function IntroStars() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {stars.map((s, i) => (
        <span
          key={i}
          className={`arts-star${s.soft ? " arts-star--soft" : ""}`}
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}
      <span className="arts-orb" style={{ top: "-14%", left: "50%", width: 340, height: 340, transform: "translateX(-50%)" }} />
      <span className="arts-orb" style={{ bottom: "-18%", left: "-10%", width: 260, height: 260, animationDelay: "2.5s" }} />
      <span className="arts-orb" style={{ bottom: "-10%", right: "-12%", width: 220, height: 220, animationDelay: "4s" }} />
    </div>
  );
}

export function ArtsGuide({ language = "ja" }: { language?: Language }) {
  const words = artsGuideCopy[language];
  const [selected, setSelected] = useState<(typeof words.methods)[number] | null>(null);
  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-primary/30 bg-card/60 backdrop-blur">
      <div className="relative px-4 py-4 text-center md:px-6 md:py-14">
        <IntroStars />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(1px 1px at 12% 20%, var(--primary), transparent), radial-gradient(1.5px 1.5px at 78% 30%, var(--primary), transparent), radial-gradient(1px 1px at 40% 70%, var(--foreground), transparent), radial-gradient(1px 1px at 88% 82%, var(--primary), transparent), radial-gradient(1px 1px at 24% 88%, var(--foreground), transparent), radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)" }} />
        <p className="arts-rise relative text-[11px] tracking-[0.55em] text-primary/80">{words.introduction}</p>
        <div className="relative mt-4 flex items-center justify-center gap-3" aria-hidden>
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-primary/60" />
          <span className="text-primary/90" style={{ fontSize: 10 }}>✦</span>
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-primary/60" />
        </div>
        <h3 className="arts-rise relative mt-4 font-serif text-3xl" style={{ animationDelay: "0.15s", textShadow: "0 0 24px color-mix(in oklab, var(--gold-glow) 35%, transparent)" }}>
          <span className="arts-shimmer">{words.originTitle}</span>
        </h3>
        <div className="relative mx-auto mt-4 max-w-2xl space-y-4 font-serif text-base leading-normal text-foreground/90 md:mt-8 md:space-y-6 md:text-2xl md:leading-[2.1]">
          {language === "ja" ? <div className="arts-rise space-y-4 md:space-y-6" style={{ animationDelay: "0.3s" }}>{jaWelcome.map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}</div> : <p className="arts-rise" style={{ animationDelay: "0.3s" }}>{words.origin}</p>}
          <div className="flex items-center justify-center gap-3 pt-2" aria-hidden>
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="text-primary/80" style={{ fontSize: 9 }}>✧</span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <div className="arts-rise border-t border-primary/25 pt-8 text-left" style={{ animationDelay: "0.75s" }}><h4 className="text-center font-serif text-3xl text-primary">{words.nameOrigin}</h4><p className="mt-6">{words.nameOrigin1}</p><p className="mt-5">{words.nameOrigin2}</p></div><p className="arts-rise text-lg text-primary sm:text-xl" style={{ animationDelay: "0.85s" }}>{words.summary}</p>
        </div>
      </div>
      <div className="space-y-4 border-t border-primary/20 px-4 py-4 md:space-y-6 md:px-5 md:py-6">
        <div>
          <h4 className="font-serif text-lg text-primary">{words.logicTitle}</h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {words.groups.map((group) => (
              <div key={group.title} className="rounded-2xl border border-border bg-background/40 p-4">
                <dt className="text-sm text-primary">{group.title}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground">{group.body}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h4 className="font-serif text-lg text-primary">{words.methodsTitle}</h4>
          <div className="mt-3 space-y-2">
            {words.methods.map((method, i) => <Button key={method.title} type="button" variant="outline" onClick={() => setSelected(method)} className="h-auto min-h-16 w-full justify-start whitespace-normal rounded-md border-primary/25 bg-background/40 p-4 text-left font-serif text-foreground"><span className="mr-2 text-primary">{i + 1}.</span>{method.title}</Button>)}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{words.disclaimer}</p>
      </div>
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-primary/30 bg-card text-foreground">{selected && <><DialogTitle className="font-serif text-xl text-primary">{selected.title}</DialogTitle><DialogDescription className="text-sm leading-7 text-muted-foreground">{words.dialogDescription}</DialogDescription><div className="space-y-4"><div className="border-l-2 border-primary/50 bg-primary/5 p-4"><p className="text-xs text-primary">{words.background}</p><p className="mt-2 text-sm leading-7">{selected.background}</p></div><div className="border-l-2 border-primary/25 p-4"><p className="text-xs text-primary">{words.scope}</p><p className="mt-2 text-sm leading-7">{selected.scope}</p></div>{"id" in selected && selected.id === "westernAstrology" && <ul className="grid gap-2 sm:grid-cols-2">{allSigns(language).map((s) => <li key={s.name} className="rounded-lg border border-primary/20 bg-background/40 p-3"><p className="text-sm font-semibold text-primary">{s.name} <span className="text-xs font-normal text-muted-foreground">{s.symbol} · {s.element} · {s.quality}</span></p><p className="mt-1 text-xs leading-5 text-foreground/90">{s.traits}</p></li>)}</ul>}{"id" in selected && selected.id === "easternAstrology" && <ul className="grid gap-2 sm:grid-cols-2">{allBranches(language).map((b) => <li key={b.name} className="rounded-lg border border-primary/20 bg-background/40 p-3"><p className="text-sm font-semibold text-primary">{b.name}（{b.animal}） <span className="text-xs font-normal text-muted-foreground">{b.element} · {b.yinYang}</span></p><p className="mt-1 text-xs leading-5 text-foreground/90">{b.traits}</p></li>)}</ul>}<p className="text-xs leading-6 text-muted-foreground">{words.disclaimer}</p></div></>}</DialogContent></Dialog>
    </section>
  );
}
