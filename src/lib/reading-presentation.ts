import type { Language } from './translations';

export const RECIPE_SERVINGS = 2;
export const servingsLabel: Record<Language, string> = { ja: '2人前', en: '2 servings', 'zh-CN': '2人份', 'zh-TW': '2人份', ko: '2인분', es: '2 raciones', fr: '2 portions' };
export const monthlyLabels: Record<Language, [string, string, string]> = {
  ja: ['今月のラッキーアクション', '今月のラッキーアイテム', '今月のラッキーフラワー'],
  en: ['Monthly lucky action', 'Monthly lucky item', 'Monthly lucky flower'],
  'zh-CN': ['本月幸运行动', '本月幸运物品', '本月幸运花卉'],
  'zh-TW': ['本月幸運行動', '本月幸運物品', '本月幸運花卉'],
  ko: ['이번 달 행운 행동', '이번 달 행운 아이템', '이번 달 행운 꽃'],
  es: ['Acción del mes', 'Objeto de suerte del mes', 'Flor de suerte del mes'],
  fr: ['Action du mois', 'Objet porte-bonheur du mois', 'Fleur porte-bonheur du mois'],
};
export function readingDate(day: string, language: Language, monthly = false) {
  const date = new Date(`${monthly ? day.slice(0, 7) + '-01' : day}T12:00:00Z`);
  if (language === 'ja') return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${monthly ? '' : `${date.getUTCDate()}日`}`;
  return new Intl.DateTimeFormat(language, { calendar: 'gregory', numberingSystem: 'latn', timeZone: 'UTC', year: 'numeric', month: 'numeric', ...(monthly ? {} : { day: 'numeric' }) }).format(date);
}