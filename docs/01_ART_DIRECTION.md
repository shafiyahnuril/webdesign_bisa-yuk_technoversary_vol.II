# 01 · ART DIRECTION: Re:bottle

> Status: konsep warna Babak I/II, "Re:", kursor, loop, navbar, menu, penanda bab = **[DISEPAKATI]**. Gaya model 3D, cahaya, material, komposisi, dan aturan gerak di bawah = **[USULAN]**.

---

## 1. Satu kalimat arah visual

> **Sebuah film pendek yang bisa digulir:** dingin dan jernih di awal, makin berat dan gelap seiring suhu naik, lalu terbit pelan ke teal dan sage yang sejuk. Penonton merasakan *suhu*, bukan membacanya.

**Analogi:** botol adalah aktor utama, kamera adalah sutradara, `progress` adalah gulungan film yang hanya boleh diputar maju, dan suhu adalah detak jantung yang naik lalu ditenangkan.

---

## 2. Tiga rasa yang harus terasa

| Rasa | Di mana | Cara membangunnya |
|---|---|---|
| **Jernih → keruh** | Babak I | Botol bening berubah keruh, biru turun dari kobalt ke hampir hitam, butiran kasar, kabut, retakan |
| **Hening** | Punchline | Hampir hitam, hanya satu kalimat, objek memudar, tanpa penanda bab, suara mereda |
| **Lega → terarah** | Babak II | Teal sejuk, cahaya lembut, gerak halus dan teratur, tulisan tangan hangat (tanpa warna hangat), sage netral di akhir |

---

## 3. Referensi (hanya untuk rasa, bukan untuk ditiru)

| Referensi | Yang diambil | Yang **tidak** diambil |
|---|---|---|
| `unseen.co/projects/cult-of-the-north` | Navbar yang mengempis ke tombol bulat [DISEPAKATI] | Isi, aset, tata letak |
| `unseen.co/projects/blue-marine-foundation` | Kursor cincin yang meregang searah gerakan [DISEPAKATI] | — |
| `unseen.co/projects` | Galeri kartu besar dengan label dan panah ↘ [DISEPAKATI] | — |
| Hubtown (penanda bab) | Daftar bab di kiri dengan kotak penanda [DISEPAKATI] | — |
| `unseen.co/.../seascape-survey` | Rasa loop gestur [DISEPAKATI, tanpa animasi] | Animasi transisi |
| Film *Sliding Doors* | Bab 7 sebagai cermin Bab 2 | — |

Aset, kode, dan teks **dibuat sendiri**. Tidak ada gambar atau kode dari situs referensi.

---

## 4. Bahasa visual

### 4.1 Bentuk
- **Geometri bersih dan sederhana.** Silinder, bola, kapsul, kotak membulat. Tidak ada detail realistis yang membutuhkan tekstur gambar.
- **Sudut membulat** pada objek (radius bevel kecil) supaya terasa seperti figur tanah liat (*clay*).
- **Siluet kuat.** Setiap objek harus terbaca sebagai siluet di latar gelap.
- **Skala dramatis.** Botol sering dibuat besar, dunia (kota, laut, pabrik) kecil dan berlapis di belakang.

### 4.2 Gaya model 3D: *clay low-poly* [USULAN]
- Material matte (roughness 0,7–0,9), *flat-ish shading* dengan normal halus (tidak facet keras), bevel kecil.
- Satu-satunya material *glossy/transparan*: **botol plastik** dan **air**. Botol harus selalu menjadi objek paling berkilau di layar. Itulah yang membuatnya "tokoh utama".
- Tidak ada tekstur gambar pada objek. Detail permukaan hanya dari warna, normal sederhana, dan label prosedural (CanvasTexture).
- Tumbler (Bab 10) memakai **matte powder-coat**: sengaja kontras dengan botol plastik yang berkilau tembus pandang.

### 4.3 Warna
- Mengikuti palet di `02_DESIGN_SYSTEM.md` (angka hex final).
- **Aturan satu aksen per scene:** setiap scene punya satu warna aksen dari palet bab. Warna aksen dipakai untuk rim light, penanda, dan data.
- **Putih tulang `#E6EAF2`** adalah warna "kerusakan" di Babak I: retakan, karang memutih, mikroplastik. Tidak dipakai di Babak II kecuali sebagai label (tempat sampah) dan permukaan netral.
- **Amber `#F6B35A`** hanya muncul sebagai kilau tungku di Bab 9 (satu-satunya warna hangat). Maksimum 4% luas layar.

### 4.4 Cahaya (tiga lampu + lingkungan)

| Lampu | Peran | Nilai awal (Babak I) | Nilai awal (Babak II) |
|---|---|---|---|
| **Key** (DirectionalLight, kiri-atas depan) | Membentuk volume | putih dingin `#EAF4FF`, intensitas 2,2 | putih netral `#FFFFFF`, intensitas 2,4 |
| **Rim** (DirectionalLight, belakang-kanan) | Membuat tepi botol bercahaya, memisahkan dari latar | warna aksen bab, intensitas 3,0 (turun ke 1,2 di Bab 6) | warna aksen bab, intensitas 2,6 |
| **Fill** (HemisphereLight) | Menghindari bayangan mati | langit `#8FB0CC`, tanah `#0A1226`, intensitas 0,35 | langit `#BFEFE0`, tanah `#1F4F5E`, intensitas 0,5 |
| **Lingkungan** (PMREM dari `RoomEnvironment`) | Pantulan pada botol dan air | intensitas 0,6 (turun 0,25 di Bab 6) | 0,7 |

Aturan cahaya:
- **Makin parah suhu, makin sedikit cahaya.** Intensitas rim dan lingkungan turun bertahap dari Bab 1 ke Bab 6. Ini cara "mendinginkan" tanpa warna hangat.
- **Punchline:** semua lampu turun ke ±8% lalu naik kembali di Bab 7.
- **Bab 10d:** satu `SpotLight` menjadi pusat perhatian (intensitas 0 → 3), lampu lain diturunkan 40%.
- Bayangan: **hanya kontak bayangan lembut** (blob shadow / `ContactShadows`-style plane dengan tekstur radial prosedural). **Tidak memakai shadow map** (hemat performa).

### 4.5 Material kunci

| Objek | Material | Parameter awal |
|---|---|---|
| Botol (PET) | `MeshPhysicalMaterial` | `transmission 1`, `thickness 0.45`, `ior 1.45`, `roughness 0.06`, `clearcoat 0.6`, `attenuationColor #CFE9FF`, `attenuationDistance 3`. **Makin keruh:** roughness → 0,5; transmission → 0,55; attenuationColor → `#6B7F8F` |
| Air | `MeshPhysicalMaterial` / `ShaderMaterial` | Lihat 03 (sungai, laut) |
| Tutup botol | `MeshStandardMaterial` | `#BFE7FF`, roughness 0,5 |
| Tangan, tempat sampah, mesin, produk daur ulang | `MeshStandardMaterial` | roughness 0,75, warna dari palet bab |
| Tumbler | `MeshStandardMaterial` | `#0F8B8D`, roughness 0,55, metalness 0,1, tutup `#D9E6D6` |
| Mikroplastik | `ShaderMaterial` pada `Points` | warna `#E6EAF2`, ukuran 2–6 px, aditif lembut |

### 4.6 Tekstur dan butiran (*grain*)
- Butiran film **bukan hiasan**: ia adalah **termometer visual**. Intensitas naik tiap bab (lihat tabel di `02`, bagian "Isyarat suhu").
- Butiran dibuat prosedural (kanvas 256×256 di runtime), diputar lewat `background-position` bertahap (`steps(8)`), sehingga tidak ada berkas gambar.

---

## 5. Komposisi

### 5.1 Aturan tata letak desktop (≥ 1025 px)
- Grid 12 kolom, margin 6vw, gutter 2vw.
- **Kolom 1–2 dicadangkan** untuk penanda bab (±14vw dari kiri). Tidak ada teks di sana.
- Blok teks bab menempati **4 kolom** (kolom 3–6 atau 8–11) dan **berselang-seling** kiri/kanan agar mata bergerak.
- Botol berada pada **sumbu yang berlawanan** dengan blok teks (rule of thirds), kecuali hero dan Bab 10e (di tengah).
- Subjek utama mengisi **40–55% tinggi layar**. Lebih kecil dari 35% terasa hilang, lebih besar dari 65% terasa menekan teks.
- Ruang negatif adalah bagian dari cerita: di Bab 6 dan punchline, biarkan **≥ 50% layar kosong**.

### 5.2 Aturan tata letak HP (≤ 768 px)
- Satu kolom. Subjek 3D di **60% atas**, teks di **40% bawah** pada panel semi-transparan.
- Penanda bab menjadi garis tipis dengan titik (tanpa teks).
- Ukuran teks tidak boleh turun dari 16px (isi) dan 12px (label).

### 5.3 Hierarki teks pada tiap bab

| Tingkat | Isi | Perilaku |
|---|---|---|
| H1 bab | Judul bab (misal "Sekali Pakai") | Huruf besar mengikuti `--melt` (di Bab 5–6 meleleh) |
| Data | Counter/angka besar (misal "450 tahun lagi") | Font mono, naik dari 0 mengikuti `shown` |
| Isi | 1–3 kalimat | Di panel semi-transparan |
| Penegas | Satu baris kecil (sumber/label) | Opasitas 0,7 |

---

## 6. Prinsip gerak

| # | Prinsip | Keterangan |
|---|---|---|
| 1 | **Gerak mengikuti gulir, bukan waktu.** | Hampir semua gerak adalah fungsi `shown`. Pengecualian: idle (bobbing botol, butiran, partikel ambient) dan transisi UI (menu, "Re:") |
| 2 | **Ease dibedakan menurut makna.** | Kerusakan: *ease-in* (makin cepat). Pemulihan: *ease-out* (melambat, lega). Tarikan loop: linear |
| 3 | **Tidak ada gerak tanpa alasan.** | Setiap gerak harus menjawab "apa yang terjadi pada botol / suhu?" |
| 4 | **Satu pusat perhatian.** | Satu gerak dominan per momen. Gerak lain berkurang ≥ 60% |
| 5 | **Jeda adalah gerak.** | Plateau baca setiap bab (±35%) sengaja diam; hanya idle yang bergerak |
| 6 | **Pelan di Babak II.** | Durasi tween Babak II ±20% lebih lambat daripada Babak I. Ritme pernapasan, bukan detak |
| 7 | **Kamera tidak pernah goyang liar.** | Goyangan kamera maksimum 0,02 unit, hanya di Bab 4–6 sebagai pengganti "panas" |
| 8 | **Respek pada pengguna.** | `prefers-reduced-motion` menghapus gerak kamera, peregangan kursor, goyangan, dan meluncurnya panel |

### 6.1 Kosakata easing (tertulis di token)

| Nama | Kurva | Dipakai untuk |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(.16, 1, .3, 1)` | Muncul teks, kartu masuk |
| `--ease-gate` | `cubic-bezier(.2, .8, .2, 1)` | Panel menu, penanda bab |
| `--ease-in-out` | `cubic-bezier(.65, 0, .35, 1)` | Navbar mengempis |
| `--ease-heavy-in` | `cubic-bezier(.7, 0, .84, 0)` | Kerusakan (retak, pecah) |
| Linear | — | Hanya untuk `--pull` loop dan counter |

---

## 7. Nada tulisan (copy)

- Suara: **tenang, langsung, sedikit puitis, tidak menggurui**. Kalimat pendek. Tidak ada tanda seru berlebihan.
- Babak I: fakta dingin, data, kalimat tanpa kata sifat berlebihan.
- Punchline: satu pertanyaan.
- Babak II: botol bicara orang pertama ("Aku"), hangat, sedikit humor lembut, jujur soal keterbatasan daur ulang.
- Penutup: satu ajakan, bukan tiga.
- Tidak boleh: menyalahkan pengunjung ("kamu perusak bumi"), angka dramatis tanpa sumber, klaim "satu botol menyelamatkan bumi".

---

## 8. Do dan Don't

| Do | Don't |
|---|---|
| Botol selalu paling berkilau | Biarkan objek lain lebih berkilau dari botol |
| Gelap bertahap, kontras teks aman | Latar gelap dengan teks abu-abu tipis |
| Ruang kosong besar di Bab 6 dan punchline | Mengisi setiap sudut dengan partikel |
| Satu aksen warna per scene | Pelangi di satu layar |
| Menunjukkan suhu lewat butiran/retak/kabut | Mengecat layar merah/oranye |
| Teks pendek di panel semi-transparan | Paragraf panjang di atas adegan |
| Bunyi sebagai bonus (default mati) | Bergantung pada audio untuk memahami cerita |
| Kilau amber kecil di Bab 9 | Kilau amber di bab lain |
| Tumbler berdiri sendiri, agak terpisah | Menaruh tumbler di tengah rak bersama produk lain |

---

## 9. Pemeriksaan visual sebelum rilis (art checklist)

- [ ] Teks lolos kontras WCAG AA (4,5:1 isi, 3:1 teks besar) di **setiap titik transisi**, bukan hanya di plateau.
- [ ] Botol tetap objek paling berkilau di semua scene.
- [ ] Tidak ada warna hangat selain amber Bab 9.
- [ ] Butiran naik bertahap dan tidak terasa "kotor" di layar terang.
- [ ] Punchline benar-benar hening (daftar bab hilang, tidak ada gerak berlebih).
- [ ] Bab 10: tumbler terpisah dan paling menonjol saat 10d–10e.
- [ ] Hero identik di setiap putaran loop.
- [ ] Mode kontras tinggi/terang sistem tidak merusak teks (uji `forced-colors` ringan).
