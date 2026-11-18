import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { QUALITY_PRESETS } from "../quality";
import type { SharedObjectHandle, StageContext } from "../stage";
import { BOTTLE_MAX_RADIUS } from "./bottle";
import { computeParticlePosition, ensureParticles, Particles } from "./particles";

function makeMockStageContext(tier: "high" | "medium" | "low" = "high"): StageContext {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 200);
  const slots = new Map<string, SharedObjectHandle>();

  const shared: StageContext["shared"] = {
    bottle: {} as StageContext["shared"]["bottle"],
    contactShadow: {} as StageContext["shared"]["contactShadow"],
    slots,
    register<T extends SharedObjectHandle>(key: string, handle: T): T {
      slots.set(key, handle);
      if (key === "particles") shared.particles = handle;
      return handle;
    },
    get<T extends SharedObjectHandle>(key: string): T | undefined {
      return slots.get(key) as T | undefined;
    },
  };
  vi.spyOn(shared, "register");
  vi.spyOn(shared, "get");

  return {
    renderer: {} as THREE.WebGLRenderer,
    scene,
    camera,
    lights: {
      key: new THREE.DirectionalLight(),
      rim: new THREE.DirectionalLight(),
      fill: new THREE.HemisphereLight(),
      spot: new THREE.SpotLight(),
    },
    shared,
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

describe("Particles (Mikroplastik)", () => {
  it("membangun satu Points berjumlah 2400 (HIGH), 1400 (MEDIUM), 800 (LOW) dengan atribut aSeed/aRand/aSize", () => {
    const scene = new THREE.Scene();
    const particles = new Particles(scene, QUALITY_PRESETS.high);

    expect(particles.points).toBeInstanceOf(THREE.Points);
    expect(particles.activeCount).toBe(2400);
    expect(particles.points.geometry.drawRange.count).toBe(2400);

    const geom = particles.points.geometry;
    const aSeed = geom.getAttribute("aSeed") as THREE.BufferAttribute;
    const aRand = geom.getAttribute("aRand") as THREE.BufferAttribute;
    const aSize = geom.getAttribute("aSize") as THREE.BufferAttribute;
    expect(aSeed.itemSize).toBe(3);
    expect(aRand.itemSize).toBe(4);
    expect(aSize.itemSize).toBe(1);

    // Semua seed berada pada permukaan botol dan ukuran 2..6 px
    for (let i = 0; i < 2400; i++) {
      const x = aSeed.getX(i);
      const y = aSeed.getY(i);
      const z = aSeed.getZ(i);
      expect(Math.hypot(x, z)).toBeLessThanOrEqual(BOTTLE_MAX_RADIUS + 0.01);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(1.92);
      const size = aSize.getX(i);
      expect(size).toBeGreaterThanOrEqual(2);
      expect(size).toBeLessThanOrEqual(6);
    }

    particles.setQuality(QUALITY_PRESETS.medium);
    expect(particles.activeCount).toBe(1400);
    expect(particles.points.geometry.drawRange.count).toBe(1400);

    particles.setQuality(QUALITY_PRESETS.low);
    expect(particles.activeCount).toBe(800);
    expect(particles.points.geometry.drawRange.count).toBe(800);

    expect(particles.material.blending).toBe(THREE.AdditiveBlending);
    expect(particles.material.depthWrite).toBe(false);

    particles.dispose();
  });

  it("memiliki pergerakan deterministik dan rewind uBreak=1->0 mengembalikan semua titik tepat ke aSeed", () => {
    const scene = new THREE.Scene();
    const particles = new Particles(scene, QUALITY_PRESETS.high);
    const geom = particles.points.geometry;
    const aSeed = geom.getAttribute("aSeed") as THREE.BufferAttribute;
    const aRand = geom.getAttribute("aRand") as THREE.BufferAttribute;

    const u = particles.material.uniforms;
    expect(u.uBreak).toBeDefined();
    expect(u.uFlow).toBeDefined();
    expect(u.uAttract).toBeDefined();
    expect(u.uSettle).toBeDefined();
    expect(u.uTime).toBeDefined();
    expect(u.uColor).toBeDefined();
    expect(u.uFade).toBeDefined();
    expect((u.uColor!.value as THREE.Color).getHexString().toUpperCase()).toBe("E6EAF2");

    const seed = new THREE.Vector3(aSeed.getX(42), aSeed.getY(42), aSeed.getZ(42));
    const rand = new THREE.Vector4(aRand.getX(42), aRand.getY(42), aRand.getZ(42), aRand.getW(42));

    // Saat pecah penuh uBreak=1: partikel menyebar menjauh dari botol
    particles.setParams({ breakAmt: 1, flow: 0, settle: 0, time: 12.5 });
    const brokenPos = computeParticlePosition(seed, rand, particles.getState());
    expect(brokenPos.distanceTo(seed)).toBeGreaterThan(0.5);

    // Saat ditarik ke 3 ikan (uFlow=1): partikel berkumpul di posisi target ikan
    const attractTargets: [THREE.Vector3, THREE.Vector3, THREE.Vector3] = [
      new THREE.Vector3(-1.5, 0.2, 0),
      new THREE.Vector3(0.0, 0.5, -0.4),
      new THREE.Vector3(1.6, -0.1, 0.2),
    ];
    particles.setParams({ breakAmt: 1, flow: 1, settle: 0, attract: attractTargets, time: 3 });
    const flowPos = computeParticlePosition(seed, rand, particles.getState());
    const minFishDist = Math.min(...attractTargets.map((t) => flowPos.distanceTo(t)));
    expect(minFishDist).toBeLessThan(0.05);

    // Saat mengendap ke filet di piring (uSettle=1): mendarat di elips filet
    particles.setParams({ settle: 1 });
    const settlePos = computeParticlePosition(seed, rand, particles.getState());
    expect(Math.abs(settlePos.x)).toBeLessThanOrEqual(1.06);
    expect(Math.abs(settlePos.z)).toBeLessThanOrEqual(0.43);
    expect(settlePos.y).toBeGreaterThanOrEqual(0.2);

    // Rewind punchline: uBreak=0, uFlow=0, uSettle=0 -> kembali TEPAT ke aSeed meskipun time besar
    particles.setParams({ breakAmt: 0, flow: 0, settle: 0, time: 99.0 });
    const rewoundPos = computeParticlePosition(seed, rand, particles.getState());
    expect(rewoundPos.distanceTo(seed)).toBeLessThan(1e-6);

    particles.dispose();
  });

  it("mendaftarkan diri ke ctx.shared dengan key 'particles' hanya sekali lewat ensureParticles", () => {
    const ctx = makeMockStageContext("high");
    const first = ensureParticles(ctx);
    const second = ensureParticles(ctx);

    expect(first).toBe(second);
    expect(ctx.shared.register).toHaveBeenCalledTimes(1);
    expect(ctx.shared.register).toHaveBeenCalledWith("particles", first);

    first.dispose();
  });
});
