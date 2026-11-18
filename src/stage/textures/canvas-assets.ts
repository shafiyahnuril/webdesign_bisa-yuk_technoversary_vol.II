import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { createRng } from "../util/rng";
export { makeGrainDataUrl } from "./grain";

const BONE = "#E6EAF2";
const INK = "#11261B";
const TINT = "#8FD3FF";
const COBALT = "#0B2B80";

function surface(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kanvas 2D tidak tersedia.");
  return { canvas, ctx };
}

function texture(canvas: HTMLCanvasElement, color = true, repeat = false): CanvasTexture {
  const map = new CanvasTexture(canvas);
  if (color) map.colorSpace = SRGBColorSpace;
  if (repeat) map.wrapS = map.wrapT = RepeatWrapping;
  return map;
}

/** T-CRACK. Baca alpha dari mask dan kanal merah dari growth pada shader. */
export function makeBottleCrack(size: 512 | 1024 = 1024): {
  mask: CanvasTexture;
  growth: CanvasTexture;
} {
  const mask = surface(size, size);
  const growth = surface(size, size);
  const rand = createRng(918);
  const scale = size / 1024;
  const origins = [
    [0.26, 0.25],
    [0.56, 0.63],
    [0.75, 0.32],
  ] as const;
  mask.ctx.lineCap = "round";
  mask.ctx.lineJoin = "round";

  function stroke(points: [number, number][], width: number, color: string) {
    mask.ctx.beginPath();
    points.forEach(([x, y], i) => {
      if (i === 0) mask.ctx.moveTo(x, y);
      else mask.ctx.lineTo(x, y);
    });
    mask.ctx.lineWidth = width * scale;
    mask.ctx.strokeStyle = color;
    mask.ctx.stroke();
  }

  origins.forEach(([originX, originY]) => {
    const count = 12 + Math.floor(rand() * 5);
    for (let ray = 0; ray < count; ray++) {
      const direction = (ray / count) * 2 * Math.PI;
      const step = ((80 + rand() * 320) / 12) * scale;
      let x = originX * size;
      let y = originY * size;
      const points: [number, number][] = [[x, y]];
      for (let i = 0; i < 12; i++) {
        const bearing = direction + (rand() - 0.5) * ((Math.PI * 2) / 9);
        x += Math.cos(bearing) * step;
        y += Math.sin(bearing) * step;
        points.push([x, y]);
        if (i > 2 && i % 3 === 0 && rand() < 0.4) {
          const branch = direction + (rand() > 0.5 ? 1 : -1) * 0.8;
          stroke(
            [
              [x, y],
              [x + Math.cos(branch) * step, y + Math.sin(branch) * step],
              [x + Math.cos(branch + 0.25) * step * 2, y + Math.sin(branch + 0.25) * step * 2],
            ],
            1.4,
            BONE,
          );
        }
      }
      stroke(points, 2 + rand(), BONE);
      stroke(points, 1, "#F3F8FF");
    }
  });

  const buffer = growth.ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nearest = Math.min(...origins.map(([ox, oy]) => Math.hypot(x / size - ox, y / size - oy)));
      const value = Math.round(Math.min(1, nearest * 2.15 + rand() * 0.15) * 255);
      const i = 4 * (y * size + x);
      buffer.data[i] = buffer.data[i + 1] = buffer.data[i + 2] = value;
      buffer.data[i + 3] = 255;
    }
  }
  growth.ctx.putImageData(buffer, 0, 0);
  return { mask: texture(mask.canvas, false), growth: texture(growth.canvas, false) };
}

/** T-LABEL. Pita, garis aksen, dan tetes PET (tanpa teks). */
export function makeBottleLabel(): CanvasTexture {
  const { canvas, ctx } = surface(512, 128);
  ctx.fillStyle = BONE;
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = TINT;
  ctx.fillRect(0, 0, 512, 6);
  ctx.fillRect(0, 122, 512, 6);
  ctx.fillStyle = COBALT;
  ctx.fill(new Path2D("M256 28C246 44 233 56 233 72a23 23 0 0 0 46 0c0-16-13-28-23-44Z"));
  return texture(canvas);
}

const binGlyphs = {
  PLASTIK: "M-5-15H5v6l5 7v13q0 4-4 4H-6q-4 0-4-4V-2l5-7Z",
  KERTAS: "M-12-15H5l7 7v23h-24ZM4-12v7h7",
  ORGANIK: "M-11 10Q-16-8 13-14Q16 12-5 14ZM-10 14L5-2",
};
export type BinLabel = keyof typeof binGlyphs;

/** T-BINLABEL. Panggil setelah font Display siap agar bobot 700 dipakai. */
export function makeBinLabel(kind: BinLabel, fontFamily = "Bricolage Grotesque Variable"): CanvasTexture {
  const { canvas, ctx } = surface(512, 128);
  ctx.fillStyle = BONE;
  ctx.fillRect(0, 0, 512, 128);
  ctx.save();
  ctx.translate(65, 64);
  ctx.scale(2.05, 2.05);
  ctx.lineWidth = 2.5;
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
  ctx.stroke(new Path2D(binGlyphs[kind]));
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.font = `700 56px "${fontFamily}", sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(kind, 126, 69, 366);
  return texture(canvas);
}

/** T-WINDOWS. Atlas grid 8×8 dengan 13 jendela menyala. */
export function makeWindowAtlas(): CanvasTexture {
  const { canvas, ctx } = surface(256, 256);
  const rand = createRng(7);
  const cells = Array.from({ length: 64 }, (_, index) => index);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j]!, cells[i]!];
  }
  ctx.fillStyle = "#8FB0CC";
  for (const cell of cells.slice(0, 13)) {
    ctx.fillRect(10 + (cell % 8) * 32, 9 + Math.floor(cell / 8) * 32, 12, 14);
  }
  return texture(canvas);
}

/** T-BELT. Tinggi kelipatan 16 menjaga sambungan pola diagonal. */
export function makeConveyorBelt(): CanvasTexture {
  const { canvas, ctx } = surface(256, 64);
  ctx.fillStyle = "#1B4D49";
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = "#226B63";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = -64; x < 256; x += 16) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 64, 64);
  }
  ctx.stroke();
  return texture(canvas, true, true);
}

/** T-FABRIC. Peta keabuan dengan variasi tenun sekitar 6%. */
export function makeFabricWeave(): CanvasTexture {
  const { canvas, ctx } = surface(256, 256);
  const rand = createRng(101);
  ctx.fillStyle = "#E6EAF2";
  ctx.fillRect(0, 0, 256, 256);
  for (let xy = 0; xy < 256; xy += 2) {
    ctx.fillStyle = `rgba(17,38,27,${0.02 + rand() * 0.04})`;
    ctx.fillRect(xy, 0, 1, 256);
    ctx.fillRect(0, xy, 256, 1);
  }
  return texture(canvas, false, true);
}

/** T-CAUSTIC. Sel Worley periodik, baca kanal merah sebagai intensitas. */
export function makeCaustics(): CanvasTexture {
  const size = 256;
  const cells = 8;
  const { canvas, ctx } = surface(size, size);
  const rand = createRng(72);
  const sites = Array.from({ length: cells * cells }, () => [rand(), rand()] as const);
  const data = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xx = (x * cells) / size;
      const yy = (y * cells) / size;
      const ix = Math.floor(xx);
      const iy = Math.floor(yy);
      let closest = Infinity;
      let next = Infinity;
      for (let j = iy - 1; j <= iy + 1; j++) {
        for (let i = ix - 1; i <= ix + 1; i++) {
          const wrappedX = (i + cells) % cells;
          const wrappedY = (j + cells) % cells;
          const [sx, sy] = sites[wrappedY * cells + wrappedX]!;
          const distance = (i + sx - xx) ** 2 + (j + sy - yy) ** 2;
          if (distance < closest) {
            next = closest;
            closest = distance;
          } else if (distance < next) next = distance;
        }
      }
      const ridge = 1 - Math.min(1, Math.abs(Math.sqrt(next) - Math.sqrt(closest)) * 7);
      const value = Math.round(ridge ** 2 * 255);
      const n = (y * size + x) * 4;
      data.data[n] = data.data[n + 1] = data.data[n + 2] = value;
      data.data[n + 3] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  return texture(canvas, false, true);
}

/** T-CONTACT. Gunakan sebagai map pada plane berwarna hitam, opacity 0,35. */
export function makeContactShadow(): CanvasTexture {
  const { canvas, ctx } = surface(128, 128);
  const falloff = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  falloff.addColorStop(0, "rgba(255,255,255,1)");
  falloff.addColorStop(0.42, "rgba(255,255,255,.54)");
  falloff.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = falloff;
  ctx.fillRect(0, 0, 128, 128);
  return texture(canvas, false);
}
