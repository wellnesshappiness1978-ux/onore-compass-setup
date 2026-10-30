import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Crown, LockKeyhole } from 'lucide-react';
import { Button } from './ui/button';
import { AgolmenLoading } from './AgolmenSpiral';
import { generateDeepCompatibility, type DeepReport } from '@/lib/deep-compatibility.functions';
import { hasDeepCompatibility, planBenefitsCopy } from '@/lib/plan-benefits';
import type { Language } from '@/lib/translations';
import type { Plan } from '@/lib/design-modes';
import type { PartnerInput } from '@/lib/compatibility-analysis';
import type { UserProfile } from './Onboarding';

export default function DeepCompatibilityReport({profile,partner,plan,signedIn,language,relationship,concern,onReport}:{profile:UserProfile;partner:PartnerInput;plan:Plan;signedIn:boolean;language:Language;relationship:string;concern:string;onReport:(report:DeepReport|null)=>void}) {
 const t=planBenefitsCopy[language];
 const allowed=signedIn&&hasDeepCompatibility(plan);
 const [report,setReport]=useState<DeepReport|null>(null);
 const [busy,setBusy]=useState(false);
 const [failed,setFailed]=useState(false);
 const generate=useServerFn(generateDeepCompatibility);
 useEffect(()=>{if(!allowed){setReport(null);onReport(null);}},[allowed,onReport]);
 if(!allowed)return <section className="mt-4 space-y-4 border-y border-primary/25 py-6"><LockKeyhole className="size-6 text-primary"/><p className="text-sm leading-7">{t.lock}</p><Button asChild className="h-auto min-h-11 whitespace-normal"><Link to="/purchase"><Crown className="size-4"/>{t.purchase}</Link></Button></section>;
 return <section className="mt-4 space-y-5 border-y border-primary/25 py-6">
 {report ? (['values','communication','romance','longTerm'] as const).map(key=><div key={key}><h4 className="font-serif text-lg text-primary">{t[key]}</h4><p className="mt-2 whitespace-pre-line text-base leading-8">{report[key]}</p></div>) : <Button disabled={busy} className="h-auto min-h-11 whitespace-normal" onClick={async()=>{setBusy(true);setFailed(false);try{const r=await generate({data:{owner:profile,partner,language,relationship,concern}});if(r.ok){setReport(r.report);onReport(r.report);}else setFailed(true);}catch{setFailed(true);}finally{setBusy(false);}}}><Crown className="size-4"/>{t.generate}</Button>}
 {busy&&<AgolmenLoading compact label={t.generate}/>}{failed&&<p role="alert" className="text-sm text-primary">{t.error}</p>}
 </section>;
}