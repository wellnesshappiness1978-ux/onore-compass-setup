import type { Plan } from './design-modes';

/** Normalize external labels at the boundary; canonical persisted IDs stay unchanged. */
export function parsePlanIdentity(value: unknown): Plan | null {
  if (typeof value !== 'string') return null;
  const key = value.normalize('NFKC').trim().toLowerCase().replace(/[\s_-]+/g, '');
  const aliases: Record<string, Plan> = {
    free: 'free', freemember: 'free', '無料': 'free', '無料会員': 'free',
    standard: 'standard', standardmember: 'standard', 'スタンダード': 'standard', 'スタンダード会員': 'standard',
    vip: 'vip', vipmember: 'vip', 'vip会員': 'vip',
    b2b: 'b2b', business: 'b2b', corporate: 'b2b', family: 'b2b', familymember: 'b2b', 'ファミリー': 'b2b', 'ファミリー会員': 'b2b',
    b2bpremium: 'b2b-premium', businesspremium: 'b2b-premium', corporatepremium: 'b2b-premium', familypremium: 'b2b-premium', familypremiummember: 'b2b-premium', 'ファミリープレミアム': 'b2b-premium', 'ファミリープレミアム会員': 'b2b-premium',
  };
  return Object.hasOwn(aliases, key) ? aliases[key] ?? null : null;
}

/** Missing/unknown memberships never grant paid access. */
export const normalizePlan = (value: unknown): Plan => parsePlanIdentity(value) ?? 'free';