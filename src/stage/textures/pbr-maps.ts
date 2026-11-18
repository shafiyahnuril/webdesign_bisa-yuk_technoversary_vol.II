import * as THREE from "three";
import { createRng } from "../util/rng";

export interface PbrTextureSet {
  map?: THREE.CanvasTexture;
  normalMap?: THREE.CanvasTexture;
  roughnessMap?: THREE.CanvasTexture;
  dispose(): void;
}

const imageBufferCache = new Map<string, Uint8ClampedArray>();

function createCanvas(size: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  return { canvas, ctx };
}

function makeTexture(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = colorSpace;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  } else {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  tex.needsUpdate = true;
  return tex;
}

function buildPixelTexture(
  cacheKey: string,
  size: number,
  color: boolean,
  fillPixel: (
    x: number,
    y: number,
    size: number,
    rand: () => number,
  ) => [number, number, number, number],
  seed: number,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture | undefined {
  const surface = createCanvas(size);
  if (!surface) return undefined;
  const { canvas, ctx } = surface;

  if (typeof ctx.createImageData === "function" && typeof ctx.putImageData === "function") {
    let cached = imageBufferCache.get(cacheKey);
    if (!cached) {
      const rand = createRng(seed);
      cached = new Uint8ClampedArray(size * size * 4);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const [r, g, b, a] = fillPixel(x, y, size, rand);
          const idx = (y * size + x) * 4;
          cached[idx] = r;
          cached[idx + 1] = g;
          cached[idx + 2] = b;
          cached[idx + 3] = a;
        }
      }
      imageBufferCache.set(cacheKey, cached);
    }
    const img = ctx.createImageData(size, size);
    img.data.set(cached);
    ctx.putImageData(img, 0, 0);
  } else {
    // Fallback ringan untuk mock jsdom yang hanya menyediakan fillRect
    const rand = createRng(seed);
    const [r, g, b] = fillPixel(size >> 1, size >> 1, size, rand);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, size, size);
  }

  return makeTexture(canvas, color ? THREE.SRGBColorSpace : THREE.NoColorSpace, repeatX, repeatY);
}

function buildHeightAndNormalSet(
  keyPrefix: string,
  size: number,
  seed: number,
  strength: number,
  sampleHeight: (u: number, v: number, n: number) => number,
  sampleAlbedo: (u: number, v: number, h: number, n: number) => [number, number, number],
  sampleRoughness: (u: number, v: number, h: number, n: number) => number,
  repeatX = 1,
  repeatY = 1,
  includeAlbedo = true,
): PbrTextureSet {
  const heightsKey = `${keyPrefix}:h:${size}`;
  const surface = createCanvas(size);
  if (!surface) {
    return { dispose() {} };
  }

  // Hitung atau ambil height + noise deterministik
  let heights = imageBufferCache.get(heightsKey);
  if (!heights) {
    const rand = createRng(seed);
    heights = new Uint8ClampedArray(size * size);
    for (let y = 0; y < size; y++) {
      const v = y / size;
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const h = Math.max(0, Math.min(1, sampleHeight(u, v, rand())));
        heights[y * size + x] = Math.round(h * 255);
      }
    }
    imageBufferCache.set(heightsKey, heights);
  }

  const hAt = (x: number, y: number): number => {
    const wx = ((x % size) + size) % size;
    const wy = ((y % size) + size) % size;
    return heights![wy * size + wx]! / 255;
  };

  const map = includeAlbedo
    ? buildPixelTexture(
        `${keyPrefix}:map:${size}`,
        size,
        true,
        (x, y, s, rand) => {
          const [r, g, b] = sampleAlbedo(x / s, y / s, hAt(x, y), rand());
          return [
            Math.max(0, Math.min(255, Math.round(r))),
            Math.max(0, Math.min(255, Math.round(g))),
            Math.max(0, Math.min(255, Math.round(b))),
            255,
          ];
        },
        seed + 11,
        repeatX,
        repeatY,
      )
    : undefined;

  const normalMap = buildPixelTexture(
    `${keyPrefix}:nrm:${size}`,
    size,
    false,
    (x, y) => {
      const dx = (hAt(x + 1, y) - hAt(x - 1, y)) * strength;
      const dy = (hAt(x, y + 1) - hAt(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1) || 1;
      const nx = ((-dx / len) * 0.5 + 0.5) * 255;
      const ny = ((-dy / len) * 0.5 + 0.5) * 255;
      const nz = ((1 / len) * 0.5 + 0.5) * 255;
      return [Math.round(nx), Math.round(ny), Math.round(nz), 255];
    },
    seed + 23,
    repeatX,
    repeatY,
  );

  const roughnessMap = buildPixelTexture(
    `${keyPrefix}:rgh:${size}`,
    size,
    false,
    (x, y, s, rand) => {
      const rVal = Math.max(0, Math.min(1, sampleRoughness(x / s, y / s, hAt(x, y), rand())));
      const c = Math.round(rVal * 255);
      return [c, c, c, 255];
    },
    seed + 37,
    repeatX,
    repeatY,
  );

  return {
    map,
    normalMap,
    roughnessMap,
    dispose() {
      map?.dispose();
      normalMap?.dispose();
      roughnessMap?.dispose();
    },
  };
}

/** Piring keramik ivory hangat dengan bintik glasir dan cincin pinggir halus. */
export function makeCeramicGlazeSet(size = 256): PbrTextureSet {
  return buildHeightAndNormalSet(
    "ceramic-glaze",
    size,
    104,
    2.2,
    (u, v, n) => {
      const ring = 0.5 + 0.14 * Math.sin(v * Math.PI * 24);
      const speckle = n > 0.96 ? -0.18 : (n - 0.5) * 0.08;
      return ring + speckle + 0.04 * Math.sin(u * Math.PI * 8);
    },
    (_u, v, h, n) => {
      const speck = n > 0.965 ? -22 : (n - 0.5) * 6;
      const rimShade = 0.96 + 0.04 * Math.sin(v * Math.PI * 4);
      return [
        (236 + h * 8) * rimShade + speck,
        (229 + h * 7) * rimShade + speck,
        (215 + h * 6) * rimShade + speck,
      ];
    },
    (_u, _v, h) => 0.24 + (1 - h) * 0.16,
  );
}

/** Filet salmon B6: urat myomere melengkung, gradasi panggang tepi, kilap lembab. */
export function makeSalmonFilletSet(size = 256): PbrTextureSet {
  return buildHeightAndNormalSet(
    "salmon-fillet",
    size,
    208,
    5.4,
    (u, v, n) => {
      const curve = u * 7.5 + Math.sin(v * Math.PI * 2.2) * 0.55;
      const myomere = Math.pow(Math.abs(Math.sin(curve * Math.PI)), 0.45);
      const edgeSear = Math.min(1, Math.hypot((u - 0.5) * 1.4, (v - 0.5) * 1.8) * 1.15);
      return myomere * 0.72 + edgeSear * 0.18 + (n - 0.5) * 0.12;
    },
    (u, v, h, n) => {
      const curve = u * 7.5 + Math.sin(v * Math.PI * 2.2) * 0.55;
      const fatLine = Math.pow(Math.max(0, 1 - Math.abs(Math.sin(curve * Math.PI)) * 3.8), 1.4);
      const radial = Math.hypot((u - 0.5) * 1.5, (v - 0.5) * 1.8);
      const searMix = Math.max(0, Math.min(1, (radial - 0.52) * 2.2));

      // Daging salmon muted (#C67460) -> garis lemak ivory (#E8D1C0) -> tepi panggang (#6A4030)
      let r = 194 + fatLine * 42 + (n - 0.5) * 12;
      let g = 109 + fatLine * 96 + (n - 0.5) * 10;
      let b = 92 + fatLine * 96 + (n - 0.5) * 10;

      // Sisi kulit/panggang sedikit keemasan-umber
      r = r * (1 - searMix * 0.48) + 106 * (searMix * 0.48);
      g = g * (1 - searMix * 0.56) + 64 * (searMix * 0.56);
      b = b * (1 - searMix * 0.58) + 48 * (searMix * 0.58);
      // Variasi kedalaman serat
      const depth = 0.88 + h * 0.14;
      return [r * depth, g * depth, b * depth];
    },
    (u, v, h) => {
      const radial = Math.hypot((u - 0.5) * 1.5, (v - 0.5) * 1.8);
      const searMix = Math.max(0, Math.min(1, (radial - 0.52) * 2.2));
      return 0.24 + (1 - h) * 0.14 + searMix * 0.34;
    },
  );
}

/** Sisik ikan metalik basah: punggung slate-perak ke perut terang dengan imbrikasi sisik. */
export function makeFishScaleSet(size = 256): PbrTextureSet {
  return buildHeightAndNormalSet(
    "fish-scales",
    size,
    312,
    4.8,
    (u, v, n) => {
      const cols = 18;
      const rows = 10;
      const gu = u * cols;
      const gv = v * rows + (Math.floor(gu) % 2) * 0.5;
      const fu = (gu % 1) - 0.5;
      const fv = (gv % 1) - 0.5;
      const rim = Math.max(0, 1 - Math.hypot(fu * 1.2, fv * 1.15));
      return rim * 0.82 + (n - 0.5) * 0.1;
    },
    (_u, v, h, n) => {
      // UV Sphere: v ~ 1 punggung/atas, v ~ 0 perut/bawah
      const bellyMix = Math.max(0, Math.min(1, 1.15 - v * 1.45));
      const baseR = 92 + bellyMix * 108 + h * 26 + (n - 0.5) * 8;
      const baseG = 118 + bellyMix * 98 + h * 28 + (n - 0.5) * 8;
      const baseB = 146 + bellyMix * 84 + h * 28 + (n - 0.5) * 8;
      return [baseR, baseG, baseB];
    },
    (_u, _v, h) => 0.16 + (1 - h) * 0.2,
  );
}

/** Logam sikat (brushed steel / anodized dark metal). */
export function makeBrushedMetalSet(size = 256, repeatX = 1, repeatY = 1): PbrTextureSet {
  return buildHeightAndNormalSet(
    "brushed-metal",
    size,
    416,
    3.6,
    (u, v, n) => {
      const streak = Math.sin(v * Math.PI * 110 + Math.sin(u * Math.PI * 4) * 0.4) * 0.22;
      const band = Math.sin(v * Math.PI * 16) * 0.15;
      return 0.5 + streak + band + (n - 0.5) * 0.15;
    },
    (_u, _v, h) => {
      const v = 212 + h * 36;
      return [v, v + 2, v + 5];
    },
    (_u, _v, h) => 0.22 + (1 - h) * 0.24,
    repeatX,
    repeatY,
  );
}

/** Kayu alami hangat (bangku taman, rak kayu komposit). */
export function makeWoodGrainSet(size = 256, repeatX = 1, repeatY = 1): PbrTextureSet {
  return buildHeightAndNormalSet(
    "wood-grain",
    size,
    520,
    3.4,
    (u, v, n) => {
      const wave = v * 28 + Math.sin(u * Math.PI * 3) * 1.4;
      const ring = 0.5 + 0.36 * Math.sin(wave * Math.PI);
      const pore = n < 0.08 ? -0.22 : (n - 0.5) * 0.08;
      return ring + pore;
    },
    (_u, _v, h, n) => {
      const grain = 0.8 + h * 0.28 + (n - 0.5) * 0.05;
      return [168 * grain, 126 * grain, 90 * grain];
    },
    (_u, _v, h) => 0.52 + (1 - h) * 0.26,
    repeatX,
    repeatY,
  );
}

/** Tekstur kain spesifik (canvas/cotton/nylon/fleece/wool) lengkap dengan jahitan tepi & normal. */
export function makeFabricPbrSet(
  style: "canvas" | "cotton" | "nylon" | "fleece" | "wool",
  size = 256,
  repeatX = 2,
  repeatY = 2,
): PbrTextureSet {
  const seedMap = { canvas: 601, cotton: 602, nylon: 603, fleece: 604, wool: 605 } as const;
  return buildHeightAndNormalSet(
    `fabric-${style}`,
    size,
    seedMap[style],
    style === "nylon" ? 2.4 : style === "fleece" ? 4.4 : 3.4,
    (u, v, n) => {
      if (style === "nylon") {
        // Ripstop kotak mikro
        const gx = (u * 24) % 1 < 0.14 ? 0.85 : 0.45;
        const gy = (v * 24) % 1 < 0.14 ? 0.85 : 0.45;
        return Math.max(gx, gy) + (n - 0.5) * 0.08;
      }
      if (style === "fleece") {
        // Serat bulu acak lembut
        const tuft = 0.5 + 0.25 * Math.sin(u * 48 + n * 3) * Math.cos(v * 48 - n * 3);
        return tuft + (n - 0.5) * 0.3;
      }
      if (style === "wool") {
        // Kepang rajutan tebal karpet
        const braid = 0.5 + 0.38 * Math.sin(u * Math.PI * 20 + Math.sin(v * Math.PI * 16));
        return braid + (n - 0.5) * 0.12;
      }
      // Canvas / cotton: anyaman lusi-pakan
      const freq = style === "canvas" ? 36 : 54;
      const warp = Math.sin(u * Math.PI * freq);
      const weft = Math.sin(v * Math.PI * freq);
      const weave = 0.5 + 0.28 * (warp * weft);
      const seam =
        style === "canvas" && (u < 0.06 || u > 0.94) && Math.sin(v * Math.PI * 28) > 0.35
          ? 0.35
          : 0;
      return weave + seam + (n - 0.5) * 0.1;
    },
    (u, v, h) => {
      const seam =
        style === "canvas" && (u < 0.055 || u > 0.945) && Math.sin(v * Math.PI * 28) > 0.4 ? 24 : 0;
      const base = 218 + h * 34 + seam;
      return [base, base, base];
    },
    (_u, _v, h) => {
      if (style === "nylon") return 0.36 + (1 - h) * 0.24;
      if (style === "fleece") return 0.78 + (1 - h) * 0.18;
      return 0.62 + (1 - h) * 0.24;
    },
    repeatX,
    repeatY,
  );
}

/** Polimer HDPE cetak injeksi & karet sabuk konveyor (tanpa albedo agar warna palette terjaga). */
export function makePolymerSurfaceSet(size = 256, repeatX = 1, repeatY = 1): PbrTextureSet {
  return buildHeightAndNormalSet(
    "polymer-hdpe",
    size,
    709,
    2.4,
    (u, v, n) => 0.5 + 0.12 * Math.sin(u * 40 + v * 14) + (n - 0.5) * 0.26,
    (_u, _v, h) => [225 + h * 28, 225 + h * 28, 225 + h * 28],
    (_u, _v, h) => 0.42 + (1 - h) * 0.28,
    repeatX,
    repeatY,
    false,
  );
}

/** Lapisan powder-coat mikro untuk tumbler (tanpa map albedo agar tumbler.test.ts map===null tetap lolos). */
export function makePowderCoatSet(size = 256): PbrTextureSet {
  return buildHeightAndNormalSet(
    "powder-coat",
    size,
    733,
    2.1,
    (u, v, n) => 0.5 + 0.08 * Math.sin(u * 90) * Math.cos(v * 90) + (n - 0.5) * 0.32,
    () => [255, 255, 255],
    (_u, _v, h) => 0.46 + (1 - h) * 0.22,
    3,
    3,
    false,
  );
}

/** Batu/meja slate gelap bertekstur halus (pengganti bidang hitam datar). */
export function makeDarkSlateSet(size = 256, repeatX = 4, repeatY = 4): PbrTextureSet {
  return buildHeightAndNormalSet(
    "dark-slate",
    size,
    811,
    2.8,
    (u, v, n) => {
      const vein = Math.sin(u * Math.PI * 4 + Math.sin(v * Math.PI * 3) * 1.2) * 0.2;
      return 0.5 + vein + (n - 0.5) * 0.24;
    },
    (_u, _v, h, n) => {
      const base = 185 + h * 58 + (n - 0.5) * 14;
      return [base * 0.92, base * 0.96, base * 1.04];
    },
    (_u, _v, h) => 0.58 + (1 - h) * 0.28,
    repeatX,
    repeatY,
  );
}

/** Kulit stylized natural desaturated hangat dengan pori mikro dan garis lipatan. */
export function makeSkinSurfaceSet(size = 256): PbrTextureSet {
  return buildHeightAndNormalSet(
    "skin-natural",
    size,
    907,
    2.6,
    (u, v, n) => {
      const crease = Math.exp(-Math.pow((v - 0.48) * 18, 2)) * -0.28;
      const pore = (n - 0.5) * 0.24 + 0.08 * Math.sin(u * 64 + v * 42);
      return 0.55 + crease + pore;
    },
    (_u, v, h, n) => {
      const knuckleWarmth = 1 - Math.abs(v - 0.5) * 0.16;
      const base = 218 + h * 26 + (n - 0.5) * 10;
      return [base * knuckleWarmth, base * 0.92, base * 0.86];
    },
    (_u, _v, h) => 0.52 + (1 - h) * 0.24,
  );
}

/** Permukaan PET bening dengan guratan cetakan vertikal super halus. */
export function makePetBottleSurfaceSet(size = 256): PbrTextureSet {
  return buildHeightAndNormalSet(
    "pet-bottle",
    size,
    953,
    1.8,
    (u, v, n) => {
      const moldLine = Math.sin(u * Math.PI * 72) * 0.14;
      const microScuff = Math.abs(Math.sin(v * Math.PI * 38 + u * 9)) * 0.08;
      return 0.5 + moldLine + microScuff + (n - 0.5) * 0.12;
    },
    () => [255, 255, 255],
    (_u, _v, h) => 0.06 + (1 - h) * 0.08,
    2,
    1,
    false,
  );
}
