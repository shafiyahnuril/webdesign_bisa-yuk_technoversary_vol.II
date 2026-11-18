import { useCallback, useEffect, useRef, useState } from "react";
import { COPY } from "@/content/copy";
import { applyPalette } from "@/engine/palette";
import { STARTS } from "@/engine/timeline";
import { STATIC_PANEL_SPECS, StaticPanel } from "./StaticPanel";
import styles from "./StaticStory.module.css";

const TOTAL_PANELS = STATIC_PANEL_SPECS.length; // 11
const INITIAL_UNLOCKED = 2; // Panel 1 (aktif) + Panel 2 (berikutnya)
const UNLOCK_DELAY_MS = 1200; // 1,2 detik terlihat >= 60%
const VISIBILITY_THRESHOLD = 0.6;

/**
 * Menghitung rasio visibilitas efektif panel terhadap area yang lebih kecil antara
 * tinggi panel dan tinggi viewport (`min(panelHeight, viewportHeight)`).
 *
 * Rasional:
 * - Pada layar portrait/desktop normal ketika `panelHeight <= viewportHeight`, rasio ini
 *   identik dengan `IntersectionObserverEntry.intersectionRatio`.
 * - Pada layar landscape pendek ketika tinggi panel melebihi tinggi viewport
 *   (`panelHeight > viewportHeight`), `entry.intersectionRatio` secara matematis
 *   dibatasi oleh `viewportHeight / panelHeight` (bisa < 0.6 walau memenuhi 100% layar).
 *   Normalisasi terhadap `min(panelHeight, viewportHeight)` menjaga syarat pembacaan
 *   berurutan `>= 60%` selama `1.2s` tetap jujur dan dapat tercapai di semua rasio layar.
 */
function computeEffectiveVisibility(entry: IntersectionObserverEntry): boolean {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= VISIBILITY_THRESHOLD) return true;

  const targetH = entry.boundingClientRect?.height ?? 0;
  const intersectH = entry.intersectionRect?.height ?? 0;
  const rootH =
    entry.rootBounds?.height ??
    (typeof window !== "undefined" ? window.innerHeight : 0);

  if (targetH > 0 && rootH > 0 && intersectH > 0) {
    const referenceH = Math.min(targetH, rootH);
    if (referenceH > 0 && intersectH / referenceH >= VISIBILITY_THRESHOLD) {
      return true;
    }
  }
  return false;
}

function checkFallbackScrollVisibility(node: HTMLElement): boolean {
  if (typeof window === "undefined") return false;
  const rect = node.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  if (rect.height <= 0 || vh <= 0) return false;
  const visibleTop = Math.max(0, rect.top);
  const visibleBottom = Math.min(vh, rect.bottom);
  const visibleH = Math.max(0, visibleBottom - visibleTop);
  const referenceH = Math.min(rect.height, vh);
  return referenceH > 0 && visibleH / referenceH >= VISIBILITY_THRESHOLD;
}

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
 * - Setiap perubahan `activeIndex` menerapkan `applyPalette(STARTS[segId])` dan
 *   `data-re="off"` (panel 1..7) / `"on"` (panel 8..11) ke `<html>` agar Navbar sinkron.
 * - Di panel ke-11, tombol `"Mulai dari awal"` mengunci kembali panel ke kondisi awal (`2`),
 *   mereset palet & `data-re="off"`, menggulir ke hero, dan memindahkan fokus ke judul panel pertama.
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

  // Sinkronisasi palet <html> dan data-re="off"|"on" dengan panel aktif agar Navbar mengikuti
  useEffect(() => {
    const activeSpec =
      STATIC_PANEL_SPECS[Math.max(0, Math.min(TOTAL_PANELS - 1, activeIndex - 1))] ??
      STATIC_PANEL_SPECS[0]!;
    applyPalette(STARTS[activeSpec.id], document.documentElement);
    document.documentElement.dataset.re = activeIndex >= 8 ? "on" : "off";
  }, [activeIndex]);

  // Pantau visibilitas panel dengan IntersectionObserver (>= 60%), atau fallback scroll jujur bila IO tidak ada
  useEffect(() => {
    const evaluateVisibilityState = () => {
      let highestVisible = 0;
      for (const [idx, vis] of visibleMapRef.current.entries()) {
        if (vis && idx <= unlockedCount && idx > highestVisible) {
          highestVisible = idx;
        }
      }
      if (highestVisible > 0) {
        setActiveIndex(highestVisible);
      }

      if (unlockedCount < TOTAL_PANELS) {
        if (visibleMapRef.current.get(unlockedCount) === true) {
          scheduleUnlockIfEligible(unlockedCount);
        } else {
          clearUnlockTimer();
        }
      }
    };

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const idxAttr = (entry.target as HTMLElement).dataset.panelIndex;
            const idx = idxAttr ? Number(idxAttr) : 0;
            if (!idx) continue;

            const isVisible = computeEffectiveVisibility(entry);
            visibleMapRef.current.set(idx, isVisible);
          }
          evaluateVisibilityState();
        },
        {
          threshold: [0, 0.25, 0.4, VISIBILITY_THRESHOLD, 0.85],
        },
      );

      for (let i = 1; i <= unlockedCount; i += 1) {
        const node = panelNodesRef.current.get(i);
        if (node) {
          observer.observe(node);
        }
      }

      if (
        unlockedCount < TOTAL_PANELS &&
        visibleMapRef.current.get(unlockedCount) === true
      ) {
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
    }

    // Fallback jujur apabila browser lama tidak memiliki IntersectionObserver:
    // Mengukur bounding rect pada scroll/resize dan tetap menerapkan timer 1,2 detik.
    const handleScrollOrResize = () => {
      for (let i = 1; i <= unlockedCount; i += 1) {
        const node = panelNodesRef.current.get(i);
        if (node) {
          visibleMapRef.current.set(i, checkFallbackScrollVisibility(node));
        }
      }
      evaluateVisibilityState();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearUnlockTimer();
      } else {
        handleScrollOrResize();
      }
    };

    handleScrollOrResize();
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearUnlockTimer();
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [unlockedCount, clearUnlockTimer, scheduleUnlockIfEligible]);

  const handleRestart = useCallback(() => {
    clearUnlockTimer();
    visibleMapRef.current.clear();
    setUnlockedCount(INITIAL_UNLOCKED);
    setActiveIndex(1);
    applyPalette(STARTS.b1, document.documentElement);
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
      aria-label={COPY["page.home.title"]}
      data-static-story
      data-unlocked-count={unlockedCount}
      data-active-panel={activeIndex}
    >
      {/* Penanda progres read-only */}
      <aside className={styles.progressAside} aria-hidden="true" data-story-ui>
        <span className={styles.progressLabel}>
          {String(activeIndex).padStart(2, "0")} / {TOTAL_PANELS}
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
          <p className={styles.lockedText}>{COPY["end.hint"]}</p>
        </div>
      ) : null}
    </section>
  );
}
