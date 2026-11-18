import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { makeContactShadow } from "../textures/canvas-assets";
import { makeBinLabel, type BinLabel } from "../textures/label";
import {
  makeBrushedMetalSet,
  makePolymerSurfaceSet,
  type PbrTextureSet,
} from "../textures/pbr-maps";
import { clamp01, degToRad } from "../util/math";

export interface BinSpec {
  readonly kind: BinLabel;
  readonly x: number;
  readonly bodyColor: string;
  readonly lidColor: string;
}

export const BIN_DIMENSIONS = {
  width: 1.5,
  height: 2.4,
  depth: 1.2,
  radius: 0.08,
  lidWidth: 1.56,
  lidHeight: 0.14,
  lidDepth: 1.26,
  labelWidth: 1.1,
  labelHeight: 0.28,
  openAngleRad: -degToRad(70),
} as const;

export const BIN_SPECS: Record<BinLabel, BinSpec> = {
  PLASTIK: { kind: "PLASTIK", x: -2.0, bodyColor: "#1F746D", lidColor: "#78CCB4" },
  KERTAS: { kind: "KERTAS", x: -0.1, bodyColor: "#236080", lidColor: "#6BA8C9" },
  ORGANIK: { kind: "ORGANIK", x: 1.8, bodyColor: "#266E4F", lidColor: "#7CC48F" },
};

export interface BinInstance {
  readonly kind: BinLabel;
  readonly root: THREE.Group;
  readonly bodyMesh: THREE.Mesh;
  readonly lidPivot: THREE.Group;
  readonly lidMesh: THREE.Mesh;
  readonly labelMesh: THREE.Mesh;
}

export class Bins {
  readonly group = new THREE.Group();

  private readonly instances: Record<BinLabel, BinInstance>;
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly textures: THREE.Texture[] = [];
  private readonly textureSets: PbrTextureSet[] = [];

  constructor(parent: THREE.Object3D) {
    this.group.name = "O-BINS";

    const polymerSet = makePolymerSurfaceSet(256, 2, 2);
    const metalSet = makeBrushedMetalSet(256, 1, 1);
    this.textureSets.push(polymerSet, metalSet);

    const shadowTex = typeof document !== "undefined" ? makeContactShadow() : null;
    if (shadowTex) this.textures.push(shadowTex);

    const bodyGeom = new RoundedBoxGeometry(
      BIN_DIMENSIONS.width,
      BIN_DIMENSIONS.height,
      BIN_DIMENSIONS.depth,
      2,
      BIN_DIMENSIONS.radius,
    );
    const lidGeom = new RoundedBoxGeometry(
      BIN_DIMENSIONS.lidWidth,
      BIN_DIMENSIONS.lidHeight,
      BIN_DIMENSIONS.lidDepth,
      2,
      0.04,
    );
    const rimBandGeom = new THREE.BoxGeometry(
      BIN_DIMENSIONS.width + 0.04,
      0.1,
      BIN_DIMENSIONS.depth + 0.04,
    );
    const hingeGeom = new THREE.BoxGeometry(0.95, 0.08, 0.08);
    const pedalGeom = new THREE.BoxGeometry(0.42, 0.06, 0.14);
    const openingGeom = new THREE.PlaneGeometry(1.18, 0.88);
    openingGeom.rotateX(-Math.PI * 0.5);
    const labelGeom = new THREE.PlaneGeometry(
      BIN_DIMENSIONS.labelWidth,
      BIN_DIMENSIONS.labelHeight,
    );
    const shadowGeom = new THREE.PlaneGeometry(2.3, 1.9);
    shadowGeom.rotateX(-Math.PI * 0.5);
    this.geometries.push(
      bodyGeom,
      lidGeom,
      rimBandGeom,
      hingeGeom,
      pedalGeom,
      openingGeom,
      labelGeom,
      shadowGeom,
    );

    const interiorMat = new THREE.MeshStandardMaterial({
      color: "#091820",
      roughness: 0.92,
      metalness: 0,
    });
    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: "#1B2830",
      normalMap: metalSet.normalMap ?? null,
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.36,
      metalness: 0.72,
    });
    const shadowMat = new THREE.MeshBasicMaterial({
      color: "#02060B",
      map: shadowTex,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.materials.push(interiorMat, darkTrimMat, shadowMat);

    const buildOne = (spec: BinSpec): BinInstance => {
      const root = new THREE.Group();
      root.name = `Bin_${spec.kind}`;
      root.position.set(spec.x, 0, 0);

      const bodyMat = new THREE.MeshStandardMaterial({
        color: spec.bodyColor,
        normalMap: polymerSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.35, 0.35),
        roughnessMap: polymerSet.roughnessMap ?? null,
        roughness: 0.46,
        metalness: 0.04,
        envMapIntensity: 0.95,
      });
      const lidMat = new THREE.MeshStandardMaterial({
        color: spec.lidColor,
        normalMap: polymerSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.28, 0.28),
        roughnessMap: polymerSet.roughnessMap ?? null,
        roughness: 0.38,
        metalness: 0.05,
        envMapIntensity: 1.05,
      });
      const labelTex = makeBinLabel(spec.kind);
      const labelMat = new THREE.MeshStandardMaterial({
        color: "#FFFFFF",
        map: labelTex,
        roughness: 0.52,
        metalness: 0.02,
      });
      this.materials.push(bodyMat, lidMat, labelMat);
      this.textures.push(labelTex);

      const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
      shadowMesh.position.set(0, 0.002, 0.04);

      const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
      bodyMesh.position.y = BIN_DIMENSIONS.height * 0.5;

      const rimBand = new THREE.Mesh(rimBandGeom, darkTrimMat);
      rimBand.position.y = BIN_DIMENSIONS.height - 0.06;

      const pedal = new THREE.Mesh(pedalGeom, darkTrimMat);
      pedal.position.set(0, 0.05, BIN_DIMENSIONS.depth * 0.5 + 0.06);

      // Bukaan gelap di atas badan agar terlihat jelas saat tutup terbuka
      const openingMesh = new THREE.Mesh(openingGeom, interiorMat);
      openingMesh.position.y = BIN_DIMENSIONS.height + 0.004;

      // Engsel metal di tepi belakang (-Z)
      const lidPivot = new THREE.Group();
      lidPivot.name = `BinLidPivot_${spec.kind}`;
      lidPivot.position.set(0, BIN_DIMENSIONS.height, -BIN_DIMENSIONS.lidDepth * 0.5);

      const lidMesh = new THREE.Mesh(lidGeom, lidMat);
      lidMesh.position.set(0, BIN_DIMENSIONS.lidHeight * 0.5, BIN_DIMENSIONS.lidDepth * 0.5);
      const hingeMesh = new THREE.Mesh(hingeGeom, darkTrimMat);
      hingeMesh.position.set(0, 0.02, 0.03);
      lidPivot.add(lidMesh, hingeMesh);

      const labelMesh = new THREE.Mesh(labelGeom, labelMat);
      labelMesh.position.set(0, 1.45, BIN_DIMENSIONS.depth * 0.5 + 0.008);

      root.add(shadowMesh, bodyMesh, rimBand, pedal, openingMesh, lidPivot, labelMesh);
      this.group.add(root);

      return { kind: spec.kind, root, bodyMesh, lidPivot, lidMesh, labelMesh };
    };

    this.instances = {
      PLASTIK: buildOne(BIN_SPECS.PLASTIK),
      KERTAS: buildOne(BIN_SPECS.KERTAS),
      ORGANIK: buildOne(BIN_SPECS.ORGANIK),
    };

    parent.add(this.group);
    this.reset();
  }

  getBin(kind: BinLabel): BinInstance {
    return this.instances[kind];
  }

  setLidOpen(kind: BinLabel, open01: number): void {
    this.instances[kind].lidPivot.rotation.x = BIN_DIMENSIONS.openAngleRad * clamp01(open01);
  }

  setOffsetY(y: number): void {
    this.group.position.y = y;
  }

  reset(): void {
    this.group.visible = true;
    this.group.position.set(0, 0, 0);
    this.setLidOpen("PLASTIK", 0);
    this.setLidOpen("KERTAS", 0);
    this.setLidOpen("ORGANIK", 0);
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    for (const t of this.textures) t.dispose();
    for (const s of this.textureSets) s.dispose();
  }
}
