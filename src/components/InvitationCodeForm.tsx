import { useState } from 'react';
import { Gift, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CLOUD_SYNC_EVENT } from '@/lib/account-sync';
import { detectInvitationSlot, invitationMessages, normalizeInvitationCode, toInvitationResult, type InvitationResult } from '@/lib/invitation-code';

export function InvitationCodeForm({ onApplied }: { onApplied?: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<InvitationResult | null>(null);
  const apply = async () => {
    const value = normalizeInvitationCode(code);
    if (!value) { setResult('invalid'); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('redeem_invitation_code', { p_code: value, p_platform: detectInvitationSlot() });
      const r = error ? 'error' : toInvitationResult(data);
      setResult(r);
      if (r === 'ok') {
        toast.success(invitationMessages.ok);
        window.dispatchEvent(new Event(CLOUD_SYNC_EVENT));
        onApplied?.();
      }
    } catch { setResult('error'); } finally { setBusy(false); }
  };
  return <details className="rounded-lg border border-primary/30 bg-card p-4">
    <summary className="flex cursor-pointer items-center gap-2 font-serif text-base"><Gift className="size-4 text-primary" />テスター特典（合言葉）の入力</summary>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <Input value={code} onChange={e => { setCode(e.target.value); setResult(null); }} placeholder="AGOLMEN2026VIP" aria-label="合言葉" autoCapitalize="characters" className="min-h-11" />
      <Button className="min-h-11" disabled={busy} onClick={() => void apply()}>{busy && <LoaderCircle className="size-4 animate-spin" />}適用する</Button>
    </div>
    {result && <p role={result === 'ok' ? 'status' : 'alert'} className={`mt-3 text-sm ${result === 'ok' ? 'text-primary' : 'text-destructive'}`}>{invitationMessages[result]}</p>}
  </details>;
}
