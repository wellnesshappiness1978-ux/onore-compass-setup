import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({plan:'free',generate:vi.fn()}));
vi.mock('@tanstack/react-start',()=>({createServerFn:()=>{const b={middleware:()=>b,inputValidator:()=>b,handler:(handler:unknown)=>handler};return b;}}));
vi.mock('@tanstack/react-start/server',()=>({getRequest:()=>new Request('http://localhost:8080')}));
vi.mock('@/integrations/supabase/auth-middleware',()=>({requireSupabaseAuth:{}}));
vi.mock('./membership.functions',()=>({getMyMembership:async()=>mocks.plan}));
vi.mock('./ai/deep-compatibility.server',()=>({generateDeepReport:mocks.generate}));
import { generateDeepCompatibility } from './deep-compatibility.functions';
const run=generateDeepCompatibility as unknown as (arg:{data:unknown})=>Promise<{ok:boolean;locked?:boolean;report?:unknown}>;
describe('server deep compatibility entitlement',()=>{
 beforeEach(()=>vi.clearAllMocks());
 it.each(['free','standard'])('%s cannot invoke AI, including forged VIP inputs',async plan=>{mocks.plan=plan;expect(await run({data:{plan:'vip'}})).toEqual({ok:false,locked:true});expect(mocks.generate).not.toHaveBeenCalled();});
 it.each(['vip','b2b','b2b-premium'])('%s generates all four domains',async plan=>{mocks.plan=plan;const report={values:'value',communication:'conversation',romance:'romance',longTerm:'long-term'};mocks.generate.mockResolvedValue(report);expect(await run({data:{}})).toEqual({ok:true,report});expect(mocks.generate).toHaveBeenCalledTimes(1);});
});