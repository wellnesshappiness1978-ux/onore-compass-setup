import { describe, expect, it } from 'vitest';
import { addressCountry, addressRegion, japaneseCities, japaneseRegions, storedBirthRegion } from './birth-address';
import { readingProfileSchema, profileReadingContext } from './profile-reading-context';
import { partnerSchema } from './compatibility-analysis';

describe('linked birth addresses', () => {
  it('offers all 47 prefectures and only the selected prefecture municipalities', () => {
    expect(japaneseRegions).toHaveLength(47);
    expect(japaneseRegions[13]).toBe('神奈川県');
    expect(japaneseCities('神奈川県')).toContain('横浜市保土ケ谷区');
    expect(japaneseCities('東京都')).not.toContain('横浜市保土ケ谷区');
  });
  it('preserves country identity and manual overrides without a language assumption', () => {
    expect(storedBirthRegion('JP', '神奈川県')).toBe('神奈川県');
    const place = storedBirthRegion('FR', 'Île-de-France');
    expect(addressCountry(place)).toBe('FR');
    expect(addressRegion(place)).toBe('Île-de-France');
    expect(addressCountry('東京都')).toBe('JP');
  });
  it('preserves full composition in both fast/full reading and compatibility contracts', () => {
    const p = { nameKanji: '山田 花子', nameKana: 'やまだ はなこ', nameRomaji: 'HANAKO YAMADA', birthDate: '1990-03-12', birthTime: '', birthTimeUnknown: true, birthPlace: 'FR · Île-de-France', birthCity: 'Paris', bloodType: 'A', gender: 'female' as const, siblingOrder: '10人・中間子・上に兄2人と姉・下に弟3人と妹3人' };
    expect(readingProfileSchema.parse(p).siblingOrder).toBe(p.siblingOrder);
    expect(partnerSchema.parse({ ...p, name: p.nameKanji }).siblingOrder).toBe(p.siblingOrder);
    const ctx = JSON.parse(profileReadingContext(p, { label: 'はなちゃん', isSelf: false }));
    expect(ctx.subject).toEqual({ label: 'はなちゃん', isSelf: false });
    expect(ctx.birthCity).toBe('Paris');
    expect(ctx.siblingComposition.down).toHaveLength(6);
  });
});