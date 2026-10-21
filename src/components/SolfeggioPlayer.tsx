import { useState, useSyncExternalStore } from "react";
import { BookOpen, ChevronDown, Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { bgmGuide } from "@/lib/bgm-guide";
import { Button } from "@/components/ui/button";
import { pianoTones } from "@/lib/ambient-piano";
import { getPianoState, playPiano, setPianoHz, setPianoMuted, setPianoVolume, stopPiano, subscribePiano } from "@/lib/piano-store";
import { pianoExtraCopy } from "@/lib/piano-copy";
import type { Language } from "@/lib/translations";

export default function SolfeggioPlayer({ language, compact = false, controlsOnly = false, sampleOnly = false, onSampleEnd }: { language: Language; compact?: boolean; controlsOnly?: boolean; sampleOnly?: boolean; onSampleEnd?: () => void }) {
  const labels: Record<Language, { region: string; stop: string; play: string; toggle: string; title: string; ambient: string; unmute: string; mute: string; settings: string; frequency: string; volume: string; bgmVolume: string; note: string; error: string }> = {
    ja: { region: "星音のBGM", stop: "BGMを停止", play: "BGMを再生", toggle: "再生・停止", title: "星音のBGM", ambient: "アンビエント", unmute: "消音を解除", mute: "消音", settings: "音楽の設定", frequency: "周波数", volume: "音量", bgmVolume: "BGM音量", note: "周波数を基音にした創作音楽です。DNA修復・治療などの効果は保証しません。", error: "音声を開始できませんでした。再生を押して再試行してください。" },
    en: { region: "Ambient piano", stop: "Stop music", play: "Play music", toggle: "Play or stop", title: "Celestial BGM", ambient: "Ambient", unmute: "Unmute", mute: "Mute", settings: "Audio settings", frequency: "Frequency", volume: "Volume", bgmVolume: "Music volume", note: "Original music tuned to a reference frequency; no therapeutic or DNA-repair effects are claimed.", error: "Audio could not start. Try Play again." },
    "zh-CN": { region: "氛围钢琴", stop: "停止音乐", play: "播放音乐", toggle: "播放或停止", title: "星音BGM", ambient: "氛围音乐", unmute: "取消静音", mute: "静音", settings: "音乐设置", frequency: "频率", volume: "音量", bgmVolume: "背景音乐音量", note: "这是以参考频率为基音的原创音乐，不宣称具有治疗或DNA修复作用。", error: "无法播放音频，请再次尝试。" },
    "zh-TW": { region: "氛圍鋼琴", stop: "停止音樂", play: "播放音樂", toggle: "播放或停止", title: "星音BGM", ambient: "氛圍音樂", unmute: "取消靜音", mute: "靜音", settings: "音樂設定", frequency: "頻率", volume: "音量", bgmVolume: "背景音樂音量", note: "這是以參考頻率為基音的原創音樂，不宣稱具有治療或DNA修復作用。", error: "無法播放音訊，請再次嘗試。" },
    ko: { region: "앰비언트 피아노", stop: "음악 정지", play: "음악 재생", toggle: "재생 또는 정지", title: "별빛 BGM", ambient: "앰비언트", unmute: "음소거 해제", mute: "음소거", settings: "음악 설정", frequency: "주파수", volume: "음량", bgmVolume: "배경 음악 음량", note: "참고 주파수를 기본음으로 만든 창작 음악이며 치료나 DNA 회복 효과를 주장하지 않습니다.", error: "오디오를 시작하지 못했습니다. 다시 재생해 주세요." },
    es: { region: "Piano ambiental", stop: "Detener música", play: "Reproducir música", toggle: "Reproducir o detener", title: "BGM celeste", ambient: "Ambiental", unmute: "Activar sonido", mute: "Silenciar", settings: "Ajustes de audio", frequency: "Frecuencia", volume: "Volumen", bgmVolume: "Volumen de la música", note: "Música original afinada con una frecuencia de referencia; no se atribuyen efectos terapéuticos ni de reparación del ADN.", error: "No se pudo iniciar el audio. Intenta reproducirlo de nuevo." },
    fr: { region: "Piano d’ambiance", stop: "Arrêter la musique", play: "Lire la musique", toggle: "Lire ou arrêter", title: "BGM céleste", ambient: "Ambiance", unmute: "Rétablir le son", mute: "Couper le son", settings: "Réglages audio", frequency: "Fréquence", volume: "Volume", bgmVolume: "Volume de la musique", note: "Musique originale accordée sur une fréquence de référence, sans allégation thérapeutique ni réparation de l’ADN.", error: "Impossible de lancer le son. Réessayez." },
  };
  const text = labels[language];
  const st = useSyncExternalStore(subscribePiano, getPianoState, getPianoState);
  const { hz, playing, busy, muted, volume, error } = st;
  const [expanded, setExpanded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const guide = bgmGuide[language];
  const extra = pianoExtraCopy[language];
  const toggle = () => {
    if (playing) stopPiano();
    else void playPiano(sampleOnly ? 528 : hz, sampleOnly ? 20 : undefined, onSampleEnd);
  };
  return <section aria-label={text.region} className={`audio-controller ${compact ? "audio-controller--compact" : ""}`}>
    {!controlsOnly && <Button variant="ghost" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label={text.settings} className="h-auto w-full justify-start gap-3 whitespace-normal p-0 text-left">
      <Music2 className="size-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1"><span className="block font-serif text-base text-primary">{text.title}</span><span className="block text-xs text-muted-foreground">{playing && <span className="mr-1 inline-block size-2 animate-pulse rounded-full bg-primary align-middle" />}{hz} Hz · {extra.moods[hz] ?? text.ambient}</span></span>
      <ChevronDown className={`size-5 shrink-0 text-primary transition-transform ${expanded ? "rotate-180" : ""}`} />
    </Button>}
    {(expanded || controlsOnly) && <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="default" onClick={toggle} disabled={busy} aria-label={playing ? text.stop : text.play} aria-pressed={playing} title={text.toggle} className="size-11 shrink-0 rounded-full">{playing ? <Pause /> : <Play />}</Button>
        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground">{text.volume}<input aria-label={text.bgmVolume} type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setPianoVolume(Number(e.target.value))} className="min-w-0 flex-1 accent-primary" /></label>
        <Button size="icon" variant="ghost" onClick={() => setPianoMuted(!muted)} aria-label={muted ? text.unmute : text.mute} aria-pressed={muted} title={text.mute}>{muted ? <VolumeX /> : <Volume2 />}</Button>
      </div>
      <div role="group" aria-label={text.frequency} className="grid grid-cols-3 gap-2">{pianoTones.map(f => <Button key={f} size="sm" variant={hz === f ? "default" : "outline"} aria-pressed={hz === f} disabled={busy || (sampleOnly && f !== 528)} onClick={() => { setPianoHz(f); if (playing) void playPiano(f, sampleOnly ? 20 : undefined, onSampleEnd); }} className="h-auto flex-col py-1.5"><span>{f} Hz</span><span className="text-[10px] font-normal opacity-80">{extra.moods[f]}</span></Button>)}</div>
      <Button variant="outline" size="sm" onClick={() => setGuideOpen(true)} className="w-full border-primary/40 text-primary"><BookOpen className="size-4" />{guide.open}</Button>
      <p className="text-xs leading-6 text-muted-foreground">{text.note}</p>
    </div>}
    <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
      <DialogContent className="z-[200] max-h-[85vh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto border-primary/40">
        <DialogTitle className="font-serif text-primary">{guide.title}</DialogTitle>
        <DialogDescription>{guide.intro}</DialogDescription>
        <div className="space-y-3">{pianoTones.map(f => { const e = guide.entries[f]; return e ? <div key={f} className={`rounded-lg border p-3 text-sm ${hz === f ? "border-primary bg-primary/10" : "border-primary/20"}`}>
          <p className="font-serif text-primary">{f} Hz · {extra.moods[f]}</p>
          <p className="mt-1 text-xs leading-5"><span className="text-primary/80">{guide.waveLabel}：</span>{e.wave}</p>
          <p className="mt-1 text-xs leading-5"><span className="text-primary/80">{guide.timingLabel}：</span>{e.timing}</p>
          <p className="mt-1 text-xs leading-5"><span className="text-primary/80">{guide.howtoLabel}：</span>{e.howto}</p>
        </div> : null; })}</div>
        <p className="text-[11px] leading-5 text-muted-foreground">{guide.disclaimer}</p>
        <Button onClick={() => setGuideOpen(false)}>{guide.close}</Button>
      </DialogContent>
    </Dialog>
    {sampleOnly && <p className="mt-2 rounded-md border border-primary/30 bg-primary/10 p-2 text-xs leading-5 text-primary">{extra.sampleNote}</p>}
    {!sampleOnly && playing && <p className="mt-2 text-[11px] text-muted-foreground">{extra.background}</p>}
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{text.error}</p>}
  </section>;
}
