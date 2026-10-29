import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import MonthlyLuckyCard from './MonthlyLuckyCard';
import MonthlyFlowerCard from './MonthlyFlowerCard';
import { pickMonthlyFlower } from '../lib/seasonal-flowers';

/** The keyword line is the only place the three cards must agree on colour. */
const keyword = (html: string) => html.match(/<p class="([^"]+)" data-monthly-lucky-keyword>([\s\S]*?)<\/p>/);

describe('monthly-lucky keyword colour', () => {
  it('renders the keyword as a gold paragraph, never a heading', () => {
    const html = renderToStaticMarkup(<MonthlyLuckyCard label="ラッキーアクション" name="朝の散歩" description="理由" />);
    expect(keyword(html)?.[1]).toContain('text-primary');
    expect(html).not.toMatch(/<h[1-6]/);
  });

  it('gives the flower card the identical keyword treatment', () => {
    const pick = pickMonthlyFlower(['1990-05-05'], new Date(2026, 3, 1));
    const flower = keyword(renderToStaticMarkup(<MonthlyFlowerCard pick={pick} language="ja" />));
    const card = keyword(renderToStaticMarkup(<MonthlyLuckyCard label="x" name="y" description="z" />));
    expect(flower?.[1]).toBe(card?.[1]);
    expect(flower?.[2]).toBe(pick.flower.name.ja);
  });
});
