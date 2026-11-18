import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { FactBlock } from "@/components/content/FactBlock";
import { LicenseTable } from "@/components/content/LicenseTable";
import { SourceList } from "@/components/content/SourceList";
import { buildSourceGroups } from "@/components/content/sourceGroups";
import { TempDiagram } from "@/components/content/TempDiagram";
import type { Article } from "@/content/articles";
import { COPY } from "@/content/copy";
import type { Fact } from "@/content/facts";
import AboutPage from "./AboutPage";

const baseFact: Fact = {
  key: "k",
  statement: "Nilainya {X} per tahun.",
  value: 12,
  unit: "juta ton",
  scope: "Global",
  year: 2023,
  sourceTitle: "Laporan",
  sourceUrl: "https://example.org/laporan",
  publisher: "Lembaga A",
  accessed: "2026-11-18",
  verified: true,
};

const baseArticle: Article = {
  code: "A1",
  slug: "a1",
  title: "Artikel Satu",
  kind: "negatif",
  level: "global",
  readingMinutes: 5,
  summary: "s",
  cover: "img/articles/cover-A1.svg",
  lede: "",
  sections: [],
  relation: "",
  sources: [],
};

describe("TempDiagram", () => {
  it("menyediakan judul SVG dan tabel ringkasan tersembunyi", () => {
    render(<TempDiagram />);
    // Nama aksesibel = judul + deskripsi (aria-labelledby dua id).
    const svg = screen.getByRole("img", { name: new RegExp(COPY["about.temp.diagram.title"]) });
    expect(svg.querySelector("title")?.textContent).toBe(COPY["about.temp.diagram.title"]);
    const table = screen.getByRole("table");
    expect(table.className).toContain("sr-only");
    expect(within(table).getByText(COPY["about.temp.band1"])).toBeTruthy();
    expect(within(table).getByText(COPY["about.temp.band2"])).toBeTruthy();
    expect(screen.getAllByText(COPY["about.temp.diagram.note"]).length).toBeGreaterThan(0);
  });
});

describe("FactBlock", () => {
  it("tersembunyi bila fakta belum terverifikasi (produksi)", () => {
    // FACTS nyata semuanya `verified: false`; di bawah Vitest `DEV` = true, jadi hanya penanda [DATA].
    const { container } = render(
      <FactBlock value="" label="Kamu makan sekitar {X}." source={{ id: "mikroplastik-mingguan" }} />,
    );
    expect(container.querySelector(".t-data")?.textContent).toBe(COPY["about.fact.dev"]);
    expect(container.textContent).not.toMatch(/\d/);
  });

  it("tidak menampilkan nilai bila value kosong atau id tidak dikenal", () => {
    const { container } = render(<FactBlock value="450" label="x" source={{ id: "tidak-ada" }} />);
    expect(container.textContent).not.toContain("450");
  });
});

describe("SourceList", () => {
  it("hanya memuat sumber fakta terverifikasi dan artikel yang punya sumber", () => {
    const groups = buildSourceGroups(
      {
        ok: baseFact,
        belum: { ...baseFact, verified: false, sourceUrl: "https://example.org/belum" },
        kosong: { ...baseFact, value: null, sourceUrl: "https://example.org/kosong" },
        todo: { ...baseFact, sourceUrl: "TODO" },
      },
      [
        baseArticle,
        {
          ...baseArticle,
          code: "A2",
          title: "Artikel Dua",
          sources: [{ title: "S", url: "https://example.org/s", publisher: "B", year: 2022 }],
        },
      ],
    );
    expect(groups.map((g) => g.title)).toEqual([COPY["about.sources.facts"], "Artikel Dua"]);
    expect(groups[0]?.items).toHaveLength(1);

    render(<SourceList groups={groups} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    for (const a of links) {
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("menampilkan catatan bila belum ada sumber", () => {
    render(<SourceList groups={[]} />);
    expect(screen.getByText(COPY["about.sources.empty"])).toBeTruthy();
  });
});

describe("LicenseTable", () => {
  it("menyembunyikan metode yang masih TODO", () => {
    render(
      <LicenseTable
        credits={[
          { type: "illustration", name: "Sampul", license: "Hak milik tim", method: "TODO: isi" },
        ]}
      />,
    );
    expect(screen.queryByText(/TODO/)).toBeNull();
  });
});

describe("AboutPage", () => {
  it("menampilkan H1, subtema, dan tujuh bagian tanpa teks TODO", () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(COPY["about.hero.title"]);
    expect(screen.getByText("Kampanye Peduli Lingkungan")).toBeTruthy();
    // Hitung bagian utama; kelompok sumber artikel berada di dalamnya.
    expect(container.querySelectorAll(":scope > div > section").length).toBe(6);
    expect(screen.getByText(COPY["about.closing"])).toBeTruthy();
    expect(container.textContent).not.toContain("TODO");
    expect(document.documentElement.dataset.page).toBe("about");
  });
});
