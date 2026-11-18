import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Shelf, SHELF_SPECS } from "./shelf";
import { Products } from "./products";
import { Tumbler, TUMBLER_SPECS } from "./tumbler";

function triangleCount(root: THREE.Object3D): number {
  let tris = 0;
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const g = obj.geometry;
      tris += g.index ? g.index.count / 3 : (g.getAttribute("position")?.count ?? 0) / 3;
    }
  });
  return tris;
}

function installCanvas2dMock() {
  const noop = () => {};
  const fakeCtx = {
    fillStyle: "",
    fillRect: noop,
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((id: string) =>
    id === "2d" ? fakeCtx : null) as HTMLCanvasElement["getContext"]);
}

describe("O-SHELF + O-TUMBLER + O-PLINTH", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("membangun rak 26x0.12x1.4 di y=0.7 dan gabungan rak + 7 produk <= 16000 segitiga", () => {
    const scene = new THREE.Scene();
    const shelf = new Shelf(scene);
    const products = new Products(scene, SHELF_SPECS.topY);

    expect(SHELF_SPECS.width).toBeCloseTo(26, 5);
    expect(SHELF_SPECS.thickness).toBeCloseTo(0.12, 5);
    expect(SHELF_SPECS.depth).toBeCloseTo(1.4, 5);
    expect(SHELF_SPECS.y).toBeCloseTo(0.7, 5);
    expect(shelf.plankMesh.position.y).toBeCloseTo(0.7, 5);

    const totalTris = triangleCount(shelf.group) + triangleCount(products.group);
    expect(totalTris).toBeLessThanOrEqual(16000);

    products.dispose();
    shelf.dispose();
  });

  it("membangun tumbler tinggi 2.22 powder-coat teal tanpa teks, di atas plinth radius 0.5 tinggi 0.25 pada x=14", () => {
    const scene = new THREE.Scene();
    const tumbler = new Tumbler(scene);

    expect(TUMBLER_SPECS.totalHeight).toBeCloseTo(2.22, 5);
    expect(TUMBLER_SPECS.plinthRadius).toBeCloseTo(0.5, 5);
    expect(TUMBLER_SPECS.plinthHeight).toBeCloseTo(0.25, 5);
    expect(tumbler.group.position.x).toBeCloseTo(14, 5);
    expect(tumbler.vesselGroup.position.y).toBeCloseTo(0.25, 5);

    const bodyMat = tumbler.bodyMesh.material as THREE.MeshStandardMaterial;
    expect(bodyMat.color.getHexString().toUpperCase()).toBe("0F8B8D");
    expect(bodyMat.roughness).toBeCloseTo(0.55, 5);
    expect(bodyMat.metalness).toBeCloseTo(0.1, 5);
    expect(bodyMat.map).toBeNull();

    const box = new THREE.Box3().setFromObject(tumbler.vesselGroup);
    const vesselHeight = box.max.y - box.min.y;
    expect(vesselHeight).toBeCloseTo(2.22, 2);

    tumbler.dispose();
  });
});
