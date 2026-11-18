import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { makeSkinSurfaceSet, type PbrTextureSet } from "../textures/pbr-maps";
import type { SharedObjectHandle } from "../stage";
import { clamp01, degToRad, lerp } from "../util/math";

export type HandPoseName = "OPEN" | "GRIP" | "RELEASE" | "THROW";

export const HAND_COLOR = "#D1AA94";

export const HAND_DIMENSIONS = {
  palmWidth: 0.85,
  palmHeight: 0.95,
  palmThickness: 0.34,
  palmRadius: 0.12,
  fingerProxLength: 0.36,
  fingerProxRadius: 0.085,
  fingerDistLength: 0.29,
  fingerDistRadius: 0.075,
  thumbProxLength: 0.32,
  thumbDistLength: 0.27,
  thumbAngleDeg: 40,
  forearmRadius: 0.2,
  forearmLength: 3.8,
} as const;

export interface FingerRig {
  readonly proximal: THREE.Group;
  readonly distal: THREE.Group;
  readonly distalTip: THREE.Object3D;
}

interface PoseSpec {
  readonly proximalY: readonly [number, number, number, number];
  readonly distalY: readonly [number, number, number, number];
  readonly thumbProxY: number;
  readonly thumbDistY: number;
  readonly wristZ: number;
}

const POSE_TABLE: Record<HandPoseName, PoseSpec> = {
  OPEN: {
    proximalY: [-0.62, -0.65, -0.65, -0.6],
    distalY: [0.14, 0.12, 0.12, 0.14],
    thumbProxY: 0.55,
    thumbDistY: -0.15,
    wristZ: 0,
  },
  GRIP: {
    proximalY: [-0.18, -0.18, -0.18, -0.18],
    distalY: [0.55, 0.55, 0.55, 0.55],
    thumbProxY: 0.18,
    thumbDistY: -0.55,
    wristZ: 0,
  },
  RELEASE: {
    proximalY: [-0.85, -0.88, -0.88, -0.82],
    distalY: [0.05, 0.05, 0.05, 0.05],
    thumbProxY: 0.72,
    thumbDistY: -0.05,
    wristZ: degToRad(10),
  },
  THROW: {
    proximalY: [-0.45, -0.45, -0.45, -0.42],
    distalY: [0.35, 0.35, 0.35, 0.35],
    thumbProxY: 0.38,
    thumbDistY: -0.25,
    wristZ: -degToRad(25),
  },
};

function makeCapsuleAlongNegX(
  radius: number,
  length: number,
  material: THREE.Material,
): THREE.Mesh {
  const straightLen = Math.max(0.02, length - radius * 2);
  const geom = new THREE.CapsuleGeometry(radius, straightLen, 4, 10);
  geom.rotateZ(Math.PI * 0.5);
  geom.translate(-length * 0.5, 0, 0);
  const mesh = new THREE.Mesh(geom, material);
  return mesh;
}

export class Hand implements SharedObjectHandle {
  readonly group = new THREE.Group();
  readonly wristPivot = new THREE.Group();
  readonly palmMesh: THREE.Mesh;
  readonly forearmMesh: THREE.Mesh;
  readonly palmAnchor = new THREE.Group();
  readonly fingers: readonly FingerRig[];
  readonly thumb: FingerRig;

  private readonly material: THREE.MeshStandardMaterial;
  private readonly skinSet: PbrTextureSet;
  private readonly geometries: THREE.BufferGeometry[] = [];

  constructor(parent: THREE.Object3D) {
    this.group.name = "O-HAND";
    this.wristPivot.name = "O-HAND-WRIST";
    this.palmAnchor.name = "O-HAND-PALM-ANCHOR";

    this.skinSet = makeSkinSurfaceSet(256);
    this.material = new THREE.MeshStandardMaterial({
      color: HAND_COLOR,
      map: this.skinSet.map ?? null,
      normalMap: this.skinSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughnessMap: this.skinSet.roughnessMap ?? null,
      roughness: 0.62,
      metalness: 0.02,
      envMapIntensity: 0.65,
    });

    // Telapak: RoundedBox(0.85 x 0.95 x 0.34, r 0.12), orientasi tebal di X agar sisi telapak menghadap botol (-X)
    const palmGeom = new RoundedBoxGeometry(
      HAND_DIMENSIONS.palmThickness,
      HAND_DIMENSIONS.palmHeight,
      HAND_DIMENSIONS.palmWidth,
      2,
      HAND_DIMENSIONS.palmRadius,
    );
    this.geometries.push(palmGeom);
    this.palmMesh = new THREE.Mesh(palmGeom, this.material);
    this.palmMesh.name = "palm";
    this.palmMesh.position.set(0, 0.45, 0);

    // Lengan bawah: kapsul r 0.20, panjang 3.8 memanjang ke +X / -Y keluar bingkai
    const forearmStraight = HAND_DIMENSIONS.forearmLength - HAND_DIMENSIONS.forearmRadius * 2;
    const forearmGeom = new THREE.CapsuleGeometry(
      HAND_DIMENSIONS.forearmRadius,
      forearmStraight,
      4,
      12,
    );
    forearmGeom.rotateZ(-Math.PI * 0.5);
    forearmGeom.translate(HAND_DIMENSIONS.forearmLength * 0.5, 0, 0);
    this.geometries.push(forearmGeom);
    this.forearmMesh = new THREE.Mesh(forearmGeom, this.material);
    this.forearmMesh.name = "forearm";
    this.forearmMesh.position.set(0.06, 0.12, 0);
    this.forearmMesh.rotation.z = -degToRad(26);

    // Jangkar botol sejajar sumbu botol di (-0.5, 0, 0) relatif grup tangan
    this.palmAnchor.position.set(-0.5, -0.4, 0);

    this.wristPivot.add(this.palmMesh, this.palmAnchor);
    this.group.add(this.forearmMesh, this.wristPivot);

    // 4 jari di sisi depan-kiri telapak (-Z), tersusun sepanjang Y
    const fingerOffsetsY = [0.76, 0.56, 0.36, 0.16] as const;
    const builtFingers: FingerRig[] = [];

    for (let i = 0; i < 4; i++) {
      const proximal = new THREE.Group();
      proximal.name = `f${i + 1}a_pivot`;
      proximal.position.set(-0.12, fingerOffsetsY[i]!, -0.38);

      const proxMesh = makeCapsuleAlongNegX(
        HAND_DIMENSIONS.fingerProxRadius,
        HAND_DIMENSIONS.fingerProxLength,
        this.material,
      );
      proxMesh.name = `f${i + 1}a`;
      this.geometries.push(proxMesh.geometry);

      const distal = new THREE.Group();
      distal.name = `f${i + 1}b_pivot`;
      distal.position.set(-HAND_DIMENSIONS.fingerProxLength, 0, 0);

      const distMesh = makeCapsuleAlongNegX(
        HAND_DIMENSIONS.fingerDistRadius,
        HAND_DIMENSIONS.fingerDistLength,
        this.material,
      );
      distMesh.name = `f${i + 1}b`;
      this.geometries.push(distMesh.geometry);

      const distalTip = new THREE.Object3D();
      distalTip.name = `f${i + 1}_tip`;
      distalTip.position.set(-HAND_DIMENSIONS.fingerDistLength, 0, 0);

      distal.add(distMesh, distalTip);
      proximal.add(proxMesh, distal);
      this.wristPivot.add(proximal);
      builtFingers.push({ proximal, distal, distalTip });
    }
    this.fingers = builtFingers;

    // Ibu jari di sisi +Z telapak dengan kemiringan 40 derajat
    const thumbProx = new THREE.Group();
    thumbProx.name = "thumb_a_pivot";
    thumbProx.position.set(-0.1, 0.62, 0.38);
    thumbProx.rotation.z = degToRad(HAND_DIMENSIONS.thumbAngleDeg);

    const thumbProxMesh = makeCapsuleAlongNegX(
      0.09,
      HAND_DIMENSIONS.thumbProxLength,
      this.material,
    );
    thumbProxMesh.name = "thumb_a";
    this.geometries.push(thumbProxMesh.geometry);

    const thumbDist = new THREE.Group();
    thumbDist.name = "thumb_b_pivot";
    thumbDist.position.set(-HAND_DIMENSIONS.thumbProxLength, 0, 0);

    const thumbDistMesh = makeCapsuleAlongNegX(
      0.08,
      HAND_DIMENSIONS.thumbDistLength,
      this.material,
    );
    thumbDistMesh.name = "thumb_b";
    this.geometries.push(thumbDistMesh.geometry);

    const thumbTip = new THREE.Object3D();
    thumbTip.name = "thumb_tip";
    thumbTip.position.set(-HAND_DIMENSIONS.thumbDistLength, 0, 0);

    thumbDist.add(thumbDistMesh, thumbTip);
    thumbProx.add(thumbProxMesh, thumbDist);
    this.wristPivot.add(thumbProx);
    this.thumb = { proximal: thumbProx, distal: thumbDist, distalTip: thumbTip };

    parent.add(this.group);
    this.reset();
    this.group.visible = false;
  }

  setPose(from: HandPoseName, to: HandPoseName, progress01: number): void {
    const k = clamp01(progress01);
    const a = POSE_TABLE[from];
    const b = POSE_TABLE[to];

    for (let i = 0; i < this.fingers.length; i++) {
      const f = this.fingers[i]!;
      f.proximal.rotation.y = lerp(a.proximalY[i]!, b.proximalY[i]!, k);
      f.distal.rotation.y = lerp(a.distalY[i]!, b.distalY[i]!, k);
    }
    this.thumb.proximal.rotation.y = lerp(a.thumbProxY, b.thumbProxY, k);
    this.thumb.distal.rotation.y = lerp(a.thumbDistY, b.thumbDistY, k);
    this.wristPivot.rotation.z = lerp(a.wristZ, b.wristZ, k);
  }

  setScaleFactor(scale: number): void {
    this.group.scale.setScalar(scale);
  }

  reset(): void {
    this.group.visible = true;
    this.group.position.set(4.0, -2.2, 0);
    this.group.rotation.set(0, 0, 0);
    this.group.scale.setScalar(1);
    this.wristPivot.position.set(0, 0, 0);
    this.wristPivot.rotation.set(0, 0, 0);
    this.setPose("OPEN", "OPEN", 0);
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const g of this.geometries) {
      g.dispose();
    }
    this.material.dispose();
    this.skinSet.dispose();
  }
}
