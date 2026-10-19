import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { groupInput } from './family-capacity';
type Row = { id: string; name: string; nickname: string; member_ids: string[] };
const toGroup = (r: Row) => ({ id: r.id, name: r.name, nickname: r.nickname, memberIds: r.member_ids ?? [] });

export const listTeamGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("team_groups").select("id,name,nickname,member_ids").eq("user_id", context.userId).order("created_at");
    if (error) throw error;
    return (data ?? []).map(toGroup);
  });

export const addTeamGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => groupInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("team_groups").insert({ user_id: context.userId, name: data.name, nickname: data.nickname, member_ids: data.memberIds }).select("id,name,nickname,member_ids").single();
    if (error) throw new Error(error.code === "23514" ? (error.message.includes('GROUP_MEMBER_LIMIT') ? 'GROUP_MEMBER_LIMIT' : 'GROUP_LIMIT') : error.message);
    return toGroup(row);
  });

export const updateTeamGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => groupInput.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("team_groups").update({ name: data.name, nickname: data.nickname, member_ids: data.memberIds }).eq("id", data.id).eq("user_id", context.userId).select("id,name,nickname,member_ids").single();
    if (error) throw new Error(error.code === "23514" ? (error.message.includes('GROUP_MEMBER_LIMIT') ? 'GROUP_MEMBER_LIMIT' : 'GROUP_LIMIT') : error.message);
    return toGroup(row);
  });

export const deleteTeamGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("team_groups").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

const focusInput = z.object({
  goal: z.string().trim().max(200),
  goalPreset: z.string().max(30),
  targetKind: z.enum(["self", "family", "group"]),
  targetId: z.string().uuid().nullable(),
});
export const getFocus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("profiles").select("goal,goal_preset,target_kind,target_id").eq("user_id", context.userId).maybeSingle();
    if (!data) return null;
    return { goal: data.goal, goalPreset: data.goal_preset, targetKind: (["self", "family", "group"].includes(data.target_kind) ? data.target_kind : "self") as "self" | "family" | "group", targetId: data.target_id };
  });
export const saveFocus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => focusInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update({ goal: data.goal, goal_preset: data.goalPreset, target_kind: data.targetKind, target_id: data.targetId }).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
