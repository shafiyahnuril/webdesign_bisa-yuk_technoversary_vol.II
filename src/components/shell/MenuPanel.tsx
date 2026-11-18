import { useEffect, useRef, type CSSProperties, type MouseEvent, type RefObject, type TouchEvent } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BrandMark } from "@/components/ui/BrandMark";
import { COPY } from "@/content/copy";
import { SITE } from "@/content/site";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import styles from "./MenuPanel.module.css";

export interface MenuPanelProps {
  /** Apakah panel menu terbuka. */
  open: boolean;
  /** Callback untuk menutup panel menu. */
  onClose: () => void;
  /** Referensi ke tombol menu di navbar agar masuk dalam focus trap dan menerima fokus kembali. */
  triggerRef?: RefObject<HTMLElement | null>;
  /** ID elemen main yang diberi atribut `inert` saat menu terbuka. Default: "main". */
  mainId?: string;
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
  /** ID elemen dialog. Default: "menu-panel". */
  id?: string;
}

const MENU_LINKS = [
  { num: "01", to: "/", label: COPY["nav.home"] },
  { num: "02", to: "/about", label: COPY["nav.about"] },
  { num: "03", to: "/konten", label: COPY["nav.content"] },
  { num: "04", to: "/contact", label: COPY["nav.contact"] },
] as const;

const SWIPE_MIN_DX = 80;
const SWIPE_MIN_VELOCITY = 0.3;

export function MenuPanel({
  open,
  onClose,
  triggerRef,
  mainId = "main",
  engine = storyEngine,
  id = "menu-panel",
}: MenuPanelProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const { pathname } = useLocation();

  useFocusTrap({
    active: open,
    containerRef: panelRef,
    triggerRef,
    initialFocusRef: firstLinkRef,
    onEscape: onClose,
  });

  // Kunci gulir tanpa loncatan, jeda engine, dan set inert hanya pada <main>
  useEffect(() => {
    const mainEl = document.getElementById(mainId);
    const htmlEl = document.documentElement;

    if (open) {
      engine.pause();
      const prevOverflow = htmlEl.style.overflow;
      htmlEl.style.overflow = "hidden";
      if (mainEl) {
        mainEl.inert = true;
        mainEl.setAttribute("inert", "");
      }
      return () => {
        htmlEl.style.overflow = prevOverflow;
        if (mainEl) {
          mainEl.inert = false;
          mainEl.removeAttribute("inert");
        }
        engine.resume();
      };
    }
    return undefined;
  }, [open, mainId, engine]);

  const handleLinkClick = (to: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (to === "/" && pathname === "/") {
      // Klik Home saat sudah di Home: hanya menutup menu tanpa mereset cerita
      event.preventDefault();
      onClose();
      return;
    }
    onClose();
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
    };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = Math.abs(touch.clientY - start.y);
    const dt = Math.max(1, performance.now() - start.time);
    const velocity = dx / dt;

    if (dx > SWIPE_MIN_DX && dx > dy && velocity >= SWIPE_MIN_VELOCITY) {
      onClose();
    }
  };

  const emailDisplay = SITE.email.includes("TODO") ? "" : SITE.email;

  return (
    <aside
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      className={`${styles.panel} ${open ? styles.open : ""}`}
      data-menu-panel
      data-open={open ? "true" : "false"}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.contents}>
        <nav aria-label="Menu utama">
          <ol className={styles.links}>
            {MENU_LINKS.map((item, idx) => (
              <li
                key={item.to}
                className={styles.item}
                style={{ "--n": idx } as CSSProperties}
              >
                <NavLink
                  ref={idx === 0 ? firstLinkRef : undefined}
                  to={item.to}
                  end={item.to === "/"}
                  tabIndex={open ? 0 : -1}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                  }
                  onClick={handleLinkClick(item.to)}
                  data-hover
                >
                  <sup className={styles.number}>{item.num}</sup>
                  <span className={styles.label}>{item.label}</span>
                  <svg
                    className={styles.arrow}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M5 5l14 14M9 19h10V9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </NavLink>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className={styles.footer}>
        <div className={styles.identity}>
          <BrandMark as="p" size="menu" onLight />
          <p className={styles.tagline}>{SITE.tagline}</p>
          <p className={styles.subtheme}>{SITE.subtheme}</p>
        </div>

        <div className={styles.contact}>
          {emailDisplay ? (
            <p>
              <a
                href={`mailto:${emailDisplay}`}
                className={styles.contactLink}
                tabIndex={open ? 0 : -1}
              >
                {emailDisplay}
              </a>
            </p>
          ) : null}
          <p className={styles.competition}>{SITE.competition}</p>
        </div>
      </div>
    </aside>
  );
}
