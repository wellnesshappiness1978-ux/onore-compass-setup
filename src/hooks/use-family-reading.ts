import { useEffect } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateFamilyReading, readFamilyReading } from '@/lib/family-reading.functions';
import { CLOUD_SYNC_EVENT } from '@/lib/account-sync';
import { familyReadingSchema } from '@/lib/family-reading';
import type { Language } from '@/lib/translations';

export function useFamilyReading(input: { groupId: string | null; language: Language; day: string }, signature: string, enabled: boolean) {
  const read = useServerFn(readFamilyReading), generate = useServerFn(generateFamilyReading);
  const client = useQueryClient();
  const key = ['family-reading',input,signature];
  const query = useQuery({queryKey:key,queryFn:()=>read({data:input}),enabled,staleTime:Infinity,gcTime:Infinity,retry:false,retryOnMount:false,refetchOnWindowFocus:false});
  const mutation = useMutation({ mutationFn:async ()=>({value:await generate({data:input}),key}),retry:false,onSuccess:({value,key:savedKey})=>client.setQueryData(savedKey,value) });
  useEffect(()=>{
    const refresh = () => { if (enabled) void client.invalidateQueries({queryKey:['family-reading']}); };
    window.addEventListener(CLOUD_SYNC_EVENT,refresh);
    return ()=>window.removeEventListener(CLOUD_SYNC_EVENT,refresh);
  },[client,enabled]);
  const parsed = familyReadingSchema.safeParse(query.data?.result);
  return { ...query, reading:parsed.success?parsed.data:null, status:mutation.isPending?'pending':query.data?.status, errorMessage:query.data?.error ?? (mutation.error instanceof Error ? mutation.error.message : query.error instanceof Error ? query.error.message : null), generate:()=> { if (!mutation.isPending && !query.data) mutation.mutate(); } };
}