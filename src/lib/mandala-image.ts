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
  return colorMap[color.name] ?? "luminous jewel tone";
}

export function mandalaSeed(colors: MandalaColor[]) {
  const source = colors.map(color => `${color.name}:${color.code}`).join("|");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 2147483647;
}

export function mandalaPrompt(colors: MandalaColor[]) {
  const [overall, ...outer] = colors;
  const overallColor = overall ? `${birthColorKeyword(overall)} ${overall.code}` : "luminous jewel tone";
  const outerColors = outer.map(color => `${birthColorKeyword(color)} ${color.code}`).join(", ");

  return [
    "masterpiece, extremely intricate sacred geometry mandala, hyper-detailed fine lines",
    "vivid vibrant 7 rainbow birth colors, glowing neon crystal luminescence, shimmering gold sparkles",
    "non-transparent rich bold colors, pitch-black cosmic space background, 8k resolution, flawless symmetry",
    `vibrant glowing gemstone core in the overall birth color ${overallColor}`,
    `six outer personal birth colors glowing harmoniously: ${outerColors}`,
  ].join(", ");
}

export function mandalaImageUrl(colors: MandalaColor[], variation = 0) {
  const seed = (mandalaSeed(colors) + variation * 104729) % 2147483647;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(mandalaPrompt(colors))}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;
}