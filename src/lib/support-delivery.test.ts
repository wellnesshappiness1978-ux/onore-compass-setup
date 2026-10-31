import { describe, expect, it } from 'vitest';
import { supportMailto } from './support-delivery';

describe('support email handoff', () => {
  it('addresses the known administrator', () => {
    expect(new URL(supportMailto('ticket-1', '問い合わせ', '本文')).pathname).toBe('wellness.happiness1978@gmail.com');
  });
  it('retains the full saved message and ticket without adding email recipients', () => {
    const message = '相談内容 & ? #\n最後の行まで保持';
    const url = new URL(supportMailto('ticket-1', '件名&bcc=other@example.com', message));
    expect(url.searchParams.get('subject')).toBe('[アゴルメンの羅針盤 / ticket-1] 件名&bcc=other@example.com');
    expect(url.searchParams.get('body')).toBe(`受付番号: ticket-1\n\n${message}`);
    expect(url.searchParams.has('bcc')).toBe(false);
  });
});