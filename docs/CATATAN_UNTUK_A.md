# Catatan untuk Pihak A (lokal)

## 1. Preload font (T0.4), PR `chore(kontrak):` ≤ 10 baris pada `index.html`
Nama berkas woff2 ber-hash baru diketahui saat build, jadi preload perlu plugin/`transformIndexHtml` kecil di `vite.config.ts`
atau tautan manual setelah build. Berkas kritis: `bricolage-grotesque-latin-wdth-normal-*.woff2` dan `instrument-sans-latin-wdth-normal-*.woff2`
(`<link rel="preload" as="font" type="font/woff2" crossorigin href="...">`). Belum dipasang; menunggu persetujuan.

## 2. Font-family dipindah ke tokens.css
`typography.css` sementara menimpa `--font-display/ui/hand/mono` agar fallback bermetrik (`Bricolage Fallback`, dst.) ada di depan tumpukan sistem.
Mohon pindahkan deklarasi itu ke `tokens.css` lalu hapus blok `:root` di `typography.css`.

## 3. Lint merah di main
`npm run lint` gagal: `rebottle_assets/scripts/*.mjs` (no-undef process/URL/document/window/Buffer).
Usul: tambahkan `rebottle_assets/**` ke `ignores` di `eslint.config.js`.

## 4. docs/ ter-track di remote
19 berkas `docs/` masuk lewat commit 509d586. Usul: `git rm -r --cached docs` + `/docs/` di `.git/info/exclude`.

## Pembaruan (keputusan tim)
- Lint merah dari `rebottle_assets/scripts/*.mjs` SUDAH diatasi dengan commit `chore(kontrak): abaikan rebottle_assets dari lint dan format` (ignores di `eslint.config.js` + `.prettierignore`). Bila A ingin skrip itu lolos lint, perbaiki skripnya sendiri.
- Permintaan tetap untuk A: preload font di `index.html`; pindahkan `--font-*` dari `typography.css` ke `tokens.css`.

## Dari T2.1 (halaman non-Home)
- **Pasang `RouteFade`** (`src/components/ui/RouteFade.tsx`, fade opacity antar rute) di `AppShell` membungkus `<Routes>`. Belum dipasang oleh B.
- **Navbar statis di HP (390 px):** tautan meluap ke kanan (CONTACT terpotong). Pada layar kecil perlu burger/menu sesuai dok 04 §5.
- **Navbar menempel:** latar belum berubah setelah gulir > 8 px (`color-mix(in oklch, var(--page-bg) 82%, transparent)`, dok 05 §1.1); `--page-bg` sudah tersedia di halaman non-Home.
- **"Re:" pada brand Navbar** (garis luar, opasitas 0,45) nyaris tak terlihat di halaman non-Home; dok 05 §1.1 meminta "Re:" menyala penuh di sini.
- **Vitest di Windows:** gagal bila dijalankan dari jalur berhuruf drive kecil (`c:\`); lewat `C:\` lancar.

## Dari G4 (Galeri Artikel)
- **Brand Navbar statis** di halaman non-Home tampil "bottle" tanpa "Re:" (di About terlihat jelas); spesifikasi meminta "Re:" menyala penuh di halaman non-Home.
- **CursorRing belum ada di `main`** (tidak ada berkas/ekspor di `src/components/shell/`). Galeri memberi `data-cursor="read"` pada `ArticleCard`. Mohon aktifkan `CursorRing` hanya di rute `#/konten` (bukan `#/konten/:slug`), label "Baca" saat hover elemen `[data-cursor="read"]` (dok 04 §10). Di `ContentPage.tsx` ada `// TODO(A)` sebagai penanda.

## Dari G7 (T9.4)
- `index.html`: ditambah 7 baris meta OG/Twitter card di bawah `theme-color` (commit `chore(kontrak): tambah meta Open Graph dasar di index.html`, disetujui tim). `og:image` memakai `./og/og-image.png` (relatif); ganti ke URL absolut bila nanti ada hosting (`VITE_SITE_URL`).
- `public/robots.txt` ditambah agar Lighthouse SEO tidak gagal pada audit `robots-txt`.

## Dari REVISI-ABOUT (kursor)
- Kursor cincin kini diminta juga di `#/about` (sebelumnya hanya Home dan Galeri). Perubahan keputusan, disetujui pengguna. Perubahan di berkas A hanya satu baris: `AppShell.tsx`, kondisi `enabled` ditambah `|| pathname === "/about"`. Tidak ada perubahan lain di `shell/`.
- Alasan: halaman About dirombak dengan kartu dan tautan interaktif; gaya kursor dibuat sama dengan halaman Konten. Kartu dan tautan di About diberi `data-cursor`.
- Catatan: entri "CursorRing belum ada di main" di bagian G4 di atas sudah usang; komponen sudah ada dan mendukung per-rute lewat prop `enabled`.
