import { describe, expect, it } from 'vitest';
import { cosmicRadiusReference } from './cosmic-radius-reference';
import { cosmicGenesis } from './cosmic-astronomy';
import { COSMIC_BODY_RADII_KM, cosmicSizeComparison } from './cosmic-art';

describe('Nine-body radius reference', () => {
  it('retains decimal precision, Japanese readings and the requested radius classifications', () => {
    const expected = [
      ['sun', '太陽（たいよう）', '695,700 km', '公称太陽半径'],
      ['mercury', '水星（すいせい）', '2,439.7 km', '平均半径'],
      ['venus', '金星（きんせい）', '6,051.8 km', '平均半径'],
      ['earth', '地球（ちきゅう）', '6,371 km', '平均半径'],
      ['mars', '火星（かせい）', '約3,390 km', '平均半径'],
      ['jupiter', '木星（もくせい）', '69,911 km', '体積平均半径'],
      ['saturn', '土星（どせい）', '58,232 km', '体積平均半径'],
      ['uranus', '天王星（てんのうせい）', '25,362 km', '体積平均半径'],
      ['neptune', '海王星（かいおうせい）', '24,622 km', '体積平均半径'],
    ] as const;
    for (const [id, name, value, category] of expected) {
      expect(cosmicRadiusReference(id, 'ja', id)).toEqual({ name, value, category });
    }
  });
  it('localizes classifications without mutating physical data', () => {
    for (const language of ['en', 'zh-CN', 'zh-TW', 'ko', 'es', 'fr'] as const) {
      const reference = cosmicRadiusReference('sun', language, 'localized Sun');
      expect(reference.name).toBe('localized Sun');
      expect(reference.category).not.toBe('公称太陽半径');
      expect(reference.value).toBe('695,700 km');
    }
    const genesis = cosmicGenesis('1990-04-15', '08:30', false);
    if (!genesis) return;
    for (const body of cosmicSizeComparison(genesis, 1024)) {
      expect(body.physicalRadiusKm).toBe(COSMIC_BODY_RADII_KM[body.id]);
    }
    expect(COSMIC_BODY_RADII_KM.mars).toBe(3389.5);
  });
});