import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { Language } from "@/lib/translations";

const tones = [
  { hz: 528, ja: "愛と再生", en: "Renewal" },
  { hz: 432, ja: "宇宙の調和", en: "Harmony" },
  { hz: 396, ja: "解放", en: "Release" },
  { hz: 639, ja: "つながり", en: "Connection" },
  { hz: 741, ja: "直感", en: "Intuition" },
];

type Engine = { ctx: AudioContext; master: GainNode; nodes: AudioScheduledSourceNode[] };

export default function SolfeggioPlayer({ language, compact = false }: { language: Language; compact?: boolean }) {
  const ja = language === "ja";
  const [hz, setHz] = useState(528);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const eng = useRef<Engine | null>(null);

  const stop = () => {
    const e = eng.current; if (!e) return;
    const t = e.ctx.currentTime;
    e.master.gain.cancelScheduledValues(t); e.master.gain.setValueAtTime(e.master.gain.value, t); e.master.gain.linearRampToValueAtTime(0, t + 1.2);
    setTimeout(() => { e.nodes.forEach((n) => { try { n.stop(); } catch { /* */ } }); void e.ctx.close(); }, 1300);
    eng.current = null;
  };

  const start = (freq: number) => {
    stop();
    const ctx = new AudioContext();
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const nodes: AudioScheduledSourceNode[] = [];
    // soft pad: fundamental, gentle beat, fifth and octave
    const voices: [number, number, OscillatorType][] = [[freq, 0.45, "sine"], [freq + 4, 0.3, "sine"], [freq * 1.5, 0.12, "sine"], [freq / 2, 0.25, "triangle"]];
    const pad = ctx.createGain(); pad.gain.value = 0.25;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08; const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.08;
    lfo.connect(lfoGain).connect(pad.gain); lfo.start(); nodes.push(lfo);
    for (const [f, g, type] of voices) { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; const vg = ctx.createGain(); vg.gain.value = g; o.connect(vg).connect(pad); o.start(); nodes.push(o); }
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 2200;
    pad.connect(filter).connect(master);
    master.gain.linearRampToValueAtTime(muted ? 0 : volume, ctx.currentTime + 2);
    eng.current = { ctx, master, nodes };
  };

  useEffect(() => () => stop(), []);
  useEffect(() => { const e = eng.current; if (e) e.master.gain.setTargetAtTime(muted ? 0 : volume, e.ctx.currentTime, 0.2); }, [volume, muted]);

  const toggle = () => { if (playing) { stop(); setPlaying(false); } else { start(hz); setPlaying(true); } };
  const pick = (f: number) => { setHz(f); if (playing) start(f); };

  return (
    <section aria-label={ja ? "ソルフェジオ波動BGM" : "Solfeggio healing sound"} className={`mx-auto w-full max-w-[640px] rounded-2xl border border-primary/25 bg-card/60 p-4 text-left backdrop-blur-md ${compact ? "" : "mt-6"}`}>
      <div className="flex items-center gap-3">
        <button type="button" onClick={toggle} aria-label={playing ? (ja ? "停止" : "Stop") : (ja ? "再生" : "Play")} aria-pressed={playing}
          className={`grid size-12 shrink-0 place-items-center rounded-full bg-champagne-gradient text-primary-foreground shadow-champagne ${playing ? "animate-pulse motion-reduce:animate-none" : ""}`}>
          {playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-serif text-sm text-primary"><Music2 className="size-4" />{ja ? "ソルフェジオ波動BGM" : "Solfeggio healing sound"}</p>
          <p className="text-xs text-muted-foreground">{hz}Hz · {ja ? tones.find((x) => x.hz === hz)?.ja : tones.find((x) => x.hz === hz)?.en}</p>
        </div>
        <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? (ja ? "消音を解除" : "Unmute") : (ja ? "消音" : "Mute")} className="grid size-10 place-items-center rounded-full border border-primary/30 text-primary">
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tones.map((x) => <button key={x.hz} type="button" onClick={() => pick(x.hz)} aria-pressed={hz === x.hz}
          className={`rounded-full border px-3 py-1 text-xs ${hz === x.hz ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground"}`}>{x.hz}Hz</button>)}
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">{ja ? "音量" : "Volume"}
        <input type="range" min={0} max={0.8} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="flex-1 accent-primary" />
      </label>
      <p className="mt-2 text-[10px] leading-4 text-muted-foreground">{ja ? "※リラックス用のBGMです。効果・効能を保証するものではありません。音量にご注意ください。" : "For relaxation only; no health effects are claimed. Mind your volume."}</p>
    </section>
  );
}
