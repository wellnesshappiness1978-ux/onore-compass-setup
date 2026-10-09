import type { Plan } from "./design-modes";
import type { Language } from "./translations";

export const planQuery: Record<Plan, string> = { free: "free", standard: "standard", vip: "vip", b2b: "business", "b2b-premium": "business_premium" };
export const planLabels: Record<Plan, string> = { free: "無料会員", standard: "スタンダード会員", vip: "VIP会員", b2b: "ファミリー会員", "b2b-premium": "ファミリープレミアム会員" };
export const localizedPlanLabels: Record<Language, Record<Plan, string>> = {
  ja: planLabels,
  en: { free: "Free Member", standard: "Standard Member", vip: "VIP Member", b2b: "Family Member", "b2b-premium": "Family Premium Member" },
  "zh-CN": { free: "免费会员", standard: "标准会员", vip: "VIP会员", b2b: "家庭会员", "b2b-premium": "家庭尊享会员" },
  "zh-TW": { free: "免費會員", standard: "標準會員", vip: "VIP會員", b2b: "家庭會員", "b2b-premium": "家庭尊享會員" },
  ko: { free: "무료 회원", standard: "스탠다드 회원", vip: "VIP 회원", b2b: "패밀리 회원", "b2b-premium": "패밀리 프리미엄 회원" },
  es: { free: "Membresía Gratis", standard: "Membresía Estándar", vip: "Membresía VIP", b2b: "Membresía Familia", "b2b-premium": "Familia Premium" },
  fr: { free: "Membre Gratuit", standard: "Membre Standard", vip: "Membre VIP", b2b: "Membre Famille", "b2b-premium": "Famille Premium" },
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
