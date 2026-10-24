import type { Language } from './translations';

type Sky = { bodies: { longitude: number }[] } | null;
const traits: Record<Language, readonly string[]> = {
  ja: ['情熱', '着実さ', '知性', '感受性'],
  en: ['passion', 'steadiness', 'intellect', 'sensitivity'],
  'zh-CN': ['热情', '踏实', '智慧', '感性'],
  'zh-TW': ['熱情', '踏實', '智慧', '感性'],
  ko: ['열정', '꾸준함', '지성', '감수성'],
  es: ['pasión', 'constancia', 'intelecto', 'sensibilidad'],
  fr: ['passion', 'constance', 'intelligence', 'sensibilité'],
};
/** Symbolic element emphasis across the entire natal sky, not measured personality. */
export function cosmicCompass(sky: Sky, language: Language): string {
  const counts = [0, 0, 0, 0];
  for (const body of sky?.bodies ?? []) {
    if (!Number.isFinite(body.longitude)) continue;
    const element = Math.floor(((body.longitude % 360) + 360) % 360 / 30) % 4;
    counts[element] = (counts[element] ?? 0) + 1;
  }
  const ranked = counts.map((count, index) => ({ count, index })).sort((a, b) => b.count - a.count || a.index - b.index);
  const a = traits[language][ranked[0]?.index ?? 0], b = traits[language][ranked[1]?.index ?? 1];
  switch (language) {
    case 'ja': return sky ? `出生時の星々に重なる${a}と${b}が、あなたらしい本質と人生の方向を照らす羅針盤です。` : '出生時の星々の配置をもとに、あなたらしい本質と人生の方向を見つめる羅針盤です。';
    case 'en': return `Your birth sky weaves ${a} and ${b} into a compass for your nature and life's direction.`;
    case 'zh-CN': return `出生星图交织的${a}与${b}，是照亮本质与人生方向的罗盘。`;
    case 'zh-TW': return `出生星圖交織的${a}與${b}，是照亮本質與人生方向的羅盤。`;
    case 'ko': return `탄생의 별들에 겹친 ${a}과 ${b}은 본질과 삶의 방향을 밝히는 나침반입니다.`;
    case 'es': return `Tu cielo natal entrelaza ${a} y ${b}: una brújula para tu esencia y rumbo vital.`;
    case 'fr': return `Votre ciel natal unit ${a} et ${b} : une boussole pour votre essence et votre chemin de vie.`;
  }
}