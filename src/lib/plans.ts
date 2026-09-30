import type { Plan } from "./design-modes";

export const planOrder: Plan[] = ["free", "standard", "vip", "b2b", "b2b-premium"];
const rank = (plan: Plan) => planOrder.indexOf(plan);

/** The one membership catalogue used by pricing and preview gates. Paid access remains a preview. */
export const membership = {
  free: { memberLimit: 0, capabilities: ["personalReading", "basicColors", "mandalaPreview"] },
  standard: { memberLimit: 2, capabilities: ["compatibility", "detailedManual", "sixColorGenres"] },
  vip: { memberLimit: 5, capabilities: ["mandalaHd", "wallpaper", "imageSharing", "unlimitedConsultation", "calendarExport"] },
  b2b: { memberLimit: 30, capabilities: ["sevenTeamTools"] },
  "b2b-premium": { memberLimit: 100, capabilities: ["fullHundredMemberTeam", "priorityAi"] },
} as const satisfies Record<Plan, { memberLimit: number; capabilities: readonly string[] }>;
/** Registered-member (関係者) limits per plan. UI-only until real billing exists. */
export const memberLimit: Record<Plan, number> = Object.fromEntries(
  Object.entries(membership).map(([plan, value]) => [plan, value.memberLimit]),
) as Record<Plan, number>;

export type TeamFeature = "roster" | "teamDiagnosis" | "draft" | "catalog" | "calendar" | "balance" | "oneOnOne";
const featureMin: Record<TeamFeature, Plan> = {
  roster: "standard",
  teamDiagnosis: "b2b",
  draft: "b2b",
  catalog: "b2b",
  calendar: "b2b",
  balance: "b2b",
  oneOnOne: "b2b",
};
export const hasFeature = (plan: Plan, feature: TeamFeature) => rank(plan) >= rank(featureMin[feature]);
export const requiredPlanFor = (feature: TeamFeature) => featureMin[feature];
/** Smallest plan whose member limit fits `count`. */
export const planForCount = (count: number): Plan | null => planOrder.find((p) => memberLimit[p] >= count) ?? null;
