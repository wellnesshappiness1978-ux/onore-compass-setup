import { useEffect, useState } from "react";
import { Download, Image, Send, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from '@/components/ui/checkbox';
import { shareText, shareUi } from '@/lib/share-content';
import { Copy, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import type { Language } from "@/lib/translations";
import {
  cardCopy,
  renderShareCards,
  type CardFormat,
  type ShareCardData,
} from "@/lib/share-card-renderer";
import { AgolmenLoading } from "./AgolmenSpiral";
export type { ShareCardData } from "@/lib/share-card-renderer";

export default function ShareCardButton({
  data,
  language,
  className,
  loading = false,
  label,
  autoOpen = true,
  iconOnly = false,
  onPrepare,
}: {
  data: ShareCardData | null;
  language: Language;
  className?: string;
  loading?: boolean;
  label?: string;
  autoOpen?: boolean;
  iconOnly?: boolean;
  onPrepare?: () => void;
}) {
  const t = cardCopy(language);
  const ui = shareUi[language];
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<CardFormat>("story");
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState("");
  const [includeName, setIncludeName] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [pages, setPages] = useState<{ url: string; blob: Blob }[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const text = data ? shareText(data, selected ?? undefined, includeName) : '';
  const payload = data ? JSON.stringify(data) : "";

  useEffect(() => {
    if (!open) return;
    let active = true,
      imageUrl: string | undefined;
    setUrl(null);
    setBlob(null);
    setStatus("");
    setRendering(true);
    setPages([]);
    setPageIndex(0);
    if (!payload || loading) {
      if (!loading) {
        setRendering(false);
        setStatus(t.error);
      }
      return () => {
        active = false;
      };
    }
    const build = async () => {
      try {
        await document.fonts.ready;
        if (!active) return;
        const source = JSON.parse(payload) as ShareCardData;
        const selectedSections = source.sections?.filter(s => selected === null || selected.includes(s.id));
        if (source.sections && !selectedSections?.length) { setRendering(false); setStatus(ui.empty); return; }
        const canvases = await renderShareCards(
          format,
          { ...source, names: includeName ? source.names : [], lines: selectedSections ? selectedSections.map(s => `${s.title}\n${s.text}`) : source.lines },
          language,
        );
        if (!active) return;
        const images = await Promise.all(canvases.map(canvas => new Promise<Blob>((resolve, reject) => canvas.toBlob(image => image ? resolve(image) : reject(new Error(t.error)), 'image/png'))));
        if (!active) return;
        const next = images.map(blob => ({ blob, url: URL.createObjectURL(blob) }));
        imageUrls.push(...next.map(p => p.url));
        setPages(next); setUrl(next[0]?.url ?? null); setBlob(next[0]?.blob ?? null); setRendering(false);
      } catch {
        if (active) {
          setStatus(t.error);
          setRendering(false);
        }
      }
    };
    void build();
    return () => {
      active = false;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [open, payload, language, format, includeName, loading, selected]);

  useEffect(() => {
    if (data?.kind !== "identity" || !autoOpen) return;
    const handle = () => {
      setFormat("story");
      setOpen(true);
    };
    window.addEventListener("onore-share-card", handle);
    return () => window.removeEventListener("onore-share-card", handle);
  }, [data?.kind, autoOpen]);
  const filename = `agolmen-insight-${language}-${format}.png`;
  const ready = Boolean(url && blob && !rendering && !loading);
  const save = () => {
    if (!url) return;
    pages.forEach((page, i) => { const a = document.createElement('a'); a.href = page.url; a.download = filename.replace('.png', `-${i + 1}.png`); a.click(); });
    setStatus(t.saved);
  };
  const share = async () => {
    if (!blob || sharing) return;
    const files = pages.map((page, i) => new File([page.blob], filename.replace('.png', `-${i + 1}.png`), { type: 'image/png' }));
    if (!navigator.canShare?.({ files })) {
      if (data?.kind === 'app' && navigator.share) { try { await navigator.share({ title: data.title, text, url: data.url }); } catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError')) setStatus(t.error); } return; }
      save();
      return;
    }
    setSharing(true);
    try {
      await navigator.share({ files, title: data?.title || t.description, ...(data?.kind === 'app' ? { text, url: data.url } : {}) });
      setStatus(t.shared);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setStatus(t.error);
    } finally {
      setSharing(false);
    }
  };
  const post = () => {
    const appUrl = data?.url ?? 'https://cosmic-beginnings-onboard.lovable.app';
    // Never include opt-in names or the full private reading in a text-only post.
    const href = `https://x.com/intent/post?text=${encodeURIComponent(data?.kind === 'app' ? text : t.hashtags)}&url=${encodeURIComponent(appUrl)}`;
    window.open(href, "_blank", "noopener,noreferrer");
    save();
  };
  return (
    <>
      <Button
        type="button"
        variant={iconOnly ? "ghost" : "champagne"}
        size={iconOnly ? "icon" : "default"}
        title={label ?? t.cta}
        aria-label={label ?? t.cta}
        className={className ?? "mt-6 h-auto min-h-12 w-full whitespace-normal px-4 py-3 sm:w-auto"}
        onClick={() => {
          onPrepare?.();
          setFormat("story");
          setIncludeName(false);
          setSelected(null);
          setOpen(true);
        }}
      >
        <Share2 className="size-4 shrink-0" />
        {!iconOnly && (label ?? t.cta)}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="share-card-modal max-h-[92dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border-primary/35 p-5 sm:max-w-4xl sm:p-7">
          <DialogHeader className="pr-6 text-left">
            <DialogDescription className="text-xs text-primary">
              AGOLMEN'S COMPASS · {t.description}
            </DialogDescription>
            <DialogTitle className="font-serif text-xl leading-relaxed sm:text-2xl">
              {t.title}
            </DialogTitle>
          </DialogHeader>
          <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
            <div className="min-w-0">
              {data?.kind !== "consultation" && (
                <div
                  role="radiogroup"
                  aria-label={t.description}
                  className="mb-3 grid grid-cols-2 gap-2"
                >
                  {(["story", "x"] as const).map((f) => (
                    <Button
                      key={f}
                      type="button"
                      role="radio"
                      aria-checked={format === f}
                      variant={format === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormat(f)}
                    >
                      <Image className="size-4" />
                      {t[f]}
                    </Button>
                  ))}
                </div>
              )}
              <div
                className={`relative mx-auto flex w-full items-center justify-center overflow-hidden border border-primary/25 bg-background ${format === "story" ? "aspect-[9/16] max-w-[330px]" : "aspect-video"}`}
              >
                {url && (
                  <img src={url} alt={t.description} className="h-full w-full object-contain" />
                )}
                {!url &&
                  (rendering || loading ? (
                    <AgolmenLoading compact label={status || t.loading} />
                  ) : (
                    <div role="status" className="px-5 text-center text-sm text-muted-foreground">
                      {status || t.loading}
                    </div>
                  ))}
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {format === "story" ? "1080 × 1920" : "1200 × 675"} · PNG
              </p>
              {pages.length > 1 && <div className="mt-3 flex items-center justify-center gap-3"><Button variant="outline" size="icon" aria-label={ui.previous} disabled={pageIndex === 0} onClick={() => { const i = pageIndex - 1; setPageIndex(i); setUrl(pages[i]?.url ?? null); }}><ChevronLeft /></Button><span className="text-sm">{pageIndex + 1} / {pages.length}</span><Button variant="outline" size="icon" aria-label={ui.next} disabled={pageIndex === pages.length - 1} onClick={() => { const i = pageIndex + 1; setPageIndex(i); setUrl(pages[i]?.url ?? null); }}><ChevronRight /></Button></div>}
            </div>
            <div className="flex min-w-0 flex-col gap-5 md:pt-1">
              {data?.sections && <fieldset className="space-y-3"><legend className="mb-2 font-semibold text-primary">{ui.select}</legend><Button variant="outline" size="sm" onClick={() => setSelected(null)}>{ui.all}</Button>{data.sections.map(section => <label key={section.id} className="flex items-start gap-3 text-sm"><Checkbox checked={selected === null || selected.includes(section.id)} onCheckedChange={checked => setSelected(current => { const ids = current ?? data.sections?.map(s => s.id) ?? []; return checked ? [...ids, section.id] : ids.filter(id => id !== section.id); })} /><span className="min-w-0 break-words">{section.title}</span></label>)}</fieldset>}
              <div className="border-b border-primary/20 pb-5">
                {data?.kind !== "consultation" && data?.kind !== 'app' && (
                  <label
                    htmlFor="share-card-name"
                    className="flex items-center justify-between gap-3 text-sm text-foreground"
                  >
                    {t.name}
                    <Switch
                      id="share-card-name"
                      checked={includeName}
                      onCheckedChange={setIncludeName}
                    />
                  </label>
                )}
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{t.privacy}</p>
              </div>
              <div className="grid gap-2">
                {text && <><Button variant="outline" onClick={() => { const a = document.createElement('a'); const u = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.href = u; a.download = 'agolmen-reading.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }}><FileText className="size-4" />{ui.text}</Button><Button variant="outline" onClick={() => void navigator.clipboard.writeText(text).then(() => setStatus(ui.copied)).catch(() => setStatus(t.error))}><Copy className="size-4" />{ui.copy}</Button></>}
                <Button disabled={!ready} onClick={save} className="min-h-12">
                  <Download className="size-4" />
                  {t.save}
                </Button>
                <Button
                  variant="outline"
                  disabled={!ready || sharing}
                  onClick={() => void share()}
                  className="min-h-12"
                >
                  <Share2 className="size-4" />
                  {t.share}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  disabled={!ready || sharing}
                  onClick={() => void share()}
                  className="min-h-11"
                >
                  <Smartphone className="size-4" />
                  Instagram
                </Button>
                <Button
                  variant="outline"
                  disabled={!ready || sharing}
                  onClick={() => void share()}
                  className="min-h-11"
                >
                  <Smartphone className="size-4" />
                  TikTok
                </Button>
                <Button variant="outline" disabled={!ready} onClick={post} className="min-h-11">
                  <Send className="size-4" />X
                </Button>
              </div>
              <p className="text-xs leading-6 text-muted-foreground">{t.note}</p>
              {status && (
                <p role="status" className="border-t border-primary/20 pt-3 text-sm text-primary">
                  {status}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
