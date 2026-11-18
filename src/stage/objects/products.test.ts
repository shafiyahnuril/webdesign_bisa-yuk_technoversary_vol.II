import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { createToteProduct, PRODUCT_SPECS, Products } from "./products";

function installCanvas2dMock() {
  const noop = () => {};
  const fakeCtx = {
    fillStyle: "",
    fillRect: noop,
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((id: string) =>
    id === "2d" ? fakeCtx : null) as HTMLCanvasElement["getContext"]);
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
});
