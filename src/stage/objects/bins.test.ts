import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bins, BIN_SPECS } from "./bins";

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
    lineCap: "round",
    lineJoin: "round",
    lineWidth: 1,
    strokeStyle: "",
    fillStyle: "",
    font: "",
    textBaseline: "middle",
    fillRect: noop,
    fillText: noop,
    stroke: noop,
    save: noop,
    restore: noop,
    translate: noop,
    scale: noop,
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

describe("O-BINS (3 tempat sampah berlabel)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("menempatkan Plastik (-2.0), Kertas (-0.1), Organik (+1.8) sesuai ukuran dan anggaran segitiga <= 3000", () => {
    const scene = new THREE.Scene();
    const bins = new Bins(scene);

    expect(BIN_SPECS.PLASTIK.x).toBeCloseTo(-2.0, 5);
    expect(BIN_SPECS.KERTAS.x).toBeCloseTo(-0.1, 5);
    expect(BIN_SPECS.ORGANIK.x).toBeCloseTo(1.8, 5);

    expect(bins.getBin("PLASTIK").root.position.x).toBeCloseTo(-2.0, 5);
    expect(bins.getBin("KERTAS").root.position.x).toBeCloseTo(-0.1, 5);
    expect(bins.getBin("ORGANIK").root.position.x).toBeCloseTo(1.8, 5);

    expect(triangleCount(bins.group)).toBeLessThanOrEqual(3000);
    bins.dispose();
  });

  it("membuka tutup berengsel belakang sekitar sumbu X (-70 derajat) dan mereset bersih", () => {
    const scene = new THREE.Scene();
    const bins = new Bins(scene);

    bins.setLidOpen("PLASTIK", 1);
    const openAngle = bins.getBin("PLASTIK").lidPivot.rotation.x;
    expect(openAngle).toBeCloseTo((-70 * Math.PI) / 180, 4);
    expect(bins.getBin("KERTAS").lidPivot.rotation.x).toBeCloseTo(0, 5);

    bins.reset();
    expect(bins.getBin("PLASTIK").lidPivot.rotation.x).toBeCloseTo(0, 5);
    bins.dispose();
  });
});
