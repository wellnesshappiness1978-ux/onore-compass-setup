import { z } from "zod";
import { readingProfileSchema } from "./profile-reading-context";

/** Shared (client + server) contract for the AI "Today's fortune" reading. */
export const todayMemberSchema = readingProfileSchema.extend({
  relationship: z.string().max(60).optional().default(""),
  relationshipType: z.string().max(30).optional().default(""),
});
export const todayFortuneRequestSchema = z.object({
  language: z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]),
  day: z.string().date(),
  goal: z.string().max(240).optional().default(""),
  subject: z.object({ kind: z.enum(["self", "member", "group"]), key: z.string().max(80), label: z.string().trim().max(80) }),
  members: z.array(todayMemberSchema).min(1).max(30),
  avoid: z.object({
    colors: z.array(z.string().max(40)).max(30).default([]),
    words: z.array(z.string().max(120)).max(30).default([]),
    foods: z.array(z.string().max(80)).max(60).default([]),
  }).default({ colors: [], words: [], foods: [] }),
});
export type TodayFortuneRequest = z.input<typeof todayFortuneRequestSchema>;

const amount = z.object({ item: z.string(), amount: z.string() });
export const todayFortuneSchema = z.object({
  headline: z.string(),
  insight: z.string(),
  dynamics: z.string(),
  actions: z.array(z.string()),
  caution: z.string(),
  luckyColor: z.object({ name: z.string(), hex: z.string(), reason: z.string() }),
  luckyWord: z.object({ word: z.string(), message: z.string() }),
  foods: z.array(z.object({
    name: z.string(), why: z.string(), servings: z.string(),
    ingredients: z.array(amount), seasonings: z.array(amount),
    steps: z.array(z.object({ text: z.string(), tip: z.string() })),
  })),
});
export type TodayFortune = z.infer<typeof todayFortuneSchema>;

/** FNV-1a hash → stable daily seed for one subject on one date. */
export function daySeed(key: string, day: string): number {
  let h = 2166136261;
  for (const c of `${key}|${day}`) { h ^= c.codePointAt(0)!; h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const angles = [
  "the hidden question behind today's hesitation", "one habit quietly draining energy", "a relationship signal worth noticing",
  "what to stop doing today", "a small courage that changes the week", "the truth beneath a recurring worry",
  "how to receive help today", "turning a weakness into today's tool", "a decision best postponed vs. one to make now",
  "what the body is asking for", "a forgotten original intention", "where to put attention for the next 24 hours",
];
/** Deterministic daily angle so consecutive days never share the same framing. */
export const dailyAngle = (key: string, day: string) => angles[daySeed(key, day) % angles.length]!;

/** Normalise model output: exactly the first five complete foods, valid hex color. */
export function normalizeFortune(f: TodayFortune): TodayFortune {
  const hex = /^#[0-9a-f]{6}$/i.test(f.luckyColor.hex.trim()) ? f.luckyColor.hex.trim().toUpperCase() : "#D4AF37";
  return {
    ...f,
    actions: f.actions.filter(Boolean).slice(0, 4),
    luckyColor: { ...f.luckyColor, hex },
    foods: f.foods.filter(x => x.name && x.ingredients.length && x.steps.length).slice(0, 5),
  };
}

const HISTORY_KEY = "onore-today-ai-history";
type HistoryEntry = { key: string; day: string; color: string; word: string; foods: string[] };
export const cacheKey = (r: { subject: { key: string }; day: string; language: string; goal?: string }) => `onore-today-ai:${r.subject.key}:${r.day}:${r.language}:${daySeed(r.goal ?? "", "")}`;

/** Recent picks to avoid: same subject's colors/words, every subject's foods, last 7 days excluding today. */
export function avoidFromHistory(history: HistoryEntry[], key: string, day: string) {
  const since = new Date(`${day}T00:00:00Z`).getTime() - 7 * 864e5;
  const recent = history.filter(h => h.day !== day && new Date(`${h.day}T00:00:00Z`).getTime() >= since);
  const mine = recent.filter(h => h.key === key);
  return { colors: [...new Set(mine.map(h => h.color))].slice(0, 30), words: [...new Set(mine.map(h => h.word))].slice(0, 30), foods: [...new Set(recent.flatMap(h => h.foods))].slice(0, 60) };
}
export function readHistory(): HistoryEntry[] {
  try { const v: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); return Array.isArray(v) ? v as HistoryEntry[] : []; } catch { return []; }
}
export function pushHistory(key: string, day: string, f: TodayFortune) {
  const next = [{ key, day, color: f.luckyColor.name, word: f.luckyWord.word, foods: f.foods.map(x => x.name) }, ...readHistory().filter(h => !(h.key === key && h.day === day))].slice(0, 60);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* storage full */ }
}
