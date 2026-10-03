// Gesture-started Web Audio instrument. Frequencies are artistic tunings, not treatments.
export type AmbientPiano = { stop: () => Promise<void>; setVolume: (value: number) => void };

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
    envelope.gain.linearRampToValueAtTime(strength, at + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.001, at + 4.5);
    const stereo = ctx.createStereoPanner(); stereo.pan.value = pan;
    envelope.connect(stereo); stereo.connect(dry); stereo.connect(reverb); stereo.connect(delay);
    const partials = [1, 0.27, 0.1, 0.04];
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
      oscillator.start(at); oscillator.stop(at + 4.6);
    });
  };
  const chords = [[0, 4, 7, 11], [-3, 0, 4, 7], [-5, 0, 2, 7], [-7, -3, 0, 4]];
  const melody = [12, 7, 4, 11, 7, 2, 4, 0];
  let step = 0;
  let next = ctx.currentTime + 0.06;
  let stopped = false;
  const schedule = () => {
    if (stopped || ctx.state !== 'running') return;
    // Schedule against the audio clock, not callback arrival time.
    if (next < ctx.currentTime) next = ctx.currentTime + 0.04;
    while (next < ctx.currentTime + 0.4) {
      const chord = chords[Math.floor(step / 8) % chords.length] ?? chords[0];
      if (chord && step % 4 === 0) chord.forEach((semitone, i) => note(hz / 4 * 2 ** (semitone / 12), next + i * 0.07, 0.1, (i - 1.5) * 0.3));
      note(hz / 2 * 2 ** ((melody[step % melody.length] ?? 0) / 12), next, 0.16, step % 2 ? 0.3 : -0.3);
      next += 0.9; step += 1;
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