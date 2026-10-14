import { afterEach, describe, expect, it, vi } from 'vitest';
import { narrationChunks, narrationParameters, selectNarrationVoice, startNarration } from './browser-narration';
const voice = (name: string, lang = 'ja-JP') => ({ name, lang, default: false, localService: true });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('Comfortable browser narration', () => {
  it('prioritizes natural matching voices', () => {
    const voices = [voice('Default'), voice('Kyoko'), voice('Google 日本語'), voice('Microsoft Nanami Online (Natural)'), voice('Premium', 'en-US')];
    expect(selectNarrationVoice(voices, 'ja-JP')?.name).toContain('Nanami');
    expect(selectNarrationVoice(voices.slice(0, 3), 'ja-JP')?.name).toBe('Google 日本語');
    expect(selectNarrationVoice([voice('Kyoko')], 'ja-JP')?.name).toBe('Kyoko');
    expect(selectNarrationVoice([voice('English', 'en-US')], 'ja-JP')).toBeUndefined();
    expect(selectNarrationVoice([voice('Chinese', 'zh-CN'), voice('Taiwan', 'zh-TW')], 'zh-TW')?.name).toBe('Taiwan');
  });
  it('cleans markup and adds punctuation pauses', () => {
    const chunks = narrationChunks('## アゴルメンの羅針盤。実はね、ひと息。\n[好きな色](https://example.test)と528Hz。', 'ja');
    expect(chunks.map(chunk => chunk.text).join('')).toBe('あごるめんの羅針盤。実はね、ひと息。好きな色とごひゃくにじゅうはちヘルツ。');
    expect(chunks[0]?.pause).toBe(260); expect(chunks[1]?.pause).toBe(100);
    expect(narrationParameters).toEqual({ rate: 0.95, pitch: 1.05, volume: 1 });
  });
  it('waits for voices and cancels pauses without further speech', () => {
    vi.useFakeTimers();
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
    const events = new EventTarget(); const spoken: SpeechSynthesisUtterance[] = [];
    let available: SpeechSynthesisVoice[] = [];
    const synth = { getVoices: () => available, speak: (u: SpeechSynthesisUtterance) => spoken.push(u), cancel: vi.fn(), addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events) } as unknown as SpeechSynthesis;
    const finish = vi.fn(); const fail = vi.fn();
    const cancel = startNarration('こんにちは、明日も。', 'ja', finish, fail, synth);
    expect(spoken).toHaveLength(0);
    available = [voice('Google 日本語') as SpeechSynthesisVoice]; events.dispatchEvent(new Event('voiceschanged'));
    expect(spoken[0]?.voice?.name).toBe('Google 日本語'); expect(spoken[0]?.rate).toBe(0.95);
    spoken[0]?.onend?.({} as SpeechSynthesisEvent);
    vi.advanceTimersByTime(99); expect(spoken).toHaveLength(1);
    vi.advanceTimersByTime(1); expect(spoken).toHaveLength(2);
    spoken[1]?.onend?.({} as SpeechSynthesisEvent); cancel(); vi.runAllTimers();
    expect(finish).not.toHaveBeenCalled(); expect(fail).not.toHaveBeenCalled(); expect(synth.cancel).toHaveBeenCalledOnce();
  });
  it('handles speech errors without replay', () => {
    vi.useFakeTimers(); vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
    const spoken: SpeechSynthesisUtterance[] = [];
    const synth = { getVoices: () => [], speak: (u: SpeechSynthesisUtterance) => spoken.push(u), cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as SpeechSynthesis;
    const finish = vi.fn(); const fail = vi.fn();
    startNarration('One.', 'en', finish, fail, synth); vi.advanceTimersByTime(1200);
    spoken[0]?.onend?.({} as SpeechSynthesisEvent); vi.runAllTimers(); expect(finish).toHaveBeenCalledOnce();
    startNarration('Two.', 'en', finish, fail, synth); vi.advanceTimersByTime(1200);
    spoken[1]?.onerror?.({} as SpeechSynthesisErrorEvent); vi.runAllTimers(); expect(fail).toHaveBeenCalledOnce(); expect(spoken).toHaveLength(2);
  });
});
