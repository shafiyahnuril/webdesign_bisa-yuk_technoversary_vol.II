// Daftar fakta (docs/11 bagian 6). SEMUA belum terverifikasi: komponen tidak boleh
// menampilkan nilai selama `verified` bernilai false (pakai fallback di copy.ts).

export interface Fact {
  key: string;
  /** Kalimat yang tampil, dengan penanda {X} untuk nilai. */
  statement: string;
  /** null = belum diverifikasi, komponen tidak menampilkan. */
  value: string | number | null;
  unit?: string;
  /** Wilayah/populasi. */
  scope: string;
  year: number | null;
  sourceTitle: string;
  sourceUrl: string;
  publisher: string;
  /** Tanggal akses. */
  accessed: string;
  verified: boolean;
  /** Batasan, rentang, ketidakpastian. */
  note?: string;
}

const pending = (key: string, statement: string, note: string): Fact => ({
  key,
  statement,
  value: null,
  scope: "TODO",
  year: null,
  sourceTitle: "TODO",
  sourceUrl: "TODO",
  publisher: "TODO",
  accessed: "TODO",
  verified: false,
  note,
});

export const FACTS = {
  "mikroplastik-mingguan": pending(
    "mikroplastik-mingguan",
    "Kamu makan sekitar {X} mikroplastik per minggu.",
    "Pastikan angka dan satuan (partikel vs gram), rentang, metode; klaim masih diperdebatkan?",
  ),
  "lama-terurai": pending(
    "lama-terurai",
    "Botol plastik butuh sekitar {X} tahun untuk terurai.",
    "Rentang waktu terurai botol PET; angka 450 hanya bila ada sumber.",
  ),
  "terumbu-pemutihan": pending(
    "terumbu-pemutihan",
    "{X} terumbu karang pernah mengalami pemutihan.",
    "Persentase dan tahun pemutihan massal.",
  ),
  "kenaikan-laut": pending(
    "kenaikan-laut",
    "Muka laut naik {X} per tahun.",
    "Laju kenaikan muka laut.",
  ),
  "botol-terkumpul": pending(
    "botol-terkumpul",
    "{X} botol plastik berhasil terkumpul.",
    "Persentase, wilayah, dan tahun harus disebut.",
  ),
  "sampah-sungai-laut": pending(
    "sampah-sungai-laut",
    "Sungai menyumbang {X} sampah laut Indonesia.",
    "Kontribusi sungai terhadap sampah laut.",
  ),
  "produksi-plastik": pending(
    "produksi-plastik",
    "Produksi plastik global mencapai {X}.",
    "Produksi global dan porsi bahan fosil.",
  ),
  "emisi-plastik": pending(
    "emisi-plastik",
    "Plastik menyumbang emisi {X}.",
    "Emisi siklus hidup plastik.",
  ),
  "daur-ulang-global": pending(
    "daur-ulang-global",
    "{X} plastik global didaur ulang.",
    "Persentase plastik global yang didaur ulang.",
  ),
  "deposit-hasil": pending(
    "deposit-hasil",
    "Sistem deposit mencapai angka pengumpulan {X}.",
    "Angka pengumpulan negara dengan sistem deposit.",
  ),
  "bank-sampah": pending(
    "bank-sampah",
    "Terdapat {X} bank sampah di Indonesia.",
    "Jumlah bank sampah dan kontribusinya.",
  ),
  "pet-menjadi-serat": pending(
    "pet-menjadi-serat",
    "PET daur ulang kerap menjadi serat.",
    "Pernyataan bahwa PET daur ulang kerap menjadi serat.",
  ),
} as const satisfies Record<string, Fact>;

export type FactKey = keyof typeof FACTS;
