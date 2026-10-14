import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import { getFiveElements } from "./five-elements";
import { computeCoreLayers, coreLayersPrompt } from "./core-layers";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import { helioPhase } from "./helio-phase";
import { fengDirectionNames, mingGua } from "@/lib/feng-shui";
import { distinctTraitChapters, supportiveWritingVoice } from "./writing-voice";
import { approachKeys, approachStatuses, traitReadingPrompt } from "@/lib/trait-reading";
import { nineStarProfile } from "@/lib/calendar-traditions";

const profileSchema = z.object({
  nameKanji: z.string().max(40), nameKana: z.string().max(60), nameRomaji: z.string().max(60),
  birthDate: z.string().date(), birthTime: z.string().max(20), birthTimeUnknown: z.boolean(),
  birthPlace: z.string().max(80), birthCity: z.string().max(80), gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  bloodType: z.string().max(4), siblingOrder: z.string().max(20),
});
const inputSchema = z.object({
  profile: profileSchema,
  language: z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]),
});
const readingSchema = z.object({
  catchphrase: z.string(),
  essence: z.object({ outward: z.string(), inner: z.string(), growth: z.string(), resilience: z.string(), relationships: z.string(), gift: z.string() }),
  approaches: z.object({ western: z.string(), indian: z.string(), ziwei: z.string(), earth: z.string(), pillars: z.string(), sanmei: z.string(), nineStars: z.string(), lunarMansion: z.string(), animal: z.string(), numerology: z.string(), maya: z.string(), color: z.string(), blood: z.string(), siblings: z.string(), region: z.string() }),
  axisSummary: z.string(),
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
  grandSummary: z.string().min(500).max(1200),
  numerologyTrial: z.string(),
  astroRecovery: z.string(),
  pillarsTiming: z.string(),
  animalSwitch: z.string(),
  colorPractice: z.string(),
  helioGuide: z.string(),
  nameNature: z.string(), nameGuide: z.string(),
  numerologyNature: z.string(), numerologyGuide: z.string(),
  westernNature: z.string(), westernGuide: z.string(),
  pillarsNature: z.string(), pillarsGuide: z.string(),
  animalNature: z.string(), animalGuide: z.string(),
  fengNature: z.string(), fengGuide: z.string(),
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
    const gua = mingGua(profile.birthDate, profile.gender ?? "undisclosed");
    const nineStars = nineStarProfile(profile.birthDate, profile.birthTime, profile.birthTimeUnknown, profile.gender);
    const approachAvailability = approachStatuses({ core: Boolean(layers), earth: Boolean(helio), nineStars: Boolean(nineStars), color: Boolean(color), blood: Boolean(elements.blood), siblings: Boolean(profile.siblingOrder), region: Boolean(profile.birthPlace || profile.birthCity) });
    let runId: string | undefined;
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1", apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers);
        if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
        const response = await fetch(input, { ...init, headers });
        runId = runId ?? (response.headers.get("X-Lovable-AIG-Run-ID")?.trim() || undefined);
        return response;
      },
    });
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: readingSchema }),
      prompt: `Write a vivid, personal five-layer INTERPRETIVE reading in ${language}. Return exactly the fields in the schema; no headings in field values. This is available in FULL to every user including free users. No paywall or upsell in the reading.

SHARED VOICE:
${supportiveWritingVoice}
${distinctTraitChapters}

Use ONLY these precomputed inputs (not unverified chart placements or invented stroke counts):
Name character grid: ${elements.name ? `天格 ${elements.name.sky}(${elements.name.luck.sky}) / 人格 ${elements.name.person}(${elements.name.luck.person}) / 地格 ${elements.name.earth}(${elements.name.luck.earth}) / 外格 ${elements.name.outer}(${elements.name.luck.outer}) / 総格 ${elements.name.total}(${elements.name.luck.total}); luck labels follow one common 81-number convention (modern Unihan stroke convention; surname/given name separated by a space)` : "not computable: needs a two-part, space-separated name with supported kanji or kana characters"}.
Western sun sign: ${elements.zodiac ?? "unknown"}${elements.zodiacBoundary ? " (near sign boundary; date-only conventional sign, exact astronomical sign unverified)" : ""}.
Yearly zodiac branch: ${elements.eto ?? "uncertain/unknown near year boundary"} (traditional year starts around 立春; boundary dates are not asserted).
Blood type: ${elements.blood ?? "not provided"} (no scientifically established personality inference).
Sibling order: ${profile.siblingOrder || "not provided"} (family position is context, never a verified personality trait).
Animal character: ${elements.animal ?? "unavailable"} (reference 60-day-number mapping, not an official licensed animal-personality diagnosis). Date: ${profile.birthDate}.

FIVE CORE LAYERS (computed by the app; cite exact values, never recalculate, never fill 未算出 values):
${core}
CROSS-ANALYSIS (required): In synthesis and strength, contrast the 表の顔 list with the 本音・潜在 list and use the [クロス解析] verdicts (一致 / ギャップ) explicitly: 日干×太陽, 人格×ソウル数, 動物×月星座. Weave in 通変星, 十二運星, 五行の最多/欠如, ライフパス, and 月・水星・金星 where they sharpen the portrait. The animal surface/hope/hidden values are an original +1/+2/+3 day reference model, NOT official animal layers; do not infer personality from them. The ascendant uses birthplace representative coordinates only when available and birth time is known. Geocentric planets and Ba Zhai directions are not birthplace-dependent. Treat these as traditional divination lenses, not scientific facts.
BANNED hedges: "〜な面もあります", "人それぞれ", "〜かもしれません", "場合によっては", and any sentence that would fit anyone.

STYLE (strict): Write in direct, warm everyday language at the reader's eye level. Use the exact computed values internally as evidence, but keep specialist labels and raw parameter lists OUT of the prose: the interface displays them separately. Translate them into recognizable patterns in daily decisions, work, study, family and relationships. Make the portrait uniquely traceable to this exact combination of inputs: identify a specific tension between two calculated layers, the condition that brings out the person's strength, and the recurring point where their decisions stall. ABSOLUTELY FORBIDDEN in every output language: unexplained divination jargon or translated equivalents of 通変星, 命格, 日干, 十二運, 天格, 地格, 五行, ハウス or アスペクト; abstract spiritual wording or ornate metaphors, preambles; brief familiar everyday analogies are encouraged when useful; generic praise that fits anyone. Start each field with a clear observation. Keep sentences short without sounding severe.
Guardrails: do not invent values; if a lens is unavailable, say in one short sentence which one was not computed and use the rest (never claim all five were combined when not). Do not state facts about their job, relationships, health, or future events; no guaranteed outcomes or verified multi-layer claims. Blood type is described only as a traditional lens (never as science) — phrase its part as "血液型の見立てでは〜". No disclaimers or methodology inside passages; the interface states limits separately.

synthesis: about 150 Japanese characters (equivalent depth in other languages). Describe the reference pattern of their core style and central desire where the available axes intersect. Translate every source value into everyday behavior; never cite a method name, symbol, number, sign, element or fortune label. Portrait, not advice.
name: about 100 Japanese characters. If the grid exists, translate it into the social strength and life axis it indicates without naming grids, stroke values or luck labels. Otherwise state only that the name reading could not be included and draw no name conclusions.
mind: about 100 Japanese characters. Translate the intersection of the relevant sky and animal inputs into a thinking pattern and the conditions under which decisions become clear, without naming either source.
instinct: about 100 Japanese characters. Translate available traditional context into an observable response pattern without naming the source categories. Never infer personality from blood type.
strength: about 100 Japanese characters. Describe the strongest supported strength suggested by the reference pattern, synthesizing at least two lenses; do not repeat synthesis.
nameFortune: about 150 Japanese characters. Only if the name grid exists: from 人格 and 総格 values and luck labels, state directly the charm others see, the talent shown socially, and the kind of connections they tend to draw, crossed with one birth-date lens. If the grid is missing, return an empty string.
caution: about 100 Japanese characters. Describe a specific blind spot in the interpretation of at least two calculated values and the internal tension behind it. No warning or instruction.
manualCore, manualDecision, manualTiming: 80–120 Japanese characters each. Plain portrait prose, no jargon, lists, definitions, or repeated explanations. Write three DISTINCT cross-layer interpretations: (1) outward identity versus unspoken desire from day master, sun and life path; (2) decision bias from name person grid, soul number and Mercury, skipping unavailable values; (3) the inner contrast between impulses to advance and withdraw from five-element balance and personal year. No advice, imperative or behavioral prescription. Avoid unverifiable auspicious dates and do not claim all multi-layer arts have been calculated.
All other fields must weave the name grid (when present) together with the actual sun sign, year branch, blood type, sibling order and animal core so name and birth date read as one consistent portrait. Use the four displayed animal layers ONLY as labels: core is mapped from the 60-day reference; surface/hope/hidden are original shifted-day artwork labels and must never support psychological assertions. Include sibling order in synthesis, mind and grandSummary only as supplied family context, not proof of personality; omit any missing field. Blood type has no scientifically established link to personality, so never infer a trait from it: mention it only as a user-provided traditional category with a clear boundary. In synthesis and grandSummary include the available zodiac, branch, blood category, family position and animal core alongside calculated layers; do not invent missing values.

BIRTH COLOR (illustrative 1440-slot palette): ${color ? `main ${color.main.name} ${color.main.code}, sub ${color.sub.name} ${color.sub.code}, mind ${color.mind.name} ${color.mind.code}` : "unavailable"}.
EARTH CALENDAR PHASE (Earth has moved ${helio ? `${helio.degrees}° around the Sun since the birth-day position → phase 「${helio.phase}」` : "unavailable"}; four 90° phases 種まき/育成/収穫/休息).
FENG SHUI (traditional Ba Zhai reference, solar year from Li Chun): ${gua ? gua.branches.map(b => `${b.branch} formula: Kua ${b.number}, 生気 ${fengDirectionNames[b.shengQi]}, 天医 ${fengDirectionNames[b.tianYi]}, 延年 ${fengDirectionNames[b.yanNian]}`).join("; ") : "birth date or gender unavailable; ask for profile input, do not infer"}. Mention only as a traditional directional reflection; do not infer a home's facing, a room's location or an individual's health/wealth outcomes. Annual Flying Stars cannot yield a building-specific natal chart without building period and facing.

PORTRAIT VOICE: sharply perceptive but never superior. BANNED in keySummary, grandSummary, synthesis, name, mind, instinct, strength, caution, manualCore, manualDecision and manualTiming: instructions or moral advice, 「〜しましょう」「〜してください」「〜に気をつけなさい」「〜すべき」「〜が大切」, warnings, generic praise or claims to know the person's actual private thoughts. Describe only what the traditional reference model suggests, grounded in available values. Never assert job, health, relationship or future facts.
grandSummary: 500–800 Japanese characters (equivalent high-density depth in other languages). This is the capstone shown last on the home screen. Build a coherent portrait in four movements: the deep pattern beneath the outward style; latent abilities that emerge under specific conditions; the structural bottleneck that repeats in decisions or relationships; and a concrete key for making daily choices more congruent. Anchor each movement in a different intersection of the supplied name, birth date/time/place and profile context, so changing those inputs would materially change the portrait. Weave at least four available computed layers internally, but translate every specialist value into plain daily language instead of naming it. No preface or greeting. Practical reflection is welcome, but never claim access to private thoughts or facts about work, health, relationships or future outcomes.
keySummary: about 100 Japanese characters, plain language with no technical parameter list. Opens with a portrait of the contrast between the outward face, hidden desire and unconscious decision pattern indicated by 2–3 computed layers. No action key or instruction.
SIX CHAPTERS: write six complete, non-overlapping chapters in this exact order, but NEVER name their source method, raw value, sign, grid, element, symbol or technical term. Each Nature field is 100–180 Japanese characters and each Guide field is 80–150 Japanese characters. (1) nameNature/nameGuide covers ONLY outward impression, social role and strength visible to others, grounded in the available name grid. (2) numerologyNature/numerologyGuide covers ONLY the inner motive and lifelong central theme, grounded in life path and soul number. (3) westernNature/westernGuide covers ONLY emotion, thought, communication, and the contrast between outward and inward response, grounded in Sun/Moon/Mercury/Venus. (4) pillarsNature/pillarsGuide covers ONLY latent energy balance, endurance and how force is allocated, grounded in day master, five-element balance, 通変星 and 十二運星. (5) animalNature/animalGuide covers ONLY observable action psychology and decision rhythm, grounded solely in the official core 60-day reference; never use the three original shifted-day artwork labels as evidence. (6) fengNature/fengGuide covers ONLY environmental arrangement and traditional directional reflection, never personality. Do not reuse the same trait, tension, advice, key noun, opening, or conclusion across chapters. Each Guide gives one small optional action with a clear when and what for today or tomorrow, not a lecture. Use a brief everyday analogy or gentle situational humor only where it clarifies the observation, not in all six chapters. Each pair must add information unavailable in the other five. Use plain everyday language. Never end a field with 「〜読みです」. Across the twelve fields, deliberately vary natural sentence endings such as 「〜と示されています」「〜という特質を備えています」「〜の傾向が根底にあります」「〜へつながります」「〜が整いやすくなります」, without repeating one ending more than twice. These chapters must each stand alone as 「本質・特性」 followed by 「今のあなたへの道標」 before the next chapter begins.
numerologyTrial: about 120 chars. From life path and soul number: the trial pattern that repeats in their life and the specific talent that breaks through it, plus (a)(b)(c).
astroRecovery: about 120 chars. Sun vs moon gap (建前 vs 本音) and a concrete recovery action when emotions are disturbed, plus (a)(b)(c). If moon is uncertain, say so in a few words.
pillarsTiming: about 120 chars. From the five-element excess/lack and day master: where to spend energy (攻め時) and the trap where they spin their wheels (守り時), plus (a)(b)(c).
animalSwitch: about 120 chars. From the core animal character and its group: interpret decision habits as a traditional reference. The other three displayed layers use the original shifted-day model, not the official classification; never treat them as personality evidence.
colorPractice: about 120 chars. Daily ways to use the birth colors: one small item, one interior idea, one focus of attention, naming the color names.
helioGuide: about 120 chars. State the phase explicitly and what to do in this phase this week/month, plus (a)(b)(c). Describe as an earth-calendar reflection, not verified luck.
Do not mention any birth-color names, HEX codes, or color themes outside colorPractice; colorPractice is displayed behind a separate plan gate. Include a practical feng-shui environmental reflection in manualTiming when relevant: clearing a walkway before a task, adjusting glare at the desk, or choosing an entered Gua direction; never promise health, wealth or outcomes.
FINAL NEW FIELD CONTRACT:
${traitReadingPrompt}
Availability (server-authoritative): ${JSON.stringify(approachAvailability)}.
Nine Star reference: ${nineStars ? `honmei ${nineStars.honmei}, getsumei ${nineStars.getsumei}, keisha ${nineStars.keisha}; boundary ${nineStars.nearBoundary}; traditional reference, not measured personality or auspicious timing` : "unavailable"}.
Supplied family context: ${profile.siblingOrder || "missing"}. Supplied birth location: ${profile.birthPlace} ${profile.birthCity}; do not infer upbringing.
Return only the structured object.`,
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
    });
    const reading = readingSchema.parse(await result.output);
    for (const key of approachKeys) {
      if (approachAvailability[key] === "unavailable") reading.approaches[key] = "";
    }
    return { ...reading, approachAvailability, elements, layers, helio };
  });
