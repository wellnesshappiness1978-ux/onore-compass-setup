import { z } from "zod";
import { birthColorSpectrum } from "./birth-color-spectrum";
import { biorhythm, pairScore, type TeamMember } from "./team-analysis";
import { groupColorMeaning } from "./group-insight";

/** Minimal member data sent with a group consultation; numbers are recomputed server-side. */
export const groupMemberSchema = z.object({
  name: z.string().trim().min(1).max(40),
  birthDate: z.string().date(),
  birthTime: z.string().max(5).optional().default(""),
  birthTimeUnknown: z.boolean().optional().default(true),
  birthPlace: z.string().max(80).optional().default(""),
  birthCity: z.string().max(80).optional().default(""),
  bloodType: z.string().max(4).optional().default(""),
  gender: z.string().max(20).optional().default("undisclosed"),
  siblingOrder: z.string().max(80).optional().default(""),
  relationship: z.string().max(60).optional().default(""),
  relationshipType: z.string().max(30).optional().default(""),
});
export type GroupMemberInput = z.infer<typeof groupMemberSchema>;

const mix = (codes: string[]) => {
  const v = codes.filter(c => /^#[0-9a-f]{6}$/i.test(c));
  if (!v.length) return null;
  const s = v.reduce((a, c) => [a[0]! + parseInt(c.slice(1, 3), 16), a[1]! + parseInt(c.slice(3, 5), 16), a[2]! + parseInt(c.slice(5, 7), 16)], [0, 0, 0]);
  return `#${s.map(x => Math.round(x / v.length).toString(16).padStart(2, "0")).join("")}`;
};

/** Deterministic English summary of a group for the AI prompt (same formulas as the group card). */
export function buildGroupContext(name: string, input: GroupMemberInput[], day: string): string {
  if (!input.length) return `Group "${name}" has no members yet.`;
  const members: TeamMember[] = input.map((m, i) => ({ id: String(i), name: m.name, birthDate: m.birthDate, birthTime: m.birthTime, birthTimeUnknown: m.birthTimeUnknown, birthPlace: m.birthPlace, birthCity: m.birthCity, bloodType: m.bloodType, gender: m.gender, siblingOrder: m.siblingOrder, relationship: m.relationship, relationshipType: m.relationshipType, role: "", skills: [] }));
  const colors = members.map(m => birthColorSpectrum({ birthDate: m.birthDate, birthTime: m.birthTime ?? "", birthTimeUnknown: m.birthTimeUnknown ?? true, birthPlace: m.birthPlace ?? "" })?.main ?? null);
  const hex = mix(colors.map(c => c?.code ?? ""));
  const meaning = hex ? groupColorMeaning(hex, "en") : null;
  const pct = (v: number) => Math.round((v + 1) * 50);
  const rh = members.map(m => ({ m, r: biorhythm(m.birthDate, day) })).sort((a, b) => b.r.total - a.r.total);
  const avg = Math.round(rh.reduce((a, x) => a + x.r.total, 0) / rh.length);
  const pairs: string[] = []; const scored: { a: string; b: string; s: number }[] = [];
  for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) scored.push({ a: members[i]!.name, b: members[j]!.name, s: pairScore(members[i]!, members[j]!) });
  scored.sort((x, y) => y.s - x.s).forEach(p => pairs.push(`${p.a} × ${p.b}: ${p.s}/100`));
  const top = rh[0]!, low = rh[rh.length - 1]!;
  return [
    `GROUP CONSULTATION — group "${name}", ${members.length} members. Advise the group as a whole and refer to members by name.`,
    `Members: ${members.map((m, i) => `${m.name} (born ${m.birthDate}${m.birthPlace ? `, birth region ${m.birthPlace}` : ""}${m.birthCity ? `, birth municipality ${m.birthCity}` : ""}${m.bloodType ? `, blood ${m.bloodType}` : ""}${m.siblingOrder ? `, sibling ${m.siblingOrder}` : ""}${m.relationshipType ? `, relationship type ${m.relationshipType}` : ""}${m.relationship ? `, relation ${m.relationship}` : ""}, birth color ${colors[i] ? `${colors[i]!.name} ${colors[i]!.code}` : "n/a"})`).join("; ")}.`,
    meaning ? `Group color: ${meaning.name} ${hex}. Essence: ${meaning.essence} Energy: ${meaning.energy} Role: ${meaning.role} Advice: ${meaning.advice}` : "Group color: not available.",
    `Today's (${day}) group average rhythm: ${avg}/100. Per member (body/emotion/mind/total): ${rh.map(x => `${x.m.name} ${pct(x.r.physical)}/${pct(x.r.emotional)}/${pct(x.r.intellectual)}/${x.r.total}`).join("; ")}.`,
    `Most momentum today: ${top.m.name} (${top.r.total}).${rh.length > 1 && low.r.total < 45 ? ` Needs care today: ${low.m.name} (${low.r.total}).` : ""}`,
    pairs.length ? `Compatibility map (highest first): ${pairs.join("; ")}.` : "Only one member, so no pair compatibility.",
    `Use these reference values as evidence: suggest concrete role assignments, who should pair up for which task, how to support low-rhythm members, and how to use the group color's strengths. Values are symbolic reference calculations, not verified facts.`,
  ].join("\n");
}
