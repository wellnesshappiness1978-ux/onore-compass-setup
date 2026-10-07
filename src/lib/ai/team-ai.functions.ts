import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";

const lang = z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]);
const memberSummary = z.object({
  id: z.string().max(60), name: z.string().max(60), role: z.string().max(60), skills: z.array(z.string().max(30)).max(12),
  relationship: z.string().max(60), relationshipType: z.string().max(30), birthDate: z.string().date(), birthTime: z.string().max(5), birthPlace: z.string().max(170), gender: z.string().max(20), bloodType: z.string().max(4),
  teamRole: z.string().max(30), element: z.string().max(10), lifePath: z.number().int(), biorhythm: z.number().int(),
});

const provider = (apiKey: string) => createOpenAI({
  baseURL: "https://ai.gateway.lovable.dev/v1", apiKey,
  headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
});
const RULES = "All inputs are illustrative reference values derived from birth dates (numerology life path, day-stem element, sine biorhythm). They are NOT verified divination nor evidence of ability. Do not claim certainty, guaranteed outcomes, or health effects. Be warm, practical, and avoid jargon. Never judge people as good or bad hires.";
const outputLanguage = (language: z.infer<typeof lang>) => language === "ja"
  ? "Write every user-visible sentence entirely in natural Japanese. Do not use English headings, labels, or explanatory phrases."
  : `Write in language ${language}.`;

const draftOut = z.object({
  recommendedSize: z.number().int().min(1).max(30),
  ranking: z.array(z.object({ id: z.string(), score: z.number().int().min(0).max(100), reason: z.string().max(240) })).max(30),
  features: z.string().max(600), evaluation: z.string().max(600), cautions: z.string().max(600),
});

export const draftProjectTeam = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    goal: z.string().trim().min(3).max(500), headcount: z.number().int().min(0).max(30),
    members: z.array(memberSummary).min(1).max(100), fixedIds: z.array(z.string()).max(30).optional(), language: lang,
  }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is unavailable");
    const fixed = data.fixedIds?.length ? `The user manually fixed this exact team; rank ONLY these ids and evaluate the combination: ${data.fixedIds.join(", ")}.` : `Select the best team (${data.headcount ? `exactly ${data.headcount} people` : "choose the optimal size"}) from the candidates and rank them best first.`;
    const result = streamText({
      model: provider(apiKey).responses("openai/gpt-6-astra"),
      output: Output.object({ schema: draftOut }),
      prompt: `${RULES}\n${outputLanguage(data.language)} Project goal: ${data.goal}\n${fixed}\nCandidates (JSON): ${JSON.stringify(data.members)}\nReturn ids exactly as given. Scores reflect fit for this goal considering role balance, element synergy and today's biorhythm. features = team combination character, evaluation = overall assessment, cautions = points to watch.`,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    const output = await result.output;
    const valid = new Set(data.members.map((m) => m.id));
    return { ...output, ranking: output.ranking.filter((r) => valid.has(r.id)) };
  });

const guideOut = z.object({ praise: z.string().max(500), ngInstructions: z.string().max(500), lowMotivation: z.string().max(500) });

export const generateOneOnOneGuide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ member: memberSummary, language: lang }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is unavailable");
    const result = streamText({
      model: provider(apiKey).responses("openai/gpt-6-astra"),
      output: Output.object({ schema: guideOut }),
      prompt: `${RULES}\n${outputLanguage(data.language)} Use every available profile field but never infer a missing one. Write a short, personal 1on1 guide about this team member: ${JSON.stringify(data.member)}. praise = 2-3 concrete phrases. ngInstructions = approaches to avoid. lowMotivation = practical support when motivation dips. Keep each field concise and respectful.`,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    return await result.output;
  });

const recruitOut = z.object({
  teamFit: z.string().max(600), rolePrediction: z.string().max(600), motivation: z.string().max(600), onboarding: z.string().max(600),
});

export const analyzeCandidate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    candidate: z.object({ name: z.string().trim().max(60), role: z.string().max(30), element: z.string().max(10), lifePath: z.number().int(), avgFit: z.number().int() }),
    pairs: z.array(z.object({ name: z.string().max(60), teamRole: z.string().max(30), score: z.number().int() })).max(100),
    language: lang,
  }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is unavailable");
    const result = streamText({
      model: provider(apiKey).responses("openai/gpt-6-astra"),
      output: Output.object({ schema: recruitOut }),
      prompt: `${RULES}\n${outputLanguage(data.language)} This is a hiring-interview reflection aid. It must NEVER be used as a pass/fail criterion; say the decision rests on skills, experience and the interview itself. Candidate (reference values): ${JSON.stringify(data.candidate)}. Reference compatibility with existing members: ${JSON.stringify(data.pairs)}.\nteamFit = how they may mesh with the current team, naming 1-3 members with high reference scores. rolePrediction = the role they may naturally take in the organisation. motivation = how to sustain their motivation after joining (praise style, environment). onboarding = first-90-days support tips for the manager. Each 100-200 Japanese characters (or ~60 words), warm and concrete.`,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] } },
    });
    return await result.output;
  });
