import { goalPresets } from './focus';
import type { Language } from './translations';
import type { RelationshipGoal } from './reminder-preferences';
const actions: Record<Language, readonly string[]> = {
 ja: ['今日一緒に進める作業を一つ選び、担当と期限を短く確認してみませんか。', 'お互いがうれしいと感じる時間の過ごし方を一つずつ聞いて、無理のない約束を選んでみませんか。', '家の中で助かったことを一つ伝え、負担になっている役割を一緒に見直してみませんか。', '今日は休める時間や疲れたときの接し方を聞き合い、互いに無理のない小さな休憩を選んでみませんか。', '一緒に使うお金の上限と優先したいことを先に話し、納得してから選んでみませんか。', '今試したいことを一つずつ共有し、相手にどんな応援を望むか短く伝えてみませんか。'],
 en: ['Choose one shared task and confirm roles and a deadline.', 'Ask what time together each person enjoys and choose a comfortable plan.', 'Name one helpful contribution at home and review a burdensome role together.', 'Ask about rest time and preferred support when tired; choose a gentle break together.', 'Agree on a shared spending limit and priorities before deciding.', 'Share one thing each wants to try and what support would help.'],
 'zh-CN': ['选一件共同任务，先确认分工与期限。', '互相询问喜欢怎样共度时光，选一个轻松的约定。', '说一件家里值得感谢的事，一起调整负担过重的分工。', '互相询问休息时间与疲惫时希望怎样被照顾，选一次轻松休息。', '先商量共同支出的上限和优先事项，再一起决定。', '各说一件想尝试的事，以及希望对方怎样支持。'],
 'zh-TW': ['選一件共同任務，先確認分工與期限。', '互相詢問喜歡怎樣共度時光，選一個輕鬆的約定。', '說一件家裡值得感謝的事，一起調整負擔過重的分工。', '互相詢問休息時間與疲憊時希望怎樣被照顧，選一次輕鬆休息。', '先商量共同支出的上限和優先事項，再一起決定。', '各說一件想嘗試的事，以及希望對方怎樣支持。'],
 ko: ['함께 할 일 하나를 고르고 역할과 기한을 확인해보세요.', '함께 보내고 싶은 시간을 서로 묻고 편안한 약속을 골라보세요.', '집에서 고마웠던 일 하나를 전하고 부담스러운 역할을 함께 조정해보세요.', '쉴 시간과 피곤할 때 원하는 배려를 서로 묻고 작은 휴식을 골라보세요.', '함께 쓸 돈의 한도와 우선순위를 먼저 합의해보세요.', '시도하고 싶은 일 하나씩과 원하는 응원을 나눠보세요.'],
 es: ['Elegid una tarea común y acordad funciones y plazo.', 'Preguntad qué tiempo juntos disfruta cada uno y elegid un plan cómodo.', 'Agradeced una ayuda en casa y revisad juntos una carga excesiva.', 'Preguntad cuándo podéis descansar y qué apoyo preferís al estar cansados; elegid una pausa suave.', 'Acordad el límite de gasto compartido y las prioridades antes de elegir.', 'Compartid algo que queráis probar y qué apoyo os ayudaría.'],
 fr: ['Choisissez une tâche commune et précisez rôles et délai.', 'Demandez quel moment ensemble plaît à chacun et choisissez un projet confortable.', 'Remerciez pour une aide à la maison et revoyez ensemble une charge lourde.', 'Demandez quels temps de repos et soutiens chacun préfère lorsqu’il est fatigué ; choisissez une petite pause.', 'Convenez d’une limite de dépenses communes et des priorités avant de choisir.', 'Partagez une envie d’essai et le soutien souhaité.'],
};
export function relationshipGoalAction(goal: RelationshipGoal, language: Language): string {
 const index = goalPresets.findIndex(p => p === goal.goalPreset);
 return actions[language][index] ?? '';
}
