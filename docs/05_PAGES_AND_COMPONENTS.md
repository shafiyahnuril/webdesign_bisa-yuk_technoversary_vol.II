# 05 · HALAMAN LAIN DAN DAFTAR KOMPONEN

> Isi minimal tiap halaman (About, Konten/Galeri Artikel, Contact), filter 2×3, 12 artikel, form Formspree, kursor cincin di Galeri = **[DISEPAKATI]** (konsep bagian 15–17).
> Tata letak rinci, tema warna per halaman, aturan detail artikel, status form, halaman 404, dan daftar komponen = **[USULAN]**.

---

## 1. Peta rute dan kerangka aplikasi [USULAN D21]

| Rute (`HashRouter`) | Halaman | Komponen halaman | Tema |
|---|---|---|---|
| `#/` | Home | `HomePage` (lazy, memuat Three.js) | Tema cerita (dinamis) |
| `#/about` | About | `AboutPage` | **Teal dalam** |
| `#/konten` | Galeri Artikel | `ContentPage` | **Sage terang** |
| `#/konten/:slug` | Detail artikel | `ArticlePage` | **Kertas terang** + pita warna jenis |
| `#/contact` | Contact | `ContactPage` | **Hijau-teal gelap** |
| `*` | 404 | `NotFoundPage` | Biru hero |

Slug artikel: `mikroplastik-di-piring-makanmu` (A1) dan seterusnya (huruf kecil, tanpa aksen, dipisah `-`; didefinisikan di `articles.ts`).

**`AppShell`** (tidak pernah di-unmount): `SkipLink`, `Navbar`, `MenuPanel` + `Scrim`, `CursorRing` (hanya rute yang mengaktifkan), `AudioToggle`, `RouteAnnouncer`, `<main id="main">` berisi rute aktif, `RouteTransition`.

### 1.1 Tema per halaman (variabel yang di-set pada `<html data-page>`)

| Halaman | `--page-bg` | `--page-ink` | `--page-accent` | `--ui-ink` (navbar) | Navbar |
|---|---|---|---|---|---|
| About | `#1F4F5E` | `#F1FAF7` | `#9FE6D0` | `#F1FAF7` | Lengkap, menempel |
| Galeri Artikel | `#E8EFE5` | `#11261B` | `#0F8B8D` | `#11261B` | Lengkap, menempel |
| Detail artikel | `#F4F8F2` | `#11261B` | `#0F8B8D` | `#11261B` | Lengkap, menempel |
| Contact | `#14403F` | `#F1FAF7` | `#B9F3C9` | `#F1FAF7` | Lengkap, menempel |
| 404 | `#0B2B80` | `#F3F8FF` | `#8FD3FF` | `#F3F8FF` | Lengkap |

Kontras teks ink/bg semua **≥ 4,5:1** (verifikasi dengan alat saat implementasi). "Re:" menyala penuh di semua halaman ini. Navbar menempel: latar transparan di atas, berubah menjadi `color-mix(in oklch, var(--page-bg) 82%, transparent)` setelah gulir > 8px (tanpa blur).

---

## 2. Home (komposisi komponen)

```
HomePage
├─ StoryStage (fixed)
│   ├─ HeroTitle            (z10, hanya Bab 1; "Re:bottle")
│   ├─ StageCanvas          (z20; Three.js, lazy)
│   ├─ ChapterTexts         (z30; 11 blok: ChapterText ×10 + PunchText)
│   │    ├─ SplitHeadline   (pecah huruf, --melt)
│   │    ├─ CopyPanel       (panel semi-transparan, isi 1–3 kalimat)
│   │    ├─ DataCounter     (Mono, naik mengikuti shown)
│   │    ├─ LetterCard      (Babak II: surat tulisan tangan)
│   │    └─ CTAClosing      ("Bawa botolmu besok." di Bab 10e)
│   ├─ ChapterMarker        (z40; 2 <ol>)
│   ├─ ScenarioLabel + ScrollHint
│   ├─ LoopDome             (z50)
│   ├─ Overlays             (z60; grain + vignette + crack background)
│   └─ FlashWindow          (bingkai DOM kilas Bab 7c)
├─ Scroller (div setinggi (TOTAL_VH + 100) dvh)
└─ StaticStory (diganti bila reduced-motion / tanpa WebGL)
```

Komponen ini hanya **cangkang**. Perilaku ada di `StoryEngine` (lihat 04 dan 06). Tidak ada state React yang berubah per frame; React hanya tahu `chapterIndex` dan `view` (lewat `useSyncExternalStore`, diperbarui hanya saat bab berganti).

---

## 3. HALAMAN ABOUT

**Tujuan:** kredibilitas dan kedalaman tema; semua informasi "footer" yang tidak pernah terlihat di Home. Tidak ada animasi berat.

### 3.1 Struktur (urutan bagian)

| # | Bagian | Isi | Komponen | Tata letak |
|---|---|---|---|---|
| 1 | **Hero About** | H1 *"Kenapa Re:bottle?"* + lede 2 kalimat. Subtema **Kampanye Peduli Lingkungan** sebagai label kecil | `PageHero` | Teks kiri (kolom 1–7), huruf besar |
| 2 | **Latar isu** | Plastik sekali pakai dan iklim: produksi dari bahan bakar fosil, siklus hidup, mikroplastik. 3 paragraf pendek + 3 fakta bersumber | `FactBlock` ×3 (angka besar Mono + keterangan + sumber kecil) | 2 kolom (teks | fakta) |
| 3 | **Target 1,5°C** | Penjelasan singkat target 1,5°C dan kaitan dengan benang suhu di Home: *Babak I melewatinya, Babak II menahannya*. **Perangkat naratif, bukan sebab-akibat** | `TempDiagram` (SVG statis) + paragraf | Diagram lebar penuh |
| 4 | **Daftar sumber data** | Seluruh sumber angka dan fakta yang dipakai di website, dikelompokkan per bab/artikel | `SourceList` (dari `facts.ts` dan `articles.ts`) | Daftar bernomor, tautan ↗ |
| 5 | **Atribusi aset dan lisensi** | Font (4, OFL), suara (sintetis, buatan sendiri), ilustrasi (SVG buatan tim; **keterangan penggunaan alat AI bila dipakai**), library (MIT dst.) | `LicenseTable` | Tabel |
| 6 | **Tim** | Nama tim dan anggota | `TeamGrid` (kartu: nama, peran, tautan opsional) | 2–3 kolom |
| 7 | **Penutup** | Info kontak singkat + tautan ke Contact + **"Bawa botolmu besok."** | `ClosingStrip` | Strip lebar |

> Urutan tampil mengikuti nomor 1–7 dan sesuai daftar isi About di konsep: latar isu → target 1,5°C → sumber → atribusi → tim → info footer.

### 3.2 `TempDiagram` (SVG statis, spesifikasi)
- Sumbu horizontal 0 – 4,5°C (kenaikan di atas pra-industri). Garis vertikal bertanda **1,5°C** (aksen `#9FE6D0`), 2,0°C, 4,0°C.
- Dua pita: **"Babak I: skenario abai"** (dari +1,2 ke +4,0, pita biru kusam) dan **"Babak II: skenario peduli"** (tetap +1,5, pita teal).
- Label jujur: *"Ilustrasi alur cerita, bukan prediksi."*
- Animasi: pita "terisi" dari kiri saat masuk viewport (`transform: scaleX`, 0,9 detik), tanpa pustaka.
- Alt text ringkas dan `<title>` SVG; tabel ringkasan tersembunyi untuk pembaca layar.

### 3.3 `FactBlock`
`{ value: string; label: string; source: { id: string } }`. Nilai tidak ditulis di komponen. Diambil dari `facts.ts` hanya yang `verified: true` (lihat 06 dan 11).

### 3.4 Perilaku dan responsif
- Setiap bagian: `reveal` saat masuk viewport (`opacity` + `translateY 24px`, 0,7 detik, sekali). `prefers-reduced-motion`: tanpa animasi.
- HP: satu kolom; `FactBlock` bertumpuk; tabel lisensi menjadi kartu.
- Tautan sumber membuka tab baru (`rel="noopener noreferrer"`).

---

## 4. HALAMAN KONTEN · "GALERI ARTIKEL" [DISEPAKATI struktur]

**Hanya kumpulan artikel.** Tidak ada slider, zona lain, artikel unggulan, atau pencarian.

### 4.1 Anatomi

```
┌ Navbar lengkap (menempel) ───────────────────────────────┐
│                                                          │
│   Galeri Artikel                       (H1, --t-chapter) │
│   Dampak dari tindakan kita, dari rumah sampai dunia.    │
│                                                          │
│   ( Semua 12 | Negatif 6 | Positif 6 ‖                   │
│     Sehari-hari 4 | Nasional 4 | Global 4 )   ← pil      │
│                                                          │
│   [kartu]   [kartu]        ← grid 2 kolom                │
│   [kartu]   [kartu]                                      │
│   ...                                                    │
│   (latar: partikel pelan)                                │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Data dan urutan
- Sumber tunggal: `src/content/articles.ts` (12 entri: A1–A6, B1–B6). Judul kerja dan isi: lihat konsep bagian 16.3 dan `11_COPY_DECK.md`.
- **Urutan default** (selang-seling negatif/positif, dari dekat ke jauh):
  `A1, B1, A2, B2, A3, B3, A4, B4, A5, B5, A6, B6` [USULAN].
- Tipe: `type: "negatif" | "positif"`, `level: "sehari-hari" | "nasional" | "global"`.

### 4.3 Filter (pil 2 kelompok) [DISEPAKATI]
```ts
const [type, setType]   = useState<"all" | "negatif" | "positif">("all");
const [level, setLevel] = useState<"all" | "sehari-hari" | "nasional" | "global">("all");

const visible = articles.filter(a => (type === "all" || a.type === type) && (level === "all" || a.level === level));
const count = {
  type:  (t) => articles.filter(a => (t === "all" || a.type === t) && (level === "all" || a.level === level)).length,
  level: (l) => articles.filter(a => (l === "all" || a.level === l) && (type === "all" || a.type === type)).length,
};
```
- Angka pada chip **ikut berubah** mengikuti pilihan kelompok lain (contoh: *Negatif* + *Global* → `Semua 2 · Negatif 2 · Positif 0` pada kelompok jenis, `Global 2` pada level).
- Memilih chip yang sedang aktif **tidak** membatalkan (kembali ke "Semua" harus lewat chip Semua). Setiap kelompok selalu punya satu pilihan aktif.
- Kombinasi kosong tidak mungkin (setiap sel matriks punya 2 artikel), tetapi tetap disediakan keadaan kosong: *"Belum ada artikel untuk kombinasi ini."* + tombol "Atur ulang filter".
- Status filter **tersimpan di URL** (`#/konten?jenis=negatif&level=global`) agar kembali dari detail artikel mempertahankan filter. Nilai tidak valid diabaikan.
- Perubahan filter: kartu yang tidak lagi cocok memudar keluar (0,2 detik), sisanya *stagger* masuk (0,7 detik, 60 ms antar kartu). Tinggi grid dianimasikan hanya dengan `transform` (tanpa layout shift besar).
- Pengumuman pembaca layar: region `aria-live="polite"`: *"Menampilkan 2 artikel: Negatif, Global."*

### 4.4 Kartu artikel (`ArticleCard`) [DISEPAKATI]
Elemen: gambar besar (ilustrasi SVG `art-A1.svg` dst.), judul tebal, subjudul (`Negatif · Global · 5 menit baca`), panah ↘, garis bawah. Warna: negatif biru malam/baja dengan tinta pucat; positif teal-hijau. Rincian visual: `02_DESIGN_SYSTEM.md` bagian 6.8.

| Aspek | Aturan |
|---|---|
| Elemen | `<article>` berisi satu `<a>` pembungkus (area klik penuh) ke `#/konten/:slug` |
| Hover (desktop) | Gambar bergeser +6px + RGB-split halus (dua salinan `mix-blend-mode: screen`, offset ±3px, 0,3 detik); panah bergeser; kursor cincin membesar 1,7× + label "Baca" |
| Fokus keyboard | Cincin fokus 2px di sekeliling kartu; efek hover yang sama |
| Sentuh | Tanpa hover; tekan menampilkan `:active` (skala 0,98) |
| Gambar | `<img width height loading="lazy" decoding="async">` + `alt` deskriptif; kartu 1–2 teratas `loading="eager"` |
| Efek RGB-split | Hanya `pointer: fine` dan bukan reduced-motion |
| Performa | Hanya `transform`/`opacity`. Tidak ada `filter` di atas elemen besar |

### 4.5 Latar partikel (`ParticleField`) [USULAN]
- `<canvas>` 2D fixed di belakang konten (z0): **40** (desktop) / **16** (HP) serpihan kecil (kapsul/segi enam 3–7 px) bergerak pelan (kecepatan 6–14 px/detik), warna `rgba(15,139,141,.18)` dan `rgba(17,38,27,.10)`. **Tidak ada warna hangat.**
- Dijeda saat tab tersembunyi dan saat tidak terlihat (IntersectionObserver). `prefers-reduced-motion`: gambar statis satu kali.
- Interaksi kursor: serpihan menjauh halus dari kursor (radius 120 px) di desktop. Dimatikan di HP.

### 4.6 Kursor cincin di Galeri [DISEPAKATI]
Aktif di rute `#/konten` (daftar). Di halaman detail artikel: kursor bawaan.

---

## 5. DETAIL ARTIKEL (`#/konten/:slug`) [DISEPAKATI isi, USULAN tata letak]

### 5.1 Tata letak
```
┌ Navbar ─────────────────────────────────────────────┐
│ ← Galeri Artikel                                    │
│ ┌ pita warna jenis (negatif / positif) ───────────┐ │
│ │ [Label ganda] · 5 menit baca                    │ │
│ │ Judul artikel (H1, --t-h2 besar)                │ │
│ │ [ gambar judul besar, rasio 16:9 ]              │ │
│ └─────────────────────────────────────────────────┘ │
│  Lede (1 paragraf, --t-body-lg)                     │
│  Isi (400–600 kata, maks. 62ch, 2–3 subjudul H2)    │
│  ▸ Kaitannya dengan Re:bottle (kotak penutup)       │
│  ── Sumber ───────────────────────────────────────  │
│  1. Penerbit. Judul. Tahun. ↗                       │
│  ── Artikel berikutnya ───────────────────────────  │
│  [ ArticleCard kecil ]                              │
└─────────────────────────────────────────────────────┘
```

### 5.2 Aturan
- **Panjang isi 400–600 kata.** Wajib ada **Sumber dan tahun** dan blok **"Artikel berikutnya"** [DISEPAKATI].
- "Artikel berikutnya" = artikel berikutnya dalam urutan default (A6 → B1? Gunakan `(index + 1) % 12`).
- Tautan "← Galeri Artikel" mempertahankan filter yang terakhir dipakai.
- Kotak **"Kaitannya dengan Re:bottle"** (2 kalimat) menghubungkan artikel ke bab cerita terkait (misalnya A1 ke Bab 5–6) dan ke ajakan **"Bawa botolmu besok."** Tidak menyalahkan pembaca.
- Judul tab: `{Judul} | Re:bottle`. Meta description dari lede (≤ 155 karakter).
- Gambar judul: SVG artikel yang sama dengan kartu (satu aset, dipakai ulang).
- Sumber: format `Penerbit/Penulis. "Judul." Tahun. URL` dengan tautan ↗. Diakses: `[tanggal]` dicatat di data (bukan ditampilkan bila tidak perlu).
- Tipografi: mengikuti `--t-body` dengan jarak paragraf 1,1em dan `max-width: 62ch`.
- Animasi: hanya fade-in judul dan gambar (0,6 detik). Tidak ada kursor cincin, tidak ada partikel.

### 5.3 Templat struktur isi (untuk penulis, lihat 11)
1. **Lede** (± 40 kata) menjawab "apa temuan utama".
2. **H2 pertama:** konteks/masalah atau peluang (± 150 kata).
3. **H2 kedua:** bukti dengan angka bersumber (± 150 kata, 1–2 angka maks.).
4. **H2 ketiga (opsional):** contoh nyata/lokal (± 100 kata).
5. **Kaitannya dengan Re:bottle** (± 50 kata).
6. **Sumber** (3–5 sumber).

---

## 6. HALAMAN CONTACT [DISEPAKATI]

### 6.1 Isi dan tata letak
```
┌ Navbar ────────────────────────────────────────────────┐
│  Bawa botolmu besok.            ← penutup kampanye     │
│  (Display besar, kiri; "Re:" menyala)                   │
│                                                        │
│  Kirim pesan                    │  Hubungi tim          │
│  Nama ______________            │  [email tim]          │
│  Email _____________            │  [akun tim]           │
│  Pesan _____________            │  Techno Versary Vol.II │
│  [ Kirim ]                      │  Kampanye Peduli       │
│                                 │  Lingkungan            │
└────────────────────────────────────────────────────────┘
```
- Kalimat penutup kampanye **"Bawa botolmu besok."** [DISEPAKATI].
- **Form berfungsi** (nama, email, pesan) lewat **Formspree (free tier)** [DISEPAKATI].
- **Email tim** dan **akun tim**: `[email tim]` dan `[akun tim]` placeholder dari `site.ts` [D24: menunggu data].
- Info yang biasanya di footer (nama tim, anggota, subtema, lomba, tautan ke About/Konten).
- Kursor bawaan (tidak ada kursor cincin). Navbar lengkap dan menempel.

### 6.2 Perilaku form
| Aspek | Aturan |
|---|---|
| Validasi (klien) | `nama`: 2–80 karakter. `email`: format valid (`type="email"` + regex longgar). `pesan`: 10–1000 karakter, penghitung kecil `0/1000`. Validasi saat `blur` dan saat kirim |
| Pesan galat (ID) | "Nama minimal 2 karakter." · "Format email belum benar." · "Pesan minimal 10 karakter." |
| Anti-spam | Kolom jebakan tersembunyi `_gotcha` (Formspree) + `autocomplete` normal. Kirim hanya bila kolom itu kosong |
| Pengiriman | `fetch(endpoint, { method: "POST", headers: { Accept: "application/json" }, body: FormData })` |
| Konfigurasi | `VITE_FORMSPREE_ENDPOINT` (`.env`). Bila tidak diset: tombol tetap berfungsi dengan **cadangan `mailto:`** ke `[email tim]` dan tampil catatan kecil "Mode cadangan" |
| Status | `idle → sending → success | error`. `sending`: tombol disable, tiga titik berdenyut. `success`: form diganti pesan *"Terkirim. Terima kasih sudah peduli."* + tombol "Kirim pesan lain". `error`: banner *"Pesan belum terkirim. Coba lagi sebentar atau hubungi kami lewat email."* + data tidak hilang |
| Pembatasan klien | Kirim ulang ditahan 5 detik setelah sukses; mencegah klik ganda |
| Aksesibilitas | Label terhubung (`for`/`id`), `aria-invalid`, `aria-describedby` ke pesan galat, `role="status"` untuk status, fokus pindah ke ringkasan galat bila ada, `autocomplete="name|email"` |
| Privasi | Catatan satu baris: *"Pesanmu hanya dipakai untuk menjawab kamu."* Tidak ada pelacak |

### 6.3 Uji wajib (fungsionalitas bernilai 10% + final demo)
Kirim berhasil (uji dengan endpoint nyata), kirim gagal (jaringan mati), validasi tiap kolom, bekerja dengan keyboard saja, bekerja di HP.

---

## 7. HALAMAN 404 [USULAN]
- Latar biru hero, H1 **"Botol ini tersesat."**, satu kalimat, tombol "Kembali ke awal" (ke `#/`).
- Botol 2D kecil (SVG `S-404`) mengambang halus (CSS `transform`, dimatikan di reduced-motion).

---

## 8. Daftar komponen (inventaris lengkap)

Kolom **Tipe**: **K** = komponen React biasa; **I** = imperatif (dikendalikan engine, React hanya wadah); **L** = logika murni (tanpa UI).

### 8.1 Kerangka (global)
| Komponen | Tipe | Berkas | Props utama | Catatan |
|---|---|---|---|---|
| `AppShell` | K | `components/shell/AppShell.tsx` | — | Layout induk, tidak di-unmount |
| `Navbar` | K+I | `shell/Navbar.tsx` | `variant: "story" \| "static"` | Timeline GSAP hanya di Home |
| `MenuButton` | K | `shell/MenuButton.tsx` | `open`, `onToggle` | Ikon dua titik ↔ ✕ |
| `MenuPanel` | K | `shell/MenuPanel.tsx` | `open`, `onClose` | Focus trap, `inert` pada `#app` |
| `Scrim` | K | `shell/Scrim.tsx` | `open`, `onClick` | |
| `CursorRing` | I | `shell/CursorRing.tsx` | `enabled` (per rute) | `pointer: fine` saja |
| `AudioToggle` | K | `shell/AudioToggle.tsx` | — | Membuat `AudioContext` saat klik |
| `SkipLink` | K | `shell/SkipLink.tsx` | — | |
| `RouteAnnouncer` | K | `shell/RouteAnnouncer.tsx` | — | `aria-live` judul halaman |
| `RouteTransition` | K | `shell/RouteTransition.tsx` | — | Fade antar rute |
| `Seo` | K | `shell/Seo.tsx` | `title`, `description` | Memperbarui `document.title` + meta |
| `BrandMark` | K | `ui/BrandMark.tsx` | `size`, `as` | "Re:" + "bottle" (mengikuti `data-re`) |

### 8.2 Home
| Komponen | Tipe | Props / data | Catatan |
|---|---|---|---|
| `HomePage` | K | — | Memilih `StoryStage` atau `StaticStory` |
| `StoryStage` | K+I | — | Memuat kanvas, engine, overlay |
| `StageCanvas` | I | `quality` | Three.js, `React.lazy`, satu renderer |
| `HeroTitle` | K+I | — | Z10, di belakang botol |
| `ChapterText` | K+I | `chapter` (data dari `story.ts`) | Judul, isi, data, surat |
| `PunchText` | K+I | — | Kalimat punchline kata per kata |
| `SplitHeadline` | I | `text`, `melt` | Pecah huruf (buatan sendiri) |
| `CopyPanel` | K | `children` | Panel semi-transparan |
| `DataCounter` | I | `from`, `to`, `unit`, `range` | Mono, `tabular-nums`, naik mengikuti `shown` |
| `LetterCard` | I | `text`, `signature` | Kertas, Caveat, per kata |
| `CTAClosing` | I | — | "Bawa botolmu besok." |
| `ChapterMarker` | I | — | Dua `<ol>`, hanya-baca |
| `ScenarioLabel` | I | — | Hilang saat gulir dimulai |
| `ScrollHint` | I | `variant: "start" \| "loop"` | `(Gulir untuk mulai)` / `(Terus gulir)` |
| `LoopDome` | I | — | `--pull` |
| `Overlays` | K | — | Butiran, vignette, retak latar |
| `FlashWindow` | I | — | Bingkai kilas Bab 7c |
| `TimeRing` | I | `min`, `max`, `unit` | Cincin SVG (Bab 2 dan 7) |
| `StationLabels` | I | — | 4 label Bab 9 (proyeksi 3D→layar) |
| `StaticStory` | K | — | 11 panel (reduced-motion) |
| `StaticPanel` | K | `chapter` | Ilustrasi SVG + teks |

### 8.3 Halaman konten
| Komponen | Tipe | Catatan |
|---|---|---|
| `PageHero` | K | H1 + lede |
| `FactBlock`, `SourceList`, `LicenseTable`, `TeamGrid`, `ClosingStrip`, `TempDiagram` | K | Halaman About |
| `FilterPill` | K | Dua kelompok, `aria-pressed`, hitungan |
| `ArticleGrid` | K | Daftar kartu + anunsiasi |
| `ArticleCard` | K | Kartu (lihat 4.4) |
| `ParticleField` | I | Kanvas 2D |
| `ArticlePage` | K | Detail |
| `ArticleBody` | K | Render isi (paragraf/H2) dari data |
| `NextArticle` | K | Kartu kecil |
| `SourceItem` | K | Satu sumber |
| `ContactForm` | K | Form + status |
| `FormField` | K | Label, input, galat |
| `NotFoundPage` | K | 404 |

### 8.4 Mesin dan 3D (non-UI)
| Modul | Tipe | Peran |
|---|---|---|
| `StoryEngine` | L | `target`, `shown`, ratchet, `reset`, `pause/resume`, pelanggan |
| `LoopGesture` | L | `pull`, `commitLoop` |
| `palette.ts`, `cues.ts` | L | Interpolasi palet dan isyarat suhu |
| `SceneDirector` | L | Mengelola scene aktif dan siklus hidupnya |
| `scenes/*` (`b1.ts` … `b10.ts`, `punch.ts`) | L | Implementasi `Scene` |
| `objects/*` (`bottle.ts`, `hand.ts`, `particles.ts`, `water.ts`, `fish.ts`, `bins.ts`, `conveyor.ts`, `products.ts`, `tumbler.ts`, …) | L | Pembuat objek prosedural |
| `QualityManager` | L | Tier HIGH/MEDIUM/LOW |
| `AudioEngine` | L | Sintesis Web Audio |

---

## 9. Konfigurasi konten (`src/content/`)

| Berkas | Isi |
|---|---|
| `site.ts` | `name: "Re:bottle"`, `tagline`, `subtheme`, `competition`, `team: { name, members: [{ name, role, link? }] }`, `contact: { email: "[email tim]", account: "[akun tim]" }`, `formspreeEndpoint` (dari env) |
| `story.ts` | Judul bab, suhu, teks, data, surat per bab (lihat 11) |
| `facts.ts` | `{ id, value, unit, claim, source: {publisher, title, year, url, accessed}, verified: boolean }`. Komponen hanya menampilkan yang `verified: true` |
| `articles.ts` | 12 artikel: `id, slug, type, level, title, minutes, cover, lede, sections, bridge, sources` |
| `credits.ts` | Daftar lisensi aset (untuk `LicenseTable`) |

Aturan: **tidak ada teks panjang di dalam komponen.** Semua teks di `content/`, sehingga penulis dan developer bekerja terpisah.
