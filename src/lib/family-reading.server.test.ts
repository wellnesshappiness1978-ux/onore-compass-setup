import { beforeEach,expect,it,vi } from 'vitest';
const mocks=vi.hoisted(()=>({call:vi.fn(),adminFrom:vi.fn()}));
vi.mock('./ai/responses.server',()=>({createResponsesCall:mocks.call}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:mocks.adminFrom}}));
import { familyReadingOperation } from './family-reading.server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
const input={groupId:null,language:'ja' as const,day:'2026-10-26'};
const six=Object.fromEntries(['matrix','layers','friction','roadmap','directions','rhythm'].map(k=>[k,'診断'.repeat(80)]));
function context(saved:unknown,plan='b2b') {
 const datasets:Record<string,unknown>={plan_memberships:{plan},profiles:{birth_date:'1980-02-12',name_kanji:'A',name_kana:'',name_romaji:'A',birth_time:null,birth_time_unknown:true,birth_place:'東京都',birth_city:'',gender:'male',blood_type:'',sibling_order:'',parents:null,goal:'尊重'},team_members:[{id:'b',name:'B',birth_date:'1988-08-10',birth_time_unknown:true,birth_place:'東京都',skills:[],parents:null}],family_readings:saved};
 const from=vi.fn((table:string)=>{const result={data:datasets[table],error:null};const q={select:()=>q,eq:()=>q,order:()=>Promise.resolve(result),single:()=>Promise.resolve(result),maybeSingle:()=>Promise.resolve(result)};return q;});
 return {supabase:{from} as unknown as SupabaseClient<Database>,userId:'owner'};
}
beforeEach(()=>{vi.clearAllMocks();});
it('reads the same saved six fields without generating again',async()=>{
 const value={status:'complete',result:six,error:null};
 expect(await familyReadingOperation(context(value),input,true)).toEqual(value);
 expect(mocks.call).not.toHaveBeenCalled();expect(mocks.adminFrom).not.toHaveBeenCalled();
});
it.each(['pending','failed'])('never automatically regenerates a %s record',async status=>{
 await familyReadingOperation(context({status,result:null,error:null}),input,true);
 expect(mocks.call).not.toHaveBeenCalled();expect(mocks.adminFrom).not.toHaveBeenCalled();
});
it('rejects actual Free membership before any paid call',async()=>{
 await expect(familyReadingOperation(context(null,'free'),input,true)).rejects.toThrow('Family plan required');
 expect(mocks.call).not.toHaveBeenCalled();
});
it('a competing unique lock never starts another AI request',async()=>{
 mocks.adminFrom.mockReturnValue({insert:vi.fn().mockResolvedValue({error:{code:'23505'}})});
 await familyReadingOperation(context(null),input,true);
 expect(mocks.call).not.toHaveBeenCalled();
});
it('generates exactly once and saves all six fields together',async()=>{
 const updates:unknown[]=[];
 mocks.adminFrom.mockReturnValue({insert:vi.fn().mockResolvedValue({error:null}),update:(value:unknown)=>{updates.push(value);const q={eq:()=>q,then:(resolve:(v:unknown)=>unknown)=>Promise.resolve({error:null}).then(resolve)};return q;}});
 mocks.call.mockReturnValue({result:{output:Promise.resolve(six)}});
 const result=await familyReadingOperation(context(null),input,true);
 expect(mocks.call).toHaveBeenCalledTimes(1);expect(result?.result).toEqual(six);
 expect(updates).toEqual([expect.objectContaining({status:'complete',result:six})]);
});