import { useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { currentSiteUrl } from '@/lib/site-url';
import { APP_INVITE_TEXT, appInviteLinks } from '@/lib/app-invite';

const labels = { x: 'X', line: 'LINE', facebook: 'Facebook' } as const;

/** Footer share: introduces the whole app (never a screen capture or artwork). */
export default function AppInviteShare({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const links = appInviteLinks();
  const share = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try { await navigator.share({ title: 'アゴルメンの羅針盤', text: APP_INVITE_TEXT, url: currentSiteUrl() }); return; }
      catch (e) { if ((e as Error)?.name === 'AbortError') return; }
    }
    setOpen(v => !v);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${APP_INVITE_TEXT}\n${currentSiteUrl()}`); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  return <div className="mt-4 space-y-3">
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => void share()} aria-expanded={open} className="h-auto min-h-11 whitespace-normal"><Share2 className="size-4 shrink-0" />{label}</Button>
    </div>
    {open && <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
      {(Object.keys(links) as (keyof typeof links)[]).map(k => <Button key={k} asChild variant="outline" className="min-h-11"><a href={links[k]} target="_blank" rel="noopener noreferrer">{labels[k]}</a></Button>)}
      <Button variant="outline" className="min-h-11" onClick={() => void copy()}><Copy className="size-4" />{copied ? 'コピーしました' : 'リンクをコピー'}</Button>
    </div>}
  </div>;
}
