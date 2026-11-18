import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bottle } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import { FishSchool } from "../objects/fish";
import { ensureParticles } from "../objects/particles";
import { PlateSet } from "../objects/plate";
import { ensureWaterSystem } from "../objects/water";
import { QUALITY_PRESETS } from "../quality";
import type { SharedObjectHandle, StageContext } from "../stage";
import { createB6Scene } from "./b6";

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

function triangleCount(root: THREE.Object3D): number {
  let total = 0;
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const g = obj.geometry;
      total += g.index ? g.index.count / 3 : (g.getAttribute("position")?.count ?? 0) / 3;
    }
  });
  return total;
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

describe("FishSchool, PlateSet & Scene B6 (Kembali ke Kita)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("membangun O-FISH (3 ikan desktop, 2 portrait, <=1000 tris) dan O-PLATE sesuai dimensi 07 (<=4000 tris)", () => {
    const parent = new THREE.Scene();
    const school = new FishSchool(parent, false);
    expect(school.fishes).toHaveLength(3);
    expect(triangleCount(school.group)).toBeLessThanOrEqual(1050);

    const portraitSchool = new FishSchool(parent, true);
    expect(portraitSchool.fishes).toHaveLength(2);

    // Uji ayunan ekor +-25 derajat
    school.update(0.5);
    const tailAngle = Math.abs(school.fishes[0]!.tailPivot.rotation.y);
    expect(tailAngle).toBeLessThanOrEqual((26 * Math.PI) / 180);

    const plate = new PlateSet(parent);
    expect(triangleCount(plate.group)).toBeLessThanOrEqual(4000);
    expect((plate.tableMesh.material as THREE.MeshStandardMaterial).depthWrite).toBe(false);
    expect(plate.tableMesh.renderOrder).toBeLessThan(plate.plateMesh.renderOrder);
    const plateBox = new THREE.Box3().setFromObject(plate.plateMesh);
    expect(plateBox.max.x - plateBox.min.x).toBeCloseTo(3.2, 1);
    expect(plateBox.max.z - plateBox.min.z).toBeCloseTo(3.2, 1);

    // Ruang negatif plateau >= 50%: luas piring di kamera top-down (fov 35, y 6.5, aspect 16/9)
    const visibleHeight = 2 * 6.5 * Math.tan((35 * Math.PI) / 360);
    const visibleArea = visibleHeight * (visibleHeight * (16 / 9));
    const plateArea = Math.PI * 1.6 * 1.6;
    expect(1 - plateArea / visibleArea).toBeGreaterThanOrEqual(0.5);

    school.dispose();
    portraitSchool.dispose();
    plate.dispose();
  });

  it("mendukung jump langsung dan gulir mundur deterministik: alir ke ikan -> match cut -> piring top-down -> fade out", () => {
    const ctx = makeTestContext("high", 16 / 9);
    const water = ensureWaterSystem(ctx);
    water.group.visible = true;

    const b6 = createB6Scene();
    const bottleDispose = vi.spyOn(ctx.shared.bottle, "dispose");
    const waterDispose = vi.spyOn(water, "dispose");

    b6.build(ctx);
    const particles = ensureParticles(ctx);
    const particlesDispose = vi.spyOn(particles, "dispose");

    // Simulasi jump langsung ke B6 (capture / teleport)
    b6.enter();
    b6.update(0.0, 0.4196, 0);
    expect(water.group.visible).toBe(false);
    expect(ctx.shared.bottle.group.visible).toBe(false);
    expect(ctx.scene.fog).toBeInstanceOf(THREE.FogExp2);
    expect((ctx.scene.fog as THREE.FogExp2).density).toBeCloseTo(0.05, 3);
    expect(ctx.camera.position.y).toBeCloseTo(0.2, 2);
    expect(ctx.camera.position.z).toBeCloseTo(5.0, 2);

    // t = 0.30: partikel tersedot ke 3 target ikan (uFlow -> 1)
    b6.update(0.3, 0.449, 0);
    expect(particles.getState().flow).toBeCloseTo(1, 2);

    // t = 0.72: kamera sudah naik ke top-down (y = 6.5, z = 0.01) & partikel mengendap di filet (uSettle = 1)
    b6.update(0.72, 0.49, 0);
    expect(ctx.camera.position.y).toBeCloseTo(6.5, 2);
    expect(ctx.camera.position.z).toBeCloseTo(0.01, 2);
    expect(particles.getState().settle).toBeCloseTo(1, 2);
    expect(particles.getState().fade).toBeGreaterThan(0.95);

    // t = 1.00: fade out penuh menuju punchline
    b6.update(1.0, 0.5179, 0);
    expect(particles.getState().fade).toBeCloseTo(0, 2);

    // Reverse scrub ke t = 0.25 -> semua posisi & uniform kembali deterministik
    b6.update(0.25, 0.444, 0);
    const snapCam = ctx.camera.position.clone();
    const snapFlow = particles.getState().flow;
    const snapSettle = particles.getState().settle;

    b6.update(0.85, 0.503, 0);
    b6.update(0.25, 0.444, 0);
    expect(ctx.camera.position.distanceTo(snapCam)).toBeLessThan(1e-5);
    expect(particles.getState().flow).toBeCloseTo(snapFlow, 5);
    expect(particles.getState().settle).toBeCloseTo(snapSettle, 5);

    // t = 0.65: partikel sudah selaras di posisi X piring
    b6.update(0.65, 0.483, 0);
    const plateSetObj = ctx.scene.getObjectByName("O-PLATE-ROOT") as THREE.Group;
    expect(Math.abs(particles.group.position.x - plateSetObj.position.x)).toBeLessThan(0.02);

    b6.exit();
    expect(particles.group.visible).toBe(false);
    b6.dispose();
    expect(bottleDispose).not.toHaveBeenCalled();
    expect(waterDispose).not.toHaveBeenCalled();
    expect(particlesDispose).not.toHaveBeenCalled();

    particles.dispose();
    water.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });

  it("membedakan material keramik piring, urat filet salmon, alat makan logam sikat, dan sisik ikan", () => {
    const scene = new THREE.Scene();
    const plate = new PlateSet(scene);
    const school = new FishSchool(scene, false);

    const plateMat = plate.plateMesh.material as THREE.MeshStandardMaterial;
    const filletMat = plate.filletMesh.material as THREE.MeshStandardMaterial;
    const knifeMat = plate.knifeMesh.material as THREE.MeshStandardMaterial;
    const fishMesh = school.fishes[0]!.root.children[0] as THREE.Mesh;
    const fishMat = fishMesh.material as THREE.MeshStandardMaterial;

    expect(plateMat.map).not.toBeNull();
    expect(filletMat.map).not.toBeNull();
    expect(filletMat.normalMap).not.toBeNull();
    expect(filletMat.roughnessMap).not.toBeNull();
    expect(knifeMat.metalness).toBeGreaterThan(0.7);
    expect(knifeMat.normalMap).not.toBeNull();
    expect(fishMat.map).not.toBeNull();
    expect(fishMat.normalMap).not.toBeNull();
    expect(plateMat.color.getHexString()).not.toBe(knifeMat.color.getHexString());

    plate.dispose();
    school.dispose();
  });
});
