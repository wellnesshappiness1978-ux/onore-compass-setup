import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getFiveElements } from "./five-elements";

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
  synthesis: z.string().min(60).max(1100),
  name: z.string().min(30).max(750),
  mind: z.string().min(30).max(750),
  instinct: z.string().min(30).max(750),
  strength: z.string().min(30).max(750),
});

export const generateHomeReading = createServerFn({ method: "POST" })
  .validator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is unavailable");
    const { profile, language } = data;
    const elements = getFiveElements(profile);
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1", apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = await generateText({
      model: provider.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: readingSchema }),
      prompt: `Write a vivid, personal five-layer INTERPRETIVE reading in ${language}. Return exactly the five fields in the schema; no headings in field values. This is available in FULL to every user including free users. No paywall or upsell in the reading.

Use ONLY these precomputed inputs (not unverified chart placements or invented stroke counts):
Name character grid: ${elements.name ? `天格 ${elements.name.sky} / 人格 ${elements.name.person} / 地格 ${elements.name.earth} / 総格 ${elements.name.total} (modern Unihan stroke convention; surname/given name separated by a space)` : "not computable: needs a two-part, space-separated kanji name with supported characters"}.
Western sun sign: ${elements.zodiac ?? "unknown"}${elements.zodiacBoundary ? " (near sign boundary; date-only conventional sign, exact astronomical sign unverified)" : ""}.
Yearly zodiac branch: ${elements.eto ?? "uncertain/unknown near year boundary"} (traditional year starts around 立春; boundary dates are not asserted).
Blood type: ${elements.blood ?? "not provided"} (no scientifically established personality inference).
Animal character: ${elements.animal ?? "unavailable"} (reference 60-day-number mapping, not an official licensed animal-personality diagnosis). Date: ${profile.birthDate}.

The five axes are storytelling lenses, not proof of personality, social luck, success, instincts, or emotional traits. Never present blood type as a scientific predictor. Avoid saying you know their true nature or fate; use vivid conditional language that still feels intimate. Do not infer facts about their job or relationships. State precisely when a lens is unavailable and use the remaining computed lenses; do not invent substitutions. Do not claim all five were combined when one or more are unavailable. Use concrete human-scale contrasts and examples, not generic praise, vague abstractions or interchangeable fortunes. Distinguish the numbers/categories (computed) from interpretation (creative). No predictions, guaranteed outcomes, health advice or verified 15-arts claims. Do not include disclaimers, methodological notes, or the word "creative" inside the five passages; the interface separately states those limits. Keep prose emotionally direct while still conditional, and mention unavailable axes only when relevant.

synthesis: about 150 Japanese characters (equivalent depth in other languages). Integrate available axes by their exact labels/values and articulate one nuanced through-line; for missing axes explicitly say which was not computed. Be a portrait, not advice.
name: about 100 Japanese characters. If name grid exists, reference at least two of its exact grid values and offer an interpretive reflection about public-facing strengths and interpersonal warmth, never assert actual luck/waves. Otherwise clearly explain that surname/given-name segmentation or character strokes are missing and draw no name-based conclusions; offer an inviting, specific reflection only from other available axes.
mind: about 100 Japanese characters. Cross the animal character and sun sign by exact names/numbers; describe a plausible choice-making contrast with a concrete everyday example, conditional rather than factual. If unavailable, say so and don't invent.
instinct: about 100 Japanese characters. Cross year branch and blood type by exact values; discuss an imagined pressure-response or emotional switch as metaphor, explicitly not a blood-type diagnosis. If unavailable, explain and avoid missing-value claims.
strength: about 100 Japanese characters. Give a sharp, usable possible strength synthesizing at least two available lenses, grounded in a concrete work or relationship scenario, without claiming verified aptitude or repeating synthesis. Return only the structured object.`,
      providerOptions: { openai: { store: false } },
    });
    return { ...readingSchema.parse(result.output), elements };
  });
