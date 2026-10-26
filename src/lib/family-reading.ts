import { z } from 'zod';
import { familyFeatures } from './family-features';
export const familyReadingSchema = z.object({ matrix: z.string().min(120), layers: z.string().min(120), friction: z.string().min(120), roadmap: z.string().min(120), consult: z.string().min(120), colors: z.string().min(120) });
export const familyReadingWireSchema = z.object({matrix:z.string(),layers:z.string(),friction:z.string(),roadmap:z.string(),consult:z.string(),colors:z.string()});
export type FamilyReading = z.infer<typeof familyReadingSchema>;
export const familyReadingInput = z.object({ groupId: z.string().uuid().nullable(), language: z.enum(['ja','en','zh-CN','zh-TW','ko','es','fr']), day: z.string().date() });
export const familyFingerprint = (input: unknown) => JSON.stringify(['family-v1', input]);
export function completeFamilyReading(value: unknown) { return familyReadingSchema.parse(value); }
export const familyReadingKeys = familyFeatures;