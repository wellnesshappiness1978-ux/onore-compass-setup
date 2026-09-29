import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

const lang = z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]);
const memberSummary = z.object({
  id: z.string().max(60), name: z.string().max(60), role: z.string().max(60), skills: z.array(z.string().max(30)).max(12),
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
    const { output } = await generateText({
      model: provider(apiKey).responses("openai/gpt-6-astra"),
      output: Output.object({ schema: draftOut }),
      prompt: `${RULES}\n${outputLanguage(data.language)} Project goal: ${data.goal}\n${fixed}\nCandidates (JSON): ${JSON.stringify(data.members)}\nReturn ids exactly as given. Scores reflect fit for this goal considering role balance, element synergy and today's biorhythm. features = team combination character, evaluation = overall assessment, cautions = points to watch.`,
      providerOptions: { openai: { store: false } },
    });
    const valid = new Set(data.members.map((m) => m.id));
    return { ...output, ranking: output.ranking.filter((r) => valid.has(r.id)) };
  });

const guideOut = z.object({ praise: z.string().max(500), ngInstructions: z.string().max(500), lowMotivation: z.string().max(500) });

export const generateOneOnOneGuide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ member: memberSummary, language: lang }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is unavailable");
    const { output } = await generateText({
      model: provider(apiKey).responses("openai/gpt-6-astra"),
      output: Output.object({ schema: guideOut }),
      prompt: `${RULES}\n${outputLanguage(data.language)} Write a short 1on1 management guide for a manager about this team member: ${JSON.stringify(data.member)}. praise = the kind of recognition most likely to motivate them (2-3 concrete phrasings). ngInstructions = instructions/approaches to avoid. lowMotivation = how to support them when motivation dips. Each 80-200 characters (or ~50 words), respectful, as gentle suggestions.`,
      providerOptions: { openai: { store: false } },
    });
    return output;
  });
