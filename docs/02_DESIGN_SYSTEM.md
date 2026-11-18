# 02 · DESIGN SYSTEM: Re:bottle

> Warna per bab, struktur palet, aturan aksen amber, ukuran panel menu, dan perilaku komponen = **[DISEPAKATI]**.
> Pilihan font, skala tipografi, bentuk penanda, gaya "Re:" pudar/menyala, tombol suara, dan nilai-nilai token lainnya = **[USULAN]** (mengisi butir "menunggu design system" di konsep).
> Seluruh nilai di sini **harus hidup di satu tempat** (`src/styles/tokens.css` dan `src/lib/tokens.ts`). Komponen **dilarang** menaruh hex atau ukuran bebas.

---

## 1. Warna

### 1.1 Palet cerita (per bab) [DISEPAKATI hex; disetel di prototipe]

| ID | Bagian | Suhu (°C) | `bg` | `accent` | `ink` | Kontras ink/bg | Kontras accent/bg |
|---|---|---|---|---|---|---|---|
| `c1` | Bab 1 Lahir | 1,2 | `#0B2B80` | `#8FD3FF` | `#F3F8FF` | 11,8 | 7,7 |
| `c2` | Bab 2 Sekali Pakai | 1,5 | `#12336F` | `#9CC6EA` | `#F3F8FF` | 11,4 | 6,8 |
| `c3` | Bab 3 Tersesat | 2,0 | `#183558` | `#8FB0CC` | `#F3F8FF` | 11,7 | 5,5 |
| `c4` | Bab 4 Lautan | 2,7 | `#142848` | `#86A8D0` | `#F3F8FF` | 13,8 | 6,0 |
| `c5` | Bab 5 Terurai | 3,3 | `#101C38` | `#8098C2` | `#F3F8FF` | 15,8 | 5,8 |
| `c6` | Bab 6 Kembali ke Kita | 4,0 | `#0A1226` | `#8A96C8` | `#F3F8FF` | 17,5 | 6,5 |
| `cp0` | Punchline (awal) | 4,0 | `#05080F` | `#C9D3E6` | `#EDEDED` | 17,1 | 13,3 |
| `cp1` | Punchline (akhir) | 1,5 | `#08131F` | `#C9D3E6` | `#EDEDED` | 16,0 | 12,4 |
| `c7` | Bab 7 Di Tempat yang Benar | 1,5 | `#1F4F5E` | `#9FE6D0` | `#F1FAF7` | 8,5 | 6,3 |
| `c8` | Bab 8 Perjalanan Kedua | 1,5 | `#226B63` | `#B9F3C9` | `#F1FAF7` | 5,9 | 5,0 |
| `c9` | Bab 9 Hidup Baru | 1,5 | `#2E7D5B` | `#F6B35A`* | `#F4FBF6` | 4,8 | 2,7* |
| `c10` | Bab 10 Surat Terakhir | 1,5 | `#D9E6D6` | `#0F8B8D` | `#11261B` | 12,3 | 3,2 |

\* **Amber `#F6B35A` hanya untuk kilau tungku lokal**, bukan teks. Kontras 2,7 tidak masalah karena bukan teks.
Aksen pada `c10` (`#0F8B8D`) hanya untuk objek (tumbler) dan elemen grafis ≥ 3:1. **Teks selalu `ink`.**

**Warna pendukung tetap**

| Token | Hex | Pakai |
|---|---|---|
| `--bone` | `#E6EAF2` | Retakan, karang memutih, mikroplastik, label tempat sampah |
| `--hero-bg` | `#0B2B80` | Latar hero **dan** warna lingkaran loop (sama persis) |
| `--sage` | `#D9E6D6` | Latar Bab 10, latar Galeri Artikel |
| `--amber-glow` | `#F6B35A` | Kilau tungku Bab 9 (maks. 4% luas layar) |
| `--tumbler` | `#0F8B8D` | Tumbler |
| `--menu-bg` | `#EEF2EF` | Panel menu |
| `--menu-ink` | `#0B1A33` | Teks panel menu (kontras 15,4) |
| `--scrim` | `rgba(5,10,25,.45)` | Scrim di belakang panel menu |

### 1.2 Cara kerja interpolasi [DISEPAKATI]
- `applyPalette(shown)` menulis `--bg-a`, `--bg-b`, `--ink-a`, `--ink-b`, `--accent-a`, `--accent-b`, `--mix` pada `<html>`.
- `--mix` memakai **aturan dataran**: ±70% awal tiap bab = warna murni (`mix = 0`), 30% akhir bergeser ke bab berikutnya (`smoothstep(0.7, 1, k)`).
- `color-mix(in oklch, var(--bg-a), var(--bg-b) var(--mix))`.
- **Jeda teks (text gap)** [USULAN]: di dalam jendela pergeseran 30% tersebut, **tidak boleh ada teks** yang terlihat (teks keluar di ±0,66 dan teks bab berikutnya masuk di ±0,08 bab berikutnya). Ini menjamin kontras tidak pernah jatuh saat warna di tengah-tengah transisi. Berlaku khusus penting di **Bab 9 → 10** (ink dibalik dari terang ke gelap) dan **punchline → Bab 7**.

### 1.3 Panel teks semi-transparan [DISEPAKATI prinsip, USULAN nilai]
Semua teks cerita diletakkan di atas panel:

```css
.copy-panel {
  background: color-mix(in oklch, var(--bg-now) 72%, #000 28%);   /* --bg-now = hasil mix berjalan */
  background-color: color-mix(in srgb, var(--panel-base) 78%, transparent);
  border: 1px solid color-mix(in oklch, var(--ink-now) 14%, transparent);
  border-radius: var(--r-lg);
  padding: var(--s-6) var(--s-7);
}
/* TIDAK memakai backdrop-filter (berat di HP, terutama di atas kanvas WebGL). */
```
Di **Bab 10** (latar terang), panel berbalik: `--panel-base: #F4F8F2`, ink gelap.

---

## 2. Tipografi

### 2.1 Pilihan font [USULAN] (semua berlisensi **SIL OFL**, gratis, aman untuk lomba)

| Peran | Font | Mengapa | Paket (self-host) |
|---|---|---|---|
| **Judul / display** | **Bricolage Grotesque** (variable: `wght` 200–800, `wdth` 75–100, `opsz` 12–96) | Karakter kuat dan sedikit "organik", sumbu variabel bisa dipakai untuk efek meleleh | `@fontsource-variable/bricolage-grotesque` |
| **UI dan isi** | **Instrument Sans** (variable: `wght`, `wdth`) | Netral, terbaca jelas di ukuran kecil, nuansa modern | `@fontsource-variable/instrument-sans` |
| **Surat tulisan tangan** | **Caveat** (variable `wght` 400–700) | Tulisan tangan terbaca baik, mendukung karakter Indonesia | `@fontsource-variable/caveat` |
| **Data / angka / suhu** | **JetBrains Mono** (variable `wght`), **subset angka + `°+,.:%`** | Angka tabular agar counter tidak "bergoyang" | `@fontsource-variable/jetbrains-mono` |

> Setelah `npm install`, **cek berkas CSS yang tersedia di paket Fontsource** (nama berkas sumbu variabel bisa `wdth.css`/`full.css`/`index.css`). Pakai varian paling kecil yang masih memuat sumbu yang dibutuhkan (`wght` + `wdth` untuk judul).

### 2.2 Strategi pemuatan font (performa)
1. **Self-host** lewat Fontsource, impor di entri (bukan Google Fonts) agar tidak ada permintaan pihak ketiga.
2. **Subset `latin`** saja (cukup untuk Indonesia). Jangan impor `latin-ext` dan `vietnamese`.
3. `font-display: swap`. **Preload** hanya Bricolage (judul) dan Instrument Sans (isi) di `index.html`.
4. Caveat dan JetBrains Mono dimuat **malas** (CSS di-`import()` saat Home dimuat, subset angka untuk Mono).
5. Fallback tumpukan font dengan metrik disesuaikan (`size-adjust`) untuk meminimalkan CLS.

```css
:root {
  --font-display: "Bricolage Grotesque Variable", "Helvetica Neue", Arial, sans-serif;
  --font-ui:      "Instrument Sans Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-hand:    "Caveat Variable", "Segoe Script", "Bradley Hand", cursive;
  --font-mono:    "JetBrains Mono Variable", ui-monospace, "SFMono-Regular", Menlo, monospace;
}
```

### 2.3 Skala tipografi (fluid) [USULAN]

| Token | Pakai | Nilai | Font / berat | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| `--t-hero` | Judul hero "Re:bottle" | `clamp(4.5rem, 17vw, 17rem)` | Display 700, `wdth` 88, `opsz` 96 | 0,86 | −0,04em |
| `--t-chapter` | H1 judul bab | `clamp(2.75rem, 7.2vw, 7rem)` | Display 700, `wdth` 90 | 0,92 | −0,03em |
| `--t-punch` | Kalimat punchline | `clamp(2.25rem, 6vw, 5.5rem)` | Display 500, `wdth` 100 | 1,02 | −0,02em |
| `--t-data` | Counter/angka besar | `clamp(2.5rem, 6vw, 5.5rem)` | Mono 500, tabular | 1 | −0,02em |
| `--t-body-lg` | Isi bab | `clamp(1.0625rem, 1.25vw, 1.375rem)` | UI 400, `wdth` 100 | 1,5 | 0 |
| `--t-body` | Isi artikel | `clamp(1rem, 1.05vw, 1.1875rem)` | UI 400 | 1,65 | 0 |
| `--t-ui` | Label/penanda bab/navbar | `0.8125rem` (13px) | UI 500, kapital | 1,2 | +0,08em |
| `--t-ui-sm` | Catatan, sumber, label skenario | `0.75rem` (12px) | UI 400 | 1,4 | +0,02em |
| `--t-letter` | Surat tulisan tangan | `clamp(1.75rem, 3vw, 2.75rem)` | Hand 500 | 1,25 | 0 |
| `--t-card` | Judul kartu artikel | `clamp(1.5rem, 2.2vw, 2.25rem)` | Display 600, `wdth` 92 | 1,08 | −0,02em |
| `--t-h2` | Judul bagian (About, artikel) | `clamp(1.75rem, 3vw, 3rem)` | Display 650 | 1,1 | −0,02em |

Aturan:
- Judul bab memakai **huruf kecil-kapital kalimat** (bukan semua kapital). Label UI (penanda bab, navbar, chip) memakai **kapital kecil** (`text-transform: uppercase`) dengan letter-spacing +0,08em.
- Angka suhu dan counter **selalu** `font-variant-numeric: tabular-nums`.
- Panjang baris isi: **maks. 62 karakter** (`max-width: 62ch`).
- Teks isi tidak pernah di bawah **16px**, label tidak di bawah **12px**.

### 2.4 Efek "meleleh" (judul bab 5 dan 6) [USULAN, mengisi "variable font"]
Variabel `--melt` (0–1) dihitung dari `shown` (Bab 5: 0,25 → 0,6; Bab 6: 0,6 → 1). Efek berlapis agar murah:

1. **Per huruf** (judul dipecah menjadi `<span class="ch">` oleh `splitLetters()` buatan sendiri, bukan pustaka berbayar):
   ```css
   .ch { display:inline-block; transform-origin: 50% 0%;
         transform: translateY(calc(var(--melt) * var(--d) * 0.12em))
                    scaleY(calc(1 + var(--melt) * var(--s) * 0.35))
                    skewX(calc(var(--melt) * var(--k) * 1deg)); }
   ```
   `--d`, `--s`, `--k` diacak (seed tetap per huruf): `--d` 0,4–1,6, `--s` 0,5–1,5, `--k` −6..+6.
2. **Sumbu variabel:** `font-variation-settings: "wght" calc(700 - var(--melt)*280), "wdth" calc(90 + var(--melt)*10);`: huruf menipis dan melebar seperti lelehan. (Pastikan sumbu `wdth` tersedia pada paket.)
3. **Filter SVG** pada elemen judul (area kecil): `feTurbulence baseFrequency 0.008–0.02` + `feDisplacementMap scale = melt × 14`. Dimatikan di tier LOW dan `prefers-reduced-motion`.
4. Huruf **tidak boleh jatuh sampai tak terbaca**: batas `translateY` ≤ 0,12em, kontras tetap lolos.

### 2.5 Gaya "Re:" pudar dan menyala [USULAN]
```css
.brand .re { opacity: var(--re-dim, .45); -webkit-text-stroke: 1px currentColor; color: transparent;
             transition: opacity .9s var(--ease-out-expo), color .9s var(--ease-out-expo); }
[data-re="on"] .brand .re { opacity: 1; color: currentColor; -webkit-text-stroke: 0; }
```
- **Pudar:** huruf berbentuk garis luar 1px dengan opasitas 0,45 (kontras ≥ 3:1 pada latar Bab 1; tetap terbaca, tidak tampak sebagai bug).
- **Menyala:** terisi penuh, opasitas 1, plus **kilau** singkat: `text-shadow: 0 0 .4em var(--accent-now)` selama 0,9 detik lalu hilang.
- `.snap` (reset loop) mematikan `transition`.
- Berlaku untuk logo navbar, judul hero, dan blok identitas di panel menu.

---

## 3. Spasi, radius, garis, lapisan

| Token | Nilai |
|---|---|
| Skala spasi (basis 4px) | `--s-1 4px · s-2 8 · s-3 12 · s-4 16 · s-5 20 · s-6 24 · s-7 32 · s-8 40 · s-9 56 · s-10 80 · s-11 120` |
| Radius | `--r-sm 6px · r-md 12px · r-lg 20px · r-xl 32px · r-full 999px` |
| Garis | tipis `1px`, tegas `1.5px` (kursor) |
| Margin halaman | `--gutter-page: 6vw` (HP: 20px) |
| Layar | `--bp-sm 480 · bp-md 768 · bp-lg 1024 · bp-xl 1440` |
| Tinggi viewport | selalu `100dvh` / `svh` (bukan `100vh`) |

**Lapisan (z-index)** [DISEPAKATI]:

| Lapisan | z |
|---|---|
| Latar palet CSS | 0 |
| Judul hero (di belakang botol) | 10 |
| Kanvas WebGL (transparan) | 20 |
| Teks bab dan panel | 30 |
| Penanda bab | 40 |
| Lingkaran loop (dome) | 50 |
| Overlay butiran dan vignette (CSS) | 60 (pointer-events none) |
| Scrim menu | 80 |
| Panel menu | 90 |
| Navbar, tombol menu, tombol suara | 100 |
| Kursor cincin | 1000 |

> Catatan: dome (50) di atas teks (30) dan penanda (40) tetapi di bawah navbar (100) dan petunjuk gulir (di dalam navbar-layer 100) [sesuai konsep].

---

## 4. Gerak (token)

```css
:root {
  --ease-out-expo: cubic-bezier(.16, 1, .3, 1);
  --ease-gate:     cubic-bezier(.2, .8, .2, 1);
  --ease-in-out:   cubic-bezier(.65, 0, .35, 1);
  --ease-heavy-in: cubic-bezier(.7, 0, .84, 0);

  --dur-fast: .2s;   --dur-base: .4s;   --dur-slow: .9s;   /* 0.9 = "Re:" */
  --dur-menu: .5s;   --dur-menu-stagger: .06s;
  --dur-nav-collapse: .55s;  --nav-stagger: .05s;
  --dur-marker: .45s;  --dur-chapters-swap: .4s;
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0s; --dur-base: 0s; --dur-slow: 0s; --dur-menu: 0s; --dur-nav-collapse: 0s; }
}
```

---

## 5. Isyarat suhu: tabel parameter per bab [USULAN, PROTOTIPE]

Variabel `heat` = `(T − 1,2) / 2,8` (0 di Bab 1, 1 di Bab 6). Nilai di bawah adalah **titik awal** pada awal tiap bab; antar bab diinterpolasi mengikuti `shown`.

| Bab | T (°C) | `heat` | Butiran (opacity) | Vignette | Kabut | Shimmer (px) | `--melt` | Retak (opacity) | Kekeruhan botol | Rim | Env | Partikel (fraksi) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1,2 | 0 | 0,06 | 0 | 0 | 0 | 0 | 0 | 0 | 3,0 | 0,60 | 0 |
| 2 | 1,5 | 0,11 | 0,10 | 0,05 | 0 | 0 | 0 | 0 | 0,10 | 2,8 | 0,55 | 0 |
| 3 | 2,0 | 0,29 | 0,14 | 0,10 | 0,02→0,06 | 0 | 0 | 0 | 0,45 | 2,4 | 0,50 | 0 |
| 4 | 2,7 | 0,54 | 0,18 | 0,30 | 0 (kabut laut tipis 0,01) | 2 | 0 | 0 | 0,60 | 2,0 | 0,42 | 0 |
| 5 | 3,3 | 0,75 | 0,24 | 0,42 | 0,02 | 4 | 0,25→0,6 | 0,55→0,8 | 0,80 | 1,6 | 0,34 | 0→0,7 |
| 6 | 4,0 | 1 | 0,30 | 0,55 | 0,02 | 6 | 0,6→1 | 1 | 0,90 | 1,2 | 0,25 | 1 |
| Punchline | 4,0→1,5 | ← *rewind* | 0,30→0,08 | 0,55→0,70→0 | 0 | 6→0 | 1→0 | 1→0 | 0,9→0 | 1,2→0,2 | 0,25→0,08 | 1→0 |
| 7 | 1,5 | — | 0,08 | 0 | 0 | 0 | 0 | 0 | 0 | 2,6 | 0,70 | 0 |
| 8 | 1,5 | — | 0,07 | 0 | 0 | 0 | 0 | 0 | 0 (dibersihkan) | 2,6 | 0,70 | 0 |
| 9 | 1,5 | — | 0,06 | 0 | 0 | 0 | 0 | 0 | — | 2,6 | 0,70 | 0 |
| 10 | 1,5 | — | 0,04 | 0 | 0 | 0 | 0 | 0 | — | 2,6 | 0,75 | 0 |

Butiran dibuat dari kanvas 256² prosedural (tidak ada berkas). Vignette dan butiran adalah **overlay CSS** (z-index 60), bukan pass WebGL, agar murah.

---

## 6. Komponen UI: spesifikasi visual

### 6.1 Navbar
| Atribut | Nilai |
|---|---|
| Posisi | `position: fixed; top: 0; inset-inline: 0; z-index: 100; padding: 20px 6vw` |
| Isi | Logo kiri, tautan tengah-kanan, tombol bulat paling kanan |
| Tautan | UI 13px kapital, +0,08em, jarak antar tautan 32px. Aktif: garis bawah 1,5px. Hover: garis bawah memanjang dari kiri 0,3 detik |
| Latar | **Transparan** di Home. Di halaman lain: transparan di atas, berubah menjadi `color-mix(in oklch, var(--bg-now) 82%, transparent)` setelah gulir > 8px (tanpa blur) |
| Warna | `var(--ui-ink)` (berganti per bab agar kontras terjaga). Opsi cepat: `mix-blend-mode: difference` |
| Mengempis (Home) | Lihat 04 bagian 5. Tautan bergeser ke arah tombol sambil memudar |
| HP (≤ 768) | Hanya logo + tombol bulat |

### 6.2 Tombol menu (burger bulat) [DISEPAKATI bulat, USULAN detail]
- Lingkaran **56 px** (HP 48 px), garis tepi 1,5px `var(--ui-ink)`, isi transparan.
- Ikon **dua titik** (• •) berdiameter 6px dengan jarak 8px. Hover: titik bergerak mendekat dan lingkaran mengisi pelan (scale latar 0 → 1). Terbuka: dua titik berubah menjadi **✕** (dua garis 1,5px), rotasi 0,4 detik.
- `aria-label="Buka menu"` → `"Tutup menu"`, `aria-expanded`, `aria-controls="menu"`.

### 6.3 Panel menu
Mengikuti konsep (lebar `clamp(320px, 25vw, 520px)`, HP `min(88vw, 380px)`, terang `#EEF2EF`, ink `#0B1A33`). Detail visual [USULAN]:
- Tautan: Display 600, `clamp(2rem, 3.2vw, 3.25rem)`, tinggi baris 1,05. Nomor kecil `<sup>` Mono 12px di kiri-atas.
- Tautan aktif: titik 8px `var(--tumbler)` di kiri.
- Hover: tautan lain turun ke opasitas 0,35; panah ↘ (SVG 20px) muncul di kanan tautan yang disorot.
- Garis pemisah 1px `rgba(11,26,51,.15)`.
- Blok identitas: "Re:bottle" (Display 700, 28px, dengan gaya "Re:" yang sama), tagline UI 15px, subtema UI 13px opasitas 0,7.
- Kontak tim: UI 14px, tautan bergaris bawah.
- HP: area sentuh tautan ≥ 56 px.

### 6.4 Penanda bab [DISEPAKATI struktur, USULAN gaya]
- Label: UI 13px kapital, +0,08em. Nomor Mono 12px (misal `01`), gap 12px.
- Kotak penanda **8×8px**, `currentColor`, meluncur 0,45 detik `--ease-gate`.
- Garis vertikal 1px `currentColor` opasitas 0,2.
- Aktif opasitas 1, tidak aktif 0,35.
- Suhu: Mono 12px opasitas 0,8 di samping label aktif (`+2,0°C`).
- Posisi `left: 40px; top: 50%` (HP: `left: 14px`, hanya titik 5px).

### 6.5 Kursor cincin
Sesuai konsep (SVG elips, R = 21, stroke 1,5px putih, `mix-blend-mode: difference`). Tambahan [USULAN]: saat di atas kartu artikel, di tengah cincin muncul label "Baca" (UI 11px kapital) setelah cincin membesar 1,7×. Hilang di input.

### 6.6 Tombol suara [USULAN]
- Lingkaran 56 px (HP 48), **kiri-bawah** (`left: 6vw; bottom: 28px`), garis 1,5px.
- Ikon: tiga gelombang (aktif) atau satu garis diagonal (mute). Label sr-only "Nyalakan suara"/"Matikan suara".
- Default: **mati**. Klik pertama membuat `AudioContext` (kebijakan autoplay).
- Di Home saja? **Tidak:** tersedia di semua halaman agar suara bisa dimatikan di manapun (tetapi tidak memutar apa pun di halaman selain Home).

### 6.7 Petunjuk gulir dan label skenario
- `(Gulir untuk mulai)`: UI 13px kapital, bergaris bawah 1px, di bawah-tengah (`bottom: 32px`), animasi anak panah kecil naik-turun halus 2,4 detik (opacity+translateY).
- `(Terus gulir)`: sama, muncul di akhir Bab 10 (setelah 10e). Menghilang saat `pull > 0,05`.
- Label skenario: UI 12px, opasitas 0,75, `max-width: 38ch`, di atas petunjuk gulir. Hilang saat gulir dimulai (`shown > 0,004`).

### 6.8 Kartu artikel [DISEPAKATI struktur]
| Atribut | Nilai |
|---|---|
| Gambar | Rasio 4:3 (HP 16:10), `object-fit: cover`, radius 12px |
| Judul | `--t-card` |
| Subjudul | UI 13px, label ganda + waktu baca, mis. *Negatif · Global · 5 menit baca* |
| Panah | ↘ SVG 28px di kanan, bergeser (translate 4px,4px) saat hover |
| Pemisah | garis 1px `currentColor` 0,25 |
| Warna negatif | latar kartu `#183558`, ink `#E8EEF6`, label `#8FB0CC` |
| Warna positif | latar kartu `#1F5C55`, ink `#F1FAF7`, label `#9FE6D0` |
| Hover | Gambar bergeser +6px dan **RGB-split** halus (dua salinan, `mix-blend-mode: screen`, offset ±3px) |
| Masuk | naik 24px + memudar, *stagger* 60ms, 0,7 detik `--ease-out-expo` |

### 6.9 Pil filter
- Satu pil kapsul (`--r-full`), tinggi 48px, garis 1,5px, latar `color-mix` terang tipis.
- Dua kelompok dipisah garis 1px: **jenis** (Semua, Negatif, Positif) | **level** (Sehari-hari, Nasional, Global).
- Chip aktif: latar penuh `ink`, teks `bg`. Hitungan: Mono 11px superskrip (`Global 4`).
- Berpindah: latar chip aktif meluncur (FLIP) 0,35 detik.
- Mobile: pil dapat digulir horizontal (`overflow-x: auto`, `scroll-snap`), garis pemisah tetap.
- Keyboard: grup `role="group"` dengan `aria-label`, chip adalah `<button aria-pressed>`.

### 6.10 Form Contact
- Kolom: nama, email, pesan (textarea 6 baris). Label di atas (UI 13px kapital).
- Input: tinggi 56px, latar transparan, garis bawah 1.5px (bukan kotak), fokus: garis `--tumbler` 2px + cincin fokus 2px offset 2px.
- Tombol kirim: kapsul 56px, latar `ink`, teks `bg`; loading: tiga titik; sukses: ✓ dan teks "Terkirim. Terima kasih."
- Galat: teks 13px di bawah kolom, ikon peringatan, `aria-describedby`, `aria-invalid`.

### 6.11 Tombol umum
Kapsul 52px, padding 0 28px, UI 14px kapital +0,06em. Primer: latar `ink`, teks `bg`. Sekunder: garis 1,5px. Hover primer: latar bergeser ke aksen; fokus: cincin 2px.

### 6.12 Kartu surat (Babak II) [USULAN]
- Panel "kertas": latar `#F4F8F2` pada 88% opasitas, radius 6px, bayangan lembut `0 18px 40px rgba(0,0,0,.18)`, rotasi −1,2° (acak per surat ±1,5°).
- Teks Caveat `--t-letter`, ink `#11261B`.
- Sudut atas: "Re:" kecil (Display 700 22px, bergaya menyala) sebagai kop surat, lalu salam "Hai,".
- Tanda tangan di akhir: "— Botol" (Caveat 700).
- Teks surat **muncul per kata** (opacity 0 → 1, *stagger* 40ms) mengikuti `shown`, seolah ditulis (bukan animasi goresan SVG, demi ringan).

---

## 7. Ikon (SVG inline, 24×24, stroke 1,5px, `currentColor`)

| Ikon | Pakai |
|---|---|
| Arrow ↘ | Kartu artikel, tautan menu |
| Close ✕ | Tombol menu terbuka |
| Sound on/off | Tombol suara |
| Arrow ↗ | Tautan eksternal (sumber) |
| Check ✓ | Form sukses |
| Alert ! | Form galat |
| Chevron ↓ | Petunjuk gulir |

Semua dibuat sendiri (path sederhana), tanpa pustaka ikon.

---

## 8. Responsif

| Rentang | Perilaku |
|---|---|
| ≥ 1441 | Margin maksimum, teks maks. 62ch, subjek 3D ≤ 55% tinggi |
| 1025–1440 | Desain acuan |
| 769–1024 | Penanda bab jadi titik. Navbar tetap tautan (jika muat) |
| ≤ 768 | Hanya burger. Tata letak satu kolom. Grid artikel 1 kolom |
| ≤ 480 | Ukuran judul memakai batas bawah `clamp`; panel teks lebar penuh dengan margin 16px |
| Landscape pendek (tinggi < 480) | Subjek 3D diperkecil 15%; panel teks hanya judul + satu kalimat |

---

## 9. Aksesibilitas (kontras dan fokus)

- Kontras teks: **≥ 4,5:1** (isi), **≥ 3:1** (teks besar ≥ 24px/19px tebal). Lihat tabel 1.1: seluruh `ink` lolos (terendah 4,8 pada Bab 9).
- "Re:" pudar: opasitas 0,45 + garis luar → ≈ 3,5:1 di atas `#0B2B80` (cukup untuk logo/teks besar).
- Cincin fokus: `outline: 2px solid var(--focus); outline-offset: 3px;` di mana `--focus` = `var(--accent-now)` pada latar gelap dan `var(--tumbler)` pada latar terang.
- Kursor cincin **tidak menggantikan** indikator fokus keyboard.
- `prefers-reduced-motion`: lihat 04 bagian 11 (mode panel statis).
- `forced-colors`: border 1px di semua kontrol.

---

## 10. Berkas token

```
src/styles/tokens.css     ← variabel CSS (warna dasar, tipografi, spasi, gerak, z-index)
src/lib/tokens.ts         ← objek TS yang sama (PALETTE, TEMP, CUES, LENGTHS) untuk logika JS/Three
src/styles/typography.css ← kelas tipografi (hero, chapter, body, ui, mono, hand)
src/styles/base.css       ← reset, fokus, scrollbar tersembunyi, kelas snap
```

`tokens.ts` adalah satu-satunya sumber nilai angka untuk JS. `tokens.css` boleh dihasilkan dari `tokens.ts` lewat skrip kecil agar tidak pernah menyimpang (lihat 06 bagian 9).
