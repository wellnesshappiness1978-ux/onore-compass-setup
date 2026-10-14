import { COSMIC_BODY_RADII_KM, type CosmicSizeComparison } from './cosmic-art';
import type { Language } from './translations';

type RadiusCopy = { nominal: string; mean: string; volume: string; approximate: string };
const RADIUS_COPY: Record<Language, RadiusCopy> = {
  ja: { nominal: '公称太陽半径', mean: '平均半径', volume: '体積平均半径', approximate: '約' },
  en: { nominal: 'Nominal solar radius', mean: 'Mean radius', volume: 'Volume-mean radius', approximate: '≈' },
  'zh-CN': { nominal: '标称太阳半径', mean: '平均半径', volume: '体积平均半径', approximate: '约' },
  'zh-TW': { nominal: '標稱太陽半徑', mean: '平均半徑', volume: '體積平均半徑', approximate: '約' },
  ko: { nominal: '공칭 태양 반지름', mean: '평균 반지름', volume: '체적 평균 반지름', approximate: '약 ' },
  es: { nominal: 'Radio solar nominal', mean: 'Radio medio', volume: 'Radio medio volumétrico', approximate: '≈' },
  fr: { nominal: 'Rayon solaire nominal', mean: 'Rayon moyen', volume: 'Rayon moyen volumique', approximate: '≈' },
};
const JAPANESE_NAMES: Record<CosmicSizeComparison['id'], string> = {
  sun: '太陽（たいよう）', mercury: '水星（すいせい）', venus: '金星（きんせい）', earth: '地球（ちきゅう）', mars: '火星（かせい）',
  jupiter: '木星（もくせい）', saturn: '土星（どせい）', uranus: '天王星（てんのうせい）', neptune: '海王星（かいおうせい）',
};

/** Presentation rounding never changes the radii used to draw the linear strip. */
export function cosmicRadiusReference(id: CosmicSizeComparison['id'], language: Language, localizedName: string) {
  const copy = RADIUS_COPY[language];
  const giant = id === 'jupiter' || id === 'saturn' || id === 'uranus' || id === 'neptune';
  const radius = id === 'mars' ? 3390 : COSMIC_BODY_RADII_KM[id];
  return {
    name: language === 'ja' ? JAPANESE_NAMES[id] : localizedName,
    value: `${id === 'mars' ? copy.approximate : ''}${radius.toLocaleString('en-US', { maximumFractionDigits: 1 })} km`,
    category: id === 'sun' ? copy.nominal : giant ? copy.volume : copy.mean,
  };
}