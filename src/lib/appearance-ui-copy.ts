import type { Language } from './translations';
import type { Plan } from './design-modes';
import type { AppearanceFamily } from './appearance-families';

type AppearanceUi = {
  plans: Record<Plan | 'business' | 'corporate', string>;
  families: Record<AppearanceFamily, string>;
  current: string;
  preview: string;
  palettes: string;
};
export const appearanceUiCopy: Record<Language, AppearanceUi> = {
  ja: { plans: { free: 'フリー', standard: 'スタンダード', vip: 'VIP', b2b: 'ファミリー', 'b2b-premium': 'ファミリープレミアム', business: 'ビジネス', corporate: 'コーポレート' }, families: { minimal: 'スタンダード・ミニマル', celestial: '天球の輝き', sacred: 'VIP 神聖羅針盤', harmony: '調和の宇宙', sovereign: 'ロイヤル・ファミリー', royal: 'ロイヤル・ソヴリン' }, current: '使用中', preview: '試着プレビュー', palettes: 'カラーテーマ' },
  en: { plans: { free: 'Free', standard: 'Standard', vip: 'VIP', b2b: 'Family', 'b2b-premium': 'Family Premium', business: 'Business', corporate: 'Corporate' }, families: { minimal: 'Standard Minimal', celestial: 'Celestial Radiance', sacred: 'VIP Sacred Compass', harmony: 'Harmony Cosmos', sovereign: 'Royal Family Sovereign', royal: 'Royal Sovereign' }, current: 'Current', preview: 'Try-on preview', palettes: 'Color themes' },
  'zh-CN': { plans: { free: '免费', standard: '标准', vip: 'VIP', b2b: '家庭', 'b2b-premium': '家庭尊享', business: '商务', corporate: '企业' }, families: { minimal: '简约标准', celestial: '天球光辉', sacred: 'VIP 神圣罗盘', harmony: '和谐宇宙', sovereign: '皇家家庭至尊', royal: '皇家至尊' }, current: '使用中', preview: '试用预览', palettes: '配色主题' },
  'zh-TW': { plans: { free: '免費', standard: '標準', vip: 'VIP', b2b: '家庭', 'b2b-premium': '家庭尊享', business: '商務', corporate: '企業' }, families: { minimal: '簡約標準', celestial: '天球光輝', sacred: 'VIP 神聖羅盤', harmony: '和諧宇宙', sovereign: '皇家家庭至尊', royal: '皇家至尊' }, current: '使用中', preview: '試用預覽', palettes: '配色主題' },
  ko: { plans: { free: '무료', standard: '스탠다드', vip: 'VIP', b2b: '패밀리', 'b2b-premium': '패밀리 프리미엄', business: '비즈니스', corporate: '기업' }, families: { minimal: '스탠다드 미니멀', celestial: '천상의 광채', sacred: 'VIP 신성한 나침반', harmony: '조화의 우주', sovereign: '로열 패밀리 소버린', royal: '로열 소버린' }, current: '사용 중', preview: '체험 미리보기', palettes: '색상 테마' },
  es: { plans: { free: 'Gratis', standard: 'Estándar', vip: 'VIP', b2b: 'Familia', 'b2b-premium': 'Familia Premium', business: 'Negocios', corporate: 'Corporativo' }, families: { minimal: 'Minimalista estándar', celestial: 'Resplandor celeste', sacred: 'Brújula sagrada VIP', harmony: 'Cosmos armonioso', sovereign: 'Soberanía familiar real', royal: 'Soberanía real' }, current: 'Actual', preview: 'Vista de prueba', palettes: 'Temas de color' },
  fr: { plans: { free: 'Gratuit', standard: 'Standard', vip: 'VIP', b2b: 'Famille', 'b2b-premium': 'Famille Premium', business: 'Business', corporate: 'Entreprise' }, families: { minimal: 'Minimalisme standard', celestial: 'Éclat céleste', sacred: 'Boussole sacrée VIP', harmony: 'Cosmos harmonieux', sovereign: 'Souveraineté familiale royale', royal: 'Souverain royal' }, current: 'Actuel', preview: 'Aperçu d’essayage', palettes: 'Thèmes de couleur' },
};

export function appearanceTabLabels(language: Language): Record<AppearanceFamily, string[]> {
  const p = appearanceUiCopy[language].plans;
  return { minimal: [p.free], celestial: [p.standard], sacred: [p.vip], harmony: [p.b2b], sovereign: [p['b2b-premium']], royal: [p.business, p.corporate] };
}