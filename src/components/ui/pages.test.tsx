import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePageTheme } from "./usePageTheme";

// Dibaca langsung dari berkas: sumber kebenaran tema ada di pages.css.
const pagesCss = readFileSync(resolve(process.cwd(), "src/styles/pages.css"), "utf8");

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function themeOf(page: string): Record<string, string> {
  const block = new RegExp(String.raw`:root\[data-page="${page}"\]\s*\{([^}]*)\}`).exec(pagesCss);
  if (!block?.[1]) throw new Error(`Tema ${page} tidak ditemukan`);
  const vars: Record<string, string> = {};
  for (const m of block[1].matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6})/gi)) {
    if (m[1] && m[2]) vars[m[1]] = m[2];
  }
  return vars;
}

describe("tema halaman", () => {
  for (const page of ["about", "konten", "artikel", "contact", "notfound"]) {
    it(`kontras teks ${page} >= 4,5:1`, () => {
      const t = themeOf(page);
      expect(contrast(t["--page-ink"] ?? "", t["--page-bg"] ?? "")).toBeGreaterThanOrEqual(4.5);
      expect(t["--ui-ink"]).toBe(t["--page-ink"]);
    });
  }

  it("usePageTheme menandai dan membersihkan data-page", () => {
    const { unmount } = renderHook(() => usePageTheme("about"));
    expect(document.documentElement.dataset.page).toBe("about");
    unmount();
    expect(document.documentElement.dataset.page).toBeUndefined();
  });
});
