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

/** Isyarat awal tiap palet (dok. 02 bagian 5); keyframe lokal diatur cues.ts. */
export interface ChapterCues {
  grain: number;
  vignette: number;
  fog: number;
  shimmer: number;
  melt: number;
  crack: number;
  turbid: number;
  rim: number;
  env: number;
  particles: number;
}

export const CUES = {
  c1: {
    grain: 0.06,
    vignette: 0,
    fog: 0,
    shimmer: 0,
    melt: 0,
    crack: 0,
    turbid: 0,
    rim: 3,
    env: 0.6,
    particles: 0,
  },
  c2: {
    grain: 0.1,
    vignette: 0.05,
    fog: 0,
    shimmer: 0,
    melt: 0,
    crack: 0,
    turbid: 0.1,
    rim: 2.8,
    env: 0.55,
    particles: 0,
  },
  c3: {
    grain: 0.14,
    vignette: 0.1,
    fog: 0.02,
    shimmer: 0,
    melt: 0,
    crack: 0,
    turbid: 0.45,
    rim: 2.4,
    env: 0.5,
    particles: 0,
  },
  c4: {
    grain: 0.18,
    vignette: 0.3,
    fog: 0.01,
    shimmer: 2,
    melt: 0,
    crack: 0,
    turbid: 0.6,
    rim: 2,
    env: 0.42,
    particles: 0,
  },
  c5: {
    grain: 0.24,
    vignette: 0.42,
    fog: 0.02,
    shimmer: 4,
    melt: 0.25,
    crack: 0.55,
    turbid: 0.8,
    rim: 1.6,
    env: 0.34,
    particles: 0,
  },
  c6: {
    grain: 0.3,
    vignette: 0.55,
    fog: 0.02,
    shimmer: 6,
    melt: 0.6,
    crack: 1,
    turbid: 0.9,
    rim: 1.2,
    env: 0.25,
    particles: 1,
  },
  cp0: {
    grain: 0.3,
    vignette: 0.55,
    fog: 0,
    shimmer: 6,
    melt: 1,
    crack: 1,
    turbid: 0.9,
    rim: 1.2,
    env: 0.25,
    particles: 1,
  },
  cp1: {
    grain: 0.08,
    vignette: 0,
    fog: 0,
    shimmer: 0,
    melt: 0,
    crack: 0,
    turbid: 0,
    rim: 0.2,
    env: 0.08,
    particles: 0,
  },
  c7: {
    grain: 0.08,
    vignette: 0,
    fog: 0,
    shimmer: 0,
    melt: 0,
    crack: 0,
    turbid: 0,
    rim: 2.6,
    env: 0.7,
    particles: 0,
  },
  c8: {
    grain: 0.07,
    vignette: 0,
    fog: 0,
    shimmer: 0,
    melt: 0,
    crack: 0,
    turbid: 0,
    rim: 2.6,
    env: 0.7,
    particles: 0,
  },
  c9: {
    grain: 0.06,
    vignette: 0,
    fog: 0,
    shimmer: 0,
    melt: 0,
    crack: 0,
    turbid: 0,
    rim: 2.6,
    env: 0.7,
    particles: 0,
  },
  c10: {
    grain: 0.04,
    vignette: 0,
    fog: 0,
    shimmer: 0,
    melt: 0,
    crack: 0,
    turbid: 0,
    rim: 2.6,
    env: 0.75,
    particles: 0,
  },
} as const satisfies Record<keyof typeof PALETTE, ChapterCues>;

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

/** Dimensi komponen umum (docs/02 bagian 6). */
export const SIZE = {
  menuButton: "56px",
  menuButtonMobile: "48px",
  menuDot: "6px",
  menuDotGap: "8px",
  inputHeight: "56px",
  buttonHeight: "52px",
  pillHeight: "48px",
  touchTarget: "56px",
  icon: "24px",
  iconArrow: "28px",
  focusRing: "2px",
  cardRadius: "12px",
} as const;

/** Panel menu (docs/02 bagian 6.3). */
export const MENU = {
  width: "clamp(320px, 25vw, 520px)",
  widthMobile: "min(88vw, 380px)",
  linkSize: "clamp(2rem, 3.2vw, 3.25rem)",
  linkLineHeight: 1.05,
  numberSize: "12px",
  identitySize: "28px",
  taglineSize: "15px",
  subtemaSize: "13px",
  contactSize: "14px",
  activeDot: "8px",
  hoverOpacity: 0.35,
  dividerOpacity: 0.15,
} as const;

/** Kursor cincin (docs/02 bagian 6.5). */
export const RING = {
  radius: "21px",
  stroke: "1.5px",
  scaleHover: 1.7,
  labelSize: "11px",
} as const;

/** Penanda bab (docs/02 bagian 6.4). */
export const MARKER = {
  box: "8px",
  boxMobile: "5px",
  gap: "12px",
  left: "40px",
  leftMobile: "14px",
  labelSize: "13px",
  numberSize: "12px",
  tempSize: "12px",
  lineOpacity: 0.2,
  activeOpacity: 1,
  idleOpacity: 0.35,
  tempOpacity: 0.8,
} as const;

/** Gaya "Re:" pudar/menyala (docs/02 bagian 2.5). */
export const RE = {
  dim: 0.45,
  on: 1,
} as const;

/** Ketebalan garis dan opasitas pemisah (docs/02 bagian 3 dan 6). */
export const LINE = {
  thin: "1px",
  firm: "1.5px",
  focus: "2px",
  focusOffset: "3px",
  navUnderline: "1.5px",
  inputUnderline: "1.5px",
  hintUnderline: "1px",
  panelBorderOpacity: 0.14,
  cardDividerOpacity: 0.25,
  menuDivider: "rgba(11, 26, 51, 0.15)",
} as const;

/** Panjang baca dan batas ukuran teks (docs/02 bagian 2.3). */
export const READ = {
  bodyChars: "62ch",
  scenarioChars: "38ch",
  minBody: "16px",
  minLabel: "12px",
} as const;

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
  // Durasi penting lain (docs/02 bagian 2.5 dan 6)
  reGlow: 0.9,
  scrollHint: 2.4,
  reveal: 0.7,
  chipFlip: 0.35,
  hover: 0.3,
  bandFill: 0.9,
  letterStagger: 0.04,
} as const;

/** Alias stagger lintas komponen; nilainya diambil dari DUR agar tetap satu sumber. */
export const STAGGER = {
  nav: DUR.navStagger,
  menu: DUR.menuStagger,
  card: DUR.menuStagger,
  letter: DUR.letterStagger,
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
