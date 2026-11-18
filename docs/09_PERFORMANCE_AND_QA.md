# 09 · PERFORMA DAN QA

> Bobot penilaian penyisihan: **Testing dan performa 15%**, UX 25%, Fungsionalitas 10%. Aturan performa (Three.js lazy, aset WebP/SVG, batas partikel di HP, uji Lighthouse, `devicePixelRatio` ≤ 2, hormati `prefers-reduced-motion`) = **[DISEPAKATI]**.
> Angka anggaran, tier kualitas, strategi pemuatan, matriks uji, dan persiapan demo final = **[USULAN]**, nilainya **[PROTOTIPE]**.

---

## 1. Anggaran performa (target kerja)

| Metrik | Target desktop | Target HP (4G, kelas menengah) | Cara ukur |
|---|---|---|---|
| **Lighthouse Performance** | ≥ 90 (halaman non-Home), ≥ 75 (Home) | ≥ 85 (non-Home), ≥ 60 (Home) | Lighthouse (mode mobile dan desktop) |
| **Lighthouse Accessibility** | ≥ 95 | ≥ 95 | Lighthouse + axe |
| **Lighthouse Best Practices / SEO** | ≥ 95 | ≥ 95 | Lighthouse |
| **LCP** (Largest Contentful Paint) | ≤ 2,0 s | ≤ 3,0 s | Poster hero sebagai elemen LCP |
| **CLS** | ≤ 0,02 | ≤ 0,05 | Lighthouse |
| **TBT** | ≤ 150 ms | ≤ 300 ms | Lighthouse |
| **INP** | ≤ 150 ms | ≤ 250 ms | DevTools |
| **FPS Home** (rata-rata) | ≥ 55 | ≥ 30 (tier LOW/MEDIUM) | Overlay debug |
| **FPS minimum (persentil 1)** | ≥ 40 | ≥ 24 | Overlay debug |
| **Draw call** per frame | ≤ 80 | ≤ 50 | `renderer.info.render.calls` |
| **Segitiga** per frame | ≤ 150.000 | ≤ 60.000 | `renderer.info.render.triangles` |
| Memori JS | ≤ 250 MB | ≤ 180 MB | DevTools Memory |

> Skor Lighthouse Home sengaja diberi target lebih longgar karena kanvas WebGL dan skrip berat; **fokuskan skor tinggi pada About, Konten, Contact** (jalur teks) dan buktikan bahwa Home berat hanya di bagian 3D dan dimuat malas.

### 1.1 Anggaran ukuran (gzip)

| Bagian | Batas |
|---|---|
| JS awal (rute non-Home: React + Router + shell) | ≤ **120 KB** |
| Chunk `three` (hanya Home, tree-shaken) | ≤ **180 KB** |
| Chunk `gsap` | ≤ **35 KB** |
| Kode Home (engine + stage + scenes) | ≤ **120 KB** |
| CSS total | ≤ **30 KB** |
| Font (4 keluarga, subset) | ≤ **160 KB** (hanya Bricolage + Instrument Sans ≤ 90 KB di jalur kritis) |
| Poster hero WebP | ≤ **60 KB** |
| Ilustrasi SVG per berkas | ≤ **45 KB** |
| **Total transfer Home muat pertama** | ≤ **800 KB** |
| **Total transfer halaman non-Home** | ≤ **350 KB** |

Periksa dengan `rollup-plugin-visualizer`; bundel yang melampaui anggaran **harus dijelaskan** di `DECISIONS.md`.

---

## 2. Strategi pemuatan (Home)

### 2.1 Urutan
```
t0  HTML + CSS kritis + poster hero (img, fetchpriority="high") + font display (preload)  → LCP
t1  JS awal (React, shell) ─ render navbar + judul hero + petunjuk gulir (DOM, tanpa 3D)
t2  Idle: import("three") + chunk stage (modulepreload) ─ buat renderer, Bottle, lampu
t3  Bingkai 3D pertama → hapus poster (crossfade 0,3 s)
t4  Idle: bangun scene Bab 2 dan 3 (satu per frame idle, requestIdleCallback)
t5  Selama cerita: build scene ±0,06 di depan, dispose yang sudah lewat > 0,12
```

### 2.2 Aturan
- **Tidak ada layar pemuatan penuh.** Hero (poster + judul) tampil seketika; 3D "menyala" di bawahnya.
- Bila 3D belum siap saat pengunjung mulai menggulir: engine menahan `target` ≤ **0,02** sampai bingkai 3D pertama selesai (maks. 4 detik; setelah itu fallback ke `StaticStory`).
- `modulepreload` untuk chunk Home dari halaman lain saat `hover/focus` pada tautan Home.
- Gambar kartu artikel `loading="lazy"` kecuali 2 teratas.
- Font: preload hanya 2 berkas variabel kritis; sisanya `font-display: swap`.
- Tidak ada skrip pihak ketiga (analitik, CDN font). Formspree hanya dipanggil saat kirim.
- Kompresi: aktifkan Brotli/gzip bila ada hosting.
- Cache: nama berkas ber-hash (Vite default).

---

## 3. Tier kualitas (ringkasan; detail di 06 bagian 5)

| Tier | Untuk | Perbedaan utama |
|---|---|---|
| HIGH | Desktop GPU baik | DPR 2, partikel 2400, air 160², transmission botol, kaustik, shimmer kanvas (eksperimen) |
| MEDIUM | Laptop iGPU, tablet, HP baik | DPR 1,5, partikel 1400, air 110², transmission botol |
| LOW | HP lemah, hemat daya, FPS jatuh | DPR 1, partikel 800, air 64², tanpa transmission, tanpa filter SVG meleleh |
| `StaticStory` | reduced-motion, tanpa WebGL, gagal | Panel statis berurutan |

Penurunan otomatis: FPS < 45 selama 2 detik berturut-turut → turun satu tingkat (maks. sekali per 6 detik). Tidak naik otomatis.

---

## 4. Anggaran per scene (HIGH)

| Scene | Draw call | Segitiga | Catatan khusus |
|---|---|---|---|
| Hero/B1 | ≤ 10 | ≤ 12k | Botol transmisif (satu-satunya objek transmisif) |
| B2 | ≤ 14 | ≤ 18k | Tangan + botol |
| B3 | ≤ 40 | ≤ 70k | Air 160², kota instanced, sampah instanced |
| B4 | ≤ 45 | ≤ 90k | Air Gerstner 160², karang instanced, kaustik |
| B5 | ≤ 25 | ≤ 60k | Serpihan 1 draw, partikel 2400 |
| B6 | ≤ 25 | ≤ 40k | Ikan 3, piring, partikel |
| Punchline | ≤ 12 | ≤ 20k | Memudar |
| B7 | ≤ 35 | ≤ 45k | + render scissor kilas (air 64²) |
| B8 | ≤ 55 | ≤ 80k | Conveyor, item instanced, 160 partikel semprot |
| B9 | ≤ 60 | ≤ 90k | 4 stasiun, serpihan instanced, 60 filamen |
| B10 | ≤ 70 | ≤ 110k | 7 produk + rak, tumbler, sorot (tanpa shadow map) |

Bila anggaran terlampaui: kurangi instance, turunkan segmen, gabungkan geometri, atau hapus detail. **Jangan menambah kompleksitas tanpa memangkas di tempat lain.**

---

## 5. Taktik performa (daftar wajib)

### 5.1 DOM / CSS
- Animasi hanya `transform` dan `opacity`. Variabel CSS yang ditulis per frame dibatasi (palet, `--pull`, `--melt`, `--grain`, `--vignette`) dan hanya bila berubah > 0,001.
- `will-change: transform` hanya pada elemen yang benar-benar bergerak terus (dome, kursor), tidak pada semuanya.
- Tidak ada `backdrop-filter` di atas kanvas. Tidak ada `box-shadow` animasi. Filter SVG hanya pada elemen teks kecil.
- `contain: layout paint` pada panel teks dan komponen kartu. `content-visibility: auto` pada bagian About yang panjang.
- Hindari pembacaan layout (`getBoundingClientRect`, `offsetTop`) di dalam loop. Cache saat `resize`.
- Pecah teks (huruf) hanya untuk judul bab aktif (±1 bab).

### 5.2 JS
- Satu `requestAnimationFrame`/ticker untuk seluruh aplikasi (GSAP ticker). Tidak ada `setInterval` untuk animasi.
- Pelanggan `onFrame` tidak mengalokasikan objek baru per frame (hindari GC): gunakan objek pakai-ulang, `Float32Array`.
- Event `wheel`/`touchmove`/`scroll` `passive: true`; hanya `keydown` yang boleh memanggil `preventDefault`.
- Tidak ada re-render React per frame. Periksa dengan React Profiler: 0 commit saat menggulir di Home.

### 5.3 WebGL
- Satu renderer, satu kanvas. Satu `InstancedMesh` per jenis. Material dibagi.
- Tidak ada shadow map, tidak ada postprocessing penuh. Overlay butiran/vignette di CSS.
- `renderer.setPixelRatio(min(dpr, cap))`. Kurangi cap bila FPS turun.
- Hentikan render saat: tab tersembunyi, rute bukan Home, atau kanvas di luar layar.
- Dispose geometri/material/tekstur scene yang dilewati. Periksa `renderer.info.memory` agar tidak naik terus saat loop berulang (**uji 5 putaran loop**).
- Gunakan `frustumCulled` default; matikan `matrixAutoUpdate` pada objek statis (`updateMatrix` sekali).
- Shader: hindari percabangan berat di fragment; `precision mediump` bila aman (HP).

### 5.4 Jaringan
- Poster hero dengan `fetchpriority="high"`; `preload` font kritis; `modulepreload` chunk kritis.
- Tidak ada permintaan di jalur render yang diblokir (tidak ada CSS eksternal).

---

## 6. Protokol pengukuran

1. **Lighthouse:** Chrome incognito, tanpa ekstensi. Jalankan 3×, ambil median. Mode *Mobile* (throttling default) dan *Desktop*. Simpan tangkapan layar skor ke `docs/lighthouse/`.
2. **Profiler:** Chrome DevTools → Performance, rekam 15 detik menggulir Bab 3 → 6. Periksa *long task* > 50 ms dan *frame* > 22 ms.
3. **GPU/Draw:** overlay debug (`?debug=1`) mencatat `calls`, `triangles`, FPS (rata-rata dan p1) per bab. Isi tabel hasil di `docs/PERF_LOG.md` untuk setiap tier.
4. **Memori:** rekam Heap sebelum dan sesudah 5 putaran loop; selisih < 15 MB.
5. **Perangkat nyata:** minimal satu HP Android kelas menengah dan satu iPhone; ukur FPS lewat overlay debug dan rasa sentuh.
6. **Regresi:** ulangi setelah perubahan besar (scene baru, efek baru). Catat di `PERF_LOG.md` (tanggal, perubahan, hasil).

---

## 7. Matriks uji

### 7.1 Peramban dan perangkat

| Kelompok | Minimal yang diuji |
|---|---|
| Desktop | Chrome terbaru (Windows/macOS), Edge, Firefox, Safari macOS |
| HP | Chrome Android (menengah), Safari iOS (satu iPhone) |
| Tablet | iPad Safari atau Android tablet |
| GPU | Laptop dengan iGPU (uji tier MEDIUM) dan perangkat GPU diskret (HIGH) |

### 7.2 Viewport
`360×640`, `390×844`, `412×915`, `768×1024`, `1024×768`, `1280×720`, `1366×768`, `1440×900`, `1920×1080`, `2560×1440`, serta **landscape pendek** `844×390`. Uji juga zoom browser 200%.

### 7.3 Masukan
Mouse roda berjenjang, trackpad (inersia), layar sentuh, keyboard saja, pembaca layar dasar (NVDA/VoiceOver) pada halaman non-Home dan panel menu.

### 7.4 Kondisi
Jaringan lambat (Slow 4G), offline (halaman sudah dimuat), tab latar belakang, mode hemat daya, `prefers-reduced-motion`, `prefers-reduced-data`, WebGL dinonaktifkan, JavaScript dinonaktifkan.

---

## 8. Daftar periksa QA fungsional

### 8.1 Mesin cerita
- [ ] Gulir cepat/menyeret/End/PageDown **tidak** melewati bab (tiap bab tampil minimal `LENGTH/70` detik).
- [ ] Scrollbar tidak terlihat. Bounce iOS tidak menggeser `target`.
- [ ] Menggulir mundur diperbolehkan; dari hero tidak ada loop mundur.
- [ ] Muat ulang di tengah cerita → mulai dari hero.
- [ ] Resize di tengah cerita mempertahankan posisi cerita.
- [ ] Tab disembunyikan lalu kembali: tidak melompat.

### 8.2 Loop
- [ ] Gulir sesaat di akhir: dome naik sedikit lalu turun kembali.
- [ ] Gulir berkelanjutan ±1.400 px: loop terjadi.
- [ ] Setelah loop: hero identik; "Re:" pudar; daftar bab Babak I; suhu +1,2; navbar terbuka; audio ke profil Bab 1.
- [ ] 5 putaran berturut-turut tanpa kebocoran memori/kinerja menurun.
- [ ] Tidak ada animasi pergantian selain dome (cek bingkai demi bingkai).

### 8.3 Navbar dan menu
- [ ] Navbar mengempis tepat setelah gulir dimulai dan terbuka kembali di hero (histeresis, tidak berkedip).
- [ ] Tautan tersembunyi tidak bisa difokus dengan Tab.
- [ ] Menu: buka/tutup via tombol, Esc, scrim, geser (HP); fokus terkunci; kembali ke tombol; konten belakang `inert`; cerita tidak bergeser.
- [ ] Klik Home saat di Home hanya menutup menu.

### 8.3b Penanda bab dan "Re:"
- [ ] Daftar Babak I (01–06) → hilang saat punchline → daftar Babak II (07–10) bernomor melanjutkan.
- [ ] Suhu di label aktif sesuai tabel.
- [ ] "Re:" menyala tepat di batas `PUNCH.to`, padam saat mundur dan saat loop.
- [ ] Judul hero, logo navbar, dan blok identitas menu selalu sinkron.

### 8.4 Kursor
- [ ] Cincin meregang searah gerak, kembali bulat pelan; membesar di tautan; hilang di input; tidak ada di HP.
- [ ] Sama di 60 Hz dan 120 Hz.

### 8.5 Galeri Artikel
- [ ] 12 kartu; filter gabungan benar untuk **6 kombinasi × 2 pilihan** dan hitungan chip ikut berubah.
- [ ] Filter tersimpan di URL; kembali dari detail mempertahankannya.
- [ ] Detail artikel: 400–600 kata, sumber, "Artikel berikutnya" berfungsi (12 → 1).
- [ ] Partikel latar berhenti saat tab tersembunyi.

### 8.6 Contact
- [ ] Validasi tiap kolom; pesan galat jelas; fokus ke galat pertama.
- [ ] Kirim sukses (endpoint nyata); status sukses; kirim gagal (offline) → banner galat, data tidak hilang.
- [ ] Mode `mailto` bila endpoint tidak ada.
- [ ] Honeypot tidak terisi pada pengguna normal.

### 8.7 Visual per bab (cek berdampingan dengan 03)
- [ ] Palet, suhu, butiran, vignette, retak, melt sesuai tabel 02 bagian 5.
- [ ] Tidak ada teks di atas warna yang sedang bergeser; kontras lolos di plateau.
- [ ] Botol paling berkilau; tidak ada warna hangat selain amber ≤ 4%.
- [ ] Punchline hening; Bab 10 tumbler terpisah dan paling menonjol; tidak ada logo.

### 8.8 Aksesibilitas
- [ ] Seluruh halaman non-Home bisa dioperasikan dengan keyboard; urutan fokus logis; cincin fokus terlihat.
- [ ] Lighthouse Accessibility ≥ 95; axe: nol pelanggaran serius.
- [ ] `prefers-reduced-motion`: `StaticStory` dengan 11 panel berurutan; kursor tanpa regang; panel menu tanpa meluncur.
- [ ] Zoom 200% dan teks besar: tidak ada konten terpotong.
- [ ] Setiap gambar bermakna punya `alt`; dekoratif `alt=""`.
- [ ] Judul tab dan pengumuman rute benar.

### 8.9 Konten dan kejujuran
- [ ] Setiap angka di website ada di `facts.ts` dengan `verified: true` + sumber + tahun.
- [ ] Label skenario terlihat di hero.
- [ ] Suhu Babak II tetap +1,5°C. Tidak ada klaim "daur ulang mendinginkan bumi".
- [ ] Catatan kejujuran daur ulang ada di Bab 9.
- [ ] Sumber lengkap di About dan di bawah tiap artikel.
- [ ] Tidak ada SARA, hoaks, atau kekerasan; tidak menyalahkan pengunjung.

### 8.10 Cadangan dan galat
- [ ] WebGL mati → `StaticStory` tampil dan dapat dipakai.
- [ ] Konteks WebGL hilang → pulih atau fallback tanpa layar kosong.
- [ ] `?q=low` menampilkan versi ringan yang tetap bagus.
- [ ] JS dimatikan → `<noscript>` informatif.
- [ ] 404 tampil benar; rute tak dikenal tidak membuat layar kosong.

---

## 9. Tingkat keparahan bug

| Level | Contoh | Aturan |
|---|---|---|
| **P0** | Bab bisa dilewati; layar kosong; crash; form tidak mengirim; angka salah | Hentikan semua kerja lain sampai selesai |
| **P1** | Loop gagal/terpicu tidak sengaja; fokus menu rusak; FPS < 24 di HP; kontras gagal | Selesaikan sebelum fitur baru |
| **P2** | Jitter kecil, ketidaksesuaian visual, salah ketik | Selesaikan sebelum rilis |
| **P3** | Penyempurnaan | Jika waktu ada |

---

## 10. Daftar periksa rilis dan pengumpulan

- [ ] Nama folder/repo `webdesign_namaTim_technoversary_vol.II`.
- [ ] `README.md`: judul, deskripsi, petunjuk instalasi, cara menjalankan, nama tim dan anggota, subtema.
- [ ] `npm install && npm run dev` berjalan di mesin bersih (uji di komputer lain atau kontainer).
- [ ] `npm run build` bersih tanpa peringatan penting; `dist/` tidak berisi alat debug (`grep "freeze"` kosong).
- [ ] Tidak ada `.env` berisi rahasia di repo; `.env.example` ada.
- [ ] `package-lock.json` di-commit.
- [ ] `credits.ts` lengkap; About menampilkan atribusi.
- [ ] Skor Lighthouse tercatat di README/`docs/lighthouse/`.
- [ ] Tangkapan layar tiap bab di `docs/shots/`.
- [ ] Tidak ada aset berbayar/template/komponen premium.
- [ ] Tidak ada berkas besar tak terpakai; ukuran repo wajar.
- [ ] `npm run build && npm run preview` berfungsi, termasuk Formspree.
- [ ] **Pengumpulan sebelum batas waktu + toleransi** (lihat guidebook). Simpan bukti kirim.

---

## 11. Persiapan babak final (offline, 20 menit presentasi + 15 menit tanya jawab)

### 11.1 Rencana demo (urutan)
1. Buka Home (hero) dan jelaskan **satu kalimat konsep** dan subtema Kampanye.
2. Gulir Bab 1 → 6: tunjukkan **suhu naik dan UI memburuk**, penanda bab, butiran, retak, meleleh.
3. **Punchline** (diam 3 detik). Jelaskan titik balik.
4. Gulir Bab 7: **"Re:" menyala**, kilas sungai. Bab 8–9: kejujuran proses.
5. **Bab 10:** zoom out → pan → sorot tumbler → *"Bawa botolmu besok."*
6. Tunjukkan **gestur loop** (tarik penuh) dan hero identik.
7. Navbar mengempis dan **panel menu**.
8. **Galeri Artikel:** filter gabungan (Negatif + Global), buka satu artikel, tunjukkan sumber.
9. **About** (target 1,5°C, sumber, atribusi) dan **Contact** (kirim pesan nyata).
10. Tunjukkan **mode ringan/reduced-motion** dan skor Lighthouse.

### 11.2 Cadangan demo
- Siapkan **build lokal** (`npm run preview`) di dua laptop, dan **video rekaman layar** 3 menit sebagai cadangan terakhir.
- Siapkan versi `?q=low` bila laptop presentasi lemah.
- Matikan notifikasi; mode pesawat tidak boleh mematikan Formspree (siapkan hotspot).
- Uji proyektor/resolusi lebih dulu (kontras gelap bisa pudar di proyektor: periksa Bab 5–6 dan punchline).

### 11.3 Kemungkinan pertanyaan juri (siapkan jawaban; bobot 10%)
| Pertanyaan | Dasar jawaban |
|---|---|
| "Apakah botol benar-benar menaikkan suhu bumi?" | Perangkat naratif, label skenario; fakta nyata di About (produksi plastik dari fosil dan emisi), dengan sumber |
| "Kenapa Babak II suhunya tetap 1,5°C?" | Agar tidak terbaca "daur ulang mendinginkan bumi"; 1,5°C ambang target iklim |
| "Kenapa tumbler, bukan daur ulang?" | Hierarki kurangi → pakai ulang → daur ulang; "mengepel itu baik, menutup keran lebih baik" |
| "Kenapa tidak ada tombol lewati?" | Cerita linear; navigasi lain (Konten) tetap bebas. Bagian belajar mandiri ada di Galeri Artikel |
| "Bagaimana performanya dengan 3D?" | Prosedural tanpa model, lazy chunk, tier kualitas, DPR dibatasi, bukti Lighthouse/FPS |
| "Mengapa React dan Three.js murni?" | Mesin imperatif di luar React (tanpa re-render per frame), bundel kecil, kendali penuh |
| "Bagaimana kalau perangkat tidak mendukung WebGL?" | `StaticStory` panel statis yang tetap berurutan |
| "Dari mana angka-angkanya?" | `facts.ts` terverifikasi dengan sumber dan tahun; ditampilkan di About dan artikel |
| "Apa yang orisinal?" | Konsep, aset prosedural, ilustrasi, audio sintetis buatan tim; atribusi jelas |
| "Apa kendala terbesar dan solusinya?" | Ratchet agar bab tak bisa dilewati; gestur loop tanpa pemicu tidak sengaja; kontras saat warna bergeser (jeda teks); performa 3D di HP |
| "Bagaimana aksesibilitasnya?" | Reduced-motion, keyboard, fokus, kontras terhitung, `inert`, ARIA, label skenario |
| "Apa dampak nyata yang diharapkan?" | Satu ajakan konkret: bawa botol sendiri; artikel menunjukkan efek nyata dari tindakan kecil |
