import { useEffect, useState } from "react";
import { Download, Image, Loader2, Send, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Language } from "@/lib/translations";
import { cardCopy, renderShareCard, type CardFormat, type ShareCardData } from "@/lib/share-card-renderer";
export type { ShareCardData } from "@/lib/share-card-renderer";

export default function ShareCardButton({ data, language, className, loading = false }: { data: ShareCardData | null; language: Language; className?: string; loading?: boolean }) {
  const t = cardCopy(language);
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<CardFormat>("story");
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState("");
  const [includeName, setIncludeName] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [sharing, setSharing] = useState(false);
  const payload = data ? JSON.stringify(data) : "";

  useEffect(() => {
    if (!open) return;
    let active = true, imageUrl: string | undefined;
    setUrl(null); setBlob(null); setStatus(""); setRendering(true);
    if (!payload || loading) {
      if (!loading) { setRendering(false); setStatus(t.error); }
      return () => { active = false; };
    }
    const build = async () => {
      try {
        await document.fonts.ready;
        if (!active) return;
        const source = JSON.parse(payload) as ShareCardData;
        const canvas = renderShareCard(format, { ...source, names: includeName ? source.names : [] }, language);
        canvas.toBlob((image) => {
          if (!active) return;
          if (!image) { setStatus(t.error); setRendering(false); return; }
          imageUrl = URL.createObjectURL(image); setUrl(imageUrl); setBlob(image); setRendering(false);
        }, "image/png");
      } catch { if (active) { setStatus(t.error); setRendering(false); } }
    };
    void build();
    return () => { active = false; if (imageUrl) URL.revokeObjectURL(imageUrl); };
  }, [open, payload, language, format, includeName, loading]);

  useEffect(() => {
    if (data?.kind !== "identity") return;
    const handle = () => { setFormat("story"); setOpen(true); };
    window.addEventListener("onore-share-card", handle);
    return () => window.removeEventListener("onore-share-card", handle);
  }, [data?.kind]);
  const filename = `onore-insight-${language}-${format}.png`;
  const ready = Boolean(url && blob && !rendering && !loading);
  const save = () => {
    if (!url) return;
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); setStatus(t.saved);
  };
  const share = async () => {
    if (!blob || sharing) return;
    const file = new File([blob], filename, { type: "image/png" });
    if (!navigator.canShare?.({ files: [file] })) { save(); return; }
    setSharing(true);
    try { await navigator.share({ files: [file], title: t.description }); setStatus(t.shared); }
    catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setStatus(t.error); }
    finally { setSharing(false); }
  };
  const post = (target: "x" | "line") => {
    const appUrl = window.location.origin;
    // Never include opt-in names or the full private reading in a text-only post.
    const text = t.hashtags;
    const href = target === "x" ? `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}` : `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`;
    window.open(href, "_blank", "noopener,noreferrer"); save();
  };
  return <>
    <Button type="button" variant="champagne" className={className ?? "mt-6 h-auto min-h-12 w-full whitespace-normal px-4 py-3 sm:w-auto"} onClick={() => { setFormat("story"); setOpen(true); }}><Smartphone className="size-4 shrink-0" />{t.cta}</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="share-card-modal max-h-[92dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border-primary/35 p-5 sm:max-w-4xl sm:p-7">
        <DialogHeader className="pr-6 text-left"><DialogDescription className="text-xs text-primary">SELF COMPASS · {t.description}</DialogDescription><DialogTitle className="font-serif text-xl leading-relaxed sm:text-2xl">{t.title}</DialogTitle></DialogHeader>
        <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="min-w-0">
            <div role="radiogroup" aria-label={t.description} className="mb-3 grid grid-cols-2 gap-2">{(["story", "x"] as const).map(f => <Button key={f} type="button" role="radio" aria-checked={format === f} variant={format === f ? "default" : "outline"} size="sm" onClick={() => setFormat(f)}><Image className="size-4" />{t[f]}</Button>)}</div>
            <div className={`relative mx-auto flex w-full items-center justify-center overflow-hidden border border-primary/25 bg-background ${format === "story" ? "aspect-[9/16] max-w-[330px]" : "aspect-video"}`}>
              {url && <img src={url} alt={t.description} className="h-full w-full object-contain" />}
              {!url && <div role="status" className="flex flex-col items-center gap-3 px-5 text-center text-sm text-muted-foreground">{(rendering || loading) && <Loader2 className="size-6 animate-spin text-primary" />}{status || t.loading}</div>}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">{format === "story" ? "1080 × 1920" : "1200 × 675"} · PNG</p>
          </div>
          <div className="flex min-w-0 flex-col gap-5 md:pt-1">
            <div className="border-b border-primary/20 pb-5"><label htmlFor="share-card-name" className="flex items-center justify-between gap-3 text-sm text-foreground">{t.name}<Switch id="share-card-name" checked={includeName} onCheckedChange={setIncludeName} /></label><p className="mt-2 text-xs leading-6 text-muted-foreground">{t.privacy}</p></div>
            <div className="grid gap-2"><Button disabled={!ready} onClick={save} className="min-h-12"><Download className="size-4" />{t.save}</Button><Button variant="outline" disabled={!ready || sharing} onClick={() => void share()} className="min-h-12"><Share2 className="size-4" />{t.share}</Button></div>
            <div className="grid grid-cols-2 gap-2"><Button variant="outline" disabled={!ready || sharing} onClick={() => void share()} className="min-h-11"><Smartphone className="size-4" />Instagram</Button><Button variant="outline" disabled={!ready || sharing} onClick={() => void share()} className="min-h-11"><Smartphone className="size-4" />TikTok</Button><Button variant="outline" disabled={!ready} onClick={() => post("x")} className="min-h-11"><Send className="size-4" />X</Button><Button variant="outline" disabled={!ready} onClick={() => post("line")} className="min-h-11"><Send className="size-4" />LINE</Button></div>
            <p className="text-xs leading-6 text-muted-foreground">{t.note}</p>
            {status && <p role="status" className="border-t border-primary/20 pt-3 text-sm text-primary">{status}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
