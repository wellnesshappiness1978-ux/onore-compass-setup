import limits from './plan-consultation-limits.json';
import { normalizePlan } from './plan-identity';
import type { Plan } from './design-modes';

/** The only maintained daily-cap configuration; database SQL is generated from it. */
export const PLAN_CONSULTATION_LIMITS = Object.freeze(Object.fromEntries(Object.entries(limits).map(([plan, cap]) => [plan, cap === null ? Infinity : cap]))) as Readonly<Record<Plan, number>>;
/** Compatibility's existing policy is independent of the revised consultation policy. */
export const PLAN_COMPATIBILITY_LIMITS: Readonly<Record<Plan, number>> = Object.freeze({ free: 1, standard: 3, vip: 10, b2b: 30, 'b2b-premium': 100 });
export const getFeatureUsageLimit = (feature: 'consultation' | 'compatibility', plan: unknown) => (feature === 'consultation' ? PLAN_CONSULTATION_LIMITS : PLAN_COMPATIBILITY_LIMITS)[normalizePlan(plan)];
export const getPlanConsultationLimit = (plan: unknown): number => PLAN_CONSULTATION_LIMITS[normalizePlan(plan)];
export const remainingUses = (limit: number, used: number) => Math.max(0, limit - Math.max(0, used));