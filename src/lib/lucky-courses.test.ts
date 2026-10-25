import { expect, it } from 'vitest';
import { COURSE_ORDER, recipeCourse, recipesForElement } from './lucky-recipes';
import { luckyFoodLimit } from './plans';
it('daily foods are main, soup, drink, side, dessert in that order for every element', () => {
  for (const el of ['wood', 'fire', 'earth', 'metal', 'water'] as const)
    expect(recipesForElement(el, '2026-10-24').map(r => recipeCourse(r.id))).toEqual(COURSE_ORDER);
});
it('Free sees the main dish only, Standard adds soup and drink, VIP adds side and dessert', () => {
  expect([luckyFoodLimit.free, luckyFoodLimit.standard, luckyFoodLimit.vip]).toEqual([1, 3, 5]);
});
