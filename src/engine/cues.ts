import { CUES, type ChapterCues } from "@/lib/tokens";
import { lerp, segmentAt, smoothstep, type SegId } from "./timeline";

type CueKey = keyof typeof CUES;

const SEG_CUE_PAIR: Record<SegId, readonly [CueKey, CueKey]> = {
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

function lerpCues(a: ChapterCues, b: ChapterCues, t: number): ChapterCues {
  return {
    grain: lerp(a.grain, b.grain, t),
    vignette: lerp(a.vignette, b.vignette, t),
    fog: lerp(a.fog, b.fog, t),
    shimmer: lerp(a.shimmer, b.shimmer, t),
    melt: lerp(a.melt, b.melt, t),
    crack: lerp(a.crack, b.crack, t),
    turbid: lerp(a.turbid, b.turbid, t),
    rim: lerp(a.rim, b.rim, t),
    env: lerp(a.env, b.env, t),
    particles: lerp(a.particles, b.particles, t),
  };
}

/**
 * Menghitung seluruh isyarat visual pada posisi `p` (0..1) dari CUES
 * beserta keyframe lokal (kabut B3, melt/crack/partikel B5-B6, rewind punchline).
 */
export function computeCues(p: number): ChapterCues {
  const { id, t } = segmentAt(p);

  if (id === "punch") {
    // 0.00..0.08: fade out B6, vignette naik ke 0.70
    // 0.08..0.40: rewind ke cp1
    // 0.48..0.90: tahan teks, vignette turun 0.70 -> 0
    // 0.90..1.00: rim/env bertransisi ke c7
    const rewindT = smoothstep(0.08, 0.4, t);
    const toC7 = smoothstep(0.9, 1, t);

    let vignette: number;
    if (t <= 0.08) {
      vignette = lerp(CUES.cp0.vignette, 0.7, smoothstep(0, 0.08, t));
    } else if (t <= 0.48) {
      vignette = 0.7;
    } else {
      vignette = lerp(0.7, 0, smoothstep(0.48, 0.9, t));
    }

    const rim =
      t < 0.9 ? lerp(CUES.cp0.rim, CUES.cp1.rim, rewindT) : lerp(CUES.cp1.rim, CUES.c7.rim, toC7);
    const env =
      t < 0.9 ? lerp(CUES.cp0.env, CUES.cp1.env, rewindT) : lerp(CUES.cp1.env, CUES.c7.env, toC7);

    return {
      grain: lerp(CUES.cp0.grain, CUES.cp1.grain, rewindT),
      vignette,
      fog: 0,
      shimmer: lerp(CUES.cp0.shimmer, CUES.cp1.shimmer, rewindT),
      melt: lerp(CUES.cp0.melt, CUES.cp1.melt, rewindT),
      crack: lerp(CUES.cp0.crack, CUES.cp1.crack, rewindT),
      turbid: lerp(CUES.cp0.turbid, CUES.cp1.turbid, rewindT),
      rim,
      env,
      particles: lerp(CUES.cp0.particles, CUES.cp1.particles, rewindT),
    };
  }

  const [fromKey, toKey] = SEG_CUE_PAIR[id];
  const from = CUES[fromKey];
  const to = CUES[toKey];

  if (id === "b10") {
    return { ...from };
  }

  const cues = lerpCues(from, to, t);

  if (id === "b3") {
    // Kabut B3 menebal 0.02 -> 0.06 saat menyusuri kota, lalu menipis di muara ke c4 (0.01)
    cues.fog =
      t <= 0.72 ? lerp(from.fog, 0.06, t / 0.72) : lerp(0.06, to.fog, smoothstep(0.72, 1, t));
  } else if (id === "b5") {
    // B5: melt 0.25 -> 0.6, retak latar 0.55 -> 0.8 (dataran) -> 1.0, partikel mulai di t=0.50 -> 0.7 -> 1.0
    cues.crack = t <= 0.7 ? lerp(from.crack, 0.8, t / 0.7) : lerp(0.8, to.crack, (t - 0.7) / 0.3);
    if (t <= 0.5) {
      cues.particles = 0;
    } else if (t <= 0.85) {
      cues.particles = lerp(0, 0.7, (t - 0.5) / 0.35);
    } else {
      cues.particles = lerp(0.7, to.particles, (t - 0.85) / 0.15);
    }
  } else if (id === "b6") {
    cues.crack = 1;
    cues.particles = 1;
  }

  return cues;
}

interface CueEntry {
  value: number;
  text: string;
}

const CACHE = new WeakMap<HTMLElement, Record<string, CueEntry>>();
const DIFF_THRESHOLD = 0.001;

function formatNum(value: number): string {
  if (Math.abs(value) <= 1e-6) return "0";
  if (Math.abs(value - 1) <= 1e-6) return "1";
  return String(Number(value.toFixed(4)));
}

function writeDiff(
  el: HTMLElement,
  cache: Record<string, CueEntry>,
  prop: string,
  value: number,
  suffix = "",
): void {
  const text = `${formatNum(value)}${suffix}`;
  const prev = cache[prop];
  if (!prev) {
    cache[prop] = { value, text };
    el.style.setProperty(prop, text);
    return;
  }
  const isEndpoint = Math.abs(value) <= 1e-6 || Math.abs(value - 1) <= 1e-6;
  const hitEndpoint = isEndpoint && prev.text !== text;
  if (hitEndpoint || (Math.abs(value - prev.value) > DIFF_THRESHOLD && prev.text !== text)) {
    cache[prop] = { value, text };
    el.style.setProperty(prop, text);
  }
}

/** Menulis variabel CSS isyarat DOM secara diff-only dan mengembalikan objek ChapterCues. */
export function applyCues(p: number, root?: HTMLElement): ChapterCues {
  const cues = computeCues(p);
  const el = root ?? (typeof document !== "undefined" ? document.documentElement : undefined);
  if (!el) return cues;

  let cache = CACHE.get(el);
  if (!cache) {
    cache = {};
    CACHE.set(el, cache);
  }

  writeDiff(el, cache, "--grain", cues.grain);
  writeDiff(el, cache, "--vignette", cues.vignette);
  writeDiff(el, cache, "--melt", cues.melt);
  writeDiff(el, cache, "--crack", cues.crack);
  writeDiff(el, cache, "--shimmer", cues.shimmer, "px");

  return cues;
}
