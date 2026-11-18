import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  makeBrushedMetalSet,
  makeDarkSlateSet,
  makeWoodGrainSet,
  type PbrTextureSet,
} from "../textures/pbr-maps";

export const SHELF_SPECS = {
  width: 26,
  thickness: 0.12,
  depth: 1.4,
  y: 0.7,
  topY: 0.76,
  color: "#B49675",
  legColor: "#2C3B40",
} as const;

export class Shelf {
  readonly group = new THREE.Group();
  readonly plankMesh: THREE.Mesh;

  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly textureSets: PbrTextureSet[] = [];

  constructor(parent: THREE.Object3D) {
    this.group.name = "O-SHELF";

    const woodSet = makeWoodGrainSet(256, 6, 1);
    const metalSet = makeBrushedMetalSet(256, 1, 1);
    const floorSet = makeDarkSlateSet(256, 8, 4);
    this.textureSets.push(woodSet, metalSet, floorSet);

    const plankGeom = new RoundedBoxGeometry(
      SHELF_SPECS.width,
      SHELF_SPECS.thickness,
      SHELF_SPECS.depth,
      2,
      0.04,
    );
    const plankMat = new THREE.MeshStandardMaterial({
      color: SHELF_SPECS.color,
      map: woodSet.map ?? null,
      normalMap: woodSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughnessMap: woodSet.roughnessMap ?? null,
      roughness: 0.62,
      metalness: 0.02,
    });
    this.plankMesh = new THREE.Mesh(plankGeom, plankMat);
    this.plankMesh.position.set(0, SHELF_SPECS.y, 0);

    const legGeom = new RoundedBoxGeometry(0.32, 0.7, 1.1, 2, 0.04);
    const legMat = new THREE.MeshStandardMaterial({
      color: SHELF_SPECS.legColor,
      normalMap: metalSet.normalMap ?? null,
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.38,
      metalness: 0.74,
    });
    const legL = new THREE.Mesh(legGeom, legMat);
    legL.position.set(-10.5, 0.35, 0);
    const legC = new THREE.Mesh(legGeom, legMat);
    legC.position.set(0, 0.35, 0);
    const legR = new THREE.Mesh(legGeom, legMat);
    legR.position.set(10.5, 0.35, 0);

    const floorGeom = new THREE.PlaneGeometry(54, 24);
    floorGeom.rotateX(-Math.PI * 0.5);
    const floorMat = new THREE.MeshStandardMaterial({
      color: "#8BA396",
      map: floorSet.map ?? null,
      normalMap: floorSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughnessMap: floorSet.roughnessMap ?? null,
      roughness: 0.88,
      metalness: 0.02,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.position.set(3, 0, 0);

    this.geometries.push(plankGeom, legGeom, floorGeom);
    this.materials.push(plankMat, legMat, floorMat);
    this.group.add(this.plankMesh, legL, legC, legR, floor);

    parent.add(this.group);
  }

  reset(): void {
    this.group.visible = true;
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    for (const s of this.textureSets) s.dispose();
  }
}
