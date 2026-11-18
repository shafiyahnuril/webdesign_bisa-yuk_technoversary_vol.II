import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CountUp } from "@/components/content/CountUp";
import { CreditChips } from "@/components/content/CreditChips";
import { FactCard } from "@/components/content/FactCard";
import { factParts, formatFactValue } from "@/components/content/factUtils";
import { SourceAccordion } from "@/components/content/SourceAccordion";
import { buildSourceGroups } from "@/components/content/sourceGroups";
import { TempDiagram } from "@/components/content/TempDiagram";
import type { Article } from "@/content/articles";
import { COPY } from "@/content/copy";
import { CREDITS } from "@/content/credits";
import { FACTS, type Fact } from "@/content/facts";
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

function renderPage() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  );
}

describe("TempDiagram", () => {
  it("menyediakan label, catatan jujur, dan tabel ringkasan tersembunyi", () => {
    const { container } = render(<TempDiagram />);
    expect(screen.getByRole("figure", { name: COPY["about.temp.diagram.title"] })).toBeTruthy();
    const table = screen.getByRole("table");
    expect(table.className).toContain("sr-only");
    expect(within(table).getByText(COPY["about.temp.band1"])).toBeTruthy();
    expect(within(table).getByText(COPY["about.temp.band2"])).toBeTruthy();
    expect(screen.getByText(COPY["about.temp.diagram.note"])).toBeTruthy();
    // Bagian visual disembunyikan dari pembaca layar; datanya ada di tabel.
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });
});

describe("angka dan kartu fakta", () => {
  it("memecah nilai fakta menjadi prefiks, angka, sufiks, dan satuan", () => {
    expect(factParts({ ...baseFact, value: "84%", unit: undefined })).toMatchObject({
      prefix: "",
      number: 84,
      suffix: "%",
    });
    expect(factParts({ ...baseFact, value: "lebih dari 90%", unit: undefined })).toMatchObject({
      prefix: "lebih dari",
      number: 90,
      suffix: "%",
    });
    expect(factParts({ ...baseFact, value: 4.5, unit: "mm" })).toMatchObject({
      number: 4.5,
      decimals: 1,
      unit: "mm",
    });
  });

  it("memakai koma desimal pada kalimat fakta", () => {
    expect(formatFactValue({ ...baseFact, value: 4.5, unit: "mm" })).toBe("4,5 mm");
  });

  it("CountUp memuat nilai akhir sejak render pertama", () => {
    const { container } = render(<CountUp to={460} active={false} />);
    expect(container.textContent).toBe("460");
  });

  it("FactCard menampilkan kalimat, satuan terpisah, dan chip sumber aman", () => {
    render(<FactCard fact={baseFact} />);
    expect(screen.getByText("Nilainya 12 juta ton per tahun.")).toBeTruthy();
    expect(screen.getByText("juta ton", { selector: "p" })).toBeTruthy();
    const link = screen.getByRole("link", { name: /Lembaga A, 2023/ });
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.getAttribute("target")).toBe("_blank");
  });
});

describe("SourceAccordion", () => {
  const groups = buildSourceGroups(
    { ok: baseFact, belum: { ...baseFact, verified: false, sourceUrl: "https://example.org/belum" } },
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

  it("hanya memuat sumber terverifikasi; kelompok pertama terbuka, sisanya tertutup", () => {
    expect(groups.map((g) => g.title)).toEqual([COPY["about.sources.facts"], "Artikel Dua"]);
    const { container } = render(<SourceAccordion groups={groups} />);
    const details = container.querySelectorAll("details");
    expect(details).toHaveLength(2);
    expect(details[0]?.open).toBe(true);
    expect(details[1]?.open).toBe(false);
    expect(screen.getAllByText("1 sumber")).toHaveLength(2);
    for (const a of container.querySelectorAll("ol a")) {
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("menampilkan catatan bila belum ada sumber", () => {
    render(<SourceAccordion groups={[]} />);
    expect(screen.getByText(COPY["about.sources.empty"])).toBeTruthy();
  });
});

describe("CreditChips", () => {
  it("menampilkan seluruh isi credits.ts dalam tiga kelompok dan menyembunyikan metode TODO", () => {
    const { container } = render(<CreditChips credits={CREDITS} />);
    for (const c of CREDITS) expect(container.textContent).toContain(c.name);
    expect(screen.getByRole("heading", { name: COPY["about.licenses.type.font"] })).toBeTruthy();
    expect(screen.getByRole("heading", { name: COPY["about.licenses.type.lib"] })).toBeTruthy();
    expect(screen.getByRole("heading", { name: COPY["about.licenses.group.asset"] })).toBeTruthy();
    expect(container.textContent).not.toContain("TODO");
  });

  it("menulis nama font dengan font itu sendiri", () => {
    render(<CreditChips credits={CREDITS} />);
    const caveat = screen.getByText(/^Caveat/);
    expect((caveat as HTMLElement).style.fontFamily).toBe("var(--font-hand)");
  });
});

describe("AboutPage", () => {
  it("menampilkan H1, subtema, bagian bertajuk, dan penutup tanpa teks TODO", () => {
    const { container } = renderPage();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(COPY["about.hero.title"]);
    expect(screen.getByText("Kampanye Peduli Lingkungan")).toBeTruthy();
    const titles = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual(
      expect.arrayContaining([
        COPY["about.background.title"],
        COPY["about.scenarios.title"],
        COPY["about.temp.section"],
        COPY["about.sources.title"],
        COPY["about.licenses.title"],
        COPY["about.team.title"],
      ]),
    );
    expect(screen.getByText(COPY["about.closing"])).toBeTruthy();
    expect(container.textContent).not.toContain("TODO");
    expect(document.documentElement.dataset.page).toBe("about");
  });

  it("memakai ulang teks copy.ts untuk latar belakang dan skenario", () => {
    renderPage();
    expect(screen.getByText(COPY["about.background.1"])).toBeTruthy();
    expect(screen.getByText(COPY["about.background.2"])).toBeTruthy();
    expect(screen.getByText(COPY["about.scenario.body"])).toBeTruthy();
    expect(screen.getByText(COPY["about.temp.band1.desc"])).toBeTruthy();
    expect(screen.getByText(COPY["about.temp.band2.desc"])).toBeTruthy();
  });

  it("hanya menampilkan fakta terverifikasi sebagai kartu (selebihnya penanda DEV)", () => {
    const { container } = renderPage();
    const cards = container.querySelectorAll("figure[data-cursor='info']");
    const verified = Object.values(FACTS as Record<string, Fact>).filter(
      (f) => f.verified && f.value !== null,
    );
    // Satu kartu per fakta terverifikasi (di Latar belakang atau Angka); diagram suhu bukan kartu.
    expect(cards.length).toBe(verified.length);
    for (const el of container.querySelectorAll("[data-fact-pending]")) {
      expect(el.textContent).toContain(COPY["about.fact.dev"]);
    }
  });

  it("menjadikan indeks samping hanya-baca (tanpa tombol atau tautan)", () => {
    const { container } = renderPage();
    const aside = container.querySelector("aside");
    expect(aside?.getAttribute("aria-hidden")).toBe("true");
    expect(aside?.querySelector("a, button")).toBeNull();
  });

  it("memberi tautan penutup ke beranda dan Contact", () => {
    renderPage();
    expect(screen.getByRole("link", { name: COPY["about.closing.home"] }).getAttribute("href")).toBe("/");
    expect(
      screen.getByRole("link", { name: new RegExp(COPY["about.closing.contact"]) }).getAttribute("href"),
    ).toBe("/contact");
  });

  it("membersihkan listener gulir saat unmount", () => {
    const { unmount } = renderPage();
    act(() => {
      fireEvent.scroll(window);
    });
    expect(() => unmount()).not.toThrow();
  });
});
