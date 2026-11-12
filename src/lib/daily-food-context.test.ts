import { expect,it } from 'vitest';
import { dailyFoodContext } from './daily-food-context';
import { recipesForElement,recipeCuisine } from './lucky-recipes';
it('combines known honmei, solar sign, numerology and the selected date',()=>{
 const result=dailyFoodContext(['1990-05-05'],'2026-11-12');
 expect(result.members[0]).toMatchObject({birthDate:'1990-05-05',honmei:1,sunSign:'牡牛座',lifePath:11});
 expect(result.day).toBe('2026-11-12');expect(Object.values(result.dailyBalance).reduce((a,b)=>a+b,0)).toBe(2);
 expect(dailyFoodContext(['1990-05-05'],'2026-11-13')).not.toEqual(result);
});
it('rotates the main across Japanese, Western and Asian cuisine during a month',()=>{
 const cuisines=new Set(Array.from({length:30},(_,i)=>recipesForElement('wood',`2026-11-${String(i+1).padStart(2,'0')}`,'1990-05-05')[0]).filter(r=>r!==undefined).map(recipeCuisine));
 expect(cuisines.has('japanese')).toBe(true);expect(cuisines.has('western')).toBe(true);expect(cuisines.has('asian')).toBe(true);
});