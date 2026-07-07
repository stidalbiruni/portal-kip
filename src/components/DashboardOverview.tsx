import React from 'react';
import { 
  Users, CheckCircle, AlertTriangle, DollarSign, 
  GraduationCap, Activity, ArrowUpRight, TrendingUp, BookOpen,
  Megaphone, Pin, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, AreaChart, Area, Cell, PieChart, Pie 
} from 'recharts';
import { StudentApplicant, Disbursement, AcademicProgress, ActivityLog, Announcement, ProgramStudi } from '../types';

interface DashboardOverviewProps {
  applicants: StudentApplicant[];
  disbursements: Disbursement[];
  progressList: AcademicProgress[];
  logs: ActivityLog[];
  announcements?: Announcement[];
  prodis?: ProgramStudi[];
  onNavigate: (tab: string) => void;
  onSelectStudent: (student: StudentApplicant) => void;
}

export default function DashboardOverview({
  applicants,
  disbursements,
  progressList,
  logs,
  announcements = [],
  prodis = [],
  onNavigate,
  onSelectStudent
}: DashboardOverviewProps) {
  // 1. Calculate Statistics
  const totalRegistered = applicants.length;
  const activeAwardees = applicants.filter(a => a.status === 'Diterima').length;
  const inVerification = applicants.filter(a => a.status === 'Verifikasi').length;
  const inRegistration = applicants.filter(a => a.status === 'Pendaftaran').length;
  
  // Financial metrics
  const totalAllocatedUkt = disbursements.reduce((acc, d) => acc + d.nominalUkt, 0);
  const totalAllocatedLiving = disbursements.reduce((acc, d) => acc + d.nominalBiayaHidup, 0);
  const totalAllocation = totalAllocatedUkt + totalAllocatedLiving;

  const totalDisbursedUkt = disbursements
    .filter(d => d.statusUkt === 'Cair')
    .reduce((acc, d) => acc + d.nominalUkt, 0);
  const totalDisbursedLiving = disbursements
    .filter(d => d.statusBiayaHidup === 'Cair')
    .reduce((acc, d) => acc + d.nominalBiayaHidup, 0);
  const totalDisbursed = totalDisbursedUkt + totalDisbursedLiving;

  // Academic alerts
  const alertsCount = progressList.filter(p => p.ipk < 3.0 || p.statusEvaluasi === 'Pembinaan').length;

  // Formatter for Currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 2. Data Preparation for Charts
  // GPA Chart Data
  const activeStudents = applicants.filter(a => a.status === 'Diterima');
  const gpaChartData = activeStudents.map(student => {
    const prog = progressList.find(p => p.studentId === student.id);
    return {
      nama: student.nama.split(' ')[0], // first name for chart
      IPK: student.ipk || 0,
      IPS: prog?.ips || 0,
    };
  });

  // Disbursement Chart Data (Status representation)
  const countStatus = (type: 'statusUkt' | 'statusBiayaHidup', status: string) => {
    return disbursements.filter(d => d[type] === status).length;
  };

  const disbursementChartData = [
    {
      kategori: 'UKT (Biaya Kuliah)',
      'Belum Proses': countStatus('statusUkt', 'Belum Proses'),
      'Diproses': countStatus('statusUkt', 'Diproses'),
      'Cair': countStatus('statusUkt', 'Cair'),
      'Ditunda': countStatus('statusUkt', 'Ditunda'),
    },
    {
      kategori: 'Biaya Hidup',
      'Belum Proses': countStatus('statusBiayaHidup', 'Belum Proses'),
      'Diproses': countStatus('statusBiayaHidup', 'Diproses'),
      'Cair': countStatus('statusBiayaHidup', 'Cair'),
      'Ditunda': countStatus('statusBiayaHidup', 'Ditunda'),
    },
  ];

  // Distribution of Program Studi
  const activeProdiList = prodis.length > 0 
    ? prodis 
    : [
        { id: '1', nama: 'Komunikasi Penyiaran Islam (KPI)', kode: 'KPI' },
        { id: '2', nama: 'Pengembangan Masyarakat Islam (PMI)', kode: 'PMI' }
      ];

  const prodiChartData = activeProdiList.map((p, idx) => {
    const count = activeStudents.filter(student => student.prodi === p.nama).length;
    return {
      name: p.kode,
      fullName: p.nama,
      value: count,
      color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'][idx % 7]
    };
  });

  const pieChartData = prodiChartData.filter(item => item.value > 0);

  // Identify high-risk students
  const riskStudents = activeStudents.filter(student => {
    const prog = progressList.find(p => p.studentId === student.id);
    return student.ipk < 3.0 || prog?.statusEvaluasi === 'Pembinaan' || (prog?.kehadiran ?? 100) < 85;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-xl p-6 text-slate-300 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4 translate-x-4">
          <GraduationCap size={240} className="text-slate-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            TAHUN AJARAN 2025/2026
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-white">Portal Pengelolaan Beasiswa KIP Kuliah</h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Selamat datang di Sistem Terintegrasi Beasiswa KIP Kuliah Sekolah Tinggi Ilmu Dakwah (STID) Al-Biruni Babakan Ciwaringin Cirebon. 
            Kelola pendaftaran, verifikasi kelayakan, pantau progress akademik, serta koordinasikan penyaluran dana beasiswa secara transparan dan akuntabel.
          </p>
        </div>
      </div>

      {/* Pinned Announcement Alert Banner */}
      {announcements && announcements.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
              <Megaphone size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                  <Pin size={9} className="fill-amber-700 text-amber-700" /> PENGUMUMAN UTAMA
                </span>
                <span className="text-[10px] text-amber-600 font-semibold">{announcements.filter(a => a.isPinned)[0]?.date || announcements[0]?.date}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                {announcements.filter(a => a.isPinned)[0]?.title || announcements[0]?.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {announcements.filter(a => a.isPinned)[0]?.content || announcements[0]?.content}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('pengumuman')}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 px-3 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg shrink-0 self-start md:self-center transition-colors"
          >
            Buka Papan Pengumuman
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Penerima Aktif */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Penerima Aktif KIP</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900 mt-1">{activeAwardees}</h3>
              <p className="text-xs text-slate-400 mt-1">Mahasiswa Terbantu</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('pendaftaran')}
            className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-medium hover:text-emerald-700 hover:underline transition-colors"
          >
            Lihat daftar mahasiswa
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Card 2: Tahap Seleksi */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pendaftar & Verifikasi</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900 mt-1">{inRegistration + inVerification}</h3>
              <p className="text-xs text-slate-500 mt-1">
                <span className="text-amber-500 font-semibold">{inVerification}</span> Butuh Verifikasi
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('verifikasi')}
            className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-medium hover:text-amber-700 hover:underline transition-colors"
          >
            Mulai seleksi berkas
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Card 3: Realisasi Pencairan */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Dana Cair</p>
              <h3 className="text-xl font-bold font-sans text-slate-900 mt-1.5">{formatRupiah(totalDisbursed)}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Realisasi: {Math.round((totalDisbursed / (totalAllocation || 1)) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('pencairan')}
            className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
          >
            Kelola pencairan dana
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Card 4: Alerts Akademik */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Perlu Pembinaan</p>
              <h3 className={`text-2xl font-bold font-sans mt-1 ${alertsCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{alertsCount}</h3>
              <p className="text-xs text-slate-500 mt-1">Evaluasi akademik & presensi</p>
            </div>
            <div className={`p-3 rounded-lg ${alertsCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('monitoring')}
            className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium hover:text-slate-700 hover:underline transition-colors"
          >
            Cek evaluasi akademik
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: GPA Area Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 font-sans">Perbandingan IPK vs IPS Penerima KIP</h3>
              <p className="text-xs text-slate-400">Memantau konsistensi nilai akademik mahasiswa penerima beasiswa (Standar IPK &gt;= 3.00)</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded text-xs text-slate-600">
              <TrendingUp size={14} className="text-emerald-600" />
              Rata-rata IPK: 3.55
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gpaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIpk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="nama" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[2.0, 4.0]} stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="IPK" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIpk)" />
                <Area type="monotone" dataKey="IPS" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorIps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Program Studi Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 font-sans">Proporsi per Program Studi</h3>
            <p className="text-xs text-slate-400 mb-4">Distribusi mahasiswa aktif KIP Kuliah di STID Al-Biruni</p>
          </div>
          <div className="h-44 relative flex items-center justify-center">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} Mahasiswa`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">Tidak ada data mahasiswa aktif</div>
            )}
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-800">{activeAwardees}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Total Aktif</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
            {prodiChartData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-600" title={entry.fullName}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="font-medium truncate max-w-[160px]">{entry.name}</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {entry.value} mhs ({activeAwardees > 0 ? Math.round((entry.value / activeAwardees) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Financial Disbursement Flow */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 font-sans">Status Pencairan Dana Beasiswa</h3>
              <p className="text-xs text-slate-400">Pencairan UKT (Universitas) & Biaya Hidup (Mahasiswa) Semester ini</p>
            </div>
            <button 
              onClick={() => onNavigate('pencairan')}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Kelola Pencairan
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disbursementChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="kategori" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' }}
                />
                <Legend iconType="rect" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Belum Proses" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Diproses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cair" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ditunda" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Urgent Academic Alerts Widget */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} />
              <h3 className="font-semibold text-slate-800 font-sans text-sm">Peringatan Akademik & Bimbingan</h3>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {riskStudents.length} Mahasiswa
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-56 space-y-3 pr-1">
            {riskStudents.length > 0 ? (
              riskStudents.map((student) => {
                const prog = progressList.find(p => p.studentId === student.id);
                return (
                  <div key={student.id} className="p-3 bg-red-50/50 rounded-lg border border-red-100 flex flex-col gap-1.5 hover:bg-red-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{student.nama}</h4>
                        <p className="text-[10px] text-slate-500">{student.nim} • {student.prodi.split(' (')[1]?.replace(')', '') || student.prodi}</p>
                      </div>
                      <span className="bg-red-100 text-red-800 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                        IPK: {student.ipk}
                      </span>
                    </div>
                    
                    {prog && (
                      <div className="grid grid-cols-2 gap-2 text-[10px] mt-1 border-t border-red-100/50 pt-1.5 text-slate-600">
                        <div>
                          <span className="font-medium text-slate-400">Kehadiran:</span> {prog.kehadiran}%
                        </div>
                        <div>
                          <span className="font-medium text-slate-400">Keterangan:</span> {prog.statusEvaluasi}
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        onNavigate('monitoring');
                      }}
                      className="text-left text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5 mt-1"
                    >
                      Buka Pembinaan Akademik &rarr;
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-8 text-slate-400 space-y-2">
                <CheckCircle className="text-emerald-500" size={32} />
                <p className="text-xs font-semibold text-slate-700">Akademik Terjaga</p>
                <p className="text-[10px]">Semua penerima beasiswa mempertahankan IPK &gt;= 3.00 semester ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs & Quick Portal Help */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portal Information Guideline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen size={16} className="text-emerald-600" />
              Pedoman KIP Kuliah STID Al-Biruni
            </h4>
            <p className="text-xs text-slate-650 leading-relaxed">
              Mahasiswa penerima KIP Kuliah di Sekolah Tinggi Ilmu Dakwah Al-Biruni Babakan Ciwaringin Cirebon memiliki tanggung jawab moral dan akademik:
            </p>
            <ul className="text-[11px] space-y-1.5 text-slate-700 list-disc list-inside">
              <li>Mempertahankan Indeks Prestasi Kumulatif (IPK) minimal <strong className="text-slate-900">3.00</strong> setiap semester.</li>
              <li>Kehadiran perkuliahan minimal <strong className="text-slate-900">85%</strong>.</li>
              <li>Aktif berpartisipasi dalam program pengabdian dakwah masyarakat di wilayah Ciwaringin.</li>
              <li>Menyelesaikan setoran hafalan Al-Quran minimal Juz 30.</li>
            </ul>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[10px] text-slate-600 font-medium">
            💡 <strong>Rekomendasi Rektorat:</strong> Berikan sanksi pembinaan bertahap bagi mahasiswa dengan IPK di bawah 3.00 sebelum penangguhan bantuan.
          </div>
        </div>

        {/* System Activity Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-slate-500 animate-spin-slow" />
              <h3 className="font-semibold text-slate-800 font-sans text-sm">Log Aktivitas Portal Terkini</h3>
            </div>
            <span className="text-[10px] text-slate-400">Terakhir diperbarui: Hari ini</span>
          </div>
          
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  log.tipe === 'success' ? 'bg-emerald-500' :
                  log.tipe === 'warning' ? 'bg-amber-500' :
                  log.tipe === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                }`}></span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-snug">
                    <span className="font-semibold text-slate-900">{log.user}:</span> {log.aktivitas}
                  </p>
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
