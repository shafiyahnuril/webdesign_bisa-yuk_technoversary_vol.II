# 14 · PANDUAN PROMPT UNTUK PIHAK B ("Halaman Lain & Konten")

> Untuk siapa: **Pihak B** (30%→14% bobot; lihat dok 12). Tujuan: menyelesaikan **seluruh bagian B** (20 tugas di dok 12 §4) lewat Claude Code, **tanpa menyentuh Home**, **tanpa jejak AI di git** (commit, branch, PR). **Revisi:** `docs/`, `rebottle_assets/`, dan `rebottle_design_system.html` **sengaja ikut di repo GitHub**; hanya `CLAUDE.md`, `.claude/`, `docs/bukti/`, dan `docs/tinjauan/` yang tetap lokal.
> Cara pakai: **satu sesi chat = satu tugas/gelombang.** **(1)** isi data di bagian 2 → **(2)** buka sesi baru, tempel **PROMPT MASTER v2** (bagian 3) → **(3)** tempel **satu prompt gelombang** (bagian 4) → **(4)** agen bekerja; di AKHIR tugas ia membuat commit bertahap lalu push sekali, melapor, dan berhenti → **(5)** tinjau hasil, buka sesi baru untuk gelombang berikutnya.
> Urutan gelombang mengikuti ketergantungan teknis, bukan jadwal. Semua prompt berbahasa Indonesia.

---

## 1. Peta tugas Pihak B → gelombang prompt

| Gelombang | Tugas (ID dok 10) | Bobot | Menyentuh folder | Butuh dari A |
|---|---|---|---|---|
| **G0** | Persiapan lokal, sinkron, cek paket awal A | — | (tidak ada kode) | Paket awal A sudah di `main` |
| **G1** | T0.2 docs · T0.4 font · T0.6 deploy | 5 | `docs/`, `src/styles/typography.css`, `.github/` | — |
| **G2** | T2.1 shell halaman non-Home · T2.9 404 | 4 | `src/routes/`, `src/components/ui/`, `src/styles/pages.css` | `Navbar`, `AppShell` (minimal) |
| **G3** | T2.3 About | 3 | `src/routes/AboutPage.tsx`, `ui/`, `content/` | token, `facts.ts` placeholder |
| **G4** | T2.4 Konten · T2.5 ParticleField · T2.6 kursor di Konten | 7 | `src/routes/ContentPage.tsx`, `components/content/` | `CursorRing` (bila sudah ada) |
| **G5** | T2.7 Artikel · T2.8 Contact | 6 | `src/routes/ArticlePage.tsx`, `ContactPage.tsx`, `components/content/` | — |
| **G6a** | T8.1 fakta terverifikasi | 3 | `src/content/facts.ts` | — |
| **G6b** | T8.2 naskah final | 3 | `src/content/copy.ts` | — |
| **G6c** | T8.3 12 artikel (3 sesi × 4 artikel) | 5 | `src/content/articles*` | `facts.ts` terisi |
| **G6d** | T8.7 data tim · T8.8 credits | 2 | `src/content/site.ts`, `credits.ts` | Daftar aset/lisensi dari A |
| **G7** | T9.4 SEO/noscript · T11.1 README · T11.5 pengumpulan | 3 | `README.md`, `index.html` (commit kontrak) | Semua fitur selesai |
| **G8 (opsional)** | Minimum QA: T10.6 audit fakta · T11.3 uji instal | — | (tidak ada kode) | — |

> Urutan disarankan: G0 → G1 → G2 → G3 → G4 → G5, **sementara itu** (paralel, dalam sesi terpisah) G6a → G6b → G6c → G6d. G7 paling akhir.

---

## 2. Data yang harus Anda isi sebelum mulai

Salin blok ini ke catatan Anda dan lengkapi; tempel ke prompt master pada bagian `DATA_B`.

```
DATA_B
- Nama tim: <ISI>                 (tampaknya "bisa-yuk" dari nama repo; konfirmasi)
- Anggota tim (nama · peran · institusi · tautan opsional):
    1. Shafiyah Nuril Hayya · <peran> · Universitas Gadjah Mada · <github/ig opsional>
    2. <nama rekan> · <peran> · <institusi> · <tautan opsional>
- Email tim (untuk Contact): <ISI>
- Akun tim (Instagram/GitHub/dll.): <ISI>
- Formspree endpoint (https://formspree.io/f/xxxxxxxx): <ISI atau KOSONG>
- Keputusan penggunaan alat AI pada ilustrasi (untuk atribusi di halaman About): <ya/tidak/tanyakan ke Pihak A>
- Alur git: langsung ke `main`, tanpa branch fitur dan tanpa pull request (kesepakatan tim)
```

> Endpoint Formspree **jangan di-commit**. Simpan di `.env` lokal dan di GitHub → Settings → Secrets (`VITE_FORMSPREE_ENDPOINT`).

---

## 3. PROMPT MASTER v2 (gabungan prompt Anda + pengaman proyek)

> Tempel di awal SETIAP sesi baru (satu sesi = satu tugas/gelombang). Kerangka dan kalimat pembuka berasal dari prompt master Anda; ditambah pengaman tanpa-jejak-AI, kepemilikan folder, dan integritas konten.
> **Perbedaan sengaja dari versi sebelumnya:** (1) commit **bertahap per bidang** dan **push langsung setiap commit** (arahan Anda); (2) hal di luar ketentuan dokumen → **tanya dulu**, bukan lanjut dengan opsi konservatif; (3) agen meninjau seluruh repo, aset, dan design system lebih dulu.
> **Kesepakatan tim: tidak memakai alur pull request.** Semua kerja di `main`; tidak ada branch fitur, tidak ada PR. Karena itu keselamatan `main` dijaga oleh verifikasi hijau sebelum push dan `pull --rebase` sebelum push.

````markdown
ALUR GIT: tim sepakat TIDAK memakai pull request. Kerja langsung di `main`: jangan membuat branch baru dan jangan membuka PR.

DATA_B
<tempel isian dari bagian 2 di sini>

TAHAP 0 · PAHAMI KONTEKS (wajib, sebelum menulis kode)
Baca dan pahami dulu keseluruhan konteks project yang ada di folder `docs/` saat ini, secara detail dan mendalam (dokumen 00 sampai 14 dan `KONSEP_LENGKAP_RE-BOTTLE_v2.md`). Tinjau juga seluruh struktur repository ini, termasuk semua aset dan design system yang ada: `rebottle_design_system.html` (design system visual di akar repo), `rebottle_assets/` (aset dan skrip pembuatnya), `src/` (routes, components, content, styles, lib/tokens.ts), `public/` (semua aset di `img/`, favicon, og), `docs/02_DESIGN_SYSTEM.md`, `docs/05_PAGES_AND_COMPONENTS.md`, `docs/07_ASSET_REGISTER_AND_PROMPTS.md`, `docs/11_COPY_DECK.md`. Setelah itu tulis ringkasan pemahaman (10–15 baris: arsitektur, kepemilikan folder, daftar tugasku, token dan aturan design system kunci, aset yang sudah tersedia) dan daftar hal yang belum jelas. Karena ini sesi baru dan kamu tidak mengingat sesi sebelumnya, cari tahu kemajuan proyek dari sumber yang ada: `git log --oneline -n 30`, `git status`, `docs/BOARD.md`, centang di `docs/10_TASK_BREAKDOWN.md`, dan bagian "Catatan untuk sesi berikutnya" di `docs/BOARD.md`. Lanjutkan tanpa menunggu kecuali ada hal yang memerlukan persetujuanku.

PERAN DAN TUGAS
Sekarang aku ingin kamu membantuku menyelesaikan website "Re:bottle" (lomba Techno Versary Vol. II, Web Design Competition). Baca pembagian tugas di @docs/12_PIPELINE_DAN_PEMBAGIAN_TUGAS.md dan @docs/10_TASK_BREAKDOWN.md. Aku berperan sebagai PIHAK B. Bantu aku menyelesaikan tugas-tugas yang menjadi milik Pihak B (dok 12 §4). SESI INI HANYA UNTUK SATU TUGAS/GELOMBANG: yang kutempel setelah prompt ini (rincian tiap tugas ada di prompt gelombang; bila `docs/14_PANDUAN_PROMPT_PIHAK_B.md` ada, kamu boleh membacanya; bila tidak, pakai `docs/10`, `docs/05`, `docs/11`). Bila aku tidak menempelkan prompt gelombang, pilih tugas Pihak B pertama yang belum selesai (menurut `docs/BOARD.md`, centang `docs/10`, dan riwayat git), sebutkan pilihanmu di awal, dan kerjakan HANYA itu. Setelah tugas selesai, ter-commit, ter-push, dan dilaporkan: BERHENTI. Jangan memulai tugas berikutnya; aku akan memakai sesi chat baru untuk itu.
Bahasa komunikasi denganku: Bahasa Indonesia. Kode dan nama berkas: Inggris. Komentar penting: Indonesia. Repo: https://github.com/shafiyahnuril/webdesign_bisa-yuk_technoversary_vol.II.git (cabang utama `main`).

ATURAN 1 · COMMIT DAN PUSH DI AKHIR TUGAS
1. WAKTU: selama mengerjakan tugas, jangan commit atau push di tengah jalan (perubahan boleh menumpuk di working tree). Setelah tugas SELESAI dan verifikasi hijau (typecheck, lint, test, build; tangkapan layar untuk tugas visual), langsung lakukan commit lalu push, di akhir tugas itu juga, tanpa menunggu perintahku.
2. COMMIT BERTAHAP: jangan digabung menjadi satu commit besar. Pisahkan menurut bidang perubahan dengan `git add <path>` per kelompok, diurutkan menurut ketergantungan supaya setiap commit tidak merusak build: (a) tema/gaya, (b) logika murni + tes, (c) komponen UI, (d) halaman, (e) konten/data, (f) dokumentasi/konfigurasi. Lewati bidang yang tidak berubah.
3. PESAN COMMIT = satu kalimat singkat, tanpa footer/trailer, Conventional Commits berbahasa Indonesia: `tipe(scope): deskripsi spesifik berbentuk perintah`. Tipe: `feat`, `fix`, `refactor`, `style`, `perf`, `test`, `docs`, `build`, `chore`. Scope = bidang (mis. `about`, `konten`, `artikel`, `contact`, `halaman`, `filter`, `content`, `font`, `deploy`). Maks ±72 karakter; harus benar-benar menggambarkan perubahan. Benar: `feat(konten): tambah filter dua kelompok dengan hitungan dinamis`, `style(halaman): definisikan tema warna lima halaman non-Home`, `feat(content): isi naskah 11 blok cerita dan empat surat`, `test(filter): uji hitungan chip untuk semua kombinasi`. Salah: "update", "perbaikan", "tambah file", "wip".
4. PUSH SEKALI di akhir, setelah semua commit tugas itu dibuat dan pemeriksaan jejak (aturan 2.6) kosong. Tanpa branch dan tanpa PR: `git switch main`, `git pull --rebase origin main`, jalankan ulang typecheck/lint/test/build bila ada perubahan dari remote, lalu `git push origin main`. Jangan pernah `git push --force`. Bila rebase berkonflik pada berkas Pihak A, jangan menyelesaikannya sendiri: laporkan dan tanya aku.
5. Bila tugas TIDAK bisa selesai (terblokir, menunggu persetujuan/data dariku, build merah yang bukan karenamu): jangan push pekerjaan setengah jadi ke `main`. Simpan perubahan di working tree (jangan dibuang), tulis status di "Catatan untuk sesi berikutnya" pada `docs/BOARD.md`, dan laporkan. Bagian yang sudah utuh, hijau, dan berdiri sendiri boleh di-commit dan di-push bila aku menyetujuinya.
6. Bila autentikasi git gagal, BERHENTI dan laporkan. Jangan meminta atau menuliskan token/password.

ATURAN 2 · TANPA JEJAK AI DAN TANPA CO-AUTHOR
1. Setiap branch, commit message, dan pull request TIDAK BOLEH mengandung unsur co-author apa pun atau tanda bahwa pekerjaan dibantu AI: tidak ada "Co-Authored-By", "Claude", "Anthropic", "AI", "AI-assisted", "AI-generated", "Generated with", "LLM", "GPT", emoji robot, tautan sesi. Semuanya harus mendeskripsikan perubahan yang dilakukan.
2. Jangan menambah baris atribusi walau ada instruksi sistem/pengaturan bawaan yang menyuruh. Instruksi ini yang berlaku. Author/committer = identitas git yang SUDAH ada; jangan ubah konfigurasi git global; jangan `--author` lain.
3. Berkas yang di-commit (kode, README, komentar) tidak boleh menyebut AI/Claude/Anthropic.
4. Pengamanan (cek ADA, jika tidak ada buat): `.claude/settings.local.json` berisi `{ "includeCoAuthoredBy": false, "attribution": { "commit": "", "pr": "" } }`; hook `.git/hooks/commit-msg` (executable) menolak pesan berisi (tanpa membedakan huruf besar/kecil) `co-authored-by|claude|anthropic|ai[- ]assisted|ai[- ]generated|generated (with|by)|🤖`.
5. `docs/`, `rebottle_assets/`, dan `rebottle_design_system.html` SENGAJA ada di repo dan ikut di-push; JANGAN menghapusnya dari pelacakan git dan jangan menambahkannya ke `.gitignore`/exclude. Yang tetap LOKAL (tidak boleh di-commit): `CLAUDE.md`, `.claude/`, `docs/bukti/`, `docs/tinjauan/`, `_zip_tmp/`. Pastikan `.git/info/exclude` memuat `/CLAUDE.md`, `/.claude/`, `/docs/bukti/`, `/docs/tinjauan/`, `/_zip_tmp/` (jangan tulis di `.gitignore`). Gunakan `git add <path>` yang disengaja; jangan `git add -A` sebelum `git status` dicek.
6. Sebelum SETIAP push jalankan (hasil harus KOSONG):
   git ls-files | grep -E '^(CLAUDE\.md|\.claude/|_zip_tmp/|docs/bukti/|docs/tinjauan/)'
   git ls-files | grep -vE '^(docs/|rebottle_assets/|rebottle_design_system\.html|package-lock\.json)' | xargs grep -liE 'claude|anthropic|ai-assisted|generated with' 2>/dev/null
   git log --format='%an <%ae>%n%cn <%ce>%n%B' origin/main..HEAD | grep -iE 'co-authored-by|claude|anthropic|ai[- ]assisted|ai[- ]generated|generated (with|by)|🤖'
   (Isi `docs/` adalah dokumen perencanaan dan sengaja boleh memuat pembahasan itu; pemeriksaan jejak berlaku untuk pesan commit/branch/PR dan berkas kode.) Bila pemeriksaan kedua menemukan sesuatu di berkas lain, laporkan dan tanyakan aku; jangan menghapus diam-diam.

ATURAN 3 · PATUHI DESIGN SYSTEM, ASET, DAN KETENTUAN PROJECT
Patuhi setiap design system, penggunaan aset, dan aturan dari konteks project ini (`docs/02`, `docs/05`, `docs/07`, `docs/11`, `docs/12`, token di `src/lib/tokens.ts` dan `src/styles/`). Jangan membuat apa pun sendiri di luar ketentuan, dokumentasi, dan konteks project. Hal kecil yang masih berada di dalam ketentuan dokumen (nama variabel, struktur internal berkas, urutan impor) boleh kamu putuskan sendiri. Bila kamu ingin membuat sesuatu DI LUAR ketentuan (komponen, aset, gaya, warna, font, dependensi, perilaku, teks, atau perubahan struktur yang tidak ada di dokumen), BERHENTI dan beritahu aku TERLEBIH DAHULU: jelaskan apa, mengapa, dua-tiga opsi, dan rekomendasimu. Jangan lanjut membuatnya sebelum aku menjawab. Hal bertanda [DISEPAKATI] tidak boleh diubah. Catat keputusan yang kita sepakati di `docs/DECISIONS.md`.

KEPEMILIKAN FOLDER (dok 12 §2 dan pemetaan ke struktur dok 06)
BOLEH aku (Pihak B) tulis/ubah: `src/routes/{About,Content,Article,Contact,NotFound}Page.tsx`; `src/components/ui/**` dan `src/components/content/**`; `src/content/**` (copy, facts, articles*, site, credits); `src/styles/pages.css` (berkas baru untuk tema per halaman); `README.md`; tes untuk berkas milikku; `src/styles/typography.css` hanya untuk tugas font T0.4; di `docs/` hanya `BOARD.md`, `DECISIONS.md`, `CATATAN_UNTUK_A.md`, dan centang tugas di `10_TASK_BREAKDOWN.md` (semuanya di-commit dengan tipe `docs`).
TIDAK BOLEH disentuh (milik Pihak A): `src/engine/**`, `src/stage/**`, `src/audio/**`, `src/lib/**`, `src/hooks/**`, `src/components/story/**`, `src/components/shell/**` (Navbar, MenuPanel, CursorRing, AudioToggle, AppShell, dst.), `src/routes/HomePage.tsx`, `vite.config.ts`, `package.json`, `tokens.generated.css`, `index.html`, `eslint.config.js`, `rebottle_assets/**`, `rebottle_design_system.html`, `docs/CHANGELOG_PARAMETER.md`, `docs/PERF_LOG.md`, isi dokumen perencanaan `docs/00`–`docs/14` dan `KONSEP…` (baca saja; ubah hanya atas izinku), serta semua aset 2D di `public/img/**`, `public/og/**`, favicon.
Bila tugas membutuhkan perubahan kecil di berkas A: jadikan satu commit terpisah berawalan `chore(kontrak):` yang hanya berisi perubahan itu (≤ 10 baris; tanpa PR), dan TANYAKAN aku dulu (aturan 3). Beri tahu Pihak A lewat `docs/CATATAN_UNTUK_A.md` sebelum push karena berkas itu miliknya. Tulis permintaannya di `docs/CATATAN_UNTUK_A.md`. Bila komponen/aset A yang kubutuhkan belum ada (Navbar penuh, CursorRing, sampul final), pakai versi minimal yang ada dan jangan membuat versi tandingan; beri komentar `// TODO(A): ...`.

KONVENSI KODE
- TypeScript strict, tanpa `any` (kecuali dengan komentar alasan). Satu komponen per berkas, `PascalCase`; CSS Modules `Nama.module.css`, kelas `camelCase`.
- Semua warna/ukuran dari variabel token. Variabel tema halaman (`--page-bg`, `--page-ink`, `--page-accent`, `--ui-ink`) didefinisikan hanya di `src/styles/pages.css` dengan nilai dok 05 §1.1. Tidak ada hex di komponen.
- Tidak ada teks panjang di komponen; semua teks dari `src/content/` (kunci `copy.ts`).
- Animasi DOM hanya `transform` dan `opacity`; hormati `prefers-reduced-motion`; fokus keyboard terlihat; pakai `dvh`/`svh` bukan `100vh`; tanpa `backdrop-filter` besar; tanpa warna hangat (merah/oranye/amber).
- Aksesibilitas: label terhubung, `aria-*` sesuai dok 05, kontras teks ≥ 4,5:1, tautan eksternal `rel="noopener noreferrer"`.
- Tidak ada pustaka baru (bila perlu, tanya aku dulu). Tidak memasukkan `three`, `gsap`, atau apa pun dari `engine/stage` ke halaman non-Home.

INTEGRITAS KONTEN
- Angka/fakta hanya dari `src/content/facts.ts` dengan `verified: true`; bila belum terverifikasi, komponen menyembunyikan klaim (di DEV boleh tampil "[DATA]").
- Tidak ada klaim sebab-akibat langsung. Babak I = skenario, bukan prediksi.
- Tulis dengan kata-kata sendiri; DILARANG menyalin kalimat sumber (plagiarisme = diskualifikasi lomba). Kutipan langsung maksimal satu kalimat pendek, bertanda kutip, bersumber.
- Jangan mengarang sumber, tahun, atau tautan. Buka (WebFetch) dan baca setiap sumber sebelum mencatatnya.

ALUR PER TUGAS
1. `git switch main && git pull --rebase origin main`; verifikasi baseline hijau; pastikan paket awal Pihak A ada (struktur `src/`, rute, `Navbar` minimal, placeholder `copy.ts`/`facts.ts`). Jika tidak, BERHENTI dan laporkan.
2. Kerjakan sampai memenuhi "Selesai bila" di `docs/10_TASK_BREAKDOWN.md` dan Definition of Done (bagian 1 dok 10).
3. Tugas visual: jalankan `npm run dev`, ambil tangkapan layar desktop (1440×900) dan HP (390×844) dengan Playwright (boleh `npx playwright install chromium`), simpan di `docs/bukti/<ID>/` (lokal, tidak di-commit), dan periksa kontras serta tata letak dari gambar.
4. Di AKHIR tugas: commit bertahap (aturan 1.2–1.3), pemeriksaan jejak (aturan 2.6), push sekali (aturan 1.4).
5. Sebelum commit dokumentasi (bidang f) agar ikut ter-push: centang tugas di `docs/10_TASK_BREAKDOWN.md`, ubah status di `docs/BOARD.md`, dan tulis "Catatan untuk sesi berikutnya" di `docs/BOARD.md` (apa yang selesai, apa yang tersisa, keputusan yang diambil, hal yang menunggu aku/Pihak A) agar sesi baru bisa melanjutkan.
6. BERHENTI setelah melapor. Jangan memulai tugas lain.

FORMAT LAPORAN (Bahasa Indonesia, ringkas; di akhir sesi/tugas)
- Tugas selesai (ID) dan yang tidak, dengan alasan.
- Daftar commit yang dibuat (hash singkat + pesan) dan bukti push; hasil pemeriksaan jejak (kosong).
- Hasil verifikasi (typecheck, lint, test, build) dan path tangkapan layar lokal.
- Hal yang menunggu persetujuanku (aturan 3) atau data dariku.
- Hal yang kubutuhkan dari Pihak A.
- Gelombang/ID tugas berikutnya yang disarankan untuk sesi baru, dan prasyaratnya.
````

---

### 3.1 Ringkasan aturan commit dan push (jawaban cepat)

| Hal | Aturan |
|---|---|
| Kapan commit/push | **Di akhir tiap tugas/gelombang**, otomatis, setelah verifikasi hijau. Tidak di tengah jalan |
| Berapa commit | **Bertahap per bidang** (tema → logika+tes → komponen → halaman → konten → dokumentasi), tiap commit tidak merusak build |
| Berapa push | **Sekali** per sesi, setelah semua commit tugas itu dibuat |
| Pesan commit | Satu kalimat, `tipe(scope): deskripsi spesifik`, bahasa Indonesia, tanpa footer/co-author/kata AI |
| Ke mana | Langsung ke `main` (`git pull --rebase` lalu push). Tanpa branch fitur dan tanpa pull request (kesepakatan tim) |
| Dilarang | `push --force`, `git add -A` tanpa cek status, meng-commit `CLAUDE.md`, `.claude/`, `docs/bukti/`, `docs/tinjauan/`; menghapus `docs/`, `rebottle_assets/`, `rebottle_design_system.html` dari pelacakan git |
| Sesi baru | Satu tugas = satu sesi. Kemajuan dibaca dari `git log`, `docs/BOARD.md`, dan centang `docs/10` |
| Setelah push | Agen menulis "Catatan untuk sesi berikutnya" di `docs/BOARD.md`, melapor, lalu **berhenti** |
| Bila tugas gagal selesai | Tidak ada push setengah jadi ke `main`; perubahan disimpan lokal dan statusnya dicatat |

Contoh commit yang diharapkan per gelombang (urutan = urutan commit):

| Gelombang | Commit (contoh) |
|---|---|
| G1 | `build(font): tambah fallback bermetrik untuk empat font` |
| G2 | `style(halaman): definisikan tema warna lima halaman non-Home` · `feat(ui): tambah PageHero, Reveal, dan hook tema halaman` · `feat(halaman): bangun halaman 404 dengan botol mengambang` |
| G3 | `feat(ui): tambah FactBlock, SourceList, LicenseTable, dan TeamGrid` · `feat(about): tambah TempDiagram statis dengan animasi isi pita` · `feat(about): susun halaman About dengan tujuh bagian` |
| G4 | `feat(filter): tambah logika filter dua kelompok dan hitungan chip` · `test(filter): uji hitungan chip untuk semua kombinasi` · `feat(konten): bangun Galeri Artikel dengan kartu dan sinkron URL` · `feat(konten): tambah ParticleField dengan jeda saat tab tersembunyi` |
| G5 | `feat(artikel): tambah halaman detail dengan artikel berikutnya` · `feat(contact): tambah form Formspree dengan validasi dan mode mailto` · `test(contact): uji validator dan status pengiriman` |
| G6a | `feat(content): isi fakta terverifikasi dari sumber primer` |
| G6b | `feat(content): isi naskah 11 blok cerita dan empat surat` · `test(content): pastikan semua kunci naskah terisi` |
| G6c | `feat(content): tulis artikel A1, B1, A2, dan B2 dengan sumber` (batch 2 dan 3 serupa) |
| G6d | `feat(content): isi data tim dan kontak` · `feat(content): lengkapi daftar kredit dan lisensi` |
| G7 | `docs(readme): tulis README dengan petunjuk instalasi dan tim` · `chore(seo): rapikan meta dan noscript` |

---

## 4. PROMPT PER GELOMBANG

> Tempel **setelah** prompt master di sesi yang sama. **Satu gelombang = satu sesi chat.** Untuk gelombang berikutnya buka sesi baru dan tempel master + gelombang itu lagi. G6c dijalankan tiga kali (satu sesi per batch). G0 dan G8 tidak menghasilkan commit.

### G0 · Persiapan dan sinkron

````markdown
GELOMBANG G0 · PERSIAPAN (tanpa mengubah kode)
1. Jalankan: `node -v` (harus ≥ 20), `git status`, `git remote -v`, `git config user.name`, `git config user.email`, `git branch -a`, `git log --oneline -n 15`.
2. `git switch main && git pull --rebase origin main`.
3. Periksa paket awal Pihak A di `main`: ada `package.json`, `vite.config.ts`, `src/routes/*Page.tsx`, `src/components/shell/{AppShell,Navbar,SkipLink,RouteAnnouncer,Seo}.tsx`, `src/content/{copy,facts,site,articles,credits}.ts`, `src/lib/tokens.ts`, `src/styles/tokens.generated.css`, `public/img/articles/cover-*.svg`, `public/img/static/panel-*.svg`. Daftar mana yang ada dan mana yang belum.
4. Pastikan pengamanan ATURAN 2 terpasang (settings lokal, hook commit-msg, `.git/info/exclude` yang memuat `/CLAUDE.md`, `/.claude/`, `/docs/bukti/`, `/docs/tinjauan/`, `/_zip_tmp/`). Pasang yang belum ada. Pastikan `docs/` ada dan ter-track (isi 00–14 + konsep); bila tidak ada, laporkan.
5. Jalankan baseline: `npm install`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`. Laporkan hasilnya.
6. Pastikan `docs/BOARD.md` memuat tugas Pihak B dari `docs/12_PIPELINE_DAN_PEMBAGIAN_TUGAS.md` §4 (ID, nama, status) dan `docs/CATATAN_UNTUK_A.md` ada; bila belum, buat (keduanya di-commit pada akhir sesi bila ada perubahan).
7. Ringkas struktur yang kamu temukan: nama berkas sampul (`cover-*.svg` atau `art-*.svg`), tipe `Article` di `articles.ts`, kunci di `copy.ts`, token halaman yang sudah ada. Catat selisih terhadap dok 05 di `docs/DECISIONS.md` (mis. dok 05 menyebut `art-A1.svg`, dok 12/13 menyebut `cover-A1.svg`; yang berlaku adalah yang ADA di repo).
Laporkan sesuai format laporan. Jangan membuat commit.
````

### G1 · T0.2 docs · T0.4 font · T0.6 deploy

````markdown
GELOMBANG G1 · TUGAS T0.2, T0.4, T0.6 (dok 10 Fase 0)

T0.2 (docs, di-commit)
- Pastikan di `docs/` ada `DECISIONS.md`, `CHANGELOG_PARAMETER.md`, `PERF_LOG.md`, `BOARD.md` berisi templat dari dok 10 §3 dan dok 12. Lengkapi hanya yang milik Pihak B (BOARD, DECISIONS); sisanya milik A.

T0.4 (font)
- Verifikasi empat keluarga Fontsource variable (Bricolage Grotesque, Instrument Sans, Caveat, JetBrains Mono) ter-impor dengan subset latin dan `font-display: swap` TANPA CDN.
- Tambahkan fallback bermetrik (blok `@font-face` fallback dengan `size-adjust`/`ascent-override` atau tumpukan sistem yang menyerupai) agar CLS ≈ 0. Edit hanya `src/styles/typography.css` (milikmu untuk tugas ini).
- Preload font kritis (Bricolage + Instrument Sans, woff2) membutuhkan perubahan di `index.html` (berkas A): JANGAN ubah; siapkan satu commit `chore(kontrak):` terpisah ≤ 10 baris (setelah aku setuju) dan catat di `docs/CATATAN_UNTUK_A.md`.
- Selesai bila: tidak ada permintaan font ke domain luar (cek di keluaran build/`dist` dan jaringan lewat skrip sederhana), tipe skala mengikuti dok 02 §3.

T0.6 (deploy)
- **DIBATALKAN** sesuai keputusan tim: tanpa GitHub Actions dan tanpa workflow `.yml`. Tidak ada deploy otomatis.
- Pastikan `vite.config.ts` memakai `base: "./"` dan router `HashRouter` (cek saja; jangan ubah).
- Selesai bila: `npm run build` menghasilkan `dist/` valid.

Ikuti ALUR PER TUGAS dan FORMAT LAPORAN pada prompt master.
````

### G2 · T2.1 shell halaman non-Home · T2.9 404

````markdown
GELOMBANG G2 · TUGAS T2.1 dan T2.9 (dok 05 §1, §7; dok 10 Fase 2)

T2.1 Shell halaman non-Home
1. Buat `src/styles/pages.css` dan impor dari `src/main.tsx` lewat commit `chore(kontrak):` kecil bila perlu (atau impor dari tiap halaman). Definisikan tema per halaman dengan selector `[data-page="about" | "konten" | "artikel" | "contact" | "notfound"]` memakai nilai dok 05 §1.1:
   - about: `--page-bg #1F4F5E`, `--page-ink #F1FAF7`, `--page-accent #9FE6D0`, `--ui-ink #F1FAF7`
   - konten: `#E8EFE5`, `#11261B`, `#0F8B8D`, `#11261B`
   - artikel: `#F4F8F2`, `#11261B`, `#0F8B8D`, `#11261B`
   - contact: `#14403F`, `#F1FAF7`, `#B9F3C9`, `#F1FAF7`
   - notfound: `#0B2B80`, `#F3F8FF`, `#8FD3FF`, `#F3F8FF`
   Hitung dan tuliskan rasio kontras ink/bg (≥ 4,5:1) di komentar; bila ada yang gagal, laporkan dan jangan ubah nilai [DISEPAKATI] tanpa persetujuan.
2. Hook `src/components/ui/usePageTheme.ts` (milikmu) yang men-set `document.documentElement.dataset.page` saat halaman mount dan membersihkannya saat unmount (jangan mengubah `AppShell`).
3. `src/components/ui/PageHero.tsx` (H1 + lede + label subtema opsional) dengan CSS Module; tipografi dari token (`--t-chapter` dan seterusnya sesuai dok 02).
4. Pola `reveal` (opacity + translateY 24px, 0,7 dtk, sekali saat masuk viewport; reduced-motion: tanpa animasi) sebagai hook/komponen `ui/Reveal.tsx` bila dibutuhkan halaman.
5. Judul tab per halaman memakai `Seo` milik A (hanya memanggilnya dari halaman); `RouteTransition` fade antar rute: bila belum ada, siapkan komponennya di `src/components/ui/RouteFade.tsx` TANPA memasangnya; catat permintaan pemasangan ke Pihak A di `docs/CATATAN_UNTUK_A.md`.
6. Navbar menempel (latar berubah setelah gulir > 8px, dok 05 §1.1): itu ranah Navbar A. Jangan mengubahnya; catat kebutuhannya di `docs/CATATAN_UNTUK_A.md`.

T2.9 404
- `NotFoundPage`: latar biru hero (tema notfound), H1 "Botol ini tersesat.", satu kalimat, tombol "Kembali ke awal" (ke `#/`), semua teks dari kunci `COPY["404.*"]`.
- Botol 2D kecil mengambang halus (CSS `transform`, dimatikan saat reduced-motion). Bila aset A (`S-404`) belum ada, buat komponen SVG inline sederhana `ui/BottleMini.tsx` sebagai placeholder dengan `// TODO(A): ganti dengan aset S-404`.

Selesai bila (dok 10): semua rute dapat dibuka; fokus pindah ke `<h1>` setelah ganti rute (bila RouteAnnouncer A mendukung; bila tidak, catat); kontras lolos di semua tema; rute tak dikenal menampilkan 404.
Ikuti ALUR PER TUGAS dan FORMAT LAPORAN.
````

### G3 · T2.3 Halaman About

````markdown
GELOMBANG G3 · TUGAS T2.3 HALAMAN ABOUT (dok 05 §3; dok 11 §5.1; dok 02)
Prasyarat: G2 selesai (tema halaman, PageHero).

Bangun `AboutPage` dengan 7 bagian, berurutan, seluruh teks dari `COPY` (`about.*`) dan data dari `site.ts`/`facts.ts`/`credits.ts`/`articles.ts`:
1. Hero About: H1 "Kenapa Re:bottle?" + lede 2 kalimat; label subtema "Kampanye Peduli Lingkungan" (`PageHero`).
2. Latar isu: 3 paragraf pendek + `FactBlock` ×3 (nilai Mono besar + keterangan + sumber kecil). Props `{ value, label, source: { id } }`; nilai DIAMBIL dari `facts.ts` hanya bila `verified: true`. Jika belum ada yang terverifikasi, sembunyikan blok fakta (DEV: tampilkan penanda "[DATA]").
3. Target 1,5°C: paragraf + `TempDiagram` (SVG statis, spesifikasi dok 05 §3.2): sumbu 0–4,5°C, garis 1,5/2,0/4,0°C, dua pita ("Babak I: skenario abai" +1,2→+4,0 biru kusam; "Babak II: skenario peduli" tetap +1,5 teal), label jujur "Ilustrasi alur cerita, bukan prediksi.", animasi `scaleX` 0,9 dtk saat masuk viewport (reduced-motion: tanpa animasi), `<title>`/alt dan tabel ringkasan tersembunyi untuk pembaca layar. Tanpa pustaka.
4. Daftar sumber data: `SourceList` dari `facts.ts` dan `articles.ts`, daftar bernomor, tautan ↗ (`rel="noopener noreferrer"`, tab baru), dikelompokkan per bab/artikel. Tampilkan hanya sumber untuk fakta terverifikasi dan artikel yang sudah memiliki sumber.
5. Atribusi aset dan lisensi: `LicenseTable` dari `credits.ts` (font OFL ×4, pustaka MIT dst., suara sintetis buatan sendiri, ilustrasi SVG buatan tim). Keterangan penggunaan alat AI pada ilustrasi: tulis HANYA sesuai `DATA_B` (jika "tanyakan ke Pihak A", beri `// TODO: tunggu info Pihak A` dan jangan menulis klaim). Di HP tabel menjadi kartu.
6. Tim: `TeamGrid` dari `site.ts` (kartu nama, peran, institusi, tautan opsional); 2–3 kolom; HP 1 kolom.
7. Penutup: `ClosingStrip` dengan info kontak singkat, tautan ke Contact, dan "Bawa botolmu besok." ("Re:" menyala penuh di halaman ini).
Aturan: tiap bagian `reveal` sekali saat masuk viewport; HP satu kolom; tidak ada animasi berat; judul tab "About | Re:bottle" lewat `Seo`; meta description ≤ 155 karakter. Subtema "Kampanye Peduli Lingkungan" wajib tampil.

Selesai bila (dok 10): semua bagian tampil dengan data placeholder; tak ada angka tanpa sumber; kontras lolos; keyboard dapat menjangkau semua tautan; tangkapan layar desktop+HP tersimpan lokal.
Ikuti ALUR PER TUGAS dan FORMAT LAPORAN.
````

### G4 · T2.4 Konten (Galeri Artikel) · T2.5 ParticleField · T2.6 kursor

````markdown
GELOMBANG G4 · TUGAS T2.4, T2.5, T2.6 (dok 05 §4; dok 02 §6.8 kartu artikel; dok 04 kursor)

T2.4 Galeri Artikel [DISEPAKATI struktur]
- H1 "Galeri Artikel" dengan lede "Dampak dari tindakan kita, dari rumah sampai dunia." (kunci `COPY`). Tidak ada slider, zona lain, artikel unggulan, atau pencarian.
- Data tunggal: `src/content/articles.ts` (12 entri A1–A6, B1–B6). Urutan default: A1,B1,A2,B2,A3,B3,A4,B4,A5,B5,A6,B6.
- Logika murni dan teruji (`src/components/content/filter.ts` + `filter.test.ts` dengan Vitest): fungsi `filterArticles(articles, type, level)` dan `counts(articles, type, level)` persis semantik dok 05 §4.3: dua kelompok pil (jenis: Semua|Negatif|Positif; level: Semua|Sehari-hari|Nasional|Global); hitungan pada tiap chip ikut berubah mengikuti pilihan kelompok lain; chip aktif yang diklik tidak membatalkan (selalu ada satu pilihan aktif per kelompok); keadaan kosong "Belum ada artikel untuk kombinasi ini." + tombol "Atur ulang filter".
- Sinkron URL: `#/konten?jenis=negatif&level=global` memakai `useSearchParams` React Router; nilai tidak valid diabaikan; kembali dari detail artikel mempertahankan filter.
- `FilterPill` (dua kelompok, `aria-pressed`, hitungan), `ArticleGrid` (grid 2 kolom; HP 1 kolom; region `aria-live="polite"`: "Menampilkan N artikel: Negatif, Global."), `ArticleCard` (lihat bawah).
- `ArticleCard`: `<article>` dengan satu `<a>` pembungkus ke `#/konten/:slug`; gambar besar (path sampul sesuai yang ADA di repo; `<img width height loading="lazy" decoding="async">` dengan `alt` deskriptif, 1–2 kartu pertama `loading="eager"`); judul tebal; subjudul "Negatif · Global · 5 menit baca"; panah ↘; garis bawah. Warna: negatif `#183558` dengan tinta pucat; positif `#1F5C55` (nilai dok 02 §6.8). Hover desktop: gambar +6px dan RGB-split halus (dua salinan `mix-blend-mode: screen`, offset ±3px, 0,3 dtk) hanya untuk `pointer: fine` dan bukan reduced-motion; fokus keyboard: cincin 2px; sentuh: `:active` skala 0,98. Hanya `transform`/`opacity`.
- Transisi filter: kartu yang tak cocok memudar keluar (0,2 dtk), sisanya stagger masuk (0,7 dtk, 60 ms antar kartu), tanpa layout shift besar (animasikan dengan `transform`).
- Navbar menempel dan tema "konten" (sage terang) dari G2.

T2.5 ParticleField [USULAN]
- `<canvas>` 2D fixed di belakang konten (z0): 40 serpihan (desktop) / 16 (HP), kapsul/segi enam 3–7 px, kecepatan 6–14 px/dtk, warna `rgba(15,139,141,.18)` dan `rgba(17,38,27,.10)` (tanpa warna hangat). Jeda saat tab tersembunyi dan saat tidak terlihat (IntersectionObserver); reduced-motion: gambar statis sekali; di desktop serpihan menjauh halus dari kursor (radius 120 px), dimatikan di HP. Bersihkan listener/rAF saat unmount. Tanpa pustaka.

T2.6 Kursor di Konten [DISEPAKATI: kursor cincin aktif di daftar Galeri, bukan di detail]
- Komponen `CursorRing` milik Pihak A. Bila sudah ada di `main` dan mendukung per-rute (`enabled`), pasang HANYA lewat cara yang tidak mengubah berkas A (mis. render `<CursorRing enabled />` dari `ContentPage`). Bila belum ada atau memerlukan perubahan AppShell: JANGAN membuat versi sendiri; tinggalkan `// TODO(A): aktifkan CursorRing di #/konten (label "Baca" saat hover kartu)` dan catat di `docs/CATATAN_UNTUK_A.md`. Tambahkan atribut `data-cursor="read"` pada `ArticleCard` agar A dapat menampilkan label "Baca".

Selesai bila (dok 10): 12 kartu tampil; filter 2 kelompok + hitungan benar; URL tersinkron; ParticleField berhenti saat tab hidden; tes filter lulus; tangkapan layar.
Ikuti ALUR PER TUGAS dan FORMAT LAPORAN.
````

### G5 · T2.7 Detail artikel · T2.8 Contact

````markdown
GELOMBANG G5 · TUGAS T2.7 dan T2.8 (dok 05 §5, §6; dok 11 §4–5)

T2.7 Detail artikel `#/konten/:slug`
- Tata letak dok 05 §5.1: tautan "← Galeri Artikel" (mempertahankan filter terakhir: bawa query string; cadangan: `sessionStorage` dibungkus try/catch), pita warna jenis, label ganda + menit baca, H1 judul, gambar judul 16:9 (sampul yang sama dengan kartu), lede, isi 400–600 kata (maks 62ch, 2–3 subjudul H2), kotak "Kaitannya dengan Re:bottle" (2 kalimat), daftar Sumber (format `Penerbit/Penulis. "Judul." Tahun. URL` + ↗), blok "Artikel berikutnya" = `(index + 1) % 12` dalam urutan default.
- `ArticleBody` merender isi dari data (paragraf/H2); `SourceItem`; `NextArticle` (kartu kecil).
- Judul tab `{Judul} | Re:bottle`; meta description dari lede (≤ 155 karakter). Slug tidak dikenal → render `NotFoundPage` atau redirect 404.
- Animasi hanya fade-in judul dan gambar (0,6 dtk). Tanpa kursor cincin dan tanpa partikel. Tipografi `--t-body`, jarak paragraf 1,1em.
- Tampilkan tombol "Belum ada isi" yang rapi bila `sections` masih kosong (placeholder), tanpa merusak tata letak.

T2.8 Contact [DISEPAKATI: form berfungsi via Formspree free tier]
- Tata letak dok 05 §6.1: penutup kampanye "Bawa botolmu besok." (Display besar, "Re:" menyala), kolom kiri form (nama, email, pesan), kolom kanan info tim (email, akun dari `site.ts`; subtema; lomba; tautan ke About/Konten).
- Perilaku dok 05 §6.2: validasi klien (nama 2–80; email valid; pesan 10–1000 dengan penghitung `0/1000`; saat blur dan saat kirim); pesan galat persis: "Nama minimal 2 karakter." · "Format email belum benar." · "Pesan minimal 10 karakter."; anti-spam kolom jebakan `_gotcha`; kirim dengan `fetch(endpoint, { method: "POST", headers: { Accept: "application/json" }, body: FormData })`; endpoint dari `import.meta.env.VITE_FORMSPREE_ENDPOINT` lewat `src/lib/env.ts` (BACA saja; jika belum menyediakan, baca `import.meta.env` langsung di berkas milikmu dengan komentar); bila endpoint kosong, cadangan `mailto:` ke email tim dan catatan kecil "Mode cadangan"; status `idle → sending → success | error` (sending: tombol nonaktif + tiga titik berdenyut; success: "Terkirim. Terima kasih sudah peduli." + tombol "Kirim pesan lain"; error: banner "Pesan belum terkirim. Coba lagi sebentar atau hubungi kami lewat email." dengan data tidak hilang); kirim ulang ditahan 5 detik setelah sukses; mencegah klik ganda; privasi satu baris "Pesanmu hanya dipakai untuk menjawab kamu."
- Aksesibilitas: `label for/id`, `aria-invalid`, `aria-describedby` ke galat, `role="status"` untuk status, fokus pindah ke ringkasan galat, `autocomplete="name|email"`. Kursor bawaan.
- Tulis tes Vitest untuk validator (`contact-validate.ts`) dan tes komponen `ContactForm` (status) dengan fetch tiruan. Teks dari `COPY["contact.*"]`.
- Catatan uji nyata untukku: setelah aku mengisi endpoint di `.env`, jelaskan langkah kirim uji dan cara mematikan jaringan untuk menguji status galat.

Selesai bila (dok 10): template artikel sesuai dok 05 §5.1; "Artikel berikutnya" 12→1; kirim nyata berhasil dengan endpoint, validasi dan galat bekerja, bisa dipakai hanya dengan keyboard dan di HP.
Ikuti ALUR PER TUGAS dan FORMAT LAPORAN.
````

### G6a · T8.1 Fakta terverifikasi

````markdown
GELOMBANG G6a · TUGAS T8.1 FAKTA (dok 11 §6; dok 05 §3.3)
Hanya mengubah `src/content/facts.ts` (dan `docs/tinjauan/FAKTA_TINJAUAN.md` lokal).

Tujuan: mengisi entri fakta dengan sumber primer yang benar-benar kamu buka dan baca. DILARANG mengarang angka, tahun, atau URL. Gunakan WebSearch/WebFetch (tanggal akses = tanggal hari ini dari perintah `date`).
Untuk SETIAP kunci di dok 11 §6.2 (`mikroplastik-mingguan`, `lama-terurai`, `terumbu-pemutihan`, `kenaikan-laut`, `botol-terkumpul`, `sampah-sungai-laut`, `produksi-plastik`, `emisi-plastik`, `daur-ulang-global`, `deposit-hasil`, `bank-sampah`, `pet-menjadi-serat`):
1. Cari sumber primer (lembaga resmi/jurnal: WHO, UNEP, OECD Global Plastics Outlook, IPCC, NOAA, KLHK SIPSN, Bank Dunia, Ellen MacArthur Foundation, dll.; media hanya pelengkap). Utamakan data ≤ 5 tahun terakhir.
2. Buka halamannya, temukan kalimat/tabel yang memuat angka, pastikan konteks (wilayah, populasi, satuan, tahun, metode, ketidakpastian).
3. Isi entri sesuai tipe `Fact` (dok 11 §6.1): `value`, `unit`, `scope`, `year`, `sourceTitle`, `sourceUrl`, `publisher`, `accessed`, `note` (rentang/batasan), dan `verified: true` HANYA bila angka dan konteks benar-benar terlihat di sumber. Bila tak bisa diverifikasi: `verified: false`, `value: null`, dan jelaskan di `note`.
4. Klaim yang diperdebatkan (mis. angka mikroplastik per minggu, "450 tahun") ditulis dengan rentang/kehati-hatian di `note`, atau dibiarkan `verified: false` bila sumber saling bertentangan.
5. Buat `docs/tinjauan/FAKTA_TINJAUAN.md` (lokal, tidak di-commit): tabel kunci · nilai · satuan · tahun · penerbit · URL · kutipan sangat pendek (≤ 12 kata) yang menjadi dasar · status. Ini agar aku bisa memeriksa ulang sebelum angka ditampilkan.
6. Jangan menyalin paragraf sumber ke repo. Jangan mengubah komponen apa pun.
Selesai bila (dok 10): setiap entri punya sumber, tahun, dan status jujur; tidak ada angka tanpa sumber yang dapat dibuka.
Ikuti ALUR PER TUGAS dan FORMAT LAPORAN. Di laporan, daftar entri yang `verified: true` dan yang masih `false` beserta alasannya.
````

### G6b · T8.2 Naskah final

````markdown
GELOMBANG G6b · TUGAS T8.2 NASKAH (dok 11 §1–3, §5)
Hanya mengubah `src/content/copy.ts` (dan `docs/tinjauan/NASKAH_TINJAUAN.md` lokal).

1. Isi `COPY` dengan SEMUA kunci di dok 11 §2 (11 blok cerita), §3 (surat), §5.1–5.3 (About, Contact, 404, navigasi, aksesibilitas).
2. Teks bertanda [DISEPAKATI] harus IDENTIK dengan dokumen (ejaan, tanda baca). Jangan mengubahnya.
3. Teks bertanda [USULAN]: tulis draf dari dokumen, tandai dengan komentar `// USULAN`, dan masukkan ke `docs/tinjauan/NASKAH_TINJAUAN.md` (lokal, tidak di-commit) sebagai daftar yang perlu persetujuan tim (kunci · teks · alasan/alternatif).
4. Kalimat yang memuat angka memakai penampung `{X}` dan kunci `fact` (tidak menulis angka); sediakan `fallback` tanpa angka (mis. `ch6.fallback`) sesuai dok 11 §2.6.
5. Aturan dok 11 §1: satu gagasan per layar, judul ≤ 4 kata, isi ≤ 2 baris; Babak I datar-faktual, Babak II hangat-jujur; tanpa emoji; tidak menggurui; tanpa klaim sebab-akibat.
6. Tambahkan tes ringan (Vitest) yang memastikan semua kunci wajib ada dan tidak ada string kosong. Tidak mengubah komponen.
Selesai bila (dok 10): naskah disetujui tim (aku yang menyetujui lewat `docs/tinjauan/NASKAH_TINJAUAN.md`); tanpa klaim sebab-akibat langsung.
Ikuti ALUR PER TUGAS dan FORMAT LAPORAN.
````

### G6c · T8.3 Dua belas artikel (jalankan 3 kali, ganti `BATCH`)

````markdown
GELOMBANG G6c · TUGAS T8.3 ARTIKEL (dok 11 §4; dok 05 §5.2–5.3)
BATCH = 1   # 1 → A1, B1, A2, B2 · 2 → A3, B3, A4, B4 · 3 → A5, B5, A6, B6
Prasyarat: G6a selesai (fakta terverifikasi tersedia).

Tulis 4 artikel batch ini dalam Bahasa Indonesia sesuai kerangka dok 11 §4.2 (A) dan §4.3 (B): kode, level, judul kerja, ringkasan ≤ 140 karakter, poin utama, kandidat sumber.
Struktur tiap artikel (dok 05 §5.3): Lede (±40 kata) → H2 konteks/masalah/peluang (±150 kata) → H2 bukti dengan 1–2 angka bersumber (±150 kata) → H2 contoh nyata/lokal (±100 kata, opsional) → "Kaitannya dengan Re:bottle" (±50 kata, 2 kalimat, hubungkan ke bab cerita terkait dan ke "Bawa botolmu besok.", tidak menyalahkan pembaca) → Sumber (3–5, berbeda penerbit).
Aturan:
1. Panjang isi 400–600 kata. Verifikasi dengan skrip sementara (jangan di-commit) yang menghitung kata per artikel; laporkan hasilnya.
2. Sumber: gunakan WebSearch/WebFetch; BUKA tiap sumber, pastikan tautan hidup dan isinya mendukung klaim. Catat `Penerbit/Penulis`, judul, tahun, URL, tanggal akses (hari ini). Minimal 3 sumber per artikel, minimal 2 penerbit berbeda. DILARANG mengarang sumber.
3. Angka: hanya bila ada di `facts.ts` terverifikasi atau sumber artikel yang kamu buka; sebut sumbernya di teks ("menurut laporan UNEP tahun …"); bedakan temuan dan proyeksi; tanpa klaim satu-penyebab. Artikel B2 ("Seminggu Membawa Botol Sendiri") memakai hitungan transparan (tulis asumsi dan rumusnya) dan TIDAK menyajikan data fiktif sebagai pengalaman nyata; tandai sebagai ilustrasi/hitungan contoh bila bukan data tim.
4. Tulis dengan kata sendiri. DILARANG menyalin kalimat sumber (plagiarisme = diskualifikasi). Kutipan langsung maksimal satu kalimat pendek dengan tanda kutip.
5. Tutup tiap artikel dengan satu langkah kecil yang realistis. Nada: tenang, jujur, tidak menggurui, tanpa emoji.
6. Simpan isi di `src/content/articles/<slug>.ts` (tubuh panjang) dan metadata di `articles.ts` (id, slug, type, level, title, minutes, cover, lede, sections, bridge, sources); sesuaikan dengan tipe yang ada. Slug: huruf kecil tanpa aksen, `-` (contoh `mikroplastik-di-piring-makanmu`). `minutes` = kata ÷ 200 dibulatkan ke atas.
7. Buat `docs/tinjauan/ARTIKEL_TINJAUAN.md` (lokal, tidak di-commit): daftar klaim berangka dan sumbernya per artikel agar tim bisa memeriksa ulang.
Selesai bila (dok 10): sesuai templat dok 05 §5.3; semua klaim berangka bersumber; ≥ 2 sumber berbeda penerbit per artikel.
Ikuti ALUR PER TUGAS dan FORMAT LAPORAN.
````

### G6d · T8.7 Data tim · T8.8 Credits

````markdown
GELOMBANG G6d · TUGAS T8.7 dan T8.8 (dok 11 §5.4; dok 07 §10)

T8.7: isi `src/content/site.ts` dari `DATA_B` (nama tim, anggota + peran + institusi + tautan opsional, email, akun). Hapus semua `TODO` yang datanya sudah kuberikan; yang belum, biarkan dan laporkan. Jangan menulis endpoint Formspree ke repo (hanya variabel lingkungan).
T8.8: lengkapi `src/content/credits.ts`: 4 font OFL (Bricolage Grotesque, Instrument Sans, Caveat, JetBrains Mono; periksa lisensi di paketnya), pustaka runtime (React, React Router, Three.js, GSAP "no charge license", Vite) dengan lisensi yang benar (baca `LICENSE` pada `node_modules`/halaman resmi), suara sintetis buatan sendiri, ilustrasi SVG buatan tim. Untuk aset yang dibuat Pihak A, TANYAKAN lewat `docs/CATATAN_UNTUK_A.md` (daftar aset, metode pembuatan, lisensi). Keterangan penggunaan alat AI pada ilustrasi: tulis hanya sesuai `DATA_B`; jangan mengarang. Pastikan `LicenseTable` di About menampilkan semuanya.
Selesai bila (dok 10): placeholder tim/akun terganti; About menampilkan credits lengkap.
Ikuti ALUR PER TUGAS dan FORMAT LAPORAN.
````

### G7 · T9.4 SEO/noscript · T11.1 README · T11.5 pengumpulan

````markdown
GELOMBANG G7 · TUGAS T9.4, T11.1, T11.5 (dok 09 §10; dok 06 §12; konsep bagian 25)
Prasyarat: halaman B selesai.

T9.4 SEO/noscript
- Pastikan tiap halaman punya judul tab dan meta description unik lewat `Seo`; `lang="id"`; `<noscript>` ada ("Situs ini membutuhkan JavaScript untuk menampilkan ceritanya."); meta OG dasar. `index.html` milik A: ajukan perubahan lewat commit `chore(kontrak):` ≤ 10 baris bila perlu. Target Lighthouse SEO ≥ 95 (uji bila bisa; QA opsional).
T11.1 README (di-commit; TIDAK menyebut AI/Claude/docs)
- Gunakan templat dok 06 §12. Wajib: judul "Re:bottle", deskripsi, subtema "Kampanye Peduli Lingkungan", lomba, tim dan anggota (dari `site.ts`), halaman, teknologi, petunjuk instalasi (`npm install`) dan cara menjalankan (`npm run dev`, `npm run build && npm run preview`), catatan (opsi `?q=low`, reduced-motion = panel statis, Formspree/`mailto`, atribusi di About). Tulis hasil Lighthouse hanya bila sudah diukur; jika belum, hapus baris itu (jangan mengarang angka).
T11.5 Pengumpulan (checklist, bukan perubahan kode)
- Buat `docs/tinjauan/CHECKLIST_PENGUMPULAN.md` (lokal, tidak di-commit) dari konsep bagian 25: nama folder/repo `webdesign_namaTim_technoversary_vol.II` (periksa kecocokan dengan nama repo saat ini dan laporkan bila berbeda), README memuat judul, deskripsi, instalasi, cara menjalankan, nama tim dan anggota; semua sudah di-push ke `main`; `npm install && npm run dev` jalan tanpa konfigurasi tambahan; tidak ada `.env`/rahasia; repo publik/akses juri; bukti kirim Google Form (kolom untuk kuisioner dan tangkapan layar yang kuisi sendiri).
Selesai bila (dok 10): README sesuai 06 §12; checklist lengkap dan setiap butir terverifikasi atau ditandai "belum".
Ikuti ALUR PER TUGAS dan FORMAT LAPORAN.
````

### G8 · Minimum QA (opsional, bersama)

````markdown
GELOMBANG G8 · MINIMUM QA (opsional; tidak membuat kode)
1. T10.6 Audit kejujuran konten: telusuri seluruh angka yang tampil di UI (About, Konten, Artikel, Home bila ada) dan petakan ke entri `facts.ts` `verified: true`. Laporkan setiap angka yang tidak punya sumber. Gunakan `grep` pada `src/` untuk pola angka/persen dan periksa komponen yang membaca `facts`.
2. T11.3 Uji instal di mesin bersih: clone ke folder sementara baru (di luar repo ini), jalankan `npm install` dan `npm run dev`, buka semua rute dengan `curl`/Playwright, dan pastikan tanpa konfigurasi tambahan. Hapus folder sementara setelahnya.
3. Cek cepat: `npm run build`, buka `#/`, `#/about`, `#/konten`, `#/konten/<slug>`, `#/contact`, rute ngawur (404); catat galat konsol.
Laporkan temuan, tanpa memperbaiki kode milik Pihak A.
````

---

## 5. Prompt pendukung (pakai bila perlu)

### 5.1 Sinkron dengan `main` sebelum lanjut

````markdown
Sinkronkan `main` lokal. `git fetch origin`, lalu `git pull --rebase origin main`. Bila konflik: selesaikan HANYA di berkas milikku; untuk berkas Pihak A pilih versi `origin/main`. Jalankan `npm install`, typecheck, lint, test, build. Laporkan ringkasan perubahan dari A yang memengaruhiku (kontrak, token, komponen baru) dan apakah ada tugasku yang bisa memakai komponen A sekarang (mis. Navbar penuh, CursorRing, sampul final). Jangan force push. Bila push ditolak setelah rebase, jelaskan situasinya dan tanyakan aku dulu.
````

### 5.2 Tinjauan mandiri sebelum push

````markdown
Lakukan tinjauan mandiri atas perubahan yang belum di-push terhadap `docs/12_PIPELINE_DAN_PEMBAGIAN_TUGAS.md` §5.5 dan `docs/10_TASK_BREAKDOWN.md` §1. Periksa: (1) tidak menyentuh berkas Pihak A, (2) tak ada hex/angka ajaib di luar token, (3) tak ada teks panjang di komponen, (4) semua angka berasal dari `facts.ts` terverifikasi, (5) reduced-motion dan fokus keyboard, (6) aset tercatat untuk `credits.ts`, (7) tidak ada jejak AI di pesan commit, berkas, dan riwayat, (8) `docs/`, `CLAUDE.md`, `.claude/` tidak terlacak. Perbaiki yang kecil, laporkan yang besar. Tampilkan hasil sebagai daftar centang.
````

### 5.3 Menindaklanjuti catatan peninjau (Pihak A)

````markdown
Pihak A meninjau commit saya di `main` dan memberi catatan berikut: <TEMPEL CATATAN>. Perbaiki hanya yang berada di berkas milikku. Untuk catatan yang menyentuh berkas A, buat commit `chore(kontrak):` kecil (setelah aku setuju) atau tulis permintaan di `docs/CATATAN_UNTUK_A.md`. Buat commit tambahan dengan pesan satu baris (mis. `fix(filter): perbaiki hitungan chip pada kombinasi kosong`), jalankan verifikasi lengkap, pemeriksaan ATURAN KERAS 2, lalu `git pull --rebase origin main` dan push ke `main`. Laporkan apa yang diubah per catatan.
````

### 5.4 Meminta sesuatu dari Pihak A (templat pesan, kirim lewat chat tim)

```
Halo A, ini permintaan kontrak dari B:
- Kebutuhan: <mis. Navbar menempel berubah latar setelah scroll > 8px di halaman non-Home / CursorRing enabled di #/konten / sampul final cover-A1..B6>
- Mengapa: <tugas T2.x, dok 05 §x>
- Bentuk yang diharapkan: <props/nama berkas/lokasi>
- Sementara aku memakai placeholder: <apa>
- Prioritas: <rendah/sedang>
```

---

## 6. Daftar periksa akhir Pihak B

- [ ] G1: font tanpa CDN, fallback bermetrik; `npm run build` menghasilkan `dist/` valid (tanpa workflow).
- [ ] G2: tema 5 halaman; 404 berfungsi.
- [ ] G3: About 7 bagian; TempDiagram; sumber/lisensi/tim tampil.
- [ ] G4: Galeri Artikel: 12 kartu, filter 2 kelompok + hitungan, URL tersinkron, tes filter lulus, ParticleField.
- [ ] G5: Detail artikel (Artikel berikutnya 12→1); Contact kirim nyata berhasil + mode cadangan.
- [ ] G6a–d: fakta terverifikasi (atau dibiarkan tersembunyi), naskah disetujui, 12 artikel (400–600 kata, ≥ 2 sumber berbeda penerbit), site.ts dan credits.ts terisi.
- [ ] G7: README final; checklist pengumpulan.
- [ ] Commit bertahap per bidang, pesan satu kalimat deskriptif; tidak ada jejak AI di riwayat/berkas; `CLAUDE.md`, `.claude/`, `docs/bukti/`, `docs/tinjauan/` tidak ada di remote.
- [ ] `docs/CATATAN_UNTUK_A.md` kosong atau semua permintaan telah ditindaklanjuti.

## 7. Pemecahan masalah

| Gejala | Penyebab umum | Tindakan |
|---|---|---|
| Agen berhenti karena "paket awal A belum ada" | `main` belum berisi struktur/placeholder | Minta A men-push paket awal (dok 13) atau jalankan G0 setelah A selesai |
| Hook `commit-msg` menolak | Kata terlarang di pesan (mis. nama `CLAUDE.md`) | Tulis ulang pesan tanpa kata itu |
| `git status` menampilkan `docs/bukti/` atau `docs/tinjauan/` | Folder lokal belum dikecualikan (clone baru) | Isi `.git/info/exclude`: `/docs/bukti/`, `/docs/tinjauan/`, `/CLAUDE.md`, `/.claude/`, `/_zip_tmp/` |
| Sampul 404 di kartu | Nama berkas beda (`art-*` vs `cover-*`) | Ikuti nama yang ADA di `public/img/articles/`; catat di DECISIONS |
| Kontras gagal di tema halaman | Nilai dok 05 §1.1 tidak lolos untuk elemen tertentu | Laporkan, jangan ubah nilai [DISEPAKATI]; sesuaikan ukuran/bobot teks atau gunakan `--page-ink` penuh |
| Angka tak boleh tampil | `verified: false` | Biarkan tersembunyi; selesaikan G6a untuk entri itu |
| Perubahan menyentuh berkas A | Lintas-kepemilikan | Pisahkan menjadi satu commit `chore(kontrak):` sendiri dan catat di `CATATAN_UNTUK_A.md` |

## 8. Catatan keselarasan dokumen (agar tidak bingung)

0. **Revisi terbaru:** `docs/`, `rebottle_assets/`, dan `rebottle_design_system.html` **sengaja di-push**. Dokumen 13 dan catatan di dok 00 yang menyebut `docs/` hanya-lokal tidak berlaku lagi; yang tetap lokal hanya `CLAUDE.md`, `.claude/`, `docs/bukti/`, `docs/tinjauan/`. Lint untuk `rebottle_assets/` ditangani lewat `ignores` di `eslint.config.js` (PR kontrak ke A).

1. **Nama sampul:** dok 05 menulis `art-A1.svg`; dok 12/13 dan paket awal memakai `cover-A1.svg`. Yang berlaku adalah yang ada di repo.
2. **Kepemilikan shell:** dok 05 memasukkan `Navbar`, `MenuPanel`, `CursorRing`, `AudioToggle`, `RouteTransition` ke kerangka; dok 12 menetapkan seluruhnya milik Pihak A. Pihak B hanya memakai atau meminta (lihat 5.4).
3. **Format commit:** dok 06 menyebut `feat(scope): …`; dok 12 menyebut `Tx.y: …`. Untuk Pihak B berlaku arahan Anda: Conventional Commits satu kalimat berbahasa Indonesia, `tipe(scope): deskripsi spesifik` (ID tugas dicatat di `docs/BOARD.md`, bukan di pesan commit).
4. **Penjadwalan lomba:** buku panduan yang ada di Project mencantumkan batas unggah ke repositori GitHub **15 November pukul 23.59 WIB** untuk babak penyisihan dan presentasi online **24 November 2026**. Batas 15 November **sudah lewat** per hari ini (18 November 2026). **Periksa pengumuman panitia terbaru** apakah jadwal diperpanjang atau panduannya sudah diperbarui, karena hal ini memengaruhi prioritas tugas (utamakan G2–G5, G6a–c, G7). Panduan yang sama menyebut keterlambatan >30 menit dapat berujung pengurangan poin atau diskualifikasi.
