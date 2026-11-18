import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it } from "vitest";
import { FilterPill } from "@/components/content/FilterPill";
import { counts } from "@/components/content/filter";
import { ARTICLES } from "@/content/articles";
import { COPY } from "@/content/copy";
import ContentPage from "./ContentPage";

beforeAll(() => {
  // jsdom tidak punya canvas 2D; ParticleField harus tetap aman tanpa konteks.
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
});

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <ContentPage />
    </MemoryRouter>,
  );
}

describe("ContentPage", () => {
  it("menampilkan H1, lede, dan 12 kartu dengan tautan ke detail", () => {
    renderAt("/konten");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(COPY["page.content.title"]);
    expect(screen.getByText(COPY["page.content.lede"])).toBeTruthy();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(12);
    expect(cards[0]?.querySelector("a")?.getAttribute("href")).toBe(
      `/konten/${ARTICLES.find((a) => a.code === "A1")?.slug}`,
    );
    expect(cards[0]?.getAttribute("data-cursor")).toBe("read");
  });

  it("filter lewat URL: negatif + global = 2 kartu dan pengumuman", () => {
    renderAt("/konten?jenis=negatif&level=global");
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("status").textContent).toBe("Menampilkan 2 artikel: Negatif, Global.");
    const negatif = screen.getByRole("button", { name: /^Negatif/ });
    expect(negatif.getAttribute("aria-pressed")).toBe("true");
  });

  it("nilai URL tidak valid diabaikan", () => {
    renderAt("/konten?jenis=ngawur&level=dunia");
    expect(screen.getAllByRole("article")).toHaveLength(12);
  });

  it("mengklik chip menyaring kartu; klik chip aktif tidak membatalkan", async () => {
    renderAt("/konten");
    fireEvent.click(screen.getByRole("button", { name: /^Positif/ }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
    const positif = screen.getByRole("button", { name: /^Positif/ });
    fireEvent.click(positif);
    expect(screen.getByRole("button", { name: /^Positif/ }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getAllByRole("article")).toHaveLength(6);
  });

  it("memuat 1–2 kartu pertama dengan loading eager dan sisanya lazy", () => {
    renderAt("/konten");
    const imgs = screen.getAllByRole("img");
    expect(imgs[0]?.getAttribute("loading")).toBe("eager");
    expect(imgs[1]?.getAttribute("loading")).toBe("eager");
    expect(imgs[2]?.getAttribute("loading")).toBe("lazy");
    expect(imgs[0]?.getAttribute("alt")?.length).toBeGreaterThan(10);
  });
});

describe("FilterPill", () => {
  it("memakai aria-pressed dan hitungan mengikuti kelompok lain", () => {
    const c = counts(ARTICLES, "negatif", "global");
    const picked: string[] = [];
    render(
      <FilterPill
        kind="negatif"
        level="global"
        counts={c}
        onKind={(k) => picked.push(`k:${k}`)}
        onLevel={(l) => picked.push(`l:${l}`)}
      />,
    );
    const kindGroup = screen.getByRole("group", { name: COPY["filter.group.kind"] });
    expect(within(kindGroup).getAllByRole("button")).toHaveLength(3);
    expect(within(kindGroup).getByRole("button", { name: /^Positif/ }).textContent).toBe("Positif2");
    expect(
      within(kindGroup)
        .getByRole("button", { name: /^Negatif/ })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      within(kindGroup)
        .getByRole("button", { name: /^Positif/ })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    fireEvent.click(within(kindGroup).getByRole("button", { name: /^Positif/ }));
    expect(picked).toEqual(["k:positif"]);
    const levelGroup = screen.getByRole("group", { name: COPY["filter.group.level"] });
    expect(within(levelGroup).getAllByRole("button")).toHaveLength(4);
  });
});
