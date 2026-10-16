import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getFiveElements } from "./five-elements";
import { computeCoreLayers, coreLayersPrompt } from "./core-layers";
import { supportiveWritingVoice } from "./writing-voice";
import { traitReadingPrompt } from "@/lib/trait-reading";

const inputSchema = z.object({
  profile: z.object({
    nameKanji: z.string().max(40), nameKana: z.string().max(60), nameRomaji: z.string().max(60),
    birthDate: z.string().date(), birthTime: z.string().max(20), birthTimeUnknown: z.boolean(),
    birthPlace: z.string().max(80), birthCity: z.string().max(80),
    gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
    bloodType: z.string().max(4), siblingOrder: z.string().max(20),
  }),
  language: z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]),
});
const quickSchema = z.object({
  catchphrase: z.string(),
  essence: z.object({ outward: z.string(), inner: z.string(), growth: z.string(), resilience: z.string(), relationships: z.string(), gift: z.string() }),
});

/** Fast first layer of the traits page: catchphrase + six essence passages only. */
export const generateQuickEssence = createServerFn({ method: "POST" })
  .validator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is unavailable");
    const { profile, language } = data;
    const elements = getFiveElements(profile);
    const core = coreLayersPrompt(computeCoreLayers(profile));
    const provider = createOpenAI({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, headers: { "Lovable-API-Key": apiKey } });
    const { output } = await generateText({
      model: provider.chat("google/gemini-3-flash-preview"),
      output: Output.object({ schema: quickSchema }),
      prompt: `Write in ${language}. Return only catchphrase and essence.
${supportiveWritingVoice}
Inputs (never recalculate or invent): sun sign ${elements.zodiac ?? "unknown"}; animal core ${elements.animal ?? "unavailable"}; name grid ${elements.name ? `person ${elements.name.person}, outer ${elements.name.outer}, total ${elements.name.total}` : "unavailable"}.
${core}
Keep specialist labels out of the prose.
${traitReadingPrompt}
Only catchphrase and essence are requested now; ignore rules for other fields.`,
    });
    return quickSchema.parse(output);
  });
