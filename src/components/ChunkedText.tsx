import { chunkText } from '@/lib/text-chunks';

/** Shared renderer for long AI/static readings: short paragraphs, bullets and small headings instead of dense blocks. */
export default function ChunkedText({ text, className = '' }: { text: string | undefined; className?: string }) {
  if (!text) return null;
  const chunks = chunkText(text);
  return <div className={`space-y-3 [overflow-wrap:anywhere] ${className}`}>
    {chunks.map((c, i) => c.kind === 'heading'
      ? <h5 key={i} className="pt-1 font-serif text-[0.95em] text-primary">{c.text}</h5>
      : c.kind === 'bullet'
        ? <p key={i} className="flex gap-2"><span aria-hidden="true" className="text-primary">・</span><span className="min-w-0">{c.text}</span></p>
        : <p key={i}>{c.text}</p>)}
  </div>;
}
