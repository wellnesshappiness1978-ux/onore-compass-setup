import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { consumeReadingStream, readingCacheKey, readReadingCache, writeReadingCache, readingCacheEpoch } from '@/lib/reading-cache';
import { localIso } from '@/lib/day-compass';
import type { generateHomeReading } from '@/lib/ai/home-reading.functions';
import type { UserProfile } from '@/components/Onboarding';
import type { Language } from '@/lib/translations';
import { essenceKeys, approachKeys } from '@/lib/trait-reading';
import { readCloudReading, saveCloudReading } from '@/lib/cloud-reading-cache';

type Reading = Awaited<ReturnType<typeof generateHomeReading>>;
type Request = { profile: UserProfile; language: Language; goal?: string; subject?: { label: string; isSelf: boolean }; group?: { name: string; members: UserProfile[] } };
type PartialReading = { catchphrase?: string; essence?: Partial<Reading['essence']>; deeperEssence?: Partial<Reading['deeperEssence']>; approaches?: Partial<Reading['approaches']>; axisSummary?: string; manualCore?: string; manualDecision?: string; manualTiming?: string };
const stringMap = (keys: readonly string[]) => z.object(Object.fromEntries(keys.map(k => [k, z.string()])));
const cacheSchema = z.object({ catchphrase: z.string(), essence: stringMap(essenceKeys), approaches: stringMap(approachKeys), axisSummary: z.string(), approachAvailability: z.record(z.string(), z.enum(['reference', 'context', 'unavailable'])) }).passthrough();
type Flight = { promise: Promise<unknown>; partial?: PartialReading; listeners: Set<(p: PartialReading) => void> };
const flights = new Map<string, Flight>();

export function usePersonalReading(request: Request, kind: 'full' | 'quick' = 'full', enabled = true) {
  const client = useQueryClient();
  const [identity, setIdentity] = useState({ key: '', sig: '' });
  const [partial, setPartial] = useState<{ key: string; value: PartialReading }>({ key: '', value: {} });
  const normalized = { ...request, goal: request.goal ?? '', subject: request.subject ?? { label: 'you', isSelf: true } };
  const sig = JSON.stringify(normalized);
  const key = identity.sig === sig ? identity.key : '';
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const next = readingCacheKey(kind, localIso(new Date()), normalized, data.session?.user.id ?? 'guest');
      const schema = kind === 'full' ? cacheSchema : z.object({ catchphrase: z.string(), essence: stringMap(essenceKeys) });
      const cached = readReadingCache(next, schema);
      if (cached) { client.setQueryData([next], cached); void saveCloudReading(next,cached).catch(()=>undefined); }
      setIdentity({ key: next, sig });
    });
    return () => { active = false; };
  }, [sig, kind, client]);
  const query = useQuery<Reading>({
    queryKey: [key], enabled: Boolean(key) && enabled, staleTime: Infinity, gcTime: Infinity, retry: false, retryOnMount: false, refetchOnWindowFocus: false,
    queryFn: async () => {
      // Also restore here after query eviction or a screen re-entry: no network for a completed reading.
      const schema = kind === 'full' ? cacheSchema : z.object({ catchphrase: z.string(), essence: stringMap(essenceKeys) });
      const cached = readReadingCache(key, schema);
      if (cached) return cached as Reading;
      let flight = flights.get(key);
      if (!flight) {
        const listeners = new Set<(p: PartialReading) => void>();
        const epoch = readingCacheEpoch();
        const next: Flight = { listeners, promise: Promise.resolve(undefined) };
        next.promise = (async () => {
          const saved = await readCloudReading(key,schema);
          if (saved) { writeReadingCache(key,saved); return saved; }
          const response = await fetch('/api/readings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...normalized, kind }) });
          const value = await consumeReadingStream(response, value => {
          next.partial = value as PartialReading;
          for (const listener of listeners) listener(next.partial);
          });
          if (epoch === readingCacheEpoch()) { writeReadingCache(key,value); await saveCloudReading(key,value).catch(()=>undefined); }
          return value;
        })().finally(() => flights.delete(key));
        flights.set(key, next); flight = next;
      }
      return await flight.promise as Reading;
    },
  });
  useEffect(() => {
    if (!key || !enabled) return;
    const listener = (value: PartialReading) => setPartial({ key, value });
    const flight = flights.get(key);
    if (flight?.partial) listener(flight.partial);
    flight?.listeners.add(listener);
    return () => { flight?.listeners.delete(listener); };
  }, [key, enabled, query.isFetching]);
  return { ...query, partial: partial.key === key ? partial.value : {}, isPending: enabled && (!key || query.isPending) };
}