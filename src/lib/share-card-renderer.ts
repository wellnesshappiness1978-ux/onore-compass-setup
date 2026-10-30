import type { Language } from "./translations";
import { packShareLines } from "./share-content";
import logoAsset from "@/assets/agolmen-v10-compass-final.png.asset.json";

const logoUrl = logoAsset.url;

export type ShareCardData = { kicker: string; title: string; score: number; names: string[]; lines: string[]; kind?: "identity" | "compatibility" | "daily" | "biorhythm" | "consultation" | "app"; caution?: string | undefined; keywords?: string[]; palette?: { label: string; code: string }[]; sections?: import('./share-content').ShareSection[]; url?: string; fullContent?: boolean | undefined; pageLabel?: string | undefined; photos?: { src: string; caption: string }[]; photo?: { src: string; caption: string } | undefined };
export type CardFormat = "story" | "x";
export const shareCopy = {
  ja: { cta: "あなたの診断カードをシェア", title: "あなたの本質を、一枚に。", description: "あなたの診断カード", essence: "あなたの本質", bias: "陥りがちな罠・思考バイアス", palette: "バースカラーパレット", roles: ["メイン", "サブ", "金運", "愛情", "健康", "内面"], reference: "自己理解のための参考解釈・参考色", search: "アゴルメンの羅針盤で検索", hashtags: "#アゴルメンの羅針盤 #バースカラー #自己理解", name: "名前を載せる", privacy: "名前・出生情報は初期設定で非表示", save: "画像を保存", share: "端末でシェア", story: "縦型 9:16", x: "横型 16:9", note: "共有先は端末で選択します。Instagram・TikTokへの直接投稿は保証されません。画像共有に未対応の場合は保存し、各アプリで画像を選んでください。Xの投稿画面には画像は自動添付されません。", saved: "画像を保存しました", shared: "端末の共有画面を開きました", error: "画像を作成・共有できませんでした。もう一度お試しください。", loading: "選択した言語の診断カードを作成中…", match: "相性スコア" },
  en: { cta: "Share my insight card", title: "Your essence, in one image.", description: "Personal insight card", essence: "YOUR ESSENCE", bias: "Blind spots & thinking patterns", palette: "BIRTH COLOR PALETTE", roles: ["Main", "Secondary", "Money", "Love", "Health", "Inner"], reference: "Reflective interpretation & illustrative colors", search: "Search: Agolmen's Compass", hashtags: "#AgolmensCompass #BirthColor #SelfUnderstanding", name: "Include my name", privacy: "Name and birth details hidden by default", save: "Save image", share: "Share from device", story: "Portrait 9:16", x: "Landscape 16:9", note: "Choose a destination in your device's share sheet. Direct Instagram or TikTok posting is not guaranteed. If image sharing is unavailable, save and select the image in the app. X links do not attach images automatically.", saved: "Image saved", shared: "Device share sheet opened", error: "Could not create or share the image. Please try again.", loading: "Creating your card in the selected language…", match: "Match score" },
  "zh-TW": { cta: "分享我的洞察診斷卡", title: "將你的本質，凝聚成一張圖。", description: "個人洞察診斷卡", essence: "你的本質", bias: "容易陷入的盲點・思考偏誤", palette: "誕生色調色盤", roles: ["主色", "副色", "財運", "愛情", "健康", "內在"], reference: "供自我理解的參考解讀與參考色", search: "搜尋：阿戈爾曼的羅盤", hashtags: "#阿戈爾曼的羅盤 #誕生色 #自我理解", name: "顯示姓名", privacy: "預設隱藏姓名與出生資料", save: "儲存圖片", share: "裝置分享", story: "直式 9:16", x: "橫式 16:9", note: "請在裝置分享選單選擇目的地，不保證直接發佈至 Instagram 或 TikTok。若不支援圖片分享，請先儲存，再於各應用程式選取圖片。X 發文畫面不會自動附加圖片。", saved: "圖片已儲存", shared: "已開啟装置分享選單", error: "無法製作或分享圖片，請重試。", loading: "正在以所選語言製作診斷卡…", match: "相性分數" },
  "zh-CN": { cta: "分享我的洞察诊断卡", title: "将你的本质凝聚成一张图。", description: "个人洞察诊断卡", essence: "你的本质", bias: "容易陷入的盲点与思维偏差", palette: "出生色调色盘", roles: ["主色", "副色", "财运", "爱情", "健康", "内在"], reference: "用于自我理解的参考解读与色彩", search: "搜索：阿戈尔曼罗盘", hashtags: "#阿戈尔曼罗盘 #出生色 #自我理解", name: "显示姓名", privacy: "默认隐藏姓名与出生信息", save: "保存图片", share: "通过设备分享", story: "竖版 9:16", x: "横版 16:9", note: "请从设备分享菜单选择平台。若无法分享图片，请先保存后在应用中选择。", saved: "图片已保存", shared: "已打开设备分享菜单", error: "无法生成或分享图片，请重试。", loading: "正在用所选语言生成诊断卡…", match: "相性分数" },
  ko: { cta: "나의 진단 카드 공유", title: "당신의 본질을 한 장에.", description: "개인 인사이트 카드", essence: "당신의 본질", bias: "놓치기 쉬운 점과 사고 습관", palette: "탄생색 팔레트", roles: ["메인", "서브", "재물", "사랑", "건강", "내면"], reference: "자기이해를 위한 참고 해석과 색상", search: "아골멘의 나침반 검색", hashtags: "#아골멘의나침반 #탄생색 #자기이해", name: "이름 표시", privacy: "이름과 출생 정보는 기본적으로 숨김", save: "이미지 저장", share: "기기에서 공유", story: "세로 9:16", x: "가로 16:9", note: "기기의 공유 메뉴에서 대상을 선택하세요. 이미지 공유가 안 되면 저장 후 해당 앱에서 선택하세요.", saved: "이미지를 저장했습니다", shared: "기기 공유 메뉴를 열었습니다", error: "이미지를 만들거나 공유하지 못했습니다.", loading: "선택한 언어로 카드를 만드는 중…", match: "궁합 점수" },
  es: { cta: "Compartir mi tarjeta", title: "Tu esencia, en una imagen.", description: "Tarjeta personal", essence: "TU ESENCIA", bias: "Puntos ciegos y hábitos mentales", palette: "PALETA DE NACIMIENTO", roles: ["Principal", "Secundario", "Dinero", "Amor", "Salud", "Interior"], reference: "Interpretación y colores orientativos", search: "Busca Agolmen's Compass", hashtags: "#AgolmensCompass #ColoresDeNacimiento #Autoconocimiento", name: "Incluir mi nombre", privacy: "Nombre y datos de nacimiento ocultos por defecto", save: "Guardar imagen", share: "Compartir desde el dispositivo", story: "Vertical 9:16", x: "Horizontal 16:9", note: "Elige el destino en el menú de tu dispositivo. Si no admite imágenes, guárdala y selecciónala en la aplicación.", saved: "Imagen guardada", shared: "Menú de compartir abierto", error: "No se pudo crear o compartir la imagen.", loading: "Creando la tarjeta en el idioma elegido…", match: "Compatibilidad" },
  fr: { cta: "Partager ma carte", title: "Votre essence, en une image.", description: "Carte personnelle", essence: "VOTRE ESSENCE", bias: "Angles morts et habitudes de pensée", palette: "PALETTE DE NAISSANCE", roles: ["Principale", "Secondaire", "Argent", "Amour", "Santé", "Intérieur"], reference: "Interprétation et couleurs indicatives", search: "Recherchez Agolmen's Compass", hashtags: "#AgolmensCompass #CouleursDeNaissance #ConnaissanceDeSoi", name: "Afficher mon nom", privacy: "Nom et naissance masqués par défaut", save: "Enregistrer l’image", share: "Partager depuis l’appareil", story: "Portrait 9:16", x: "Paysage 16:9", note: "Choisissez la destination dans le menu de partage. Si l’image n’est pas prise en charge, enregistrez-la puis sélectionnez-la dans l’application.", saved: "Image enregistrée", shared: "Menu de partage ouvert", error: "Impossible de créer ou partager l’image.", loading: "Création de la carte dans la langue choisie…", match: "Compatibilité" },
};
export const cardCopy = (language: Language) => shareCopy[language];

const kindLabel = (kind: ShareCardData["kind"], language: Language) => {
  const consultation: Record<Language, string> = { ja: "AI相談の道標", en: "AI consultation insight", "zh-CN": "AI咨询指引", "zh-TW": "AI諮詢指引", ko: "AI 상담 길잡이", es: "Consejo de tu consulta IA", fr: "Conseil de votre consultation IA" };
  if (kind === "consultation") return consultation[language];
  const daily: Record<Language, string> = { ja: "今日の占い", en: "Today's guide", "zh-CN": "今日运势", "zh-TW": "今日運勢", ko: "오늘의 운세", es: "Guía de hoy", fr: "Guide du jour" };
  const rhythm: Record<Language, string> = { ja: "今日のバイオリズム", en: "Today's rhythm", "zh-CN": "今日生物节律", "zh-TW": "今日生物節律", ko: "오늘의 바이오리듬", es: "Biorritmo de hoy", fr: "Biorythme du jour" };
  if (kind === "daily") return daily[language];
  if (kind === "biorhythm") return rhythm[language];
  return "";
};

function lines(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const result: string[] = []; let line = "";
  const tokens = text.match(/[A-Za-z0-9]+(?:[’'–-][A-Za-z0-9]+)*|[^A-Za-z0-9]/gu) ?? [];
  for (const ch of tokens) {
    if (ch === "\n") { result.push(line); line = ""; continue; }
    if (line && ctx.measureText(line + ch).width > width) { result.push(line.trim()); line = ch.trimStart(); } else line += ch;
  }
  if (line) result.push(line.trim());
  return result;
}

function fittedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, height: number, size: number, min: number, serif = true) {
  let wrapped: string[] = [], fontSize = size;
  do { ctx.font = `${serif ? 600 : 400} ${fontSize}px ${serif ? '"Noto Serif JP"' : '"Noto Sans JP"'}, sans-serif`; wrapped = lines(ctx, text, width); if (wrapped.length * fontSize * 1.55 <= height || fontSize <= min) break; fontSize -= 2; } while (fontSize >= min);
  const count = Math.floor(height / (fontSize * 1.55));
  wrapped.slice(0, count).forEach((line, i) => {
    const last = i === count - 1 && wrapped.length > count;
    ctx.fillText(last ? `${line.slice(0, -1)}…` : line, x, y + fontSize + i * fontSize * 1.55, width);
  });
}

export async function renderShareCard(format: CardFormat, data: ShareCardData, language: Language): Promise<HTMLCanvasElement> {
  const logo = new Image(); logo.src = logoUrl; await logo.decode();
  const t = cardCopy(language), story = format === "story";
  const canvas = document.createElement("canvas"); canvas.width = story ? 1080 : 1200; canvas.height = story ? 1920 : 675;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error(t.error);
  // Work in a fixed portrait coordinate space; landscape uses its own two-column layout.
  const w = canvas.width, h = canvas.height, css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  const gold = token("--share-gold"), ink = token("--share-midnight"), paper = token("--share-paper");
  ctx.fillStyle = ink; ctx.fillRect(0, 0, w, h);
  const cosmic = ctx.createRadialGradient(w * .5, story ? 560 : 285, 50, w * .5, story ? 650 : 310, story ? 780 : 550);
  cosmic.addColorStop(0, token("--share-amethyst")); cosmic.addColorStop(.36, token("--share-lavender")); cosmic.addColorStop(.7, token("--share-rose")); cosmic.addColorStop(1, ink);
  ctx.globalAlpha = .35; ctx.fillStyle = cosmic; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
  const palette = data.palette?.slice(0, 6) ?? [];
  const aura = ctx.createLinearGradient(0, 0, w, h);
  (palette.length ? palette : [{ code: gold }]).forEach((color, i, arr) => aura.addColorStop(arr.length === 1 ? 0 : i / (arr.length - 1), color.code));
  ctx.globalAlpha = .24; ctx.fillStyle = aura; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
  const veil = ctx.createLinearGradient(0, 0, 0, h); veil.addColorStop(0, ink); veil.addColorStop(.42, token("--share-veil")); veil.addColorStop(1, ink); ctx.fillStyle = veil; ctx.fillRect(0, 0, w, h);
  let seed = [...data.lines.join("")].reduce((s, c) => (s + c.charCodeAt(0)) % 233280, 97);
  const random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  ctx.fillStyle = gold;
  for (let i = 0; i < 150; i++) { ctx.globalAlpha = .15 + random() * .5; ctx.beginPath(); ctx.arc(random() * w, random() * h, .5 + random() * 1.9, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = gold; ctx.globalAlpha = .2; ctx.lineWidth = 1;
  const cx = story ? 540 : 320, cy = story ? 670 : 315;
  for (const radius of [180, 238, 290, 325]) { ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke(); }
  for (let i = 0; i < 12; i++) { const angle = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(angle) * 325, cy + Math.sin(angle) * 325); ctx.lineTo(cx + Math.cos(angle + Math.PI * 2 / 3) * 325, cy + Math.sin(angle + Math.PI * 2 / 3) * 325); ctx.stroke(); }
   const spiralGradient = ctx.createLinearGradient(0, 0, w, h); spiralGradient.addColorStop(0, gold); spiralGradient.addColorStop(.5, paper); spiralGradient.addColorStop(1, gold);
   ctx.strokeStyle = spiralGradient; ctx.globalAlpha = .7; ctx.lineWidth = 2; ctx.strokeRect(34, 34, w - 68, h - 68); ctx.globalAlpha = .28; ctx.lineWidth = 1; ctx.strokeRect(49, 49, w - 98, h - 98); ctx.globalAlpha = .42;
   ctx.beginPath(); for (let i = 0; i < 450; i++) { const angle = i * .09, radius = 3 * Math.exp(.065 * angle); const sx = (story ? 575 : 300) + Math.cos(angle) * radius, sy = (story ? 640 : 340) + Math.sin(angle) * radius; if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy); } ctx.stroke(); ctx.globalAlpha = 1;
   ctx.drawImage(logo, w / 2 - (story ? 72 : 38), story ? 70 : 32, story ? 144 : 76, story ? 144 : 76);
   const brands: Record<Language, string> = { ja: "アゴルメンの羅針盤", en: "Agolmen's Compass", "zh-CN": "阿戈尔曼罗盘", "zh-TW": "阿戈爾曼的羅盤", ko: "아골멘의 나침반", es: "La brújula de Agolmen", fr: "La boussole d’Agolmen" };
   ctx.textAlign = "center"; ctx.fillStyle = gold; ctx.font = `500 ${story ? 34 : 25}px "Noto Serif JP", serif`; ctx.fillText(brands[language], w / 2, story ? 265 : 151, w - 150);
  ctx.textAlign = "left";
  const x = story ? 100 : 90, width = story ? 880 : 500;
  ctx.fillStyle = gold; ctx.font = '500 24px "Noto Sans JP", sans-serif'; ctx.fillText(data.kind === "identity" ? t.essence : data.kind === "compatibility" ? t.match : kindLabel(data.kind, language), x, story ? 338 : 204);
  const textGradient = ctx.createLinearGradient(x, 0, x + width, 0); textGradient.addColorStop(0, paper); textGradient.addColorStop(.5, gold); textGradient.addColorStop(1, paper); ctx.fillStyle = textGradient;
  if (data.photo) {
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = data.photo.src;
    try { await img.decode(); } catch { /* text-only fallback */ }
    const px = story ? 100 : 640, pyy = story ? 382 : 190, pw = story ? 880 : 470, ph = story ? 700 : 340;
    if (img.naturalWidth) {
      const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight), sw = pw / scale, sh = ph / scale;
      ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, px, pyy, pw, ph);
      ctx.strokeStyle = gold; ctx.globalAlpha = .6; ctx.lineWidth = 2; ctx.strokeRect(px, pyy, pw, ph); ctx.globalAlpha = 1;
    }
    ctx.fillStyle = textGradient;
    fittedText(ctx, data.photo.caption, x, story ? 1110 : 229, story ? width : 500, story ? 560 : 330, story ? 34 : 22, story ? 22 : 15);
  }
  const main = data.photo ? '' : data.fullContent || data.kind === "identity" ? data.lines.join("\n") : `${data.title}${data.score ? ` · ${data.score}%` : ""}\n${data.lines.join("\n")}`;
  fittedText(ctx, main, x, story ? 382 : 229, width, data.fullContent ? (story ? FULL_STORY_H : 290) : story ? 450 : 290, data.fullContent ? (story ? 32 : 20) : story ? 60 : 33, story ? 30 : 20);
  if (data.pageLabel) { ctx.fillStyle = gold; ctx.font = '500 22px sans-serif'; ctx.fillText(data.pageLabel, x, story ? (data.fullContent ? 1290 : 855) : 535); }
  if (data.names.length) { ctx.fillStyle = paper; ctx.font = '400 25px "Noto Sans JP", sans-serif'; ctx.fillText(data.names.join(" × "), x, story ? (data.fullContent ? 1325 : 887) : 548, width); }
  if (data.keywords?.length && !data.fullContent) { ctx.fillStyle = gold; ctx.font = `500 ${story ? 23 : 15}px "Noto Sans JP", sans-serif`; ctx.fillText(data.keywords.slice(0, 6).join("  ·  "), x, story ? 930 : 572, width); }
  const bx = story ? 100 : 640, by = story ? 963 : 190, bw = story ? 880 : 470, bh = story ? 315 : 200;
  if (data.caution) {
    ctx.fillStyle = token("--share-panel"); ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = gold; ctx.globalAlpha = .45; ctx.strokeRect(bx, by, bw, bh); ctx.globalAlpha = 1;
    ctx.fillStyle = gold; ctx.font = `500 ${story ? 28 : 21}px "Noto Sans JP", sans-serif`; ctx.fillText(t.bias, bx + 28, by + 49, bw - 56);
    ctx.fillStyle = paper; fittedText(ctx, data.caution, bx + 28, by + 70, bw - 56, bh - 92, story ? 33 : 23, story ? 24 : 17, false);
  }
  const py = story ? 1360 : 425; ctx.fillStyle = gold; ctx.font = `500 ${story ? 25 : 19}px "Noto Sans JP", sans-serif`; if (palette.length) ctx.fillText(t.palette, bx, py);
  palette.forEach((color, i) => {
    const columns = story ? 3 : 3, cw = bw / columns, row = Math.floor(i / columns), chipX = bx + (i % columns) * cw, chipY = py + 35 + row * (story ? 92 : 57);
    ctx.fillStyle = color.code; ctx.fillRect(chipX, chipY, story ? 42 : 25, story ? 42 : 25);
    ctx.fillStyle = paper; ctx.font = `400 ${story ? 21 : 15}px "Noto Sans JP", sans-serif`; ctx.fillText(color.label, chipX + (story ? 56 : 35), chipY + (story ? 17 : 10), cw - 62);
    ctx.font = `${story ? 20 : 14}px monospace`; ctx.fillText(color.code, chipX + (story ? 56 : 35), chipY + (story ? 44 : 30));
  });
  ctx.textAlign = "center"; ctx.fillStyle = paper; ctx.font = `${story ? 22 : 16}px "Noto Sans JP", sans-serif`; if (data.kind !== 'app') ctx.fillText(t.hashtags, w / 2, story ? 1730 : 590, w - 140);
  ctx.strokeStyle = gold; ctx.globalAlpha = .45; ctx.strokeRect(w / 2 - 235, story ? 1760 : 607, 470, story ? 64 : 30); ctx.globalAlpha = 1;
  ctx.fillStyle = gold; ctx.font = `${story ? 23 : 16}px "Noto Sans JP", sans-serif`; ctx.fillText(data.url ?? t.search, w / 2, story ? 1801 : 629, w - 140);
  ctx.fillStyle = paper; ctx.font = `${story ? 19 : 13}px "Noto Sans JP", sans-serif`; ctx.fillText(t.reference, w / 2, h - 58);
  return canvas;
}

const FULL_STORY_H = 880;
/** Lines one fullContent page holds at the fixed 32/20px body size and 1.55 leading. */
export const fullLinesPerPage = (format: CardFormat) => Math.floor((format === 'story' ? FULL_STORY_H : 290) / ((format === 'story' ? 32 : 20) * 1.55));

/** Paginate full readings instead of ellipsizing; short items share one card and only long items continue. */
export async function renderShareCards(format: CardFormat, data: ShareCardData, language: Language): Promise<HTMLCanvasElement[]> {
  if (!data.fullContent) return [await renderShareCard(format, data, language), ...await Promise.all((data.photos ?? []).map(photo => renderShareCard(format, { ...data, lines: [], palette: [], photo }, language)))];
  const measure = document.createElement('canvas').getContext('2d');
  if (!measure) throw new Error(cardCopy(language).error);
  measure.font = `600 ${format === 'story' ? 32 : 20}px "Noto Serif JP", sans-serif`;
  const blocks = [data.title, ...data.lines, data.caution].filter((v): v is string => Boolean(v && v.trim())).map(block => lines(measure, block, format === 'story' ? 880 : 500));
  const packed = packShareLines(blocks, fullLinesPerPage(format));
  const pages: HTMLCanvasElement[] = [];
  for (let i = 0; i < packed.length; i++) pages.push(await renderShareCard(format, { ...data, title: '', score: 0, caution: undefined, lines: packed[i] ?? [], pageLabel: packed.length > 1 ? `${i + 1} / ${packed.length}` : undefined }, language));
  for (const photo of data.photos ?? []) pages.push(await renderShareCard(format, { ...data, title: '', score: 0, caution: undefined, lines: [], palette: [], photo, pageLabel: undefined }, language));
  return pages;
}
