import { useEffect, useRef } from "react";
import { COPY } from "@/content/copy";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { PUNCH, STARTS, temperatureAt, type SegId } from "@/engine/timeline";
import styles from "./ChapterMarker.module.css";

export interface ChapterMarkerProps {
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

interface MarkerItem {
  num: string;
  chapter: number;
  segId: SegId;
  title: string;
}

const BABAK_1_ITEMS: readonly MarkerItem[] = [
  { num: "01", chapter: 1, segId: "b1", title: COPY["ch1.title"] },
  { num: "02", chapter: 2, segId: "b2", title: COPY["ch2.title"] },
  { num: "03", chapter: 3, segId: "b3", title: COPY["ch3.title"] },
  { num: "04", chapter: 4, segId: "b4", title: COPY["ch4.title"] },
  { num: "05", chapter: 5, segId: "b5", title: COPY["ch5.title"] },
  { num: "06", chapter: 6, segId: "b6", title: COPY["ch6.title"] },
];

const BABAK_2_ITEMS: readonly MarkerItem[] = [
  { num: "07", chapter: 7, segId: "b7", title: COPY["ch7.title"] },
  { num: "08", chapter: 8, segId: "b8", title: COPY["ch8.title"] },
  { num: "09", chapter: 9, segId: "b9", title: COPY["ch9.title"] },
  { num: "10", chapter: 10, segId: "b10", title: COPY["ch10.title" as keyof typeof COPY] ?? "Surat Terakhir" },
];

const HYSTERESIS = 0.005;

export function formatTemp(temp: number): string {
  return `+${temp.toFixed(1).replace(".", ",")}°C`;
}

function resolveChapterWithHysteresis(
  shown: number,
  items: readonly MarkerItem[],
  prevIndex: number,
): number {
  let rawIndex = 0;
  for (let i = 0; i < items.length; i++) {
    const start = STARTS[items[i]!.segId];
    if (shown >= start) rawIndex = i;
  }

  if (prevIndex < 0 || prevIndex >= items.length || rawIndex === prevIndex) {
    return rawIndex;
  }

  if (rawIndex === prevIndex + 1) {
    const boundary = STARTS[items[rawIndex]!.segId];
    if (shown < boundary + HYSTERESIS) return prevIndex;
  } else if (rawIndex === prevIndex - 1) {
    const boundary = STARTS[items[prevIndex]!.segId];
    if (shown > boundary - HYSTERESIS) return prevIndex;
  }

  return rawIndex;
}

/**
 * Penanda bab kiri layar (`z-index: 40`, hanya-baca):
 * - Dua `<ol>` bertumpuk untuk Babak I (01–06) dan Babak II (07–10).
 * - Disembunyikan (`data-view="none"`) saat Punchline (`PUNCH.from..PUNCH.to`).
 * - Kotak penanda 8x8px meluncur dengan `--y` yang di-cache saat resize.
 * - Suhu skenario (`+1,2°C`..`+4,0°C` / `+1,5°C`) ditampilkan pada item aktif.
 */
export function ChapterMarker({ engine = storyEngine }: ChapterMarkerProps) {
  const asideRef = useRef<HTMLElement | null>(null);
  const ol1Ref = useRef<HTMLOListElement | null>(null);
  const ol2Ref = useRef<HTMLOListElement | null>(null);
  const items1Refs = useRef<(HTMLLIElement | null)[]>([]);
  const items2Refs = useRef<(HTMLLIElement | null)[]>([]);
  const temps1Refs = useRef<(HTMLElement | null)[]>([]);
  const temps2Refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const aside = asideRef.current;
    const ol1 = ol1Ref.current;
    const ol2 = ol2Ref.current;
    if (!aside || !ol1 || !ol2) return;

    let cachedY1: number[] = [];
    let cachedY2: number[] = [];

    const measureOffsets = () => {
      cachedY1 = items1Refs.current.map((li, idx) => {
        if (!li) return idx * 36;
        const offset = li.offsetTop + li.offsetHeight / 2 - 4;
        return offset > 0 || idx === 0 ? offset : idx * 36;
      });
      cachedY2 = items2Refs.current.map((li, idx) => {
        if (!li) return idx * 36;
        const offset = li.offsetTop + li.offsetHeight / 2 - 4;
        return offset > 0 || idx === 0 ? offset : idx * 36;
      });
    };

    measureOffsets();

    let currentView = "";
    let curIndex1 = -1;
    let curIndex2 = -1;

    const update = (shown: number) => {
      const nextView =
        shown < PUNCH.from ? "1" : shown < PUNCH.to ? "none" : "2";

      if (nextView !== currentView) {
        currentView = nextView;
        aside.dataset.view = nextView;
      }

      if (nextView === "none") return;

      const tempText = formatTemp(temperatureAt(shown));

      if (nextView === "1") {
        const idx = resolveChapterWithHysteresis(shown, BABAK_1_ITEMS, curIndex1);
        if (idx !== curIndex1) {
          curIndex1 = idx;
          items1Refs.current.forEach((li, n) => {
            if (!li) return;
            const active = n === idx;
            li.classList.toggle(styles.active ?? "is-active", active);
            if (active) {
              li.setAttribute("aria-current", "step");
            } else {
              li.removeAttribute("aria-current");
            }
          });
          const y = cachedY1[idx] ?? idx * 36;
          ol1.style.setProperty("--y", `${y}px`);
        }
        const tempEl = temps1Refs.current[idx];
        if (tempEl && tempEl.textContent !== tempText) {
          tempEl.textContent = tempText;
        }
      } else {
        const idx = resolveChapterWithHysteresis(shown, BABAK_2_ITEMS, curIndex2);
        if (idx !== curIndex2) {
          curIndex2 = idx;
          items2Refs.current.forEach((li, n) => {
            if (!li) return;
            const active = n === idx;
            li.classList.toggle(styles.active ?? "is-active", active);
            if (active) {
              li.setAttribute("aria-current", "step");
            } else {
              li.removeAttribute("aria-current");
            }
          });
          const y = cachedY2[idx] ?? idx * 36;
          ol2.style.setProperty("--y", `${y}px`);
        }
        const tempEl = temps2Refs.current[idx];
        if (tempEl && tempEl.textContent !== tempText) {
          tempEl.textContent = tempText;
        }
      }
    };

    const handleResize = () => {
      measureOffsets();
      curIndex1 = -1;
      curIndex2 = -1;
      update(engine.state.shown);
    };

    update(engine.state.shown);
    window.addEventListener("resize", handleResize, { passive: true });
    const unsub = engine.onFrame((shown) => update(shown));

    return () => {
      unsub();
      window.removeEventListener("resize", handleResize);
    };
  }, [engine]);

  return (
    <aside
      ref={asideRef}
      className={styles.chapters}
      data-view="1"
      aria-label="Penanda bab (hanya-baca)"
      data-chapter-marker
      data-story-ui
    >
      <ol ref={ol1Ref} className={styles.list} data-babak="1">
        {BABAK_1_ITEMS.map((item, idx) => (
          <li
            key={item.num}
            ref={(el) => {
              items1Refs.current[idx] = el;
            }}
            className={`${styles.item} ${idx === 0 ? styles.active : ""}`}
            aria-current={idx === 0 ? "step" : undefined}
          >
            <span className={styles.no}>{item.num}</span>
            <span className={styles.label}>{item.title}</span>
            <small
              ref={(el) => {
                temps1Refs.current[idx] = el;
              }}
              className={styles.temp}
              data-marker-temp
            >
              {idx === 0 ? "+1,2°C" : ""}
            </small>
          </li>
        ))}
        <i className={styles.marker} aria-hidden="true" />
      </ol>

      <ol ref={ol2Ref} className={styles.list} data-babak="2">
        {BABAK_2_ITEMS.map((item, idx) => (
          <li
            key={item.num}
            ref={(el) => {
              items2Refs.current[idx] = el;
            }}
            className={styles.item}
          >
            <span className={styles.no}>{item.num}</span>
            <span className={styles.label}>{item.title}</span>
            <small
              ref={(el) => {
                temps2Refs.current[idx] = el;
              }}
              className={styles.temp}
              data-marker-temp
            />
          </li>
        ))}
        <i className={styles.marker} aria-hidden="true" />
      </ol>
    </aside>
  );
}
