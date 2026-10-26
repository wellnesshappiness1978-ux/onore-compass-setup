import { artsLogics, type ArtsLogicId } from './arts-logic-copy';
import { artOverviewCopy } from './art-overview-copy';
import { approachKeys, traitReadingCopy, type ApproachKey } from './trait-reading';
import type { Language } from './translations';

const logicFor: Partial<Record<ApproachKey, ArtsLogicId>> = {
  western: 'westernAstrology', indian: 'vedicAstrology', ziwei: 'ziWei', eastern: 'easternAstrology', earth: 'helioCompass', pillars: 'fourPillars', sanmei: 'sanmeigaku', nineStars: 'nineStarKi', lunarMansion: 'sukuyo', animal: 'animalLayers', numerology: 'numerology', maya: 'mayaTzolkin', color: 'birthColor', blood: 'bloodType', nameReading: 'nameAnalysis', siblings: 'siblingOrder',
};

/** Same editorial explanation on both surfaces, with history first and practical scope last. */
export function integratedArts(language: Language) {
  const logics = artsLogics(language);
  return approachKeys.map((key, index) => {
    const logic = logics.find(item => item.id === logicFor[key]);
    return { key, title: traitReadingCopy[language].methods[index], overview: artOverviewCopy[language][key], scope: logic?.scope ?? '', background: ['blood', 'siblings', 'animal', 'region'].includes(key) ? '' : logic?.background ?? '' };
  });
}