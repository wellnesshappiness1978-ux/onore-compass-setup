import type { Language } from './translations';

export const narrationLocale: Record<Language, string> = { ja: 'ja-JP', en: 'en-US', 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', ko: 'ko-KR', es: 'es-ES', fr: 'fr-FR' };
export const narrationParameters = { rate: 0.95, pitch: 1.05, volume: 1 } as const;

type Voice = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'default' | 'localService'>;
export function selectNarrationVoice<T extends Voice>(voices: T[], locale: string): T | undefined {
  const language = (locale.split('-')[0] ?? locale).toLowerCase();
  const rank = (voice: T) => {
    const name = voice.name.toLowerCase();
    return (voice.lang.toLowerCase() === locale.toLowerCase() ? 100 : 0)
      + (/nanami.*(natural|online)|(natural|online).*nanami/.test(name) ? 60 : /google.*(日本語|japanese)|nanami/.test(name) ? 50 : /kyoko|きょうこ/.test(name) ? 40 : /natural|premium|enhanced|高品質/.test(name) ? 30 : 0)
      + (voice.default ? 5 : 0);
  };
  return voices.filter(voice => voice.lang.toLowerCase().split('-')[0] === language).sort((a, b) => rank(b) - rank(a))[0];
}

export function narrationChunks(text: string, language: Language): { text: string; pause: number }[] {
  let clean = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/https?:\/\/\S+/g, '').replace(/[#*`_]/g, '').replace(/\r\n/g, '\n');
  if (language === 'ja') clean = clean.replace(/アゴルメン/g, 'あごるめん').replace(/528\s*Hz/gi, 'ごひゃくにじゅうはちヘルツ');
  return (clean.match(/[^、，,。！？!?\n]+[、，,。！？!?\n]*/g) ?? []).map(part => ({ text: part.trim(), pause: /[。！？!?\n]/.test(part) ? 260 : /[、，,]/.test(part) ? 100 : 0 })).filter(part => part.text.length > 0);
}

/** All browser work starts only after a user gesture; cancellation also clears pending pauses. */
export function startNarration(text: string, language: Language, onFinish: () => void, onError: () => void, synth: SpeechSynthesis = window.speechSynthesis): () => void {
  let active = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let waiting = false;
  const parts = narrationChunks(text, language);
  const locale = narrationLocale[language];
  let voice: SpeechSynthesisVoice | undefined;
  const clear = () => { if (timer !== undefined) clearTimeout(timer); synth.removeEventListener('voiceschanged', begin); };
  const finish = () => { if (!active) return; active = false; clear(); onFinish(); };
  const speak = (index: number) => {
    if (!active) return;
    const part = parts[index];
    if (!part) { finish(); return; }
    const utterance = new SpeechSynthesisUtterance(part.text);
    utterance.lang = locale;
    if (voice) utterance.voice = voice;
    Object.assign(utterance, narrationParameters);
    utterance.onend = () => { if (active) timer = setTimeout(() => speak(index + 1), part.pause); };
    utterance.onerror = () => { if (!active) return; active = false; clear(); synth.cancel(); onError(); };
    synth.speak(utterance);
  };
  function begin() {
    if (!active) return;
    const voices = synth.getVoices();
    if (waiting && voices.length === 0) return;
    clear(); waiting = false;
    voice = selectNarrationVoice(voices, locale);
    speak(0);
  }
  if (synth.getVoices().length > 0) begin();
  else {
    waiting = true;
    synth.addEventListener('voiceschanged', begin);
    timer = setTimeout(() => { waiting = false; begin(); }, 1200);
  }
  return () => { active = false; clear(); synth.cancel(); };
}