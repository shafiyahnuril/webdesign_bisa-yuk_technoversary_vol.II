import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bottle, BOTTLE_HEIGHT, BOTTLE_MAX_RADIUS, type BottleQualitySpec } from "./bottle";
import { ContactShadow } from "./contact-shadow";

const HIGH_SPEC: BottleQualitySpec = {
  bottleSegments: 48,
  bottleShards: { radial: 12, bands: 4 },
  crackSize: 1024,
  transmission: true,
};

const LOW_SPEC: BottleQualitySpec = {
  bottleSegments: 20,
  bottleShards: { radial: 8, bands: 3 },
  crackSize: 512,
  transmission: false,
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

function triangleCount(mesh: THREE.Mesh): number {
  const g = mesh.geometry;
  if (g.index) return g.index.count / 3;
  return (g.getAttribute("position")?.count ?? 0) / 3;
}

describe("Bottle & ContactShadow", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("membangun profil Lathe tinggi 2.1, radius maks 0.328, pivot y=0, dalam anggaran segitiga", () => {
    const parent = new THREE.Scene();
    const bottle = new Bottle(parent, HIGH_SPEC);

    const box = new THREE.Box3().setFromObject(bottle.group);
    expect(box.min.y).toBeCloseTo(0, 3);
    expect(box.max.y).toBeCloseTo(BOTTLE_HEIGHT, 3);

    const bodyBox = new THREE.Box3().setFromObject(bottle.bodyMesh);
    expect(bodyBox.max.x).toBeCloseTo(BOTTLE_MAX_RADIUS, 3);
    expect(bodyBox.min.x).toBeCloseTo(-BOTTLE_MAX_RADIUS, 3);

    const totalTris =
      triangleCount(bottle.bodyMesh) +
      triangleCount(bottle.capMesh) +
      triangleCount(bottle.liquidMesh) +
      triangleCount(bottle.labelMesh);
    expect(totalTris).toBeLessThanOrEqual(9000);

    bottle.dispose();
  });

  it("membagi badan botol menjadi 48 serpihan (HIGH/MEDIUM) dan 24 serpihan (LOW) dalam 1 mesh", () => {
    const parent = new THREE.Scene();
    const bottle = new Bottle(parent, HIGH_SPEC);

    expect(bottle.shardCount).toBe(48);
    const geomHigh = bottle.bodyMesh.geometry;
    expect(geomHigh.getAttribute("aShard")).toBeDefined();
    expect(geomHigh.getAttribute("aCenter")).toBeDefined();
    expect(geomHigh.getAttribute("aRand")).toBeDefined();

    const aShardHigh = geomHigh.getAttribute("aShard");
    const uniqueHigh = new Set<number>();
    for (let i = 0; i < aShardHigh.count; i++) uniqueHigh.add(aShardHigh.getX(i));
    expect(uniqueHigh.size).toBe(48);

    bottle.setQuality(LOW_SPEC);
    expect(bottle.shardCount).toBe(24);
    const aShardLow = bottle.bodyMesh.geometry.getAttribute("aShard");
    const uniqueLow = new Set<number>();
    for (let i = 0; i < aShardLow.count; i++) uniqueLow.add(aShardLow.getX(i));
    expect(uniqueLow.size).toBe(24);

    bottle.dispose();
  });

  it("mengatur clipping plane cairan horizontal dunia bahkan saat botol miring -115 derajat", () => {
    const parent = new THREE.Scene();
    const bottle = new Bottle(parent, HIGH_SPEC);

    const liquidMat = bottle.liquidMesh.material as THREE.MeshPhysicalMaterial;
    expect(liquidMat.transmission).toBeCloseTo(0.9, 3);
    expect(liquidMat.clippingPlanes).toHaveLength(1);
    const plane = liquidMat.clippingPlanes![0]!;
    expect(plane.normal.x).toBeCloseTo(0, 5);
    expect(plane.normal.y).toBeCloseTo(-1, 5);
    expect(plane.normal.z).toBeCloseTo(0, 5);

    bottle.setLevel(0.85);
    const uprightHigh = plane.constant;
    bottle.setLevel(0.03);
    const uprightLow = plane.constant;
    expect(uprightHigh).toBeGreaterThan(1.3);
    expect(uprightLow).toBeLessThan(0.2);

    // Simulasikan pose minum B2: rotasi Z -115 deg, naik ke y = 2.2
    bottle.group.position.set(1.1, 2.2, 0);
    bottle.group.rotation.z = (-115 * Math.PI) / 180;
    bottle.setLevel(0.5);
    expect(plane.normal.y).toBeCloseTo(-1, 5);
    // Bidang potong dunia tetap di kisaran posisi cairan yang terangkat
    expect(plane.constant).toBeGreaterThan(1.4);
    expect(plane.constant).toBeLessThan(2.5);

    bottle.setQuality(LOW_SPEC);
    const lowLiquidMat = bottle.liquidMesh.material as THREE.MeshStandardMaterial;
    expect((lowLiquidMat as unknown as { transmission?: number }).transmission ?? 0).toBe(0);

    bottle.dispose();
  });

  it("mendukung attachToHand, detach, setParams, dan reset", () => {
    const scene = new THREE.Scene();
    const anchor = new THREE.Group();
    anchor.position.set(1.1, 0.4, 0);
    scene.add(anchor);
    scene.updateMatrixWorld(true);

    const bottle = new Bottle(scene, HIGH_SPEC);
    bottle.group.position.set(0.6, 0, 0);
    bottle.attachToHand(anchor);
    expect(bottle.group.parent).toBe(anchor);

    bottle.setParams({ turbid: 0.6, crack: 0.8, breakAmt: 0.4, dirt: 0.3, opacity: 0.7 });
    const bodyMat = bottle.bodyMesh.material as THREE.MeshPhysicalMaterial;
    expect(bodyMat.roughness).toBeCloseTo(0.06 + 0.44 * 0.6, 3);
    expect(bodyMat.transmission).toBeCloseTo(1 - 0.45 * 0.6, 3);

    bottle.detach();
    expect(bottle.group.parent).toBe(scene);

    bottle.reset();
    expect(bottle.group.position.x).toBe(0);
    expect(bottle.getParams().turbid).toBe(0);
    expect(bottle.getParams().level).toBeCloseTo(0.85, 5);

    const shadow = new ContactShadow(scene);
    expect(triangleCount(shadow.mesh)).toBe(2);
    shadow.setOpacity(0.2);
    shadow.setScale(1.8);
    shadow.reset();
    shadow.dispose();
    bottle.dispose();
  });

  it("memakai MeshStandardMaterial transparan pada badan & cairan LOW, menjaga parameter shader, dan aman saat high -> low -> high", () => {
    const scene = new THREE.Scene();
    const bottle = new Bottle(scene, HIGH_SPEC);

    expect(bottle.bodyMesh.material).toBeInstanceOf(THREE.MeshPhysicalMaterial);
    expect(bottle.liquidMesh.material).toBeInstanceOf(THREE.MeshPhysicalMaterial);

    bottle.setQuality(LOW_SPEC);
    expect(bottle.shardCount).toBe(24);
    expect(bottle.bodyMesh.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(bottle.bodyMesh.material).not.toBeInstanceOf(THREE.MeshPhysicalMaterial);
    expect(bottle.liquidMesh.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(bottle.liquidMesh.material).not.toBeInstanceOf(THREE.MeshPhysicalMaterial);

    bottle.setParams({ turbid: 0.5, crack: 0.7, breakAmt: 0.3, dirt: 0.4, opacity: 0.8 });
    const lowBody = bottle.bodyMesh.material as THREE.MeshStandardMaterial;
    expect(lowBody.transparent).toBe(true);
    expect(lowBody.depthWrite).toBe(false);
    expect(lowBody.opacity).toBeCloseTo((0.36 + 0.32 * 0.5) * 0.8, 3);
    expect(lowBody.roughness).toBeCloseTo(0.14 + 0.44 * 0.5, 3);
    expect(lowBody.customProgramCacheKey()).toBe("rebottle-pet-low-v1");
    expect(bottle.getParams()).toMatchObject({
      turbid: 0.5,
      crack: 0.7,
      breakAmt: 0.3,
      dirt: 0.4,
      opacity: 0.8,
    });

    bottle.setQuality(HIGH_SPEC);
    expect(bottle.shardCount).toBe(48);
    expect(bottle.bodyMesh.material).toBeInstanceOf(THREE.MeshPhysicalMaterial);
    expect(bottle.liquidMesh.material).toBeInstanceOf(THREE.MeshPhysicalMaterial);
    const highBody = bottle.bodyMesh.material as THREE.MeshPhysicalMaterial;
    expect(highBody.customProgramCacheKey()).toBe("rebottle-pet-v1");
    expect(highBody.transmission).toBeCloseTo(1 - 0.45 * 0.5, 3);
    expect(highBody.clearcoat).toBeCloseTo(0.6 - 0.45 * 0.4, 3);
    const highLiquid = bottle.liquidMesh.material as THREE.MeshPhysicalMaterial;
    expect(highLiquid.transmission).toBeCloseTo(0.9, 3);

    bottle.dispose();
  });
});
