export type KipStatus = 'Pendaftaran' | 'Verifikasi' | 'Diterima' | 'Ditolak' | 'Cadangan';

export interface ScoreCriteria {
  ekonomi: number;   // 1-100
  akademik: number;  // 1-100
  wawancara: number; // 1-100
  total: number;     // Weighted score
}

export interface DocumentStatus {
  kartuKip: boolean;
  sktm: boolean; // Surat Keterangan Tidak Mampu
  slipGaji: boolean;
  raport: boolean;
  prestasiDoc: boolean;
}

export interface StudentApplicant {
  id: string;
  nama: string;
  nim: string; // Registration number or NIM
  prodi: string;
  semester: number;
  angkatan: string;
  ipk: number;
  penghasilanOrtu: number;
  pekerjaanAyah: string;
  pekerjaanIbu: string;
  jumlahTanggungan: number;
  prestasi: string[];
  status: KipStatus;
  skorKriteria: ScoreCriteria;
  berkas: DocumentStatus;
  catatan: string;
  kontak: string;
  alamat: string;
  email: string;
}

export interface Disbursement {
  id: string;
  studentId: string;
  studentNama: string;
  studentNim: string;
  prodi: string;
  semester: number;
  tahunAkademik: string;
  nominalUkt: number;
  nominalBiayaHidup: number;
  statusUkt: 'Belum Proses' | 'Diproses' | 'Cair' | 'Ditunda';
  statusBiayaHidup: 'Belum Proses' | 'Diproses' | 'Cair' | 'Ditunda';
  tanggalCairUkt?: string;
  tanggalCairBiayaHidup?: string;
  bankPenerima: string;
  noRekening: string;
}

export interface AcademicProgress {
  id: string;
  studentId: string;
  studentNama: string;
  studentNim: string;
  prodi: string;
  semester: number;
  ips: number; // Semester GPA
  ipk: number; // Cumulative GPA
  kehadiran: number; // % attendance
  hafalanQuran: string; // Juz/Surat (Specific to STID Islamic College requirements)
  kegiatanDakwah: string[]; // Community da'wah services
  statusEvaluasi: 'Layak' | 'Pembinaan' | 'Ditangguhkan';
  catatanDosen: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  aktivitas: string;
  tipe: 'success' | 'warning' | 'info' | 'danger';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'Akademik' | 'Pencairan' | 'Seleksi' | 'Umum';
  isPinned: boolean;
  targetAudience: 'Semua' | 'Mahasiswa' | 'Dosen Wali';
}

export interface ProgramStudi {
  id: string;
  nama: string;
  kode: string; // e.g., KPI, PMI, MD, etc.
  deskripsi?: string;
}

