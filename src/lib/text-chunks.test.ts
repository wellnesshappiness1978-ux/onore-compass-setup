import { expect, it } from 'vitest';
import { chunkText } from './text-chunks';

it('splits a long Japanese paragraph into paragraphs of two sentences', () => {
  const s = 'あ'.repeat(40) + '。' + 'い'.repeat(40) + '。' + 'う'.repeat(40) + '。';
  const chunks = chunkText(s);
  expect(chunks.map(c => c.kind)).toEqual(['paragraph', 'paragraph']);
  expect(chunks[0]!.text.endsWith('い。')).toBe(true);
});
it('recognises headings and bullets', () => {
  expect(chunkText('【強み】\n・直感\n・柔軟さ')).toEqual([
    { kind: 'heading', text: '強み' }, { kind: 'bullet', text: '直感' }, { kind: 'bullet', text: '柔軟さ' },
  ]);
});
