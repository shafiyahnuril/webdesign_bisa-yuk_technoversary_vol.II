import { useEffect, useRef } from "react";
import { COPY } from "@/content/copy";
import { FACTS, type Fact } from "@/content/facts";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { segmentAt, smoothstep, type SegId } from "@/engine/timeline";
import { CopyPanel } from "./CopyPanel";
import { DataCounter } from "./DataCounter";
import { LetterCard } from "./LetterCard";
import { SplitHeadline } from "./SplitHeadline";
import { TimeRing } from "./TimeRing";
import styles from "./ChapterText.module.css";

export type ChapterNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ChapterTextProps {
  /** Nomor bab 1..10. */
  chapter: ChapterNumber;
  /** Tier kualitas saat ini ("high" | "medium" | "low"). */
  quality?: "high" | "medium" | "low";
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

function isFactVerified(fact: Fact): fact is Fact & { value: string | number; year: number } {
  if (!fact.verified) return false;
  if (fact.value === null || fact.value === "" || String(fact.value).includes("TODO")) return false;
  if (fact.year === null || fact.publisher.includes("TODO")) return false;
  return true;
}

function renderFactLine(fact: Fact): string | null {
  if (!isFactVerified(fact)) return null;
  const valStr = fact.unit ? `${fact.value} ${fact.unit}` : String(fact.value);
  return fact.statement.replace("{X}", valStr);
}

/**
 * Menghitung opasitas dan translasi Y untuk jendela teks standar:
 * - Masuk: `t = 0.06..0.12` (Bab 1: `t = 0.20..0.28` setelah judul hero memudar).
 * - Plateau: `t = 0.12..0.66`.
 * - Keluar: `t = 0.66..0.72` (tidak ada teks di `0.72..1.00` saat palet bergeser).
 */
function computeWindowAlpha(
  t: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number,
): { alpha: number; ty: number } {
  if (t <= enterStart || t >= exitEnd) {
    return { alpha: 0, ty: t <= enterStart ? 16 : -16 };
  }
  if (t < enterEnd) {
    const k = smoothstep(enterStart, enterEnd, t);
    return { alpha: k, ty: (1 - k) * 16 };
  }
  if (t > exitStart) {
    const k = smoothstep(exitStart, exitEnd, t);
    return { alpha: 1 - k, ty: -k * 16 };
  }
  return { alpha: 1, ty: 0 };
}

export function ChapterText({
  chapter,
  quality = "high",
  engine = storyEngine,
}: ChapterTextProps) {
  const segId = `b${chapter}` as SegId;
  const wrapRef = useRef<HTMLElement | null>(null);
  const titlePhaseRef = useRef<HTMLDivElement | null>(null);
  const leadPhaseRef = useRef<HTMLDivElement | null>(null);
  const tailPhaseRef = useRef<HTMLDivElement | null>(null);
  const letterPhaseRef = useRef<HTMLDivElement | null>(null);
  const sub10aRef = useRef<HTMLDivElement | null>(null);
  const sub10bRef = useRef<HTMLDivElement | null>(null);
  const sub10dRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const applyPhaseNode = (
      node: HTMLElement | null,
      t: number,
      e0: number,
      e1: number,
      x0: number,
      x1: number,
    ) => {
      if (!node) return;
      const { alpha, ty } = computeWindowAlpha(t, e0, e1, x0, x1);
      node.style.opacity = alpha.toFixed(3);
      node.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
    };

    const update = (shown: number) => {
      const { id, t } = segmentAt(shown);
      if (id !== segId) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        return;
      }

      if (chapter === 10) {
        // Bab 10 memiliki sub-langkah 10a (0.01..0.14), 10b (0.14..0.28), jeda 10c (0.28..0.42), 10d (0.42..0.72)
        el.style.visibility = t < 0.74 ? "visible" : "hidden";
        el.style.opacity = t < 0.74 ? "1" : "0";

        const applySub = (
          node: HTMLDivElement | null,
          e0: number,
          e1: number,
          x0: number,
          x1: number,
        ) => {
          if (!node) return;
          const { alpha, ty } = computeWindowAlpha(t, e0, e1, x0, x1);
          node.style.visibility = alpha <= 0.005 ? "hidden" : "visible";
          node.style.opacity = alpha.toFixed(3);
          node.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
        };

        applySub(sub10aRef.current, 0.01, 0.04, 0.11, 0.14);
        applySub(sub10bRef.current, 0.14, 0.17, 0.25, 0.28);
        // 10c (0.28..0.42) sengaja jeda kosong tanpa surat
        applySub(sub10dRef.current, 0.42, 0.46, 0.68, 0.72);
        return;
      }

      // Jendela utama bab (mematuhi text gap 0.72..1.00 saat palet bergeser)
      const enterStart = chapter === 1 ? 0.17 : 0.05;
      const enterEnd = chapter === 1 ? 0.23 : 0.11;
      const exitStart = 0.66;
      const exitEnd = 0.72;

      const { alpha } = computeWindowAlpha(t, enterStart, enterEnd, exitStart, exitEnd);
      el.style.visibility = alpha <= 0.005 ? "hidden" : "visible";
      el.style.opacity = alpha.toFixed(3);

      // Fase bertahap dengan breathing pause (title -> pause -> lead -> pause -> tail -> letter)
      const tTitle0 = chapter === 1 ? 0.17 : 0.05;
      const tTitle1 = chapter === 1 ? 0.23 : 0.11;
      const tLead0 = chapter === 1 ? 0.25 : 0.13;
      const tLead1 = chapter === 1 ? 0.32 : 0.21;
      const tTail0 = chapter === 1 ? 0.35 : 0.24;
      const tTail1 = chapter === 1 ? 0.43 : 0.33;
      const tLetter0 = 0.28;
      const tLetter1 = 0.37;

      applyPhaseNode(titlePhaseRef.current, t, tTitle0, tTitle1, exitStart, exitEnd);
      applyPhaseNode(leadPhaseRef.current, t, tLead0, tLead1, exitStart, exitEnd);
      applyPhaseNode(tailPhaseRef.current, t, tTail0, tTail1, exitStart, exitEnd);
      applyPhaseNode(letterPhaseRef.current, t, tLetter0, tLetter1, exitStart, exitEnd);
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [chapter, segId, engine]);

  const sideClass = chapter === 3 ? styles.alignRight : styles.alignLeft;
  const chapterLayoutClass =
    chapter === 6
      ? styles.chapterB6
      : chapter === 9
        ? styles.chapterB9
        : chapter === 10
          ? styles.chapterB10
          : "";

  const renderContent = () => {
    switch (chapter) {
      case 1:
        return (
          <CopyPanel>
            <div ref={titlePhaseRef} className={styles.phaseItem} data-reveal-phase="title">
              <SplitHeadline text={COPY["ch1.title"]} quality={quality} engine={engine} />
            </div>
            <div ref={leadPhaseRef} className={styles.phaseItem} data-reveal-phase="lead">
              <p className={`t-body-lg ${styles.line}`}>{COPY["ch1.line"]}</p>
            </div>
            <div ref={tailPhaseRef} className={styles.phaseItem} data-reveal-phase="tail">
              <p className={`t-body ${styles.sub}`}>{COPY["ch1.sub"]}</p>
            </div>
          </CopyPanel>
        );

      case 2:
        return (
          <div className={styles.stack}>
            <CopyPanel>
              <div ref={titlePhaseRef} className={styles.phaseItem} data-reveal-phase="title">
                <SplitHeadline text={COPY["ch2.title"]} quality={quality} engine={engine} />
              </div>
              <div ref={leadPhaseRef} className={styles.phaseItem} data-reveal-phase="lead">
                <p className={`t-body-lg ${styles.line}`}>{COPY["ch2.line"]}</p>
              </div>
              <div ref={tailPhaseRef} className={styles.phaseItem} data-reveal-phase="tail">
                <p className={`t-body ${styles.sub}`}>{COPY["ch2.sub"]}</p>
              </div>
            </CopyPanel>
            <div ref={letterPhaseRef} className={styles.phaseItem} data-reveal-phase="meta">
              <TimeRing segment="b2" max={10} unit="menit" engine={engine} />
            </div>
          </div>
        );

      case 3: {
        const lamaTerurai = FACTS["lama-terurai"];
        const verifiedYears =
          isFactVerified(lamaTerurai) && typeof lamaTerurai.value === "number"
            ? lamaTerurai.value
            : null;
        return (
          <CopyPanel>
            <div ref={titlePhaseRef} className={styles.phaseItem} data-reveal-phase="title">
              <SplitHeadline text={COPY["ch3.title"]} quality={quality} engine={engine} />
            </div>
            <div ref={leadPhaseRef} className={styles.phaseItem} data-reveal-phase="lead">
              <p className={`t-body-lg ${styles.line}`}>{COPY["ch3.sub"]}</p>
            </div>
            {verifiedYears !== null ? (
              <div ref={tailPhaseRef} className={styles.phaseItem} data-reveal-phase="tail">
                <DataCounter
                  segment="b3"
                  from={0}
                  to={verifiedYears}
                  unit={COPY["ch3.counter.label"]}
                  range={[0.25, 0.64]}
                  note={`Perkiraan (${lamaTerurai.publisher}, ${lamaTerurai.year})`}
                  engine={engine}
                />
              </div>
            ) : null}
          </CopyPanel>
        );
      }

      case 4: {
        const bleachFact = renderFactLine(FACTS["terumbu-pemutihan"]);
        const seaFact = renderFactLine(FACTS["kenaikan-laut"]);
        return (
          <CopyPanel>
            <div ref={titlePhaseRef} className={styles.phaseItem} data-reveal-phase="title">
              <SplitHeadline
                text={COPY["ch4.title"]}
                shimmer
                quality={quality}
                engine={engine}
              />
            </div>
            <div ref={leadPhaseRef} className={styles.phaseItem} data-reveal-phase="lead">
              <p className={`t-body-lg ${styles.line}`}>{COPY["ch4.line"]}</p>
            </div>
            <div ref={tailPhaseRef} className={styles.phaseItem} data-reveal-phase="tail">
              <p className={`t-body ${styles.sub}`}>{COPY["ch4.sub"]}</p>
              {bleachFact ? <p className={`t-ui-sm ${styles.fact}`}>{bleachFact}</p> : null}
              {seaFact ? <p className={`t-ui-sm ${styles.fact}`}>{seaFact}</p> : null}
            </div>
          </CopyPanel>
        );
      }

      case 5: {
        const particleTarget = quality === "low" ? 800 : quality === "medium" ? 1400 : 2400;
        return (
          <CopyPanel>
            <div ref={titlePhaseRef} className={styles.phaseItem} data-reveal-phase="title">
              <SplitHeadline
                text={COPY["ch5.title"]}
                melt
                shimmer
                quality={quality}
                engine={engine}
              />
            </div>
            <div ref={leadPhaseRef} className={styles.phaseItem} data-reveal-phase="lead">
              <p className={`t-body-lg ${styles.line}`}>{COPY["ch5.line"]}</p>
            </div>
            <div ref={tailPhaseRef} className={styles.phaseItem} data-reveal-phase="tail">
              <DataCounter
                segment="b5"
                from={0}
                to={particleTarget}
                unit={`${COPY["ch5.counter.label"]} (ilustrasi)`}
                range={[0.45, 0.65]}
                engine={engine}
              />
            </div>
          </CopyPanel>
        );
      }

      case 6: {
        const mpFact = FACTS["mikroplastik-mingguan"];
        const verifiedLine = renderFactLine(mpFact);
        return (
          <CopyPanel>
            <div ref={titlePhaseRef} className={styles.phaseItem} data-reveal-phase="title">
              <SplitHeadline
                text={COPY["ch6.title"]}
                melt
                shimmer
                quality={quality}
                engine={engine}
              />
            </div>
            <div ref={leadPhaseRef} className={styles.phaseItem} data-reveal-phase="lead">
              <p className={`t-body-lg ${styles.line}`}>
                {verifiedLine ?? COPY["ch6.fallback"]}
              </p>
            </div>
            <div ref={tailPhaseRef} className={styles.phaseItem} data-reveal-phase="tail">
              <p className={`t-body ${styles.sub}`}>{COPY["ch6.sub"]}</p>
              {verifiedLine ? (
                <p className={`t-ui-sm ${styles.fact}`}>
                  {COPY["ch6.footnote"]} ({mpFact.publisher}, {mpFact.year})
                </p>
              ) : null}
            </div>
          </CopyPanel>
        );
      }

      case 7:
        return (
          <div className={styles.stack}>
            <CopyPanel>
              <div ref={titlePhaseRef} className={styles.phaseItem} data-reveal-phase="title">
                <SplitHeadline text={COPY["ch7.title"]} quality={quality} engine={engine} />
              </div>
              <div ref={leadPhaseRef} className={styles.phaseItem} data-reveal-phase="lead">
                <p className={`t-body-lg ${styles.line}`}>{COPY["ch7.line"]}</p>
              </div>
              <div ref={tailPhaseRef} className={styles.phaseItem} data-reveal-phase="tail">
                <p className={`t-ui ${styles.bins}`}>{COPY["ch7.bins"]}</p>
              </div>
            </CopyPanel>
            <div ref={letterPhaseRef} className={`${styles.row} ${styles.phaseItem}`} data-reveal-phase="letter">
              <TimeRing segment="b7" max={10} unit="detik" engine={engine} />
              <LetterCard
                text={COPY["ch7.letter"]}
                segment="b7"
                wordRange={[0.28, 0.58]}
                tiltDeg={-0.6}
                engine={engine}
              />
            </div>
          </div>
        );

      case 8: {
        const collectedLine = renderFactLine(FACTS["botol-terkumpul"]);
        return (
          <div className={styles.stack}>
            <CopyPanel>
              <div ref={titlePhaseRef} className={styles.phaseItem} data-reveal-phase="title">
                <SplitHeadline text={COPY["ch8.title"]} quality={quality} engine={engine} />
              </div>
              <div ref={leadPhaseRef} className={styles.phaseItem} data-reveal-phase="lead">
                <p className={`t-body-lg ${styles.line}`}>{COPY["ch8.sub"]}</p>
              </div>
              {collectedLine ? (
                <div ref={tailPhaseRef} className={styles.phaseItem} data-reveal-phase="tail">
                  <p className={`t-ui-sm ${styles.fact}`}>{collectedLine}</p>
                </div>
              ) : null}
            </CopyPanel>
            <div ref={letterPhaseRef} className={styles.phaseItem} data-reveal-phase="letter">
              <LetterCard
                text={COPY["ch8.letter"]}
                segment="b8"
                wordRange={[0.26, 0.56]}
                tiltDeg={0.6}
                engine={engine}
              />
            </div>
          </div>
        );
      }

      case 9: {
        const fiberFact = FACTS["pet-menjadi-serat"];
        const showFiberNote = isFactVerified(fiberFact);
        return (
          <div className={styles.stack}>
            <CopyPanel>
              <div ref={titlePhaseRef} className={styles.phaseItem} data-reveal-phase="title">
                <SplitHeadline text={COPY["ch9.title"]} quality={quality} engine={engine} />
              </div>
              {showFiberNote ? (
                <div ref={leadPhaseRef} className={styles.phaseItem} data-reveal-phase="lead">
                  <p className={`t-ui-sm ${styles.fact}`}>{COPY["ch9.note"]}</p>
                </div>
              ) : null}
            </CopyPanel>
            <div ref={letterPhaseRef} className={styles.phaseItem} data-reveal-phase="letter">
              <LetterCard
                text={COPY["ch9.letter"]}
                segment="b9"
                wordRange={[0.24, 0.58]}
                tiltDeg={-0.5}
                engine={engine}
              />
            </div>
          </div>
        );
      }

      case 10:
        return (
          <div className={styles.b10Stage}>
            <div
              ref={sub10aRef}
              className={styles.b10Step}
              data-b10-step="10a"
            >
              <LetterCard
                text={COPY["ch10a.letter"]}
                segment="b10"
                wordRange={[0.02, 0.1]}
                tiltDeg={-0.6}
                engine={engine}
              />
            </div>

            <div
              ref={sub10bRef}
              className={styles.b10Step}
              data-b10-step="10b"
            >
              <LetterCard
                text={COPY["ch10b.letter"]}
                segment="b10"
                wordRange={[0.15, 0.24]}
                tiltDeg={0.5}
                engine={engine}
              />
            </div>

            <div
              ref={sub10dRef}
              className={styles.b10Step}
              data-b10-step="10d"
            >
              <CopyPanel light>
                <LetterCard
                  text={COPY["ch10d.letter"]}
                  segment="b10"
                  wordRange={[0.44, 0.62]}
                  tiltDeg={0}
                  engine={engine}
                />
              </CopyPanel>
            </div>
          </div>
        );
    }
  };

  return (
    <article
      ref={wrapRef}
      className={`${styles.chapter} ${sideClass} ${chapterLayoutClass}`.trim()}
      data-story-segment={segId}
      data-chapter={chapter}
      data-story-ui
    >
      {renderContent()}
    </article>
  );
}
