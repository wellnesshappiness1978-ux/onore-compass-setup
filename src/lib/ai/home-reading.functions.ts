import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { computeDivinationParams } from "./divination-params";

const profileSchema = z.object({
  nameKanji: z.string().max(40), nameKana: z.string().max(60), nameRomaji: z.string().max(60),
  birthDate: z.string().date(), birthTime: z.string().max(20), birthTimeUnknown: z.boolean(),
  birthPlace: z.string().max(80), birthCity: z.string().max(80),
  bloodType: z.string().max(4), siblingOrder: z.string().max(20),
});
const inputSchema = z.object({
  profile: profileSchema,
  language: z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]),
});
const readingSchema = z.object({
  perspective: z.string().min(15).max(400),
  selfCare: z.string().min(15).max(400),
  nextStep: z.string().min(15).max(400),
  identity: z.string().min(30).max(700),
  decisions: z.string().min(30).max(700),
  rhythm: z.string().min(30).max(700),
});

export const generateHomeReading = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is unavailable");
    const { profile, language } = data;
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1", apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = await generateText({
      model: provider.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: readingSchema }),
      prompt: `Write a personal, warmly uplifting REFLECTIVE PREVIEW in language ${language} for this profile. Generate exactly six distinct JSON fields matching the output schema. Do not include headings in the values.
Birth date: ${profile.birthDate}; birth time: ${profile.birthTimeUnknown ? "unknown" : profile.birthTime}; birthplace: ${profile.birthPlace}, ${profile.birthCity}; name: ${profile.nameKanji || "not supplied"} / ${profile.nameKana || "not supplied"} / ${profile.nameRomaji || "not supplied"}; blood type: ${profile.bloodType || "unknown"}; sibling order: ${profile.siblingOrder || "unknown"}. Today: ${new Date().toISOString().slice(0, 10)}.
Available computed reference values (some are approximations or interpretive mappings, NOT a validated 15-arts analysis):
${computeDivinationParams(profile)}

Write positively, specifically, and with human warmth, without predicting outcomes or claiming knowledge of the person's true character. Use at least two distinct available computed values naturally in the longer fields, cite numbers only when computed; do not invent correlations between name, birthplace, blood type, sibling order and personality. The name may be used to address the person, but cannot be treated as verified stroke-count analysis. Never invent missing chart placements, stroke counts, animal type or biorhythm readings. No claims of 15 verified arts, definitive destiny, guaranteed fortune, lucky days, exact future timing, or health outcomes. Treat Earth Calendar solar position and phase as astronomical/illustrative reflection, not a measured personal biorhythm or an objectively favorable date. If evidence is limited, acknowledge that gently within the prose, not with fabricated specificity. Do not repeat generic platitudes or reuse phrases across fields. Do not infer occupation.
perspective: ~50 Japanese characters (or equivalent in chosen language); suggest how a particular perspective can be used at home, study, or work.
selfCare: ~50 Japanese characters; a specific way to regain balance when a habit or obstacle appears, non-judgmental.
nextStep: ~50 Japanese characters; one immediately doable, encouraging action.
identity: ~100 Japanese characters; thoughtful possible core strengths and warmth, grounded in the actual birth-date number and at least one other available value; avoid asserting innate personality as fact.
decisions: ~100 Japanese characters; a possible choice-making tendency, how to handle it and one concrete example, grounded in the profile-derived values rather than stereotyping.
rhythm: ~100 Japanese characters; mention the current approximate solar phase/season if available, suggest when to prepare versus move using conditional language and practical near-term steps, never claim validated personal favorable timing.
Return only the structured object.`,
      providerOptions: { openai: { store: false } },
    });
    return readingSchema.parse(result.output);
  });
