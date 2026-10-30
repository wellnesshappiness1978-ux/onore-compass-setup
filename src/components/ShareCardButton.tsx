import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Image, Link2, Lock, MessageCircle, Send, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_SHARE_URL, privateShareText, shareSectionsOf, shareUi, snsIntentUrl, type SnsTarget } from "@/lib/share-content";
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
  const description = data?.kind === "app" ? ui.app : data?.kind === "daily" ? ui.daily : data?.kicker || t.description;
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<CardFormat>("story");
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [includeName, setIncludeName] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [scope, setScope] = useState<"all" | "select">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [snsOpen, setSnsOpen] = useState(false);
  const [pages, setPages] = useState<{ url: string; blob: Blob }[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const sections = useMemo(() => (data ? shareSectionsOf(data) : []), [data]);
  const available = sections.filter((s) => !s.locked);
  const selectable = data?.kind !== "app" && sections.length > 1;
  const chosen = scope === "all" || !selectable ? available.map((s) => s.id) : selected;
  const payload = data ? JSON.stringify(data) : "";
  const chosenKey = chosen.join("|");
  const link = data?.url ?? APP_SHARE_URL;

  useEffect(() => {
    if (!open) return;
    let active = true;
    const imageUrls: string[] = [];
    setUrl(null);
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
        const all = shareSectionsOf(source).filter((s) => !s.locked);
        const ids = chosenKey ? chosenKey.split("|") : [];
        const picked = all.filter((s) => ids.includes(s.id));
        if (all.length && !picked.length) { setRendering(false); setStatus(ui.empty); return; }
        const usesSections = Boolean(source.sections) || all.length > 1 || source.fullContent;
        const body = usesSections ? picked.map((s) => (s.title ? `${s.title}\n${s.text}` : s.text)) : source.lines;
        const canvases = await renderShareCards(
          format,
          { ...source, fullContent: source.fullContent || picked.length > 1 || undefined, title: privateShareText(source.title, source.names, includeName), caution: source.caution ? privateShareText(source.caution, source.names, includeName) : undefined, names: includeName ? source.names : [], lines: body.map((line) => privateShareText(line, source.names, includeName)), photos: picked.filter((s) => s.image).map((s) => ({ src: s.image!, caption: privateShareText(`${s.title}\n${s.text}`, source.names, includeName) })) },
          language,
        );
        if (!active) return;
        const images = await Promise.all(canvases.map((canvas) => new Promise<Blob>((resolve, reject) => canvas.toBlob((image) => (image ? resolve(image) : reject(new Error(t.error))), "image/png"))));
        if (!active) return;
        const next = images.map((blob) => ({ blob, url: URL.createObjectURL(blob) }));
        imageUrls.push(...next.map((p) => p.url));
        setPages(next); setUrl(next[0]?.url ?? null); setRendering(false);
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
      imageUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [open, payload, language, format, includeName, loading, chosenKey]);

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
  const ready = pages.length > 0 && !rendering && !loading;
  const save = () => {
    if (!pages.length) return;
    pages.forEach((page, i) => { const a = document.createElement("a"); a.href = page.url; a.download = pages.length > 1 ? filename.replace(".png", `-${i + 1}.png`) : filename; a.click(); });
    setStatus(t.saved);
  };
  const shareFiles = async () => {
    if (!pages.length || sharing) return;
    const files = pages.map((page, i) => new File([page.blob], filename.replace(".png", `-${i + 1}.png`), { type: "image/png" }));
    if (!navigator.canShare?.({ files })) { save(); setStatus(ui.snsNote); return; }
    setSharing(true);
    try {
      await navigator.share({ files, title: data?.title || t.description });
      setStatus(t.shared);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setStatus(t.error);
    } finally {
      setSharing(false);
    }
  };
  const sns = (target: SnsTarget) => {
    if (target === "instagram" || target === "tiktok") { void shareFiles(); return; }
    window.open(snsIntentUrl(target, link, data?.kind === "app" ? `${data.title} ${ui.tagline}` : t.hashtags), "_blank", "noopener,noreferrer");
    if (data?.kind !== "app") save();
  };
  const copyLink = () => void navigator.clipboard.writeText(link).then(() => setStatus(ui.linkCopied)).catch(() => setStatus(t.error));
  const goPage = (i: number) => { setPageIndex(i); setUrl(pages[i]?.url ?? null); };
  const snsTargets: { id: SnsTarget; label: string; icon: typeof Send }[] = [
    { id: "instagram", label: "Instagram", icon: Smartphone },
    { id: "tiktok", label: "TikTok", icon: Smartphone },
    { id: "x", label: "X", icon: Send },
    { id: "line", label: "LINE", icon: MessageCircle },
  ];
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
          setScope("all");
          setSelected([]);
          setSnsOpen(false);
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
              AGOLMEN'S COMPASS · {description}
            </DialogDescription>
            <DialogTitle className="font-serif text-xl leading-relaxed sm:text-2xl">
              {data?.kind === "app" ? data.title : description}
            </DialogTitle>
          </DialogHeader>
          <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
            <div className="min-w-0">
              <div role="radiogroup" aria-label={t.description} className="mb-3 grid grid-cols-2 gap-2">
                {(["story", "x"] as const).map((f) => (
                  <Button key={f} type="button" role="radio" aria-checked={format === f} variant={format === f ? "default" : "outline"} size="sm" onClick={() => setFormat(f)}>
                    <Image className="size-4" />
                    {t[f]}
                  </Button>
                ))}
              </div>
              <div className={`relative mx-auto flex w-full items-center justify-center overflow-hidden border border-primary/25 bg-background ${format === "story" ? "aspect-[9/16] max-w-[330px]" : "aspect-video"}`}>
                {url && <img src={url} alt={t.description} className="h-full w-full object-contain" />}
                {!url && (rendering || loading ? (
                  <AgolmenLoading compact label={status || t.loading} />
                ) : (
                  <div role="status" className="px-5 text-center text-sm text-muted-foreground">{status || t.loading}</div>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {format === "story" ? "1080 × 1920" : "1200 × 675"} · PNG{pages.length > 1 ? ` · ${pages.length}` : ""}
              </p>
              {pages.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <Button variant="outline" size="icon" aria-label={ui.previous} disabled={pageIndex === 0} onClick={() => goPage(pageIndex - 1)}><ChevronLeft /></Button>
                  <span className="text-sm">{pageIndex + 1} / {pages.length}</span>
                  <Button variant="outline" size="icon" aria-label={ui.next} disabled={pageIndex === pages.length - 1} onClick={() => goPage(pageIndex + 1)}><ChevronRight /></Button>
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-5 md:pt-1">
              {selectable && (
                <div className="space-y-3">
                  <div role="radiogroup" aria-label={ui.select} className="grid grid-cols-2 gap-2">
                    {(["all", "select"] as const).map((s) => (
                      <Button key={s} type="button" role="radio" aria-checked={scope === s} variant={scope === s ? "default" : "outline"} className="h-auto min-h-11 whitespace-normal" onClick={() => { setScope(s); }}>
                        {s === "all" ? ui.scopeAll : ui.scopeSelect}
                      </Button>
                    ))}
                  </div>
                  {scope === "select" && (
                    <fieldset className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-primary/20 p-3">
                      <legend className="px-1 text-sm font-semibold text-primary">{ui.select}</legend>
                      {sections.map((section) => (
                        <label key={section.id} className={`flex items-start gap-3 text-sm ${section.locked ? "opacity-55" : ""}`}>
                          <Checkbox
                            disabled={section.locked}
                            checked={!section.locked && selected.includes(section.id)}
                            onCheckedChange={(checked) => setSelected((ids) => (checked ? [...ids, section.id] : ids.filter((id) => id !== section.id)))}
                          />
                          <span className="min-w-0 break-words">
                            {section.locked && <Lock className="mr-1 inline size-3.5 align-[-2px]" aria-hidden="true" />}
                            {section.title || Array.from(section.text.replace(/\s+/g, " ")).slice(0, 48).join("")}
                            {section.locked && <span className="block text-xs text-muted-foreground">{ui.locked}</span>}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  )}
                </div>
              )}
              {data?.kind !== "consultation" && data?.kind !== "app" && (
                <div className="border-b border-primary/20 pb-4">
                  <label htmlFor="share-card-name" className="flex items-center justify-between gap-3 text-sm text-foreground">
                    {t.name}
                    <Switch id="share-card-name" checked={includeName} onCheckedChange={setIncludeName} />
                  </label>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{t.privacy}</p>
                </div>
              )}
              <div className="grid gap-2" data-share-actions>
                <Button disabled={!ready} onClick={save} className="min-h-12">
                  <Download className="size-4" />
                  {ui.saveImage}
                </Button>
                <Button variant="outline" aria-expanded={snsOpen} onClick={() => setSnsOpen((v) => !v)} className="min-h-12">
                  <Share2 className="size-4" />
                  {ui.sns}
                </Button>
                {snsOpen && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300 sm:grid-cols-4">
                    {snsTargets.map(({ id, label: name, icon: Icon }) => (
                      <Button key={id} variant="outline" disabled={!ready || sharing} onClick={() => sns(id)} className="min-h-11">
                        <Icon className="size-4" />
                        {name}
                      </Button>
                    ))}
                    <p className="col-span-full text-xs leading-6 text-muted-foreground">{ui.snsNote}</p>
                  </div>
                )}
                <Button variant="outline" onClick={copyLink} className="min-h-12">
                  <Link2 className="size-4" />
                  {ui.copyLink}
                </Button>
              </div>
              {status && (
                <p role="status" className="border-t border-primary/20 pt-3 text-sm text-primary">{status}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
