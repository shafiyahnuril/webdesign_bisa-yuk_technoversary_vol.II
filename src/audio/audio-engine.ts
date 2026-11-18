import { STARTS, clamp01, segmentAt, type SegId } from "@/engine/timeline";
import { getDevFlags } from "@/lib/debug";
import { AUDIO_PROFILES, THUNK_LOCAL_T, type AudioEventKind } from "./profiles";
import {
  NOTES,
  createDrone,
  createNodeTracker,
  createNoiseBed,
  createNoiseBuffer,
  triggerFilteredNoiseShot,
  triggerNote,
  triggerPulse,
  triggerSwell,
  triggerThunk,
  triggerTick,
  type DroneRig,
  type NoiseBedRig,
} from "./synths";

export { THUNK_LOCAL_T };

const STORAGE_KEY = "rebottle:sound";
const UPDATE_INTERVAL_SEC = 0.1; // 10 Hz
const MASTER_MAX_GAIN = 0.35;
const FADE_IN_SEC = 1.5;
const FADE_OUT_SEC = 0.4;
const DUCK_TC_SEC = 0.3;
const ANTI_SPAM_MS = 1000;

export interface AudioController {
  setEnabled(enabled: boolean): Promise<void>;
  update(shown: number, dt: number): void;
  setDucked(ducked: boolean): void;
  reset(): void;
  dispose(): void;
  isEnabled(): boolean;
  isSupported(): boolean;
  getActiveNodeCount(): number;
}

type AudioContextConstructor = new () => AudioContext;

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  const win = window as Window & {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

export function isAudioSupported(): boolean {
  if (getDevFlags().noAudio) return false;
  return getAudioContextConstructor() !== null;
}

function writeSoundPreference(enabled: boolean): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // Abaikan kegagalan storage di mode privat
  }
}

function endOfSeg(id: SegId): number {
  const keys = Object.keys(STARTS) as SegId[];
  const idx = keys.indexOf(id);
  const next = keys[idx + 1];
  return next ? STARTS[next] : 1;
}

export function createAudioEngine(): AudioController {
  const supported = isAudioSupported();
  const tracker = createNodeTracker(24);

  let enabled = false;
  let ducked = false;
  let disposed = false;

  let ctx: AudioContext | null = null;
  let ambientBus: GainNode | null = null;
  let worldFilter: BiquadFilterNode | null = null;
  let sfxBus: GainNode | null = null;
  let masterGain: GainNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let noiseBuffer: AudioBuffer | null = null;
  let drone: DroneRig | null = null;
  let noiseBed: NoiseBedRig | null = null;
  let backboneAcquired = 0;

  let lastShown = 0;
  let lastSegId: SegId = "b1";
  let updateAccumSec = 0;
  let pulseAccumSec = 0;
  let tickAccumSec = 0;
  const lastFiredAtMs = new Map<string, number>();

  const ensureGraph = (): boolean => {
    if (ctx) return true;
    const Ctor = getAudioContextConstructor();
    if (!Ctor) return false;

    const audioCtx = new Ctor();
    if (!tracker.acquire(5)) {
      void audioCtx.close().catch(() => {});
      return false;
    }
    backboneAcquired = 5;
    ctx = audioCtx;

    ambientBus = audioCtx.createGain();
    ambientBus.gain.setValueAtTime(ducked ? 0.5 : 1.0, audioCtx.currentTime);

    worldFilter = audioCtx.createBiquadFilter();
    worldFilter.type = "lowpass";
    worldFilter.frequency.setValueAtTime(8000, audioCtx.currentTime);
    worldFilter.Q.setValueAtTime(0.7, audioCtx.currentTime);

    sfxBus = audioCtx.createGain();
    sfxBus.gain.setValueAtTime(1.0, audioCtx.currentTime);

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);

    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0.01, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

    ambientBus.connect(worldFilter);
    worldFilter.connect(masterGain);
    sfxBus.connect(masterGain);
    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);

    noiseBuffer = createNoiseBuffer(audioCtx, 4);
    drone = createDrone(audioCtx, ambientBus, tracker);
    noiseBed = createNoiseBed(audioCtx, noiseBuffer, ambientBus, tracker);
    return true;
  };

  const fireEvent = (kind: AudioEventKind, now: number) => {
    if (!ctx || !sfxBus || !noiseBuffer) return;
    switch (kind) {
      case "glug":
        triggerFilteredNoiseShot(ctx, noiseBuffer, sfxBus, tracker, now, {
          type: "bandpass",
          freq: 500,
          q: 4,
          dur: 0.12,
          gain: 0.14,
        });
        break;
      case "whoosh":
        triggerSwell(ctx, noiseBuffer, sfxBus, tracker, now, {
          dir: "up",
          dur: 0.4,
          fromHz: 1000,
          toHz: 4000,
          gain: 0.11,
        });
        break;
      case "splash":
        triggerFilteredNoiseShot(ctx, noiseBuffer, sfxBus, tracker, now, {
          type: "highpass",
          freq: 800,
          dur: 0.25,
          gain: 0.12,
        });
        break;
      case "shatter":
        triggerSwell(ctx, noiseBuffer, sfxBus, tracker, now, {
          dir: "up",
          dur: 0.35,
          fromHz: 1200,
          toHz: 3200,
          gain: 0.16,
          q: 1.5,
        });
        break;
      case "reverseSwell":
        triggerSwell(ctx, noiseBuffer, sfxBus, tracker, now, {
          dir: "down",
          dur: 1.2,
          fromHz: 400,
          toHz: 2200,
          gain: 0.08,
          q: 1.8,
        });
        break;
      case "punchNote":
        triggerNote(ctx, sfxBus, tracker, now, {
          freq: NOTES.D4,
          dur: 2.2,
          attack: 0.8,
          release: 1.4,
          gain: 0.08,
        });
        break;
      case "chime":
        triggerNote(ctx, sfxBus, tracker, now, {
          freq: NOTES.A4,
          dur: 0.8,
          attack: 0.01,
          release: 0.75,
          gain: 0.1,
        });
        break;
      case "thunk":
        triggerThunk(ctx, noiseBuffer, sfxBus, tracker, now);
        break;
      case "lid":
        triggerFilteredNoiseShot(ctx, noiseBuffer, sfxBus, tracker, now, {
          type: "lowpass",
          freq: 900,
          dur: 0.03,
          gain: 0.09,
        });
        break;
      case "spray":
        triggerFilteredNoiseShot(ctx, noiseBuffer, sfxBus, tracker, now, {
          type: "highpass",
          freq: 3000,
          dur: 0.9,
          gain: 0.07,
        });
        break;
      case "warm":
        triggerNote(ctx, sfxBus, tracker, now, {
          freq: NOTES.A4,
          dur: 2.0,
          attack: 0.6,
          release: 1.4,
          gain: 0.08,
        });
        break;
    }
  };

  const applyProfileAt = (prevShown: number, currShown: number, forcedTc?: number) => {
    if (!ctx || !worldFilter || !drone || !noiseBed) return;
    const now = ctx.currentTime;
    const seg = segmentAt(currShown);
    const profile = AUDIO_PROFILES[seg.id];
    const target = profile.evaluate(seg.t);

    const changedSeg = seg.id !== lastSegId;
    const isLoopReset = lastSegId === "b10" && seg.id === "b1";
    const layerTc = forcedTc ?? (changedSeg ? (isLoopReset ? 0.4 : 1.2) : 0.4);
    lastSegId = seg.id;

    drone.update(
      now,
      {
        d2Gain: target.d2Gain,
        a2Gain: target.a2Gain,
        colorFreq: target.colorFreq,
        colorGain: target.colorGain,
        padFreq: target.padFreq,
        padGain: target.padGain,
      },
      layerTc,
    );

    noiseBed.update(
      now,
      {
        bodyFreq: target.bodyFreq,
        bodyQ: target.bodyQ,
        bodyGain: target.bodyGain,
        airType: target.airType,
        airFreq: target.airFreq,
        airQ: target.airQ,
        airGain: target.airGain,
      },
      layerTc,
    );

    worldFilter.frequency.setTargetAtTime(target.worldCutoff, now, 0.6);

    // Pemicu SFX berbasis lintas ambang shown (anti-spam >= 1000 ms)
    const span = endOfSeg(seg.id) - STARTS[seg.id];
    const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
    for (const ev of profile.events) {
      const evShown = STARTS[seg.id] + ev.at * span;
      const crossedForward = prevShown < evShown && currShown >= evShown;
      const crossedReverse = Boolean(ev.allowReverse) && prevShown > evShown && currShown <= evShown;
      if (crossedForward || crossedReverse) {
        const lastMs = lastFiredAtMs.get(ev.id) ?? -Infinity;
        if (nowMs - lastMs >= ANTI_SPAM_MS) {
          lastFiredAtMs.set(ev.id, nowMs);
          fireEvent(ev.kind, now);
        }
      }
    }
  };

  const onVisibilityChange = () => {
    if (disposed || !ctx || !enabled) return;
    if (document.visibilityState === "hidden") {
      if (masterGain) {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0, now + 0.05);
      }
      void ctx.suspend().catch(() => {});
    } else if (document.visibilityState === "visible") {
      void ctx
        .resume()
        .then(() => {
          if (!disposed && enabled && ctx && masterGain) {
            const now = ctx.currentTime;
            masterGain.gain.cancelScheduledValues(now);
            masterGain.gain.setValueAtTime(masterGain.gain.value, now);
            masterGain.gain.linearRampToValueAtTime(MASTER_MAX_GAIN, now + 0.4);
          }
        })
        .catch(() => {});
    }
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibilityChange);
  }

  return {
    async setEnabled(next: boolean) {
      if (disposed || !supported) {
        enabled = false;
        return;
      }
      if (next === enabled) return;

      if (next) {
        if (!ensureGraph() || !ctx || !masterGain) return;
        enabled = true;
        writeSoundPreference(true);
        try {
          await ctx.resume();
        } catch {
          // Abaikan jika browser menolak resume di luar gestur
        }
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(MASTER_MAX_GAIN, now + FADE_IN_SEC);
        applyProfileAt(lastShown, lastShown, 0.4);
      } else {
        enabled = false;
        writeSoundPreference(false);
        if (ctx && masterGain) {
          const now = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.setValueAtTime(masterGain.gain.value, now);
          masterGain.gain.linearRampToValueAtTime(0, now + FADE_OUT_SEC);
        }
      }
    },

    update(shown: number, dt: number) {
      if (disposed || !supported || !enabled || !ctx) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      const currShown = clamp01(shown);
      const safeDt = Math.max(0, dt);

      // Penjadwal denyut & tick ringan (tanpa timer mandiri)
      const seg = segmentAt(currShown);
      const target = AUDIO_PROFILES[seg.id].evaluate(seg.t);
      if (target.pulseBpm > 0 && target.pulseGain > 0 && sfxBus) {
        pulseAccumSec += safeDt;
        const interval = 60 / target.pulseBpm;
        if (pulseAccumSec >= interval) {
          pulseAccumSec %= interval;
          triggerPulse(ctx, sfxBus, tracker, ctx.currentTime, target.pulseGain);
        }
      } else {
        pulseAccumSec = 0;
      }

      if (target.tickRate > 0 && target.tickGain > 0 && sfxBus && noiseBuffer) {
        tickAccumSec += safeDt;
        const interval = 1 / target.tickRate;
        if (tickAccumSec >= interval) {
          tickAccumSec %= interval;
          triggerTick(
            ctx,
            noiseBuffer,
            sfxBus,
            tracker,
            ctx.currentTime,
            target.tickCutoff,
            target.tickGain,
          );
        }
      } else {
        tickAccumSec = 0;
      }

      updateAccumSec += safeDt;
      if (updateAccumSec < UPDATE_INTERVAL_SEC) return;
      updateAccumSec %= UPDATE_INTERVAL_SEC;

      if (lastShown > 0.9 && currShown < 0.1) {
        lastFiredAtMs.clear();
      }
      applyProfileAt(lastShown, currShown);
      lastShown = currShown;
    },

    setDucked(nextDucked: boolean) {
      ducked = nextDucked;
      if (!ctx || !ambientBus) return;
      ambientBus.gain.setTargetAtTime(nextDucked ? 0.5 : 1.0, ctx.currentTime, DUCK_TC_SEC);
    },

    reset() {
      lastFiredAtMs.clear();
      lastShown = 0;
      lastSegId = "b1";
      updateAccumSec = 0;
      pulseAccumSec = 0;
      tickAccumSec = 0;
      if (enabled && ctx) {
        applyProfileAt(0, 0, 0.4);
      }
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      enabled = false;
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      drone?.stop();
      noiseBed?.stop();
      ambientBus?.disconnect();
      worldFilter?.disconnect();
      sfxBus?.disconnect();
      masterGain?.disconnect();
      compressor?.disconnect();
      if (backboneAcquired > 0) {
        tracker.release(backboneAcquired);
        backboneAcquired = 0;
      }
      if (ctx) {
        void ctx.close().catch(() => {});
        ctx = null;
      }
      ambientBus = null;
      worldFilter = null;
      sfxBus = null;
      masterGain = null;
      compressor = null;
      noiseBuffer = null;
      drone = null;
      noiseBed = null;
    },

    isEnabled() {
      return enabled;
    },

    isSupported() {
      return supported;
    },

    getActiveNodeCount() {
      return tracker.count();
    },
  };
}
