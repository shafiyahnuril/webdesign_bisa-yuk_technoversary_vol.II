import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STARTS } from "@/engine/timeline";
import { createAudioEngine, THUNK_LOCAL_T } from "./audio-engine";
import { AUDIO_PROFILES } from "./profiles";

interface MockParam {
  value: number;
  setValueAtTime: ReturnType<typeof vi.fn>;
  linearRampToValueAtTime: ReturnType<typeof vi.fn>;
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  setTargetAtTime: ReturnType<typeof vi.fn>;
  cancelScheduledValues: ReturnType<typeof vi.fn>;
}

function makeParam(initial = 0): MockParam {
  const p: MockParam = {
    value: initial,
    setValueAtTime: vi.fn((v: number) => {
      p.value = v;
    }),
    linearRampToValueAtTime: vi.fn((v: number) => {
      p.value = v;
    }),
    exponentialRampToValueAtTime: vi.fn((v: number) => {
      p.value = v;
    }),
    setTargetAtTime: vi.fn((v: number) => {
      p.value = v;
    }),
    cancelScheduledValues: vi.fn(),
  };
  return p;
}

class MockAudioContext {
  static instances: MockAudioContext[] = [];
  state: AudioContextState = "suspended";
  currentTime = 1;
  sampleRate = 44100;
  destination = {};
  createdNodes: { kind: string; gain?: MockParam; frequency?: MockParam }[] = [];

  resume = vi.fn(async () => {
    this.state = "running";
  });
  suspend = vi.fn(async () => {
    this.state = "suspended";
  });
  close = vi.fn(async () => {
    this.state = "closed";
  });

  createBuffer = vi.fn((channels: number, length: number, sampleRate: number) => ({
    numberOfChannels: channels,
    length,
    sampleRate,
    getChannelData: () => new Float32Array(length),
  }));

  private makeNode(kind: string, extra: Record<string, unknown> = {}) {
    const node = {
      kind,
      connect: vi.fn(() => node),
      disconnect: vi.fn(),
      ...extra,
    };
    this.createdNodes.push(node);
    return node;
  }

  createGain = vi.fn(() => this.makeNode("gain", { gain: makeParam(1) }));
  createBiquadFilter = vi.fn(() =>
    this.makeNode("biquad", {
      type: "lowpass",
      frequency: makeParam(8000),
      Q: makeParam(1),
    }),
  );
  createDynamicsCompressor = vi.fn(() =>
    this.makeNode("compressor", {
      threshold: makeParam(-24),
      ratio: makeParam(4),
      attack: makeParam(0.01),
      release: makeParam(0.25),
    }),
  );
  createOscillator = vi.fn(() =>
    this.makeNode("osc", {
      type: "sine",
      frequency: makeParam(73.42),
      detune: makeParam(0),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as (() => void) | null,
    }),
  );
  createBufferSource = vi.fn(() =>
    this.makeNode("bufferSource", {
      buffer: null,
      loop: false,
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as (() => void) | null,
    }),
  );

  constructor() {
    MockAudioContext.instances.push(this);
  }
}

describe("AudioEngine (T7.1-T7.3)", () => {
  const originalCtx = globalThis.AudioContext;

  beforeEach(() => {
    MockAudioContext.instances = [];
    vi.stubGlobal("AudioContext", MockAudioContext);
    vi.spyOn(performance, "now").mockReturnValue(2000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalCtx) {
      vi.stubGlobal("AudioContext", originalCtx);
    } else {
      vi.unstubAllGlobals();
    }
  });

  it("mati secara bawaan tanpa autoplay, dan hanya membuat AudioContext saat setEnabled(true)", async () => {
    localStorage.setItem("rebottle:sound", "1");
    const engine = createAudioEngine();

    expect(engine.isEnabled()).toBe(false);
    expect(MockAudioContext.instances).toHaveLength(0);

    // Update saat masih mati tidak boleh membuat AudioContext
    engine.update(0.1, 0.2);
    expect(MockAudioContext.instances).toHaveLength(0);

    await engine.setEnabled(true);
    expect(engine.isEnabled()).toBe(true);
    expect(MockAudioContext.instances).toHaveLength(1);
    expect(MockAudioContext.instances[0]!.resume).toHaveBeenCalledTimes(1);

    engine.dispose();
    localStorage.removeItem("rebottle:sound");
  });

  it("membatasi pembaruan profil 10Hz dari dt dan menjaga <= 24 node aktif di seluruh 11 segmen", async () => {
    expect(Object.keys(AUDIO_PROFILES)).toHaveLength(11);

    const engine = createAudioEngine();
    await engine.setEnabled(true);

    const ctx = MockAudioContext.instances[0]!;
    expect(engine.getActiveNodeCount()).toBeLessThanOrEqual(24);

    const worldFilterNode = ctx.createdNodes.find((n) => n.kind === "biquad");
    const freqSpy = worldFilterNode?.frequency?.setTargetAtTime;
    expect(freqSpy).toBeDefined();
    const callsBefore = freqSpy!.mock.calls.length;

    // dt 0.016 (< 0.1s) beberapa kali sebelum mencapai 0.1s
    engine.update(0.05, 0.016);
    engine.update(0.06, 0.016);
    expect(freqSpy!.mock.calls.length).toBe(callsBefore);

    // Lewat 0.1s -> memicu 1 pembaruan 10Hz
    engine.update(0.45, 0.08);
    expect(freqSpy!.mock.calls.length).toBe(callsBefore + 1);
    expect(engine.getActiveNodeCount()).toBeLessThanOrEqual(24);

    engine.dispose();
  });

  it("memicu thunk B7 hanya satu kali saat melewati ambang maju, bukan saat mundur, dan aman saat duck/suspend/cleanup", async () => {
    const engine = createAudioEngine();
    await engine.setEnabled(true);

    const b7Span = STARTS.b8 - STARTS.b7;
    const beforeThunk = STARTS.b7 + (THUNK_LOCAL_T - 0.05) * b7Span;
    const afterThunk = STARTS.b7 + (THUNK_LOCAL_T + 0.05) * b7Span;

    // Maju melewati ambang B7 thunk -> memicu tepat 1 kali
    engine.update(beforeThunk, 0.1);
    const oscBefore = MockAudioContext.instances[0]!.createOscillator.mock.calls.length;
    engine.update(afterThunk, 0.1);
    const oscAfterForward = MockAudioContext.instances[0]!.createOscillator.mock.calls.length;
    expect(oscAfterForward).toBeGreaterThan(oscBefore);

    // Mundur melewati ambang tidak memicu thunk ulang
    vi.spyOn(performance, "now").mockReturnValue(5000);
    engine.update(beforeThunk, 0.1);
    const oscAfterReverse = MockAudioContext.instances[0]!.createOscillator.mock.calls.length;
    expect(oscAfterReverse).toBe(oscAfterForward);

    // Duck & visibility suspend
    engine.setDucked(true);
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(MockAudioContext.instances[0]!.suspend).toHaveBeenCalled();

    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(MockAudioContext.instances[0]!.resume).toHaveBeenCalledTimes(2);

    // Loop reset mengizinkan pemutaran ulang pada putaran berikutnya
    engine.reset();
    vi.spyOn(performance, "now").mockReturnValue(8000);
    engine.update(beforeThunk, 0.1);
    engine.update(afterThunk, 0.1);
    expect(MockAudioContext.instances[0]!.createOscillator.mock.calls.length).toBeGreaterThan(
      oscAfterReverse,
    );

    engine.dispose();
    expect(MockAudioContext.instances[0]!.close).toHaveBeenCalledTimes(1);
  });

  it("tetap aman (graceful no-op) bila browser tidak mendukung AudioContext", async () => {
    vi.stubGlobal("AudioContext", undefined);
    const engine = createAudioEngine();

    expect(engine.isSupported()).toBe(false);
    expect(engine.isEnabled()).toBe(false);
    await expect(engine.setEnabled(true)).resolves.toBeUndefined();
    expect(engine.isEnabled()).toBe(false);
    engine.setRouteActive(false);
    engine.update(0.5, 0.1);
    engine.setDucked(true);
    engine.reset();
    engine.dispose();
  });

  it("mematikan update/SFX dan fade-out 0.8s saat setRouteActive(false) tanpa menghapus soundOn, dan tidak autoplay saat kembali ke Home bila belum diklik", async () => {
    // 1. Belum diklik user: pindah non-Home lalu kembali ke Home tidak boleh membuat AudioContext
    const freshEngine = createAudioEngine();
    freshEngine.setRouteActive(false);
    freshEngine.setRouteActive(true);
    expect(MockAudioContext.instances).toHaveLength(0);
    expect(freshEngine.isEnabled()).toBe(false);
    freshEngine.dispose();

    // 2. Sudah diaktifkan user: pindah non-Home fade-out 0.8s, gate update/SFX, pertahankan enabled & localStorage
    const engine = createAudioEngine();
    await engine.setEnabled(true);
    const ctx = MockAudioContext.instances[0]!;
    const worldFilterNode = ctx.createdNodes.find((n) => n.kind === "biquad")!;
    const masterGainNode = ctx.createdNodes.find((n) => n.kind === "gain" && n.gain?.linearRampToValueAtTime);
    expect(masterGainNode).toBeDefined();

    engine.setRouteActive(false);
    expect(engine.isEnabled()).toBe(true);
    expect(engine.isRouteActive()).toBe(false);
    expect(localStorage.getItem("rebottle:sound")).toBe("1");

    const callsDuringRouteOff = worldFilterNode.frequency!.setTargetAtTime.mock.calls.length;
    const oscBeforeOff = ctx.createOscillator.mock.calls.length;
    const b7Span = STARTS.b8 - STARTS.b7;
    engine.update(STARTS.b7 + (THUNK_LOCAL_T - 0.05) * b7Span, 0.1);
    engine.update(STARTS.b7 + (THUNK_LOCAL_T + 0.05) * b7Span, 0.1);
    expect(worldFilterNode.frequency!.setTargetAtTime.mock.calls.length).toBe(callsDuringRouteOff);
    expect(ctx.createOscillator.mock.calls.length).toBe(oscBeforeOff);

    // visibilitychange -> visible saat non-Home tidak boleh resume/fade-in
    const resumeCountWhileOff = ctx.resume.mock.calls.length;
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(ctx.resume.mock.calls.length).toBe(resumeCountWhileOff);

    // Kembali ke Home melanjutkan karena user sudah mengaktifkan
    engine.setRouteActive(true);
    expect(engine.isRouteActive()).toBe(true);
    await Promise.resolve();
    expect(ctx.resume.mock.calls.length).toBe(resumeCountWhileOff + 1);

    engine.dispose();
    localStorage.removeItem("rebottle:sound");
  });

  it("menjaga enabled tetap false dan tanpa unhandled rejection saat resume() ditolak atau konstruktor gagal", async () => {
    class RejectingResumeCtx extends MockAudioContext {
      override resume = vi.fn(async () => {
        throw new Error("NotAllowedError");
      });
    }
    vi.stubGlobal("AudioContext", RejectingResumeCtx);
    localStorage.removeItem("rebottle:sound");

    const engineA = createAudioEngine();
    await expect(engineA.setEnabled(true)).resolves.toBeUndefined();
    expect(engineA.isEnabled()).toBe(false);
    expect(localStorage.getItem("rebottle:sound")).not.toBe("1");
    engineA.dispose();

    class ThrowingCtor {
      constructor() {
        throw new Error("AudioContext blocked");
      }
    }
    vi.stubGlobal("AudioContext", ThrowingCtor);
    const engineB = createAudioEngine();
    await expect(engineB.setEnabled(true)).resolves.toBeUndefined();
    expect(engineB.isEnabled()).toBe(false);
    engineB.dispose();
  });

  it("menjaga anggaran <= 24 node aktif, batas gain aman, dan kontras sinematik 2 babak di seluruh 11 segmen", async () => {
    const b4Dive = AUDIO_PROFILES.b4.evaluate(0.65);
    expect(b4Dive.worldCutoff).toBeLessThanOrEqual(450);

    const punchHold = AUDIO_PROFILES.punch.evaluate(0.28);
    expect(punchHold.d2Gain).toBe(0);
    expect(punchHold.padGain).toBe(0);

    const punchLift = AUDIO_PROFILES.punch.evaluate(0.6);
    expect(punchLift.padGain).toBeGreaterThan(0);

    for (const profile of Object.values(AUDIO_PROFILES)) {
      for (const sampleT of [0, 0.25, 0.5, 0.75, 1]) {
        const target = profile.evaluate(sampleT);
        for (const gainVal of [
          target.d2Gain,
          target.a2Gain,
          target.colorGain,
          target.padGain,
          target.bodyGain,
          target.airGain,
          target.pulseGain,
          target.tickGain,
        ]) {
          expect(gainVal).toBeGreaterThanOrEqual(0);
          expect(gainVal).toBeLessThanOrEqual(0.3);
        }
      }
    }

    vi.useFakeTimers();
    try {
      const engine = createAudioEngine();
      await engine.setEnabled(true);
      expect(engine.getActiveNodeCount()).toBe(18);

      // Sapu shown dari 0 -> 1 untuk memicu seluruh event prosedural baru tanpa melebihi 24 node
      for (let i = 1; i <= 50; i++) {
        vi.spyOn(performance, "now").mockReturnValue(2000 + i * 1100);
        engine.update(i / 50, 0.12);
        expect(engine.getActiveNodeCount()).toBeLessThanOrEqual(24);
      }

      vi.advanceTimersByTime(4000);
      expect(engine.getActiveNodeCount()).toBe(18);
      engine.dispose();
    } finally {
      vi.useRealTimers();
    }
  });
});
