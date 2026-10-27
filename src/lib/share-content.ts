import type { Language } from './translations';
import type { Plan } from './design-modes';
import { canUseToday, type TodayFeature } from './plans';

export type ShareSection = { id: string; title: string; text: string; feature?: TodayFeature };
export const APP_SHARE_URL = 'https://cosmic-beginnings-onboard.lovable.app';
type ShareUi = { select: string; all: string; text: string; copy: string; copied: string; empty: string; daily: string; app: string; tagline: string; previous: string; next: string };
export const shareUi: Record<Language, ShareUi> = {
  ja: { select: 'シェアする内容', all: 'すべて選択', text: '全文を保存', copy: '文章をコピー', copied: '文章をコピーしました', empty: 'シェアする項目を選んでください', daily: '今日の占いをシェア', app: 'アプリ紹介', tagline: '自分を知り、今日を整える。', previous: '前のカード', next: '次のカード' },
  en: { select: 'Content to share', all: 'Select all', text: 'Save full text', copy: 'Copy text', copied: 'Text copied', empty: 'Select content to share', daily: "Share today's guide", app: 'Introduce the app', tagline: 'Know yourself, shape today.', previous: 'Previous card', next: 'Next card' },
  'zh-CN': { select: '分享内容', all: '全选', text: '保存全文', copy: '复制文字', copied: '文字已复制', empty: '请选择分享项目', daily: '分享今日运势', app: '介绍应用', tagline: '认识自己，调整今天。', previous: '上一张', next: '下一张' },
  'zh-TW': { select: '分享內容', all: '全選', text: '儲存全文', copy: '複製文字', copied: '文字已複製', empty: '請選擇分享項目', daily: '分享今日運勢', app: '介紹應用程式', tagline: '認識自己，調整今天。', previous: '上一張', next: '下一張' },
  ko: { select: '공유할 내용', all: '전체 선택', text: '전체 글 저장', copy: '글 복사', copied: '복사했습니다', empty: '공유할 항목을 선택하세요', daily: '오늘의 운세 공유', app: '앱 소개', tagline: '나를 알고 오늘을 정돈하다.', previous: '이전 카드', next: '다음 카드' },
  es: { select: 'Contenido para compartir', all: 'Seleccionar todo', text: 'Guardar texto completo', copy: 'Copiar texto', copied: 'Texto copiado', empty: 'Selecciona contenido', daily: 'Compartir la guía de hoy', app: 'Presentar la aplicación', tagline: 'Conócete y orienta tu día.', previous: 'Tarjeta anterior', next: 'Tarjeta siguiente' },
  fr: { select: 'Contenu à partager', all: 'Tout sélectionner', text: 'Enregistrer le texte intégral', copy: 'Copier le texte', copied: 'Texte copié', empty: 'Sélectionnez du contenu', daily: 'Partager le guide du jour', app: 'Présenter l’application', tagline: 'Se connaître et orienter sa journée.', previous: 'Carte précédente', next: 'Carte suivante' },
};

export function unlockedShareSections(plan: Plan, sections: ShareSection[]): ShareSection[] {
  const features: TodayFeature[] = ['decision', 'starPath', 'dailyLucky', 'direction', 'helio', 'shopping', 'health', 'monthlyLucky', 'directionExtended', 'relations', 'biorhythm365', 'familyRoadmap'];
  return sections.filter(s => s.text.trim() && (s.id === 'message' || (features.includes((s.feature ?? s.id) as TodayFeature) && canUseToday(plan, (s.feature ?? s.id) as TodayFeature))));
}

export function privateShareText(text: string, names: string[], includeName: boolean): string {
  if (includeName) return text;
  return [...new Set(names)].filter(Boolean).sort((a, b) => b.length - a.length).reduce((result, name, i) => result.split(name).join(`(${i + 1})`), text);
}

export function shareText(data: { title: string; names: string[]; lines: string[]; caution?: string | undefined; url?: string; sections?: ShareSection[] }, selected?: string[], includeName = false): string {
  const content = data.sections ? data.sections.filter(s => !selected || selected.includes(s.id)).map(s => `${s.title}\n${s.text}`) : data.lines;
  return privateShareText([data.title, ...(includeName ? data.names : []), ...content, data.caution, data.url].filter(Boolean).join('\n\n'), data.names, includeName);
}

/** Read all already-rendered details, including collapsed panels, without opening them or generating readings. */
export function readingElementText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll('.feature-notify, button, svg, [data-share-exclude], [data-locked="true"], [aria-hidden="true"], [role="status"]').forEach(node => node.remove());
  const walk = (node: Node): string => {
    if (node.nodeType === 3) return node.textContent ?? '';
    const content = Array.from(node.childNodes).map(walk).join('');
    return node instanceof Element && /^(P|DIV|LI|H[1-6]|SUMMARY|SECTION|ARTICLE|BR|DT|DD)$/.test(node.tagName) ? `\n${content}\n` : content;
  };
  return walk(clone).replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}