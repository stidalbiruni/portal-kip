import React, { useState } from 'react';
import { 
  ShieldCheck, AlertCircle, TrendingUp, DollarSign, 
  Award, HelpCircle, CheckCircle, XCircle, Sliders, Save,
  UserCheck
} from 'lucide-react';
import { StudentApplicant } from '../types';

interface VerifikasiProps {
  applicants: StudentApplicant[];
  onUpdateApplicantStatus: (
    id: string, 
    status: StudentApplicant['status'], 
    scores: StudentApplicant['skorKriteria'], 
    catatan: string
  ) => void;
}

export default function Verifikasi({
  applicants,
  onUpdateApplicantStatus
}: VerifikasiProps) {
  // We filter to students in 'Pendaftaran' or 'Verifikasi' or 'Cadangan' (pending review)
  const pendingApplicants = applicants.filter(
    app => app.status === 'Pendaftaran' || app.status === 'Verifikasi' || app.status === 'Cadangan'
  );

  // Selected student for active scoring
  const [activeStudentId, setActiveStudentId] = useState<string>(
    pendingApplicants[0]?.id || ''
  );

  // Active scoring values
  const activeStudent = applicants.find(app => app.id === activeStudentId);
  
  const [scoreEkonomi, setScoreEkonomi] = useState<number>(activeStudent?.skorKriteria.ekonomi || 70);
  const [scoreAkademik, setScoreAkademik] = useState<number>(activeStudent?.skorKriteria.akademik || 70);
  const [scoreWawancara, setScoreWawancara] = useState<number>(activeStudent?.skorKriteria.wawancara || 70);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState<string>(activeStudent?.catatan || '');

  // Synchronize when active student changes
  React.useEffect(() => {
    if (activeStudent) {
      setScoreEkonomi(activeStudent.skorKriteria.ekonomi);
      setScoreAkademik(activeStudent.skorKriteria.akademik);
      setScoreWawancara(activeStudent.skorKriteria.wawancara);
      setCatatanVerifikasi(activeStudent.catatan);
    }
  }, [activeStudentId, applicants]);

  // Calculate Weighted Total
  // Weight: Ekonomi = 40%, Akademik = 30%, Wawancara = 30%
  const totalScore = Math.round((scoreEkonomi * 0.4) + (scoreAkademik * 0.3) + (scoreWawancara * 0.3));

  const handleUpdateStatus = (status: StudentApplicant['status']) => {
    if (!activeStudentId) return;
    
    const updatedScores = {
      ekonomi: scoreEkonomi,
      akademik: scoreAkademik,
      wawancara: scoreWawancara,
      total: totalScore
    };

    onUpdateApplicantStatus(activeStudentId, status, updatedScores, catatanVerifikasi);
    
    // Select the next student in the list if available
    const currentIndex = pendingApplicants.findIndex(a => a.id === activeStudentId);
    const nextApplicants = pendingApplicants.filter(a => a.id !== activeStudentId);
    if (nextApplicants.length > 0) {
      const nextIndex = currentIndex < nextApplicants.length ? currentIndex : nextApplicants.length - 1;
      setActiveStudentId(nextApplicants[nextIndex].id);
    } else {
      setActiveStudentId('');
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Banner info */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="text-emerald-700" size={24} />
          Panel Verifikasi, Seleksi & Kelayakan Beasiswa KIP-K
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review pendaftar beasiswa KIP Kuliah. Nilai kelayakan berdasarkan prioritas ekonomi (Bobot 40%), capaian akademik (Bobot 30%), serta hasil interview komitmen dakwah (Bobot 30%).
        </p>
      </div>

      {pendingApplicants.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of pending applicants */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Antrean Pendaftar Menunggu Seleksi ({pendingApplicants.length})
            </div>
            
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {pendingApplicants.map((student) => {
                const isSelected = student.id === activeStudentId;
                const docCount = Object.values(student.berkas).filter(Boolean).length;
                
                return (
                  <button
                    key={student.id}
                    onClick={() => setActiveStudentId(student.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isSelected 
                        ? 'bg-emerald-50/50 border-l-4 border-emerald-700' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {student.nama.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 truncate block text-xs">{student.nama}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          student.status === 'Verifikasi' ? 'bg-amber-100 text-amber-800' :
                          student.status === 'Cadangan' ? 'bg-slate-100 text-slate-600' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{student.nim} • {student.prodi.split(' (')[1]?.replace(')', '') || student.prodi}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                        <span>Penghasilan: <strong className="text-slate-800">{formatRupiah(student.penghasilanOrtu)}</strong></span>
                        <span>• Berkas: <strong className="text-slate-800">{docCount}/5</strong></span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Columns: Active Scoring & Decision Wizard */}
          <div className="lg:col-span-2 space-y-6">
            {activeStudent ? (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header info */}
                <div className="p-5 border-b border-slate-100 bg-emerald-850 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-base">{activeStudent.nama}</h3>
                    <p className="text-xs text-emerald-100 mt-0.5">NIM: {activeStudent.nim} • Program Studi: {activeStudent.prodi}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-800/50 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                    <Sliders size={14} className="text-emerald-300" />
                    <span className="text-xs font-semibold">Skor Total: </span>
                    <strong className="text-sm text-yellow-400">{totalScore}/100</strong>
                  </div>
                </div>

                {/* Score adjusting sliders */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left details review */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Informasi Pendukung Calon</h4>
                      
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Orang Tua / Wali:</span>
                          <span className="font-semibold text-slate-800">{activeStudent.pekerjaanAyah} / {activeStudent.pekerjaanIbu}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Pendapatan Bulanan:</span>
                          <span className="font-semibold text-red-600">{formatRupiah(activeStudent.penghasilanOrtu)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tanggungan Keluarga:</span>
                          <span className="font-semibold text-slate-800">{activeStudent.jumlahTanggungan} Jiwa</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Alamat Rumah:</span>
                          <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate" title={activeStudent.alamat}>
                            {activeStudent.alamat}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Prestasi Terdaftar:</span>
                          <span className="font-semibold text-emerald-700">{activeStudent.prestasi.length} Prestasi</span>
                        </div>
                      </div>

                      {activeStudent.prestasi.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prestasi yang Dilampirkan:</p>
                          <ul className="space-y-1 text-[10px] text-slate-700 list-disc list-inside">
                            {activeStudent.prestasi.map((p, i) => (
                              <li key={i} className="truncate">{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Sliders for verification */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Penilaian Parameter Seleksi</h4>
                      
                      {/* Sliders 1: Ekonomi */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600">Ekonomi (Mampu &gt; Sulit)</span>
                          <span className="font-bold text-slate-800">{scoreEkonomi}/100</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={scoreEkonomi}
                          onChange={e => setScoreEkonomi(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                        />
                        <p className="text-[10px] text-slate-400">Skor tinggi untuk keluarga prasejahtera, yatim, atau rumah tinggal memprihatinkan.</p>
                      </div>

                      {/* Sliders 2: Akademik */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600">Nilai Rapor / Akademik</span>
                          <span className="font-bold text-slate-800">{scoreAkademik}/100</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={scoreAkademik}
                          onChange={e => setScoreAkademik(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                        />
                        <p className="text-[10px] text-slate-400">Skor tinggi untuk nilai rapor, prestasi kompetisi, tahfidz Quran, dsb.</p>
                      </div>

                      {/* Sliders 3: Wawancara */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600">Hasil Wawancara & Komitmen Dakwah</span>
                          <span className="font-bold text-slate-800">{scoreWawancara}/100</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={scoreWawancara}
                          onChange={e => setScoreWawancara(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                        />
                        <p className="text-[10px] text-slate-400">Skor tinggi untuk kematangan sikap, kesiapan berdakwah, pengabdian pesantren.</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes update */}
                  <div className="space-y-1.5 mt-4">
                    <label className="block text-xs font-semibold text-slate-700">Catatan Rekomendasi Seleksi & Kelayakan Beasiswa</label>
                    <textarea 
                      rows={2.5}
                      value={catatanVerifikasi}
                      onChange={e => setCatatanVerifikasi(e.target.value)}
                      placeholder="Tuliskan justifikasi komite di sini..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Status Decision Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Bobot Kelayakan: Ekonomi (40%), Akademik (30%), Wawancara (30%)
                  </span>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => handleUpdateStatus('Ditolak')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <XCircle size={14} />
                      Tolak
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Cadangan')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <AlertCircle size={14} />
                      Cadangan
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Pengganti')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <UserCheck size={14} />
                      Setujui (Pengganti)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Diterima')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                    >
                      <CheckCircle size={14} />
                      Setujui (Diterima)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400">
                <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-slate-700 text-sm">Pilih Calon Penerima</p>
                <p className="text-xs mt-1">Pilih pendaftar dari antrean sebelah kiri untuk dinilai atau diuji kelayakannya.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400 shadow-sm">
          <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4 animate-bounce" />
          <p className="font-bold text-slate-800 text-base">Antrean Seleksi Kosong!</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Semua berkas pendaftaran calon penerima beasiswa KIP Kuliah STID Al-Biruni Babakan Ciwaringin telah diproses dan diputuskan status kelayakannya.
          </p>
        </div>
      )}
    </div>
  );
}
