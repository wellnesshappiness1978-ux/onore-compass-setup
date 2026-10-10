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
    "masterpiece front-facing circular sacred geometry mandala, perfectly centered and fully visible",
    "extremely intricate delicate fine lines, complex kaleidoscopic masterwork detail",
    "layered concentric rings, radial lotus petals, interlaced lattice, fine dot-painted bands, lace-like outer rim",
    `vibrant glowing gemstone core in the overall birth color ${overallColor}`,
    `six outer personal birth colors in distinct harmonious geometric layers: ${outerColors}`,
    "utilizing all 7 personal birth colors, each color clearly visible, unmuddied and balanced",
    "opaque vivid bold non-transparent rich colors, subtle rich impasto and refined brushwork",
    "shimmering golden sparkles, glowing crystal luminescence, radiant jewel particles",
    "pitch-black cosmic deep space background, symmetrical composition, 8k resolution, highly detailed",
  ].join(", ");
}

export function mandalaImageUrl(colors: MandalaColor[], variation = 0) {
  const seed = (mandalaSeed(colors) + variation * 104729) % 2147483647;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(mandalaPrompt(colors))}?width=1024&height=1024&nologo=true&seed=${seed}`;
}