import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Landmark, Award, BookOpen, 
  CheckCircle2, AlertTriangle, FileText, Megaphone, LogOut, 
  Clock, Check, Save, Sparkles, RefreshCw, HelpCircle, 
  Heart, Calendar, DollarSign, BarChart2, GraduationCap,
  Upload, Paperclip, Trash2, ShieldCheck, Send, ListChecks,
  ChevronLeft, ChevronRight, AlertCircle, Printer, X
} from 'lucide-react';
import { 
  StudentApplicant, Disbursement, AcademicProgress, 
  Announcement, ProgramStudi, KipStatus, DocumentStatus, ExamQuestion 
} from '../types';
import AlBiruniLogo from './AlBiruniLogo';
import { localDb } from '../data/mockData';

interface StudentPortalProps {
  student: StudentApplicant;
  disbursements: Disbursement[];
  progressList: AcademicProgress[];
  announcements: Announcement[];
  prodis: ProgramStudi[];
  onUpdateStudent: (updatedStudent: StudentApplicant) => void;
  onUpdateDisbursementBank: (studentId: string, bank: string, noRek: string) => void;
  onUpdateDisbursement?: (updated: Disbursement) => void;
  onLogout: () => void;
}

export default function StudentPortal({
  student,
  disbursements,
  progressList,
  announcements,
  prodis,
  onUpdateStudent,
  onUpdateDisbursementBank,
  onUpdateDisbursement,
  onLogout
}: StudentPortalProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'biodata' | 'akademik' | 'pencairan' | 'pengumuman' | 'ujian'>('status');
  const [showSelectionLetter, setShowSelectionLetter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Selection Exam Session States
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [examQuestions] = useState<ExamQuestion[]>(() => localDb.getExamQuestions());

  // Form states for profile edit
  const [profileForm, setProfileForm] = useState({
    nama: student.nama,
    prodi: student.prodi,
    semester: student.semester,
    angkatan: student.angkatan,
    kontak: student.kontak,
    email: student.email,
    alamat: student.alamat,
    pekerjaanAyah: student.pekerjaanAyah,
    pekerjaanIbu: student.pekerjaanIbu,
    penghasilanOrtu: student.penghasilanOrtu.toString(),
    jumlahTanggungan: student.jumlahTanggungan.toString()
  });

  // Form states for bank details edit
  const studentDisb = disbursements.find(d => d.studentId === student.id || d.studentNim === student.nim);
  
  const getNormalizedBank = (rawBank: string | undefined): string => {
    if (!rawBank) return 'Bank BSI';
    const b = rawBank.toLowerCase();
    if (b.includes('bsi') || b.includes('syariah')) return 'Bank BSI';
    if (b.includes('mandiri')) return 'Bank Mandiri';
    if (b.includes('bni')) return 'Bank BNI';
    return 'Bank BSI';
  };

  const [bankForm, setBankForm] = useState({
    bankPenerima: getNormalizedBank(studentDisb?.bankPenerima),
    noRekening: studentDisb?.noRekening || ''
  });

  // Document states
  const [documents, setDocuments] = useState({ ...student.berkas });

  // LPJ states
  const [lpjPernyataan, setLpjPernyataan] = useState(studentDisb?.lpjPernyataan || '');
  const [lpjPdfName, setLpjPdfName] = useState(studentDisb?.lpjPdfName || '');
  const [lpjPdfSize, setLpjPdfSize] = useState(studentDisb?.lpjPdfSize || '');
  const [lpjPdfUrl, setLpjPdfUrl] = useState(studentDisb?.lpjPdfUrl || '');
  const [lpjSuccessMsg, setLpjSuccessMsg] = useState('');
  const [lpjErrorMsg, setLpjErrorMsg] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  const handleLpjFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLpjErrorMsg('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setLpjErrorMsg('Format file harus berupa PDF.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setLpjErrorMsg('Ukuran file maksimal adalah 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        setLpjPdfUrl(ev.target?.result as string);
        setLpjPdfName(file.name);
        setLpjPdfSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLpjFile = () => {
    setLpjPdfUrl('');
    setLpjPdfName('');
    setLpjPdfSize('');
    setLpjErrorMsg('');
  };

  const handleLpjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLpjSuccessMsg('');
    setLpjErrorMsg('');

    if (!lpjPdfUrl) {
      setLpjErrorMsg('Silakan unggah dokumen laporan bukti LPJ dalam format PDF.');
      return;
    }

    if (!studentDisb) {
      setLpjErrorMsg('Data pencairan semester ini tidak ditemukan.');
      return;
    }

    const tglSubmit = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const updatedDisb: Disbursement = {
      ...studentDisb,
      lpjStatus: 'Menunggu Verifikasi',
      lpjPernyataan,
      lpjPdfName,
      lpjPdfSize,
      lpjPdfUrl,
      lpjTanggalSubmit: tglSubmit
    };

    if (onUpdateDisbursement) {
      onUpdateDisbursement(updatedDisb);
      setLpjSuccessMsg('Laporan Pertanggungjawaban (LPJ) berhasil dikirim!');
    } else {
      setLpjErrorMsg('Sistem pelaporan LPJ sedang tidak tersedia.');
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    const actualCurrent = student.password || student.nim;
    if (currentPassword !== actualCurrent) {
      setPasswordErrorMsg('Password saat ini salah.');
      return;
    }

    if (newPassword.length < 5) {
      setPasswordErrorMsg('Password baru minimal 5 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    onUpdateStudent({
      ...student,
      password: newPassword
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccessMsg('Password Anda berhasil diperbarui!');
  };

  // Filter announcements for students
  const studentAnnouncements = announcements.filter(
    ann => ann.targetAudience === 'Semua' || ann.targetAudience === 'Mahasiswa'
  );

  // Find academic progress for this student
  const studentProgress = progressList.find(p => p.studentId === student.id || p.studentNim === student.nim);

  // Handle saving personal info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      onUpdateStudent({
        ...student,
        nama: profileForm.nama,
        prodi: profileForm.prodi,
        semester: Number(profileForm.semester),
        angkatan: profileForm.angkatan,
        kontak: profileForm.kontak,
        email: profileForm.email,
        alamat: profileForm.alamat,
        pekerjaanAyah: profileForm.pekerjaanAyah,
        pekerjaanIbu: profileForm.pekerjaanIbu,
        penghasilanOrtu: parseFloat(profileForm.penghasilanOrtu) || 0,
        jumlahTanggungan: parseInt(profileForm.jumlahTanggungan) || 0
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  // Handle toggling documents
  const handleDocToggle = (key: keyof DocumentStatus) => {
    const updatedDocs = {
      ...documents,
      [key]: !documents[key]
    };
    setDocuments(updatedDocs);
    onUpdateStudent({
      ...student,
      berkas: updatedDocs
    });
  };

  // Handle uploading files
  const handleFileUpload = (key: keyof DocumentStatus, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const updatedDocs = {
        ...documents,
        [key]: true
      };
      setDocuments(updatedDocs);
      const updatedFiles = {
        ...student.berkasFiles,
        [key]: {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          dataUrl: dataUrl
        }
      };
      onUpdateStudent({
        ...student,
        berkas: updatedDocs,
        berkasFiles: updatedFiles
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle deleting files
  const handleFileDelete = (key: keyof DocumentStatus) => {
    const updatedDocs = {
      ...documents,
      [key]: false
    };
    setDocuments(updatedDocs);
    const updatedFiles = {
      ...student.berkasFiles
    };
    if (updatedFiles) {
      delete updatedFiles[key];
    }
    onUpdateStudent({
      ...student,
      berkas: updatedDocs,
      berkasFiles: updatedFiles
    });
  };

  // Handle saving bank information
  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDisbursementBank(student.id, bankForm.bankPenerima, bankForm.noRekening);
    alert('Informasi rekening bank penerima beasiswa berhasil diperbarui.');
  };

  // Status Stepper Data
  const statuses: { label: KipStatus; desc: string }[] = [
    { label: 'Pendaftaran', desc: 'Pengisian biodata & penyerahan berkas awal.' },
    { label: 'Verifikasi', desc: 'Validasi dokumen fisik & wawancara kelayakan.' },
    { label: 'Diterima', desc: 'Dinyatakan lolos seleksi utama penerima KIP-K.' }
  ];

  // Helper for step status
  const getStepState = (stepLabel: KipStatus) => {
    const currentStatus = student.status;
    
    if (currentStatus === 'Ditolak') {
      return stepLabel === 'Diterima' ? 'rejected' : 'completed';
    }

    if (currentStatus === 'Cadangan') {
      return stepLabel === 'Diterima' ? 'warning' : 'completed';
    }

    const order = ['Pendaftaran', 'Verifikasi', 'Diterima'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepLabel);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Student Portal Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-700/50 p-1 shrink-0">
                <AlBiruniLogo className="w-full h-full" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-sm tracking-tight text-white leading-none">
                  Portal Mahasiswa KIP-K
                </h1>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">
                  STID Al-Biruni Babakan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none">{student.nama}</p>
                <p className="text-[9px] text-slate-400 font-mono mt-1">NIM: {student.nim}</p>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700/60"
              >
                <LogOut size={13} /> Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Student Card & Local Navigation */}
        <div className="lg:w-1/4 space-y-6">
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-600"></div>
            
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-16 h-16 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xl font-mono shadow-inner">
                {student.nama.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900 leading-snug">{student.nama}</h2>
                <span className="text-[10px] text-slate-500 font-mono font-medium block mt-0.5">NIM: {student.nim}</span>
              </div>
              
              {/* Badge Status */}
              <div className="pt-1">
                {student.status === 'Diterima' ? (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-bold tracking-tight inline-flex items-center gap-1">
                    <CheckCircle2 size={11} /> Penerima KIP-K Aktif
                  </span>
                ) : student.status === 'Verifikasi' ? (
                  <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] font-bold tracking-tight inline-flex items-center gap-1">
                    <Clock size={11} /> Berkas Diverifikasi
                  </span>
                ) : student.status === 'Cadangan' ? (
                  <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-bold tracking-tight inline-flex items-center gap-1">
                    <AlertTriangle size={11} /> Status Cadangan
                  </span>
                ) : student.status === 'Ditolak' ? (
                  <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-[10px] font-bold tracking-tight inline-flex items-center gap-1">
                    <AlertTriangle size={11} /> Pengajuan Ditolak
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-[10px] font-bold tracking-tight inline-flex items-center gap-1">
                    <Clock size={11} /> Antrean Pendaftaran
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3.5 mt-5 pt-4 border-t border-slate-100 text-center">
              <div>
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Prodi</span>
                <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block truncate" title={student.prodi}>
                  {student.prodi.split(' (')[1]?.replace(')', '') || student.prodi}
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Semester</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  Semester {student.semester}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Menus */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-sm space-y-1.5">
            <button
              onClick={() => setActiveTab('status')}
              className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-colors ${
                activeTab === 'status'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText size={15} />
              Status Pengajuan KIP
            </button>

            <button
              onClick={() => setActiveTab('biodata')}
              className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-colors ${
                activeTab === 'biodata'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User size={15} />
              Profil & Biodata Saya
            </button>

            {student.status === 'Diterima' && (
              <>
                <button
                  onClick={() => setActiveTab('akademik')}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-colors ${
                    activeTab === 'akademik'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <BarChart2 size={15} />
                  Monev & Laporan Akademik
                </button>

                <button
                  onClick={() => setActiveTab('pencairan')}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-colors ${
                    activeTab === 'pencairan'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <DollarSign size={15} />
                  Status Pencairan Dana
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('pengumuman')}
              className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-colors ${
                activeTab === 'pengumuman'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Megaphone size={15} />
              Pengumuman Kampus ({studentAnnouncements.length})
            </button>

            <button
              onClick={() => setActiveTab('ujian')}
              className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-colors ${
                activeTab === 'ujian'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ListChecks size={15} />
              Ujian Seleksi Beasiswa
              {student.examResult ? (
                <span className="ml-auto bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                  Skor: {student.examResult.score}
                </span>
              ) : (
                <span className="ml-auto bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                  Mulai
                </span>
              )}
            </button>
          </div>

          {/* Quick Support Card */}
          <div className="bg-slate-950 rounded-2xl p-5 text-white shadow-md border border-slate-800">
            <h4 className="font-serif font-bold text-xs flex items-center gap-1.5 text-emerald-400">
              <HelpCircle size={14} /> Butuh Bantuan?
            </h4>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-light">
              Jika terdapat kendala pengisian berkas KIP atau kesalahan pelaporan, hubungi Unit Kemahasiswaan STID Al-Biruni Babakan.
            </p>
            <div className="mt-3 text-[10px] text-emerald-300 font-mono font-medium block">
              Email: stid.cirebon@gmail.com
            </div>
          </div>

        </div>

        {/* Right Side: Tab Contents */}
        <div className="flex-1 space-y-6">

          {/* TAB 1: STATUS APPLICATION & DOCUMENTS CHECKLIST */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              
              {/* Celeb/Warn Banners based on status */}
              {student.status === 'Diterima' ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 shadow-2xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 border border-emerald-200">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-slate-900 text-sm">Selamat, Anda Lolos KIP Kuliah!</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Berdasarkan keputusan rapat pleno Kemahasiswaan STID Al-Biruni Cirebon, permohonan beasiswa Anda dinyatakan **DITERIMA** penuh. Jaga selalu prestasi akademik, kehadiran kelas, dan keaktifan dakwah Anda.
                    </p>
                  </div>
                </div>
              ) : student.status === 'Verifikasi' ? (
                <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0 border border-blue-200">
                    <RefreshCw className="animate-spin" size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-slate-900 text-sm">Berkas Sedang Diverifikasi</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Berkas fisik dan biodata digital Anda saat ini sedang diperiksa dan dinilai oleh panitia KIP-K STID Al-Biruni Babakan Ciwaringin. Pantau berkala menu ini untuk informasi selanjutnya atau jadwal wawancara langsung.
                    </p>
                  </div>
                </div>
              ) : student.status === 'Cadangan' ? (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0 border border-amber-200">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-slate-900 text-sm">Berstatus sebagai Cadangan</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Berkas Anda memenuhi kriteria kelayakan, namun karena keterbatasan kuota pusat, Anda ditempatkan pada kuota **Cadangan**. Status akan naik ke penerima jika ada penerima utama yang gugur atau mengundurkan diri.
                    </p>
                  </div>
                </div>
              ) : student.status === 'Ditolak' ? (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center shrink-0 border border-rose-200">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-slate-900 text-sm">Pengajuan Belum Disetujui</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Mohon maaf, berdasarkan seleksi berkas ekonomi dan akademik, pengajuan beasiswa KIP Kuliah Anda saat ini belum dapat disetujui oleh panitia karena keterbatasan alokasi beasiswa. Silakan hubungi prodi Anda untuk opsi bantuan kemahasiswaan lainnya.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-slate-100 border border-slate-200 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-300">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-slate-900 text-sm">Pendaftaran Berhasil Dikirim</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Data Anda telah tersimpan di sistem antrean pendaftaran. Silakan persiapkan berkas pendaftaran fisik Anda untuk diserahkan ke ruang Sub-Bagian Kemahasiswaan agar status Anda dapat dinaikkan ke tahap Verifikasi.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Stepper Visualizer */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-serif font-bold text-sm text-slate-900 mb-5">Timeline Pengajuan Beasiswa Anda</h3>
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                  {/* Stepper background line */}
                  <div className="absolute left-[15px] md:left-4 md:right-4 top-4 bottom-4 md:bottom-auto md:h-1 bg-slate-100 -z-0"></div>

                  {statuses.map((step, idx) => {
                    const stepState = getStepState(step.label);
                    return (
                      <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center relative z-10 gap-3.5 md:gap-2.5 flex-1">
                        
                        {/* Circle Indicator */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border transition-all ${
                          stepState === 'completed' 
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : stepState === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-600 ring-4 ring-emerald-100 font-extrabold'
                            : stepState === 'rejected'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : stepState === 'warning'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-slate-300 border-slate-200'
                        }`}>
                          {stepState === 'completed' ? (
                            <Check size={14} strokeWidth={3} />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        {/* Labels */}
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 leading-tight">Tahap {step.label}</h4>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] md:mx-auto leading-normal">
                            {step.desc}
                          </p>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Document Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="font-serif font-bold text-sm text-slate-900">Kelengkapan Berkas Persyaratan KIP-K</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Silakan unggah dokumen persyaratan Anda. Mengunggah file akan menandai status dokumen menjadi "Sudah Ada" secara otomatis.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {([
                    { key: 'kartuKip', title: 'Kartu KIP / PKH / KKS', desc: 'Bukti sah keikutsertaan program bantuan sosial nasional dari pemerintah.' },
                    { key: 'sktm', title: 'Surat Keterangan Tidak Mampu (SKTM)', desc: 'Surat pengantar resmi dari Kepala Desa atau Kelurahan setempat.' },
                    { key: 'slipGaji', title: 'Struk Gaji / Surat Pernyataan Penghasilan', desc: 'Rincian penghasilan orang tua ditandatangani oleh RT/RW atau instansi kerja.' },
                    { key: 'raport', title: 'Salinan Raport SMA/MA Sederajat', desc: 'Bukti prestasi akademik rapor sekolah asal semester 1-6.' },
                    { key: 'prestasiDoc', title: 'Sertifikat / Piagam Penghargaan', desc: 'Bukti prestasi bidang keagamaan, lomba, dakwah, olahraga, atau seni.' },
                    { key: 'ktp', title: 'Upload KTP', desc: 'Scan atau foto Kartu Tanda Penduduk (KTP) asli yang masih berlaku.' },
                    { key: 'kk', title: 'Upload KK', desc: 'Scan atau foto Kartu Keluarga (KK) terbaru yang mencantumkan nama Anda.' },
                    { key: 'foto', title: 'Upload Foto (Formal) Terbaru', desc: 'Pas foto formal terbaru dengan latar belakang merah atau biru.' }
                  ] as { key: keyof DocumentStatus; title: string; desc: string }[]).map(({ key, title, desc }) => {
                    const fileInfo = student.berkasFiles?.[key];
                    const hasFile = !!fileInfo;

                    return (
                      <div key={key} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100/60 transition-colors border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <input 
                            type="checkbox"
                            checked={documents[key]}
                            onChange={() => handleDocToggle(key)}
                            className="w-4.5 h-4.5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-800 block">{title}</span>
                            <span className="text-[10px] text-slate-400 block leading-normal">{desc}</span>
                            
                            {hasFile && (
                              <div className="mt-2 flex items-center gap-2 bg-emerald-50 text-emerald-800 text-[10px] font-medium px-2 py-1 rounded border border-emerald-100 w-fit">
                                <Paperclip size={11} className="text-emerald-600 shrink-0" />
                                <span className="truncate max-w-[150px] sm:max-w-[200px]">{fileInfo.name}</span>
                                <span className="text-emerald-500 text-[9px]">({fileInfo.size})</span>
                                <a 
                                  href={fileInfo.dataUrl} 
                                  download={fileInfo.name}
                                  className="text-emerald-700 hover:text-emerald-950 font-bold underline ml-1"
                                >
                                  Unduh
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                          {/* Hidden File Input */}
                          <input 
                            type="file"
                            id={`file-input-${key}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(key, file);
                              }
                            }}
                          />
                          
                          {hasFile ? (
                            <button
                              type="button"
                              onClick={() => handleFileDelete(key)}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 rounded-lg border border-red-200 transition-colors text-[10px] font-bold flex items-center gap-1"
                              title="Hapus file"
                            >
                              <Trash2 size={12} />
                              Hapus
                            </button>
                          ) : (
                            <label
                              htmlFor={`file-input-${key}`}
                              className="cursor-pointer p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors text-[10px] font-bold flex items-center gap-1.5 shadow-sm"
                            >
                              <Upload size={12} />
                              Unggah File
                            </label>
                          )}

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${documents[key] ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {documents[key] ? 'Sudah Ada' : 'Belum Ada'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROFILE & BIODATA FORM */}
          {activeTab === 'biodata' && (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-emerald-400" />
                  <h3 className="font-serif font-bold text-sm tracking-tight">Perbarui Biodata Diri & Orang Tua</h3>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                {saveSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-bold">
                    <CheckCircle2 size={15} />
                    <span>Perubahan biodata berhasil disimpan secara lokal!</span>
                  </div>
                )}

                {/* Section 1: Identitas Akademik */}
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block border-b border-slate-100 pb-1">
                    A. Informasi Akademik Utama
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.nama}
                        onChange={e => setProfileForm({ ...profileForm, nama: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Program Studi *</label>
                      <select
                        value={profileForm.prodi}
                        onChange={e => setProfileForm({ ...profileForm, prodi: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                      >
                        {prodis.map(p => (
                          <option key={p.id} value={p.nama}>{p.nama}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">NIM (Tidak Dapat Diubah)</label>
                      <input
                        type="text"
                        disabled
                        value={student.nim}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-100 font-mono font-bold text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Semester *</label>
                      <select
                        value={profileForm.semester}
                        onChange={e => setProfileForm({ ...profileForm, semester: Number(e.target.value) })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Angkatan</label>
                      <input
                        type="text"
                        required
                        value={profileForm.angkatan}
                        onChange={e => setProfileForm({ ...profileForm, angkatan: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Kontak */}
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block border-b border-slate-100 pb-1">
                    B. Kontak & Alamat Surat Menyurat
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor WhatsApp Aktif *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.kontak}
                        onChange={e => setProfileForm({ ...profileForm, kontak: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Aktif *</label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alamat Domisili *</label>
                    <textarea
                      rows={2}
                      required
                      value={profileForm.alamat}
                      onChange={e => setProfileForm({ ...profileForm, alamat: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Section 3: Ekonomi Orang Tua */}
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block border-b border-slate-100 pb-1">
                    C. Profil Orang Tua & Penghasilan
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pekerjaan Ayah</label>
                      <input
                        type="text"
                        value={profileForm.pekerjaanAyah}
                        onChange={e => setProfileForm({ ...profileForm, pekerjaanAyah: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        value={profileForm.pekerjaanIbu}
                        onChange={e => setProfileForm({ ...profileForm, pekerjaanIbu: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penghasilan Gabungan Bulanan (Rp) *</label>
                      <input
                        type="number"
                        required
                        value={profileForm.penghasilanOrtu}
                        onChange={e => setProfileForm({ ...profileForm, penghasilanOrtu: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jumlah Tanggungan Anak *</label>
                      <select
                        value={profileForm.jumlahTanggungan}
                        onChange={e => setProfileForm({ ...profileForm, jumlahTanggungan: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(c => (
                          <option key={c} value={c}>{c} Anak / Tanggungan</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="animate-spin" size={13} /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={13} /> Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Ubah Password Akun Mahasiswa */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <h3 className="font-serif font-bold text-sm tracking-tight">Ubah Password Akun Mahasiswa</h3>
                </div>
              </div>
              <form onSubmit={handlePasswordChangeSubmit} className="p-6 space-y-4">
                {passwordSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> {passwordSuccessMsg}
                  </div>
                )}
                {passwordErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {passwordErrorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password Saat Ini *</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password Baru * (Min. 5 Karakter)</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Konfirmasi Password Baru *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save size={13} /> Perbarui Password
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

          {/* TAB 3: MONITORING AKADEMIK & EVALUATION */}
          {activeTab === 'akademik' && student.status === 'Diterima' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Score indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">IPK Saat Ini</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      {studentProgress?.ipk ? studentProgress.ipk.toFixed(2) : (student.ipk ? student.ipk.toFixed(2) : '3.00')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">/ 4.00</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-slate-500 font-medium">Status Akademik Aman</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Persentase Kehadiran</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      {studentProgress?.kehadiran ? `${studentProgress.kehadiran}%` : '95%'}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-slate-500 font-medium">Min Persyaratan: 80%</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rekomendasi Evaluasi</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    {studentProgress?.statusEvaluasi === 'Layak' ? (
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                        Layak Dilanjutkan
                      </span>
                    ) : studentProgress?.statusEvaluasi === 'Pembinaan' ? (
                      <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                        Tahap Pembinaan
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                        LAYAK (Default)
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">Ditandatangani oleh Dosen Wali</div>
                </div>
              </div>

              {/* Islamic & Dakwah Requirements (Unique to STID Al-Biruni) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Heart size={15} className="text-rose-500 animate-pulse" />
                  Kondisi Penilaian Karakter & Dakwah STID
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  
                  {/* Al-Quran Hafalan */}
                  <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                      Progress Tahfidz / Setoran Al-Quran
                    </span>
                    <p className="text-xs font-bold text-slate-800 font-mono">
                      {studentProgress?.hafalanQuran || 'Sudah Setor Juz 30 (Lengkap)'}
                    </p>
                    <span className="block text-[10px] text-slate-400 leading-normal mt-1.5">
                      * Persyaratan wajib: Setoran kelayakan minimal 1 Juz per semester untuk seluruh penerima KIP-K.
                    </span>
                  </div>

                  {/* Kegiatan Dakwah */}
                  <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                      Pengabdian & Keaktifan Dakwah
                    </span>
                    <ul className="text-xs font-medium text-slate-700 space-y-1 pl-4 list-disc">
                      {studentProgress?.kegiatanDakwah && studentProgress.kegiatanDakwah.length > 0 ? (
                        studentProgress.kegiatanDakwah.map((dakwah, idx) => (
                          <li key={idx}>{dakwah}</li>
                        ))
                      ) : (
                        <>
                          <li>Khatib / Ceramah Masjid Babakan</li>
                          <li>Mengajar TPQ/TPA binaan Ciwaringin</li>
                        </>
                      )}
                    </ul>
                  </div>

                </div>

                {/* Lecturer Notes */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl mt-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Catatan Dosen Wali / Tim Monev
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{studentProgress?.catatanDosen || 'Pertahankan prestasi akademik, dedikasi dakwah, dan akhlak mulia Anda di lingkungan pondok pesantren dan kampus.'}"
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: DISBURSEMENT STATUS (STATUS PENCAIRAN) */}
          {activeTab === 'pencairan' && student.status === 'Diterima' && (
            <div className="space-y-6">
              
              {/* Financial Box Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl"></div>
                
                <div className="space-y-1">
                  <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block">Total Bantuan Per Semester</span>
                  <div className="text-2xl font-extrabold font-mono text-slate-50">Rp 6.600.000</div>
                  <span className="text-[10px] text-slate-400 font-light block leading-tight">
                    Terdiri dari Rp 2.400.000 (UKT SPP Kuliah) dan Rp 4.200.000 (Subsidi Biaya Hidup bulanan).
                  </span>
                </div>

                <div className="w-12 h-12 bg-slate-800 text-emerald-400 rounded-xl flex items-center justify-center border border-slate-700 shrink-0">
                  <Landmark size={22} />
                </div>
              </div>

              {/* Disbursement Timeline status */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <h3 className="font-serif font-bold text-sm text-slate-900">Rincian Komponen Beasiswa Semester Ini</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* UKT */}
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[170px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase">Komponen 1</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          studentDisb?.statusUkt === 'Cair' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {studentDisb?.statusUkt || 'Cair (Default)'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs">Biaya UKT / SPP Kuliah</h4>
                      <p className="text-lg font-mono font-extrabold text-slate-900">
                        Rp {studentDisb?.nominalUkt ? studentDisb.nominalUkt.toLocaleString('id-ID') : '2.400.000'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-150 text-[10px] text-slate-500 mt-4">
                      <span>Ditransfer langsung ke rekening kas STID Al-Biruni pada: </span>
                      <span className="font-bold text-slate-700 block font-mono mt-0.5">
                        {studentDisb?.tanggalCairUkt || '2026-06-15 10:30'}
                      </span>
                    </div>
                  </div>

                  {/* Living Expense */}
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[170px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase">Komponen 2</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          studentDisb?.statusBiayaHidup === 'Cair' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {studentDisb?.statusBiayaHidup || 'Cair (Default)'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs">Bantuan Biaya Hidup Saku</h4>
                      <p className="text-lg font-mono font-extrabold text-slate-900">
                        Rp {studentDisb?.nominalBiayaHidup ? studentDisb.nominalBiayaHidup.toLocaleString('id-ID') : '4.200.000'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-150 text-[10px] text-slate-500 mt-4">
                      <span>Dikirim langsung ke nomor rekening mahasiswa pada: </span>
                      <span className="font-bold text-slate-700 block font-mono mt-0.5">
                        {studentDisb?.tanggalCairBiayaHidup || '2026-06-18 14:15'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bank Account Info update */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-serif font-bold text-sm text-slate-900">Informasi Rekening Bank Penerima Beasiswa</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Harap pastikan nama bank dan nomor rekening Anda sudah benar untuk memperlancar transfer biaya hidup.
                </p>

                <form onSubmit={handleSaveBank} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Bank Penerima *</label>
                    <select
                      value={bankForm.bankPenerima}
                      onChange={e => setBankForm({ ...bankForm, bankPenerima: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold text-slate-800"
                    >
                      <option value="Bank Mandiri">Bank Mandiri</option>
                      <option value="Bank BSI">Bank BSI</option>
                      <option value="Bank BNI">Bank BNI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor Rekening Anda *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 7123456789 (BSI)"
                        value={bankForm.noRekening}
                        onChange={e => setBankForm({ ...bankForm, noRekening: e.target.value })}
                        className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono font-bold text-slate-800"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Save size={13} /> Update
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* LAPORAN PERTANGGUNGJAWABAN (LPJ) SECTION */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="text-emerald-600 animate-pulse" size={18} />
                  <div>
                    <h3 className="font-serif font-bold text-sm text-slate-900">Laporan Pertanggungjawaban (LPJ) Mahasiswa</h3>
                    <p className="text-xs text-slate-500">
                      Sesuai regulasi KIP Kuliah, penerima dana wajib mengunggah laporan pertanggungjawaban penggunaan dana bantuan di setiap semester.
                    </p>
                  </div>
                </div>

                {/* Status LPJ saat ini */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border bg-slate-50">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status LPJ Semester Ini</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        (studentDisb?.lpjStatus || 'Belum Diisi') === 'Diterima'
                          ? 'bg-emerald-100 text-emerald-800'
                          : (studentDisb?.lpjStatus || 'Belum Diisi') === 'Menunggu Verifikasi'
                          ? 'bg-amber-100 text-amber-800'
                          : (studentDisb?.lpjStatus || 'Belum Diisi') === 'Revisi'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {studentDisb?.lpjStatus || 'Belum Diisi'}
                      </span>
                      {studentDisb?.lpjTanggalSubmit && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Diserahkan: {studentDisb.lpjTanggalSubmit}
                        </span>
                      )}
                    </div>
                  </div>

                  {studentDisb?.lpjPdfName && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border text-xs">
                      <Paperclip size={13} className="text-slate-400" />
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">{studentDisb.lpjPdfName}</span>
                      <span className="text-[9px] text-slate-400">({studentDisb.lpjPdfSize})</span>
                    </div>
                  )}
                </div>

                {studentDisb?.lpjCatatan && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800">
                    <p className="font-bold mb-1 flex items-center gap-1">
                      <AlertTriangle size={13} /> Catatan / Alasan Revisi dari Operator:
                    </p>
                    <p className="italic">{studentDisb.lpjCatatan}</p>
                  </div>
                )}

                {/* LPJ Form */}
                {(!studentDisb?.lpjStatus || studentDisb.lpjStatus === 'Belum Diisi' || studentDisb.lpjStatus === 'Revisi') ? (
                  <form onSubmit={handleLpjSubmit} className="space-y-4 pt-2">
                    {lpjSuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> {lpjSuccessMsg}
                      </div>
                    )}
                    {lpjErrorMsg && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-1.5">
                        <AlertTriangle size={14} /> {lpjErrorMsg}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        1. Deskripsi Penggunaan Dana (Pernyataan Singkat) *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Tuliskan rincian penggunaan dana bantuan biaya hidup semester ini. Contoh: Digunakan untuk biaya sewa tempat tinggal, transportasi kuliah, buku referensi akademis, dan alat tulis."
                        value={lpjPernyataan}
                        onChange={e => setLpjPernyataan(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        2. Dokumen Bukti / Laporan PDF * (Maks. 2MB)
                      </label>
                      
                      <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center">
                        <Upload className="text-slate-400 mb-2" size={24} />
                        
                        {lpjPdfName ? (
                          <div className="mb-3">
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-center">
                              <Check className="text-emerald-500" size={14} /> {lpjPdfName}
                            </p>
                            <p className="text-[10px] text-slate-400">Ukuran file: {lpjPdfSize}</p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 mb-3">
                            Format dokumen wajib dalam bentuk <b>PDF</b> (Berisi rincian kuitansi/bukti transaksi pendukung)
                          </p>
                        )}

                        <input
                          type="file"
                          id="lpj-pdf-upload"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleLpjFileChange}
                        />
                        <div className="flex gap-2">
                          <label
                            htmlFor="lpj-pdf-upload"
                            className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Paperclip size={13} /> Pilih File PDF
                          </label>
                          {lpjPdfUrl && (
                            <button
                              type="button"
                              onClick={handleDeleteLpjFile}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={13} /> Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send size={13} /> Kirim LPJ Semester Ini
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 border border-emerald-100 bg-emerald-50/50 rounded-xl space-y-3 mt-2">
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                      <span className="font-bold text-emerald-800 block mb-1">✓ Laporan Berhasil Dikirim</span>
                      Laporan LPJ Anda sedang ditinjau oleh operator kemahasiswaan STID Al-Biruni. Anda tidak dapat melakukan perubahan kecuali operator menginstruksikan revisi.
                    </p>
                    <div className="text-xs space-y-1.5 border-t border-emerald-100 pt-2 text-slate-600">
                      <div><b>Pernyataan Penggunaan:</b> "{studentDisb?.lpjPernyataan}"</div>
                      <div><b>File LPJ PDF:</b> <span className="font-mono text-[11px] text-slate-700 font-bold">{studentDisb?.lpjPdfName}</span> ({studentDisb?.lpjPdfSize})</div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: CAMPUS ANNOUNCEMENTS (PAPAN PENGUMUMAN) */}
          {activeTab === 'pengumuman' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Megaphone size={16} className="text-emerald-600" />
                    Papan Pengumuman Kampus
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pengumuman resmi untuk seluruh penerima beasiswa KIP Kuliah STID Al-Biruni Babakan.
                  </p>
                </div>
              </div>

              {studentAnnouncements.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <p className="text-xs text-slate-400 font-medium">Belum ada pengumuman terbaru untuk mahasiswa.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentAnnouncements.map(ann => (
                    <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden hover:border-emerald-200 transition-colors">
                      {ann.isPinned && (
                        <span className="absolute top-0 right-0 px-2.5 py-1 bg-emerald-600 text-white text-[9px] font-bold rounded-bl-xl tracking-wide uppercase">
                          DIPIN
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold font-mono">{ann.category}</span>
                          <span>•</span>
                          <span>{ann.date}</span>
                          <span>•</span>
                          <span className="italic">Oleh: {ann.author}</span>
                        </div>

                        <h3 className="font-serif font-bold text-sm text-slate-950 leading-snug">{ann.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap pt-1">{ann.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SELECTION EXAM (UJIAN SELEKSI) */}
          {activeTab === 'ujian' && (
            <div className="space-y-6" id="student-exam-panel">
              {/* Exam Header */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                    <ListChecks size={18} className="text-emerald-600" />
                    Ujian Seleksi Calon Penerima KIP Kuliah
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    STID Al-Biruni Babakan Ciwaringin Cirebon
                  </p>
                </div>
                {student.examResult && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                    Selesai Dikerjakan
                  </span>
                )}
              </div>

              {/* Case 1: Student has already completed the exam */}
              {student.examResult ? (
                <div className="space-y-6">
                  {/* Results Overview Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <Award size={36} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-lg text-slate-900">Selamat, Anda Telah Menyelesaikan Ujian Seleksi!</h3>
                      <p className="text-xs text-slate-500">
                        Skor Anda telah terekam secara otomatis ke dalam sistem administrasi seleksi KIP-K.
                      </p>
                    </div>

                    <div className="inline-flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 min-w-[180px]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Skor Hasil Ujian</span>
                      <span className="text-4xl font-serif font-extrabold text-emerald-600 mt-1">{student.examResult.score}</span>
                      <span className="text-[10px] font-medium text-slate-500 mt-1">dari 100 poin maksimal</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Selesai pada: {student.examResult.completedAt}
                    </div>

                    {/* Print / Download official letter */}
                    <div className="pt-2">
                      <button
                        onClick={() => setShowSelectionLetter(true)}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
                      >
                        <Printer size={14} /> Cetak Surat Hasil Seleksi
                      </button>
                    </div>
                  </div>

                  {/* Official Selection Result Letter Preview Modal (A4 print-ready) */}
                  {showSelectionLetter && (() => {
                    const letterhead = localDb.getLetterhead();
                    const committeeMembers = localDb.getCommitteeMembers();
                    const signee = committeeMembers.find(m => m.isSignee) || {
                      name: 'Jauharudin, M.Hum',
                      role: 'WAKET I Bidang Akademik',
                      nipNidn: 'NIDN. 2103048901'
                    };

                    return (
                      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
                        <style>{`
                          @media print {
                            body * {
                              visibility: hidden;
                            }
                            #print-selection-letter, #print-selection-letter * {
                              visibility: visible;
                            }
                            #print-selection-letter {
                              position: absolute;
                              left: 0;
                              top: 0;
                              width: 100%;
                              border: none !important;
                              box-shadow: none !important;
                              padding: 0 !important;
                              margin: 0 !important;
                            }
                          }
                        `}</style>
                        
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] w-full max-w-4xl overflow-hidden font-sans">
                          {/* Modal Header */}
                          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2">
                              <Printer className="text-emerald-700" size={18} />
                              <h3 className="font-bold text-slate-800 text-xs">Pratinjau Surat Hasil Seleksi Resmi</h3>
                            </div>
                            <button
                              onClick={() => setShowSelectionLetter(false)}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          {/* Modal Body (Scrollable Letter Sheet) */}
                          <div className="p-8 md:p-12 overflow-y-auto bg-slate-100 flex justify-center">
                            <div 
                              id="print-selection-letter" 
                              className="bg-white border border-slate-200 shadow-md p-8 md:p-12 w-full max-w-[210mm] min-h-[297mm] font-serif text-slate-800 flex flex-col justify-between text-left"
                            >
                              {/* Letter Content Upper Section */}
                              <div className="space-y-6">
                                {/* Letterhead (KOP) */}
                                <div className="flex items-center gap-6 border-b-4 border-emerald-800 pb-4 font-serif">
                                  {letterhead.logoUrl ? (
                                    <div className="w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden">
                                      <img src={letterhead.logoUrl} className="w-16 h-16 object-contain" alt="Logo" referrerPolicy="no-referrer" />
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0">
                                      <span className="text-2xl font-serif">{letterhead.logoText || 'AB'}</span>
                                    </div>
                                  )}
                                  <div className="space-y-1 flex-1 text-left font-serif">
                                    <h2 className="text-[10px] md:text-xs font-bold tracking-wider text-slate-500 uppercase font-sans leading-none">{letterhead.institutionName}</h2>
                                    <h1 className="text-base md:text-lg font-serif font-extrabold uppercase tracking-wide text-emerald-950 leading-tight mt-1">{letterhead.collegeName}</h1>
                                    <p className="text-[10px] text-slate-400 font-sans leading-tight mt-1">
                                      {letterhead.address}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-sans leading-tight">
                                      {letterhead.contact} {letterhead.extraInfo ? ` • ${letterhead.extraInfo}` : ''}
                                    </p>
                                  </div>
                                </div>

                                {/* Letter Date and Reference */}
                                <div className="flex justify-between items-start font-sans text-xs text-slate-600">
                                  <div className="space-y-0.5 text-left">
                                    <p><span className="font-bold">Nomor :</span> 145/PAN-SEL/STID-AB/VII/2026</p>
                                    <p><span className="font-bold">Lamp. :</span> -</p>
                                    <p><span className="font-bold">Perihal :</span> Pengumuman Hasil Seleksi Beasiswa KIP Kuliah</p>
                                  </div>
                                  <div className="text-right">
                                    <p>Cirebon, {new Date(student.examResult?.completedAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                  </div>
                                </div>

                                {/* Salutation & Address */}
                                <div className="space-y-1 text-xs text-left font-serif">
                                  <p>Kepada Yth,</p>
                                  <p className="font-bold font-sans text-slate-900">{student.nama}</p>
                                  <p>No. Registrasi / NIM: <span className="font-mono font-bold text-slate-700">{student.nim}</span></p>
                                  <p>Program Studi: {student.prodi}</p>
                                  <p>Di Tempat</p>
                                </div>

                                {/* Opening Statement */}
                                <div className="space-y-4 text-xs md:text-sm leading-relaxed text-justify">
                                  <p className="font-sans font-semibold text-slate-800">Assalamu’alaikum Warahmatullahi Wabarakatuh,</p>
                                  <p>
                                    Berdasarkan hasil pelaksanaan ujian seleksi tertulis penerimaan program Beasiswa Kartu Indonesia Pintar (KIP) Kuliah STID Al-Biruni Babakan Ciwaringin Cirebon Tahun Akademik 2025/2026 yang dilaksanakan secara daring, dengan ini Panitia Seleksi menetapkan hasil sebagai berikut:
                                  </p>
                                </div>

                                {/* Selected Result Box */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-sans max-w-md mx-auto text-left">
                                  <div className="grid grid-cols-2 text-xs border-b border-slate-100 pb-1.5">
                                    <span className="text-slate-400 font-medium">Skor Ujian Seleksi</span>
                                    <span className="font-bold font-mono text-emerald-700 text-right">{student.examResult?.score} / 100</span>
                                  </div>
                                  <div className="grid grid-cols-2 text-xs">
                                    <span className="text-slate-400 font-medium">Status Kelulusan</span>
                                    <span className="font-bold text-emerald-800 text-right uppercase">LULUS SELEKSI</span>
                                  </div>
                                </div>

                                {/* Main Declaration Paragraph */}
                                <div className="space-y-4 text-xs md:text-sm leading-relaxed text-justify">
                                  <p>
                                    Dengan perolehan skor tersebut, yang bersangkutan dinyatakan <span className="font-bold text-emerald-800">DITERIMA</span> sebagai calon penerima program Beasiswa KIP Kuliah di STID Al-Biruni Cirebon. Keputusan ini bersifat mutlak dan tidak dapat diganggu gugat.
                                  </p>
                                  <p>
                                    Selanjutnya, pendaftar diharapkan segera melakukan verifikasi berkas fisik pendukung KIP Kuliah di Kantor Sekretariat Panitia KIP Kuliah STID Al-Biruni sesuai dengan jadwal pembinaan akademik awal yang ditetapkan.
                                  </p>
                                  <p>
                                    Demikian surat pemberitahuan ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.
                                  </p>
                                  <p className="font-sans font-semibold text-slate-800">Wassalamu’alaikum Warahmatullahi Wabarakatuh.</p>
                                </div>
                              </div>

                              {/* Letter Signature Block (Panitia Seleksi) */}
                              <div className="flex justify-end pt-12">
                                <div className="text-center font-sans text-xs space-y-16 w-60">
                                  <div className="space-y-1 text-center">
                                    <p className="font-bold uppercase tracking-wider text-slate-700">Panitia Seleksi KIP Kuliah</p>
                                    <p className="font-semibold text-slate-500">{signee.role}</p>
                                  </div>
                                  
                                  <div className="space-y-0.5 text-center">
                                    <p className="font-bold text-slate-900 underline text-xs">{signee.name}</p>
                                    {signee.nipNidn && (
                                      <p className="text-[10px] text-slate-400 font-mono">{signee.nipNidn}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Modal Footer */}
                          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                            <button
                              onClick={() => window.print()}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Printer size={14} /> Cetak Surat / Unduh PDF
                            </button>
                            <button
                              onClick={() => setShowSelectionLetter(false)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all"
                            >
                              Tutup
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}


                  {/* Detailed Q&A Review List */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1">
                      <Sparkles size={14} className="text-emerald-600" />
                      Lembar Peninjauan Jawaban Ujian
                    </h3>

                    {examQuestions.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Tidak ada lembar pertanyaan untuk ditinjau.</p>
                    ) : (
                      <div className="space-y-6 divide-y divide-slate-100">
                        {examQuestions.map((q, idx) => {
                          const selectedIndex = student.examResult?.answers[q.id];
                          const isCorrect = selectedIndex === q.correctOptionIndex;

                          return (
                            <div key={q.id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''} space-y-3`}>
                              <div className="flex items-start gap-2">
                                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 leading-relaxed pt-0.5">
                                  {q.questionText}
                                </h4>
                              </div>

                              {/* Options review */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-8">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = selectedIndex === oIdx;
                                  const isAnswerKey = q.correctOptionIndex === oIdx;

                                  let boxClass = 'bg-slate-50 border-slate-100 text-slate-600';
                                  if (isSelected && isCorrect) {
                                    boxClass = 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold';
                                  } else if (isSelected && !isCorrect) {
                                    boxClass = 'bg-rose-50 border-rose-200 text-rose-900 font-bold';
                                  } else if (isAnswerKey) {
                                    boxClass = 'bg-emerald-50/50 border-emerald-100/75 text-emerald-800';
                                  }

                                  return (
                                    <div key={oIdx} className={`p-2.5 px-3 rounded-lg border text-xs flex items-center justify-between ${boxClass}`}>
                                      <span className="flex items-center gap-1.5">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                                          isSelected 
                                            ? isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                                            : isAnswerKey ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                          {['A', 'B', 'C', 'D'][oIdx]}
                                        </span>
                                        <span>{opt}</span>
                                      </span>
                                      {isSelected && isCorrect && <CheckCircle2 size={13} className="text-emerald-600" />}
                                      {isSelected && !isCorrect && <AlertTriangle size={13} className="text-rose-600" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Case 2: Student needs to take the exam */
                <div className="space-y-6">
                  {!examStarted ? (
                    /* Welcome screen / Instructions */
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-900 p-5 text-white flex items-center gap-3">
                        <Award className="text-emerald-400" size={20} />
                        <div>
                          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Ujian Saringan Seleksi</h3>
                          <h4 className="text-sm font-serif font-bold text-white leading-tight">Instruksi Pengerjaan Ujian</h4>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                          <p className="font-bold text-slate-800">Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                          <p>
                            Sebelum memulai pengerjaan ujian saringan seleksi program Beasiswa KIP Kuliah STID Al-Biruni Cirebon, mohon perhatikan petunjuk teknis berikut ini dengan seksama:
                          </p>
                          <ul className="list-disc pl-5 space-y-2 font-medium text-slate-700">
                            <li>Ujian ini terdiri atas <b className="text-slate-900">{examQuestions.length} butir pertanyaan</b> pilihan ganda.</li>
                            <li>Materi yang diujikan mencakup wawasan kemahasiswaan KIP Kuliah, sejarah Dewan Dakwah, nilai keislaman, serta potensi akademik.</li>
                            <li>Pastikan Anda berada di lingkungan yang kondusif dengan koneksi internet yang stabil selama pengerjaan.</li>
                            <li><b>Hanya terdapat 1 (satu) kali kesempatan</b> untuk melakukan pengerjaan ujian. Nilai akan langsung dikalkulasi dan disimpan secara permanen.</li>
                            <li>Jawaban Anda akan langsung diperiksa seketika setelah menekan tombol "Selesai & Kirim Ujian".</li>
                          </ul>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-emerald-900">
                          <AlertCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-bold">Kesiapan Ujian</p>
                            <p className="leading-relaxed mt-0.5">
                              Setelah menekan tombol di bawah ini, waktu pengerjaan akan dimulai dan Anda tidak dapat membatalkan atau kembali ke halaman utama sebelum menyelesaikan lembar jawaban.
                            </p>
                          </div>
                        </div>

                        {examQuestions.length === 0 ? (
                          <div className="text-center py-4 text-slate-400 text-xs border border-dashed rounded-xl">
                            Belum ada pertanyaan ujian yang diunggah oleh operator kemahasiswaan. Mohon tunggu informasi selanjutnya.
                          </div>
                        ) : (
                          <div className="pt-2 text-center">
                            <button
                              onClick={() => {
                                setExamStarted(true);
                                setCurrentQuestionIndex(0);
                                setSelectedAnswers({});
                              }}
                              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                            >
                              Mulai Ujian Sekarang
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Active quiz session */
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      {/* Active Quiz Header */}
                      <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-emerald-400 animate-pulse" />
                          <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">Sesi Ujian Aktif</span>
                        </div>
                        <span className="text-xs font-bold font-mono bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                          Soal {currentQuestionIndex + 1} dari {examQuestions.length}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1 bg-slate-100 w-full">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300" 
                          style={{ width: `${((currentQuestionIndex + 1) / examQuestions.length) * 100}%` }}
                        />
                      </div>

                      {/* Question Container */}
                      <div className="p-6 md:p-8 space-y-6">
                        {(() => {
                          const activeQ = examQuestions[currentQuestionIndex];
                          if (!activeQ) return null;

                          return (
                            <div className="space-y-6">
                              {/* Question display */}
                              <h3 className="font-serif font-bold text-sm md:text-base text-slate-950 leading-relaxed">
                                {activeQ.questionText}
                              </h3>

                              {/* Options Selector */}
                              <div className="space-y-3">
                                {activeQ.options.map((option, idx) => {
                                  const isSelected = selectedAnswers[activeQ.id] === idx;
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setSelectedAnswers(prev => ({
                                          ...prev,
                                          [activeQ.id]: idx
                                        }));
                                      }}
                                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                                        isSelected 
                                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-50' 
                                          : 'bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-700'
                                      }`}
                                    >
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                                        isSelected 
                                          ? 'bg-emerald-500 text-white' 
                                          : 'bg-slate-200 text-slate-600'
                                      }`}>
                                        {['A', 'B', 'C', 'D'][idx]}
                                      </span>
                                      <span className="text-xs leading-normal">{option}</span>
                                      {isSelected && <CheckCircle2 size={16} className="text-emerald-600 ml-auto shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Navigation controls */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
                          <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className={`px-4 py-2 border rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                              currentQuestionIndex === 0 
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed' 
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <ChevronLeft size={14} /> Sebelumnya
                          </button>

                          {currentQuestionIndex < examQuestions.length - 1 ? (
                            <button
                              onClick={() => {
                                // Validate if answered first
                                const activeQ = examQuestions[currentQuestionIndex];
                                if (selectedAnswers[activeQ.id] === undefined) {
                                  alert('Silakan pilih salah satu jawaban terlebih dahulu sebelum melanjutkan.');
                                  return;
                                }
                                setCurrentQuestionIndex(prev => prev + 1);
                              }}
                              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-all"
                            >
                              Selanjutnya <ChevronRight size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                // Validate if answered last question
                                const activeQ = examQuestions[currentQuestionIndex];
                                if (selectedAnswers[activeQ.id] === undefined) {
                                  alert('Silakan pilih salah satu jawaban terlebih dahulu.');
                                  return;
                                }

                                if (window.confirm('Apakah Anda yakin seluruh jawaban Anda sudah benar dan ingin menyelesaikan ujian ini?')) {
                                  // Compute score
                                  let correctCount = 0;
                                  examQuestions.forEach(q => {
                                    if (selectedAnswers[q.id] === q.correctOptionIndex) {
                                      correctCount++;
                                    }
                                  });
                                  const finalScore = Math.round((correctCount / examQuestions.length) * 100);

                                  const now = new Date();
                                  const formattedDate = `${now.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][now.getMonth()]} ${now.getFullYear()} pukul ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                                  const examResult = {
                                    score: finalScore,
                                    answers: selectedAnswers,
                                    completedAt: formattedDate
                                  };

                                  // Update student applicant info
                                  onUpdateStudent({
                                    ...student,
                                    examResult
                                  });

                                  // Log to history
                                  localDb.addLog(
                                    student.nama,
                                    `Menyelesaikan Ujian Seleksi KIP Kuliah dengan skor: ${finalScore}`,
                                    finalScore >= 60 ? 'success' : 'warning'
                                  );

                                  setExamStarted(false);
                                }
                              }}
                              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md transition-all animate-pulse"
                            >
                              Selesai & Kirim Ujian <Send size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500 no-print">
        <p>© {new Date().getFullYear()} STID Al-Biruni Babakan Ciwaringin. Hak Cipta Dilindungi.</p>
        <p className="text-[10px] text-slate-400 mt-1">Sistem Terintegrasi Layanan Kemahasiswaan & KIP-K</p>
      </footer>

    </div>
  );
}
