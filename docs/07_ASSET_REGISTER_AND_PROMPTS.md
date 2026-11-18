# 07 · DAFTAR ASET DAN PROMPT GENERATOR

> Prinsip aset (hanya gratis/open-source/buatan sendiri; font, suara, foto, model berlisensi bebas dan diatribusikan di About) = **[DISEPAKATI]**. Strategi sumber aset (prosedural dulu), spesifikasi detail, dan seluruh prompt di bawah = **[USULAN]**.
> **Cara memakai dokumen ini:** (1) pakai **Bagian 2** sebagai daftar kerja semua aset; (2) bagian **3** memberi spesifikasi tepat untuk aset 3D prosedural (dibuat dengan kode oleh agen coding); (3) bagian **5–8** berisi **prompt siap-salin** untuk generator 3D, ilustrasi, SVG, dan gambar penunjang; (4) bagian **9–10** untuk pengolahan, penamaan, dan pencatatan lisensi.

---

## 1. Strategi sumber aset (keputusan)

| Jenis | Cara utama | Cara cadangan | Alasan |
|---|---|---|---|
| Objek 3D sederhana (botol, tumbler, tempat sampah, piring, conveyor, rak, mesin) | **Kode (Three.js prosedural)** | GLB hasil generator AI | Nol berkas, nol lisensi, ringan, konsisten gaya *clay* |
| Objek 3D organik (tangan, ikan, kaus, jaket, karang) | **Kode (primitif/ekstrusi)** | GLB AI (prompt di bagian 5) | Bisa dibuat sederhana dengan primitif; GLB opsional jika hasil kode kurang bagus |
| Tekstur | **Kanvas prosedural di runtime** | — | Tidak ada berkas gambar tekstur |
| Ilustrasi artikel dan panel statis | **SVG** (ditulis kode / dibuat dengan bantuan AI lalu dirapikan) | Gambar raster WebP | Ringan, tajam, sesuai palet |
| Audio | **Sintesis Web Audio (kode)** | Berkas CC0 | Tanpa lisensi, ukuran 0 KB |
| Font | Fontsource (OFL) | — | Lisensi aman |
| Foto | **Tidak dipakai** (semua ilustrasi buatan) | Unsplash/Pexels/Wikimedia bila terpaksa | Hindari risiko hak cipta |

> **Penggunaan alat AI:** Aturan lomba menyebut karya harus orisinal dan komponen harus gratis/open-source/buatan sendiri. Aset yang dibuat tim dengan bantuan alat AI (dengan prompt buatan sendiri) umumnya dianggap hasil buatan sendiri, **tetapi** tim harus (a) memeriksa ketentuan lisensi alat yang dipakai, (b) mencatatnya di `credits.ts`, dan (c) mencantumkannya di About (bagian Atribusi). **Disarankan menanyakan ke panitia** bila ragu. Dokumen ini membuat **jalur utama tanpa AI** (kode) sehingga risiko minimal.

---

## 2. REGISTER ASET (daftar kerja)

Kolom **Status**: ☐ belum · ◐ sedang · ☑ selesai. **Wajib** = dibutuhkan konsep; **Opsi** = peningkatan.

### 2.1 Objek 3D (modul kode di `src/stage/objects/`)

| ID | Objek | Scene | Metode | Anggaran segitiga (HIGH) | Wajib | Status |
|---|---|---|---|---|---|---|
| O-BOTTLE | Botol + tutup + cairan + label + serpihan | 1–5, P, 7, 8 | Lathe | ≤ 9.000 | Wajib | ☐ |
| O-HAND | Tangan (prosedural clay) | 2, 7 | Primitif kapsul | ≤ 3.500 | Wajib | ☐ |
| O-SHADOW | Bayangan kontak | Hampir semua | Plane + tekstur radial | 2 | Wajib | ☐ |
| O-PARTICLES | Mikroplastik | 5, 6, P | Points + shader | 2.400 titik | Wajib | ☐ |
| O-WATER | Sistem air (mode sungai/laut/malam/bersih) | 3, 4, 5, 7c | Plane + ShaderMaterial | ≤ 51.000 (160²×2) | Wajib | ☐ |
| O-CITY | Kota 3 lapis (instanced) | 3 | InstancedMesh | ≤ 3.000 | Wajib | ☐ |
| O-BRIDGE | Jembatan | 3 | Tube + Box | ≤ 1.200 | Wajib | ☐ |
| O-EMBANK | Tanggul + pagar | 3 | Box + instanced | ≤ 800 | Wajib | ☐ |
| O-TRASH | Sampah mengambang (kantong, gelas, botol) | 3 | InstancedMesh | ≤ 5.000 | Wajib | ☐ |
| O-PIER | Dermaga (4 tiang + tanda ukur) | 4 | Silinder | ≤ 1.500 | Wajib | ☐ |
| O-CORAL | Terumbu karang | 4 | Instanced cabang | ≤ 9.000 | Wajib | ☐ |
| O-SUN | Matahari (cakram putih) | 4 | Circle + CSS glow | 64 | Wajib | ☐ |
| O-FISH | Ikan (3) | 6 | Elipsoid + prisma | ≤ 1.000 | Wajib | ☐ |
| O-PLATE | Piring + filet + garpu + pisau + meja | 6 | Lathe + Box | ≤ 4.000 | Wajib | ☐ |
| O-BINS | 3 tempat sampah berlabel + tutup berengsel | 7 | RoundedBox | ≤ 3.000 | Wajib | ☐ |
| O-CONVEYOR | Conveyor + rol + pemilah + lorong cuci + hopper + sampah campuran | 8 | Box/Silinder/Instanced | ≤ 9.000 | Wajib | ☐ |
| O-PROCESS | Stasiun cacah, cuci, lebur, cetak + serpihan + filamen + kain | 9 | Campuran | ≤ 12.000 | Wajib | ☐ |
| O-TOTE | Tote bag | 9, 10 | RoundedBox + Torus | ≤ 1.500 | Wajib | ☐ |
| O-SHELF | Rak + 7 produk | 10 | Ekstrusi + primitif | ≤ 16.000 | Wajib | ☐ |
| O-TUMBLER | Tumbler | 10 | Lathe + Torus | ≤ 3.500 | Wajib | ☐ |
| O-PLINTH | Plinth tumbler | 10 | Silinder | 200 | Wajib | ☐ |

### 2.2 Tekstur prosedural (kanvas runtime, `src/stage/textures/`)

| ID | Tekstur | Ukuran | Dipakai di | Wajib | Status |
|---|---|---|---|---|---|
| T-GRAIN | Butiran film | 256×256, ulang | Overlay CSS (Home) | Wajib | ☐ |
| T-CRACK | Peta retak botol (alpha) | 1024×1024 (HIGH), 512 (LOW) | Botol Bab 5–6 | Wajib | ☐ |
| T-LABEL | Label botol (garis + ikon tetes) | 512×128 | Botol | Wajib | ☐ |
| T-BINLABEL | Label tempat sampah (PLASTIK/KERTAS/ORGANIK + ikon) | 512×128 ×3 | Bab 7 | Wajib | ☐ |
| T-WINDOWS | Atlas jendela gedung | 256×256 | Kota | Opsi (LOW: warna rata) | ☐ |
| T-BELT | Sabuk conveyor bergaris | 256×64 ulang | Bab 8 | Wajib | ☐ |
| T-FABRIC | Motif kain (garis halus) | 256×256 | Bab 9–10 | Wajib | ☐ |
| T-CAUSTIC | Noise kaustik | 256×256 ulang | Bab 4 bawah air | Opsi (HIGH) | ☐ |
| T-CONTACT | Gradasi radial bayangan | 128×128 | `ContactShadow` | Wajib | ☐ |

### 2.3 Gambar vektor (SVG di `public/img/`)

| ID | Aset | Ukuran viewBox | Anggaran berkas | Dipakai di | Wajib | Status |
|---|---|---|---|---|---|---|
| S-B1 … S-B10 | 10 ilustrasi panel statis (Bab 1–10) | 1600×1000 | ≤ 40 KB masing-masing | `StaticStory` | Wajib | ☐ |
| S-P | Ilustrasi punchline (layar gelap + botol hantu) | 1600×1000 | ≤ 20 KB | `StaticStory` | Wajib | ☐ |
| art-A1 … art-A6 | 6 sampul artikel negatif | 1200×900 | ≤ 45 KB | Kartu + detail | Wajib | ☐ |
| art-B1 … art-B6 | 6 sampul artikel positif | 1200×900 | ≤ 45 KB | Kartu + detail | Wajib | ☐ |
| S-CRACKBG | Retak latar halaman (putih tulang, transparan) | 1920×1080 | ≤ 30 KB | `Overlays` Bab 5–6 | Wajib | ☐ |
| S-404 | Botol kecil untuk 404 | 400×400 | ≤ 6 KB | 404 | Opsi | ☐ |
| S-TEMP | Diagram suhu (di-hard-code di komponen) | — | — | About | Wajib | ☐ |
| icons | 7 ikon UI (bagian 02/7) | 24×24 | < 1 KB | UI | Wajib | ☐ |
| favicon.svg | Siluet botol di kotak biru hero | 64×64 | < 2 KB | Tab browser | Wajib | ☐ |
| wordmark.svg | "Re:bottle" sebagai path | 600×160 | < 6 KB | OG, README | Opsi | ☐ |

### 2.4 Gambar raster (WebP/PNG)

| ID | Aset | Ukuran | Cara dibuat | Dipakai di | Status |
|---|---|---|---|---|---|
| R-HERO | **Poster hero** (tangkapan botol di latar `#0B2B80`) | 1600×900 WebP ≤ 60 KB (+ varian 800×1200 HP) | **Tangkapan layar dari adegan 3D asli** (Playwright) | LCP: tampil seketika sebelum 3D siap | ☐ |
| R-OG | Gambar bagikan sosial | 1200×630 PNG ≤ 120 KB | Komposisi poster + judul | `<meta og:image>` | ☐ |
| R-SHOT | Tangkapan layar tiap bab (11) | 1600×900 | Playwright | Bahan presentasi + README | ☐ |

### 2.5 Font dan audio

| ID | Aset | Sumber | Status |
|---|---|---|---|
| F-1…F-4 | Bricolage Grotesque, Instrument Sans, Caveat, JetBrains Mono | Fontsource (OFL) | ☐ |
| AU-* | Audio ambient, SFX (sintetis) | Kode (`08_AUDIO_SPEC.md`) | ☐ |

---

## 3. SPESIFIKASI OBJEK 3D PROSEDURAL (untuk agen coding)

Konvensi: **1 unit = 10 cm** untuk botol dan benda kecil, tetapi adegan memakai **skala diorama** (benda besar diperkecil/dibesarkan agar komposisi baik). Pivot di dasar objek (`y = 0`), menghadap `+Z`. Gaya *clay*: `MeshStandardMaterial`, `roughness 0,7–0,85`, bevel kecil, `flatShading: false`, normal halus.

### 3.1 O-BOTTLE
Lihat **03 bagian 3.1** (profil lathe lengkap, tutup, cairan, label, kekeruhan, retak, serpihan). Warna: tutup `#BFE7FF`, cairan `#BFE9FF`, label `#E6EAF2`. Tambahan:
- `BottleParams`: `{ turbid, crack, breakAmt, level, dirt, opacity }`.
- Serpihan: 48 (HIGH) / 24 (LOW); atribut `aShard`, `aCenter`, `aRand`.
- Fungsi bantu: `setLevel(worldY)`, `attachToHand(anchor)`, `detach()`.

### 3.2 O-HAND (diskalakan ×1,6 dari versi awal agar sesuai botol Ø0,65)
- Telapak: `RoundedBox(0.85 × 0.95 × 0.34, r 0.12)`.
- Jari ×4: proksimal 0,36 × r 0,085; distal 0,29 × r 0,075; panjang tetap, sendi di pangkal.
- Ibu jari: 0,32 dan 0,27, sudut 40°.
- Lengan bawah: kapsul r 0,20, panjang 3,8 keluar bingkai.
- Warna `#BFD3EA`, roughness 0,8.
- Pose: `OPEN`, `GRIP` (jari melingkar r 0,33), `RELEASE`, `THROW`. Setiap pose = array sudut sendi; `setPose(a, b, k)` melakukan `lerp`.
- Jangkar botol: titik di tengah telapak, menyesuaikan sumbu botol.

### 3.3 O-FISH
- Badan: bola 24×16 segmen diskalakan `(1.0, 0.45, 0.22)` (panjang 2,0 unit); ekor: prisma segitiga 0,6 panjang, mengayun `sin` ±25°; sirip punggung: segitiga pipih 0,35; sirip dada: 2 segitiga kecil; mata: bola r 0,05 `#05080F`. Warna `#8A96C8`, roughness 0,7. Gerak: berenang sepanjang kurva Lissajous kecil.

### 3.4 O-PLATE (adegan top-down)
- Piring: lathe profil `(0,0),(1.2,0),(1.45,0.04),(1.6,0.12),(1.6,0.14)` (tepi naik), `#E6EAF2`, roughness 0,5.
- Filet: elipsoid pipih `(1.3, 0.12, 0.6)` `#C9D3E6` + alur kulit (normal map prosedural sederhana: 6 garis).
- Garpu (kanan): batang `(0.1×1.6×0.02)` + 4 gigi; Pisau (kiri): bilah `(0.14×1.5×0.02)`; warna `#C9D3E6`, metalness 0,4.
- Meja: bidang `#05080F` 20×20 dengan noise pelan.

### 3.5 O-BINS (skala diorama)
- Badan `RoundedBox(1.5 × 2.4 × 1.2, r 0.08)`, tutup `RoundedBox(1.56 × 0.14 × 1.26)` berengsel di sisi belakang (pivot X). Bukaan atas jelas.
- Warna: **Plastik** badan `#2A7F78` tutup `#9FE6D0`; **Kertas** badan `#2B6C8A` tutup `#7FB8D6`; **Organik** badan `#2E7D5B` tutup `#8FD6A0`.
- Label: bidang 1,1 × 0,28 di muka depan, `T-BINLABEL` (teks Display 700 putih tulang) + ikon di kiri.
- Posisi X: Plastik `−2,0`, Kertas `−0,1`, Organik `+1,8` (jarak 1,9).

### 3.6 O-CONVEYOR
- Sabuk `Box(18 × 0.4 × 2.4)` `#1B4D49`, permukaan `T-BELT` (offset bergerak). 14 rol silinder r 0,2.
- Sampah campuran (skala diorama): kaleng silinder r 0,3 tinggi 1,0 `#9FB8C8`; bola kertas ikosahedron r 0,45 `#E6EAF2`; kotak kardus `(1.2×0.9×0.9)` `#A9C9B8`; botol PET lain (lathe sama dengan botol utama, bening).
- Pemilah: 3 pendorong (silinder 0,15 × piston 1,2), corong di bawah.
- Lorong cuci: `Box(4 × 3 × 2.8)` terbuka depan, material transparan `#3AA6A3` 25%, 160 partikel semprot.
- Hopper PET: frustum `#1B4D49`.

### 3.7 O-PROCESS (4 stasiun, jarak 6 unit)
- **Cacah:** corong frustum r 1,1→0,5 tinggi 1,6; rotor silinder bergigi r 0,5 berputar; baki `Box(2.4×0.3×1.6)`; 400 serpihan `InstancedMesh(Plane 0.12×0.12)` `#E6EAF2`.
- **Cuci:** bak `Box(3.2×1.4×2.0)` terbuka, air `#3AA6A3` 60%; 80 gelembung `Points`.
- **Lebur:** tungku `Box(3×2.4×2)` `#1B4D49`, mulut `(1.0×0.7)` emisif `#F6B35A`; `PointLight #F6B35A` intensitas 2,2 jarak 3,5; ekstruder silinder; pita aliran lebur gradien `#F6B35A → #FBE7C6`. **Luas amber ≤ 4% layar.**
- **Cetak:** spinneret kotak kecil; 60 filamen (`LineSegments`, `#E6EAF2`) → gulungan benang (silinder r 0,6); kain bergulir `Plane(2.4×1.6)` `T-FABRIC` teal `#2A7F78`; meja kecil `Box(2.4×0.8×1.6)`; **tote** terbentuk di atasnya.

### 3.8 O-SHELF dan produk (skala dramatis; spasi 3,2; X dari −9,6 sampai +9,6)

| # | Produk | Dimensi (unit) | Geometri | Warna |
|---|---|---|---|---|
| 1 | Tote bag | 2,6 × 2,8 × 0,7 | RoundedBox + 2 Torus pegangan (r 0,7, tabung 0,05) | `#2A7F78` |
| 2 | Kaus (di hanger) | 3,0 × 3,0 × 0,3 | `ExtrudeGeometry` siluet (bahu, lengan pendek, badan) + hanger kawat | `#6BBF9B` |
| 3 | Ransel | 2,6 × 3,4 × 1,3 | RoundedBox + saku depan + 2 tali | `#3F6E8C` |
| 4 | Karpet gulung | panjang 3,2, r 0,55 | Silinder, `T-FABRIC` garis | `#8FC9B6` |
| 5 | Bangku taman | 3,4 × 1,6 × 1,2 | 4 Box (dudukan 2 papan, kaki, sandaran) | `#5E8F7B` |
| 6 | Pot tanaman | tinggi 1,8, r 0,8 | Lathe + 5 daun kerucut `#4C8F86` | `#7FB8A0` |
| 7 | Jaket fleece | 3,0 × 3,4 × 0,4 | Ekstrusi siluet (lengan panjang) + ritsleting | `#4C8F86` |

- Rak: `RoundedBox(26 × 0.12 × 1.4)` `#BFD2BE` pada `y 0,7`; kaki 2 buah.
- Redup (10d): `material.color.multiplyScalar(dim)`; tidak ada transparansi.

### 3.9 O-TUMBLER dan O-PLINTH
**Tumbler** (500 ml, baja tahan karat, powder-coat): lathe profil `(r, y)`:
```
(0.000, 0.000) (0.280, 0.000) (0.320, 0.020) (0.340, 0.060)           // dasar membulat
(0.340, 1.620)                                                         // badan lurus
(0.320, 1.740) (0.270, 1.830) (0.240, 1.860)                           // bahu
(0.255, 1.862) (0.255, 1.890) (0.245, 2.060) (0.200, 2.100) (0.000, 2.100)   // tutup membulat
```
- Warna badan `#0F8B8D`, `roughness 0.55`, `metalness 0.1`. Tutup `#D9E6D6`. Cincin bawah `#E6EAF2` (pita tipis `y 0,06–0,16`).
- Pegangan tutup: `Torus(r 0.11, tabung 0.02)` tegak di atas tutup (`y 2,10 – 2,22`), `#D9E6D6`.
- Total tinggi 2,22. **Tanpa logo, tanpa teks.**
**Plinth:** `Cylinder(r 0.55, tinggi 0.25, 48 segmen)` `#E6EEE4`, roughness 0,9. Tumbler berdiri di `y 0,25`.

### 3.10 O-CITY, O-BRIDGE, O-EMBANK, O-TRASH, O-PIER, O-CORAL (ringkas)
| Objek | Aturan |
|---|---|
| Kota | 3 lapis `InstancedMesh(Box)`: jauh (60, tinggi 3–14, `#0F2036`), tengah (40, `#12294A`, atlas jendela `#8FB0CC` 20%), dekat (3 gedung). Acak dengan seed tetap (`rng(7)`) agar deterministik |
| Jembatan | Lengkung `TubeGeometry` (r 0,25) + dek `Box(26×0.5×3)` `#12294A`, 2 pilar. Melintas di `t 0,48` |
| Tanggul | `Box(40×1.2×0.6)` `#12294A` + 40 tiang pagar instanced |
| Sampah | `InstancedMesh`: kantong (ikosahedron pipih r 0,5, `#E6EAF2` 70%), gelas (kerucut r 0,35 tinggi 0,7, `#9CC6EA`), botol (lathe low). 28 instance, bobbing `sin` |
| Dermaga | 4 silinder r 0,12 tinggi 4 `#5C6B7D`, pita tanda ukur `#E6EAF2` tiap 0,5 |
| Karang | 18 gugus; tiap gugus 5–9 cabang (silinder meruncing) + 3 bola; warna `uBleach`: `#5E8FB8 → #E6EAF2` |

---

## 4. TEKSTUR PROSEDURAL (spesifikasi pembuatan di kanvas)

| ID | Cara membuat |
|---|---|
| **T-GRAIN** | Kanvas 256²; tiap piksel `v = 128 ± rand·127`, alpha 255; dijadikan `background-image` data-URL 1 kali; digeser dengan `steps(8)` 0,8 detik. Opacity per bab dari `--grain` |
| **T-CRACK** | Kanvas 1024². Hasilkan 3 titik asal; dari tiap titik, 12–16 retakan: jalur acak berbelok (jitter ±20°) panjang 80–400 px, cabang 40% peluang; garis putih `#E6EAF2` lebar 2–3 px dengan inti 1 px lebih terang; simpan di alpha. Tekstur kedua `noise` (1024², nilai 0–1) dipakai ambang `uCrack` agar retakan **tumbuh** |
| **T-LABEL** | Kanvas 512×128: dasar `#E6EAF2`; garis aksen `#8FD3FF` setebal 6 px di atas dan bawah; ikon tetes (path bezier) di tengah, warna `#0B2B80`. **Tanpa teks** |
| **T-BINLABEL** | Kanvas 512×128: dasar `#E6EAF2`, teks Display 700 `#11261B` (PLASTIK/KERTAS/ORGANIK) 56 px rata kiri + ikon kanan |
| **T-WINDOWS** | Kanvas 256²: grid 8×8 persegi kecil, 20% menyala `#8FB0CC`, sisanya transparan |
| **T-BELT** | Kanvas 256×64: dasar `#1B4D49`, garis diagonal tiap 16 px `#226B63` |
| **T-FABRIC** | Kanvas 256²: garis tenun halus horizontal+vertikal 1 px, 6% variasi |
| **T-CAUSTIC** | Noise Worley 256² difilter (abs), diulang dan digeser dua arah |
| **T-CONTACT** | Gradasi radial putih→transparan, `color` hitam, opacity 0,35 |

---

## 5. PROMPT: GENERATOR MODEL 3D (opsional, cadangan atau peningkatan)

> **Alat yang cocok:** Meshy, Tripo, Rodin (Hyper3D), Hunyuan3D, atau sejenis. Prompt ditulis **dalam bahasa Inggris** karena hasilnya lebih stabil. **Periksa lisensi dan ketentuan pemakaian** (komersial/kompetisi) alat yang dipakai dan catat di `credits.ts`.
> **Format keluaran wajib:** GLB, 1 mesh (atau sedikit), pivot di dasar tengah, hadap +Z, **tanpa tekstur gambar** (warna dari vertex color/material tunggal), ≤ batas segitiga di tabel 2.1, skala sesuai bagian 3.

### 5.1 Blok gaya global (tempel di awal SETIAP prompt 3D)
```
STYLE: stylized low-poly "clay" 3D model, matte plasticine look, soft rounded bevels, smooth
shading, simple shapes, chunky proportions, no fine detail, no text, no logos, no brand marks,
no texture image (flat material colors only), clean topology, centered, neutral A-pose or
upright orientation, origin at the bottom center, facing +Z, isolated object, plain background.
Color palette limited to the hex values given. Target look: calm, premium, slightly toy-like,
cohesive with a cold blue / teal / sage environmental-campaign website.
NEGATIVE: realistic skin, photoreal textures, text, watermark, logo, brand names, glow, neon,
red, orange, yellow (except where hex is specified), high poly noise, thin spikes, floating parts.
```

### 5.2 Prompt per objek

**P3D-HAND: Tangan (Bab 2 dan 7)**
```
[STYLE block] An abstract stylized human right hand and forearm, simplified mannequin-like clay
hand: rounded rectangular palm, four capsule-shaped fingers with visible two segments each, one
capsule thumb at 40 degrees, forearm as a smooth capsule that continues 3.8 units. Neutral
open-hand pose with fingers slightly curled (ready to grip a 0.65-unit diameter bottle).
Color: pale blue-bone #BFD3EA, single matte material. Palm width 0.85 units, finger total length
0.65 units. Joints separated as individual capsule meshes for posing (named palm, f1a, f1b, ... thumb_a,
thumb_b, forearm). Max 3,500 triangles. Not realistic skin, no nails, no wrinkles.
```

**P3D-FISH: Ikan**
```
[STYLE block] A small stylized reef fish, side view, body as a flattened ellipsoid (length 2.0,
height 0.9, thickness 0.45), triangular tail fin (0.6 long) as a separate mesh, a small dorsal fin
and two pectoral fins, tiny dark spherical eye. Soft rounded fins, slightly chubby. Color body
#8A96C8, fins #6F7BB0, eye #05080F. Max 1,000 triangles. Tail as separate mesh named "tail" with
pivot at its base for swim animation.
```

**P3D-TOTE: Tote bag (10a)**
```
[STYLE block] A canvas tote bag standing upright, rounded rectangular body 2.6 wide x 2.8 tall x
0.7 deep with soft puffed sides, two rounded handles (torus-like loops) rising 0.9 above the top
edge, subtle stitched seam as a slightly raised line (geometry, not texture). Color body #2A7F78,
handles #1F5E59. Slightly slouched top opening. Max 1,500 triangles.
```

**P3D-TEE: Kaus**
```
[STYLE block] A simple short-sleeve t-shirt laid flat in a front-facing pose as a thick soft
extruded shape (3.0 wide x 3.0 tall x 0.3 thick), rounded collar, no print, hanging on a thin
wire hanger (separate mesh) above it. Color #6BBF9B, hanger #5C6B7D. Max 2,500 triangles.
```

**P3D-BACKPACK: Ransel**
```
[STYLE block] A rounded backpack, front view, 2.6 wide x 3.4 tall x 1.3 deep, front pocket as a
rounded raised panel, two shoulder straps visible at the sides, top grab loop. Color #3F6E8C,
straps #2F5470. Max 2,500 triangles. No zipper detail, no logos.
```

**P3D-RUG: Karpet gulung**
```
[STYLE block] A rolled-up striped rug lying horizontally, cylinder length 3.2, radius 0.55, visible
spiral cross-section at the left end, tied with a simple band. Stripes as separate thin geometry
rings or vertex colors in #8FC9B6 and #BFE3D4. Max 1,200 triangles.
```

**P3D-BENCH: Bangku taman**
```
[STYLE block] A chunky garden bench made from recycled-plastic planks, 3.4 wide x 1.6 tall x 1.2
deep, two seat planks, three back planks, thick rounded legs. Color #5E8F7B, planks slightly
lighter #7FB8A0 on top faces (vertex colors). Max 2,000 triangles.
```

**P3D-POT: Pot tanaman**
```
[STYLE block] A tapered planter pot 1.8 tall, 1.6 wide at the top, with five simple cone-shaped
leaves emerging (leaf color #4C8F86). Pot color #7FB8A0, soft rim. Max 1,500 triangles.
```

**P3D-FLEECE: Jaket fleece**
```
[STYLE block] A zip-up fleece jacket laid flat in front-facing pose as a soft extruded shape, 3.0
wide x 3.4 tall x 0.4 thick, long sleeves slightly bent, standing collar, central zip line as a
raised ridge. Color #4C8F86, zip #D9E6D6. Max 2,800 triangles. No logos.
```

**P3D-TUMBLER: Tumbler (cadangan; utama = prosedural)**
```
[STYLE block] A modern reusable stainless-steel tumbler, 500 ml, total height 2.22 units, body
diameter 0.68, straight cylindrical body with a softly rounded base, gently tapered shoulder, a
rounded screw-on lid with a small vertical loop handle on top. Matte powder-coat finish, body color
#0F8B8D, lid and handle #D9E6D6, thin bottom ring #E6EAF2. Absolutely no logo, text or brand
marks. Smooth, premium, toy-simple. Max 3,500 triangles.
```

**P3D-BIN: Tempat sampah (ulangi 3× dengan warna berbeda)**
```
[STYLE block] A public sorting bin with a hinged flat lid that can open (lid as a separate mesh
with pivot at the back edge), rounded rectangular body 1.5 wide x 2.4 tall x 1.2 deep, a front
label plate area (flat rectangle 1.1 x 0.28, no text). Variant A (Plastik): body #2A7F78, lid
#9FE6D0. Variant B (Kertas): body #2B6C8A, lid #7FB8D6. Variant C (Organik): body #2E7D5B, lid
#8FD6A0. Max 1,000 triangles each.
```

**P3D-TRASH: Sampah campuran (kaleng, bola kertas, kardus, kantong, gelas)**
```
[STYLE block] A set of five separate simple trash props, each a separate mesh with origin at its
base: (1) soda can cylinder r 0.3 h 1.0 color #9FB8C8; (2) crumpled paper ball radius 0.45
color #E6EAF2 with soft bumps; (3) cardboard box 1.2 x 0.9 x 0.9 color #A9C9B8 with simple flap
lines; (4) plastic shopping bag as a flattened crumpled form 1.0 wide, color #E6EAF2; (5) paper cup
cone r 0.35 h 0.7 color #9CC6EA. Max 500 triangles each.
```

**P3D-CORAL: Karang**
```
[STYLE block] A branching coral cluster, 5 to 8 chunky tapered branches of different heights (0.8
to 2.0) splitting once, rounded tips, small round mound at the base. Single material, color
#5E8FB8 (a second variant in #E6EAF2 for bleached coral). Max 1,500 triangles each.
```

### 5.3 Pengolahan GLB (wajib setelah generate)
1. Impor ke Blender (atau `gltf-transform inspect`): periksa skala, pivot, normal.
2. Hapus tekstur/UV bila ada; pakai warna material tunggal.
3. Satukan mesh yang tidak perlu dianimasikan; beri nama bagian bergerak (`lid`, `tail`, `palm`, dst.).
4. Kompres: `npx gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp`.
5. Target ukuran: ≤ **150 KB** per berkas; total GLB ≤ **1,2 MB**.
6. Simpan di `public/models/` dan muat dengan `GLTFLoader` + `DRACOLoader` (decoder lokal, jangan CDN).
7. Catat di `credits.ts`: nama alat, tanggal, prompt, lisensi.

---

## 6. PROMPT: ILUSTRASI VEKTOR (sampul artikel dan panel statis)

> **Alat yang cocok:** (a) **minta Claude/LLM menulis SVG** (jalur utama: hasilnya SVG asli, ringan, bisa disunting); (b) generator vektor (Recraft, Illustrator Generative Vector); (c) generator raster lalu **trace** ke SVG (Inkscape). Jangan memakai raster besar langsung.

### 6.1 Gaya induk (tempel di awal setiap prompt ilustrasi)
```
STYLE: flat vector illustration, geometric and calm, bold simple shapes, subtle film-grain
overlay (feTurbulence noise at 6% opacity), no outlines, no gradients except one soft radial
light, no text, no logos, no human faces (people only as faceless silhouettes), generous negative
space, one clear focal subject, composition readable at 400px wide. Rounded corners on shapes.
Output: a single clean SVG, viewBox 0 0 1200 900, under 45 KB, using <defs> for reusable shapes,
CSS-free (attributes only), with <title> and <desc> for accessibility.
PALETTE (use ONLY these):
  Negative articles: backgrounds #183558 / #142848 / #101C38, shapes #8FB0CC #86A8D0 #8098C2,
    bone-white accents #E6EAF2, deep shadow #0A1226.
  Positive articles: backgrounds #1F5C55 / #226B63 / #1F4F5E, shapes #9FE6D0 #B9F3C9 #7FB8D6,
    sage #D9E6D6, accent teal #0F8B8D, deep #11261B.
  NEVER use red, orange or yellow (the only exception is amber #F6B35A in the article about
  recycling heat if specified).
```

### 6.2 Dua belas sampul artikel

**art-A1 · Mikroplastik di Piring Makanmu** (negatif · sehari-hari)
```
[STYLE] Top-down view of a round plate (#E6EAF2) on a dark blue table (#183558). On the plate a
simple stylized fish fillet shape (#C9D3E6). Tiny bone-white specks (#E6EAF2) drift from the fillet
outward and form a faint spiral. A fork and knife on both sides. Focal point: the specks.
Calm, uneasy mood. Palette negative.
```
**art-A2 · 10 Menit Dipakai, 450 Tahun Tinggal** (negatif · sehari-hari)
```
[STYLE] Two-part composition on #142848. Left: one small clear bottle next to a minimalist
clock face showing a short arc (10 minutes). Right: a very tall stack/hourglass made of many
bottle silhouettes stretching upward beyond the frame, suggesting 450 years. Strong scale contrast.
Palette negative.
```
**art-A3 · Sungai Kita, Jalur Sampah ke Laut** (negatif · nasional)
```
[STYLE] Aerial top-down map-like view: a winding river (#86A8D0) through blocky city districts
(#101C38 and #183558 rectangles), small bone-white dots (plastic) floating along the river, the
river widening into the sea at the bottom edge. No text, no real map. Palette negative.
```
**art-A4 · Pesisir dan Nelayan yang Menjaring Plastik** (negatif · nasional)
```
[STYLE] A small fishing boat silhouette (#0A1226) on a calm pale-cyan sea (#8FB0CC), a net
being pulled up filled with bottles and bags instead of fish; low shoreline with palm-tree
silhouettes in the distance. Faceless figure silhouette. Palette negative.
```
**art-A5 · Pusaran Sampah Samudra** (negatif · global)
```
[STYLE] A large circular gyre seen from above: concentric spiral arcs of ocean (#86A8D0 on
#101C38) carrying many small bone-white debris fragments gathering toward the center; a tiny sea
turtle silhouette at the edge. Strong spiral composition. Palette negative.
```
**art-A6 · Plastik dan Iklim** (negatif · global)
```
[STYLE] A left-to-right visual chain on #142848: an oil barrel with a drip, then a plastic bottle,
then a thermometer with the mercury high, connected by thin arrows; factory chimney silhouettes with
soft smoke (#8098C2) behind. Clean infographic feel without any text. Palette negative.
```
**art-B1 · Dari Botol Menjadi Kain** (positif · sehari-hari)
```
[STYLE] Transformation sequence on #226B63: a clear bottle on the left, tiny flakes in the
middle, a thread spool, then a folded cloth/tote bag (#2A7F78) on the right, connected by a soft
curved flow line. Warm feeling without warm colors. Palette positive.
```
**art-B2 · Seminggu Membawa Botol Sendiri** (positif · sehari-hari)
```
[STYLE] A calendar-like row of seven identical tumblers (#0F8B8D) with small check marks above each,
on sage background #D9E6D6 with soft shadow; a tiny stack of "avoided" bottle silhouettes (#9FE6D0,
faded) fading out behind the row. Palette positive, sage-forward.
```
**art-B3 · Bank Sampah dan Pemulung: Rantai yang Jarang Terlihat** (positif · nasional)
```
[STYLE] A hand-cart loaded with sacks of sorted bottles (#9FE6D0), a faceless figure silhouette
pushing it, three bins labeled only by color, thin connecting lines to a small building (bank
sampah) and a truck silhouette, showing a chain. On #1F4F5E. Palette positive.
```
**art-B4 · Isi Ulang Mulai Jadi Gaya Hidup** (positif · nasional)
```
[STYLE] A campus-style building silhouette (#1F4F5E) with a water refill station in front: a tap
filling a tumbler (#0F8B8D) with a clean water arc (#B9F3C9); a few small tumblers on a ledge.
Soft sage ground. Palette positive.
```
**art-B5 · Negara yang Berhasil Mengurangi Plastik** (positif · global)
```
[STYLE] A stylized reverse-vending machine on the left accepting a bottle, a coin/ticket moving
out as a loop arrow, a globe (simple circle with two curved lines, no real countries) on the right
with a circular arrow around it. On #226B63. Palette positive.
```
**art-B6 · Ekonomi Sirkular: Plastik yang Tidak Jadi Sampah** (positif · global)
```
[STYLE] A large circular arrow loop around the center; inside the loop a triangle hierarchy of
three tiers (reduce, reuse, recycle as shapes only, no text) with a tumbler (#0F8B8D) at the apex
and bottle silhouettes at the base. On #D9E6D6 with deep #11261B accents. Palette positive.
```

### 6.3 Sebelas panel statis (mode reduced-motion)
Gaya sama (viewBox **1600×1000**, ≤ 40 KB). Palet = palet bab terkait (lihat 02 bagian 1.1).

| ID | Prompt inti (tambahkan blok `STYLE` dan palet bab) |
|---|---|
| S-B1 | A single clear plastic bottle centered on cobalt `#0B2B80`, soft cyan rim light `#8FD3FF`, faint grain. Calm and clean |
| S-B2 | A pale-blue clay hand (#BFD3EA) holding an empty bottle tilted in a gesture of tossing it away, bottle motion arc as a dotted curve. `#12336F` |
| S-B3 | A dark river at dusk through a city skyline silhouette, a bottle drifting center, floating bags, thin fog bands. `#183558` |
| S-B4 | A wide dark sea with a pale white-cyan sun disc, a bottle on waves, four pier posts at the right with tick marks, bleached coral cross-section strip along the bottom. `#142848` |
| S-B5 | A cracked bottle breaking into bone-white shards and fine specks over a near-night sea. `#101C38` |
| S-B6 | A dark plate seen from above with a fish fillet and glowing bone-white specks, large empty space. `#0A1226` |
| S-P | Almost-black screen `#05080F` with one faint ghost bottle outline and nothing else |
| S-B7 | A hand dropping a bottle into a bin labeled with a bottle icon (three bins: bottle, sheet, leaf icons), teal palette `#1F4F5E`, small inset circle showing a clean river |
| S-B8 | Side view of a sorting conveyor with a clear bottle riding it, other trash being pushed off, ghost bottles falling into dark below. `#226B63` |
| S-B9 | Four-stage process strip (shred, wash, melt with a small amber glow `#F6B35A` limited to 4% area, spin) ending in a folded tote. `#2E7D5B` |
| S-B10 | A shelf of recycled products at left, and a lone teal tumbler (#0F8B8D) on a round plinth at the right under a soft spotlight, sage background `#D9E6D6` |

### 6.4 Aset kecil
- **favicon.svg:** siluet botol (tutup, bahu, badan) putih tulang `#E6EAF2` di dalam persegi membulat `#0B2B80`, 64×64, margin 10%.
- **S-404:** botol miring kecil di atas gelombang sederhana, `#8FD3FF` di `#0B2B80`, 400×400.
- **wordmark.svg:** "Re:" garis luar + "bottle" isi, font Bricolage Grotesque 700 dikonversi menjadi path, warna `#F3F8FF`.
- **R-OG (1200×630):** latar `#0B2B80`, botol bening tengah-kanan (dari tangkapan 3D), wordmark kiri, tagline "Bawa botolmu besok." kecil.

### 6.5 Templat perintah ke LLM untuk menulis SVG
```
Tulis satu berkas SVG lengkap (hanya kode SVG, tanpa penjelasan). Ikuti blok STYLE dan PALETTE
berikut. Gunakan <defs> + <use> untuk bentuk berulang, <title> dan <desc> dalam Bahasa Indonesia,
viewBox sesuai spesifikasi, tanpa teks tampil di gambar, tanpa gambar raster tertanam, tanpa
font eksternal, tanpa skrip. Berat berkas maksimum {N} KB. Setelah SVG, tuliskan satu baris
"CATATAN:" berisi warna hex yang dipakai.
[tempel blok STYLE + PALETTE + prompt aset]
```
Pemeriksaan wajib setiap SVG: dibuka di browser, ukuran ≤ batas, hanya warna palet, tidak ada teks tertanam, `<title>`/`<desc>` terisi, lolos `svgo` (hapus metadata).

---

## 7. PROMPT: POSTER HERO DAN TANGKAPAN LAYAR (bukan AI, otomatis)

Skrip Playwright `scripts/capture.mjs` (dibuat agen coding):
1. Jalankan `npm run preview`; buka `/#/` dengan `?q=high&freeze=0&noaudio`.
2. Tunggu `canvas` siap; ambil `screenshot` 1600×900 (dan 800×1200) → ubah ke WebP kualitas 80 → `public/img/hero-poster.webp`.
3. Ulangi untuk `?freeze=<nilai>` di tiap awal plateau bab (`STARTS + 0.4·panjang`) → `docs/shots/`.
4. Poster hero dipasang sebagai `<img>` di belakang kanvas dan dihapus saat bingkai 3D pertama dirender (mencegah layar kosong dan memperbaiki LCP).

---

## 8. PROMPT: AUDIO (cadangan)

Jalur utama = **sintesis kode** (`08_AUDIO_SPEC.md`). Jika tim ingin berkas, gunakan prompt berikut pada generator audio (Stable Audio, ElevenLabs SFX, dsb.) **dan cek lisensinya**, atau cari berkas **CC0** (Freesound, filter CC0):

| ID | Prompt (Inggris) | Panjang | Format |
|---|---|---|---|
| AU-B1 | "Calm clean ambient pad, two sine tones a fifth apart, very soft, slow breathing, no melody, seamless loop" | 30 detik loop | OGG/MP3 ≤ 300 KB |
| AU-B3 | "Gentle river water lapping at low volume, distant city hum, soft reverb, seamless loop" | 30 detik | OGG |
| AU-B4 | "Open sea waves building in intensity, wind, low rumble; second layer underwater muffled lowpass" | 30 detik | OGG |
| AU-B5 | "Sparse glass cracking ticks, low drone, then a short bandpassed shatter burst, then fine granular hiss" | 20 detik | OGG |
| AU-B6 | "Very low slow pulse around 50 BPM, faint fish swish, then near silence with a thin high tone" | 20 detik | OGG |
| AU-P | "Reverse reverb swell, then silence, one soft sustained pad note" | 10 detik | OGG |
| AU-B7 | "Short soft thunk of a bottle dropping into a plastic bin, 0.4 s" | 0,4 detik | OGG |
| AU-B8 | "Soft rhythmic factory hum with gentle clicks of pusher pistons and a spray hiss, loop" | 30 detik | OGG |
| AU-B9 | "Warm machine drone, crunchy shredding, furnace hiss, then a bright single pad note" | 30 detik | OGG |
| AU-B10 | "Quiet warm room tone, a low note rising slowly, then breathing silence" | 30 detik | OGG |

---

## 9. Penamaan dan struktur berkas

```
public/
  favicon.svg   og-image.png
  img/
    hero-poster.webp  hero-poster-m.webp
    art-A1.svg … art-B6.svg
    panel-b1.svg … panel-b10.svg  panel-p.svg
    crack-bg.svg   s-404.svg
  models/          ← hanya jika ada GLB (hand.glb, fish.glb, …)
```
- Huruf kecil, dipisah `-`; tidak ada spasi.
- Setiap SVG punya `<title>` dan `<desc>`.

---

## 10. Pencatatan lisensi dan atribusi (`src/content/credits.ts`)

```ts
export const CREDITS = [
  { type: "font",  name: "Bricolage Grotesque", author: "Mathieu Triay", license: "SIL OFL 1.1", url: "..." },
  // ... Instrument Sans, Caveat, JetBrains Mono
  { type: "lib",   name: "three", license: "MIT", url: "https://github.com/mrdoob/three.js" },
  { type: "lib",   name: "gsap",  license: "Gratis (GreenSock/Webflow no-charge license)", url: "https://gsap.com" },
  { type: "illustration", name: "Sampul artikel (12) dan panel statis (11)", author: "Tim Re:bottle", method: "SVG; dibuat dengan bantuan alat AI [NAMA ALAT] pada [TANGGAL]; prompt tersimpan di docs/", license: "Hak milik tim" },
  { type: "audio", name: "Audio ambient dan SFX", author: "Tim Re:bottle", method: "Sintesis Web Audio (kode)", license: "Hak milik tim" },
];
```
Halaman About menampilkan `CREDITS` otomatis (`LicenseTable`). **Tidak ada aset tanpa baris di sini.**

---

## 11. Daftar periksa penerimaan aset

- [ ] Hanya warna dari palet; tidak ada merah/oranye (kecuali amber Bab 9 ≤ 4%).
- [ ] Tidak ada logo/merek/teks tertanam pada model dan ilustrasi (kecuali label tempat sampah di tekstur).
- [ ] Setiap model punya pivot di dasar, skala benar, bagian bergerak bernama.
- [ ] Ukuran: GLB ≤ 150 KB; SVG ≤ 45 KB; WebP poster ≤ 60 KB.
- [ ] Kontras ilustrasi terhadap latar cukup untuk dibaca di 400 px.
- [ ] Setiap aset tercatat di `credits.ts` dengan metode dan lisensi.
- [ ] Tidak ada gambar wajah manusia; figur hanya siluet.
- [ ] Hasil AI dicek: tidak menyerupai karya/merek yang ada (tidak ada karakter atau logo dikenal).
