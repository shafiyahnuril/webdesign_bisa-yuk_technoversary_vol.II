import * as THREE from "three";
import { makeContactShadow } from "../textures/canvas-assets";
import {
  makeBrushedMetalSet,
  makeCeramicGlazeSet,
  makeDarkSlateSet,
  makeSalmonFilletSet,
  type PbrTextureSet,
} from "../textures/pbr-maps";
import { disposeObject } from "../util/dispose";
import { clamp01 } from "../util/math";

function buildOrganicFilletGeometry(): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(1, 24, 14);
  const pos = geom.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Bagian bawah diratakan agar menempel penuh di dasar piring, atas agak membulat seperti potongan loin
    if (y < 0) {
      y *= 0.25;
    } else {
      y = Math.pow(y, 0.85);
    }
    // Sedikit asimetri potongan filet alami (ekor lebih tirus di kanan +X)
    const taper = 1 - Math.max(0, x) * 0.22;
    z *= taper * (1 + 0.08 * Math.sin(x * 3.1));
    x *= 1.28;
    y *= 0.16;
    z *= 0.62;
    pos.setXYZ(i, x, y, z);
  }
  geom.computeVertexNormals();
  return geom;
}

/**
 * Set adegan top-down piring Bab 6 (O-PLATE):
 * piring keramik ivory berglasir, filet salmon berurat myomere + tepi kulit panggang,
 * alat makan stainless sikat + gagang slate, bayangan kontak, dan meja batu slate gelap 20x20.
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
  private readonly skinMat: THREE.MeshStandardMaterial;
  private readonly cutleryMat: THREE.MeshStandardMaterial;
  private readonly handleMat: THREE.MeshStandardMaterial;
  private readonly tableMat: THREE.MeshStandardMaterial;
  private readonly shadowMat: THREE.MeshBasicMaterial;
  private readonly textureSets: PbrTextureSet[] = [];
  private readonly contactShadowTex: THREE.CanvasTexture | null;

  constructor(parent: THREE.Object3D) {
    this.group.name = "O-PLATE-SET";
    this.plateRoot.name = "O-PLATE-ROOT";
    parent.add(this.group);

    // 1. Piring Lathe keramik ivory hangat (diameter luar tetap 3.2)
    const lathePoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(1.18, 0.0),
      new THREE.Vector2(1.45, 0.045),
      new THREE.Vector2(1.6, 0.13),
      new THREE.Vector2(1.6, 0.15),
      new THREE.Vector2(1.53, 0.15),
      new THREE.Vector2(1.38, 0.065),
      new THREE.Vector2(1.14, 0.032),
      new THREE.Vector2(0.0, 0.032),
    ];
    const plateGeom = new THREE.LatheGeometry(lathePoints, 40);
    const ceramicSet = makeCeramicGlazeSet(256);
    this.textureSets.push(ceramicSet);
    this.plateMat = new THREE.MeshStandardMaterial({
      color: "#F3EDE2",
      map: ceramicSet.map ?? null,
      normalMap: ceramicSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughnessMap: ceramicSet.roughnessMap ?? null,
      roughness: 0.34,
      metalness: 0.02,
      envMapIntensity: 0.9,
      transparent: true,
      opacity: 1,
    });
    this.plateMesh = new THREE.Mesh(plateGeom, this.plateMat);
    this.plateMesh.name = "O-PLATE-DISH";
    this.plateMesh.renderOrder = 1;

    // 2. Filet salmon berurat + alas kulit panggang tipis
    const filletGeom = buildOrganicFilletGeometry();
    const filletSet = makeSalmonFilletSet(256);
    this.textureSets.push(filletSet);
    this.filletMat = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      map: filletSet.map ?? null,
      normalMap: filletSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.95, 0.95),
      roughnessMap: filletSet.roughnessMap ?? null,
      roughness: 0.44,
      metalness: 0.02,
      envMapIntensity: 0.85,
      emissive: "#6A8EB0",
      emissiveIntensity: 0,
      transparent: true,
      opacity: 1,
    });
    this.filletMesh = new THREE.Mesh(filletGeom, this.filletMat);
    this.filletMesh.name = "O-PLATE-FILLET";
    this.filletMesh.position.set(0, 0.075, 0);
    this.filletMesh.rotation.y = 0.08;
    this.filletMesh.renderOrder = 2;

    const skinGeom = new THREE.CylinderGeometry(0.98, 1.04, 0.03, 18);
    skinGeom.scale(1.24, 1, 0.56);
    this.skinMat = new THREE.MeshStandardMaterial({
      color: "#3F2B24",
      roughness: 0.78,
      metalness: 0.04,
      transparent: true,
      opacity: 1,
    });
    const skinMesh = new THREE.Mesh(skinGeom, this.skinMat);
    skinMesh.name = "O-PLATE-FILLET-SKIN";
    skinMesh.position.set(0, 0.05, 0);
    skinMesh.rotation.y = 0.08;
    skinMesh.renderOrder = 2;

    // 3. Garpu (kanan) & Pisau (kiri): stainless sikat + gagang dark slate kontras
    const metalSet = makeBrushedMetalSet(256, 1, 2);
    this.textureSets.push(metalSet);
    this.cutleryMat = new THREE.MeshStandardMaterial({
      color: "#9AA7B5",
      map: metalSet.map ?? null,
      normalMap: metalSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughnessMap: metalSet.roughnessMap ?? null,
      roughness: 0.28,
      metalness: 0.86,
      envMapIntensity: 1.25,
      transparent: true,
      opacity: 1,
    });
    this.handleMat = new THREE.MeshStandardMaterial({
      color: "#293442",
      normalMap: metalSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughness: 0.56,
      metalness: 0.18,
      transparent: true,
      opacity: 1,
    });

    this.forkGroup.name = "O-PLATE-FORK";
    const forkShaftGeom = new THREE.BoxGeometry(0.085, 0.022, 0.72);
    const forkShaft = new THREE.Mesh(forkShaftGeom, this.handleMat);
    forkShaft.position.set(0, 0.02, 0.44);
    forkShaft.renderOrder = 1;
    const forkNeckGeom = new THREE.BoxGeometry(0.06, 0.02, 0.52);
    const forkNeck = new THREE.Mesh(forkNeckGeom, this.cutleryMat);
    forkNeck.position.set(0, 0.02, -0.18);
    forkNeck.renderOrder = 1;
    const forkHeadGeom = new THREE.BoxGeometry(0.15, 0.022, 0.08);
    const forkHead = new THREE.Mesh(forkHeadGeom, this.cutleryMat);
    forkHead.position.set(0, 0.02, -0.45);
    forkHead.renderOrder = 1;
    const tineGeom = new THREE.BoxGeometry(0.017, 0.018, 0.34);
    this.forkGroup.add(forkShaft, forkNeck, forkHead);
    for (let t = 0; t < 4; t++) {
      const tine = new THREE.Mesh(tineGeom, this.cutleryMat);
      tine.position.set(-0.052 + t * 0.035, 0.02, -0.65);
      tine.renderOrder = 1;
      this.forkGroup.add(tine);
    }
    this.forkGroup.position.set(2.02, 0.02, 0);

    const bladeGeom = new THREE.BoxGeometry(0.13, 0.018, 0.88);
    this.knifeMesh = new THREE.Mesh(bladeGeom, this.cutleryMat);
    this.knifeMesh.name = "O-PLATE-KNIFE";
    this.knifeMesh.position.set(-2.02, 0.02, -0.34);
    this.knifeMesh.renderOrder = 1;

    const knifeHandleGeom = new THREE.BoxGeometry(0.09, 0.028, 0.7);
    const knifeHandle = new THREE.Mesh(knifeHandleGeom, this.handleMat);
    knifeHandle.name = "O-PLATE-KNIFE-HANDLE";
    knifeHandle.position.set(-2.02, 0.02, 0.44);
    knifeHandle.renderOrder = 1;

    // 4. Bayangan kontak piring di atas meja slate
    this.contactShadowTex = typeof document !== "undefined" ? makeContactShadow() : null;
    const shadowGeom = new THREE.PlaneGeometry(3.85, 3.85);
    shadowGeom.rotateX(-Math.PI / 2);
    this.shadowMat = new THREE.MeshBasicMaterial({
      color: "#02050B",
      map: this.contactShadowTex,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, this.shadowMat);
    shadowMesh.name = "O-PLATE-SHADOW";
    shadowMesh.position.set(0.08, 0.002, 0.06);
    shadowMesh.renderOrder = 0;

    this.plateRoot.add(
      shadowMesh,
      this.plateMesh,
      skinMesh,
      this.filletMesh,
      this.forkGroup,
      this.knifeMesh,
      knifeHandle,
    );

    // 5. Meja slate gelap 20x20 bertekstur tanpa depthWrite agar tidak memotong piring saat naik
    const slateSet = makeDarkSlateSet(256, 5, 5);
    this.textureSets.push(slateSet);
    const tableGeom = new THREE.PlaneGeometry(20, 20);
    tableGeom.rotateX(-Math.PI / 2);
    this.tableMat = new THREE.MeshStandardMaterial({
      color: "#1B2638",
      map: slateSet.map ?? null,
      normalMap: slateSet.normalMap ?? null,
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughnessMap: slateSet.roughnessMap ?? null,
      roughness: 0.78,
      metalness: 0.06,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    this.tableMesh = new THREE.Mesh(tableGeom, this.tableMat);
    this.tableMesh.name = "O-PLATE-TABLE";
    this.tableMesh.position.set(0, -0.02, 0);
    this.tableMesh.renderOrder = -1;

    this.group.add(this.tableMesh, this.plateRoot);
  }

  setFilletGlow(intensity: number): void {
    this.filletMat.emissiveIntensity = clamp01(intensity) * 0.22;
  }

  setTableOpacity(opacity: number): void {
    this.tableMat.opacity = clamp01(opacity);
  }

  setOpacity(opacity: number): void {
    const a = clamp01(opacity);
    this.plateMat.opacity = a;
    this.filletMat.opacity = a;
    this.skinMat.opacity = a;
    this.cutleryMat.opacity = a;
    this.handleMat.opacity = a;
    this.shadowMat.opacity = a * 0.62;
    this.tableMat.opacity = a;
    this.group.visible = a > 0.002;
  }

  dispose(): void {
    this.group.removeFromParent();
    disposeObject(this.group);
    for (const set of this.textureSets) set.dispose();
    this.contactShadowTex?.dispose();
  }
}
