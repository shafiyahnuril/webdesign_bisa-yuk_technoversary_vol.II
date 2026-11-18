# Re:bottle

> *Bawa botolmu besok.*

Re:bottle adalah situs scrollytelling kampanye peduli lingkungan. Pengunjung mengikuti **satu botol plastik** dari lahir sampai ke piring makan kita (Babak I, "Jika Kita Abai"), lalu melihat perjalanan botol yang sama ketika kita peduli (Babak II, "Jika Kita Peduli"). Cerita ditutup dengan ajakan sederhana: **"Bawa botolmu besok."**

**Demo:** <https://rebottle-five.vercel.app>

**Subtema:** Kampanye Peduli Lingkungan · **Lomba:** Techno Versary Vol. II – Web Design Competition (HIMA TI FKOM Universitas Kuningan)

## Tim

- **Nama tim:** bisa yuk
- **Anggota:**
  - Yohanes Anthony Saputra
  - Shafiyah Nuril Hayya
- **Institusi:** Universitas Gadjah Mada

## Deskripsi

Satu variabel posisi cerita menggerakkan seluruh pengalaman: botol 3D, suhu, warna latar, teks, penanda bab, logo "Re:", navigasi, dan suara. Ceritanya terbagi dalam dua babak.

**Babak I · Jika Kita Abai** (palet biru yang makin gelap, suhu naik dari +1,2°C ke +4,0°C sebagai skenario)

1. Lahir
2. Sekali Pakai
3. Tersesat
4. Lautan
5. Terurai
6. Kembali ke Kita

Setelah Bab 6, layar hening dan muncul pertanyaan: *"Bagaimana jika semua ini tidak terjadi?"*

**Babak II · Jika Kita Peduli** (palet teal, hijau, lalu sage; suhu tetap +1,5°C)

7. Di Tempat yang Benar
8. Perjalanan Kedua
9. Hidup Baru
10. Surat Terakhir (botol menulis surat) dan tumbler sebagai penutup

Setelah Bab 10, pengunjung bisa menarik halaman untuk mengulang cerita dari awal lewat gestur loop. Bab tidak bisa dilompati: alur cerita dijaga agar tiap bab terbaca berurutan.

### Fitur utama

- **Mesin cerita imperatif** (ticker GSAP): tidak ada render ulang React per frame; semua visual hanya membaca satu posisi cerita.
- **Adegan 3D prosedural** (Three.js): botol, tangan, kota, laut, ikan, tempat sampah, lini pemrosesan, tumbler, dan lainnya dibuat dari kode, tanpa model berbayar.
- **Audio sintetis** (Web Audio API): drone, derau, denyut, dan nada dibangkitkan langsung di peramban per bab, tanpa berkas audio. Suara bisa dimatikan lewat tombol di kiri-bawah.
- **Tingkat kualitas otomatis** (tinggi, sedang, rendah) berdasarkan perangkat dan FPS.
- **Galeri Artikel**: 12 artikel dampak (negatif dan positif, skala rumah sampai global) dengan filter gabungan dan daftar sumber.
- **Aksesibilitas**: mendukung `prefers-reduced-motion`, navigasi keyboard, tautan lompat, panel menu `inert`, dan pengumuman perpindahan halaman untuk pembaca layar.
- **Cadangan tanpa WebGL atau tanpa gerak**: cerita tampil sebagai panel statis berurutan.
- **Tanpa JavaScript**: `<noscript>` menampilkan pesan bahwa situs membutuhkan JavaScript.

## Halaman

| Halaman | Rute | Isi |
|---|---|---|
| Home | `#/` | Cerita 10 bab (scrollytelling 3D) |
| About | `#/about` | Latar isu, skenario, sumber data, atribusi aset dan lisensi, tim |
| Konten (Galeri Artikel) | `#/konten` | 12 artikel dengan filter |
| Detail artikel | `#/konten/:slug` | Isi artikel, daftar sumber, artikel berikutnya |
| Contact | `#/contact` | Formulir kontak |
| 404 | `*` | Halaman tidak ditemukan |

Situs memakai `HashRouter`, sehingga rute dapat dibuka di hosting statis tanpa pengaturan tambahan.

## Teknologi

- **Build dan bahasa:** Vite, React 19, TypeScript (mode ketat)
- **Navigasi:** React Router (`HashRouter`)
- **Animasi dan 3D:** GSAP, Three.js
- **Audio:** Web Audio API
- **Gaya:** CSS Modules dan CSS variable (token desain dibangkitkan lewat `npm run gen:tokens`)
- **Font (OFL, via Fontsource):** Bricolage Grotesque, Instrument Sans, Caveat, JetBrains Mono
- **Uji dan kualitas:** Vitest, Testing Library, Playwright, ESLint, Prettier

## Struktur folder

```
src/
├─ engine/      mesin cerita: ratchet, timeline, palet, gestur loop
├─ stage/       adegan Three.js, objek, shader, kualitas
├─ audio/       mesin audio dan sintesis per bab
├─ components/  shell, story, content, ui
├─ routes/      halaman (Home, About, Konten, Artikel, Contact, 404)
├─ content/     teks, fakta, artikel, data situs
├─ hooks/       hook bersama
├─ lib/         token dan utilitas
└─ styles/      token, tipografi, gaya dasar
public/         aset statis (poster, sampul artikel, gambar OG, favicon)
scripts/        pembangkit token dan alat bantu aset
e2e/            uji end-to-end Playwright
```

## Instalasi

Prasyarat: **Node.js 20 atau lebih baru** dan npm.

```bash
git clone https://github.com/shafiyahnuril/webdesign_bisa-yuk_technoversary_vol.II.git
cd webdesign_bisa-yuk_technoversary_vol.II
npm install
```

Tidak ada konfigurasi tambahan yang wajib. Variabel lingkungan bersifat opsional (lihat `.env.example`).

## Menjalankan

```bash
npm run dev        # mode pengembangan di http://localhost:5173
npm run build      # pemeriksaan tipe dan build produksi ke folder dist
npm run preview    # menyajikan hasil build
```

Untuk mencoba build produksi: `npm run build && npm run preview`.

### Perintah lain

| Perintah | Fungsi |
|---|---|
| `npm run test` | Menjalankan uji unit dan komponen (Vitest) |
| `npm run test:e2e` | Menjalankan uji end-to-end (Playwright) |
| `npm run lint` | Memeriksa kode dengan ESLint |
| `npm run typecheck` | Memeriksa tipe TypeScript |
| `npm run format` | Merapikan kode dengan Prettier |
| `npm run gen:tokens` | Membangkitkan `src/styles/tokens.generated.css` (otomatis saat `dev` dan `build`) |
| `npm run analyze` | Membuat laporan ukuran bundel |

## Catatan

- Opsi `?q=low` memaksa mode ringan (misalnya `http://localhost:5173/?q=low#/`).
- Mode reduced-motion (atau perangkat tanpa WebGL) menampilkan panel statis sebagai ganti adegan 3D.
- Form Contact berjalan dalam mode cadangan `mailto:` (membuka aplikasi email). Pengiriman lewat Formspree aktif bila `VITE_FORMSPREE_ENDPOINT` diisi. Alamat email dan akun pada halaman Contact masih contoh, bukan kontak resmi.
- Seluruh aset dibuat sendiri atau berlisensi bebas. Lihat halaman About › Atribusi.
- Angka fakta pada situs hanya berasal dari sumber yang sudah diperiksa; bagian yang belum terverifikasi tidak ditampilkan. Label skenario pada Babak I menegaskan bahwa kenaikan suhu adalah skenario, bukan klaim sebab-akibat langsung dari satu botol.
- Hasil Lighthouse (kategori SEO, build produksi lewat `npm run preview`, diukur 18 November 2026): skor SEO 100 pada rute Home, About, Konten, detail artikel, dan Contact (mode desktop bawaan Lighthouse 12). Kategori performa, aksesibilitas, dan best practices belum diukur.
