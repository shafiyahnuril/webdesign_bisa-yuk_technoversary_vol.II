import { useCallback, useEffect, useState, type ReactNode } from "react";
import { COPY } from "@/content/copy";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useStoryMode } from "@/hooks/useStoryMode";
import { StaticStory } from "@/components/story/StaticStory";
import { StoryStage } from "@/components/story/StoryStage";
import { StageCanvas } from "@/components/story/StageCanvas";
import styles from "./HomePage.module.css";

export type StoryQualityTier = "high" | "medium" | "low";

export interface HomeStageSlotProps {
  /** Singleton atau instance StoryEngine yang digunakan oleh StoryStage. */
  engine: StoryEngine;
  /** Apakah pengguna meminta reduced motion. */
  reducedMotion: boolean;
  /** Panggil ketika frame pertama StageCanvas siap agar poster hero awal fade-out (0.3s). */
  onReady: () => void;
  /** Panggil ketika WebGL gagal diinisialisasi atau context-lost permanen untuk beralih ke StaticStory. */
  onFailure: (error?: Error | unknown) => void;
  /** Panggil ketika governor kualitas menurunkan/menaikkan tier kualitas ("high" | "medium" | "low"). */
  onQualityChange: (tier: StoryQualityTier) => void;
}

export interface HomePageProps {
  /**
   * Anak visual langsung untuk slot kanvas (`z-index: 20` di dalam `StoryStage`),
   * misalnya `<StageCanvas ... />`.
   */
  children?: ReactNode;
  /**
   * Render prop opsional untuk mengikat `<StageCanvas {...slotProps} />` langsung dengan
   * `engine`, `reducedMotion`, `onReady`, `onFailure`, dan `onQualityChange`.
   */
  renderStageCanvas?: (slotProps: HomeStageSlotProps) => ReactNode;
  /** Instance StoryEngine kustom untuk pengujian (default: singleton `storyEngine`). */
  engine?: StoryEngine;
}

/**
 * Halaman utama Re:bottle (Pihak A).
 * - Secara otomatis memilih antara panggung scrollytelling (`StoryStage`) dan
 *   11 panel statis berurutan (`StaticStory`) lewat `useStoryMode()`.
 * - Tidak mengimpor Three.js; `StageCanvas` milik koordinator dipasang lewat `children`
 *   atau `renderStageCanvas`.
 */
export default function HomePage({
  children,
  renderStageCanvas,
  engine = storyEngine,
}: HomePageProps = {}) {
  useDocumentMeta(COPY["page.home.title"], COPY["site.description"]);

  const { mode, reducedMotion, onFailure } = useStoryMode();
  const [canvasReady, setCanvasReady] = useState(false);
  const [quality, setQuality] = useState<StoryQualityTier>("high");

  useEffect(() => {
    document.documentElement.dataset.storyMode = mode;
  }, [mode]);

  useEffect(
    () => () => {
      const root = document.documentElement;
      delete root.dataset.storyMode;
      // Lepaskan warna imperatif agar tema halaman non-Home kembali mengendalikan shell.
      [
        "--bg-a",
        "--bg-b",
        "--ink-a",
        "--ink-b",
        "--accent-a",
        "--accent-b",
        "--mix",
        "--ink-mix",
        "--bg-now",
        "--ink-now",
        "--accent-now",
        "--grain",
        "--vignette",
        "--melt",
        "--crack",
        "--shimmer",
      ].forEach((name) => root.style.removeProperty(name));
    },
    [],
  );

  const handleReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const handleQualityChange = useCallback((tier: StoryQualityTier) => {
    setQuality(tier);
  }, []);

  const slotProps = {
    engine,
    reducedMotion,
    onReady: handleReady,
    onFailure,
    onQualityChange: handleQualityChange,
  };
  const stageNode = renderStageCanvas
    ? renderStageCanvas(slotProps)
    : (children ?? <StageCanvas {...slotProps} />);

  return (
    <div className={styles.homeRoot} data-home-page data-story-mode={mode}>
      {mode === "static" ? (
        <StaticStory />
      ) : (
        <StoryStage engine={engine} quality={quality} canvasReady={canvasReady}>
          {stageNode}
        </StoryStage>
      )}
    </div>
  );
}
