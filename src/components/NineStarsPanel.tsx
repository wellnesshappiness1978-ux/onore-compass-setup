import { useEffect, useState } from "react";
import { Crown, Download, LockKeyhole, LockKeyholeOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBirthColorPair } from "@/lib/birth-colors";
import { nineStarsTranslations } from "@/lib/nine-stars-translations";
import type { Language } from "@/lib/translations";

const stars = Array.from({ length: 9 }, (_, i) => {
  const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
  return { x: 400 + Math.cos(angle) * 248, y: 400 + Math.sin(angle) * 248, number: i + 1 };
});

function NineStarsArt({ main, sub }: { main: string; sub: string }) {
  return (
    <svg viewBox="0 0 800 800" className="h-full w-full" role="img" aria-label="Nine stars decorative celestial wheel">
      <defs>
        <radialGradient id="nineSky"><stop stopColor={main} /><stop offset="0.45" stopColor={sub} /><stop offset="1" stopColor="var(--background)" /></radialGradient>
        <radialGradient id="nineCore"><stop stopColor="var(--gold-glow)" /><stop offset="0.3" stopColor={main} /><stop offset="0.7" stopColor={sub} /><stop offset="1" stopColor="var(--background)" /></radialGradient>
        <linearGradient id="nineOrbit" x2="1" y2="1"><stop stopColor={main} /><stop offset=".5" stopColor="var(--gold-glow)" /><stop offset="1" stopColor={sub} /></linearGradient>
        <filter id="nineGlow"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <rect width="800" height="800" fill="url(#nineSky)" />
      <circle cx="270" cy="250" r="260" fill={main} opacity=".14" filter="url(#nineGlow)" />
      <circle cx="550" cy="540" r="260" fill={sub} opacity=".18" filter="url(#nineGlow)" />
      <g fill="none" stroke="url(#nineOrbit)">
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
      <g fill={sub}>
        {Array.from({ length: 72 }, (_, i) => {
          const a = i * Math.PI / 36;
          const r = i % 3 === 0 ? 371 : 366;
          return <circle key={i} cx={400 + Math.cos(a) * r} cy={400 + Math.sin(a) * r} r={i % 3 === 0 ? 1.7 : .7} opacity={i % 3 === 0 ? .7 : .35} />;
        })}
        <circle cx="400" cy="400" r="66" fill="url(#nineCore)" opacity=".45" filter="url(#nineGlow)" />
      </g>
      {stars.map((s) => <g key={s.number}>
        <circle cx={s.x} cy={s.y} r="24" fill="var(--background)" stroke={s.number % 2 ? main : sub} strokeOpacity=".8" />
        <circle cx={s.x} cy={s.y} r="29" fill="none" stroke={s.number % 2 ? main : sub} strokeOpacity=".35" />
        <text x={s.x} y={s.y + 6} textAnchor="middle" fill={s.number % 2 ? main : sub} fontSize="16" fontFamily="serif">{s.number}</text>
      </g>)}
      <text x="400" y="414" textAnchor="middle" fill="var(--gold-glow)" fontSize="42" fontFamily="serif">✦</text>
    </svg>
  );
}

export default function NineStarsPanel({ language, onVip, birthDate, testUnlocked = false }: { language: Language; onVip: () => void; birthDate: string; testUnlocked?: boolean }) {
  const t = nineStarsTranslations[language];
  const pair = getBirthColorPair(birthDate);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { if (!testUnlocked) setRevealed(false); }, [testUnlocked]);
  const open = testUnlocked && revealed;
  return (
    <section className="mx-auto max-w-2xl text-center" aria-labelledby="nine-stars-heading">
      <p className="text-[10px] text-primary/75 tracking-[0.2em]">{t.subtitle}</p>
      <p className="mt-5 font-serif text-sm text-primary/90">{t.tagline}</p>
      <h3 id="nine-stars-heading" className="mt-2 font-serif text-2xl text-gradient-gold sm:text-3xl">{t.title}</h3>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">{pair ? t.preview : t.fallback}</p>
      {testUnlocked && <p className="mx-auto mt-3 inline-block rounded-full border border-primary/40 px-3 py-1 text-[11px] text-primary">開発テスト：ビジネス会員として仮表示中（課金・権限は未実装）</p>}
      <div className="relative mx-auto mt-8 aspect-square w-full max-w-[560px] overflow-hidden rounded-full border border-primary/30 shadow-gold">
        <div className={`absolute inset-0 transition-all duration-[1600ms] ease-out ${open ? "scale-100 blur-0 brightness-110" : "scale-105 blur-[1px]"}`} aria-hidden={!open}><NineStarsArt main={pair?.main.token ?? "var(--primary)"} sub={pair?.sub.token ?? "var(--gold-glow)"} /></div>
        {open && <div key="burst" className="pointer-events-none absolute inset-0 rounded-full animate-[unlock-burst_1.6s_ease-out_forwards] bg-[radial-gradient(circle,var(--gold-glow)_0%,transparent_60%)]" aria-hidden="true" />}
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-background/30 p-5 backdrop-blur-[2px] transition-opacity duration-700 sm:p-8 ${open ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <div className="flex size-12 items-center justify-center rounded-full border border-primary/40 bg-background/75 text-primary shadow-gold">{testUnlocked ? <LockKeyholeOpen className="size-5" /> : <LockKeyhole className="size-5" />}</div>
          <p className="mt-4 flex items-center gap-2 font-serif text-lg text-primary"><Sparkles className="size-4" />{t.lock}</p>
          <Button variant="champagne" onClick={testUnlocked ? () => setRevealed(true) : onVip} className="mt-5 h-auto max-w-[330px] whitespace-normal px-5 py-3 text-center text-sm leading-6">
            <Crown className="size-4 shrink-0" />{t.unlock}
          </Button>
        </div>
      </div>
      {open && <Button variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground" onClick={() => setRevealed(false)}>ロック演出をもう一度見る</Button>}
      <p className="mx-auto mt-6 max-w-md text-xs leading-6 text-muted-foreground">{t.note}</p>
      <Button variant="outline" disabled className="mt-5 border-primary/30 text-muted-foreground" title={t.unavailable}>
        <Download className="size-4" />{t.download}
      </Button>
    </section>
  );
}