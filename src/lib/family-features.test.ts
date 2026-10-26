import { expect, it } from "vitest";
import { canUseFamilyFeature, familyFeatures } from "./family-features";
it('contains exactly the six requested analyses without duplicated consultation or color entries',()=>{
  expect(familyFeatures).toEqual(['matrix','layers','friction','roadmap','directions','rhythm']);
});
it.each(["b2b", "b2b-premium"] as const)("%s unlocks all six Family functions", plan => {
  expect(familyFeatures).toHaveLength(6);
  expect(familyFeatures.map(f => canUseFamilyFeature(plan, f))).toEqual([true,true,true,true,true,true]);
});
it.each(["free", "standard", "vip"] as const)("%s cannot unlock Family functions", plan => {
  expect(familyFeatures.map(f => canUseFamilyFeature(plan, f))).toEqual([false,false,false,false,false,false]);
});