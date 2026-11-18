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
