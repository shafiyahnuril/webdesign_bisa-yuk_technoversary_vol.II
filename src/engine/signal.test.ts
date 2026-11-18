import { describe, expect, it, vi } from "vitest";
import { INITIAL_STORY_SIGNALS, createSignal } from "./signal";

describe("createSignal", () => {
  it("memberi tahu pelanggan hanya saat nilai berubah", () => {
    const sig = createSignal(1);
    const fn = vi.fn();
    const off = sig.subscribe(fn);
    sig.set(1);
    expect(fn).not.toHaveBeenCalled();
    sig.set(2);
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    sig.set(3);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(sig.get()).toBe(3);
  });

  it("nilai awal sinyal cerita sesuai kontrak", () => {
    expect(INITIAL_STORY_SIGNALS).toEqual({
      shown: 0,
      chapter: 1,
      babak: 1,
      temp: 1.2,
      re: false,
      paused: false,
    });
  });
});
