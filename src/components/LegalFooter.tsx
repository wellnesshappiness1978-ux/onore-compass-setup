import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { legalContent, type LegalKey } from "@/lib/legal-content";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import SupportForm from "./SupportForm";

export function LegalText({ kind }: { kind: LegalKey }) {
  return <div className="space-y-6">{legalContent[kind].sections.map(([title, body]) => <section key={title}><h3 className="font-serif text-lg text-primary">{title}</h3><p className="mt-2 text-base leading-8 text-foreground">{body}</p></section>)}</div>;
}
export default function LegalFooter() {
  const [open, setOpen] = useState<LegalKey | "support" | null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const handle = (event: Event) => { const key = (event as CustomEvent<string>).detail; if (key === "support" || key in legalContent) setOpen(key as LegalKey | "support"); };
    window.addEventListener("onore-legal", handle); return () => window.removeEventListener("onore-legal", handle);
  }, []);
  return <footer className="relative border-t border-primary/20 bg-background px-4 pb-32 pt-8 text-foreground">
    <div className="mx-auto max-w-5xl"><p className="font-serif text-xl text-primary">オノレコンパス</p>
      <nav aria-label="法務とサポート" className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{(Object.keys(legalContent) as LegalKey[]).map(kind => <Button key={kind} variant="link" className="h-auto whitespace-normal p-0 text-left text-xs" onClick={() => setOpen(kind)}>{legalContent[kind].title}</Button>)}<Button variant="link" className="h-auto p-0 text-xs" onClick={() => setOpen("support")}>カスタマーサポート・お問い合わせ</Button></nav>
      <Button variant="outline" className="mt-5 min-h-11 whitespace-normal" onClick={async () => {
        const shared = new Event("onore-share-card", { cancelable: true });
        if (!window.dispatchEvent(shared)) return;
        try { if (navigator.share) await navigator.share({ title: "オノレコンパス", url: window.location.origin }); else { await navigator.clipboard.writeText(window.location.origin); setStatus("アプリのリンクをコピーしました。診断カードはホーム、曼陀羅画像はアート画面から共有できます。"); } }
        catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setStatus("診断カードはホーム、曼陀羅画像はアート画面から保存・共有できます。"); }
      }}><Share2 />SNSシェア</Button>
      {status && <p role="status" className="mt-2 text-xs text-primary">{status}</p>}
      <p className="mt-5 text-xs leading-6 text-muted-foreground">診断は自己理解のための参考情報です。健康・投資・将来の結果を保証しません。</p>
      <Dialog open={open !== null} onOpenChange={value => { if (!value) setOpen(null); }}><DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto rounded-lg border-primary/30 bg-card"><DialogTitle className="pr-6 font-serif text-xl text-primary">{open === "support" ? "カスタマーサポート・お問い合わせ" : open ? legalContent[open].title : ""}</DialogTitle><DialogDescription>{open === "support" ? "お問い合わせの受付と履歴" : open ? legalContent[open].description : ""}</DialogDescription>{open === "support" ? <><SupportForm /><Link to="/support" className="text-xs text-primary underline" onClick={() => setOpen(null)}>お問い合わせページを開く</Link></> : open && <><LegalText kind={open} /><Link to="/legal/$document" params={{ document: open }} className="text-xs text-primary underline" onClick={() => setOpen(null)}>この案内を別ページで開く</Link></>}</DialogContent></Dialog>
    </div>
  </footer>;
}