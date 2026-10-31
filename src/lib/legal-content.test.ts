import { describe, expect, it } from 'vitest';
import { legalContentByLanguage } from './legal-content';
import type { Language } from './translations';

const languages = Object.keys(legalContentByLanguage) as Language[];
const commerce = legalContentByLanguage.ja.commerce;
const field = (label: string) => commerce.sections.find(([title]) => title === label)?.[1] ?? '';

describe('特定商取引法に基づく表記', () => {
  it('publishes only the office and discloses operator name, address and phone on request', () => {
    expect(field('販売事業者名')).toBe('オノレコンパス運営事務局');
    for (const label of ['運営責任者', '所在地', '電話番号']) {
      expect(field(label)).toBe('請求があった場合に遅滞なく開示いたします。');
    }
  });

  it('refers prices to the purchase screen rather than duplicating them', () => {
    expect(field('販売価格')).toBe('各プラン購入画面に表示');
  });

  it('only advertises the supported payment provider', () => {
    expect(field('お支払い方法')).toBe('クレジットカード決済（Stripe）');
  });

  it('provides immediate access after completed payment', () => {
    expect(field('商品引き渡し時期')).toBe('決済手続き完了後、即時ご利用いただけます。');
  });

  it('keeps settings cancellation and paid-period access without excluding statutory refunds', () => {
    expect(field('返品・解約方針')).toContain('定期購入の解約は設定画面よりいつでも可能です。');
    expect(field('返品・解約方針')).toContain('支払い済み期間の終了まで');
    expect(field('法令に基づく権利')).toContain('取消し・返金等の権利を制限するものではありません');
  });

  it('keeps no private identity data in the notice', () => {
    const text = commerce.sections.map(([title, body]) => `${title} ${body}`).join('\n');
    expect(text).not.toMatch(/〒|\d{2,4}-\d{2,4}-\d{4}|[都道府県]市/);
  });

  it('keeps private identity and the actual payment method in every language', () => {
    for (const language of languages) {
      const entry = legalContentByLanguage[language].commerce;
      const text = entry.sections.map(([title, body]) => `${title} ${body}`).join('\n');
      expect(text).toContain('オノレコンパス運営事務局');
      expect(text).toContain('Stripe');
      expect(text).not.toMatch(/〒|\d{2,4}-\d{2,4}-\d{4}/);
    }
  });
});
