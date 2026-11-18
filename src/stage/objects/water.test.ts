import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { QUALITY_PRESETS } from "../quality";
import type { StageContext } from "../stage";
import { ensureWaterSystem, GERSTNER_WAVES, WaterSystem } from "./water";

function installCanvas2dMock() {
  const noop = () => {};
  const fakeCtx = {
    createImageData: (w: number, h: number) => ({
      width: w,
      height: h,
      data: new Uint8ClampedArray(w * h * 4),
    }),
    putImageData: noop,
  } as unknown as CanvasRenderingContext2D;

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((id: string) =>
    id === "2d" ? fakeCtx : null) as HTMLCanvasElement["getContext"]);
}

function makeMockStageContext(tier: "high" | "medium" | "low" = "high"): StageContext {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 200);
  const slots = new Map<string, never>();

  return {
    renderer: {} as THREE.WebGLRenderer,
    scene,
    camera,
    lights: {
      key: new THREE.DirectionalLight(0xeaf4ff, 2.2),
      rim: new THREE.DirectionalLight(0x8fd3ff, 3.0),
      fill: new THREE.HemisphereLight(0x8fb0cc, 0x0a1226, 0.35),
      spot: new THREE.SpotLight(0xffffff, 0),
    },
    shared: {
      bottle: {} as StageContext["shared"]["bottle"],
      contactShadow: {} as StageContext["shared"]["contactShadow"],
      slots,
      register: vi.fn((key, handle) => {
        slots.set(key, handle as never);
        return handle;
      }),
      get: vi.fn((key) => slots.get(key)),
    },
    quality: tier,
    qualityConfig: QUALITY_PRESETS[tier],
    qualityManager: {} as StageContext["qualityManager"],
    size: { w: 1280, h: 720, dpr: 1, aspect: 16 / 9, isPortrait: false },
    uniforms: { uTime: { value: 0 } },
    env: new THREE.Texture(),
    reducedMotion: false,
    applyResponsiveCamera: vi.fn(),
  } as unknown as StageContext;
}

describe("WaterSystem", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("membangun bidang tunggal dengan resolusi 160^2 (HIGH), 110^2 (MEDIUM), dan 64^2 (LOW)", () => {
    const scene = new THREE.Scene();
    const water = new WaterSystem(scene, QUALITY_PRESETS.high);

    expect(water.mesh.geometry.index!.count / 3).toBe(160 * 160 * 2);
    expect(water.material.side).toBe(THREE.DoubleSide);
    expect(water.material.uniforms.uCausticsEnabled!.value).toBe(1);

    water.setQuality(QUALITY_PRESETS.medium);
    expect(water.mesh.geometry.index!.count / 3).toBe(110 * 110 * 2);
    expect(water.material.uniforms.uCausticsEnabled!.value).toBe(0);

    water.setQuality(QUALITY_PRESETS.low);
    expect(water.mesh.geometry.index!.count / 3).toBe(64 * 64 * 2);
    expect(water.material.uniforms.uCausticsEnabled!.value).toBe(0);

    water.dispose();
  });

  it("mendukung 4 mode (sungai 40x14, laut 120x120, malam 120x120, bersih 40x14) serta saveState/restoreState untuk kilas B7", () => {
    const scene = new THREE.Scene();
    const water = new WaterSystem(scene, QUALITY_PRESETS.high);

    water.setMode("river");
    expect(water.getDimensions()).toEqual({ width: 40, depth: 14 });
    expect(water.material.uniforms.uMode!.value).toBe(0);
    expect(water.material.uniforms.uClean!.value).toBe(0);

    water.setMode("sea");
    expect(water.getDimensions()).toEqual({ width: 120, depth: 120 });
    expect(water.material.uniforms.uMode!.value).toBe(1);

    water.setMode("night");
    expect(water.getDimensions()).toEqual({ width: 120, depth: 120 });
    expect(water.material.uniforms.uMode!.value).toBe(2);
    expect(water.getParams().amplitude).toBeCloseTo(0.18, 4);

    // Simulasi kilas B7: simpan state, masuk mode bersih, lalu pulihkan tanpa renderer kedua
    const saved = water.saveState();
    water.setMode("clean");
    expect(water.getDimensions()).toEqual({ width: 40, depth: 14 });
    expect(water.material.uniforms.uClean!.value).toBe(1);
    expect(water.getParams().amplitude).toBeCloseTo(0.03, 4);

    water.restoreState(saved);
    expect(water.getDimensions()).toEqual({ width: 120, depth: 120 });
    expect(water.material.uniforms.uMode!.value).toBe(2);
    expect(water.material.uniforms.uClean!.value).toBe(0);

    water.dispose();
  });

  it("menghitung tinggi dan normal 3 gelombang Gerstner di CPU yang konsisten secara analitis dengan permukaan displaced", () => {
    expect(GERSTNER_WAVES).toHaveLength(3);

    const scene = new THREE.Scene();
    const water = new WaterSystem(scene, QUALITY_PRESETS.high);
    water.setMode("sea");

    // Amplitudo 0 => bidang datar sempurna
    water.setParams({ amplitude: 0, time: 2.5 });
    const flat = water.sampleHeightAndNormal(1.2, -0.7);
    expect(flat.y).toBeCloseTo(0, 6);
    expect(flat.normal.x).toBeCloseTo(0, 6);
    expect(flat.normal.y).toBeCloseTo(1, 6);
    expect(flat.normal.z).toBeCloseTo(0, 6);

    // Amplitudo aktif => batas tinggi & kesesuaian normal analitis terhadap turunan numerik permukaan
    water.setParams({ amplitude: 0.42, speed: 1.8, time: 3.1 });
    const pos = new THREE.Vector3();
    const anaNormal = new THREE.Vector3();
    water.sampleSurface(2.4, -1.3, pos, anaNormal);

    expect(Math.abs(pos.y)).toBeLessThanOrEqual(0.42 * 1.05);
    expect(anaNormal.length()).toBeCloseTo(1, 5);
    expect(anaNormal.y).toBeGreaterThan(0);

    const eps = 1e-4;
    const px0 = new THREE.Vector3();
    const px1 = new THREE.Vector3();
    const pz0 = new THREE.Vector3();
    const pz1 = new THREE.Vector3();
    water.sampleSurface(2.4 - eps, -1.3, px0);
    water.sampleSurface(2.4 + eps, -1.3, px1);
    water.sampleSurface(2.4, -1.3 - eps, pz0);
    water.sampleSurface(2.4, -1.3 + eps, pz1);

    const dPdx = px1.sub(px0).divideScalar(2 * eps);
    const dPdz = pz1.sub(pz0).divideScalar(2 * eps);
    const numNormal = new THREE.Vector3().crossVectors(dPdz, dPdx).normalize();

    expect(anaNormal.dot(numNormal)).toBeGreaterThan(0.9999);

    // Pastikan uniform gelombang GLSL cocok dengan parameter CPU
    const shaderWave0 = water.material.uniforms.uWave0!.value as THREE.Vector4;
    expect(shaderWave0.x).toBeCloseTo(GERSTNER_WAVES[0].dirX, 6);
    expect(shaderWave0.y).toBeCloseTo(GERSTNER_WAVES[0].dirZ, 6);
    expect(shaderWave0.z).toBeCloseTo(GERSTNER_WAVES[0].steepness, 6);
    expect(shaderWave0.w).toBeCloseTo(GERSTNER_WAVES[0].wavelength, 6);

    water.dispose();
  });

  it("mendaftarkan diri ke ctx.shared dengan key 'water' hanya sekali lewat ensureWaterSystem", () => {
    const ctx = makeMockStageContext("high");
    const first = ensureWaterSystem(ctx);
    const second = ensureWaterSystem(ctx);

    expect(first).toBe(second);
    expect(ctx.shared.register).toHaveBeenCalledTimes(1);
    expect(ctx.shared.register).toHaveBeenCalledWith("water", first);

    first.dispose();
  });
});
