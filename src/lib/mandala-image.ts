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

const agolmenMandalaPrompt =
  "masterpiece, breathtaking circular sacred geometry mandala embodying 'Agolmen's Compass', central glowing golden starburst compass with intricate filigree, radiating spiral patterns seamlessly integrating all 7 vivid personal birth colors (sapphire blue, ruby red, emerald green, golden yellow, royal violet, vibrant orange, diamond white), rich non-transparent impasto oil painting texture, glowing crystal luminescence, shimmering golden sparkles, intricate fine lines, set against a pitch-black deep cosmic space background, 8k resolution, highly detailed, flawless radial symmetry";

export function mandalaPrompt(_colors: MandalaColor[]) {
  return agolmenMandalaPrompt;
}

export function mandalaImageUrl(colors: MandalaColor[], variation = 0) {
  const seed = (mandalaSeed(colors) + variation * 104729) % 2147483647;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(mandalaPrompt(colors))}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;
}