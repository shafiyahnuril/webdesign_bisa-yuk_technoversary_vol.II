import { afterEach, describe, expect, it, vi } from "vitest";
import { createLoopGesture } from "./loop-gesture";
import type { StoryEngine, StoryScheduler, StoryState } from "./story-engine";

function createFakeEngine(initialShown = 0) {
  const state: StoryState = {
    target: initialShown,
    shown: initialShown,
    paused: false,
    chapter: initialShown >= 0.999 ? 10 : 1,
    view: initialShown >= 0.999 ? "2" : "1",
  };
  const reset = vi.fn(() => {
    state.target = 0;
    state.shown = 0;
    state.chapter = 1;
    state.view = "1";
  });
  return { state, reset } satisfies Pick<StoryEngine, "state" | "reset">;
}

function createManualEnv() {
  const fns = new Set<(dt: number) => void>();
  const scheduler: StoryScheduler = {
    add(fn) {
      fns.add(fn);
      return () => fns.delete(fn);
    },
  };
  let timeMs = 1000;
  const rafQueue: FrameRequestCallback[] = [];
  const raf = vi.fn((cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
  const cancelRaf = vi.fn();

  const step = (dt: number) => {
    timeMs += dt * 1000;
    fns.forEach((fn) => fn(dt));
  };
  const flushRaf = () => {
    const cb = rafQueue.shift();
    cb?.(timeMs);
  };

  return {
    scheduler,
    now: () => timeMs,
    advanceTime: (ms: number) => {
      timeMs += ms;
    },
    raf,
    cancelRaf,
    step,
    flushRaf,
    listenerCount: () => fns.size,
  };
}

describe("loop-gesture", () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    while (cleanups.length > 0) cleanups.pop()?.();
    vi.restoreAllMocks();
  });

  it("menolak masukan saat shown < 0.999 dan menolak gulir balik (dy <= 0)", () => {
    const engine = createFakeEngine(0);
    const env = createManualEnv();
    const onPull = vi.fn();

    const gesture = createLoopGesture({
      engine,
      onPull,
      scheduler: env.scheduler,
      now: env.now,
      raf: env.raf,
      cancelRaf: env.cancelRaf,
    });
    cleanups.push(() => gesture.dispose());

    // Di hero (shown = 0), wheel ke atas atau ke bawah tidak berefek
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: -200 }));
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: 500 }));
    expect(gesture.pull).toBe(0);

    // Di akhir Bab 10 (shown >= 0.999), wheel negatif tetap ditolak (reverse loop rejection)
    engine.state.shown = 0.999;
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: -400 }));
    expect(gesture.pull).toBe(0);
    expect(onPull).not.toHaveBeenCalled();
  });

  it("short pull naik lalu meluruh ke 0 setelah 90ms rest delay (konsisten 60/120/144 Hz)", () => {
    const runDecay = (hz: number) => {
      const engine = createFakeEngine(1);
      const env = createManualEnv();
      const onPull = vi.fn();
      const gesture = createLoopGesture({
        engine,
        onPull,
        scheduler: env.scheduler,
        now: env.now,
        raf: env.raf,
        cancelRaf: env.cancelRaf,
      });

      // Short pull 350 px -> 0.25
      window.dispatchEvent(new WheelEvent("wheel", { deltaY: 350 }));
      expect(gesture.pull).toBeCloseTo(350 / 1400, 4);

      // Sebelum 90ms rest delay, pull belum meluruh
      const framesIn80ms = Math.floor(0.08 * hz);
      for (let i = 0; i < framesIn80ms; i++) env.step(1 / hz);
      expect(gesture.pull).toBeCloseTo(350 / 1400, 4);

      // Setelah lewat 90ms dan 200ms berikutnya, pull meluruh ke 0
      const framesIn200ms = Math.ceil(0.2 * hz);
      for (let i = 0; i < framesIn200ms; i++) env.step(1 / hz);
      expect(gesture.pull).toBe(0);

      gesture.dispose();
      return onPull.mock.calls[onPull.mock.calls.length - 1];
    };

    const last60 = runDecay(60);
    const last120 = runDecay(120);
    const last144 = runDecay(144);
    expect(last60?.[0]).toBe(0);
    expect(last120?.[0]).toBe(0);
    expect(last144?.[0]).toBe(0);
  });

  it("End/PageDown/Space tidak mengisi pull, sedangkan ArrowDown (+60) dan touch delta mengisi", () => {
    const engine = createFakeEngine(1);
    const env = createManualEnv();
    const onPull = vi.fn();
    const gesture = createLoopGesture({
      engine,
      onPull,
      scheduler: env.scheduler,
      now: env.now,
      raf: env.raf,
      cancelRaf: env.cancelRaf,
    });
    cleanups.push(() => gesture.dispose());

    for (const key of ["End", "PageDown", " "]) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    }
    expect(gesture.pull).toBe(0);

    // ArrowDown ditahan -> +60 per repeat
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", repeat: false }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", repeat: true }));
    expect(gesture.pull).toBeCloseTo(120 / 1400, 5);

    // Touch drag ke atas (clientY turun 280 -> delta +280)
    const touchStart = new Event("touchstart");
    Object.defineProperty(touchStart, "touches", { value: [{ clientY: 600 }] });
    window.dispatchEvent(touchStart);

    const touchMove = new Event("touchmove");
    Object.defineProperty(touchMove, "touches", { value: [{ clientY: 320 }] });
    window.dispatchEvent(touchMove);

    expect(gesture.pull).toBeCloseTo((120 + 280) / 1400, 5);
  });

  it("tarikan penuh >= 1400 px melakukan commitLoop dengan kelas .snap di 2 rAF dan reset engine", () => {
    const engine = createFakeEngine(1);
    const env = createManualEnv();
    const root = document.createElement("div");
    const onPull = vi.fn();
    const onCommit = vi.fn();

    const gesture = createLoopGesture({
      engine,
      onPull,
      onCommit,
      root,
      scheduler: env.scheduler,
      now: env.now,
      raf: env.raf,
      cancelRaf: env.cancelRaf,
    });
    cleanups.push(() => gesture.dispose());

    // Tarik penuh 1400px
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: 1400 }));
    env.step(1 / 60);

    expect(gesture.busy).toBe(true);
    expect(onPull).toHaveBeenLastCalledWith(1, 1);

    // Saat busy, masukan tambahan diabaikan
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: 500 }));
    expect(engine.reset).not.toHaveBeenCalled();

    // rAF 1: tambah .snap, reset engine, sembunyikan dome (pull = 0)
    env.flushRaf();
    expect(root.classList.contains("snap")).toBe(true);
    expect(engine.reset).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onPull).toHaveBeenLastCalledWith(0, 0);
    expect(gesture.busy).toBe(true);

    // rAF 2: lepas .snap dan buka kunci busy
    env.flushRaf();
    expect(root.classList.contains("snap")).toBe(false);
    expect(gesture.busy).toBe(false);
    expect(gesture.pull).toBe(0);
  });

  it("dispose melepas seluruh listener dan scheduler", () => {
    const engine = createFakeEngine(1);
    const env = createManualEnv();
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const gesture = createLoopGesture({
      engine,
      onPull: vi.fn(),
      scheduler: env.scheduler,
      now: env.now,
      raf: env.raf,
      cancelRaf: env.cancelRaf,
    });

    expect(env.listenerCount()).toBe(1);
    gesture.dispose();
    expect(env.listenerCount()).toBe(0);
    expect(removeSpy).toHaveBeenCalled();
  });
});
