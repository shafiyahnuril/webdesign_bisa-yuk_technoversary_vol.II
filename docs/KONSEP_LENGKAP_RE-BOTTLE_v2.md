# KONSEP LENGKAP WEBSITE: Re:bottle

**Techno Versary Vol. II: Web Design Competition**
Tema lomba: *"EcoDigital For Environment: Web Design Competition"*
Subtema: **Kampanye Peduli Lingkungan**
Tagline: ***"Bawa botolmu besok."***

> **Status dokumen:** versi ini memuat **hanya hal-hal yang sudah disepakati tim** dan menggantikan versi sebelumnya. Hal yang sengaja dipastikan belakangan (design system, durasi gulir tiap bab, naskah lengkap, wireframe, dll.) dikumpulkan di **Bagian 19**. Bagian yang bergantung pada design system diberi tanda **[menunggu design system]**.

---

## DAFTAR ISI
1. Ringkasan Konsep
2. Konteks Lomba dan Kepatuhan Aturan
3. Identitas: Nama, Pesan Kampanye, dan Prinsip Cerita
4. Perilaku Logo "Re:"
5. Struktur Website (4 Halaman)
6. Halaman Home: Hero (Bab 1)
7. Halaman Home: Mesin Cerita
8. Halaman Home: Storyline 10 Bab
9. Halaman Home: Loop Tak Berujung
10. Halaman Home: Navbar
11. Halaman Home: Panel Menu
12. Halaman Home: Penanda Bab (Kiri Layar)
13. Kursor Cincin
14. Elemen Visual, Audio, dan Teknik
15. Halaman About
16. Halaman Konten ("Galeri Artikel")
17. Halaman Contact
18. Sistem Visual Global (Palet dan Isyarat)
19. Hal yang Dipastikan Belakangan
20. Teknologi dan Aturan Aset
21. Cakupan Pengerjaan dan Fitur yang Dibatalkan
22. Aksesibilitas, Performa, dan Responsif
23. Akurasi Konten
24. Pemetaan ke Kriteria Penilaian
25. Ketentuan Pengumpulan

---

## 1. RINGKASAN KONSEP

**Gambaran satu kalimat:**
Re:bottle adalah pengalaman *scrollytelling* yang mengikuti **satu botol plastik** dari awal hidupnya sampai mikroplastik kembali ke piring makan kita (Babak I), sementara **suhu bumi naik** dan seluruh tampilan website ikut memburuk. Setelah satu titik balik (*"Bagaimana jika semua ini tidak terjadi?"*), cerita diulang dari sisi lain (Babak II): botol dibuang **di tempat yang benar**, didaur ulang, lalu ditutup dengan **tumbler isi ulang** dan ajakan **"Bawa botolmu besok."** Ujung halaman Home tersambung kembali ke awal sehingga halaman berbentuk **gulir tak berujung (loop)**.

**Asal konsep:** gabungan dua ide, yaitu *Bumi Demam* (UI yang ikut memanas lewat suhu global) dan *Biografi Sebotol Plastik* (cerita mengikuti satu botol).

**Analogi:** botol adalah **tokoh utama** film, suhu bumi adalah **detak jantung** yang terus naik selama cerita berjalan.

**Ciri utama:**
- Satu variabel `progress` menggerakkan semuanya: botol 3D, suhu, warna, data, teks, penanda bab, logo, dan audio.
- Dua babak: **Jika Kita Abai** (Bab 1 sampai 6) dan **Jika Kita Peduli** (Bab 7 sampai 10), dipisah punchline.
- Bab **tidak bisa dilewati**.
- Loop **selalu aktif** dan tidak mengenal "siklus". Satu-satunya perbedaan adalah Babak I dan Babak II.
- Kata **"Re:"** pada nama pudar di Babak I dan menyala di Babak II.
- Halaman Konten berjudul **Galeri Artikel**, berisi 12 artikel dampak.

---

## 2. KONTEKS LOMBA DAN KEPATUHAN ATURAN

| Aspek | Ketentuan guidebook | Penerapan di konsep ini |
|---|---|---|
| Tema | Website wajib bertema lingkungan | Seluruh isi berfokus pada sampah plastik, iklim, dan kebiasaan botol minum |
| Subtema | Memilih satu subtema | **Kampanye Peduli Lingkungan**, didukung materi edukasi (halaman Konten) dan perspektif global (benang suhu dan artikel global) |
| Halaman minimal | Home, About, Konten/Artikel/Galeri, Contact | Keempatnya ada (Bagian 5) |
| Framework | Boleh Bootstrap, Tailwind, React, dsb. | **Vite + React + TypeScript** dengan Three.js dan GSAP (semuanya gratis dan open-source) |
| Komponen | Dilarang berbayar, template, atau premium | Hanya gratis, open-source, atau buatan sendiri |
| Orisinalitas | Belum pernah diikutkan lomba lain | Konsep dan aset dibuat sendiri |
| Konten | Tanpa SARA, pornografi, kekerasan, hoaks | Isi edukatif, angka hanya dari sumber terverifikasi (Bagian 23) |
| Unsur website | Estetis, UI baik, UX nyaman, fungsionalitas optimal, pesan jelas | Dipetakan di Bagian 24 |

**Mengapa subtema Kampanye:** struktur website adalah struktur kampanye.

| Unsur kampanye | Di Re:bottle |
|---|---|
| Masalah | Babak I: perjalanan botol sampai ke piring makan |
| Titik balik | Punchline *"Bagaimana jika semua ini tidak terjadi?"* |
| Solusi | Babak II: surat dari botol |
| Ajakan bertindak | Penutup **"Bawa botolmu besok."** |
| Bukti pendukung | Galeri Artikel dengan sumber |

Edukasi adalah **alat** untuk kampanye: artikel membuktikan, cerita menggerakkan, dan keduanya bermuara pada satu ajakan.

---

## 3. IDENTITAS: NAMA, PESAN KAMPANYE, DAN PRINSIP CERITA

### 3.1 Nama
- **Nama website: Re:bottle** (ditulis dengan "bottle" berhuruf kecil).
- Tiga makna "Re:" yang semuanya ada di cerita:
  1. **Balasan surat** (Re:), selaras dengan "Surat dari Botol".
  2. **Isi ulang, pakai ulang, dan daur ulang** (re-), selaras dengan tumbler dan daur ulang.
  3. **Ulang** (re-), selaras dengan loop.
- Ada gema samar kata *reboot* (restart, *rewind*) tanpa kehilangan kata "botol".

### 3.2 Pesan kampanye dan ajakan
- **Pesan utama:** botol isi ulang (tumbler) lebih baik daripada botol minum plastik sekali pakai.
- **Ajakan bertindak:** **"Bawa botolmu besok."**

### 3.3 Prinsip penghubung Babak I, Babak II, dan kesimpulan
Membuang sampah pada tempatnya itu **benar dan baik**, tetapi itu **perbaikan di ujung**. Botol yang tidak perlu dibuat sama sekali **lebih baik lagi**. Dengan begitu Babak II tidak "dibantah" oleh akhir ceritanya. Pengunjung diajak naik satu tingkat: dari warga yang baik menjadi warga yang mencegah. Ini sejalan dengan hierarki pengelolaan sampah (kurangi, pakai ulang, daur ulang).

**Analogi:** air bocor. Mengepel itu baik, tetapi menutup kerannya lebih baik.

### 3.4 Tiga hal yang wajib ada dalam cerita
1. **Dampak buruk dari tidak peduli** (Babak I).
2. **Dampak baik dari membuang pada tempatnya** (Bab 7 sampai 9).
3. **Kesimpulan kampanye:** isi ulang lebih baik dari sekali pakai (Bab 10).

### 3.5 Label skenario
Hubungan "satu botol menaikkan suhu bumi" adalah **perangkat naratif**, bukan klaim sebab-akibat langsung. Karena itu Babak I diberi label kecil: *"Skenario jika pola konsumsi plastik terus berlanjut."* (letak: di hero dekat petunjuk gulir, hilang saat gulir dimulai).

---

## 4. PERILAKU LOGO "Re:"

"Re:" adalah bagian dari nama **Re:bottle**. Kondisinya **dihitung dari posisi cerita**, bukan dari riwayat pengunjung.

| Posisi | "Re:" |
|---|---|
| Babak I (Bab 1 sampai 6, termasuk punchline) | **Pudar** (tetap terbaca) |
| **Awal Babak II (awal Bab 7)** | **Menyala** (bertahap, ±0,9 detik) |
| Bab 7 sampai 10 | Menyala |
| Loop kembali ke Bab 1 | **Pudar lagi** (instan, di balik lingkaran loop) |
| Pengunjung menggulir mundur dari Bab 7 ke Bab 6 | Meredup lagi |
| Halaman About, Konten, Contact | **Menyala penuh** |
| Blok identitas di panel menu | Mengikuti status yang sama dengan logo navbar |

- Berlaku untuk **logo di pojok kiri atas navbar** dan **judul hero**, dikendalikan satu penyakelar yang sama sehingga keduanya tidak mungkin tidak sinkron.
- Cara membuat "pudar" (opasitas rendah atau huruf berbentuk garis luar) dan gaya penyalaannya **[menunggu design system]**. Hasil akhirnya harus tetap terbaca, bukan tampak seperti kesalahan tampilan.
- Tidak ada penghitung siklus dan tidak ada teks "Siklus ke-2".

```html
<h1 class="brand"><span class="re">Re:</span><span class="bt">bottle</span></h1>
```
```css
.brand .re { opacity: var(--re-dim); transition: opacity .9s ease; }
[data-re="on"] .brand .re { opacity: 1; }
```
```js
// dipanggil dari renderScene(shown)
function updateRe(p) {
  document.documentElement.dataset.re = p >= PUNCH.to ? "on" : "off";   // PUNCH.to = awal Bab 7
}
// Halaman lain (About, Konten, Contact): <html data-re="on"> statis
```

---

## 5. STRUKTUR WEBSITE (4 HALAMAN)

| Halaman | Tautan di navbar | Peran | Isi final |
|---|---|---|---|
| **Home** | Home | Pengalaman inti (sinematik, linear, tidak bisa dilewati, tak berujung) | Hero, 10 bab, punchline, loop, navbar yang mengempis, penanda bab, kursor |
| **About** | About | Kredibilitas dan kedalaman tema | Latar isu, target 1,5°C, daftar sumber data, atribusi aset, tim |
| **Konten** | **Konten** | Wadah isi informatif (bebas dijelajahi) | Judul halaman **Galeri Artikel**: 12 artikel dampak, pil filter, halaman detail |
| **Contact** | Contact | Fungsionalitas dan penutup kampanye | Form berfungsi dan kalimat penutup kampanye |

**Analogi:** Home adalah **bioskop** (pengunjung menonton cerita yang diatur kita). Konten adalah **perpustakaan di belakang bioskop** (pengunjung menjelajah sendiri).

**Aturan struktur:**
- Tautan di navbar dan panel menu bertuliskan **Konten**; judul (headline) halamannya **Galeri Artikel**. Teks tab browser: *Galeri Artikel | Re:bottle*.
- Home berbentuk loop sehingga **footer tidak pernah terlihat**. Info yang biasanya ada di footer (kontak, sumber data) dipindahkan ke **About** dan **Contact**.
- **Halaman About, Konten, dan Contact memakai navbar lengkap yang menempel** (tidak mengempis).
- Penanda bab di kiri layar hanya ada di Home.
- Kembali ke Home dari halaman lain berarti cerita mulai dari hero.

---

## 6. HALAMAN HOME: HERO (BAB 1)

Home dibuka **langsung** dengan judul dan botol. Tidak ada adegan minyak bumi menjadi botol. **Hero adalah Bab 1.**

| Elemen | Isi |
|---|---|
| Latar | Biru kobalt `#0B2B80` dengan butiran halus |
| Judul | **Re:bottle** berukuran besar di tengah, dengan "Re:" pudar |
| Objek | **Botol 3D** bening di tengah (di depan atau di belakang judul **[menunggu wireframe]**) |
| Petunjuk | **(Gulir untuk mulai)**, bergaris bawah |
| Label skenario | Teks kecil *"Skenario jika pola konsumsi plastik terus berlanjut."* dekat petunjuk gulir, hilang saat gulir dimulai |
| Suhu awal | +1,2°C |
| Navbar | Tampil lengkap (Bagian 10) |
| Penanda bab | Daftar Babak I di tengah-kiri dengan Bab 1 aktif (Bagian 12) |
| Kursor | Cincin (Bagian 13) |

Setelah loop, hero tampil **sama persis** setiap kali. Tidak ada teks tambahan.

---

## 7. HALAMAN HOME: MESIN CERITA

### 7.1 Satu sumber kebenaran: `progress`
Hanya ada **satu variabel** yang menggerakkan semuanya, yaitu posisi cerita `shown` (0 sampai 1) hasil gulir.

```
scroll → target → [ratchet] → shown (0–1) ─┬─→ posisi, rotasi, kondisi botol 3D dan adegan
                                            ├─→ suhu (+1,2 ... +4,0 ... +1,5°C)
                                            ├─→ palet warna (latar, aksen, tinta)
                                            ├─→ data dan counter (450 tahun, partikel, dst.)
                                            ├─→ penanda bab kiri dan teks bab
                                            ├─→ "Re:" (pudar atau menyala)
                                            ├─→ navbar (terbuka atau mengempis)
                                            └─→ audio ambient
```
Satu sumber kebenaran membuat semua efek otomatis sinkron dan mudah di-debug.

### 7.2 Suhu per posisi cerita

| Bagian | Suhu |
|---|---|
| Bab 1 | +1,2°C |
| Bab 2 | +1,5°C |
| Bab 3 | +2,0°C |
| Bab 4 | +2,7°C |
| Bab 5 | +3,3°C |
| Bab 6 | +4,0°C |
| Punchline | +4,0°C turun ke +1,5°C (*rewind*) |
| **Bab 7 sampai 10** | **+1,5°C (konsisten)** |

**Alasan Babak II konsisten +1,5°C:** suhu yang turun saat proses daur ulang bisa terbaca sebagai "daur ulang mendinginkan bumi", dan itu klaim yang tidak bisa dipertanggungjawabkan. +1,5°C adalah ambang target iklim yang dipakai di halaman About: Babak I **melewatinya**, Babak II **menahannya**.

### 7.3 Palet dan transisi warna
- Warna diinterpolasi dari `shown` di ruang **OKLCH** lewat `color-mix`.
- **Aturan dataran:** sekitar 70% pertama jendela baca tiap bab berwarna murni, 30% sisanya bergeser ke bab berikutnya. Teks selalu dibaca di atas warna yang stabil.
- Nilai palet ada di Bagian 18.

```css
body {
  background: color-mix(in oklch, var(--bg-a), var(--bg-b) var(--mix));
  color:      color-mix(in oklch, var(--ink-a), var(--ink-b) var(--mix));
}
```
```js
function applyPalette(p) {
  const { a, b, k } = segmentAt(p);          // a,b = indeks palet; k = 0..1 di dalam segmen
  const eased = smoothstep(0.7, 1, k);       // 70% pertama = warna murni
  root.style.setProperty("--bg-a", PALETTE[a].bg);
  root.style.setProperty("--bg-b", PALETTE[b].bg);
  root.style.setProperty("--ink-a", PALETTE[a].ink);
  root.style.setProperty("--ink-b", PALETTE[b].ink);
  root.style.setProperty("--mix", (eased * 100) + "%");
}
```

### 7.4 Bab tidak boleh dilewati
Tombol "Lewati ke Bab X" **dihapus total**. Penggantinya adalah penjaga alur:

| Celah untuk melompat | Solusi |
|---|---|
| Menyeret scrollbar | Scrollbar bawaan disembunyikan (`scrollbar-width: none`) |
| Tombol End, PageDown, spasi | Dicegat lalu diganti dengan gulir bertahap |
| Gulir sangat cepat | **Mesin ratchet**: animasi dikejar bertahap dan tidak bisa melompat lebih dari batas per frame |
| Klik penanda bab | Penanda bab **hanya-baca**, bukan tombol |

> **Tidak ada indikator progres lain** (bilah, titik, atau persentase). Satu-satunya indikator adalah daftar judul bab di kiri layar (Bagian 12).

```js
let target = 0;         // posisi gulir sebenarnya (0-1)
let shown = 0;          // posisi yang ditampilkan
const MAX_STEP = 0.004; // batas maju per frame

gsap.ticker.add(() => {
  const diff = target - shown;
  shown += Math.sign(diff) * Math.min(Math.abs(diff), MAX_STEP);
  renderScene(shown);   // botol, suhu, warna, teks, penanda bab, "Re:", navbar, audio
});
```
**Analogi:** eskalator, bukan lift. Pengunjung boleh naik cepat, tetapi tetap melewati setiap lantai. Seluruh adegan selalu terputar, hanya kecepatannya yang dibatasi.

**Aturan tambahan:**
- **Jeda baca:** setiap bab mendapat durasi gulir yang cukup untuk membaca teksnya. Punchline mendapat jeda khusus **2 sampai 3 detik gulir**, dan langkah 10d serta 10e mendapat porsi panjang. Durasi pastinya **dipastikan belakangan** (Bagian 19).
- **Navbar antar-halaman tetap ada.** Pindah ke About, Konten, atau Contact tidak dianggap melewati bab.
- **Mode `prefers-reduced-motion`:** tampilkan **panel statis berurutan** untuk seluruh bab dan punchline (tanpa 3D), yang juga tidak bisa dilompati.

---

## 8. HALAMAN HOME: STORYLINE 10 BAB

Struktur: **Babak I (Bab 1 sampai 6) → Punchline → Babak II (Bab 7 sampai 10) → Loop kembali ke Bab 1.**

### 8.1 BABAK I: "Jika Kita Abai"
Label skenario: *"Skenario jika pola konsumsi plastik terus berlanjut."*

| Bab | Judul | Suhu | Adegan botol (3D) | Tampilan | Data / teks |
|---|---|---|---|---|---|
| 1 | **Lahir** | +1,2°C | Hero: botol baru langsung tampil, bening dan siap dipakai (tanpa adegan minyak bumi) | Biru kobalt jernih, butiran halus, "Re:" pudar | *"Dibuat dari fosil, usia 0 hari"*. Petunjuk *(Gulir untuk mulai)* |
| 2 | **Sekali Pakai** | +1,5°C | Botol di tangan, diminum, lalu dibuang begitu saja | Biru mulai kusam, *noise* tipis | *"Dipakai 10 menit"* |
| 3 | **Tersesat** | +2,0°C | Botol jatuh ke sungai dan hanyut menyusuri kota | Biru baja berkabut tipis, botol mulai keruh | Counter **"450 tahun lagi"** mulai naik |
| 4 | **Lautan** | +2,7°C | Botol terapung di laut, matahari terik, ombak makin ganas | Biru tua pekat, ***heat shimmer***, tepi menggelap, karang memutih (putih tulang) | Air laut naik, karang memutih |
| 5 | **Terurai** | +3,3°C | Botol retak, lalu pecah menjadi **partikel mikroplastik** (efek partikel) | Biru nyaris malam, retakan putih tulang, **huruf judul mulai "meleleh"** | Jumlah partikel bertambah |
| 6 | **Kembali ke Kita** | +4,0°C | Partikel masuk ke ikan, lalu ke **piring makan** | Biru kehitaman, retakan putih tulang menyala, huruf meleleh | *"Kamu makan sekitar X mikroplastik per minggu"* (nilai X hanya dari sumber terverifikasi) |

Bab 6 adalah **ending story** Babak I.

### 8.2 PUNCHLINE: Layar Hening

| Aspek | Isi |
|---|---|
| Suhu | +4,0°C turun ke +1,5°C |
| Palet | `#05080F` → `#08131F` · aksen `#C9D3E6` · tinta `#EDEDED` |
| Adegan | Botol dan partikel memudar, tepi menggelap, layar hampir hitam. Muncul teks besar **"Bagaimana jika semua ini tidak terjadi?"** |
| Efek | *Rewind*: suhu turun, warna mendingin, retakan memudar |
| Gulir | Jeda khusus 2 sampai 3 detik gulir agar tidak tergesa |
| Penanda bab kiri | **Disembunyikan** agar layar benar-benar hening |
| Catatan | Perbedaan warna dari Bab 6 kecil, jadi rasa "hening" bertumpu pada botol dan partikel yang memudar, tepi menggelap, dan teks yang berdiri sendiri |

Ini adalah transisi emosional terpenting dalam cerita.

### 8.3 BABAK II: "Jika Kita Peduli" ("Surat dari Botol")
Botol menjadi **narator lewat surat** bergaya tulisan tangan, satu surat per bab. Transisi dari Babak I adalah **membuang botol plastik ke tempatnya**, disertai cerita sisi lain tentang dampak baik dari tindakan itu. Di awal Bab 7, **"Re:" menyala**.

| Bab | Judul | Suhu | Adegan | Teks surat | Data / catatan |
|---|---|---|---|---|---|
| 7 | **Di Tempat yang Benar** | +1,5°C | Lihat 8.4 | *"Kamu tidak membuangku ke sungai. Terima kasih."* | *"Satu keputusan, 10 detik"*. Sungai jernih tanpa kabut |
| 8 | **Perjalanan Kedua** | +1,5°C | Botol diangkut, dipilah dari sampah lain (PET dikelompokkan), lalu dibersihkan | *"Aku beruntung. Tidak semua temanku sampai di sini."* | Persentase botol yang berhasil terkumpul (sumber terverifikasi) |
| 9 | **Hidup Baru, Tapi...** | +1,5°C | Dicacah, dicuci, dilebur, lalu **dicetak menjadi produk baru** | *"Aku jadi sesuatu yang baru, tapi prosesnya butuh energi dan air."* | Produk baru bukan botol lagi (serat atau benda lain). Kilau amber kecil dari tungku (Bagian 18) |
| 10 | **Surat Terakhir** | +1,5°C | Adegan kamera penutup (lihat 8.5) | Surat penutup dan **"Bawa botolmu besok."** | Puncak emosi kampanye |

### 8.4 Bab 7 "Di Tempat yang Benar" (rinci)
Bab 7 adalah **cermin Bab 2**: momen yang sama (botol selesai diminum), keputusan yang berbeda. Analogi: film *Sliding Doors*.

| | Bab 2 (Sekali Pakai) | Bab 7 (Di Tempat yang Benar) |
|---|---|---|
| Momen | Botol selesai diminum | Momen yang sama |
| Keputusan | Dibuang sembarangan | Dimasukkan ke tempat sampah berlabel |
| Akhir | Berujung ke sungai dan laut | Berujung ke jalur yang benar |
| Teks | *"Dipakai 10 menit"* | *"Satu keputusan, 10 detik"* |

| Langkah | Isi |
|---|---|
| **7a** | Setelah *rewind* punchline, tangan yang sama dari Bab 2 memegang botol kosong. "Re:" menyala di logo |
| **7b** | Botol dimasukkan ke deretan **tempat sampah berlabel** (masuk ke yang berlabel *Plastik*). Bunyi pendek saat botol masuk, hanya jika audio dinyalakan |
| **7c** | Kilas singkat: **sungai dari Bab 3 kini jernih** tanpa kabut (bukti "ada dampak dari membuang pada tempatnya") |
| **7d** | Surat tampil dengan gaya tulisan tangan: *"Kamu tidak membuangku ke sungai. Terima kasih."* |

Bab 7 adalah bab **paling pendek** di Babak II, berfungsi sebagai napas lega setelah Babak I.

### 8.5 Bab 10 "Surat Terakhir": Adegan Kamera Penutup
Kamera bekerja seperti **sutradara yang menunjuk dengan lampu sorot**.

| Langkah | Kamera | Isi layar | Teks |
|---|---|---|---|
| **10a. Produk baru** | Dekat (*close*) | Satu produk hasil daur ulang (misalnya kaus atau tas) di tengah | *"Aku jadi sesuatu yang berguna."* |
| **10b. Zoom out** | Mundur perlahan | Terungkap **koleksi** produk: pakaian, tas, perabot taman, karpet, dll. | *"Ternyata aku tidak sendirian."* |
| **10c. Geser** | Pan ke sisi lain | Di ujung rak ada **tumbler isi ulang**, terpisah dari produk lain | Surat berhenti sejenak |
| **10d. Zoom in dan sorot** | Maju ke tumbler | Lampu sorot menyala di tumbler, produk lain meredup | *"Aku senang diselamatkan. Tapi aku akan lebih senang kalau tidak perlu dibuat."* |
| **10e. Ajakan** | Diam | Tumbler tampil penuh | **"Bawa botolmu besok."** |

**Catatan agar adegan efektif:**
- **Kontras makna.** Produk daur ulang berarti "bagus tapi di ujung", tumbler berarti "bagus dan tidak perlu dibuang". Karena itu tumbler tampil **berdiri sendiri dan agak terpisah**, bukan menyatu di tengah koleksi.
- **Kejujuran produk.** Banyak botol PET yang didaur ulang menjadi serat atau produk lain, bukan menjadi botol lagi. Ini sesuai dengan bunyi surat Bab 9, jadi kalimatnya dipertahankan.
- **Jeda baca.** Langkah 10d dan 10e mendapat porsi gulir yang cukup panjang.
- **Akhir halaman:** di akhir Bab 10 muncul petunjuk **(Terus gulir)** bergaris bawah (Bagian 9).

**Teknik kamera (Three.js + GSAP):** satu timeline yang dikendalikan nilai `shown`.
```js
const tl = gsap.timeline({ paused: true });

tl.to(camera.position, { z: 9, duration: 2 })           // 10b: zoom out
  .to(camera.position, { x: 5, duration: 2 }, ">")       // 10c: geser
  .to(camera.position, { x: 5, z: 3, duration: 2 })      // 10d: zoom in
  .to(spot, { intensity: 3 }, "<")                       // sorot tumbler
  .to(otherProducts.map(o => o.material),
      { opacity: 0.25, duration: 1 }, "<");              // redupkan produk lain

function renderScene(p) { tl.progress(mapRange(p, 0.90, 1, 0, 1)); }
```
Jika Three.js terasa berat di HP, produk dan tumbler dibuat dari bentuk dasar prosedural (silinder dan kotak).

---

## 9. HALAMAN HOME: LOOP TAK BERUJUNG

### 9.1 Prinsip
- Loop **selalu aktif**: Home adalah gulir tak berujung. Setiap kali pengunjung mencapai akhir Bab 10, gestur "tarik penuh" membawa mereka kembali ke Bab 1, tanpa batas.
- **Tidak ada konsep siklus.** Tidak ada penghitung, tidak ada teks "Siklus ke-2", dan tidak ada perbedaan antara putaran pertama dan berikutnya. Yang berbeda hanyalah **Babak I dan Babak II**.
- Loop **hanya ke arah maju**. **Tidak ada loop mundur** (menggulir ke atas dari hero tidak berefek).
- Transisinya **tanpa animasi apa pun**. Yang ada hanya **gestur**: setengah lingkaran yang mengikuti gulir pengunjung.
- **Tujuan:** mencegah pengunjung berpindah karena gulir tidak sengaja. Hanya gulir **langsung dan terus-menerus** yang memicu loop.

**Analogi:** pintu berpegas. Didorong sedikit lalu dilepas, pintunya menutup lagi. Hanya yang mendorong sampai tuntas yang bisa lewat.

### 9.2 Perilaku

| Aksi pengunjung | Yang terjadi |
|---|---|
| Menggulir sedikit lalu berhenti | Setengah lingkaran muncul sedikit, lalu **langsung turun kembali** |
| Menggulir terus-menerus (atau lecutan trackpad) | Lingkaran naik terus sampai memenuhi layar |
| Lingkaran penuh | Adegan langsung kembali ke hero (Bab 1) |
| Tidak menggulir sama sekali | Tidak ada apa-apa. Hanya petunjuk **(Terus gulir)** bergaris bawah |

### 9.3 Yang terjadi saat reset (instan, di balik lingkaran)
- Posisi cerita kembali ke awal Bab 1, suhu +1,2°C, palet Bab 1.
- "Re:" pudar lagi.
- Daftar bab kiri kembali ke Babak I.
- Hero tampil sama seperti pembukaan pertama.

### 9.4 Rancangan warna
| Elemen | Warna |
|---|---|
| Latar akhir Bab 10 | Sage netral `#D9E6D6` |
| Setengah lingkaran | **Sama dengan latar hero** `#0B2B80` |
| Saat lingkaran penuh | Layar sudah berwarna hero, jadi adegan diganti tanpa terlihat |

### 9.5 Kode inti
```css
.dome {
  --pull: 0;
  position: fixed; left: 50%; top: 100vh;          /* mulai tersembunyi di bawah layar */
  width:  max(220vw, 240vh);
  height: max(220vw, 240vh);
  border-radius: 50%;
  background: var(--hero-bg);
  transform: translate(-50%, calc(var(--pull) * -135vh));  /* pull 1 = menutup seluruh layar */
  will-change: transform;
  pointer-events: none;
  z-index: 50;                                      /* di atas adegan, di bawah navbar dan petunjuk */
}
.snap .re, .snap .chapters ol, .snap .chapters li { transition: none !important; }   /* saat reset loop */
```

```js
const GAIN       = 1 / 1400;  // gulir yang dibutuhkan sampai penuh (~1.400 px)
const REST_DELAY = 90;        // ms tanpa gulir sebelum lingkaran mulai kembali
const DECAY      = 0.12;      // kecepatan kembali (per frame)

let pull = 0, shownPull = 0, lastInput = 0, busy = false;

function addPull(dy) {
  // hanya aktif setelah Bab 10 selesai (kompatibel dengan ratchet)
  if (busy || shown < 0.999 || dy <= 0) return;
  pull = Math.min(1, pull + dy * GAIN);
  lastInput = performance.now();
}

window.addEventListener("wheel", e => addPull(e.deltaY), { passive: true });

// layar sentuh
let lastY = null;
window.addEventListener("touchstart", e => { lastY = e.touches[0].clientY; }, { passive: true });
window.addEventListener("touchmove", e => {
  const y = e.touches[0].clientY;
  addPull(lastY - y);          // jari bergeser ke atas = positif
  lastY = y;
}, { passive: true });
window.addEventListener("touchend", () => { lastY = null; });

// panah bawah yang ditahan (key repeat)
window.addEventListener("keydown", e => { if (e.key === "ArrowDown") addPull(60); });

gsap.ticker.add(() => {
  if (busy) return;
  if (performance.now() - lastInput > REST_DELAY) pull = Math.max(0, pull - DECAY);
  shownPull += (pull - shownPull) * 0.35;           // sedikit penghalusan
  dome.style.setProperty("--pull", shownPull);
  if (pull >= 1) commitLoop();
});

function commitLoop() {
  busy = true;
  dome.style.setProperty("--pull", 1);              // layar kini berwarna hero
  requestAnimationFrame(() => {
    root.classList.add("snap");                     // pudar dan pergantian daftar bab instan
    resetScene();                                   // posisi cerita kembali ke awal Bab 1
    dome.style.setProperty("--pull", 0);            // lingkaran disembunyikan tanpa animasi
    pull = shownPull = 0;
    requestAnimationFrame(() => { root.classList.remove("snap"); busy = false; });
  });
}
```

### 9.6 Parameter penyetelan
| Parameter | Dinaikkan | Diturunkan |
|---|---|---|
| `GAIN` | Lebih ringan (gulir singkat cukup) | Lebih berat (perlu gulir panjang) |
| `REST_DELAY` | Jeda antar gulir lebih ditoleransi | Lebih ketat |
| `DECAY` | Lingkaran kembali lebih cepat | Kembali lebih pelan |

Titik awal: sekitar **1.400 px** gulir berkelanjutan sampai penuh, dan lingkaran kembali dalam kira-kira 8 frame setelah gulir berhenti. Setel ulang setelah diuji di **mouse biasa, trackpad laptop, dan HP**.

### 9.7 Ketentuan
- Mesin **ratchet tetap berlaku**: gestur hanya aktif setelah `shown >= 0.999`, jadi tidak ada bab yang terlewat.
- **End dan PageDown** tetap dicegat. Hanya **panah bawah yang ditahan** yang boleh mengisi gestur.
- Roda mouse berjenjang (±100 px per putaran) membutuhkan putaran cepat. `REST_DELAY` 90 ms menolerir jeda antar putaran. Trackpad dengan inersia bisa penuh dalam satu lecutan kuat.
- `prefers-reduced-motion`: cukup matikan penghalusan (`shownPull = pull`).

---

## 10. HALAMAN HOME: NAVBAR

### 10.1 Konsep
Navbar **tampil lengkap saat halaman baru dibuka**, lalu **mengempis ke arah tombol hamburger** ketika pengunjung mulai menggulir (mengacu pada gaya `unseen.co/projects/cult-of-the-north`).

**Analogi:** papan petunjuk di gerbang taman. Di gerbang, petunjuk dipasang besar. Begitu pengunjung masuk dan menikmati pemandangan, papannya dilipat dan hanya satu tombol kecil yang tersisa.

### 10.2 Perilaku

| Kondisi | Navbar |
|---|---|
| Halaman baru dibuka (hero) | Logo **Re:bottle** di kiri, tautan (**Home, About, Konten, Contact**), dan tombol bulat hamburger (ikon dua titik) di kanan |
| Pengunjung mulai menggulir | Tautan bergeser ke arah tombol bulat sambil memudar (yang terdekat bergerak lebih dulu). Logo dan tombol tetap |
| Sepanjang cerita | Hanya logo dan tombol bulat |
| Loop kembali ke hero | Navbar **terbuka lagi** |
| Tombol diklik | Panel menu terbuka (Bagian 11) |
| Panel menu terbuka | Tautan navbar mengempis dulu (timeline yang sama) agar tidak bertumpuk di atas panel, lalu kembali saat panel ditutup jika posisi masih di hero |

### 10.3 Aturan
- Tombol bulat **selalu ada**. Yang berubah hanya tautannya.
- Menu hanya berisi **halaman**, bukan bab, sehingga tidak menjadi jalan pintas cerita.
- Pemicu **bukan** `window.scrollY`, tetapi nilai `shown` dari mesin ratchet.
- **Dua ambang** agar tidak berkedip: tutup saat `shown > 0.01`, buka lagi saat `shown < 0.003`.
- Di HP: **hanya hamburger** sejak awal.
- Tautan yang tersembunyi keluar dari urutan Tab keyboard (`visibility: hidden`).
- Tombol bulat memiliki `aria-label="Buka menu"` dan `aria-expanded`.
- Bentuk akhir tombol (bulat atau lainnya) dan posisi serta bentuk tombol suara **[menunggu design system]**.

### 10.4 Kode inti
```html
<header class="nav" id="nav">
  <a class="logo" href="/"><span class="re">Re:</span><span class="bt">bottle</span></a>
  <nav class="links" id="links" aria-label="Navigasi utama">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/konten">Konten</a>
    <a href="/contact">Contact</a>
  </nav>
  <button class="burger" id="burger" aria-label="Buka menu"
          aria-expanded="false" aria-controls="menu">
    <span></span><span></span>
  </button>
</header>
```
```js
const links  = gsap.utils.toArray("#links a");
const burger = document.getElementById("burger");

const collapse = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });
collapse
  .to(links, {
    x: (i, el) => burger.getBoundingClientRect().left - el.getBoundingClientRect().left,
    opacity: 0,
    duration: 0.55,
    stagger: { each: 0.05, from: "end" }
  })
  .set("#links", { visibility: "hidden" });

let collapsed = false, menuOpen = false;

function updateNav(p) {            // dipanggil dari renderScene(shown)
  if (menuOpen) return;
  if (!collapsed && p > 0.01)  { collapsed = true;  collapse.play(); }
  if (collapsed  && p < 0.003) { collapsed = false; collapse.reverse(); }
}
```

---

## 11. HALAMAN HOME: PANEL MENU

### 11.1 Prinsip
Panel berupa **satu kolom panjang ke bawah**, tidak lebar (±1/4 layar desktop), meluncur dari kanan. Cerita di balik panel tetap terlihat (digelapkan tipis). Ukuran dan gaya huruf **[menunggu design system]**.

### 11.2 Desktop

```
┌──────────────────────────────────────┬────────────────────┐
│                                      │              [ ✕ ] │
│    (cerita tetap terlihat,           │                    │
│     sedikit digelapkan)              │  01 Home           │
│                                      │  02 About          │
│                                      │  03 Konten         │
│                                      │  04 Contact        │
│                                      │                    │
│                                      │  ───────────────   │
│                                      │  Re:bottle         │
│                                      │  Bawa botolmu      │
│                                      │  besok.            │
│                                      │  Kampanye Peduli   │
│                                      │  Lingkungan        │
│                                      │                    │
│                                      │  [email tim]       │
│                                      │  [akun tim]        │
│                                      │  Techno Versary    │
│                                      │  Vol. II           │
└──────────────────────────────────────┴────────────────────┘
          ±75% layar                         ±25% layar
```

| Aspek | Keputusan |
|---|---|
| Lebar | `clamp(320px, 25vw, 520px)` (di 1920 px sekitar 480 px, di 1366 px sekitar 341 px) |
| Tinggi | Penuh layar (`100dvh`), menempel di kanan |
| Warna panel | **Terang** (usulan `#EEF2EF`, tinta `#0B1A33`), dengan **scrim gelap tipis** (`rgba(5,10,25,.45)`) di atas cerita agar panel menonjol di Babak I dan Bab 10 yang terang. Penyesuaian akhir **[menunggu design system]** |
| Isi (dari atas) | Tombol ✕, empat tautan bernomor (nomor kecil di atas-kiri), garis pemisah, blok identitas (nama, tagline, subtema), kontak tim, keterangan lomba |
| Tautan aktif | Diberi penanda (titik atau garis). Saat hover, tautan lain meredup dan panah ↘ muncul pada yang disorot |
| Animasi | Panel meluncur dari kanan (±0,5 detik), tautan muncul bergantian (selisih ±60 ms), scrim memudar masuk |
| Blok identitas | "Re:" mengikuti status logo navbar |

### 11.3 HP

```
┌──┬──────────────────────┐
│  │                [ ✕ ] │
│  │                      │
│  │  01  Home            │
│  │  02  About           │
│  │  03  Konten          │
│  │  04  Contact         │
│  │                      │
│  │  ─────────────────   │
│  │  Re:bottle           │
│  │  Bawa botolmu besok. │
│  │  Kampanye Peduli     │
│  │  Lingkungan          │
│  │                      │
│  │  [email tim]         │
└──┴──────────────────────┘
 ±12%        ±88%
```
- Lebar `min(88vw, 380px)`. **Sekitar 12% sisi kiri** cerita tetap terlihat sebagai penanda bahwa ini laci. Mengetuk area itu menutup panel.
- Area sentuh tiap tautan **minimal 56 px** tingginya.
- Arah dan gaya gerak sama dengan desktop (meluncur dari kanan).
- Opsional: geser ke kanan untuk menutup.

### 11.4 Perilaku

| Situasi | Perilaku |
|---|---|
| Tombol di navbar | Berganti ikon menjadi **✕** pada posisi yang sama |
| Menutup | ✕, tombol **Esc**, atau klik scrim |
| Cerita | Dijeda (`menuOpen = true`), gulir dikunci. Posisi cerita tidak berubah saat panel ditutup |
| Klik **Home** saat sudah di Home | Panel menutup saja, cerita **tidak diulang** |
| Klik halaman lain | Berpindah halaman. Kembali ke Home berarti cerita mulai dari hero |
| Fokus keyboard | Fokus masuk ke tautan pertama, **terkunci di dalam panel**, dan kembali ke tombol saat ditutup. Isi di belakang diberi `inert` |
| Atribut | `role="dialog"`, `aria-modal="true"`, dan `aria-expanded` pada tombol |
| Lapisan (z-index) | Penanda bab 40 · lingkaran loop 50 · scrim 80 · panel 90 · navbar dan tombol 100 · kursor cincin 1000 |
| `prefers-reduced-motion` | Panel langsung muncul tanpa meluncur |

### 11.5 Kode inti
```html
<div class="scrim" id="scrim"></div>
<aside class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu">
  <nav aria-label="Menu utama">
    <ol>
      <li><a href="/"><sup>01</sup>Home</a></li>
      <li><a href="/about"><sup>02</sup>About</a></li>
      <li><a href="/konten"><sup>03</sup>Konten</a></li>
      <li><a href="/contact"><sup>04</sup>Contact</a></li>
    </ol>
  </nav>
  <div class="menu__info">
    <p class="brand"><span class="re">Re:</span><span class="bt">bottle</span></p>
    <p>Bawa botolmu besok.</p><p>Kampanye Peduli Lingkungan</p>
    <p>[email tim]</p><p>[akun tim]</p>
    <small>Techno Versary Vol. II · Web Design Competition</small>
  </div>
</aside>
```
```css
.scrim { position: fixed; inset: 0; z-index: 80; background: rgba(5,10,25,.45);
         opacity: 0; visibility: hidden; transition: opacity .4s, visibility 0s .4s; }
.scrim.is-open { opacity: 1; visibility: visible; transition-delay: 0s; }

.menu { position: fixed; top: 0; right: 0; height: 100dvh; z-index: 90;
        width: clamp(320px, 25vw, 520px);
        padding: 120px 40px 40px;                 /* ruang untuk tombol ✕ di navbar */
        display: flex; flex-direction: column; justify-content: space-between;
        background: var(--menu-bg); color: var(--menu-ink);
        transform: translateX(100%); visibility: hidden;
        transition: transform .5s cubic-bezier(.2,.8,.2,1), visibility 0s .5s; }
.menu.is-open { transform: none; visibility: visible; transition-delay: 0s; }

@media (max-width: 768px) { .menu { width: min(88vw, 380px); padding: 104px 28px 28px; } }
```
```js
function openMenu() {
  menuOpen = true;
  collapseNavLinks();                               // timeline navbar yang sama
  menu.classList.add("is-open"); scrim.classList.add("is-open");
  app.inert = true;                                 // pembungkus konten, bukan navbar atau panel
  burger.setAttribute("aria-expanded", "true");
  lockScroll(); menu.querySelector("a").focus();
}
function closeMenu() {
  menuOpen = false;
  menu.classList.remove("is-open"); scrim.classList.remove("is-open");
  app.inert = false;
  burger.setAttribute("aria-expanded", "false");
  unlockScroll(); burger.focus();
  restoreNavLinksIfAtHero();                        // tautan kembali hanya jika masih di hero
}
scrim.addEventListener("click", closeMenu);
addEventListener("keydown", e => { if (e.key === "Escape" && menuOpen) closeMenu(); });
```

---

## 12. HALAMAN HOME: PENANDA BAB (KIRI LAYAR)

### 12.1 Konsep
Daftar judul bab di **tengah sisi kiri layar** (mengacu pada gaya referensi Hubtown): label bertumpuk vertikal, satu **kotak penanda** di samping bab aktif, label aktif terang dan lainnya redup, ada garis tipis vertikal sebagai jalur. Tidak ada indikator progres lain.

### 12.2 Isi: dipisah per babak

| Posisi cerita | Yang tampil di kiri |
|---|---|
| **Babak I** (Bab 1 sampai 6) | **Hanya 6 judul Babak I:** 01 Lahir · 02 Sekali Pakai · 03 Tersesat · 04 Lautan · 05 Terurai · 06 Kembali ke Kita |
| **Punchline** | **Daftar disembunyikan** (momen hening) |
| **Babak II** (Bab 7 sampai 10) | **Hanya 4 judul Babak II** (penomoran **melanjutkan**): 07 Di Tempat yang Benar · 08 Perjalanan Kedua · 09 Hidup Baru · 10 Surat Terakhir |
| Loop ke Bab 1 | Daftar kembali ke Babak I (instan) |

Pergantian daftar memudar silang (±0,4 detik) tepat di awal Bab 7, bersamaan dengan "Re:" menyala.

### 12.3 Perilaku dan aturan

| Aspek | Keputusan |
|---|---|
| Posisi | `position: fixed`, `top: 50%`, sekitar 40 px dari tepi kiri |
| Aktif | Label terang, kotak 8 px di sampingnya, **suhu** tampil di sebelah label (misalnya `+2,0°C`) |
| Tidak aktif | Opasitas sekitar 35% |
| Gerak | Kotak meluncur halus mengikuti bab aktif |
| Interaksi | **Hanya-baca** (`pointer-events: none`), tidak bisa difokus keyboard, tanpa `aria-live` |
| Muncul sejak | Hero (Bab 1 sudah aktif) |
| Halaman lain | Tidak ada, hanya di Home |
| HP dan tablet (≤1024 px) | Teks disembunyikan, hanya garis tipis dengan titik-titik kecil |
| Lapisan | Di bawah lingkaran loop, scrim, dan panel menu |
| Warna | Tinta berganti per bab (`--ui-ink`) agar kontras tetap terjaga, atau `mix-blend-mode: difference` sebagai cara cepat |
| Gaya huruf, ukuran, jarak antarhuruf, bentuk penanda | **[menunggu design system]** (dikodekan sebagai variabel, bukan angka tetap) |

### 12.4 Kode inti
```html
<aside class="chapters" id="chapters" data-view="1" aria-label="Penanda bab (hanya-baca)">
  <ol data-babak="1">
    <li><span class="no">01</span><span class="label">Lahir</span><small class="temp"></small></li>
    <!-- 02 Sekali Pakai · 03 Tersesat · 04 Lautan · 05 Terurai · 06 Kembali ke Kita -->
    <i class="marker"></i>
  </ol>
  <ol data-babak="2">
    <li><span class="no">07</span><span class="label">Di Tempat yang Benar</span><small class="temp"></small></li>
    <!-- 08 Perjalanan Kedua · 09 Hidup Baru · 10 Surat Terakhir -->
    <i class="marker"></i>
  </ol>
</aside>
```
```css
.chapters {
  position: fixed; left: 40px; top: 50%; transform: translateY(-50%);
  z-index: 40; pointer-events: none; user-select: none;
  display: grid;
  color: var(--ui-ink);
  font-family: var(--font-ui); font-size: var(--ui-size);
  letter-spacing: var(--ui-tracking); text-transform: var(--ui-case);   /* [menunggu design system] */
}
.chapters ol { list-style: none; margin: 0; padding: 0; display: grid; row-gap: 20px;
               grid-area: 1 / 1; align-self: center; position: relative;
               opacity: 0; visibility: hidden; transition: opacity .4s, visibility 0s .4s; }
.chapters ol::before { content: ""; position: absolute; left: -18px; top: -14px; bottom: -14px;
                       width: 1px; background: currentColor; opacity: .2; }
.chapters[data-view="1"] ol[data-babak="1"],
.chapters[data-view="2"] ol[data-babak="2"] { opacity: 1; visibility: visible; transition-delay: 0s; }
.chapters li { display: flex; gap: 12px; align-items: baseline; opacity: .35; transition: opacity .3s; }
.chapters li.is-active { opacity: 1; }
.chapters .temp { margin-left: 8px; opacity: 0; transition: opacity .3s; }
.chapters li.is-active .temp { opacity: .8; }
.marker { position: absolute; left: -22px; top: 0; width: 8px; height: 8px; background: currentColor;
          transform: translateY(var(--y, 0)); transition: transform .45s cubic-bezier(.2,.8,.2,1); }

@media (max-width: 1024px) {
  .chapters { left: 14px; }
  .chapters ol { row-gap: 14px; }
  .chapters li { width: 5px; height: 5px; border-radius: 50%; background: currentColor;
                 font-size: 0; overflow: hidden; }
  .chapters .marker { left: -8px; width: 5px; height: 5px; }
}
```
```js
const aside = document.getElementById("chapters");
const BABAK = [...aside.querySelectorAll("ol")].map(ol => ({ ol, items: [...ol.querySelectorAll("li")] }));

// Batas awal tiap bab (skala 0–1). Nilai pastinya dipastikan belakangan (durasi gulir).
const STARTS = [/* awal Bab 1..10 */];
const PUNCH  = { from: 0, to: 0 };            // from = akhir Bab 6, to = awal Bab 7
const chapterAt = p => STARTS.reduce((k, s, n) => (p >= s ? n : k), 0);

let view = "", cur = -1;
function updateChapters(p, temp) {            // dipanggil dari renderScene(shown)
  const v = p < PUNCH.from ? "1" : p < PUNCH.to ? "none" : "2";
  if (v !== view) { view = v; aside.dataset.view = v; cur = -1; }
  if (v === "none") return;

  const b = BABAK[v === "1" ? 0 : 1];
  const i = chapterAt(p) - (v === "1" ? 0 : 6);
  if (i !== cur) {
    cur = i;
    b.items.forEach((el, n) => el.classList.toggle("is-active", n === i));
    const t = b.items[i];
    b.ol.style.setProperty("--y", `${t.offsetTop + t.offsetHeight / 2 - 4}px`);
  }
  b.items[i].querySelector(".temp").textContent = "+" + temp.toFixed(1).replace(".", ",") + "°C";
}
```

---

## 13. KURSOR CINCIN

### 13.1 Konsep
Kursor khusus berbentuk **cincin**. Saat diam, ia berupa lingkaran biasa. Saat digerakkan, ia **meregang menjadi oval searah gerakan** (mengacu pada `unseen.co/projects/blue-marine-foundation`). Tampil di **Home dan Galeri Artikel**.

| Kondisi | Bentuk |
|---|---|
| Diam | Cincin bulat (±42 px) |
| Digeser ke samping | Oval horizontal |
| Digeser ke atas atau bawah | Oval vertikal |
| Digeser diagonal | Oval miring searah gerakan |
| Semakin cepat | Semakin lonjong, sampai batas maksimum (rasio ±2:1) |
| Berhenti | Kembali bulat **pelan-pelan** (lebih lambat daripada saat memanjang) |
| Di atas tautan atau tombol | Cincin membesar ±1,7× |
| Di kolom isian (halaman Contact) | Cincin hilang, kursor bawaan kembali |
| Mouse keluar jendela | Cincin memudar |

### 13.2 Teknik agar terasa halus dan memuaskan

| Teknik | Efek |
|---|---|
| Cincin **menyusul** mouse (bukan menempel) | Kesan ringan dan sedikit tertinggal |
| Memanjang cepat (0,28), kembali bulat lambat (0,09) | Terasa seperti karet yang meregang lalu mengendur |
| Luas relatif terjaga (`ry = R / (1 + stretch)`) | Cincin "memadat" saat memanjang |
| Rotasi lewat **jalur terpendek** | Oval simetris, jadi tidak berputar jauh saat arah berbalik |
| Arah hanya diperbarui saat benar-benar bergerak | Saat berhenti tidak berputar liar |
| Perhitungan memakai `dt` | Terasa sama di layar 60, 120, maupun 144 Hz |
| Elips **SVG**, bukan `<div>` berborder | Ketebalan garis tetap saat diregangkan |

### 13.3 Aturan
- Hanya di perangkat dengan penunjuk presisi (`@media (pointer: fine)`). **HP dan tablet tidak mendapatkannya.**
- Kursor bawaan disembunyikan hanya jika JavaScript aktif (kelas `has-ring`); jika JS gagal, kursor bawaan tetap ada.
- Tidak menangkap klik (`pointer-events: none`), selalu di atas semua lapisan, memakai `mix-blend-mode: difference` agar terbaca di latar gelap dan terang. Jika terasa berat di perangkat lemah, ganti dengan garis putih polos berbayang tipis.
- `prefers-reduced-motion`: cincin mengikuti mouse tanpa peregangan.
- Nilai `MAX`, `0.28`, `0.09`, dan `24` adalah titik awal dan disetel langsung di prototipe.

### 13.4 Kode
```html
<svg id="cursor" class="cursor" width="120" height="120" viewBox="-60 -60 120 120" aria-hidden="true">
  <ellipse rx="21" ry="21"/>
</svg>
```
```css
.cursor {
  position: fixed; left: 0; top: 0; width: 120px; height: 120px; margin: -60px 0 0 -60px;
  pointer-events: none; z-index: 1000; opacity: 0;
  mix-blend-mode: difference;
  will-change: transform;
}
.cursor ellipse { fill: none; stroke: #fff; stroke-width: 1.5; }
.cursor.is-hidden { visibility: hidden; }

.has-ring, .has-ring a, .has-ring button { cursor: none; }
.has-ring input, .has-ring textarea, .has-ring select { cursor: auto; }
```
```js
(() => {
  if (!matchMedia("(pointer: fine)").matches) return;          // HP dan tablet tidak mendapat kursor ini
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = document.getElementById("cursor");
  const ring = el.querySelector("ellipse");
  const R = 21, MAX = 0.4;                                      // jari-jari diam, batas lonjong (≈ 2:1)
  let mx = innerWidth / 2, my = innerHeight / 2;                // posisi mouse
  let x = mx, y = my, stretch = 0, angle = 0, grow = 1, growS = 1;

  document.documentElement.classList.add("has-ring");
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; el.style.opacity = 1; });
  document.addEventListener("mouseleave", () => (el.style.opacity = 0));
  document.addEventListener("pointerover", e => {
    const t = e.target;
    el.classList.toggle("is-hidden", !!t.closest("input, textarea, select"));
    grow = t.closest("a, button, [data-hover]") ? 1.7 : 1;
  });

  const ease = (k, f) => 1 - Math.pow(1 - k, f);                // lerp yang tidak bergantung frame rate

  gsap.ticker.add((_, dt) => {
    const f = dt / 16.667;                                      // 1 = 60 fps
    const px = x, py = y;
    x += (mx - x) * ease(0.2, f);
    y += (my - y) * ease(0.2, f);

    const vx = x - px, vy = y - py;
    const speed = Math.hypot(vx, vy) / f;                       // piksel per frame (setara 60 fps)

    if (speed > 0.5) {                                          // arah diperbarui hanya saat bergerak
      let d = Math.atan2(vy, vx) - angle;
      d = ((d + Math.PI / 2) % Math.PI + Math.PI) % Math.PI - Math.PI / 2;   // jalur terpendek (oval simetris)
      angle += d * ease(0.3, f);
    }

    const target = calm ? 0 : MAX * Math.min(speed / 24, 1);
    stretch += (target - stretch) * ease(target > stretch ? 0.28 : 0.09, f);
    growS   += (grow - growS) * ease(0.18, f);

    ring.setAttribute("rx", R * growS * (1 + stretch));
    ring.setAttribute("ry", R * growS / (1 + stretch));
    el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
  });
})();
```

---

## 14. ELEMEN VISUAL, AUDIO, DAN TEKNIK

### 14.1 Peta konsep visual

| Konsep visual | Dipakai di mana | Teknik gratis |
|---|---|---|
| **Objek 3D** | Botol utama (berputar, retak, pecah), produk daur ulang, tumbler | Three.js. Botol dibuat **prosedural** (`LatheGeometry`) tanpa file model, atau model GLB gratis berlisensi CC0 |
| **Scrollytelling** | Seluruh Home | GSAP ScrollTrigger + ticker, digerakkan mesin `progress` dan ratchet buatan sendiri |
| **Perubahan warna** | Seluruh website | Palet bab dengan `color-mix` OKLCH (Bagian 7.3) |
| **Efek panas** | Bab 4 sampai 6 | SVG `feTurbulence` + `feDisplacementMap` |
| **Partikel mikroplastik** | Bab 5 sampai 6 | `Points` di Three.js atau Canvas 2D |
| **Tipografi meleleh** | Judul bab 5 dan 6 | Variable font + `letter-spacing` atau `skew` yang naik seiring suhu **[menunggu design system]** |
| **Tekstur retak** | Latar halaman bab 5 dan 6 | Gambar SVG/PNG retakan putih tulang, `opacity` mengikuti suhu |
| **Counter dan data** | Bab 1, 2, 3, 4, 5, 6, 7, 8 | JavaScript, dikendalikan `shown` |
| **Surat bertulisan tangan** | Bab 7 sampai 10 | Teks bergaya tulisan tangan **[menunggu design system]** |

### 14.2 Audio ambient
- Memakai **Web Audio API**.
- Audio **mati secara bawaan** (browser memblokir pemutaran otomatis). Pengunjung menyalakannya lewat **tombol suara**, yang juga berfungsi sebagai **mute**.
- Suara ambient mengikuti `progress` (berubah seiring suhu dan babak). Bunyi pendek saat botol masuk tempat sampah (Bab 7).
- Hanya sumber **bebas lisensi (CC0)**.
- Jenis suara per bab, posisi, dan bentuk tombol suara **dipastikan belakangan** (Bagian 19).

### 14.3 Keterbacaan teks
Teks selalu diletakkan di atas **panel semi-transparan** agar kontras tetap lolos saat latar berubah (termasuk di momen transisi terang-gelap antara Bab 9 dan 10, tempat tinta dibalik menjadi gelap).

---

## 15. HALAMAN ABOUT

Berisi:
1. **Latar isu:** plastik sekali pakai dan kaitannya dengan iklim.
2. **Target 1,5°C:** penjelasan singkat dan kaitannya dengan benang suhu di Home (Babak I melewatinya, Babak II menahannya).
3. **Daftar sumber data:** seluruh sumber angka dan fakta yang dipakai di website.
4. **Atribusi aset:** font, suara, foto, dan ilustrasi yang berlisensi bebas.
5. **Tim:** nama tim dan anggota.
6. **Info yang biasanya di footer** (karena footer Home tidak pernah terlihat).

Hubungan "botol dan suhu" dijelaskan sebagai **perangkat naratif**, disertai fakta nyata yang menghubungkan produksi plastik dengan bahan bakar fosil dan emisi gas rumah kaca, lengkap dengan sumbernya. Logo "Re:" menyala penuh, navbar lengkap dan menempel.

---

## 16. HALAMAN KONTEN ("GALERI ARTIKEL")

### 16.1 Konsep
Halaman ini berisi **hanya kumpulan artikel**, bergaya `unseen.co/projects`. Tautan navbar: **Konten**. Judul (headline) halaman: **Galeri Artikel**. Tidak ada slider, tidak ada zona lain, tidak ada artikel unggulan, dan tidak ada kolom pencarian.

Artikel membahas **dampak negatif** (dari aksi negatif seperti Babak I) dan **dampak positif** (dari aksi positif seperti Babak II). Cakupannya **bukan hanya nasional**, tetapi **ditambah internasional/global**, dan tetap ada artikel untuk **dampak sehari-hari**.

### 16.2 Kerangka: matriks 2 × 3
Setiap artikel punya **dua label** yang sekaligus menjadi **dua kelompok filter**.

| | Sehari-hari | Nasional | Global |
|---|---|---|---|
| **Dampak negatif** (Babak I) | A1, A2 | A3, A4 | A5, A6 |
| **Dampak positif** (Babak II) | B1, B2 | B3, B4 | B5, B6 |

### 16.3 Daftar 12 artikel (judul kerja)

**Dampak negatif**
| Kode | Level | Judul | Isi |
|---|---|---|---|
| A1 | Sehari-hari | *Mikroplastik di Piring Makanmu* | Jalur plastik ke ikan dan garam laut, lalu ke tubuh manusia (nyambung Bab 5-6) |
| A2 | Sehari-hari | *10 Menit Dipakai, 450 Tahun Tinggal* | Botol sekali pakai di rumah tangga dan jajanan, kebiasaan kecil yang menumpuk |
| A3 | Nasional | *Sungai Kita, Jalur Sampah ke Laut* | Sampah sungai Indonesia yang bermuara ke laut (nyambung Bab 3) |
| A4 | Nasional | *Pesisir dan Nelayan yang Menjaring Plastik* | Dampak ke perikanan, wisata pantai, dan mata pencaharian |
| A5 | Global | *Pusaran Sampah Samudra* | Akumulasi sampah di lautan dunia dan hewan laut yang terdampak (nyambung Bab 4) |
| A6 | Global | *Plastik dan Iklim* | Produksi plastik dari bahan bakar fosil dan emisinya |

**Dampak positif**
| Kode | Level | Judul | Isi |
|---|---|---|---|
| B1 | Sehari-hari | *Dari Botol Menjadi Kain* | Hasil daur ulang yang dekat dengan kita: serat pakaian, tas (nyambung adegan koleksi produk di Bab 10) |
| B2 | Sehari-hari | *Seminggu Membawa Botol Sendiri* | Cerita kebiasaan kecil dan hitungan plastik yang terhindar |
| B3 | Nasional | *Bank Sampah dan Pemulung: Rantai yang Jarang Terlihat* | Peran pengumpul dan bank sampah dalam daur ulang di Indonesia |
| B4 | Nasional | *Isi Ulang Mulai Jadi Gaya Hidup* | Stasiun isi ulang, gerakan atau kebijakan lokal, kampus dan kantor bebas botol sekali pakai |
| B5 | Global | *Negara yang Berhasil Mengurangi Plastik* | Contoh kebijakan dan sistem pengembalian botol (deposit) dari negara lain |
| B6 | Global | *Ekonomi Sirkular: Plastik yang Tidak Jadi Sampah* | Reduce, reuse, recycle, dan alasan *reuse* (isi ulang) berada di atas *recycle* |

### 16.4 Anatomi halaman
```
┌────────────────────────────────────────────────────┐
│ [Logo]                              [navbar lengkap]│
│                                                    │
│               Galeri Artikel (judul besar)         │
│   ( Semua 12 | Negatif 6 | Positif 6 ‖             │
│     Sehari-hari 4 | Nasional 4 | Global 4 )        │
│                                                    │
│  ┌──────────────────┐   ┌──────────────────┐      │
│  │   gambar besar   │   │   gambar besar   │      │
│  └──────────────────┘   └──────────────────┘      │
│  Judul artikel      ↘   Judul artikel       ↘      │
│  Negatif · Global       Positif · Sehari-hari      │
│  ──────────────────     ──────────────────         │
│  (grid dua kolom berlanjut)                        │
└────────────────────────────────────────────────────┘
```

### 16.5 Pil filter
- **Satu pil** berisi dua kelompok yang dipisah garis tipis: kelompok **jenis** (Semua, Negatif, Positif) dan kelompok **level** (Sehari-hari, Nasional, Global).
- Dua kelompok **digabung**. Contoh: *Negatif* + *Global* menampilkan A5 dan A6.
- Setiap chip menampilkan **jumlah**, dan angkanya ikut berubah mengikuti pilihan kelompok lain.

```js
const state = { type: "all", level: "all" };

function render() {
  const list = articles.filter(a =>
    (state.type  === "all" || a.type  === state.type) &&
    (state.level === "all" || a.level === state.level));
  gridEl.replaceChildren(...list.map(makeCard));
  updateChipCounts();
}
```

### 16.6 Kartu artikel
Setiap kartu terdiri dari:
- **Gambar besar** (ilustrasi SVG buatan sendiri, atau foto berlisensi bebas)
- **Judul tebal**
- **Subjudul** berisi label ganda dan waktu baca, misalnya *Negatif · Global · 5 menit baca*
- **Panah ↘** di kanan
- **Garis bawah** tipis sebagai pemisah
- **Warna label dan kartu:** negatif memakai **biru malam/baja dengan tinta pucat**, positif memakai **teal-hijau** (nuansa Babak II), sehingga konsisten dengan cerita Home

Grid **dua kolom** di layar lebar dan **satu kolom** di layar kecil.

### 16.7 Efek dan gaya
- **Hover:** gambar bergeser sedikit disertai *RGB split* halus (dua salinan gambar dengan `mix-blend-mode`, atau filter SVG `feDisplacementMap`).
- **Muncul bergantian (*stagger*):** kartu naik dan memudar masuk satu per satu saat halaman dibuka atau filter diganti.
- **Latar:** warna terang lembut dengan **partikel pelan** (misalnya serpihan mikroplastik atau daun melayang). Warna pasti **[menunggu design system]**.
- Animasi memakai `transform` dan `opacity` saja agar performa tetap baik.
- Kursor cincin aktif di halaman ini (membesar di atas kartu).

### 16.8 Halaman detail artikel
Klik kartu membuka halaman (atau panel penuh) berisi:
1. Gambar judul besar, judul, dan label ganda
2. Isi artikel (**400 sampai 600 kata**)
3. **Sumber dan tahun** di bagian bawah
4. Blok **"Artikel berikutnya"** di ujung

### 16.9 Data
Seluruh kartu dan filter dibuat dari satu berkas `articles.ts`:
```js
{ id: "A5", type: "negatif", level: "global", title: "...", minutes: 5,
  cover: "/img/a5.svg", body: "...", sources: ["UNEP, 20xx", "..."] }
```

### 16.10 Aturan isi
- **Angka hanya dari sumber yang sudah diverifikasi sendiri**, dengan nama sumber dan tahun di bawah artikel.
- Sumber yang layak dicari: KLHK (SIPSN), Bank Dunia, UNEP, OECD (*Global Plastics Outlook*), Ellen MacArthur Foundation, IPCC, dan publikasi ilmiah tentang sampah plastik laut.
- Nama kebijakan, program, atau negara pada B4 dan B5 **dicek ulang ke sumber resmi** sebelum ditulis.
- Satu **ilustrasi SVG buatan sendiri** per artikel.
- Foto (bila dipakai) hanya dari sumber berlisensi bebas (Unsplash, Pexels, Wikimedia Commons) dengan atribusi di halaman About.
- "Re:" menyala penuh, navbar lengkap dan menempel.

---

## 17. HALAMAN CONTACT

- **Form kontak yang benar-benar berfungsi:** kolom **nama, email, dan pesan**, dikirim lewat **Formspree (free tier)**.
- **Kalimat penutup kampanye:** **"Bawa botolmu besok."**
- Memuat **email tim** dan **akun tim** (saat ini placeholder `[email tim]` dan `[akun tim]`) serta info yang biasanya berada di footer (Bagian 5).
- Kursor bawaan kembali di kolom isian (Bagian 13).
- "Re:" menyala penuh, navbar lengkap dan menempel.

---

## 18. SISTEM VISUAL GLOBAL (PALET DAN ISYARAT)

### 18.1 Prinsip warna
- **Babak I hanya shade biru.** Biru bergerak dari **jernih ke keruh dan gelap**: kecerahan turun (sekitar 27% ke 9%) dan kejenuhan turun (sekitar 84% ke 58%), dengan hue yang nyaris sama (sekitar 213° sampai 224°). **Tanpa merah dan oranye.**
- **Babak II memakai palet teal, hijau, dan sage.**
- Nilai hex di bawah adalah **usulan awal yang disetel saat prototipe**. Kontras tinta diverifikasi dengan alat kontras sebelum final.

### 18.2 Palet lengkap

| Bagian | Suhu | Latar | Aksen | Tinta | Suasana |
|---|---|---|---|---|---|
| Bab 1 Lahir | +1,2 | `#0B2B80` | `#8FD3FF` | `#F3F8FF` | Biru kobalt jernih, botol bening, butiran halus |
| Bab 2 Sekali Pakai | +1,5 | `#12336F` | `#9CC6EA` | `#F3F8FF` | Biru mulai kusam, *noise* tipis |
| Bab 3 Tersesat | +2,0 | `#183558` | `#8FB0CC` | `#F3F8FF` | Biru baja berkabut, botol mulai keruh |
| Bab 4 Lautan | +2,7 | `#142848` | `#86A8D0` | `#F3F8FF` | Biru tua pekat, *heat shimmer*, karang memutih |
| Bab 5 Terurai | +3,3 | `#101C38` | `#8098C2` | `#F3F8FF` | Biru nyaris malam, botol retak putih tulang, partikel |
| Bab 6 Kembali ke Kita | +4,0 | `#0A1226` | `#8A96C8` | `#F3F8FF` | Biru kehitaman, retakan putih tulang menyala |
| Punchline | +4,0 → +1,5 | `#05080F` → `#08131F` | `#C9D3E6` | `#EDEDED` | Hampir hitam kebiruan, perlahan terbit ke biru-teal |
| Bab 7 Di Tempat yang Benar | +1,5 | `#1F4F5E` | `#9FE6D0` | `#F1FAF7` | Teal sejuk, sungai jernih |
| Bab 8 Perjalanan Kedua | +1,5 | `#226B63` | `#B9F3C9` | `#F1FAF7` | Teal-hijau, pusat pemilahan bersih |
| Bab 9 Hidup Baru | +1,5 | `#2E7D5B` | `#F6B35A` (hanya kilau tungku lokal) | `#F4FBF6` | Hijau, kilau hangat dari proses lebur |
| Bab 10 Surat Terakhir | +1,5 | `#D9E6D6` | `#0F8B8D` (tumbler) | `#11261B` | Sage terang netral, tumbler tersorot |

Catatan:
- **Putih tulang** `#E6EAF2` dipakai untuk retakan, karang, dan mikroplastik di Babak I.
- Kilau amber `#F6B35A` di Bab 9 adalah **satu-satunya warna hangat** di seluruh website (melambangkan "butuh energi"). Warna ini dipertahankan.
- Warna `#0B2B80` adalah latar hero **dan** warna lingkaran loop.

### 18.3 Transisi warna

| Transisi | Perilaku |
|---|---|
| Bab 1 sampai 6 | Aturan dataran (70% warna murni, 30% bergeser). Transisi biru ke biru sangat halus |
| Bab 6 ke punchline | Memadam menuju hampir hitam kebiruan |
| Punchline | Dasar gelap bergeser pelan ke biru-teal selaras dengan suhu yang turun dan retakan yang memudar |
| Punchline ke Bab 7 | Dari biru gelap ke teal. Di titik ini "Re:" menyala bersamaan dengan datangnya palet sejuk |
| Bab 7 ke 9 | Teal makin hijau dan makin terang, tanpa nuansa panas selain kilau tungku |
| Bab 9 ke 10 | Hijau tua ke sage terang, tinta dibalik menjadi gelap ("fajar") |
| Bab 10 ke loop | Lingkaran biru hero menutup sage netral |

### 18.4 Isyarat pengganti rasa "panas" (karena warna panas tidak dipakai)

| Isyarat | Dari bab |
|---|---|
| Butiran (*grain*) makin kasar | 2 |
| Botol makin keruh dan memutih | 3 |
| *Heat shimmer* (distorsi udara) | 4 sampai 6 |
| Tepi layar menggelap (*vignette*) | 4 sampai 6 |
| Retakan putih tulang | 5 sampai 6 |
| Huruf judul "meleleh" | 5 sampai 6 |
| Partikel mikroplastik bertambah | 5 sampai 6 |
| Angka suhu di penanda bab | semua bab |

### 18.5 Pola gaya yang dipakai
- Tipografi besar dan tegas untuk judul.
- Tombol bulat (menu dan suara).
- Tekstur butiran halus di latar.
- Latar gelap pada Babak I menjaga teks putih tetap terbaca.
- Semua tipografi, ukuran, dan gaya huruf **[menunggu design system]**.

---

## 19. HAL YANG DIPASTIKAN BELAKANGAN

Hal-hal berikut **belum diputuskan** dan akan dipastikan pada tahap berikutnya.

| Hal | Keterangan |
|---|---|
| **Design system** | Font (judul, teks isi, tulisan tangan surat, variable font untuk efek "meleleh"), ukuran, jarak antarhuruf, huruf kapital atau tidak, bentuk penanda bab, bentuk tombol menu dan suara, gaya "Re:" pudar dan menyala, warna final panel menu dan latar Galeri Artikel |
| **Durasi gulir tiap bab** | Panjang gulir per bab, jeda baca, punchline, dan 10d-10e. Dibutuhkan untuk mengisi `STARTS` dan `PUNCH` |
| **Naskah lengkap** | Teks narasi tiap bab, empat surat Babak II, teks punchline, dan teks data |
| **Wireframe** | Tata letak judul bab, teks, dan posisi botol terhadap judul di hero dan tiap bab |
| **Isi 12 artikel** | Tulisan, sumber, dan ilustrasi SVG |
| **Audio ambient** | Jenis suara per bab dan sumber berlisensi bebas |
| **Email dan akun tim** | Untuk panel menu dan halaman Contact (masih placeholder) |
| **Penyetelan akhir** | Nilai hex palet, parameter kursor, dan parameter gestur loop disetel di prototipe |

---

## 20. TEKNOLOGI DAN ATURAN ASET

**Stack final (disepakati):** **Vite + React + TypeScript**, React Router, GSAP (ScrollTrigger dan ticker), Three.js murni, Web Audio API, serta CSS Modules dan CSS variable. Semuanya gratis, open-source, dan sah dipakai sesuai aturan lomba (framework/library diperbolehkan pada ketentuan no. 4).

| Kebutuhan | Pilihan |
|---|---|
| Build tool | Vite |
| Framework dan bahasa | React 18+ dan TypeScript |
| Routing | React Router dengan `HashRouter` (aman di hosting statis tanpa konfigurasi tambahan). Rute: `/` (Home), `/about`, `/konten`, `/konten/:slug`, `/contact` |
| Gaya | CSS Modules, CSS variable, dan CSS biasa. **Tanpa Tailwind**, karena konsep banyak memakai `@property`, `color-mix` OKLCH, filter SVG, selector atribut (`[data-re]`, `[data-view]`), dan `@media (pointer: fine)`. Secara performa, Tailwind dan CSS biasa nyaris setara |
| Animasi gulir | GSAP + ScrollTrigger dan `gsap.ticker` |
| Gulir halus | **Lenis tidak dipakai secara bawaan.** Mesin ratchet sudah mengendalikan gulir sendiri, sehingga Lenis berisiko bentrok. Dipasang hanya jika nanti terbukti diperlukan |
| Objek 3D | Three.js murni (tanpa React Three Fiber), dibungkus satu komponen dan dimuat dengan `React.lazy()`. Bentuk prosedural; atau GLB gratis berlisensi CC0 |
| Audio | Web Audio API (mati secara bawaan) |
| Data artikel | `articles.ts` (12 artikel) |
| Form Contact | Formspree (free tier) |
| Ilustrasi | SVG buatan sendiri |
| Gambar | WebP / SVG, *lazy-load* |
| Warna | `color-mix` di ruang OKLCH |
| Hosting | Tanpa deploy otomatis (tanpa GitHub Actions; hosting opsional menurut guidebook, ketentuan no. 9) |

**Prinsip arsitektur:**
- **Mesin cerita berjalan di luar React.** `progress`/`shown`, ratchet, dan loop dijalankan di `gsap.ticker` dan menulis langsung ke DOM, CSS variable, serta Three.js. React hanya menjadi cangkang halaman dan komponen, sehingga **tidak ada re-render per frame**.
- **Layout induk tidak pernah dibongkar saat pindah halaman.** Navbar, panel menu, kursor cincin, dan audio berada di layout induk, sehingga tetap hidup antar halaman.
- **Potongan kode di dokumen ini adalah logika acuan.** Isinya (`updateRe`, ratchet, `commitLoop`, navbar, menu, penanda bab, kursor) dipindahkan ke dalam komponen React dan hook (`useEffect` untuk pendaftaran ticker dan listener, dengan pembersihan saat dilepas). Perilaku dan nilainya tidak berubah.
- **Tautan antar halaman** memakai komponen `<Link>` React Router. Atribut `href` pada potongan HTML di dokumen ini hanya menunjukkan tujuan rute.

**Pengumpulan:** repo GitHub berformat `webdesign_namaTim_technoversary_vol.II`, berisi folder proyek lengkap, `package-lock.json`, dan README (judul, deskripsi, petunjuk instalasi: `npm install` lalu `npm run dev`, serta nama tim dan anggota).

**Aturan aset:**
- Tidak boleh memakai komponen berbayar, template, atau tema premium.
- Font, suara, foto, dan model 3D harus **bebas lisensi** dan dicantumkan di About.
- Three.js hanya dimuat di Home (code-splitting lewat `React.lazy()`).

---

## 21. CAKUPAN PENGERJAAN DAN FITUR YANG DIBATALKAN

### 21.1 Cakupan (semuanya harus terwujud)

| Kelompok | Komponen |
|---|---|
| **Inti** | Mesin `progress`, 10 bab dan punchline, perubahan warna dan data via CSS variables, 4 halaman, form Contact, README |
| **Plus** | Botol 3D prosedural (Three.js), efek *heat shimmer* |
| **Wow** | Partikel mikroplastik 3D, audio ambient |
| **Tambahan** | Punchline dan Babak II, adegan kamera Bab 10, loop tak berujung (gestur "tarik penuh"), penjaga alur (ratchet), logo "Re:" pudar dan menyala, navbar yang mengempis, panel menu, penanda bab per babak, kursor cincin, Galeri Artikel (12 artikel, pil filter, halaman detail) |

Urutan kerja mengikuti **ketergantungan teknis**: mesin `progress` dahulu (karena semua bergantung padanya), lalu adegan 3D, efek visual, Babak II dan loop, lalu audio.

### 21.2 Fitur yang dibatalkan (tidak dipakai di mana pun)

| Fitur | Status |
|---|---|
| Kalkulator "Botolmu" | **Dibatalkan** |
| Slider suhu manual | **Dibatalkan** |
| Kartu hasil unduhan | **Dibatalkan** |
| Konsep "siklus" (penghitung dan teks "Siklus ke-2") | **Dihapus** |
| Loop mundur | **Tidak ada** |
| Tombol "Lewati ke Bab X" | **Dihapus** |
| Indikator progres terpisah | **Tidak ada** (hanya daftar bab di kiri) |
| Warna merah dan oranye di Babak I | **Tidak dipakai** |
| Teks penanda bab di tengah navbar | **Tidak dipakai** (diganti daftar di kiri) |

---

## 22. AKSESIBILITAS, PERFORMA, DAN RESPONSIF

| Risiko | Penanganan |
|---|---|
| Three.js berat di HP | Botol *low-poly* prosedural, batasi partikel (misalnya 800 di mobile), `devicePixelRatio` maksimal 2 |
| Skor performa turun | Three.js hanya di Home lewat code-splitting per rute, *lazy-load* aset, animasi hanya `transform` dan `opacity`, render dihentikan saat tab tersembunyi, font di-subset dengan `font-display: swap`, uji dengan Lighthouse dan cantumkan hasilnya di README |
| UX membingungkan | Navbar standar tetap ada, petunjuk gulir di hero dan akhir Bab 10, penanda bab di kiri |
| Kontras teks buruk saat transisi | Teks di atas panel semi-transparan, tinta dibalik di titik tengah transisi Bab 9 ke 10 |
| Pengunjung dengan gangguan gerak | Hormati `prefers-reduced-motion` (panel statis berurutan tanpa 3D, panel menu tanpa meluncur, kursor tanpa peregangan) |
| Terlalu gelap secara emosional | Punchline dan Babak II wajib ada |
| Navigasi keyboard | Tautan tersembunyi keluar dari urutan Tab, tombol berlabel aksesibel, fokus terkunci di panel menu |
| Perangkat sentuh | Kursor cincin tidak aktif, gestur loop memakai `touchmove`, penanda bab menjadi titik |

Seluruh halaman **responsif** (unit relatif, flexbox atau grid, grid artikel satu kolom di layar kecil) dan diuji di layar HP.

---

## 23. AKURASI KONTEN

1. **Angka hanya dari sumber terverifikasi**, dengan nama sumber dan tahun. Termasuk angka di Bab 6 (nilai X mikroplastik per minggu), Bab 8 (persentase botol terkumpul), counter "450 tahun" di Bab 3, dan seluruh artikel.
2. **Label skenario** pada Babak I (Bagian 3.5).
3. **Kejujuran proses daur ulang:** tidak semua botol PET menjadi botol lagi. Bab 9 menyatakan bahwa prosesnya butuh energi dan air, dan Bab 10 membedakan produk daur ulang dari tumbler.
4. **Sumber dicatat di halaman About** dan di bawah tiap artikel.
5. **Tidak ada klaim sebab-akibat langsung** antara satu botol dan suhu bumi.
6. **Suhu Babak II tetap +1,5°C** agar tidak terbaca sebagai "daur ulang mendinginkan bumi".

---

## 24. PEMETAAN KE KRITERIA PENILAIAN

### 24.1 Babak penyisihan (online)

| Aspek (bobot) | Bagaimana konsep ini menjawab |
|---|---|
| **Kesesuaian tema lingkungan (30%)** | Seluruh cerita, data, dan artikel berfokus pada plastik, iklim, dan kebiasaan botol. Kampanye isi ulang dengan struktur masalah, titik balik, solusi, dan ajakan |
| **Desain visual dan estetika (20%)** | Objek 3D, palet biru yang bergerak dari jernih ke gelap lalu teal-sage, tipografi meleleh, tekstur, kursor cincin, "Re:" yang menyala |
| **Testing dan performa (15%)** | Botol prosedural ringan, aset WebP/SVG, *lazy-load*, batas partikel di HP, uji Lighthouse |
| **User Experience (25%)** | Satu alur linear yang jelas, penanda bab di kiri, navbar yang mengempis dan mudah dipahami, gestur loop yang tidak terpicu secara tidak sengaja, panel menu ringkas, Galeri Artikel yang mudah dijelajahi |
| **Fungsionalitas (10%)** | Scrollytelling 3D, ratchet, gestur loop, navbar dan panel menu, filter artikel dua kelompok, halaman detail, form Contact, toggle audio |

> Karena tidak ada lagi fitur bergaya "alat", fungsionalitas bertumpu pada fitur interaktif di atas. Pastikan **form Contact benar-benar terkirim**, **filter artikel bekerja mulus**, dan **gestur loop terasa mantap**.

### 24.2 Babak final (offline)

| Aspek (bobot) | Bahan dari konsep ini |
|---|---|
| **Penyampaian konsep dan presentasi (30%)** | Alur dua babak dengan punchline, prinsip "perbaikan di ujung vs mencegah", pesan kampanye, makna "Re:" |
| **Demo website dan fungsionalitas (25%)** | Demo dari hero sampai Bab 10, gestur loop, navbar, panel menu, Galeri Artikel dengan filter dan detail, form Contact |
| **Desain visual dan UX (20%)** | Sama dengan penyisihan |
| **Inovasi dan kreativitas (15%)** | UI yang ikut memburuk lewat suhu, botol sebagai narator, "Re:" yang menyala di Babak II, loop gestur "tarik penuh", adegan kamera penutup |
| **Kemampuan menjawab pertanyaan juri (10%)** | Sumber data tercatat, kejujuran ilmiah (label skenario, catatan daur ulang) |

**Format final:** 20 menit presentasi + 15 menit tanya jawab (konsep, desain, fitur, teknologi, serta kendala dan solusi).

---

## 25. KETENTUAN PENGUMPULAN

Karya dikumpulkan dalam bentuk **repository GitHub** berisi:
1. **Folder project lengkap** dengan format nama `webdesign_namaTim_technoversary_vol.II`
2. **File `README.md`** yang memuat: judul website (**Re:bottle**), deskripsi website, petunjuk instalasi, dan cara menjalankan project
3. **Nama tim dan anggota**

Hosting bersifat **opsional**. Penilaian babak penyisihan dibaca dari isi repository, jadi kerapian kode, struktur folder, dan README ikut berpengaruh. Subtema **Kampanye Peduli Lingkungan** dicantumkan di README, halaman About, dan slide pembuka presentasi final.

---

*Akhir dokumen.*
