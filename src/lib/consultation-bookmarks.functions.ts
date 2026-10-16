import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listConsultationBookmarks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("consultation_bookmarks")
      .select("message_id,content,language,created_at").eq("user_id", context.userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const saveConsultationBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ messageId: z.string().min(1).max(200), content: z.string().min(1).max(30000), language: z.enum(["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("consultation_bookmarks").upsert({ user_id: context.userId, message_id: data.messageId, content: data.content, language: data.language }, { onConflict: "user_id,message_id", ignoreDuplicates: true });
    if (error) throw error;
    return { ok: true };
  });

export const deleteConsultationBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ messageId: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("consultation_bookmarks").delete().eq("user_id", context.userId).eq("message_id", data.messageId);
    if (error) throw error;
    return { ok: true };
  });