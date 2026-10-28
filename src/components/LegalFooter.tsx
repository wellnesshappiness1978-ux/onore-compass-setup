import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import ShareCardButton from "./ShareCardButton";
import { APP_SHARE_URL, shareUi } from "@/lib/share-content";
import { legalContentByLanguage, type LegalKey } from "@/lib/legal-content";
import { storedLanguage, supportCopy } from "@/lib/support-copy";
import type { Language } from "@/lib/translations";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import SupportForm from "./SupportForm";
import { createTranslator } from "@/lib/ui-i18n";

export function LegalText({ kind, language = "ja" }: { kind: LegalKey; language?: Language }) {
  return <div className="space-y-6">{legalContentByLanguage[language][kind].sections.map(([title, body]) => <section key={title}><h3 className="font-serif text-lg text-primary break-words">{title}</h3><p className="mt-2 whitespace-pre-line text-base leading-8 text-foreground break-words">{body}</p></section>)}</div>;
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
  return <footer data-legal-open={open ?? ""} className="relative border-t border-primary/20 bg-background px-4 pb-32 pt-8 text-foreground">
    <div className="mx-auto max-w-5xl"><p className="font-serif text-xl text-primary">{text.brand}</p>
      <nav aria-label={text.nav} className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{(Object.keys(legalContent) as LegalKey[]).map(kind => <Button key={kind} variant="link" className="h-auto whitespace-normal p-0 text-left text-xs" onClick={() => setOpen(kind)}>{legalContent[kind].title}</Button>)}<Button variant="link" className="h-auto p-0 text-xs" onClick={() => setOpen("support")}>{text.support}</Button></nav>
      <ShareCardButton language={language} autoOpen={false} label={text.share} data={{ kind: 'app', title: 'アゴルメンの羅針盤', kicker: shareUi[language].app, names: [], score: 0, lines: [shareUi[language].tagline], url: APP_SHARE_URL }} />
      {status && <p role="status" className="mt-2 text-xs text-primary">{status}</p>}
      <p className="mt-5 text-xs leading-6 text-muted-foreground">{text.note}</p>
      <Dialog open={open !== null} onOpenChange={value => { if (!value) setOpen(null); }}><DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto rounded-lg border-primary/30 bg-card"><DialogTitle className="pr-6 font-serif text-xl text-primary">{open === "support" ? text.support : open ? legalContent[open].title : ""}</DialogTitle><DialogDescription>{open === "support" ? text.history : open ? legalContent[open].description : ""}</DialogDescription>{open === "support" ? <><SupportForm language={language} /><Link to="/support" className="text-xs text-primary underline" onClick={() => setOpen(null)}>{support.title}</Link></> : open && <><LegalText kind={open} language={language} /><Link to="/legal/$document" params={{ document: open }} className="text-xs text-primary underline" onClick={() => setOpen(null)}>{text.page}</Link></>}</DialogContent></Dialog>
    </div>
  </footer>;
}