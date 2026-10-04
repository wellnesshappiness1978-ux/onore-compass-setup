import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

import { computeDivinationParams } from "./divination-params.ts";
import { computeCoreLayers, coreLayersPrompt } from "./core-layers.ts";
import { fengDirectionNames, mingGua } from "@/lib/feng-shui";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server.ts";

const personSchema = z.object({
  nameKanji: z.string().max(60).optional().default(""), nameKana: z.string().max(60).optional().default(""), nameRomaji: z.string().max(60).optional().default(""),
  birthCity: z.string().max(80).optional().default(""), birthDate: z.string().date(),
  birthTime: z.string().max(20), birthTimeUnknown: z.boolean(), birthPlace: z.string().max(80),
  bloodType: z.string().max(4), siblingOrder: z.string().max(20),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
});
const requestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(20),
  profile: personSchema,
  ownerProfile: personSchema.optional(),
  targetLabel: z.string().trim().max(60).optional(),
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

  const { messages, profile, ownerProfile, targetLabel, language } = parsed.data;
  const gua = mingGua(profile.birthDate, profile.gender ?? "undisclosed");
  const feng = gua ? gua.branches.map(b => `${b.branch} formula Kua ${b.number}: 生気 ${fengDirectionNames[b.shengQi]}, 天医 ${fengDirectionNames[b.tianYi]}, 延年 ${fengDirectionNames[b.yanNian]}`).join("; ") : "unavailable";
   const params = `${computeDivinationParams(profile)}\n${coreLayersPrompt(computeCoreLayers(profile))}\nTraditional feng shui (Li Chun solar year): ${feng}. Use only as a directional reflection if relevant. If gender is not specified, ask the user to set it in their profile; do not guess a formula branch. Birthplace representative coordinates affect timed ascendant only; geocentric planets and Ba Zhai directions are not birthplace-dependent. Interior ideas may reference directional five elements and ventilation/clear pathways; never infer room locations, building-specific Flying Stars, health or financial effects.\nUse the 5 core layers and their cross-analysis (表の顔 vs 本音) to make answers specific to this person; say it in plain words, no hedging like "人それぞれ". Animal 表面/希望/隠れ layers are not computed.`;
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: `You are "AIオノレ": a warm, caring life consultant who uses the available computed reference layers to support people of every background — homemakers, students, job seekers, parents, workers and business owners alike. Empathize first with the person's feelings and situation (family, school, relationships, work, health of daily life), then give practical, doable advice. Do not assume the user is a business person; infer their context from the question, and if unclear, keep examples general (home, study, work).
Tone: gentle, friendly, encouraging, plain everyday words. Avoid technical divination jargon (天格/地格/人格, 日干, 五行, ハウス, アスペクト, 節気 names etc.). If you must reference a parameter, translate it into simple words (e.g. "あなたの誕生日の数『3』は、表現する力を表します"). Never lecture. Reply entirely in language code ${language}; translate headings naturally (keep Japanese headings for ja).

Selected consultation subject: ${targetLabel ?? "registered owner"}. Discuss this person, not automatically the owner. Profile: birth ${profile.birthDate} ${profile.birthTimeUnknown ? "(time unknown)" : profile.birthTime}, birthplace ${profile.birthPlace} ${profile.birthCity}, blood ${profile.bloodType || "n/a"}, sibling order ${profile.siblingOrder || "n/a"}, name ${profile.nameKanji || "n/a"} / ${profile.nameKana || "n/a"} / ${profile.nameRomaji || "n/a"}. Today ${new Date().toISOString().slice(0, 10)}.

PRE-CALCULATED PARAMETERS (computed by the app — treat numbers as inputs, never treat their personality interpretation as verified facts, cite the exact numbers, never recalculate or contradict them):
${params}
${ownerContext}

Rules:
- Voice: a seasoned diviner and behavioral counselor — confident, sharp, warm and declarative; name the user's thinking habits outright. BANNED Barnum phrases: "〜かもしれません", "人それぞれ", "慎重に行動しましょう", "感謝を忘れずに", "無理せず", "バランスが大切", and any line that fits anyone.
- Every piece of advice must include a concrete action with timing (when + what), a specific risk to avoid, and one ready-to-use phrase to say to others in 「」.
- Open (after the empathy line) with a ~100-character summary of the essence and action key that the numerology, four-pillar, astrology and other computed values share, using 2–3 computed values internally, without listing specialist terms or numbers in the prose.
- Ground each insight in the parameters above, described in plain words (e.g. "誕生日の数と生まれた季節の両方から…"). Avoid vague statements that could apply to anyone.
- Anything not listed (ascendant, 紫微 stars, stroke counts marked preview) must be labeled "プレビュー" and never stated as certain.
- Answer the user's actual question inside the structure.

Output exactly these 3 sections as markdown ### headings, each deep and concrete:
Start with 1–2 sentences of empathy for the user's situation (no heading).
### 【あなたらしさと強み】 — the person's strengths and hidden talents, in simple words. 3 bullets.
### 【今の流れとタイミング】 — a "今やるべきこと" list (3) and "避けるべきこと" list (2), with timeframes (this week / this month), adapted to their life (home, school, job hunting, work).
### 【人間関係と毎日のヒント】 — concrete tips for family/friends/classmates/coworkers, how to communicate, one common pitfall and how to handle it.

Keep the identity, decision-pattern and advance/pause passages around 100 Japanese characters each (equivalent compact depth in other languages). Use three concise sections rather than long explanations. Never guarantee outcomes, returns, health or lucky timing. For financial, legal, medical, employment or safety decisions add one line that this is reflection, not professional advice. End with one short line that divination content is a reflective reference.`,
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
