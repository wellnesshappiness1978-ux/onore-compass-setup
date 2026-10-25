import { expect, it } from 'vitest';
import { recipesForElement, recipeDetails } from './lucky-recipes';
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