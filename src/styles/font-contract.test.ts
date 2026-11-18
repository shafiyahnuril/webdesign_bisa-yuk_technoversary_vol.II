import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(resolve(process.cwd(), "src/styles", name), "utf8");

describe("kontrak font-family", () => {
  const tokens = read("tokens.css");
  const typography = read("typography.css");

  it("empat deklarasi --font-* hidup di tokens.css lengkap dengan fallback bermetrik", () => {
    for (const fallback of [
      "Bricolage Fallback",
      "Instrument Fallback",
      "Caveat Fallback",
      "JetBrains Fallback",
    ]) {
      expect(tokens).toContain(fallback);
    }
    for (const family of ["--font-display", "--font-ui", "--font-hand", "--font-mono"]) {
      expect(tokens).toContain(`${family}:`);
    }
  });

  it("typography.css tidak lagi menimpa --font-* dan tetap memuat @font-face fallback", () => {
    expect(typography).not.toContain("--font-display:");
    expect(typography).not.toContain("--font-ui:");
    expect(typography).not.toContain("--font-hand:");
    expect(typography).not.toContain("--font-mono:");
    expect(typography).toContain('@font-face');
    expect(typography).toContain(".t-hero");
  });
});
