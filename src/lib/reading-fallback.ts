import { useEffect, useState } from 'react';
import type { Language } from './translations';

export type FallbackKey = 'manualCore' | 'manualDecision' | 'manualTiming' | 'axisSummary';
type Copy = Record<FallbackKey, string> & { note: string };

/** Static sample prose shown when a personal reading is missing, slow or failed. Never cached as a real reading. */
export const readingFallback: Record<Language, Copy> = {
  ja: { note: 'サンプル表示です。通信が回復すると、あなた専用の診断文に自動で切り替わります。', manualCore: '強みは、物事の本質を静かに見抜く洞察力です。注意点は、考えを内側に抱え込みやすいこと。幸せになる行動は、感じたことを一日一つ言葉にして信頼できる人へ伝えることです。', manualDecision: '決断では慎重さが強みになります。注意点は、完璧な答えを待つうちに機会を逃すこと。幸せになる行動は、選択肢を二つに絞り、期限を決めて選ぶことです。', manualTiming: '攻め時は、心身が整い周囲の協力が得られる朝の時間帯です。守り時は、疲れを感じた夕方以降。幸せになる行動は、大切な連絡や挑戦を午前中にまとめることです。', axisSummary: 'このグループの強みは、互いの違いを補い合える多様性です。注意点は、意見を言わずに合わせ過ぎること。幸せになる行動は、週に一度それぞれの希望を一言ずつ共有することです。' },
  en: { note: 'Sample view. Your personal reading replaces it automatically once the connection recovers.', manualCore: 'Your strength is quietly seeing the essence of things. Watch out for keeping thoughts to yourself. To be happy, put one feeling into words each day and share it with someone you trust.', manualDecision: 'Care is your strength when deciding. Watch out for missing chances while waiting for a perfect answer. To be happy, narrow choices to two and decide by a set deadline.', manualTiming: 'Move forward in the morning, when you feel settled and others can help. Hold back in the evening when tired. To be happy, group important messages and challenges before noon.', axisSummary: 'This group\'s strength is diversity that lets members cover for each other. Watch out for agreeing too readily without speaking up. To be happy, share one wish each once a week.' },
  'zh-CN': { note: '示例显示。网络恢复后会自动切换为您的专属解读。', manualCore: '您的优势是安静地看透事物本质的洞察力。需注意容易把想法藏在心里。让自己幸福的行动：每天把一个感受说给信任的人听。', manualDecision: '做决定时，谨慎是您的优势。需注意等待完美答案而错过机会。让自己幸福的行动：把选项缩小到两个，并在期限内决定。', manualTiming: '进攻时机是身心安定、能获得协助的上午。防守时机是感到疲惫的傍晚以后。让自己幸福的行动：把重要联络与挑战集中在上午。', axisSummary: '这个群体的优势是能互相弥补的多样性。需注意不表达意见而过度迁就。让彼此幸福的行动：每周各自分享一句心愿。' },
  'zh-TW': { note: '範例顯示。網路恢復後會自動切換為您的專屬解讀。', manualCore: '您的優勢是安靜看透事物本質的洞察力。需注意容易把想法藏在心裡。讓自己幸福的行動：每天把一個感受說給信任的人聽。', manualDecision: '做決定時，謹慎是您的優勢。需注意等待完美答案而錯過機會。讓自己幸福的行動：把選項縮小到兩個，並在期限內決定。', manualTiming: '進攻時機是身心安定、能獲得協助的上午。防守時機是感到疲憊的傍晚以後。讓自己幸福的行動：把重要聯絡與挑戰集中在上午。', axisSummary: '這個群體的優勢是能互相彌補的多樣性。需注意不表達意見而過度遷就。讓彼此幸福的行動：每週各自分享一句心願。' },
  ko: { note: '샘플 표시입니다. 연결이 회복되면 나만의 진단문으로 자동 전환됩니다.', manualCore: '강점은 사물의 본질을 조용히 꿰뚫는 통찰력입니다. 주의할 점은 생각을 혼자 품기 쉽다는 것. 행복해지는 행동은 하루 한 가지 느낌을 믿는 사람에게 말로 전하는 것입니다.', manualDecision: '결정할 때는 신중함이 강점입니다. 주의할 점은 완벽한 답을 기다리다 기회를 놓치는 것. 행복해지는 행동은 선택지를 둘로 좁히고 기한을 정해 고르는 것입니다.', manualTiming: '공세의 때는 몸과 마음이 안정되고 도움을 받을 수 있는 오전입니다. 수비의 때는 피곤함을 느끼는 저녁 이후. 행복해지는 행동은 중요한 연락과 도전을 오전에 모으는 것입니다.', axisSummary: '이 그룹의 강점은 서로 보완하는 다양성입니다. 주의할 점은 의견을 말하지 않고 지나치게 맞추는 것. 행복해지는 행동은 일주일에 한 번 각자의 바람을 한마디씩 나누는 것입니다.' },
  es: { note: 'Vista de ejemplo. Tu lectura personal la reemplaza automáticamente cuando vuelve la conexión.', manualCore: 'Tu fortaleza es ver en silencio la esencia de las cosas. Cuidado con guardarte lo que piensas. Para ser feliz, pon en palabras un sentimiento al día y compártelo con alguien de confianza.', manualDecision: 'Al decidir, la prudencia es tu fortaleza. Cuidado con perder oportunidades esperando la respuesta perfecta. Para ser feliz, reduce las opciones a dos y decide con una fecha límite.', manualTiming: 'Avanza por la mañana, cuando estás en calma y otros pueden ayudarte. Frena por la tarde-noche si te sientes cansado. Para ser feliz, agrupa mensajes y retos importantes antes del mediodía.', axisSummary: 'La fortaleza de este grupo es una diversidad que permite apoyarse mutuamente. Cuidado con ceder sin expresar opiniones. Para ser felices, compartan un deseo cada uno una vez por semana.' },
  fr: { note: 'Aperçu d\'exemple. Votre lecture personnelle le remplace automatiquement dès le retour de la connexion.', manualCore: 'Votre force est de percevoir calmement l\'essentiel. Attention à garder vos pensées pour vous. Pour être heureux, mettez chaque jour un ressenti en mots et partagez-le avec une personne de confiance.', manualDecision: 'Pour décider, la prudence est votre force. Attention à manquer des occasions en attendant la réponse parfaite. Pour être heureux, réduisez les choix à deux et décidez avant une échéance.', manualTiming: 'Avancez le matin, quand vous êtes posé et soutenu. Ralentissez le soir si la fatigue vient. Pour être heureux, regroupez messages et défis importants avant midi.', axisSummary: 'La force de ce groupe est une diversité qui permet de se compléter. Attention à trop s\'aligner sans s\'exprimer. Pour être heureux, partagez chacun un souhait une fois par semaine.' },
};

/** True once a request has failed or stayed pending longer than `ms`, so the UI can show sample prose instead of stalling. */
export function useReadingFallback(pending: boolean, failed: boolean, ms = 12000): boolean {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!pending) { setSlow(false); return; }
    const id = window.setTimeout(() => setSlow(true), ms);
    return () => window.clearTimeout(id);
  }, [pending, ms]);
  return failed || slow;
}
