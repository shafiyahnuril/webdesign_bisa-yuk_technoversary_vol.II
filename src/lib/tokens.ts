// Sumber tunggal angka desain (docs/02, docs/03 bagian 2, docs/06 bagian 9).
// File ini TIDAK boleh punya impor: dibaca juga oleh scripts/gen-tokens.mjs.
// Komponen dilarang menaruh hex/ukuran bebas; pakai variabel CSS hasil generate.

export interface ChapterColors {
  bg: string;
  accent: string;
  ink: string;
}

/** Palet cerita per bab. Suhu (°C) ada di TEMP. */
export const PALETTE = {
  c1: { bg: "#0B2B80", accent: "#8FD3FF", ink: "#F3F8FF" },
  c2: { bg: "#12336F", accent: "#9CC6EA", ink: "#F3F8FF" },
  c3: { bg: "#183558", accent: "#8FB0CC", ink: "#F3F8FF" },
  c4: { bg: "#142848", accent: "#86A8D0", ink: "#F3F8FF" },
  c5: { bg: "#101C38", accent: "#8098C2", ink: "#F3F8FF" },
  c6: { bg: "#0A1226", accent: "#8A96C8", ink: "#F3F8FF" },
  cp0: { bg: "#05080F", accent: "#C9D3E6", ink: "#EDEDED" },
  cp1: { bg: "#08131F", accent: "#C9D3E6", ink: "#EDEDED" },
  c7: { bg: "#1F4F5E", accent: "#9FE6D0", ink: "#F1FAF7" },
  c8: { bg: "#226B63", accent: "#B9F3C9", ink: "#F1FAF7" },
  // Amber hanya untuk kilau tungku lokal (bukan teks)
  c9: { bg: "#2E7D5B", accent: "#F6B35A", ink: "#F4FBF6" },
  // Aksen c10 hanya untuk objek/grafis >= 3:1; teks selalu ink
  c10: { bg: "#D9E6D6", accent: "#0F8B8D", ink: "#11261B" },
} as const satisfies Record<string, ChapterColors>;

/** Suhu (°C) per palet pada awal bagian. */
export const TEMP = {
  c1: 1.2,
  c2: 1.5,
  c3: 2.0,
  c4: 2.7,
  c5: 3.3,
  c6: 4.0,
  cp0: 4.0,
  cp1: 1.5,
  c7: 1.5,
  c8: 1.5,
  c9: 1.5,
  c10: 1.5,
} as const;

/** Warna pendukung tetap. */
export const COLORS = {
  bone: "#E6EAF2",
  heroBg: "#0B2B80",
  sage: "#D9E6D6",
  amberGlow: "#F6B35A",
  tumbler: "#0F8B8D",
  menuBg: "#EEF2EF",
  menuInk: "#0B1A33",
  scrim: "rgba(5, 10, 25, 0.45)",
  panelLight: "#F4F8F2",
  cardNegBg: "#183558",
  cardNegInk: "#E8EEF6",
  cardNegLabel: "#8FB0CC",
  cardPosBg: "#1F5C55",
  cardPosInk: "#F1FAF7",
  cardPosLabel: "#9FE6D0",
} as const;

/** Skala spasi (basis 4px). */
export const SPACE = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "32px",
  8: "40px",
  9: "56px",
  10: "80px",
  11: "120px",
} as const;

export const RADIUS = {
  sm: "6px",
  md: "12px",
  lg: "20px",
  xl: "32px",
  full: "999px",
} as const;

/** Lapisan z-index. */
export const Z = {
  bg: 0,
  hero: 10,
  canvas: 20,
  text: 30,
  marker: 40,
  dome: 50,
  overlay: 60,
  scrim: 80,
  menu: 90,
  nav: 100,
  cursor: 1000,
} as const;

export const BREAKPOINTS = { sm: 480, md: 768, lg: 1024, xl: 1440 } as const;

export const EASE = {
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  gate: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  heavyIn: "cubic-bezier(0.7, 0, 0.84, 0)",
} as const;

/** Durasi gerak dalam detik. */
export const DUR = {
  fast: 0.2,
  base: 0.4,
  slow: 0.9,
  menu: 0.5,
  menuStagger: 0.06,
  navCollapse: 0.55,
  navStagger: 0.05,
  marker: 0.45,
  chaptersSwap: 0.4,
} as const;

/** Panjang tiap segmen cerita dalam vh. Ubah panjang bab HANYA di sini. */
export const LENGTHS_VH = {
  b1: 140,
  b2: 180,
  b3: 200,
  b4: 200,
  b5: 220,
  b6: 220,
  punch: 180,
  b7: 140,
  b8: 180,
  b9: 200,
  b10: 380,
} as const;

/** Parameter mesin gulir (PROTOTIPE, disetel di T6.1; catat di CHANGELOG_PARAMETER). */
export const ENGINE = {
  MAX_SPEED_VH: 70,
  CHASE: 8,
  GAIN: 1 / 1400,
  REST_DELAY: 90,
  DECAY: 0.12,
} as const;

export const MAX_SPEED_VH = ENGINE.MAX_SPEED_VH;
export const CHASE = ENGINE.CHASE;
export const GAIN = ENGINE.GAIN;
export const REST_DELAY = ENGINE.REST_DELAY;
export const DECAY = ENGINE.DECAY;
