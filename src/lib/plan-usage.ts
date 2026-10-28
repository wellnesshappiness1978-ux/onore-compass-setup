import limits from './plan-consultation-limits.json';
import { normalizePlan } from './plan-identity';
import type { Plan } from './design-modes';

/** The only maintained daily-cap configuration; database SQL is generated from it. */
export const PLAN_CONSULTATION_LIMITS: Readonly<Record<Plan, number>> = Object.freeze(limits);
export const getPlanConsultationLimit = (plan: unknown): number => PLAN_CONSULTATION_LIMITS[normalizePlan(plan)];
export const remainingUses = (limit: number, used: number) => Math.max(0, limit - Math.max(0, used));