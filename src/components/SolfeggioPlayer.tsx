import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAmbientPiano, type AmbientPiano } from "@/lib/ambient-piano";
import type { Language } from "@/lib/translations";

const tones = [396, 432, 528, 639, 741, 963];
export default function SolfeggioPlayer({ language, compact = false }: { language: Language; compact?: boolean }) {
  const ja = language === "ja";
  const [hz, setHz] = useState(528);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [error, setError] = useState(false);
  const engine = useRef<AmbientPiano | null>(null);
  const sequence = useRef(0);
  const level = useRef(volume);
  level.current = muted ? 0 : volume;
  useEffect(() => () => { sequence.current += 1; void engine.current?.stop(); engine.current = null; }, []);
  useEffect(() => engine.current?.setVolume(muted ? 0 : volume), [volume, muted]);
  const start = async (frequency: number) => {
    const token = ++sequence.current;
    const old = engine.current; engine.current = null;
    void old?.stop(); setBusy(true); setError(false);
    try {
      const next = await createAmbientPiano(frequency, level.current);
      if (token !== sequence.current) { void next.stop(); return; }
      engine.current = next; setPlaying(true);
    } catch { if (token === sequence.current) { setError(true); setPlaying(false); } }
    finally { if (token === sequence.current) setBusy(false); }
  };
  const toggle = () => {
    if (playing) { sequence.current += 1; void engine.current?.stop(); engine.current = null; setPlaying(false); }
    else void start(hz);
  };
  return <section aria-label={ja ? "アンビエントピアノ" : "Ambient piano"} className={`audio-controller ${compact ? "audio-controller--compact" : ""}`}>
    <div className="flex items-center gap-3">
      <Button size="icon" variant="default" onClick={toggle} disabled={busy} aria-label={playing ? (ja ? "BGMを停止" : "Stop BGM") : (ja ? "BGMを再生" : "Play BGM")} aria-pressed={playing} title={ja ? "再生・停止" : "Play / stop"} className="size-11 shrink-0 rounded-full">{playing ? <Pause /> : <Play />}</Button>
      <div className="min-w-0 flex-1"><p className="flex items-center gap-2 font-serif text-sm text-primary"><Music2 className="size-4 shrink-0" />{ja ? "星音のピアノ" : "Celestial piano"}</p><p className="text-xs text-muted-foreground">{hz} Hz · {ja ? "アンビエント" : "Ambient"}</p></div>
      <Button size="icon" variant="ghost" onClick={() => setMuted(!muted)} aria-label={muted ? (ja ? "消音を解除" : "Unmute") : (ja ? "消音" : "Mute")} aria-pressed={muted} title={ja ? "消音" : "Mute"}>{muted ? <VolumeX /> : <Volume2 />}</Button>
      <Button size="icon" variant="ghost" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label={ja ? "音楽の設定" : "Audio settings"} title={ja ? "音楽の設定" : "Audio settings"}>{expanded ? <ChevronDown /> : <ChevronUp />}</Button>
    </div>
    {expanded && <div className="mt-3 border-t border-primary/20 pt-3">
      <div role="group" aria-label={ja ? "周波数" : "Frequency"} className="grid grid-cols-3 gap-2">{tones.map(f => <Button key={f} size="sm" variant={hz === f ? "default" : "outline"} aria-pressed={hz === f} disabled={busy} onClick={() => { setHz(f); if (playing) void start(f); }}>{f} Hz</Button>)}</div>
      <label className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">{ja ? "音量" : "Volume"}<input aria-label={ja ? "BGM音量" : "BGM volume"} type="range" min={0} max={0.6} step={0.01} value={volume} onChange={e => setVolume(Number(e.target.value))} className="min-w-0 flex-1 accent-primary" /></label>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">{ja ? "周波数を基音にした創作音楽です。DNA修復・治療などの効果は保証しません。" : "Original music tuned to a reference frequency; no therapeutic or DNA-repair effects are claimed."}</p>
    </div>}
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{ja ? "音声を開始できませんでした。再生を押して再試行してください。" : "Audio could not start. Try Play again."}</p>}
  </section>;
}
