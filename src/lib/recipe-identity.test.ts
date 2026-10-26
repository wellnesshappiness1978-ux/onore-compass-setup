import { expect, it } from 'vitest';
import { validateRecipeIdentities } from './recipe-identity';
import { COURSE_ORDER, luckyRecipes, recipeCourse } from './lucky-recipes';
import { RECIPE_IMAGES, recipeImage } from './recipe-images';
it('every recipe has its own exact image identity, independent of order', () => {
  expect(Object.keys(RECIPE_IMAGES).sort()).toEqual(luckyRecipes.map(r => r.id).sort());
  expect(new Set(Object.values(RECIPE_IMAGES)).size).toBe(luckyRecipes.length);
  expect(recipeImage('lemon-chicken')).toContain('dish-lemon-chicken');
  expect(recipeImage('strawberry-yogurt')).toContain('dish-strawberry-yogurt');
  expect(recipeImage('unknown')).toBeUndefined();
});
it('rejects a savory stew substituted for the dessert in AI output', () => {
  const foods = ['lemon-chicken', 'komatsuna-miso', 'matcha-latte', 'spinach-tuna', 'pumpkin-sweetpotato'].map(recipeId => ({ recipeId, name: 'dish' }));
  expect(() => validateRecipeIdentities(foods, 'ja')).toThrow('One recipe per course required');
});
it('recognizes seasonal dessert identity even in unordered model output', () => {
  const foods = ['mango-pudding', 'spinach-tuna', 'matcha-latte', 'komatsuna-miso', 'lemon-chicken'].map(recipeId => ({ recipeId, name: 'dish' }));
  expect(validateRecipeIdentities(foods, 'ja').map(f => recipeCourse(f.recipeId))).toEqual(COURSE_ORDER);
  expect(validateRecipeIdentities(foods, 'ja')[4]?.recipeId).toBe('mango-pudding');
});
it('canonicalizes the exact five menus in all seven languages', () => {
  for (const lang of ['ja', 'en', 'zh-CN', 'zh-TW', 'ko', 'es', 'fr'] as const) {
    const picks = COURSE_ORDER.map(c => luckyRecipes.find(r => recipeCourse(r.id) === c)!);
    const foods = [...picks].reverse().map(r => ({ recipeId: r.id, name: 'untrusted dish' }));
    expect(validateRecipeIdentities(foods, lang).map(f => f.name)).toEqual(picks.map(r => r.names[lang]));
  }
});
it('rejects duplicate or missing identities instead of showing a wrong picture', () => {
  const foods = COURSE_ORDER.map(c => luckyRecipes.find(r => recipeCourse(r.id) === c)!).map(r => ({ recipeId: r.id, name: r.names.ja }));
  expect(() => validateRecipeIdentities([...foods.slice(0, 4), foods[0] as typeof foods[number]], 'ja')).toThrow();
  expect(() => validateRecipeIdentities(foods.map((f, i) => i === 0 ? { ...f, recipeId: 'unknown' } : f), 'ja')).toThrow();
});