import * as THREE from "three";
import { createClayMaterial } from "../materials/clay";

export const TUMBLER_SPECS = {
  totalHeight: 2.22,
  bodyColor: "#0F8B8D",
  bodyRoughness: 0.55,
  bodyMetalness: 0.1,
  lidColor: "#D9E6D6",
  ringColor: "#E6EAF2",
  plinthRadius: 0.5,
  plinthHeight: 0.25,
  plinthColor: "#E6EEE4",
  desktopX: 14.0,
  portraitX: 13.2,
} as const;

/** Profil lathe 13 titik (r, y) tumbler 500 ml sesuai docs/07 bagian 3.9. */
export const TUMBLER_PROFILE: readonly (readonly [number, number])[] = [
  [0.0, 0.0],
  [0.28, 0.0],
  [0.32, 0.02],
  [0.34, 0.06],
  [0.34, 1.62],
  [0.32, 1.74],
  [0.27, 1.83],
  [0.24, 1.86],
  [0.255, 1.862],
  [0.255, 1.89],
  [0.245, 2.06],
  [0.2, 2.1],
  [0.0, 2.1],
];

export class Tumbler {
  readonly group = new THREE.Group();
  readonly plinthMesh: THREE.Mesh;
  readonly vesselGroup = new THREE.Group();
  readonly bodyMesh: THREE.Mesh;
  readonly lidMesh: THREE.Mesh;
  readonly ringMesh: THREE.Mesh;
  readonly handleMesh: THREE.Mesh;

  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];

  constructor(parent: THREE.Object3D, radialSegments = 48) {
    this.group.name = "O-TUMBLER-PLINTH";
    this.group.position.set(TUMBLER_SPECS.desktopX, 0, 0);

    // O-PLINTH: Cylinder(r 0.5, tinggi 0.25, 48 segmen) #E6EEE4, roughness 0.9
    const plinthGeom = new THREE.CylinderGeometry(
      TUMBLER_SPECS.plinthRadius,
      TUMBLER_SPECS.plinthRadius,
      TUMBLER_SPECS.plinthHeight,
      radialSegments,
    );
    const plinthMat = createClayMaterial({
      color: TUMBLER_SPECS.plinthColor,
      roughness: 0.9,
      metalness: 0,
    });
    this.plinthMesh = new THREE.Mesh(plinthGeom, plinthMat);
    this.plinthMesh.name = "O-PLINTH";
    this.plinthMesh.position.set(0, TUMBLER_SPECS.plinthHeight * 0.5, 0);

    // Tumbler berdiri di y = 0.25 (di atas plinth)
    this.vesselGroup.name = "O-TUMBLER";
    this.vesselGroup.position.set(0, TUMBLER_SPECS.plinthHeight, 0);

    const bodyPoints = TUMBLER_PROFILE.slice(0, 8).map(([r, y]) => new THREE.Vector2(r, y));
    bodyPoints.push(new THREE.Vector2(0, 1.86));
    const bodyGeom = new THREE.LatheGeometry(bodyPoints, radialSegments);
    bodyGeom.computeVertexNormals();
    const bodyMat = createClayMaterial({
      color: TUMBLER_SPECS.bodyColor,
      roughness: TUMBLER_SPECS.bodyRoughness,
      metalness: TUMBLER_SPECS.bodyMetalness,
    });
    this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);

    const lidPoints = [
      new THREE.Vector2(0, 1.862),
      ...TUMBLER_PROFILE.slice(8).map(([r, y]) => new THREE.Vector2(r, y)),
    ];
    const lidGeom = new THREE.LatheGeometry(lidPoints, radialSegments);
    lidGeom.computeVertexNormals();
    const lidMat = createClayMaterial({
      color: TUMBLER_SPECS.lidColor,
      roughness: 0.75,
      metalness: 0,
    });
    this.lidMesh = new THREE.Mesh(lidGeom, lidMat);

    // Cincin bawah y 0.06..0.16 tanpa teks/logo
    const ringGeom = new THREE.CylinderGeometry(0.343, 0.343, 0.1, 32, 1, true);
    const ringMat = createClayMaterial({
      color: TUMBLER_SPECS.ringColor,
      roughness: 0.45,
      metalness: 0.15,
    });
    this.ringMesh = new THREE.Mesh(ringGeom, ringMat);
    this.ringMesh.position.set(0, 0.11, 0);

    // Pegangan tutup: Torus(r 0.11, tabung 0.02) tegak hingga puncak y = 2.22
    const handleGeom = new THREE.TorusGeometry(0.11, 0.02, 10, 24);
    this.handleMesh = new THREE.Mesh(handleGeom, lidMat);
    this.handleMesh.position.set(0, 2.09, 0);

    this.vesselGroup.add(this.bodyMesh, this.lidMesh, this.ringMesh, this.handleMesh);
    this.group.add(this.plinthMesh, this.vesselGroup);

    this.geometries.push(plinthGeom, bodyGeom, lidGeom, ringGeom, handleGeom);
    this.materials.push(plinthMat, bodyMat, lidMat, ringMat);

    parent.add(this.group);
  }

  setPlacementX(x: number): void {
    this.group.position.x = x;
  }

  setTurnAngle(radians: number): void {
    this.vesselGroup.rotation.y = radians;
  }

  reset(): void {
    this.group.visible = true;
    this.group.position.set(TUMBLER_SPECS.desktopX, 0, 0);
    this.vesselGroup.rotation.set(0, 0, 0);
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }
}
