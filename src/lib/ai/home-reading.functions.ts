import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getFiveElements } from "./five-elements";
import { computeCoreLayers, coreLayersPrompt } from "./core-layers";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import { helioPhase } from "./helio-phase";

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
  caution: z.string().min(30).max(500),
  manualCore: z.string().min(30).max(500),
  manualDecision: z.string().min(30).max(500),
  manualTiming: z.string().min(30).max(500),
  keySummary: z.string(),
  numerologyTrial: z.string(),
  astroRecovery: z.string(),
  pillarsTiming: z.string(),
  animalSwitch: z.string(),
  colorPractice: z.string(),
  helioGuide: z.string(),
});

export const generateHomeReading = createServerFn({ method: "POST" })
  .validator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is unavailable");
    const { profile, language } = data;
    const elements = getFiveElements(profile);
    const layers = computeCoreLayers(profile);
    const core = coreLayersPrompt(layers);
    const color = birthColorSpectrum(profile);
    const helio = helioPhase(profile.birthDate);
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1", apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = await generateText({
      model: provider.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: readingSchema }),
      prompt: `Write a vivid, personal five-layer INTERPRETIVE reading in ${language}. Return exactly the fields in the schema; no headings in field values. This is available in FULL to every user including free users. No paywall or upsell in the reading.

Use ONLY these precomputed inputs (not unverified chart placements or invented stroke counts):
Name character grid: ${elements.name ? `天格 ${elements.name.sky}(${elements.name.luck.sky}) / 人格 ${elements.name.person}(${elements.name.luck.person}) / 地格 ${elements.name.earth}(${elements.name.luck.earth}) / 外格 ${elements.name.outer}(${elements.name.luck.outer}) / 総格 ${elements.name.total}(${elements.name.luck.total}); luck labels follow one common 81-number convention (modern Unihan stroke convention; surname/given name separated by a space)` : "not computable: needs a two-part, space-separated name with supported kanji or kana characters"}.
Western sun sign: ${elements.zodiac ?? "unknown"}${elements.zodiacBoundary ? " (near sign boundary; date-only conventional sign, exact astronomical sign unverified)" : ""}.
Yearly zodiac branch: ${elements.eto ?? "uncertain/unknown near year boundary"} (traditional year starts around 立春; boundary dates are not asserted).
Blood type: ${elements.blood ?? "not provided"} (no scientifically established personality inference).
Animal character: ${elements.animal ?? "unavailable"} (reference 60-day-number mapping, not an official licensed animal-personality diagnosis). Date: ${profile.birthDate}.

FIVE CORE LAYERS (computed by the app; cite exact values, never recalculate, never fill 未算出 values):
${core}
CROSS-ANALYSIS (required): In synthesis and strength, contrast the 表の顔 list with the 本音・潜在 list and use the [クロス解析] verdicts (一致 / ギャップ) explicitly: 日干×太陽, 人格×ソウル数, 動物×月星座. Weave in 通変星, 十二運星, 五行の最多/欠如, ライフパス, and 月・水星・金星 where they sharpen the portrait. Never mention 表面・希望・隠れ animal layers as computed. Treat these as traditional divination lenses, not scientific facts.
BANNED hedges: "〜な面もあります", "人それぞれ", "〜かもしれません", "場合によっては", and any sentence that would fit anyone.

STYLE (strict): Write in direct, declarative voice as a fortune-reading ("総格29が示すのは〜", "〜な人です"). Every sentence must name or rest on a specific computed value above. ABSOLUTELY FORBIDDEN: analogies, metaphors, examples or hypotheticals ("例えば", "〜のように", "仮に", "もし〜なら", "〜といった例", "たとえるなら", "〜かもしれません", "〜でしょう"), scenario sketches, preambles, general explanations of what an astrology system means, placeholder phrasing, and generic praise that fits anyone. Start each field with the conclusion. Short, strong sentences.
Guardrails: do not invent values; if a lens is unavailable, say in one short sentence which one was not computed and use the rest (never claim all five were combined when not). Do not state facts about their job, relationships, health, or future events; no guaranteed outcomes or verified 15-arts claims. Blood type is described only as a traditional lens (never as science) — phrase its part as "血液型の見立てでは〜". No disclaimers or methodology inside passages; the interface states limits separately.

synthesis: about 150 Japanese characters (equivalent depth in other languages). Declare their core personality and fundamental desire where the available five axes intersect, citing exact values. Portrait, not advice.
name: about 100 Japanese characters. If the grid exists, cite the exact 天格・人格・地格・外格・総格 values/luck labels and state directly the social strength and life axis they indicate. Otherwise state in one sentence that the name split is not set and draw no name conclusions.
mind: about 100 Japanese characters. Cross sun sign and animal character by exact names/numbers; state their values, thinking pattern, and the conditions under which they decide instantly.
instinct: about 100 Japanese characters. Cross year branch and blood type by exact values; state their last-minute tenacity, emotional switch, and real interpersonal core.
strength: about 100 Japanese characters. Declare the single strongest attractive trait they exert unconsciously, synthesizing at least two lenses; do not repeat synthesis.
nameFortune: about 150 Japanese characters. Only if the name grid exists: from 人格 and 総格 values and luck labels, state directly the charm others see, the talent shown socially, and the kind of connections they tend to draw, crossed with one birth-date lens. If the grid is missing, return an empty string.
caution: about 100 Japanese characters. Describe a specific tendency to watch for, grounded in at least two available calculated values; give one practical way to notice it. Never diagnose health or assert inevitable harm.
manualCore, manualDecision, manualTiming: around 100 Japanese characters each. Write three DISTINCT cross-layer interpretations: (1) identity from day master, sun and life path; (2) decision bias from name person grid, soul number and Mercury, skipping unavailable values; (3) an actionable advance/pause guideline from five-element balance and personal year. Cite the actual computed values in every answer; avoid unverifiable auspicious dates and do not claim all 15 arts have been calculated.
All other fields must weave the name grid (when present) together with the sun sign, year branch, blood type and animal so name and birth date read as one consistent portrait.

BIRTH COLOR (illustrative 1440-slot palette): ${color ? `main ${color.main.name} ${color.main.code}, sub ${color.sub.name} ${color.sub.code}, mind ${color.mind.name} ${color.mind.code}` : "unavailable"}.
EARTH CALENDAR PHASE (Earth has moved ${helio ? `${helio.degrees}° around the Sun since the birth-day position → phase 「${helio.phase}」` : "unavailable"}; four 90° phases 種まき/育成/収穫/休息).

PRO COUNSELOR VOICE: speak like a seasoned diviner and behavioral counselor — confident, sharp, warm, declarative; name their unconscious habits outright. BANNED (Barnum phrases): "〜かもしれません", "人それぞれ", "慎重に行動しましょう", "感謝を忘れずに", "無理せず", "バランスが大切", or any line fitting anyone. Every advice field MUST contain all three: (a) 具体的な行動 with a when (e.g. 朝の最初の30分 / 週の前半 / 返信前) and what, (b) 避けるべき具体的リスク, (c) one effective interpersonal phrase in 「」 quotes. Never assert job, health, relationship or future facts.
keySummary: about 100 Japanese characters. Opens the reading: the essence and action key that the computed layers (numerology, four pillars, astrology, name, animal, earth-calendar phase) point to in common; cite 2–3 values.
numerologyTrial: about 120 chars. From life path and soul number: the trial pattern that repeats in their life and the specific talent that breaks through it, plus (a)(b)(c).
astroRecovery: about 120 chars. Sun vs moon gap (建前 vs 本音) and a concrete recovery action when emotions are disturbed, plus (a)(b)(c). If moon is uncertain, say so in a few words.
pillarsTiming: about 120 chars. From the five-element excess/lack and day master: where to spend energy (攻め時) and the trap where they spin their wheels (守り時), plus (a)(b)(c).
animalSwitch: about 120 chars. From the animal character and its group: decision habit and the exact conditions that flip their motivation switch, plus (a)(b)(c). Only the 本質 layer is computed; do not invent 表面・希望・隠れ.
colorPractice: about 120 chars. Daily ways to use the birth colors: one small item, one interior idea, one focus of attention, naming the color names.
helioGuide: about 120 chars. State the phase explicitly and what to do in this phase this week/month, plus (a)(b)(c). Describe as an earth-calendar reflection, not verified luck.
Return only the structured object.`,
      providerOptions: { openai: { store: false } },
    });
    return { ...readingSchema.parse(result.output), elements, layers };
  });
