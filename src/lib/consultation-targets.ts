import { z } from "zod";
import type { TeamMember } from "@/lib/team-analysis";

const memberSchema = z.object({
  id: z.string().uuid(), name: z.string().trim().min(1).max(60), nickname: z.string().max(40).catch(""), nameKana: z.string().max(60).catch(""),
  birthDate: z.string().date(), birthTime: z.string().max(5).catch(""), birthTimeUnknown: z.boolean().catch(true),
  birthPlace: z.string().max(80).catch(""), birthCity: z.string().max(80).catch(""),
  siblingOrder: z.string().max(40).catch(""),
  gender: z.enum(["female", "male", "other", "undisclosed"]), bloodType: z.enum(["", "A", "B", "O", "AB"]),
  relationship: z.string().max(60).catch(""), relationshipType: z.string().max(30).catch(""),
  role: z.string().max(60).catch(""), skills: z.array(z.string().max(30)).max(12).catch([]),
});
export function readPreviewMembers(): TeamMember[] {
  if (typeof window === "undefined") return [];
  try { const raw: unknown = JSON.parse(localStorage.getItem("onore-team") ?? "[]"); return (Array.isArray(raw) ? raw : []).slice(0, 100).flatMap(item => { const r = memberSchema.safeParse(item); return r.success ? [r.data as TeamMember] : []; }); } catch { return []; }
}
