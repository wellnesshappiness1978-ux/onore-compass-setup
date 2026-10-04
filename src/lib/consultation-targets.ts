import { z } from "zod";
import type { TeamMember } from "@/lib/team-analysis";

const memberSchema = z.object({ id: z.string().uuid(), name: z.string().trim().min(1).max(60), birthDate: z.string().date(), gender: z.enum(["female", "male", "other", "undisclosed"]), bloodType: z.enum(["", "A", "B", "O", "AB"]), role: z.string().max(60), skills: z.array(z.string().max(30)).max(12) });
export function readPreviewMembers(): TeamMember[] {
  if (typeof window === "undefined") return [];
  try { return z.array(memberSchema).max(100).parse(JSON.parse(localStorage.getItem("onore-team") ?? "[]")); } catch { return []; }
}
