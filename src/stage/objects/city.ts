import * as THREE from "three";
import { createClayMaterial } from "../materials/clay";
import { QUALITY_PRESETS, type QualityConfig } from "../quality";
import { makeWindowAtlas } from "../textures/canvas-assets";
import { disposeObject } from "../util/dispose";
import { clamp, clamp01, lerp } from "../util/math";
import { createRng, rngRange } from "../util/rng";
import type { WaterSystem } from "./water";

export const TRASH_COUNT_DESKTOP = 28;
export const TRASH_COUNT_COMPACT = 14;

interface TrashItemSpec {
  readonly kind: 0 | 1 | 2;
  readonly localIndex: number;
  readonly baseX: number;
  readonly baseZ: number;
  readonly yaw: number;
  readonly tiltBias: number;
  readonly phase: number;
  readonly driftSpeed: number;
  readonly scale: number;
}

function buildLowBottleGeometry(): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.18, 0.02),
    new THREE.Vector2(0.2, 0.48),
    new THREE.Vector2(0.14, 0.68),
    new THREE.Vector2(0.08, 0.8),
    new THREE.Vector2(0.08, 0.92),
    new THREE.Vector2(0.0, 0.92),
  ];
  const geom = new THREE.LatheGeometry(pts, 10);
  geom.rotateZ(Math.PI * 0.48);
  geom.computeBoundingSphere();
  return geom;
}

function buildWindowMaterial(useAtlas: boolean): {
  material: THREE.MeshStandardMaterial;
  texture: THREE.CanvasTexture | null;
} {
  if (!useAtlas) {
    return {
      material: createClayMaterial({ color: "#12294A", roughness: 0.82 }),
      texture: null,
    };
  }
  const atlas = makeWindowAtlas();
  atlas.wrapS = THREE.RepeatWrapping;
  atlas.wrapT = THREE.RepeatWrapping;
  atlas.repeat.set(2, 3);
  return {
    material: new THREE.MeshStandardMaterial({
      color: "#12294A",
      roughness: 0.78,
      metalness: 0,
      emissive: new THREE.Color("#8FB0CC"),
      emissiveMap: atlas,
      emissiveIntensity: 0.65,
    }),
    texture: atlas,
  };
}

/**
 * Lingkungan Bab 3 ("Tersesat"): kota 3 lapis seeded(7), tanggul + 40 tiang pagar,
 * jembatan lengkung, dan 28 (14 portrait/LOW) sampah mengambang 3 jenis.
 */
export class CityEnvironment {
  readonly group = new THREE.Group();
  readonly farGroup = new THREE.Group();
  readonly midGroup = new THREE.Group();
  readonly nearGroup = new THREE.Group();
  readonly bridgeGroup = new THREE.Group();
  readonly trashGroup = new THREE.Group();

  readonly farBuildings: THREE.InstancedMesh;
  readonly midBuildings: THREE.InstancedMesh;
  readonly nearBuildings: THREE.InstancedMesh;
  readonly embankmentWall: THREE.Mesh;
  readonly fencePosts: THREE.InstancedMesh;
  readonly trashBags: THREE.InstancedMesh;
  readonly trashCups: THREE.InstancedMesh;
  readonly trashBottles: THREE.InstancedMesh;

  totalTrashCount: number;
  private _visibleTrashCount: number;
  private readonly maxFarCount: number;
  private readonly desktopTrashCap: number;
  private readonly compactTrashCap: number;
  private compactMode: boolean;

  private readonly trashSpecs: TrashItemSpec[] = [];
  private readonly bagCapacity: number;
  private readonly cupCapacity: number;
  private readonly bottleCapacity: number;
  private readonly minTrashVisible: number;
  private readonly windowAtlasTex: THREE.CanvasTexture | null;

  // Objek bantu pakai-ulang (nol alokasi per frame)
  private readonly _mat = new THREE.Matrix4();
  private readonly _pos = new THREE.Vector3();
  private readonly _quat = new THREE.Quaternion();
  private readonly _tiltQuat = new THREE.Quaternion();
  private readonly _scale = new THREE.Vector3();
  private readonly _up = new THREE.Vector3(0, 1, 0);
  private readonly _normal = new THREE.Vector3(0, 1, 0);
  private readonly _euler = new THREE.Euler();

  constructor(
    parent: THREE.Object3D,
    quality: QualityConfig = QUALITY_PRESETS.high,
    isPortrait = false,
  ) {
    this.group.name = "B3-CITY-ENV";
    parent.add(this.group);

    const compact = isPortrait || quality.tier === "low";
    this.compactMode = compact;
    const farCount = compact ? 30 : 60;
    this.maxFarCount = farCount;
    const midCount = 40;
    const nearCount = 3;
    const fenceCount = 40;
    this.desktopTrashCap = compact ? TRASH_COUNT_COMPACT : TRASH_COUNT_DESKTOP;
    this.compactTrashCap = TRASH_COUNT_COMPACT;
    this.totalTrashCount = this.desktopTrashCap;
    this.minTrashVisible = compact ? 2 : 4;
    this._visibleTrashCount = this.minTrashVisible;

    const rng = createRng(7);

    // 1. Kota 3 lapis (InstancedMesh BoxGeometry)
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    unitBox.translate(0, 0.5, 0);

    const farMat = createClayMaterial({ color: "#0F2036", roughness: 0.85 });
    const winSetup = buildWindowMaterial(quality.windowAtlas && !isPortrait);
    this.windowAtlasTex = winSetup.texture;
    const nearMat = createClayMaterial({ color: "#12294A", roughness: 0.8 });

    this.farBuildings = new THREE.InstancedMesh(unitBox, farMat, farCount);
    this.farBuildings.name = "O-CITY-FAR";
    for (let i = 0; i < farCount; i++) {
      const x = -28 + (i / farCount) * 56 + rngRange(rng, -0.4, 0.4);
      const z = -30 + rngRange(rng, -2.5, 2.5);
      const w = rngRange(rng, 1.4, 3.2);
      const h = rngRange(rng, 3.0, 14.0);
      const d = rngRange(rng, 1.4, 2.8);
      this._pos.set(x, -0.35, z);
      this._quat.identity();
      this._scale.set(w, h, d);
      this._mat.compose(this._pos, this._quat, this._scale);
      this.farBuildings.setMatrixAt(i, this._mat);
    }
    this.farBuildings.instanceMatrix.needsUpdate = true;
    this.farGroup.add(this.farBuildings);

    this.midBuildings = new THREE.InstancedMesh(unitBox, winSetup.material, midCount);
    this.midBuildings.name = "O-CITY-MID";
    for (let i = 0; i < midCount; i++) {
      const x = -23 + (i / midCount) * 46 + rngRange(rng, -0.35, 0.35);
      const z = -16 + rngRange(rng, -1.6, 1.6);
      const w = rngRange(rng, 1.3, 2.7);
      const h = rngRange(rng, 2.4, 9.6);
      const d = rngRange(rng, 1.3, 2.4);
      this._pos.set(x, -0.35, z);
      this._quat.identity();
      this._scale.set(w, h, d);
      this._mat.compose(this._pos, this._quat, this._scale);
      this.midBuildings.setMatrixAt(i, this._mat);
    }
    this.midBuildings.instanceMatrix.needsUpdate = true;
    this.midGroup.add(this.midBuildings);

    this.nearBuildings = new THREE.InstancedMesh(unitBox, nearMat, nearCount);
    this.nearBuildings.name = "O-CITY-NEAR";
    const nearXs = [-5.4, 2.8, 7.6];
    for (let i = 0; i < nearCount; i++) {
      const w = rngRange(rng, 2.0, 3.0);
      const h = rngRange(rng, 4.2, 7.4);
      const d = rngRange(rng, 1.8, 2.5);
      this._pos.set(nearXs[i]!, -0.35, -8 + rngRange(rng, -0.4, 0.4));
      this._quat.identity();
      this._scale.set(w, h, d);
      this._mat.compose(this._pos, this._quat, this._scale);
      this.nearBuildings.setMatrixAt(i, this._mat);
    }
    this.nearBuildings.instanceMatrix.needsUpdate = true;
    this.nearGroup.add(this.nearBuildings);

    // 2. Tanggul + Pagar (O-EMBANK) sepanjang sisi utara kanal agar tidak menghalangi kamera
    const embMat = createClayMaterial({ color: "#12294A", roughness: 0.82 });
    const wallGeom = new THREE.BoxGeometry(40, 1.2, 0.6);
    this.embankmentWall = new THREE.Mesh(wallGeom, embMat);
    this.embankmentWall.name = "O-EMBANK-WALL";
    this.embankmentWall.position.set(0, -0.15, -6.2);
    this.nearGroup.add(this.embankmentWall);

    const postGeom = new THREE.BoxGeometry(0.11, 0.62, 0.11);
    const postMat = createClayMaterial({ color: "#1E3A5F", roughness: 0.78 });
    this.fencePosts = new THREE.InstancedMesh(postGeom, postMat, fenceCount);
    this.fencePosts.name = "O-EMBANK-FENCE";
    for (let i = 0; i < fenceCount; i++) {
      const px = -19.5 + (i / (fenceCount - 1)) * 39;
      this._pos.set(px, 0.72, -6.05);
      this._quat.identity();
      this._scale.set(1, 1, 1);
      this._mat.compose(this._pos, this._quat, this._scale);
      this.fencePosts.setMatrixAt(i, this._mat);
    }
    this.fencePosts.instanceMatrix.needsUpdate = true;
    this.nearGroup.add(this.fencePosts);

    // 3. Jembatan lengkung (O-BRIDGE) di x = -0.12 -> dilalui kamera sekitar t = 0.49
    this.bridgeGroup.name = "O-BRIDGE";
    this.bridgeGroup.position.set(-0.12, 0, 0);
    const bridgeMat = createClayMaterial({ color: "#12294A", roughness: 0.8 });
    const archCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -0.4, -7.2),
      new THREE.Vector3(0, 2.35, 0),
      new THREE.Vector3(0, -0.4, 7.2),
    );
    const archGeom = new THREE.TubeGeometry(archCurve, 24, 0.25, 8, false);
    const archMeshLeft = new THREE.Mesh(archGeom, bridgeMat);
    archMeshLeft.position.x = -1.25;
    const archMeshRight = new THREE.Mesh(archGeom, bridgeMat);
    archMeshRight.position.x = 1.25;

    const deckGeom = new THREE.BoxGeometry(3.0, 0.5, 26);
    const deckMesh = new THREE.Mesh(deckGeom, bridgeMat);
    deckMesh.position.set(0, 1.95, 0);

    const pierGeom = new THREE.BoxGeometry(2.6, 2.6, 0.75);
    const pierFar = new THREE.Mesh(pierGeom, bridgeMat);
    pierFar.position.set(0, 0.7, -5.8);
    const pierNear = new THREE.Mesh(pierGeom, bridgeMat);
    pierNear.position.set(0, 0.7, 5.8);

    this.bridgeGroup.add(archMeshLeft, archMeshRight, deckMesh, pierFar, pierNear);

    // 4. Sampah mengambang (O-TRASH): kantong, gelas, botol
    this.bagCapacity = compact ? 5 : 10;
    this.cupCapacity = compact ? 5 : 9;
    this.bottleCapacity = this.totalTrashCount - this.bagCapacity - this.cupCapacity;

    const bagGeom = new THREE.IcosahedronGeometry(0.5, 1);
    bagGeom.scale(1.0, 0.28, 0.82);
    const bagMat = createClayMaterial({
      color: "#E6EAF2",
      roughness: 0.72,
      transparent: true,
      opacity: 0.72,
    });

    const cupGeom = new THREE.ConeGeometry(0.35, 0.7, 12);
    cupGeom.rotateZ(Math.PI * 0.45);
    const cupMat = createClayMaterial({ color: "#9CC6EA", roughness: 0.72 });

    const lowBottleGeom = buildLowBottleGeometry();
    const lowBottleMat = createClayMaterial({
      color: "#BFE9FF",
      roughness: 0.45,
      transparent: true,
      opacity: 0.78,
    });

    this.trashBags = new THREE.InstancedMesh(bagGeom, bagMat, this.bagCapacity);
    this.trashCups = new THREE.InstancedMesh(cupGeom, cupMat, this.cupCapacity);
    this.trashBottles = new THREE.InstancedMesh(lowBottleGeom, lowBottleMat, this.bottleCapacity);
    this.trashBags.name = "O-TRASH-BAGS";
    this.trashCups.name = "O-TRASH-CUPS";
    this.trashBottles.name = "O-TRASH-BOTTLES";

    let bIdx = 0;
    let cIdx = 0;
    let lIdx = 0;
    for (let i = 0; i < this.totalTrashCount; i++) {
      let kind: 0 | 1 | 2;
      let localIndex = 0;
      if (
        bIdx < this.bagCapacity &&
        (i % 3 === 0 || (cIdx >= this.cupCapacity && lIdx >= this.bottleCapacity))
      ) {
        kind = 0;
        localIndex = bIdx++;
      } else if (cIdx < this.cupCapacity && (i % 3 === 1 || lIdx >= this.bottleCapacity)) {
        kind = 1;
        localIndex = cIdx++;
      } else {
        kind = 2;
        localIndex = lIdx++;
      }

      this.trashSpecs.push({
        kind,
        localIndex,
        baseX: rngRange(rng, -8.5, 10.5),
        baseZ: rngRange(rng, -4.4, 2.2),
        yaw: rngRange(rng, 0, Math.PI * 2),
        tiltBias: rngRange(rng, -0.22, 0.22),
        phase: rngRange(rng, 0, Math.PI * 2),
        driftSpeed: rngRange(rng, 0.08, 0.22),
        scale: rngRange(rng, 0.62, 0.96),
      });
    }

    this.trashGroup.add(this.trashBags, this.trashCups, this.trashBottles);
    this.group.add(this.farGroup, this.midGroup, this.nearGroup, this.bridgeGroup, this.trashGroup);
    this.setTrashVisibleFraction(0);
  }

  get visibleTrashCount(): number {
    return this._visibleTrashCount;
  }

  setCompactMode(compact: boolean): void {
    this.compactMode = compact;
    this.farBuildings.count = compact ? Math.min(30, this.maxFarCount) : this.maxFarCount;
    this.totalTrashCount = compact
      ? Math.min(this.compactTrashCap, this.desktopTrashCap)
      : this.desktopTrashCap;
  }

  setTrashVisibleFraction(fraction01: number): void {
    const k = clamp01(fraction01);
    const minVis = this.compactMode ? Math.min(2, this.minTrashVisible) : this.minTrashVisible;
    const next = Math.round(lerp(minVis, this.totalTrashCount, k));
    this._visibleTrashCount = clamp(next, minVis, this.totalTrashCount);
  }

  /**
   * Memperbarui paralaks 3 lapis, pergeseran muara (t 0.72..1), dan posisi apung sampah di permukaan air.
   */
  update(t: number, camX: number, estuaryMix: number, water: WaterSystem, waveTime: number): void {
    const est = clamp01(estuaryMix);
    const farParallaxOffset = camX * 0.85;
    const midParallaxOffset = camX * 0.55;

    // Muara: kota dan tanggul mundur perlahan ke belakang dan turun agar menghilang mulus tanpa meloncat
    const farZ = -est * 18;
    const midZ = -est * 16;
    const nearZ = -est * 14;
    const sinkY = -est * 2.2;

    this.farGroup.position.set(farParallaxOffset, sinkY * 0.6, farZ);
    this.midGroup.position.set(midParallaxOffset, sinkY * 0.85, midZ);
    this.nearGroup.position.set(0, sinkY, nearZ);
    this.bridgeGroup.position.set(-0.12 - est * 6, -est * 1.6, -est * 10);
    this.bridgeGroup.visible = est < 0.98;

    this.setTrashVisibleFraction(clamp01(t / 0.7));

    let bagCount = 0;
    let cupCount = 0;
    let bottleCount = 0;

    for (let i = 0; i < this._visibleTrashCount; i++) {
      const spec = this.trashSpecs[i]!;
      const wx = spec.baseX + t * 2.4 * spec.driftSpeed;
      const wz = spec.baseZ + Math.sin(waveTime * 0.5 + spec.phase) * 0.12 - est * 1.5;
      const sample = water.sampleHeightAndNormal(wx, wz, this._normal);

      this._pos.set(wx, sample.y - 0.04 + Math.sin(waveTime * 1.4 + spec.phase) * 0.02, wz);
      this._tiltQuat.setFromUnitVectors(this._up, sample.normal);
      this._euler.set(spec.tiltBias, spec.yaw + waveTime * 0.12, spec.tiltBias * 0.6);
      this._quat.setFromEuler(this._euler).premultiply(this._tiltQuat);
      const scaleFade = spec.scale * (1 - est * 0.35);
      this._scale.set(scaleFade, scaleFade, scaleFade);
      this._mat.compose(this._pos, this._quat, this._scale);

      if (spec.kind === 0) {
        this.trashBags.setMatrixAt(bagCount++, this._mat);
      } else if (spec.kind === 1) {
        this.trashCups.setMatrixAt(cupCount++, this._mat);
      } else {
        this.trashBottles.setMatrixAt(bottleCount++, this._mat);
      }
    }

    this.trashBags.count = bagCount;
    this.trashCups.count = cupCount;
    this.trashBottles.count = bottleCount;
    this.trashBags.instanceMatrix.needsUpdate = true;
    this.trashCups.instanceMatrix.needsUpdate = true;
    this.trashBottles.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.group.removeFromParent();
    disposeObject(this.group);
    this.windowAtlasTex?.dispose();
  }
}
