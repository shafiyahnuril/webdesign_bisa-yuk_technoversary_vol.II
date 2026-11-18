import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bottle } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import { ensureParticles } from "../objects/particles";
import { ensureWaterSystem } from "../objects/water";
import { QUALITY_PRESETS } from "../quality";
import type { SharedObjectHandle, StageContext } from "../stage";
import { createB5Scene } from "./b5";
import { createPunchScene } from "./punch";

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
      if (key === "particles") shared.particles = handle;
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

describe("Scene B5 (Terurai) & Punchline (Layar Hening)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("B5: memutar orbit 40deg (20deg portrait), menumbuhkan retak -> tahan -> pecah + partikel, dan deterministik mundur", () => {
    const ctx = makeTestContext("high", 16 / 9);
    const b5 = createB5Scene();
    const bottleDispose = vi.spyOn(ctx.shared.bottle, "dispose");

    b5.build(ctx);
    const water = ensureWaterSystem(ctx);
    const particles = ensureParticles(ctx);

    b5.enter();
    b5.update(0.0, 0.3214, 0);
    expect(water.group.visible).toBe(true);
    expect(water.getMode()).toBe("night");
    expect(ctx.camera.position.x).toBeCloseTo(0, 3);
    expect(ctx.camera.position.z).toBeCloseTo(4.0, 3);
    expect(ctx.shared.bottle.getParams().crack).toBeCloseTo(0, 3);
    expect(ctx.shared.bottle.getParams().breakAmt).toBeCloseTo(0, 3);

    // t = 0.42: fase tahan napas (crack = 1, belum pecah)
    b5.update(0.42, 0.362, 0);
    expect(ctx.shared.bottle.getParams().crack).toBeCloseTo(1, 3);
    expect(ctx.shared.bottle.getParams().breakAmt).toBeCloseTo(0, 3);
    expect(ctx.lights.rim.intensity).toBeGreaterThanOrEqual(1.6);

    // t = 0.85: botol pecah penuh & partikel keluar, kamera orbit 40 derajat
    b5.update(0.85, 0.405, 0);
    expect(ctx.shared.bottle.getParams().breakAmt).toBeCloseTo(1, 2);
    expect(particles.group.visible).toBe(true);
    expect(particles.getState().breakAmt).toBeGreaterThan(0.6);
    const expectedAngle = (40 * Math.PI) / 180;
    expect(ctx.camera.position.x).toBeCloseTo(4 * Math.sin(expectedAngle), 2);
    expect(ctx.camera.position.z).toBeCloseTo(4 * Math.cos(expectedAngle), 2);

    // Portrait membatasi orbit ke 20 derajat
    const ctxPortrait = makeTestContext("low", 390 / 844);
    const b5P = createB5Scene();
    b5P.build(ctxPortrait);
    b5P.enter();
    b5P.update(0.85, 0.405, 0);
    const expectedPortrait = (20 * Math.PI) / 180;
    expect(ctxPortrait.camera.position.x).toBeCloseTo(4 * Math.sin(expectedPortrait), 2);

    // Gulir mundur deterministik
    b5.update(0.3, 0.35, 0);
    const snapCrack = ctx.shared.bottle.getParams().crack;
    const snapCam = ctx.camera.position.clone();
    b5.update(0.95, 0.415, 0);
    b5.update(0.3, 0.35, 0);
    expect(ctx.shared.bottle.getParams().crack).toBeCloseTo(snapCrack, 5);
    expect(ctx.camera.position.distanceTo(snapCam)).toBeLessThan(1e-5);

    b5.exit();
    b5.dispose();
    b5P.exit();
    b5P.dispose();
    expect(bottleDispose).not.toHaveBeenCalled();

    water.dispose();
    particles.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
    ensureWaterSystem(ctxPortrait).dispose();
    ensureParticles(ctxPortrait).dispose();
    ctxPortrait.shared.bottle.dispose();
    ctxPortrait.shared.contactShadow.dispose();
  });

  it("Punchline: meredupkan lampu ~8%, me-rewind partikel & botol utuh kembali (t 0.08..0.40), lalu menahan botol hantu opacity 0.15", () => {
    const ctx = makeTestContext("high", 16 / 9);
    const water = ensureWaterSystem(ctx);
    water.group.visible = true;

    const punch = createPunchScene();
    const bottleDispose = vi.spyOn(ctx.shared.bottle, "dispose");

    punch.build(ctx);
    const particles = ensureParticles(ctx);
    const particlesDispose = vi.spyOn(particles, "dispose");

    punch.enter();
    punch.update(0.02, 0.519, 0);
    expect(water.group.visible).toBe(false);
    expect(ctx.lights.key.intensity).toBeLessThan(0.3);

    // Pertengahan rewind t = 0.24
    punch.update(0.24, 0.537, 0);
    expect(particles.getState().breakAmt).toBeGreaterThan(0);
    expect(particles.getState().breakAmt).toBeLessThan(1);
    expect(ctx.shared.bottle.getParams().breakAmt).toBeLessThan(1);

    // Selesai rewind t = 0.44 -> partikel kembali ke 0, botol utuh & bening
    punch.update(0.44, 0.553, 0);
    expect(particles.getState().breakAmt).toBeCloseTo(0, 4);
    expect(ctx.shared.bottle.getParams().breakAmt).toBeCloseTo(0, 4);
    expect(ctx.shared.bottle.getParams().crack).toBeCloseTo(0, 4);
    expect(ctx.shared.bottle.getParams().turbid).toBeCloseTo(0, 4);

    // Tahan botol hantu (t = 0.70) -> opacity = 0.15
    punch.update(0.7, 0.574, 0);
    expect(ctx.shared.bottle.getParams().opacity).toBeCloseTo(0.15, 3);

    // Deterministik mundur ke awal rewind
    punch.update(0.15, 0.53, 0);
    const snapBreak = particles.getState().breakAmt;
    punch.update(0.9, 0.59, 0);
    punch.update(0.15, 0.53, 0);
    expect(particles.getState().breakAmt).toBeCloseTo(snapBreak, 5);

    punch.exit();
    punch.dispose();
    expect(bottleDispose).not.toHaveBeenCalled();
    expect(particlesDispose).not.toHaveBeenCalled();

    water.dispose();
    particles.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });
});
