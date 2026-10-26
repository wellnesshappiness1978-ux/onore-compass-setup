import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateFamilyReading, readFamilyReading } from '@/lib/family-reading.functions';
import { CLOUD_SYNC_EVENT } from '@/lib/account-sync';
import { familyReadingSchema } from '@/lib/family-reading';
import type { Language } from '@/lib/translations';
import { supabase } from '@/integrations/supabase/client';
import { readingCacheKey, readReadingCache, writeReadingCache } from '@/lib/reading-cache';

export function useFamilyReading(input: { groupId: string | null; language: Language; day: string }, signature: string, enabled: boolean) {
  const read = useServerFn(readFamilyReading), generate = useServerFn(generateFamilyReading);
  const client = useQueryClient();
  const [ownerKey,setOwnerKey] = useState<string | null>(null);
  const key = ['family-reading','v2-planning',ownerKey,input,signature];
  const deviceKey = ownerKey ? readingCacheKey('family-v2-planning',input.day,{input,signature},ownerKey) : null;
  useEffect(()=>{
    let active=true;
    if (!enabled) { setOwnerKey(null); return; }
    void supabase.auth.getSession().then(({data})=>{
      const id=data.session?.user.id;
      if (!active || !id) return;
      const local=readingCacheKey('family-v2-planning',input.day,{input,signature},id);
      const saved=readReadingCache(local,familyReadingSchema);
      if(saved) client.setQueryData(['family-reading','v2-planning',id,input,signature],{status:'complete',result:saved,error:null});
      setOwnerKey(id);
    });
    return ()=>{active=false;};
  },[enabled,input.groupId,input.language,input.day,signature,client]);
  const query = useQuery({queryKey:key,queryFn:()=>read({data:input}),enabled:enabled && ownerKey!==null,staleTime:Infinity,gcTime:Infinity,retry:false,retryOnMount:false,refetchOnWindowFocus:false,refetchInterval:q=>q.state.data?.status==='pending'?5000:false});
  const mutation = useMutation({ mutationFn:async ()=>({value:await generate({data:input}),key}),retry:false,onSuccess:({value,key:savedKey})=>client.setQueryData(savedKey,value) });
  useEffect(()=>{
    const refresh = () => { if (enabled) void client.invalidateQueries({queryKey:['family-reading']}); };
    window.addEventListener(CLOUD_SYNC_EVENT,refresh);
    return ()=>window.removeEventListener(CLOUD_SYNC_EVENT,refresh);
  },[client,enabled]);
  const parsed = familyReadingSchema.safeParse(query.data?.result);
  useEffect(()=>{
    const saved=familyReadingSchema.safeParse(query.data?.result);
    if(deviceKey && query.data?.status==='complete' && saved.success) writeReadingCache(deviceKey,saved.data);
  },[deviceKey,query.data]);
  return { ...query, reading:parsed.success?parsed.data:null, status:mutation.isPending?'pending':query.data?.status, errorMessage:query.data?.error ?? (mutation.error instanceof Error ? mutation.error.message : query.error instanceof Error ? query.error.message : null), generate:()=> { if (enabled && !query.isPending && !query.isError && !mutation.isPending && !query.data) mutation.mutate(); } };
}