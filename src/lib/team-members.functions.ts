import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const memberInput = z.object({
  name: z.string().trim().min(1).max(60),
  birthDate: z.string().date(),
  gender: z.enum(["female", "male", "other", "undisclosed"]),
  bloodType: z.enum(["", "A", "B", "O", "AB"]),
  role: z.string().trim().max(60),
  skills: z.array(z.string().trim().min(1).max(30)).max(12),
});

type Row = { id: string; name: string; birth_date: string; gender: string; blood_type: string; role: string; skills: string[] };
const toMember = (r: Row) => ({ id: r.id, name: r.name, birthDate: r.birth_date, gender: r.gender, bloodType: r.blood_type, role: r.role, skills: r.skills });

export const listTeamMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("team_members").select("id,name,birth_date,gender,blood_type,role,skills").eq("user_id", context.userId).order("created_at");
    if (error) throw error;
    return (data ?? []).map(toMember);
  });

export const addTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => memberInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("team_members").insert({
      user_id: context.userId, name: data.name, birth_date: data.birthDate, gender: data.gender,
      blood_type: data.bloodType, role: data.role, skills: data.skills,
    }).select("id,name,birth_date,gender,blood_type,role,skills").single();
    if (error) throw error;
    return toMember(row);
  });

export const deleteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("team_members").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
