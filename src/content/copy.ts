// Naskah situs berdasarkan kunci final (docs/11 bagian 2 dan 5).
// Revisi narasi Home disetujui pemilik proyek; identitas, konteks skenario, dan CTA dipertahankan.
// Angka tidak ditulis di sini: gunakan kunci di facts.ts.

export const COPY = {
  // Hero / Bab 1
  "hero.title": "Re:bottle",
  "hero.tagline":
    "Satu teguk selesai dalam hitungan menit. Namun bagiku, perjalanan melintasi sungai, arus laut, dan waktu baru saja dimulai.",
  "hero.hint": "(Gulir untuk mulai)",
  "hero.scenario": "Skenario jika pola konsumsi plastik terus berlanjut.",
  "ch1.title": "Lahir",
  "ch1.line":
    "Aku lahir dari panas cetakan dan tekanan mesin—bening, ringan, dan dirancang tanpa cela untuk satu tujuan sederhana: menjaga seteguk air tetap dingin sampai ke tanganmu.",
  "ch1.sub":
    "Namun tubuhku ditempa dari rantai polimer yang nyaris abadi. Ada paradoks sunyi sejak detik pertamaku: aku dibuat dengan ketahanan ratusan tahun hanya untuk menemanimu melewati satu siang yang terik.", // USULAN
  // Bab 2
  "ch2.title": "Sekali Pakai",
  "ch2.line":
    "Sepuluh menit. Hanya selama itu genggam tanganmu terasa hangat di dinding tubuhku, sebelum tegukan terakhir habis dan tutupku kembali diputar rapat.",
  "ch2.sub":
    "Saat aku terlepas dari jemarimu, tugasku di hidupmu selesai begitu saja. Tetapi di luar genggaman itu, tubuhku tidak ikut menghilang—aku tetap utuh, menunggu ke mana gravitasi dan angin membawaku pergi.", // USULAN
  // Bab 3 (angka counter berasal dari facts.ts `lama-terurai`)
  "ch3.title": "Tersesat",
  "ch3.counter.label": "tahun lagi", // USULAN
  // Angka counter hanya tampil bila fakta `lama-terurai` verified:true; selama false, pakai `ch3.fallback`.
  "ch3.counter.value": "{X}",
  "ch3.fallback": "Plastik bisa bertahan sangat lama sebelum terurai.", // USULAN
  "ch3.sub":
    "Hujan sore mendorongku masuk ke selokan beton, lalu arus membawaku menyusuri sungai yang membelah kota yang tak pernah menoleh ke belakang. Di sepanjang tepian yang berlumpur, aku mengapung bersama ribuan kemasan lain yang juga kehilangan tujuannya. Kota terus bergerak maju, sementara kami perlahan hanyut menuju muara.", // USULAN
  // Bab 4
  "ch4.title": "Lautan",
  "ch4.line":
    "Muara akhirnya melepas tubuhku ke samudra lepas yang tampak tenang dari kejauhan, namun menyimpan beban sunyi di bawah setiap gulungan ombaknya.",
  "ch4.sub":
    "Aku melayang di atas hamparan terumbu karang yang kian pucat oleh suhu laut yang memanas dari tahun ke tahun. Di kedalaman yang hening ini, aku bukan lagi sekadar wadah minuman—aku menjadi tamu asing di rumah yang sedang berjuang bernapas.", // USULAN
  // Opsional; tampil bersama angka dari fakta `terumbu-pemutihan` (verified).
  "ch4.fact": "Sekian persen terumbu karang pernah mengalami pemutihan.",
  // Bab 5
  "ch5.title": "Terurai",
  "ch5.line":
    "Banyak yang mengira waktu akan menghapusku di tengah laut. Kenyataan di permukaan air jauh lebih sunyi: terik matahari, garam, dan benturan gelombang tidak pernah benar-benar melenyapkanku dari bumi. Tubuhku hanya retak dan terkelupas perlahan, pecah menjadi ribuan serpihan mikroplastik halus yang tak lagi kasatmata namun tetap berlayar mengikuti arus.", // USULAN
  "ch5.counter.label": "partikel", // USULAN
  // Bab 6
  "ch6.title": "Kembali ke Kita",
  "ch6.line": "Kamu makan sekitar {X} mikroplastik per minggu.",
  "ch6.sub":
    "Tanpa suara dan tanpa wujud yang kamu kenali, perjalanan panjangku berputar kembali ke meja makan. Apa yang dulu dilepas begitu saja dalam sepuluh menit, kini pulang melalui ikan, garam, dan air dalam keheningan yang paling dekat dengan tubuhmu.", // USULAN
  "ch6.footnote": "Perkiraan rata-rata dari kajian; hasil tiap orang berbeda.", // USULAN
  // Dipakai selama fakta `mikroplastik-mingguan` belum verified:true (dok 11 §2.6).
  "ch6.fallback":
    "Mikroplastik kini ditemukan di makanan dan minuman kita. Serpihan yang dulu terlepas dari tubuhku kini melayang di kolom air, terserap ke dalam rantai makanan laut yang sunyi.", // USULAN
  // Punchline
  "punch.line":
    "Bagaimana jika semua ini tidak terjadi? Tarik napas sejenak—karena akhir perjalananku selalu dimulai dari satu pilihan kecil di tanganmu.", // DISEPAKATI D12: tanpa subteks
  // Bab 7
  "ch7.title": "Di Tempat yang Benar",
  "ch7.line":
    "Semuanya berubah hanya dalam sepuluh detik ketika kamu berhenti sejenak di depan tempat sampah terpilah. Alih-alih terlempar ke selokan, kamu menaruhku di wadah khusus plastik yang kering dan bersih.",
  "ch7.letter":
    "Kamu tidak membuangku ke sungai. Terima kasih. Sepuluh detik jedamu hari ini menyelamatkan sungai dan laut dari kehadiranku.",
  "ch7.bins": "Plastik · Kertas · Organik", // USULAN
  // Bab 8
  "ch8.title": "Perjalanan Kedua",
  "ch8.letter":
    "Aku beruntung. Tidak semua temanku sampai di sini. Di jalur pemilahan ini, tubuhku kembali dipandang sebagai bahan yang berharga.",
  // Hanya tampil bila fakta `botol-terkumpul` verified:true (saat ini false: sembunyikan).
  "ch8.fact": "Sekian persen botol plastik berhasil terkumpul.",
  "ch8.sub":
    "Di atas sabuk pemilah yang berderak tenang, aku tidak lagi sendirian sebagai sampah yang tersesat. Tangan-tangan pekerja dan sensor pemilah mengelompokkanku bersama ribuan botol jernih lainnya—memisahkan tutup, melepas label, dan memastikan materialku siap menempuh perjalanan kedua.", // USULAN
  // Bab 9
  "ch9.title": "Hidup Baru, Tapi...",
  "ch9.letter":
    "Aku lahir kembali setelah dicacah, dicuci, dan dilebur. Tapi jujur saja—proses ini butuh air, energi, dan tidak bisa diulang selamanya. Daur ulang menyelamatkanku hari ini, namun ia bukan alasan untuk terus memproduksi dan membuang tanpa henti.",
  "ch9.stations": "Cacah · Cuci · Lebur · Cetak", // USULAN
  "ch9.note": "Hasilnya biasanya serat atau benda lain, bukan botol lagi.", // USULAN
  // Bab 10
  "ch10a.letter":
    "Terima kasih sudah menemaniku menyusuri dua kemungkinan hidupku.",
  "ch10b.letter":
    "Jika kamu harus memakai botol sepertiku hari ini, pilahlah agar aku tidak berakhir di lautan.",
  "ch10d.letter":
    "Namun masa depan terbaik adalah saat kamu tak lagi membutuhkanku untuk sekali teguk. Gunakan botol yang bisa kamu isi ulang berkali-kali, hari demi hari.",
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
