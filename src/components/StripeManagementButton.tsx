import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ExternalLink } from 'lucide-react';
import { createBillingPortal } from '@/lib/billing.functions';
import { billingErrorText } from '@/lib/plan-benefits';
import { helpCopy } from '@/lib/help-copy';
import { billingCopy } from '@/lib/billing-copy';
import type { Language } from '@/lib/translations';
import { Button } from './ui/button';
export default function StripeManagementButton({ language, signedIn }: { language: Language; signedIn: boolean }) {
 const portal=useServerFn(createBillingPortal); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const t=helpCopy[language];
 return <div className="space-y-2"><Button variant="outline" className="h-auto min-h-11 w-full justify-start whitespace-normal text-left" disabled={!signedIn||busy} onClick={async()=>{setBusy(true);setError('');try{const result=await portal();if(!result.ok){setError(billingErrorText(language,result.error));return;}const url=new URL(result.url);if(url.origin!=='https://billing.stripe.com')throw new Error('Invalid portal');window.location.assign(url.href);}catch{setError(billingCopy[language].error);}finally{setBusy(false);}}}><ExternalLink className="size-4 shrink-0"/>{busy?billingCopy[language].loading:t.portal}</Button><p className="text-xs text-muted-foreground">{t.portalDetail}</p><p className="text-xs text-muted-foreground">{signedIn?t.noContract:t.signin}</p>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}