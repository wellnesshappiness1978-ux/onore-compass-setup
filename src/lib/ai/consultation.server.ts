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
    return Response.json({ message: "Please check the consultation message and try again." }, { status: 400 });
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
    system: `You are AI Onore, a calm decision-support guide in Self Compass. Reply in language code ${language}. Use the profile only as reflective context: birth date ${profile.birthDate}, birth time ${profile.birthTimeUnknown ? "unknown" : profile.birthTime || "not provided"}, birthplace ${profile.birthPlace || "not provided"}, blood type ${profile.bloodType || "not provided"}, sibling order ${profile.siblingOrder || "not provided"}. Never claim to calculate or predict fate, astrology, Four Pillars, animal horoscope, investment returns, health outcomes, or guaranteed lucky timing. Clearly call any divination framing a reflective preview. Give concise, structured support with: 1) situation lens, 2) timing considerations based on practical facts, 3) one concrete next action. For financial, legal, medical, employment, or safety decisions, state that this is general reflection rather than professional advice. Ask at most one clarifying question when essential.`,
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
    result.toUIMessageStreamResponse({ originalMessages: messages as UIMessage[], sendReasoning: true }),
    runIdFetch,
  );
}