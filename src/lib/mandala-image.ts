export type MandalaColor = { name: string; code: string };

const colorMap: Record<string, string> = {
  サンライズコーラル: "vivid ruby coral red",
  シャンパンローズ: "luminous champagne rose pink",
  アンバーゴールド: "shining imperial amber gold",
  翡翠グリーン: "vivid emerald jade green",
  ターコイズ: "luminous turquoise blue",
  瑠璃ブルー: "deep sapphire lapis blue",
  アメジスト: "royal amethyst purple",
  モーヴピンク: "glowing rose quartz mauve pink",
};

export function birthColorKeyword(color: MandalaColor) {
  return `${colorMap[color.name] ?? "luminous jewel tone"} (${color.code})`;
}

export function mandalaSeed(colors: MandalaColor[]) {
  const source = colors.map(color => `${color.name}:${color.code}`).join("|");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mandalaPrompt(colors: MandalaColor[]) {
  const fallback = { name: "アンバーゴールド", code: "#F4D03F" };
  const overall = birthColorKeyword(colors[0] ?? fallback);
  const birthColors = Array.from({ length: 6 }, (_, index) => birthColorKeyword(colors[index + 1] ?? colors[0] ?? fallback));
  return `sacred geometry mandala, deep cosmic black space background, centered around a luminous ${overall} gemstone core, radiating intricate patterns utilizing vivid birth colors [${birthColors.join(", ")}], hyper-detailed dot painting, golden ratio fibonacci spiral, sparkling gold dust, 8k resolution, masterpiece spiritual art`;
}

export function mandalaImageUrl(colors: MandalaColor[], variation = 0) {
  const seed = (mandalaSeed(colors) + variation * 104729) >>> 0;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(mandalaPrompt(colors))}?width=1024&height=1024&nologo=true&seed=${seed}`;
}