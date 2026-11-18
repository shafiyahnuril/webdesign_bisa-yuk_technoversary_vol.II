import { clamp01, lerp } from "@/engine/timeline";

export const NOTES = {
  D2: 73.42,
  A2: 110.0,
  D3: 146.83,
  Eb3: 155.56,
  F3: 174.61,
  Fs3: 185.0,
  A3: 220.0,
  D4: 293.66,
  A4: 440.0,
  A5: 880.0,
} as const;

export const MAX_ACTIVE_AUDIO_NODES = 24;

export interface AudioNodeTracker {
  readonly count: () => number;
  readonly acquire: (needed: number) => boolean;
  readonly release: (amount: number) => void;
}

export function createNodeTracker(maxNodes = MAX_ACTIVE_AUDIO_NODES): AudioNodeTracker {
  let active = 0;
  return {
    count: () => active,
    acquire(needed: number) {
      if (active + needed > maxNodes) return false;
      active += needed;
      return true;
    },
    release(amount: number) {
      active = Math.max(0, active - amount);
    },
  };
}

/** Menghasilkan buffer derau 4 detik sekali saat inisialisasi (pink-tinted deterministic). */
export function createNoiseBuffer(ctx: BaseAudioContext, seconds = 4): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let seed = 0x9e3779b9;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const white = (seed / 0xffffffff) * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.16;
  }
  return buffer;
}

export interface DroneRig {
  update(
    now: number,
    params: {
      d2Gain: number;
      a2Gain: number;
      colorFreq: number;
      colorGain: number;
      padFreq: number;
      padGain: number;
    },
    tc?: number,
  ): void;
  stop(): void;
}

export function createDrone(
  ctx: BaseAudioContext,
  dest: AudioNode,
  tracker: AudioNodeTracker,
): DroneRig {
  const voiceDefs: readonly { freq: number; type: OscillatorType; detune: number }[] = [
    { freq: NOTES.D2, type: "sine", detune: -3 },
    { freq: NOTES.A2, type: "sine", detune: 3 },
    { freq: NOTES.F3, type: "triangle", detune: -2 },
    { freq: NOTES.D4, type: "triangle", detune: 4 },
  ];

  const oscs: OscillatorNode[] = [];
  const gains: GainNode[] = [];
  let acquired = 0;

  if (tracker.acquire(voiceDefs.length * 2)) {
    acquired = voiceDefs.length * 2;
    for (const def of voiceDefs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = def.type;
      osc.frequency.setValueAtTime(def.freq, ctx.currentTime);
      osc.detune.setValueAtTime(def.detune, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      oscs.push(osc);
      gains.push(gain);
    }
  }

  return {
    update(now, params, tc = 0.4) {
      if (oscs.length < 4) return;
      gains[0]!.gain.setTargetAtTime(params.d2Gain, now, tc);
      gains[1]!.gain.setTargetAtTime(params.a2Gain, now, tc);
      oscs[2]!.frequency.setTargetAtTime(params.colorFreq, now, tc);
      gains[2]!.gain.setTargetAtTime(params.colorGain, now, tc);
      oscs[3]!.frequency.setTargetAtTime(params.padFreq, now, tc);
      gains[3]!.gain.setTargetAtTime(params.padGain, now, tc);
    },
    stop() {
      for (const osc of oscs) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Abaikan bila sudah berhenti
        }
      }
      for (const g of gains) g.disconnect();
      if (acquired > 0) {
        tracker.release(acquired);
        acquired = 0;
      }
    },
  };
}

export type NoiseKind = "water" | "wind" | "hum" | "hiss";

export interface NoiseBedRig {
  update(
    now: number,
    params: {
      bodyFreq: number;
      bodyQ: number;
      bodyGain: number;
      airType: BiquadFilterType;
      airFreq: number;
      airQ: number;
      airGain: number;
    },
    tc?: number,
  ): void;
  stop(): void;
}

export function createNoiseBed(
  ctx: BaseAudioContext,
  noiseBuffer: AudioBuffer,
  dest: AudioNode,
  tracker: AudioNodeTracker,
): NoiseBedRig {
  let source: AudioBufferSourceNode | null = null;
  let bodyFilter: BiquadFilterNode | null = null;
  let bodyGainNode: GainNode | null = null;
  let airFilter: BiquadFilterNode | null = null;
  let airGainNode: GainNode | null = null;
  let acquired = 0;

  if (tracker.acquire(5)) {
    acquired = 5;
    source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.setValueAtTime(120, ctx.currentTime);
    bodyFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    bodyGainNode = ctx.createGain();
    bodyGainNode.gain.setValueAtTime(0, ctx.currentTime);

    airFilter = ctx.createBiquadFilter();
    airFilter.type = "bandpass";
    airFilter.frequency.setValueAtTime(1200, ctx.currentTime);
    airFilter.Q.setValueAtTime(1.0, ctx.currentTime);

    airGainNode = ctx.createGain();
    airGainNode.gain.setValueAtTime(0, ctx.currentTime);

    source.connect(bodyFilter);
    bodyFilter.connect(bodyGainNode);
    bodyGainNode.connect(dest);

    source.connect(airFilter);
    airFilter.connect(airGainNode);
    airGainNode.connect(dest);

    source.start();
  }

  return {
    update(now, params, tc = 0.4) {
      if (!bodyFilter || !bodyGainNode || !airFilter || !airGainNode) return;
      bodyFilter.frequency.setTargetAtTime(params.bodyFreq, now, tc);
      bodyFilter.Q.setTargetAtTime(params.bodyQ, now, tc);
      bodyGainNode.gain.setTargetAtTime(params.bodyGain, now, tc);

      if (airFilter.type !== params.airType) {
        airFilter.type = params.airType;
      }
      airFilter.frequency.setTargetAtTime(params.airFreq, now, tc);
      airFilter.Q.setTargetAtTime(params.airQ, now, tc);
      airGainNode.gain.setTargetAtTime(params.airGain, now, tc);
    },
    stop() {
      if (source) {
        try {
          source.stop();
          source.disconnect();
        } catch {
          // Abaikan
        }
      }
      bodyFilter?.disconnect();
      bodyGainNode?.disconnect();
      airFilter?.disconnect();
      airGainNode?.disconnect();
      if (acquired > 0) {
        tracker.release(acquired);
        acquired = 0;
      }
    },
  };
}

function scheduleTransientCleanup(
  nodeCount: number,
  durationSec: number,
  tracker: AudioNodeTracker,
  sourceNode: AudioScheduledSourceNode,
  cleanupNodes: AudioNode[],
): void {
  let released = false;
  const cleanup = () => {
    if (released) return;
    released = true;
    for (const n of cleanupNodes) {
      try {
        n.disconnect();
      } catch {
        // Abaikan
      }
    }
    tracker.release(nodeCount);
  };
  sourceNode.onended = cleanup;
  if (typeof setTimeout === "function") {
    setTimeout(cleanup, Math.ceil((durationSec + 0.08) * 1000));
  }
}

export function triggerPulse(
  ctx: BaseAudioContext,
  dest: AudioNode,
  tracker: AudioNodeTracker,
  now: number,
  gainAmount: number,
): void {
  if (gainAmount <= 0.002 || !tracker.acquire(2)) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(55, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(gainAmount, now + 0.02);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.37);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.38);
  scheduleTransientCleanup(2, 0.38, tracker, osc, [osc, gain]);
}

export function triggerTick(
  ctx: BaseAudioContext,
  noiseBuffer: AudioBuffer,
  dest: AudioNode,
  tracker: AudioNodeTracker,
  now: number,
  cutoffHz: number,
  gainAmount: number,
): void {
  if (gainAmount <= 0.002 || !tracker.acquire(3)) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(cutoffHz, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(gainAmount, now + 0.002);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.012);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(now, (now * 0.37) % 3, 0.02);
  src.stop(now + 0.016);
  scheduleTransientCleanup(3, 0.02, tracker, src, [src, filter, gain]);
}

export function triggerSwell(
  ctx: BaseAudioContext,
  noiseBuffer: AudioBuffer,
  dest: AudioNode,
  tracker: AudioNodeTracker,
  now: number,
  opts: { dir: "up" | "down"; dur: number; fromHz: number; toHz: number; gain: number; q?: number },
): void {
  if (!tracker.acquire(3)) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.setValueAtTime(opts.q ?? 2.2, now);
  const startF = opts.dir === "up" ? opts.fromHz : opts.toHz;
  const endF = opts.dir === "up" ? opts.toHz : opts.fromHz;
  filter.frequency.setValueAtTime(startF, now);
  filter.frequency.linearRampToValueAtTime(endF, now + opts.dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(opts.gain, now + opts.dur * 0.35);
  gain.gain.linearRampToValueAtTime(0.0001, now + opts.dur);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(now);
  src.stop(now + opts.dur + 0.02);
  scheduleTransientCleanup(3, opts.dur + 0.02, tracker, src, [src, filter, gain]);
}

export function triggerNote(
  ctx: BaseAudioContext,
  dest: AudioNode,
  tracker: AudioNodeTracker,
  now: number,
  opts: { freq: number; dur: number; attack: number; release: number; gain: number },
): void {
  if (!tracker.acquire(2)) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(opts.freq, now);

  const total = Math.max(opts.dur, opts.attack + opts.release);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(opts.gain, now + opts.attack);
  gain.gain.linearRampToValueAtTime(0.0001, now + total);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + total + 0.02);
  scheduleTransientCleanup(2, total + 0.02, tracker, osc, [osc, gain]);
}

/** SFX DISEPAKATI Bab 7 botol masuk: sinus 180->90 Hz (120 ms) + derau lowpass 600 Hz (40 ms) + pantul kecil. */
export function triggerThunk(
  ctx: BaseAudioContext,
  noiseBuffer: AudioBuffer,
  dest: AudioNode,
  tracker: AudioNodeTracker,
  now: number,
): void {
  if (tracker.acquire(2)) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.12);
    // Pantul kecil pada 60 ms setelah pendaratan (0.18s)
    osc.frequency.setValueAtTime(145, now + 0.18);
    osc.frequency.linearRampToValueAtTime(96, now + 0.24);

    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(0.22, now + 0.008);
    oscGain.gain.linearRampToValueAtTime(0.002, now + 0.14);
    oscGain.gain.linearRampToValueAtTime(0.08, now + 0.185);
    oscGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.26);
    scheduleTransientCleanup(2, 0.26, tracker, osc, [osc, oscGain]);
  }

  if (tracker.acquire(3)) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(600, now);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.0001, now);
    nGain.gain.linearRampToValueAtTime(0.16, now + 0.004);
    nGain.gain.linearRampToValueAtTime(0.0001, now + 0.042);

    src.connect(lp);
    lp.connect(nGain);
    nGain.connect(dest);
    src.start(now);
    src.stop(now + 0.05);
    scheduleTransientCleanup(3, 0.05, tracker, src, [src, lp, nGain]);
  }
}

export function triggerFilteredNoiseShot(
  ctx: BaseAudioContext,
  noiseBuffer: AudioBuffer,
  dest: AudioNode,
  tracker: AudioNodeTracker,
  now: number,
  opts: { type: BiquadFilterType; freq: number; q?: number; dur: number; gain: number },
): void {
  if (!tracker.acquire(3)) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = opts.type;
  filter.frequency.setValueAtTime(opts.freq, now);
  filter.Q.setValueAtTime(opts.q ?? 1, now);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(opts.gain, now + Math.min(0.02, opts.dur * 0.25));
  g.gain.linearRampToValueAtTime(0.0001, now + opts.dur);

  src.connect(filter);
  filter.connect(g);
  g.connect(dest);
  src.start(now);
  src.stop(now + opts.dur + 0.02);
  scheduleTransientCleanup(3, opts.dur + 0.02, tracker, src, [src, filter, g]);
}

export function lerpEnvelope(a: number, b: number, t: number): number {
  return lerp(a, b, clamp01(t));
}
