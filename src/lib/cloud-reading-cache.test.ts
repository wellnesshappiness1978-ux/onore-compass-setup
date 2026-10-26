import { beforeEach,expect,it,vi } from 'vitest';
import { z } from 'zod';
const mock=vi.hoisted(()=>({session:vi.fn(),from:vi.fn(),upsert:vi.fn(),maybeSingle:vi.fn(),eq:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{auth:{getSession:mock.session},from:mock.from}}));
import { readCloudReading,saveCloudReading } from './cloud-reading-cache';
beforeEach(()=>{vi.clearAllMocks();mock.session.mockResolvedValue({data:{session:{user:{id:'owner'}}}});const q={select:()=>q,eq:mock.eq,m aybeSingle:mock.maybeSingle};mock.eq.mockReturnValue(q);mock.from.mockReturnValue({...q,upsert:mock.upsert});mock.upsert.mockResolvedValue({error:null});});
it('guest cache never writes private cloud rows',async()=>{mock.session.mockResolvedValue({data:{session:null}});await saveCloudReading('guest-key',{});expect(mock.from).not.toHaveBeenCalled();});
it('copies a result under a short hashed key once, retaining exact private identity',async()=>{
 await saveCloudReading('onore-reading:test-original',{text:'saved'});await saveCloudReading('onore-reading:test-original',{text:'saved'});
 expect(mock.upsert).toHaveBeenCalledTimes(1);expect(mock.upsert).toHaveBeenCalledWith(expect.objectContaining({user_id:'owner',cache_key:expect.stringMatching(/^[a-f0-9]{64}$/),local_key:'onore-reading:test-original',result:{text:'saved'}}));
});
it('reads persisted data without another AI call',async()=>{mock.maybeSingle.mockResolvedValue({data:{result:{text:'saved'}},error:null});expect(await readCloudReading('key',z.object({text:z.string()}))).toEqual({text:'saved'});expect(mock.eq).toHaveBeenCalledWith('user_id','owner');});
it('a failed cloud lookup is an error, not a missing result that causes paid generation',async()=>{mock.maybeSingle.mockResolvedValue({data:null,error:new Error('offline')});await expect(readCloudReading('key',z.object({text:z.string()}))).rejects.toThrow('offline');});