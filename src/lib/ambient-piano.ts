// Gesture-started Web Audio instrument. Frequencies are artistic tunings, not treatments.
export type AmbientPiano = { stop: () => Promise<void>; setVolume: (value: number) => void };
export const pianoTones = [174, 285, 396, 417, 528, 639, 741, 852, 963] as const;

// Each tuning is an original composition, not a therapeutic frequency claim.
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
  const wet = ctx.createGain(); wet.gain.value = 0.18;
  reverb.connect(wet).connect(master);
  const delay = ctx.createDelay(2); delay.delayTime.value = 0.72;
  const echo = ctx.createGain(); echo.gain.value = 0.13;
  delay.connect(echo).connect(reverb);
  const active = new Set<OscillatorNode>();
  const note = (frequency: number, at: number, strength: number, pan: number) => {
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(strength, at + 0.009);
    envelope.gain.exponentialRampToValueAtTime(strength * .42, at + .18);
    envelope.gain.exponentialRampToValueAtTime(0.001, at + 5.2);
    const stereo = ctx.createStereoPanner(); stereo.pan.value = pan;
    envelope.connect(stereo); stereo.connect(dry); stereo.connect(reverb); stereo.connect(delay);
    const partials = [1, 0.22, 0.08, 0.025];
    let remaining = partials.length;
    partials.forEach((weight, index) => {
      const oscillator = ctx.createOscillator(); oscillator.type = 'sine';
      oscillator.frequency.value = frequency * (index + 1) * (1 + index * index * 0.00012);
      const partial = ctx.createGain(); partial.gain.value = weight;
      oscillator.connect(partial).connect(envelope);
      active.add(oscillator);
      oscillator.onended = () => {
        active.delete(oscillator); oscillator.disconnect(); partial.disconnect();
        remaining -= 1;
        if (remaining === 0) { envelope.disconnect(); stereo.disconnect(); }
      };
      oscillator.start(at); oscillator.stop(at + 5.3);
    });
  };
  const score = scores[hz] ?? scores[528];
  if (!score) throw new Error("Piano score unavailable");
  let step = 0;
  let next = ctx.currentTime + 0.06;
  let stopped = false;
  const schedule = () => {
    if (stopped || ctx.state !== 'running') return;
    // Schedule against the audio clock, not callback arrival time.
    if (next < ctx.currentTime) next = ctx.currentTime + 0.04;
    while (next < ctx.currentTime + 0.4) {
      const chord = score.chords[Math.floor(step / 8) % score.chords.length];
      if (chord && step % 4 === 0) chord.forEach((semitone, i) => note(hz / score.register * 2 ** (semitone / 12), next + i * 0.09, 0.095, (i - 1.5) * 0.28));
      const pitch = score.melody[step % score.melody.length] ?? 0;
      note(hz / (score.register / 2) * 2 ** (pitch / 12), next, step % 4 === 3 ? .11 : .14, step % 2 ? .24 : -.24);
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
      active.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } });
      if (ctx.state !== 'closed') await ctx.close();
    },
  };
}