import { z } from "zod";
import type { TeamMember } from "@/lib/team-analysis";

const memberSchema = z.object({
  id: z.string().uuid(), name: z.string().trim().min(1).max(60), nameKana: z.string().max(60).catch(""),
  birthDate: z.string().date(), birthTime: z.string().max(5).catch(""), birthTimeUnknown: z.boolean().catch(true),
  birthPlace: z.string().max(80).catch(""), birthCity: z.string().max(80).catch(""),
  gender: z.enum(["female", "male", "other", "undisclosed"]), bloodType: z.enum(["", "A", "B", "O", "AB"]),
  relationship: z.string().max(60).catch(""), relationshipType: z.string().max(30).catch(""),
  role: z.string().max(60), skills: z.array(z.string().max(30)).max(12),
});
export function readPreviewMembers(): TeamMember[] {
  if (typeof window === "undefined") return [];
  try { return z.array(memberSchema).max(100).parse(JSON.parse(localStorage.getItem("onore-team") ?? "[]")); } catch { return []; }
}
