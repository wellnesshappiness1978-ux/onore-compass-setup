import type { Plan } from './design-modes';
export type AppearanceFamily = 'minimal' | 'celestial' | 'sacred' | 'royal';
export const appearanceFamilies: AppearanceFamily[] = ['minimal', 'celestial', 'sacred', 'royal'];
/** Visual identity only. Legacy b2b is Family, never a corporate entitlement. */
export function appearanceForPlan(plan: Plan, corporateContract = false): AppearanceFamily {
  if (corporateContract) return 'royal';
  return ({ free: 'minimal', standard: 'celestial', vip: 'sacred', b2b: 'celestial', 'b2b-premium': 'sacred' } as const)[plan];
}
export const appearanceNames: Record<AppearanceFamily, string> = {
  minimal: 'Standard Minimal', celestial: 'Celestial Radiance', sacred: 'VIP Sacred Compass', royal: 'Royal Sovereign',
};
