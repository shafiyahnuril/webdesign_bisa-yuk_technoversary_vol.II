import { PALETTE } from "@/lib/tokens";
import { segmentAt, smoothstep, type SegId } from "./timeline";

export type PaletteId = keyof typeof PALETTE;

export interface ComputedPalette {
  from: PaletteId;
  to: PaletteId;
  mix: number;
  inkMix: number;
  bgA: string;
  bgB: string;
  accentA: string;
  accentB: string;
  inkA: string;
  inkB: string;
}

const SEG_PAIR: Record<SegId, readonly [PaletteId, PaletteId]> = {
  b1: ["c1", "c2"],
  b2: ["c2", "c3"],
  b3: ["c3", "c4"],
  b4: ["c4", "c5"],
  b5: ["c5", "c6"],
  b6: ["c6", "cp0"],
  punch: ["cp0", "cp1"],
  b7: ["c7", "c8"],
  b8: ["c8", "c9"],
  b9: ["c9", "c10"],
  b10: ["c10", "c10"],
};

/**
 * Menghitung palet aktif dan rasio interpolasi (dataran 70/30) pada posisi `p` (0..1).
 * Khusus Bab 9 -> 10, ink hanya dibalik pada t = 0.90..0.95 saat layar bebas teks.
 */
export function computePalette(p: number): ComputedPalette {
  const { id, t } = segmentAt(p);

  if (id === "punch") {
    let from: PaletteId;
    let to: PaletteId;
    let mix: number;

    if (t < 0.4) {
      from = "cp0";
      to = "cp1";
      mix = t <= 0.08 ? 0 : smoothstep(0.08, 0.4, t);
    } else {
      from = "cp1";
      to = "c7";
      mix = t < 0.9 ? 0 : smoothstep(0.9, 1, t);
    }

    const a = PALETTE[from];
    const b = PALETTE[to];
    return {
      from,
      to,
      mix,
      inkMix: mix,
      bgA: a.bg,
      bgB: b.bg,
      accentA: a.accent,
      accentB: b.accent,
      inkA: a.ink,
      inkB: b.ink,
    };
  }

  const [from, to] = SEG_PAIR[id];
  const a = PALETTE[from];
  const b = PALETTE[to];
  const mix = id === "b10" ? 0 : smoothstep(0.7, 1, t);

  if (id === "b9") {
    let inkA = a.ink;
    let inkB = b.ink;
    let inkMix = 0;

    if (t <= 0.9 + 1e-12) {
      inkA = a.ink;
      inkB = a.ink;
      inkMix = 0;
    } else if (t >= 0.95 - 1e-12) {
      inkA = b.ink;
      inkB = b.ink;
      inkMix = 1;
    } else {
      inkMix = smoothstep(0.9, 0.95, t);
    }

    return {
      from,
      to,
      mix,
      inkMix,
      bgA: a.bg,
      bgB: b.bg,
      accentA: a.accent,
      accentB: b.accent,
      inkA,
      inkB,
    };
  }

  return {
    from,
    to,
    mix,
    inkMix: mix,
    bgA: a.bg,
    bgB: b.bg,
    accentA: a.accent,
    accentB: b.accent,
    inkA: a.ink,
    inkB: b.ink,
  };
}

interface PaletteCache {
  vars: Record<string, string>;
  mix: number;
  inkMix: number;
}

const CACHE = new WeakMap<HTMLElement, PaletteCache>();
const MIX_THRESHOLD = 0.001;

function formatPct(value: number): string {
  if (value <= 0) return "0%";
  if (value >= 1) return "100%";
  return `${Number((value * 100).toFixed(2))}%`;
}

function shouldUpdateScalar(prev: number | undefined, next: number): boolean {
  if (prev === undefined) return true;
  if (prev === next) return false;
  if ((next === 0 || next === 1) && prev !== next) return true;
  return Math.abs(next - prev) > MIX_THRESHOLD;
}

/** Menulis variabel CSS palet OKLCH ke `root` secara diff-only dan mengembalikan hasil hitungan. */
export function applyPalette(p: number, root?: HTMLElement): ComputedPalette {
  const palette = computePalette(p);
  const el = root ?? (typeof document !== "undefined" ? document.documentElement : undefined);
  if (!el) return palette;

  let cache = CACHE.get(el);
  if (!cache || !el.style.getPropertyValue("--bg-now")) {
    cache = { vars: {}, mix: Number.NaN, inkMix: Number.NaN };
    CACHE.set(el, cache);
  }

  const writeStr = (name: string, val: string) => {
    if (cache.vars[name] !== val) {
      cache.vars[name] = val;
      el.style.setProperty(name, val);
    }
  };

  writeStr("--bg-a", palette.bgA);
  writeStr("--bg-b", palette.bgB);
  writeStr("--accent-a", palette.accentA);
  writeStr("--accent-b", palette.accentB);
  writeStr("--ink-a", palette.inkA);
  writeStr("--ink-b", palette.inkB);

  if (shouldUpdateScalar(Number.isNaN(cache.mix) ? undefined : cache.mix, palette.mix)) {
    cache.mix = palette.mix;
    writeStr("--mix", formatPct(palette.mix));
  }

  if (shouldUpdateScalar(Number.isNaN(cache.inkMix) ? undefined : cache.inkMix, palette.inkMix)) {
    cache.inkMix = palette.inkMix;
    writeStr("--ink-mix", formatPct(palette.inkMix));
  }

  writeStr("--bg-now", "color-mix(in oklch, var(--bg-a), var(--bg-b) var(--mix))");
  writeStr("--accent-now", "color-mix(in oklch, var(--accent-a), var(--accent-b) var(--mix))");
  writeStr("--ink-now", "color-mix(in oklch, var(--ink-a), var(--ink-b) var(--ink-mix))");

  return palette;
}
