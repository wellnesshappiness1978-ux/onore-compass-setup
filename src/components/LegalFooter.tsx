import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import AppInviteShare from "./AppInviteShare";
import { legalContentByLanguage, type LegalKey } from "@/lib/legal-content";
import { storedLanguage, supportCopy } from "@/lib/support-copy";
import type { Language } from "@/lib/translations";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import SupportForm from "./SupportForm";
import { createTranslator } from "@/lib/ui-i18n";

export function LegalText({ kind, language = "ja" }: { kind: LegalKey; language?: Language }) {
  const entry = legalContentByLanguage[language][kind];
  if (kind === "commerce") return <table aria-label={entry.title} className="w-full table-fixed border-collapse text-left text-sm sm:text-base"><tbody>{entry.sections.map(([title, body]) => <tr key={title} className="border-b border-border"><th scope="row" className="w-[34%] break-words bg-muted/40 px-3 py-4 align-top font-semibold text-foreground">{title}</th><td className="break-words whitespace-pre-line px-3 py-4 align-top leading-7 text-foreground">{body}</td></tr>)}</tbody></table>;
  return <div className="space-y-6">{entry.sections.map(([title, body]) => <section key={title}><h3 className="font-serif text-lg text-primary break-words">{title}</h3><p className="mt-2 whitespace-pre-line text-base leading-8 text-foreground break-words">{body}</p></section>)}</div>;
}
export default function LegalFooter() {
  const [language, setLanguage] = useState<Language>("ja");
  useEffect(() => setLanguage(storedLanguage()), []);
  const legalContent = legalContentByLanguage[language];
  const support = supportCopy[language];
  const t = createTranslator(language);
  const text = { brand: t("common.brand"), nav: t("legal.nav"), support: t("legal.support"), share: t("legal.share"), copied: t("legal.copied"), fallback: t("legal.shareFallback"), note: t("common.referenceNotice"), history: t("legal.history"), page: t("legal.openPage") };
  const [open, setOpen] = useState<LegalKey | "support" | null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const handle = (event: Event) => { const key = (event as CustomEvent<string>).detail; if (key === "support" || Object.prototype.hasOwnProperty.call(legalContentByLanguage.ja, key)) setOpen(key as LegalKey | "support"); };
    window.addEventListener("onore-legal", handle); return () => window.removeEventListener("onore-legal", handle);
  }, []);
  useEffect(() => {
    const update = (event: Event) => setLanguage((event as CustomEvent<Language>).detail);
    window.addEventListener("onore-language-change", update);
    return () => window.removeEventListener("onore-language-change", update);
  }, []);
  return <footer className="relative border-t border-primary/20 bg-background px-4 pb-32 pt-8 text-foreground">
    <div className="mx-auto max-w-5xl"><p className="font-serif text-xl text-primary">{text.brand}</p>
      <nav aria-label={text.nav} className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{(Object.keys(legalContent) as LegalKey[]).map(kind => <Button key={kind} variant="link" className="h-auto whitespace-normal p-0 text-left text-xs" onClick={() => setOpen(kind)}>{legalContent[kind].title}</Button>)}<Button variant="link" className="h-auto p-0 text-xs" onClick={() => setOpen("support")}>{text.support}</Button></nav>
      <AppInviteShare label={text.share} />
      {status && <p role="status" className="mt-2 text-xs text-primary">{status}</p>}
      <p className="mt-5 text-xs leading-6 text-muted-foreground">{text.note}</p>
      <Dialog open={open !== null} onOpenChange={value => { if (!value) setOpen(null); }}><DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto rounded-lg border-primary/30 bg-card"><DialogTitle className="pr-6 font-serif text-xl text-primary">{open === "support" ? text.support : open ? legalContent[open].title : ""}</DialogTitle><DialogDescription>{open === "support" ? text.history : open ? legalContent[open].description : ""}</DialogDescription>{open === "support" ? <><SupportForm language={language} /><Link to="/support" className="text-xs text-primary underline" onClick={() => setOpen(null)}>{support.title}</Link></> : open && <><LegalText kind={open} language={language} /><Link to="/legal/$document" params={{ document: open }} className="text-xs text-primary underline" onClick={() => setOpen(null)}>{text.page}</Link></>}</DialogContent></Dialog>
    </div>
  </footer>;
}