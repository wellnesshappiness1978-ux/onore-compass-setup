import type { Plan } from "./design-modes";
import { quickCompatibilityLimit } from "./quick-compatibility";

export const planOrder: Plan[] = ["free", "standard", "vip", "b2b", "b2b-premium"];
const rank = (plan: Plan) => planOrder.indexOf(plan);
/** Marketing shows upgrades only; the active plan is a status, never a sales card. */
export const isUpgradePlan = (current: Plan, candidate: Plan) => rank(candidate) > rank(current);

/** The one membership catalogue used by pricing and preview gates. Paid access remains a preview. */
export const membership = {
  free: { memberLimit: 0, capabilities: ["personalReading", "basicColors", "mandalaPreview"] },
  standard: { memberLimit: 3, capabilities: ["compatibility", "detailedManual", "sixColorGenres"] },
  vip: { memberLimit: 10, capabilities: ["mandalaHd", "wallpaper", "imageSharing", "unlimitedConsultation", "calendarExport"] },
  b2b: { memberLimit: 30, capabilities: ["sevenTeamTools"] },
  "b2b-premium": { memberLimit: 100, capabilities: ["fullHundredMemberTeam", "priorityAi"] },
} as const satisfies Record<Plan, { memberLimit: number; capabilities: readonly string[] }>;
/** Registered-family limits per plan; the database mirrors these caps for writes. */
export const memberLimit: Record<Plan, number> = Object.fromEntries(
  Object.entries(membership).map(([plan, value]) => [plan, value.memberLimit]),
) as Record<Plan, number>;

export type TeamFeature = "roster" | "teamDiagnosis" | "simulator" | "draft" | "catalog" | "calendar" | "balance" | "oneOnOne" | "recruit";
const featureMin: Record<TeamFeature, Plan> = {
  roster: "standard",
  teamDiagnosis: "b2b",
  simulator: "b2b",
  draft: "b2b",
  catalog: "b2b",
  calendar: "b2b",
  balance: "b2b",
  oneOnOne: "b2b",
  recruit: "b2b",
};
export const hasFeature = (plan: Plan, feature: TeamFeature) => rank(plan) >= rank(featureMin[feature]);
export const requiredPlanFor = (feature: TeamFeature) => featureMin[feature];
/** Smallest plan whose member limit fits `count`. */
export const planForCount = (count: number): Plan | null => planOrder.find((p) => memberLimit[p] >= count) ?? null;
/** Shared daily cap for consultation and compatibility (Infinity = unlimited); the database function mirrors it. */
export const dailyUsageLimit: Record<Plan, number> = { free: 1, standard: 3, vip: 10, b2b: 30, "b2b-premium": Infinity };
export const consultationDailyLimit: Record<Plan, number> = { free: 1, standard: 3, vip: 10, b2b: 30, "b2b-premium": Infinity };
export { quickCompatibilityLimit };
export const nextPlan = (plan: Plan): Plan | null => planOrder[rank(plan) + 1] ?? null;
/** Minimum plan for birth-color and earth-calendar sections. */
export type ContentFeature = "birthColorsFull" | "helioPersonal" | "helioDirections" | "helioBusiness" | "mandalaArt" | "cosmicGenesisArt" | "groupColorsFull" | "subjectArt";
const contentMin: Record<ContentFeature, Plan> = {
  birthColorsFull: "standard",
  helioPersonal: "standard",
  helioDirections: "vip",
  helioBusiness: "b2b",
  mandalaArt: "standard",
  cosmicGenesisArt: "vip",
  /** Group seven colors with names and details. */
  groupColorsFull: "vip",
  /** Family/group mandala and per-person Cosmic Genesis art. */
  subjectArt: "b2b",
};
export const canUse = (plan: Plan, feature: ContentFeature) => rank(plan) >= rank(contentMin[feature]);
export const minPlanFor = (feature: ContentFeature) => contentMin[feature];

/** Ordered "Today" screen features (cheapest plan first; personal before family) and the minimum plan for each. */
export type TodayFeature = "decision" | "starPath" | "dailyLucky" | "direction" | "helio" | "shopping" | "health" | "monthlyLucky" | "directionExtended" | "relations" | "biorhythm365" | "familyRoadmap";
export const todayFeatures: readonly { id: TodayFeature; min: Plan }[] = [
  { id: "decision", min: "free" },
  { id: "starPath", min: "free" },
  { id: "dailyLucky", min: "free" },
  { id: "direction", min: "free" },
  { id: "shopping", min: "standard" },
  { id: "health", min: "standard" },
  { id: "monthlyLucky", min: "vip" },
  { id: "relations", min: "vip" },
  { id: "biorhythm365", min: "vip" },
  { id: "helio", min: "free" },
];
/** The family roadmap renders inside the combined biorhythm & calendar card from this plan. */
export const familyRoadmapMin: Plan = "b2b";
/** Extended birth direction type and this year's direction. */
export const directionExtendedMin: Plan = "standard";
export const canUseToday = (plan: Plan, feature: TodayFeature) => rank(plan) >= rank(feature === "directionExtended" ? directionExtendedMin : feature === "familyRoadmap" ? familyRoadmapMin : todayFeatures.find((f) => f.id === feature)!.min);
/** Earth-calendar / biorhythm browsing window in days around today (Infinity = unlimited). */
/** Registered-group caps per plan; the database trigger mirrors these. */
export const groupLimit: Record<Plan, number> = { free: 0, standard: 1, vip: 3, b2b: 10, "b2b-premium": 30 };
/** Earth-calendar range */
export const helioRangeDays: Record<Plan, number> = { free: 0, standard: 31, vip: 366, b2b: Infinity, "b2b-premium": Infinity };
