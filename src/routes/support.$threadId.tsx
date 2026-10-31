import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';
import type { UIMessage } from 'ai';
import HelpChat from '@/components/HelpChat';
import { useHelpAccount } from '@/components/HelpWorkspace';
import { readHelpThread } from '@/lib/help-threads.functions';
import { storedLanguage } from '@/lib/support-copy';
import { helpCopy } from '@/lib/help-copy';
import type { Language } from '@/lib/translations';
import { Button } from '@/components/ui/button';
export const Route=createFileRoute('/support/$threadId')({head:()=>({meta:[{title:'AIサポートの相談 | アゴルメンの羅針盤'},{name:'description',content:'ご本人専用のAIサポート相談。アプリの使い方や契約について確認できます。'},{property:'og:title',content:'AIサポートの相談 | アゴルメンの羅針盤'},{property:'og:description',content:'本人専用のAIサポート会話。'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex,nofollow'}]}),component:ThreadPage});
function ThreadPage(){const {threadId}=Route.useParams();const owner=useHelpAccount();const read=useServerFn(readHelpThread);const queryClient=useQueryClient();const [language,setLanguage]=useState<Language>('ja');useEffect(()=>setLanguage(storedLanguage()),[]);const t=helpCopy[language];const query=useQuery({queryKey:['help-thread',owner,threadId],queryFn:()=>read({data:{id:threadId}}),enabled:Boolean(owner),retry:false});if(!owner)return null;if(query.isError)return <div role="alert"><p>{t.error}</p><Button onClick={()=>void query.refetch()}>{t.retry}</Button></div>;if(!query.data)return <p role="status">{t.thinking}</p>;return <HelpChat key={`${owner}-${threadId}`} threadId={threadId} language={language} initialMessages={query.data.messages as unknown as UIMessage[]} onComplete={()=>{void queryClient.invalidateQueries({queryKey:['help-threads',owner]});}}/>;}