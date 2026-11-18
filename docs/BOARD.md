# BOARD

| ID | Tugas | Pemilik | Status | PR |
|---|---|---|---|---|
| T0.1 | Inisialisasi repo: Vite + React + TS strict, ESLint, Prettier, Vitest, struktur folder 06 bagian 2, `.gitignore`, `.env.example` | Pihak A | selesai | |
| T0.2 | Salin `docs/`, tulis `CLAUDE.md`, `DECISIONS.md`, `CHANGELOG_PARAMETER.md`, `PERF_LOG.md` (kosong dengan templat) | Pihak A | selesai | |
| T0.3 | Token: `lib/tokens.ts` (PALETTE, CUES, LENGTHS, warna) + `gen-tokens.mjs` → `tokens.generated.css`; `typography.css`, `base.css` | Pihak A | selesai | |
| T0.4 | Font Fontsource (4 keluarga, subset latin), preload kritis, fallback metrik | Pihak B | selesai lokal (fallback bermetrik; preload menunggu kontrak A, belum di-push) | |
| T0.5 | `App.tsx`: `HashRouter`, rute, `Suspense`, `AppShell` kosong, `HomePage` lazy placeholder | Pihak A | selesai | |
| T0.6 | Workflow GitHub Pages `deploy.yml` | Pihak B | terverifikasi (YAML valid); aktifkan Pages + secret manual | |
| T0.7 | `hooks/`: `useReducedMotion`, `useMedia`, `useSignal`, `useDocumentMeta` | Pihak A | selesai | |
| T1.1 | `engine/timeline.ts`: `LENGTHS_VH`, `STARTS`, `PUNCH`, `segmentAt`, `chapterAt`, `temperatureAt`, `babakAt` + tes unit | Pihak A | siap | |
| T1.2 | `engine/story-engine.ts`: scroller tinggi, `target`, ratchet berbasis `dt`, `pause/resume/reset`, `onFrame`, `onChapter` | Pihak A | siap | |
| T1.3 | `engine/input.ts` + pencegatan End/Home; scrollbar tersembunyi; `overscroll-behavior` | Pihak A | siap | |
| T1.4 | `palette.ts` (`applyPalette` dengan aturan dataran 70/30) + `cues.ts` | Pihak A | siap | |
| T1.5 | `updateRe` + `data-re`, gaya "Re:" pudar/menyala, `BrandMark` | Pihak A | siap | |
| T1.6 | `ChapterMarker` (dua `<ol>`, `data-view`, kotak penanda, suhu) | Pihak A | siap | |
| T1.7 | `Navbar` (Home): timeline mengempis, dua ambang, tombol bulat | Pihak A | siap | |
| T1.8 | `MenuPanel`+`Scrim`+focus trap+`inert`+scroll lock | Pihak A | siap | |
| T1.9 | `LoopGesture` + `LoopDome` + `ScrollHint (loop)` + `snap` | Pihak A | siap | |
| T1.10 | `CursorRing` (Home) | Pihak A | siap | |
| T1.11 | `StoryStage` rangka: 11 blok `ChapterText` placeholder (judul, isi dummy, counter), `ScenarioLabel`, `ScrollHint (start)`, `HeroTitle` | Pihak A | siap | |
| T1.12 | Aturan jeda teks (text gap) pada semua bab; `SplitHeadline` dan `--melt` | Pihak A | siap | |
| T1.13 | Overlay `Overlays`: butiran, vignette (CSS), retak latar (placeholder) | Pihak B | siap | |
| T2.1 | `AppShell`, `SkipLink`, `RouteTransition`, `RouteAnnouncer`, `Seo`, tema per halaman (`data-page`) | Pihak B | siap | |
| T2.2 | Navbar statis (menempel, latar muncul saat gulir > 8 px) di non-Home | Pihak B | siap | |
| T2.3 | `AboutPage` (7 bagian), `FactBlock`, `TempDiagram`, `SourceList`, `LicenseTable`, `TeamGrid`, `ClosingStrip` | Pihak B | siap | |
| T2.4 | `ContentPage`: `FilterPill`, `ArticleGrid`, `ArticleCard`, URL query | Pihak B | siap | |
| T2.5 | `ParticleField` (kanvas 2D) | Pihak B | siap | |
| T2.6 | `CursorRing` aktif di `#/konten` + label "Baca" | Pihak A | siap | |
| T2.7 | `ArticlePage` + `ArticleBody` + `NextArticle` | Pihak B | siap | |
| T2.8 | `ContactPage` + `ContactForm` + Formspree + `mailto` cadangan + status | Pihak B | siap | |
| T2.9 | `NotFoundPage` | Pihak B | siap | |
| T2.10 | Tes komponen: `FilterPill`, `ContactForm`, `MenuPanel` | Pihak B | siap | |
| T3.1 | `stage/stage.ts`: renderer (alpha), kamera, `RoomEnvironment` PMREM, lampu, resize, `viewOffset` HP, context loss | Pihak A | siap | |
| T3.2 | `QualityManager` + `?q=` + penurunan otomatis | Pihak A | siap | |
| T3.3 | `objects/bottle.ts` (lathe, tutup, cairan+clipping plane, label, kekeruhan, retak, serpihan shader) | Pihak A | siap | |
| T3.4 | `textures/*` prosedural: `T-LABEL`, `T-CRACK`, `T-CONTACT`, `T-GRAIN` | Pihak A | siap | |
| T3.5 | `SceneDirector` + antarmuka `Scene` + pra-muat/dispose | Pihak A | siap | |
| T3.6 | Scene **B1/hero**: botol, turntable, judul di belakang, poster hero | Pihak A | siap | |
| T3.7 | `scripts/capture.mjs` (poster hero + tangkapan bab) | Pihak B | siap | |
| T3.8 | Overlay debug (`?debug`, `?freeze`, `?q`) | Pihak A | siap | |
| T4.1 | `objects/hand.ts` + pose (OPEN/GRIP/RELEASE/THROW) | Pihak A | siap | |
| T4.2 | Scene **B2** Sekali Pakai (minum, level cairan, lempar, `TimeRing`) | Pihak A | siap | |
| T4.3 | `WaterSystem` (mode sungai/laut/malam/bersih) + shader | Pihak A | siap | |
| T4.4 | Objek kota, jembatan, tanggul, sampah (instanced) | Pihak A | siap | |
| T4.5 | Scene **B3** Tersesat (paralaks, kolong jembatan, counter 450) | Pihak A | siap | |
| T4.6 | Laut Gerstner, matahari, dermaga, karang, menyelam | Pihak A | siap | |
| T4.7 | Scene **B4** Lautan | Pihak A | siap | |
| T4.8 | `Particles` (shader) + serpihan botol (shatter) | Pihak A | siap | |
| T4.9 | Scene **B5** Terurai (retak tumbuh, pecah, partikel, orbit) | Pihak A | siap | |
| T4.10 | `objects/fish.ts`, `plate.ts` + Scene **B6** (alir ke ikan, match cut, top-down, counter X) | Pihak A | siap | |
| T4.11 | Isyarat suhu penuh: shimmer, goyangan kamera, kekeruhan botol, lampu per bab | Pihak A | siap | |
| T5.1 | Scene **Punchline** (fade, *rewind*, teks kata-per-kata, hold ±76 vh) | Pihak A | siap | |
| T5.2 | `objects/bins.ts` + `T-BINLABEL` + tutup berengsel | Pihak A | siap | |
| T5.3 | Scene **B7** (7a–7d) + **jendela kilas** (*scissor*) + `TimeRing` cermin | Pihak A | siap | |
| T5.4 | `LetterCard` (Caveat, per kata) dan kartu surat Babak II | Pihak B | siap | |
| T5.5 | `objects/conveyor.ts` + Scene **B8** (pemilah, teman hilang, lorong cuci) | Pihak A | siap | |
| T5.6 | `objects/processline.ts` + Scene **B9** (4 stasiun, amber ≤ 4%, `StationLabels`) | Pihak A | siap | |
| T5.7 | `objects/products.ts`, `shelf.ts`, `tumbler.ts`, `tote.ts` | Pihak A | siap | |
| T5.8 | Scene **B10** (10a–10e, timeline kamera, sorot, redup produk) | Pihak A | siap | |
| T5.9 | `CTAClosing` + `(Terus gulir)` + sambungan ke loop | Pihak A | siap | |
| T6.1 | Tuning `GAIN/REST_DELAY/DECAY/MAX_SPEED_VH/CHASE` di mouse, trackpad, HP | Pihak A | siap | |
| T6.2 | Tuning `LENGTHS_VH` (jeda baca tiap bab) | Pihak A | siap | |
| T6.3 | Retak latar (SVG), tekstur butiran final, filter SVG melt | Pihak B | siap | |
| T6.4 | Pemeriksaan kontras di titik transisi (semua bab) | Pihak B | siap | |
| T6.5 | Pemeriksaan "5 putaran loop" (memori, state bersih) | Pihak A | siap | |
| T7.1 | `audio-engine.ts` (graf, master, compressor, duck, fade) + `AudioToggle` | Pihak A | siap | |
| T7.2 | `synths.ts` (Drone, NoiseBed, Pulse, Tick, Swell, Note) | Pihak A | siap | |
| T7.3 | `profiles.ts` 11 segmen + crossfade + pemicu SFX lintas `t` | Pihak A | siap | |
| T7.4 | Uji audio (08 §8) | Pihak A | siap | |
| T8.1 | **Verifikasi fakta**: isi `facts.ts` dari sumber resmi (daftar di 11 §6) | Pihak B | siap | |
| T8.2 | Naskah final 11 blok cerita + 4 surat (11 §2–3) | Pihak B | siap | |
| T8.3 | Tulis 12 artikel (400–600 kata, sumber) | Pihak B | siap | |
| T8.4 | 12 sampul SVG | Pihak B | siap | |
| T8.5 | 11 panel statis SVG | Pihak B | siap | |
| T8.6 | Favicon, OG, wordmark, 404 | Pihak B | siap | |
| T8.7 | Data tim + email/akun di `site.ts`; teks About, Contact | Pihak B | siap | |
| T8.8 | `credits.ts` lengkap (font, lib, metode aset, penggunaan AI bila ada) | Pihak B | siap | |
| T9.1 | `StaticStory` + `StaticPanel` ×11 + pembukaan berurutan + "Mulai dari awal" | Pihak B | siap | |
| T9.2 | `useStoryMode` memilih 3D/statis; deteksi WebGL, context loss | Pihak A | siap | |
| T9.3 | Audit aksesibilitas: axe, keyboard-only, kontras, zoom 200%, forced-colors | Pihak B | siap | |
| T9.4 | `<noscript>`, meta SEO, `lang="id"`, OG | Pihak B | siap | |
| T10.1 | Analisis bundel; tutup celah anggaran 09 §1.1 | Pihak A | siap | |
| T10.2 | Profil FPS/draw call per bab per tier; isi `PERF_LOG.md`; perbaiki | Pihak A | siap | |
| T10.3 | Lighthouse (mobile + desktop) semua rute; simpan bukti | Pihak B | siap | |
| T10.4 | Uji lintas peramban/perangkat/viewport (09 §7) | Pihak B | siap | |
| T10.5 | Uji E2E Playwright (04 §15 + form + filter) | Pihak B | siap | |
| T10.6 | Kejujuran konten: audit `facts.ts` ↔ tampilan | Pihak B | siap | |
| T10.7 | Perbaiki bug P0/P1/P2 | Pihak A | siap | |
| T11.1 | README final + tangkapan layar + skor Lighthouse | Pihak B | siap | |
| T11.2 | Hygiene repo: nama folder, `.env.example`, tanpa alat debug di `dist` | Pihak A | siap | |
| T11.3 | Uji instalasi di mesin bersih | Pihak B | siap | |
| T11.4 | Skrip demo + cadangan (video, `?q=low`) + latihan 20 menit | Pihak A | siap | |
| T11.5 | Pengumpulan resmi (Google Form + repo) dan bukti kirim | Pihak B | siap | |
