import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Public Firebase web identifiers (designed to be shipped to browsers). */
export const FIREBASE_WEB_APP_ID = "1:148958895045:web:9e4aad38ac1947802289ac";
export const FIREBASE_VAPID_KEY = "BG1xxIP4e0_8oTNIeikeosm5OptNlrvdjoVtaZ989xEnSHirY8YmjgbDCWX1j8VzJ9HqhnsUQ2a9a7acjCBsbw8";

export const getPushConfig = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env.GOOGLE_API_KEY ?? "";
  return { apiKey, appId: FIREBASE_WEB_APP_ID, vapidKey: FIREBASE_VAPID_KEY, projectId: "", ready: Boolean(apiKey) };
});

const reminder = z.object({ on: z.boolean(), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), title: z.string().max(200), body: z.string().max(600) });
const deviceInput = z.object({
  token: z.string().min(20).max(4096),
  timezone: z.string().min(1).max(64),
  language: z.string().min(2).max(10),
  paused: z.boolean(),
  reminders: z.record(z.string().max(64), reminder).refine((r) => Object.keys(r).length <= 40),
});

export const savePushDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deviceInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("push_devices").upsert({
      token: data.token, user_id: context.userId, timezone: data.timezone, language: data.language,
      paused: data.paused, reminders: data.reminders, updated_at: new Date().toISOString(),
    }, { onConflict: "token" });
    if (error) throw error;
    return { ok: true };
  });

export const removePushDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ token: z.string().min(20).max(4096) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("push_devices").delete().eq("token", data.token).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
