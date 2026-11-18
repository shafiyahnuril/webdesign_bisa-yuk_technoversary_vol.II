import { useEffect } from "react";
import "@/styles/pages.css";

export type PageTheme = "about" | "konten" | "artikel" | "contact" | "notfound";

/** Menandai <html data-page> selama halaman tampil; dibersihkan saat unmount. */
export function usePageTheme(theme: PageTheme): void {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.page = theme;
    return () => {
      if (root.dataset.page === theme) delete root.dataset.page;
    };
  }, [theme]);
}
