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
    "BELUM TERVERIFIKASI (18 Nov 2026). Angka umum '5 gram per minggu' berasal dari kajian yang dipesan WWF (Univ. Newcastle, 2019; makalah 2021), dan metodenya diperdebatkan. Halaman asli tidak bisa dibuka (403/404), jadi nilai, rentang, dan batasan tidak dapat dikonfirmasi. WHO 2019 'Microplastics in drinking-water' hanya terbaca ringkasannya (ada celah pengetahuan, tanpa kesimpulan risiko pada halaman itu). Tetap tersembunyi.",
  ),
  "lama-terurai": pending(
    "lama-terurai",
    "Botol plastik butuh sekitar {X} tahun untuk terurai.",
    "BELUM TERVERIFIKASI. NOAA Marine Debris Program (diperbarui 2 Mei 2024) menyatakan lama penguraian tidak pasti dan bergantung pada kondisi; tidak ada angka botol atau '450 tahun'. Jangan tampilkan angka tanpa sumber yang bisa dibuka.",
  ),
  "terumbu-pemutihan": {
    key: "terumbu-pemutihan",
    statement: "Tekanan panas tingkat pemutihan menimpa {X} luas terumbu karang dunia pada 2023–2025.",
    value: "84%",
    scope: "Terumbu dunia, tiga cekungan samudra (Pasifik, Atlantik, Hindia); peristiwa pemutihan global ke-4, awal 2023 hingga pertengahan 2025",
    year: 2025,
    sourceTitle: "World's Fourth Mass Coral Bleaching Event Likely Ended in 2025",
    sourceUrl: "https://www.nesdis.noaa.gov/news/worlds-fourth-mass-coral-bleaching-event-likely-ended-2025",
    publisher: "NOAA NESDIS (NCEI)",
    accessed: "2026-11-18",
    verified: true,
    note:
      "Yang diukur adalah luas yang terkena tekanan panas tingkat pemutihan, bukan luas karang yang pasti memutih atau mati. Halaman sumber tidak menyebut sifat kumulatif secara eksplisit.",
  },
  "kenaikan-laut": {
    key: "kenaikan-laut",
    statement: "Muka laut naik {X} per tahun.",
    value: 4.5,
    unit: "mm",
    scope: "Rata-rata global, rekam satelit",
    year: 2023,
    sourceTitle: "Rate of Sea Level Rise Doubled over 30 Years, New Study Shows",
    sourceUrl: "https://sealevel.nasa.gov/news/280/rate-of-sea-level-rise-doubled-over-30-years-new-study-shows/",
    publisher: "NASA Sea Level Change Portal",
    accessed: "2026-11-18",
    verified: true,
    note:
      "Laju tahun 2023; tahun 1993 sekitar 2,1 mm per tahun. Satu tahun dipengaruhi El Niño, jangan dibaca sebagai tren rata-rata jangka panjang.",
  },
  "botol-terkumpul": pending(
    "botol-terkumpul",
    "{X} botol plastik berhasil terkumpul.",
    "BELUM TERVERIFIKASI. Tidak ada sumber primer yang berhasil dibuka untuk persentase botol terkumpul (wilayah dan tahun harus disebut). Catatan: jumlah bank sampah dan angka SIPSN belum bisa dikonfirmasi karena situs KLHK bermasalah (sertifikat kedaluwarsa, DNS).",
  ),
  "sampah-sungai-laut": {
    key: "sampah-sungai-laut",
    statement: "Sungai membawa {X} sampah plastik darat yang bocor ke laut Indonesia.",
    value: "83%",
    scope: "Indonesia, sumber daratan, estimasi studi 2021",
    year: 2021,
    sourceTitle: "Plastic Waste Discharges from Rivers and Coastlines in Indonesia",
    sourceUrl: "https://www.worldbank.org/en/country/indonesia/publication/plastic-waste-discharges-from-rivers-and-coastlines-in-indonesia",
    publisher: "World Bank",
    accessed: "2026-11-18",
    verified: true,
    note:
      "Estimasi model; total kebocoran ke laut sekitar 346,5 kiloton per tahun (rentang 201,1–552,3). Sisa 17% berasal dari pembuangan langsung atau limpasan pesisir. Rentang ketidakpastian tidak diberikan untuk pembagian 83/17.",
  },
  "produksi-plastik": pending(
    "produksi-plastik",
    "Produksi plastik global mencapai {X}.",
    "BELUM TERVERIFIKASI. Sumber primer OECD Global Plastics Outlook tidak bisa dibuka (403). Our World in Data (sekunder) menyebut 460 juta ton pada 2019 dengan rujukan OECD; belum cukup untuk status terverifikasi. Porsi bahan fosil belum ditemukan.",
  ),
  "emisi-plastik": pending(
    "emisi-plastik",
    "Plastik menyumbang emisi {X}.",
    "BELUM TERVERIFIKASI. OECD tidak bisa dibuka (403). Angka sekunder sekitar 3% emisi global (produksi dan pembuangan; lihat OWID) belum dicek ke OECD/CIEL.",
  ),
  "daur-ulang-global": pending(
    "daur-ulang-global",
    "{X} plastik global didaur ulang.",
    "BELUM TERVERIFIKASI. Persentase plastik global yang didaur ulang belum terbaca dari OECD (403). Angka sekunder 9% belum dicek ke sumber primer.",
  ),
  "deposit-hasil": {
    key: "deposit-hasil",
    statement: "Sistem deposit terbaik mencapai angka pengumpulan {X}.",
    value: "lebih dari 90%",
    scope: "Wilayah berkinerja terbaik, data lebih dari 40 yurisdiksi",
    year: 2025,
    sourceTitle: "New data confirms that deposit return systems outperform other collection systems",
    sourceUrl: "https://www.reloopplatform.org/new-data-confirms-that-deposit-return-systems-outperform-other-collection-systems/",
    publisher: "Reloop Platform",
    accessed: "2026-11-18",
    verified: true,
    note:
      "Hanya untuk wilayah berkinerja terbaik, bukan rata-rata semua sistem. Definisi angka pengumpulan tidak dijelaskan di halaman; tanggal terbit tidak tercantum (tahun diperkirakan dari data akhir 2025). Pembanding di halaman yang sama: kerbside biasanya tidak melebihi 50%.",
  },
  "bank-sampah": pending(
    "bank-sampah",
    "Terdapat {X} bank sampah di Indonesia.",
    "BELUM TERVERIFIKASI. Angka 16.981 unit (2023) hanya ada di media (GoodStats, 17 Des 2024) tanpa sumber hitungan; situs resmi KLHK/SIPSN tidak bisa dibuka. Angka lain di media berbeda (mis. 25.540 unit) sehingga perlu data resmi.",
  ),
  "pet-menjadi-serat": pending(
    "pet-menjadi-serat",
    "PET daur ulang kerap menjadi serat.",
    "BELUM TERVERIFIKASI. Halaman Ellen MacArthur Foundation yang dibuka tidak memuat pernyataan itu; Textile Exchange memblokir akses (403). Belum ada sumber yang terbaca.",
  ),
} as const satisfies Record<string, Fact>;

export type FactKey = keyof typeof FACTS;
