# Demo Re:bottle

## Menjalankan

```sh
npm ci
npm run build
npm run preview
```

Buka URL yang dicetak Vite. Navigasi memakai HashRouter.

## Alur presentasi

1. Tunjukkan identitas Re:bottle, botol PET, label skenario, dan gulir yang terkendali. Suara mati sampai pengguna memilihnya.
2. Ikuti perjalanan dari pemakaian singkat, sungai, laut, mikroplastik, dan piring. Biarkan jeda teks dan punchline selesai.
3. Lanjutkan Babak II: pilah, proses, produk dan tumbler. Arah akhir adalah pilihan mengurangi botol sekali pakai, bukan pembenaran konsumsi terus-menerus.
4. Pada penutup, tarik gulir penuh untuk kembali ke hero. Periksa Re: kembali pudar dan navbar terbuka.
5. Buka menu, uji Escape/fokus, kunjungi About, galeri/filter, artikel dan Contact. Kembali Home memulai cerita dari awal.

## Cadangan

- `/?q=low#/` untuk tier ringan.
- `/?mode=static#/` atau reduced-motion untuk panel berurutan.
- `docs/shots/` menyimpan gambar sebelas bab; tangkap ulang setelah perubahan artistik.
- Formspree belum diberi endpoint produksi; Contact memakai cadangan mailto dengan data sementara milik konfigurasi B. Jangan mengirim pesan uji ke alamat dummy.

## Sebelum rilis publik

Isi data tim, alamat asli, URL repo dan endpoint di `src/content/site.ts`/environment; lakukan pengujian GPU/HP fisik, lintas browser dan Lighthouse. Latihan 20 menit serta video cadangan belum diklaim selesai.
