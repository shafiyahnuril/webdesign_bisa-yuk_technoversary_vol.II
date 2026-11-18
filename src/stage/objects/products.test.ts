import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { createToteProduct, MAX_CLOTH_FLUTTER, PRODUCT_SPECS, Products } from "./products";

function installCanvas2dMock() {
  const noop = () => {};
  const fakeCtx = {
    fillStyle: "",
    fillRect: noop,
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((id: string) =>
    id === "2d" ? fakeCtx : null) as HTMLCanvasElement["getContext"]);
}

function inspectZVariationAlongSlice(geom: THREE.BufferGeometry, yMin: number, yMax: number) {
  const pos = geom.getAttribute("position") as THREE.BufferAttribute;
  const frontZs: number[] = [];
  const hemYs: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (y >= yMin && y <= yMax && z > 0.05) {
      frontZs.push(z);
    }
    if (y < 0.35) {
      hemYs.push(y);
    }
  }
  const minZ = Math.min(...frontZs);
  const maxZ = Math.max(...frontZs);
  const minHemY = Math.min(...hemYs);
  const maxHemY = Math.max(...hemYs);
  return { zSpread: maxZ - minZ, hemCurveSpread: maxHemY - minHemY };
}

describe("O-PRODUCTS (7 produk daur ulang + Tote reusable)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("mengekspor createToteProduct dengan dimensi 2.6x2.8x0.7 dan warna #2A7F78", () => {
    const tote = createToteProduct();
    expect(tote.id).toBe("tote");
    expect(PRODUCT_SPECS.tote.width).toBeCloseTo(2.6, 5);
    expect(PRODUCT_SPECS.tote.height).toBeCloseTo(2.8, 5);
    expect(PRODUCT_SPECS.tote.depth).toBeCloseTo(0.7, 5);
    expect(PRODUCT_SPECS.tote.color).toBe("#2A7F78");
    tote.dispose();
  });

  it("menempatkan 7 produk dari x=-9.6..+9.6 spasi 3.2 dan meredupkan warna x0.45 tanpa opacity", () => {
    const scene = new THREE.Scene();
    const products = new Products(scene);

    expect(products.items).toHaveLength(7);
    const xs = products.items.map((p) => p.group.position.x);
    expect(xs).toEqual([-9.6, -6.4, -3.2, 0, 3.2, 6.4, 9.6]);

    // Cek redup warna x0.45 (bukan opacity)
    const toteMat = products.getProduct("tote").group.children[0] as THREE.Mesh;
    const matBefore = (toteMat.material as THREE.MeshStandardMaterial).color.r;
    expect((toteMat.material as THREE.MeshStandardMaterial).opacity).toBe(1);
    expect((toteMat.material as THREE.MeshStandardMaterial).transparent).toBe(false);

    products.setDim(0.45);
    const matAfter = (toteMat.material as THREE.MeshStandardMaterial).color.r;
    expect(matAfter).toBeCloseTo(matBefore * 0.45, 3);
    expect((toteMat.material as THREE.MeshStandardMaterial).opacity).toBe(1);

    // Compact mode (portrait HP): 5 produk tampil, backpack & fleece disembunyikan
    products.setCompactMode(true);
    expect(products.getProduct("backpack").group.visible).toBe(false);
    expect(products.getProduct("fleece").group.visible).toBe(false);
    expect(products.getProduct("tote").group.visible).toBe(true);

    products.reset();
    expect(products.getProduct("backpack").group.visible).toBe(true);
    expect((toteMat.material as THREE.MeshStandardMaterial).color.r).toBeCloseTo(matBefore, 3);

    const benchWood = (products.getProduct("bench").group.children[0] as THREE.Mesh)
      .material as THREE.MeshStandardMaterial;
    const benchLeg = (products.getProduct("bench").group.children[3] as THREE.Mesh)
      .material as THREE.MeshStandardMaterial;
    const backpackMat = (products.getProduct("backpack").group.children[0] as THREE.Mesh)
      .material as THREE.MeshStandardMaterial;
    expect(benchWood.map).not.toBeNull();
    expect(benchWood.normalMap).not.toBeNull();
    expect(benchLeg.metalness).toBeGreaterThan(0.5);
    expect(backpackMat.roughness).toBeLessThan(benchWood.roughness);
    expect(benchWood.color.getHexString()).not.toBe(
      (toteMat.material as THREE.MeshStandardMaterial).color.getHexString(),
    );

    products.dispose();
  });

  it("membentuk garmen kain bervolume dengan lipatan non-planar, hem melengkung, stand menempel rak, dan flutter terbatas waktu", () => {
    const scene = new THREE.Scene();
    const products = new Products(scene, 0.76, false);

    // 1. Cek non-planarity & lipatan pada kaus (tee) dan jaket (fleece)
    const teeGroup = products.getProduct("tee").group;
    const teeTorso = teeGroup.getObjectByName("Product_tee_torso") as THREE.Mesh;
    expect(teeTorso).toBeDefined();
    const teeMetrics = inspectZVariationAlongSlice(teeTorso.geometry, 0.4, 1.4);
    expect(teeMetrics.zSpread).toBeGreaterThan(0.08);
    expect(teeMetrics.hemCurveSpread).toBeGreaterThan(0.03);

    const fleeceGroup = products.getProduct("fleece").group;
    const fleeceTorso = fleeceGroup.getObjectByName("Product_fleece_torso") as THREE.Mesh;
    expect(fleeceTorso).toBeDefined();
    const fleeceMetrics = inspectZVariationAlongSlice(fleeceTorso.geometry, 0.4, 1.5);
    expect(fleeceMetrics.zSpread).toBeGreaterThan(0.08);
    expect(fleeceMetrics.hemCurveSpread).toBeGreaterThan(0.025);

    // 2. Cek semua produk bertumpu wajar di atas papan rak (local y.min ~ 0, tidak melayang)
    for (const item of products.items) {
      const box = new THREE.Box3().setFromObject(item.group);
      expect(box.min.y).toBeGreaterThanOrEqual(0.7);
      expect(box.min.y).toBeLessThanOrEqual(0.8);
    }

    // 3. Cek flutter berbasis waktu strictly <= MAX_CLOTH_FLUTTER (0.004) pada kain & 0 pada kayu/keramik
    const teePos = teeTorso.geometry.getAttribute("position") as THREE.BufferAttribute;
    const teeRest = new Float32Array(teePos.array as ArrayLike<number>);
    const benchMesh = products.getProduct("bench").group.children[0] as THREE.Mesh;
    const benchPos = benchMesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const benchRest = new Float32Array(benchPos.array as ArrayLike<number>);

    products.updateFlutter(1.25, true);
    let maxTeeDelta = 0;
    for (let i = 0; i < teePos.count; i++) {
      const dx = teePos.getX(i) - (teeRest[i * 3] ?? 0);
      const dy = teePos.getY(i) - (teeRest[i * 3 + 1] ?? 0);
      const dz = teePos.getZ(i) - (teeRest[i * 3 + 2] ?? 0);
      const d = Math.hypot(dx, dy, dz);
      if (d > maxTeeDelta) maxTeeDelta = d;
    }
    expect(maxTeeDelta).toBeGreaterThan(0.0002);
    expect(maxTeeDelta).toBeLessThanOrEqual(MAX_CLOTH_FLUTTER + 1e-5);

    for (let i = 0; i < benchPos.count; i++) {
      expect(benchPos.getZ(i)).toBeCloseTo(benchRest[i * 3 + 2] ?? 0, 6);
    }

    // 4. Cek tier LOW menurunkan subdivisi geometri & mematikan flutter + rebuild/dim aman
    const highVertCount = teePos.count;
    products.setQuality("low");
    const lowTeeTorso = products
      .getProduct("tee")
      .group.getObjectByName("Product_tee_torso") as THREE.Mesh;
    expect(lowTeeTorso).toBeDefined();
    expect(lowTeeTorso.geometry.getAttribute("position").count).toBeLessThan(highVertCount);

    products.setDim(0.45);
    const lowToteMat = (products.getProduct("tote").group.children[0] as THREE.Mesh)
      .material as THREE.MeshStandardMaterial;
    expect(lowToteMat.color.r).toBeLessThan(0.2);

    products.dispose();
  });
});
