import { luckyRecipes } from './lucky-recipes';
import type { Language } from './translations';

/** Unknown or repeated identities fail closed, never borrow a photo from another recipe. */
export function validateRecipeIdentities<T extends { recipeId?: string | undefined; name: string }>(foods: T[], language: Language): T[] {
  if (foods.length !== 5 || new Set(foods.map(f => f.recipeId)).size !== 5) throw new Error('Five distinct recipe identities required');
  return foods.map(food => {
    const recipe = luckyRecipes.find(r => r.id === food.recipeId);
    if (!recipe) throw new Error('Unknown recipe identity');
    return { ...food, name: recipe.names[language] };
  });
}