import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DUR, STAGGER } from "./tokens";

const generated = readFileSync(resolve(process.cwd(), "src/styles/tokens.generated.css"), "utf8");

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

describe("token durasi", () => {
  it("setiap durasi dan alias stagger punya variabel hasil generate", () => {
    for (const [k, v] of Object.entries(DUR)) {
      expect(generated).toContain(`--dur-${kebab(k)}: ${v}s;`);
    }
    for (const [k, v] of Object.entries(STAGGER)) {
      expect(generated).toContain(`--stagger-${kebab(k)}: ${v}s;`);
    }
  });

  it("prefers-reduced-motion menyetel nol untuk seluruh durasi", () => {
    const main = generated.match(/:root \{([\s\S]*?)\n\}/)?.[1] ?? "";
    const reduced = generated.match(
      /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/,
    )?.[0];
    expect(reduced).toBeTruthy();

    const durations = [...main.matchAll(/(--(?:dur|stagger)-[a-z0-9-]+):/g)].map((m) => m[1]);
    expect(durations.length).toBe(Object.keys(DUR).length + Object.keys(STAGGER).length);
    for (const name of durations) {
      expect(reduced).toContain(`${name}: 0s;`);
    }
  });
});
