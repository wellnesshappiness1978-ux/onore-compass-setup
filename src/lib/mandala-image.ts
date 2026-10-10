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
    "masterpiece oil painting of a sacred geometry mandala",
    "rich impasto texture, expressive brushstrokes, fine art",
    `glowing gemstone core in ${overallColor}`,
    `six radial birth colors glowing harmoniously: ${outerColors}`,
    "intricate mystical ornate details, cosmic black background, 8k art",
  ].join(", ");
}

export function mandalaImageUrl(colors: MandalaColor[], variation = 0) {
  const seed = (mandalaSeed(colors) + variation * 104729) % 2147483647;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(mandalaPrompt(colors))}?width=1024&height=1024&nologo=true&seed=${seed}`;
}