import { describe, expect, it } from "vitest";
import { COPY } from "./copy";
import { FACTS } from "./facts";

// Kunci wajib dari docs/11 bagian 2, 3, 5.1–5.3.
const REQUIRED_KEYS = [
  "hero.title",
  "hero.tagline",
  "hero.hint",
  "hero.scenario",
  "ch1.title",
  "ch1.line",
  "ch1.sub",
  "ch2.title",
  "ch2.line",
  "ch2.sub",
  "ch3.title",
  "ch3.counter.label",
  "ch3.counter.value",
  "ch3.sub",
  "ch4.title",
  "ch4.line",
  "ch4.sub",
  "ch4.fact",
  "ch5.title",
  "ch5.line",
  "ch5.counter.label",
  "ch6.title",
  "ch6.line",
  "ch6.sub",
  "ch6.footnote",
  "ch6.fallback",
  "punch.line",
  "ch7.title",
  "ch7.line",
  "ch7.letter",
  "ch7.bins",
  "ch8.title",
  "ch8.letter",
  "ch8.fact",
  "ch8.sub",
  "ch9.title",
  "ch9.letter",
  "ch9.stations",
  "ch9.note",
  "ch10a.letter",
  "ch10b.letter",
  "ch10d.letter",
  "ch10e.cta",
  "end.hint",
  "about.why.title",
  "about.why.body",
  "about.scenario.title",
  "about.scenario.body",
  "about.temp.title",
  "about.temp.body",
  "about.sources.title",
  "about.licenses.title",
  "about.team.title",
  "about.closing",
  "about.background.1",
  "about.background.2",
  "contact.title",
  "contact.intro",
  "contact.field.name",
  "contact.field.email",
  "contact.field.message",
  "contact.submit",
  "contact.sending",
  "contact.success",
  "contact.error.generic",
  "contact.error.name",
  "contact.error.email",
  "contact.error.message",
  "contact.mailto",
  "404.title",
  "404.body",
  "404.cta",
  "nav.home",
  "nav.about",
  "nav.content",
  "nav.contact",
  "nav.menu.open",
  "nav.menu.close",
  "audio.on",
  "audio.off",
  "loop.hint",
  "skip",
  "static.start",
  "noscript",
  "article.back",
  "article.next",
  "filter.all",
  "filter.empty",
] as const;

// Teks [DISEPAKATI] harus identik dengan dokumen.
const AGREED: Record<string, string> = {
  "hero.title": "Re:bottle",
  "hero.tagline": "Bawa botolmu besok.",
  "hero.hint": "(Gulir untuk mulai)",
  "hero.scenario": "Skenario jika pola konsumsi plastik terus berlanjut.",
  "ch1.title": "Lahir",
  "ch1.line": "Dibuat dari fosil, usia 0 hari.",
  "ch2.title": "Sekali Pakai",
  "ch2.line": "Dipakai 10 menit.",
  "ch3.title": "Tersesat",
  "ch4.title": "Lautan",
  "ch4.line": "Air naik. Karang memutih.",
  "ch5.title": "Terurai",
  "ch6.title": "Kembali ke Kita",
  "ch6.line": "Kamu makan sekitar {X} mikroplastik per minggu.",
  "punch.line": "Bagaimana jika semua ini tidak terjadi?",
  "ch7.title": "Di Tempat yang Benar",
  "ch7.line": "Satu keputusan, 10 detik.",
  "ch7.letter": "Kamu tidak membuangku ke sungai. Terima kasih.",
  "ch8.title": "Perjalanan Kedua",
  "ch8.letter": "Aku beruntung. Tidak semua temanku sampai di sini.",
  "ch9.title": "Hidup Baru, Tapi...",
  "ch9.letter": "Aku jadi sesuatu yang baru, tapi prosesnya butuh energi dan air.",
  "ch10a.letter": "Aku jadi sesuatu yang berguna.",
  "ch10b.letter": "Ternyata aku tidak sendirian.",
  "ch10d.letter": "Aku senang diselamatkan. Tapi aku akan lebih senang kalau tidak perlu dibuat.",
  "ch10e.cta": "Bawa botolmu besok.",
  "end.hint": "(Terus gulir)",
};

const text = (key: string): string => (COPY as Record<string, string>)[key] ?? "";

describe("COPY (naskah T8.2)", () => {
  it("memuat semua kunci wajib dengan teks tidak kosong", () => {
    for (const key of REQUIRED_KEYS) {
      const value = text(key);
      expect(typeof value, key).toBe("string");
      expect(value.trim().length, key).toBeGreaterThan(0);
    }
  });

  it("tidak ada string kosong atau sisa TODO di seluruh COPY", () => {
    for (const [key, value] of Object.entries(COPY)) {
      expect(value.trim().length, key).toBeGreaterThan(0);
      expect(value, key).not.toMatch(/TODO/);
    }
  });

  it("teks [DISEPAKATI] identik dengan dokumen", () => {
    for (const [key, expected] of Object.entries(AGREED)) {
      expect(text(key), key).toBe(expected);
    }
  });

  it("judul bab ≤ 4 kata dan surat ≤ 2 kalimat", () => {
    for (const key of Object.keys(COPY).filter((k) => /^ch\d+\.title$/.test(k))) {
      const words = text(key).split(/\s+/).length;
      expect(words, key).toBeLessThanOrEqual(4);
    }
    for (const key of Object.keys(COPY).filter((k) => /^ch\d+[a-e]?\.letter$/.test(k))) {
      const sentences = text(key).split(/[.!?]+\s/).length;
      expect(sentences, key).toBeLessThanOrEqual(2);
    }
  });

  it("kalimat berangka memakai penampung {X}, bukan angka tertulis", () => {
    expect(COPY["ch6.line"]).toContain("{X}");
    expect(COPY["ch3.counter.value"]).toBe("{X}");
    expect(COPY["ch6.fallback"]).not.toMatch(/\d/);
    expect(COPY["ch3.fallback"]).not.toMatch(/\d/);
  });

  it("kunci fakta yang dirujuk naskah ada di facts.ts", () => {
    for (const key of [
      "mikroplastik-mingguan",
      "lama-terurai",
      "terumbu-pemutihan",
      "botol-terkumpul",
    ]) {
      expect(FACTS, key).toHaveProperty(key);
    }
  });

  it("tanpa emoji", () => {
    for (const [key, value] of Object.entries(COPY)) {
      expect(value, key).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });
});
