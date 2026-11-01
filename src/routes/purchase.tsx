import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Crown, LoaderCircle, RefreshCw, Settings, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { billingPlans, type BillingPlan } from '@/lib/billing-plans';
import { billingCopy } from '@/lib/billing-copy';
import { createBillingCheckout, createBillingPortal, getBillingStatus } from '@/lib/billing.functions';
import { planCardsCopy } from '@/lib/plan-cards';
import { appearanceUiCopy } from '@/lib/appearance-ui-copy';
import { storedLanguage } from '@/lib/support-copy';
import type { Language } from '@/lib/translations';
import type { Plan } from '@/lib/design-modes';
import logo from '@/assets/agolmen-logo-shell.png';
import { legalContentByLanguage } from '@/lib/legal-content';
import { billingErrorText, planBenefits, planBenefitsCopy } from '@/lib/plan-benefits';
import type { BillingErrorCode } from '@/lib/billing-errors';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export const Route = createFileRoute('/purchase')({
 validateSearch: (s: Record<string, unknown>): { session_id?: string; canceled?: boolean } => ({ ...(typeof s['session_id'] === 'string' && /^cs_(test_|live_)?[a-zA-Z0-9]+$/.test(s['session_id']) ? {session_id:s['session_id']} : {}), ...(s['canceled'] === 'true' || s['canceled'] === true ? {canceled:true} : {}) }),
 head: () => ({ meta: [{ title:'会員登録・プラン購入 | アゴルメンの羅針盤' },{ name:'description',content:'スタンダード・VIP・ファミリーの料金を比較し、Stripeで安全に会員登録。' },{ property:'og:title',content:'会員登録・プラン購入 | アゴルメンの羅針盤' },{ property:'og:description',content:'有料プランの料金比較・購入・契約管理。' },{ property:'og:type',content:'website' },{ name:'twitter:card',content:'summary_large_image' }] }),
 component: Purchase,
});
function Purchase() {
 const search = Route.useSearch();
 const [language,setLanguage] = useState<Language>('ja');
 const [signedIn,setSignedIn] = useState(false);
 const [ready,setReady] = useState(false);
 const [yearly,setYearly] = useState(false);
 const [consent,setConsent] = useState(false);
 const [busy,setBusy] = useState<string | null>(null);
 const [message,setMessage] = useState<'error'|'success'|'pending'|null>(null);
 const [plan,setPlan] = useState<Plan>('free');
 const [linked,setLinked] = useState(false);
 const [errorCode,setErrorCode] = useState<BillingErrorCode>('unavailable');
 const [selected,setSelected] = useState<BillingPlan | null>(null);
 const check = useServerFn(getBillingStatus);
 const checkout = useServerFn(createBillingCheckout);
 const portal = useServerFn(createBillingPortal);
 const t = billingCopy[language];
 const names = appearanceUiCopy[language].plans;
 const refresh = useCallback(async () => {
   setBusy('refresh');
   try {
     const result = await check({ data: { ...(search.session_id ? { sessionId:search.session_id } : {}) } });
     if (!result.ok) { setErrorCode(result.error); setMessage('error'); return; }
     setPlan(result.plan); setLinked(result.linked);
     setMessage(search.session_id ? result.pending || result.plan === 'free' ? 'pending' : 'success' : null);
   } catch { setMessage('error'); } finally { setBusy(null); }
 }, [check,search.session_id]);
 useEffect(() => {
   setLanguage(storedLanguage());
   let active = true;
   const load = async () => {
     const { data } = await supabase.auth.getUser();
     if (!active) return;
     setSignedIn(Boolean(data.user)); setReady(true);
     if (data.user) await refresh();
   };
   void load();
   const { data:{ subscription } } = supabase.auth.onAuthStateChange((event) => {
     if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') window.setTimeout(() => { if (active) void load(); },0);
   });
   return () => { active=false; subscription.unsubscribe(); };
 },[refresh]);
 const open = async (selected?: BillingPlan) => {
   setBusy(selected ?? 'portal'); setMessage(null);
   try {
     const result = selected ? await checkout({ data:{ plan:selected,yearly } }) : await portal();
     if (!result.ok) { setErrorCode(result.error); setMessage('error'); return; }
     if (!/^https:\/\/(checkout|billing)\.stripe\.com\//.test(result.url)) { setErrorCode('checkout'); setMessage('error'); return; }
     // Same-tab redirect: popups are blocked on mobile Safari/Chrome and in-app browsers.
     window.location.href=result.url; return;
   } catch { setErrorCode('network'); setMessage('error'); } finally { setBusy(null); }
 };
 return <main className="design-canvas mx-auto min-h-screen max-w-5xl px-4 py-8 text-foreground sm:px-8">
   <Button asChild variant="ghost" className="mb-6"><Link to="/app"><ArrowLeft className="size-4" />{t.return}</Link></Button>
   <header className="mb-8 flex min-w-0 items-center gap-4 border-b border-primary/25 pb-6">
     <img src={logo} alt="" className="size-16 shrink-0 object-contain" />
     <div className="min-w-0"><p className="font-serif text-lg text-primary">アゴルメンの羅針盤</p><h1 className="mt-1 break-words font-serif text-2xl sm:text-3xl">{t.title}</h1></div>
   </header>
   {message && <p role="status" className="mb-5 break-words rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm">{message === 'error' ? billingErrorText(language,errorCode) : t[message]}</p>}
   {search.canceled && <p role="status" className="mb-5 text-sm text-muted-foreground">{t.canceled}</p>}
   <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
     <p className="text-sm">{t.current}: <strong className="text-primary">{names[plan]}</strong></p>
     <div role="radiogroup" aria-label={t.title} className="flex gap-2">{[false,true].map(value=><Button key={String(value)} variant={yearly===value?'default':'outline'} role="radio" aria-checked={yearly===value} onClick={()=>setYearly(value)}>{value?t.yearly:t.monthly}</Button>)}</div>
   </div>
   {!signedIn && <Button disabled={!ready || busy!==null} className="mb-6 min-h-11 h-auto whitespace-normal" onClick={async()=>{setBusy('signin');try {const result=await lovable.auth.signInWithOAuth('google',{ redirect_uri:`${window.location.origin}/purchase` });if(result.error)setMessage('error');}catch{setMessage('error');}finally{setBusy(null);}}}><ShieldCheck className="size-4" />{ready?t.signin:t.loading}</Button>}
   <div className="grid min-w-0 gap-4 md:grid-cols-2">
     <article className="rounded-lg border border-primary/25 bg-card p-5"><h2 className="font-serif text-xl">{names.free}</h2><p className="my-4 text-3xl text-primary">¥0</p><ul className="space-y-2 text-sm">{planBenefits('free',language).map(f=><li key={f}>・{f}</li>)}</ul></article>
     {billingPlans.map(entry=>{
       const price=yearly?entry.yearly:entry.monthly;
       const details=planCardsCopy[language].cards.find(c=>c.id===entry.plan);
       return <article key={entry.plan} className={`flex min-w-0 flex-col rounded-lg border bg-card p-5 ${entry.plan==='vip'?'border-primary shadow-champagne':'border-primary/25'}`}>
         <Crown className="mb-3 size-6 text-primary" /><h2 className="break-words font-serif text-xl">{names[entry.plan]}</h2>
         <p className="my-4 flex flex-wrap items-baseline gap-2"><strong className="text-3xl text-primary">¥{(price??entry.monthly).amount.toLocaleString('ja-JP')}</strong><span className="text-sm text-muted-foreground">/ {price && yearly?t.yearly:t.monthly}</span></p>
         <p className="mb-3 text-sm font-semibold text-primary">{planBenefits(entry.plan,language).at(-1)}</p>
         <ul className="mb-5 flex-1 space-y-2 text-sm leading-relaxed">{details?.features.map(f=><li key={f} className="break-words">・{f}</li>)}</ul>
         <Button className="h-auto min-h-12 w-full whitespace-normal" disabled={!signedIn || !consent || busy!==null || !price} onClick={()=>{setMessage(null);setSelected(entry.plan);}}><CreditCard className="size-4 shrink-0" />{t.pay}</Button>
       </article>;
     })}
   </div>
   <section className="mt-6 space-y-4 border-t border-primary/25 py-6">
     <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"><Checkbox checked={consent} onCheckedChange={v=>setConsent(v===true)} className="mt-1 shrink-0" /><span>{t.terms}</span></label>
     <div className="flex flex-wrap gap-4 text-sm text-primary">{(['terms','commerce','privacy'] as const).map(document=><Link key={document} to="/legal/$document" params={{document}}>{legalContentByLanguage[language][document].title}</Link>)}</div>
     <p className="text-sm leading-relaxed text-muted-foreground">{t.notice}</p>
     {signedIn && <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={busy!==null} onClick={()=>void refresh()}><RefreshCw className="size-4" />{t.refresh}</Button>{linked && <Button variant="outline" className="h-auto min-h-11 whitespace-normal" disabled={busy!==null} onClick={()=>void open()}><Settings className="size-4" />{t.manage}</Button>}</div>}
   </section>
   <Dialog open={selected!==null} onOpenChange={v=>{if(!v&&busy===null)setSelected(null);}}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogTitle>{planBenefitsCopy[language].confirm}</DialogTitle><DialogDescription>{selected ? names[selected] : ''} · ¥{selected ? (yearly ? billingPlans.find(p=>p.plan===selected)?.yearly?.amount : billingPlans.find(p=>p.plan===selected)?.monthly.amount)?.toLocaleString('ja-JP') : ''} / {yearly?t.yearly:t.monthly}</DialogDescription>{selected && <ul className="space-y-3 text-sm leading-relaxed">{planBenefits(selected,language).map(f=><li key={f}>・{f}</li>)}</ul>}<p className="text-sm text-muted-foreground">{t.notice}</p>{message==='error'&&<p role="alert" className="text-sm text-primary">{billingErrorText(language,errorCode)}</p>}<Button disabled={busy!==null||!consent} className="h-auto min-h-12 whitespace-normal" onClick={()=>{if(selected)void open(selected);}}>{busy?<LoaderCircle className="size-4 animate-spin"/>:<CreditCard className="size-4"/>}{t.pay}</Button></DialogContent></Dialog>
 </main>;
}