import { createRng } from "../util/rng";

export const GRAIN_SIZE = 256;

/**
 * T-GRAIN. Menghasilkan data URL 256x256 untuk overlay CSS tanpa mengimpor Three.js,
 * sehingga dapat dipakai oleh modul UI/bridge secara ringan.
 */
export function makeGrainDataUrl(): string {
  const canvas = document.createElement("canvas");
  canvas.width = GRAIN_SIZE;
  canvas.height = GRAIN_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kanvas 2D tidak tersedia.");

  const rand = createRng(6);
  const data = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE);
  for (let i = 0; i < data.data.length; i += 4) {
    const value = Math.round(128 + (2 * rand() - 1) * 127);
    data.data.set([value, value, value, 255], i);
  }
  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL();
}
