import { describe, expect, it, vi } from 'vitest';
import { consultationSettlement, consultationSucceeded } from './consultation-accounting';
const complete = { isAborted:false, outcome:{status:'completed'}, finishReason:'stop', responseMessage:{parts:[{type:'text',text:'A useful answer'}]} };
describe('success-only consultation consumption', () => {
  it('consumes a completed nonempty answer',()=>expect(consultationSucceeded(complete)).toBe(true));
  it.each(['failed','aborted','unknown'])('%s consumes nothing',status=>expect(consultationSucceeded({...complete,outcome:{status}})).toBe(false));
  it('cancelled delivery consumes nothing',()=>expect(consultationSucceeded({...complete,isCancelled:true})).toBe(false));
  it('user stop consumes nothing',()=>expect(consultationSucceeded({...complete,isAborted:true})).toBe(false));
  it.each(['length','error','content-filter'])('%s termination consumes nothing',finishReason=>expect(consultationSucceeded({...complete,finishReason})).toBe(false));
  it('empty or reasoning-only replies consume nothing',()=>expect(consultationSucceeded({...complete,responseMessage:{parts:[{type:'reasoning',text:'thinking'},{type:'text',text:'  '}]}})).toBe(false));
  it('simultaneous abort and completion settle once without counting',async()=>{
    const write=vi.fn(async (_success:boolean)=>0); const settle=consultationSettlement(write);
    await Promise.all([settle(false),settle(true)]); expect(write).toHaveBeenCalledTimes(1); expect(write).toHaveBeenCalledWith(false);
  });
  it('duplicate successful completion counts once',async()=>{
    let used=9; const settle=consultationSettlement(async success=>{if(success)used+=1;});
    await Promise.all([settle(true),settle(true)]); expect(used).toBe(10);
  });
});