import type { BottleQualitySpec } from "./objects/bottle";

export type QualityTier = "high" | "medium" | "low";

export interface QualityConfig extends BottleQualitySpec {
  readonly tier: QualityTier;
  readonly dprCap: number;
  readonly particles: number;
  readonly waterSegments: number;
  readonly caustics: boolean;
  readonly canvasShimmer: boolean;
  readonly meltFilter: boolean;
  readonly flashScissor: boolean;
  readonly windowAtlas: boolean;
  readonly antialias: boolean;
}

export const QUALITY_PRESETS: Readonly<Record<QualityTier, QualityConfig>> = {
  high: {
    tier: "high",
    dprCap: 2,
    particles: 2400,
    waterSegments: 160,
    bottleSegments: 48,
    bottleShards: { radial: 12, bands: 4 },
    crackSize: 1024,
    transmission: true,
    caustics: true,
    canvasShimmer: true,
    meltFilter: true,
    flashScissor: true,
    windowAtlas: true,
    antialias: true,
  },
  medium: {
    tier: "medium",
    dprCap: 1.5,
    particles: 1400,
    waterSegments: 110,
    bottleSegments: 32,
    bottleShards: { radial: 12, bands: 4 },
    crackSize: 1024,
    transmission: true,
    caustics: false,
    canvasShimmer: false,
    meltFilter: true,
    flashScissor: true,
    windowAtlas: true,
    antialias: true,
  },
  low: {
    tier: "low",
    dprCap: 1,
    particles: 800,
    waterSegments: 64,
    bottleSegments: 20,
    bottleShards: { radial: 8, bands: 3 },
    crackSize: 512,
    transmission: false,
    caustics: false,
    canvasShimmer: false,
    meltFilter: false,
    flashScissor: false,
    windowAtlas: false,
    antialias: false,
  },
};

const FRAME_WINDOW = 90;
const MIN_AVG_FPS = 45;
const SUSTAINED_LOW_SECONDS = 2.0;
const COOLDOWN_SECONDS = 6.0;
const MAX_VALID_DT = 0.5;

export function parseQualityParam(
  search = typeof window !== "undefined" ? window.location.search : "",
): QualityTier | null {
  if (!search) return null;
  const params = new URLSearchParams(search);
  const raw = params.get("q")?.toLowerCase();
  if (raw === "high" || raw === "medium" || raw === "low") return raw;
  return null;
}

export function detectInitialQuality(): { tier: QualityTier; forced: boolean } {
  const forcedTier = parseQualityParam();
  if (forcedTier) {
    return { tier: forcedTier, forced: true };
  }
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { tier: "high", forced: false };
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  if (nav.connection?.saveData) {
    return { tier: "low", forced: false };
  }

  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const width = window.innerWidth || 1280;

  if (cores <= 2 || memory <= 2) {
    return { tier: "low", forced: false };
  }
  if (coarse || width < 768 || cores <= 4 || memory <= 4) {
    return { tier: "medium", forced: false };
  }
  return { tier: "high", forced: false };
}

export type QualityListener = (tier: QualityTier, config: QualityConfig) => void;

/**
 * Mengelola tier kualitas HIGH / MEDIUM / LOW.
 * Penurunan otomatis saja (tanpa naik otomatis): rata-rata 90 frame < 45 FPS
 * selama 2 detik berturut-turut, dengan masa tunggu 6 detik antar penurunan.
 */
export class QualityManager {
  private _tier: QualityTier;
  private _forced: boolean;
  private readonly listeners = new Set<QualityListener>();

  private readonly dts = new Float64Array(FRAME_WINDOW);
  private head = 0;
  private count = 0;
  private windowSum = 0;
  private belowSeconds = 0;
  private cooldownRemaining = 0;

  constructor(initialTier?: QualityTier, opts?: { forced?: boolean }) {
    if (initialTier) {
      this._tier = initialTier;
      this._forced = opts?.forced ?? false;
    } else {
      const detected = detectInitialQuality();
      this._tier = detected.tier;
      this._forced = opts?.forced ?? detected.forced;
    }
  }

  get tier(): QualityTier {
    return this._tier;
  }

  get config(): QualityConfig {
    return QUALITY_PRESETS[this._tier];
  }

  get isForced(): boolean {
    return this._forced;
  }

  setTier(tier: QualityTier, forced?: boolean): boolean {
    if (forced !== undefined) this._forced = forced;
    if (this._tier === tier) return false;
    this._tier = tier;
    this.resetWindow();
    const cfg = this.config;
    this.listeners.forEach((fn) => fn(tier, cfg));
    return true;
  }

  recordFrame(dtSeconds: number): QualityTier | null {
    if (dtSeconds <= 0 || dtSeconds > MAX_VALID_DT) return null;

    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dtSeconds);
    }

    if (this.count < FRAME_WINDOW) {
      this.dts[this.head] = dtSeconds;
      this.windowSum += dtSeconds;
      this.count++;
      this.head = (this.head + 1) % FRAME_WINDOW;
    } else {
      const evicted = this.dts[this.head] ?? 0;
      this.dts[this.head] = dtSeconds;
      this.windowSum += dtSeconds - evicted;
      this.head = (this.head + 1) % FRAME_WINDOW;
    }

    if (this.count < FRAME_WINDOW || this._forced || this._tier === "low") {
      return null;
    }

    const avgFps = this.windowSum > 0 ? this.count / this.windowSum : 60;
    if (avgFps < MIN_AVG_FPS) {
      this.belowSeconds += dtSeconds;
      if (this.belowSeconds >= SUSTAINED_LOW_SECONDS && this.cooldownRemaining <= 0) {
        const nextTier: QualityTier = this._tier === "high" ? "medium" : "low";
        this.cooldownRemaining = COOLDOWN_SECONDS;
        this.setTier(nextTier);
        return nextTier;
      }
    } else {
      this.belowSeconds = 0;
    }

    return null;
  }

  subscribe(listener: QualityListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private resetWindow(): void {
    this.head = 0;
    this.count = 0;
    this.windowSum = 0;
    this.belowSeconds = 0;
  }
}
