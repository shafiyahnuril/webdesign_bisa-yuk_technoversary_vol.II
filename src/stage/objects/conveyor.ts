import * as THREE from "three";
import { createClayMaterial } from "../materials/clay";
import { makeConveyorBelt } from "../textures/canvas-assets";
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
  const lowColor = new THREE.Color("#1F5F59");
  const highColor = new THREE.Color("#226B63");
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

  private readonly dummy = new THREE.Object3D();
  private compactMode = false;

  constructor(parent: THREE.Object3D, compact = false) {
    this.group.name = "O-CONVEYOR";
    this.compactMode = compact;

    // 1. Dinding belakang + 4 jendela pucat #B9F3C9 (opasitas 0.12)
    const wallGeom = buildBackWallGeometry();
    const wallMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    const wallMesh = new THREE.Mesh(wallGeom, wallMat);
    wallMesh.position.set(0, 2.5, -4.6);
    this.geometries.push(wallGeom);
    this.materials.push(wallMat);

    const winGeom = new THREE.PlaneGeometry(3.8, 4.4);
    const winMat = new THREE.MeshBasicMaterial({
      color: "#B9F3C9",
      transparent: true,
      opacity: 0.12,
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
    this.group.add(wallMesh);

    // 2. Sabuk 18 x 0.4 x 2.4 di y = 0.6 dengan tekstur T-BELT
    this.beltTexture = makeConveyorBelt();
    this.beltTexture.repeat.set(6, 1);
    const beltGeom = new THREE.BoxGeometry(
      CONVEYOR_SPECS.beltLength,
      CONVEYOR_SPECS.beltThickness,
      CONVEYOR_SPECS.beltDepth,
    );
    const beltMat = createClayMaterial({
      color: "#1B4D49",
      map: this.beltTexture,
      roughness: 0.8,
    });
    this.beltMesh = new THREE.Mesh(beltGeom, beltMat);
    this.beltMesh.position.set(0, CONVEYOR_SPECS.beltY, 0);
    this.geometries.push(beltGeom);
    this.materials.push(beltMat);
    this.group.add(this.beltMesh);

    // 3. 14 rol silinder r=0.2
    const rollerGeom = new THREE.CylinderGeometry(
      CONVEYOR_SPECS.rollerRadius,
      CONVEYOR_SPECS.rollerRadius,
      2.46,
      10,
    );
    rollerGeom.rotateX(Math.PI * 0.5);
    const rollerMat = createClayMaterial({ color: "#2A7F78", roughness: 0.72 });
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

    // 4. 3 pemilah (silinder 0.15 x piston 1.2 + corong bawah)
    const pipeGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);
    const pistonGeom = new THREE.BoxGeometry(0.45, 0.38, 1.2);
    const chuteGeom = new THREE.CylinderGeometry(0.75, 0.45, 1.0, 8, 1, true);
    const pusherMat = createClayMaterial({ color: "#9FE6D0", roughness: 0.7 });
    const chuteMat = createClayMaterial({
      color: "#17403D",
      roughness: 0.85,
      side: THREE.DoubleSide,
    });
    this.geometries.push(pipeGeom, pistonGeom, chuteGeom);
    this.materials.push(pusherMat, chuteMat);

    const builtPushers: PusherRig[] = [];
    const pusherXs = [-4.6, -1.8, 0.9];
    for (const px of pusherXs) {
      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0, 0);
      const pipe = new THREE.Mesh(pipeGeom, pusherMat);
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

    // 5. Lorong cuci: Box(4 x 3 x 2.8) transparan #3AA6A3 25%
    const tunnelGeom = new THREE.BoxGeometry(4, 3, 2.8);
    const tunnelMat = createClayMaterial({
      color: "#3AA6A3",
      transparent: true,
      opacity: 0.25,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    tunnelMat.depthWrite = false;
    const tunnelMesh = new THREE.Mesh(tunnelGeom, tunnelMat);
    tunnelMesh.position.set(3.8, 2.1, 0);
    this.geometries.push(tunnelGeom);
    this.materials.push(tunnelMat);
    this.group.add(tunnelMesh);

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
      color: "#E6EAF2",
      size: 0.1,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    this.sprayPoints = new THREE.Points(sprayGeom, sprayMat);
    this.geometries.push(sprayGeom);
    this.materials.push(sprayMat);
    this.group.add(this.sprayPoints);

    // 6. Hopper PET frustum #1B4D49 di ujung kanan + corong masuk kiri
    const hopperGeom = new THREE.CylinderGeometry(1.35, 0.7, 1.7, 10, 1, true);
    const hopperMat = createClayMaterial({
      color: "#1B4D49",
      roughness: 0.78,
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

    // 7. Sampah campuran InstancedMesh total 40 (12 kaleng, 12 kertas, 10 kardus, 6 PET)
    const canGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 10);
    const paperGeom = new THREE.IcosahedronGeometry(0.45, 0);
    const boxGeom = new THREE.BoxGeometry(1.2, 0.9, 0.9);
    const petGeom = buildMiniBottleGeometry(10);

    const canMat = createClayMaterial({ color: "#9FB8C8", roughness: 0.65 });
    const paperMat = createClayMaterial({ color: "#E6EAF2", roughness: 0.85 });
    const boxMat = createClayMaterial({ color: "#A9C9B8", roughness: 0.85 });
    const petMat = createClayMaterial({
      color: "#BFE9FF",
      transparent: true,
      opacity: 0.65,
      roughness: 0.25,
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
    const ghostMat = createClayMaterial({
      color: "#BFE9FF",
      transparent: true,
      opacity: 0.35,
      roughness: 0.3,
    });
    ghostMat.depthWrite = false;
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

  update(t: number): void {
    const progress = clamp01(t);

    // Sabuk bergerak mulus berbasis t
    this.beltTexture.offset.x = -progress * 4.5;

    // Animasi piston pemilah
    for (let i = 0; i < this.pushers.length; i++) {
      const rig = this.pushers[i]!;
      const activePhase = Math.max(0, Math.sin(progress * Math.PI * 6 + i * 1.4));
      rig.piston.position.z = lerp(-0.9, 0.2, activePhase);
    }

    // Semprotan lorong cuci jatuh deterministik
    const activeSpray = this.getActiveSprayCount();
    const posAttr = this.sprayPoints.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < activeSpray; i++) {
      const seed = this.spraySeeds[i]!;
      const cycle = (seed.phase + progress * 3.5) % 1;
      posAttr.setXYZ(i, seed.x, lerp(3.4, 0.85, cycle), seed.z);
    }
    posAttr.needsUpdate = true;

    // Update instanced sampah
    const meshes = [this.cansMesh, this.paperMesh, this.boxMesh, this.petMesh] as const;
    for (const item of this.itemSeeds) {
      const mesh = meshes[item.kind]!;
      if (item.instanceIndex >= mesh.count) continue;

      let x = item.startX + progress * item.speed;
      let y = CONVEYOR_SPECS.beltTopY + (item.kind === 0 ? 0.5 : item.kind === 2 ? 0.45 : 0.36);
      let z = item.z;

      if (item.pushStation >= 0) {
        const stationX = this.pushers[item.pushStation]!.x;
        if (x > stationX) {
          const drop = clamp01((x - stationX) / 1.8);
          z = lerp(item.z, 1.45, drop);
          y = lerp(y, -0.7, drop * drop);
        }
      } else if (x > 8.2) {
        const hopDrop = clamp01((x - 8.2) / 1.2);
        x = Math.min(x, 8.6);
        y = lerp(y, 0.6, hopDrop);
      }

      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(item.kind === 0 ? Math.PI * 0.5 : 0, item.rotY + progress * 0.4, 0);
      this.dummy.updateMatrix();
      mesh.setMatrixAt(item.instanceIndex, this.dummy.matrix);
    }
    for (const m of meshes) {
      m.instanceMatrix.needsUpdate = true;
    }

    // Botol hantu jatuh di t = 0.40..0.56 ke area gelap di bawah
    const fallK = clamp01((progress - 0.38) / 0.22);
    const activeGhosts = this.getActiveGhostCount();
    for (let i = 0; i < this.ghostBottles.length; i++) {
      const ghost = this.ghostBottles[i]!;
      ghost.visible = i < activeGhosts;
      if (!ghost.visible) continue;
      const delay = i * 0.08;
      const localK = clamp01((fallK - delay) / Math.max(0.2, 1 - delay));
      const baseX = -1.2 + i * 0.72 + progress * 2.2;
      ghost.position.set(
        baseX,
        lerp(0.85, -2.9, localK * localK),
        i % 2 === 0 ? 0.65 : -0.5,
      );
      ghost.rotation.set(localK * 0.8, i * 0.9, -localK * 1.4);
    }
  }

  reset(): void {
    this.group.visible = true;
    this.update(0);
  }

  dispose(): void {
    this.group.removeFromParent();
    this.beltTexture.dispose();
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }
}
