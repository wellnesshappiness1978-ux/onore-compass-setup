import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { legalContentByLanguage, type LegalKey } from "@/lib/legal-content";
import { storedLanguage, supportCopy } from "@/lib/support-copy";
import type { Language } from "@/lib/translations";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import SupportForm from "./SupportForm";

export function LegalText({ kind, language = "ja" }: { kind: LegalKey; language?: Language }) {
  return <div className="space-y-6">{legalContentByLanguage[language][kind].sections.map(([title, body]) => <section key={title}><h3 className="font-serif text-lg text-primary">{title}</h3><p className="mt-2 text-base leading-8 text-foreground">{body}</p></section>)}</div>;
}
export default function LegalFooter() {
  const [language, setLanguage] = useState<Language>("ja");
  useEffect(() => setLanguage(storedLanguage()), []);
  const legalContent = legalContentByLanguage[language];
  const support = supportCopy[language];
  const ui: Record<Language, { brand: string; nav: string; support: string; share: string; copied: string; fallback: string; note: string; history: string; page: string }> = {
    ja: { brand: "アゴルメンの羅針盤", nav: "法務とサポート", support: "カスタマーサポート・お問い合わせ", share: "SNSシェア", copied: "アプリのリンクをコピーしました。", fallback: "診断カードやアート画像は各画面から保存・共有できます。", note: "診断は自己理解のための参考情報です。健康・投資・将来の結果を保証しません。", history: "お問い合わせの受付と履歴", page: "この案内を別ページで開く" },
    en: { brand: "Agolmen's Compass", nav: "Legal and support", support: "Customer support", share: "Share", copied: "App link copied.", fallback: "Save or share insight cards and artwork from their screens.", note: "Readings are reflective references, not guarantees of health, investments or future outcomes.", history: "Requests and history", page: "Open this notice on its own page" },
    "zh-CN": { brand: "阿戈尔曼罗盘", nav: "法律与支持", support: "客户支持", share: "分享", copied: "应用链接已复制。", fallback: "可在相应页面保存或分享诊断卡与艺术图。", note: "解读仅供自我理解参考，不保证健康、投资或未来结果。", history: "咨询与记录", page: "在单独页面打开" },
    "zh-TW": { brand: "阿戈爾曼羅盤", nav: "法律與支援", support: "客戶支援", share: "分享", copied: "應用程式連結已複製。", fallback: "可在相應畫面儲存或分享診斷卡與藝術圖。", note: "解讀僅供自我理解參考，不保證健康、投資或未來結果。", history: "諮詢與記錄", page: "在獨立頁面開啟" },
    ko: { brand: "아골멘의 나침반", nav: "법률 및 지원", support: "고객 지원", share: "공유", copied: "앱 링크를 복사했습니다.", fallback: "각 화면에서 진단 카드와 작품을 저장하거나 공유할 수 있습니다.", note: "해석은 자기이해를 위한 참고이며 건강, 투자 또는 미래 결과를 보장하지 않습니다.", history: "문의 및 내역", page: "별도 페이지에서 열기" },
    es: { brand: "La brújula de Agolmen", nav: "Legal y soporte", support: "Atención al cliente", share: "Compartir", copied: "Enlace copiado.", fallback: "Guarda o comparte tarjetas y obras desde sus pantallas.", note: "Las lecturas son orientativas y no garantizan resultados médicos, financieros o futuros.", history: "Solicitudes e historial", page: "Abrir este aviso en otra página" },
    fr: { brand: "La boussole d’Agolmen", nav: "Mentions et assistance", support: "Service client", share: "Partager", copied: "Lien copié.", fallback: "Enregistrez ou partagez cartes et œuvres depuis leurs écrans.", note: "Les lectures sont indicatives et ne garantissent aucun résultat médical, financier ou futur.", history: "Demandes et historique", page: "Ouvrir cet avis sur une autre page" },
  };
  const text = ui[language];
  const [open, setOpen] = useState<LegalKey | "support" | null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const handle = (event: Event) => { const key = (event as CustomEvent<string>).detail; if (key === "support" || Object.prototype.hasOwnProperty.call(legalContentByLanguage.ja, key)) setOpen(key as LegalKey | "support"); };
    window.addEventListener("onore-legal", handle); return () => window.removeEventListener("onore-legal", handle);
  }, []);
  return <footer className="relative border-t border-primary/20 bg-background px-4 pb-32 pt-8 text-foreground">
    <div className="mx-auto max-w-5xl"><p className="font-serif text-xl text-primary">{text.brand}</p>
      <nav aria-label={text.nav} className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{(Object.keys(legalContent) as LegalKey[]).map(kind => <Button key={kind} variant="link" className="h-auto whitespace-normal p-0 text-left text-xs" onClick={() => setOpen(kind)}>{legalContent[kind].title}</Button>)}<Button variant="link" className="h-auto p-0 text-xs" onClick={() => setOpen("support")}>{text.support}</Button></nav>
      <Button variant="outline" className="mt-5 min-h-11 whitespace-normal" onClick={async () => {
        const shared = new Event("onore-share-card", { cancelable: true });
        if (!window.dispatchEvent(shared)) return;
        try { if (navigator.share) await navigator.share({ title: text.brand, url: window.location.origin }); else { await navigator.clipboard.writeText(window.location.origin); setStatus(text.copied); } }
        catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setStatus(text.fallback); }
      }}><Share2 />{text.share}</Button>
      {status && <p role="status" className="mt-2 text-xs text-primary">{status}</p>}
      <p className="mt-5 text-xs leading-6 text-muted-foreground">{text.note}</p>
      <Dialog open={open !== null} onOpenChange={value => { if (!value) setOpen(null); }}><DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto rounded-lg border-primary/30 bg-card"><DialogTitle className="pr-6 font-serif text-xl text-primary">{open === "support" ? text.support : open ? legalContent[open].title : ""}</DialogTitle><DialogDescription>{open === "support" ? text.history : open ? legalContent[open].description : ""}</DialogDescription>{open === "support" ? <><SupportForm language={language} /><Link to="/support" className="text-xs text-primary underline" onClick={() => setOpen(null)}>{support.title}</Link></> : open && <><LegalText kind={open} language={language} /><Link to="/legal/$document" params={{ document: open }} className="text-xs text-primary underline" onClick={() => setOpen(null)}>{text.page}</Link></>}</DialogContent></Dialog>
    </div>
  </footer>;
}