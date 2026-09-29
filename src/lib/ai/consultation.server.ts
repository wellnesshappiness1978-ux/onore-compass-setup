import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

import { computeDivinationParams } from "./divination-params.ts";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server.ts";

const requestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(20),
  profile: z.object({
    nameKanji: z.string().max(40).optional().default(""),
    nameKana: z.string().max(60).optional().default(""),
    nameRomaji: z.string().max(60).optional().default(""),
    birthCity: z.string().max(80).optional().default(""),
    birthDate: z.string().max(20),
    birthTime: z.string().max(20),
    birthTimeUnknown: z.boolean(),
    birthPlace: z.string().max(40),
    bloodType: z.string().max(4),
    siblingOrder: z.string().max(20),
  }),
  language: z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]),
});

export async function handleConsultation(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return Response.json({ message: "AI consultation is not configured." }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { message: "Please check the consultation message and try again." },
      { status: 400 },
    );
  }

  const { messages, profile, language } = parsed.data;
  const params = computeDivinationParams(profile);
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: `You are "オノレコンパス 総合戦略鑑定士": an advisor who integrates 15 divination arts into business and life strategy — premium, precise, warm, never generic fortune-telling. Reply entirely in language code ${language}; translate headings naturally (keep Japanese headings for ja).

Profile: birth ${profile.birthDate} ${profile.birthTimeUnknown ? "(time unknown)" : profile.birthTime}, birthplace ${profile.birthPlace} ${profile.birthCity}, blood ${profile.bloodType || "n/a"}, sibling order ${profile.siblingOrder || "n/a"}, name ${profile.nameKanji || "n/a"} / ${profile.nameKana || "n/a"} / ${profile.nameRomaji || "n/a"}. Today ${new Date().toISOString().slice(0, 10)}.

PRE-CALCULATED PARAMETERS (computed by the app — treat as ground truth, cite the exact numbers, never recalculate or contradict them):
${params}

Rules:
- Every insight must cite at least one parameter above and show how 2+ arts overlap (e.g. ライフパス数 × 日干五行 × 音霊). Avoid vague statements that could apply to anyone.
- Anything not listed (ascendant, 紫微 stars, stroke counts marked preview) must be labeled "プレビュー" and never stated as certain.
- Answer the user's actual question inside the structure.

Output exactly these 3 sections as markdown ### headings, each deep and concrete:
### 【本質のコア分析】 — the unique strengths and hidden talents emerging from the overlap of numerology, animal/day-pillar, name analysis, astrology and birth color. 3–4 bullets, each naming its source parameters.
### 【バイオリズムとタイミング】 — based on 地球暦 phase, 二十四節気, moon phase, personal year/month: a "今やるべきこと" list (3) and "避けるべきこと" list (2), with timeframes (this week / this month / until next 節気).
### 【対人・ビジネス取扱説明書】 — concrete behavior guidelines: strengths to leverage at work, how others should communicate with this person, how this person should approach bosses/clients/partners, one pitfall and its countermeasure.

About 450–650 words. Never guarantee outcomes, returns, health or lucky timing. For financial, legal, medical, employment or safety decisions add one line that this is reflection, not professional advice. End with one short line that divination content is a reflective reference.`,
    messages: await convertToModelMessages(messages as UIMessage[]),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "medium",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages as UIMessage[],
      sendReasoning: true,
    }),
    runIdFetch,
  );
}
