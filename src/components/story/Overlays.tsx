import { useEffect, useState } from "react";

let cachedGrainUrl: string | null = null;

function buildProceduralGrainUrl(): string | null {
  if (cachedGrainUrl) return cachedGrainUrl;
  if (typeof document === "undefined") return null;

  try {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const img = ctx.createImageData(size, size);
    const data = img.data;
    let seed = 0x517cc1b7;
    for (let i = 0; i < data.length; i += 4) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      const v = (seed >>> 0) & 0xff;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 185;
    }
    ctx.putImageData(img, 0, 0);
    cachedGrainUrl = canvas.toDataURL("image/png");
    return cachedGrainUrl;
  } catch {
    return null;
  }
}

/**
 * Lapisan overlay panggung (`z-index: 60`, `pointer-events: none`):
 * - Butiran (`--grain`), vignette (`--vignette`), dan retak latar (`--crack` dengan aset `img/crack-bg.svg`).
 * - Sama sekali tidak mengimpor Three.js.
 */
export function Overlays() {
  const [grainUrl] = useState<string | null>(() => buildProceduralGrainUrl());
  const baseUrl = import.meta.env.BASE_URL || "/";
  const crackUrl = `${baseUrl.replace(/\/$/, "")}/img/crack-bg.svg`;

  useEffect(() => {
    // Pastikan variabel CSS awal memiliki default aman bila belum di-set engine
    const root = document.documentElement;
    if (!root.style.getPropertyValue("--grain")) {
      root.style.setProperty("--grain", "0.06");
    }
  }, []);

  return (
    <div className="story-overlays" aria-hidden="true" data-story-overlays data-story-ui>
      <div
        className="story-overlay-layer story-overlay-grain"
        data-overlay="grain"
        style={
          grainUrl
            ? {
                backgroundImage: `url("${grainUrl}")`,
                backgroundSize: "128px 128px",
              }
            : undefined
        }
      />
      <div
        className="story-overlay-layer story-overlay-vignette"
        data-overlay="vignette"
      />
      <div
        className="story-overlay-layer story-overlay-cracks"
        data-overlay="cracks"
        style={{ backgroundImage: `url("${crackUrl}")` }}
      />
    </div>
  );
}
