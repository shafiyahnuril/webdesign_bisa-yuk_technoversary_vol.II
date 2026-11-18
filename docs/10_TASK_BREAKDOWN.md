# 10 · PEMECAHAN TUGAS (TASK BREAKDOWN)

> **Seluruh cakupan harus terwujud** [DISEPAKATI]: Inti, Plus, Wow, dan Tambahan (konsep bagian 21.1). Dokumen ini **tidak memuat tanggal atau jadwal**. Urutan mengikuti **ketergantungan teknis**: mesin `progress` dulu, lalu adegan 3D, efek, Babak II dan loop, lalu audio [DISEPAKATI].
> Dua jalur kerja dapat berjalan paralel (tim 2 orang): **Jalur A** (engine, 3D, audio) dan **Jalur B** (halaman, konten, aset 2D, QA). Penugasan nama = bebas.
> Cara memakai: kerjakan dari atas ke bawah dalam satu fase; centang `[x]` setelah **Selesai bila** terpenuhi. Catat keputusan di `docs/DECISIONS.md` dan nilai parameter di `docs/CHANGELOG_PARAMETER.md`.

> **Pembaruan pembagian (lihat `12_PIPELINE_DAN_PEMBAGIAN_TUGAS.md`):** tugas QA (T2.10, T6.4, T6.5, T7.4, T9.3, T10.3–T10.7, T11.2, T11.3) bersifat **opsional dan dikerjakan bersama di akhir**, tidak diberikan ke satu pihak. Seluruh komponen Home dan aset 2D dikerjakan oleh **Pihak A**.

---

## 1. Definisi selesai (berlaku untuk SEMUA tugas)

Sebuah tugas baru boleh dicentang bila:
1. **Perilaku sesuai spesifikasi** di dokumen terkait (cantumkan bagian di PR/commit).
2. `npm run typecheck` dan `npm run lint` bersih. Tes terkait lulus (`npm run test`).
3. **Tidak ada re-render React per frame** (untuk tugas yang menyentuh Home).
4. Tidak melanggar prinsip di `00` bagian 4 (palet, hanya `shown`, tanpa fitur dibatalkan).
5. `prefers-reduced-motion` dan fokus keyboard ditangani bila relevan.
6. Anggaran performa fase terkait tidak terlampaui (09 bagian 1 dan 4).
7. Nilai konstan diletakkan di `timeline.ts`/`tokens.ts`/`profiles.ts` (tidak tersebar).
8. Aset baru tercatat di `credits.ts`.
9. Tangkapan layar atau rekaman singkat dilampirkan untuk tugas visual.

---

## 2. Peta ketergantungan

```
F0 Fondasi ──► F1 Mesin + Rangka Home (placeholder) ──┬─► F3 Panggung 3D ──► F4 Babak I ──► F5 Punchline+Babak II ──► F6 Efek dan Loop final
        │                                               │                                              │
        └─► F2 Shell + Halaman non-Home ◄───────────────┘ (paralel)                                    ├─► F7 Audio
                       │                                                                               │
                       └─► F8 Konten + Aset 2D (paralel sejak F0) ─────────────────────────────────────┴─► F9 Aksesibilitas + Fallback ─► F10 Performa + QA ─► F11 Pengumpulan + Demo
```

---

## FASE 0 · FONDASI

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☑ T0.1 | Inisialisasi repo: Vite + React + TS strict, ESLint, Prettier, Vitest, struktur folder 06 bagian 2, `.gitignore`, `.env.example` | `npm run dev/build/test/lint` jalan di mesin bersih | 06 | A |
| ☑ T0.2 | Salin `docs/`, tulis `CLAUDE.md`, `DECISIONS.md`, `CHANGELOG_PARAMETER.md`, `PERF_LOG.md` (kosong dengan templat) | Berkas ada dan terisi templat | 00 | A |
| ☑ T0.3 | Token: `lib/tokens.ts` (PALETTE, CUES, LENGTHS, warna) + `gen-tokens.mjs` → `tokens.generated.css`; `typography.css`, `base.css` | Variabel CSS dan TS identik; skrip berjalan di `predev/prebuild` | 02 | A |
| ☑ T0.4 | Font Fontsource (4 keluarga, subset latin), preload kritis, fallback metrik | Font tampil tanpa CLS; ukuran sesuai 09 bagian 1.1 | 02 | B |
| ☑ T0.5 | `App.tsx`: `HashRouter`, rute, `Suspense`, `AppShell` kosong, `HomePage` lazy placeholder | Semua rute dapat dibuka; Home di chunk terpisah | 06 | A |
| ☑ T0.6 | Workflow GitHub Pages `deploy.yml` | Push ke `main` men-deploy; URL berfungsi | 06 | B |
| ☑ T0.7 | `hooks/`: `useReducedMotion`, `useMedia`, `useSignal`, `useDocumentMeta` | Uji unit dasar lulus | 06 | A |

---

## FASE 1 · MESIN CERITA + RANGKA HOME (tanpa 3D, dengan placeholder)

> Tujuan: seluruh **interaksi** bisa dites sebelum satu pun objek 3D ada (11 panel warna + teks kasar).

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T1.1 | `engine/timeline.ts`: `LENGTHS_VH`, `STARTS`, `PUNCH`, `segmentAt`, `chapterAt`, `temperatureAt`, `babakAt` + tes unit | Tes batas (0, 0,0625, `PUNCH.to`, 1) lulus | 03 §2 | A |
| ☐ T1.2 | `engine/story-engine.ts`: scroller tinggi, `target`, ratchet berbasis `dt`, `pause/resume/reset`, `onFrame`, `onChapter` | Tes: laju ≤ `MAX_RATE`, dua arah, tidak melompat; React tidak re-render | 04 §2–3 | A |
| ☐ T1.3 | `engine/input.ts` + pencegatan End/Home; scrollbar tersembunyi; `overscroll-behavior` | Menyeret/End/Home tidak melewati bab; tidak ada bounce | 04 §3 | A |
| ☐ T1.4 | `palette.ts` (`applyPalette` dengan aturan dataran 70/30) + `cues.ts` | Latar berubah sesuai tabel; tes `smoothstep` di batas | 02 §1.2, §5 | A |
| ☐ T1.5 | `updateRe` + `data-re`, gaya "Re:" pudar/menyala, `BrandMark` | Menyala di `PUNCH.to`, padam saat mundur; transisi 0,9 s | 04 §9, 02 §2.5 | A |
| ☐ T1.6 | `ChapterMarker` (dua `<ol>`, `data-view`, kotak penanda, suhu) | Berganti Babak I → none → II; hanya-baca; histeresis | 04 §8 | A |
| ☐ T1.7 | `Navbar` (Home): timeline mengempis, dua ambang, tombol bulat | Tidak berkedip; tautan hidden keluar dari Tab; HP hanya burger | 04 §5 | A |
| ☐ T1.8 | `MenuPanel`+`Scrim`+focus trap+`inert`+scroll lock | Semua kriteria 04 §6 lulus; cerita tidak bergeser | 04 §6 | A |
| ☐ T1.9 | `LoopGesture` + `LoopDome` + `ScrollHint (loop)` + `snap` | Uji gestur 04 §7.5 di mouse/trackpad/HP; hero reset identik | 04 §7 | A |
| ☐ T1.10 | `CursorRing` (Home) | 60/120 Hz sama; hanya `pointer: fine`; hilang di input | 04 §10 | A |
| ☐ T1.11 | `StoryStage` rangka: 11 blok `ChapterText` placeholder (judul, isi dummy, counter), `ScenarioLabel`, `ScrollHint (start)`, `HeroTitle` | Seluruh alur 10 bab + punchline dapat digulir dan loop | 03, 05 §2 | A |
| ☐ T1.12 | Aturan jeda teks (text gap) pada semua bab; `SplitHeadline` dan `--melt` | Tidak ada teks saat warna bergeser; melt terbaca | 02 §2.4, 03 §1.3 | A |
| ☐ T1.13 | Overlay `Overlays`: butiran, vignette (CSS), retak latar (placeholder) | Nilai mengikuti `CUES` | 02 §5 | B |

---

## FASE 2 · SHELL DAN HALAMAN NON-HOME

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T2.1 | `AppShell`, `SkipLink`, `RouteTransition`, `RouteAnnouncer`, `Seo`, tema per halaman (`data-page`) | Fokus ke `<h1>` setelah rute; judul tab benar | 05 §1, 04 §13 | B |
| ☐ T2.2 | Navbar statis (menempel, latar muncul saat gulir > 8 px) di non-Home | Kontras lolos di semua tema | 05 §1.1 | B |
| ☐ T2.3 | `AboutPage` (7 bagian), `FactBlock`, `TempDiagram`, `SourceList`, `LicenseTable`, `TeamGrid`, `ClosingStrip` | Semua bagian tampil dengan data placeholder | 05 §3 | B |
| ☐ T2.4 | `ContentPage`: `FilterPill`, `ArticleGrid`, `ArticleCard`, URL query | Filter 2 kelompok + hitungan ikut berubah; 12 kartu dummy | 05 §4 | B |
| ☐ T2.5 | `ParticleField` (kanvas 2D) | 40/16 partikel; berhenti saat tab hidden | 05 §4.5 | B |
| ☐ T2.6 | `CursorRing` aktif di `#/konten` + label "Baca" | Sesuai 04 §10 | 04 | A |
| ☐ T2.7 | `ArticlePage` + `ArticleBody` + `NextArticle` | Template 05 §5.1; "Artikel berikutnya" 12→1 | 05 §5 | B |
| ☐ T2.8 | `ContactPage` + `ContactForm` + Formspree + `mailto` cadangan + status | Kirim nyata berhasil; validasi dan galat | 05 §6 | B |
| ☐ T2.9 | `NotFoundPage` | Rute tak dikenal ke 404 | 05 §7 | B |
| ☐ T2.10 | Tes komponen: `FilterPill`, `ContactForm`, `MenuPanel` | Lulus | 06 §13 | B |

---

## FASE 3 · PANGGUNG 3D (fondasi)

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T3.1 | `stage/stage.ts`: renderer (alpha), kamera, `RoomEnvironment` PMREM, lampu, resize, `viewOffset` HP, context loss | Kanvas transparan di atas latar CSS; tidak ada kebocoran | 06 §4 | A |
| ☐ T3.2 | `QualityManager` + `?q=` + penurunan otomatis | Perubahan tier terlihat; tidak naik otomatis | 06 §5 | A |
| ☐ T3.3 | `objects/bottle.ts` (lathe, tutup, cairan+clipping plane, label, kekeruhan, retak, serpihan shader) | Parameter `turbid/crack/break/level` bekerja; botol paling berkilau | 03 §3.1, 07 §3.1 | A |
| ☐ T3.4 | `textures/*` prosedural: `T-LABEL`, `T-CRACK`, `T-CONTACT`, `T-GRAIN` | Tekstur dibuat di runtime; tanpa berkas | 07 §4 | A |
| ☐ T3.5 | `SceneDirector` + antarmuka `Scene` + pra-muat/dispose | Hanya scene ±0,06 aktif; memori stabil | 06 §4 | A |
| ☐ T3.6 | Scene **B1/hero**: botol, turntable, judul di belakang, poster hero | Hero sesuai 03 §4; poster tampil sebelum 3D siap | 03 §4, 09 §2 | A |
| ☐ T3.7 | `scripts/capture.mjs` (poster hero + tangkapan bab) | `hero-poster.webp` ≤ 60 KB dihasilkan | 07 §7 | B |
| ☐ T3.8 | Overlay debug (`?debug`, `?freeze`, `?q`) | FPS/calls/tris tampil; tidak ada di build produksi | 06 §10 | A |

---

## FASE 4 · BABAK I (adegan 3D)

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T4.1 | `objects/hand.ts` + pose (OPEN/GRIP/RELEASE/THROW) | Tidak menembus botol; pose halus | 03 §3.2, 07 §3.2 | A |
| ☐ T4.2 | Scene **B2** Sekali Pakai (minum, level cairan, lempar, `TimeRing`) | Sesuai 03 §5 | 03 §5 | A |
| ☐ T4.3 | `WaterSystem` (mode sungai/laut/malam/bersih) + shader | Mode berganti mulus; HIGH/LOW segmen | 03 §3.4 | A |
| ☐ T4.4 | Objek kota, jembatan, tanggul, sampah (instanced) | Anggaran draw call B3 terpenuhi | 07 §3.10 | A |
| ☐ T4.5 | Scene **B3** Tersesat (paralaks, kolong jembatan, counter 450) | Sesuai 03 §6; counter berhenti tepat | 03 §6 | A |
| ☐ T4.6 | Laut Gerstner, matahari, dermaga, karang, menyelam | Tanpa lompatan saat tembus permukaan | 03 §7 | A |
| ☐ T4.7 | Scene **B4** Lautan | Sesuai 03 §7 | 03 §7 | A |
| ☐ T4.8 | `Particles` (shader) + serpihan botol (shatter) | `uBreak` satu draw call; HP 800 | 03 §3.3 | A |
| ☐ T4.9 | Scene **B5** Terurai (retak tumbuh, pecah, partikel, orbit) | Pecah jelas di `t≈0,5` | 03 §8 | A |
| ☐ T4.10 | `objects/fish.ts`, `plate.ts` + Scene **B6** (alir ke ikan, match cut, top-down, counter X) | *Match cut* halus; ≥ 50% ruang kosong | 03 §9 | A |
| ☐ T4.11 | Isyarat suhu penuh: shimmer, goyangan kamera, kekeruhan botol, lampu per bab | Sesuai tabel 02 §5 | 02 §5 | A |

---

## FASE 5 · PUNCHLINE DAN BABAK II

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T5.1 | Scene **Punchline** (fade, *rewind*, teks kata-per-kata, hold ±76 vh) | Terasa hening; rewind terbaca | 03 §10 | A |
| ☐ T5.2 | `objects/bins.ts` + `T-BINLABEL` + tutup berengsel | Label terbaca; animasi tutup | 07 §3.5 | A |
| ☐ T5.3 | Scene **B7** (7a–7d) + **jendela kilas** (*scissor*) + `TimeRing` cermin | "Re:" menyala tepat; kilas ≤ 2 ms/frame | 03 §12 | A |
| ☐ T5.4 | `LetterCard` (Caveat, per kata) dan kartu surat Babak II | Kontras lolos; muncul per kata | 02 §6.12 | B |
| ☐ T5.5 | `objects/conveyor.ts` + Scene **B8** (pemilah, teman hilang, lorong cuci) | Sesuai 03 §13 | 03 §13 | A |
| ☐ T5.6 | `objects/processline.ts` + Scene **B9** (4 stasiun, amber ≤ 4%, `StationLabels`) | Inversi ink tidak menimpa teks | 03 §14 | A |
| ☐ T5.7 | `objects/products.ts`, `shelf.ts`, `tumbler.ts`, `tote.ts` | Dimensi sesuai 07 §3.8–3.9; tanpa logo | 07 | A |
| ☐ T5.8 | Scene **B10** (10a–10e, timeline kamera, sorot, redup produk) | Tumbler terpisah dan paling menonjol | 03 §15 | A |
| ☐ T5.9 | `CTAClosing` + `(Terus gulir)` + sambungan ke loop | Muncul setelah ajakan; loop bekerja dari Bab 10 | 03 §15, 04 §7 | A |

---

## FASE 6 · EFEK DAN FINALISASI HOME

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T6.1 | Tuning `GAIN/REST_DELAY/DECAY/MAX_SPEED_VH/CHASE` di mouse, trackpad, HP | Catat di `CHANGELOG_PARAMETER.md`; 04 §7.5 lulus | 04 | A |
| ☐ T6.2 | Tuning `LENGTHS_VH` (jeda baca tiap bab) | Setiap teks dapat dibaca nyaman; punchline cukup lama | 03 §2 | A+B |
| ☐ T6.3 | Retak latar (SVG), tekstur butiran final, filter SVG melt | Terlihat bagus di tier HIGH, hilang di LOW | 02 | B |
| ☐ T6.4 | Pemeriksaan kontras di titik transisi (semua bab) | Tidak ada gagal kontras (alat kontras) | 02 §9 | B |
| ☐ T6.5 | Pemeriksaan "5 putaran loop" (memori, state bersih) | Tidak ada kebocoran | 09 §6 | A |

---

## FASE 7 · AUDIO

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T7.1 | `audio-engine.ts` (graf, master, compressor, duck, fade) + `AudioToggle` | Default mati; tidak ada pop | 08 §2, 04 §11 | A |
| ☐ T7.2 | `synths.ts` (Drone, NoiseBed, Pulse, Tick, Swell, Note) | Unit dengar-uji | 08 §3 | A |
| ☐ T7.3 | `profiles.ts` 11 segmen + crossfade + pemicu SFX lintas `t` | Sesuai tabel 08 §4–5 | 08 | A |
| ☐ T7.4 | Uji audio (08 §8) | Semua centang | 08 | A |

---

## FASE 8 · KONTEN DAN ASET 2D (mulai paralel sejak Fase 0)

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T8.1 | **Verifikasi fakta**: isi `facts.ts` dari sumber resmi (daftar di 11 §6) | Setiap entri punya sumber, tahun, `verified: true` | 11 | B |
| ☐ T8.2 | Naskah final 11 blok cerita + 4 surat (11 §2–3) | Disetujui tim; tanpa klaim sebab-akibat langsung | 11 | B |
| ☐ T8.3 | Tulis 12 artikel (400–600 kata, sumber) | Sesuai templat 05 §5.3 | 11 §4 | B |
| ☐ T8.4 | 12 sampul SVG | Lolos daftar periksa 07 §11 | 07 §6.2 | B |
| ☐ T8.5 | 11 panel statis SVG | Lolos daftar periksa 07 §11 | 07 §6.3 | B |
| ☐ T8.6 | Favicon, OG, wordmark, 404 | Lolos | 07 §6.4 | B |
| ☐ T8.7 | Data tim + email/akun di `site.ts`; teks About, Contact | Placeholder diganti | 11 §5 | B |
| ☐ T8.8 | `credits.ts` lengkap (font, lib, metode aset, penggunaan AI bila ada) | About menampilkannya | 07 §10 | B |

---

## FASE 9 · AKSESIBILITAS DAN CADANGAN

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T9.1 | `StaticStory` + `StaticPanel` ×11 + pembukaan berurutan + "Mulai dari awal" | Reduced-motion/tanpa WebGL bekerja; tidak bisa dilompati | 03 §17 | B |
| ☐ T9.2 | `useStoryMode` memilih 3D/statis; deteksi WebGL, context loss | Fallback otomatis | 06 | A |
| ☐ T9.3 | Audit aksesibilitas: axe, keyboard-only, kontras, zoom 200%, forced-colors | 09 §8.8 lulus | 09 | B |
| ☐ T9.4 | `<noscript>`, meta SEO, `lang="id"`, OG | Lighthouse SEO ≥ 95 | 09 | B |

---

## FASE 10 · PERFORMA DAN QA

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T10.1 | Analisis bundel; tutup celah anggaran 09 §1.1 | Semua batas terpenuhi atau dijustifikasi | 09 | A |
| ☐ T10.2 | Profil FPS/draw call per bab per tier; isi `PERF_LOG.md`; perbaiki | Target 09 §1 terpenuhi | 09 | A |
| ☐ T10.3 | Lighthouse (mobile + desktop) semua rute; simpan bukti | Target 09 §1 terpenuhi | 09 | B |
| ☐ T10.4 | Uji lintas peramban/perangkat/viewport (09 §7) | Matriks terisi | 09 | B |
| ☐ T10.5 | Uji E2E Playwright (04 §15 + form + filter) | Semua lulus | 04 | B |
| ☐ T10.6 | Kejujuran konten: audit `facts.ts` ↔ tampilan | Tidak ada angka tanpa sumber | 09 §8.9 | B |
| ☐ T10.7 | Perbaiki bug P0/P1/P2 | Daftar bug kosong untuk P0–P1 | 09 §9 | A+B |

---

## FASE 11 · PENGUMPULAN DAN DEMO

| ID | Tugas | Selesai bila | Dok. | Jalur |
|---|---|---|---|---|
| ☐ T11.1 | README final + tangkapan layar + skor Lighthouse | Sesuai 06 §12 | 06 | B |
| ☐ T11.2 | Hygiene repo: nama folder, `.env.example`, tanpa alat debug di `dist` | Daftar periksa 09 §10 | 09 | A |
| ☐ T11.3 | Uji instalasi di mesin bersih | `npm install && npm run dev` jalan | 09 | B |
| ☐ T11.4 | Skrip demo + cadangan (video, `?q=low`) + latihan 20 menit | Latihan penuh terlaksana | 09 §11 | A+B |
| ☐ T11.5 | Pengumpulan resmi (Google Form + repo) dan bukti kirim | Terkirim | guidebook | B |

---

## 3. Templat berkas pendamping

**`docs/DECISIONS.md`**
```markdown
# Keputusan
| Tanggal | Hal | Pilihan | Alasan | Dok. terkait | Status (usulan/disepakati) |
|---|---|---|---|---|---|
```
**`docs/CHANGELOG_PARAMETER.md`**
```markdown
# Perubahan parameter
| Parameter | Nilai awal | Nilai akhir | Perangkat uji | Catatan |
|---|---|---|---|---|
| GAIN | 1/1400 | | | |
| REST_DELAY | 90 ms | | | |
| DECAY | 0,12 | | | |
| MAX_SPEED_VH | 70 | | | |
| CHASE | 8 | | | |
| LENGTHS_VH | (lihat 03 §2) | | | |
```
**`docs/PERF_LOG.md`**
```markdown
# Log performa
| Perubahan | Tier | Bab | FPS rata-rata | FPS p1 | Draw call | Segitiga | Catatan |
|---|---|---|---|---|---|---|---|
```

---

## 4. Templat perintah sesi untuk agen coding

**Mulai sesi baru:**
> Baca `CLAUDE.md` dan `docs/00_INDEX_DAN_ATURAN_KERJA.md`. Lihat `docs/10_TASK_BREAKDOWN.md` dan kerjakan tugas **{ID}** hingga memenuhi "Selesai bila" dan Definisi Selesai (bagian 1). Baca dulu dokumen yang dirujuk kolom "Dok.". Jangan mengubah hal [DISEPAKATI]. Setelah selesai: centang tugas, catat keputusan di `docs/DECISIONS.md`, tunjukkan ringkasan perubahan dan cara mengujinya.

**Tinjauan sebelum menggabungkan:**
> Tinjau perubahan terhadap `docs/04_INTERACTION_GUIDE.md` dan `docs/03_SCENE_SPEC_HOME.md`. Cek: apakah ada pembacaan `scrollY` untuk cerita, re-render React per frame, warna di luar token, animasi non-transform, fitur dibatalkan, angka tanpa sumber. Laporkan pelanggaran sebelum saya setujui.

**Saat ragu spesifikasi:**
> Jangan berhenti. Pilih opsi paling konservatif, tulis di `docs/DECISIONS.md` sebagai [USULAN], lanjutkan, dan tandai agar saya putuskan.
