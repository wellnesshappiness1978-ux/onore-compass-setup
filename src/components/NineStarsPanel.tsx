import { Crown, Download, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nineStarsTranslations } from "@/lib/nine-stars-translations";
import type { Language } from "@/lib/translations";

const stars = Array.from({ length: 9 }, (_, i) => {
  const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
  return { x: 400 + Math.cos(angle) * 248, y: 400 + Math.sin(angle) * 248, number: i + 1 };
});

function NineStarsArt() {
  return (
    <svg viewBox="0 0 800 800" className="h-full w-full" role="img" aria-label="Nine stars decorative celestial wheel">
      <defs>
        <radialGradient id="nineSky"><stop stopColor="var(--celestial-ink)" /><stop offset="1" stopColor="var(--background)" /></radialGradient>
        <radialGradient id="nineCore"><stop stopColor="var(--gold-glow)" /><stop offset="0.3" stopColor="var(--primary)" /><stop offset="1" stopColor="var(--background)" /></radialGradient>
        <filter id="nineGlow"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <rect width="800" height="800" fill="url(#nineSky)" />
      <g fill="none" stroke="var(--primary)">
        <circle cx="400" cy="400" r="355" opacity=".25" strokeWidth="1" />
        <circle cx="400" cy="400" r="337" opacity=".65" strokeWidth="1" />
        <circle cx="400" cy="400" r="304" opacity=".3" strokeDasharray="2 9" />
        <circle cx="400" cy="400" r="249" opacity=".7" />
        <circle cx="400" cy="400" r="184" opacity=".35" />
        <circle cx="400" cy="400" r="107" opacity=".7" />
        <circle cx="400" cy="400" r="88" opacity=".25" />
        <path d={stars.map((s, i) => `${i ? "L" : "M"}${s.x.toFixed(2)} ${s.y.toFixed(2)}`).join(" ") + "Z"} opacity=".5" />
        <path d={stars.filter((_, i) => i % 2 === 0).map((s, i) => `${i ? "L" : "M"}${s.x.toFixed(2)} ${s.y.toFixed(2)}`).join(" ") + "Z"} opacity=".2" />
        {stars.map((s) => <line key={s.number} x1="400" y1="400" x2={s.x} y2={s.y} opacity=".15" />)}
      </g>
      <g fill="var(--gold-glow)">
        {Array.from({ length: 72 }, (_, i) => {
          const a = i * Math.PI / 36;
          const r = i % 3 === 0 ? 371 : 366;
          return <circle key={i} cx={400 + Math.cos(a) * r} cy={400 + Math.sin(a) * r} r={i % 3 === 0 ? 1.7 : .7} opacity={i % 3 === 0 ? .7 : .35} />;
        })}
        <circle cx="400" cy="400" r="66" fill="url(#nineCore)" opacity=".45" filter="url(#nineGlow)" />
      </g>
      {stars.map((s) => <g key={s.number}>
        <circle cx={s.x} cy={s.y} r="24" fill="var(--background)" stroke="var(--primary)" strokeOpacity=".7" />
        <circle cx={s.x} cy={s.y} r="29" fill="none" stroke="var(--primary)" strokeOpacity=".18" />
        <text x={s.x} y={s.y + 6} textAnchor="middle" fill="var(--gold-glow)" fontSize="16" fontFamily="serif">{s.number}</text>
      </g>)}
      <text x="400" y="414" textAnchor="middle" fill="var(--gold-glow)" fontSize="42" fontFamily="serif">✦</text>
    </svg>
  );
}

export default function NineStarsPanel({ language, onVip }: { language: Language; onVip: () => void }) {
  const t = nineStarsTranslations[language];
  return (
    <section className="mx-auto max-w-2xl text-center" aria-labelledby="nine-stars-heading">
      <p className="text-[10px] text-primary/75 tracking-[0.2em]">{t.subtitle}</p>
      <h3 id="nine-stars-heading" className="mt-3 font-serif text-2xl text-gradient-gold sm:text-3xl">{t.title}</h3>
      <p className="mt-3 text-xs text-muted-foreground">{t.preview}</p>
      <div className="relative mx-auto mt-8 aspect-square w-full max-w-[560px] overflow-hidden rounded-full border border-primary/30 shadow-gold">
        <div className="absolute inset-0 blur-[1px]" aria-hidden="true"><NineStarsArt /></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30 p-5 backdrop-blur-[2px] sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-full border border-primary/40 bg-background/75 text-primary shadow-gold"><LockKeyhole className="size-5" /></div>
          <p className="mt-4 flex items-center gap-2 font-serif text-lg text-primary"><Sparkles className="size-4" />{t.lock}</p>
          <Button variant="champagne" onClick={onVip} className="mt-5 h-auto max-w-[330px] whitespace-normal px-5 py-3 text-center text-sm leading-6">
            <Crown className="size-4 shrink-0" />{t.unlock}
          </Button>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-md text-xs leading-6 text-muted-foreground">{t.note}</p>
      <Button variant="outline" disabled className="mt-5 border-primary/30 text-muted-foreground" title={t.unavailable}>
        <Download className="size-4" />{t.download}
      </Button>
    </section>
  );
}