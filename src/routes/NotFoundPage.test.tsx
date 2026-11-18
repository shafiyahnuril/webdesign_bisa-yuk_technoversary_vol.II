import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { COPY } from "@/content/copy";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("menampilkan H1 dan tombol kembali ke awal", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(COPY["404.title"]);
    const link = screen.getByRole("link", { name: COPY["404.cta"] });
    // HashRouter memakai "/" internal; MemoryRouter menampilkannya apa adanya.
    expect(link.getAttribute("href")).toBe("/");
  });

  it("menandai tema notfound", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(document.documentElement.dataset.page).toBe("notfound");
  });
});
