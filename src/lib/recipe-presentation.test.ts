import { expect, it } from 'vitest';
import { highlightStep, recipeReason, birthYearElement } from './recipe-presentation';
import { cleanRecipeSteps } from '@/components/RecipeStep';
import { recipeDetails, luckyRecipes } from './lucky-recipes';

it('removes the repeated serving/hygiene preface from steps', () => {
  expect(cleanRecipeSteps(['分量は2人前です。材料を量り、手と調理器具を清潔にします。', '中火で3分焼く。'])).toEqual(['中火で3分焼く。']);
  for (const r of luckyRecipes.slice(0, 5)) expect(recipeDetails(r, 'ja').steps.join('')).not.toContain('分量は2人前です');
});
it('highlights heat and time points', () => {
  expect(highlightStep('中火で3分焼き、火を止める。').filter(s => s.key).map(s => s.text)).toEqual(['中火', '3分', '火を止め']);
});
it('explains the selection from birth element, season and rhythm', () => {
  expect(birthYearElement('1978-03-10')).toBe('earth');
  const r = recipeReason({ language: 'ja', dayElement: 'fire', dishElement: 'metal', season: 'autumn', rhythm: 'restore', birthDate: '1978-03-10' });
  expect(r).toContain('「火」の日');
  expect(r).toContain('生まれ年の五行は「土」');
  expect(r).toContain('秋');
});
