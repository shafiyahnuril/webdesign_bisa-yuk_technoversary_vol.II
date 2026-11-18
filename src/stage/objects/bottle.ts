import * as THREE from "three";
import {
  createBottleMaterials,
  DEFAULT_BOTTLE_PARAMS,
  disposeBottleMaterials,
  swapBottleMaterialQuality,
  updateBottleMaterials,
  type BottleMaterialSet,
  type BottleParams,
} from "../materials/bottle-material";
import { clamp01, lerp } from "../util/math";
import { createRng } from "../util/rng";

export const BOTTLE_HEIGHT = 2.1;
export const BOTTLE_MAX_RADIUS = 0.328;

/** Profil lathe 22 titik (r, y) sesuai docs/03 bagian 3.1. */
export const BOTTLE_PROFILE: readonly (readonly [number, number])[] = [
  [0.0, 0.0],
  [0.19, 0.0],
  [0.255, 0.018],
  [0.3, 0.06],
  [0.322, 0.14],
  [0.328, 0.24],
  [0.318, 0.3],
  [0.328, 0.36],
  [0.328, 0.52],
  [0.32, 0.58],
  [0.328, 0.64],
  [0.328, 1.15],
  [0.322, 1.25],
  [0.3, 1.38],
  [0.24, 1.54],
  [0.17, 1.66],
  [0.132, 1.74],
  [0.13, 1.79],
  [0.16, 1.8],
  [0.16, 1.83],
  [0.13, 1.84],
  [0.126, 1.9],
];

const LIQUID_MIN_LOCAL_Y = 0.04;
const LIQUID_MAX_LOCAL_Y = 1.7;
const LIQUID_RADIUS = 0.306;
const LABEL_RADIUS = 0.332;
const LABEL_MIN_Y = 0.55;
const LABEL_MAX_Y = 1.05;

export interface BottleQualitySpec {
  bottleSegments: number;
  bottleShards: { radial: number; bands: number };
  crackSize: 512 | 1024;
  transmission: boolean;
}

export const DEFAULT_BOTTLE_QUALITY: BottleQualitySpec = {
  bottleSegments: 48,
  bottleShards: { radial: 12, bands: 4 },
  crackSize: 1024,
  transmission: true,
};

function computeProfileNormals(profile: readonly (readonly [number, number])[]): [number, number][] {
  const n = profile.length;
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const [r] = profile[i]!;
    if (i === 0 && r === 0) {
      out.push([0, -1]);
      continue;
    }
    const prev = profile[Math.max(0, i - 1)]!;
    const next = profile[Math.min(n - 1, i + 1)]!;
    const dr = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dr, dy) || 1;
    out.push([dy / len, -dr / len]);
  }
  return out;
}

/**
 * Membangun badan botol sebagai satu BufferGeometry terpecah menjadi serpihan
 * (48 pada HIGH/MEDIUM, 24 pada LOW) dengan normal analitik mulus tanpa jahitan saat uBreak=0.
 */
function buildBottleBodyGeometry(
  radialSegments: number,
  shardCols: number,
  shardBands: number,
): THREE.BufferGeometry {
  const profile = BOTTLE_PROFILE;
  const normals2d = computeProfileNormals(profile);
  const shardCount = shardCols * shardBands;
  const rows = profile.length - 1;

  interface Quad {
    col: number;
    row: number;
  }
  const buckets: Quad[][] = Array.from({ length: shardCount }, () => []);

  for (let row = 0; row < rows; row++) {
    const yMid = 0.5 * (profile[row]![1] + profile[row + 1]![1]);
    const band = Math.min(shardBands - 1, Math.max(0, Math.floor((yMid / 1.9) * shardBands)));
    for (let col = 0; col < radialSegments; col++) {
      const uShard = Math.min(shardCols - 1, Math.floor((col * shardCols) / radialSegments));
      const shardId = band * shardCols + uShard;
      buckets[shardId]!.push({ col, row });
    }
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const aShard: number[] = [];
  const aCenter: number[] = [];
  const aRand: number[] = [];
  const indices: number[] = [];

  for (let shardId = 0; shardId < shardCount; shardId++) {
    const quads = buckets[shardId]!;
    if (quads.length === 0) continue;

    const startVertex = positions.length / 3;
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let count = 0;

    const rng = createRng(1337 + shardId * 97);
    const rx = rng() * 2 - 1;
    const ry = rng() * 2 - 1;
    const rz = rng() * 2 - 1;
    const rw = 0.35 + rng() * 0.65;

    for (const { col, row } of quads) {
      const c0 = col;
      const c1 = col + 1;
      const t0 = (c0 / radialSegments) * Math.PI * 2;
      const t1 = (c1 / radialSegments) * Math.PI * 2;

      const [r0, y0] = profile[row]!;
      const [r1, y1] = profile[row + 1]!;
      const [nr0, ny0] = normals2d[row]!;
      const [nr1, ny1] = normals2d[row + 1]!;

      const corners: [number, number, number, number, number, number, number, number][] = [
        [r0 * Math.sin(t0), y0, r0 * Math.cos(t0), nr0 * Math.sin(t0), ny0, nr0 * Math.cos(t0), c0 / radialSegments, y0 / 1.9],
        [r0 * Math.sin(t1), y0, r0 * Math.cos(t1), nr0 * Math.sin(t1), ny0, nr0 * Math.cos(t1), c1 / radialSegments, y0 / 1.9],
        [r1 * Math.sin(t0), y1, r1 * Math.cos(t0), nr1 * Math.sin(t0), ny1, nr1 * Math.cos(t0), c0 / radialSegments, y1 / 1.9],
        [r1 * Math.sin(t1), y1, r1 * Math.cos(t1), nr1 * Math.sin(t1), ny1, nr1 * Math.cos(t1), c1 / radialSegments, y1 / 1.9],
      ];

      const vBase = positions.length / 3;
      for (const [px, py, pz, nx, ny, nz, u, v] of corners) {
        positions.push(px, py, pz);
        normals.push(nx, ny, nz);
        uvs.push(u, v);
        aShard.push(shardId);
        aRand.push(rx, ry, rz, rw);
        sumX += px;
        sumY += py;
        sumZ += pz;
        count++;
      }

      if (r0 > 0) {
        indices.push(vBase, vBase + 1, vBase + 3);
        indices.push(vBase, vBase + 3, vBase + 2);
      } else {
        indices.push(vBase, vBase + 3, vBase + 2);
      }
    }

    const cx = sumX / count;
    const cy = sumY / count;
    const cz = sumZ / count;
    for (let i = startVertex; i < positions.length / 3; i++) {
      aCenter.push(cx, cy, cz);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geom.setAttribute("aShard", new THREE.Float32BufferAttribute(aShard, 1));
  geom.setAttribute("aCenter", new THREE.Float32BufferAttribute(aCenter, 3));
  geom.setAttribute("aRand", new THREE.Float32BufferAttribute(aRand, 4));
  geom.setIndex(indices);
  geom.computeBoundingBox();
  geom.computeBoundingSphere();
  return geom;
}

/**
 * Tutup botol beralur 40 alur vertikal (r = 0.148 + 0.004 * sin(40θ), y 1.90 -> 2.10).
 */
function buildBottleCapGeometry(radialSegments: number): THREE.BufferGeometry {
  const capRings: readonly (readonly [number, number, boolean])[] = [
    [0.0, 1.9, false],
    [0.14, 1.9, false],
    [0.148, 1.912, true],
    [0.148, 2.082, true],
    [0.139, 2.1, false],
    [0.0, 2.1, false],
  ];

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const stride = radialSegments + 1;

  for (let rIdx = 0; rIdx < capRings.length; rIdx++) {
    const [baseR, y, ribbed] = capRings[rIdx]!;
    for (let col = 0; col <= radialSegments; col++) {
      const u = col / radialSegments;
      const theta = u * Math.PI * 2;
      const radius = baseR === 0 ? 0 : ribbed ? baseR + 0.004 * Math.sin(40 * theta) : baseR;
      positions.push(radius * Math.sin(theta), y, radius * Math.cos(theta));
      uvs.push(u, (y - 1.9) / 0.2);
    }
  }

  for (let row = 0; row < capRings.length - 1; row++) {
    for (let col = 0; col < radialSegments; col++) {
      const i00 = row * stride + col;
      const i10 = i00 + 1;
      const i01 = i00 + stride;
      const i11 = i01 + 1;
      indices.push(i00, i10, i11);
      indices.push(i00, i11, i01);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  geom.computeBoundingBox();
  geom.computeBoundingSphere();
  return geom;
}

function buildLiquidGeometry(radialSegments: number): THREE.BufferGeometry {
  const innerPoints: THREE.Vector2[] = [new THREE.Vector2(0, LIQUID_MIN_LOCAL_Y)];
  for (const [r, y] of BOTTLE_PROFILE) {
    if (y >= 0.04 && y <= 1.66) {
      innerPoints.push(new THREE.Vector2(Math.max(0.02, r - 0.022), y));
    }
  }
  innerPoints.push(new THREE.Vector2(0.11, LIQUID_MAX_LOCAL_Y));
  innerPoints.push(new THREE.Vector2(0, LIQUID_MAX_LOCAL_Y));
  const geom = new THREE.LatheGeometry(innerPoints, Math.max(16, Math.round(radialSegments * 0.75)));
  geom.computeBoundingBox();
  return geom;
}

function buildLabelGeometry(radialSegments: number): THREE.BufferGeometry {
  const height = LABEL_MAX_Y - LABEL_MIN_Y;
  const geom = new THREE.CylinderGeometry(
    LABEL_RADIUS,
    LABEL_RADIUS,
    height,
    radialSegments,
    1,
    true,
    Math.PI,
  );
  geom.translate(0, LABEL_MIN_Y + height * 0.5, 0);
  return geom;
}

export class Bottle {
  readonly group = new THREE.Group();
  readonly visualGroup = new THREE.Group();
  readonly bodyMesh: THREE.Mesh;
  readonly capMesh: THREE.Mesh;
  readonly liquidMesh: THREE.Mesh;
  readonly labelMesh: THREE.Mesh;

  private readonly homeParent: THREE.Object3D;
  private readonly clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.45);
  private readonly materials: BottleMaterialSet;
  private readonly params: BottleParams = { ...DEFAULT_BOTTLE_PARAMS };
  private qualitySpec: BottleQualitySpec;
  private _shardCount: number;

  // Vektor bantu pakai-ulang (nol alokasi per frame)
  private readonly _corners: readonly THREE.Vector3[] = Array.from(
    { length: 8 },
    () => new THREE.Vector3(),
  );

  constructor(parent: THREE.Object3D, quality: BottleQualitySpec = DEFAULT_BOTTLE_QUALITY) {
    this.homeParent = parent;
    this.qualitySpec = { ...quality, bottleShards: { ...quality.bottleShards } };
    this._shardCount = quality.bottleShards.radial * quality.bottleShards.bands;

    this.group.name = "O-BOTTLE";
    this.visualGroup.name = "O-BOTTLE-VISUAL";
    this.group.add(this.visualGroup);
    parent.add(this.group);

    this.materials = createBottleMaterials({
      transmission: quality.transmission,
      crackSize: quality.crackSize,
      clipPlane: this.clipPlane,
    });

    const bodyGeom = buildBottleBodyGeometry(
      quality.bottleSegments,
      quality.bottleShards.radial,
      quality.bottleShards.bands,
    );
    const capGeom = buildBottleCapGeometry(Math.max(80, quality.bottleSegments * 3));
    const liquidGeom = buildLiquidGeometry(quality.bottleSegments);
    const labelGeom = buildLabelGeometry(quality.bottleSegments);

    this.liquidMesh = new THREE.Mesh(liquidGeom, this.materials.liquid);
    this.liquidMesh.name = "BottleLiquid";
    this.liquidMesh.renderOrder = 1;

    this.bodyMesh = new THREE.Mesh(bodyGeom, this.materials.body);
    this.bodyMesh.name = "BottleBody";
    this.bodyMesh.renderOrder = 2;

    this.capMesh = new THREE.Mesh(capGeom, this.materials.cap);
    this.capMesh.name = "BottleCap";
    this.capMesh.renderOrder = 2;

    this.labelMesh = new THREE.Mesh(labelGeom, this.materials.label);
    this.labelMesh.name = "BottleLabel";
    this.labelMesh.renderOrder = 2;

    this.visualGroup.add(this.liquidMesh, this.bodyMesh, this.capMesh, this.labelMesh);
    this.reset();
  }

  get shardCount(): number {
    return this._shardCount;
  }

  getParams(): Readonly<BottleParams> {
    return this.params;
  }

  setParams(patch: Partial<BottleParams>): void {
    if (patch.turbid !== undefined) this.params.turbid = clamp01(patch.turbid);
    if (patch.crack !== undefined) this.params.crack = clamp01(patch.crack);
    if (patch.breakAmt !== undefined) this.params.breakAmt = clamp01(patch.breakAmt);
    if (patch.level !== undefined) this.params.level = clamp01(patch.level);
    if (patch.dirt !== undefined) this.params.dirt = clamp01(patch.dirt);
    if (patch.opacity !== undefined) this.params.opacity = clamp01(patch.opacity);

    updateBottleMaterials(this.materials, this.params);
    this.liquidMesh.visible = this.params.level > 0.002 && this.params.breakAmt < 0.2;
    this.capMesh.visible = this.params.breakAmt < 0.45 && this.params.opacity > 0.002;
    this.labelMesh.visible = this.params.breakAmt < 0.45 && this.params.opacity > 0.002;
    this.syncLiquidClip();
  }

  /** Mengatur fraksi isi cairan 0..1 dan menyinkronkan bidang potong horizontal dunia. */
  setLevel(level01: number): void {
    this.params.level = clamp01(level01);
    this.liquidMesh.visible = this.params.level > 0.002 && this.params.breakAmt < 0.2;
    this.syncLiquidClip();
  }

  /** Mengatur konstanta bidang potong Y dunia secara eksplisit. */
  setClipWorldY(worldY: number): void {
    this.clipPlane.normal.set(0, -1, 0);
    this.clipPlane.constant = worldY;
  }

  /**
   * Menghitung ulang bidang potong horizontal dunia agar permukaan air selalu datar
   * mengikuti gravitasi meskipun botol dimiringkan atau dipegang tangan.
   */
  syncLiquidClip(): void {
    this.group.updateWorldMatrix(true, true);
    const m = this.liquidMesh.matrixWorld;
    const r = LIQUID_RADIUS;
    const minY = LIQUID_MIN_LOCAL_Y;
    const maxY = LIQUID_MAX_LOCAL_Y;

    let worldMinY = Infinity;
    let worldMaxY = -Infinity;
    let idx = 0;

    for (const sx of [-r, r]) {
      for (const sy of [minY, maxY]) {
        for (const sz of [-r, r]) {
          const corner = this._corners[idx++]!;
          corner.set(sx, sy, sz).applyMatrix4(m);
          if (corner.y < worldMinY) worldMinY = corner.y;
          if (corner.y > worldMaxY) worldMaxY = corner.y;
        }
      }
    }

    const surfaceY = lerp(worldMinY, worldMaxY, this.params.level);
    this.clipPlane.normal.set(0, -1, 0);
    this.clipPlane.constant = surfaceY;
  }

  /** Gerak idle deterministik (bobbing 0.03 periode 4 dtk + putaran pelan 0.15 rad/s). */
  setIdle(timeSeconds: number, enabled: boolean, spinScale = 1): void {
    if (!enabled) {
      this.visualGroup.position.set(0, 0, 0);
      this.visualGroup.rotation.set(0, 0, 0);
      return;
    }
    this.visualGroup.position.y = Math.sin((timeSeconds * Math.PI * 2) / 4) * 0.03;
    this.visualGroup.rotation.y = timeSeconds * 0.15 * spinScale;
  }

  attachToHand(anchor: THREE.Object3D, preserveWorld = true): void {
    if (preserveWorld) {
      anchor.updateWorldMatrix(true, false);
      this.group.updateWorldMatrix(true, false);
      anchor.attach(this.group);
    } else {
      anchor.add(this.group);
    }
    this.syncLiquidClip();
  }

  detach(preserveWorld = true): void {
    if (this.group.parent === this.homeParent) return;
    if (preserveWorld) {
      this.homeParent.updateWorldMatrix(true, false);
      this.group.updateWorldMatrix(true, false);
      this.homeParent.attach(this.group);
    } else {
      this.homeParent.add(this.group);
    }
    this.syncLiquidClip();
  }

  setQuality(quality: BottleQualitySpec): void {
    const geomChanged =
      this.qualitySpec.bottleSegments !== quality.bottleSegments ||
      this.qualitySpec.bottleShards.radial !== quality.bottleShards.radial ||
      this.qualitySpec.bottleShards.bands !== quality.bottleShards.bands;

    swapBottleMaterialQuality(
      this.materials,
      {
        transmission: quality.transmission,
        crackSize: quality.crackSize,
        clipPlane: this.clipPlane,
      },
      this.params,
    );
    this.bodyMesh.material = this.materials.body;
    this.liquidMesh.material = this.materials.liquid;

    if (geomChanged) {
      this.bodyMesh.geometry.dispose();
      this.capMesh.geometry.dispose();
      this.liquidMesh.geometry.dispose();
      this.labelMesh.geometry.dispose();

      this.bodyMesh.geometry = buildBottleBodyGeometry(
        quality.bottleSegments,
        quality.bottleShards.radial,
        quality.bottleShards.bands,
      );
      this.capMesh.geometry = buildBottleCapGeometry(Math.max(80, quality.bottleSegments * 3));
      this.liquidMesh.geometry = buildLiquidGeometry(quality.bottleSegments);
      this.labelMesh.geometry = buildLabelGeometry(quality.bottleSegments);
      this._shardCount = quality.bottleShards.radial * quality.bottleShards.bands;
    }

    this.qualitySpec = { ...quality, bottleShards: { ...quality.bottleShards } };
  }

  reset(): void {
    if (this.group.parent !== this.homeParent) {
      this.homeParent.add(this.group);
    }
    this.group.visible = true;
    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);
    this.visualGroup.position.set(0, 0, 0);
    this.visualGroup.rotation.set(0, 0, 0);
    this.visualGroup.scale.set(1, 1, 1);
    this.setParams(DEFAULT_BOTTLE_PARAMS);
  }

  dispose(): void {
    this.group.removeFromParent();
    this.bodyMesh.geometry.dispose();
    this.capMesh.geometry.dispose();
    this.liquidMesh.geometry.dispose();
    this.labelMesh.geometry.dispose();
    disposeBottleMaterials(this.materials);
  }
}
