import { ORDER, STARTS, type SegId } from "@/engine/timeline";
import type { StageContext } from "./stage";
import { clamp01 } from "./util/math";

export interface Scene {
  readonly id: SegId;
  build(ctx: StageContext): void | Promise<void>;
  enter(): void;
  update(t: number, p: number, dt: number): void;
  exit(): void;
  dispose(): void;
}

const ACTIVE_WINDOW = 0.06;
const RELEASE_WINDOW = 0.12;

interface ManagedScene {
  scene: Scene;
  start: number;
  end: number;
  built: boolean;
  building: boolean;
  active: boolean;
}

function spanFor(id: SegId): { start: number; end: number } {
  const start = STARTS[id];
  const idx = ORDER.indexOf(id);
  const next = idx >= 0 ? ORDER[idx + 1] : undefined;
  const end = next !== undefined ? STARTS[next] : 1;
  return { start, end };
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

/**
 * Mengelola siklus hidup scene (lazy build ±0.06, exit, dispose > 0.12, rebuild saat mundur).
 * Objek bersama di StageContext tidak dimiliki scene dan tidak pernah di-dispose oleh director.
 */
export class SceneDirector {
  private readonly ctx: StageContext;
  private readonly entries: ManagedScene[];
  private readonly byId = new Map<SegId, ManagedScene>();
  private disposed = false;

  constructor(ctx: StageContext, scenes: readonly Scene[]) {
    this.ctx = ctx;
    this.entries = scenes.map((scene) => {
      const { start, end } = spanFor(scene.id);
      const entry: ManagedScene = {
        scene,
        start,
        end,
        built: false,
        building: false,
        active: false,
      };
      this.byId.set(scene.id, entry);
      return entry;
    });
  }

  preload(id: SegId): void {
    if (this.disposed) return;
    const entry = this.byId.get(id);
    if (!entry || entry.built || entry.building) return;
    this.startBuild(entry);
  }

  update(shown: number, dt: number): void {
    if (this.disposed) return;
    const p = clamp01(shown);

    // Langkah 1: keluar dan bebaskan scene yang sudah di luar jendela terlebih dahulu
    for (const entry of this.entries) {
      const inActive = p >= entry.start - ACTIVE_WINDOW && p <= entry.end + ACTIVE_WINDOW;
      if (!inActive && entry.active) {
        entry.scene.exit();
        entry.active = false;
      }

      const inRetain = p >= entry.start - RELEASE_WINDOW && p <= entry.end + RELEASE_WINDOW;
      if (!inRetain && entry.built && !entry.active) {
        entry.scene.dispose();
        entry.built = false;
        entry.building = false;
      }
    }

    // Langkah 2: bangun (jika belum), masuk, dan perbarui scene di dalam jendela aktif
    for (const entry of this.entries) {
      const inActive = p >= entry.start - ACTIVE_WINDOW && p <= entry.end + ACTIVE_WINDOW;
      if (!inActive) continue;

      if (!entry.built) {
        if (!entry.building) {
          this.startBuild(entry);
        }
        if (!entry.built) continue;
      }

      if (!entry.active) {
        entry.scene.enter();
        entry.active = true;
      }

      const span = entry.end - entry.start;
      const t = span > 0 ? clamp01((p - entry.start) / span) : 0;
      entry.scene.update(t, p, dt);
    }
  }

  reset(): void {
    for (const entry of this.entries) {
      if (entry.active) {
        entry.scene.exit();
        entry.active = false;
      }
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const entry of this.entries) {
      if (entry.active) {
        entry.scene.exit();
        entry.active = false;
      }
      if (entry.built) {
        entry.scene.dispose();
        entry.built = false;
      }
      entry.building = false;
    }
  }

  getActiveSceneIds(): SegId[] {
    return this.entries.filter((e) => e.active).map((e) => e.scene.id);
  }

  getBuiltSceneIds(): SegId[] {
    return this.entries.filter((e) => e.built).map((e) => e.scene.id);
  }

  private startBuild(entry: ManagedScene): void {
    const res = entry.scene.build(this.ctx);
    if (isPromiseLike(res)) {
      entry.building = true;
      void res.then(
        () => {
          entry.building = false;
          if (!this.disposed) {
            entry.built = true;
          }
        },
        () => {
          entry.building = false;
        },
      );
    } else {
      entry.built = true;
    }
  }
}
