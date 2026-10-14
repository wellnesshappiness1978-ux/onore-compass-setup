import { canPreviewDesign, designCopy, type DesignMode, type Plan } from './design-modes';
import { appearanceFamilies, appearancePlan, type AppearanceFamily } from './appearance-families';

export type AppearanceSelection = { background: AppearanceFamily; parts: AppearanceFamily; icons: AppearanceFamily };
export const defaultAppearance: AppearanceSelection = { background: 'minimal', parts: 'minimal', icons: 'minimal' };
export const appearanceStorageKey = 'onore-appearance-parts';
export function canUseAppearance(plan: Plan, family: AppearanceFamily, corporateContract = false) {
  if (family === 'royal') return corporateContract;
  const order: Plan[] = ['free', 'standard', 'vip', 'b2b', 'b2b-premium'];
  return order.indexOf(plan) >= order.indexOf(appearancePlan[family]);
}
export function readAppearance(raw: string | null): AppearanceSelection {
  try {
    const parsed = JSON.parse(raw ?? '{}');
    return Object.fromEntries(Object.keys(defaultAppearance).map(key => [key, appearanceFamilies.includes(parsed?.[key]) ? parsed[key] : 'minimal'])) as AppearanceSelection;
  } catch { return { ...defaultAppearance }; }
}
export function allowedAppearance(saved: AppearanceSelection, plan: Plan): AppearanceSelection {
  return Object.fromEntries(Object.entries(saved).map(([key, family]) => [key, canUseAppearance(plan, family) ? family : 'minimal'])) as AppearanceSelection;
}
export function readDesign(raw: string | null): DesignMode {
  return raw && Object.hasOwn(designCopy.ja.names, raw) ? raw as DesignMode : 'classic';
}
export const allowedDesign = (saved: DesignMode, plan: Plan) => canPreviewDesign(plan, saved) ? saved : 'classic';
export const decorationTier = (family: AppearanceFamily): Plan => appearancePlan[family];
