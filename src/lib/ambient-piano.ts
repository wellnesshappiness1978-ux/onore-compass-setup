// Gesture-started artistic tunings, not treatments. The same graph powers offline checks.
export type AmbientPiano = { stop: () => Promise<void>; setVolume: (value: number) => void };
export const pianoTones = [174, 285, 396, 417, 528, 639, 741, 852, 963] as const;
type Style = { partials: number[]; attack: number; decay: number; wet: number; pad: number; padCutoff: number; bells: number; drops: number; melodyEvery: number; mood: string };
export const pianoStyles: Record<number, Style> = {
  174: { mood: 'deep-earth', partials: [1,.24,.08], attack: .12, decay: 7, wet: .28, pad: .055, padCutoff: 650, bells: 0, drops: 0, melodyEvery: 2 },
  285: { mood: 'soft-dawn', partials: [1,.16,.04], attack: .09, decay: 6, wet: .24, pad: .045, padCutoff: 1100, bells: .2, drops: 0, melodyEvery: 1 },
  396: { mood: 'grounding-meditation', partials: [1,.2,.06], attack: .12, decay: 6.5, wet: .3, pad: .06, padCutoff: 650, bells: 0, drops: 0, melodyEvery: 2 },
  417: { mood: 'flowing-water', partials: [1,.1,.025], attack: .065, decay: 4.5, wet: .32, pad: .04, padCutoff: 1300, bells: 0, drops: .6, melodyEvery: 1 },
  528: { mood: 'warm-piano', partials: [1,.18,.055,.015], attack: .055, decay: 5.2, wet: .22, pad: .035, padCutoff: 1600, bells: 0, drops: 0, melodyEvery: 1 },
  639: { mood: 'starry-sky', partials: [1,.06,.16,.015,.05], attack: .08, decay: 6, wet: .36, pad: .045, padCutoff: 2000, bells: .7, drops: 0, melodyEvery: 1 },
  741: { mood: 'crystal-clarity', partials: [1,0,.18,0,.055], attack: .075, decay: 4.4, wet: .28, pad: .035, padCutoff: 1400, bells: .4, drops: .2, melodyEvery: 1 },
  852: { mood: 'mystic-temple', partials: [1,.24,.1,.04], attack: .14, decay: 8, wet: .4, pad: .055, padCutoff: 1000, bells: .3, drops: 0, melodyEvery: 2 },
  963: { mood: 'celestial-light', partials: [1,.04,.12,.015,.04], attack: .12, decay: 9, wet: .42, pad: .045, padCutoff: 2400, bells: .9, drops: 0, melodyEvery: 1 },
};
const scores: Record<number, { chords: number[][]; melody: number[]; pace: number; register: number }> = {
  174: { chords: [[0,3,7,10],[-5,0,3,7],[-7,-2,3,5]], melody: [7,10,12,10,7,3,5,3,0,3,7,5], pace: .98, register: 2 },
  285: { chords: [[0,4,7,9],[-2,2,5,9],[-5,0,4,7]], melody: [4,7,9,12,9,7,4,2,0,2,5,7], pace: .82, register: 2 },
  396: { chords: [[0,3,7,12],[-3,2,5,10],[-5,0,3,7]], melody: [12,7,10,7,3,5,7,0,3,7,10,5], pace: .91, register: 2 },
  417: { chords: [[0,4,7,11],[-2,2,7,9],[-5,0,4,9]], melody: [7,11,12,16,12,9,7,4,7,9,11,4], pace: .77, register: 2 },
  528: { chords: [[0,4,7,11],[-3,0,4,7],[-5,0,2,7],[-7,-3,0,4]], melody: [12,7,4,11,7,2,4,0,7,11,12,9,7,4,2,0], pace: .87, register: 2 },
  639: { chords: [[0,4,7,14],[-5,0,4,9],[-2,2,7,11]], melody: [7,9,14,12,9,7,4,2,4,7,11,9], pace: .84, register: 4 },
  741: { chords: [[0,5,7,12],[-2,3,7,10],[-7,0,5,9]], melody: [12,10,7,5,7,12,14,12,9,7,5,2], pace: .73, register: 4 },
  852: { chords: [[0,4,9,12],[-5,0,5,9],[-7,0,4,7]], melody: [9,12,16,12,9,7,4,7,9,12,7,4], pace: .95, register: 4 },
  963: { chords: [[0,4,7,12],[-4,0,5,9],[-7,-2,4,7]], melody: [12,16,19,16,12,9,7,4,7,12,16,9], pace: 1.05, register: 4 },
};
export const safePianoVolume = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
export function normalizedPartials(weights: number[], frequency: number, sampleRate: number) {
  const valid = weights.map((w, i) => frequency * (i + 1) * (1 + i * i * .00012) < Math.min(7000, sampleRate * .45) ? Math.max(0, w) : 0);
  const sum = valid.reduce((a, b) => a + b, 0);
  return valid.map(w => sum > 0 ? w / sum : 0);
}
// Raised-cosine attack/release reaches exact zero with zero endpoint slope.
function envelopeCurve(peak: number, attack: number, duration: number) {
  return Float32Array.from({ length: 512 }, (_, i) => {
    const t = i / 511 * duration;
    const rise = .5 - .5 * Math.cos(Math.PI * Math.min(1, t / attack));
    const release = t > duration - .4 ? .5 - .5 * Math.cos(Math.PI * (duration - t) / .4) : 1;
    return peak * rise * Math.exp(-4.5 * Math.max(0, t - attack) / duration) * release;
  });
}
/** Browser-safe graph factory; the caller owns the context and scheduling lifetime. */
export function createAmbientGraph(ctx: BaseAudioContext, hz: number, volume: number) {
  const style = pianoStyles[hz] ?? pianoStyles[528];
  const score = scores[hz] ?? scores[528];
  if (!style || !score) throw new Error('BGM score unavailable');
  const start = ctx.currentTime;
  const bus = ctx.createGain();
  const highpass = ctx.createBiquadFilter(); highpass.type = 'highpass'; highpass.frequency.value = 25; highpass.Q.value = .5;
  const lowpass = ctx.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 6200; lowpass.Q.value = .5;
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -12; compressor.knee.value = 12; compressor.ratio.value = 3; compressor.attack.value = .015; compressor.release.value = .3;
  const master = ctx.createGain();
  // Headroom precedes output volume; never use a hard-clipping waveshaper.
  const headroom = ctx.createGain(); headroom.gain.value = .8;
  bus.connect(highpass).connect(lowpass).connect(compressor).connect(headroom).connect(master).connect(ctx.destination);
  master.gain.setValueAtTime(0, start);
  master.gain.linearRampToValueAtTime(safePianoVolume(volume), start + .9);
  const dry = ctx.createGain(); dry.gain.value = .85; dry.connect(bus);
  const reverb = ctx.createConvolver(); reverb.normalize = false;
  const impulse = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * 3), ctx.sampleRate);
  // Bounded, deterministic diffuse reflections. No continuous noise generator or feedback loop.
  for (let ch = 0; ch < 2; ch++) {
    const samples = impulse.getChannelData(ch);
    for (let tap = 0; tap < 96; tap++) {
      const time = .035 + tap * .0289 + ((tap * 17 + ch * 11) % 23) * .0007;
      const index = Math.round(time * ctx.sampleRate);
      if (index < samples.length) samples[index] = (tap % 2 ? -1 : 1) * .016 * Math.exp(-time * 1.5);
    }
  }
  reverb.buffer = impulse;
  const wet = ctx.createGain(); wet.gain.value = style.wet; reverb.connect(wet).connect(bus);
  const delay = ctx.createDelay(2); delay.delayTime.value = .72;
  const echo = ctx.createGain(); echo.gain.value = .12; delay.connect(echo).connect(reverb);
  const active = new Set<OscillatorNode>();
  let seed = hz;
  const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
  const note = (frequency: number, at: number, strength: number, pan: number, weights = style.partials, duration = style.decay, attack = style.attack, water = false) => {
    if (strength <= 0) return;
    const partials = normalizedPartials(weights, frequency, ctx.sampleRate);
    const env = ctx.createGain(); env.gain.setValueAtTime(0, start);
    env.gain.setValueCurveAtTime(envelopeCurve(strength, attack, duration), at, duration);
    const stereo = ctx.createStereoPanner(); stereo.pan.value = pan;
    env.connect(stereo); stereo.connect(dry); stereo.connect(reverb); stereo.connect(delay);
    let remaining = partials.filter(w => w > 0).length;
    if (!remaining) { env.disconnect(); stereo.disconnect(); return; }
    partials.forEach((weight, index) => {
      if (weight <= 0) return;
      const oscillator = ctx.createOscillator(); oscillator.type = 'sine';
      const f = frequency * (index + 1) * (1 + index * index * .00012);
      oscillator.frequency.setValueAtTime(f, at);
      if (water) oscillator.frequency.exponentialRampToValueAtTime(f * 1.35, at + .22);
      const partial = ctx.createGain(); partial.gain.value = weight;
      oscillator.connect(partial).connect(env); active.add(oscillator);
      oscillator.onended = () => { active.delete(oscillator); oscillator.disconnect(); partial.disconnect(); if (--remaining === 0) { env.disconnect(); stereo.disconnect(); } };
      oscillator.start(at); oscillator.stop(at + duration + .025);
    });
  };
  const padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = style.padCutoff; padFilter.Q.value = .5;
  const padGain = ctx.createGain(); padGain.gain.setValueAtTime(0, start); padGain.gain.linearRampToValueAtTime(style.pad, start + 4);
  padFilter.connect(padGain); padGain.connect(reverb); padGain.connect(dry);
  const initialChord = score.chords[0] ?? [0,4,7,12];
  const padVoices = [0,1,2,3].map(i => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.detune.value = i % 2 ? 3 : -3;
    o.frequency.value = hz / score.register / 2 * 2 ** ((initialChord[i] ?? 0) / 12);
    const gain = ctx.createGain(); gain.gain.value = .25; o.connect(gain).connect(padFilter); o.start(start); return o;
  });
  let step = 0; let next = start + .08; let stopping = false;
  return {
    scheduleUntil(until: number) {
      if (stopping) return;
      if (next < ctx.currentTime) next = ctx.currentTime + .06;
      while (next < until) {
        const chord = score.chords[Math.floor(step / 8) % score.chords.length];
        if (chord && step % 8 === 0) padVoices.forEach((o,i) => o.frequency.setTargetAtTime(hz / score.register / 2 * 2 ** ((chord[i] ?? 0) / 12), next, 1.2));
        if (style.bells && random() < style.bells * .35) note(hz * 2 * 2 ** (([0,4,7,12,16][Math.floor(random()*5)] ?? 0)/12), next + random()*score.pace, .07*style.bells, random()*1.4-.7, [1,0,.16,0,.04], 4.5, .1);
        if (style.drops && random() < style.drops*.5) note(hz*(1.5+random()), next+random()*score.pace, .08*style.drops, random()-.5, [1], .85, .06, true);
        if (chord && step % 4 === 0) chord.forEach((semitone,i) => note(hz/score.register*2**(semitone/12), next+i*.09, .19, (i-1.5)*.28));
        const pitch = score.melody[step % score.melody.length] ?? 0;
        if (step % style.melodyEvery === 0) note(hz/(score.register/2)*2**(pitch/12), next, step%4===3 ? .22 : .28, step%2 ? .24 : -.24);
        if (step%8===5) note(hz/score.register*2**((pitch+7)/12), next+.22, .1, -.33);
        next += score.pace; step++;
      }
    },
    setVolume(value: number) {
      if (stopping) return;
      master.gain.cancelAndHoldAtTime(ctx.currentTime);
      master.gain.linearRampToValueAtTime(safePianoVolume(value), ctx.currentTime + .25);
    },
    fadeOut(at = ctx.currentTime) {
      if (stopping) return;
      stopping = true;
      master.gain.cancelAndHoldAtTime(at);
      master.gain.linearRampToValueAtTime(0, at + .6);
      [...padVoices, ...active].forEach(o => { try { o.stop(at + .65); } catch { /* Already ended. */ } });
    },
  };
}
export async function createAmbientPiano(hz: number, volume: number): Promise<AmbientPiano> {
  const ctx = new AudioContext();
  try {
    await ctx.resume();
    const graph = createAmbientGraph(ctx, hz, volume);
    graph.scheduleUntil(ctx.currentTime + .5);
    const timer = window.setInterval(() => { if (ctx.state === 'running') graph.scheduleUntil(ctx.currentTime + .5); }, 100);
    let stopping: Promise<void> | undefined;
    return {
      setVolume: graph.setVolume,
      stop() {
        if (stopping) return stopping;
        window.clearInterval(timer); graph.fadeOut();
        stopping = new Promise<void>(resolve => window.setTimeout(resolve, 750)).then(async () => { if (ctx.state !== 'closed') await ctx.close(); });
        return stopping;
      },
    };
  } catch (error) { await ctx.close(); throw error; }
}
