import * as THREE from "three";
import type { QualityConfig } from "../quality";
import {
  makeBrushedMetalSet,
  makeCeramicGlazeSet,
  makePowderCoatSet,
  type PbrTextureSet,
} from "../textures/pbr-maps";

export const TUMBLER_SPECS = {
  totalHeight: 2.22,
  bodyColor: "#0F8B8D",
  bodyRoughness: 0.55,
  bodyMetalness: 0.1,
  lidColor: "#1D2B33",
  ringColor: "#C8D5DE",
  plinthRadius: 0.5,
  plinthHeight: 0.25,
  plinthColor: "#DCE4D9",
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

function createPlinthGeometry(radialSegments: number): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(
    TUMBLER_SPECS.plinthRadius,
    TUMBLER_SPECS.plinthRadius,
    TUMBLER_SPECS.plinthHeight,
    radialSegments,
  );
}

function createBodyGeometry(radialSegments: number): THREE.BufferGeometry {
  const bodyPoints = TUMBLER_PROFILE.slice(0, 8).map(([r, y]) => new THREE.Vector2(r, y));
  bodyPoints.push(new THREE.Vector2(0, 1.86));
  const geom = new THREE.LatheGeometry(bodyPoints, radialSegments);
  geom.computeVertexNormals();
  return geom;
}

function createLidGeometry(radialSegments: number): THREE.BufferGeometry {
  const lidPoints = [
    new THREE.Vector2(0, 1.862),
    ...TUMBLER_PROFILE.slice(8).map(([r, y]) => new THREE.Vector2(r, y)),
  ];
  const geom = new THREE.LatheGeometry(lidPoints, radialSegments);
  geom.computeVertexNormals();
  return geom;
}

export class Tumbler {
  readonly group = new THREE.Group();
  readonly plinthMesh: THREE.Mesh;
  readonly vesselGroup = new THREE.Group();
  readonly bodyMesh: THREE.Mesh;
  readonly lidMesh: THREE.Mesh;
  readonly ringMesh: THREE.Mesh;
  readonly handleMesh: THREE.Mesh;

  private radialSegments: number;
  private readonly ringGeometry: THREE.BufferGeometry;
  private readonly handleGeometry: THREE.BufferGeometry;
  private readonly materials: THREE.Material[] = [];
  private readonly textureSets: PbrTextureSet[] = [];

  constructor(parent: THREE.Object3D, radialSegments = 48) {
    this.radialSegments = radialSegments;
    this.group.name = "O-TUMBLER-PLINTH";
    this.group.position.set(TUMBLER_SPECS.desktopX, 0, 0);

    const powderSet = makePowderCoatSet(256);
    const metalSet = makeBrushedMetalSet(256, 1, 1);
    const stoneSet = makeCeramicGlazeSet(256);
    this.textureSets.push(powderSet, metalSet, stoneSet);

    // O-PLINTH: batu kapur matte berglasir ringan
    const plinthGeom = createPlinthGeometry(radialSegments);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: TUMBLER_SPECS.plinthColor,
      map: stoneSet.map ?? null,
      normalMap: stoneSet.normalMap ?? null,
      roughnessMap: stoneSet.roughnessMap ?? null,
      roughness: 0.78,
      metalness: 0.02,
    });
    this.plinthMesh = new THREE.Mesh(plinthGeom, plinthMat);
    this.plinthMesh.name = "O-PLINTH";
    this.plinthMesh.position.set(0, TUMBLER_SPECS.plinthHeight * 0.5, 0);

    // Tumbler berdiri di y = 0.25 (di atas plinth)
    this.vesselGroup.name = "O-TUMBLER";
    this.vesselGroup.position.set(0, TUMBLER_SPECS.plinthHeight, 0);

    // Badan teal powder-coat matte (map tetap null sesuai kontrak tumbler.test.ts)
    const bodyGeom = createBodyGeometry(radialSegments);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: TUMBLER_SPECS.bodyColor,
      normalMap: powderSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughnessMap: powderSet.roughnessMap ?? null,
      roughness: TUMBLER_SPECS.bodyRoughness,
      metalness: TUMBLER_SPECS.bodyMetalness,
      envMapIntensity: 1.05,
    });
    this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);

    // Tutup & pegangan dark anodized metal kontras
    const lidGeom = createLidGeometry(radialSegments);
    const lidMat = new THREE.MeshStandardMaterial({
      color: TUMBLER_SPECS.lidColor,
      normalMap: metalSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.28,
      metalness: 0.82,
      envMapIntensity: 1.25,
    });
    this.lidMesh = new THREE.Mesh(lidGeom, lidMat);

    // Cincin stainless sikat bawah y 0.06..0.16
    this.ringGeometry = new THREE.CylinderGeometry(0.343, 0.343, 0.1, 32, 1, true);
    const ringMat = new THREE.MeshStandardMaterial({
      color: TUMBLER_SPECS.ringColor,
      normalMap: metalSet.normalMap ?? null,
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.22,
      metalness: 0.9,
      envMapIntensity: 1.35,
    });
    this.ringMesh = new THREE.Mesh(this.ringGeometry, ringMat);
    this.ringMesh.position.set(0, 0.11, 0);

    // Pegangan tutup: Torus(r 0.11, tabung 0.02) tegak hingga puncak y = 2.22
    this.handleGeometry = new THREE.TorusGeometry(0.11, 0.02, 10, 24);
    this.handleMesh = new THREE.Mesh(this.handleGeometry, lidMat);
    this.handleMesh.position.set(0, 2.09, 0);

    this.vesselGroup.add(this.bodyMesh, this.lidMesh, this.ringMesh, this.handleMesh);
    this.group.add(this.plinthMesh, this.vesselGroup);

    this.materials.push(plinthMat, bodyMat, lidMat, ringMat);

    parent.add(this.group);
  }

  setQuality(config: QualityConfig): void {
    const nextSegments = config.tier === "low" ? 24 : 48;
    if (this.radialSegments === nextSegments) return;
    this.radialSegments = nextSegments;

    this.plinthMesh.geometry.dispose();
    this.plinthMesh.geometry = createPlinthGeometry(nextSegments);

    this.bodyMesh.geometry.dispose();
    this.bodyMesh.geometry = createBodyGeometry(nextSegments);

    this.lidMesh.geometry.dispose();
    this.lidMesh.geometry = createLidGeometry(nextSegments);
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
    this.plinthMesh.geometry.dispose();
    this.bodyMesh.geometry.dispose();
    this.lidMesh.geometry.dispose();
    this.ringGeometry.dispose();
    this.handleGeometry.dispose();
    for (const m of this.materials) m.dispose();
    for (const s of this.textureSets) s.dispose();
  }
}
