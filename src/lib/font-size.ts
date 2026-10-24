import type { Language } from './translations';

export const fontSizes = ['small', 'medium', 'large'] as const;
export type FontSize = typeof fontSizes[number];
export const FONT_SIZE_KEY = 'onore-font-size';
export const FONT_SIZE_EVENT = 'onore-font-size-change';
export function validFontSize(value: unknown): FontSize {
  return value === 'small' || value === 'large' ? value : 'medium';
}
export function readFontSize(): FontSize {
  try { return validFontSize(localStorage.getItem(FONT_SIZE_KEY)); } catch { return 'medium'; }
}
export function saveFontSize(value: FontSize) {
  try { localStorage.setItem(FONT_SIZE_KEY, value); } catch { /* device storage unavailable */ }
  document.documentElement.dataset.fontSize = value;
  window.dispatchEvent(new Event(FONT_SIZE_EVENT));
}
export const fontSizeCopy: Record<Language, { title: string; labels: Record<FontSize, string> }> = {
  ja: { title: '文字サイズ', labels: { small: '小（コンパクト）', medium: '中（標準・デフォルト）', large: '大（ゆったり拡大）' } },
  en: { title: 'Text size', labels: { small: 'Small (compact)', medium: 'Medium (default)', large: 'Large (spacious)' } },
  'zh-CN': { title: '字体大小', labels: { small: '小（紧凑）', medium: '中（默认）', large: '大（宽松放大）' } },
  'zh-TW': { title: '字體大小', labels: { small: '小（緊湊）', medium: '中（預設）', large: '大（寬鬆放大）' } },
  ko: { title: '글자 크기', labels: { small: '작게 (간결)', medium: '보통 (기본)', large: '크게 (여유롭게)' } },
  es: { title: 'Tamaño del texto', labels: { small: 'Pequeño (compacto)', medium: 'Mediano (predeterminado)', large: 'Grande (amplio)' } },
  fr: { title: 'Taille du texte', labels: { small: 'Petite (compacte)', medium: 'Moyenne (par défaut)', large: 'Grande (aérée)' } },
};