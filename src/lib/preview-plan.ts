import type { Plan } from "./design-modes";
import type { Language } from "./translations";

export const planQuery: Record<Plan, string> = { free: "free", standard: "standard", vip: "vip", b2b: "business", "b2b-premium": "business_premium" };
export const planLabels: Record<Plan, string> = { free: "無料", standard: "有料", vip: "VIP", b2b: "ビジネス", "b2b-premium": "ビジネスプレミアム" };
export const localizedPlanLabels: Record<Language, Record<Plan, string>> = {
  ja: planLabels,
  en: { free: "Free", standard: "Standard", vip: "VIP", b2b: "Business", "b2b-premium": "Business Premium" },
  "zh-CN": { free: "免费", standard: "标准", vip: "VIP", b2b: "商业", "b2b-premium": "商业高级版" },
  "zh-TW": { free: "免費", standard: "標準", vip: "VIP", b2b: "商務", "b2b-premium": "商務進階版" },
  ko: { free: "무료", standard: "스탠다드", vip: "VIP", b2b: "비즈니스", "b2b-premium": "비즈니스 프리미엄" },
  es: { free: "Gratis", standard: "Estándar", vip: "VIP", b2b: "Empresa", "b2b-premium": "Empresa Premium" },
  fr: { free: "Gratuit", standard: "Standard", vip: "VIP", b2b: "Entreprise", "b2b-premium": "Entreprise Premium" },
};
export function parsePlan(value: string | null): Plan | null {
  return Object.entries(planQuery).find(([id, query]) => value === id || value === query)?.[0] as Plan | undefined ?? null;
}
export function isTestPreview(host: string): boolean {
  return import.meta.env.DEV || host === "localhost" || /^id-preview--[a-f0-9-]+\.lovable\.app$/.test(host) || /^project--[a-f0-9-]+-dev\.lovable\.app$/.test(host) || /^preview--[a-z0-9-]+\.lovable\.app$/.test(host) || /^[a-f0-9-]+\.lovableproject\.com$/.test(host);
}export const switchedNotice: Record<Language, (plan: string) => string> = {
  ja: p => `${p}プランに切り替えました（動作確認テストモード）`, en: p => `Switched to ${p} (test mode)`,
  "zh-CN": p => `已切换到${p}方案（测试模式）`, "zh-TW": p => `已切換到${p}方案（測試模式）`, ko: p => `${p} 플랜으로 전환했습니다 (테스트 모드)`,
  es: p => `Cambiado al plan ${p} (modo de prueba)`, fr: p => `Offre ${p} activée (mode test)`,
};
