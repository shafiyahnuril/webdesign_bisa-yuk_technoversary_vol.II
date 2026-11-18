import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bottle } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import { CityEnvironment, TRASH_COUNT_DESKTOP, TRASH_COUNT_COMPACT } from "../objects/city";
import { ensureWaterSystem } from "../objects/water";
import { QUALITY_PRESETS } from "../quality";
import type { SharedObjectHandle, StageContext } from "../stage";
import { createB3Scene } from "./b3";

function installCanvas2dMock() {
  const noop = () => {};
  const fakeGradient = { addColorStop: noop };
  const fakeCtx = {
    lineCap: "round",
    lineJoin: "round",
    lineWidth: 1,
    strokeStyle: "",
    fillStyle: "",
    font: "",
    textBaseline: "middle",
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    fill: noop,
    fillRect: noop,
    fillText: noop,
    save: noop,
    restore: noop,
    translate: noop,
    scale: noop,
    createRadialGradient: () => fakeGradient,
    createImageData: (w: number, h: number) => ({
      width: w,
      height: h,
      data: new Uint8ClampedArray(w * h * 4),
    }),
    putImageData: noop,
  } as unknown as CanvasRenderingContext2D;

  vi.stubGlobal(
    "Path2D",
    class Path2DMock {
      constructor() {}
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((id: string) =>
    id === "2d" ? fakeCtx : null) as HTMLCanvasElement["getContext"]);
}

function makeTestContext(tier: "high" | "low" = "high", aspect = 16 / 9): StageContext {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 200);
  const cfg = QUALITY_PRESETS[tier];
  const bottle = new Bottle(scene, cfg);
  const contactShadow = new ContactShadow(scene);
  const slots = new Map<string, SharedObjectHandle>();

  const shared: StageContext["shared"] = {
    bottle,
    contactShadow,
    slots,
    register<T extends SharedObjectHandle>(key: string, handle: T): T {
      slots.set(key, handle);
      if (key === "water") shared.water = handle;
      return handle;
    },
    get<T extends SharedObjectHandle>(key: string): T | undefined {
      return slots.get(key) as T | undefined;
    },
  };

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
    shared,
    quality: tier,
    qualityConfig: cfg,
    qualityManager: {} as StageContext["qualityManager"],
    size: {
      w: aspect < 0.7 ? 390 : 1280,
      h: aspect < 0.7 ? 844 : 720,
      dpr: 1,
      aspect,
      isPortrait: aspect < 0.7,
    },
    uniforms: { uTime: { value: 0 } },
    env: new THREE.Texture(),
    reducedMotion: false,
    applyResponsiveCamera: vi.fn((fov = 35) => {
      camera.fov = aspect < 0.7 ? 42 : fov;
      camera.updateProjectionMatrix();
    }),
  };
}

describe("CityEnvironment & Scene B3 (Tersesat)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("membangun kota 3 lapis seeded(7), tanggul + 40 pagar, jembatan, dan 28/14 sampah dalam anggaran", () => {
    const parent = new THREE.Scene();
    const cityHigh = new CityEnvironment(parent, QUALITY_PRESETS.high, false);

    expect(cityHigh.farBuildings.count).toBe(60);
    expect(cityHigh.midBuildings.count).toBe(40);
    expect(cityHigh.nearBuildings.count).toBe(3);
    expect(cityHigh.fencePosts.count).toBe(40);
    expect(cityHigh.totalTrashCount).toBe(TRASH_COUNT_DESKTOP);
    expect(TRASH_COUNT_DESKTOP).toBe(28);
    expect(cityHigh.bridgeGroup.children.length).toBeGreaterThanOrEqual(4);

    // Deterministik: instance kedua dengan seed 7 memiliki matriks gedung jauh yang identik
    const cityHigh2 = new CityEnvironment(parent, QUALITY_PRESETS.high, false);
    const m1 = new THREE.Matrix4();
    const m2 = new THREE.Matrix4();
    cityHigh.farBuildings.getMatrixAt(5, m1);
    cityHigh2.farBuildings.getMatrixAt(5, m2);
    expect(m1.elements).toEqual(m2.elements);

    cityHigh.setTrashVisibleFraction(0);
    expect(cityHigh.visibleTrashCount).toBe(4);
    cityHigh.setTrashVisibleFraction(1);
    expect(cityHigh.visibleTrashCount).toBe(28);

    // Portrait / LOW memangkas jumlah bangunan jauh & sampah
    const cityCompact = new CityEnvironment(parent, QUALITY_PRESETS.low, true);
    expect(cityCompact.farBuildings.count).toBe(30);
    expect(cityCompact.totalTrashCount).toBe(TRASH_COUNT_COMPACT);
    expect(TRASH_COUNT_COMPACT).toBe(14);

    cityHigh.dispose();
    cityHigh2.dispose();
    cityCompact.dispose();

    const cityDyn = new CityEnvironment(parent, QUALITY_PRESETS.high, false);
    expect(cityDyn.farBuildings.count).toBe(60);
    cityDyn.setCompactMode(true);
    expect(cityDyn.farBuildings.count).toBe(30);
    expect(cityDyn.totalTrashCount).toBe(TRASH_COUNT_COMPACT);
    cityDyn.dispose();
  });

  it("mengatur kamera sejajar sungai, meredup di kolong jembatan t=0.49, membesar ke muara, dan deterministik saat mundur", () => {
    const ctx = makeTestContext("high", 16 / 9);
    const b3 = createB3Scene();
    const bottleDispose = vi.spyOn(ctx.shared.bottle, "dispose");

    b3.build(ctx);
    const water = ensureWaterSystem(ctx);
    const waterDispose = vi.spyOn(water, "dispose");

    b3.enter();
    b3.update(0.0, 0.1429, 0);
    expect(ctx.camera.position.x).toBeCloseTo(-6, 3);
    expect(ctx.camera.position.y).toBeCloseTo(0.45, 3);
    expect(ctx.camera.position.z).toBeCloseTo(5.2, 3);
    expect(water.group.visible).toBe(true);
    expect(water.getDimensions()).toEqual({ width: 40, depth: 14 });
    expect(ctx.scene.fog).toBeInstanceOf(THREE.FogExp2);

    // Kolong jembatan ~ t=0.49 -> intensitas cahaya meredup ~0.4x
    b3.update(0.25, 0.165, 0);
    const normalKey = ctx.lights.key.intensity;
    b3.update(0.49, 0.186, 0);
    expect(ctx.lights.key.intensity).toBeLessThan(normalKey * 0.55);

    // Muara t=1.0 -> air melebar menuju laut 120x120 & kabut menipis
    b3.update(1.0, 0.2321, 0);
    expect(ctx.camera.position.x).toBeCloseTo(6, 3);
    expect(water.getDimensions().width).toBeCloseTo(120, 1);
    expect((ctx.scene.fog as THREE.FogExp2).density).toBeLessThan(0.02);

    // Gulir mundur deterministik: kembali ke t=0.25 memulihkan keadaan identik
    const snapPos = new THREE.Vector3();
    const snapBottlePos = new THREE.Vector3();
    b3.update(0.25, 0.165, 0);
    snapPos.copy(ctx.camera.position);
    snapBottlePos.copy(ctx.shared.bottle.group.position);

    b3.update(0.85, 0.21, 0);
    b3.update(0.25, 0.165, 0);
    expect(ctx.camera.position.distanceTo(snapPos)).toBeLessThan(1e-5);
    expect(ctx.shared.bottle.group.position.distanceTo(snapBottlePos)).toBeLessThan(1e-5);

    b3.exit();
    expect(water.group.visible).toBe(false);
    b3.dispose();
    expect(bottleDispose).not.toHaveBeenCalled();
    expect(waterDispose).not.toHaveBeenCalled();

    water.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });

  it("menjaga siluet botol B3 utuh di kolom kiri pada layar 1600x900 tanpa terpotong tepi kiri atau menabrak teks kanan", () => {
    const ctx = makeTestContext("high", 1600 / 900);
    ctx.size.w = 1600;
    ctx.size.h = 900;
    const b3 = createB3Scene();
    b3.build(ctx);
    b3.enter();

    const bottlePts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 2.1, 0),
      new THREE.Vector3(-0.325, 1.05, 0),
      new THREE.Vector3(0.325, 1.05, 0),
    ];

    for (const t of [0.1, 0.25, 0.4, 0.55, 0.72, 0.9]) {
      b3.update(t, 0.1429 + t * 0.089, 0);
      ctx.camera.updateMatrixWorld(true);
      ctx.shared.bottle.group.updateMatrixWorld(true);

      let minNdcX = Infinity;
      let maxNdcX = -Infinity;
      for (const localPt of bottlePts) {
        const projected = localPt
          .clone()
          .applyMatrix4(ctx.shared.bottle.group.matrixWorld)
          .project(ctx.camera);
        minNdcX = Math.min(minNdcX, projected.x);
        maxNdcX = Math.max(maxNdcX, projected.x);
      }

      // Tidak terpotong tepi kiri (minNdcX > -0.92) dan tetap berada di kolom kiri saat teks kanan aktif
      expect(minNdcX).toBeGreaterThan(-0.92);
      if (t >= 0.25) {
        expect(maxNdcX).toBeLessThan(0.14);
      }
    }

    b3.exit();
    b3.dispose();
    ctx.shared.water?.dispose?.();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });

  it("memakai MeshLambertMaterial ringan bebas PMREM di LOW dan menjaga MeshStandardMaterial di MEDIUM/HIGH", () => {
    const parent = new THREE.Scene();
    const cityLow = new CityEnvironment(parent, QUALITY_PRESETS.low, false);
    const cityMed = new CityEnvironment(parent, QUALITY_PRESETS.medium, false);
    const cityHigh = new CityEnvironment(parent, QUALITY_PRESETS.high, false);

    expect(cityLow.farBuildings.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    expect(cityLow.midBuildings.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    expect(cityLow.nearBuildings.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    expect(cityLow.embankmentWall.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    expect(cityLow.fencePosts.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    expect(cityLow.trashBags.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    expect(cityLow.trashCups.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    expect(cityLow.trashBottles.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    expect((cityLow.farBuildings.material as THREE.Material).customProgramCacheKey()).toBe(
      "rebottle-city-lambert-low",
    );

    expect(cityMed.farBuildings.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(cityMed.midBuildings.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(cityHigh.farBuildings.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(cityHigh.midBuildings.material).toBeInstanceOf(THREE.MeshStandardMaterial);

    cityLow.dispose();
    cityMed.dispose();
    cityHigh.dispose();
  });
});
