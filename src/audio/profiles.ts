import { clamp01, lerp, smoothstep, type SegId } from "@/engine/timeline";
import { NOTES } from "./synths";

export type AudioEventKind =
  | "glassBell"
  | "glug"
  | "whoosh"
  | "splash"
  | "riser"
  | "shatter"
  | "cutlery"
  | "punchNote"
  | "reverseSwell"
  | "chime"
  | "thunk"
  | "lid"
  | "spray"
  | "metalChime"
  | "warm"
  | "resolveChord";

export interface AudioThresholdEvent {
  readonly id: string;
  readonly kind: AudioEventKind;
  readonly at: number;
  readonly allowReverse?: boolean;
}

export interface AudioFrameTarget {
  readonly d2Gain: number;
  readonly a2Gain: number;
  readonly colorFreq: number;
  readonly colorGain: number;
  readonly padFreq: number;
  readonly padGain: number;
  readonly bodyFreq: number;
  readonly bodyQ: number;
  readonly bodyGain: number;
  readonly airType: BiquadFilterType;
  readonly airFreq: number;
  readonly airQ: number;
  readonly airGain: number;
  readonly worldCutoff: number;
  readonly pulseBpm: number;
  readonly pulseGain: number;
  readonly tickRate: number;
  readonly tickCutoff: number;
  readonly tickGain: number;
}

export interface SegmentAudioProfile {
  readonly id: SegId;
  readonly evaluate: (t: number) => AudioFrameTarget;
  readonly events: readonly AudioThresholdEvent[];
}

export const THUNK_LOCAL_T = 0.36;

export const AUDIO_PROFILES: Record<SegId, SegmentAudioProfile> = {
  // Bab 1: Lahir — D tonik kaca bersih, lapang, dan kilas tipis penuh harap
  b1: {
    id: "b1",
    evaluate: (t) => {
      const breath = 0.5 + 0.5 * Math.sin(t * Math.PI);
      const foreshadow = smoothstep(0.65, 1.0, t);
      return {
        d2Gain: lerp(0.048, 0.044, foreshadow),
        a2Gain: lerp(0.032, 0.028, foreshadow),
        colorFreq: lerp(NOTES.D3, NOTES.F3, foreshadow * 0.25),
        colorGain: 0.026,
        padFreq: NOTES.D4,
        padGain: 0.016 * breath * (1 - foreshadow * 0.5),
        bodyFreq: 110,
        bodyQ: 0.7,
        bodyGain: 0.016,
        airType: "bandpass",
        airFreq: 2200,
        airQ: 0.9,
        airGain: 0.014 * (1 - foreshadow * 0.4),
        worldCutoff: lerp(9600, 8200, foreshadow),
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [{ id: "b1:glass", kind: "glassBell", at: 0.22 }],
  },

  // Bab 2: Sekali Pakai — minor halus, teguk air berjarak, lemparan lembut
  b2: {
    id: "b2",
    evaluate: (t) => {
      const drift = smoothstep(0.55, 0.95, t);
      return {
        d2Gain: 0.042,
        a2Gain: lerp(0.03, 0.024, drift),
        colorFreq: NOTES.F3,
        colorGain: 0.026,
        padFreq: NOTES.D4,
        padGain: 0,
        bodyFreq: lerp(140, 260, drift),
        bodyQ: 0.75,
        bodyGain: lerp(0.014, 0.032, drift),
        airType: "bandpass",
        airFreq: 1400,
        airQ: 0.9,
        airGain: 0.008,
        worldCutoff: lerp(7200, 6200, drift),
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [
      { id: "b2:glug1", kind: "glug", at: 0.28 },
      { id: "b2:glug2", kind: "glug", at: 0.38 },
      { id: "b2:glug3", kind: "glug", at: 0.48 },
      { id: "b2:whoosh", kind: "whoosh", at: 0.72 },
      { id: "b2:splash", kind: "splash", at: 0.92 },
    ],
  },

  // Bab 3: Tersesat — aliran sungai tersaring + dengung kota jauh + kolong jembatan
  b3: {
    id: "b3",
    evaluate: (t) => {
      const underBridge = Math.sin(clamp01((t - 0.42) / 0.16) * Math.PI);
      const drift = smoothstep(0.1, 0.9, t);
      return {
        d2Gain: lerp(0.046, 0.056, drift),
        a2Gain: 0.03,
        colorFreq: NOTES.F3,
        colorGain: 0.024,
        padFreq: NOTES.D4,
        padGain: 0,
        bodyFreq: lerp(920, 740, underBridge),
        bodyQ: 0.95,
        bodyGain: lerp(0.085, 0.135, drift),
        airType: "lowpass",
        airFreq: 165,
        airQ: 0.75,
        airGain: 0.042,
        worldCutoff: lerp(6200, 1650, underBridge),
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [],
  },

  // Bab 4: Lautan — napas samudra luas lalu menyelam dalam yang sunyi dan berat
  b4: {
    id: "b4",
    evaluate: (t) => {
      const swell = smoothstep(0.08, 0.46, t);
      const diveIn = smoothstep(0.46, 0.58, t);
      const diveOut = smoothstep(0.74, 0.86, t);
      const underwater = clamp01(diveIn * (1 - diveOut));
      return {
        d2Gain: lerp(0.044, 0.058, swell),
        a2Gain: lerp(0.028, 0.02, underwater),
        colorFreq: NOTES.F3,
        colorGain: 0.024 * (1 - underwater * 0.25),
        padFreq: NOTES.Eb3,
        padGain: 0.03 * swell,
        bodyFreq: lerp(880, 380, underwater),
        bodyQ: lerp(0.85, 1.1, underwater),
        bodyGain: lerp(0.095, 0.24, swell) * (1 - underwater * 0.45),
        airType: "bandpass",
        airFreq: 980,
        airQ: 0.7,
        airGain: lerp(0.04, 0.115, swell) * (1 - underwater * 0.82),
        worldCutoff: lerp(6600, 360, underwater),
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [],
  },

  // Bab 5: Terurai — naiknya ketegangan riser, retak halus, hening sesaat, lalu pecah butiran
  b5: {
    id: "b5",
    evaluate: (t) => {
      const crackAmt = clamp01(t / 0.4);
      const microHush = t >= 0.42 && t <= 0.5 ? 0.18 : 1;
      const postBreak = smoothstep(0.5, 0.86, t);
      return {
        d2Gain: lerp(0.074, 0.046, t) * microHush,
        a2Gain: 0,
        colorFreq: NOTES.F3,
        colorGain: 0,
        padFreq: NOTES.Eb3,
        padGain: lerp(0.01, 0.028, crackAmt) * (t < 0.5 ? 1 : 0) * microHush,
        bodyFreq: 320,
        bodyQ: 0.7,
        bodyGain: 0.018 * microHush,
        airType: "highpass",
        airFreq: 2500,
        airQ: 0.75,
        airGain: lerp(0.018, 0.088, postBreak) * microHush,
        worldCutoff: lerp(1500, 950, postBreak),
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: t < 0.42 ? lerp(0.3, 3.6, crackAmt) : 0,
        tickCutoff: 3000,
        tickGain: 0.032,
      };
    },
    events: [
      { id: "b5:riser", kind: "riser", at: 0.24 },
      { id: "b5:shatter", kind: "shatter", at: 0.5 },
    ],
  },

  // Bab 6: Kembali ke Kita — detak jantung gelap + resonansi sendok/porselen tipis nan getir
  b6: {
    id: "b6",
    evaluate: (t) => {
      const fadeOut = smoothstep(0.88, 1.0, t);
      const pulseActive = t < 0.88 ? 1 : 0;
      const tailTone = smoothstep(0.82, 0.94, t) * (1 - fadeOut * 0.55);
      return {
        d2Gain: 0.062 * (1 - fadeOut * 0.48),
        a2Gain: 0,
        colorFreq: NOTES.F3,
        colorGain: 0,
        padFreq: NOTES.A5,
        padGain: 0.018 * tailTone,
        bodyFreq: 200,
        bodyQ: 0.7,
        bodyGain: 0.014 * (1 - fadeOut),
        airType: "highpass",
        airFreq: 2100,
        airQ: 0.7,
        airGain: 0.03 * (1 - fadeOut),
        worldCutoff: 850,
        pulseBpm: 52 * pulseActive,
        pulseGain: lerp(0.075, 0.145, smoothstep(0, 0.7, t)) * pulseActive,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [
      { id: "b6:cutlery1", kind: "cutlery", at: 0.24 },
      { id: "b6:cutlery2", kind: "cutlery", at: 0.58 },
    ],
  },

  // Punchline: Layar Hening — jeda sunyi mendadak lalu angkat harmonik D4+A4 yang hangat
  punch: {
    id: "punch",
    evaluate: (t) => {
      const dropBed = 1 - smoothstep(0, 0.18, t);
      const liftBed = smoothstep(0.4, 0.65, t) * (1 - smoothstep(0.82, 0.94, t));
      const endSilent = t >= 0.9 ? 0 : 1;
      return {
        d2Gain: 0.052 * dropBed * endSilent,
        a2Gain: 0,
        colorFreq: NOTES.D3,
        colorGain: 0.012 * liftBed * endSilent,
        padFreq: NOTES.D4,
        padGain: 0.024 * liftBed * endSilent,
        bodyFreq: 150,
        bodyQ: 0.7,
        bodyGain: 0.008 * dropBed * endSilent,
        airType: "bandpass",
        airFreq: 1000,
        airQ: 0.7,
        airGain: 0,
        worldCutoff: lerp(520, 2600, liftBed),
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [
      { id: "punch:reverseSwell", kind: "reverseSwell", at: 0.08 },
      { id: "punch:noteD4", kind: "punchNote", at: 0.4 },
    ],
  },

  // Bab 7: Di Tempat yang Benar — balik ke D mayor hangat + SFX tung plastik tepat di tempat sampah
  b7: {
    id: "b7",
    evaluate: (t) => {
      const flashMix = t >= 0.4 && t <= 0.7 ? 1 : 0;
      return {
        d2Gain: 0.048,
        a2Gain: 0.034,
        colorFreq: NOTES.Fs3,
        colorGain: 0.03,
        padFreq: NOTES.A4,
        padGain: 0,
        bodyFreq: 1200,
        bodyQ: 0.9,
        bodyGain: 0.055 * flashMix,
        airType: "bandpass",
        airFreq: 1850,
        airQ: 0.8,
        airGain: 0.015 * flashMix,
        worldCutoff: 10500,
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [
      { id: "b7:chime", kind: "chime", at: 0.02, allowReverse: true },
      { id: "b7:thunk", kind: "thunk", at: THUNK_LOCAL_T },
      { id: "b7:lid", kind: "lid", at: 0.4 },
    ],
  },

  // Bab 8: Perjalanan Kedua — kerja mekanis ritmis rapi + lorong cuci air bersih
  b8: {
    id: "b8",
    evaluate: (t) => {
      const washActive = t >= 0.56 && t <= 0.86 ? 1 : 0;
      return {
        d2Gain: 0.044,
        a2Gain: 0.03,
        colorFreq: NOTES.Fs3,
        colorGain: 0.028,
        padFreq: NOTES.D4,
        padGain: 0,
        bodyFreq: 90,
        bodyQ: 1.0,
        bodyGain: 0.068,
        airType: "highpass",
        airFreq: 2600,
        airQ: 0.8,
        airGain: 0.095 * washActive,
        worldCutoff: 9200,
        pulseBpm: 90,
        pulseGain: 0.042,
        tickRate: t >= 0.12 && t <= 0.42 ? 2.0 : 0,
        tickCutoff: 1850,
        tickGain: 0.03,
      };
    },
    events: [{ id: "b8:spray", kind: "spray", at: 0.58 }],
  },

  // Bab 9: Hidup Baru — dengung proses + lonceng logam lembut + kilau hangat tote
  b9: {
    id: "b9",
    evaluate: (t) => {
      const shredActive = t <= 0.22 ? 1 : 0;
      const furnaceActive = t >= 0.38 && t <= 0.68 ? 1 : 0;
      return {
        d2Gain: 0.048,
        a2Gain: 0.032,
        colorFreq: NOTES.Fs3,
        colorGain: 0.03,
        padFreq: NOTES.A4,
        padGain: 0,
        bodyFreq: 140,
        bodyQ: 0.75,
        bodyGain: 0.028,
        airType: "lowpass",
        airFreq: 2000,
        airQ: 0.9,
        airGain: 0.088 * furnaceActive,
        worldCutoff: 8600,
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 8 * shredActive,
        tickCutoff: 2400,
        tickGain: 0.028,
      };
    },
    events: [
      { id: "b9:metalChime", kind: "metalChime", at: 0.34 },
      { id: "b9:warm", kind: "warm", at: 0.78 },
    ],
  },

  // Bab 10: Surat Terakhir — akor D terbuka penuh harap, mereda hangat menjelang crossfade loop
  b10: {
    id: "b10",
    evaluate: (t) => {
      const liftK = smoothstep(0.42, 0.74, t);
      const ctaQuiet = smoothstep(0.74, 0.92, t);
      return {
        d2Gain: lerp(0.044, 0.032, ctaQuiet),
        a2Gain: lerp(0.03, 0.022, ctaQuiet),
        colorFreq: NOTES.Fs3,
        colorGain: lerp(0.028, 0.008, ctaQuiet),
        padFreq: lerp(NOTES.D4, NOTES.A4, liftK),
        padGain: t >= 0.42 && t <= 0.78 ? 0.032 * Math.sin(liftK * Math.PI) : 0,
        bodyFreq: 60,
        bodyQ: 0.7,
        bodyGain: 0.014 * (1 - ctaQuiet * 0.4),
        airType: "bandpass",
        airFreq: 1400,
        airQ: 0.7,
        airGain: 0,
        worldCutoff: lerp(10400, 9600, ctaQuiet),
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [{ id: "b10:resolveChord", kind: "resolveChord", at: 0.46 }],
  },
};
