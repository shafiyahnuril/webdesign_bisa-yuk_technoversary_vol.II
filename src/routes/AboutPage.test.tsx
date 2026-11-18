import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CountUp } from "@/components/content/CountUp";
import { FactCard } from "@/components/content/FactCard";
import { factParts, formatFactValue } from "@/components/content/factUtils";
import { TempDiagram } from "@/components/content/TempDiagram";
import { COPY } from "@/content/copy";
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

describe("AboutPage", () => {
  it("memuat enam bagian berurutan dengan judul yang sama ukurannya", () => {
    const { container } = renderPage();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(COPY["about.hero.title"]);
    expect(screen.getByText("Kampanye Peduli Lingkungan")).toBeTruthy();
    const titles = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual([
      COPY["about.background.title"],
      COPY["about.scenarios.title"],
      COPY["about.facts.title"],
      COPY["about.temp.section"],
    ]);
    for (const h of screen.getAllByRole("heading", { level: 2 })) {
      expect(h.className).toContain("t-h2");
    }
    // Hero, empat bagian bertajuk, dan penutup.
    expect(container.querySelectorAll("header, section").length).toBe(6);
    const closing = document.getElementById("penutup") as HTMLElement;
    expect(within(closing).getByText(COPY["about.closing"])).toBeTruthy();
    expect(document.documentElement.dataset.page).toBe("about");
  });

  it("tidak memuat bagian Sumber data, Lisensi dan kredit, atau Tim", () => {
    renderPage();
    for (const key of ["about.sources.title", "about.licenses.title", "about.team.title"] as const) {
      expect(screen.queryByRole("heading", { name: COPY[key] })).toBeNull();
    }
    expect(document.querySelector("details")).toBeNull();
  });

  it("tidak menampilkan placeholder, penanda DEV, atau teks TODO", () => {
    const { container } = renderPage();
    const text = container.textContent ?? "";
    for (const bad of ["[DATA]", "menyusul", "TODO", "{X}"]) expect(text).not.toContain(bad);
    expect(container.querySelector("[data-fact-pending]")).toBeNull();
  });

  it("dua skenario: teks baru, sama tinggi, tanpa angka atau kata suhu", () => {
    renderPage();
    const section = document.getElementById("dua-skenario") as HTMLElement;
    const text = within(section).getByRole("list").textContent ?? "";
    expect(text).toContain(COPY["about.scenario.a.title"]);
    expect(text).toContain(COPY["about.scenario.a.body"]);
    expect(text).toContain(COPY["about.scenario.b.title"]);
    expect(text).toContain(COPY["about.scenario.b.body"]);
    expect(within(section).getAllByRole("article")).toHaveLength(2);
    expect(within(section).getByText("Skenario ilustrasi, bukan prediksi.")).toBeTruthy();
    expect(section.textContent ?? "").not.toMatch(/\d|°|suhu|derajat|pemanasan/i);
  });

  it("memakai ulang teks latar belakang dari copy.ts", () => {
    renderPage();
    expect(screen.getByText(COPY["about.background.1"])).toBeTruthy();
    expect(screen.getByText(COPY["about.background.2"])).toBeTruthy();
  });

  it("angka suhu hanya ada di bagian Suhu dan target 1,5°C", () => {
    renderPage();
    const temp = document.getElementById("suhu") as HTMLElement;
    expect(temp.textContent).toContain("1,5°C");
    for (const id of ["latar-belakang", "dua-skenario", "angka"]) {
      expect(document.getElementById(id)?.textContent ?? "").not.toContain("°C");
    }
  });

  it("hanya menampilkan fakta terverifikasi sebagai kartu, masing-masing dengan chip sumber", () => {
    const { container } = renderPage();
    const cards = container.querySelectorAll("figure[data-cursor='info']");
    const verified = Object.values(FACTS as Record<string, Fact>).filter(
      (f) => f.verified && f.value !== null,
    );
    expect(cards.length).toBe(verified.length);
    for (const card of cards) expect(card.querySelector("a[rel='noopener noreferrer']")).toBeTruthy();
  });

  it("indeks samping enam entri, hanya-baca (tanpa tombol atau tautan)", () => {
    const { container } = renderPage();
    const aside = container.querySelector("aside");
    expect(aside?.getAttribute("aria-hidden")).toBe("true");
    expect(aside?.querySelectorAll("li").length).toBe(6);
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
