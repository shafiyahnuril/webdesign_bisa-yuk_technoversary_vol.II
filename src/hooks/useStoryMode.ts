import { useCallback, useState } from "react";
import { createSignal } from "@/engine/signal";
import { useSignal } from "@/hooks/useSignal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type StoryMode = "3d" | "static";

export interface StoryWebGLFailureState {
  failed: boolean;
  reason?: string;
}

/**
 * Signal global yang dapat dipanggil oleh StageCanvas ketika terjadi
 * kegagalan inisialisasi WebGL atau `webglcontextlost` yang tidak pulih.
 */
export const storyWebGLFailureSignal = createSignal<StoryWebGLFailureState>({
  failed: false,
});

export function reportStoryWebGLFailure(error?: unknown): void {
  const reason =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "WebGL context lost or failed";
  storyWebGLFailureSignal.set({ failed: true, reason });
}

export function resetStoryWebGLFailure(): void {
  storyWebGLFailureSignal.set({ failed: false, reason: undefined });
}

export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return true;
  }
  try {
    if (!("WebGLRenderingContext" in window)) {
      return false;
    }
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

function isForcedStaticFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("mode") === "static" || searchParams.get("fallback") === "1") {
      return true;
    }
    const hash = window.location.hash;
    const qIndex = hash.indexOf("?");
    if (qIndex >= 0) {
      const hashParams = new URLSearchParams(hash.slice(qIndex + 1));
      if (hashParams.get("mode") === "static" || hashParams.get("fallback") === "1") {
        return true;
      }
    }
  } catch {
    // Abaikan kegagalan parsing URL
  }
  return false;
}

export interface UseStoryModeResult {
  /** Mode cerita aktif: `"3d"` (panggung scrollytelling) atau `"static"` (11 panel berurutan). */
  mode: StoryMode;
  /** Apakah pengguna mengaktifkan `prefers-reduced-motion: reduce`. */
  reducedMotion: boolean;
  /** Apakah browser mendukung konteks WebGL. */
  webglSupported: boolean;
  /** Apakah StageCanvas melaporkan kegagalan runtime / context loss. */
  failed: boolean;
  /** Alasan kegagalan runtime bila ada. */
  failureReason?: string;
  /** Callback untuk dipasang ke `<StageCanvas onFailure={onFailure} />`. */
  onFailure: (error?: Error | unknown) => void;
  /** Alias `onFailure` untuk memicu fallback secara imperatif. */
  reportFailure: (error?: Error | unknown) => void;
  /** Mereset status kegagalan runtime dan memilih paksa mode tertentu bila diperlukan. */
  setForcedMode: (mode: StoryMode | null) => void;
}

/**
 * Menentukan apakah Home menjalankan panggung `"3d"` atau `"static"` (11 panel berurutan).
 *
 * Beralih ke `"static"` apabila:
 * 1. `prefers-reduced-motion: reduce` aktif,
 * 2. WebGL tidak didukung oleh perangkat/browser (`!isWebGLAvailable()`),
 * 3. `StageCanvas` memanggil `onFailure` / `reportStoryWebGLFailure()`, atau
 * 4. URL menyertakan `?mode=static`.
 */
export function useStoryMode(): UseStoryModeResult {
  const reducedMotion = useReducedMotion();
  const failureState = useSignal(storyWebGLFailureSignal);
  const [webglSupported] = useState<boolean>(() => isWebGLAvailable());
  const [forcedStaticUrl] = useState<boolean>(() => isForcedStaticFromUrl());
  const [forcedMode, setForcedMode] = useState<StoryMode | null>(null);

  const onFailure = useCallback((error?: Error | unknown) => {
    reportStoryWebGLFailure(error);
  }, []);

  const handleSetForcedMode = useCallback((next: StoryMode | null) => {
    if (next === "3d") {
      resetStoryWebGLFailure();
    }
    setForcedMode(next);
  }, []);

  const shouldFallback =
    reducedMotion || !webglSupported || failureState.failed || forcedStaticUrl;

  const mode: StoryMode = forcedMode ?? (shouldFallback ? "static" : "3d");

  return {
    mode,
    reducedMotion,
    webglSupported,
    failed: failureState.failed,
    failureReason: failureState.reason,
    onFailure,
    reportFailure: onFailure,
    setForcedMode: handleSetForcedMode,
  };
}
