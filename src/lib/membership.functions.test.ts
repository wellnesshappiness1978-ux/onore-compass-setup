import { expect,it,vi } from 'vitest';
import { readEffectiveMembership } from './membership-plan.server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
it('reads effective Family Premium without claiming or rewriting membership on every refresh',async()=>{
 const rpc=vi.fn().mockResolvedValue({data:'b2b-premium',error:null});
 for(let i=0;i<3;i++) expect(await readEffectiveMembership({rpc} as unknown as SupabaseClient<Database>)).toBe('b2b-premium');
 expect(rpc.mock.calls).toEqual([['my_membership_plan'],['my_membership_plan'],['my_membership_plan']]);
});