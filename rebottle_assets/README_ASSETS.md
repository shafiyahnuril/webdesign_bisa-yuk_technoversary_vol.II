# Aset visual Re:bottle

Paket untuk Techno Versary Vol. II. Salin folder `public/` ke proyek Vite. Gunakan `import.meta.env.BASE_URL` ketika membentuk URL aset di GitHub Pages. Nama berkas sampul memakai huruf kecil sesuai aturan penamaan dokumen 07 §9.

## Berkas untuk situs

| Aset | Lokasi | Keterangan |
|---|---|---|
| 12 sampul artikel | `public/img/art-a1.svg` sampai `art-a6.svg`, `art-b1.svg` sampai `art-b6.svg` | 1200×900. Gunakan gambar yang sama untuk kartu dan halaman detail. |
| 11 panel cerita | `public/img/panel-b1.svg` sampai `panel-b10.svg`, serta `panel-p.svg` | 1600×1000. Urutan B1–B6, P, B7–B10. Home merender judul, surat, dan CTA sebagai HTML. |
| Retakan latar | `public/img/crack-bg.svg` | 1920×1080, transparan. Untuk overlay Bab 5–6, terpisah dari tekstur retak botol. |
| Ilustrasi 404 | `public/img/s-404.svg` | 400×400. |
| Alternatif tangan | `public/img/hand-fallback.svg` | 800×420, transparan. Hanya opsi jika tangan 3D Bab 2 dan 7 membutuhkan cadangan DOM. |
| Favicon | `public/favicon.svg` | 64×64. |
| Wordmark | `public/img/wordmark.svg` | 600×160. Huruf depan berupa garis luar, kata berikutnya putih penuh. Versi statis untuk OG dan README. |
| Diagram suhu | `public/img/temp-diagram.svg` | Versi statis 900×330. About memakai `src/components/content/TempDiagram.tsx` dan CSS pendamping untuk label responsif, tabel aksesibel, dan animasi sekali saat terlihat. |
| 15 bentuk ikon | `public/img/icons/` | SVG 24×24. `AssetIcon.tsx` menyediakan versi inline yang mewarisi `currentColor`. Labeli tombol interaktif di komponen pemanggil. |
| Poster hero desktop dan HP | `public/img/hero-poster.webp`, `public/img/hero-poster-m.webp` | 1600×900 dan 800×1200. Render awal botol PET 3D. Pasang di belakang kanvas, sementara judul berada di layer DOM. |
| Gambar media sosial | `public/og-image.png` | 1200×630. Botol hasil render awal, wordmark dan tagline. |
| 11 bingkai pratinjau | `docs/preview-shots/` | 1600×900. Pratinjau panel SVG, dalam urutan cerita. Tangkapan layar dari situs yang sudah berfungsi nanti masuk `docs/shots/`. |
| 9 keluarga tekstur | `src/stage/textures/canvas-assets.ts` | Menghasilkan tekstur di runtime, termasuk tiga label pemilahan dan dua resolusi retak. |

Lihat [inventaris per aset](docs/ASSET_MANIFEST.md) untuk urutan, sumber, dan status masing-masing gambar. Gabungkan `ASSET_CREDITS` ke daftar `CREDITS` proyek agar halaman About menampilkan atribusi. Lisensi font sumber untuk garis bentuk wordmark disertakan di `licenses/`.

## Visual inline yang mengikuti cerita

`src/components/story/StoryArtwork.tsx` menyediakan SVG cincin waktu, kursor, dan filter shimmer.
Pada Bab 2 dan 7, perbarui `stroke-dashoffset` cincin menjadi `1 - progressLokal` secara imperatif pada elemen `data-time-ring-progress`. Angka dan satuan berada di HTML di depan cincin. Gunakan `mix-blend-mode: difference` dan warna putih pada wadah kursor. Untuk shimmer, pasang `url(#id)` pada teks dan ubah atribut `scale` di `data-heat-scale` sesuai tier dan pengaturan reduced-motion.

## Membuat tangkapan dari situs

Dokumen arsitektur 06 §10 mengecualikan `freeze` dari build produksi. Jalankan aplikasi dalam mode pengembangan yang mengaktifkan protokol tangkapan berikut.

1. Expose `window.__REBOTTLE_CAPTURE_SEGMENTS__` sebagai daftar item `{ id, length }` yang dibentuk dari urutan dan panjang segmen di timeline. Gunakan ID `punch` untuk layar hening.
2. Beri kanvas Home atribut `data-capture-stage`. Ketika frame yang diminta benar-benar selesai dirender, set `data-capture-ready="true"` dan `data-capture-progress` ke nilai `shown` aktual di elemen `<html>`.
3. Gunakan `capture=poster` untuk menampilkan botol dan latar saja tanpa judul, navbar, teks, kontrol, overlay debug, dan gambar poster lama. Pada `capture=shot`, tampilkan seluruh adegan dengan antarmuka cerita dan sembunyikan overlay debug. Aktifkan protokol ini hanya di mode pengembangan.
4. Dari repo, pasang `playwright` dan `sharp` sebagai dependensi pengembangan. Jalankan `npx playwright install chromium`, lalu `node scripts/capture.mjs http://localhost:5173/`. Skrip memperbarui dua WebP, PNG berbagi, dan 11 tangkapan di `docs/shots/`. Posisi tangkapan tiap segmen adalah 40% durasi lokal sesuai dokumen 07 §7.

Bila perlu merender ulang versi awal, jalankan `blender -b --python scripts/render-preliminary-hero.py -- <folder-render>`, lalu `node scripts/export-preliminary-hero.mjs <folder-render>/pet-isolated.png`.

## Batas paket

Modul scene Three.js, partikel interaktif, shader air, vignette, dan perilaku visual yang mengikuti gulir berada di implementasi situs. Aset gambar di sini mengikuti jalur prosedural dan vektor dalam brief. Spesifikasi model 3D dan prompt GLB cadangan tetap tersedia di dokumen 07. Lihat `docs/DECISIONS_ASSETS.md` untuk keputusan integrasi dan hal yang menunggu kode situs.
