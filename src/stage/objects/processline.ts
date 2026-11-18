import * as THREE from "three";
import { createClayMaterial } from "../materials/clay";
import { makeFabricWeave } from "../textures/fabric";
import { clamp01, lerp, smoothstep } from "../util/math";
import { createRng } from "../util/rng";
import { createToteProduct, type ProductHandle } from "./products";

export type ProcessStationId = "cacah" | "cuci" | "lebur" | "cetak";

export interface ProcessStationSpec {
  readonly id: ProcessStationId;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export const PROCESS_STATIONS: readonly ProcessStationSpec[] = [
  { id: "cacah", label: "01 CACAH", x: 0, y: 2.8, z: 0 },
  { id: "cuci", label: "02 CUCI", x: 6, y: 2.8, z: 0 },
  { id: "lebur", label: "03 LEBUR", x: 12, y: 2.8, z: 0 },
  { id: "cetak", label: "04 CETAK", x: 18, y: 2.8, z: 0 },
];

export const PROCESS_COUNTS = {
  flakesHigh: 400,
  flakesCompact: 150,
  bubblesHigh: 80,
  bubblesCompact: 30,
  filamentsHigh: 60,
  filamentsCompact: 24,
} as const;

function buildMeltRibbonGeometry(): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(2.1, 0.34, 8, 1);
  const pos = geom.getAttribute("position");
  const colors = new Float32Array(pos.count * 3);
  const amber = new THREE.Color("#F6B35A");
  const cream = new THREE.Color("#FBE7C6");
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const u = clamp01((pos.getX(i) + 1.05) / 2.1);
    c.lerpColors(amber, cream, u);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geom;
}

export class ProcessLine {
  readonly group = new THREE.Group();
  readonly furnaceLight: THREE.PointLight;
  readonly tote: ProductHandle;

  private readonly rotorGroup: THREE.Group;
  private readonly flakesMesh: THREE.InstancedMesh;
  private readonly flakeSeeds: readonly { x: number; y: number; z: number; rx: number; ry: number }[];
  private readonly bubblePoints: THREE.Points;
  private readonly bubbleSeeds: readonly { x: number; z: number; phase: number }[];
  private readonly filamentLines: THREE.LineSegments;
  private readonly spoolMesh: THREE.Mesh;
  private readonly fabricTexture: THREE.Texture;
  private readonly fabricMesh: THREE.Mesh;
  private readonly mouthMat: THREE.MeshBasicMaterial;
  private readonly ribbonMat: THREE.MeshBasicMaterial;
  private readonly shimmerMesh: THREE.Mesh;

  private readonly dummy = new THREE.Object3D();
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private compactMode = false;

  constructor(parent: THREE.Object3D, compact = false) {
    this.group.name = "O-PROCESS";
    this.compactMode = compact;

    const metalDark = createClayMaterial({ color: "#1B4D49", roughness: 0.78 });
    const tealAccent = createClayMaterial({ color: "#2A7F78", roughness: 0.72 });
    const glassPanelMat = createClayMaterial({
      color: "#B9F3C9",
      transparent: true,
      opacity: 0.18,
      roughness: 0.3,
    });
    glassPanelMat.depthWrite = false;
    this.materials.push(metalDark, tealAccent, glassPanelMat);

    // ------------------------------------------------------------------
    // 01 CACAH (x = 0)
    // ------------------------------------------------------------------
    const cacahGroup = new THREE.Group();
    cacahGroup.position.set(0, 0, 0);

    const funnelGeom = new THREE.CylinderGeometry(1.1, 0.5, 1.6, 12, 1, true);
    const funnel = new THREE.Mesh(funnelGeom, metalDark);
    funnel.position.set(0, 2.35, 0);

    const panelGeom = new THREE.PlaneGeometry(2.6, 1.5);
    const panel = new THREE.Mesh(panelGeom, glassPanelMat);
    panel.position.set(0, 1.15, 0.95);

    this.rotorGroup = new THREE.Group();
    this.rotorGroup.position.set(0, 1.25, 0);
    const rotorGeom = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 10);
    rotorGeom.rotateX(Math.PI * 0.5);
    const rotorMesh = new THREE.Mesh(rotorGeom, tealAccent);
    const toothGeom = new THREE.BoxGeometry(0.14, 1.18, 1.16);
    for (let i = 0; i < 3; i++) {
      const tooth = new THREE.Mesh(toothGeom, metalDark);
      tooth.rotation.z = (i / 3) * Math.PI;
      this.rotorGroup.add(tooth);
    }
    this.rotorGroup.add(rotorMesh);

    const trayGeom = new THREE.BoxGeometry(2.4, 0.3, 1.6);
    const tray = new THREE.Mesh(trayGeom, metalDark);
    tray.position.set(0, 0.15, 0);

    const flakeGeom = new THREE.PlaneGeometry(0.12, 0.12);
    const flakeMat = createClayMaterial({
      color: "#E6EAF2",
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    this.flakesMesh = new THREE.InstancedMesh(flakeGeom, flakeMat, PROCESS_COUNTS.flakesHigh);

    const rand = createRng(909);
    const builtFlakes: { x: number; y: number; z: number; rx: number; ry: number }[] = [];
    for (let i = 0; i < PROCESS_COUNTS.flakesHigh; i++) {
      builtFlakes.push({
        x: lerp(-0.95, 0.95, rand()),
        y: lerp(0.32, 0.52, rand()),
        z: lerp(-0.62, 0.62, rand()),
        rx: rand() * Math.PI,
        ry: rand() * Math.PI,
      });
    }
    this.flakeSeeds = builtFlakes;

    this.geometries.push(funnelGeom, panelGeom, rotorGeom, toothGeom, trayGeom, flakeGeom);
    this.materials.push(flakeMat);
    cacahGroup.add(funnel, panel, this.rotorGroup, tray, this.flakesMesh);
    this.group.add(cacahGroup);

    // ------------------------------------------------------------------
    // 02 CUCI (x = 6)
    // ------------------------------------------------------------------
    const cuciGroup = new THREE.Group();
    cuciGroup.position.set(6, 0, 0);

    const tankFloorGeom = new THREE.BoxGeometry(3.2, 0.18, 2.0);
    const tankWallFrontGeom = new THREE.BoxGeometry(3.2, 1.4, 0.14);
    const tankWallSideGeom = new THREE.BoxGeometry(0.14, 1.4, 2.0);
    const tankFloor = new THREE.Mesh(tankFloorGeom, metalDark);
    tankFloor.position.set(0, 0.09, 0);
    const wallBack = new THREE.Mesh(tankWallFrontGeom, metalDark);
    wallBack.position.set(0, 0.7, -0.93);
    const wallFront = new THREE.Mesh(tankWallFrontGeom, glassPanelMat);
    wallFront.position.set(0, 0.7, 0.93);
    const wallLeft = new THREE.Mesh(tankWallSideGeom, metalDark);
    wallLeft.position.set(-1.53, 0.7, 0);
    const wallRight = new THREE.Mesh(tankWallSideGeom, metalDark);
    wallRight.position.set(1.53, 0.7, 0);

    const waterGeom = new THREE.BoxGeometry(2.92, 0.84, 1.72);
    const waterMat = createClayMaterial({
      color: "#3AA6A3",
      transparent: true,
      opacity: 0.6,
      roughness: 0.25,
    });
    waterMat.depthWrite = false;
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.position.set(0, 0.62, 0);

    const bubblePositions = new Float32Array(PROCESS_COUNTS.bubblesHigh * 3);
    const builtBubbles: { x: number; z: number; phase: number }[] = [];
    for (let i = 0; i < PROCESS_COUNTS.bubblesHigh; i++) {
      const bx = lerp(-1.3, 1.3, rand());
      const bz = lerp(-0.7, 0.7, rand());
      const phase = rand();
      builtBubbles.push({ x: bx, z: bz, phase });
      bubblePositions[i * 3] = bx;
      bubblePositions[i * 3 + 1] = lerp(0.25, 1.02, phase);
      bubblePositions[i * 3 + 2] = bz;
    }
    this.bubbleSeeds = builtBubbles;
    const bubbleGeom = new THREE.BufferGeometry();
    bubbleGeom.setAttribute("position", new THREE.BufferAttribute(bubblePositions, 3));
    const bubbleMat = new THREE.PointsMaterial({
      color: "#E6EAF2",
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.bubblePoints = new THREE.Points(bubbleGeom, bubbleMat);

    this.geometries.push(tankFloorGeom, tankWallFrontGeom, tankWallSideGeom, waterGeom, bubbleGeom);
    this.materials.push(waterMat, bubbleMat);
    cuciGroup.add(tankFloor, wallBack, wallFront, wallLeft, wallRight, water, this.bubblePoints);
    this.group.add(cuciGroup);

    // ------------------------------------------------------------------
    // 03 LEBUR (x = 12) — Satu-satunya area amber (<= 4% layar)
    // ------------------------------------------------------------------
    const leburGroup = new THREE.Group();
    leburGroup.position.set(12, 0, 0);

    const furnaceGeom = new THREE.BoxGeometry(3, 2.4, 2);
    const furnace = new THREE.Mesh(furnaceGeom, metalDark);
    furnace.position.set(0, 1.2, 0);

    const mouthGeom = new THREE.PlaneGeometry(1.0, 0.7);
    this.mouthMat = new THREE.MeshBasicMaterial({ color: "#F6B35A" });
    const mouth = new THREE.Mesh(mouthGeom, this.mouthMat);
    mouth.position.set(0, 1.15, 1.02);

    this.furnaceLight = new THREE.PointLight("#F6B35A", 2.2, 3.5);
    this.furnaceLight.position.set(0, 1.15, 1.4);

    const extruderGeom = new THREE.CylinderGeometry(0.32, 0.32, 1.2, 10);
    extruderGeom.rotateZ(Math.PI * 0.5);
    const extruder = new THREE.Mesh(extruderGeom, metalDark);
    extruder.position.set(1.9, 1.05, 0);

    const ribbonGeom = buildMeltRibbonGeometry();
    this.ribbonMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    });
    const ribbon = new THREE.Mesh(ribbonGeom, this.ribbonMat);
    ribbon.position.set(3.2, 1.05, 0);

    const shimmerGeom = new THREE.PlaneGeometry(1.4, 0.9);
    const shimmerMat = new THREE.MeshBasicMaterial({
      color: "#FBE7C6",
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    this.shimmerMesh = new THREE.Mesh(shimmerGeom, shimmerMat);
    this.shimmerMesh.position.set(0, 2.65, 0.9);

    this.geometries.push(furnaceGeom, mouthGeom, extruderGeom, ribbonGeom, shimmerGeom);
    this.materials.push(this.mouthMat, this.ribbonMat, shimmerMat);
    leburGroup.add(furnace, mouth, this.furnaceLight, extruder, ribbon, this.shimmerMesh);
    this.group.add(leburGroup);

    // ------------------------------------------------------------------
    // 04 CETAK (x = 18)
    // ------------------------------------------------------------------
    const cetakGroup = new THREE.Group();
    cetakGroup.position.set(18, 0, 0);

    const spinneretGeom = new THREE.BoxGeometry(0.9, 0.5, 0.9);
    const spinneret = new THREE.Mesh(spinneretGeom, metalDark);
    spinneret.position.set(-1.8, 2.0, 0);

    const filamentPositions = new Float32Array(PROCESS_COUNTS.filamentsHigh * 6);
    for (let i = 0; i < PROCESS_COUNTS.filamentsHigh; i++) {
      const u = (i / (PROCESS_COUNTS.filamentsHigh - 1)) * 2 - 1;
      const baseIdx = i * 6;
      filamentPositions[baseIdx] = -1.8 + u * 0.32;
      filamentPositions[baseIdx + 1] = 1.75;
      filamentPositions[baseIdx + 2] = Math.sin(i * 1.7) * 0.25;
      filamentPositions[baseIdx + 3] = -0.8;
      filamentPositions[baseIdx + 4] = 1.05 + u * 0.2;
      filamentPositions[baseIdx + 5] = Math.cos(i * 1.3) * 0.4;
    }
    const filamentGeom = new THREE.BufferGeometry();
    filamentGeom.setAttribute("position", new THREE.BufferAttribute(filamentPositions, 3));
    const filamentMat = new THREE.LineBasicMaterial({ color: "#E6EAF2" });
    this.filamentLines = new THREE.LineSegments(filamentGeom, filamentMat);

    const spoolGeom = new THREE.CylinderGeometry(0.6, 0.6, 1.1, 12);
    spoolGeom.rotateX(Math.PI * 0.5);
    this.spoolMesh = new THREE.Mesh(spoolGeom, tealAccent);
    this.spoolMesh.position.set(-0.7, 1.05, 0);

    this.fabricTexture = makeFabricWeave();
    this.fabricTexture.repeat.set(2, 2);
    const fabricGeom = new THREE.PlaneGeometry(2.4, 1.6);
    fabricGeom.rotateX(-Math.PI * 0.5);
    const fabricMat = createClayMaterial({
      color: "#2A7F78",
      map: this.fabricTexture,
      roughness: 0.85,
      side: THREE.DoubleSide,
    });
    this.fabricMesh = new THREE.Mesh(fabricGeom, fabricMat);
    this.fabricMesh.position.set(0.35, 0.82, 0);

    const tableGeom = new THREE.BoxGeometry(2.4, 0.8, 1.6);
    const table = new THREE.Mesh(tableGeom, metalDark);
    table.position.set(1.2, 0.4, 0);

    this.tote = createToteProduct();
    this.tote.group.position.set(1.2, 0.8, 0);
    this.tote.group.scale.setScalar(0.5);

    this.geometries.push(spinneretGeom, filamentGeom, spoolGeom, fabricGeom, tableGeom);
    this.materials.push(filamentMat, fabricMat);
    cetakGroup.add(spinneret, this.filamentLines, this.spoolMesh, this.fabricMesh, table, this.tote.group);
    this.group.add(cetakGroup);

    parent.add(this.group);
    this.setCompactMode(compact);
    this.update(0);
  }

  setCompactMode(compact: boolean): void {
    this.compactMode = compact;
    this.flakesMesh.count = compact ? PROCESS_COUNTS.flakesCompact : PROCESS_COUNTS.flakesHigh;
    this.bubblePoints.geometry.setDrawRange(
      0,
      compact ? PROCESS_COUNTS.bubblesCompact : PROCESS_COUNTS.bubblesHigh,
    );
    this.filamentLines.geometry.setDrawRange(
      0,
      (compact ? PROCESS_COUNTS.filamentsCompact : PROCESS_COUNTS.filamentsHigh) * 2,
    );
  }

  getFlakeCount(): number {
    return this.flakesMesh.count;
  }

  getBubbleCount(): number {
    return this.compactMode ? PROCESS_COUNTS.bubblesCompact : PROCESS_COUNTS.bubblesHigh;
  }

  getFilamentCount(): number {
    return this.compactMode ? PROCESS_COUNTS.filamentsCompact : PROCESS_COUNTS.filamentsHigh;
  }

  update(t: number): void {
    const progress = clamp01(t);

    // 01 Cacah: putar rotor & pancarkan serpihan setelah botol masuk
    this.rotorGroup.rotation.z = -progress * Math.PI * 10;
    const flakeReveal = smoothstep(0.06, 0.22, progress);
    for (let i = 0; i < this.flakesMesh.count; i++) {
      const s = this.flakeSeeds[i]!;
      const drop = clamp01((flakeReveal * 1.3 - (i % 10) * 0.03));
      this.dummy.position.set(s.x, lerp(1.2, s.y, drop), s.z);
      this.dummy.rotation.set(s.rx + progress * 2, s.ry, 0);
      this.dummy.scale.setScalar(drop > 0.02 ? 1 : 0.001);
      this.dummy.updateMatrix();
      this.flakesMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.flakesMesh.instanceMatrix.needsUpdate = true;

    // 02 Cuci: gelembung naik di tangki
    const activeBubbles = this.getBubbleCount();
    const bAttr = this.bubblePoints.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < activeBubbles; i++) {
      const b = this.bubbleSeeds[i]!;
      const yCycle = (b.phase + progress * 4) % 1;
      bAttr.setXYZ(i, b.x, lerp(0.24, 1.02, yCycle), b.z);
    }
    bAttr.needsUpdate = true;

    // 03 Lebur: puncak amber di t = 0.5
    const furnacePeak = Math.sin(clamp01((progress - 0.34) / 0.34) * Math.PI);
    const activeGlow = progress >= 0.34 && progress <= 0.68 ? furnacePeak : 0.25;
    this.furnaceLight.intensity = lerp(0.6, 2.2, activeGlow);
    this.shimmerMesh.position.y = 2.65 + Math.sin(progress * 24) * 0.04;

    // 04 Cetak: gulungan berputar, kain mengalir, tote terbentuk t=0.66..0.86 lalu maju
    this.spoolMesh.rotation.z = -progress * Math.PI * 6;
    this.fabricTexture.offset.x = -progress * 3;
    const toteGrow = smoothstep(0.66, 0.86, progress);
    const toteScale = lerp(0.01, 0.52, toteGrow);
    this.tote.group.scale.setScalar(toteScale);
    this.tote.group.visible = progress >= 0.64;
    this.tote.group.position.set(1.2, 0.8, lerp(0, 0.55, smoothstep(0.86, 1.0, progress)));
  }

  reset(): void {
    this.group.visible = true;
    this.tote.reset();
    this.update(0);
  }

  dispose(): void {
    this.group.removeFromParent();
    this.tote.dispose();
    this.fabricTexture.dispose();
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }
}
