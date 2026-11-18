import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { COPY } from "@/content/copy";
import { SITE } from "@/content/site";
import ContactPage from "./ContactPage";

describe("ContactPage", () => {
  it("menampilkan penutup kampanye sebagai H1, form, info tim, dan tautan", () => {
    render(
      <MemoryRouter initialEntries={["/contact"]}>
        <ContactPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Bawa botolmu besok.");
    expect(screen.getByRole("button", { name: COPY["contact.submit"] })).toBeTruthy();
    expect(screen.getByRole("link", { name: SITE.email }).getAttribute("href")).toBe(
      `mailto:${SITE.email}`,
    );
    expect(screen.getByRole("link", { name: /Tentang Re:bottle/ }).getAttribute("href")).toBe(
      "/about",
    );
    expect(screen.getByRole("link", { name: /Galeri Artikel/ }).getAttribute("href")).toBe(
      "/konten",
    );
    expect(document.documentElement.dataset.page).toBe("contact");
  });
});
