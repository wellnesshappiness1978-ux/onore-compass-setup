import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAmbientPiano, type AmbientPiano } from "@/lib/ambient-piano";
import type { Language } from "@/lib/translations";

export default function ConsultationVoice({ text, language }: { text: string; language: Language }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audio = useRef<AmbientPiano | null>(null);
  const generation = useRef(0);
  const stop = () => {
    generation.current += 1;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    const current = audio.current; audio.current = null; void current?.stop(); setPlaying(false);
    window.dispatchEvent(new Event("onore-voice-end"));
  };
  useEffect(() => () => { generation.current += 1; if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); void audio.current?.stop(); window.dispatchEvent(new Event("onore-voice-end")); }, [text, language]);
  const start = async () => {
    if (playing) { stop(); return; }
    if (!("speechSynthesis" in window) || !("AudioContext" in window)) { setError(true); return; }
    stop(); setError(false);
    const id = generation.current;
    try {
      window.dispatchEvent(new Event("onore-voice-start"));
      const piano = await createAmbientPiano(528, 0.055);
      if (generation.current !== id) { void piano.stop(); return; }
      audio.current = piano;
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ""));
      utterance.lang = ({ ja: "ja-JP", en: "en-US", "zh-CN": "zh-CN", "zh-TW": "zh-TW", ko: "ko-KR", es: "es-ES", fr: "fr-FR" } as const)[language];
      const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase() === utterance.lang.toLowerCase());
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9; utterance.pitch = 0.95; utterance.volume = 0.95;
      utterance.onend = stop; utterance.onerror = stop;
      setPlaying(true);
      speechSynthesis.speak(utterance);
    } catch { stop(); setError(true); }
  };
  const copy = { ja: ["朗読を停止", "528Hzピアノと朗読", "この端末では音声再生を利用できません。"], en: ["Stop reading", "Read with 528Hz piano", "Speech playback is unavailable on this device."], "zh-CN": ["停止朗读", "配合528Hz钢琴朗读", "此设备无法播放语音。"], "zh-TW": ["停止朗讀", "搭配528Hz鋼琴朗讀", "此裝置無法播放語音。"], ko: ["낭독 중지", "528Hz 피아노와 낭독", "이 기기에서는 음성 재생을 사용할 수 없습니다."], es: ["Detener lectura", "Leer con piano a 528 Hz", "La reproducción de voz no está disponible en este dispositivo."], fr: ["Arrêter la lecture", "Lire avec piano à 528 Hz", "La lecture vocale n’est pas disponible sur cet appareil."] } as const;
  const label = copy[language][playing ? 0 : 1];
  return <div className="mt-2"><Button type="button" variant="outline" size="sm" onClick={() => void start()} aria-pressed={playing} className="border-primary/30 text-primary">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}{label}</Button>{error && <p role="alert" className="mt-1 text-xs text-muted-foreground">{copy[language][2]}</p>}</div>;
}
