import { useEffect, useState } from "react";
import { GRAIN_SIZE, makeGrainDataUrl } from "@/lib/grain";

let cachedGrainUrl: string | null = null;

function getCanonicalGrainUrl(): string | null {
  if (cachedGrainUrl) return cachedGrainUrl;
  if (typeof document === "undefined") return null;

  try {
    cachedGrainUrl = makeGrainDataUrl();
    return cachedGrainUrl;
  } catch {
    return null;
  }
}

/**
 * Lapisan overlay panggung (`z-index: 60`, `pointer-events: none`):
 * - Butiran (`--grain`) dari helper kanonik `T-GRAIN` (`256x256`), vignette (`--vignette`), dan retak latar (`--crack` dengan aset `img/crack-bg.svg`).
 * - Sama sekali tidak mengimpor Three.js.
 */
export function Overlays() {
  const [grainUrl] = useState<string | null>(() => getCanonicalGrainUrl());
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
                backgroundSize: `${GRAIN_SIZE}px ${GRAIN_SIZE}px`,
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
