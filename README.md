# Re:bottle

Situs scrollytelling kampanye peduli lingkungan: mengikuti satu botol plastik, dari lahir sampai ke piring makan kita (Babak I), lalu cerita yang sama ketika kita peduli (Babak II), diakhiri ajakan "Bawa botolmu besok."

**Subtema:** Kampanye Peduli Lingkungan · **Lomba:** Techno Versary Vol. II – Web Design Competition (HIMA TI FKOM Universitas Kuningan)

## Tim

- Nama tim: **[ISI SEBELUM PENGUMPULAN]**
- Anggota: **[ISI SEBELUM PENGUMPULAN: nama, peran, institusi]**

## Halaman

Home · About · Konten (Galeri Artikel) · Contact

## Teknologi

Vite · React · TypeScript · React Router · GSAP · Three.js · Web Audio API · CSS Modules

## Instalasi

Prasyarat: Node.js 20 atau lebih baru.

```bash
npm install
```

## Menjalankan

```bash
npm run dev        # http://localhost:5173
npm run build && npm run preview
```

Perintah lain: `npm run test`, `npm run lint`, `npm run typecheck`, `npm run gen:tokens`.

## Catatan

- Opsi `?q=low` memaksa mode ringan. Mode reduced-motion menampilkan panel statis.
- Form Contact berjalan dalam mode cadangan `mailto:` (membuka aplikasi email). Pengiriman lewat Formspree aktif bila `VITE_FORMSPREE_ENDPOINT` diisi. Alamat email dan akun pada halaman Contact masih contoh, bukan kontak resmi.
- Seluruh aset dibuat sendiri atau berlisensi bebas. Lihat halaman About › Atribusi.
- Hasil Lighthouse (kategori SEO, build produksi lewat `npm run preview`, diukur 18 November 2026): skor SEO 100 pada rute Home, About, Konten, detail artikel, dan Contact (mode desktop bawaan Lighthouse 12). Kategori performa, aksesibilitas, dan best practices belum diukur.
