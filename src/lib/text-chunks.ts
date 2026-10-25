export type TextChunk = { kind: 'heading' | 'bullet' | 'paragraph'; text: string };

const SENTENCE = /[^。！？!?]+[。！？!?」』）)]*|[^。！？!?]+$/g;

/** Splits long readings into short readable blocks: 【headings】, ・bullets and paragraphs of at most `perParagraph` sentences. */
export function chunkText(input: string, perParagraph = 2, longParagraph = 110): TextChunk[] {
  const chunks: TextChunk[] = [];
  for (const raw of input.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const heading = /^【([^】]{1,40})】\s*(.*)$/.exec(line);
    if (heading) {
      chunks.push({ kind: 'heading', text: heading[1]! });
      if (heading[2]) chunks.push(...chunkText(heading[2], perParagraph, longParagraph));
      continue;
    }
    if (/^[・•\-*]\s*/.test(line)) { chunks.push({ kind: 'bullet', text: line.replace(/^[・•\-*]\s*/, '') }); continue; }
    if (line.length <= longParagraph) { chunks.push({ kind: 'paragraph', text: line }); continue; }
    const sentences = (line.match(SENTENCE) ?? [line]).map(s => s.trim()).filter(Boolean);
    for (let i = 0; i < sentences.length; i += perParagraph) {
      // Space-separated languages keep their spaces; Japanese/Chinese sentences join directly.
      chunks.push({ kind: 'paragraph', text: sentences.slice(i, i + perParagraph).join(/[\u3040-\u30ff\u4e00-\u9fff]/.test(line) ? '' : ' ') });
    }
  }
  return chunks;
}
