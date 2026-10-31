import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const listHelpThreads = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('ai_support_threads').select('id,title,updated_at').eq('user_id', context.userId).order('updated_at', { ascending: false });
  if (error) throw new Error('Could not load conversations.');
  return data ?? [];
});
export const createHelpThread = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('ai_support_threads').insert({ user_id: context.userId }).select('id').single();
  if (error || !data) throw new Error('Could not create conversation.');
  return data;
});
export const readHelpThread = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ context, data }) => {
  const { data: row, error } = await context.supabase.from('ai_support_threads').select('id,title,messages').eq('id', data.id).eq('user_id', context.userId).single();
  if (error || !row) throw new Error('Conversation unavailable.');
  return row;
});