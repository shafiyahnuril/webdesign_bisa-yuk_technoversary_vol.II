# Log performa

## Lingkungan dan batas pengukuran

18 November 2026. Pemeriksaan WebGL menggunakan Chromium/ANGLE SwiftShader (GPU software), viewport desktop 1600×900 dan emulasi portrait 390×844. Hasil ini **bukan** bukti FPS pada GPU atau HP fisik. Profil awal sempat bersamaan tab pengujian dan tidak dipakai sebagai klaim pencapaian target. Target 55 FPS desktop/30 FPS HP belum disahkan pada perangkat fisik.

## Anggaran render dan lifecycle

| Adegan | HIGH calls / tris, harness | LOW portrait calls / tris, harness |
|---|---|---|
| B1 | 9 / 8282 | 6 / 2622 |
| B2 | 33 / 12914 | 18 / 4938 |
| B3 | 31 / 63152 | 17 / 12816 |
| B4 | 21 / 74688 | 11 / 14076 |
| B5 | 9 / 59480 | 5 / 10012 |
| B6 | 23 / 2178 | 10 / 1438 |
| Punch | 6 / 6744 | 5 / 2620 |
| B7 | 33 / 11906 | 15 / 4130 |
| B8 | 49 / 11696 | 22 / 4798 |
| B9 | 7 / 72 | 7 / 72 |
| B10 | 11 / 2740 | 9 / 1868 |

Angka harness di atas diambil sebelum revisi artistik terakhir dan berfungsi sebagai baseline. Render Home lengkap menghitung seluruh pass (info.autoReset=false), sehingga beberapa angka lebih tinggi namun masih di bawah batas calls/tris. Lima loop pada Home lengkap menghasilkan plateau memori yang sama: HIGH 19 geometri/8 tekstur dan LOW 19/7 pada setiap akhir loop. Ini menguji sumber daya renderer, bukan seluruh heap JS.

## Optimasi LOW terisolasi

Ablasi menemukan biaya utama pada badan botol Physical dan kota PBR/PMREM. Shader LOW menghapus sampling/noise yang tidak diperlukan; botol LOW menggunakan material Standard transparan, dan kota LOW Lambert. Gelombang Gerstner, 64² mesh, semua mode air, normal, palet dan shatter dipertahankan.

| Titik | Biaya render awal | Setelah optimasi material | rAF sebelum → sesudah |
|---|---|---|---|
| B3 t=0,4 | 50,67 ms | 23,98 ms | 10,66 → 21,61 FPS |
| B4 t=0,4 | 14,85 ms | 13,67 ms | tidak disimpulkan dari resiprokal biaya render |
| B5 t=0,4 | 29,51 ms | 25,87 ms | 19,57 → 20,54 FPS |
| B5 t=0,75 | 26,51 ms | 24,50 ms | 19,47 → 23,21 FPS |

Biaya render dan FPS rAF adalah metrik berbeda. Jangan menyatakan 1/biaya render sebagai FPS halaman. Galat WebGL pada pengujian tersebut = 0. HIGH→LOW→HIGH serta crack/shatter reverse diuji. SwiftShader masih berada di bawah target interaksi pada beberapa titik.

## Bundle dan aset

Baseline build terintegrasi: Three sekitar149 KB gzip (target180), GSAP27,45 KB (target35), kode Home/stage terpisah di bawah120 KB, CSS gzip sekitar14 KB (target30). Font250.824 B total dan135.488 B kritis serta JS awal sekitar140 KB melampaui target prototipe; alasan dicatat di DECISIONS. Poster aktual1600×900 dan800×1200 masing-masing 10.300 B/7.426 B; OG1200×630 25.754 B. Jalankan build akhir untuk ukuran hash terbaru.

## Bukti yang dapat diulang

- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- `npm run test:e2e`: Home 3D, input, menu/fokus, keyframe, loop, fallback, rute, audio dan smoke.
- `npm run capture -- http://localhost:5173/`: poster, OG, sebelas tangkapan di `docs/shots/` dari DEV freeze.
- `node scripts/profile.mjs http://localhost:5173/`: instrumentasi DEV ?debug; keluaran lokal `docs/bukti/perf-home.json`.

Lighthouse, Safari/Firefox, perangkat fisik, dan skor rilis tidak diklaim telah selesai.

## Revisi lanjutan 19 November 2026

Material PBR, warna piring/filet, narasi editorial, audio, panjang gulir, buoyancy B3–B5, dan kain B10 sudah terintegrasi. Poster serta sebelas PNG di docs/shots diperbarui dari WebGL aktual. B7 diperbaiki lagi agar tiga tempat sampah berada di luar kolom teks desktop. Tangkapan statis membuktikan hasil render pada keyframe, bukan kelancaran seluruh perjalanan.

Regresi baru menguji tarikan loop penuh pada frame terlambat serta penyerapan momentum setelah reset yang render awalnya lambat. Tidak ada klaim bahwa pengujian SwiftShader memenuhi target GPU/HP fisik.

### Sampel gerak setelah koreksi apung

Chromium WebGL software, portrait 390×844, LOW; empat wheel kecil 35 px per scene dan 24 frame teramati setelah posisi plateau. Delta tertinggi per frame: B3 Y 0,00320 unit/orientasi 0,5742°, B4 Y 0,00542 unit/orientasi 0,1509°, B5 Y 0/orientasi 0,0228°. Angka ini adalah sampel gerak, bukan tolok ukur FPS atau jaminan semua perangkat. Delapan keyframe B6/B7/B10 pada desktop HIGH 1600×900 dan portrait LOW 390×844 memiliki glError=0, tanpa overflow horizontal atau galat halaman. Bukti lokal: docs/bukti/final/review.json dan PNG terkait.

### Pemeriksaan akhir

19 November 2026: TypeScript, ESLint, build produksi, 48 berkas/193 tes unit, dan 12/12 skenario Playwright Chromium lulus. Suite browser penuh terakhir berjalan 1,2 menit. Hasil mencakup readiness kanvas, poster, input/ratchet, menu/fokus, keyframe, loop, reduced-motion, context loss, tema rute, overflow mobile, Web Audio, dan smoke seluruh rute. Tidak mengirim formulir atau pesan nyata.
