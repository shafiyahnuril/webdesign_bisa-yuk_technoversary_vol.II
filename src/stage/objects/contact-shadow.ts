import * as THREE from "three";
import { makeContactShadow } from "../textures/canvas-assets";

const DEFAULT_OPACITY = 0.35;
const DEFAULT_SCALE = 1.35;
const DEFAULT_Y = 0.002;

/**
 * O-SHADOW. Plane bayangan kontak radial prosedural (tanpa shadow map).
 */
export class ContactShadow {
  readonly group = new THREE.Group();
  readonly mesh: THREE.Mesh;
  private readonly geometry: THREE.PlaneGeometry;
  private readonly material: THREE.MeshBasicMaterial;
  private readonly texture: THREE.CanvasTexture;

  constructor(parent?: THREE.Object3D) {
    this.group.name = "O-SHADOW";
    this.texture = makeContactShadow();
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.geometry.rotateX(-Math.PI / 2);

    this.material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      map: this.texture,
      transparent: true,
      opacity: DEFAULT_OPACITY,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "ContactShadowPlane";
    this.group.add(this.mesh);
    if (parent) parent.add(this.group);
    this.reset();
  }

  setPosition(x: number, y = DEFAULT_Y, z = 0): void {
    this.group.position.set(x, y, z);
  }

  setScale(x: number, z = x): void {
    this.group.scale.set(x, 1, z);
  }

  setOpacity(opacity: number): void {
    this.material.opacity = opacity;
    this.group.visible = opacity > 0.001;
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  reset(): void {
    this.group.visible = true;
    this.group.position.set(0, DEFAULT_Y, 0);
    this.group.scale.set(DEFAULT_SCALE, 1, DEFAULT_SCALE);
    this.material.opacity = DEFAULT_OPACITY;
  }

  dispose(): void {
    this.group.removeFromParent();
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
