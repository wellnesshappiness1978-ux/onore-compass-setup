import { hasDeepCompatibility } from './plan-benefits';
/** Caller supplies only server-resolved membership, never request/preview plan. */
export async function withDeepCompatibilityAccess<T>(actualPlan: unknown, generate:()=>Promise<T>) {
 if(!hasDeepCompatibility(actualPlan)) return {ok:false as const,locked:true};
 return {ok:true as const,report:await generate()};
}