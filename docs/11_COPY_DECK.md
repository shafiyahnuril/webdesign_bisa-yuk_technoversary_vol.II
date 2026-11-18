# 11 · NASKAH DAN KONTEN (COPY DECK)

> **Status:** kalimat bertanda **[DISEPAKATI]** diambil dari konsep v2 dan tidak boleh diubah tanpa persetujuan. Semua lainnya **[USULAN]** (draf awal untuk disunting tim). Semua angka bertanda **[VERIFIKASI]** adalah *placeholder* dan **tidak boleh tampil** sebelum `facts.ts` terisi sumber (bagian 6).
> Bahasa: Indonesia, baku-santai. Tidak menggurui, tidak menyalahkan, tidak menakut-nakuti berlebihan, tidak ada klaim sebab-akibat langsung ("botol ini menyebabkan X"). Skenario selalu dibingkai sebagai **skenario**.

---

## 1. Aturan penulisan

1. **Satu gagasan per layar.** Judul ≤ 4 kata, isi ≤ 2 baris pendek (≤ 14 kata per baris di desktop, ≤ 10 di HP).
2. **Kata kerja aktif, kalimat pendek.** Hindari jargon; bila perlu, jelaskan dalam kurung.
3. **Angka hanya dari `facts.ts`.** Komponen menerima kunci (`fact="mikroplastik-mingguan"`), bukan angka tertulis.
4. **Nada Babak I:** datar, faktual, dingin. **Nada Babak II:** hangat, jujur, sedikit humor. **Nada surat:** orang pertama (botol), polos, tidak dramatis.
5. **Jujur soal daur ulang:** tidak menyiratkan bahwa daur ulang menyelesaikan segalanya. Tumbler = ajakan akhir.
6. **Hindari:** "wajib", "harus", "dosa", "bumi menangis", emoji, tanda seru berlebihan, singkatan gaul.
7. **Kapitalisasi:** judul bab Title Case Indonesia ("Di Tempat yang Benar"); petunjuk dalam kurung.
8. Setiap teks punya **kunci** (mis. `ch2.title`) untuk disimpan di `src/content/copy.ts` agar bisa diubah tanpa menyentuh komponen.

---

## 2. Naskah Home (11 blok cerita)

Format: **kunci → teks**. Suhu ditampilkan oleh `ChapterMarker` (bukan bagian teks bab).

### 2.1 Hero (Bab 1) · Lahir

| Kunci | Teks | Status |
|---|---|---|
| `hero.title` | Re:bottle | [DISEPAKATI] |
| `hero.tagline` | Bawa botolmu besok. | [DISEPAKATI] |
| `hero.hint` | (Gulir untuk mulai) | [DISEPAKATI] |
| `hero.scenario` | Skenario jika pola konsumsi plastik terus berlanjut. | [DISEPAKATI] |
| `ch1.title` | Lahir | [DISEPAKATI] |
| `ch1.line` | Dibuat dari fosil, usia 0 hari. | [DISEPAKATI] |
| `ch1.sub` | Bening, baru, siap dipakai. | [USULAN] |

> Tagline ditampilkan di hero hanya bila lolos uji tata letak (judul besar adalah fokus). Bila terlalu ramai, pindahkan ke `<meta>` dan penutup saja.

### 2.2 Bab 2 · Sekali Pakai

| Kunci | Teks | Status |
|---|---|---|
| `ch2.title` | Sekali Pakai | [DISEPAKATI] |
| `ch2.line` | Dipakai 10 menit. | [DISEPAKATI] |
| `ch2.sub` | Setelah itu, tidak ada yang bertanya ke mana ia pergi. | [USULAN] |

### 2.3 Bab 3 · Tersesat

| Kunci | Teks | Status |
|---|---|---|
| `ch3.title` | Tersesat | [DISEPAKATI] |
| `ch3.counter.label` | tahun lagi | [USULAN] |
| `ch3.counter.value` | 450 | [DISEPAKATI] (angka **[VERIFIKASI]**: perkiraan lama terurai, sumber harus mencantumkan rentang) |
| `ch3.sub` | Sungai membawanya melewati kota yang tidak menoleh. | [USULAN] |

### 2.4 Bab 4 · Lautan

| Kunci | Teks | Status |
|---|---|---|
| `ch4.title` | Lautan | [DISEPAKATI] |
| `ch4.line` | Air naik. Karang memutih. | [DISEPAKATI] (isi: air laut naik, karang memutih) |
| `ch4.sub` | Ia terapung di bawah matahari yang makin terik. | [USULAN] |
| `ch4.fact` | *(opsional)* Sekian persen terumbu karang pernah mengalami pemutihan. | [VERIFIKASI] hanya tampil bila `facts.ts` terisi |

### 2.5 Bab 5 · Terurai

| Kunci | Teks | Status |
|---|---|---|
| `ch5.title` | Terurai | [DISEPAKATI] |
| `ch5.line` | Ia tidak hilang. Ia hanya menjadi lebih kecil. | [USULAN] |
| `ch5.counter.label` | partikel | [USULAN] (counter dekoratif, bukan data; tanpa satuan nyata) |

### 2.6 Bab 6 · Kembali ke Kita

| Kunci | Teks | Status |
|---|---|---|
| `ch6.title` | Kembali ke Kita | [DISEPAKATI] |
| `ch6.line` | Kamu makan sekitar **{X}** mikroplastik per minggu. | [DISEPAKATI] bentuk kalimat; **X [VERIFIKASI]** (kunci `mikroplastik-mingguan`) |
| `ch6.sub` | Dari ikan, garam, dan air yang kita anggap bersih. | [USULAN] |
| `ch6.footnote` | Perkiraan rata-rata dari kajian; hasil tiap orang berbeda. | [USULAN] wajib tampil bersama angka |

> Jika angka belum terverifikasi: **jangan tampilkan kalimat angka**; tampilkan `ch6.fallback` = "Mikroplastik kini ditemukan di makanan dan minuman kita." [USULAN] (tanpa angka).

### 2.7 Punchline · Layar Hening

| Kunci | Teks | Status |
|---|---|---|
| `punch.line` | Bagaimana jika semua ini tidak terjadi? | [DISEPAKATI] |
| `punch.reveal` | Muncul per kata, jeda ±120 ms antarkata. | [USULAN] (perilaku) |

> Tidak ada subteks, tidak ada angka suhu pada punchline [DISEPAKATI D12].

### 2.8 Bab 7 · Di Tempat yang Benar

| Kunci | Teks | Status |
|---|---|---|
| `ch7.title` | Di Tempat yang Benar | [DISEPAKATI] |
| `ch7.line` | Satu keputusan, 10 detik. | [DISEPAKATI] |
| `ch7.letter` | Kamu tidak membuangku ke sungai. Terima kasih. | [DISEPAKATI] (surat 1) |
| `ch7.bins` | Plastik · Kertas · Organik | [USULAN D11] label tempat sampah |
| `ch7.kilas` | *(tanpa teks)* sungai jernih sekilas | [USULAN] |

### 2.9 Bab 8 · Perjalanan Kedua

| Kunci | Teks | Status |
|---|---|---|
| `ch8.title` | Perjalanan Kedua | [DISEPAKATI] |
| `ch8.letter` | Aku beruntung. Tidak semua temanku sampai di sini. | [DISEPAKATI] (surat 2) |
| `ch8.fact` | Sekian persen botol plastik berhasil terkumpul. | [VERIFIKASI] kunci `botol-terkumpul`; sumber harus menyebut wilayah dan tahun |
| `ch8.sub` | Dipilah, dikelompokkan, lalu dibersihkan. | [USULAN] |

### 2.10 Bab 9 · Hidup Baru, Tapi...

| Kunci | Teks | Status |
|---|---|---|
| `ch9.title` | Hidup Baru, Tapi... | [DISEPAKATI] |
| `ch9.letter` | Aku jadi sesuatu yang baru, tapi prosesnya butuh energi dan air. | [DISEPAKATI] (surat 3) |
| `ch9.stations` | Cacah · Cuci · Lebur · Cetak | [USULAN] label 4 stasiun |
| `ch9.note` | Hasilnya biasanya serat atau benda lain, bukan botol lagi. | [USULAN] (kejujuran produk; diverifikasi lewat sumber B1/B6) |

### 2.11 Bab 10 · Surat Terakhir

| Langkah | Kunci | Teks | Status |
|---|---|---|---|
| 10a | `ch10a.letter` | Aku jadi sesuatu yang berguna. | [DISEPAKATI] |
| 10b | `ch10b.letter` | Ternyata aku tidak sendirian. | [DISEPAKATI] |
| 10c | — | *(surat berhenti sejenak, tanpa teks)* | [DISEPAKATI] |
| 10d | `ch10d.letter` | Aku senang diselamatkan. Tapi aku akan lebih senang kalau tidak perlu dibuat. | [DISEPAKATI] |
| 10e | `ch10e.cta` | **Bawa botolmu besok.** | [DISEPAKATI] |
| akhir | `end.hint` | (Terus gulir) | [DISEPAKATI] |

---

## 3. Surat (gaya tulisan tangan, font Caveat)

Empat surat resmi [DISEPAKATI] ada di bagian 2 (`ch7.letter`, `ch8.letter`, `ch9.letter`, `ch10d.letter`; 10a/10b adalah kalimat pendek surat penutup). Aturan tampilan:

- Satu kartu surat per bab Babak II; teks muncul **per kata** (±90 ms/kata), tidak ada jeda yang menutupi tindakan 3D.
- Salam dan penutup **tidak ditampilkan**: botol tidak "menulis surat" secara literal; kalimat tampil seperti catatan.
- Teks surat tidak boleh lebih dari 2 kalimat per kartu.
- Alternatif cadangan **[USULAN]** (bila tim ingin versi lebih hangat; **tidak dipakai** kecuali disetujui):

| Surat | Cadangan |
|---|---|
| 1 | Aku tahu kamu bisa saja melempar. Kamu memilih menaruhku. |
| 2 | Banyak temanku berhenti di tengah jalan. Aku sampai. |
| 3 | Aku punya wujud baru. Wujud itu ada harganya: panas dan air. |
| 4 | Aku senang diselamatkan. Tapi lebih senang lagi kalau aku tidak perlu dibuat. |

---

## 4. Galeri Artikel · kerangka 12 artikel

### 4.1 Templat setiap artikel (selaras 05 §5)

```
Judul (≤ 60 karakter)
Dua label: [Dampak negatif|positif] · [Sehari-hari|Nasional|Global]
Perkiraan waktu baca (menit)
Ringkasan 1 kalimat (≤ 140 karakter; dipakai kartu + meta description)
Isi (400–600 kata): Pembuka (hook) → 3 poin utama → "Apa artinya untukmu" (1 paragraf) → Penutup 1 kalimat
Kotak fakta (opsional, 1–2 angka dari facts.ts)
Sumber (≥ 2, tautan + tahun akses)
Artikel berikutnya (otomatis)
```

**Aturan isi:** sebutkan sumber di teks (mis. "menurut laporan UNEP 2023"); bedakan *temuan* dan *proyeksi*; tidak ada angka tanpa sumber; hindari klaim satu-penyebab; tutup tiap artikel dengan satu langkah kecil yang realistis.

### 4.2 Dampak negatif

| Kode | Level | Judul | Ringkasan (≤ 140) | Poin utama | Kandidat sumber |
|---|---|---|---|---|---|
| A1 | Sehari-hari | Mikroplastik di Piring Makanmu | Mikroplastik kini ditemukan di makanan dan minuman; ini jalur singkatnya ke tubuh kita. | (1) apa itu mikroplastik, (2) jalur: laut → ikan/garam, air kemasan, (3) apa yang belum diketahui sains | WHO, kajian peer-review (Cox et al.), UNEP |
| A2 | Sehari-hari | 10 Menit Dipakai, 450 Tahun Tinggal | Kebiasaan kecil sekali pakai menumpuk menjadi sampah yang bertahan sangat lama. | (1) umur pakai vs umur sampah, (2) jajanan dan rumah tangga, (3) alternatif murah | KLHK SIPSN, Ellen MacArthur Foundation |
| A3 | Nasional | Sungai Kita, Jalur Sampah ke Laut | Sebagian sampah laut berawal dari sungai; sungai besar kita jadi koridornya. | (1) sungai sebagai jalur, (2) titik tumpuk di kota, (3) intervensi lokal | KLHK, Bank Dunia (Indonesia marine debris), kajian sungai |
| A4 | Nasional | Pesisir dan Nelayan yang Menjaring Plastik | Plastik di laut ikut menjaring penghidupan nelayan dan pariwisata pesisir. | (1) jaring dan tangkapan, (2) wisata pantai, (3) biaya bersih-bersih | KKP, Bank Dunia, studi kasus daerah |
| A5 | Global | Pusaran Sampah Samudra | Arus laut mengumpulkan sampah plastik dan memengaruhi satwa laut di seluruh dunia. | (1) arus dan pusaran, (2) satwa laut, (3) sulitnya dibersihkan | NOAA, The Ocean Cleanup (makalah), UNEP |
| A6 | Global | Plastik dan Iklim | Plastik berawal dari bahan bakar fosil; produksinya ikut menyumbang emisi. | (1) dari fosil ke polimer, (2) emisi siklus hidup, (3) kaitannya dengan suhu | OECD Global Plastics Outlook, IPCC, CIEL |

### 4.3 Dampak positif

| Kode | Level | Judul | Ringkasan (≤ 140) | Poin utama | Kandidat sumber |
|---|---|---|---|---|---|
| B1 | Sehari-hari | Dari Botol Menjadi Kain | Botol PET bisa menjadi serat untuk pakaian dan tas; begini jalannya. | (1) PET → serpih → serat, (2) produk sehari-hari, (3) batasnya (kualitas, energi) | Ellen MacArthur Foundation, asosiasi daur ulang PET, laporan industri |
| B2 | Sehari-hari | Seminggu Membawa Botol Sendiri | Catatan kebiasaan kecil: apa yang berubah dalam seminggu membawa botol sendiri. | (1) hitungan botol terhindar (hitungan transparan), (2) hambatan nyata, (3) tips praktis | Hitungan tim (metodologi dituliskan), data konsumsi |
| B3 | Nasional | Bank Sampah dan Pemulung: Rantai yang Jarang Terlihat | Pemulung dan bank sampah menggerakkan sebagian besar daur ulang kita. | (1) peran pengumpul, (2) bank sampah, (3) pengakuan dan tantangan | KLHK, kajian sektor informal, studi kasus |
| B4 | Nasional | Isi Ulang Mulai Jadi Gaya Hidup | Stasiun isi ulang dan kebijakan kampus/kantor mulai mengurangi botol sekali pakai. | (1) stasiun isi ulang, (2) kebijakan lokal (mis. aturan pemda), (3) cara memulai di kampus | Peraturan daerah terkait, laporan kampus, media terverifikasi |
| B5 | Global | Negara yang Berhasil Mengurangi Plastik | Sistem pengembalian botol (deposit) di beberapa negara menaikkan angka pengumpulan. | (1) cara kerja deposit, (2) hasil di beberapa negara, (3) apa yang bisa ditiru | Laporan sistem deposit (mis. Norwegia/Jerman), OECD, Reloop |
| B6 | Global | Ekonomi Sirkular: Plastik yang Tidak Jadi Sampah | Reduce, reuse, recycle: mengapa isi ulang berada di atas daur ulang. | (1) hierarki 3R, (2) mengapa reuse unggul, (3) peran desain | Ellen MacArthur Foundation, UNEP, OECD |

> Setiap artikel ≥ 2 sumber **berbeda penerbit**. Sumber yang tidak dapat dibuka pada saat verifikasi diganti.

---

## 5. Halaman statis dan situs

### 5.1 About

| Bagian | Kunci | Draf [USULAN] |
|---|---|---|
| 1 Mengapa | `about.why.title` | Mengapa Re:bottle |
| | `about.why.body` | Re:bottle adalah cerita satu botol plastik. Dua kemungkinan perjalanannya: jika kita abai, dan jika kita peduli. Selebihnya, pilihan ada di tanganmu. |
| 2 Skenario | `about.scenario.title` | Cara membaca cerita ini |
| | `about.scenario.body` | Babak I adalah skenario ilustratif, bukan ramalan. Angka suhu di penanda bab menggambarkan arah, bukan prediksi ilmiah per tahun. |
| 3 Suhu | `about.temp.title` | Soal suhu |
| | `about.temp.body` | Kenaikan suhu global disebabkan banyak hal, terutama emisi gas rumah kaca. Plastik berperan lewat emisi produksi dan pembakarannya, bukan satu-satunya penyebab. |
| 4 Sumber | `about.sources.title` | Sumber data |
| 5 Lisensi | `about.licenses.title` | Lisensi dan kredit |
| 6 Tim | `about.team.title` | Tim |
| 7 Penutup | `about.closing` | Bawa botolmu besok. |

### 5.2 Contact

| Kunci | Teks |
|---|---|
| `contact.title` | Hubungi Kami |
| `contact.intro` | Punya masukan, pertanyaan, atau ingin berkolaborasi? Tulis di sini. |
| `contact.field.name` | Nama |
| `contact.field.email` | Email |
| `contact.field.message` | Pesan |
| `contact.submit` | Kirim |
| `contact.sending` | Mengirim… |
| `contact.success` | Terkirim. Terima kasih sudah menulis. |
| `contact.error.generic` | Gagal mengirim. Coba lagi, atau kirim lewat email di bawah. |
| `contact.error.name` | Nama wajib diisi. |
| `contact.error.email` | Masukkan email yang valid. |
| `contact.error.message` | Pesan minimal 10 karakter. |
| `contact.mailto` | Kirim lewat email |

### 5.3 404, navigasi, aksesibilitas

| Kunci | Teks |
|---|---|
| `404.title` | Botol ini tersesat. |
| `404.body` | Halaman yang kamu cari tidak ada. |
| `404.cta` | Kembali ke awal |
| `nav.home` | Home |
| `nav.about` | About |
| `nav.content` | Konten |
| `nav.contact` | Contact |
| `nav.menu.open` | Buka menu |
| `nav.menu.close` | Tutup menu |
| `audio.on` | Nyalakan suara |
| `audio.off` | Matikan suara |
| `loop.hint` | (Tarik untuk mulai lagi) |
| `skip` | Lompat ke konten utama |
| `static.start` | Mulai dari awal |
| `noscript` | Situs ini membutuhkan JavaScript untuk menampilkan ceritanya. |
| `article.back` | ← Galeri Artikel |
| `article.next` | Artikel berikutnya |
| `filter.all` | Semua |
| `filter.empty` | Belum ada artikel untuk kombinasi ini. |

### 5.4 Data situs (`src/content/site.ts`) · semua *placeholder*

```ts
export const SITE = {
  name: "Re:bottle",
  tagline: "Bawa botolmu besok.",
  subtheme: "Kampanye Peduli Lingkungan",
  competition: "Techno Versary Vol. II · HIMA TI FKOM Universitas Kuningan",
  theme: "EcoDigital For Environment",
  email: "TODO@example.com",          // ganti sebelum rilis
  formspreeId: "TODO",                  // ganti sebelum rilis
  repoUrl: "TODO",
  team: [
    { name: "TODO (Sophie)", role: "TODO", institution: "Universitas Gadjah Mada" },
    { name: "TODO", role: "TODO", institution: "TODO" },
  ],
} as const;
```

---

## 6. Daftar verifikasi fakta (`src/content/facts.ts`)

### 6.1 Bentuk entri

```ts
type Fact = {
  key: string;
  statement: string;      // kalimat yang tampil, bertanda {X}
  value: string | number | null;   // null = belum diverifikasi → komponen tidak menampilkan
  unit?: string;
  scope: string;          // wilayah/populasi
  year: number | null;
  sourceTitle: string;
  sourceUrl: string;
  publisher: string;
  accessed: string;       // tanggal akses
  verified: boolean;      // false = jangan tampil
  note?: string;          // batasan, rentang, ketidakpastian
};
```

### 6.2 Entri yang dibutuhkan

| Kunci | Dipakai di | Yang harus dipastikan | Kandidat sumber |
|---|---|---|---|
| `mikroplastik-mingguan` | Bab 6 | Angka dan satuan (partikel vs gram), rentang, metode; apakah klaim masih diperdebatkan | WHO, kajian peer-review terkini, UNEP |
| `lama-terurai` | Bab 3, A2 | Rentang waktu terurai botol PET; "450 tahun" hanya bila ada sumber | Kajian penguraian plastik, NOAA, UNEP |
| `terumbu-pemutihan` | Bab 4 (opsional) | Persentase dan tahun pemutihan massal | NOAA Coral Reef Watch, laporan GCRMN |
| `kenaikan-laut` | Bab 4 (opsional) | Laju kenaikan muka laut | IPCC AR6, NASA |
| `botol-terkumpul` | Bab 8 | Persentase botol terkumpul, wilayah, tahun | KLHK SIPSN, Bank Dunia, Ellen MacArthur Foundation |
| `sampah-sungai-laut` | A3 | Kontribusi sungai terhadap sampah laut Indonesia | Bank Dunia, KLHK, kajian peer-review |
| `produksi-plastik` | A6 | Produksi plastik global dan porsi bahan fosil | OECD Global Plastics Outlook |
| `emisi-plastik` | A6 | Emisi siklus hidup plastik | OECD, CIEL |
| `daur-ulang-global` | B6 | Persentase plastik global yang didaur ulang | OECD |
| `deposit-hasil` | B5 | Angka pengumpulan negara dengan sistem deposit | Reloop, laporan resmi negara |
| `bank-sampah` | B3 | Jumlah bank sampah dan kontribusinya | KLHK |
| `pet-menjadi-serat` | Bab 9, B1 | Pernyataan bahwa PET daur ulang kerap menjadi serat | Ellen MacArthur Foundation, asosiasi industri |

### 6.3 Aturan akhir

- Sumber primer lebih dulu (lembaga resmi, jurnal), media sebagai pelengkap.
- Tahun data ≤ 5 tahun terakhir, kecuali data historis.
- Bila sumber saling bertentangan: tampilkan rentang atau pilih formulasi yang paling hati-hati, catat di `note`.
- `verified:false` → komponen **menyembunyikan** kalimat dan memakai `fallback` (bagian 2).
- Audit akhir (T10.6): setiap angka yang tampil di UI harus dapat ditelusuri ke satu entri `facts.ts`.

---

## 7. Daftar periksa naskah

- [ ] Semua teks [DISEPAKATI] identik dengan konsep v2.
- [ ] Tidak ada angka di UI yang tidak berasal dari `facts.ts` terverifikasi.
- [ ] Tidak ada klaim sebab-akibat langsung.
- [ ] Setiap bab ≤ 2 baris isi.
- [ ] Surat ≤ 2 kalimat.
- [ ] Setiap artikel: ≥ 2 sumber berbeda penerbit, label ganda, ringkasan ≤ 140 karakter.
- [ ] Placeholder `TODO` di `site.ts` terganti.
- [ ] Teks tombol, galat, dan `aria-label` terisi seluruhnya.
- [ ] Ejaan dan tanda baca diperiksa (PUEBI).
