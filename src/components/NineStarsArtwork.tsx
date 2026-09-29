import type { Language } from "@/lib/translations";

// Traditional fixed Lo Shu arrangement. This is NOT a computed natal nine-star chart.
export const palaceGrid = [
  { direction: "巽", star: "四緑木星", number: 4 }, { direction: "離", star: "九紫火星", number: 9 }, { direction: "坤", star: "二黒土星", number: 2 },
  { direction: "震", star: "三碧木星", number: 3 }, { direction: "中宮", star: "五黄土星", number: 5 }, { direction: "兌", star: "七赤金星", number: 7 },
  { direction: "艮", star: "八白土星", number: 8 }, { direction: "坎", star: "一白水星", number: 1 }, { direction: "乾", star: "六白金星", number: 6 },
];

export const zodiacGlyphs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
export const zodiacNames = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
const zodiacStarts = [321, 420, 521, 622, 723, 823, 923, 1024, 1123, 1222];
const zodiacFor = (month: number, day: number) => {
  const value = month * 100 + day;
  return value < zodiacStarts[0] ? 11 : zodiacStarts.reduce((idx, start, i) => value >= start ? i : idx, 0);
};
export const animalNames = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

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
  const isJapanese = language === "ja";
  const stars = Array.from({ length: 170 }, (_, i) => {
    const x = (i * 379 + (i * i * 13) % 103) % 800;
    const y = (i * 233 + (i * i * 17) % 127) % 800;
    return { x, y, size: i % 19 === 0 ? 1.8 : i % 4 === 0 ? 1.1 : .55 };
  });
  return (
    <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={isJapanese ? "九星の伝統的な固定配置例を描いた装飾アート。出生時の配置ではありません" : "Decorative traditional nine-star reference grid, not a natal chart"} className="block h-full w-full">
      <defs>
        <radialGradient id="sky"><stop stopColor="var(--celestial-ink)"/><stop offset=".48" stopColor="var(--background)"/><stop offset="1" stopColor="var(--background)"/></radialGradient>
        <radialGradient id="auraA"><stop stopColor={main} stopOpacity=".9"/><stop offset="1" stopColor={main} stopOpacity="0"/></radialGradient>
        <radialGradient id="auraB"><stop stopColor={sub} stopOpacity=".8"/><stop offset="1" stopColor={sub} stopOpacity="0"/></radialGradient>
        <linearGradient id="veins" x1="0" y1="0" x2="1" y2="1"><stop stopColor={main}/><stop offset=".35" stopColor="var(--gold-glow)"/><stop offset=".7" stopColor={sub}/><stop offset="1" stopColor="var(--primary)"/></linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="24"/></filter>
        <filter id="light"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="800" height="800" fill="url(#sky)" />
      <circle cx="265" cy="255" r="290" fill="url(#auraA)" opacity=".38" filter="url(#soft)" />
      <circle cx="550" cy="536" r="280" fill="url(#auraB)" opacity=".45" filter="url(#soft)" />
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
      <g transform="translate(220 220)">
        <rect width="360" height="360" fill="var(--background)" fillOpacity=".76" stroke="url(#veins)" strokeWidth="2"/>
        <path d="M120 0V360 M240 0V360 M0 120H360 M0 240H360" stroke="url(#veins)" opacity=".8"/>
        {palaceGrid.map((cell, i) => {
          const x = 60 + (i % 3) * 120;
          const y = 60 + Math.floor(i / 3) * 120;
          return <g key={cell.number}>
            <circle cx={x} cy={y} r={i === 4 ? 38 : 31} fill="none" stroke={i === 4 ? main : sub} strokeOpacity={i === 4 ? .8 : .35}/>
            <circle cx={x} cy={y} r="26" fill={i === 4 ? main : sub} fillOpacity=".07"/>
            <text x={x} y={y + 10} textAnchor="middle" fill={i === 4 ? main : "var(--gold-glow)"} fontSize={i === 4 ? 34 : 30} fontFamily="serif">{cell.number}</text>
            <circle cx={x - 39} cy={y - 39} r="1.5" fill="var(--gold-glow)"/>
          </g>;
        })}
      </g>
      <g fill="var(--gold-glow)" fontFamily="serif" textAnchor="middle">
        <text x="400" y="167" fontSize="24" opacity=".9">{symbols ? zodiacGlyphs[symbols.zodiac] : "✦"}</text>
        <text x="400" y="656" fontSize="20" opacity=".9">{symbols ? animalNames[symbols.animal] : "✧"}</text>
        <text x="146" y="405" fontSize="15" opacity=".7">{bloodType || "✧"}</text>
        <text x="655" y="405" fontSize="15" opacity=".7">{birthDate ? String(lifeNumber).padStart(2, "0") : "✧"}</text>
        <text x="400" y="72" fontSize="11" letterSpacing="4" opacity=".7">ONORE · CELESTIAL ATLAS</text>
        <text x="400" y="746" fontSize="11" letterSpacing="2" opacity=".8">{isJapanese ? "九星固定配置 · 参考図" : "NINE STAR REFERENCE · ILLUSTRATION"}</text>
      </g>
    </svg>
  );
}