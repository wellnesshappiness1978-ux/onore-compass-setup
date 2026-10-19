// App-wide playback state for the Celestial piano. Lives outside React so
// switching tabs (which unmounts the player UI) never stops the music.
import { createAmbientPiano, type AmbientPiano } from "./ambient-piano";

export type PianoState = { hz: number; playing: boolean; busy: boolean; muted: boolean; volume: number; error: boolean; sample: boolean };
let state: PianoState = { hz: 528, playing: false, busy: false, muted: false, volume: 0.25, error: false, sample: false };
const listeners = new Set<() => void>();
let engine: AmbientPiano | null = null;
let seq = 0;
let sampleTimer: number | undefined;
let onSampleEnd: (() => void) | null = null;

const set = (patch: Partial<PianoState>) => { state = { ...state, ...patch }; listeners.forEach(l => l()); };
export const subscribePiano = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const getPianoState = () => state;

export function stopPiano() {
  seq += 1; window.clearTimeout(sampleTimer);
  const old = engine; engine = null; void old?.stop();
  set({ playing: false, busy: false, sample: false });
}

/** Starts a tuning. `sampleSeconds` limits playback for plans below VIP. */
export async function playPiano(hz: number, sampleSeconds?: number, sampleEnd?: () => void) {
  const token = ++seq; window.clearTimeout(sampleTimer);
  const old = engine; engine = null; void old?.stop();
  set({ hz, busy: true, error: false, sample: !!sampleSeconds });
  try {
    const next = await createAmbientPiano(hz, state.muted ? 0 : state.volume);
    if (token !== seq) { void next.stop(); return; }
    engine = next; set({ playing: true });
    if (sampleSeconds) { onSampleEnd = sampleEnd ?? null; sampleTimer = window.setTimeout(() => { stopPiano(); onSampleEnd?.(); }, sampleSeconds * 1000); }
  } catch { if (token === seq) set({ error: true, playing: false }); }
  finally { if (token === seq) set({ busy: false }); }
}

export function setPianoHz(hz: number) { set({ hz }); }
export function setPianoVolume(volume: number) { set({ volume }); engine?.setVolume(state.muted ? 0 : volume); }
export function setPianoMuted(muted: boolean) { set({ muted }); engine?.setVolume(muted ? 0 : state.volume); }

if (typeof window !== "undefined") window.addEventListener("onore-voice-start", () => { if (state.playing) stopPiano(); });
