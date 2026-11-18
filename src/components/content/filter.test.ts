import { describe, expect, it } from "vitest";
import { ARTICLES } from "@/content/articles";
import {
  KIND_OPTIONS,
  LEVEL_OPTIONS,
  counts,
  filterArticles,
  parseKind,
  parseLevel,
  sortDefault,
} from "./filter";

describe("filterArticles", () => {
  it("semua kombinasi: Semua/Semua = 12, sel jenis×level = 2", () => {
    expect(filterArticles(ARTICLES, "all", "all")).toHaveLength(12);
    for (const k of KIND_OPTIONS) {
      for (const l of LEVEL_OPTIONS) {
        const n = filterArticles(ARTICLES, k, l).length;
        const kFactor = k === "all" ? 2 : 1;
        const lFactor = l === "all" ? 3 : 1;
        expect(n).toBe(2 * kFactor * lFactor);
      }
    }
  });

  it("hasil hanya memuat artikel yang cocok", () => {
    const r = filterArticles(ARTICLES, "negatif", "global");
    expect(r.map((a) => a.code).sort()).toEqual(["A5", "A6"]);
  });
});

describe("counts", () => {
  it("tanpa filter: 12/6/6 dan 4/4/4", () => {
    const c = counts(ARTICLES, "all", "all");
    expect(c.kind).toEqual({ all: 12, negatif: 6, positif: 6 });
    expect(c.level).toEqual({ all: 12, "sehari-hari": 4, nasional: 4, global: 4 });
  });

  it("Negatif + Global: kelompok jenis ikut level, kelompok level ikut jenis", () => {
    const c = counts(ARTICLES, "negatif", "global");
    // Rumus kode dok 05 §4.3 (contoh teks "Positif 0" di dokumen tidak konsisten dengan rumusnya).
    expect(c.kind).toEqual({ all: 4, negatif: 2, positif: 2 });
    expect(c.level.global).toBe(2);
    expect(c.level.all).toBe(6);
  });

  it("hitungan chip yang dipilih sama dengan jumlah hasil untuk semua kombinasi", () => {
    for (const k of KIND_OPTIONS) {
      for (const l of LEVEL_OPTIONS) {
        const c = counts(ARTICLES, k, l);
        const n = filterArticles(ARTICLES, k, l).length;
        expect(c.kind[k]).toBe(n);
        expect(c.level[l]).toBe(n);
      }
    }
  });
});

describe("parse & urutan", () => {
  it("nilai URL tidak valid diabaikan", () => {
    expect(parseKind("negatif")).toBe("negatif");
    expect(parseKind("ngawur")).toBe("all");
    expect(parseKind(null)).toBe("all");
    expect(parseLevel("global")).toBe("global");
    expect(parseLevel("dunia")).toBe("all");
  });

  it("urutan default selang-seling A1,B1,...", () => {
    const codes = sortDefault([...ARTICLES].reverse()).map((a) => a.code);
    expect(codes).toEqual(["A1", "B1", "A2", "B2", "A3", "B3", "A4", "B4", "A5", "B5", "A6", "B6"]);
  });
});
