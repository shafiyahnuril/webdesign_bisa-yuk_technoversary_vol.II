import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { createAudioEngine, isAudioSupported, type AudioController } from "@/audio/audio-engine";
import { COPY } from "@/content/copy";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import styles from "./AudioToggle.module.css";

export interface AudioToggleProps {
  engine?: StoryEngine;
  className?: string;
}

function SoundOnIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 8c3-4 6 4 9 0s6-4 9 0M3 12c3-4 6 4 9 0s6-4 9 0M3 16c3-4 6 4 9 0s6-4 9 0"
      />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5 19 19 5"
      />
    </svg>
  );
}

/**
 * Tombol suara global (default mati; AudioContext dibuat hanya saat klik pengguna).
 */
export function AudioToggle({ engine = storyEngine, className }: AudioToggleProps) {
  const supported = isAudioSupported();
  const { pathname } = useLocation();
  const isHomeRoute = pathname === "/";
  const [enabled, setEnabled] = useState(false);
  const controllerRef = useRef<AudioController | null>(null);

  useEffect(() => {
    if (!supported) return;
    const controller = createAudioEngine();
    controllerRef.current = controller;

    let lastPaused = engine.state.paused;
    controller.setDucked(lastPaused);

    const syncDuck = () => {
      if (engine.state.paused !== lastPaused) {
        lastPaused = engine.state.paused;
        controller.setDucked(lastPaused);
      }
    };

    const unsubFrame = engine.onFrame((shown, dt) => {
      syncDuck();
      controller.update(shown, dt);
    });
    const unsubChapter = engine.onChapter(() => {
      syncDuck();
    });

    return () => {
      unsubFrame();
      unsubChapter();
      controller.dispose();
      controllerRef.current = null;
      setEnabled(false);
    };
  }, [engine, supported]);

  useEffect(() => {
    controllerRef.current?.setRouteActive(isHomeRoute);
  }, [isHomeRoute, engine, supported]);

  if (!supported) {
    return null;
  }

  const handleClick = () => {
    const controller = controllerRef.current;
    if (!controller) return;
    const next = !enabled;
    setEnabled(next);
    void controller
      .setEnabled(next)
      .catch(() => {
        // Kembalikan status tombol secara aman bila izin audio ditolak
      })
      .finally(() => {
        if (controllerRef.current === controller) {
          setEnabled(controller.isEnabled());
        }
      });
  };

  const label = enabled ? COPY["audio.off"] : COPY["audio.on"];

  return (
    <button
      type="button"
      className={className ? `${styles.toggle} ${className}` : styles.toggle}
      aria-label={label}
      aria-pressed={enabled}
      data-active={enabled ? "true" : "false"}
      onClick={handleClick}
    >
      {enabled ? <SoundOnIcon /> : <SoundOffIcon />}
    </button>
  );
}
