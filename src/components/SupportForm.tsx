import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listMySupport, submitSupport } from "@/lib/support.functions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { AgolmenLoading } from "./AgolmenSpiral";

export default function SupportForm() {
  const [signedIn, setSignedIn] = useState(false);
  const [category, setCategory] = useState<"bug" | "account" | "privacy" | "other">("bug");
  const [subject, setSubject] = useState(""); const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false); const [busy, setBusy] = useState(false); const [status, setStatus] = useState(""); const [failed, setFailed] = useState(false);
  const send = useServerFn(submitSupport); const list = useServerFn(listMySupport);
  const history = useQuery({ queryKey: ["my-support-requests"], queryFn: () => list(), enabled: signedIn, retry: false });
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) setSignedIn(Boolean(data.session)); });
    const { data } = supabase.auth.onAuthStateChange((_, session) => setSignedIn(Boolean(session)));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  return <div className="space-y-5">
    <p className="text-sm leading-7 text-muted-foreground">不具合・アカウント・個人情報について受け付けます。医療・法律の相談や緊急対応窓口ではありません。回答担当者と返信体制は現在整備中です。</p>
    {!signedIn && <p role="status" className="border-l-2 border-primary pl-3 text-sm text-primary">送信にはログインが必要です。アプリのログインボタンからサインインしてください。</p>}
    <form className="space-y-4" onSubmit={async event => {
      event.preventDefault(); if (!signedIn || busy || !consent) return;
      setBusy(true); setStatus(""); setFailed(false);
      try { const ticket = await send({ data: { category, subject, message, consent: true } }); setStatus(`受付番号 ${ticket.id.slice(0, 8)}：送信内容を保存しました。`); setSubject(""); setMessage(""); setConsent(false); await history.refetch(); }
      catch (error) { setFailed(true); setStatus(error instanceof Error ? error.message : "送信できませんでした。"); }
      finally { setBusy(false); }
    }}>
      <label className="block text-sm text-foreground">お問い合わせの種類<select value={category} onChange={event => setCategory(event.target.value as typeof category)} className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3"><option value="bug">不具合</option><option value="account">アカウント</option><option value="privacy">個人情報</option><option value="other">その他</option></select></label>
      <label className="block text-sm text-foreground">件名<Input required minLength={3} maxLength={120} value={subject} onChange={event => setSubject(event.target.value)} className="mt-1" /></label>
      <label className="block text-sm text-foreground">お問い合わせ内容<Textarea required minLength={10} maxLength={4000} rows={5} value={message} onChange={event => setMessage(event.target.value)} className="mt-1" /></label>
      <p className="text-xs text-muted-foreground">パスワード、カード番号、他人の個人情報は入力しないでください。</p>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 size-4 accent-primary" />お問い合わせ対応のため送信内容を保存することに同意します。</label>
      {busy && <AgolmenLoading compact label="送信中…" />}
      <Button type="submit" disabled={!signedIn || !consent || busy} className="min-h-11"><Send className="size-4" />{busy ? "送信中…" : "お問い合わせを送信"}</Button>
      {status && <p role={failed ? "alert" : "status"} className={failed ? "text-sm text-destructive" : "text-sm text-primary"}>{status}</p>}
    </form>
    {signedIn && <section className="border-t border-primary/20 pt-4"><h3 className="font-serif text-lg text-primary">あなたの受付履歴</h3>{history.isError ? <p role="alert" className="text-sm text-destructive">履歴を取得できませんでした。</p> : <ul className="mt-2 divide-y divide-border">{history.data?.map(ticket => <li key={ticket.id} className="py-3"><p className="break-words text-sm">{ticket.subject}</p><p className="text-xs text-muted-foreground">{ticket.id.slice(0, 8)} · {ticket.status === "resolved" ? "対応済み" : ticket.status === "in_progress" ? "対応中" : "受付済み"}</p></li>)}</ul>}</section>}
  </div>;
}