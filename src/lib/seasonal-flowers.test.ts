import { describe, expect, it } from 'vitest';
import { seasonalFlowers, flowersInSeason, pickMonthlyFlower, monthlyRotationKey } from './seasonal-flowers';

describe('seasonal flowers', () => {
  it('gives every flower its own photo so name and image always match', () => {
    expect(new Set(seasonalFlowers.map(f => f.image)).size).toBe(seasonalFlowers.length);
    expect(new Set(seasonalFlowers.map(f => f.id)).size).toBe(seasonalFlowers.length);
  });
  it('has at least two in-season flowers every month', () => {
    for (let m = 1; m <= 12; m++) expect(flowersInSeason(m).length).toBeGreaterThanOrEqual(2);
  });
  it('only picks flowers in season for the current month', () => {
    for (let m = 0; m < 12; m++) {
      const d = new Date(2026, m, 10);
      expect(pickMonthlyFlower(['1990-05-05'], d).flower.months).toContain(m + 1);
      expect(pickMonthlyFlower(['1990-05-05', '1985-11-20', '2012-02-02'], d).flower.months).toContain(m + 1);
    }
  });
  it('stays fixed within a month and rotates on the 1st at 00:00', () => {
    const a = pickMonthlyFlower(['1990-05-05'], new Date(2026, 9, 1, 0, 0));
    const b = pickMonthlyFlower(['1990-05-05'], new Date(2026, 9, 31, 23, 59));
    expect(a.flower.id).toBe(b.flower.id);
    expect(monthlyRotationKey(new Date(2026, 9, 31, 23, 59))).toBe('2026-10');
    expect(monthlyRotationKey(new Date(2026, 10, 1, 0, 0))).toBe('2026-11');
  });
  it('treats multiple people as a group reading', () => {
    expect(pickMonthlyFlower(['1990-05-05'], new Date(2026, 3, 1)).group).toBe(false);
    expect(pickMonthlyFlower(['1990-05-05', '1992-04-12'], new Date(2026, 3, 1)).group).toBe(true);
  });
});
