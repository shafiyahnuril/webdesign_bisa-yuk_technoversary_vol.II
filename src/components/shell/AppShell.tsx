import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { RouteAnnouncer } from "./RouteAnnouncer";
import { Seo } from "./Seo";
import { SkipLink } from "./SkipLink";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Seo />
      <Navbar variant="static" />
      <main id="main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <RouteAnnouncer />
    </>
  );
}
