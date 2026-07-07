import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, LayoutDashboard, UserPlus, FileCheck, 
  LineChart, Coins, FileSpreadsheet, Mail, User, ShieldCheck, Landmark,
  Menu, X, Settings, Megaphone, BookOpen
} from 'lucide-react';
import { localDb } from './data/mockData';
import { StudentApplicant, Disbursement, AcademicProgress, ActivityLog, Announcement, ProgramStudi } from './types';

// Import sub-components
import DashboardOverview from './components/DashboardOverview';
import Pendaftaran from './components/Pendaftaran';
import Verifikasi from './components/Verifikasi';
import MonitoringAkademik from './components/MonitoringAkademik';
import PencairanBantuan from './components/PencairanBantuan';
import EvaluasiPelaporan from './components/EvaluasiPelaporan';
import StudentDetailModal from './components/StudentDetailModal';
import BrandingEditModal, { BrandingConfig } from './components/BrandingEditModal';
import Pengumuman from './components/Pengumuman';
import KelolaProdi from './components/KelolaProdi';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };
  
  // Branding States
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const saved = localStorage.getItem('kip_branding_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      abbreviation: 'KIP',
      bgColor: 'bg-emerald-500',
      title: 'STID Al-Biruni',
      subtitle: 'Portal Beasiswa'
    };
  });
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

  const handleSaveBranding = (newBranding: BrandingConfig) => {
    setBranding(newBranding);
    localStorage.setItem('kip_branding_config', JSON.stringify(newBranding));
    
    localDb.addLog(
      'Administrator',
      `Memperbarui branding & logo portal: ${newBranding.title} (${newBranding.abbreviation})`,
      'info'
    );
    setLogs(localDb.getLogs());
  };
  
  // Database States
  const [applicants, setApplicants] = useState<StudentApplicant[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [progressList, setProgressList] = useState<AcademicProgress[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [prodis, setProdis] = useState<ProgramStudi[]>([]);
  
  // Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentApplicant | null>(null);

  // Initialize DB from LocalStorage
  useEffect(() => {
    setApplicants(localDb.getApplicants());
    setDisbursements(localDb.getDisbursements());
    setProgressList(localDb.getAcademicProgress());
    setLogs(localDb.getLogs());
    setAnnouncements(localDb.getAnnouncements());
    setProdis(localDb.getProgramStudi());
  }, []);

  // Update localStorage when state updates
  const updateApplicantsState = (newApplicants: StudentApplicant[]) => {
    setApplicants(newApplicants);
    localDb.saveApplicants(newApplicants);
  };

  const updateDisdisbursementState = (newDisbursements: Disbursement[]) => {
    setDisbursements(newDisbursements);
    localDb.saveDisbursements(newDisbursements);
  };

  const updateProgressState = (newProgress: AcademicProgress[]) => {
    setProgressList(newProgress);
    localDb.saveAcademicProgress(newProgress);
  };

  const updateLogsState = (newLogs: ActivityLog[]) => {
    setLogs(newLogs);
    localDb.saveLogs(newLogs);
  };

  const updateAnnouncementsState = (newAnnouncements: Announcement[]) => {
    setAnnouncements(newAnnouncements);
    localDb.saveAnnouncements(newAnnouncements);
  };

  const updateProdisState = (newProdis: ProgramStudi[]) => {
    setProdis(newProdis);
    localDb.saveProgramStudi(newProdis);
  };

  // Program Studi Handlers
  const handleAddProdi = (newProdiData: Omit<ProgramStudi, 'id'>) => {
    const newProdi: ProgramStudi = {
      ...newProdiData,
      id: Math.random().toString(36).substr(2, 9)
    };
    const updated = [...prodis, newProdi];
    updateProdisState(updated);
    
    localDb.addLog(
      'Administrator',
      `Menambahkan Program Studi baru: "${newProdi.nama}" (${newProdi.kode})`,
      'success'
    );
    setLogs(localDb.getLogs());
    return true;
  };

  const handleUpdateProdi = (updatedProdi: ProgramStudi) => {
    const updated = prodis.map(p => p.id === updatedProdi.id ? updatedProdi : p);
    updateProdisState(updated);

    // Also update student data if the name changed!
    const oldProdi = prodis.find(p => p.id === updatedProdi.id);
    if (oldProdi && oldProdi.nama !== updatedProdi.nama) {
      const updatedApplicants = applicants.map(app => 
        app.prodi === oldProdi.nama ? { ...app, prodi: updatedProdi.nama } : app
      );
      updateApplicantsState(updatedApplicants);

      const updatedDisbursements = disbursements.map(disb => 
        disb.prodi === oldProdi.nama ? { ...disb, prodi: updatedProdi.nama } : disb
      );
      updateDisdisbursementState(updatedDisbursements);

      const updatedProgressList = progressList.map(prog => 
        prog.prodi === oldProdi.nama ? { ...prog, prodi: updatedProdi.nama } : prog
      );
      updateProgressState(updatedProgressList);
    }

    localDb.addLog(
      'Administrator',
      `Memperbarui Program Studi: "${updatedProdi.nama}" (${updatedProdi.kode})`,
      'info'
    );
    setLogs(localDb.getLogs());
  };

  const handleDeleteProdi = (id: string) => {
    const prodi = prodis.find(p => p.id === id);
    if (!prodi) return false;
    
    const updated = prodis.filter(p => p.id !== id);
    updateProdisState(updated);

    localDb.addLog(
      'Administrator',
      `Menghapus Program Studi: "${prodi.nama}"`,
      'danger'
    );
    setLogs(localDb.getLogs());
    return true;
  };

  // Announcement Handlers
  const handleAddAnnouncement = (newAnnData: Omit<Announcement, 'id' | 'date'>) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    
    const newAnn: Announcement = {
      ...newAnnData,
      id: Math.random().toString(36).substr(2, 9),
      date: formattedDate
    };

    const updated = [newAnn, ...announcements];
    updateAnnouncementsState(updated);

    localDb.addLog(
      'Administrator',
      `Menerbitkan pengumuman baru: "${newAnn.title}"`,
      'info'
    );
    setLogs(localDb.getLogs());
  };

  const handleUpdateAnnouncement = (updatedAnn: Announcement) => {
    const updated = announcements.map(ann => ann.id === updatedAnn.id ? updatedAnn : ann);
    updateAnnouncementsState(updated);

    localDb.addLog(
      'Administrator',
      `Memperbarui pengumuman beasiswa: "${updatedAnn.title}"`,
      'info'
    );
    setLogs(localDb.getLogs());
  };

  const handleDeleteAnnouncement = (id: string) => {
    const title = announcements.find(ann => ann.id === id)?.title || '';
    const updated = announcements.filter(ann => ann.id !== id);
    updateAnnouncementsState(updated);

    localDb.addLog(
      'Administrator',
      `Menghapus pengumuman beasiswa: "${title}"`,
      'danger'
    );
    setLogs(localDb.getLogs());
  };

  // CALLBACK: Add Applicant
  const handleAddApplicant = (newApplicant: StudentApplicant) => {
    const updated = [newApplicant, ...applicants];
    updateApplicantsState(updated);

    // If student was added with status accepted/diterima (e.g. legacy), pre-register disbursement
    if (newApplicant.status === 'Diterima') {
      registerDisbursementAndProgress(newApplicant);
    }

    const log = localDb.addLog(
      'Kemahasiswaan', 
      `Mendaftarkan calon penerima baru: ${newApplicant.nama} (${newApplicant.nim})`, 
      'info'
    );
    setLogs(localDb.getLogs());
  };

  // Helper: Auto provision disbursement schedules and academic progress cards
  const registerDisbursementAndProgress = (student: StudentApplicant) => {
    // 1. Disbursement schedule
    const currentDis = localDb.getDisbursements();
    const existsDis = currentDis.some(d => d.studentId === student.id);
    if (!existsDis) {
      const newDis: Disbursement = {
        id: 'd_' + student.id,
        studentId: student.id,
        studentNama: student.nama,
        studentNim: student.nim,
        prodi: student.prodi,
        semester: student.semester || 1,
        tahunAkademik: '2025/2026 Ganjil',
        nominalUkt: 2400000,
        nominalBiayaHidup: 5700000,
        statusUkt: 'Belum Proses',
        statusBiayaHidup: 'Belum Proses',
        bankPenerima: 'Bank Syariah Indonesia (BSI)',
        noRekening: '711' + student.nim
      };
      const updatedDis = [newDis, ...currentDis];
      updateDisdisbursementState(updatedDis);
    }

    // 2. Academic progress cards
    const currentProg = localDb.getAcademicProgress();
    const existsProg = currentProg.some(p => p.studentId === student.id);
    if (!existsProg) {
      const newProg: AcademicProgress = {
        id: 'p_' + student.id,
        studentId: student.id,
        studentNama: student.nama,
        studentNim: student.nim,
        prodi: student.prodi,
        semester: student.semester || 1,
        ips: 0.0,
        ipk: student.ipk || 0.0,
        kehadiran: 100,
        hafalanQuran: 'Belum terverifikasi',
        kegiatanDakwah: [],
        statusEvaluasi: 'Layak',
        catatanDosen: 'Menunggu perkembangan semester baru.'
      };
      const updatedProg = [newProg, ...currentProg];
      updateProgressState(updatedProg);
    }
  };

  // CALLBACK: Delete Applicant
  const handleDeleteApplicant = (id: string) => {
    const student = applicants.find(a => a.id === id);
    if (!student) return;

    const updated = applicants.filter(a => a.id !== id);
    updateApplicantsState(updated);

    // Also remove secondary records
    const updatedDis = disbursements.filter(d => d.studentId !== id);
    updateDisdisbursementState(updatedDis);

    const updatedProg = progressList.filter(p => p.studentId !== id);
    updateProgressState(updatedProg);

    localDb.addLog(
      'Kemahasiswaan', 
      `Menghapus seluruh berkas & data KIP atas nama: ${student.nama}`, 
      'danger'
    );
    setLogs(localDb.getLogs());
  };

  // CALLBACK: Update Student Core Information
  const handleUpdateStudent = (updatedStudent: StudentApplicant) => {
    const updated = applicants.map(app => {
      if (app.id === updatedStudent.id) {
        return updatedStudent;
      }
      return app;
    });
    updateApplicantsState(updated);

    // If selectedStudent is currently open, sync it
    if (selectedStudent && selectedStudent.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }

    // Sync sub-records: disbursements
    const updatedDis = disbursements.map(d => {
      if (d.studentId === updatedStudent.id) {
        return {
          ...d,
          studentNama: updatedStudent.nama,
          studentNim: updatedStudent.nim,
          prodi: updatedStudent.prodi,
          semester: updatedStudent.semester
        };
      }
      return d;
    });
    updateDisdisbursementState(updatedDis);

    // Sync sub-records: progress list
    const updatedProg = progressList.map(p => {
      if (p.studentId === updatedStudent.id) {
        return {
          ...p,
          studentNama: updatedStudent.nama,
          studentNim: updatedStudent.nim,
          prodi: updatedStudent.prodi,
          semester: updatedStudent.semester
        };
      }
      return p;
    });
    updateProgressState(updatedProg);

    localDb.addLog(
      'Kemahasiswaan',
      `Memperbarui profil pribadi mahasiswa: ${updatedStudent.nama} (NIM: ${updatedStudent.nim})`,
      'info'
    );
    setLogs(localDb.getLogs());
  };

  // CALLBACK: Selection Status & Grade Update
  const handleUpdateApplicantStatus = (
    id: string, 
    status: StudentApplicant['status'], 
    scores: StudentApplicant['skorKriteria'], 
    catatan: string
  ) => {
    const updated = applicants.map(student => {
      if (student.id === id) {
        const studentObj = { ...student, status, skorKriteria: scores, catatan };
        
        // If approved, trigger auto-registration for funds and performance cards
        if (status === 'Diterima') {
          registerDisbursementAndProgress(studentObj);
        }
        
        return studentObj;
      }
      return student;
    });

    updateApplicantsState(updated);

    localDb.addLog(
      'Komite Seleksi', 
      `Mengubah status ${applicants.find(a => a.id === id)?.nama} menjadi [${status}] dengan Nilai Kelayakan: ${scores.total}/100`, 
      status === 'Diterima' ? 'success' : status === 'Ditolak' ? 'danger' : 'warning'
    );
    setLogs(localDb.getLogs());
  };

  // CALLBACK: Update Academic Progress
  const handleUpdateProgress = (updatedProg: AcademicProgress, studentIpk: number) => {
    const updatedList = progressList.map(item => {
      if (item.id === updatedProg.id) {
        return updatedProg;
      }
      return item;
    });
    updateProgressState(updatedList);

    // Synchronize current Cumulative IPK inside Applicant core profile too
    const updatedApplicants = applicants.map(app => {
      if (app.id === updatedProg.studentId) {
        return { ...app, ipk: studentIpk };
      }
      return app;
    });
    updateApplicantsState(updatedApplicants);

    localDb.addLog(
      'Dosen Wali / Akademik', 
      `Memperbarui nilai akademik & kehadiran ${updatedProg.studentNama} (IPS: ${updatedProg.ips.toFixed(2)}, IPK: ${studentIpk.toFixed(2)})`, 
      updatedProg.ips < 3.0 ? 'warning' : 'success'
    );
    setLogs(localDb.getLogs());
  };

  // CALLBACK: Update Disbursement Details
  const handleUpdateDisbursement = (updated: Disbursement) => {
    const updatedList = disbursements.map(item => {
      if (item.id === updated.id) {
        return updated;
      }
      return item;
    });
    updateDisdisbursementState(updatedList);

    localDb.addLog(
      'Bagian Keuangan', 
      `Memperbarui status pencairan beasiswa ${updated.studentNama}. UKT: [${updated.statusUkt}] | Uang Saku: [${updated.statusBiayaHidup}]`, 
      'success'
    );
    setLogs(localDb.getLogs());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden relative">
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden no-print"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation (No print) */}
      <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 no-print border-r border-slate-800 fixed lg:static top-0 bottom-0 left-0 z-50 transition-transform duration-200 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 ${branding.bgColor} rounded flex items-center justify-center font-bold text-white text-xs shrink-0 transition-colors duration-300`}>
              {branding.abbreviation}
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold leading-none tracking-tight text-sm truncate flex items-center gap-1">
                {branding.title}
                <button
                  onClick={() => setIsBrandingModalOpen(true)}
                  className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-800 transition-colors shrink-0"
                  title="Edit Identitas Portal"
                >
                  <Settings size={12} />
                </button>
              </h1>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 block mt-1 truncate">{branding.subtitle}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0 ml-1"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`w-full px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} className={activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'} />
            Beranda Overview
          </button>

          <button
            onClick={() => handleTabClick('pendaftaran')}
            className={`w-full px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
              activeTab === 'pendaftaran'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserPlus size={16} className={activeTab === 'pendaftaran' ? 'text-emerald-400' : 'text-slate-400'} />
            Data Mahasiswa
          </button>

          <button
            onClick={() => handleTabClick('verifikasi')}
            className={`w-full px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
              activeTab === 'verifikasi'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileCheck size={16} className={activeTab === 'verifikasi' ? 'text-emerald-400' : 'text-slate-400'} />
            Verifikasi & Seleksi
          </button>

          <button
            onClick={() => handleTabClick('monitoring')}
            className={`w-full px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
              activeTab === 'monitoring'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LineChart size={16} className={activeTab === 'monitoring' ? 'text-emerald-400' : 'text-slate-400'} />
            Monev Akademik
          </button>

          <button
            onClick={() => handleTabClick('pencairan')}
            className={`w-full px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
              activeTab === 'pencairan'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Coins size={16} className={activeTab === 'pencairan' ? 'text-emerald-400' : 'text-slate-400'} />
            Status Pencairan
          </button>

          <button
            onClick={() => handleTabClick('evaluasi')}
            className={`w-full px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
              activeTab === 'evaluasi'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet size={16} className={activeTab === 'evaluasi' ? 'text-emerald-400' : 'text-slate-400'} />
            Evaluasi & Pelaporan
          </button>

          <button
            onClick={() => handleTabClick('pengumuman')}
            className={`w-full px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
              activeTab === 'pengumuman'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Megaphone size={16} className={activeTab === 'pengumuman' ? 'text-emerald-400' : 'text-slate-400'} />
            Papan Pengumuman
          </button>

          <button
            onClick={() => handleTabClick('prodi')}
            className={`w-full px-3 py-2 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
              activeTab === 'prodi'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen size={16} className={activeTab === 'prodi' ? 'text-emerald-400' : 'text-slate-400'} />
            Kelola Prodi
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
          <div>Portal KIP v1.0</div>
          <div>STID Al-Biruni Babakan</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header (No print) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mr-1"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="text-slate-400 text-xs hidden sm:inline">Beranda</span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-slate-800 text-xs font-semibold capitalize">
              {activeTab === 'dashboard' 
                ? 'Beranda Overview' 
                : activeTab === 'pendaftaran' 
                ? 'Data Mahasiswa'
                : activeTab === 'verifikasi'
                ? 'Verifikasi Berkas'
                : activeTab === 'pencairan'
                ? 'Status Pencairan'
                : activeTab === 'monitoring'
                ? 'Monev Akademik'
                : activeTab === 'pengumuman'
                ? 'Papan Pengumuman'
                : activeTab === 'prodi'
                ? 'Kelola Program Studi'
                : 'Evaluasi & Pelaporan'
              }
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 leading-none">Operator Kemahasiswaan</p>
              <p className="text-[10px] text-slate-500 mt-1">stid.cirebon@gmail.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
              OP
            </div>
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              applicants={applicants}
              disbursements={disbursements}
              progressList={progressList}
              logs={logs}
              announcements={announcements}
              prodis={prodis}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectStudent={(student) => setSelectedStudent(student)}
            />
          )}

          {activeTab === 'pendaftaran' && (
            <Pendaftaran 
              applicants={applicants}
              onAddApplicant={handleAddApplicant}
              onDeleteApplicant={handleDeleteApplicant}
              onSelectStudent={(student) => setSelectedStudent(student)}
              prodis={prodis}
            />
          )}

          {activeTab === 'verifikasi' && (
            <Verifikasi 
              applicants={applicants}
              onUpdateApplicantStatus={handleUpdateApplicantStatus}
            />
          )}

          {activeTab === 'monitoring' && (
            <MonitoringAkademik 
              applicants={applicants}
              progressList={progressList}
              onUpdateProgress={handleUpdateProgress}
              prodis={prodis}
            />
          )}

          {activeTab === 'pencairan' && (
            <PencairanBantuan 
              applicants={applicants}
              disbursements={disbursements}
              onUpdateDisbursement={handleUpdateDisbursement}
            />
          )}

          {activeTab === 'evaluasi' && (
            <EvaluasiPelaporan 
              applicants={applicants}
              disbursements={disbursements}
              progressList={progressList}
              prodis={prodis}
            />
          )}

          {activeTab === 'pengumuman' && (
            <Pengumuman 
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
              onUpdateAnnouncement={handleUpdateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {activeTab === 'prodi' && (
            <KelolaProdi 
              prodis={prodis}
              applicants={applicants}
              onAddProdi={handleAddProdi}
              onUpdateProdi={handleUpdateProdi}
              onDeleteProdi={handleDeleteProdi}
            />
          )}
        </div>

        {/* Footer copyright */}
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-[11px] text-slate-400 no-print shrink-0">
          <p>© 2026 STID Al-Biruni Babakan Ciwaringin Cirebon. All Rights Reserved.</p>
          <p className="mt-1 font-sans">Dikembangkan untuk Program Pengelolaan Beasiswa KIP Kuliah Kementerian Agama & Kemenristekdikti.</p>
        </footer>
      </div>

      {/* Shared Student Detail modal overlay */}
      {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdateStudent={handleUpdateStudent}
          prodis={prodis}
        />
      )}

      {/* Dynamic Branding edit modal */}
      <BrandingEditModal 
        branding={branding}
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        onSave={handleSaveBranding}
      />

    </div>
  );
}
