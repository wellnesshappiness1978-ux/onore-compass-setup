/** Screen RGB is not a measured physical wavelength. Spectral ranges are broad educational references. */
export function colorEssence(code: string) {
  const rgb = [1, 3, 5].map(i => parseInt(code.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = rgb;
  const max = Math.max(...rgb), min = Math.min(...rgb), d = max - min;
  let h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const index = h < 15 || h >= 345 ? 0 : h < 45 ? 1 : h < 70 ? 2 : h < 165 ? 3 : h < 195 ? 4 : h < 255 ? 5 : h < 285 ? 6 : 7;
  const spectral = d < .05 || index === 7 || h >= 285 ? null : ['620–750', '590–620', '570–590', '495–570', '490–520', '450–495', '380–450'][index] ?? null;
  return { index, spectral };
}
