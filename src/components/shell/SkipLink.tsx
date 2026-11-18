import type { MouseEvent } from "react";
import { COPY } from "@/content/copy";
import styles from "./SkipLink.module.css";

// HashRouter memakai hash untuk rute, jadi tautan "#main" biasa tidak boleh dipakai.
function focusMain(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById("main")?.focus();
}

export function SkipLink() {
  return (
    <a className={styles.skip} href="#main" onClick={focusMain}>
      {COPY.skip}
    </a>
  );
}
