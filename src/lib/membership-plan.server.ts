import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { normalizePlan } from './plan-identity';
/** Read-only authoritative resolution; claiming on refresh can create a Realtime write loop. */
export async function readEffectiveMembership(supabase: SupabaseClient<Database>) {
  const {data,error}=await supabase.rpc('my_membership_plan');
  if(error) throw error;
  return normalizePlan(data);
}