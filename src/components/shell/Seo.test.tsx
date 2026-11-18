import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Seo } from "./Seo";

function metaFor(path: string) {
  const { unmount } = render(
    <MemoryRouter initialEntries={[path]}>
      <Seo />
    </MemoryRouter>,
  );
  const result = {
    title: document.title,
    description: document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? "",
  };
  unmount();
  return result;
}

describe("Seo", () => {
  const routes = ["/", "/about", "/konten", "/contact", "/tidak-ada"];

  it("memberi judul dan description unik per halaman, description ≤ 155 karakter", () => {
    const metas = routes.map(metaFor);
    expect(new Set(metas.map((m) => m.title)).size).toBe(routes.length);
    expect(new Set(metas.map((m) => m.description)).size).toBe(routes.length);
    for (const m of metas) {
      expect(m.description.length).toBeGreaterThan(0);
      expect(m.description.length).toBeLessThanOrEqual(155);
    }
  });
});
