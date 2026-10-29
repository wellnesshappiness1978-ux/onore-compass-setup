import { COURSE_ORDER, luckyRecipes, recipeCourse } from './lucky-recipes';
import type { Language } from './translations';

/** Unknown or repeated identities fail closed, never borrow a photo from another recipe; slots follow the course order. */
export function validateRecipeIdentities<T extends { recipeId?: string | undefined; name: string }>(foods: T[], language: Language, selectedIds?: readonly string[]): T[] {
  if (foods.length !== 5 || new Set(foods.map(f => f.recipeId)).size !== 5) throw new Error('Five distinct recipe identities required');
  if (selectedIds && foods.some(f => !f.recipeId || !selectedIds.includes(f.recipeId))) throw new Error('Daily selected recipe identities required');
  return COURSE_ORDER.map(course => {
    const food = foods.find(f => recipeCourse(f.recipeId) === course);
    if (!food) throw new Error('One recipe per course required');
    const recipe = luckyRecipes.find(r => r.id === food.recipeId);
    if (!recipe) throw new Error('Unknown recipe identity');
    return { ...food, name: recipe.names[language] };
  });
}
