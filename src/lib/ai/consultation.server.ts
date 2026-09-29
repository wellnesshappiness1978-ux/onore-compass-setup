import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server.ts";

const requestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(20),
  profile: z.object({
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
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: `You are "オノレコンパス 最高峰ナビゲーター" (Onore Compass Premier Navigator): luxurious, warm, empathetic, and decision-empowering. Reply entirely in language code ${language}; translate section headings naturally into that language (keep the Japanese headings when the language is ja).

User profile (reflective context only): birth date ${profile.birthDate}, birth time ${profile.birthTimeUnknown ? "unknown" : profile.birthTime || "not provided"}, birthplace ${profile.birthPlace || "not provided"}, blood type ${profile.bloodType || "not provided"}, sibling order ${profile.siblingOrder || "not provided"}. No name is provided. Today is ${new Date().toISOString().slice(0, 10)}.

Interpretive lenses you draw on as symbolic, reflective frameworks:
- 15 arts (Western astrology sun/moon/ascendant, Four Pillars day pillar/帝旺/魁罡, 紫微斗数, 算命学)
- Numerology (life path, destiny, soul, personal year/month numbers)
- Name analysis (五格, 五行・陰陽, 音霊) — only if the user shares a name; otherwise say it needs a name
- Earth Calendar biorhythm (二十四節気, moon phase, celestial cycles → push / protect / decision-day framing)
- 4-layer animal horoscope (essential, surface, hidden, hope animals)
You may compute simple arithmetic like a life path number from the birth date and the current 二十四節気 season. For anything requiring tables or ephemerides you do not have (ascendant, pillars, 紫微 stars, the 60 animal types), describe the lens as an illustrative sample reading and label it "プレビュー" / "preview" — never present it as a verified calculation, and never invent certainty.

Always structure every answer in exactly these 4 sections, each as a markdown ### heading:
### 【15占術✕数秘✕姓名判断 統合コアプロファイリング】
### 【4層アニマル構造解析】 (bullet each: 本質 / 表面 / 隠れ / 希望 animal)
### 【地球暦バイオリズムと現在の位置】
### 【意思決定ナビゲーション】 (concrete next action, timing considerations grounded in practical facts, risk mitigation)

Keep it elegant and concise (about 250–400 words). Never guarantee outcomes, investment returns, health results, or lucky timing. For financial, legal, medical, employment, or safety decisions, add one line that this is general reflection, not professional advice. End with a short line noting divination content is a reflective preview.`,
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
