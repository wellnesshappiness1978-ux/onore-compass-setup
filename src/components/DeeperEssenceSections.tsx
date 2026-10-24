import { useMemo } from 'react';
import { computeDeeperEssence, deeperEssenceKeys, type DeeperProfile, type DeeperEssenceKey } from '@/lib/deeper-essence';
import { deeperEssenceCopy, deeperEssenceSections } from '@/lib/deeper-essence-copy';
import type { Language } from '@/lib/translations';

export default function DeeperEssenceSections({ profile, language, passages }: { profile: DeeperProfile; language: Language; passages?: Partial<Record<DeeperEssenceKey, string>> | undefined }) {
  const values = useMemo(() => computeDeeperEssence(profile), [profile]);
  if (!values) return null;
  const c = deeperEssenceCopy[language], sections = deeperEssenceSections(values, language);
  return <div data-subject-fixed className="divide-y divide-primary/20">
    <p className="py-4 text-xs leading-6 text-muted-foreground">{c.note}</p>
    {deeperEssenceKeys.map((key, i) => <article key={key} className="min-w-0 py-5 [overflow-wrap:anywhere]">
      <h4 className="flex items-start gap-3 font-serif text-lg leading-8 text-primary"><span className="shrink-0 font-mono text-xs leading-8">{String(i + 7).padStart(2, '0')}</span><span>{c.headings[i]}</span></h4>
      <p className="mt-3 whitespace-pre-line text-base leading-8 text-foreground">{passages?.[key]?.trim() || sections[key].body}</p>
    </article>)}
  </div>;
}