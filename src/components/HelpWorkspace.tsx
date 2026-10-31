import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { Plus, MessageCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createHelpThread, listHelpThreads } from '@/lib/help-threads.functions';
import { helpCopy } from '@/lib/help-copy';
import type { Language } from '@/lib/translations';
import HelpFAQ from './HelpFAQ';
import SupportForm from './SupportForm';
import { Button } from './ui/button';
const AccountContext=createContext<string|null>(null);
export const useHelpAccount=()=>useContext(AccountContext);
export default function HelpWorkspace({language,children}:{language:Language;children:ReactNode}){
 const [owner,setOwner]=useState<string|null>(null); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [showForm,setShowForm]=useState(false);
 const t=helpCopy[language];const list=useServerFn(listHelpThreads); const create=useServerFn(createHelpThread);const navigate=useNavigate();
 useEffect(()=>{let active=true;void supabase.auth.getSession().then(({data})=>{if(active)setOwner(data.session?.user.id??null);});const {data}=supabase.auth.onAuthStateChange((_,session)=>{setOwner(session?.user.id??null);setShowForm(false);});return()=>{active=false;data.subscription.unsubscribe();};},[]);
 useEffect(()=>{const open=()=>setShowForm(true);window.addEventListener('agolmen-support-escalate',open);return()=>window.removeEventListener('agolmen-support-escalate',open);},[]);
 const threads=useQuery({queryKey:['help-threads',owner],queryFn:()=>list(),enabled:Boolean(owner),retry:false});
 const start=async()=>{setBusy(true);setError('');try{const thread=await create();await threads.refetch();await navigate({to:'/support/$threadId',params:{threadId:thread.id}});}catch{setError(t.error);}finally{setBusy(false);}};
 return <AccountContext.Provider value={owner}><div className="space-y-8"><section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><img src="/agolmen-icon.png" alt="" className="size-11 object-contain"/><h2 className="font-serif text-xl text-primary">{t.chat}</h2></div><Button disabled={!owner||busy} onClick={start}><Plus className="size-4"/>{t.newThread}</Button></div><p className="mb-4 text-xs leading-6 text-muted-foreground">{t.privacy}</p>{!owner&&<p role="status" className="text-sm text-primary">{t.signin}</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{owner&&<div className="grid min-w-0 gap-4 md:grid-cols-[190px_minmax(0,1fr)]"><nav aria-label={t.history} className="min-w-0 border-b border-border pb-3 md:border-b-0 md:border-r md:pr-3"><h3 className="mb-2 text-sm font-semibold text-muted-foreground">{t.history}</h3>{threads.isError&&<Button variant="ghost" onClick={()=>void threads.refetch()}>{t.retry}</Button>}<ul className="max-h-72 space-y-1 overflow-y-auto">{threads.data?.map(thread=><li key={thread.id}><Button asChild variant="ghost" className="h-auto min-h-11 w-full justify-start whitespace-normal text-left text-xs"><Link to="/support/$threadId" params={{threadId:thread.id}} activeProps={{className:'bg-accent text-accent-foreground'}}><MessageCircle className="size-4 shrink-0"/><span className="min-w-0 break-words">{thread.title==='AI support'?t.newThread:thread.title}</span></Link></Button></li>)}</ul></nav><div className="min-w-0">{children}</div></div>}</section><HelpFAQ language={language}/><section className="border-t border-border pt-5"><Button variant="outline" className="h-auto min-h-11 whitespace-normal" onClick={()=>setShowForm(value=>!value)} aria-expanded={showForm}><Mail className="size-4"/>{t.escalate}</Button>{showForm&&<div id="administrator-support" className="mt-5"><SupportForm language={language}/></div>}</section></div></AccountContext.Provider>;
}