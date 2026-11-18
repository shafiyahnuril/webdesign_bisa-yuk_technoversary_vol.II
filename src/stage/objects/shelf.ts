import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createClayMaterial } from "../materials/clay";

export const SHELF_SPECS = {
  width: 26,
  thickness: 0.12,
  depth: 1.4,
  y: 0.7,
  topY: 0.76,
  color: "#BFD2BE",
  legColor: "#9EB69E",
} as const;

export class Shelf {
  readonly group = new THREE.Group();
  readonly plankMesh: THREE.Mesh;

  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];

  constructor(parent: THREE.Object3D) {
    this.group.name = "O-SHELF";

    const plankGeom = new RoundedBoxGeometry(
      SHELF_SPECS.width,
      SHELF_SPECS.thickness,
      SHELF_SPECS.depth,
      2,
      0.04,
    );
    const plankMat = createClayMaterial({ color: SHELF_SPECS.color, roughness: 0.82 });
    this.plankMesh = new THREE.Mesh(plankGeom, plankMat);
    this.plankMesh.position.set(0, SHELF_SPECS.y, 0);

    const legGeom = new RoundedBoxGeometry(0.32, 0.7, 1.1, 2, 0.04);
    const legMat = createClayMaterial({ color: SHELF_SPECS.legColor, roughness: 0.85 });
    const legL = new THREE.Mesh(legGeom, legMat);
    legL.position.set(-10.5, 0.35, 0);
    const legR = new THREE.Mesh(legGeom, legMat);
    legR.position.set(10.5, 0.35, 0);

    const floorGeom = new THREE.PlaneGeometry(54, 24);
    floorGeom.rotateX(-Math.PI * 0.5);
    const floorMat = createClayMaterial({ color: "#CFDDC9", roughness: 0.94 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.position.set(3, 0, 0);

    this.geometries.push(plankGeom, legGeom, floorGeom);
    this.materials.push(plankMat, legMat, floorMat);
    this.group.add(this.plankMesh, legL, legR, floor);

    parent.add(this.group);
  }

  reset(): void {
    this.group.visible = true;
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }
}
