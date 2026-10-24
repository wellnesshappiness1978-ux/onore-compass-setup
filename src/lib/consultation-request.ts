import { z } from "zod";
import { groupMemberSchema } from "./group-context";
import { readingProfileSchema } from './profile-reading-context';

/** Only the selected/entered goal belongs here; roster data belongs in group. */
export const consultationGoal = (goal: string): string | undefined =>
  goal.trim().slice(0, 240) || undefined;

const personSchema = z.object({
  nameKanji: z.string().max(60).optional().default(""),
  nameKana: z.string().max(60).optional().default(""),
  nameRomaji: z.string().max(60).optional().default(""),
  birthCity: z.string().max(80).optional().default(""),
  birthDate: z.string().date(),
  birthTime: z.string().max(20),
  birthTimeUnknown: z.boolean(),
  birthPlace: z.string().max(80),
  bloodType: z.string().max(4),
  siblingOrder: z.string().max(80),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  father: readingProfileSchema.shape.father,
  mother: readingProfileSchema.shape.mother,
});

export const consultationRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1),
  profile: personSchema,
  ownerProfile: personSchema.optional(),
  targetLabel: z.string().trim().max(60).optional(),
  goal: z.string().trim().max(240).optional(),
  language: z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]),
  day: z.string().date().optional(),
  group: z.object({ name: z.string().trim().max(60), members: z.array(groupMemberSchema).max(101) }).optional(),
});