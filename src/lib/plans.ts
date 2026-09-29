import type { Plan } from "./design-modes";

export const planOrder: Plan[] = ["free", "standard", "vip", "b2b", "b2b-premium"];
const rank = (plan: Plan) => planOrder.indexOf(plan);

/** Registered-member (関係者) limits per plan. UI-only until real billing exists. */
export const memberLimit: Record<Plan, number> = { free: 0, standard: 2, vip: 5, b2b: 30, "b2b-premium": 100 };

export type TeamFeature = "roster" | "teamDiagnosis" | "draft" | "catalog" | "calendar" | "balance" | "oneOnOne";
const featureMin: Record<TeamFeature, Plan> = {
  roster: "standard",
  teamDiagnosis: "vip",
  draft: "b2b",
  catalog: "b2b",
  calendar: "b2b",
  balance: "b2b",
  oneOnOne: "b2b",
};
export const hasFeature = (plan: Plan, feature: TeamFeature) => rank(plan) >= rank(featureMin[feature]);
export const requiredPlanFor = (feature: TeamFeature) => featureMin[feature];
/** Smallest plan whose member limit fits `count`. */
export const planForCount = (count: number): Plan => planOrder.find((p) => memberLimit[p] >= count) ?? "b2b-premium";
export const nextPlan = (plan: Plan): Plan => planOrder[Math.min(rank(plan) + 1, planOrder.length - 1)]!;
