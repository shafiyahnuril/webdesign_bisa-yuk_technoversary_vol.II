import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { PROCESS_STATIONS, ProcessLine } from "./processline";

function triangleCount(root: THREE.Object3D): number {
  let tris = 0;
  root.traverse((obj) => {
    if (obj instanceof THREE.InstancedMesh) {
      const g = obj.geometry;
      const base = g.index ? g.index.count / 3 : (g.getAttribute("position")?.count ?? 0) / 3;
      tris += base * obj.count;
    } else if (obj instanceof THREE.Mesh) {
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

describe("O-PROCESS (4 stasiun pabrik Bab 9)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("membangun 4 stasiun (0, 6, 12, 18), jumlah partikel HIGH vs HP, hanya 1 amber tungku, dan <= 12000 segitiga", () => {
    const scene = new THREE.Scene();
    const line = new ProcessLine(scene, false);

    expect(PROCESS_STATIONS.map((s) => s.x)).toEqual([0, 6, 12, 18]);
    expect(line.getFlakeCount()).toBe(400);
    expect(line.getBubbleCount()).toBe(80);
    expect(line.getFilamentCount()).toBe(60);
    expect(line.furnaceLight.color.getHexString().toUpperCase()).toBe("F6B35A");
    expect(triangleCount(line.group)).toBeLessThanOrEqual(12000);

    line.setCompactMode(true);
    expect(line.getFlakeCount()).toBe(150);
    expect(line.getBubbleCount()).toBe(30);
    expect(line.getFilamentCount()).toBe(24);

    line.dispose();
  });
});
