# BOARD

| ID | Tugas | Pemilik | Status | Commit |
|---|---|---|---|---|
| T0.1 | Inisialisasi repo: Vite + React + TS strict, ESLint, Prettier, Vitest, struktur folder 06 bagian 2, `.gitignore`, `.env.example` | Pihak A | selesai |  |
| T0.2 | Salin `docs/`, tulis `CLAUDE.md`, `DECISIONS.md`, `CHANGELOG_PARAMETER.md`, `PERF_LOG.md` (kosong dengan templat) | Pihak B | selesai |  |
| T0.3 | Token: `lib/tokens.ts` (PALETTE, CUES, LENGTHS, warna) + `gen-tokens.mjs` → `tokens.generated.css`; `typography.css`, `base.css` | Pihak A | token dan generator terverifikasi; preload terpasang | 188af7b, 419afba, ebaf7ed |
| T0.4 | Font Fontsource (4 keluarga, subset latin), preload kritis, fallback metrik | Pihak B | selesai lokal (fallback bermetrik; preload menunggu kontrak A, belum di-push) |  |
| T0.5 | `App.tsx`: `HashRouter`, rute, `Suspense`, `AppShell` kosong, `HomePage` lazy placeholder | Pihak A | selesai |  |
| T0.6 | Workflow GitHub Pages `deploy.yml` | Pihak B | dibatalkan sesuai keputusan tim (tanpa GitHub Actions); `deploy.yml` dihapus |  |
| T0.7 | `hooks/`: `useReducedMotion`, `useMedia`, `useSignal`, `useDocumentMeta` | Pihak A | selesai |  |
| T1.1 | `engine/timeline.ts`: `LENGTHS_VH`, `STARTS`, `PUNCH`, `segmentAt`, `chapterAt`, `temperatureAt`, `babakAt` + tes unit | Pihak A | modul lengkap dan tes batas lulus; integrasi Home berikutnya | 3e30fa9 |
| T1.2 | `engine/story-engine.ts`: scroller tinggi, `target`, ratchet berbasis `dt`, `pause/resume/reset`, `onFrame`, `onChapter` | Pihak A | modul ratchet dan tes lulus; integrasi Home berlangsung | 6d59bff |
| T1.3 | `engine/input.ts` + pencegatan End/Home; scrollbar tersembunyi; `overscroll-behavior` | Pihak A | adapter input dan tes lulus; uji browser Home menyusul | 6d59bff |
| T1.4 | `palette.ts` (`applyPalette` dengan aturan dataran 70/30) + `cues.ts` | Pihak A | palet dan cues beserta tes lulus; UI menyusul | 6d08d97 |
| T1.5 | `updateRe` + `data-re`, gaya "Re:" pudar/menyala, `BrandMark` | Pihak A | siap |  |
| T1.6 | `ChapterMarker` (dua `<ol>`, `data-view`, kotak penanda, suhu) | Pihak A | siap |  |
| T1.7 | `Navbar` (Home): timeline mengempis, dua ambang, tombol bulat | Pihak A | siap |  |
| T1.8 | `MenuPanel`+`Scrim`+focus trap+`inert`+scroll lock | Pihak A | siap |  |
| T1.9 | `LoopGesture` + `LoopDome` + `ScrollHint (loop)` + `snap` | Pihak A | logika gestur dan reset teruji; dome DOM belum | 25d085b |
| T1.10 | `CursorRing` (Home) | Pihak A | siap |  |
| T1.11 | `StoryStage` rangka: 11 blok `ChapterText` placeholder (judul, isi dummy, counter), `ScenarioLabel`, `ScrollHint (start)`, `HeroTitle` | Pihak A | siap |  |
| T1.12 | Aturan jeda teks (text gap) pada semua bab; `SplitHeadline` dan `--melt` | Pihak A | siap |  |
| T1.13 | Overlay `Overlays`: butiran, vignette (CSS), retak latar (placeholder) | Pihak A | siap |  |
| T2.1 | `AppShell`, `SkipLink`, `RouteTransition`, `RouteAnnouncer`, `Seo`, tema per halaman (`data-page`) | Pihak B | selesai (bagian B: tema, PageHero, Reveal, RouteFade, fokus H1; `RouteTransition` menunggu A memasang) |  |
| T2.2 | Navbar statis (menempel, latar muncul saat gulir > 8 px) di non-Home | Pihak A | siap |  |
| T2.3 | `AboutPage` (7 bagian), `FactBlock`, `TempDiagram`, `SourceList`, `LicenseTable`, `TeamGrid`, `ClosingStrip` | Pihak B | selesai (data fakta, tim, dan keterangan alat ilustrasi masih menunggu isian) |  |
| T2.4 | `ContentPage`: `FilterPill`, `ArticleGrid`, `ArticleCard`, URL query | Pihak B | selesai (12 kartu, filter 2 kelompok, URL tersinkron; sampul masih placeholder A, waktu baca disembunyikan sampai T8.3) |  |
| T2.5 | `ParticleField` (kanvas 2D) | Pihak B | selesai |  |
| T2.6 | `CursorRing` aktif di `#/konten` + label "Baca" | Pihak B | sebagian: `data-cursor="read"` di kartu + `TODO(A)`; menunggu `CursorRing` milik A |  |
| T2.7 | `ArticlePage` + `ArticleBody` + `NextArticle` | Pihak B | selesai (isi artikel kosong sampai T8.3: tampil "Belum ada isi") |  |
| T2.8 | `ContactPage` + `ContactForm` + Formspree + `mailto` cadangan + status | Pihak B | selesai (mode cadangan `mailto:`; kontak DUMMY; kirim nyata menunggu endpoint) |  |
| T2.9 | `NotFoundPage` | Pihak B | selesai (PageHero, aset S-404 dari A, tombol kembali, tes) |  |
| T2.10 | Tes komponen: `FilterPill`, `ContactForm`, `MenuPanel` | Bersama (opsional) | siap |  |
| T3.1 | `stage/stage.ts`: renderer (alpha), kamera, `RoomEnvironment` PMREM, lampu, resize, `viewOffset` HP, context loss | Pihak A | renderer siap; render WebGL hero teruji; integrasi Home menyusul | f621f65 |
| T3.2 | `QualityManager` + `?q=` + penurunan otomatis | Pihak A | modul kualitas dan tes downgrade lulus | f621f65 |
| T3.3 | `objects/bottle.ts` (lathe, tutup, cairan+clipping plane, label, kekeruhan, retak, serpihan shader) | Pihak A | botol prosedural dan tes geometri lulus; render hero teruji | 3cc7854 |
| T3.4 | `textures/*` prosedural: `T-LABEL`, `T-CRACK`, `T-CONTACT`, `T-GRAIN` | Pihak A | helper tekstur terintegrasi dan grain terpisah | 795d284 |
| T3.5 | `SceneDirector` + antarmuka `Scene` + pra-muat/dispose | Pihak A | lifecycle director dan tes reverse/rebuild lulus | 9f1efcb |
| T3.6 | Scene **B1/hero**: botol, turntable, judul di belakang, poster hero | Pihak A | scene hero siap; 9 draw call, 8282 segitiga pada harness; UI/poster final belum | 3758b18 |
| T3.7 | `scripts/capture.mjs` (poster hero + tangkapan bab) | Pihak A | siap |  |
| T3.8 | Overlay debug (`?debug`, `?freeze`, `?q`) | Pihak A | modul debug DEV siap; pemasangan overlay Home belum | f621f65 |
| T4.1 | `objects/hand.ts` + pose (OPEN/GRIP/RELEASE/THROW) | Pihak A | siap |  |
| T4.2 | Scene **B2** Sekali Pakai (minum, level cairan, lempar, `TimeRing`) | Pihak A | siap |  |
| T4.3 | `WaterSystem` (mode sungai/laut/malam/bersih) + shader | Pihak A | siap |  |
| T4.4 | Objek kota, jembatan, tanggul, sampah (instanced) | Pihak A | siap |  |
| T4.5 | Scene **B3** Tersesat (paralaks, kolong jembatan, counter 450) | Pihak A | siap |  |
| T4.6 | Laut Gerstner, matahari, dermaga, karang, menyelam | Pihak A | siap |  |
| T4.7 | Scene **B4** Lautan | Pihak A | siap |  |
| T4.8 | `Particles` (shader) + serpihan botol (shatter) | Pihak A | siap |  |
| T4.9 | Scene **B5** Terurai (retak tumbuh, pecah, partikel, orbit) | Pihak A | siap |  |
| T4.10 | `objects/fish.ts`, `plate.ts` + Scene **B6** (alir ke ikan, match cut, top-down, counter X) | Pihak A | siap |  |
| T4.11 | Isyarat suhu penuh: shimmer, goyangan kamera, kekeruhan botol, lampu per bab | Pihak A | siap |  |
| T5.1 | Scene **Punchline** (fade, *rewind*, teks kata-per-kata, hold ±76 vh) | Pihak A | siap |  |
| T5.2 | `objects/bins.ts` + `T-BINLABEL` + tutup berengsel | Pihak A | siap |  |
| T5.3 | Scene **B7** (7a–7d) + **jendela kilas** (*scissor*) + `TimeRing` cermin | Pihak A | siap |  |
| T5.4 | `LetterCard` (Caveat, per kata) dan kartu surat Babak II | Pihak A | siap |  |
| T5.5 | `objects/conveyor.ts` + Scene **B8** (pemilah, teman hilang, lorong cuci) | Pihak A | siap |  |
| T5.6 | `objects/processline.ts` + Scene **B9** (4 stasiun, amber ≤ 4%, `StationLabels`) | Pihak A | siap |  |
| T5.7 | `objects/products.ts`, `shelf.ts`, `tumbler.ts`, `tote.ts` | Pihak A | siap |  |
| T5.8 | Scene **B10** (10a–10e, timeline kamera, sorot, redup produk) | Pihak A | siap |  |
| T5.9 | `CTAClosing` + `(Terus gulir)` + sambungan ke loop | Pihak A | siap |  |
| T6.1 | Tuning `GAIN/REST_DELAY/DECAY/MAX_SPEED_VH/CHASE` di mouse, trackpad, HP | Pihak A | siap |  |
| T6.2 | Tuning `LENGTHS_VH` (jeda baca tiap bab) | Pihak A | siap |  |
| T6.3 | Retak latar (SVG), tekstur butiran final, filter SVG melt | Pihak A | siap |  |
| T6.4 | Pemeriksaan kontras di titik transisi (semua bab) | Bersama (opsional) | siap |  |
| T6.5 | Pemeriksaan "5 putaran loop" (memori, state bersih) | Bersama (opsional) | siap |  |
| T7.1 | `audio-engine.ts` (graf, master, compressor, duck, fade) + `AudioToggle` | Pihak A | siap |  |
| T7.2 | `synths.ts` (Drone, NoiseBed, Pulse, Tick, Swell, Note) | Pihak A | siap |  |
| T7.3 | `profiles.ts` 11 segmen + crossfade + pemicu SFX lintas `t` | Pihak A | siap |  |
| T7.4 | Uji audio (08 §8) | Bersama (opsional) | siap |  |
| T8.1 | **Verifikasi fakta**: isi `facts.ts` dari sumber resmi (daftar di 11 §6) | Pihak B | sebagian (5 dari 12 terverifikasi) |  |
| T8.2 | Naskah final 11 blok cerita + 4 surat (11 §2–3) | Pihak B | selesai (menunggu persetujuan [USULAN]) |  |
| T8.3 | Tulis 12 artikel (400–600 kata, sumber) | Pihak B | sebagian (batch 1: A1, B1, A2, B2 selesai; 8 artikel tersisa) |  |
| T8.4 | 12 sampul SVG | Pihak A | siap |  |
| T8.5 | 11 panel statis SVG | Pihak A | siap |  |
| T8.6 | Favicon, OG, wordmark, 404 | Pihak A | siap |  |
| T8.7 | Data tim + email/akun di `site.ts`; teks About, Contact | Pihak B | siap |  |
| T8.8 | `credits.ts` lengkap (font, lib, metode aset, penggunaan AI bila ada) | Pihak B | siap |  |
| T9.1 | `StaticStory` + `StaticPanel` ×11 + pembukaan berurutan + "Mulai dari awal" | Pihak A | siap |  |
| T9.2 | `useStoryMode` memilih 3D/statis; deteksi WebGL, context loss | Pihak A | siap |  |
| T9.3 | Audit aksesibilitas: axe, keyboard-only, kontras, zoom 200%, forced-colors | Bersama (opsional) | siap |  |
| T9.4 | `<noscript>`, meta SEO, `lang="id"`, OG | Pihak B | siap |  |
| T10.1 | Analisis bundel; tutup celah anggaran 09 §1.1 | Pihak A | siap |  |
| T10.2 | Profil FPS/draw call per bab per tier; isi `PERF_LOG.md`; perbaiki | Pihak A | siap |  |
| T10.3 | Lighthouse (mobile + desktop) semua rute; simpan bukti | Bersama (opsional) | siap |  |
| T10.4 | Uji lintas peramban/perangkat/viewport (09 §7) | Bersama (opsional) | siap |  |
| T10.5 | Uji E2E Playwright (04 §15 + form + filter) | Bersama (opsional) | siap |  |
| T10.6 | Kejujuran konten: audit `facts.ts` ↔ tampilan | Bersama (opsional) | siap |  |
| T10.7 | Perbaiki bug P0/P1/P2 | Bersama (opsional) | siap |  |
| T11.1 | README final + tangkapan layar + skor Lighthouse | Pihak B | siap |  |
| T11.2 | Hygiene repo: nama folder, `.env.example`, tanpa alat debug di `dist` | Bersama (opsional) | siap |  |
| T11.3 | Uji instalasi di mesin bersih | Bersama (opsional) | siap |  |
| T11.4 | Skrip demo + cadangan (video, `?q=low`) + latihan 20 menit | Pihak A | siap |  |
| T11.5 | Pengumpulan resmi (Google Form + repo) dan bukti kirim | Pihak B | siap |  |

## Catatan untuk sesi berikutnya
- **G6c batch 1 (T8.3):** A1, B1, A2, B2 ditulis di `src/content/articles/<kode>.ts` (400–422 kata, 3 menit baca) dan disambung lewat `ArticleBody` + `BODIES` di `articles.ts`. Sisa: A3–A6, B3–B6 (tambahkan berkas `articles/<kode>.ts` dan daftarkan di `BODIES`). Tes `AboutPage`/`ArticlePage` disesuaikan agar tak bergantung pada data kosong.
- **G6c batch 2 (T8.3):** A3, A4, B3, B4 ditulis (450–468 kata, 3 menit baca) dan didaftarkan di `BODIES`. Judul A2 diganti jadi "10 Menit Dipakai, Ratusan Tahun Tinggal" (slug `10-menit-dipakai-ratusan-tahun-tinggal`) karena "450 tahun" tak punya sumber primer; teks A2 disesuaikan. Sisa: A5, A6, B5, B6 (batch 3). Cox et al. 2019 dan UNEP tidak bisa dibuka; WHO hanya halaman ringkasan (batch 1).
- **Menunggu Pihak A:** `public/img/articles/cover-A2.svg` masih memuat judul lama "450 Tahun" pada elemen `<title>` (aset A); mohon diganti saat menyentuh sampul.
- **Catatan sumber batch 2:** Meijer 2021 (Science Advances), jurnal KKP, Pergub Bali 97/2018, SE Bali 2/2025, dan ITS tidak bisa dibuka dan tidak dipakai. Angka nelayan/kerugian (CELIOS, BRIN) berasal dari narasumber yang dikutip Mongabay dan ditandai di teks; angka 22% dan 80% daur ulang berasal dari rangkuman sekunder studi SWI–IPR.
- **Catatan:** kalimat "langkah kecil" terletak di subjudul terakhir, sebelum kotak "Kaitannya dengan Re:bottle".
- **Selesai (G6b, T8.2):** `copy.ts` memuat semua kunci dok 11 §2, §3, §5.1–5.3; [DISEPAKATI] identik dokumen (dijaga `copy.test.ts`). Kunci baru: `ch3.fallback`, `about.background.1/2` (paragraf latar isu; `AboutPage` memakainya, TODO(T8.2) dihapus); `ch3.counter.value` kini `{X}`. 17 teks [USULAN] menunggu persetujuan (daftar di `docs/tinjauan/NASKAH_TINJAUAN.md`, lokal). `ch6.fallback`/`ch3.fallback` dipakai selama `mikroplastik-mingguan` dan `lama-terurai` belum verified; `ch8.fact` disembunyikan (`botol-terkumpul` false). Tes `AboutPage` diperbaiki: 7 section (hero ikut dihitung). `punch.reveal` dan `ch7.kilas` adalah perilaku/tanpa teks, tidak dibuat kunci.
- **Berikutnya (Pihak B):** G6c = T8.3 (artikel); butuh fakta terverifikasi tambahan.
- **G6a-lanjutan (T8.1):** `produksi-plastik` kini `verified: true` (460 juta ton, 2019, sekunder OWID; halaman tidak menyebut sumber asli angka itu). `emisi-plastik` tetap `false`: OWID memuat 3,3% (siklus hidup, estimasi OECD) tetapi tanpa tahun. `daur-ulang-global` tetap `false`: persentase daur ulang tidak ada di halaman OWID. Total terverifikasi: 5 dari 12; sisanya menunggu teks OECD/sumber lain.
- **G6a (T8.1) SEBAGIAN:** `verified: true` untuk `kenaikan-laut` (NASA, 4,5 mm/tahun, 2023), `terumbu-pemutihan` (NOAA NESDIS, 84% luas terumbu, 2023–2025, tekanan panas bukan pemutihan pasti), `sampah-sungai-laut` (Bank Dunia, 83% kebocoran dari darat via sungai, 2021), `deposit-hasil` (Reloop, >90% hanya wilayah terbaik, tahun perkiraan). Masih `false`: `mikroplastik-mingguan`, `lama-terurai` (NOAA: tidak pasti), `botol-terkumpul`, `produksi-plastik`, `emisi-plastik`, `daur-ulang-global`, `bank-sampah`, `pet-menjadi-serat`. Penyebab: OECD, UNEP, Textile Exchange, ScienceDirect, WWF tidak bisa dibuka (403/404); situs KLHK sertifikat kedaluwarsa. Alasan per entri ada di `note`.
- **Perlu dari Pihak B/tim:** tempel teks halaman OECD Global Plastics Outlook (produksi, emisi, daur ulang) dan makalah mikroplastik (Senathirajah dkk., 2021) agar entri itu bisa diverifikasi; atau setujui memakai Our World in Data sebagai sumber sekunder. Pertimbangkan membuang kalimat yang bergantung pada fakta `false` dari naskah.
- **Catatan tes:** `npm run test` gagal di lingkungan ini ("Cannot read properties of undefined (reading 'config')", semua berkas, juga sebelum perubahan fakta); typecheck, lint, dan build hijau. Perlu dicek oleh tim (kemungkinan instalasi vitest).
- **Selesai (G5: T2.7, T2.8):** `ArticlePage` (tautan kembali dengan filter terakhir via `galleryReturn.ts`/sessionStorage, pita jenis, label ganda, gambar judul 16:9, `ArticleBody`, daftar sumber via `SourceItem`, `NextArticle` memakai `ArticleCard`, `nextInOrder` berputar 12→1, slug tak dikenal → 404, meta description ≤ 155 karakter dari lede). `ContactPage` + `ContactForm` + `contact-validate.ts` (validasi blur/kirim, penghitung, `_gotcha`, status idle/sending/success/error, kunci kirim ulang 5 dtk, ringkasan galat berfokus). Tes: `ArticlePage.test.tsx`, `ArticleBody.test.tsx`, `ContactForm.test.tsx`, `ContactPage.test.tsx`. Bukti lokal: `docs/bukti/T2.7/`, `docs/bukti/T2.8/`.
- **Model data berubah:** `Article.body: string[]` diganti `lede`, `sections` (`{heading, paragraphs[]}`), `relation`. T8.3 mengisi ketiganya plus `readingMinutes` dan `sources`.
- **Contact berjalan di MODE CADANGAN:** `VITE_FORMSPREE_ENDPOINT` kosong, jadi tombol membuka `mailto:`. Kirim nyata ke Formspree belum diuji (butuh endpoint dari DATA_B). Kontak `rebottle@gmail.com` / `@rebottle.id` di `site.ts` adalah DUMMY (tim sepakat); halaman About ikut menampilkan email itu lewat `ClosingStrip`.
- **Keputusan [USULAN]:** teks galat/sukses `contact.*` mengikuti dok 05 §6.2 (menggantikan versi dok 11: "Nama minimal 2 karakter.", "Format email belum benar.", "Terkirim. Terima kasih sudah peduli.", banner galat baru). Kunci baru: `article.*` (relation, sources, empty, cover.alt), `contact.*` (headline, form/info, counter, privacy, fallback, trap, again, batas maks nama/pesan, subjek mailto). Pada mode cadangan, setelah mailto dibuka halaman menampilkan "Aplikasi emailmu dibuka…" (bukan "Terkirim") agar tidak mengklaim pesan sudah terkirim. Akun tim (`@rebottle.id`) tampil sebagai teks, bukan tautan, karena platformnya belum ditentukan.
- **Tersisa:** T2.6 (kursor, menunggu `CursorRing` A), T2.10 (QA opsional), T8.x konten, T9.4, T11.x.
- **Berikutnya (Pihak B):** G6 = T8.1 (verifikasi fakta) / T8.2 / T8.3 sesuai urutan panduan.
- **Selesai (G4: T2.4, T2.5):** `ContentPage` (H1, lede, `FilterPill`, `ArticleGrid`, `ArticleCard`, `ParticleField`), logika murni `filter.ts` + `filter.test.ts`, `filterLabels.ts`. URL `?jenis=&level=` via `useSearchParams` (replace, nilai tidak valid diabaikan). Tes: `filter.test.ts`, `ContentPage.test.tsx`. Bukti lokal: `docs/bukti/T2.4/`.
- **T2.6 sebagian:** `CursorRing` belum ada di `main`; kartu sudah ber-`data-cursor="read"` dan `ContentPage.tsx` memuat `TODO(A)`. Permintaan ada di `CATATAN_UNTUK_A.md`.
- **Keputusan [USULAN]:** kunci `filter.*`, `card.*`, `page.content.lede` di `copy.ts`. Hitungan chip memakai rumus kode dok 05 §4.3; contoh teks dok ("Negatif+Global → Semua 2, Positif 0") tidak konsisten dengan rumus itu (hasil rumus: Semua 4, Negatif 2, Positif 2). Subjudul kartu menyembunyikan "menit baca" sampai `readingMinutes` terisi (T8.3). Alt sampul diturunkan dari judul artikel.
- **Berikutnya (Pihak B):** G5 = T2.7 (ArticlePage). Tidak ada prasyarat dari A selain sampul final.
- **Selesai (T2.3):** `AboutPage` 7 bagian + `FactBlock`, `TempDiagram` (SVG inline, `scaleX` 0,9 dtk, tabel ringkasan `sr-only`), `SourceList` (+ `sourceGroups.ts`), `LicenseTable` (kartu di HP), `TeamGrid`, `ClosingStrip` di `src/components/content/`. Tes: `AboutPage.test.tsx`. Bukti lokal: `docs/bukti/T2.3/`.
- **Perilaku data:** semua fakta masih `verified: false`, jadi `FactBlock` tersembunyi di produksi (DEV: penanda `[DATA]`); daftar sumber menampilkan catatan kosong sampai T8.1/T8.3 terisi. Tim tampil placeholder (`site.ts` masih `TODO`); metode ilustrasi `TODO` tidak ditampilkan; keterangan alat bantu ilustrasi belum ditulis (menunggu info Pihak A).
- **Keputusan [USULAN]:** kunci `about.*` tambahan di `copy.ts` (H1 "Kenapa Re:bottle?", label diagram, kepala tabel, placeholder tim). Lede hero memakai `about.why.body`; bagian Latar isu memakai `about.scenario.*`. Dua paragraf latar isu menunggu naskah T8.2 (`TODO(T8.2)` di kode).
- **Menunggu Pihak A:** "Re:" pada Navbar statis belum menyala penuh di About (brand tampil "bottle"); komponen milik A.
- **Selesai (T2.1, bagian Pihak B):** `src/styles/pages.css` (lima tema `[data-page]`, nilai dok 05 §1.1, kontras ink/bg ≥ 4,5:1 diuji di `pages.test.tsx`), `ui/usePageTheme`, `ui/PageHero` (H1 menerima fokus setelah pindah rute lewat klik tautan; dilewati pada muat pertama), `ui/Reveal`, `ui/RouteFade` (belum dipasang), kelima halaman memakai tema.
- **Selesai (T2.9):** `NotFoundPage` memakai `PageHero` + tema `notfound`, teks dari `COPY["404.*"]`, aset A `public/img/s-404.svg` (dekoratif, melayang CSS transform, mati saat reduced-motion; tanpa `BottleMini` karena aset sudah ada), tombol "Kembali ke awal" ke `#/`. Tes: `NotFoundPage.test.tsx`. G2 tuntas. Catatan: `usePageFocus` melewati fokus pada muat pertama (key "default"), sehingga membuka URL 404 langsung tidak memindah fokus ke H1; ini perilaku T2.1 yang disengaja (agar tautan lompat tetap jalan).
- **Keputusan:** `pages.css` diimpor dari `usePageTheme.ts` (tanpa menyentuh `main.tsx`). Aksen konten/artikel (3,51 dan 3,84 : 1) hanya untuk elemen besar/dekoratif.
- **Menunggu Pihak A:** lihat `CATATAN_UNTUK_A.md` (pasang `RouteFade`, Navbar HP meluap, latar Navbar saat gulir, preload font).
- **Menunggu saya:** `DATA_B` (nama tim, email, akun, endpoint Formspree, keputusan atribusi alat bantu ilustrasi) belum diisi; dibutuhkan mulai G5/G6d.
- **Catatan lingkungan:** `npm run test` hanya jalan bila shell dibuka dengan huruf drive kapital (`C:\...`); jalur `c:\` kecil membuat Vitest gagal "reading 'config'". Unduhan Chromium Playwright gagal (ECONNRESET); tangkapan layar memakai Chrome terpasang (`channel: "chrome"`).

## Checkpoint Pihak A · 18 November 2026 pukul 21.35 WIB

- Target pengguna: hasil prioritas beserta integrasi sebelum23.30WIB; alur inti dan fallback mendahului pemolesan opsional.
- Token/font/preload sudah masuk main. Engine dan fondasi stage sudah digabung; seluruh65tes, typecheck, lint dan build lulus bersama.
- Uji WebGL hero pada harness browser: tanpa galat konsol,9drawcall/8282segitiga padaHIGH. Ini bukti render awal, belum profilFPS perangkat atau hasil Home final.
- Berikutnya: UIHome/fallback, sceneB2-B10/punch dan wiringStageCanvas. Tugas dengan keterangan modul siap belum dianggap seluruh perilaku visual selesai.
- Pengguna meminta penghentian koordinasi langsung dengan B; pekerjaan berikutnya fokus implementasi dan mengambil hasil main saat integrasi.
