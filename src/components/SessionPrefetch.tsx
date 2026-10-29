import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { useFocus } from './FocusProvider';
import { computeCoreLayers } from '@/lib/ai/core-layers';
import { localIso } from '@/lib/day-compass';
import { readingCacheEpoch } from '@/lib/reading-cache';
import { restoreSessionReadings } from '@/lib/session-prefetch';
import { listConsultationBookmarks } from '@/lib/consultation-bookmarks.functions';
import { useFamilyReading } from '@/hooks/use-family-reading';
import { CLOUD_SYNC_EVENT } from '@/lib/account-sync';
import type { Language } from '@/lib/translations';
import type { Plan } from '@/lib/design-modes';

/** Cache-only private read warm-up. Never mounts speculative AI-reading components. */
export default function SessionPrefetch({ signedIn, actualPlan, language }: { signedIn: boolean; actualPlan: Plan; language: Language }) {
  const focus = useFocus();
  const client = useQueryClient();
  const bookmarks = useServerFn(listConsultationBookmarks);
  const day = localIso(new Date());
  const signature = JSON.stringify([focus?.owner,focus?.members,focus?.group,focus?.focus.goal]);
  useFamilyReading({groupId:focus?.group?.group.id ?? null,language,day}, signature, signedIn && (actualPlan === 'b2b' || actualPlan === 'b2b-premium'));
  useEffect(() => {
    if (!focus) return;
    const profile = focus.readingProfile;
    const key = ['core-layers',day,JSON.stringify(profile)];
    void client.prefetchQuery({queryKey:key,queryFn:()=>computeCoreLayers(profile),staleTime:Infinity,gcTime:Infinity});
  }, [client, day, JSON.stringify(focus?.readingProfile)]);
  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    const warm = async () => {
      const epoch = readingCacheEpoch();
      const { data } = await supabase.auth.getSession();
      const owner = data.session?.user.id;
      if (!active || !owner) return;
      await Promise.allSettled([
        client.prefetchQuery({queryKey:['consultation-bookmarks',owner],queryFn:()=>bookmarks(),staleTime:Infinity,gcTime:Infinity}),
        (async () => {
          const rows = await supabase.from('reading_device_cache').select('local_key,result').eq('user_id',owner).order('updated_at',{ascending:false}).limit(64);
          if (rows.error || !active || epoch !== readingCacheEpoch()) return;
          const current = await supabase.auth.getSession();
          if (current.data.session?.user.id !== owner || !active) return;
          restoreSessionReadings(client,rows.data ?? [],epoch);
        })(),
      ]);
    };
    void warm();
    window.addEventListener(CLOUD_SYNC_EVENT,warm);
    return () => { active=false; window.removeEventListener(CLOUD_SYNC_EVENT,warm); };
  }, [signedIn,client,bookmarks]);
  return null;
}