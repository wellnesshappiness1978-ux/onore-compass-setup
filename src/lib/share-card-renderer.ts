import type { Language } from "./translations";

export type ShareCardData = { kicker: string; title: string; score: number; names: string[]; lines: string[]; kind?: "identity" | "compatibility"; caution?: string; palette?: { label: string; code: string }[] };
export type CardFormat = "story" | "x";
export const shareCopy = {
  ja: { cta: "鳥肌診断カードをSNSでシェア", title: "あなたの本質を、一枚に。", description: "鳥肌診断カード", essence: "あなたの本質", bias: "陥りがちな罠・思考バイアス", palette: "バースカラーパレット", roles: ["メイン", "サブ", "金運", "愛情", "健康", "内面"], reference: "自己理解のための参考解釈・参考色", search: "オノレコンパスで検索", hashtags: "#オノレコンパス #バースカラー #自己理解", name: "名前を載せる", privacy: "名前・出生情報は初期設定で非表示", save: "画像を保存", share: "端末でシェア", story: "縦型 9:16", x: "横型 16:9", note: "共有先は端末で選択します。Instagram・TikTokへの直接投稿は保証されません。画像共有に未対応の場合は保存し、各アプリで画像を選んでください。X・LINEの投稿画面には画像は自動添付されません。", saved: "画像を保存しました", shared: "端末の共有画面を開きました", error: "画像を作成・共有できませんでした。もう一度お試しください。", loading: "選択した言語の診断カードを作成中…", match: "相性スコア" },
  en: { cta: "Share my insight card", title: "Your essence, in one image.", description: "Personal insight card", essence: "YOUR ESSENCE", bias: "Blind spots & thinking patterns", palette: "BIRTH COLOR PALETTE", roles: ["Main", "Secondary", "Money", "Love", "Health", "Inner"], reference: "Reflective interpretation & illustrative colors", search: "Search: Onore Compass", hashtags: "#OnoreCompass #BirthColor #SelfUnderstanding", name: "Include my name", privacy: "Name and birth details hidden by default", save: "Save image", share: "Share from device", story: "Portrait 9:16", x: "Landscape 16:9", note: "Choose a destination in your device's share sheet. Direct Instagram or TikTok posting is not guaranteed. If image sharing is unavailable, save and select the image in the app. X and LINE links do not attach images automatically.", saved: "Image saved", shared: "Device share sheet opened", error: "Could not create or share the image. Please try again.", loading: "Creating your card in the selected language…", match: "Match score" },
  "zh-TW": { cta: "分享我的洞察診斷卡", title: "將你的本質，凝聚成一張圖。", description: "個人洞察診斷卡", essence: "你的本質", bias: "容易陷入的盲點・思考偏誤", palette: "誕生色調色盤", roles: ["主色", "副色", "財運", "愛情", "健康", "內在"], reference: "供自我理解的參考解讀與參考色", search: "搜尋：オノレコンパス", hashtags: "#オノレコンパス #誕生色 #自我理解", name: "顯示姓名", privacy: "預設隱藏姓名與出生資料", save: "儲存圖片", share: "裝置分享", story: "直式 9:16", x: "橫式 16:9", note: "請在裝置分享選單選擇目的地，不保證直接發佈至 Instagram 或 TikTok。若不支援圖片分享，請先儲存，再於各應用程式選取圖片。X 與 LINE 發文畫面不會自動附加圖片。", saved: "圖片已儲存", shared: "已開啟装置分享選單", error: "無法製作或分享圖片，請重試。", loading: "正在以所選語言製作診斷卡…", match: "相性分數" },
};
export const cardCopy = (language: Language) => shareCopy[language === "ja" ? "ja" : language === "zh-TW" ? "zh-TW" : "en"];

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

export function renderShareCard(format: CardFormat, data: ShareCardData, language: Language): HTMLCanvasElement {
  const t = cardCopy(language), story = format === "story";
  const canvas = document.createElement("canvas"); canvas.width = story ? 1080 : 1200; canvas.height = story ? 1920 : 675;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error(t.error);
  // Work in a fixed portrait coordinate space; landscape uses its own two-column layout.
  const w = canvas.width, h = canvas.height, css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  const gold = token("--share-gold"), ink = token("--share-midnight"), paper = token("--share-paper");
  ctx.fillStyle = ink; ctx.fillRect(0, 0, w, h);
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
  ctx.globalAlpha = .65; ctx.strokeRect(34, 34, w - 68, h - 68); ctx.globalAlpha = 1;
  ctx.textAlign = "center"; ctx.fillStyle = gold; ctx.font = '500 34px "Noto Serif JP", serif'; ctx.fillText("✧ オノレコンパス ✧", w / 2, story ? 160 : 93);
  ctx.font = '400 19px "Noto Sans JP", sans-serif'; ctx.fillText("SELF COMPASS", w / 2, story ? 205 : 125);
  ctx.textAlign = "left";
  const x = story ? 100 : 90, width = story ? 880 : 500;
  ctx.fillStyle = gold; ctx.font = '500 24px "Noto Sans JP", sans-serif'; ctx.fillText(data.kind === "identity" ? t.essence : t.match, x, story ? 338 : 204);
  const textGradient = ctx.createLinearGradient(x, 0, x + width, 0); textGradient.addColorStop(0, paper); textGradient.addColorStop(.5, gold); textGradient.addColorStop(1, paper); ctx.fillStyle = textGradient;
  const main = data.kind === "identity" ? data.lines.join("\n") : `${data.title} · ${data.score}%\n${data.lines.join("\n")}`;
  fittedText(ctx, main, x, story ? 382 : 229, width, story ? 450 : 290, story ? 60 : 33, story ? 30 : 20);
  if (data.names.length) { ctx.fillStyle = paper; ctx.font = '400 25px "Noto Sans JP", sans-serif'; ctx.fillText(data.names.join(" × "), x, story ? 887 : 548, width); }
  const bx = story ? 100 : 640, by = story ? 963 : 190, bw = story ? 880 : 470, bh = story ? 315 : 200;
  if (data.caution) {
    ctx.fillStyle = token("--share-panel"); ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = gold; ctx.globalAlpha = .45; ctx.strokeRect(bx, by, bw, bh); ctx.globalAlpha = 1;
    ctx.fillStyle = gold; ctx.font = `500 ${story ? 28 : 21}px "Noto Sans JP", sans-serif`; ctx.fillText(t.bias, bx + 28, by + 49, bw - 56);
    ctx.fillStyle = paper; fittedText(ctx, data.caution, bx + 28, by + 70, bw - 56, bh - 92, story ? 33 : 23, story ? 24 : 17, false);
  }
  const py = story ? 1360 : 425; ctx.fillStyle = gold; ctx.font = `500 ${story ? 25 : 19}px "Noto Sans JP", sans-serif`; ctx.fillText(t.palette, bx, py);
  palette.forEach((color, i) => {
    const columns = story ? 3 : 3, cw = bw / columns, row = Math.floor(i / columns), chipX = bx + (i % columns) * cw, chipY = py + 35 + row * (story ? 92 : 57);
    ctx.fillStyle = color.code; ctx.fillRect(chipX, chipY, story ? 42 : 25, story ? 42 : 25);
    ctx.fillStyle = paper; ctx.font = `400 ${story ? 21 : 15}px "Noto Sans JP", sans-serif`; ctx.fillText(color.label, chipX + (story ? 56 : 35), chipY + (story ? 17 : 10), cw - 62);
    ctx.font = `${story ? 20 : 14}px monospace`; ctx.fillText(color.code, chipX + (story ? 56 : 35), chipY + (story ? 44 : 30));
  });
  ctx.textAlign = "center"; ctx.fillStyle = paper; ctx.font = `${story ? 22 : 16}px "Noto Sans JP", sans-serif`; ctx.fillText(t.hashtags, w / 2, story ? 1730 : 590, w - 140);
  ctx.strokeStyle = gold; ctx.globalAlpha = .45; ctx.strokeRect(w / 2 - 235, story ? 1760 : 607, 470, story ? 64 : 30); ctx.globalAlpha = 1;
  ctx.fillStyle = gold; ctx.font = `${story ? 23 : 16}px "Noto Sans JP", sans-serif`; ctx.fillText(t.search, w / 2, story ? 1801 : 629);
  ctx.fillStyle = paper; ctx.font = `${story ? 19 : 13}px "Noto Sans JP", sans-serif`; ctx.fillText(t.reference, w / 2, h - 58);
  return canvas;
}