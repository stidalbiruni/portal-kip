import { StudentApplicant, Disbursement, AcademicProgress, ActivityLog, Announcement, ProgramStudi, ExamQuestion } from '../types';

const INITIAL_APPLICANTS: StudentApplicant[] = [
  {
    id: '1',
    nama: 'Ahmad Fauzi Al-Anshori',
    nim: '202410101',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 4,
    angkatan: '2024',
    ipk: 3.82,
    penghasilanOrtu: 1200000,
    pekerjaanAyah: 'Buruh Tani',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    jumlahTanggungan: 4,
    prestasi: ['Juara I Musabaqah Tilawatil Quran (MTQ) Cirebon 2024', 'Juara II Da\'i Muda Jawa Barat 2024'],
    status: 'Diterima',
    skorKriteria: { ekonomi: 85, akademik: 95, wawancara: 92, total: 91 },
    berkas: { kartuKip: true, sktm: true, slipGaji: true, raport: true, prestasiDoc: true },
    catatan: 'Mahasiswa sangat aktif di Lembaga Dakwah Kampus (LDK). Prestasi akademik sangat menonjol.',
    kontak: '081234567801',
    alamat: 'Blok Pesantren, Babakan Ciwaringin, Cirebon',
    email: 'ahmadfauzi@stid-albiruni.ac.id'
  },
  {
    id: '2',
    nama: 'Siti Aminah',
    nim: '202410102',
    prodi: 'Pengembangan Masyarakat Islam (PMI)',
    semester: 4,
    angkatan: '2024',
    ipk: 3.65,
    penghasilanOrtu: 900000,
    pekerjaanAyah: 'Penjual Kerupuk Keliling',
    pekerjaanIbu: 'Membantu Suami',
    jumlahTanggungan: 3,
    prestasi: ['Koordinator Pengabdian Masyarakat Babakan 2024', 'Juara III Karya Tulis Ilmiah Qur\'ani'],
    status: 'Diterima',
    skorKriteria: { ekonomi: 90, akademik: 88, wawancara: 85, total: 87.7 },
    berkas: { kartuKip: true, sktm: true, slipGaji: true, raport: true, prestasiDoc: true },
    catatan: 'Aktif mendampingi majelis taklim ibu-ibu di desa binaan.',
    kontak: '081234567802',
    alamat: 'Desa Ciwaringin, Kec. Ciwaringin, Cirebon',
    email: 'sitiaminah@stid-albiruni.ac.id'
  },
  {
    id: '3',
    nama: 'Muhammad Rizqi Al-Mubarak',
    nim: '202310105',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 6,
    angkatan: '2023',
    ipk: 3.42,
    penghasilanOrtu: 1500000,
    pekerjaanAyah: 'Guru Ngaji Honorer',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    jumlahTanggungan: 5,
    prestasi: ['Sertifikat Tahfidz 10 Juz', 'Juara Harapan Kaligrafi Kabupaten Cirebon'],
    status: 'Diterima',
    skorKriteria: { ekonomi: 80, akademik: 82, wawancara: 88, total: 83.2 },
    berkas: { kartuKip: true, sktm: true, slipGaji: true, raport: true, prestasiDoc: true },
    catatan: 'Memiliki komitmen dakwah yang tinggi, aktif di pengurusan masjid kampus.',
    kontak: '081234567803',
    alamat: 'Gegesik, Cirebon, Jawa Barat',
    email: 'rizqimubarak@stid-albiruni.ac.id'
  },
  {
    id: '4',
    nama: 'Fatimah Azzahra',
    nim: '202510201',
    prodi: 'Pengembangan Masyarakat Islam (PMI)',
    semester: 2,
    angkatan: '2025',
    ipk: 3.91,
    penghasilanOrtu: 1100000,
    pekerjaanAyah: 'Kuli Bangunan',
    pekerjaanIbu: 'Buruh Cuci',
    jumlahTanggungan: 2,
    prestasi: ['Nilai UN Tertinggi di Madrasah Aliyah', 'Juara I Olimpiade Ekonomi Islam Cirebon'],
    status: 'Diterima',
    skorKriteria: { ekonomi: 88, akademik: 96, wawancara: 90, total: 91.6 },
    berkas: { kartuKip: true, sktm: true, slipGaji: true, raport: true, prestasiDoc: true },
    catatan: 'Mahasiswa berprestasi tinggi dari keluarga prasejahtera. Sangat disiplin.',
    kontak: '081234567804',
    alamat: 'Arjawinangun, Cirebon',
    email: 'fatimah.zahra@stid-albiruni.ac.id'
  },
  {
    id: '5',
    nama: 'Yusuf Al-Farabi',
    nim: '202310112',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 6,
    angkatan: '2023',
    ipk: 2.95, // GPA falls below 3.00, trigger warning
    penghasilanOrtu: 1300000,
    pekerjaanAyah: 'Tukang Ojek Pengkolan',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    jumlahTanggungan: 3,
    prestasi: ['Penyiar Terbaik Radio Komunitas Al-Biruni'],
    status: 'Diterima',
    skorKriteria: { ekonomi: 82, akademik: 78, wawancara: 85, total: 81.3 },
    berkas: { kartuKip: true, sktm: true, slipGaji: true, raport: true, prestasiDoc: false },
    catatan: 'Memerlukan pembinaan khusus karena IPK semester ini turun akibat kesehatan orang tua terganggu.',
    kontak: '081234567805',
    alamat: 'Palimanan, Cirebon',
    email: 'yusuf.farabi@stid-albiruni.ac.id'
  },
  {
    id: '6',
    nama: 'Zulfa Lailatul Qodriah',
    nim: '202610501',
    prodi: 'Pengembangan Masyarakat Islam (PMI)',
    semester: 1,
    angkatan: '2026',
    ipk: 0.0,
    penghasilanOrtu: 800000,
    pekerjaanAyah: 'Petani Penggarap',
    pekerjaanIbu: 'Pedagang Jajanan Anak',
    jumlahTanggungan: 4,
    prestasi: ['Juara I Pidato Bahasa Arab Kabupaten 2025', 'Tahfidz Juz 30'],
    status: 'Verifikasi',
    skorKriteria: { ekonomi: 92, akademik: 85, wawancara: 88, total: 88.1 },
    berkas: { kartuKip: true, sktm: true, slipGaji: true, raport: true, prestasiDoc: true },
    catatan: 'Dokumen lengkap. Sedang menunggu hasil wawancara final dengan tim seleksi rektorat.',
    kontak: '081234567806',
    alamat: 'Susukan, Cirebon',
    email: 'zulfalaila@gmail.com'
  },
  {
    id: '7',
    nama: 'Lukman Hakim',
    nim: '202610502',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 1,
    angkatan: '2026',
    ipk: 0.0,
    penghasilanOrtu: 1600000,
    pekerjaanAyah: 'Wiraswasta Kecil (Kios)',
    pekerjaanIbu: 'Mengurus Rumah Tangga',
    jumlahTanggungan: 3,
    prestasi: ['Ketua OSIS MAN 1 Cirebon'],
    status: 'Verifikasi',
    skorKriteria: { ekonomi: 70, akademik: 80, wawancara: 75, total: 74.5 },
    berkas: { kartuKip: false, sktm: true, slipGaji: true, raport: true, prestasiDoc: false },
    catatan: 'Kartu KIP fisik belum dilampirkan, mengandalkan SKTM dari Desa.',
    kontak: '081234567807',
    alamat: 'Plumbon, Cirebon',
    email: 'lukmanhakim@gmail.com'
  },
  {
    id: '8',
    nama: 'Anisa Rahmawati',
    nim: '202610503',
    prodi: 'Pengembangan Masyarakat Islam (PMI)',
    semester: 1,
    angkatan: '2026',
    ipk: 0.0,
    penghasilanOrtu: 1400000,
    pekerjaanAyah: 'Supir Angkot',
    pekerjaanIbu: 'Buruh Harian Lepas',
    jumlahTanggungan: 3,
    prestasi: ['Anggota Pramuka Penegak Garuda'],
    status: 'Pendaftaran',
    skorKriteria: { ekonomi: 78, akademik: 75, wawancara: 0, total: 51 },
    berkas: { kartuKip: true, sktm: true, slipGaji: false, raport: true, prestasiDoc: false },
    catatan: 'Pendaftaran gelombang kedua. Perlu melengkapi slip gaji atau surat pernyataan penghasilan orang tua.',
    kontak: '081234567808',
    alamat: 'Sumber, Cirebon',
    email: 'anisarahma@gmail.com'
  },
  {
    id: '9',
    nama: 'Habib Sholehuddin',
    nim: '202610504',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 1,
    angkatan: '2026',
    ipk: 0.0,
    penghasilanOrtu: 950000,
    pekerjaanAyah: 'Pekerja Bengkel Tradisional',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    jumlahTanggungan: 2,
    prestasi: ['Juara III Lomba Adzan Se-Wilayah III Cirebon'],
    status: 'Pendaftaran',
    skorKriteria: { ekonomi: 85, akademik: 72, wawancara: 0, total: 47 },
    berkas: { kartuKip: true, sktm: true, slipGaji: true, raport: true, prestasiDoc: true },
    catatan: 'Berkas administrasi awal lengkap, siap dijadwalkan verifikasi wawancara.',
    kontak: '081234567809',
    alamat: 'Klangenan, Cirebon',
    email: 'habibsholeh@gmail.com'
  },
  {
    id: '10',
    nama: 'Syifa Fauziah',
    nim: '202510209',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 2,
    angkatan: '2025',
    ipk: 3.40,
    penghasilanOrtu: 2500000, // Higher income than threshold
    pekerjaanAyah: 'Karyawan Swasta',
    pekerjaanIbu: 'Guru Honorer',
    jumlahTanggungan: 1,
    prestasi: [],
    status: 'Cadangan',
    skorKriteria: { ekonomi: 45, akademik: 70, wawancara: 75, total: 63 },
    berkas: { kartuKip: false, sktm: true, slipGaji: true, raport: true, prestasiDoc: false },
    catatan: 'Ditempatkan di status Cadangan karena pendapatan orang tua melampaui batas prioritas bantuan.',
    kontak: '081234567810',
    alamat: 'Weru, Cirebon',
    email: 'syifafauzi@gmail.com'
  }
];

const INITIAL_DISBURSEMENTS: Disbursement[] = [
  {
    id: 'd1',
    studentId: '1',
    studentNama: 'Ahmad Fauzi Al-Anshori',
    studentNim: '202410101',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 4,
    tahunAkademik: '2025/2026 Ganjil',
    nominalUkt: 2400000,
    nominalBiayaHidup: 5700000,
    statusUkt: 'Cair',
    statusBiayaHidup: 'Cair',
    tanggalCairUkt: '2025-09-12',
    tanggalCairBiayaHidup: '2025-09-18',
    bankPenerima: 'Bank Syariah Indonesia (BSI)',
    noRekening: '7112024101'
  },
  {
    id: 'd2',
    studentId: '2',
    studentNama: 'Siti Aminah',
    studentNim: '202410102',
    prodi: 'Pengembangan Masyarakat Islam (PMI)',
    semester: 4,
    tahunAkademik: '2025/2026 Ganjil',
    nominalUkt: 2400000,
    nominalBiayaHidup: 5700000,
    statusUkt: 'Cair',
    statusBiayaHidup: 'Diproses',
    tanggalCairUkt: '2025-09-12',
    bankPenerima: 'Bank Syariah Indonesia (BSI)',
    noRekening: '7112024102'
  },
  {
    id: 'd3',
    studentId: '3',
    studentNama: 'Muhammad Rizqi Al-Mubarak',
    studentNim: '202310105',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 6,
    tahunAkademik: '2025/2026 Ganjil',
    nominalUkt: 2400000,
    nominalBiayaHidup: 5700000,
    statusUkt: 'Diproses',
    statusBiayaHidup: 'Diproses',
    bankPenerima: 'Bank Syariah Indonesia (BSI)',
    noRekening: '7112023105'
  },
  {
    id: 'd4',
    studentId: '4',
    studentNama: 'Fatimah Azzahra',
    studentNim: '202510201',
    prodi: 'Pengembangan Masyarakat Islam (PMI)',
    semester: 2,
    tahunAkademik: '2025/2026 Ganjil',
    nominalUkt: 2400000,
    nominalBiayaHidup: 5700000,
    statusUkt: 'Belum Proses',
    statusBiayaHidup: 'Belum Proses',
    bankPenerima: 'Bank Syariah Indonesia (BSI)',
    noRekening: '7112025201'
  },
  {
    id: 'd5',
    studentId: '5',
    studentNama: 'Yusuf Al-Farabi',
    studentNim: '202310112',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 6,
    tahunAkademik: '2025/2026 Ganjil',
    nominalUkt: 2400000,
    nominalBiayaHidup: 5700000,
    statusUkt: 'Ditunda',
    statusBiayaHidup: 'Ditunda',
    bankPenerima: 'Bank Syariah Indonesia (BSI)',
    noRekening: '7112023112'
  }
];

const INITIAL_ACADEMIC_PROGRESS: AcademicProgress[] = [
  {
    id: 'a1',
    studentId: '1',
    studentNama: 'Ahmad Fauzi Al-Anshori',
    studentNim: '202410101',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 4,
    ips: 3.85,
    ipk: 3.82,
    kehadiran: 98,
    hafalanQuran: 'Juz 30 Selesai, Mulai Juz 1 (Al-Baqarah 1-50)',
    kegiatanDakwah: ['Khatib Jumat Masjid Babakan Ciwaringin', 'Sekretaris Ikatan Remaja Masjid Cirebon'],
    statusEvaluasi: 'Layak',
    catatanDosen: 'Sangat giat belajar, akhlak luar biasa, teladan bagi mahasiswa lain.'
  },
  {
    id: 'a2',
    studentId: '2',
    studentNama: 'Siti Aminah',
    studentNim: '202410102',
    prodi: 'Pengembangan Masyarakat Islam (PMI)',
    semester: 4,
    ips: 3.70,
    ipk: 3.65,
    kehadiran: 95,
    hafalanQuran: 'Juz 30 Selesai, Juz 29 Hafal 15 Surah',
    kegiatanDakwah: ['Pengajar TPA Baiturrahman Ciwaringin', 'Pendampingan UMKM Kerajinan Bambu Desa'],
    statusEvaluasi: 'Layak',
    catatanDosen: 'Sangat aktif dalam kegiatan pengabdian masyarakat.'
  },
  {
    id: 'a3',
    studentId: '3',
    studentNama: 'Muhammad Rizqi Al-Mubarak',
    studentNim: '202310105',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 6,
    ips: 3.45,
    ipk: 3.42,
    kehadiran: 92,
    hafalanQuran: '10 Juz Selesai (Sertifikasi LPTQ)',
    kegiatanDakwah: ['Ketua Divisi Syiar LDK Al-Biruni', 'Asisten Imam Masjid Agung Sumber'],
    statusEvaluasi: 'Layak',
    catatanDosen: 'Kualitas hafalan Al-Quran sangat baik, manajemen organisasi seimbang.'
  },
  {
    id: 'a4',
    studentId: '4',
    studentNama: 'Fatimah Azzahra',
    studentNim: '202510201',
    prodi: 'Pengembangan Masyarakat Islam (PMI)',
    semester: 2,
    ips: 3.91,
    ipk: 3.91,
    kehadiran: 100,
    hafalanQuran: 'Juz 30 Selesai, Juz 1 s.d Surah Ali Imran',
    kegiatanDakwah: ['Tutor Ekonomi Syariah untuk Mahasiswa Baru', 'Anggota Pengurus Masjid Kampus'],
    statusEvaluasi: 'Layak',
    catatanDosen: 'Kinerja akademik sempurna. Aktif, santun, dan cerdas.'
  },
  {
    id: 'a5',
    studentId: '5',
    studentNama: 'Yusuf Al-Farabi',
    studentNim: '202310112',
    prodi: 'Komunikasi Penyiaran Islam (KPI)',
    semester: 6,
    ips: 2.80, // Warning!
    ipk: 2.95, // Warning!
    kehadiran: 82,
    hafalanQuran: 'Juz 30 Belum Selesai (Hafal 20 Surah Pendek)',
    kegiatanDakwah: ['Operator Podcast Dakwah Al-Biruni'],
    statusEvaluasi: 'Pembinaan',
    catatanDosen: 'IPK turun di bawah 3.00. Perlu bimbingan akademik dan pengawasan ekstra dari pihak kemahasiswaan.'
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'l1',
    timestamp: '2026-07-06 09:15',
    user: 'Admin KIP',
    aktivitas: 'Mendaftarkan mahasiswa baru Anisa Rahmawati (PMI) ke database KIP Kuliah.',
    tipe: 'success'
  },
  {
    id: 'l2',
    timestamp: '2026-07-06 11:30',
    user: 'Tim Seleksi',
    aktivitas: 'Melakukan penilaian wawancara pada pendaftar Zulfa Lailatul Qodriah.',
    tipe: 'info'
  },
  {
    id: 'l3',
    timestamp: '2026-07-05 14:00',
    user: 'Akademik',
    aktivitas: 'Memperbarui data IPK semester genap mahasiswa penerima KIP.',
    tipe: 'success'
  },
  {
    id: 'l4',
    timestamp: '2026-07-05 16:45',
    user: 'Sistem',
    aktivitas: 'Pemberitahuan: IPK Yusuf Al-Farabi turun di bawah batas minimal (2.95). Status dipindah ke Pembinaan.',
    tipe: 'warning'
  },
  {
    id: 'l5',
    timestamp: '2026-07-04 10:20',
    user: 'Keuangan',
    aktivitas: 'Mengubah status pencairan UKT semester 4 atas nama Ahmad Fauzi Al-Anshori menjadi Cair.',
    tipe: 'success'
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Batas Pengumpulan Laporan Kemajuan Akademik KIP Kuliah Semester Genap',
    content: 'Diberitahukan kepada seluruh mahasiswa penerima beasiswa KIP Kuliah angkatan 2023, 2024, dan 2025 bahwa batas akhir pengumpulan Rapor Hasil Studi (KHS) dan bukti kehadiran kuliah adalah tanggal 20 Juli 2026 pukul 16.00 WIB. Laporan diserahkan langsung ke bagian Kemahasiswaan lantai 2 Gedung Rektorat STID Al-Biruni.',
    date: '2026-07-06 09:00',
    author: 'Bagian Kemahasiswaan',
    category: 'Akademik',
    isPinned: true,
    targetAudience: 'Mahasiswa'
  },
  {
    id: 'a2',
    title: 'Pencairan Dana Bantuan Biaya Hidup KIP Kuliah Tahap II Tahun Ajaran 2025/2026',
    content: 'Menyusul pengajuan berkas verifikasi keuangan, dana bantuan biaya hidup untuk mahasiswa penerima KIP Kuliah semester genap saat ini sedang dalam proses pemindahan bukuan oleh Bank Mandiri Cabang Cirebon. Estimasi dana masuk ke rekening masing-masing mahasiswa adalah 12-15 Juli 2026. Harap pastikan rekening Anda dalam keadaan aktif.',
    date: '2026-07-05 10:30',
    author: 'Bagian Keuangan',
    category: 'Pencairan',
    isPinned: true,
    targetAudience: 'Mahasiswa'
  },
  {
    id: 'a3',
    title: 'Jadwal Tes Wawancara Seleksi Calon Penerima KIP Kuliah Angkatan 2026',
    content: 'Bagi seluruh calon mahasiswa baru tahun akademik 2026/2027 yang berkas pendaftarannya telah lolos tahap verifikasi berkas, tes wawancara tatap muka dengan tim seleksi rektorat akan diselenggarakan pada tanggal 12 s/d 14 Juli 2026. Jadwal lengkap dan ruang wawancara per individu dapat dilihat pada dashboard seleksi.',
    date: '2026-07-04 14:15',
    author: 'Tim Seleksi',
    category: 'Seleksi',
    isPinned: false,
    targetAudience: 'Semua'
  },
  {
    id: 'a4',
    title: 'Kewajiban Mengikuti Kegiatan Pengabdian Dakwah Masyarakat Akhir Pekan',
    content: 'Mengingat visi STID Al-Biruni sebagai pencetak kader da\'i handal, diumumkan kepada semua penerima beasiswa KIP Kuliah untuk wajib berpartisipasi dalam program pendampingan majelis taklim dan taman pendidikan Al-Quran (TPQ) di desa binaan se-Kecamatan Ciwaringin setiap hari Sabtu dan Ahad. Presensi kehadiran akan menjadi salah satu poin penilaian kelayakan beasiswa.',
    date: '2026-07-02 08:00',
    author: 'Unit Pengabdian Masyarakat',
    category: 'Umum',
    isPinned: false,
    targetAudience: 'Semua'
  }
];

const INITIAL_PROGRAM_STUDI: ProgramStudi[] = [
  {
    id: 'p1',
    nama: 'Komunikasi Penyiaran Islam (KPI)',
    kode: 'KPI',
    deskripsi: 'Mempersiapkan kader da\'i yang handal di bidang jurnalistik, penyiaran radio/TV, dan media komunikasi digital.'
  },
  {
    id: 'p2',
    nama: 'Pengembangan Masyarakat Islam (PMI)',
    kode: 'PMI',
    deskripsi: 'Fokus pada pemberdayaan sosial ekonomi masyarakat, manajemen filantropi Islam, dan pendampingan desa binaan.'
  }
];

const INITIAL_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q1',
    questionText: 'Apa kepanjangan dari KIP Kuliah?',
    options: [
      'Kartu Indonesia Pintar Kuliah',
      'Kredit Indonesia Pintar Kuliah',
      'Kartu Integrasi Pelajar Kuliah',
      'Kupon Indonesia Prestasi Kuliah'
    ],
    correctOptionIndex: 0
  },
  {
    id: 'q2',
    questionText: 'Siapa nama pendiri atau tokoh sentral Dewan Dakwah Islamiyah Indonesia (DDII) yang menginisiasi STID?',
    options: [
      'Mohammad Natsir',
      'Buya Hamka',
      'K.H. Ahmad Dahlan',
      'K.H. Hasyim Asy\'ari'
    ],
    correctOptionIndex: 0
  },
  {
    id: 'q3',
    questionText: 'Manakah dari berikut ini yang merupakan pilar utama program Beasiswa KIP Kuliah?',
    options: [
      'Meningkatkan taraf hidup keluarga dan memberikan akses pendidikan bagi yang kurang mampu secara ekonomi tetapi berprestasi',
      'Memberikan modal usaha gratis bagi seluruh keluarga besar mahasiswa',
      'Membiayai liburan dan studi wisata ke luar negeri secara berkala',
      'Menyediakan fasilitas kendaraan pribadi bagi semua penerima beasiswa'
    ],
    correctOptionIndex: 0
  },
  {
    id: 'q4',
    questionText: 'Sebagai mahasiswa penerima KIP Kuliah di STID Al-Biruni, berapa batas minimum IPK (Indeks Prestasi Kumulatif) yang harus dipertahankan setiap semester?',
    options: [
      '2.00',
      '2.50',
      '3.00',
      '3.50'
    ],
    correctOptionIndex: 2
  },
  {
    id: 'q5',
    questionText: 'Bila seorang penerima KIP Kuliah melakukan pelanggaran berat akademik atau kedisplinan, sanksi apa yang paling mungkin diberikan oleh pengelola?',
    options: [
      'Pemberian hadiah hiburan',
      'Penurunan UKT secara sepihak',
      'Pemberhentian status sebagai penerima KIP Kuliah',
      'Penambahan nominal bantuan uang saku'
    ],
    correctOptionIndex: 2
  }
];

export const localDb = {
  getExamQuestions: (): ExamQuestion[] => {
    const data = localStorage.getItem('kip_exam_questions');
    if (!data) {
      localStorage.setItem('kip_exam_questions', JSON.stringify(INITIAL_EXAM_QUESTIONS));
      return INITIAL_EXAM_QUESTIONS;
    }
    return JSON.parse(data);
  },
  saveExamQuestions: (questions: ExamQuestion[]) => {
    localStorage.setItem('kip_exam_questions', JSON.stringify(questions));
  },

  getProgramStudi: (): ProgramStudi[] => {
    const data = localStorage.getItem('kip_program_studi');
    if (!data) {
      localStorage.setItem('kip_program_studi', JSON.stringify(INITIAL_PROGRAM_STUDI));
      return INITIAL_PROGRAM_STUDI;
    }
    return JSON.parse(data);
  },
  saveProgramStudi: (prodis: ProgramStudi[]) => {
    localStorage.setItem('kip_program_studi', JSON.stringify(prodis));
  },

  getAnnouncements: (): Announcement[] => {
    const data = localStorage.getItem('kip_announcements');
    if (!data) {
      localStorage.setItem('kip_announcements', JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    return JSON.parse(data);
  },
  saveAnnouncements: (announcements: Announcement[]) => {
    localStorage.setItem('kip_announcements', JSON.stringify(announcements));
  },

  getApplicants: (): StudentApplicant[] => {
    const data = localStorage.getItem('kip_applicants');
    if (!data) {
      localStorage.setItem('kip_applicants', JSON.stringify(INITIAL_APPLICANTS));
      return INITIAL_APPLICANTS;
    }
    return JSON.parse(data);
  },
  saveApplicants: (applicants: StudentApplicant[]) => {
    localStorage.setItem('kip_applicants', JSON.stringify(applicants));
  },

  getDisbursements: (): Disbursement[] => {
    const data = localStorage.getItem('kip_disbursements');
    if (!data) {
      localStorage.setItem('kip_disbursements', JSON.stringify(INITIAL_DISBURSEMENTS));
      return INITIAL_DISBURSEMENTS;
    }
    return JSON.parse(data);
  },
  saveDisbursements: (disbursements: Disbursement[]) => {
    localStorage.setItem('kip_disbursements', JSON.stringify(disbursements));
  },

  getAcademicProgress: (): AcademicProgress[] => {
    const data = localStorage.getItem('kip_academic_progress');
    if (!data) {
      localStorage.setItem('kip_academic_progress', JSON.stringify(INITIAL_ACADEMIC_PROGRESS));
      return INITIAL_ACADEMIC_PROGRESS;
    }
    return JSON.parse(data);
  },
  saveAcademicProgress: (progress: AcademicProgress[]) => {
    localStorage.setItem('kip_academic_progress', JSON.stringify(progress));
  },

  getLogs: (): ActivityLog[] => {
    const data = localStorage.getItem('kip_logs');
    if (!data) {
      localStorage.setItem('kip_logs', JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(data);
  },
  saveLogs: (logs: ActivityLog[]) => {
    localStorage.setItem('kip_logs', JSON.stringify(logs));
  },

  addLog: (user: string, aktivitas: string, tipe: 'success' | 'warning' | 'info' | 'danger') => {
    const logs = localDb.getLogs();
    const date = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      user,
      aktivitas,
      tipe
    };
    logs.unshift(newLog);
    localDb.saveLogs(logs.slice(0, 100)); // Limit to 100 logs
    return newLog;
  }
};
