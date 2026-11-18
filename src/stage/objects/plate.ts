import * as THREE from "three";
import { createClayMaterial } from "../materials/clay";
import { disposeObject } from "../util/dispose";
import { clamp01 } from "../util/math";

function makeFilletNormalMap(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, 128, 128);

  // 6 alur kulit melintang tipis pada normal map
  for (let i = 1; i <= 6; i++) {
    const x = Math.round((i / 7) * 128);
    ctx.fillStyle = "rgb(98, 128, 250)";
    ctx.fillRect(x - 2, 10, 2, 108);
    ctx.fillStyle = "rgb(158, 128, 250)";
    ctx.fillRect(x, 10, 2, 108);
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Set adegan top-down piring Bab 6 (O-PLATE):
 * piring Lathe, filet elipsoid + normal map 6 alur, garpu, pisau, dan meja gelap 20x20.
 */
export class PlateSet {
  readonly group = new THREE.Group();
  readonly plateRoot = new THREE.Group();
  readonly plateMesh: THREE.Mesh;
  readonly filletMesh: THREE.Mesh;
  readonly forkGroup = new THREE.Group();
  readonly knifeMesh: THREE.Mesh;
  readonly tableMesh: THREE.Mesh;

  private readonly plateMat: THREE.MeshStandardMaterial;
  private readonly filletMat: THREE.MeshStandardMaterial;
  private readonly cutleryMat: THREE.MeshStandardMaterial;
  private readonly tableMat: THREE.MeshStandardMaterial;
  private readonly filletNormalTex: THREE.CanvasTexture | null;

  constructor(parent: THREE.Object3D) {
    this.group.name = "O-PLATE-SET";
    this.plateRoot.name = "O-PLATE-ROOT";
    parent.add(this.group);

    // 1. Piring Lathe (0,0), (1.2,0), (1.45,0.04), (1.6,0.12), (1.6,0.14)
    const lathePoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(1.2, 0.0),
      new THREE.Vector2(1.45, 0.04),
      new THREE.Vector2(1.6, 0.12),
      new THREE.Vector2(1.6, 0.14),
      new THREE.Vector2(1.54, 0.14),
      new THREE.Vector2(1.4, 0.06),
      new THREE.Vector2(1.18, 0.03),
      new THREE.Vector2(0.0, 0.03),
    ];
    const plateGeom = new THREE.LatheGeometry(lathePoints, 40);
    this.plateMat = createClayMaterial({
      color: "#E6EAF2",
      roughness: 0.5,
      transparent: true,
      opacity: 1,
    });
    this.plateMesh = new THREE.Mesh(plateGeom, this.plateMat);
    this.plateMesh.name = "O-PLATE-DISH";

    // 2. Filet elipsoid (1.3, 0.12, 0.6) #C9D3E6 + alur kulit
    const filletGeom = new THREE.SphereGeometry(1, 20, 14);
    filletGeom.scale(1.3, 0.12, 0.6);
    this.filletNormalTex = makeFilletNormalMap();
    this.filletMat = createClayMaterial({
      color: "#C9D3E6",
      roughness: 0.62,
      emissive: "#E6EAF2",
      emissiveIntensity: 0,
      transparent: true,
      opacity: 1,
    });
    if (this.filletNormalTex) {
      this.filletMat.normalMap = this.filletNormalTex;
      this.filletMat.normalScale.set(0.45, 0.45);
    }
    this.filletMesh = new THREE.Mesh(filletGeom, this.filletMat);
    this.filletMesh.name = "O-PLATE-FILLET";
    this.filletMesh.position.set(0, 0.14, 0);

    // 3. Garpu (kanan) & Pisau (kiri)
    this.cutleryMat = createClayMaterial({
      color: "#C9D3E6",
      roughness: 0.45,
      metalness: 0.4,
      transparent: true,
      opacity: 1,
    });

    this.forkGroup.name = "O-PLATE-FORK";
    const forkShaftGeom = new THREE.BoxGeometry(0.1, 0.02, 1.28);
    const forkShaft = new THREE.Mesh(forkShaftGeom, this.cutleryMat);
    forkShaft.position.set(0, 0.02, 0.18);
    const forkHeadGeom = new THREE.BoxGeometry(0.14, 0.02, 0.08);
    const forkHead = new THREE.Mesh(forkHeadGeom, this.cutleryMat);
    forkHead.position.set(0, 0.02, -0.45);
    const tineGeom = new THREE.BoxGeometry(0.018, 0.02, 0.32);
    this.forkGroup.add(forkShaft, forkHead);
    for (let t = 0; t < 4; t++) {
      const tine = new THREE.Mesh(tineGeom, this.cutleryMat);
      tine.position.set(-0.052 + t * 0.035, 0.02, -0.64);
      this.forkGroup.add(tine);
    }
    this.forkGroup.position.set(2.02, 0.02, 0);

    const knifeGeom = new THREE.BoxGeometry(0.14, 0.02, 1.5);
    this.knifeMesh = new THREE.Mesh(knifeGeom, this.cutleryMat);
    this.knifeMesh.name = "O-PLATE-KNIFE";
    this.knifeMesh.position.set(-2.02, 0.02, 0);

    this.plateRoot.add(this.plateMesh, this.filletMesh, this.forkGroup, this.knifeMesh);

    // 4. Meja gelap 20x20 #05080F
    const tableGeom = new THREE.PlaneGeometry(20, 20);
    tableGeom.rotateX(-Math.PI / 2);
    this.tableMat = createClayMaterial({
      color: "#05080F",
      roughness: 0.92,
      transparent: true,
      opacity: 1,
    });
    this.tableMesh = new THREE.Mesh(tableGeom, this.tableMat);
    this.tableMesh.name = "O-PLATE-TABLE";
    this.tableMesh.position.set(0, -0.02, 0);

    this.group.add(this.tableMesh, this.plateRoot);
  }

  setFilletGlow(intensity: number): void {
    this.filletMat.emissiveIntensity = clamp01(intensity) * 0.28;
  }

  setOpacity(opacity: number): void {
    const a = clamp01(opacity);
    this.plateMat.opacity = a;
    this.filletMat.opacity = a;
    this.cutleryMat.opacity = a;
    this.tableMat.opacity = a;
    this.group.visible = a > 0.002;
  }

  dispose(): void {
    this.group.removeFromParent();
    disposeObject(this.group);
    this.filletNormalTex?.dispose();
  }
}
