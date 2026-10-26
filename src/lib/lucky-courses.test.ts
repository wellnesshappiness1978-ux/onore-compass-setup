import { expect, it } from 'vitest';
import { COURSE_ORDER, recipeCourse, recipesForElement, courseCandidates, isSweetDessert } from './lucky-recipes';
import { luckyFoodLimit } from './plans';
it('daily foods are main, soup, drink, side, dessert in that order for every element', () => {
  for (const el of ['wood', 'fire', 'earth', 'metal', 'water'] as const)
    expect(recipesForElement(el, '2026-10-24').map(r => recipeCourse(r.id))).toEqual(COURSE_ORDER);
});
it('savory pumpkin stew stays a side and never enters the dessert catalogue', () => {
  expect(recipeCourse('pumpkin-sweetpotato')).toBe('side');
  const desserts = courseCandidates('dessert', 'earth');
  expect(desserts).toHaveLength(14);
  expect(desserts.every(isSweetDessert)).toBe(true);
  expect(desserts.map(r => r.id)).not.toContain('pumpkin-sweetpotato');
});
it('all five elements select only sweets as dessert throughout the year', () => {
  for (const el of ['wood', 'fire', 'earth', 'metal', 'water'] as const) for (let d = 0; d < 365; d++) {
    const day = new Date(Date.UTC(2026, 0, 1 + d)).toISOString().slice(0, 10);
    const dessert = recipesForElement(el, day, '1990-05-05')[4];
    expect(dessert && isSweetDessert(dessert)).toBe(true);
  }
});
it('Free sees the main dish only, Standard adds soup and drink, VIP adds side and dessert', () => {
  expect([luckyFoodLimit.free, luckyFoodLimit.standard, luckyFoodLimit.vip]).toEqual([1, 3, 5]);
});
