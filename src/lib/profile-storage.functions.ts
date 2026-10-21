import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileSchema = z.object({
  nameKanji: z.string().max(40),
  nameKana: z.string().max(60),
  nameRomaji: z.string().regex(/^(?:[A-Za-z][A-Za-z\s'-]*)?$/).max(60),
  gender: z.enum(["female", "male", "other", "undisclosed"]),
  birthCity: z.string().max(80),
  birthDate: z.string().date(),
  birthTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).or(z.literal("")),
  birthTimeUnknown: z.boolean(),
  birthPlace: z.string().min(1).max(80),
  bloodType: z.enum(["", "A", "B", "O", "AB"]),
  siblingOrder: z.string().trim().max(80),
}).refine((p) => p.birthTimeUnknown || Boolean(p.birthTime), { message: "Birth time is required unless unknown" });

export type StoredProfileInput = z.infer<typeof profileSchema>;

export const readMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("profiles").select("*").eq("user_id", context.userId).maybeSingle();
    if (error) throw error;
    if (!data?.birth_date) return null;
    return {
      nameKanji: data.name_kanji,
      nameKana: data.name_kana,
      nameRomaji: data.name_romaji,
      gender: data.gender as StoredProfileInput["gender"],
      birthCity: data.birth_city,
      birthDate: data.birth_date,
      birthTime: data.birth_time?.slice(0, 5) ?? "",
      birthTimeUnknown: data.birth_time_unknown,
      birthPlace: data.birth_place,
      bloodType: data.blood_type,
      siblingOrder: data.sibling_order,
    };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      user_id: context.userId,
      name_kanji: data.nameKanji.trim(),
      name_kana: data.nameKana.trim(),
      name_romaji: data.nameRomaji.trim().toUpperCase(),
      gender: data.gender,
      birth_city: data.birthCity.trim(),
      birth_date: data.birthDate,
      birth_time: data.birthTimeUnknown ? null : data.birthTime,
      birth_time_unknown: data.birthTimeUnknown,
      birth_place: data.birthPlace,
      blood_type: data.bloodType,
      sibling_order: data.siblingOrder,
      profile_version: crypto.randomUUID(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw error;
    return { ok: true };
  });