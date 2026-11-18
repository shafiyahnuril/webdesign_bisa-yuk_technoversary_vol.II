import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { BuoyancyController } from "./buoyancy";
import { degToRad } from "./math";

describe("BuoyancyController", () => {
  const baseQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.4, 1.35));

  it("melakukan snap deterministik saat inisialisasi, dt <= 0, atau loncatan besar", () => {
    const ctrl = new BuoyancyController();
    const normal = new THREE.Vector3(0.05, 0.998, -0.03).normalize();

    const p0 = ctrl.step({
      t: 0.25,
      dt: 1 / 60,
      x: -2,
      z: 0.2,
      waterY: 0.1,
      waterNormal: normal,
      baseQuat,
      draft: 0.12,
    });
    expect(p0.snapped).toBe(true);
    expect(p0.y).toBeCloseTo(-0.02, 5);
    expect(p0.vy).toBe(0);

    // Gerak kecil dengan dt > 0 memakai inersia (tidak snap)
    const p1 = ctrl.step({
      t: 0.252,
      dt: 1 / 60,
      x: -1.98,
      z: 0.2,
      waterY: 0.18,
      waterNormal: normal,
      baseQuat,
      draft: 0.12,
    });
    expect(p1.snapped).toBe(false);
    expect(p1.y).toBeGreaterThan(p0.y);
    expect(p1.y).toBeLessThan(0.18 - 0.12);

    // Loncatan DEV / loop (mis. t = 0.252 -> 0.85) harus reset & snap deterministik
    const pJump = ctrl.step({
      t: 0.85,
      dt: 1 / 60,
      x: 4.0,
      z: 0.2,
      waterY: -0.04,
      waterNormal: normal,
      baseQuat,
      draft: 0.12,
    });
    expect(pJump.snapped).toBe(true);
    expect(pJump.y).toBeCloseTo(-0.16, 5);
    expect(pJump.vy).toBe(0);

    // dt = 0 harus selalu snap deterministik ke ekuilibrium
    const pDtZero = ctrl.step({
      t: 0.851,
      dt: 0,
      x: 4.01,
      z: 0.2,
      waterY: 0.05,
      waterNormal: normal,
      baseQuat,
      draft: 0.12,
    });
    expect(pDtZero.snapped).toBe(true);
    expect(pDtZero.y).toBeCloseTo(0.05 - 0.12, 5);
    expect(pDtZero.vy).toBe(0);

    ctrl.reset();
    expect(ctrl.isInitialized()).toBe(false);
  });

  it("membatasi kemiringan normal gelombang dalam ±5° dari baseQuat dan mencegah y menembus ombak", () => {
    const ctrl = new BuoyancyController();
    // Normal sangat miring ~28° (di luar batas ±5°)
    const steepNormal = new THREE.Vector3(0.45, 0.88, 0.14).normalize();
    const maxTilt = degToRad(5.0);

    let y = 0;
    let maxAngleFromBase = 0;
    for (let i = 0; i < 180; i++) {
      const t = 0.2 + i * 0.001;
      const waterY = Math.sin(i * 0.08) * 0.25;
      const pose = ctrl.step({
        t,
        dt: 1 / 60,
        x: -1 + i * 0.01,
        z: 0.15,
        waterY,
        waterNormal: steepNormal,
        baseQuat,
        draft: 0.1,
        maxSubmerge: 0.14,
        maxTiltRad: maxTilt,
      });
      y = pose.y;
      expect(y).toBeGreaterThanOrEqual(waterY - 0.14 - 1e-6);
      const angle = pose.quat.angleTo(baseQuat);
      maxAngleFromBase = Math.max(maxAngleFromBase, angle);
    }

    expect(maxAngleFromBase).toBeLessThanOrEqual(maxTilt + 1e-4);
    expect(maxAngleFromBase).toBeGreaterThan(degToRad(4.0));
  });

  it("menjaga delta posisi dan kuaternion tetap teredam dan halus pada 120Hz dan 60Hz", () => {
    for (const hz of [120, 60] as const) {
      const dt = 1 / hz;
      const ctrl = new BuoyancyController();
      const prevPos = { y: 0 };
      const prevQuat = new THREE.Quaternion();
      let maxDy = 0;
      let maxDQuat = 0;

      for (let i = 0; i < hz * 2; i++) {
        const t = 0.15 + i * (0.002 * (60 / hz));
        const time = i * dt * 0.65;
        const waterY = Math.sin(time * 2.1) * 0.12;
        const normal = new THREE.Vector3(
          Math.sin(time * 1.7) * 0.18,
          1.0,
          Math.cos(time * 1.3) * 0.12,
        ).normalize();
        const stepBase = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, t * 1.1, 1.38));

        const pose = ctrl.step({
          t,
          dt,
          x: -0.3 + i * 0.005,
          z: 0.15,
          waterY,
          waterNormal: normal,
          baseQuat: stepBase,
          draft: 0.1,
          maxSubmerge: 0.14,
        });

        if (i > 0) {
          maxDy = Math.max(maxDy, Math.abs(pose.y - prevPos.y));
          maxDQuat = Math.max(maxDQuat, pose.quat.angleTo(prevQuat));
        }
        prevPos.y = pose.y;
        prevQuat.copy(pose.quat);
      }

      expect(maxDy).toBeLessThan(0.015);
      expect(maxDQuat).toBeLessThan(degToRad(1.2));
    }
  });
});
