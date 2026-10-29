import type { Language } from './translations';
export const usageStatusCopy: Record<Language, { checking: string; unavailable: string; retry: string }> = {
  ja: { checking: '契約プランと本日の利用回数を確認中…', unavailable: '本日の利用枠を確認できませんでした。', retry: '利用枠を再確認' },
  en: { checking: 'Checking your plan and today’s usage…', unavailable: 'Today’s allowance could not be confirmed.', retry: 'Check allowance again' },
  'zh-CN': { checking: '正在确认方案与今日使用次数…', unavailable: '未能确认今日可用次数。', retry: '重新确认次数' },
  'zh-TW': { checking: '正在確認方案與今日使用次數…', unavailable: '未能確認今日可用次數。', retry: '重新確認次數' },
  ko: { checking: '플랜과 오늘 사용 횟수 확인 중…', unavailable: '오늘 이용 한도를 확인하지 못했습니다.', retry: '이용 한도 다시 확인' },
  es: { checking: 'Comprobando tu plan y uso de hoy…', unavailable: 'No se pudo confirmar el saldo de hoy.', retry: 'Volver a comprobar' },
  fr: { checking: 'Vérification du forfait et de l’utilisation du jour…', unavailable: 'Le solde du jour n’a pas pu être confirmé.', retry: 'Vérifier à nouveau' },
};