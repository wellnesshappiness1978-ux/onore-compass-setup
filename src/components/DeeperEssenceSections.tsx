import ChunkedText from "@/components/ChunkedText";
import { useMemo } from 'react';
import { computeDeeperEssence, deeperEssenceKeys, type DeeperProfile, type DeeperEssenceKey } from '@/lib/deeper-essence';
import { deeperEssenceCopy, deeperEssenceSections } from '@/lib/deeper-essence-copy';
import type { Language } from '@/lib/translations';
import { SacredDisclosure } from './ui/sacred-disclosure';

export default function DeeperEssenceSections({ profile, language, passages }: { profile: DeeperProfile; language: Language; passages?: Partial<Record<DeeperEssenceKey, string>> | undefined }) {
  const values = useMemo(() => computeDeeperEssence(profile), [profile]);
  if (!values) return null;
  const c = deeperEssenceCopy[language], sections = deeperEssenceSections(values, language);
  return <div data-subject-fixed className="divide-y divide-primary/20">
    <p className="py-4 text-xs leading-6 text-muted-foreground">{c.note}</p>
    {deeperEssenceKeys.map((key, i) => <SacredDisclosure key={key} className="min-w-0 py-1 [overflow-wrap:anywhere]" title={<span className="flex items-start gap-3 font-serif text-lg leading-8 text-primary"><span className="shrink-0 font-mono text-xs leading-8">{String(i + 7).padStart(2, '0')}</span><span>{c.headings[i]}</span></span>}>
      <ChunkedText className="mt-3 text-base leading-8 text-foreground" text={passages?.[key]?.trim() || sections[key].body} />
    </SacredDisclosure>)}
  </div>;
}