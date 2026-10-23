import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const memberBase = z.object({
  name: z.string().trim().min(1).max(60),
  nickname: z.string().trim().max(40).default(""),
  nameKana: z.string().trim().max(60),
  birthDate: z.string().date().refine((value) => value >= "1900-01-01" && value <= new Date().toISOString().slice(0, 10)),
  birthTime: z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)]),
  birthTimeUnknown: z.boolean(),
  birthPlace: z.string().trim().max(80),
  birthCity: z.string().trim().max(80),
  siblingOrder: z.string().trim().max(80),
  gender: z.enum(["female", "male", "other", "undisclosed"]),
  bloodType: z.enum(["", "A", "B", "O", "AB"]),
  relationship: z.string().trim().max(60),
  relationshipType: z.enum(["", "partner", "lover", "fiance", "family", "sibling", "relative", "friend", "business", "boss", "subordinate", "employee", "other"]),
  role: z.string().trim().max(60),
  skills: z.array(z.string().trim().min(1).max(30)).max(12),
  father: z.object({ birthDate: z.string().date(), birthPlace: z.string().max(80), birthCity: z.string().max(80) }).nullable().optional(),
  mother: z.object({ birthDate: z.string().date(), birthPlace: z.string().max(80), birthCity: z.string().max(80) }).nullable().optional(),
});
const knownTime = (value: z.infer<typeof memberBase>) => value.birthTimeUnknown || value.birthTime.length > 0;
const memberInput = memberBase.refine(knownTime, { path: ["birthTime"], message: "Birth time is required unless marked unknown" });

type ParentRow = { birthDate: string; birthPlace: string; birthCity: string } | null;
type ParentsRow = { father?: ParentRow; mother?: ParentRow } | null;
type Row = { id: string; name: string; nickname: string; name_kana: string; birth_date: string; birth_time: string | null; birth_time_unknown: boolean; birth_place: string; birth_city: string; sibling_order: string; gender: string; blood_type: string; relationship: string; relationship_type: string; role: string; skills: string[]; parents: unknown };
const columns = "id,name,nickname,name_kana,birth_date,birth_time,birth_time_unknown,birth_place,birth_city,sibling_order,gender,blood_type,relationship,relationship_type,role,skills,parents";
const toMember = (r: Row) => { const parents = (r.parents ?? null) as ParentsRow; return { id: r.id, name: r.name, nickname: r.nickname, nameKana: r.name_kana, birthDate: r.birth_date, birthTime: r.birth_time?.slice(0, 5) ?? "", birthTimeUnknown: r.birth_time_unknown, birthPlace: r.birth_place, birthCity: r.birth_city, siblingOrder: r.sibling_order, gender: r.gender, bloodType: r.blood_type, relationship: r.relationship, relationshipType: r.relationship_type, role: r.role, skills: r.skills, father: parents?.father ?? null, mother: parents?.mother ?? null }; };
const parentsRow = (m: { father?: ParentRow | undefined; mother?: ParentRow | undefined }) => m.father || m.mother ? { father: m.father ?? null, mother: m.mother ?? null } : null;

export const listTeamMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("team_members").select(columns).eq("user_id", context.userId).order("created_at");
    if (error) throw error;
    return (data ?? []).map(toMember);
  });

export const addTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => memberInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("team_members").insert({
      user_id: context.userId, name: data.name, nickname: data.nickname, name_kana: data.nameKana, birth_date: data.birthDate,
      birth_time: data.birthTimeUnknown ? null : data.birthTime, birth_time_unknown: data.birthTimeUnknown,
      birth_place: data.birthPlace, birth_city: data.birthCity, sibling_order: data.siblingOrder, gender: data.gender, blood_type: data.bloodType,
      relationship: data.relationship, relationship_type: data.relationshipType, role: data.role, skills: data.skills, parents: parentsRow(data),
    }).select(columns).single();
    if (error) throw error;
    return toMember(row);
  });

export const updateTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => memberBase.extend({ id: z.string().uuid() }).refine(knownTime, { path: ["birthTime"], message: "Birth time is required unless marked unknown" }).parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...member } = data;
    const { data: row, error } = await context.supabase.from("team_members").update({
      name: member.name, nickname: member.nickname, name_kana: member.nameKana, birth_date: member.birthDate,
      birth_time: member.birthTimeUnknown ? null : member.birthTime, birth_time_unknown: member.birthTimeUnknown,
      birth_place: member.birthPlace, birth_city: member.birthCity, sibling_order: member.siblingOrder, gender: member.gender, blood_type: member.bloodType,
      relationship: member.relationship, relationship_type: member.relationshipType, role: member.role, skills: member.skills, parents: parentsRow(member),
    }).eq("id", id).eq("user_id", context.userId).select(columns).single();
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
