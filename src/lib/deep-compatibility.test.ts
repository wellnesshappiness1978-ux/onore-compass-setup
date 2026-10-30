import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withDeepCompatibilityAccess } from './deep-compatibility-access';
const generate=vi.fn();
describe('server deep compatibility entitlement',()=>{
 beforeEach(()=>vi.clearAllMocks());
 it.each(['free','standard'])('%s cannot invoke AI',async plan=>{expect(await withDeepCompatibilityAccess(plan,generate)).toEqual({ok:false,locked:true});expect(generate).not.toHaveBeenCalled();});
 it.each(['vip','b2b','b2b-premium'])('%s returns all four domains',async plan=>{const report={values:'value',communication:'conversation',romance:'romance',longTerm:'long-term'};generate.mockResolvedValue(report);expect(await withDeepCompatibilityAccess(plan,generate)).toEqual({ok:true,report});expect(generate).toHaveBeenCalledTimes(1);});
});