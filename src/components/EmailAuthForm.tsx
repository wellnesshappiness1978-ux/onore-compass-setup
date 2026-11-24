import { useState } from 'react';
import { LoaderCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

type Mode = 'signin' | 'signup';

export function EmailAuthForm({ disabled, redirectPath }: { disabled?: boolean; redirectPath: string }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 8) { setNote({ ok: false, text: 'メールアドレスと8文字以上のパスワードを入力してください。' }); return; }
    setBusy(true); setNote(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        setNote(error ? { ok: false, text: 'メールアドレスまたはパスワードが正しくありません。' } : { ok: true, text: 'ログインしました。' });
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}${redirectPath}` } });
        if (error) setNote({ ok: false, text: '登録できませんでした。別のメールアドレスをお試しください。' });
        else setNote({ ok: true, text: data.session ? '登録してログインしました。' : '確認メールを送信しました。メール内のリンクを開いて登録を完了してください。' });
      }
    } catch { setNote({ ok: false, text: '通信エラーが発生しました。もう一度お試しください。' }); } finally { setBusy(false); }
  };
  return <form onSubmit={e => void submit(e)} className="space-y-3 rounded-lg border border-border p-3">
    <p className="flex items-center gap-2 text-sm font-semibold"><Mail className="size-4 text-primary" />メールアドレスで{mode === 'signin' ? 'ログイン' : '登録'}</p>
    <Input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mail@example.com" aria-label="メールアドレス" className="min-h-11" />
    <Input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワード（8文字以上）" aria-label="パスワード" className="min-h-11" />
    <Button type="submit" disabled={disabled || busy} className="h-auto min-h-11 w-full whitespace-normal">{busy && <LoaderCircle className="size-4 animate-spin" />}{mode === 'signin' ? 'ログイン' : '新規登録'}</Button>
    <button type="button" className="text-sm text-primary underline underline-offset-4" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setNote(null); }}>{mode === 'signin' ? 'はじめての方はこちら（新規登録）' : 'すでに登録済みの方はこちら（ログイン）'}</button>
    {note && <p role={note.ok ? 'status' : 'alert'} className={`text-sm ${note.ok ? 'text-primary' : 'text-destructive'}`}>{note.text}</p>}
  </form>;
}
