import { billingPlans, type BillingPlan } from './billing-plans';
import type { Language } from './translations';

export function purchaseSelection(plan: unknown): BillingPlan | null {
  return billingPlans.find(entry => entry.plan === plan)?.plan ?? null;
}
export function purchaseAction(signedIn: boolean) { return signedIn ? 'checkout' : 'signin'; }
export const purchaseAccessCopy: Record<Language, { guest: string; account: string; google: string }> = {
  ja: { guest: 'ログインせずに料金を比較し、プランを選択できます。', account: '選択したプランをアカウントに紐づけるため、決済前にログインしてください。メールアドレスでも登録できます。', google: 'Googleでログイン' },
  en: { guest: 'Compare prices and select a plan without signing in.', account: 'Sign in before payment to link this plan to your account. Google is optional.', google: 'Sign in with Google' },
  'zh-CN': { guest: '无需登录即可比较价格和选择方案。', account: '付款前请登录，将方案关联至您的账户。Google并非必选。', google: '使用Google登录' },
  'zh-TW': { guest: '無需登入即可比較價格和選擇方案。', account: '付款前請登入，將方案連結至您的帳戶。Google並非必選。', google: '使用Google登入' },
  ko: { guest: '로그인 없이 요금을 비교하고 플랜을 선택할 수 있습니다.', account: '플랜을 계정에 연결하려면 결제 전에 로그인하세요. Google은 필수가 아닙니다.', google: 'Google로 로그인' },
  es: { guest: 'Compara precios y elige un plan sin iniciar sesión.', account: 'Inicia sesión antes de pagar para vincular el plan a tu cuenta. Google es opcional.', google: 'Acceder con Google' },
  fr: { guest: 'Comparez les tarifs et choisissez un abonnement sans connexion.', account: 'Connectez-vous avant de payer pour associer le forfait à votre compte. Google est facultatif.', google: 'Connexion avec Google' },
};