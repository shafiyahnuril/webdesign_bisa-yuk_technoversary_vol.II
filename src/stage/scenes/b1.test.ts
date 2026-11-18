import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { createB1Scene } from "./b1";
import { Bottle, type BottleQualitySpec } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import type { StageContext } from "../stage";

const HIGH_SPEC: BottleQualitySpec = {
  bottleSegments: 48,
  bottleShards: { radial: 12, bands: 4 },
  crackSize: 1024,
  transmission: true,
};

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

function makeTestContext(aspect = 16 / 9): StageContext {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 200);
  const bottle = new Bottle(scene, HIGH_SPEC);
  const contactShadow = new ContactShadow(scene);

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
      bottle,
      contactShadow,
      slots: new Map(),
      register: vi.fn(),
      get: vi.fn(),
    },
    quality: "high",
    qualityConfig: {
      ...HIGH_SPEC,
      tier: "high",
      dprCap: 2,
      particles: 2400,
      waterSegments: 160,
      caustics: true,
      canvasShimmer: true,
      meltFilter: true,
      flashScissor: true,
      windowAtlas: true,
      antialias: true,
    },
    qualityManager: {} as StageContext["qualityManager"],
    size: {
      w: aspect < 0.7 ? 800 : 1600,
      h: aspect < 0.7 ? 1200 : 900,
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

describe("Scene B1 (Hero + Lahir)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("menempatkan botol, bayangan, dan kamera pada pose hero tepat di frame 0 (t=0)", () => {
    const ctx = makeTestContext(16 / 9);
    const b1 = createB1Scene();
    b1.build(ctx);
    b1.enter();
    b1.update(0, 0, 0);

    const { bottle, contactShadow } = ctx.shared;
    expect(bottle.group.position.x).toBeCloseTo(0, 5);
    expect(bottle.group.position.y).toBeCloseTo(0, 5);
    expect(bottle.group.rotation.y).toBeCloseTo(0, 5);
    expect(bottle.getParams().turbid).toBe(0);
    expect(bottle.getParams().level).toBeCloseTo(0.85, 5);

    expect(contactShadow.group.position.x).toBeCloseTo(0, 5);
    expect(ctx.camera.position.x).toBeCloseTo(0, 5);
    expect(ctx.camera.position.y).toBeCloseTo(1.05, 5);
    expect(ctx.camera.position.z).toBeCloseTo(7.2, 5);
    expect(ctx.lights.rim.intensity).toBeCloseTo(3.0, 5);

    b1.exit();
    b1.dispose();
    bottle.dispose();
    contactShadow.dispose();
  });

  it("menganimasikan turntable, geser x+1.4 -> +0.6, dolly kamera, dan transisi c1->c2 tanpa mendispose objek bersama", () => {
    const ctx = makeTestContext(16 / 9);
    const b1 = createB1Scene();
    const bottleDispose = vi.spyOn(ctx.shared.bottle, "dispose");

    b1.build(ctx);
    b1.enter();

    // Akhir fase pindah hero -> plateau (t = 0.28)
    b1.update(0.28, 0.0175, 0);
    expect(ctx.shared.bottle.group.position.x).toBeCloseTo(1.4, 3);
    expect(ctx.shared.bottle.group.rotation.y).toBeCloseTo(Math.PI * 0.9, 3);
    expect(ctx.camera.position.z).toBeCloseTo(6.6, 3);

    // Persiapan B2 (t = 0.72) dan akhir transisi (t = 1.0)
    b1.update(0.72, 0.045, 0);
    expect(ctx.shared.bottle.group.position.x).toBeCloseTo(0.6, 3);

    b1.update(1.0, 0.0625, 0);
    expect(ctx.shared.bottle.group.position.x).toBeCloseTo(0.6, 3);
    expect(ctx.shared.bottle.getParams().turbid).toBeCloseTo(0.1, 3);
    expect(ctx.lights.rim.intensity).toBeCloseTo(2.8, 3);
    expect(ctx.scene.environmentIntensity).toBeCloseTo(0.55, 3);

    b1.exit();
    b1.dispose();
    expect(bottleDispose).not.toHaveBeenCalled();

    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });
});
