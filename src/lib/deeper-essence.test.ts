import { describe, expect, it } from 'vitest';
import { computeDeeperEssence, deeperEssenceKeys } from './deeper-essence';
import { consultationContext } from './ai/consultation-context';

const profile = { nameKanji: '', nameRomaji: 'AE', nameKana: '', birthDate: '2000-01-01', birthTime: '21:00', birthTimeUnknown: false, birthPlace: '東京都', birthCity: '新宿区', bloodType: '', siblingOrder: '' };
describe('four deeper birth-reference domains', () => {
  it('adds four domains after the original six without changing their IDs', () => {
    expect(deeperEssenceKeys).toEqual(['roots', 'energy', 'learning', 'guidance']);
    const reading = computeDeeperEssence(profile);
    expect(reading).not.toBeNull();
    expect(reading?.roots.lifePath).toBe(4);
    expect(reading?.roots.soul).toBe(6);
  });
  it('calculates the mean north node at J2000 and its exact opposite', () => {
    const r = computeDeeperEssence(profile)?.roots;
    expect(r?.northLongitude).toBeCloseTo(125.04452, 5);
    expect(r?.southLongitude).toBeCloseTo(305.04452, 5);
    expect(r?.northSign).toBe('獅子座');
    expect(r?.southSign).toBe('水瓶座');
  });
  it('leaves ASC and name-derived soul number unset when required inputs are missing', () => {
    const r = computeDeeperEssence({ ...profile, nameRomaji: '', birthTimeUnknown: true })?.roots;
    expect(r?.ascendant).toBeNull();
    expect(r?.soul).toBeNull();
    expect(r?.timeReference).toBe('JST noon');
  });
  it('provides exactly seven symbolic chakra windows and ten-body element allocation', () => {
    const r = computeDeeperEssence(profile)?.energy;
    expect(r?.chakraThemes.map(x => x.chakra)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(r?.elements.reduce((sum, x) => sum + x.count, 0)).toBe(10);
    expect((r?.yin ?? 0) + (r?.yang ?? 0)).toBe(10);
  });
  it('uses birth-derived tarot/runes and coherent Maya tone/wave without a random draw', () => {
    const r = computeDeeperEssence({ ...profile, birthDate: '2012-12-21' });
    expect(r).toEqual(computeDeeperEssence({ ...profile, birthDate: '2012-12-21' }));
    expect(r?.learning.maya.kin).toBe(160);
    expect(r?.learning.maya.tone).toBe(4);
    expect(r?.learning.maya.waveStart).toBe(157);
    expect(r?.learning.tarot).toBeGreaterThanOrEqual(0);
    expect(r?.learning.tarot).toBeLessThan(22);
    expect(r?.learning.rune).toBeTruthy();
  });
  it('retains parent refinement and uses the selected person, not an owner substitute', () => {
    const member = { ...profile, birthDate: '1991-09-03', father: { birthDate: '1960-05-05', birthPlace: '大阪府' } };
    expect(computeDeeperEssence(member)?.energy.parentInfluence).toBe('father');
    expect(computeDeeperEssence(member)?.energy.aura).not.toEqual(computeDeeperEssence({ ...member, father: null })?.energy.aura);
    const context = consultationContext(member, '2026-10-24');
    expect(context.deeperEssence.values).toEqual(computeDeeperEssence(member));
    expect(context.deeperEssence.values).not.toEqual(computeDeeperEssence(profile));
  });
  it('keeps Traits birth structure stable while the selected day changes daily signals', () => {
    expect(consultationContext(profile, '2026-10-24').deeperEssence.values).toEqual(consultationContext(profile, '2026-10-25').deeperEssence.values);
    expect(computeDeeperEssence({ ...profile, birthDate: '2026-02-30' })).toBeNull();
  });
});