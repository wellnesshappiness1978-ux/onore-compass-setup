import { z } from 'zod';

/** New readings supply a concrete name; optional fields accept existing saved readings. */
export const monthlyLuckySchema = z.object({
  target_name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  action: z.string(),
  reason: z.string(),
  benefit: z.string(),
});
export type MonthlyLuckySource = z.infer<typeof monthlyLuckySchema>;
export type MonthlyLucky = { target_name: string; description: string };

/** Extract a complete phrase, never a character slice; keep the original prose below. */
export function legacyLuckyName(text: string): string {
  const opening = text.trim().split(/\n|(?<=[。！？.!?])\s*/u)[0] ?? '';
  const named = opening.match(/^(?:今月の(?:道具|アイテム|花|フラワー|行動|アクション)(?:は|には)[、\s]*)?(?:手元の)?(.+?)(?:です|をおすすめします|をお勧めします)[。！]?$/u);
  if (named?.[1]) return named[1].trim();
  const introduced = opening.match(/^(?:This month's (?:item|action|flower) is|The (?:item|action|flower) for this month is)\s+(.+?)[.!]?$/i);
  if (introduced?.[1]) return introduced[1].trim();
  // An explicit quoted target in an introductory sentence is safer than guessing a noun.
  const quoted = opening.match(/^(?:今月|おすすめ|ラッキー).*?[「『]([^」』]+)[」』]/u);
  if (quoted?.[1]) return quoted[1].trim();
  return opening.replace(/^(?:今月の(?:行動|アクション)(?:は|には)[、\s]*)/u, '').replace(/[。.!]$/u, '').trim();
}

export function monthlyLuckyValue(value: MonthlyLuckySource): MonthlyLucky {
  return {
    target_name: value.target_name?.trim() || legacyLuckyName(value.action),
    description: [value.description?.trim() || value.action.trim(), value.reason.trim(), value.benefit.trim()].filter(Boolean).join('\n\n'),
  };
}