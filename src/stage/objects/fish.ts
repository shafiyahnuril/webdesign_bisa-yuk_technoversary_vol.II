import * as THREE from "three";
import { createClayMaterial } from "../materials/clay";
import { disposeObject } from "../util/dispose";
import { clamp01, degToRad, lerp } from "../util/math";

const MAX_TAIL_RAD = degToRad(25);

interface FishSlot {
  readonly basePos: THREE.Vector3;
  readonly freqX: number;
  readonly freqY: number;
  readonly ampX: number;
  readonly ampY: number;
  readonly phase: number;
  readonly facingDir: number;
}

const DEFAULT_FISH_SLOTS: readonly FishSlot[] = [
  {
    basePos: new THREE.Vector3(-0.35, 0.25, 0.25),
    freqX: 1.4,
    freqY: 2.1,
    ampX: 0.35,
    ampY: 0.18,
    phase: 0.0,
    facingDir: 1,
  },
  {
    basePos: new THREE.Vector3(-1.7, 0.55, -0.55),
    freqX: 1.2,
    freqY: 1.8,
    ampX: 0.28,
    ampY: 0.16,
    phase: 2.1,
    facingDir: 1,
  },
  {
    basePos: new THREE.Vector3(1.65, -0.05, -0.25),
    freqX: 1.5,
    freqY: 1.9,
    ampX: 0.3,
    ampY: 0.15,
    phase: 4.2,
    facingDir: -1,
  },
];

function createTailPrismGeometry(): THREE.BufferGeometry {
  // Prisma segitiga panjang 0.6 dengan pangkal di x = 0 agar ayunan ekor berpusat di pangkal
  const positions = new Float32Array([
    0.0, 0.06, 0.025, -0.6, 0.34, 0.0, -0.6, -0.34, 0.0, 0.0, -0.06, 0.025, 0.0, 0.06, -0.025, 0.0,
    -0.06, -0.025,
  ]);
  const indices = [0, 1, 2, 0, 2, 3, 4, 2, 1, 4, 5, 2, 0, 4, 1, 3, 2, 5, 0, 3, 5, 0, 5, 4];
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function createFinTriangleGeometry(length: number, height: number): THREE.BufferGeometry {
  const positions = new Float32Array([
    length * 0.4,
    0,
    0.015,
    -length * 0.4,
    0,
    0.015,
    -length * 0.25,
    height,
    0,
    length * 0.4,
    0,
    -0.015,
    -length * 0.4,
    0,
    -0.015,
  ]);
  const indices = [0, 1, 2, 3, 2, 4, 0, 2, 3, 1, 4, 2];
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export interface FishInstance {
  readonly root: THREE.Group;
  readonly tailPivot: THREE.Group;
  readonly slotIndex: number;
  getMouthWorldPosition(out?: THREE.Vector3): THREE.Vector3;
}

/**
 * Sekawanan ikan prosedural bergaya clay (O-FISH): 3 ekor desktop / 2 portrait,
 * elipsoid pipih (1.0, 0.45, 0.22), ekor prisma mengayun +-25 deg, sirip punggung & dada,
 * berenang sepanjang kurva Lissajous kecil.
 */
export class FishSchool {
  readonly group = new THREE.Group();
  readonly fishes: FishInstance[] = [];

  private readonly bodyMat: THREE.MeshStandardMaterial;
  private readonly finMat: THREE.MeshStandardMaterial;
  private readonly eyeMat: THREE.MeshStandardMaterial;
  private readonly bodyGeom: THREE.BufferGeometry;
  private readonly tailGeom: THREE.BufferGeometry;
  private readonly dorsalGeom: THREE.BufferGeometry;
  private readonly pectoralGeom: THREE.BufferGeometry;
  private readonly eyeGeom: THREE.BufferGeometry;
  private readonly localMouth = new THREE.Vector3(0.88, 0, 0);

  constructor(parent: THREE.Object3D, isPortrait = false) {
    this.group.name = "O-FISH-SCHOOL";
    parent.add(this.group);

    this.bodyMat = createClayMaterial({
      color: "#8A96C8",
      roughness: 0.7,
      transparent: true,
      opacity: 1,
    });
    this.finMat = createClayMaterial({
      color: "#6F7BB0",
      roughness: 0.74,
      transparent: true,
      opacity: 1,
    });
    this.eyeMat = createClayMaterial({
      color: "#05080F",
      roughness: 0.55,
      transparent: true,
      opacity: 1,
    });

    // ~280 + 8 + 4 + 8 + 32 = ~332 tris per ikan (3 ikan <= 1000 tris)
    this.bodyGeom = new THREE.SphereGeometry(1, 14, 10);
    this.bodyGeom.scale(1.0, 0.45, 0.22);
    this.tailGeom = createTailPrismGeometry();
    this.dorsalGeom = createFinTriangleGeometry(0.45, 0.35);
    this.pectoralGeom = createFinTriangleGeometry(0.28, 0.22);
    this.eyeGeom = new THREE.SphereGeometry(0.05, 6, 4);

    const count = isPortrait ? 2 : 3;
    for (let i = 0; i < count; i++) {
      const root = new THREE.Group();
      root.name = `O-FISH-${i}`;

      const body = new THREE.Mesh(this.bodyGeom, this.bodyMat);
      const tailPivot = new THREE.Group();
      tailPivot.position.set(-0.92, 0, 0);
      const tailMesh = new THREE.Mesh(this.tailGeom, this.finMat);
      tailPivot.add(tailMesh);

      const dorsal = new THREE.Mesh(this.dorsalGeom, this.finMat);
      dorsal.position.set(-0.08, 0.4, 0);

      const pecL = new THREE.Mesh(this.pectoralGeom, this.finMat);
      pecL.position.set(0.18, -0.1, 0.2);
      pecL.rotation.set(0.55, 0, -0.25);

      const pecR = new THREE.Mesh(this.pectoralGeom, this.finMat);
      pecR.position.set(0.18, -0.1, -0.2);
      pecR.rotation.set(-0.55, 0, -0.25);

      const eyeL = new THREE.Mesh(this.eyeGeom, this.eyeMat);
      eyeL.position.set(0.68, 0.1, 0.14);
      const eyeR = new THREE.Mesh(this.eyeGeom, this.eyeMat);
      eyeR.position.set(0.68, 0.1, -0.14);

      root.add(body, tailPivot, dorsal, pecL, pecR, eyeL, eyeR);
      const slot = DEFAULT_FISH_SLOTS[i]!;
      root.position.copy(slot.basePos);
      if (slot.facingDir < 0) root.rotation.y = Math.PI;
      this.group.add(root);

      this.fishes.push({
        root,
        tailPivot,
        slotIndex: i,
        getMouthWorldPosition: (out = new THREE.Vector3()) => {
          root.updateWorldMatrix(true, false);
          return out.copy(this.localMouth).applyMatrix4(root.matrixWorld);
        },
      });
    }
  }

  setOpacity(opacity: number): void {
    const a = clamp01(opacity);
    this.bodyMat.opacity = a;
    this.finMat.opacity = a;
    this.eyeMat.opacity = a;
    this.group.visible = a > 0.002;
  }

  /**
   * Memperbarui renang Lissajous dan transisi match-cut ikan utama ke posisi tengah filet.
   */
  update(swimTime: number, matchCutMix = 0): void {
    const mc = clamp01(matchCutMix);
    for (let i = 0; i < this.fishes.length; i++) {
      const fish = this.fishes[i]!;
      const slot = DEFAULT_FISH_SLOTS[fish.slotIndex]!;
      const lx = slot.basePos.x + Math.sin(swimTime * slot.freqX + slot.phase) * slot.ampX;
      const ly = slot.basePos.y + Math.sin(swimTime * slot.freqY + slot.phase * 1.3) * slot.ampY;
      const lz = slot.basePos.z + Math.cos(swimTime * 0.9 + slot.phase) * 0.18;

      if (i === 0 && mc > 0) {
        // Match cut: ikan utama mendekat ke tengah dan merata sejajar orientasi filet
        fish.root.position.set(lerp(lx, 0, mc), lerp(ly, 0.2, mc), lerp(lz, 0, mc));
        fish.root.rotation.set(
          lerp(0, -Math.PI * 0.45, mc),
          lerp(slot.facingDir < 0 ? Math.PI : 0, 0, mc),
          lerp(0.05 * Math.cos(swimTime + slot.phase), 0, mc),
        );
        const s = lerp(1.0, 1.32, mc);
        fish.root.scale.set(s, s, s);
      } else {
        fish.root.position.set(lx, ly, lz);
        const yawBase = slot.facingDir < 0 ? Math.PI : 0;
        fish.root.rotation.set(0, yawBase + Math.sin(swimTime * 0.8 + slot.phase) * 0.12, 0);
        const sideScale = 1 - mc * 0.25;
        fish.root.scale.set(sideScale, sideScale, sideScale);
      }

      fish.tailPivot.rotation.y =
        Math.sin(swimTime * 5.2 + slot.phase) * MAX_TAIL_RAD * (1 - mc * 0.7);
    }
  }

  getAttractTargets(targets: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3]): void {
    for (let i = 0; i < 3; i++) {
      const fish = this.fishes[i] ?? this.fishes[0];
      if (fish) {
        fish.getMouthWorldPosition(targets[i]!);
      }
    }
  }

  dispose(): void {
    this.group.removeFromParent();
    disposeObject(this.group);
  }
}
