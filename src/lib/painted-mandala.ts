/** Raster export only: never builds paths, geometry, particles, or overlays. */
export async function capturePaintedMandala(source: HTMLImageElement, filter: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  // CSS blur lengths scale with the displayed image; keep that scale in export.
  const scale = canvas.width / (source.clientWidth || source.naturalWidth);
  context.filter = filter.replace(/([\d.]+)px/g, (_, value: string) => `${Number(value) * scale}px`);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png");
  });
  return { blob, width: canvas.width, height: canvas.height };
}