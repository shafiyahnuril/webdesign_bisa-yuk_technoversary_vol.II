import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { NavLink } from "react-router-dom";
import { BrandMark } from "@/components/ui/BrandMark";
import { COPY } from "@/content/copy";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { MenuButton } from "./MenuButton";
import styles from "./Navbar.module.css";

export type NavbarVariant = "static" | "home" | "story";

export interface NavbarProps {
  /**
   * `static` = menempel di halaman non-Home (latar 82% setelah gulir > 8px).
   * `home` / `story` = varian Home (mengempis saat `shown > 0.01`, terbuka kembali saat `shown < 0.003`).
   */
  variant?: NavbarVariant;
  /** Status buka/tutup panel menu. */
  menuOpen?: boolean;
  /** Callback toggle tombol menu bulat. */
  onMenuToggle?: () => void;
  /** Ref ke tombol menu bulat (untuk focus trap). */
  menuButtonRef?: RefObject<HTMLButtonElement | null>;
  /** ID elemen panel menu yang dikontrol. */
  menuControlsId?: string;
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

const LINKS = [
  { to: "/", label: COPY["nav.home"] },
  { to: "/about", label: COPY["nav.about"] },
  { to: "/konten", label: COPY["nav.content"] },
  { to: "/contact", label: COPY["nav.contact"] },
] as const;

const COLLAPSE_THRESHOLD = 0.01;
const EXPAND_THRESHOLD = 0.003;
const STATIC_SCROLL_PX = 8;

export function Navbar({
  variant = "static",
  menuOpen = false,
  onMenuToggle,
  menuButtonRef,
  menuControlsId = "menu-panel",
  engine = storyEngine,
}: NavbarProps) {
  const isHome = variant === "home" || variant === "story";
  const [storyCollapsed, setStoryCollapsed] = useState<boolean>(() =>
    isHome ? engine.state.shown > COLLAPSE_THRESHOLD : false,
  );
  const [staticScrolled, setStaticScrolled] = useState<boolean>(() =>
    !isHome && typeof window !== "undefined" ? window.scrollY > STATIC_SCROLL_PX : false,
  );

  const navWrapRef = useRef<HTMLElement | null>(null);
  const internalButtonRef = useRef<HTMLButtonElement | null>(null);
  const buttonRef = menuButtonRef ?? internalButtonRef;
  const collapsedRef = useRef<boolean>(storyCollapsed);

  // Histeresis shown 0.003 / 0.01 di Home lewat subscriber onFrame imperatif
  useEffect(() => {
    if (!isHome) {
      collapsedRef.current = false;
      return;
    }

    return engine.onFrame((shown) => {
      if (!collapsedRef.current && shown > COLLAPSE_THRESHOLD) {
        collapsedRef.current = true;
        setStoryCollapsed(true);
      } else if (collapsedRef.current && shown < EXPAND_THRESHOLD) {
        collapsedRef.current = false;
        setStoryCollapsed(false);
      }
    });
  }, [isHome, engine]);

  // Latar 82% setelah scrollY > 8px hanya untuk halaman non-Home (static)
  useEffect(() => {
    if (isHome || typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      const next = window.scrollY > STATIC_SCROLL_PX;
      setStaticScrolled((prev) => (prev !== next ? next : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const effectiveStoryCollapsed = isHome && storyCollapsed;
  const effectiveStaticScrolled = !isHome && staticScrolled;
  const isCollapsed = isHome ? effectiveStoryCollapsed || menuOpen : menuOpen;

  // Bila tautan mengempis saat salah satu tautan sedang fokus, pindahkan fokus ke tombol menu bulat
  useEffect(() => {
    if (!isCollapsed || menuOpen) return;
    const navEl = navWrapRef.current;
    const activeEl = document.activeElement;
    if (navEl && activeEl instanceof HTMLElement && navEl.contains(activeEl)) {
      buttonRef.current?.focus();
    }
  }, [isCollapsed, menuOpen, buttonRef]);

  const handlePrefetchHome = () => {
    if (!isHome) {
      void import("@/routes/HomePage");
    }
  };

  const navState = isCollapsed ? "collapsed" : effectiveStaticScrolled ? "scrolled" : "open";

  return (
    <header
      className={`${styles.navbar} ${isCollapsed ? styles.collapsed : ""} ${
        effectiveStaticScrolled ? styles.scrolled : ""
      }`}
      data-variant={variant}
      data-nav={navState}
      data-story-ui
    >
      <NavLink
        to="/"
        className={styles.brand}
        aria-label="Re:bottle, ke halaman utama"
        onMouseEnter={handlePrefetchHome}
        data-hover
      >
        <BrandMark size="nav" />
      </NavLink>

      <div className={styles.right}>
        <nav
          ref={navWrapRef}
          aria-label="Utama"
          aria-hidden={isCollapsed}
          className={styles.navWrap}
        >
          <ul className={styles.links}>
            {LINKS.map((link, idx) => (
              <li
                key={link.to}
                className={styles.item}
                style={{ "--rev-idx": LINKS.length - 1 - idx } as CSSProperties}
              >
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  tabIndex={isCollapsed ? -1 : 0}
                  onMouseEnter={link.to === "/" ? handlePrefetchHome : undefined}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                  }
                  data-hover
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <MenuButton
          ref={buttonRef}
          open={menuOpen}
          onToggle={() => onMenuToggle?.()}
          controlsId={menuControlsId}
        />
      </div>
    </header>
  );
}
