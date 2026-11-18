import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { COPY } from "@/content/copy";
import { ArticleBody } from "./ArticleBody";
import { SourceItem } from "./SourceItem";

describe("ArticleBody", () => {
  it("merender lede, H2, paragraf, dan kotak kaitan dari data", () => {
    render(
      <ArticleBody
        lede="Lede."
        sections={[{ heading: "Konteks", paragraphs: ["Satu.", "Dua."] }]}
        relation="Kaitan."
      />,
    );
    expect(screen.getByText("Lede.")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Konteks" })).toBeTruthy();
    expect(screen.getByText("Dua.")).toBeTruthy();
    expect(screen.getByText("Kaitan.")).toBeTruthy();
  });
  it("sections kosong → keadaan 'Belum ada isi'", () => {
    render(<ArticleBody lede="" sections={[]} relation="" />);
    expect(screen.getByText(COPY["article.empty"])).toBeTruthy();
  });
});

describe("SourceItem", () => {
  it("format Penerbit. “Judul.” Tahun. dengan tautan aman", () => {
    const { container } = render(
      <ol>
        <SourceItem
          source={{ publisher: "Lembaga", title: "Laporan", year: 2023, url: "https://a.org/x" }}
        />
      </ol>,
    );
    expect(container.textContent).toBe("Lembaga. “Laporan.” ↗ 2023.");
    const a = container.querySelector("a")!;
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(a.getAttribute("target")).toBe("_blank");
  });
});
