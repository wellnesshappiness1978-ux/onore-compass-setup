import { createServerFn } from "@tanstack/react-start";
import { readingProfileSchema, readingSubjectSchema } from "../profile-reading-context";
import { z } from "zod";
const inputSchema = z.object({ profile: readingProfileSchema, language: z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]), goal: z.string().max(240).optional(), subject: readingSubjectSchema.optional() });
export const generateQuickEssence = createServerFn({ method: "POST" }).inputValidator((input: unknown) => inputSchema.parse(input)).handler(async ({ data }) => {
  const { runReading } = await import("./quick-essence.server");
  return runReading(data);
});
