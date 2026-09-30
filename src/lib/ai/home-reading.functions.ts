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
  nameFortune: z.string().max(900),
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
Name character grid: ${elements.name ? `天格 ${elements.name.sky}(${elements.name.luck.sky}) / 人格 ${elements.name.person}(${elements.name.luck.person}) / 地格 ${elements.name.earth}(${elements.name.luck.earth}) / 外格 ${elements.name.outer}(${elements.name.luck.outer}) / 総格 ${elements.name.total}(${elements.name.luck.total}); luck labels follow one common 81-number convention (modern Unihan stroke convention; surname/given name separated by a space)` : "not computable: needs a two-part, space-separated kanji name with supported characters"}.
Western sun sign: ${elements.zodiac ?? "unknown"}${elements.zodiacBoundary ? " (near sign boundary; date-only conventional sign, exact astronomical sign unverified)" : ""}.
Yearly zodiac branch: ${elements.eto ?? "uncertain/unknown near year boundary"} (traditional year starts around 立春; boundary dates are not asserted).
Blood type: ${elements.blood ?? "not provided"} (no scientifically established personality inference).
Animal character: ${elements.animal ?? "unavailable"} (reference 60-day-number mapping, not an official licensed animal-personality diagnosis). Date: ${profile.birthDate}.

STYLE (strict): Write in direct, declarative voice as a fortune-reading ("総格29が示すのは〜", "〜な人です"). Every sentence must name or rest on a specific computed value above. ABSOLUTELY FORBIDDEN: analogies, metaphors, examples or hypotheticals ("例えば", "〜のように", "仮に", "もし〜なら", "〜といった例", "たとえるなら", "〜かもしれません", "〜でしょう"), scenario sketches, preambles, general explanations of what an astrology system means, placeholder phrasing, and generic praise that fits anyone. Start each field with the conclusion. Short, strong sentences.
Guardrails: do not invent values; if a lens is unavailable, say in one short sentence which one was not computed and use the rest (never claim all five were combined when not). Do not state facts about their job, relationships, health, or future events; no guaranteed outcomes or verified 15-arts claims. Blood type is described only as a traditional lens (never as science) — phrase its part as "血液型の見立てでは〜". No disclaimers or methodology inside passages; the interface states limits separately.

synthesis: about 150 Japanese characters (equivalent depth in other languages). Declare their core personality and fundamental desire where the available five axes intersect, citing exact values. Portrait, not advice.
name: about 100 Japanese characters. If the grid exists, cite the exact 天格・人格・地格・外格・総格 values/luck labels and state directly the social strength and life axis they indicate. Otherwise state in one sentence that the name split is not set and draw no name conclusions.
mind: about 100 Japanese characters. Cross sun sign and animal character by exact names/numbers; state their values, thinking pattern, and the conditions under which they decide instantly.
instinct: about 100 Japanese characters. Cross year branch and blood type by exact values; state their last-minute tenacity, emotional switch, and real interpersonal core.
strength: about 100 Japanese characters. Declare the single strongest attractive trait they exert unconsciously, synthesizing at least two lenses; do not repeat synthesis.
nameFortune: about 150 Japanese characters. Only if the name grid exists: from 人格 and 総格 values and luck labels, state directly the charm others see, the talent shown socially, and the kind of connections they tend to draw, crossed with one birth-date lens. If the grid is missing, return an empty string.
All other fields must weave the name grid (when present) together with the sun sign, year branch, blood type and animal so name and birth date read as one consistent portrait. Return only the structured object.`,
      providerOptions: { openai: { store: false } },
    });
    return { ...readingSchema.parse(result.output), elements };
  });
