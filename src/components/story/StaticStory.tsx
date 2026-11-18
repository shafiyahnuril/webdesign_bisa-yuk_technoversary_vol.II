import { useCallback, useEffect, useRef, useState } from "react";
import { STATIC_PANEL_SPECS, StaticPanel } from "./StaticPanel";
import styles from "./StaticStory.module.css";

const TOTAL_PANELS = STATIC_PANEL_SPECS.length; // 11
const INITIAL_UNLOCKED = 2; // Panel 1 (aktif) + Panel 2 (berikutnya)
const UNLOCK_DELAY_MS = 1200; // 1,2 detik terlihat >= 60%
const VISIBILITY_THRESHOLD = 0.6;

export interface StaticStoryProps {
  /** Durasi tunda pembukaan panel berikutnya (default 1200ms). */
  unlockDelayMs?: number;
}

/**
 * Mode statis berurutan (11 panel: B1-B6, Punchline, B7-B10) untuk
 * `prefers-reduced-motion: reduce` atau perangkat tanpa WebGL.
 *
 * Kontrak:
 * - Hanya panel aktif dan 1 panel berikutnya yang terbuka di awal (`unlockedCount = 2`).
 * - Panel berikutnya terbuka ketika panel terakhir yang terbuka (`unlockedCount`) terlihat
 *   `>= 60%` di viewport selama `1.2s` berturut-turut saat tab aktif (`!document.hidden`).
 * - Di panel ke-11, tombol `"Mulai dari awal"` mengunci kembali panel ke kondisi awal (`2`),
 *   menggulir kembali ke hero, dan memindahkan fokus ke judul panel pertama.
 */
export function StaticStory({ unlockDelayMs = UNLOCK_DELAY_MS }: StaticStoryProps) {
  const [unlockedCount, setUnlockedCount] = useState<number>(INITIAL_UNLOCKED);
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const panelNodesRef = useRef<Map<number, HTMLElement>>(new Map());
  const visibleMapRef = useRef<Map<number, boolean>>(new Map());
  const firstHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUnlockTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const unlockNext = useCallback(() => {
    clearUnlockTimer();
    setUnlockedCount((prev) => Math.min(TOTAL_PANELS, prev + 1));
  }, [clearUnlockTimer]);

  const scheduleUnlockIfEligible = useCallback(
    (targetPanelIndex: number) => {
      clearUnlockTimer();
      if (targetPanelIndex >= TOTAL_PANELS) return;
      if (typeof document !== "undefined" && document.hidden) return;
      const isTargetVisible = visibleMapRef.current.get(targetPanelIndex) === true;
      if (!isTargetVisible) return;

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (typeof document !== "undefined" && document.hidden) return;
        if (visibleMapRef.current.get(targetPanelIndex) === true) {
          setUnlockedCount((prev) =>
            prev === targetPanelIndex ? Math.min(TOTAL_PANELS, prev + 1) : prev,
          );
        }
      }, unlockDelayMs);
    },
    [clearUnlockTimer, unlockDelayMs],
  );

  // Sinkronisasi <html data-re="off" | "on"> berdasarkan panel yang sedang dilihat
  useEffect(() => {
    document.documentElement.dataset.re = activeIndex >= 8 ? "on" : "off";
  }, [activeIndex]);

  // Pantau visibilitas panel dengan IntersectionObserver (>= 60%)
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let highestVisible = 0;

        for (const entry of entries) {
          const idxAttr = (entry.target as HTMLElement).dataset.panelIndex;
          const idx = idxAttr ? Number(idxAttr) : 0;
          if (!idx) continue;

          const isVisible =
            entry.isIntersecting && entry.intersectionRatio >= VISIBILITY_THRESHOLD;
          visibleMapRef.current.set(idx, isVisible);
        }

        for (const [idx, vis] of visibleMapRef.current.entries()) {
          if (vis && idx > highestVisible) {
            highestVisible = idx;
          }
        }

        if (highestVisible > 0) {
          setActiveIndex(highestVisible);
        }

        // Panel pemicu buka berikutnya adalah panel terakhir yang saat ini terbuka (unlockedCount)
        if (unlockedCount < TOTAL_PANELS) {
          if (visibleMapRef.current.get(unlockedCount) === true) {
            scheduleUnlockIfEligible(unlockedCount);
          } else {
            clearUnlockTimer();
          }
        }
      },
      {
        threshold: [0, VISIBILITY_THRESHOLD, 0.85],
      },
    );

    for (let i = 1; i <= unlockedCount; i += 1) {
      const node = panelNodesRef.current.get(i);
      if (node) {
        observer.observe(node);
      }
    }

    // Bila panel ke-unlockedCount sudah terlihat saat baru terbuka, jadwalkan pembukaan berikutnya
    if (unlockedCount < TOTAL_PANELS && visibleMapRef.current.get(unlockedCount) === true) {
      scheduleUnlockIfEligible(unlockedCount);
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearUnlockTimer();
      } else if (
        unlockedCount < TOTAL_PANELS &&
        visibleMapRef.current.get(unlockedCount) === true
      ) {
        scheduleUnlockIfEligible(unlockedCount);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearUnlockTimer();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [unlockedCount, clearUnlockTimer, scheduleUnlockIfEligible]);

  const handleRestart = useCallback(() => {
    clearUnlockTimer();
    visibleMapRef.current.clear();
    setUnlockedCount(INITIAL_UNLOCKED);
    setActiveIndex(1);
    document.documentElement.dataset.re = "off";

    if (typeof window !== "undefined") {
      try {
        window.scrollTo({ top: 0, behavior: "auto" });
      } catch {
        window.scrollTo(0, 0);
      }
    }

    firstHeadingRef.current?.focus();
  }, [clearUnlockTimer]);

  const visiblePanels = STATIC_PANEL_SPECS.slice(0, unlockedCount);
  const lockedRemaining = TOTAL_PANELS - unlockedCount;

  return (
    <section
      className={styles.staticStory}
      aria-label="Cerita Re:bottle (Mode Statis Berurutan)"
      data-static-story
      data-unlocked-count={unlockedCount}
      data-active-panel={activeIndex}
    >
      {/* Penanda progres read-only */}
      <aside className={styles.progressAside} aria-hidden="true" data-story-ui>
        <span className={styles.progressLabel}>
          Panel {String(activeIndex).padStart(2, "0")} / {TOTAL_PANELS}
        </span>
      </aside>

      <div className={styles.panelList}>
        {visiblePanels.map((spec) => {
          const isLastUnlocked = spec.index === unlockedCount;
          return (
            <StaticPanel
              key={spec.id}
              spec={spec}
              isActive={spec.index === activeIndex || isLastUnlocked}
              isUnlocked={spec.index <= unlockedCount}
              canUnlockMore={isLastUnlocked && unlockedCount < TOTAL_PANELS}
              onUnlockNext={isLastUnlocked ? unlockNext : undefined}
              onRestart={spec.index === TOTAL_PANELS ? handleRestart : undefined}
              firstHeadingRef={spec.index === 1 ? firstHeadingRef : undefined}
              panelRef={(node) => {
                if (node) {
                  panelNodesRef.current.set(spec.index, node);
                } else {
                  panelNodesRef.current.delete(spec.index);
                }
              }}
            />
          );
        })}
      </div>

      {lockedRemaining > 0 ? (
        <div
          className={styles.lockedFooter}
          role="status"
          aria-live="polite"
          data-static-locked-indicator
        >
          <p className={styles.lockedText}>
            Gulir dan baca panel terakhir selama 1,2 detik untuk membuka bagian berikutnya (
            {lockedRemaining} bagian tersisa).
          </p>
        </div>
      ) : null}
    </section>
  );
}
