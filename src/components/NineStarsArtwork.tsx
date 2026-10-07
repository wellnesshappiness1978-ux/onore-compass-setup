import type { Language } from "@/lib/translations";

// Traditional fixed Lo Shu arrangement. This is NOT a computed natal nine-star chart.
export const palaceGrid = [4, 9, 2, 3, 5, 7, 8, 1, 6] as const;

export const zodiacGlyphs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const zodiacStarts = [120, 219, 321, 420, 521, 622, 723, 823, 923, 1024, 1123, 1222];
const zodiacFor = (month: number, day: number) => {
  const value = month * 100 + day;
  return value < 120 ? 9 : zodiacStarts.reduce((idx, start, i) => value >= start ? (i + 9) % 12 : idx, 9);
};

export function getArtSymbols(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const valid = new Date(Date.UTC(year, month - 1, day));
  if (valid.getUTCFullYear() !== year || valid.getUTCMonth() !== month - 1 || valid.getUTCDate() !== day) return null;
  return { zodiac: zodiacFor(month, day), animal: ((year - 4) % 12 + 12) % 12 };
}

type ArtProps = { main: string; sub: string; bloodType: string; birthDate: string; language: Language };

export function NineStarsArtwork({ main, sub, bloodType, birthDate, language }: ArtProps) {
  const symbols = getArtSymbols(birthDate);
  const lifeNumber = birthDate.replace(/\D/g, "").split("").reduce((sum, digit) => sum + Number(digit), 0);
  const motif = bloodType === "A" ? 3 : bloodType === "B" ? 5 : bloodType === "AB" ? 7 : 4;
  const labels: Record<Language, { alt: string; atlas: string; reference: string }> = {
    ja: { alt: "九星の伝統的な固定配置例を描いた装飾アート。出生時の配置ではありません", atlas: "AGOLMEN · 天球図鑑", reference: "九星固定配置 · 参考図" },
    en: { alt: "Decorative traditional Nine Star reference grid, not a natal chart", atlas: "AGOLMEN · CELESTIAL ATLAS", reference: "NINE STAR REFERENCE · ILLUSTRATION" },
    "zh-CN": { alt: "传统九星固定配置的装饰艺术，并非出生星盘", atlas: "AGOLMEN · 天球图鉴", reference: "九星固定配置 · 参考图" },
    "zh-TW": { alt: "傳統九星固定配置的裝飾藝術，並非出生星盤", atlas: "AGOLMEN · 天球圖鑑", reference: "九星固定配置 · 參考圖" },
    ko: { alt: "전통 구성의 고정 배치를 그린 장식 작품이며 출생 차트가 아닙니다", atlas: "AGOLMEN · 천구 도감", reference: "구성 고정 배치 · 참고 그림" },
    es: { alt: "Arte decorativo con la disposición tradicional fija de las nueve estrellas; no es una carta natal", atlas: "AGOLMEN · ATLAS CELESTE", reference: "NUEVE ESTRELLAS · ILUSTRACIÓN" },
    fr: { alt: "Œuvre décorative montrant la disposition traditionnelle fixe des neuf étoiles, et non un thème natal", atlas: "AGOLMEN · ATLAS CÉLESTE", reference: "NEUF ÉTOILES · ILLUSTRATION" },
  };
  const text = labels[language];
  const stars = Array.from({ length: 170 }, (_, i) => {
    const x = (i * 379 + (i * i * 13) % 103) % 800;
    const y = (i * 233 + (i * i * 17) % 127) % 800;
    return { x, y, size: i % 19 === 0 ? 1.8 : i % 4 === 0 ? 1.1 : .55 };
  });
  return (
    <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={text.alt} className="block h-full w-full">
      <defs>
        <radialGradient id="sky"><stop stopColor="var(--art-midnight)"/><stop offset=".48" stopColor="var(--art-void)"/><stop offset="1" stopColor="var(--art-void)"/></radialGradient>
        <radialGradient id="auraA"><stop stopColor={main} stopOpacity=".9"/><stop offset="1" stopColor={main} stopOpacity="0"/></radialGradient>
        <radialGradient id="auraB"><stop stopColor={sub} stopOpacity=".8"/><stop offset="1" stopColor={sub} stopOpacity="0"/></radialGradient>
        <linearGradient id="veins" x1="0" y1="0" x2="1" y2="1"><stop stopColor={main}/><stop offset=".35" stopColor="var(--gold-glow)"/><stop offset=".7" stopColor={sub}/><stop offset="1" stopColor="var(--primary)"/></linearGradient>
        <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--art-emerald)"/><stop offset=".48" stopColor="var(--art-rose)"/><stop offset="1" stopColor="var(--art-coral)"/></linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="24"/></filter>
        <filter id="light"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="800" height="800" fill="url(#sky)" />
      <circle cx="265" cy="255" r="290" fill="url(#auraA)" opacity=".38" filter="url(#soft)" />
      <circle cx="550" cy="536" r="280" fill="url(#auraB)" opacity=".45" filter="url(#soft)" />
      <path d="M140 475 Q260 600 402 525 T660 367 M160 260 Q330 164 435 245 T640 310" fill="none" stroke="url(#spectrum)" strokeWidth="16" opacity=".22" filter="url(#soft)"/>
      <g fill="var(--gold-glow)">{stars.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.size} opacity={i % 5 === 0 ? .72 : .28}/>)}</g>
      <g fill="none" stroke="url(#veins)" strokeWidth="1">
        <circle cx="400" cy="400" r="366" opacity=".46"/><circle cx="400" cy="400" r="356" opacity=".18"/>
        <circle cx="400" cy="400" r="338" opacity=".55" strokeDasharray="1 8"/><circle cx="400" cy="400" r="312" opacity=".38"/>
        <circle cx="400" cy="400" r="288" opacity=".72"/><circle cx="400" cy="400" r="264" opacity=".25"/>
        <path d="M400 94 L706 400 L400 706 L94 400 Z" opacity=".42"/>
        <path d="M400 112 L650 545 L150 545 Z M400 688 L150 255 L650 255 Z" opacity=".45"/>
        <path d="M400 112 V688 M112 400 H688 M187 187 L613 613 M613 187 L187 613" opacity=".22" />
        {Array.from({ length: 48 }, (_, i) => {
          const angle = i * Math.PI / 24;
          return <path key={i} d={`M ${400 + Math.cos(angle) * 347} ${400 + Math.sin(angle) * 347} L ${400 + Math.cos(angle) * (i % 4 === 0 ? 362 : 353)} ${400 + Math.sin(angle) * (i % 4 === 0 ? 362 : 353)}`} opacity={i % 4 === 0 ? .8 : .3}/>;
        })}
      </g>
      <path d={`M 106 ${352 - motif * 3} Q 260 ${295 + motif * 12} 400 355 T 694 ${355 + motif * 5} M 106 ${460 + motif * 3} Q 300 ${545 - motif * 11} 400 470 T 694 ${435 - motif * 3}`} fill="none" stroke={sub} strokeWidth="2" opacity=".42" filter="url(#light)"/>
      <g transform="translate(400 400) rotate(45)" fill="none" stroke="url(#veins)" opacity=".73"><rect x="-177" y="-177" width="354" height="354" strokeWidth="1.5"/><rect x="-186" y="-186" width="372" height="372" opacity=".3"/></g>
      <g fill="none" stroke="url(#spectrum)" opacity=".5"><path d="M220 220 L400 138 L580 220 M220 580 L400 662 L580 580"/><circle cx="400" cy="138" r="3"/><circle cx="400" cy="662" r="3"/></g>
      <g transform="translate(220 220)">
        <rect width="360" height="360" fill="var(--art-void)" fillOpacity=".76" stroke="url(#veins)" strokeWidth="2"/>
        <path d="M120 0V360 M240 0V360 M0 120H360 M0 240H360" stroke="url(#veins)" opacity=".8"/>
        {palaceGrid.map((number, i) => {
          const x = 60 + (i % 3) * 120;
          const y = 60 + Math.floor(i / 3) * 120;
          return <g key={number}>
            <circle cx={x} cy={y} r={i === 4 ? 38 : 31} fill="none" stroke={i === 4 ? main : sub} strokeOpacity={i === 4 ? .8 : .35}/>
            <circle cx={x} cy={y} r="26" fill={i === 4 ? main : sub} fillOpacity=".07"/>
            <text x={x} y={y + 10} textAnchor="middle" fill={i === 4 ? main : "var(--gold-glow)"} fontSize={i === 4 ? 34 : 30} fontFamily="serif">{number}</text>
            <circle cx={x - 39} cy={y - 39} r="1.5" fill="var(--gold-glow)"/>
          </g>;
        })}
      </g>
      <g fill="var(--gold-glow)" fontFamily="serif" textAnchor="middle">
        <text x="400" y="167" fontSize="24" opacity=".9">{symbols ? zodiacGlyphs[symbols.zodiac] : "✦"}</text>
        <text x="400" y="656" fontSize="20" opacity=".9">{symbols ? symbols.animal + 1 : "✧"}</text>
        <text x="146" y="405" fontSize="15" opacity=".7">{bloodType || "✧"}</text>
        <text x="655" y="405" fontSize="15" opacity=".7">{birthDate ? String(lifeNumber).padStart(2, "0") : "✧"}</text>
        <text x="400" y="72" fontSize="11" letterSpacing="4" opacity=".7">{text.atlas}</text>
        <text x="400" y="746" fontSize="11" letterSpacing="2" opacity=".8">{text.reference}</text>
      </g>
    </svg>
  );
}