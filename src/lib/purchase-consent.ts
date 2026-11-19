import type { Language } from './translations';

export const purchaseConsentCopy: Record<Language, { required: string; error: string }> = {
  ja: { required: '必須確認事項', error: '※利用規約・自動更新への同意にチェックを入れてください' },
  en: { required: 'Required confirmation', error: 'Please check the box to agree to the terms and automatic renewal.' },
  'zh-CN': { required: '必需确认', error: '请勾选同意使用条款和自动续订。' },
  'zh-TW': { required: '必要確認', error: '請勾選同意使用條款和自動續訂。' },
  ko: { required: '필수 확인 사항', error: '이용약관 및 자동 갱신 동의란에 체크해 주세요.' },
  es: { required: 'Confirmación obligatoria', error: 'Marca la casilla para aceptar las condiciones y la renovación automática.' },
  fr: { required: 'Confirmation obligatoire', error: 'Cochez la case pour accepter les conditions et le renouvellement automatique.' },
};

/** Guard both plan selection and the final checkout action, without disabling feedback. */
export function withPurchaseConsent(consent: boolean, missing: () => void, proceed: () => void): boolean {
  if (!consent) {
    missing();
    return false;
  }
  proceed();
  return true;
}