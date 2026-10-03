import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const supportSchema = z.object({ category: z.enum(["bug", "account", "privacy", "other"]), subject: z.string().trim().min(3).max(120), message: z.string().trim().min(10).max(4000), consent: z.literal(true) });
export const submitSupport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => supportSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: recent, error: readError } = await context.supabase.from("support_requests").select("id").eq("user_id", context.userId).gte("created_at", new Date(Date.now() - 3600000).toISOString());
    if (readError) throw new Error("受付状況を確認できません。時間をおいてお試しください。");
    if ((recent?.length ?? 0) >= 5) throw new Error("1時間に5件まで受け付けます。時間をおいてお試しください。");
    const { data: ticket, error } = await context.supabase.from("support_requests").insert({ user_id: context.userId, category: data.category, subject: data.subject, message: data.message }).select("id,status").single();
    if (error || !ticket) throw new Error("送信できませんでした。時間をおいて再度お試しください。");
    return ticket;
  });
export const listMySupport = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("support_requests").select("id,subject,status,created_at").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(20);
  if (error) throw new Error("受付履歴を確認できません。");
  return data ?? [];
});