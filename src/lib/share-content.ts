import type { Language } from './translations';
import type { Plan } from './design-modes';
import { canUseToday, type TodayFeature } from './plans';

export type ShareSection = { id: string; title: string; text: string; feature?: TodayFeature; locked?: boolean };
export const APP_SHARE_URL = 'https://cosmic-beginnings-onboard.lovable.app';
type ShareUi = { scopeAll: string; scopeSelect: string; saveImage: string; sns: string; copyLink: string; linkCopied: string; locked: string; snsNote: string; select: string; all: string; text: string; copy: string; copied: string; empty: string; daily: string; app: string; tagline: string; previous: string; next: string };
export const shareUi: Record<Language, ShareUi> = {
  ja: { scopeAll: '全項目まとめてシェア', scopeSelect: '選択してシェア', saveImage: '画面保存', sns: 'SNSシェア', copyLink: 'シェアリンクをコピー', linkCopied: 'リンクをコピーしました', locked: '現在のプランでは未解放', snsNote: 'Instagram・TikTokは端末の共有画面を開きます。未対応の端末では画像を保存してから各アプリで選んでください。', select: 'シェアする内容', all: 'すべて選択', text: '全文を保存', copy: '文章をコピー', copied: '文章をコピーしました', empty: 'シェアする項目を選んでください', daily: '今日の占いをシェア', app: 'アプリ紹介', tagline: '自分を知り、今日を整える。', previous: '前のカード', next: '次のカード' },
  en: { scopeAll: 'Share everything', scopeSelect: 'Choose items', saveImage: 'Save image', sns: 'Share to social', copyLink: 'Copy share link', linkCopied: 'Link copied', locked: 'Not unlocked on your plan', snsNote: 'Instagram and TikTok open your device share sheet. If unsupported, save the image and pick it in the app.', select: 'Content to share', all: 'Select all', text: 'Save full text', copy: 'Copy text', copied: 'Text copied', empty: 'Select content to share', daily: "Share today's guide", app: 'Introduce the app', tagline: 'Know yourself, shape today.', previous: 'Previous card', next: 'Next card' },
  'zh-CN': { scopeAll: '全部一起分享', scopeSelect: '选择后分享', saveImage: '保存图片', sns: '社交分享', copyLink: '复制分享链接', linkCopied: '链接已复制', locked: '当前方案未解锁', snsNote: 'Instagram、TikTok 将打开设备分享菜单；不支持时请先保存图片。', select: '分享内容', all: '全选', text: '保存全文', copy: '复制文字', copied: '文字已复制', empty: '请选择分享项目', daily: '分享今日运势', app: '介绍应用', tagline: '认识自己，调整今天。', previous: '上一张', next: '下一张' },
  'zh-TW': { scopeAll: '全部一起分享', scopeSelect: '選擇後分享', saveImage: '儲存圖片', sns: '社群分享', copyLink: '複製分享連結', linkCopied: '連結已複製', locked: '目前方案未解鎖', snsNote: 'Instagram、TikTok 會開啟裝置分享選單；不支援時請先儲存圖片。', select: '分享內容', all: '全選', text: '儲存全文', copy: '複製文字', copied: '文字已複製', empty: '請選擇分享項目', daily: '分享今日運勢', app: '介紹應用程式', tagline: '認識自己，調整今天。', previous: '上一張', next: '下一張' },
  ko: { scopeAll: '전체 한꺼번에 공유', scopeSelect: '선택해서 공유', saveImage: '이미지 저장', sns: 'SNS 공유', copyLink: '공유 링크 복사', linkCopied: '링크를 복사했습니다', locked: '현재 플랜에서 미해제', snsNote: 'Instagram·TikTok은 기기 공유 메뉴를 엽니다. 지원되지 않으면 이미지를 저장해 주세요.', select: '공유할 내용', all: '전체 선택', text: '전체 글 저장', copy: '글 복사', copied: '복사했습니다', empty: '공유할 항목을 선택하세요', daily: '오늘의 운세 공유', app: '앱 소개', tagline: '나를 알고 오늘을 정돈하다.', previous: '이전 카드', next: '다음 카드' },
  es: { scopeAll: 'Compartir todo', scopeSelect: 'Elegir elementos', saveImage: 'Guardar imagen', sns: 'Redes sociales', copyLink: 'Copiar enlace', linkCopied: 'Enlace copiado', locked: 'No disponible en tu plan', snsNote: 'Instagram y TikTok abren el menú de compartir; si no es compatible, guarda la imagen.', select: 'Contenido para compartir', all: 'Seleccionar todo', text: 'Guardar texto completo', copy: 'Copiar texto', copied: 'Texto copiado', empty: 'Selecciona contenido', daily: 'Compartir la guía de hoy', app: 'Presentar la aplicación', tagline: 'Conócete y orienta tu día.', previous: 'Tarjeta anterior', next: 'Tarjeta siguiente' },
  fr: { scopeAll: 'Tout partager', scopeSelect: 'Choisir les éléments', saveImage: 'Enregistrer l’image', sns: 'Réseaux sociaux', copyLink: 'Copier le lien', linkCopied: 'Lien copié', locked: 'Non débloqué avec votre offre', snsNote: 'Instagram et TikTok ouvrent le menu de partage ; sinon, enregistrez l’image.', select: 'Contenu à partager', all: 'Tout sélectionner', text: 'Enregistrer le texte intégral', copy: 'Copier le texte', copied: 'Texte copié', empty: 'Sélectionnez du contenu', daily: 'Partager le guide du jour', app: 'Présenter l’application', tagline: 'Se connaître et orienter sa journée.', previous: 'Carte précédente', next: 'Carte suivante' },
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

/** Every share surface offers its content as selectable items: explicit sections, else one item per line or paragraph. */
export function shareSectionsOf(data: { lines: string[]; sections?: ShareSection[] | undefined }): ShareSection[] {
  if (data.sections) return data.sections;
  const parts = data.lines.length > 1 ? data.lines : (data.lines[0] ?? '').split(/\n{2,}/);
  return parts.map(t => t.trim()).filter(Boolean).map((text, i) => ({ id: `item-${i}`, title: '', text }));
}

/** Add locked placeholders for gated items the plan cannot share; they render disabled. */
export function withLockedSections(unlocked: ShareSection[], gated: { id: string; title: string; open: boolean }[]): ShareSection[] {
  const ids = new Set(unlocked.map(s => s.feature ?? s.id));
  return [...unlocked, ...gated.filter(g => !g.open && !ids.has(g.id)).map(g => ({ id: g.id, title: g.title, text: '', locked: true }))];
}

/** Pack whole wrapped blocks onto pages; short blocks share a page, only oversize blocks split. Nothing is dropped. */
export function packShareLines(blocks: string[][], perPage: number): string[][] {
  const pages: string[][] = [];
  let page: string[] = [];
  for (const block of blocks.filter(b => b.length)) {
    const need = (page.length ? 1 : 0) + block.length;
    if (page.length && page.length + need > perPage) { pages.push(page); page = []; }
    const rest = [...(page.length ? [''] : []), ...block];
    for (const line of rest) {
      if (page.length >= perPage) { pages.push(page); page = []; if (line === '') continue; }
      page.push(line);
    }
  }
  if (page.length) pages.push(page);
  return pages.length ? pages : [[]];
}

export type SnsTarget = 'instagram' | 'tiktok' | 'x' | 'line';
/** Text-link intents only; never place private reading prose or names in a URL. */
export function snsIntentUrl(target: 'x' | 'line', url: string, hashtags: string): string {
  return target === 'x' ? `https://x.com/intent/post?text=${encodeURIComponent(hashtags)}&url=${encodeURIComponent(url)}` : `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
}
