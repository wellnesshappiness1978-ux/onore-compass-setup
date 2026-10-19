// Gesture-started Web Audio instrument. Frequencies are artistic tunings, not treatments.
export type AmbientPiano = { stop: () => Promise<void>; setVolume: (value: number) => void };
export const pianoTones = [174, 285, 396, 417, 528, 639, 741, 852, 963] as const;

// Each tuning is an original composition, not a therapeutic frequency claim.
type Style = { partials: number[]; attack: number; decay: number; wet: number; pad: number; padWave: OscillatorType; padCutoff: number; bells: number; drops: number; melodyEvery: number };
// Each tuning gets its own colour: timbre, sustained pad, sparkle and water textures.
export const pianoStyles: Record<number, Style & { mood: string }> = {
  174: { mood: "deep-earth", partials: [1, .3, .12, .04], attack: .02, decay: 7, wet: .28, pad: .07, padWave: "triangle", padCutoff: 500, bells: 0, drops: 0, melodyEvery: 2 },
  285: { mood: "soft-dawn", partials: [1, .18, .06], attack: .04, decay: 6, wet: .24, pad: .05, padWave: "sine", padCutoff: 900, bells: .2, drops: 0, melodyEvery: 1 },
  396: { mood: "grounding-meditation", partials: [1, .25, .1, .03], attack: .012, decay: 6.5, wet: .3, pad: .08, padWave: "sawtooth", padCutoff: 420, bells: 0, drops: 0, melodyEvery: 2 },
  417: { mood: "flowing-water", partials: [1, .12, .04], attack: .006, decay: 4.5, wet: .32, pad: .04, padWave: "sine", padCutoff: 1100, bells: 0, drops: .6, melodyEvery: 1 },
  528: { mood: "warm-piano", partials: [1, .22, .08, .025], attack: .009, decay: 5.2, wet: .18, pad: .035, padWave: "triangle", padCutoff: 1400, bells: 0, drops: 0, melodyEvery: 1 },
  639: { mood: "starry-sky", partials: [1, .08, .3, .02, .12], attack: .004, decay: 6, wet: .36, pad: .045, padWave: "sine", padCutoff: 2200, bells: .7, drops: 0, melodyEvery: 1 },
  741: { mood: "crystal-clarity", partials: [1, 0, .35, 0, .18], attack: .003, decay: 3.8, wet: .26, pad: .03, padWave: "square", padCutoff: 800, bells: .4, drops: .2, melodyEvery: 1 },
  852: { mood: "mystic-temple", partials: [1, .4, .2, .1, .05], attack: .05, decay: 8, wet: .4, pad: .07, padWave: "sawtooth", padCutoff: 650, bells: .3, drops: 0, melodyEvery: 2 },
  963: { mood: "celestial-light", partials: [1, .05, .2, .02, .1, .05], attack: .03, decay: 9, wet: .45, pad: .06, padWave: "sine", padCutoff: 3000, bells: .9, drops: 0, melodyEvery: 1 },
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

export async function createAmbientPiano(hz: number, volume: number): Promise<AmbientPiano> {
  const ctx = new AudioContext();
  try { await ctx.resume(); } catch (error) { await ctx.close(); throw error; }
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.8);
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -20; compressor.ratio.value = 3;
  master.connect(compressor).connect(ctx.destination);
  const dry = ctx.createGain(); dry.gain.value = 0.32; dry.connect(master);
  const reverb = ctx.createConvolver();
  const impulse = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate);
  let seed = 1789;
  for (let ch = 0; ch < 2; ch++) {
    const samples = impulse.getChannelData(ch);
    for (let i = 0; i < samples.length; i++) {
      seed = (seed * 16807) % 2147483647;
      samples[i] = (seed / 2147483647 * 2 - 1) * Math.pow(1 - i / samples.length, 3);
    }
  }
  reverb.buffer = impulse;
  const style = pianoStyles[hz] ?? pianoStyles[528]!;
  const wet = ctx.createGain(); wet.gain.value = style.wet;
  reverb.connect(wet).connect(master);
  const delay = ctx.createDelay(2); delay.delayTime.value = 0.72;
  const echo = ctx.createGain(); echo.gain.value = 0.13;
  delay.connect(echo).connect(reverb);
  const active = new Set<OscillatorNode>();
  const note = (frequency: number, at: number, strength: number, pan: number, partialsOverride?: number[]) => {
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(strength, at + style.attack);
    envelope.gain.exponentialRampToValueAtTime(strength * .42, at + style.attack + .17);
    envelope.gain.exponentialRampToValueAtTime(0.001, at + style.decay);
    const stereo = ctx.createStereoPanner(); stereo.pan.value = pan;
    envelope.connect(stereo); stereo.connect(dry); stereo.connect(reverb); stereo.connect(delay);
    const partials = partialsOverride ?? style.partials;
    let remaining = partials.length;
    partials.forEach((weight, index) => {
      const oscillator = ctx.createOscillator(); oscillator.type = 'sine';
      oscillator.frequency.value = frequency * (index + 1) * (1 + index * index * 0.00012);
      const partial = ctx.createGain(); partial.gain.value = weight;
      if (!weight) { oscillator.onended = null; }
      oscillator.connect(partial).connect(envelope);
      active.add(oscillator);
      oscillator.onended = () => {
        active.delete(oscillator); oscillator.disconnect(); partial.disconnect();
        remaining -= 1;
        if (remaining === 0) { envelope.disconnect(); stereo.disconnect(); }
      };
      oscillator.start(at); oscillator.stop(at + style.decay + .1);
    });
  };
  const score = scores[hz] ?? scores[528];
  if (!score) throw new Error("Piano score unavailable");
  let step = 0;
  let next = ctx.currentTime + 0.06;
  let stopped = false;
  // Sustained ambient pad: slowly breathing filtered chord, retuned per chord change.
  const padFilter = ctx.createBiquadFilter(); padFilter.type = "lowpass"; padFilter.frequency.value = style.padCutoff; padFilter.Q.value = .7;
  const padGain = ctx.createGain(); padGain.gain.setValueAtTime(0, ctx.currentTime); padGain.gain.linearRampToValueAtTime(style.pad, ctx.currentTime + 4);
  padFilter.connect(padGain); padGain.connect(reverb); padGain.connect(dry);
  const lfo = ctx.createOscillator(); lfo.frequency.value = .07; const lfoDepth = ctx.createGain(); lfoDepth.gain.value = style.padCutoff * .35;
  lfo.connect(lfoDepth).connect(padFilter.frequency); lfo.start();
  const padVoices = [0, 1, 2, 3].map(i => { const o = ctx.createOscillator(); o.type = style.padWave; o.detune.value = (i % 2 ? 6 : -6); o.connect(padFilter); o.start(); return o; });
  const retunePad = (chord: number[], at: number) => padVoices.forEach((o, i) => o.frequency.setTargetAtTime(hz / score.register / 2 * 2 ** ((chord[i % chord.length] ?? 0) / 12), at, 1.2));
  const bell = (at: number) => { const f = hz * 2 * 2 ** ([0, 4, 7, 12, 16][Math.floor(Math.random() * 5)]! / 12); note(f, at, .035 * style.bells, Math.random() * 1.4 - .7, [1, 0, .4, 0, .15]); };
  const drop = (at: number) => {
    const o = ctx.createOscillator(); o.type = "sine"; const g = ctx.createGain(); const f = hz * (1.5 + Math.random());
    o.frequency.setValueAtTime(f, at); o.frequency.exponentialRampToValueAtTime(f * 1.8, at + .12);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.05 * style.drops, at + .005); g.gain.exponentialRampToValueAtTime(.0008, at + .25);
    o.connect(g); g.connect(reverb); g.connect(delay); o.start(at); o.stop(at + .3); o.onended = () => { o.disconnect(); g.disconnect(); };
  };
  const schedule = () => {
    if (stopped || ctx.state !== 'running') return;
    // Schedule against the audio clock, not callback arrival time.
    if (next < ctx.currentTime) next = ctx.currentTime + 0.04;
    while (next < ctx.currentTime + 0.4) {
      const chord = score.chords[Math.floor(step / 8) % score.chords.length];
      if (chord && step % 8 === 0) retunePad(chord, next);
      if (style.bells && Math.random() < style.bells * .35) bell(next + Math.random() * score.pace);
      if (style.drops && Math.random() < style.drops * .5) drop(next + Math.random() * score.pace);
      if (chord && step % 4 === 0) chord.forEach((semitone, i) => note(hz / score.register * 2 ** (semitone / 12), next + i * 0.09, 0.095, (i - 1.5) * 0.28));
      const pitch = score.melody[step % score.melody.length] ?? 0;
      if (step % style.melodyEvery === 0) note(hz / (score.register / 2) * 2 ** (pitch / 12), next, step % 4 === 3 ? .11 : .14, step % 2 ? .24 : -.24);
      if (step % 8 === 5) note(hz / score.register * 2 ** ((pitch + 7) / 12), next + .22, .052, -.33);
      next += score.pace; step += 1;
    }
  };
  schedule();
  const timer = window.setInterval(schedule, 100);
  return {
    setVolume(value) { if (!stopped) master.gain.setTargetAtTime(value, ctx.currentTime, 0.15); },
    async stop() {
      if (stopped) return;
      stopped = true; window.clearInterval(timer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      await new Promise(resolve => window.setTimeout(resolve, 350));
      [lfo, ...padVoices].forEach(o => { try { o.stop(); } catch { /* ended */ } });
      active.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } });
      if (ctx.state !== 'closed') await ctx.close();
    },
  };
}