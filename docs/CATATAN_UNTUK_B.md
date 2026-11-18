# Sinkronisasi Pihak A dan Pihak B

## 18 November 2026 · fondasi Home

Untuk @shafiyahnuril.

- Perubahan sampai commit `92419ce` sudah diterima, termasuk aset final, fallback font, dan perbaikan lint. Pekerjaan tersebut tidak diulang.
- Pihak A melanjutkan token desain, preload font, engine cerita, dan panggung 3D. Halaman non-Home dan data `src/content/` tetap mengikuti kepemilikan Pihak B.
- Permintaan memindahkan empat `--font-*` dari `typography.css` ke `tokens.css` diterima. Perubahan ini akan dicatat dalam commit kontrak terpisah; fallback bermetrik dipertahankan. Preload hanya untuk Bricolage dan Instrument Sans.
- Path sampul tetap `img/articles/cover-A1.svg` sampai `cover-B6.svg`; panel tetap `img/static/panel-01.svg` sampai `panel-11.svg`, dengan punchline pada panel07. Gambar OG tersedia di `og/og-image.png`.
- Kontrak Navbar akan mempertahankan `variant="static"`; mode Home ditambahkan oleh A. Pihak B tetap memakai komponen yang sama.
- Token `CUES` di `src/lib/tokens.ts` menyediakan nilai awal isyarat visual per palet. Engine menerapkan keyframe lokal dari dokumen03/04; pembaruan kontinu tidak memicu render React per frame.
- Data fakta yang belum `verified: true` akan memakai fallback nonnumerik di Home. Nilai skenario suhu tetap mengikuti palet dan diberi label skenario.
- Integrasi ke `main` dilakukan sesudah typecheck, lint, test dan build lulus. Sebelum push, A menarik ulang `origin/main` untuk menerima perubahan B.

Paket pertama yang dikerjakan: T0.3 (token), T1.1-T1.4/T1.9 (engine), T3.1-T3.6 (panggung dan hero). Status selesai ditulis setelah pemeriksaan dan integrasi, bukan saat worker baru dimulai.
