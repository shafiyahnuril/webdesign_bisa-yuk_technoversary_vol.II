// Kerangka 12 artikel (docs/11 bagian 4). Isi dan sumber diisi di T8.3.
import { A1 } from "./articles/A1";
import { A2 } from "./articles/A2";
import { B1 } from "./articles/B1";
import { B2 } from "./articles/B2";

export type ArticleKind = "negatif" | "positif";
export type ArticleLevel = "sehari-hari" | "nasional" | "global";

export interface ArticleSource {
  title: string;
  url: string;
  publisher: string;
  year: number | null;
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface Article {
  /** Kode kerja (A1..A6 negatif, B1..B6 positif). */
  code: string;
  slug: string;
  title: string;
  kind: ArticleKind;
  level: ArticleLevel;
  readingMinutes: number | null;
  summary: string;
  cover: string;
  /** Lede satu paragraf (± 40 kata). Kosong sampai T8.3. */
  lede: string;
  /** Isi: 2–3 subjudul H2 beserta paragraf. Kosong sampai T8.3. */
  sections: ArticleSection[];
  /** Kotak "Kaitannya dengan Re:bottle" (2 kalimat). Kosong sampai T8.3. */
  relation: string;
  sources: ArticleSource[];
}

/** Bagian isi per artikel (T8.3); disimpan di `src/content/articles/<kode>.ts`. */
export type ArticleBody = Pick<
  Article,
  "summary" | "readingMinutes" | "lede" | "sections" | "relation" | "sources"
>;

const BODIES: Partial<Record<string, ArticleBody>> = { A1, A2, B1, B2 };

const make = (
  code: string,
  slug: string,
  title: string,
  kind: ArticleKind,
  level: ArticleLevel,
): Article => ({
  code,
  slug,
  title,
  kind,
  level,
  readingMinutes: null,
  summary: "TODO: ringkasan satu kalimat (maks. 140 karakter).",
  cover: `img/articles/cover-${code}.svg`,
  lede: "",
  sections: [],
  relation: "",
  sources: [],
  ...BODIES[code],
});

export const ARTICLES: readonly Article[] = [
  make(
    "A1",
    "mikroplastik-di-piring-makanmu",
    "Mikroplastik di Piring Makanmu",
    "negatif",
    "sehari-hari",
  ),
  make(
    "A2",
    "10-menit-dipakai-450-tahun-tinggal",
    "10 Menit Dipakai, 450 Tahun Tinggal",
    "negatif",
    "sehari-hari",
  ),
  make(
    "A3",
    "sungai-kita-jalur-sampah-ke-laut",
    "Sungai Kita, Jalur Sampah ke Laut",
    "negatif",
    "nasional",
  ),
  make(
    "A4",
    "pesisir-dan-nelayan-yang-menjaring-plastik",
    "Pesisir dan Nelayan yang Menjaring Plastik",
    "negatif",
    "nasional",
  ),
  make("A5", "pusaran-sampah-samudra", "Pusaran Sampah Samudra", "negatif", "global"),
  make("A6", "plastik-dan-iklim", "Plastik dan Iklim", "negatif", "global"),
  make("B1", "dari-botol-menjadi-kain", "Dari Botol Menjadi Kain", "positif", "sehari-hari"),
  make(
    "B2",
    "seminggu-membawa-botol-sendiri",
    "Seminggu Membawa Botol Sendiri",
    "positif",
    "sehari-hari",
  ),
  make(
    "B3",
    "bank-sampah-dan-pemulung",
    "Bank Sampah dan Pemulung: Rantai yang Jarang Terlihat",
    "positif",
    "nasional",
  ),
  make(
    "B4",
    "isi-ulang-mulai-jadi-gaya-hidup",
    "Isi Ulang Mulai Jadi Gaya Hidup",
    "positif",
    "nasional",
  ),
  make(
    "B5",
    "negara-yang-berhasil-mengurangi-plastik",
    "Negara yang Berhasil Mengurangi Plastik",
    "positif",
    "global",
  ),
  make(
    "B6",
    "ekonomi-sirkular",
    "Ekonomi Sirkular: Plastik yang Tidak Jadi Sampah",
    "positif",
    "global",
  ),
];
