import { clamp01, lerp, smoothstep, type SegId } from "@/engine/timeline";
import { NOTES } from "./synths";

export type AudioEventKind =
  | "glug"
  | "whoosh"
  | "splash"
  | "shatter"
  | "punchNote"
  | "reverseSwell"
  | "chime"
  | "thunk"
  | "lid"
  | "spray"
  | "warm";

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
  b1: {
    id: "b1",
    evaluate: () => ({
      d2Gain: 0.045,
      a2Gain: 0.032,
      colorFreq: NOTES.D3,
      colorGain: 0.025,
      padFreq: NOTES.D4,
      padGain: 0,
      bodyFreq: 120,
      bodyQ: 0.7,
      bodyGain: 0.02,
      airType: "bandpass",
      airFreq: 1600,
      airQ: 0.8,
      airGain: 0,
      worldCutoff: 8000,
      pulseBpm: 0,
      pulseGain: 0,
      tickRate: 0,
      tickCutoff: 2000,
      tickGain: 0,
    }),
    events: [],
  },

  b2: {
    id: "b2",
    evaluate: () => ({
      d2Gain: 0.042,
      a2Gain: 0.032,
      colorFreq: NOTES.F3,
      colorGain: 0.026,
      padFreq: NOTES.D4,
      padGain: 0,
      bodyFreq: 130,
      bodyQ: 0.7,
      bodyGain: 0.018,
      airType: "bandpass",
      airFreq: 1400,
      airQ: 0.9,
      airGain: 0,
      worldCutoff: 7000,
      pulseBpm: 0,
      pulseGain: 0,
      tickRate: 0,
      tickCutoff: 2000,
      tickGain: 0,
    }),
    events: [
      { id: "b2:glug1", kind: "glug", at: 0.28 },
      { id: "b2:glug2", kind: "glug", at: 0.38 },
      { id: "b2:glug3", kind: "glug", at: 0.48 },
      { id: "b2:whoosh", kind: "whoosh", at: 0.72 },
      { id: "b2:splash", kind: "splash", at: 0.92 },
    ],
  },

  b3: {
    id: "b3",
    evaluate: (t) => {
      const underBridge = Math.sin(clamp01((t - 0.42) / 0.14) * Math.PI);
      return {
        d2Gain: 0.04,
        a2Gain: 0.028,
        colorFreq: NOTES.F3,
        colorGain: 0.024,
        padFreq: NOTES.D4,
        padGain: 0,
        bodyFreq: 900,
        bodyQ: 0.9,
        bodyGain: 0.1,
        airType: "lowpass",
        airFreq: 180,
        airQ: 0.7,
        airGain: 0.045,
        worldCutoff: lerp(6000, 2200, underBridge),
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [],
  },

  b4: {
    id: "b4",
    evaluate: (t) => {
      const swell = smoothstep(0.12, 0.48, t);
      const diveIn = smoothstep(0.46, 0.56, t);
      const diveOut = smoothstep(0.74, 0.84, t);
      const underwater = clamp01(diveIn * (1 - diveOut));
      return {
        d2Gain: 0.04,
        a2Gain: 0.026,
        colorFreq: NOTES.F3,
        colorGain: 0.024,
        padFreq: NOTES.Eb3,
        padGain: 0.028,
        bodyFreq: lerp(850, 500, underwater),
        bodyQ: 0.9,
        bodyGain: lerp(0.1, 0.24, swell) * (1 - underwater * 0.4),
        airType: "bandpass",
        airFreq: 950,
        airQ: 0.7,
        airGain: lerp(0.05, 0.12, swell) * (1 - underwater * 0.7),
        worldCutoff: lerp(6000, 400, underwater),
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [],
  },

  b5: {
    id: "b5",
    evaluate: (t) => {
      const crackAmt = clamp01(t / 0.35);
      const breathQuiet = t >= 0.42 && t <= 0.5 ? 0.25 : 1;
      const postBreak = smoothstep(0.5, 0.85, t);
      return {
        d2Gain: lerp(0.08, 0.045, t) * breathQuiet,
        a2Gain: 0,
        colorFreq: NOTES.F3,
        colorGain: 0,
        padFreq: NOTES.D4,
        padGain: 0,
        bodyFreq: 350,
        bodyQ: 0.7,
        bodyGain: 0.02 * breathQuiet,
        airType: "highpass",
        airFreq: 2400,
        airQ: 0.7,
        airGain: lerp(0.02, 0.09, postBreak) * breathQuiet,
        worldCutoff: 1200,
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: t < 0.42 ? lerp(0.2, 3.0, crackAmt) : 0,
        tickCutoff: 3000,
        tickGain: 0.035,
      };
    },
    events: [{ id: "b5:shatter", kind: "shatter", at: 0.5 }],
  },

  b6: {
    id: "b6",
    evaluate: (t) => {
      const fadeOut = smoothstep(0.9, 1.0, t);
      const pulseActive = t < 0.88 ? 1 : 0;
      const tailTone = smoothstep(0.84, 0.94, t) * (1 - fadeOut * 0.5);
      return {
        d2Gain: 0.06 * (1 - fadeOut * 0.4),
        a2Gain: 0,
        colorFreq: NOTES.F3,
        colorGain: 0,
        padFreq: NOTES.A5,
        padGain: 0.02 * tailTone,
        bodyFreq: 220,
        bodyQ: 0.7,
        bodyGain: 0.015 * (1 - fadeOut),
        airType: "highpass",
        airFreq: 2000,
        airQ: 0.7,
        airGain: 0.035 * (1 - fadeOut),
        worldCutoff: 900,
        pulseBpm: 50 * pulseActive,
        pulseGain: lerp(0.08, 0.16, smoothstep(0, 0.7, t)) * pulseActive,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [],
  },

  punch: {
    id: "punch",
    evaluate: (t) => {
      const down = 1 - smoothstep(0, 0.3, t);
      const silent = t >= 0.9 ? 0 : 1;
      return {
        d2Gain: 0.055 * down * silent,
        a2Gain: 0,
        colorFreq: NOTES.F3,
        colorGain: 0,
        padFreq: NOTES.D4,
        padGain: 0,
        bodyFreq: 160,
        bodyQ: 0.7,
        bodyGain: 0.01 * down * silent,
        airType: "bandpass",
        airFreq: 1000,
        airQ: 0.7,
        airGain: 0,
        worldCutoff: 600,
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

  b7: {
    id: "b7",
    evaluate: (t) => {
      const flashMix = t >= 0.4 && t <= 0.7 ? 1 : 0;
      return {
        d2Gain: 0.044,
        a2Gain: 0.032,
        colorFreq: NOTES.Fs3,
        colorGain: 0.028,
        padFreq: NOTES.A4,
        padGain: 0,
        bodyFreq: 1200,
        bodyQ: 0.9,
        bodyGain: 0.06 * flashMix,
        airType: "bandpass",
        airFreq: 1800,
        airQ: 0.8,
        airGain: 0.015 * flashMix,
        worldCutoff: 10000,
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

  b8: {
    id: "b8",
    evaluate: (t) => {
      const washActive = t >= 0.56 && t <= 0.86 ? 1 : 0;
      return {
        d2Gain: 0.04,
        a2Gain: 0.028,
        colorFreq: NOTES.Fs3,
        colorGain: 0.025,
        padFreq: NOTES.D4,
        padGain: 0,
        bodyFreq: 90,
        bodyQ: 1.0,
        bodyGain: 0.068,
        airType: "highpass",
        airFreq: 2600,
        airQ: 0.8,
        airGain: 0.095 * washActive,
        worldCutoff: 9000,
        pulseBpm: 90,
        pulseGain: 0.04,
        tickRate: t >= 0.12 && t <= 0.4 ? 1.5 : 0,
        tickCutoff: 1800,
        tickGain: 0.03,
      };
    },
    events: [{ id: "b8:spray", kind: "spray", at: 0.58 }],
  },

  b9: {
    id: "b9",
    evaluate: (t) => {
      const shredActive = t <= 0.22 ? 1 : 0;
      const furnaceActive = t >= 0.38 && t <= 0.68 ? 1 : 0;
      return {
        d2Gain: 0.044,
        a2Gain: 0.03,
        colorFreq: NOTES.Fs3,
        colorGain: 0.028,
        padFreq: NOTES.A4,
        padGain: 0,
        bodyFreq: 140,
        bodyQ: 0.7,
        bodyGain: 0.025,
        airType: "lowpass",
        airFreq: 2000,
        airQ: 0.9,
        airGain: 0.095 * furnaceActive,
        worldCutoff: 8000,
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 8 * shredActive,
        tickCutoff: 2400,
        tickGain: 0.032,
      };
    },
    events: [{ id: "b9:warm", kind: "warm", at: 0.78 }],
  },

  b10: {
    id: "b10",
    evaluate: (t) => {
      const liftK = smoothstep(0.42, 0.72, t);
      const ctaQuiet = smoothstep(0.72, 0.88, t);
      return {
        d2Gain: lerp(0.038, 0.028, ctaQuiet),
        a2Gain: lerp(0.026, 0.018, ctaQuiet),
        colorFreq: NOTES.Fs3,
        colorGain: lerp(0.024, 0.012, ctaQuiet),
        padFreq: lerp(NOTES.D3, NOTES.A3, liftK),
        padGain: t >= 0.42 && t <= 0.76 ? 0.03 * Math.sin(liftK * Math.PI) : 0,
        bodyFreq: 60,
        bodyQ: 0.7,
        bodyGain: 0.015,
        airType: "bandpass",
        airFreq: 1400,
        airQ: 0.7,
        airGain: 0,
        worldCutoff: 10000,
        pulseBpm: 0,
        pulseGain: 0,
        tickRate: 0,
        tickCutoff: 2000,
        tickGain: 0,
      };
    },
    events: [],
  },
};
