import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { familyReadingInput } from './family-reading';
export const readFamilyReading = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => familyReadingInput.parse(input)).handler(async ({ data, context }) => {
  const { familyReadingOperation } = await import('./family-reading.server');
  return familyReadingOperation(context, data, false);
});
export const generateFamilyReading = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => familyReadingInput.parse(input)).handler(async ({ data, context }) => {
  const { familyReadingOperation } = await import('./family-reading.server');
  return familyReadingOperation(context, data, true);
});