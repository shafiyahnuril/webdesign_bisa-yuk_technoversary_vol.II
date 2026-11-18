# 12 · PIPELINE KERJA DAN PEMBAGIAN TUGAS (versi 3)

> **Status:** [USULAN]. Menggantikan versi 60/40 dan 70/30. Melengkapi `10_TASK_BREAKDOWN.md` (ID tugas sama). Tanpa tanggal.
> **Tiga aturan dari tim:**
> 1. **QA tidak dijadikan tugas per orang.** Dikerjakan **bersama di akhir**, dan **bersifat opsional** (bagian 8).
> 2. **Seluruh komponen Home dikerjakan oleh 1 orang (Pihak A)**: 2D, 3D, UI, engine, audio, semuanya. Tidak dibagi.
> 3. **Aset 2D dikerjakan Pihak A.**
>
> **Akibat hitungan:** dengan tiga aturan ini, bobot tugas menjadi **A ≈ 86% dan B ≈ 14%** (bobot kesulitan, total 284 setelah QA dikeluarkan). Rasio 70/30 **tidak bisa dicapai** tanpa melanggar aturan 2. Bagian 7 memberi opsi menambah tugas B (non-Home) bila ingin mendekati 70/30. **Keputusan ada pada tim.**

---

## 1. Siapa memegang apa

| | **Pihak A · "Home & Aset"** | **Pihak B · "Halaman Lain & Konten"** |
|---|---|---|
| Cakupan | **Seluruh Home**: engine, 3D, shader, audio, navbar, menu, penanda bab, kursor, surat, CTA, StaticStory, overlay. **Seluruh aset 2D** (sampul artikel, panel statis, favicon/OG, retak latar). Performa | Halaman About, Konten (Galeri Artikel), Artikel, Contact, 404; naskah, fakta, 12 artikel, data tim, README, deploy, font |
| Sifat | Berat, saling terkait, banyak penyetelan | Ringan, independen |
| Bobot | **243 poin · 59 tugas · ≈ 85,6%** | **41 poin · 20 tugas · ≈ 14,4%** |

Alasan aturan 2 sangat kuat: seluruh Home berbagi satu sumber `shown`, satu ratchet, satu kanvas, dan satu sistem palet. Satu orang memegangnya menghindari konflik gaya, jeda, dan ritme.

---

## 2. Kepemilikan folder (anti-konflik)

> **Pemetaan ke struktur 06 (sumber kebenaran folder):** `src/pages/home/**` pada tabel di bawah = `src/routes/HomePage.tsx` + `src/components/story/**`; `src/components/chrome/**` = `src/components/shell/**` (Navbar, MenuPanel, Scrim, CursorRing, AudioToggle) dan `ChapterMarker`/`LetterCard` di `src/components/story/**`; halaman non-Home = `src/routes/{About,Content,Article,Contact,NotFound}Page.tsx` + `src/components/content/**`; `src/components/shared/**` = `src/components/ui/**`. Bila ada selisih, ikuti dokumen 06.

| Folder / berkas | Pemilik |
|---|---|
| `src/engine/**`, `src/stage/**`, `src/audio/**`, `src/lib/**`, `src/hooks/**` | **A** |
| `src/pages/home/**` (semua komponen Home) | **A** |
| `src/components/chrome/**` (Navbar, MenuPanel, Scrim, ChapterMarker, BrandMark, AudioToggle, LetterCard, CursorRing) dan `src/components/static/**` | **A** (B hanya **memakai** `Navbar`, tidak mengubahnya) |
| `src/app/**`, `vite.config.ts`, `package.json`, `tokens.generated.css`, CI | **A** (B boleh commit kecil terpisah untuk deploy) |
| `public/img/**`, `public/og/**`, favicon (semua aset 2D) | **A** |
| `src/pages/about/**`, `konten/**`, `artikel/**`, `contact/**`, `notfound/**` | **B** |
| `src/components/shared/**` (FactBlock, SourceList, FilterPill, ArticleCard, ArticleBody, dll.) | **B** |
| `src/content/**` (`copy.ts`, `facts.ts`, `articles/`, `site.ts`, `credits.ts`) | **B** menulis; A membaca |
| `docs/**` (BOARD, DECISIONS, README) | **B** menjaga; A menambah catatan |
| `docs/CHANGELOG_PARAMETER.md`, `docs/PERF_LOG.md` | **A** |

---

## 3. Titik sentuh A ↔ B (sangat sedikit)

| Titik | Arah | Aturan |
|---|---|---|
| `copy.ts` dan `facts.ts` | B → A | A menyiapkan **placeholder dengan kunci final** di awal; B mengganti isi. Kunci tidak berubah tanpa PR kontrak |
| Sampul artikel `public/img/articles/cover-xx.svg` | A → B | A membuat placeholder (kotak warna) di awal, lalu menggantinya dengan sampul final. `ArticleCard` B hanya membaca path tetap |
| `<Navbar variant="static" />` dan token | A → B | A menyediakan di awal (T1.7 versi minimal, token, rute); B memakainya di halaman non-Home |
| `credits.ts` | B menulis | A mengirim daftar aset/lisensi (nama, sumber) ke B untuk dicatat |

**B tidak menyentuh Home. A tidak menulis konten halaman lain.** Tidak ada serah-terima lain.

### Paket awal dari A (satu kali, prasyarat B; dikerjakan di awal Fase 0–1)
Repo + token + rute (T0.1, T0.3, T0.5, T0.7), `Navbar` minimal dengan varian statis, placeholder `copy.ts`/`facts.ts`/sampul. Setelah ini B bekerja sendiri sampai selesai.

---

## 4. Pembagian tugas (ID dari dokumen 10)

### Pihak A · 243 poin · 59 tugas

| Fase | Tugas |
|---|---|
| F0 | T0.1 repo (2) · T0.3 token (3) · T0.5 rute (2) · T0.7 hooks (2) |
| F1 | T1.1 timeline (3) · **T1.2 story-engine (8)** · T1.3 input (5) · T1.4 palette+cues (5) · T1.5 "Re:" (3) · T1.6 ChapterMarker (3) · T1.7 Navbar (5) · T1.8 MenuPanel (5) · **T1.9 loop gesture (8)** · T1.10 CursorRing (3) · T1.11 rangka 11 blok (3) · T1.12 text gap+melt (3) · T1.13 Overlays (2) |
| F2 | T2.2 navbar statis (2) |
| F3 | T3.1 stage (5) · T3.2 QualityManager (3) · **T3.3 botol (8)** · T3.4 tekstur (3) · T3.5 SceneDirector (5) · T3.6 hero (5) · T3.7 capture poster (2) · T3.8 debug (2) |
| F4 | T4.1 tangan (5) · T4.2 Bab 2 (5) · **T4.3 WaterSystem (8)** · T4.4 kota/jembatan (5) · T4.5 Bab 3 (5) · T4.6 laut (5) · T4.7 Bab 4 (3) · **T4.8 partikel+shatter (8)** · T4.9 Bab 5 (5) · T4.10 ikan+piring+Bab 6 (5) · T4.11 isyarat suhu (3) |
| F5 | T5.1 punchline (3) · T5.2 bins (3) · **T5.3 Bab 7+kilas (8)** · T5.4 LetterCard (2) · T5.5 Bab 8 (5) · T5.6 Bab 9 (5) · T5.7 produk+rak+tumbler (5) · **T5.8 Bab 10 (8)** · T5.9 CTAClosing (2) |
| F6 | T6.1 tuning ratchet/loop (3) · T6.2 tuning panjang bab (2) · T6.3 retak latar SVG + filter melt (3) |
| F7 | T7.1 audio engine (5) · T7.2 synths (5) · T7.3 profil audio (3) |
| F8 (aset 2D) | T8.4 12 sampul SVG (5) · T8.5 11 panel statis (3) · T8.6 favicon/OG/wordmark/404 (1) |
| F9 | T9.1 StaticStory (3) · T9.2 pemilih mode (2) |
| F10 | T10.1 bundel (3) · **T10.2 profil FPS (5)** |
| F11 | T11.4 demo + cadangan (2) |

### Pihak B · 41 poin · 20 tugas

| Fase | Tugas |
|---|---|
| F0 | T0.2 docs (1) · T0.4 font (2) · T0.6 deploy (2) |
| F2 | T2.1 shell halaman non-Home (3) · T2.3 About (3) · T2.4 Konten (3) · T2.5 ParticleField (2) · T2.6 cursor di Konten, memakai komponen A (2) · T2.7 Artikel (3) · T2.8 Contact (3) · T2.9 404 (1) |
| F8 (konten) | T8.1 fakta (3) · T8.2 naskah (3) · T8.3 12 artikel (5) · T8.7 data tim (1) · T8.8 credits (1) |
| F9 | T9.4 SEO/noscript (1) |
| F11 | T11.1 README (1) · T11.5 pengumpulan (1) |

> **Catatan:** T2.2 (navbar statis) dan T2.6 (kursor) dipecah agar komponennya tetap milik A; B hanya memasangnya di halamannya.

---

## 5. Pipeline kerja

### 5.1 Per tugas

```
1 AMBIL   → ambil dari docs/BOARD.md, tulis nama + ID
2 BACA    → dokumen terkait + CLAUDE.md + 00 (prinsip)
3 SINKRON → git pull --rebase origin main (tanpa branch)
4 BANGUN  → hanya di folder milik sendiri; konstanta ke token/copy
5 UJI     → typecheck, lint, test; cek keyboard + reduced-motion
6 BUKTI   → tangkapan layar/rekaman 10 dtk; A: catatan FPS untuk tugas 3D
7 COMMIT  → bertahap per bidang, satu kalimat; catat bagian dok, cara uji, bukti, deviasi di BOARD
8 PUSH    → push ke main setelah verifikasi hijau
9 TINJAU  → pihak lain meninjau ringan commit di main (kontrak, folder, token); lalu centang tugas, catat keputusan
```

### 5.2 Urutan jalur A (rekomendasi, mengikuti ketergantungan teknis)

```
Fondasi → Engine + rangka Home (placeholder) → Panggung 3D → Babak I → Punchline + Babak II
        → Efek + loop final → Audio → Aset 2D + StaticStory → Performa → Demo
```
Aset 2D (T8.4–T8.6) bisa disisipkan kapan pun A butuh jeda dari 3D; sampul diperlukan oleh halaman Konten, jadi **placeholder dulu**, final belakangan.

### 5.3 Jalur B (mandiri)

```
Font/docs/deploy → Shell non-Home → About → Konten + ArticleCard → Artikel → Contact → 404
Fakta → Naskah → 12 artikel → data tim/credits → SEO → README → Pengumpulan
```
B tidak menunggu A setelah paket awal. Bila halaman butuh sampul/Navbar, B memakai placeholder A.

### 5.4 Aturan git

- **Kesepakatan tim: tanpa pull request dan tanpa branch fitur.** Semua kerja langsung di `main`.
- `main` selalu bisa dijalankan: push hanya setelah typecheck, lint, test, build hijau.
- Satu sesi/gelombang = satu tugas, di-commit bertahap per bidang lalu push sekali.
- CODEOWNERS memetakan folder bagian 2 ke pemilik.
- `git pull --rebase origin main` sebelum setiap push; tidak pernah `push --force`.
- Perubahan di berkas milik pihak lain: satu commit `chore(kontrak):` terpisah, kecil, dan diberi tahu lebih dulu.
- Commit: satu kalimat, Conventional Commits berbahasa Indonesia (`feat(navbar): ...`).

### 5.5 Daftar tinjauan (commit di `main`)

- [ ] Sesuai dokumen; tidak melanggar 00 §4.
- [ ] Tidak ada warna/angka ajaib di luar token.
- [ ] Tidak ada re-render React per frame (Home).
- [ ] Reduced-motion dan fokus keyboard ditangani.
- [ ] Aset baru tercatat untuk `credits.ts`.
- [ ] Tidak menyentuh folder pihak lain.

### 5.6 Pipeline aset dan konten

```
3D prosedural: spesifikasi 07 §3 → kode → ?debug → dimensi → merge        (A)
3D GLB (opsional): prompt 07 §5 → olah (decimate, Draco) → catat kredit   (A)
SVG: prompt 07 §6 → rapikan (SVGO) → cek kontras/ukuran → catat kredit    (A)
Fakta: sumber primer → facts.ts (verified:true) → tinjau silang           (B)
Naskah: 11 §2–3 → copy.ts → tinjau (aturan 11 §1)                         (B)
Artikel: kerangka 11 §4 → tulis → ≥ 2 sumber berbeda penerbit → tinjau    (B)
```

### 5.7 Sinkronisasi

- Sinkron 15 menit **1–2× seminggu**; fokus pada perubahan kontrak.
- `docs/BOARD.md` adalah satu-satunya papan tugas (`ID | Tugas | Pemilik | Status | Commit`).
- Keputusan baru: `docs/DECISIONS.md` di hari yang sama.

---

## 6. Hasil bobot

| | Poin | Persen | Tugas |
|---|---|---|---|
| A | 243 | 85,6% | 59 |
| B | 41 | 14,4% | 20 |
| **Total** | **284** | 100% | 79 |

(Tugas QA yang dikeluarkan dari hitungan: T2.10, T6.4, T6.5, T7.4, T9.3, T10.3–T10.7, T11.2, T11.3 = 25 poin; lihat bagian 8.)

---

## 7. Opsi menyeimbangkan agar mendekati 70/30 (TANPA melanggar aturan 2)

Tugas berikut **bukan komponen Home** sehingga boleh dipindah ke B bila tim ingin. Tidak wajib; tiap opsi bisa dipilih sendiri.

| Opsi | Tugas dipindah ke B | Poin | Bobot B jadi | Catatan risiko |
|---|---|---|---|---|
| **O1 Pondasi proyek** | T0.1 repo, T0.3 token + generator, T0.5 rute, T0.7 hooks | +9 | 50 (17,6%) | Ringan, tetapi **paling awal dan menjadi prasyarat A**; B harus mengerjakannya duluan dan menyerahkan ke A |
| **O2 Modul audio** | T7.1 audio engine, T7.2 synths, T7.3 profil audio | +13 | 63 (22%) | Modul punya kontrak jelas (`setParams(shown, chapter)`); butuh bobot teknis Web Audio. A hanya memanggil |
| **O3 Perkakas & performa** | T3.7 skrip capture, T3.8 overlay debug, T10.1 analisis bundel, T10.2 profil FPS | +12 | 75 (26%) | Pengukuran oleh B, perbaikan tetap oleh A |

O1+O2+O3 bersama membawa B ke ≈ **26% (75 poin)** dan A ke ≈ **74%**. **Hitungan ini tidak mengubah aturan 2:** semua komponen Home tetap hanya di A.

> Catatan: audio menyentuh Home secara konsep (mengikuti `shown`). Jika tim menganggap audio "bagian Home", jangan ambil O2.

---

## 8. QA bersama di akhir (opsional)

Bila waktu tersisa, dikerjakan **berdua** dengan menggunakan `09_PERFORMANCE_AND_QA.md` sebagai daftar periksa. **Tidak dihitung sebagai bobot pihak mana pun.**

| Tugas | Isi singkat | Dok. |
|---|---|---|
| T2.10 | Tes komponen halaman non-Home | 06 §13 |
| T6.4 | Audit kontras di titik transisi | 02 §9 |
| T6.5 | Uji loop 5× (memori, state bersih) | 09 §6 |
| T7.4 | Uji dengar audio | 08 §8 |
| T9.3 | Audit aksesibilitas (axe, keyboard, zoom 200%) | 09 §8.8 |
| T10.3 | Lighthouse semua rute | 09 §1 |
| T10.4 | Uji lintas peramban/perangkat | 09 §7 |
| T10.5 | E2E Playwright | 04 §15 |
| T10.6 | Audit kejujuran konten (`facts.ts` ↔ UI) | 09 §8.9 |
| T10.7 | Perbaikan bug P0/P1 | 09 §9 |
| T11.2 | Hygiene repo | 09 §10 |
| T11.3 | Uji instal di mesin bersih | 09 §10 |

**Minimum yang tetap disarankan walau QA opsional** (karena memengaruhi penilaian): T10.6 (tidak ada angka tanpa sumber), T11.3 (proyek bisa dijalankan juri), dan pemeriksaan cepat `npm run build` + buka semua rute.

---

## 9. Persiapan lomba

| Aktivitas | A | B |
|---|---|---|
| Demo final (20 menit) | Mengoperasikan Home, menjelaskan teknis dan performa | Menjelaskan konsep, konten, Galeri Artikel, Contact |
| Tanya jawab | Teknis & performa | Konsep, konten, UX |
| Cadangan | `?q=low`, rekaman layar | Video demo, slide pendamping |
