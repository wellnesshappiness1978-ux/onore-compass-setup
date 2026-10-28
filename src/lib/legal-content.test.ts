import { describe, expect, it } from 'vitest';
import { legalContentByLanguage } from './legal-content';
import { settingsTranslations } from './settings-translations';
import type { Language } from './translations';

const languages = Object.keys(legalContentByLanguage) as Language[];
const commerce = legalContentByLanguage.ja.commerce;
const field = (label: string) => commerce.sections.find(([title]) => title === label)?.[1] ?? '';

describe('特定商取引法に基づく表記', () => {
  it('titles the notice after the Act', () => {
    expect(commerce.title).toBe('特定商取引法に基づく表記');
  });

  it('lists the nine requested fields in the requested order', () => {
    expect(commerce.sections.map(([title]) => title)).toEqual([
      '販売事業者', '運営責任者', '所在地', 'お問合せ先', '電話番号',
      '販売価格', '商品代金以外の必要料金', '引き渡し時期', '返品・キャンセル',
    ]);
  });

  it('publishes only the office and discloses operator name, address and phone on request', () => {
    expect(field('販売事業者')).toBe('アゴルメンの羅針盤 運営事務局');
    for (const label of ['運営責任者', '所在地', '電話番号']) {
      expect(field(label)).toBe('請求があった場合、遅滞なく開示いたします。');
    }
    expect(field('お問合せ先')).toBe('アプリ内のお問合せフォームよりご連絡ください。');
  });

  it('states every requested price', () => {
    const prices = field('販売価格');
    expect(prices).toContain('スタンダード会員：月額 333円 / 年額 3,333円');
    expect(prices).toContain('VIP会員：月額 777円 / 年額 7,777円');
    expect(prices).toContain('ファミリー会員：月額 3,580円');
    expect(prices).toContain('ファミリープレミアム会員：月額 8,888円');
  });

  it('agrees with the prices shown on the plan screen', () => {
    const prices = field('販売価格');
    for (const tier of settingsTranslations.ja.tiers.filter(tier => tier.id !== 'free')) {
      expect(prices).toContain(tier.priceMonthly.replace('¥', ''));
      expect(prices).toContain(tier.priceYearly.replace('¥', ''));
    }
    expect(prices).toContain('8,888');
  });

  it('states extra fees, immediate delivery and the digital-content refund rule', () => {
    expect(field('商品代金以外の必要料金')).toBe('パケット通信料等はお客様のご負担となります。');
    expect(field('引き渡し時期')).toBe('購入・決済完了後、即時（リアルタイム）にご利用いただけます。');
    const cancellation = field('返品・キャンセル');
    expect(cancellation).toContain('デジタルコンテンツの性質上、購入後の返金・キャンセルには応じられません。');
    expect(cancellation).toContain('App Store / Google Play');
  });

  it('keeps no private identity data in the notice', () => {
    const text = commerce.sections.map(([title, body]) => `${title} ${body}`).join('\n');
    expect(text).not.toMatch(/〒|\d{2,4}-\d{2,4}-\d{4}|[都道府県]市/);
  });

  it('carries the same nine fields, prices and privacy wording in all seven languages', () => {
    for (const language of languages) {
      const entry = legalContentByLanguage[language].commerce;
      expect(entry.sections).toHaveLength(9);
      const prices = entry.sections[5][1];
      for (const figure of ['333', '3,333', '777', '7,777', '3,580', '8,888']) {
        expect(prices).toContain(figure);
      }
      const text = entry.sections.map(([title, body]) => `${title} ${body}`).join('\n');
      expect(text).not.toMatch(/〒|\d{2,4}-\d{2,4}-\d{4}/);
    }
  });
});
