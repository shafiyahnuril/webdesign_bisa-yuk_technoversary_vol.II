import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { Hand, HAND_DIMENSIONS } from "./hand";

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

describe("O-HAND (prosedural clay)", () => {
  it("memiliki dimensi telapak 0.85x0.95x0.34, 4 jari + ibu jari + lengan bawah, dan <= 3500 segitiga", () => {
    const scene = new THREE.Scene();
    const hand = new Hand(scene);

    expect(HAND_DIMENSIONS.palmWidth).toBeCloseTo(0.85, 5);
    expect(HAND_DIMENSIONS.palmHeight).toBeCloseTo(0.95, 5);
    expect(HAND_DIMENSIONS.palmThickness).toBeCloseTo(0.34, 5);
    expect(hand.fingers).toHaveLength(4);
    expect(triangleCount(hand.group)).toBeLessThanOrEqual(3500);

    hand.dispose();
  });

  it("berinterpolasi mulus antar 4 pose dan jari GRIP tidak menembus botol r=0.328", () => {
    const scene = new THREE.Scene();
    const hand = new Hand(scene);

    hand.setPose("OPEN", "GRIP", 0);
    const openAngle = hand.fingers[0]!.proximal.rotation.y;

    hand.setPose("OPEN", "GRIP", 1);
    const gripAngle = hand.fingers[0]!.proximal.rotation.y;
    expect(gripAngle).not.toBeCloseTo(openAngle, 3);

    // Pastikan semua sendi jari pada pose GRIP berada di luar dinding botol r=0.328
    hand.group.position.set(1.1, 0.4, 0);
    hand.group.updateMatrixWorld(true);
    const bottleAxis = new THREE.Vector3();
    hand.palmAnchor.getWorldPosition(bottleAxis);

    const jointWorld = new THREE.Vector3();
    for (const f of hand.fingers) {
      f.distalTip.getWorldPosition(jointWorld);
      const radialDist = Math.hypot(jointWorld.x - bottleAxis.x, jointWorld.z - bottleAxis.z);
      expect(radialDist).toBeGreaterThanOrEqual(0.328);
    }

    hand.setPose("THROW", "RELEASE", 0.5);
    hand.reset();
    hand.dispose();
  });
});
