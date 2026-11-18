import * as THREE from "three";
import { makeConveyorBelt } from "../textures/canvas-assets";
import {
  makeBrushedMetalSet,
  makePolymerSurfaceSet,
  makeWoodGrainSet,
  type PbrTextureSet,
} from "../textures/pbr-maps";
import { clamp01, lerp } from "../util/math";
import { createRng } from "../util/rng";
import { BOTTLE_PROFILE } from "./bottle";

export const CONVEYOR_SPECS = {
  beltLength: 18,
  beltThickness: 0.4,
  beltDepth: 2.4,
  beltY: 0.6,
  beltTopY: 0.8,
  rollerCount: 14,
  rollerRadius: 0.2,
  pusherCount: 3,
  maxItems: 40,
  compactItems: 20,
  maxSpray: 160,
  compactSpray: 80,
  maxGhosts: 5,
  compactGhosts: 3,
} as const;

export interface PusherRig {
  readonly group: THREE.Group;
  readonly piston: THREE.Mesh;
  readonly x: number;
}

function buildMiniBottleGeometry(radialSegments = 10): THREE.BufferGeometry {
  const pts = BOTTLE_PROFILE.map(([r, y]) => new THREE.Vector2(r * 0.72, y * 0.72));
  const geom = new THREE.LatheGeometry(pts, radialSegments);
  geom.computeVertexNormals();
  return geom;
}

function buildBackWallGeometry(): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(34, 14, 1, 1);
  const pos = geom.getAttribute("position");
  const colors = new Float32Array(pos.count * 3);
  const lowColor = new THREE.Color("#133332");
  const highColor = new THREE.Color("#1D4B47");
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const yNorm = clamp01((pos.getY(i) + 7) / 14);
    c.lerpColors(lowColor, highColor, yNorm);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geom;
}

interface ItemSeed {
  readonly kind: 0 | 1 | 2 | 3; // 0: kaleng, 1: kertas, 2: kardus, 3: PET
  readonly instanceIndex: number;
  readonly startX: number;
  readonly z: number;
  readonly rotY: number;
  readonly speed: number;
  readonly pushStation: number;
}

export class Conveyor {
  readonly group = new THREE.Group();
  readonly beltMesh: THREE.Mesh;
  readonly rollers: readonly THREE.Mesh[];
  readonly pushers: readonly PusherRig[];
  readonly ghostBottles: readonly THREE.Mesh[];

  private readonly beltTexture: THREE.Texture;
  private readonly cansMesh: THREE.InstancedMesh;
  private readonly paperMesh: THREE.InstancedMesh;
  private readonly boxMesh: THREE.InstancedMesh;
  private readonly petMesh: THREE.InstancedMesh;
  private readonly sprayPoints: THREE.Points;
  private readonly sprayPositions: Float32Array;
  private readonly spraySeeds: readonly { x: number; z: number; phase: number }[];
  private readonly itemSeeds: readonly ItemSeed[];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly textureSets: PbrTextureSet[] = [];

  private readonly dummy = new THREE.Object3D();
  private compactMode = false;

  constructor(parent: THREE.Object3D, compact = false) {
    this.group.name = "O-CONVEYOR";
    this.compactMode = compact;

    const metalSet = makeBrushedMetalSet(256, 2, 1);
    const polymerSet = makePolymerSurfaceSet(256, 4, 1);
    const kraftSet = makeWoodGrainSet(256, 1, 1);
    this.textureSets.push(metalSet, polymerSet, kraftSet);

    // 1. Dinding belakang industrial + 4 jendela pucat + lantai gelap penyangga
    const wallGeom = buildBackWallGeometry();
    const wallMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    const wallMesh = new THREE.Mesh(wallGeom, wallMat);
    wallMesh.position.set(0, 2.5, -4.6);

    const floorGeom = new THREE.PlaneGeometry(36, 14);
    floorGeom.rotateX(-Math.PI * 0.5);
    const floorMat = new THREE.MeshStandardMaterial({
      color: "#0F2426",
      roughness: 0.88,
      metalness: 0.08,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.position.set(0, -0.5, 0);
    this.geometries.push(wallGeom, floorGeom);
    this.materials.push(wallMat, floorMat);

    const winGeom = new THREE.PlaneGeometry(3.8, 4.4);
    const winMat = new THREE.MeshBasicMaterial({
      color: "#B9F3C9",
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    this.geometries.push(winGeom);
    this.materials.push(winMat);
    const windowXs = [-9, -3, 3, 9];
    for (const wx of windowXs) {
      const win = new THREE.Mesh(winGeom, winMat);
      win.position.set(wx, 3.8, -4.45);
      this.group.add(win);
    }
    this.group.add(wallMesh, floorMesh);

    // 2. Sabuk karet gelap 18 x 0.4 x 2.4 di y = 0.6 dengan T-BELT + relief polimer
    this.beltTexture = makeConveyorBelt();
    this.beltTexture.repeat.set(6, 1);
    const beltGeom = new THREE.BoxGeometry(
      CONVEYOR_SPECS.beltLength,
      CONVEYOR_SPECS.beltThickness,
      CONVEYOR_SPECS.beltDepth,
    );
    const beltMat = new THREE.MeshStandardMaterial({
      color: "#7EA6A2",
      map: this.beltTexture,
      normalMap: polymerSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.4, 0.4),
      roughnessMap: polymerSet.roughnessMap ?? null,
      roughness: 0.72,
      metalness: 0.06,
    });
    this.beltMesh = new THREE.Mesh(beltGeom, beltMat);
    this.beltMesh.position.set(0, CONVEYOR_SPECS.beltY, 0);
    this.geometries.push(beltGeom);
    this.materials.push(beltMat);
    this.group.add(this.beltMesh);

    // Rangka baja industrial samping & kaki penopang agar tidak melayang
    const frameMat = new THREE.MeshStandardMaterial({
      color: "#2E4047",
      map: metalSet.map ?? null,
      normalMap: metalSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.36,
      metalness: 0.78,
      envMapIntensity: 1.1,
    });
    const railGeom = new THREE.BoxGeometry(CONVEYOR_SPECS.beltLength + 0.3, 0.24, 0.14);
    const legGeom = new THREE.BoxGeometry(0.24, 1.05, 0.24);
    this.geometries.push(railGeom, legGeom);
    this.materials.push(frameMat);

    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(railGeom, frameMat);
      rail.position.set(0, 0.56, side * (CONVEYOR_SPECS.beltDepth * 0.5 + 0.08));
      this.group.add(rail);
      for (const lx of [-7.5, -2.5, 2.5, 7.5]) {
        const leg = new THREE.Mesh(legGeom, frameMat);
        leg.position.set(lx, 0.0, side * (CONVEYOR_SPECS.beltDepth * 0.5 + 0.08));
        this.group.add(leg);
      }
    }

    // 3. 14 rol silinder baja sikat r=0.2
    const rollerGeom = new THREE.CylinderGeometry(
      CONVEYOR_SPECS.rollerRadius,
      CONVEYOR_SPECS.rollerRadius,
      2.5,
      10,
    );
    rollerGeom.rotateX(Math.PI * 0.5);
    const rollerMat = new THREE.MeshStandardMaterial({
      color: "#8D9CA8",
      map: metalSet.map ?? null,
      normalMap: metalSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.26,
      metalness: 0.88,
      envMapIntensity: 1.25,
    });
    this.geometries.push(rollerGeom);
    this.materials.push(rollerMat);

    const builtRollers: THREE.Mesh[] = [];
    for (let i = 0; i < CONVEYOR_SPECS.rollerCount; i++) {
      const rx = lerp(-8.4, 8.4, i / (CONVEYOR_SPECS.rollerCount - 1));
      const rMesh = new THREE.Mesh(rollerGeom, rollerMat);
      rMesh.position.set(rx, 0.34, 0);
      builtRollers.push(rMesh);
      this.group.add(rMesh);
    }
    this.rollers = builtRollers;

    // 4. 3 pemilah pneumatik (silinder + piston aksen mint + corong gelap)
    const pipeGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);
    const pistonGeom = new THREE.BoxGeometry(0.45, 0.38, 1.2);
    const chuteGeom = new THREE.CylinderGeometry(0.75, 0.45, 1.0, 8, 1, true);
    const pusherMat = new THREE.MeshStandardMaterial({
      color: "#8CCEB8",
      normalMap: metalSet.normalMap ?? null,
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.34,
      metalness: 0.52,
    });
    const chuteMat = new THREE.MeshStandardMaterial({
      color: "#1B3338",
      normalMap: metalSet.normalMap ?? null,
      roughness: 0.55,
      metalness: 0.65,
      side: THREE.DoubleSide,
    });
    this.geometries.push(pipeGeom, pistonGeom, chuteGeom);
    this.materials.push(pusherMat, chuteMat);

    const builtPushers: PusherRig[] = [];
    const pusherXs = [-4.6, -1.8, 0.9];
    for (const px of pusherXs) {
      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0, 0);
      const pipe = new THREE.Mesh(pipeGeom, frameMat);
      pipe.position.set(0, 1.55, -1.25);
      const piston = new THREE.Mesh(pistonGeom, pusherMat);
      piston.position.set(0, 1.02, -0.9);
      const chute = new THREE.Mesh(chuteGeom, chuteMat);
      chute.position.set(0, -0.25, 1.45);
      pGroup.add(pipe, piston, chute);
      this.group.add(pGroup);
      builtPushers.push({ group: pGroup, piston, x: px });
    }
    this.pushers = builtPushers;

    // 5. Lorong cuci kaca basah + bingkai baja
    const tunnelGeom = new THREE.BoxGeometry(4, 3, 2.8);
    const tunnelMat = new THREE.MeshStandardMaterial({
      color: "#60C6BF",
      transparent: true,
      opacity: 0.24,
      roughness: 0.1,
      metalness: 0.12,
      envMapIntensity: 1.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const tunnelMesh = new THREE.Mesh(tunnelGeom, tunnelMat);
    tunnelMesh.position.set(3.8, 2.1, 0);
    const archGeom = new THREE.BoxGeometry(0.14, 3.06, 2.86);
    const archEntry = new THREE.Mesh(archGeom, frameMat);
    archEntry.position.set(1.85, 2.1, 0);
    const archExit = new THREE.Mesh(archGeom, frameMat);
    archExit.position.set(5.75, 2.1, 0);
    this.geometries.push(tunnelGeom, archGeom);
    this.materials.push(tunnelMat);
    this.group.add(tunnelMesh, archEntry, archExit);

    // Semprotan 160 partikel (80 saat HP/LOW)
    const rand = createRng(808);
    this.sprayPositions = new Float32Array(CONVEYOR_SPECS.maxSpray * 3);
    const builtSpraySeeds: { x: number; z: number; phase: number }[] = [];
    for (let i = 0; i < CONVEYOR_SPECS.maxSpray; i++) {
      const sx = lerp(1.9, 5.7, rand());
      const sz = lerp(-1.0, 1.0, rand());
      const phase = rand();
      builtSpraySeeds.push({ x: sx, z: sz, phase });
      this.sprayPositions[i * 3] = sx;
      this.sprayPositions[i * 3 + 1] = lerp(0.9, 3.4, phase);
      this.sprayPositions[i * 3 + 2] = sz;
    }
    this.spraySeeds = builtSpraySeeds;
    const sprayGeom = new THREE.BufferGeometry();
    sprayGeom.setAttribute("position", new THREE.BufferAttribute(this.sprayPositions, 3));
    const sprayMat = new THREE.PointsMaterial({
      color: "#DDF6FF",
      size: 0.1,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
    this.sprayPoints = new THREE.Points(sprayGeom, sprayMat);
    this.geometries.push(sprayGeom);
    this.materials.push(sprayMat);
    this.group.add(this.sprayPoints);

    // 6. Hopper PET baja gelap di ujung kanan + corong masuk kiri
    const hopperGeom = new THREE.CylinderGeometry(1.35, 0.7, 1.7, 10, 1, true);
    const hopperMat = new THREE.MeshStandardMaterial({
      color: "#223E42",
      normalMap: metalSet.normalMap ?? null,
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.42,
      metalness: 0.68,
      side: THREE.DoubleSide,
    });
    const rightHopper = new THREE.Mesh(hopperGeom, hopperMat);
    rightHopper.position.set(8.6, 1.45, 0);
    const leftInlet = new THREE.Mesh(hopperGeom, hopperMat);
    leftInlet.scale.set(0.75, 0.8, 0.75);
    leftInlet.position.set(-8.6, 2.55, 0);
    this.geometries.push(hopperGeom);
    this.materials.push(hopperMat);
    this.group.add(rightHopper, leftInlet);

    // 7. Sampah campuran InstancedMesh total 40 dengan kontras material (kaleng logam, kertas pucat matte, kardus kraft hangat, PET bening)
    const canGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 10);
    const paperGeom = new THREE.IcosahedronGeometry(0.45, 0);
    const boxGeom = new THREE.BoxGeometry(1.2, 0.9, 0.9);
    const petGeom = buildMiniBottleGeometry(10);

    const canMat = new THREE.MeshStandardMaterial({
      color: "#B4C2CF",
      map: metalSet.map ?? null,
      normalMap: metalSet.normalMap ?? null,
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.25,
      metalness: 0.86,
      envMapIntensity: 1.25,
    });
    const paperMat = new THREE.MeshStandardMaterial({
      color: "#DCE3EC",
      normalMap: polymerSet.normalMap ?? null,
      roughness: 0.92,
      metalness: 0,
    });
    const boxMat = new THREE.MeshStandardMaterial({
      color: "#A48460",
      map: kraftSet.map ?? null,
      normalMap: kraftSet.normalMap ?? null,
      roughness: 0.84,
      metalness: 0,
    });
    const petMat = new THREE.MeshStandardMaterial({
      color: "#AEE5FF",
      transparent: true,
      opacity: 0.58,
      roughness: 0.1,
      metalness: 0.05,
      envMapIntensity: 1.3,
    });

    this.geometries.push(canGeom, paperGeom, boxGeom, petGeom);
    this.materials.push(canMat, paperMat, boxMat, petMat);

    this.cansMesh = new THREE.InstancedMesh(canGeom, canMat, 12);
    this.paperMesh = new THREE.InstancedMesh(paperGeom, paperMat, 12);
    this.boxMesh = new THREE.InstancedMesh(boxGeom, boxMat, 10);
    this.petMesh = new THREE.InstancedMesh(petGeom, petMat, 6);
    this.group.add(this.cansMesh, this.paperMesh, this.boxMesh, this.petMesh);

    const seeds: ItemSeed[] = [];
    const counts: readonly (readonly [0 | 1 | 2 | 3, number])[] = [
      [0, 12],
      [1, 12],
      [2, 10],
      [3, 6],
    ];
    for (const [kind, total] of counts) {
      for (let i = 0; i < total; i++) {
        seeds.push({
          kind,
          instanceIndex: i,
          startX: lerp(-7.8, 2.2, rand()),
          z: lerp(-0.8, 0.8, rand()),
          rotY: rand() * Math.PI * 2,
          speed: lerp(6.5, 9.5, rand()),
          pushStation: kind === 3 ? -1 : kind,
        });
      }
    }
    this.itemSeeds = seeds;

    // 8. 5 botol hantu "teman yang hilang" (opacity 0.35)
    const ghostMat = new THREE.MeshStandardMaterial({
      color: "#BFE9FF",
      transparent: true,
      opacity: 0.35,
      roughness: 0.16,
      depthWrite: false,
    });
    this.materials.push(ghostMat);
    const builtGhosts: THREE.Mesh[] = [];
    for (let i = 0; i < CONVEYOR_SPECS.maxGhosts; i++) {
      const ghost = new THREE.Mesh(petGeom, ghostMat);
      ghost.position.set(-1.2 + i * 0.72, 0.9, i % 2 === 0 ? 0.55 : -0.45);
      builtGhosts.push(ghost);
      this.group.add(ghost);
    }
    this.ghostBottles = builtGhosts;

    parent.add(this.group);
    this.setCompactMode(compact);
    this.update(0);
  }

  setCompactMode(compact: boolean): void {
    this.compactMode = compact;
    this.cansMesh.count = compact ? 6 : 12;
    this.paperMesh.count = compact ? 6 : 12;
    this.boxMesh.count = compact ? 5 : 10;
    this.petMesh.count = compact ? 3 : 6;
    this.sprayPoints.geometry.setDrawRange(
      0,
      compact ? CONVEYOR_SPECS.compactSpray : CONVEYOR_SPECS.maxSpray,
    );
    const activeGhosts = this.getActiveGhostCount();
    for (let i = 0; i < this.ghostBottles.length; i++) {
      this.ghostBottles[i]!.visible = i < activeGhosts;
    }
  }

  getActiveItemCount(): number {
    return this.cansMesh.count + this.paperMesh.count + this.boxMesh.count + this.petMesh.count;
  }

  getActiveSprayCount(): number {
    return this.compactMode ? CONVEYOR_SPECS.compactSpray : CONVEYOR_SPECS.maxSpray;
  }

  getActiveGhostCount(): number {
    return this.compactMode ? CONVEYOR_SPECS.compactGhosts : CONVEYOR_SPECS.maxGhosts;
  }

  reset(): void {
    this.group.visible = true;
    this.update(0);
  }

  update(t: number): void {
    const progress = clamp01(t);

    // 1. Gulir sabuk + putar rol
    this.beltTexture.offset.x = -progress * 4.5;
    for (const roller of this.rollers) {
      roller.rotation.z = -progress * 26;
    }

    // 2. Piston pemilah berosilasi seirama saat barang melintas
    for (let i = 0; i < this.pushers.length; i++) {
      const p = this.pushers[i]!;
      const wave = Math.max(0, Math.sin((progress * 3.5 + i * 0.37) * Math.PI * 2));
      p.piston.position.z = lerp(-0.9, 0.25, wave);
    }

    // 3. Partikel semprotan dalam lorong cuci
    const activeSpray = this.getActiveSprayCount();
    const posAttr = this.sprayPoints.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < activeSpray; i++) {
      const s = this.spraySeeds[i]!;
      const fall = (s.phase + progress * 6) % 1;
      posAttr.setXYZ(i, s.x, lerp(3.4, 0.9, fall), s.z);
    }
    posAttr.needsUpdate = true;

    // 4. Item campuran bergerak, non-PET terdorong jatuh di stasiun 0/1/2
    let cIdx = 0;
    let pIdx = 0;
    let bIdx = 0;
    let eIdx = 0;

    for (const seed of this.itemSeeds) {
      const rawX = seed.startX + progress * seed.speed;
      let wx = rawX;
      let wy = CONVEYOR_SPECS.beltTopY + 0.36;
      let wz = seed.z;

      if (seed.pushStation >= 0 && seed.pushStation < this.pushers.length) {
        const stationX = this.pushers[seed.pushStation]!.x;
        if (rawX > stationX) {
          const dropK = clamp01((rawX - stationX) / 1.4);
          wx = stationX + dropK * 0.35;
          wz = lerp(seed.z, 1.45, dropK);
          wy = lerp(CONVEYOR_SPECS.beltTopY + 0.36, -0.75, dropK * dropK);
        }
      } else {
        wx = Math.min(8.5, rawX);
      }

      this.dummy.position.set(wx, wy, wz);
      this.dummy.rotation.set(0, seed.rotY + progress * 0.6, 0);
      this.dummy.scale.setScalar(1);
      this.dummy.updateMatrix();

      if (seed.kind === 0 && cIdx < this.cansMesh.count) {
        this.cansMesh.setMatrixAt(cIdx++, this.dummy.matrix);
      } else if (seed.kind === 1 && pIdx < this.paperMesh.count) {
        this.paperMesh.setMatrixAt(pIdx++, this.dummy.matrix);
      } else if (seed.kind === 2 && bIdx < this.boxMesh.count) {
        this.boxMesh.setMatrixAt(bIdx++, this.dummy.matrix);
      } else if (seed.kind === 3 && eIdx < this.petMesh.count) {
        this.petMesh.setMatrixAt(eIdx++, this.dummy.matrix);
      }
    }

    this.cansMesh.instanceMatrix.needsUpdate = true;
    this.paperMesh.instanceMatrix.needsUpdate = true;
    this.boxMesh.instanceMatrix.needsUpdate = true;
    this.petMesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    this.beltTexture.dispose();
    for (const s of this.textureSets) s.dispose();
  }
}
