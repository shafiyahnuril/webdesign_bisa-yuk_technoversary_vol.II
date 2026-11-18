import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createClayMaterial } from "../materials/clay";
import { makeBinLabel, type BinLabel } from "../textures/label";
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
  PLASTIK: { kind: "PLASTIK", x: -2.0, bodyColor: "#2A7F78", lidColor: "#9FE6D0" },
  KERTAS: { kind: "KERTAS", x: -0.1, bodyColor: "#2B6C8A", lidColor: "#7FB8D6" },
  ORGANIK: { kind: "ORGANIK", x: 1.8, bodyColor: "#2E7D5B", lidColor: "#8FD6A0" },
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

  constructor(parent: THREE.Object3D) {
    this.group.name = "O-BINS";

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
    const openingGeom = new THREE.PlaneGeometry(1.18, 0.88);
    openingGeom.rotateX(-Math.PI * 0.5);
    const labelGeom = new THREE.PlaneGeometry(
      BIN_DIMENSIONS.labelWidth,
      BIN_DIMENSIONS.labelHeight,
    );
    this.geometries.push(bodyGeom, lidGeom, openingGeom, labelGeom);

    const interiorMat = createClayMaterial({ color: "#0C222A", roughness: 0.92 });
    this.materials.push(interiorMat);

    const buildOne = (spec: BinSpec): BinInstance => {
      const root = new THREE.Group();
      root.name = `Bin_${spec.kind}`;
      root.position.set(spec.x, 0, 0);

      const bodyMat = createClayMaterial({ color: spec.bodyColor, roughness: 0.78 });
      const lidMat = createClayMaterial({ color: spec.lidColor, roughness: 0.74 });
      const labelTex = makeBinLabel(spec.kind);
      const labelMat = createClayMaterial({
        color: "#FFFFFF",
        map: labelTex,
        roughness: 0.7,
      });
      this.materials.push(bodyMat, lidMat, labelMat);
      this.textures.push(labelTex);

      const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
      bodyMesh.position.y = BIN_DIMENSIONS.height * 0.5;

      // Bukaan gelap di atas badan agar terlihat jelas saat tutup terbuka
      const openingMesh = new THREE.Mesh(openingGeom, interiorMat);
      openingMesh.position.y = BIN_DIMENSIONS.height + 0.004;

      // Engsel di tepi belakang (-Z)
      const lidPivot = new THREE.Group();
      lidPivot.name = `BinLidPivot_${spec.kind}`;
      lidPivot.position.set(0, BIN_DIMENSIONS.height, -BIN_DIMENSIONS.lidDepth * 0.5);

      const lidMesh = new THREE.Mesh(lidGeom, lidMat);
      lidMesh.position.set(0, BIN_DIMENSIONS.lidHeight * 0.5, BIN_DIMENSIONS.lidDepth * 0.5);
      lidPivot.add(lidMesh);

      const labelMesh = new THREE.Mesh(labelGeom, labelMat);
      labelMesh.position.set(0, 1.45, BIN_DIMENSIONS.depth * 0.5 + 0.008);

      root.add(bodyMesh, openingMesh, lidPivot, labelMesh);
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
  }
}
