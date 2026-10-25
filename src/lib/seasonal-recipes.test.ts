import { expect, it } from 'vitest';
import { COURSE_ORDER, luckyRecipes, recipeCourse, recipesForElement } from './lucky-recipes';
import { RECIPE_IMAGES } from './recipe-images';
import { seasonOf, rhythmOf, seasonalRecipes } from './seasonal-recipes';

it('adds 40 seasonal dishes, 8 per course, each with its own photo', () => {
  expect(seasonalRecipes).toHaveLength(40);
  for (const c of COURSE_ORDER) expect(seasonalRecipes.filter(r => r.course === c)).toHaveLength(8);
  expect(luckyRecipes).toHaveLength(81);
  for (const r of seasonalRecipes) { expect(recipeCourse(r.id)).toBe(r.course); expect(RECIPE_IMAGES[r.id]).toBeTruthy(); }
});
it('maps months to Japanese seasons', () => {
  expect([seasonOf('2026-03-01'), seasonOf('2026-07-10'), seasonOf('2026-10-25'), seasonOf('2026-01-05')]).toEqual(['spring', 'summer', 'autumn', 'winter']);
});
it('derives biorhythm phase from birth date', () => {
  expect(rhythmOf('2000-01-01', '2000-01-01')).toBe('boost');
  expect(rhythmOf(undefined, '2026-01-01')).toBeUndefined();
});
it('never serves an off-season dish and varies over a year', () => {
  const mains = new Set<string>();
  for (let d = 0; d < 365; d++) {
    const day = new Date(Date.UTC(2026, 0, 1 + d)).toISOString().slice(0, 10);
    const picks = recipesForElement('wood', day, '1990-05-05');
    expect(picks.map(p => recipeCourse(p.id))).toEqual(COURSE_ORDER);
    for (const p of picks) if (p.season) expect(p.season).toBe(seasonOf(day));
    mains.add(picks[0]!.id);
  }
  expect(mains.size).toBeGreaterThanOrEqual(15);
});
