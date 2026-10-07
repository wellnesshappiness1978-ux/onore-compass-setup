// Deterministic, illustrative team analytics derived from birth dates.
// These are reference values for reflection — NOT verified multi-layer readings.

export type TeamMember = {
  id: string;
  name: string;
  nameKana?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string;
  birthTimeUnknown?: boolean;
  birthPlace?: string;
  birthCity?: string;
  siblingOrder?: string;
  gender: string;
  bloodType: string;
  relationship?: string;
  relationshipType?: string;
  role: string;
  skills: string[];
};

export type TeamRole = "leader" | "coordinator" | "mood" | "checker" | "ideator" | "strategist" | "executor";
export const teamRoles: TeamRole[] = ["leader", "coordinator", "mood", "checker", "ideator", "strategist", "executor"];
export type Element = "wood" | "fire" | "earth" | "metal" | "water";
export const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];

const DAY = 86_400_000;
const toUtc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y ?? 2000, (m ?? 1) - 1, d ?? 1);
};
const daysBetween = (a: string, b: string) => Math.round((toUtc(b) - toUtc(a)) / DAY);
const digitSum = (n: number) => String(n).split("").reduce((s, c) => s + Number(c), 0);

export function lifePath(birthDate: string) {
  let n = digitSum(Number(birthDate.replace(/-/g, "")));
  while (n > 9) n = digitSum(n);
  return n || 9;
}

/** Day stem element (1900-01-01 = 甲 day). */
export function dayElement(date: string): Element {
  const stem = ((daysBetween("1900-01-01", date) % 10) + 10) % 10;
  return elements[Math.floor(stem / 2)]!;
}

const roleByNumber: Record<number, TeamRole> = { 1: "leader", 2: "coordinator", 3: "mood", 4: "checker", 5: "ideator", 6: "coordinator", 7: "strategist", 8: "executor", 9: "ideator" };
export const roleOf = (m: Pick<TeamMember, "birthDate">) => roleByNumber[lifePath(m.birthDate)] ?? "coordinator";

// x: logic(-1) ↔ empathy(+1); y: plan(-1) ↔ action(+1)
const roleXY: Record<TeamRole, [number, number]> = {
  leader: [0.1, 0.8], coordinator: [0.7, -0.1], mood: [0.8, 0.6], checker: [-0.7, -0.7],
  ideator: [0.3, 0.3], strategist: [-0.8, -0.3], executor: [-0.3, 0.7],
};
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export function matrixPoint(m: TeamMember): [number, number] {
  const [x, y] = roleXY[roleOf(m)];
  const h = hash(m.id + m.birthDate);
  return [x + ((h % 21) - 10) / 60, y + (((h >> 5) % 21) - 10) / 60];
}

const gen: Record<Element, Element> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
const ctl: Record<Element, Element> = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };
export type Relation = "generate" | "same" | "control" | "neutral";
export function relation(a: TeamMember, b: TeamMember): Relation {
  const ea = dayElement(a.birthDate), eb = dayElement(b.birthDate);
  if (ea === eb) return "same";
  if (gen[ea] === eb || gen[eb] === ea) return "generate";
  if (ctl[ea] === eb || ctl[eb] === ea) return "control";
  return "neutral";
}
export function pairScore(a: TeamMember, b: TeamMember) {
  const rel = relation(a, b);
  const base = { generate: 82, same: 70, neutral: 64, control: 48 }[rel];
  const diff = Math.abs(lifePath(a.birthDate) - lifePath(b.birthDate));
  return Math.max(20, Math.min(98, base + (diff === 0 ? 4 : diff <= 2 ? 6 : diff >= 6 ? -6 : 0)));
}

export function biorhythm(birthDate: string, on: string) {
  const d = daysBetween(birthDate, on);
  const wave = (p: number) => Math.sin((2 * Math.PI * d) / p);
  const physical = wave(23), emotional = wave(28), intellectual = wave(33);
  return { physical, emotional, intellectual, total: Math.round(((physical + emotional + intellectual) / 3 + 1) * 50) };
}
export const todayIso = () => new Date().toISOString().slice(0, 10);

export function teamDiagnosis(members: TeamMember[]) {
  const pairs: { a: TeamMember; b: TeamMember; score: number; rel: Relation }[] = [];
  for (let i = 0; i < members.length; i++)
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i]!, b = members[j]!;
      pairs.push({ a, b, score: pairScore(a, b), rel: relation(a, b) });
    }
  const avg = pairs.length ? pairs.reduce((s, p) => s + p.score, 0) / pairs.length : 0;
  const roleSet = new Set(members.map(roleOf));
  const diversity = members.length ? roleSet.size / Math.min(members.length, teamRoles.length) : 0;
  const total = Math.round(avg * 0.75 + diversity * 25);
  const sorted = [...pairs].sort((x, y) => y.score - x.score);
  return {
    total,
    synergies: sorted.filter((p) => p.rel === "generate" || p.score >= 75).slice(0, 4),
    conflicts: sorted.filter((p) => p.rel === "control").reverse().slice(0, 4),
    pairs,
  };
}

export function orgBalance(members: TeamMember[]) {
  const roleCount = Object.fromEntries(teamRoles.map((r) => [r, 0])) as Record<TeamRole, number>;
  const elementCount = Object.fromEntries(elements.map((e) => [e, 0])) as Record<Element, number>;
  members.forEach((m) => { roleCount[roleOf(m)]++; elementCount[dayElement(m.birthDate)]++; });
  const missing = teamRoles.filter((r) => roleCount[r] === 0);
  const excess = members.length >= 4 ? teamRoles.filter((r) => roleCount[r] / members.length > 0.35) : [];
  const weakElements = elements.filter((e) => elementCount[e] === 0);
  return { roleCount, elementCount, missing, excess, weakElements, target: missing[0] ?? teamRoles.reduce((a, b) => (roleCount[a] <= roleCount[b] ? a : b)) };
}

export type Purpose = "negotiation" | "contract" | "interview" | "oneOnOne";
export const purposes: Purpose[] = ["negotiation", "contract", "interview", "oneOnOne"];
const purposeWeights: Record<Purpose, [number, number, number]> = {
  negotiation: [0.3, 0.3, 0.4], contract: [0.2, 0.2, 0.6], interview: [0.2, 0.5, 0.3], oneOnOne: [0.1, 0.7, 0.2],
};
/** Day score (0-100) for the owner + optional members for a given purpose. */
export function dayScore(purpose: Purpose, date: string, birthDates: string[]) {
  if (!birthDates.length) return 50;
  const [wp, we, wi] = purposeWeights[purpose];
  const v = birthDates.reduce((s, b) => {
    const r = biorhythm(b, date);
    return s + r.physical * wp + r.emotional * we + r.intellectual * wi;
  }, 0) / birthDates.length;
  const el = dayElement(date);
  const bonus = birthDates.some((b) => gen[dayElement(b)] === el) ? 6 : birthDates.some((b) => ctl[el] === dayElement(b)) ? -6 : 0;
  return Math.max(0, Math.min(100, Math.round((v + 1) * 50 + bonus)));
}
