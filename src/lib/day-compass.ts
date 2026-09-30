// Deterministic, illustrative day-compass values. Reference values only — not verified readings.
import { biorhythm, dayElement, dayScore, lifePath, type Element } from "./team-analysis";

export const pad = (n: number) => String(n).padStart(2, "0");
export const localIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const daysInYear = (y: number) => (new Date(y, 1, 29).getMonth() === 1 ? 366 : 365);
export const dayOfYear = (d: Date) => Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 1)) / 86_400_000);
export const dateAt = (year: number, index: number) => new Date(year, 0, 1 + index);

export type Direction = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
export const directions: Direction[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
/** Screen angle in degrees (0 = top, clockwise) to one of eight directions. */
export const directionAt = (deg: number): Direction => directions[Math.round((((deg % 360) + 360) % 360) / 45) % 8]!;

const dirElement: Record<Direction, Element> = { N: "water", NE: "earth", E: "wood", SE: "wood", S: "fire", SW: "earth", W: "metal", NW: "metal" };
const gen: Record<Element, Element> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
const ctl: Record<Element, Element> = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };

/** Zodiac start days (month, day) with glyph. */
export const zodiacSigns = [
  { glyph: "♈", m: 3, d: 21 }, { glyph: "♉", m: 4, d: 20 }, { glyph: "♊", m: 5, d: 21 }, { glyph: "♋", m: 6, d: 22 },
  { glyph: "♌", m: 7, d: 23 }, { glyph: "♍", m: 8, d: 23 }, { glyph: "♎", m: 9, d: 23 }, { glyph: "♏", m: 10, d: 24 },
  { glyph: "♐", m: 11, d: 23 }, { glyph: "♑", m: 12, d: 22 }, { glyph: "♒", m: 1, d: 20 }, { glyph: "♓", m: 2, d: 19 },
] as const;
const signStarts = zodiacSigns.map((s, i) => ({ i, v: s.m * 100 + s.d })).sort((a, b) => a.v - b.v);
export const signIndexOf = (d: Date) => {
  const md = (d.getMonth() + 1) * 100 + d.getDate();
  let idx = signStarts[signStarts.length - 1]!.i;
  for (const s of signStarts) if (md >= s.v) idx = s.i;
  return idx;
};

export function dayProfile(date: Date) {
  const iso = localIso(date);
  const doy = dayOfYear(date);
  const total = daysInYear(date.getFullYear());
  const season = Math.floor(((doy + 10) % total) / (total / 24)); // ~24 solar-term segments from winter solstice
  return { iso, element: dayElement(iso), doy, total, yearProgress: (doy + 1) / total, season, sign: signIndexOf(date) };
}

export function personal(birthDate: string, date: Date) {
  const iso = localIso(date);
  const r = biorhythm(birthDate, iso);
  const mine = dayElement(birthDate);
  const today = dayElement(iso);
  const rel = mine === today ? "same" : gen[today] === mine ? "support" : gen[mine] === today ? "give" : ctl[today] === mine ? "pressure" : "lead";
  return { ...r, lifePath: lifePath(birthDate), mine, rel } as const;
}

export function directionEnergy(birthDate: string, date: Date) {
  const mine = birthDate ? dayElement(birthDate) : dayElement(localIso(date));
  const today = dayElement(localIso(date));
  return directions.map((dir) => {
    const e = dirElement[dir];
    let score = 55;
    if (gen[e] === mine) score += 25;
    if (e === mine) score += 10;
    if (gen[today] === e) score += 8;
    if (ctl[e] === mine) score -= 22;
    return { dir, element: e, score: Math.max(10, Math.min(98, score)) };
  });
}

export type Phase = "attack" | "defend" | "newBiz" | "contract";
/** Twelve-month business roadmap from the owner's birth date (reference values). */
export function roadmap(birthDate: string, year: number) {
  const months = Array.from({ length: 12 }, (_, m) => {
    const days = new Date(year, m + 1, 0).getDate();
    const avg = (p: Parameters<typeof dayScore>[0]) => {
      let s = 0;
      for (let d = 1; d <= days; d += 3) s += dayScore(p, `${year}-${pad(m + 1)}-${pad(d)}`, [birthDate]);
      return s / Math.ceil(days / 3);
    };
    return { negotiation: avg("negotiation"), contract: avg("contract"), interview: avg("interview") };
  });
  const rank = (key: keyof (typeof months)[number], top: boolean) =>
    months.map((v, i) => ({ i, v: v[key] })).sort((a, b) => (top ? b.v - a.v : a.v - b.v)).slice(0, 3).map((x) => x.i);
  return {
    attack: rank("negotiation", true),
    defend: rank("negotiation", false),
    newBiz: rank("interview", true),
    contract: rank("contract", true),
  } satisfies Record<Phase, number[]>;
}
