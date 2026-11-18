import { describe, expect, it, vi } from "vitest";
import { CUES, PALETTE } from "@/lib/tokens";
import { computeCues, applyCues } from "./cues";
import { computePalette, applyPalette } from "./palette";
import { ORDER, PUNCH, STARTS } from "./timeline";

function segPos(id: (typeof ORDER)[number], localT: number): number {
  const idx = ORDER.indexOf(id);
  const from = STARTS[id];
  const next = ORDER[idx + 1];
  const to = next === undefined ? 1 : STARTS[next];
  return from + (to - from) * localT;
}

describe("palette", () => {
  it("memulihkan CSS setelah tema Home dibersihkan saat navigasi rute", () => {
    const root = document.createElement("div");
    applyPalette(0, root);
    applyCues(0, root);
    const before = root.style.cssText;
    root.style.cssText = "";
    applyPalette(0, root);
    applyCues(0, root);
    expect(root.style.cssText).toBe(before);
  });
  it("mematuhi aturan dataran 70/30 pada b1..b6", () => {
    const start = computePalette(0);
    expect(start.from).toBe("c1");
    expect(start.to).toBe("c2");
    expect(start.mix).toBe(0);
    expect(start.bgA).toBe(PALETTE.c1.bg);

    expect(computePalette(segPos("b1", 0.7)).mix).toBe(0);
    const midShift = computePalette(segPos("b1", 0.85));
    expect(midShift.mix).toBeGreaterThan(0);
    expect(midShift.mix).toBeLessThan(1);
    expect(computePalette(segPos("b1", 0.9999)).mix).toBeGreaterThan(0.99);

    expect(computePalette(segPos("b6", 0.5)).from).toBe("c6");
    expect(computePalette(segPos("b6", 0.5)).to).toBe("cp0");
    expect(computePalette(segPos("b6", 0.5)).mix).toBe(0);
  });

  it("menangani palet punchline cp0 -> cp1 -> c7", () => {
    const p0 = computePalette(PUNCH.from);
    expect(p0.from).toBe("cp0");
    expect(p0.mix).toBe(0);

    const pRewind = computePalette(segPos("punch", 0.24));
    expect(pRewind.from).toBe("cp0");
    expect(pRewind.to).toBe("cp1");
    expect(pRewind.mix).toBeCloseTo(0.5, 2);

    const pHold = computePalette(segPos("punch", 0.6));
    expect(pHold.from).toBe("cp1");
    expect(pHold.mix).toBe(0);

    const pExit = computePalette(segPos("punch", 0.95));
    expect(pExit.from).toBe("cp1");
    expect(pExit.to).toBe("c7");
    expect(pExit.mix).toBeCloseTo(0.5, 2);
  });

  it("melakukan ink swap Bab 9 -> Bab 10 khusus pada t 0.90..0.95", () => {
    const at80 = computePalette(segPos("b9", 0.8));
    expect(at80.mix).toBeGreaterThan(0);
    expect(at80.inkMix).toBe(0);
    expect(at80.inkA).toBe(PALETTE.c9.ink);
    expect(at80.inkB).toBe(PALETTE.c9.ink);

    const at90 = computePalette(segPos("b9", 0.9));
    expect(at90.inkMix).toBe(0);
    expect(at90.inkA).toBe(PALETTE.c9.ink);

    const at925 = computePalette(segPos("b9", 0.925));
    expect(at925.inkA).toBe(PALETTE.c9.ink);
    expect(at925.inkB).toBe(PALETTE.c10.ink);
    expect(at925.inkMix).toBeCloseTo(0.5, 2);

    const at95 = computePalette(segPos("b9", 0.95));
    expect(at95.inkMix).toBe(1);
    expect(at95.inkA).toBe(PALETTE.c10.ink);
    expect(at95.inkB).toBe(PALETTE.c10.ink);
  });

  it("b10 tetap c10 hingga p = 1 dan tidak berputar ke c1", () => {
    const end = computePalette(1);
    expect(end.from).toBe("c10");
    expect(end.to).toBe("c10");
    expect(end.mix).toBe(0);
    expect(end.bgA).toBe(PALETTE.c10.bg);
    expect(end.inkA).toBe(PALETTE.c10.ink);
  });

  it("applyPalette menulis CSS var OKLCH dan hanya menulis ulang saat berubah (diff-only)", () => {
    const root = document.createElement("div");
    const spy = vi.spyOn(root.style, "setProperty");

    applyPalette(0, root);
    expect(spy).toHaveBeenCalled();
    expect(root.style.getPropertyValue("--bg-a")).toBe(PALETTE.c1.bg);
    expect(root.style.getPropertyValue("--mix")).toBe("0%");
    expect(root.style.getPropertyValue("--bg-now")).toContain("color-mix(in oklch");
    expect(root.style.getPropertyValue("--ink-now")).toContain("color-mix(in oklch");

    spy.mockClear();
    applyPalette(0, root);
    applyPalette(segPos("b1", 0.3), root);
    expect(spy).not.toHaveBeenCalled();

    applyPalette(segPos("b9", 0.925), root);
    expect(spy).toHaveBeenCalled();
    expect(root.style.getPropertyValue("--ink-a")).toBe(PALETTE.c9.ink);
    expect(root.style.getPropertyValue("--ink-b")).toBe(PALETTE.c10.ink);
    expect(root.style.getPropertyValue("--ink-mix")).toBe("50%");
  });
});

describe("cues", () => {
  it("mengembalikan isyarat awal sesuai CUES pada setiap batas bab", () => {
    expect(computeCues(0)).toEqual(CUES.c1);
    expect(computeCues(STARTS.b2)).toEqual(CUES.c2);
    expect(computeCues(STARTS.b4)).toEqual(CUES.c4);
    expect(computeCues(STARTS.b7)).toEqual(CUES.c7);
    expect(computeCues(1)).toEqual(CUES.c10);
  });

  it("mengatur kabut Bab 3 dan tingkat melt/crack/particles Bab 5-6", () => {
    const b3Mid = computeCues(segPos("b3", 0.6));
    expect(b3Mid.fog).toBeGreaterThan(0.04);

    const b5Start = computeCues(STARTS.b5);
    expect(b5Start.melt).toBeCloseTo(0.25, 4);
    expect(b5Start.crack).toBeCloseTo(0.55, 4);
    expect(b5Start.particles).toBe(0);

    const b5PlateauEnd = computeCues(segPos("b5", 0.7));
    expect(b5PlateauEnd.melt).toBeGreaterThan(0.45);
    expect(b5PlateauEnd.crack).toBeCloseTo(0.8, 2);
    expect(b5PlateauEnd.particles).toBeGreaterThan(0);

    const b6Start = computeCues(STARTS.b6);
    expect(b6Start.melt).toBeCloseTo(0.6, 4);
    expect(b6Start.crack).toBe(1);
    expect(b6Start.particles).toBe(1);

    const b6End = computeCues(segPos("b6", 0.95));
    expect(b6End.melt).toBeGreaterThan(0.9);
    expect(b6End.crack).toBe(1);
  });

  it("punchline menaikkan vignette ke 0.70 lalu melakukan rewind penuh ke cp1 -> c7", () => {
    const atStart = computeCues(PUNCH.from);
    expect(atStart).toEqual(CUES.cp0);

    const atFadeEnd = computeCues(segPos("punch", 0.08));
    expect(atFadeEnd.vignette).toBeCloseTo(0.7, 3);

    const atRewindEnd = computeCues(segPos("punch", 0.4));
    expect(atRewindEnd.grain).toBeCloseTo(CUES.cp1.grain, 3);
    expect(atRewindEnd.melt).toBe(0);
    expect(atRewindEnd.crack).toBe(0);
    expect(atRewindEnd.turbid).toBe(0);
    expect(atRewindEnd.shimmer).toBe(0);
    expect(atRewindEnd.particles).toBe(0);

    const atHoldEnd = computeCues(segPos("punch", 0.9));
    expect(atHoldEnd.vignette).toBe(0);

    const atB7 = computeCues(PUNCH.to);
    expect(atB7).toEqual(CUES.c7);
  });

  it("applyCues mengembalikan cues dan melakukan diff-only DOM writes", () => {
    const root = document.createElement("div");
    const spy = vi.spyOn(root.style, "setProperty");

    const cues0 = applyCues(0, root);
    expect(cues0).toEqual(CUES.c1);
    expect(spy).toHaveBeenCalled();
    expect(root.style.getPropertyValue("--grain")).toBe("0.06");
    expect(root.style.getPropertyValue("--melt")).toBe("0");

    spy.mockClear();
    applyCues(0, root);
    applyCues(1e-6, root);
    expect(spy).not.toHaveBeenCalled();

    const cues5 = applyCues(STARTS.b5, root);
    expect(cues5.melt).toBeCloseTo(0.25, 4);
    expect(spy).toHaveBeenCalled();
  });
});
