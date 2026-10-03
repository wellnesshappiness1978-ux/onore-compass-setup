import type { Plan } from "./design-modes";

export const planQuery: Record<Plan, string> = { free: "free", standard: "standard", vip: "vip", b2b: "business", "b2b-premium": "business_premium" };
export const planLabels: Record<Plan, string> = { free: "無料", standard: "有料", vip: "VIP", b2b: "ビジネス", "b2b-premium": "ビジネスプレミアム" };
export function parsePlan(value: string | null): Plan | null {
  return Object.entries(planQuery).find(([id, query]) => value === id || value === query)?.[0] as Plan | undefined ?? null;
}
export function isTestPreview(host: string): boolean {
  return import.meta.env.DEV || host === "localhost" || /^id-preview--[a-f0-9-]+\.lovable\.app$/.test(host) || /^project--[a-f0-9-]+-dev\.lovable\.app$/.test(host);
}