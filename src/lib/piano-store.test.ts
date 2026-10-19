import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const audio = vi.hoisted(() => ({ stop: vi.fn(async () => {}), setVolume: vi.fn() }));
vi.mock('./ambient-piano', async importOriginal => ({
  ...await importOriginal<typeof import('./ambient-piano')>(),
  createAmbientPiano: vi.fn(async () => audio),
}));
import { getPianoState, playPiano, setPianoVolume, stopPiano } from './piano-store';

describe('BGM sample lifecycle', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('window', { setTimeout, clearTimeout }); });
  afterEach(() => { stopPiano(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
  it('keeps the sample playing before 20 seconds, then stops exactly once', async () => {
    const end = vi.fn();
    await playPiano(528, 20, end);
    await vi.advanceTimersByTimeAsync(19999);
    expect(getPianoState().playing).toBe(true);
    expect(end).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(getPianoState().playing).toBe(false);
    expect(end).toHaveBeenCalledTimes(1);
  });
  it('manual stop cancels an outstanding sample callback', async () => {
    const end = vi.fn();
    await playPiano(528, 20, end); stopPiano();
    await vi.advanceTimersByTimeAsync(20000);
    expect(end).not.toHaveBeenCalled();
  });
  it('clamps stored and engine volume together', async () => {
    await playPiano(528); setPianoVolume(8);
    expect(getPianoState().volume).toBe(1);
    expect(audio.setVolume).toHaveBeenLastCalledWith(1);
  });
});