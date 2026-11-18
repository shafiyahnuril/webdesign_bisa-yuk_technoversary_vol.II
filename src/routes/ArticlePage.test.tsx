import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { sortDefault } from "@/components/content/filter";
import { rememberGallerySearch } from "@/components/content/galleryReturn";
import { nextInOrder } from "@/components/content/nextInOrder";
import { ARTICLES } from "@/content/articles";
import { COPY } from "@/content/copy";
import ArticlePage, { metaDescription } from "./ArticlePage";

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/konten/:slug" element={<ArticlePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => sessionStorage.clear());

describe("nextInOrder", () => {
  const ordered = sortDefault(ARTICLES);
  it("berputar: artikel ke-12 kembali ke artikel pertama", () => {
    const last = ordered[ordered.length - 1]!;
    expect(nextInOrder(ordered, last.slug)?.slug).toBe(ordered[0]!.slug);
  });
  it("artikel ke-n menuju ke-(n+1)", () => {
    expect(nextInOrder(ordered, ordered[0]!.slug)?.slug).toBe(ordered[1]!.slug);
  });
  it("slug tidak dikenal menghasilkan null", () => {
    expect(nextInOrder(ordered, "tidak-ada")).toBeNull();
  });
});

describe("ArticlePage", () => {
  const first = sortDefault(ARTICLES)[0]!;

  it("menampilkan H1, label ganda, gambar judul, isi atau keadaan kosong, dan artikel berikutnya", () => {
    renderAt(`/konten/${first.slug}`);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(first.title);
    expect(screen.getByText(/^Negatif · Sehari-hari/)).toBeTruthy();
    if (first.lede) {
      expect(screen.getByText(first.lede)).toBeTruthy();
      expect(screen.queryByText(COPY["article.empty"])).toBeNull();
      expect(screen.getAllByRole("link", { name: /.+/ }).length).toBeGreaterThan(0);
    } else {
      expect(screen.queryByText(/menit baca/)).toBeNull();
      expect(screen.getByText(COPY["article.empty"])).toBeTruthy();
    }
    expect(screen.getByRole("img", { name: /Gambar judul artikel/ })).toBeTruthy();
    expect(screen.getByRole("heading", { name: COPY["article.next"] })).toBeTruthy();
  });

  it("slug tidak dikenal merender halaman 404", () => {
    renderAt("/konten/tidak-ada");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(COPY["404.title"]);
  });

  it("tautan kembali membawa filter terakhir", () => {
    rememberGallerySearch("?jenis=negatif&level=global");
    renderAt(`/konten/${first.slug}`);
    const back = screen.getByRole("link", { name: COPY["article.back"] });
    expect(back.getAttribute("href")).toBe("/konten?jenis=negatif&level=global");
  });

  it("tanpa filter tersimpan, tautan kembali ke /konten", () => {
    renderAt(`/konten/${first.slug}`);
    expect(screen.getByRole("link", { name: COPY["article.back"] }).getAttribute("href")).toBe(
      "/konten",
    );
  });
});

describe("metaDescription", () => {
  it("kosong → undefined; panjang dipotong ≤ 155 karakter", () => {
    expect(metaDescription("  ")).toBeUndefined();
    expect(metaDescription("x".repeat(300))!.length).toBeLessThanOrEqual(155);
    expect(metaDescription("pendek")).toBe("pendek");
  });
});
