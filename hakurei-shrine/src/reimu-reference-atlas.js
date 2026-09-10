// Reconstruct the generated design on a fixed pixel grid, then articulate that
// reference with small, continuous per-pixel displacements. No smoothed resizing.
// The source is kept separately so the asset's provenance remains inspectable.
export async function createReimuAtlas() {
 const referenceUrl = typeof __REIMU_REFERENCE__ === 'string' ? __REIMU_REFERENCE__ : '/assets/reimu/reimu-reference-v1.png';
 const image = new Image(); image.src = referenceUrl; await image.decode();
 const width = 160, height = 208, frames = 12, padding = 8;
 const source = document.createElement('canvas'); source.width = width; source.height = height;
 const ctx = source.getContext('2d', { willReadFrequently: true }); ctx.imageSmoothingEnabled = false;
 const artHeight = height - padding - 2;
 const artWidth = Math.round(artHeight * image.width / image.height);
 const left = Math.round((width - artWidth) / 2);
 ctx.drawImage(image, left, padding, artWidth, artHeight);
 const original = ctx.getImageData(0, 0, width, height);
 // A controlled palette and binary alpha retain deliberate, legible pixel edges.
 for (let i = 0; i < original.data.length; i += 4) {
  original.data[i + 3] = original.data[i + 3] < 128 ? 0 : 255;
  for (let c = 0; c < 3; c++) original.data[i + c] = Math.min(255, Math.round(original.data[i + c] / 8) * 8);
 }
 const canvas = document.createElement('canvas'); canvas.width = width * frames; canvas.height = height;
 const output = canvas.getContext('2d');
 const smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
 for (let frame = 0; frame < frames; frame++) {
  const result = output.createImageData(width, height);
  const phase = frame < 8 ? Math.sin(frame / 8 * Math.PI * 2) : 0;
  const crouch = frame === 8 ? 3 : frame === 10 ? 2 : 0;
  const air = frame === 9;
  // Inverse sampling avoids holes, stretching seams, and missing edge pixels.
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
   const nx = (x - left) / artWidth, ny = (y - padding) / artHeight;
   const body = smooth(.32, .48, ny) * (1 - smooth(.79, .94, ny));
   const broom = smooth(.47, .69, nx) * smooth(.48, .75, ny);
   const hair = (1 - smooth(.18, .38, nx)) + smooth(.63, .82, nx);
   const hairBand = smooth(.31, .44, ny) * (1 - smooth(.62, .73, ny));
   const bow = (1 - smooth(.12, .23, ny)) * (nx - .48);
   let dx = phase * (body * 1.6 + broom * 5.5 + hair * hairBand * .65);
   dx += Math.sin(frame * Math.PI / 4) * bow * 1.2;
   if (air) dx += (nx - .48) * smooth(.50, .68, ny) * (1 - smooth(.79, .85, ny)) * 3;
   const dy = crouch * (1 - smooth(.77, 1, ny)) + (frame < 8 ? Math.abs(phase) * body * .6 : 0);
   const sx = Math.round(x - dx), sy = Math.round(y - dy);
   if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
   const index = (y * width + x) * 4, src = (sy * width + sx) * 4;
   for (let c = 0; c < 4; c++) result.data[index + c] = original.data[src + c];
  }
  output.putImageData(result, frame * width, 0);
 }
 return { canvas, width, height, frames };
}
