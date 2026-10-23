import type { Language } from './translations';
export const reminderUiCopy: Record<Language, { goal: string; free: string; independent: string; daily: string }> = {
 ja: { goal: '目的', free: 'フリー', independent: 'この対人ガイド専用の目的・目標', daily: '毎日通知設定' },
 en: { goal: 'Goal', free: 'Open', independent: 'Goal for this relationship guide', daily: 'Daily reminder settings' },
 'zh-CN': { goal: '目的', free: '自由', independent: '此人际指南的独立目标', daily: '每日提醒设置' },
 'zh-TW': { goal: '目的', free: '自由', independent: '此人際指南的獨立目標', daily: '每日提醒設定' },
 ko: { goal: '목표', free: '자유', independent: '이 관계 가이드만의 목표', daily: '매일 알림 설정' },
 es: { goal: 'Objetivo', free: 'Libre', independent: 'Objetivo propio de esta guía interpersonal', daily: 'Avisos diarios' },
 fr: { goal: 'Objectif', free: 'Libre', independent: 'Objectif propre à ce guide relationnel', daily: 'Rappels quotidiens' },
};
