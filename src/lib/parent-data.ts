import { z } from "zod";

/** One backward-compatible parent contract for forms, persistence and readings. */
export const parentBirthSchema = z.object({
  birthDate: z.string().date(),
  birthPlace: z.string().max(80).default(""),
  birthCity: z.string().max(80).default(""),
}).passthrough();
export type ParentBirth = z.infer<typeof parentBirthSchema>;
export const emptyParent: ParentBirth = { birthDate: "", birthPlace: "", birthCity: "" };
export function validParent(value: unknown): ParentBirth | null {
  if (value == null) return null;
  // Reject an entered invalid date rather than silently deleting the record.
  return parentBirthSchema.parse(value);
}
export const optionalParentSchema = parentBirthSchema.nullable().optional();
export function parentsToRow(value: { father?: ParentBirth | null; mother?: ParentBirth | null }) {
  return value.father || value.mother ? { father: value.father ?? null, mother: value.mother ?? null } : null;
}
export function parentsFromRow(value: unknown) {
  const row = z.object({ father: optionalParentSchema, mother: optionalParentSchema }).nullable().parse(value ?? null);
  return { father: row?.father ?? null, mother: row?.mother ?? null };
}