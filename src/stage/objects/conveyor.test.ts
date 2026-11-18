import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Conveyor, CONVEYOR_SPECS } from "./conveyor";

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
    lineWidth: 1,
    strokeStyle: "",
    fillStyle: "",
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    fillRect: noop,
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((id: string) =>
    id === "2d" ? fakeCtx : null) as HTMLCanvasElement["getContext"]);
}

describe("O-CONVEYOR (fasilitas pemilahan)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("membangun sabuk 18x0.4x2.4, 14 rol, 40 item instanced, 3 pemilah, 160 semprot, dan <= 9000 segitiga", () => {
    const scene = new THREE.Scene();
    const conveyor = new Conveyor(scene, false);

    expect(CONVEYOR_SPECS.beltLength).toBeCloseTo(18, 5);
    expect(CONVEYOR_SPECS.beltThickness).toBeCloseTo(0.4, 5);
    expect(CONVEYOR_SPECS.beltDepth).toBeCloseTo(2.4, 5);
    expect(conveyor.rollers).toHaveLength(14);
    expect(conveyor.pushers).toHaveLength(3);
    expect(conveyor.ghostBottles).toHaveLength(5);
    expect(conveyor.getActiveItemCount()).toBe(40);
    expect(conveyor.getActiveSprayCount()).toBe(160);
    expect(triangleCount(conveyor.group)).toBeLessThanOrEqual(9000);

    conveyor.setCompactMode(true);
    expect(conveyor.getActiveItemCount()).toBe(20);
    expect(conveyor.getActiveSprayCount()).toBe(80);
    expect(conveyor.getActiveGhostCount()).toBe(3);

    conveyor.dispose();
  });
});
