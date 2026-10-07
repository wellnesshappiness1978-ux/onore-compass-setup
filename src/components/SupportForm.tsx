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
import { storedLanguage, supportCopy } from "@/lib/support-copy";
import type { Language } from "@/lib/translations";

export default function SupportForm({ language: languageProp }: { language?: Language }) {
  const [language, setLanguage] = useState<Language>(languageProp ?? "ja");
  useEffect(() => { setLanguage(languageProp ?? storedLanguage()); }, [languageProp]);
  const t = supportCopy[language];
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
    <p className="text-sm leading-7 text-muted-foreground">{t.intro}</p>
    {!signedIn && <p role="status" className="border-l-2 border-primary pl-3 text-sm text-primary">{t.signIn}</p>}
    <form className="space-y-4" onSubmit={async event => {
      event.preventDefault(); if (!signedIn || busy || !consent) return;
      setBusy(true); setStatus(""); setFailed(false);
      try { const ticket = await send({ data: { category, subject, message, consent: true } }); setStatus(t.success(ticket.id.slice(0, 8))); setSubject(""); setMessage(""); setConsent(false); await history.refetch(); }
      catch { setFailed(true); setStatus(t.failed); }
      finally { setBusy(false); }
    }}>
      <label className="block text-sm text-foreground">{t.type}<select value={category} onChange={event => setCategory(event.target.value as typeof category)} className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3">{["bug","account","privacy","other"].map((value, index) => <option key={value} value={value}>{t.categories[index]}</option>)}</select></label>
      <label className="block text-sm text-foreground">{t.subject}<Input required minLength={3} maxLength={120} value={subject} onChange={event => setSubject(event.target.value)} className="mt-1" /></label>
      <label className="block text-sm text-foreground">{t.message}<Textarea required minLength={10} maxLength={4000} rows={5} value={message} onChange={event => setMessage(event.target.value)} className="mt-1" /></label>
      <p className="text-xs text-muted-foreground">{t.warning}</p>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 size-4 accent-primary" />{t.consent}</label>
      {busy && <AgolmenLoading compact label={t.sending} />}
      <Button type="submit" disabled={!signedIn || !consent || busy} className="min-h-11"><Send className="size-4" />{busy ? t.sending : t.send}</Button>
      {status && <p role={failed ? "alert" : "status"} className={failed ? "text-sm text-destructive" : "text-sm text-primary"}>{status}</p>}
    </form>
    {signedIn && <section className="border-t border-primary/20 pt-4"><h3 className="font-serif text-lg text-primary">{t.history}</h3>{history.isError ? <p role="alert" className="text-sm text-destructive">{t.historyError}</p> : <ul className="mt-2 divide-y divide-border">{history.data?.map(ticket => <li key={ticket.id} className="py-3"><p className="break-words text-sm">{ticket.subject}</p><p className="text-xs text-muted-foreground">{ticket.id.slice(0, 8)} · {ticket.status === "resolved" ? t.states[0] : ticket.status === "in_progress" ? t.states[1] : t.states[2]}</p></li>)}</ul>}</section>}
  </div>;
}