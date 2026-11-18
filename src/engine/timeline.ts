import { LENGTHS_VH, TEMP } from "@/lib/tokens";

// Garis waktu cerita (docs/03 bagian 2, docs/06 bagian 3). Logika murni, tanpa react/three.
// Semua turunan dihitung dari LENGTHS_VH dan TEMP; jangan menulis angka bab di tempat lain.
export { LENGTHS_VH };

export type SegId = keyof typeof LENGTHS_VH;
export type StoryView = "1" | "none" | "2";

export const ORDER: readonly SegId[] = [
  "b1",
  "b2",
  "b3",
  "b4",
  "b5",
  "b6",
  "punch",
  "b7",
  "b8",
  "b9",
  "b10",
];

export const TOTAL_VH: number = ORDER.reduce((sum, id) => sum + LENGTHS_VH[id], 0);

/** Awal tiap segmen dalam rentang 0..1. */
export const STARTS: Readonly<Record<SegId, number>> = (() => {
  const out = {} as Record<SegId, number>;
  let acc = 0;
  for (const id of ORDER) {
    out[id] = acc / TOTAL_VH;
    acc += LENGTHS_VH[id];
  }
  return out;
})();

/** Rentang punchline (layar hening). */
export const PUNCH = { from: STARTS.punch, to: STARTS.b7 } as const;

function endOf(id: SegId): number {
  const next = ORDER[ORDER.indexOf(id) + 1];
  return next === undefined ? 1 : STARTS[next];
}

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 === edge0) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Segmen aktif pada posisi p (0..1) beserta waktu lokal t (0..1). */
export function segmentAt(p: number): { id: SegId; index: number; t: number } {
  const x = clamp01(p);
  let index = 0;
  ORDER.forEach((id, i) => {
    if (x >= STARTS[id]) index = i;
  });
  const id = ORDER[index] ?? "b1";
  const from = STARTS[id];
  const span = endOf(id) - from;
  return { id, index, t: span > 0 ? clamp01((x - from) / span) : 0 };
}

/**
 * Nomor bab 1..10. Punchline tidak punya nomor sendiri: paruh pertama dihitung
 * sebagai bab 6, paruh kedua sebagai bab 7 (keputusan konservatif, lihat DECISIONS.md).
 */
export function chapterAt(shown: number): number {
  const { id, t } = segmentAt(shown);
  if (id === "punch") return t < 0.5 ? 6 : 7;
  return Number(id.slice(1));
}

/** Waktu lokal 0..1 pada bab tertentu (1..10), dijepit di ujung. */
export function localT(shown: number, chapter: number): number {
  const id = `b${chapter}`;
  if (!(id in LENGTHS_VH)) return 0;
  const seg = id as SegId;
  return clamp01((shown - STARTS[seg]) / (endOf(seg) - STARTS[seg]));
}

/** Babak: 1 = Jika Kita Abai, 0 = punchline, 2 = Jika Kita Peduli. */
export function babakAt(shown: number): 0 | 1 | 2 {
  if (shown < PUNCH.from) return 1;
  if (shown < PUNCH.to) return 0;
  return 2;
}

/** Tampilan daftar penanda bab sesuai docs/04 §8 ("1" | "none" | "2"). */
export function viewAt(shown: number): StoryView {
  const babak = babakAt(shown);
  if (babak === 1) return "1";
  if (babak === 0) return "none";
  return "2";
}

const TEMP_PAIR: Record<SegId, readonly [number, number]> = {
  b1: [TEMP.c1, TEMP.c2],
  b2: [TEMP.c2, TEMP.c3],
  b3: [TEMP.c3, TEMP.c4],
  b4: [TEMP.c4, TEMP.c5],
  b5: [TEMP.c5, TEMP.c6],
  b6: [TEMP.c6, TEMP.cp0],
  punch: [TEMP.cp0, TEMP.cp1],
  b7: [TEMP.c7, TEMP.c8],
  b8: [TEMP.c8, TEMP.c9],
  b9: [TEMP.c9, TEMP.c10],
  b10: [TEMP.c10, TEMP.c10],
};

/**
 * Suhu cerita (°C) berdasarkan posisi `p` (0..1) dari TEMP:
 * - Babak I (b1..b6): dataran 70% awal bab, bergeser mulus di 30% akhir ke bab berikut.
 * - Punchline: bertahan di cp0 (4.0) hingga t=0.08 lalu rewind ke cp1 (1.5) di t=0.08..0.40.
 * - Babak II (b7..b10): konsisten +1.5°C.
 */
export function temperatureAt(p: number): number {
  const { id, t } = segmentAt(p);
  const [from, to] = TEMP_PAIR[id];
  if (id === "punch") {
    return lerp(from, to, smoothstep(0.08, 0.4, t));
  }
  return lerp(from, to, smoothstep(0.7, 1, t));
}

