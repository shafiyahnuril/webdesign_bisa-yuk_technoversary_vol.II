// Naskah situs berdasarkan kunci final (docs/11 bagian 2 dan 5).
// Teks bertanda [DISEPAKATI] di dokumen tidak boleh diubah tanpa persetujuan tim.
// Angka tidak ditulis di sini: gunakan kunci di facts.ts.

export const COPY = {
  // Hero / Bab 1
  "hero.title": "Re:bottle",
  "hero.tagline": "Bawa botolmu besok.",
  "hero.hint": "(Gulir untuk mulai)",
  "hero.scenario": "Skenario jika pola konsumsi plastik terus berlanjut.",
  "ch1.title": "Lahir",
  "ch1.line": "Dibuat dari fosil, usia 0 hari.",
  "ch1.sub": "Bening, baru, siap dipakai.", // USULAN
  // Bab 2
  "ch2.title": "Sekali Pakai",
  "ch2.line": "Dipakai 10 menit.",
  "ch2.sub": "Setelah itu, tidak ada yang bertanya ke mana ia pergi.", // USULAN
  // Bab 3 (angka counter berasal dari facts.ts `lama-terurai`)
  "ch3.title": "Tersesat",
  "ch3.counter.label": "tahun lagi", // USULAN
  // Angka counter hanya tampil bila fakta `lama-terurai` verified:true; selama false, pakai `ch3.fallback`.
  "ch3.counter.value": "{X}",
  "ch3.fallback": "Plastik bisa bertahan sangat lama sebelum terurai.", // USULAN
  "ch3.sub": "Sungai membawanya melewati kota yang tidak menoleh.", // USULAN
  // Bab 4
  "ch4.title": "Lautan",
  "ch4.line": "Air naik. Karang memutih.",
  "ch4.sub": "Ia terapung di bawah matahari yang makin terik.", // USULAN
  // Opsional; tampil bersama angka dari fakta `terumbu-pemutihan` (verified).
  "ch4.fact": "Sekian persen terumbu karang pernah mengalami pemutihan.",
  // Bab 5
  "ch5.title": "Terurai",
  "ch5.line": "Ia tidak hilang. Ia hanya menjadi lebih kecil.", // USULAN
  "ch5.counter.label": "partikel", // USULAN
  // Bab 6
  "ch6.title": "Kembali ke Kita",
  "ch6.line": "Kamu makan sekitar {X} mikroplastik per minggu.",
  "ch6.sub": "Dari ikan, garam, dan air yang kita anggap bersih.", // USULAN
  "ch6.footnote": "Perkiraan rata-rata dari kajian; hasil tiap orang berbeda.", // USULAN
  // Dipakai selama fakta `mikroplastik-mingguan` belum verified:true (dok 11 §2.6).
  "ch6.fallback": "Mikroplastik kini ditemukan di makanan dan minuman kita.", // USULAN
  // Punchline
  "punch.line": "Bagaimana jika semua ini tidak terjadi?", // DISEPAKATI D12: tanpa subteks
  // Bab 7
  "ch7.title": "Di Tempat yang Benar",
  "ch7.line": "Satu keputusan, 10 detik.",
  "ch7.letter": "Kamu tidak membuangku ke sungai. Terima kasih.",
  "ch7.bins": "Plastik · Kertas · Organik", // USULAN
  // Bab 8
  "ch8.title": "Perjalanan Kedua",
  "ch8.letter": "Aku beruntung. Tidak semua temanku sampai di sini.",
  // Hanya tampil bila fakta `botol-terkumpul` verified:true (saat ini false: sembunyikan).
  "ch8.fact": "Sekian persen botol plastik berhasil terkumpul.",
  "ch8.sub": "Dipilah, dikelompokkan, lalu dibersihkan.", // USULAN
  // Bab 9
  "ch9.title": "Hidup Baru, Tapi...",
  "ch9.letter": "Aku jadi sesuatu yang baru, tapi prosesnya butuh energi dan air.",
  "ch9.stations": "Cacah · Cuci · Lebur · Cetak", // USULAN
  "ch9.note": "Hasilnya biasanya serat atau benda lain, bukan botol lagi.", // USULAN
  // Bab 10
  "ch10a.letter": "Aku jadi sesuatu yang berguna.",
  "ch10b.letter": "Ternyata aku tidak sendirian.",
  "ch10d.letter": "Aku senang diselamatkan. Tapi aku akan lebih senang kalau tidak perlu dibuat.",
  "ch10e.cta": "Bawa botolmu besok.",
  "end.hint": "(Terus gulir)",

  // About
  "about.why.title": "Mengapa Re:bottle",
  "about.why.body":
    "Re:bottle adalah cerita satu botol plastik. Dua kemungkinan perjalanannya: jika kita abai, dan jika kita peduli. Selebihnya, pilihan ada di tanganmu.",
  "about.scenario.title": "Cara membaca cerita ini",
  "about.scenario.body":
    "Babak I adalah skenario ilustratif, bukan ramalan. Angka suhu di penanda bab menggambarkan arah, bukan prediksi ilmiah per tahun.",
  "about.temp.title": "Soal suhu",
  "about.temp.body":
    "Kenaikan suhu global disebabkan banyak hal, terutama emisi gas rumah kaca. Plastik berperan lewat emisi produksi dan pembakarannya, bukan satu-satunya penyebab.",
  "about.sources.title": "Sumber data",
  "about.licenses.title": "Lisensi dan kredit",
  "about.team.title": "Tim",
  "about.closing": "Bawa botolmu besok.",
  // Paragraf latar isu About [USULAN T8.2]: tanpa angka dan tanpa klaim sebab-akibat langsung.
  "about.background.1":
    "Plastik sekali pakai murah dan praktis, jadi mudah dipakai tanpa dipikirkan. Setelah dibuang, sebagian sampah terbawa air hujan dan sungai menuju laut.", // USULAN
  "about.background.2":
    "Di darat maupun di laut, plastik perlahan terpecah menjadi serpihan kecil yang sulit dikumpulkan lagi. Cerita ini mengikuti satu botol untuk memperlihatkan jalan itu, dan jalan lain yang bisa kita pilih.", // USULAN
  // Tambahan About [USULAN]: label UI; isi naskah tetap menunggu T8.2.
  "about.hero.title": "Kenapa Re:bottle?",
  "about.fact.dev": "[DATA]",
  "about.temp.diagram.title": "Dua skenario suhu dalam cerita Re:bottle",
  "about.temp.diagram.note": "Ilustrasi alur cerita, bukan prediksi.",
  "about.temp.band1": "Babak I: skenario abai",
  "about.temp.band2": "Babak II: skenario peduli",
  "about.temp.band1.desc": "Naik dari +1,2°C ke +4,0°C",
  "about.temp.band2.desc": "Tetap di +1,5°C",
  "about.temp.table.caption": "Ringkasan diagram suhu",
  "about.temp.table.scenario": "Skenario",
  "about.temp.table.from": "Awal",
  "about.temp.table.to": "Akhir",
  "about.sources.facts": "Angka dalam cerita",
  "about.sources.empty":
    "Daftar sumber muncul di sini setelah setiap angka dan artikel selesai diverifikasi.",
  "about.licenses.col.type": "Jenis",
  "about.licenses.col.name": "Nama",
  "about.licenses.col.author": "Pembuat",
  "about.licenses.col.license": "Lisensi",
  "about.licenses.type.font": "Font",
  "about.licenses.type.lib": "Pustaka",
  "about.licenses.type.illustration": "Ilustrasi",
  "about.licenses.type.audio": "Audio",
  "about.team.placeholder.name": "Nama anggota menyusul",
  "about.team.placeholder.role": "Peran menyusul",
  "about.closing.contact": "Hubungi kami",

  // Contact
  "contact.title": "Hubungi Kami",
  "contact.intro": "Punya masukan, pertanyaan, atau ingin berkolaborasi? Tulis di sini.",
  "contact.field.name": "Nama",
  "contact.field.email": "Email",
  "contact.field.message": "Pesan",
  "contact.submit": "Kirim",
  "contact.sending": "Mengirim…",
  "contact.success": "Terkirim. Terima kasih sudah peduli.",
  "contact.error.generic":
    "Pesan belum terkirim. Coba lagi sebentar atau hubungi kami lewat email.",
  "contact.error.name": "Nama minimal 2 karakter.",
  "contact.error.email": "Format email belum benar.",
  "contact.error.message": "Pesan minimal 10 karakter.",
  "contact.mailto": "Kirim lewat email",

  // 404, navigasi, aksesibilitas
  "404.title": "Botol ini tersesat.",
  "404.body": "Halaman yang kamu cari tidak ada.",
  "404.cta": "Kembali ke awal",
  "nav.home": "Home",
  "nav.about": "About",
  "nav.content": "Konten",
  "nav.contact": "Contact",
  "nav.menu.open": "Buka menu",
  "nav.menu.close": "Tutup menu",
  "audio.on": "Nyalakan suara",
  "audio.off": "Matikan suara",
  "loop.hint": "(Tarik untuk mulai lagi)",
  skip: "Lompat ke konten utama",
  "static.start": "Mulai dari awal",
  noscript: "Situs ini membutuhkan JavaScript untuk menampilkan ceritanya.",
  "article.back": "← Galeri Artikel",
  "article.next": "Artikel berikutnya",
  "filter.all": "Semua",
  "filter.empty": "Belum ada artikel untuk kombinasi ini.",
  // [USULAN] kunci Galeri Artikel (G4)
  "page.content.lede": "Dampak dari tindakan kita, dari rumah sampai dunia.",
  "filter.reset": "Atur ulang filter",
  "filter.group.kind": "Jenis artikel",
  "filter.group.level": "Cakupan",
  "filter.kind.negatif": "Negatif",
  "filter.kind.positif": "Positif",
  "filter.level.sehari-hari": "Sehari-hari",
  "filter.level.nasional": "Nasional",
  "filter.level.global": "Global",
  "filter.live.some": "Menampilkan {N} artikel: {F}.",
  "filter.live.all": "Menampilkan {N} artikel.",
  "filter.live.none": "Tidak ada artikel untuk kombinasi ini.",
  "card.minutes": "{N} menit baca",
  "card.cover.alt": "Sampul artikel: {T}",
  // [USULAN] kunci Detail Artikel (G5)
  "article.relation.title": "Kaitannya dengan Re:bottle",
  "article.sources.title": "Sumber",
  "article.sources.empty": "Daftar sumber dicantumkan bersama isi artikel.",
  "article.empty": "Belum ada isi. Artikel ini sedang disiapkan.",
  "article.cover.alt": "Gambar judul artikel: {T}",
  // [USULAN] kunci Contact (G5). Teks galat/sukses mengikuti dok 05 bagian 6.2.
  "contact.headline": "Bawa botolmu besok.",
  "contact.form.title": "Kirim pesan",
  "contact.info.title": "Hubungi tim",
  "contact.error.summary": "Periksa kembali isian berikut:",
  "contact.counter": "{N}/1000",
  "contact.error.name.max": "Nama maksimal 80 karakter.",
  "contact.error.message.max": "Pesan maksimal 1000 karakter.",
  "contact.mailto.subject": "Pesan dari situs Re:bottle",
  "contact.fallback.opened": "Aplikasi emailmu dibuka. Kirim dari sana untuk menyelesaikan pesan.",
  "contact.trap": "Jangan diisi",
  "contact.privacy": "Pesanmu hanya dipakai untuk menjawab kamu.",
  "contact.again": "Kirim pesan lain",
  "contact.fallback": "Mode cadangan",
  "contact.fallback.note": "Pesan akan dibuka di aplikasi emailmu.",
  "contact.info.email": "Email",
  "contact.info.account": "Akun",
  "contact.info.subtheme": "Subtema",
  "contact.info.competition": "Lomba",
  "contact.info.about": "Tentang Re:bottle",
  "contact.info.content": "Galeri Artikel",

  // Tambahan kerangka (bukan dari dok 11): judul halaman dan teks sementara
  "page.home.title": "Re:bottle",
  "page.about.title": "About",
  "page.content.title": "Galeri Artikel",
  "page.contact.title": "Contact",
  "page.notfound.title": "Halaman Tidak Ditemukan",
  "page.wip": "Halaman ini sedang dalam pengerjaan.",
  "page.loading": "Memuat…",
  "site.description": "Satu botol. Dua kemungkinan perjalanan. Bawa botolmu besok.",
  // Meta description per halaman (≤ 155 karakter, unik) [USULAN]
  "seo.about.description":
    "Kenapa Re:bottle ada: latar isu sampah plastik, skenario di balik cerita, sumber data, dan atribusi aset kampanye ini.",
  "seo.content.description":
    "Dua belas artikel tentang dampak plastik sekali pakai dan kebiasaan peduli lingkungan, dari rumah sampai dunia. Saring sesuai minatmu.",
  "seo.contact.description":
    "Hubungi Re:bottle lewat formulir atau email untuk bertanya, memberi saran, atau mengajak bergerak bersama untuk lingkungan.",
  "seo.notfound.description":
    "Halaman yang kamu cari tidak ada. Kembali ke awal dan ikuti perjalanan satu botol plastik di Re:bottle.",
} as const;

export type CopyKey = keyof typeof COPY;
