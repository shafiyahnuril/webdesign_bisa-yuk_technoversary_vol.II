import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bottle } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import { ensureWaterSystem } from "../objects/water";
import { QUALITY_PRESETS } from "../quality";
import type { SharedObjectHandle, StageContext } from "../stage";
import { createB4Scene } from "./b4";

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

describe("Scene B4 (Lautan)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("membangun matahari putih dingin, dermaga 4 tiang + tanda ukur, serta karang 18 gugus (HIGH) / 8 (LOW)", () => {
    const ctxHigh = makeTestContext("high", 16 / 9);
    const b4High = createB4Scene();
    b4High.build(ctxHigh);
    b4High.enter();
    b4High.update(0.25, 0.25, 0);

    const sun = ctxHigh.scene.getObjectByName("O-SUN") as THREE.Mesh;
    expect(sun).toBeDefined();
    expect(sun.position.x).toBeCloseTo(8, 3);
    expect(sun.position.y).toBeCloseTo(6, 3);
    expect(sun.position.z).toBeCloseTo(-30, 3);

    const pier = ctxHigh.scene.getObjectByName("O-PIER") as THREE.Group;
    expect(pier).toBeDefined();
    const posts = pier.getObjectByName("O-PIER-POSTS") as THREE.InstancedMesh;
    const ticks = pier.getObjectByName("O-PIER-TICKS") as THREE.InstancedMesh;
    expect(posts.count).toBe(4);
    expect(ticks.count).toBeGreaterThanOrEqual(20);

    const coralHigh = ctxHigh.scene.getObjectByName("O-CORAL") as THREE.Group;
    expect(coralHigh).toBeDefined();
    expect(coralHigh.userData.clusterCount).toBe(18);

    // LOW tier -> 8 gugus karang
    const ctxLow = makeTestContext("low", 16 / 9);
    const b4Low = createB4Scene();
    b4Low.build(ctxLow);
    const coralLow = ctxLow.scene.getObjectByName("O-CORAL") as THREE.Group;
    expect(coralLow.userData.clusterCount).toBe(8);

    b4High.exit();
    b4High.dispose();
    b4Low.exit();
    b4Low.dispose();
    ensureWaterSystem(ctxHigh).dispose();
    ensureWaterSystem(ctxLow).dispose();
    ctxHigh.shared.bottle.dispose();
    ctxHigh.shared.contactShadow.dispose();
    ctxLow.shared.bottle.dispose();
    ctxLow.shared.contactShadow.dispose();
  });

  it("menaikkan ombak Gerstner, menaikkan air di tiang dermaga 0.3, menyelam mulus, memutihkan karang, dan deterministik saat mundur", () => {
    const ctx = makeTestContext("high", 16 / 9);
    const b4 = createB4Scene();
    const bottleDispose = vi.spyOn(ctx.shared.bottle, "dispose");

    b4.build(ctx);
    const water = ensureWaterSystem(ctx);
    const waterDispose = vi.spyOn(water, "dispose");

    b4.enter();
    b4.update(0.05, 0.24, 0);
    const pier = ctx.scene.getObjectByName("O-PIER") as THREE.Group;
    const coral = ctx.scene.getObjectByName("O-CORAL") as THREE.Group;
    const coralMat = (coral.getObjectByName("O-CORAL-BRANCHES") as THREE.InstancedMesh)
      .material as THREE.MeshStandardMaterial;

    expect(water.getDimensions()).toEqual({ width: 120, depth: 120 });
    expect(ctx.camera.position.y).toBeCloseTo(1.2, 2);
    const initialPierY = pier.position.y;
    const healthyBlue = coralMat.color.b;

    // Puncak gelombang sebelum menyelam (t = 0.48)
    b4.update(0.48, 0.275, 0);
    expect(water.getParams().amplitude).toBeCloseTo(0.5, 2);
    expect(water.getParams().speed).toBeCloseTo(2.2, 2);
    expect(initialPierY - pier.position.y).toBeCloseTo(0.3, 2);

    // Menyelam ke bawah permukaan (t = 0.78) -> kamera y = -1.4, underwater = 1, karang memutih #E6EAF2
    b4.update(0.78, 0.3, 0);
    expect(ctx.camera.position.y).toBeCloseTo(-1.4, 2);
    expect(water.getParams().underwater).toBeGreaterThan(0.95);
    expect(coralMat.color.getHexString().toUpperCase()).toBe("E6EAF2");
    expect(coralMat.color.r).toBeGreaterThan(healthyBlue * 0.8);

    // Gulir mundur ke t = 0.15 -> keadaan kembali identik
    b4.update(0.15, 0.245, 0);
    const snapCam = ctx.camera.position.clone();
    const snapBottle = ctx.shared.bottle.group.position.clone();
    const snapPierY = pier.position.y;

    b4.update(0.9, 0.31, 0);
    b4.update(0.15, 0.245, 0);
    expect(ctx.camera.position.distanceTo(snapCam)).toBeLessThan(1e-5);
    expect(ctx.shared.bottle.group.position.distanceTo(snapBottle)).toBeLessThan(1e-5);
    expect(pier.position.y).toBeCloseTo(snapPierY, 5);

    b4.exit();
    expect(water.group.visible).toBe(false);
    b4.dispose();
    expect(bottleDispose).not.toHaveBeenCalled();
    expect(waterDispose).not.toHaveBeenCalled();

    water.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });
});
