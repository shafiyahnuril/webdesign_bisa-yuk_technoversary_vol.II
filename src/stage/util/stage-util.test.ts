import { describe, expect, it, vi } from "vitest";
import { BufferGeometry, Mesh, MeshStandardMaterial, Texture } from "three";
import { clamp, clamp01, lerp, smoothstep } from "./math";
import { createRng, rngRange } from "./rng";
import { disposeObject } from "./dispose";

describe("stage util math", () => {
  it("menjepit dan menginterpolasi angka dengan benar", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp01(1.4)).toBe(1);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
    expect(smoothstep(0.7, 1.0, 0.7)).toBe(0);
    expect(smoothstep(0.7, 1.0, 1.0)).toBe(1);
    expect(smoothstep(0.7, 1.0, 0.85)).toBeCloseTo(0.5, 5);
  });
});

describe("stage util rng", () => {
  it("menghasilkan urutan deterministik untuk seed yang sama", () => {
    const a = createRng(72);
    const b = createRng(72);
    const seqA = Array.from({ length: 6 }, () => a());
    const seqB = Array.from({ length: 6 }, () => b());
    expect(seqA).toEqual(seqB);
    seqA.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
    const ranged = rngRange(createRng(7), 3, 14);
    expect(ranged).toBeGreaterThanOrEqual(3);
    expect(ranged).toBeLessThan(14);
  });
});

describe("stage util disposeObject", () => {
  it("membebaskan geometri, material, dan tekstur pada subtree objek", () => {
    const geom = new BufferGeometry();
    const tex = new Texture();
    const mat = new MeshStandardMaterial({ map: tex });
    const spyGeom = vi.spyOn(geom, "dispose");
    const spyMat = vi.spyOn(mat, "dispose");
    const spyTex = vi.spyOn(tex, "dispose");

    const mesh = new Mesh(geom, mat);
    disposeObject(mesh);

    expect(spyGeom).toHaveBeenCalledTimes(1);
    expect(spyMat).toHaveBeenCalledTimes(1);
    expect(spyTex).toHaveBeenCalledTimes(1);
  });
});
