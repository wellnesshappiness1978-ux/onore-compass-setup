import { expect, it } from 'vitest';
import { recipesForElement, recipeDetails } from './lucky-recipes';
it.each(['wood','fire','earth','metal','water'] as const)('%s has five individually detailed dishes',element=>{
  const recipes=recipesForElement(element);
  expect(recipes).toHaveLength(5);
  expect(new Set(recipes.map(r=>r.id)).size).toBe(5);
  for(const recipe of recipes) for(const lang of ['ja','en','zh-CN','zh-TW','ko','es','fr'] as const){
    const details=recipeDetails(recipe,lang);
    expect(details.ingredients.length).toBeGreaterThanOrEqual(2);
    expect(details.steps).toHaveLength(3);
  }
});