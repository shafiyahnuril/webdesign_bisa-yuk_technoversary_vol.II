import { useEffect, useId, useMemo, useRef, type CSSProperties, type ElementType } from "react";
import { computeCues } from "@/engine/cues";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./SplitHeadline.module.css";

export interface SplitHeadlineProps {
  /** Teks judul bab yang akan dipecah per huruf. */
  text: string;
  /** Elemen heading pembungkus. Default: "h2". */
  as?: ElementType;
  /** Aktifkan efek meleleh (`--melt`) untuk Bab 5 & 6. Default: false. */
  melt?: boolean;
  /** Aktifkan efek heat shimmer (filter SVG area teks kecil) untuk Bab 4, 5, 6. Default: false. */
  shimmer?: boolean;
  /** Tier kualitas saat ini ("high" | "medium" | "low"). Pada "low", filter SVG & melt dimatikan. */
  quality?: "high" | "medium" | "low";
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
  className?: string;
}

interface LetterParams {
  ch: string;
  drop: number;
  stretch: number;
  skew: number;
}

/** PRNG deterministik sederhana per huruf agar seed konsisten di tiap render. */
export function splitLetters(text: string): LetterParams[] {
  let hash = 2166136261;
  return Array.from(text).map((ch, idx) => {
    hash ^= ch.charCodeAt(0) + idx * 31;
    hash = Math.imul(hash, 16777619);
    const u1 = ((hash >>> 0) % 1000) / 1000;
    const u2 = (((hash >>> 10) ^ (idx * 97)) % 1000) / 1000;
    const u3 = (((hash >>> 20) ^ (idx * 53)) % 1000) / 1000;

    return {
      ch,
      drop: Number((0.4 + u1 * 1.2).toFixed(2)), // 0.4..1.6
      stretch: Number((0.5 + u2 * 1.0).toFixed(2)), // 0.5..1.5
      skew: Number((-6 + u3 * 12).toFixed(2)), // -6..+6
    };
  });
}

/**
 * Judul bab dengan efek meleleh (`--melt`, Bab 5 & 6) dan filter SVG distorsi panas
 * pada area teks kecil saja. Pada tier `low` atau `prefers-reduced-motion`,
 * seluruh efek distorsi/meleleh dihilangkan demi performa dan aksesibilitas.
 */
export function SplitHeadline({
  text,
  as: Component = "h2",
  melt = false,
  shimmer = false,
  quality = "high",
  engine = storyEngine,
  className,
}: SplitHeadlineProps) {
  const reducedMotion = useReducedMotion();
  const rawId = useId();
  const filterId = `story-heat-${rawId.replace(/:/g, "")}`;
  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null);

  const allowEffects = !reducedMotion && quality !== "low";
  const activeMelt = melt && allowEffects;
  const activeFilter = (melt || shimmer) && allowEffects;

  const letters = useMemo(() => splitLetters(text), [text]);

  useEffect(() => {
    const disp = displacementRef.current;
    if (!activeFilter || !disp) return;

    const updateFilter = (shown: number) => {
      const cues = computeCues(shown);
      const scale = activeMelt ? cues.melt * 14 : cues.shimmer * 1.5;
      disp.setAttribute("scale", scale.toFixed(2));
    };

    updateFilter(engine.state.shown);
    return engine.onFrame((shown) => updateFilter(shown));
  }, [activeFilter, activeMelt, engine]);

  const classes = [
    "t-chapter",
    styles.headline,
    activeMelt ? styles.melt : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
      style={activeFilter ? ({ filter: `url(#${filterId})` } as CSSProperties) : undefined}
      data-split-headline
      data-melt={activeMelt ? "on" : "off"}
    >
      {activeFilter ? (
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          focusable="false"
          className={styles.filterSvg}
        >
          <defs>
            <filter id={filterId} x="-15%" y="-25%" width="130%" height="150%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012"
                numOctaves={2}
                seed={7}
              />
              <feDisplacementMap
                ref={displacementRef}
                in="SourceGraphic"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
                data-heat-scale
              />
            </filter>
          </defs>
        </svg>
      ) : null}

      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={styles.letters}>
        {letters.map((item, idx) =>
          item.ch === " " ? (
            <span key={idx} className={styles.space}>
              {"\u00A0"}
            </span>
          ) : (
            <span
              key={idx}
              className={styles.char}
              style={
                activeMelt
                  ? ({
                      "--d": item.drop,
                      "--s": item.stretch,
                      "--k": item.skew,
                    } as CSSProperties)
                  : undefined
              }
            >
              {item.ch}
            </span>
          ),
        )}
      </span>
    </Component>
  );
}
