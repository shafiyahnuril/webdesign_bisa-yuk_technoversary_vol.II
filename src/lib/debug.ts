// Alat diagnostik DEV (?debug, ?freeze, ?noaudio, ?capture).
// Seluruh parsing dan literal dev dibungkus import.meta.env.DEV agar hilang total di dist/.

export interface DevFlags {
  debug: boolean;
  freeze: number | null;
  noAudio: boolean;
  capture: "poster" | "shot" | null;
}

export interface DebugSnapshot {
  shown: number;
  target: number;
  chapter: number;
  t: number;
  fps: number;
  tier: string;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

export interface DebugOverlay {
  update(snapshot: DebugSnapshot): void;
  dispose(): void;
}

export interface CaptureSegmentInfo {
  id: string;
  length: number;
}

declare global {
  interface Window {
    __REBOTTLE_CAPTURE_SEGMENTS__?: readonly CaptureSegmentInfo[];
  }
}

const NOOP_FLAGS: Readonly<DevFlags> = {
  debug: false,
  freeze: null,
  noAudio: false,
  capture: null,
};

export function getDevFlags(
  search = typeof window !== "undefined" ? window.location.search : "",
): DevFlags {
  if (!import.meta.env.DEV || !search) {
    return { ...NOOP_FLAGS };
  }
  const params = new URLSearchParams(search);
  const debug = params.has("debug") && params.get("debug") !== "0";
  const freezeRaw = params.get("freeze");
  let freeze: number | null = null;
  if (freezeRaw !== null && freezeRaw !== "") {
    const parsed = Number(freezeRaw);
    if (Number.isFinite(parsed)) {
      freeze = Math.min(1, Math.max(0, parsed));
    }
  }
  const noAudio = params.has("noaudio");
  const cap = params.get("capture");
  const capture = cap === "poster" || cap === "shot" ? cap : null;
  return { debug, freeze, noAudio, capture };
}

export function createDebugOverlay(enabled = getDevFlags().debug): DebugOverlay {
  if (!import.meta.env.DEV || !enabled || typeof document === "undefined") {
    return { update() {}, dispose() {} };
  }

  const el = document.createElement("aside");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = [
    "position:fixed",
    "right:12px",
    "bottom:12px",
    "z-index:9999",
    "pointer-events:none",
    "padding:8px 10px",
    "border-radius:8px",
    "background:rgba(5,8,15,0.78)",
    "color:#E6EAF2",
    "font:500 11px/1.45 ui-monospace,monospace",
    "white-space:pre",
    "border:1px solid rgba(230,234,242,0.18)",
  ].join(";");
  document.body.appendChild(el);

  let lastDraw = 0;

  return {
    update(s: DebugSnapshot) {
      const now = performance.now();
      if (now - lastDraw < 120) return;
      lastDraw = now;
      el.textContent =
        `FPS ${s.fps.toFixed(0)} · ${s.tier.toUpperCase()}\n` +
        `shown ${s.shown.toFixed(4)} / tgt ${s.target.toFixed(4)}\n` +
        `bab ${s.chapter} · t ${s.t.toFixed(3)}\n` +
        `calls ${s.calls} · tris ${s.triangles}\n` +
        `geom ${s.geometries} · tex ${s.textures}`;
    },
    dispose() {
      el.remove();
    },
  };
}

export function publishCaptureState(
  progress: number,
  segments: readonly CaptureSegmentInfo[],
): void {
  if (!import.meta.env.DEV || typeof document === "undefined") return;
  window.__REBOTTLE_CAPTURE_SEGMENTS__ = segments;
  document.documentElement.dataset.captureProgress = String(progress);
  document.documentElement.dataset.captureReady = "true";
}
