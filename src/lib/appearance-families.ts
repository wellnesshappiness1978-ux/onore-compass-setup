import type { Plan } from './design-modes';
export type AppearanceFamily = 'minimal' | 'celestial' | 'sacred' | 'harmony' | 'sovereign' | 'royal';
export const appearanceFamilies: AppearanceFamily[] = ['minimal', 'celestial', 'sacred', 'harmony', 'sovereign', 'royal'];
export const selectableAppearanceFamilies: AppearanceFamily[] = ['minimal', 'celestial', 'sacred', 'harmony', 'sovereign'];
export const appearancePlan: Record<AppearanceFamily, Plan> = { minimal: 'free', celestial: 'standard', sacred: 'vip', harmony: 'b2b', sovereign: 'b2b-premium', royal: 'b2b-premium' };
/** Visual identity only. Legacy b2b is Family, never a corporate entitlement. */
export function appearanceForPlan(plan: Plan, corporateContract = false): AppearanceFamily {
  if (corporateContract) return 'royal';
  return ({ free: 'minimal', standard: 'celestial', vip: 'sacred', b2b: 'harmony', 'b2b-premium': 'sovereign' } as const)[plan];
}
export const appearanceNames: Record<AppearanceFamily, string> = {
  minimal: 'Standard Minimal', celestial: 'Celestial Radiance', sacred: 'VIP Sacred Compass', harmony: 'Harmony Cosmos', sovereign: 'Royal Family Sovereign', royal: 'Royal Sovereign',
};
