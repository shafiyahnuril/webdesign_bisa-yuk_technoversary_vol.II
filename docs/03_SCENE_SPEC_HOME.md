# 03 · SPESIFIKASI SCENE HOME (bab demi bab)

> Alur 10 bab + punchline, suhu, palet, teks kunci, adegan, "Re:", penanda bab, loop = **[DISEPAKATI]** (lihat konsep bagian 6 sampai 9, 18).
> Isi detail di dokumen ini (panjang gulir, komposisi 3D, posisi kamera, keyframe, bentuk objek, jendela kilas, jeda teks) = **[USULAN]** sampai disetujui. Angka kamera/posisi = **[PROTOTIPE]**.
> Cara membaca: setiap bab punya **ringkasan**, **panggung (apa saja yang ada di dunia 3D)**, **keyframe (waktu lokal `t` dari 0 sampai 1)**, **teks dan data**, **efek DOM**, **audio**, **transisi masuk/keluar**, **varian HP**, **fallback**, dan **kriteria selesai**.

---

## 1. Panggung (stage): aturan bersama

### 1.1 Susunan lapisan
```
z0   Latar palet (CSS, color-mix dari --bg-a/--bg-b)          ← satu-satunya sumber warna latar
z10  Judul hero "Re:bottle" (DOM) – hanya aktif di Bab 1     ← DI BELAKANG botol
z20  Kanvas WebGL (transparan, alpha: true)                   ← botol dan seluruh dunia 3D
z30  Teks bab, panel salin, kartu surat, counter (DOM)
z40  Penanda bab kiri
z50  Dome loop
z60  Overlay butiran + vignette (CSS, pointer-events: none)
z80+ Scrim, panel menu, navbar, kursor
```
Kanvas **transparan**: semua warna latar datang dari CSS. Dunia 3D hanya berisi objek (botol, air, kota, mesin, dst.). Air dan langit digambar oleh objek 3D di atas latar CSS.

### 1.2 Kamera dan satuan dunia
- **1 unit = 10 cm.** Botol 500 ml: tinggi **2,1**, diameter **0,65**.
- Kamera: `PerspectiveCamera(fov 35, near 0.1, far 200)`.
- Posisi awal (hero): `pos (0, 1.05, 7.2)`, `look (0, 1.05, 0)`. Tinggi terlihat di jarak 7,2 = 4,54 unit → botol mengisi **46% tinggi layar**. 
- **HP (portrait):** `camera.setViewOffset(w, h, 0, h*0.12, w, h)` menggeser adegan ke atas 12% agar teks di 40% bawah tidak menimpa subjek. Selain itu `fov` dinaikkan ke 42 bila `aspect < 0.7`.
- Notasi kamera di dokumen ini: `Cam(pos; look; fov)`.

### 1.3 Anatomi tiap bab (waktu lokal `t`, 0 sampai 1)
Semua bab mengikuti irama yang sama agar warna dan teks aman:

| Rentang `t` | Fase | Keterangan |
|---|---|---|
| 0,00 – 0,10 | **Teks masuk** | Judul bab muncul (huruf per huruf, 40 ms stagger) |
| 0,10 – 0,66 | **Plateau** | Warna murni, teks penuh, aksi utama adegan |
| 0,66 – 0,72 | **Teks keluar** | Seluruh teks memudar (opacity → 0, translateY −16px) |
| 0,72 – 1,00 | **Jendela pergeseran** | Palet bergeser ke bab berikutnya (smoothstep 0,7→1), adegan menyiapkan bab berikutnya. **Tidak ada teks** (*text gap*) |
| (0,00 – 0,08 bab berikutnya) | Gap lanjutan | Teks bab berikutnya baru masuk di ≥ 0,06 |

Bab dengan teks tambahan (Bab 3, 8, 9, 10) mengatur ulang ritmenya di bagian masing-masing, tetapi **aturan "tidak ada teks saat warna bergeser"** tidak pernah dilanggar.

### 1.4 Antarmuka `Scene` (lihat 06 untuk TypeScript lengkap)
```ts
interface Scene {
  id: string;                                   // "b1".."b10", "punch"
  build(ctx: StageContext): void;               // buat geometri/material SEKALI (lazy saat mendekati)
  enter(): void;                                // dipanggil saat bab mulai relevan (preload ±0,15)
  update(t: number, p: number, dt: number): void; // t = waktu lokal 0..1, p = shown global
  exit(): void;                                 // sembunyikan, lepas sumber daya berat
  dispose(): void;                              // bebaskan GPU
}
```
**Aturan:** hanya scene yang berada dalam jangkauan `[mulai − 0,06, akhir + 0,06]` yang `visible` dan di-update. Geometri dibuat lazy dan dibebaskan setelah dilewati (kecuali objek bersama).

### 1.5 Objek bersama (tidak per-bab)

| Objek | Dipakai di | Keterangan |
|---|---|---|
| `Bottle` | Bab 1–5, punchline, Bab 7–8 | Satu instance, diparkir/dipindah antar scene |
| `Hand` | Bab 2, 7 | Dibuat sekali, pose dikontrol |
| `Particles` | Bab 5, 6, punchline | Satu `Points` (maks. 2400/900) |
| `WaterSystem` | Bab 3, 4, 5, 7 (kilas) | Satu bidang air dengan `uMode` |
| `Lights` | Semua | Key/Rim/Fill + env; nilai per bab dari tabel isyarat (02 bagian 5) |
| `ContactShadow` | Hampir semua | Plane bayangan radial prosedural |

---

## 2. Anggaran gulir (durasi tiap bab) [USULAN, PROTOTIPE]

Total tinggi gulir cerita = **2.240 vh** (di atas satu layar). Tinggi dokumen Home = `(2240 + 100) vh` agar rentang gulir tepat 2.240 vh.

| Segmen | Panjang (vh) | Mulai (vh) | `STARTS` (0–1) | Akhir (0–1) | Catatan |
|---|---|---|---|---|---|
| Bab 1 Lahir | 140 | 0 | **0,0000** | 0,0625 | Termasuk hold hero |
| Bab 2 Sekali Pakai | 180 | 140 | **0,0625** | 0,1429 | |
| Bab 3 Tersesat | 200 | 320 | **0,1429** | 0,2321 | |
| Bab 4 Lautan | 200 | 520 | **0,2321** | 0,3214 | |
| Bab 5 Terurai | 220 | 720 | **0,3214** | 0,4196 | |
| Bab 6 Kembali ke Kita | 220 | 940 | **0,4196** | 0,5179 | |
| Punchline | 180 | 1160 | `PUNCH.from` **0,5179** | 0,5982 | Teks bertahan ±76 vh |
| Bab 7 Di Tempat yang Benar | 140 | 1340 | `PUNCH.to` **0,5982** | 0,6607 | Paling pendek di Babak II |
| Bab 8 Perjalanan Kedua | 180 | 1480 | **0,6607** | 0,7411 | |
| Bab 9 Hidup Baru | 200 | 1660 | **0,7411** | 0,8304 | |
| Bab 10 Surat Terakhir | 380 | 1860 | **0,8304** | 1,0000 | 10a–10e di 10.2 |
| **Total** | **2240** | | | | |

Kode (nilai tidak ditulis tangan, diturunkan dari panjang):
```ts
export const LENGTHS_VH = { b1:140, b2:180, b3:200, b4:200, b5:220, b6:220, punch:180, b7:140, b8:180, b9:200, b10:380 } as const;
export const TOTAL_VH = Object.values(LENGTHS_VH).reduce((a, b) => a + b, 0);       // 2240
export const STARTS   = cumulative(LENGTHS_VH).map(v => v / TOTAL_VH);               // awal tiap segmen
export const PUNCH    = { from: STARTS[6], to: STARTS[7] };                          // 0,5179 / 0,5982
```
Perubahan panjang bab **hanya** di `LENGTHS_VH`. Semua logika lain menyesuaikan sendiri.

---

## 3. Objek bersama: spesifikasi detail

### 3.1 Botol (`Bottle`) [USULAN]

**Dibuat dari:** Three.js `LatheGeometry` (prosedural). Tanpa berkas model.
**Ukuran:** tinggi total 2,1 · diameter badan 0,65 (radius 0,325) · tebal dinding visual 0,018.
**Jumlah segmen:** 48 (HIGH), 32 (MEDIUM), 20 (LOW).

Profil lathe (titik `(radius, y)` dari dasar ke atas; satuan unit):
```
(0.000, 0.000)  (0.190, 0.000)  (0.255, 0.018)  (0.300, 0.060)      // dasar bergelombang, tepi bawah
(0.322, 0.140)  (0.328, 0.240)  (0.318, 0.300)  (0.328, 0.360)      // badan bawah dengan lekuk (waist groove)
(0.328, 0.520)  (0.320, 0.580)  (0.328, 0.640)                       // badan tengah
(0.328, 1.150)  (0.322, 1.250)  (0.300, 1.380)                       // badan atas mulai bahu
(0.240, 1.540)  (0.170, 1.660)  (0.132, 1.740)                       // bahu menyempit
(0.130, 1.790)  (0.160, 1.800)  (0.160, 1.830)  (0.130, 1.840)      // cincin leher (support ring)
(0.126, 1.900)                                                      // leher atas
```
- **Dasar:** disederhanakan (tanpa petaloid) tetapi dengan lekuk melingkar (dua alur) agar terbaca sebagai botol PET.
- **Tutup:** silinder radius 0,148, tinggi 0,20, `y 1,90 → 2,10`; 40 alur vertikal lewat perpindahan radial `r = 0,148 + 0,004·sin(40θ)`. Warna `#BFE7FF`, matte.
- **Cairan:** lathe kedua dengan profil dalam (radius −0,02), tinggi isi **85%** (hingga y ±1,45). Material `MeshPhysicalMaterial` `#BFE9FF`, `transmission 0.9`, `opacity` 0,55. Level cairan dikontrol dengan **clipping plane horizontal dunia** (`renderer.localClippingEnabled = true`), bukan dengan menskalakan mesh.
- **Label:** pita silinder radius 0,332, `y 0,55 → 1,05`, `MeshStandardMaterial` `#E6EAF2` dengan `CanvasTexture` 512×128 berisi: garis tipis aksen dan satu ikon tetes sederhana. **Tanpa teks, tanpa logo merek apa pun.**
- **Kekeruhan** (`uTurbid` 0–1): `roughness = 0.06 + 0.44·uTurbid`, `transmission = 1 − 0.45·uTurbid`, `attenuationColor` lerp dari `#CFE9FF` ke `#6B7F8F`.
- **Retak** (`uCrack` 0–1): `alphaMap` retakan putih tulang (CanvasTexture prosedural, spesifikasi di 07 aset `T-CRACK`), ditampilkan dengan ambang `step(noise, uCrack)` sehingga retakan **tumbuh** dari titik-titik.
- **Pecah** (`uBreak` 0–1): badan botol dipecah menjadi **48 serpihan** (12 sudut × 4 pita; HP 24) dalam **satu geometri tergabung** dengan atribut `aShard` (id), `aCenter`, `aRand`. Pergerakan dihitung di *vertex shader* (`onBeforeCompile`): posisi += arah(aShard)·`uBreak`·jarak + rotasi di sekitar `aCenter`. Satu *draw call*.
- **Pantulan:** `scene.environment` dari `PMREMGenerator.fromScene(new RoomEnvironment())` (tanpa HDRI eksternal).
- **Gerak idle:** naik-turun 0,03 unit (periode 4 detik) + putaran Y pelan 0,15 rad/s. Dimatikan di `prefers-reduced-motion`.
- **Pivot:** dasar botol di `y = 0`. Tengah massa ±1,05.

### 3.2 Tangan (`Hand`) [USULAN: prosedural gaya clay]

Tangan **prosedural abstrak** (bukan realistis), berwarna **biru-tulang netral `#BFD3EA`** (menghindari representasi warna kulit dan menjaga palet).
- Telapak: `RoundedBox(0.85 × 0.95 × 0.34, radius 0.12)` (skala diorama, sesuai botol Ø0,65).
- Jari (4): masing-masing 2 kapsul (proksimal 0,36 × radius 0,085; distal 0,29 × radius 0,075) dengan sendi (pivot) di pangkal.
- Ibu jari: 2 kapsul (0,32 dan 0,27) dari sisi telapak, sudut 40°.
- Lengan bawah: kapsul 3,8 panjang, radius 0,20, keluar dari bingkai layar.
- **Pose** (parameter sudut sendi per jari, `lerp` antar pose):
  - `OPEN` (telapak terbuka), `GRIP` (jari melingkar radius botol 0,33), `RELEASE` (jari terbuka cepat), `THROW` (pergelangan menekuk 25° lalu melenting).
- Material: `MeshStandardMaterial`, roughness 0,8.
- Jika hasilnya kurang meyakinkan saat prototipe, **cadangan:** siluet tangan SVG dua dimensi yang digeser di lapisan DOM (z25) dengan botol 3D tetap. Dicatat di `DECISIONS.md` bila dipakai.

### 3.3 Partikel mikroplastik (`Particles`) [USULAN]
- `THREE.Points` + `ShaderMaterial`. Jumlah: **2400** (HIGH), **1400** (MEDIUM), **800** (LOW/HP).
- Atribut: `aSeed` (vec3 posisi awal di permukaan botol), `aRand` (vec4), `aSize` (2–6 px).
- Uniform: `uBreak`, `uFlow`, `uAttract[3]` (posisi ikan), `uSettle`, `uTime`, `uColor (#E6EAF2)`, `uFade`.
- Gerak: dorongan keluar dari botol (`uBreak`), lalu drift dengan *curl-like noise* sederhana (dua `sin` bertingkat), lalu tarik ke penarik ikan (`uAttract`) dengan ukuran mengecil saat masuk (`uFlow`), lalu mengendap di piring (`uSettle`).
- Blending: aditif lembut (`THREE.AdditiveBlending`), `depthWrite: false`. Titik bulat dengan `smoothstep` di fragment shader.
- Hanya ada satu instance; dibuat saat mendekati Bab 5.

### 3.4 Sistem air (`WaterSystem`) [USULAN]
Satu `PlaneGeometry` dengan **mode** (`uMode`) agar air tidak diganti-ganti antar bab:

| `uMode` | Bab | Bentuk | Warna dalam/dangkal | Gelombang |
|---|---|---|---|---|
| 0 Sungai | 3 | 40×14 unit, tepi dipotong tebing | `#0F2A4A` / `#2F5E86` → keruh `#2A465F` | Amplitudo 0,04, panjang gelombang 2,4 |
| 1 Laut | 4 | 120×120, tepi ke horizon | `#0C2547` / `#2D5A8C` | Gerstner 3 komponen, amplitudo 0,12 → 0,5, kecepatan ×1 → ×2,2 |
| 2 Malam | 5 | sama | `#0A1633` / `#1B2E57` | Gelombang tenang (amplitudo 0,18) |
| (kilas) | 7c | `uClean = 1` | `#1B5A66` / `#3AA6A3` | Amplitudo 0,03 |

Segmen: **160×160** (HIGH), **110×110** (MEDIUM), **64×64** (LOW). Fragmen: Fresnel dari environment + garis busa tipis dari noise (`smoothstep`), tanpa refraksi buffer (hemat).

---

## 4. HERO + BAB 1 · "LAHIR"

| | |
|---|---|
| **Rentang** | 0 – 140 vh · `shown` 0,0000 – 0,0625 |
| **Suhu** | +1,2°C |
| **Palet** | `c1` (`#0B2B80` / aksen `#8FD3FF` / ink `#F3F8FF`) |
| **"Re:"** | Pudar (garis luar, opasitas 0,45) |
| **Penanda bab** | Daftar Babak I, 01 aktif |
| **Navbar** | Terbuka penuh (mengempis saat `shown > 0,01`) |

**Panggung:** hanya `Bottle` dan `ContactShadow`. Tidak ada lingkungan. Latar polos kobalt dengan butiran halus (CSS).

**Keadaan awal (`t = 0`, tampil saat halaman dibuka dan setiap setelah loop):**
- Botol tegak di tengah `(0, 0, 0)`, bening (`uTurbid 0`), cairan 85%, tutup terpasang, putaran idle.
- Judul "Re:bottle" `--t-hero` **di belakang botol** (DOM z10 di bawah kanvas z20), rata tengah vertikal di 46% layar, "Re:" pudar.
- Petunjuk `(Gulir untuk mulai)` bergaris bawah di bawah tengah; **label skenario** di atasnya.
- Pemuatan: botol muncul dengan `scale 0,94 → 1` dan opacity 0 → 1 selama 1,2 detik setelah aset siap (tanpa layar pemuatan panjang; lihat 09 untuk strategi pemuatan).

**Keyframe:**

| `t` | Botol | Kamera | Lain |
|---|---|---|---|
| 0,00 – 0,06 | Diam dengan idle | `Cam((0,1.05,7.2);(0,1.05,0);35)` | Hero tertahan (hold) |
| 0,06 – 0,28 | Putar turntable `rotY 0 → π·0,9`; geser ke kanan `x 0 → +1,4` (ease-in-out) | Dolly `z 7,2 → 6,6` | Judul: `scale 1 → 1,16`, opacity 1 → 0, `translateY 0 → −4vh`. Label skenario dan petunjuk gulir memudar (0,3 detik) begitu `shown > 0,004` |
| 0,10 – 0,66 | Lanjut putar pelan + idle | — | Plateau |
| 0,66 – 0,72 | Bergeser ke `x +0,6` | — | Teks keluar |
| 0,72 – 1,00 | `x +0,6 → +0,6`, tetap; tangan mulai terlihat di tepi kanan-bawah saat `t ≥ 0,90` | Mulai miring 2° ke bawah | Palet `c1 → c2` |

**Teks dan data** [USULAN, lihat 11 untuk naskah]
- H1: **Lahir** (kolom 3–6, kiri, `t` 0,10).
- Isi (panel): 1–2 kalimat tentang bahan dasar botol [VERIFIKASI].
- Caption data (Mono): **"Dibuat dari fosil, usia 0 hari"**. Counter `0` tampil statis.

**Audio** (jika dinyalakan): dengung dasar bersih (pad sinus dua nada, filter tinggi), sangat pelan. Lihat 08.

**Transisi masuk:** (awal) muncul perlahan. (Setelah loop) tampil **sama persis**, tanpa animasi tambahan.
**Transisi keluar:** palet bergeser biru kobalt → biru kusam; tangan masuk dari kanan-bawah di akhir.

**HP:** judul `clamp` lebih kecil; botol di 38% tinggi (karena `viewOffset`), judul tidak di belakang botol penuh melainkan di atas-tengah.
**Fallback (reduced-motion / tanpa WebGL):** panel statis 1: ilustrasi SVG botol bening (`S-B1`), judul, teks.

**Selesai bila:** hero identik setiap dimuat; judul di belakang botol; label skenario hilang saat gulir dimulai; navbar mengempis pada `shown > 0,01` dan terbuka pada `< 0,003`.

---

## 5. BAB 2 · "SEKALI PAKAI"

| | |
|---|---|
| **Rentang** | 140 – 320 vh · `shown` 0,0625 – 0,1429 |
| **Suhu** | +1,5°C |
| **Palet** | `c2` (`#12336F` / `#9CC6EA` / `#F3F8FF`) |
| **Butiran** | 0,10 (mulai kasar) |

**Panggung:** `Bottle`, `Hand`, `ContactShadow`. Di akhir bab, bidang air sungai (WaterSystem mode 0) naik dari bawah layar.

**Pemblokiran:** tangan masuk dari **kanan-bawah**; botol di tengah-kanan `x +0,6`. Teks di kiri (kolom 3–6).

**Keyframe:**

| `t` | Aksi | Detail |
|---|---|---|
| 0,00 – 0,12 | **Tangan masuk** | Tangan `OPEN` bergerak `(4.0, −2.2) → (1.1, 0.4)`; botol tetap di `x +0,6` |
| 0,12 – 0,22 | **Genggam** | Pose `OPEN → GRIP`; botol di-*parent* ke jangkar telapak; teks masuk |
| 0,22 – 0,52 | **Minum** | Lengan miring: rotasi Z `0 → −115°` (tutup ke kiri-atas); botol naik ke `y 2,2`. **Cairan** turun dari 85% → 3% (clipping plane mengikuti gravitasi dunia). Cincin waktu SVG terisi bersamaan |
| 0,52 – 0,62 | **Turun** | Lengan kembali tegak; botol kosong, ringan |
| 0,62 – 0,70 | **Teks keluar** | |
| 0,70 – 0,90 | **Lempar** | Pose `THROW → RELEASE`; botol lepas, parabola: `(1.1,1.2) → (−4.2,−3.4)`, rotasi Z `−6 rad`, rotasi X `3 rad` (ease-heavy-in). Kamera miring turun 8° mengikuti |
| 0,90 – 1,00 | **Muncul sungai** | Bidang air (mode 0) naik dari bawah layar; percikan kecil (14 partikel) saat botol "mendarat" di batas bab |

**Teks dan data**
- H1: **Sekali Pakai**.
- Isi: satu kalimat tentang kebiasaan minum lalu buang.
- Data: **"Dipakai 10 menit"**. Cincin SVG (diameter 140px) mengisi 0 → 100% mengikuti `t 0,22 → 0,52`; angka Mono di tengah naik `0 → 10` ("menit").

**Efek DOM:** butiran naik ke 0,10. Palet `c2` murni sampai `t 0,70`.

**Audio:** tegukan (derau tersaring, 3 burst pendek) saat minum; desis lempar; plop kecil saat air.

**HP:** tangan 85% ukuran; botol di `viewOffset`; cincin waktu di bawah judul.
**Fallback:** panel statis 2: ilustrasi tangan memegang botol kosong (`S-B2`).
**Selesai bila:** level cairan turun mulus dan tetap horizontal saat botol miring; botol tidak menembus tangan; lemparan terbaca sebagai "dibuang begitu saja".

---

## 6. BAB 3 · "TERSESAT"

| | |
|---|---|
| **Rentang** | 320 – 520 vh · `shown` 0,1429 – 0,2321 |
| **Suhu** | +2,0°C |
| **Palet** | `c3` (`#183558` / `#8FB0CC` / `#F3F8FF`) |
| **Kabut** | `Fog exp2` warna = `--bg-now`, kepadatan 0,02 → 0,06 |

**Panggung:**
- `WaterSystem` mode 0 (sungai) memanjang ke sumbu X.
- **Tebing/tanggul** di sisi dekat: dinding beton (`BoxGeometry` 40×1,2×0,6 `#12294A`) dengan pagar (instanced posts).
- **Kota 3 lapis (instanced boxes):** jauh `z −30` (60 kotak, tinggi 3–14, `#0F2036`); tengah `z −16` (40 kotak, `#12294A` dengan atlas jendela `#8FB0CC` 20%); dekat `z −8` (tanggul + 3 gedung).
- **Jembatan** (lengkung `TubeGeometry` + dek `BoxGeometry`) melintas di `t ≈ 0,48`.
- **Sampah mengambang:** `InstancedMesh` untuk kantong (ikosahedron pipih), gelas (kerucut), botol lain (lathe sederhana), 28 instance; yang terlihat bertambah `4 → 28`.
- `Bottle` mengambang di tengah (`uTurbid` 0,10 → 0,45).

**Kamera:** bergerak **sejajar sungai** ke kanan: `Cam((−6 + 12·t, 0.45, 5.2); (−6 + 12·t + 1.0, 0.6, −2); 35)`. Botol hanyut pada kecepatan sedikit lebih lambat dari kamera sehingga bergeser pelan ke kiri layar. Paralaks: jauh 0,15×, tengah 0,45×, dekat 1×.

**Keyframe:**

| `t` | Aksi |
|---|---|
| 0,00 – 0,10 | Botol jatuh dari atas, percikan, mulai mengambang. Sungai kehilangan transparansi awal |
| 0,10 – 0,44 | Menyusuri kota; kekeruhan botol naik; kabut menebal; sampah bertambah |
| 0,44 – 0,54 | **Kolong jembatan:** layar gelap sesaat (vignette puncak 0,55, intensitas lampu ×0,4) lalu kembali |
| 0,54 – 0,72 | Lanjut hanyut; tanggul menjauh perlahan |
| 0,72 – 1,00 | **Muara:** kota dan tanggul bergeser mundur (`z`/`x` menjauh) dan menghilang; air melebar; `uMode 0 → 1` (sungai menjadi laut) |

**Teks dan data**
- H1: **Tersesat** (kanan, kolom 8–11; botol di kiri).
- Isi: 1–2 kalimat (sampah yang tidak ke tempatnya ikut hanyut).
- **Counter "450 tahun lagi"**: Mono besar, naik `0 → 450` pada `t 0,30 → 0,66` (linear), label kecil *"perkiraan waktu botol plastik terurai di alam"* [VERIFIKASI angka dan sumber; harus diberi label "perkiraan"].

**Audio:** riak air rendah, dengung kota jauh, gema saat di kolong jembatan.

**HP:** kota jauh 30 kotak, sampah 14, tidak ada jendela atlas (warna rata).
**Fallback:** panel statis 3: ilustrasi sungai dan kota gelap (`S-B3`).
**Selesai bila:** jembatan lewat tanpa pop-in; kota tidak "meloncat" saat bergeser ke muara; counter berhenti tepat di 450 sebelum teks keluar.

---

## 7. BAB 4 · "LAUTAN"

| | |
|---|---|
| **Rentang** | 520 – 720 vh · `shown` 0,2321 – 0,3214 |
| **Suhu** | +2,7°C |
| **Palet** | `c4` (`#142848` / `#86A8D0` / `#F3F8FF`) |
| **Isyarat** | Shimmer 2px, vignette 0,30, goyangan kamera 0,01 |

**Panggung:**
- `WaterSystem` mode 1 (laut), Gerstner; horizon jauh.
- **Matahari:** cakram putih `#F4FAFF` di `(8, 6, −30)` + lapisan **CSS radial** `radial-gradient(circle at 78% 18%, rgba(244,250,255,.35), transparent 45%)` yang naik ke 0,6 mengikuti `t`. **Tidak ada warna hangat.**
- **Dermaga:** 4 tiang (silinder radius 0,12, tinggi 4) di sisi kanan layar dengan **tanda ukur** (garis pita putih tulang tiap 0,5 unit). Garis air pada tiang **naik 0,3 unit** sepanjang bab (visualisasi "air laut naik").
- **Terumbu karang** di dasar (`y −4`): 18 gugus (cabang = silinder bercabang instanced + bola-bola), warna dari `#5E8FB8` (sehat) ke `#E6EAF2` (memutih) lewat `uBleach`.
- **Underwater plane:** langit-langit air (permukaan dilihat dari bawah) dengan kaustik palsu (noise bergerak) saat kamera menyelam.
- `Bottle` mengapung dan mengikuti ketinggian gelombang (`y = h(x,z,t)`; miring mengikuti normal). `uTurbid 0,60`.

**Kamera:** `Cam((0, 1.2, 6); (0, 0.9, 0); 35)` di atas air → menyelam: `y 1.2 → −1.4` pada `t 0,48 → 0,78` dengan `look` mengikuti ke atas ke botol yang tergantung di permukaan, lalu ke bawah ke terumbu.

**Keyframe:**

| `t` | Aksi |
|---|---|
| 0,00 – 0,12 | Muara membuka jadi laut terbuka. Botol terapung |
| 0,12 – 0,48 | Matahari terik naik; ombak makin besar (amplitudo 0,12 → 0,5, kecepatan ×1 → ×2,2); dermaga terlihat di kanan; air naik di tiang |
| 0,48 – 0,78 | **Menyelam:** kamera turun, permukaan terlihat dari bawah (botol silhouette), terumbu muncul dan **memutih** (`uBleach 0 → 1`) |
| 0,78 – 1,00 | Kamera kembali ke dekat dasar; gelap meningkat; palet bergeser ke `c5` |

**Teks dan data**
- H1: **Lautan** (kiri).
- Dua baris data mikro (Mono 13px) dengan placeholder: *"Permukaan laut naik [X] cm sejak [tahun]"* dan *"[Y]% terumbu karang terdampak pemutihan"* [VERIFIKASI keduanya].

**Audio:** ombak makin keras (derau tersaring), di bawah air: peredaman frekuensi tinggi (lowpass 400 Hz), dengung.

**HP:** laut 64×64, terumbu 8 gugus, kaustik dimatikan (gradien statis).
**Fallback:** panel statis 4 (`S-B4`).
**Selesai bila:** tidak ada "lompatan" saat kamera menembus permukaan (crossfade 0,15 detik gelap); botol tidak menembus ombak; karang memutih mulus.

---

## 8. BAB 5 · "TERURAI"

| | |
|---|---|
| **Rentang** | 720 – 940 vh · `shown` 0,3214 – 0,4196 |
| **Suhu** | +3,3°C |
| **Palet** | `c5` (`#101C38` / `#8098C2` / `#F3F8FF`) |
| **Isyarat** | Butiran 0,24, vignette 0,42, shimmer 4px, `--melt` 0,25 → 0,6, retak latar 0,55 → 0,8 |

**Panggung:** `WaterSystem` mode 2 (malam, tenang), `Bottle` (retak lalu pecah), `Particles`. Tidak ada matahari. Rim light dari kanan-belakang (aksen `#8098C2`, intensitas 1,6).

**Kamera:** lebih dekat dan orbit pelan: `Cam((4·sin(θ), 1.2, 4·cos(θ)); (0, 1.0, 0); 35)`, `θ: 0 → 40°` sepanjang bab.

**Keyframe:**

| `t` | Aksi |
|---|---|
| 0,00 – 0,35 | **Retak tumbuh:** `uCrack 0 → 1` (dari 3 titik). Botol bergetar ±0,01 (frekuensi naik). Retak latar halaman (CSS) muncul |
| 0,35 – 0,50 | **Menahan napas:** botol melayang diam, denyut cahaya rim pelan; suara mereda |
| 0,50 – 0,80 | **Pecah:** `uBreak 0 → 1` (ease-heavy-in lalu melambat seperti gerak lambat): serpihan memencar dan menipis; **partikel** keluar dari permukaan |
| 0,80 – 1,00 | Partikel menyebar ke seluruh layar dan hanyut ke bawah/menuju kamera; kamera turun ke bawah permukaan air (transisi ke Bab 6) |

**Teks dan data**
- H1: **Terurai** (kiri; huruf mulai meleleh: `--melt` ikut `t`).
- Isi: definisi singkat mikroplastik (partikel plastik < 5 mm) [VERIFIKASI].
- Data: *"serpihan di layar: N"* (N naik 0 → 2400, **ditandai "(ilustrasi)"**), bukan klaim statistik.

**Audio:** denging retak halus (klik sintetis acak), derau pecah (bandpass) di `t 0,5`, lalu desis butiran halus.

**HP:** serpihan 24, partikel 800, orbit kamera 20°.
**Fallback:** panel statis 5 (`S-B5`).
**Selesai bila:** pecah terbaca jelas pada satu momen (`t ≈ 0,5`); tidak ada serpihan yang menembus kamera; judul meleleh tetap terbaca.

---

## 9. BAB 6 · "KEMBALI KE KITA"

| | |
|---|---|
| **Rentang** | 940 – 1160 vh · `shown` 0,4196 – 0,5179 |
| **Suhu** | +4,0°C |
| **Palet** | `c6` (`#0A1226` / `#8A96C8` / `#F3F8FF`) |
| **Isyarat** | Butiran 0,30, vignette 0,55, shimmer 6px, `--melt` 0,6 → 1, retak latar 1 |

**Panggung:**
- **Bawah air gelap:** tidak ada bidang air; kabut gelap pekat (`#0A1226`, density 0,05); partikel tetap.
- **Ikan** (3 ekor, prosedural): badan = bola diskalakan `(1.0, 0.45, 0.22)`, ekor = prisma segitiga, sirip punggung = segitiga pipih, mata = bola kecil `#05080F`. Warna `#8A96C8`. ±320 segitiga per ikan.
- **Piring (adegan akhir):** `CylinderGeometry` piring (radius 1,6, tinggi 0,08, tepi naik) `#E6EAF2`; cekungan dalam radius 1,2; **filet ikan** = elipsoid pipih `(1.3, 0.12, 0.6)` `#C9D3E6` dengan alur kulit (normal); **garpu** dan **pisau** (kotak ramping) di kanan/kiri; meja `#05080F` dengan noise tipis.

**Kamera:** awal `Cam((0, 0.2, 5); (0, 0.4, 0); 35)` (bawah air). Pada `t 0,45 → 0,70` terangkat dan **menunduk** menjadi *top-down*: `pitch 0° → −90°`, `pos y 0.2 → 6.5`. Akhir `Cam((0, 6.5, 0.01); (0, 0, 0); 35)`.

**Keyframe:**

| `t` | Aksi |
|---|---|
| 0,00 – 0,30 | Partikel mengalir ke 3 ikan (`uAttract`), masuk ke mulut dan mengecil |
| 0,30 – 0,45 | Satu ikan mendekat kamera dan memenuhi layar (*match cut*: siluet ikan menjadi filet) |
| 0,45 – 0,70 | Kamera naik dan menunduk; piring naik dari `y −2 → 0` di bawah kamera; meja terlihat; partikel **mengendap** ke atas filet (`uSettle`) |
| 0,70 – 0,90 | Counter "X mikroplastik per minggu" naik; filet bercahaya putih tulang tipis |
| 0,90 – 1,00 | Tahan; mulai memudar menuju punchline (semua objek `uFade → 0`) |

**Teks dan data**
- H1: **Kembali ke Kita**.
- Kalimat data (Mono besar, tengah-bawah): ***"Kamu makan sekitar [X] mikroplastik per minggu."*** [VERIFIKASI: nilai X dan sumber; jika sumber menyebut rentang, tampilkan rentang dan nama sumber di bawahnya].
- Teks pendek: 1 kalimat yang menutup Babak I tanpa menyalahkan.

**Ruang kosong:** minimal 50% layar kosong di plateau; hanya piring (kanan) dan teks (kiri).

**Audio:** denyut sangat rendah (≈ 50 BPM) yang menguat; desis ikan; lalu hening dengan dengung tipis di akhir.

**HP:** ikan 2 ekor, partikel 800; piring di atas, teks di bawah.
**Fallback:** panel statis 6 (`S-B6`).
**Selesai bila:** *match cut* ikan → filet tidak terasa memotong kasar; angka X **hanya** dari `facts.ts` terverifikasi; ruang kosong terjaga.

---

## 10. PUNCHLINE · LAYAR HENING

| | |
|---|---|
| **Rentang** | 1160 – 1340 vh · `shown` 0,5179 – 0,5982 (`PUNCH.from` → `PUNCH.to`) |
| **Suhu** | +4,0 → +1,5°C (*rewind*), **angka tidak ditampilkan** [USULAN D18] |
| **Palet** | `cp0 #05080F → cp1 #08131F`, aksen `#C9D3E6`, ink `#EDEDED` |
| **Penanda bab** | **Disembunyikan** [DISEPAKATI] |
| **Navbar** | Hanya logo dan tombol bulat |

**Panggung:** `Bottle`, `Particles`, bagian objek Bab 6 yang memudar. Semua lampu turun ke ±8% lalu naik pelan.

**Keyframe:**

| `t` | Aksi |
|---|---|
| 0,00 – 0,08 | Piring, ikan, meja memudar (`uFade 1 → 0`), vignette naik ke 0,7 |
| 0,08 – 0,40 | ***Rewind:*** partikel mengalir **balik** ke bentuk botol (`uBreak 1 → 0`, ease-out); serpihan menyatu; `uCrack 1 → 0`; `uTurbid 0,9 → 0`; retak latar memudar; butiran 0,30 → 0,08. Botol utuh bening di tengah, hampir hanya terlihat dari rim tipis |
| 0,40 – 0,48 | Teks masuk kata demi kata (stagger 60 ms) di tengah layar |
| **0,48 – 0,90** | **TAHAN** (±76 vh gulir ≈ 2–3 detik gulir): teks berdiri sendiri, botol memudar menjadi hantu (opacity 0,15), vignette turun ke 0 |
| 0,90 – 1,00 | Teks keluar; palet bergeser `cp1 → c7`; "Re:" **belum** menyala (menyala di awal Bab 7) |

**Teks:** ***"Bagaimana jika semua ini tidak terjadi?"*** (Display 500, `--t-punch`, tengah, maks. 14ch per baris di HP).

**Audio:** nyaris hening. Ekor *reverse reverb* di `t 0,1–0,4` (derau menyapu naik), satu nada pad lembut saat teks muncul. Mati total di `t 0,9`.

**Fallback:** panel statis 7: layar gelap dengan kalimat (`S-P`).
**Selesai bila:** terasa benar-benar hening (daftar bab hilang, sedikit gerak); *rewind* terbaca (botol menyatu dari partikel); jeda cukup panjang untuk dibaca.

---

## 11. Panduan ritme umum antar-bab (ringkasan transisi)

| Dari → Ke | Mekanisme visual | Teks |
|---|---|---|
| Hero(1) → 2 | Tangan masuk dari kanan-bawah; palet kobalt → kusam | Gap |
| 2 → 3 | Botol dilempar keluar bawah; sungai naik dari bawah | Gap |
| 3 → 4 | Kota menjauh, sungai menjadi laut (`uMode 0 → 1`) | Gap |
| 4 → 5 | Kamera tenggelam ke gelap; air malam (`uMode 2`) | Gap |
| 5 → 6 | Partikel menyebar lalu mengalir ke ikan; kamera turun | Gap |
| 6 → Punchline | Semua objek memudar menjadi hampir hitam | Gap |
| Punchline → 7 | *Rewind* selesai, palet gelap-biru ke teal, "Re:" menyala | Gap |
| 7 → 8 | Botol dijatuhkan ke conveyor; teal → teal-hijau | Gap |
| 8 → 9 | Botol lolos tunnel cuci, kamera pan ke stasiun cacah | Gap |
| 9 → 10 | Kain/tote jadi; latar hijau tua → sage; **ink berbalik** | Gap (kritis) |
| 10 → Hero (loop) | Dome biru naik menutup; reset di balik dome | — |

---

## 12. BAB 7 · "DI TEMPAT YANG BENAR"

| | |
|---|---|
| **Rentang** | 1340 – 1480 vh · `shown` 0,5982 – 0,6607 (`PUNCH.to` → awal Bab 8) |
| **Suhu** | +1,5°C (konsisten) |
| **Palet** | `c7` (`#1F4F5E` / `#9FE6D0` / `#F1FAF7`) |
| **"Re:"** | **Menyala** tepat saat `shown ≥ PUNCH.to` (0,9 detik, kilau singkat) |
| **Penanda bab** | Berganti ke daftar Babak II (07 aktif), memudar silang 0,4 detik |
| **Fungsi** | Cermin Bab 2 (momen sama, keputusan berbeda). Napas lega. Bab paling pendek di Babak II |

**Panggung:** `Bottle` (bening, `uTurbid 0`), `Hand` (sama dengan Bab 2, pose sama), **3 tempat sampah berlabel**, `ContactShadow`, dan **jendela kilas** (render *scissor*) berisi `WaterSystem` mode sungai bersih.

**Tempat sampah** [USULAN D17] (`RoundedBox` 1,5 × 2,4 × 1,2, radius 0,08, skala diorama; tutup berengsel yang membuka/menutup; spesifikasi lengkap di 07 bagian 3.5):

| Tempat | Badan | Tutup | Label (CanvasTexture 512×128, Display 700, putih tulang) | Ikon |
|---|---|---|---|---|
| Plastik | `#2A7F78` | `#9FE6D0` | PLASTIK | botol |
| Kertas | `#2B6C8A` | `#7FB8D6` | KERTAS | lembaran |
| Organik | `#2E7D5B` | `#8FD6A0` | ORGANIK | daun |

Posisi X: Plastik `−2,0`, Kertas `−0,1`, Organik `+1,8` (tangan datang dari kanan, botol dimasukkan ke yang **paling kiri**: Plastik).

**Keyframe:**

| `t` | Langkah | Aksi |
|---|---|---|
| 0,00 – 0,12 | **7a** | Setelah *rewind*, tangan yang sama memegang botol kosong (pose `GRIP`) di posisi Bab 2 `(1.1, 0.9)`. "Re:" menyala. Tangan menegakkan botol |
| 0,12 – 0,40 | **7b** | Kamera mundur (`z 6,8 → 9,0`) mengungkap tiga tempat sampah. Tangan membawa botol `x 1,1 → −2,0`, tutup Plastik terbuka (rotasi X −70°), botol dilepas (`RELEASE`) dan **jatuh lurus** ke dalam. Pantulan kecil, tutup menutup. Tangan keluar ke kanan |
| 0,14 – 0,34 | **Data** | Cincin waktu mini (versi cermin Bab 2) mengisi `0 → 10` detik: **"Satu keputusan, 10 detik"** |
| 0,40 – 0,70 | **7c** | **Jendela kilas** membuka di kanan-atas (`34vw × 26vw`, radius 20px, garis 1px ink 30%, scale 0,8 → 1 dalam 0,3 detik). Isinya sungai Bab 3 versi **jernih** tanpa kabut, bergerak pelan, tanpa sampah. Label kecil di jendela: *"Sungai yang sama. Sekarang."* Menutup di `t 0,66–0,70` |
| 0,56 – 0,90 | **7d** | **Kartu surat** (kiri) muncul: ***"Kamu tidak membuangku ke sungai. Terima kasih."*** (Caveat, per kata). Tahan sampai `t 0,90`, keluar 0,90 – 0,96 |
| 0,90 – 1,00 | Persiapan | Palet `c7 → c8`; botol (di dalam tempat sampah) tampak diangkat/menghilang ke bawah (tutup menutup, tempat sampah turun `y −0,3`) |

**Teknik kilas (*scissor*):** render kedua dengan `renderer.setScissor/setViewport` ke persegi panjang jendela, `renderer.setScissorTest(true)`, kamera kedua dan scene sungai bersih (mode air `uClean 1`, tanpa kota dekat, tanpa kabut). Bingkai DOM (z30) hanya border dan label. **Dilarang** membuat renderer kedua.

**Audio:** "tung" pendek (sinus 180 Hz turun + derau 40 ms) saat botol masuk; dengung teal lembut; gemericik jernih saat kilas.

**HP:** jendela kilas 62vw × 40vw di bawah judul; dua tempat sampah terlihat (Plastik + Kertas), Organik terpotong.
**Fallback:** panel statis 8: ilustrasi botol di tempat sampah berlabel (`S-B7`) + surat.
**Selesai bila:** gerak botol ke dalam tempat sampah terasa "benar" (tidak menembus tutup); "Re:" menyala tepat di batas `PUNCH.to`; jendela kilas tidak menambah tekanan performa (>2 ms/frame).

---

## 13. BAB 8 · "PERJALANAN KEDUA"

| | |
|---|---|
| **Rentang** | 1480 – 1660 vh · `shown` 0,6607 – 0,7411 |
| **Suhu** | +1,5°C |
| **Palet** | `c8` (`#226B63` / `#B9F3C9` / `#F1FAF7`) |

**Panggung** (fasilitas pemilahan, tampak samping, gaya *clay*):
- **Dinding belakang:** bidang gradien `#1F5F59 → #226B63` dengan 4 panel jendela besar (persegi pucat `#B9F3C9` opasitas 0,12).
- **Conveyor:** `BoxGeometry` 18 × 0,4 × 2,4 (`#1B4D49`), permukaan sabuk dengan tekstur garis bergerak (`offset.x` bergeser), 12 rol silinder di sisi. Tinggi sabuk `y 0,6`.
- **Sampah campuran (InstancedMesh):** kaleng (silinder `#9FB8C8`), bola kertas (ikosahedron `#E6EAF2`), kotak kardus (`#A9C9B8`), botol PET lain (lathe bening, 6 buah), total 40.
- **Pemilah:** 3 stasiun di atas sabuk, masing-masing pipa/pendorong (silinder + piston) yang menggeser item ke **corong** di bawah (kaleng, kertas, lainnya).
- **Lorong cuci:** terowongan `BoxGeometry` setengah transparan (`#3AA6A3` 25%) dengan 160 partikel semprot jatuh.
- **Hopper PET** di ujung kanan.
- **"Teman-teman yang hilang":** 5 botol hantu (opacity 0,35) yang jatuh dari sabuk ke area gelap di bawah (visualisasi "tidak semua sampai di sini").
- `Bottle`: kekeruhan awal `uTurbid 0,25` (kotor, label aus) dan dibersihkan sampai 0.

**Kamera:** *tracking side shot*: `Cam((−5 + 10·t, 1.5, 6.2); (−5 + 10·t + 0.5, 0.9, 0); 35)`, sedikit miring ke bawah 6°.

**Keyframe:**

| `t` | Aksi |
|---|---|
| 0,00 – 0,12 | Botol jatuh dari corong kiri ke sabuk; sabuk bergerak |
| 0,12 – 0,40 | **Memilah:** pendorong menyingkirkan kaleng/kertas; PET dikelompokkan; botol kita disorot sekilas (rim aksen berdenyut) |
| 0,40 – 0,56 | **Yang hilang:** beberapa botol PET lain terlewat dan jatuh ke area gelap (hantu). Data muncul |
| 0,56 – 0,86 | **Lorong cuci:** botol masuk, semprot jatuh, `uTurbid 0,25 → 0`, label terlihat bersih; keluar dengan rim terang |
| 0,86 – 1,00 | Botol masuk hopper; kamera mempersiapkan geser ke stasiun cacah; palet `c8 → c9` |

**Teks dan data**
- H1: **Perjalanan Kedua**.
- **Surat** (muncul di `t 0,44–0,62`, hilang sebelum pergeseran): ***"Aku beruntung. Tidak semua temanku sampai di sini."***
- Data: ***"[X]% botol plastik berhasil dikumpulkan"*** (persentase dari sumber terverifikasi, ditampilkan sebagai Mono besar dengan sumber kecil di bawah) [VERIFIKASI].

**Audio:** dengung mesin ritmis lembut, klik pendorong (sintetis), desis semprot.

**HP:** item 20, hantu 3, semprot 80.
**Fallback:** panel statis 9 (`S-B8`).
**Selesai bila:** gerak sabuk dan item bebas *jitter*; hantu jatuh bermakna (bukan kebetulan); angka berasal dari `facts.ts` terverifikasi.

---

## 14. BAB 9 · "HIDUP BARU, TAPI..."

| | |
|---|---|
| **Rentang** | 1660 – 1860 vh · `shown` 0,7411 – 0,8304 |
| **Suhu** | +1,5°C |
| **Palet** | `c9` (`#2E7D5B` / aksen amber lokal `#F6B35A` / `#F4FBF6`) |
| **Aturan amber** | Satu-satunya warna hangat. Maksimum **4% luas layar**. Hanya di stasiun Lebur |

**Panggung** (jalur 4 stasiun berurutan horizontal; jarak antar stasiun 6 unit; kamera menggeser):

| Stasiun | Isi 3D | Detail |
|---|---|---|
| **01 Cacah** (x 0) | Corong (frustum) + rotor pisau (silinder bergigi berputar) di balik panel transparan + baki serpihan | Botol masuk corong, **menyusut** `scaleY → 0` sambil memancarkan 400 serpihan kecil (instanced quad `#E6EAF2`) ke baki |
| **02 Cuci** (x 6) | Bak (kotak terbuka) berisi air `#3AA6A3` 60% | Serpihan mengapung, 80 gelembung (Points) naik; warna serpihan menjadi lebih terang. **Label mikro "air"** (ikon tetes) |
| **03 Lebur** (x 12) | Tungku (kotak) dengan mulut membara kecil, `PointLight #F6B35A` (intensitas 2,2, jarak 3,5), ekstruder | Aliran lebur = pita (ribbon) dengan gradien emisif amber → krem pucat. Distorsi udara **lokal** (sprite bergelombang kecil). **Label mikro "energi"** (ikon kilat) |
| **04 Cetak** (x 18) | Spinneret + 60 filamen tipis (garis) → gulungan benang → kain bergulir; lalu **tote bag** terbentuk di meja kecil | Kain bermotif garis halus (`CanvasTexture`), tote: kotak dengan dua pegangan (torus setengah), warna teal `#2A7F78` |

Label stasiun melayang (DOM): `01 CACAH · 02 CUCI · 03 LEBUR · 04 CETAK` (Mono 12px) diproyeksikan dari posisi 3D tiap frame (4 elemen, `transform` saja).

**Kamera:** pan horizontal: `Cam((−1 + 20·ease(t), 2.4, 8.5); (… , 1.0, 0); 35)`. Pada `t 0,86–1,00` kamera naik dan menjauh menyiapkan Bab 10.

**Keyframe:**

| `t` | Aksi |
|---|---|
| 0,00 – 0,20 | Cacah |
| 0,20 – 0,40 | Cuci |
| 0,40 – 0,66 | Lebur (amber muncul, puncak di `t 0,5`) |
| 0,50 – 0,66 | Surat + label "energi dan air" tampil |
| 0,66 – 0,86 | Cetak: filamen → kain → tote |
| 0,86 – 1,00 | Tote dibawa ke tengah layar; latar hijau tua → sage; **ink berbalik** di sini (lihat catatan) |

**Teks:** H1 **Hidup Baru, Tapi...** · Surat: ***"Aku jadi sesuatu yang baru, tapi prosesnya butuh energi dan air."*** Tidak ada angka (jujur tanpa data yang belum terverifikasi). Catatan kecil di bawah: *"Banyak botol PET menjadi serat atau produk lain, bukan botol lagi."* [VERIFIKASI].

**Inversi ink (kritis):** tinta berganti dari `#F4FBF6` ke `#11261B` **hanya di rentang `t 0,90–0,95`**, saat tidak ada teks di layar. Teks Bab 10 baru masuk setelah warna sepenuhnya sage.

**Audio:** dengung mesin hangat (tanpa melodi), derak serpihan, desis tungku, lalu satu nada pad cerah saat tote terbentuk.

**HP:** hanya dua stasiun terlihat sekaligus; kamera lebih lambat. Serpihan 150, gelembung 30, filamen 24.
**Fallback:** panel statis 10 (`S-B9`).
**Selesai bila:** amber tidak melebihi 4% layar; stasiun terbaca berurutan; inversi ink tidak pernah menimpa teks.

---

## 15. BAB 10 · "SURAT TERAKHIR" (ADEGAN KAMERA PENUTUP)

| | |
|---|---|
| **Rentang** | 1860 – 2240 vh · `shown` 0,8304 – 1,0000 |
| **Suhu** | +1,5°C |
| **Palet** | `c10` (`#D9E6D6` / `#0F8B8D` / `#11261B`) |
| **Fungsi** | Puncak emosi dan ajakan bertindak |

### 15.1 Panggung (toko/rak, tenang dan bersih)
- **Latar:** bidang sage `#D9E6D6` (dari CSS) dengan lantai gradien halus; **rak panjang** (`RoundedBox` 26 × 0,12 × 1,4, `#BFD2BE`) setinggi 0,7.
- **7 produk daur ulang** di atas rak (jarak **3,2** unit, dari `x −9,6` sampai `+9,6`; **skala dramatis**: tinggi 2,4–3,4 unit, bukan skala nyata; dimensi pasti di 07 bagian 3.8):

| # | Produk | Bentuk 3D | Warna |
|---|---|---|---|
| 1 | **Tote bag** (10a) | Kotak membulat 2,6×2,8×0,7 + 2 pegangan torus | `#2A7F78` |
| 2 | Kaus | `ExtrudeGeometry` dari siluet 2D, digantung pada hanger | `#6BBF9B` |
| 3 | Ransel | Kotak membulat + 2 tali | `#3F6E8C` |
| 4 | Karpet gulung | Silinder pipih bermotif garis | `#8FC9B6` |
| 5 | Bangku taman | 4 kotak (dudukan dan kaki) | `#5E8F7B` |
| 6 | Pot tanaman | Lathe + tanaman sederhana (kerucut daun) | `#7FB8A0` |
| 7 | Jaket fleece | Ekstrusi siluet berbeda | `#4C8F86` |

- **Tumbler** [USULAN D19] di **`x +14,0`**, terpisah **4,4 unit** (pusat ke pusat) dari produk terakhir (`x +9,6`), di atas **plinth** bulat (silinder radius 0,5, tinggi 0,25, `#E6EEE4`):
  - Badan lathe tinggi 2,2 · radius 0,34 (500 ml), baja tahan karat **powder-coat `#0F8B8D` matte** (`roughness 0.55`, `metalness 0.1`).
  - Tutup `#D9E6D6` dengan **pegangan lingkar** (torus kecil). Cincin bawah `#E6EAF2` (aksen tipis).
  - **Tanpa logo, tanpa merek, tanpa teks.**
- **Lampu sorot** (`SpotLight`) di atas tumbler: intensitas 0 (awal), 3 (10d–10e), sudut 0,32, penumbra 0,6, warna putih netral. Tidak ada bayangan shadow-map (pakai `ContactShadow`).
- **Redup produk lain:** warna material produk dikalikan `0,45` (lerp), bukan opacity (hemat blending).

### 15.2 Lima langkah (waktu lokal `t` bab)

| `t` | Langkah | Kamera | Isi layar | Teks (kartu surat) |
|---|---|---|---|---|
| 0,00 – 0,14 | **10a Produk baru** | `Cam((−9.6,1.4,6.2);(−9.6,1.3,0);35)` close tote bag | Tote di tengah (lahir dari Bab 9), rak samar di sisi | ***"Aku jadi sesuatu yang berguna."*** |
| 0,14 – 0,28 | **10b Zoom out** | `z 6,2 → 19`, `x −9,6 → 0`, `y 1,4 → 2,2` (ease-in-out) | Koleksi 7 produk terungkap | ***"Ternyata aku tidak sendirian."*** |
| 0,28 – 0,42 | **10c Geser** | Pan `x 0 → +12`, `z 19 → 10` | Di ujung rak, tumbler terpisah di plinth muncul | Surat berhenti sejenak (**kosong ±6 vh**) |
| 0,42 – 0,72 | **10d Zoom in dan sorot** | `x → 14`, `z 10 → 5,5`, `y → 1,3`; sorot `0 → 3`; produk lain redup | Tumbler terang, rak gelap | ***"Aku senang diselamatkan. Tapi aku akan lebih senang kalau tidak perlu dibuat."*** (2 baris) |
| 0,72 – 1,00 | **10e Ajakan** | Diam di `Cam((14,1.3,5.5);(14,1.2,0);35)`; tumbler turntable pelan 0,2 rad/s | Tumbler penuh di tengah | **"Bawa botolmu besok."** (Display besar, bawah-tengah). `(Terus gulir)` muncul di `t 0,93` |

Teknik kamera (satu timeline GSAP dikendalikan `shown`):
```ts
const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
tl.addLabel("a", 0)
  .to(cam.position, { x: 0,    y: 2.2, z: 19,  duration: 0.14 }, 0.14)     // 10b
  .to(look,         { x: 0,    y: 1.4,         duration: 0.14 }, 0.14)
  .to(cam.position, { x: 12,   y: 1.6, z: 10,  duration: 0.14 }, 0.28)     // 10c
  .to(look,         { x: 12,                   duration: 0.14 }, 0.28)
  .to(cam.position, { x: 14,   y: 1.3, z: 5.5, duration: 0.30 }, 0.42)     // 10d
  .to(look,         { x: 14,   y: 1.2,         duration: 0.30 }, 0.42)
  .to(spot,         { intensity: 3,           duration: 0.30 }, 0.42)
  .to(dim,          { v: 0.45,                duration: 0.20 }, 0.42);     // faktor redup produk lain
// frame: tl.progress(clamp01((p - STARTS_B10) / LENGTH_B10_NORM)); lalu cam.lookAt(look)
```

**Kontras makna** [DISEPAKATI]: produk daur ulang = "bagus tapi di ujung"; tumbler = "bagus dan tidak perlu dibuang" → **berdiri sendiri dan terpisah**, bukan di tengah koleksi.

**Audio:** sunyi hangat; satu nada rendah naik pelan saat sorot menyala; di 10e hening dengan napas halus.

**HP:** produk 5 (tanpa ransel dan jaket), kamera 10b `z 21`, tumbler `x +13,2` (jarak 3,6); teks surat di panel bawah.
**Fallback:** panel statis 11: ilustrasi tumbler (`S-B10`) + surat + ajakan.
**Selesai bila:** tumbler jelas paling menonjol di 10d–10e dan terpisah; tidak ada logo; `(Terus gulir)` hanya muncul setelah ajakan; ink Bab 10 sepenuhnya gelap di atas sage (kontras 12,3).

---

## 16. LOOP TAK BERUJUNG (Home) [DISEPAKATI]

Spesifikasi gestur, parameter, dan kode ada di **04 bagian 7**. Ringkasan adegan:

| Momen | Yang terjadi |
|---|---|
| Akhir Bab 10 (`shown ≥ 0,999`) | `(Terus gulir)` terlihat di bawah-tengah. Dome biru (`#0B2B80`) bersembunyi di bawah layar |
| Pengunjung menggulir sedikit lalu berhenti | Dome naik sedikit, lalu kembali turun dalam ±8 frame |
| Menggulir terus (≈ 1.400 px berkelanjutan) | Dome naik sampai memenuhi layar (setengah lingkaran membesar) |
| `pull ≥ 1` | Layar penuh biru hero. Di balik dome, **dalam satu frame**: `shown = 0`, scene dikembalikan ke Bab 1, "Re:" pudar, daftar bab ke Babak I, suhu +1,2°C, navbar terbuka, audio kembali ke tema Bab 1 |
| Dome disembunyikan tanpa animasi | Hero tampil **identik** dengan pembukaan pertama |

Tidak ada animasi pergantian apa pun selain gestur setengah lingkaran itu. Tidak ada loop mundur.

---

## 17. Mode "Panel Statis" (`prefers-reduced-motion`, tanpa WebGL, atau LOW gagal) [DISEPAKATI prinsip]

Sebelas panel penuh layar, **berurutan dan tidak bisa dilompati**: hero(1) + Bab 2–6 + punchline + Bab 7–10 (jumlah panel: 11).

| Aspek | Aturan |
|---|---|
| Tampilan | Latar warna palet bab; ilustrasi SVG statis `S-B1 … S-B10`, `S-P` (spesifikasi di 07); judul, teks, data (angka akhir, tanpa animasi hitung) |
| Pembukaan berurutan | Panel berikutnya baru **dirender/dibuka** setelah panel saat ini berada di layar ≥ 60% selama ≥ 1,2 detik |
| Penanda bab | Tetap (daftar kiri), berganti sesuai panel dalam pandangan; tanpa meluncur |
| "Re:" | Menyala mulai Panel Bab 7 |
| Suhu | Teks `+X,X°C` di label panel |
| Loop | Panel terakhir memiliki tombol teks **"Mulai dari awal"** (menggulirkan ke panel 1 dengan *reset* instan) |
| Efek yang dihapus | Gerak kamera, 3D, partikel, peregangan kursor, panel menu meluncur, shimmer, melt (judul statis) |
| Komponen | `StaticStory` menggantikan `StoryStage` (dipilih oleh `useStoryMode()`) |

---

## 18. Indeks aset 3D per scene (rujukan ke 07)

| Scene | Aset 3D (kode prosedural) | Aset 2D / lain |
|---|---|---|
| Bab 1 | `Bottle`, `ContactShadow` | Butiran, ikon tetes label |
| Bab 2 | `Hand`, cincin waktu | — |
| Bab 3 | `WaterSystem`, kota (3 lapis), jembatan, sampah, tanggul | Atlas jendela |
| Bab 4 | Laut Gerstner, matahari, dermaga, karang | Kaustik (noise) |
| Bab 5 | Retak (`T-CRACK`), serpihan, `Particles` | Retak latar halaman (SVG `T-CRACKBG`) |
| Bab 6 | Ikan, piring, filet, garpu/pisau, meja | — |
| Punchline | (memakai objek sebelumnya) | — |
| Bab 7 | Tempat sampah x3, tutup berengsel, label | Ikon botol/lembaran/daun |
| Bab 8 | Conveyor, pemilah, lorong cuci, hopper, sampah campuran | — |
| Bab 9 | Cacah, bak cuci, tungku, spinneret, kain, tote | Motif kain |
| Bab 10 | Rak, 7 produk, plinth, **tumbler** | Motif karpet/kain |

---

## 19. Daftar periksa penerimaan Home (ringkas)

- [ ] `STARTS` dan `PUNCH` diturunkan dari `LENGTHS_VH`; tidak ada angka ajaib tersebar.
- [ ] Setiap bab: teks masuk 0–0,10, plateau 0,10–0,66, keluar 0,66–0,72, jendela pergeseran tanpa teks.
- [ ] Warna **tidak pernah** menimpa teks saat bergeser.
- [ ] Botol paling berkilau di semua scene.
- [ ] Tidak ada warna hangat selain amber Bab 9 (≤ 4%).
- [ ] Hero identik setelah loop. Penanda bab dan "Re:" kembali ke keadaan awal.
- [ ] Angka fakta hanya dari `facts.ts` ber-`verified: true`.
- [ ] Semua bab punya fallback panel statis.
- [ ] FPS ≥ 55 (desktop) / ≥ 30 (HP) di tiap bab pada tier masing-masing (lihat 09).
