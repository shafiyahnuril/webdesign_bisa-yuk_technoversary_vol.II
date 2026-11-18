# Keputusan
| Tanggal | Hal | Pilihan | Alasan | Dok. terkait | Status (usulan/disepakati) |
|---|---|---|---|---|---|
| 2026-11-18 | Cara gen-tokens membaca tokens.ts | Transpilasi dengan API `typescript` (devDependency yang sudah ada) lalu impor lewat data URL | Tanpa dependensi baru; stabil di Node >= 20 (Node 20 belum bisa menjalankan .ts langsung) | 06 bagian 9 | usulan |
| 2026-11-18 | `chapterAt` pada punchline | Paruh pertama punchline = bab 6, paruh kedua = bab 7 | Dok. 06 hanya menyebut "6 atau 7 sesuai posisi"; pilihan paling sederhana dan konservatif | 06 bagian 3 | usulan |
| 2026-11-18 | Font latin saja | @font-face ditulis sendiri (src/styles/fonts.css) yang menunjuk berkas woff2 latin Fontsource | CSS bawaan Fontsource memuat semua subset (ikut ter-emit di dist); cara ini hanya membawa subset latin | 02 bagian 2.2 | usulan |
| 2026-11-18 | Preload font | Belum dipasang (tugas T0.4 bagian preload) | Nama berkas ber-hash baru diketahui saat build; ditunda ke T0.4/T10.1 | 02 bagian 2.2 | usulan |
| 2026-11-18 | credits.ts dan penggunaan alat bantu pada ilustrasi | Baris ilustrasi hanya "TODO: isi metode pembuatan"; tidak menyebut alat bantu | Berkas yang di-commit tidak boleh memuat jejak AI (aturan repo); dok. 07 bagian 10 meminta pencantuman, jadi isi manual oleh tim bila relevan | 07 bagian 10 | perlu keputusan tim |
| 2026-11-18 | Isi copy.ts | Teks dok. 11 dipakai apa adanya; angka (mis. 450) tidak ditulis di copy.ts, diambil dari facts.ts | Prinsip "angka hanya dari facts.ts"; `ch3.counter.value` berisi TODO | 11 bagian 2, 6 | usulan |
| 2026-11-18 | Tautan Skip | Memakai handler fokus ke #main, bukan href hash biasa | HashRouter memakai hash untuk rute | 05 bagian 1 | usulan |
| 2026-11-18 | Versi paket | Memakai versi stabil terbaru saat install (React 19, Vite 8, TypeScript 6, Vitest 5, ESLint 9, three 0.187) | Sesuai instruksi "versi stabil terbaru"; dikunci package-lock.json | 06 bagian 1 | usulan |
| 2026-11-18 | `.prettierignore` memuat `*.md` | Berkas markdown tidak diformat Prettier | `prettier --write .` sempat memformat ulang dokumen lokal; dipulihkan dari zip. Tanpa menyebut nama folder dokumen di berkas yang di-commit | - | usulan |
| 2026-11-18 | Placeholder sampul/panel | SVG kotak warna dengan hex yang sama dengan tokens.ts | SVG statis tidak bisa membaca variabel CSS | 07 | usulan |
| 2026-11-18 | Impor `pages.css` | Diimpor dari `usePageTheme.ts`, bukan `main.tsx` | `main.tsx` milik Pihak A; setiap halaman non-Home memakai hook itu | 05 §1.1 | usulan |
| 2026-11-18 | Fokus H1 setelah pindah rute | `PageHero` memfokuskan H1 hanya bila `location.key !== "default"` | Muat pertama tetap mengikuti tautan lompat; perubahan hash manual juga berkunci "default" | 05 §1, 04 §13 | usulan |

| 2026-11-18 | Kontrak isyarat visual | CUES dan ChapterCues terpusat di src/lib/tokens.ts; keyframe lokal berada di engine/cues.ts | Menghindari konstanta visual tersebar dan menjaga satu sumber shown | 02 §5, 04 §4 | diterapkan |
| 2026-11-18 | Cairan botol pada tier tinggi | Material mengikuti03 §3.1 dengan transmission0.9; LOW memakai transparent biasa | Prioritas dokumen00 menempatkan03 di atas06; evaluasi performa nyata tetap diperlukan | 00 §1.2, 03 §3.1, 06 §4.2 | diterapkan sebagai baseline |
| 2026-11-18 | Font dan preload | Font-family beserta fallback bermetrik dipusatkan di tokens.css; dua preload dibentuk dari bundle Vite | Menindaklanjuti catatan font dan menghindari hash berkas yang ditulis manual | 02 §2.2, CATATAN_UNTUK_A | diterapkan |
| 2026-11-18 | Sumbu font | Pakai wght/wdth yang ada pada binari Fontsource; opsz tidak dipaksakan pada subset yang tidak memuatnya | Mencegah deklarasi sumbu tidak tersedia | 02 §2.1 | diterapkan |
