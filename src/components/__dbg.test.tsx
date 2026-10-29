import { it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import MonthlyLuckyCard from './MonthlyLuckyCard';
import MonthlyFlowerCard from './MonthlyFlowerCard';
import { pickMonthlyFlower } from '../lib/seasonal-flowers';
it('dbg', () => {
  const pick = pickMonthlyFlower(['1990-05-05'], new Date(2026, 3, 1));
  console.log('CARD:', renderToStaticMarkup(<MonthlyLuckyCard label="a" name="朝の散歩" description="b" />).slice(0, 200));
  console.log('FLOWER:', renderToStaticMarkup(<MonthlyFlowerCard pick={pick} language="ja" />).slice(0, 200));
});
