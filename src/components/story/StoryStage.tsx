import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { TOTAL_VH } from "@/engine/timeline";
import { useChapter } from "@/hooks/useChapter";
import { ChapterMarker } from "./ChapterMarker";
import { ChapterText, type ChapterNumber } from "./ChapterText";
import { CTAClosing } from "./CTAClosing";
import { FlashWindow } from "./FlashWindow";
import { HeroTitle } from "./HeroTitle";
import { LoopDome } from "./LoopDome";
import { Overlays } from "./Overlays";
import { PunchText } from "./PunchText";
import { ScenarioLabel } from "./ScenarioLabel";
import { ScrollHint } from "./ScrollHint";
import { StationLabels } from "./StationLabels";
import styles from "./StoryStage.module.css";

export interface StoryStageProps {
  /**
   * Slot kanvas visual 3D (`StageCanvas` dari koordinator).
   * Diletakkan di dalam lapisan `z-index: 20` di atas `HeroTitle` (`z-index: 10`)
   * dan di bawah teks cerita (`z-index: 30`).
   * Bila `children` tidak diberikan (build mandiri UI), poster hero desktop/HP ditampilkan sebagai visual awal.
   */
  children?: ReactNode;
  /** Tier kualitas aktif ("high" | "medium" | "low"). Default: "high". */
  quality?: "high" | "medium" | "low";
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
  /** Sembunyikan poster hero awal (mis. setelah StageCanvas melaporkan `onReady()`). */
  canvasReady?: boolean;
}

const CHAPTER_LIST: readonly ChapterNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function StoryStage({
  children,
  quality = "high",
  engine = storyEngine,
  canvasReady = false,
}: StoryStageProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hideEndHint, setHideEndHint] = useState(false);

  // Subscribe ke perubahan bab diskrit (tidak re-render per frame)
  const { chapter, view } = useChapter(engine);

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;

    engine.mount(rootEl);
    return () => {
      engine.unmount();
    };
  }, [engine]);

  const handlePullHintChange = useCallback((hide: boolean) => {
    setHideEndHint(hide);
  }, []);

  const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const posterDesktop = `${baseUrl}/img/hero-poster.webp`;
  const posterMobile = `${baseUrl}/img/hero-poster-m.webp`;

  return (
    <div
      ref={rootRef}
      className={styles.wrapper}
      data-story-root
      data-active-chapter={chapter}
      data-active-view={view}
    >
      <div className={styles.stage} data-story-stage>
        {/* z10: Judul Hero di belakang botol */}
        <HeroTitle engine={engine} />

        {/* z20: Slot StageCanvas 3D + poster awal */}
        <div className={styles.canvasSlot} data-stage-canvas-slot>
          {!canvasReady ? (
            <picture
              className={`${styles.poster} ${chapter > 1 ? styles.posterHidden : ""}`}
              data-story-poster
            >
              <source media="(max-width: 768px)" srcSet={posterMobile} />
              <img
                src={posterDesktop}
                alt=""
                className={styles.posterImg}
                decoding="async"
              />
            </picture>
          ) : null}
          {children}
        </div>

        {/* z30: 11 segmen cerita (Bab 1-6, Punchline, Bab 7-10) + FlashWindow + StationLabels + CTAClosing */}
        <div className={styles.textLayer} data-story-texts>
          {CHAPTER_LIST.map((ch) => (
            <ChapterText
              key={ch}
              chapter={ch}
              quality={quality}
              engine={engine}
            />
          ))}
          <PunchText engine={engine} />
          <FlashWindow engine={engine} />
          <StationLabels engine={engine} />
          <CTAClosing engine={engine} />
        </div>

        {/* z40: Penanda bab kiri (hanya-baca) */}
        <ChapterMarker engine={engine} />

        {/* z50: Lingkaran loop (dome) */}
        <LoopDome engine={engine} onPullHintChange={handlePullHintChange} />

        {/* z60: Overlay butiran, vignette, dan retak latar */}
        <Overlays />

        {/* z100 (bawah-tengah): Label skenario & petunjuk gulir */}
        <div className={styles.foot} data-stage-foot data-story-ui>
          <ScenarioLabel engine={engine} />
          <div className={styles.hints}>
            <ScrollHint variant="start" engine={engine} />
            <ScrollHint
              variant="loop"
              engine={engine}
              hiddenByPull={hideEndHint}
            />
          </div>
        </div>
      </div>

      {/* Penggulir tinggi dokumen: (2240 + 100) * 1dvh */}
      <div
        className={styles.scroller}
        data-scroller
        aria-hidden="true"
        style={{ height: `calc((${TOTAL_VH} + 100) * 1dvh)` }}
      />
    </div>
  );
}
