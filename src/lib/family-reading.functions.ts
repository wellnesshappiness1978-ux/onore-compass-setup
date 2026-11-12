import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { familyReadingInput } from './family-reading';
import { z } from 'zod';
export const readFamilyReading = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => familyReadingInput.parse(input)).handler(async ({ data, context }) => {
  const { familyReadingOperation } = await import('./family-reading.server');
  return familyReadingOperation(context, data, false);
});
export const generateFamilyReading = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => familyReadingInput.extend({retryFailed:z.boolean().optional().default(false)}).parse(input)).handler(async ({ data, context }) => {
  const { familyReadingOperation } = await import('./family-reading.server');
  const {retryFailed,...input} = data;
  return familyReadingOperation(context, input, true, retryFailed);
});