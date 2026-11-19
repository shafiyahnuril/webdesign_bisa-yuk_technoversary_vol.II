import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { RouteFade } from "@/components/ui/RouteFade";
import { CursorRing } from "./CursorRing";
import { MenuPanel } from "./MenuPanel";
import { Navbar } from "./Navbar";
import { RouteAnnouncer } from "./RouteAnnouncer";
import { Scrim } from "./Scrim";
import { Seo } from "./Seo";
import { SkipLink } from "./SkipLink";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  children: ReactNode;
  /**
   * Slot global untuk komponen AudioToggle (dari worker audio).
   * Bila disediakan, dirender pada posisi kiri-bawah (`z-index: var(--z-nav)`).
   */
  audioSlot?: ReactNode;
}

export function AppShell({ children, audioSlot }: AppShellProps) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isGallery = pathname === "/konten";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Pada halaman non-Home, pastikan identitas "Re:" menyala penuh
  useEffect(() => {
    if (!isHome) {
      document.documentElement.dataset.re = "on";
    }
  }, [isHome, pathname]);

  return (
    <>
      <SkipLink />
      <Seo />
      <Navbar
        variant={isHome ? "home" : "static"}
        menuOpen={menuOpen}
        onMenuToggle={toggleMenu}
        menuButtonRef={menuButtonRef}
        menuControlsId="menu-panel"
      />
      <Scrim open={menuOpen} onClick={closeMenu} />
      <MenuPanel
        id="menu-panel"
        open={menuOpen}
        onClose={closeMenu}
        triggerRef={menuButtonRef}
        mainId="main"
      />
      {audioSlot ? (
        <div className={styles.audioSlot} data-audio-slot data-story-ui>
          {audioSlot}
        </div>
      ) : null}
      <CursorRing
        enabled={isHome || isGallery || pathname === "/about" || pathname === "/contact"}
      />
      <main id="main" tabIndex={-1} className={styles.main}>
        <RouteFade>{children}</RouteFade>
      </main>
      <RouteAnnouncer />
    </>
  );
}
