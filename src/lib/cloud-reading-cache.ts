import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { z } from 'zod';
const digest = async (key:string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key))),v=>v.toString(16).padStart(2,'0')).join('');
export async function readCloudReading<T>(key: string, schema: z.ZodType<T>): Promise<T | undefined> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return;
  const { data, error } = await supabase.from('reading_device_cache').select('result').eq('user_id',session.session.user.id).eq('cache_key',await digest(key)).maybeSingle();
  if (error) throw error; // Offline reads must not turn into another paid generation.
  const parsed = schema.safeParse(data?.result);
  return parsed.success ? parsed.data : undefined;
}
export async function saveCloudReading(key: string, value: unknown) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return;
  const { error } = await supabase.from('reading_device_cache').upsert({user_id:session.session.user.id,cache_key:await digest(key),local_key:key,result:JSON.parse(JSON.stringify(value)) as Json,updated_at:new Date().toISOString()});
  if (error) throw error;
}