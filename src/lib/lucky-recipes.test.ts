import { expect, it } from 'vitest';
import { recipesForElement, recipeDetails, recipeCourse, COURSE_ORDER } from './lucky-recipes';
it.each(['wood','fire','earth','metal','water'] as const)('%s has five individually detailed dishes',element=>{
  const recipes=recipesForElement(element);
  expect(recipes).toHaveLength(5);
  expect(new Set(recipes.map(r=>r.id)).size).toBe(5);
  for(const recipe of recipes) for(const lang of ['ja','en','zh-CN','zh-TW','ko','es','fr'] as const){
    const details=recipeDetails(recipe,lang);
    expect(details.ingredients.length).toBeGreaterThanOrEqual(2);
    expect(details.steps.length).toBeGreaterThanOrEqual(3);
  }
});
it('rotates the five-dish catalogue by day without duplicates',()=>{
  const first = recipesForElement('wood','2026-10-23');
  const next = recipesForElement('wood','2026-10-24');
  expect(first).toHaveLength(5);
  expect(new Set(next.map(r=>r.id)).size).toBe(5);
  expect(first.map(r=>r.id)).not.toEqual(next.map(r=>r.id));
});
it('every course changes on every adjacent date including leap, season and year boundaries', () => {
  for (const births of ['1990-05-05', ['1980-12-31', '2000-02-29']]) {
    let previous = recipesForElement('wood', '2023-12-31', births);
    for (let d = 0; d < 732; d++) {
      const day = new Date(Date.UTC(2024, 0, 1 + d)).toISOString().slice(0, 10);
      const current = recipesForElement((['wood','fire','earth','metal','water'] as const)[d % 5] ?? 'wood', day, births);
      expect(current.map(r => recipeCourse(r.id))).toEqual(COURSE_ORDER);
      current.forEach((r, i) => expect(r.id).not.toBe(previous[i]?.id));
      previous = current;
    }
  }
});
it('keeps daily choices deterministic and uses birth context independently of group order', () => {
  const first = recipesForElement('wood', '2026-10-29', ['1990-05-05','1980-12-31']);
  expect(recipesForElement('wood', '2026-10-29', ['1980-12-31','1990-05-05'])).toEqual(first);
  expect(recipesForElement('wood', '2026-10-29', '2000-02-29')).not.toEqual(recipesForElement('wood', '2026-10-29', '1990-05-05'));
});