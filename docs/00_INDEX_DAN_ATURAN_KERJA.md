# 00 · INDEX DAN ATURAN KERJA: Re:bottle

**Techno Versary Vol. II · Web Design Competition · Subtema: Kampanye Peduli Lingkungan**
Tagline: *"Bawa botolmu besok."*

> Dokumen ini adalah **pintu masuk** seluruh paket perencanaan. Siapa pun (manusia atau agen coding) yang membuka proyek ini, termasuk di sesi chat baru atau di laptop lokal, **harus membaca dokumen ini lebih dulu**.

---

## 1. Cara memakai paket dokumen

### 1.1 Legenda status (wajib dipahami)

Setiap keputusan di seluruh dokumen diberi salah satu tanda:

| Tanda | Arti | Boleh diubah agen coding? |
|---|---|---|
| **[DISEPAKATI]** | Sudah disetujui tim di sesi brainstorming (tercatat di `KONSEP_LENGKAP_RE-BOTTLE_v2.md`) | **Tidak.** Ubah hanya atas perintah eksplisit tim |
| **[USULAN]** | Keputusan baru yang saya usulkan di paket ini untuk mengisi hal yang sebelumnya "dipastikan belakangan". Belum disetujui | Dikerjakan **sebagai nilai awal**, tetapi harus mudah diganti (token/konfigurasi) |
| **[VERIFIKASI]** | Fakta/angka/sumber yang **wajib dicek ke sumber resmi** sebelum tampil di website | Jangan tampilkan angka final sebelum diverifikasi. Pakai placeholder bertanda |
| **[PROTOTIPE]** | Angka yang memang harus disetel lewat percobaan (parameter gestur, kecepatan, dll.) | Setel, catat nilai akhir di `docs/CHANGELOG_PARAMETER.md` |

### 1.2 Aturan konflik

1. Untuk hal **[DISEPAKATI]**, `KONSEP_LENGKAP_RE-BOTTLE_v2.md` selalu menang.
2. Untuk hal **[USULAN]**, dokumen paket ini menang sampai tim menyetujui atau menolaknya. Setelah ada keputusan, ubah tandanya (jadi [DISEPAKATI] atau ganti isinya) dan catat di bagian 5 dokumen ini.
3. Jika dua dokumen paket ini bertentangan, urutan prioritas: **04 Interaksi → 03 Scene → 02 Design System → 06 Arsitektur → lainnya**.
4. Jika ada hal yang tidak tercakup, **jangan menebak diam-diam**: ambil keputusan paling konservatif, tulis di `docs/DECISIONS.md`, lalu lanjut.

### 1.3 Urutan baca

| Urutan | Dokumen | Isi | Dibaca oleh |
|---|---|---|---|
| 1 | `00_INDEX_DAN_ATURAN_KERJA.md` | Dokumen ini | Semua |
| 2 | `KONSEP_LENGKAP_RE-BOTTLE_v2.md` | Konsep yang disepakati (sumber kebenaran) | Semua |
| 3 | `01_ART_DIRECTION.md` | Rasa, mood, bahasa visual, cahaya, material, gerak | Desainer, developer visual |
| 4 | `02_DESIGN_SYSTEM.md` | Token warna, tipografi, spasi, gerak, komponen UI | Developer |
| 5 | `03_SCENE_SPEC_HOME.md` | Spesifikasi **tiap scene** Home, detik per detik | Developer 3D/animasi |
| 6 | `04_INTERACTION_GUIDE.md` | Mesin gulir, ratchet, loop, navbar, menu, penanda bab, kursor, audio, keyboard, sentuh | Developer inti |
| 7 | `05_PAGES_AND_COMPONENTS.md` | About, Konten, detail artikel, Contact, 404, daftar komponen | Developer UI |
| 8 | `06_ARCHITECTURE.md` | Struktur folder, modul, antarmuka TypeScript, alur data | Developer inti |
| 9 | `07_ASSET_REGISTER_AND_PROMPTS.md` | Daftar semua aset, spesifikasi, prompt generator | Pembuat aset |
| 10 | `08_AUDIO_SPEC.md` | Rancangan audio sintetis per bab | Developer audio |
| 11 | `09_PERFORMANCE_AND_QA.md` | Anggaran performa, tier kualitas, matriks uji, checklist | Semua |
| 12 | `10_TASK_BREAKDOWN.md` | Urutan kerja, tugas, kriteria selesai | Pengelola proyek, agen coding |
| 13 | `11_COPY_DECK.md` | Draf naskah semua teks, outline 12 artikel, daftar verifikasi sumber | Penulis |

### 1.4 Cara membawa paket ini ke sesi lain

1. Salin seluruh folder `rebottle-docs/` ke repo sebagai `docs/` (lokasi baku: `/docs`).
2. Letakkan berkas `CLAUDE.md` (templat di bagian 6) di akar repo. Ini memaksa agen coding membaca dokumen sebelum bekerja.
   > **Keputusan terbaru:** `docs/`, `CLAUDE.md`, dan `.claude/` bersifat **lokal**: dikecualikan lewat `.git/info/exclude` dan **tidak pernah di-commit/di-push**. Rekan tim menerimanya lewat `rebottle-docs.zip`, bukan lewat git (lihat dok 13).
3. Di sesi baru, buka dengan perintah: *"Baca `CLAUDE.md`, lalu `docs/00_INDEX_DAN_ATURAN_KERJA.md`, lalu kerjakan tugas berikutnya di `docs/10_TASK_BREAKDOWN.md`."*
4. Setiap selesai satu tugas, agen **mencentang** tugas di `10_TASK_BREAKDOWN.md` dan mencatat keputusan baru di `docs/DECISIONS.md`.

---

## 2. Ringkasan proyek dalam satu halaman

**Re:bottle** adalah situs *scrollytelling* 4 halaman (Home, About, Konten/"Galeri Artikel", Contact).

- **Home** mengikuti **satu botol plastik** lewat **10 bab** dalam dua babak. Satu variabel `progress` menggerakkan botol 3D, suhu, warna, teks, penanda bab, logo "Re:", navbar, dan audio.
  - **Babak I "Jika Kita Abai"**, Bab 1 sampai 6: Lahir → Sekali Pakai → Tersesat → Lautan → Terurai → Kembali ke Kita. Suhu naik +1,2 → +4,0°C. Palet hanya biru yang makin gelap.
  - **Punchline:** layar hening, *"Bagaimana jika semua ini tidak terjadi?"*. Suhu *rewind* ke +1,5°C.
  - **Babak II "Jika Kita Peduli"**, Bab 7 sampai 10: Di Tempat yang Benar → Perjalanan Kedua → Hidup Baru → Surat Terakhir (botol menulis surat). Suhu tetap +1,5°C. Palet teal → hijau → sage. Berakhir dengan **tumbler** dan ajakan **"Bawa botolmu besok."**
  - **Loop tak berujung** lewat gestur "tarik penuh" (setengah lingkaran biru yang naik mengikuti gulir). Tanpa animasi pergantian, tanpa loop mundur.
  - Bab **tidak bisa dilewati** (mesin *ratchet*, scrollbar disembunyikan).
- **Konten** ("Galeri Artikel"): 12 artikel dampak, matriks 2×3, pil filter gabungan.
- Kata **"Re:"** pada nama pudar di Babak I dan menyala di Babak II (dihitung dari posisi cerita).
- **Stack:** Vite + React + TypeScript, React Router (`HashRouter`), GSAP, Three.js murni, Web Audio API, CSS Modules + CSS variable. Hosting GitHub Pages (opsional).
- **Bobot penilaian:** Tema 30%, Visual 20%, **Testing dan performa 15%**, UX 25%, Fungsionalitas 10% (penyisihan). Final: konsep 30%, demo 25%, visual/UX 20%, inovasi 15%, tanya jawab 10%.

---

## 3. Glosarium

| Istilah | Arti |
|---|---|
| `progress` / `target` / `shown` | `target` = posisi gulir mentah (0–1). `shown` = posisi yang ditampilkan setelah dibatasi ratchet. Seluruh visual **hanya** membaca `shown` |
| Ratchet | Penjaga alur: `shown` mengejar `target` dengan kecepatan maksimum, sehingga tidak ada bab yang terlewat |
| Plateau | Bagian bab di mana teks sudah penuh dan warna murni (±70% awal jendela baca) |
| Dome / lingkaran loop | Setengah lingkaran biru hero yang naik dari bawah layar saat pengunjung menarik penuh di akhir Bab 10 |
| Snap | Kelas CSS sementara yang menonaktifkan transisi saat reset loop |
| Kilas | Jendela kecil di Bab 7c yang menampilkan sungai jernih (render *scissor*) |
| Scene | Satu unit adegan 3D milik satu bab, mengimplementasikan antarmuka `Scene` |
| Tier kualitas | HIGH / MEDIUM / LOW, dipilih otomatis oleh `QualityManager` berdasarkan perangkat dan FPS |
| Token | Variabel desain (warna, ukuran, gerak) di satu sumber (`tokens.css` / `tokens.ts`) |
| Clay style | Gaya model 3D low-poly bertekstur matte seperti tanah liat, tanpa tekstur gambar |
| Re: pudar/menyala | Status `data-re="off" \| "on"` pada `<html>` |

---

## 4. Prinsip yang tidak boleh dilanggar

1. **Satu sumber kebenaran.** Tidak ada komponen yang membaca `scrollY` untuk keperluan cerita. Hanya `shown`. [DISEPAKATI]
2. **Tidak ada re-render React per frame.** Mesin cerita menulis ke DOM/CSS variable/Three.js secara imperatif. [DISEPAKATI]
3. **Hanya gratis, open-source, atau buatan sendiri.** Tidak ada komponen/tema/template berbayar. [DISEPAKATI, aturan lomba no. 7]
4. **Tidak ada warna hangat** kecuali kilau tungku amber lokal di Bab 9. Tidak ada merah/oranye di Babak I. [DISEPAKATI]
5. **Tidak ada klaim sebab-akibat langsung** botol → suhu bumi. Label skenario wajib tampil di Babak I. [DISEPAKATI]
6. **Angka hanya dari sumber terverifikasi** dengan nama sumber dan tahun. [DISEPAKATI]
7. **Fitur yang dibatalkan tidak boleh dibangun:** kalkulator Botolmu, slider suhu manual, kartu unduhan, konsep siklus, loop mundur, tombol "Lewati ke Bab X", indikator progres terpisah, kolom pencarian artikel, artikel unggulan. [DISEPAKATI]
8. **Penanda bab hanya-baca**, bukan tombol. Menu hanya berisi halaman, bukan bab. [DISEPAKATI]
9. **Animasi hanya `transform` dan `opacity`** untuk elemen DOM. [DISEPAKATI/performa]
10. **Aksesibilitas bukan tambahan:** `prefers-reduced-motion`, fokus keyboard, kontras, `inert`, label ARIA. [DISEPAKATI]

---

## 5. Daftar keputusan baru yang MENUNGGU PERSETUJUAN

Hal-hal berikut dulu "dipastikan belakangan". Paket ini mengisinya dengan **usulan**. Tim cukup membalas "setuju" atau "ubah X". Setelah diputuskan, ubah kolom Status.

| # | Keputusan | Usulan | Dokumen | Status |
|---|---|---|---|---|
| D1 | Font judul | **Bricolage Grotesque** (variable, OFL) | 02 | [USULAN] |
| D2 | Font UI/isi | **Instrument Sans** (variable, OFL) | 02 | [USULAN] |
| D3 | Font surat tulisan tangan | **Caveat** (variable, OFL) | 02 | [USULAN] |
| D4 | Font angka/data | **JetBrains Mono** (subset angka dan tanda baca, OFL) | 02 | [USULAN] |
| D5 | Gaya "Re:" pudar | Garis luar 1px + opasitas 0,45 (kontras ≥ 3:1, sudah dihitung); menyala = opasitas 1 + isi penuh, 0,9 detik | 02 | [USULAN] |
| D6 | Bentuk penanda bab | Kotak 8px, garis tipis vertikal, label huruf kapital kecil berlatter-spacing | 02 | [USULAN] |
| D7 | Bentuk tombol menu | Lingkaran 56px, ikon dua titik → ✕ | 02, 04 | [USULAN] |
| D8 | Tombol suara | Lingkaran 56px di kiri-bawah, ikon gelombang | 02, 04 | [USULAN] |
| D9 | Panjang gulir tiap bab | Total **2.240 vh**, rincian di 03 bagian 2 | 03 | [USULAN] |
| D10 | Kecepatan maksimum ratchet | Berbasis waktu: **70 vh/detik** (bukan 0,004/frame) agar sama di 60/120/144 Hz | 04 | [USULAN/PROTOTIPE] |
| D11 | Posisi judul hero | Judul **di belakang** botol (DOM di bawah kanvas transparan) | 03 | [USULAN] |
| D12 | Latar | Warna latar = CSS (`color-mix`), kanvas WebGL **transparan** | 03, 06 | [USULAN] |
| D13 | Heat shimmer | Filter SVG pada **teks saja** + goyangan vertex pada objek 3D + opsional filter pada kanvas (hanya tier HIGH, dengan batas FPS) | 03, 09 | [USULAN] |
| D14 | Tangan di Bab 2 dan 7 | Tangan 3D **prosedural** bergaya *clay* (kapsul), bukan model GLB | 03, 07 | [USULAN] |
| D15 | Audio | **Sintesis prosedural** Web Audio (tanpa berkas), file CC0 hanya opsi cadangan | 08 | [USULAN] |
| D16 | Kilas Bab 7c | Jendela kecil dengan render *scissor* ke adegan sungai | 03 | [USULAN] |
| D17 | Label tempat sampah Bab 7 | Tiga tempat: **Plastik**, **Kertas**, **Organik** | 03 | [USULAN] |
| D18 | Suhu saat punchline | Angka suhu **tidak** ditampilkan (daftar bab disembunyikan); *rewind* terbaca lewat warna dan retakan | 03, 04 | [USULAN] |
| D19 | Desain tumbler | Baja tahan karat 500 ml, *powder coat* teal `#0F8B8D` matte, tutup berpegangan, **tanpa logo** | 03, 07 | [USULAN] |
| D20 | Ilustrasi artikel | 12 SVG gaya datar-geometris bergrain, palet global. Alat bantu AI boleh dipakai dan **wajib dicantumkan di About** | 07 | [USULAN] |
| D21 | Rute | `/`, `/about`, `/konten`, `/konten/:slug`, `/contact`, `*` (404) | 05, 06 | [USULAN] |
| D22 | Tier kualitas | HIGH/MEDIUM/LOW otomatis, bisa dipaksa lewat `?q=low` | 09 | [USULAN] |
| D23 | Konfigurasi gestur loop | `GAIN=1/1400`, `REST_DELAY=90ms`, `DECAY=0,12` | 04 | [DISEPAKATI sebagai titik awal, PROTOTIPE] |
| D24 | Kunci tim | Email/akun tim masih **placeholder** di `src/content/site.ts` | 05 | [Menunggu data tim] |

---

## 6. Templat `CLAUDE.md` (letakkan di akar repo)

```markdown
# CLAUDE.md: Re:bottle

Proyek: situs scrollytelling "Re:bottle" untuk Techno Versary Vol. II (Web Design Competition).
Bahasa komunikasi dengan tim: **Bahasa Indonesia**. Kode dan nama berkas: Inggris. Komentar penting: Indonesia.

## Wajib sebelum mengubah kode
1. Baca `docs/00_INDEX_DAN_ATURAN_KERJA.md` (legenda status, prinsip, aturan konflik).
2. Baca `docs/KONSEP_LENGKAP_RE-BOTTLE_v2.md` (sumber kebenaran).
3. Baca dokumen yang relevan dengan tugas (lihat urutan baca di dokumen 00).
4. Ambil tugas berikutnya dari `docs/10_TASK_BREAKDOWN.md`. Centang setelah selesai dan lulus kriteria.

## Aturan keras
- Jangan mengubah hal bertanda [DISEPAKATI] tanpa perintah tim.
- Tidak ada re-render React per frame. Mesin cerita imperatif (GSAP ticker).
- Seluruh visual cerita hanya membaca `shown` dari `StoryEngine`. Dilarang membaca `scrollY` untuk cerita.
- Tidak ada pustaka/komponen berbayar, template, atau tema premium.
- Tidak ada warna hangat selain kilau amber Bab 9. Tidak ada merah/oranye di Babak I.
- Animasi DOM hanya `transform` dan `opacity`.
- Angka fakta hanya dari `src/content/facts.ts` yang berstatus `verified: true`.
- Fitur yang dibatalkan tidak boleh dibangun (daftar di docs/00 bagian 4 poin 7).
- Semua nilai gaya dari token (`src/styles/tokens.css`). Dilarang menaruh hex/ukuran bebas di komponen.
- Hormati `prefers-reduced-motion`, fokus keyboard, `inert` pada panel menu.

## Perintah
- `npm install` · `npm run dev` · `npm run build` · `npm run preview` · `npm run test` · `npm run lint` · `npm run typecheck`
- Uji performa: `npm run build && npm run preview` lalu Lighthouse (mode mobile + desktop).

## Saat ragu
Pilih opsi paling konservatif, catat di `docs/DECISIONS.md`, lanjut. Jangan berhenti untuk bertanya hal kecil. Tanya tim untuk hal yang mengubah konsep.

## Definition of Done tiap tugas
Lihat `docs/10_TASK_BREAKDOWN.md` (bagian 1).
```

---

## 7. Daftar anti-pola (hal yang paling sering salah)

| Anti-pola | Mengapa salah | Yang benar |
|---|---|---|
| `useState` untuk `shown` | Re-render 60×/detik | Ref + subscriber imperatif |
| Memakai `ScrollTrigger` untuk memetakan tiap bab ke DOM langsung | Dua sumber kebenaran | Satu `StoryEngine`, `ScrollTrigger` hanya jika perlu `pin` (tidak perlu) |
| Menganimasikan `width`, `top`, `box-shadow`, `filter` besar | Layout/paint mahal | `transform`, `opacity`, variabel CSS terbatas |
| Memuat Three.js di semua halaman | Bundel besar | `React.lazy` hanya di rute Home |
| Memakai `backdrop-filter` besar di atas kanvas | Sangat berat di HP | Panel semi-transparan statis |
| Menaruh angka statistik "yang rasanya benar" | Hoaks/gugur penilaian | Placeholder `[DATA]` sampai terverifikasi |
| Mengunci `100vh` | Bar alamat HP | `100dvh` / `svh` |
| `transition` aktif saat reset loop | Terlihat animasi | Kelas `snap` |
| Mendengarkan `wheel` dengan `passive: false` di mana-mana | Merusak gulir | `passive: true` kecuali saat menahan End/PageDown |
| Menggulir halaman asli saat panel menu terbuka | Cerita bergeser | Kunci gulir + `inert` |
