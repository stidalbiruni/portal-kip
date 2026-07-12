import React, { useState } from 'react';
import { 
  GraduationCap, AlertTriangle, CheckCircle2, Search, Filter, 
  BookOpen, Heart, Save, Calendar, ShieldAlert, Award, ArrowUpRight 
} from 'lucide-react';
import { StudentApplicant, AcademicProgress, ProgramStudi } from '../types';

interface MonitoringAkademikProps {
  applicants: StudentApplicant[];
  progressList: AcademicProgress[];
  onUpdateProgress: (updatedProgress: AcademicProgress, studentIpk: number) => void;
  prodis?: ProgramStudi[];
}

export default function MonitoringAkademik({
  applicants,
  progressList,
  onUpdateProgress,
  prodis = []
}: MonitoringAkademikProps) {
  // Only monitor students who have status 'Diterima' or 'Pengganti' (active awardees)
  const activeStudents = applicants.filter(student => student.status === 'Diterima' || student.status === 'Pengganti');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('Semua');
  const [selectedEvaluasi, setSelectedEvaluasi] = useState('Semua');

  // Selected student for editing/viewing details
  const [editingProgress, setEditingProgress] = useState<AcademicProgress | null>(null);
  const [editingStudentIpk, setEditingStudentIpk] = useState<number>(0);

  // Form states
  const [ipsInput, setIpsInput] = useState<string>('');
  const [ipkInput, setIpkInput] = useState<string>('');
  const [kehadiranInput, setKehadiranInput] = useState<number>(100);
  const [hafalanInput, setHafalanInput] = useState<string>('');
  const [kegiatanInput, setKegiatanInput] = useState<string>('');
  const [statusEvaluasi, setStatusEvaluasi] = useState<AcademicProgress['statusEvaluasi']>('Layak');
  const [catatanDosen, setCatatanDosen] = useState<string>('');

  const prodiOptions = [
    'Semua',
    ...prodis.map(p => p.nama)
  ];

  // Filtering Logic
  const filteredProgress = progressList.filter(prog => {
    // Make sure student is still active
    const isActive = activeStudents.some(s => s.id === prog.studentId);
    if (!isActive) return false;

    const student = activeStudents.find(s => s.id === prog.studentId);
    const matchesSearch = prog.studentNama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prog.studentNim.includes(searchQuery);
    const matchesProdi = selectedProdi === 'Semua' || prog.prodi === selectedProdi;
    const matchesEvaluasi = selectedEvaluasi === 'Semua' || prog.statusEvaluasi === selectedEvaluasi;

    return matchesSearch && matchesProdi && matchesEvaluasi;
  });

  // Handle Edit click
  const handleStartEdit = (prog: AcademicProgress) => {
    setEditingProgress(prog);
    const student = activeStudents.find(s => s.id === prog.studentId);
    setEditingStudentIpk(student?.ipk || prog.ipk);
    
    setIpsInput(prog.ips.toString());
    setIpkInput(student?.ipk.toString() || prog.ipk.toString());
    setKehadiranInput(prog.kehadiran);
    setHafalanInput(prog.hafalanQuran);
    setKegiatanInput(prog.kegiatanDakwah.join('\n'));
    setStatusEvaluasi(prog.statusEvaluasi);
    setCatatanDosen(prog.catatanDosen);
  };

  // Handle Save
  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgress) return;

    const updatedIps = parseFloat(ipsInput) || 0.0;
    const updatedIpk = parseFloat(ipkInput) || 0.0;

    const parsedKegiatan = kegiatanInput
      .split('\n')
      .map(k => k.trim())
      .filter(k => k !== '');

    // If GPA < 3.0, auto flag as Pembinaan unless overridden
    let finalEvaluasi = statusEvaluasi;
    if (updatedIpk < 3.0 && statusEvaluasi === 'Layak') {
      finalEvaluasi = 'Pembinaan';
    }

    const updatedObj: AcademicProgress = {
      ...editingProgress,
      ips: updatedIps,
      ipk: updatedIpk, // match the student cumulative
      kehadiran: kehadiranInput,
      hafalanQuran: hafalanInput,
      kegiatanDakwah: parsedKegiatan,
      statusEvaluasi: finalEvaluasi,
      catatanDosen: catatanDosen
    };

    onUpdateProgress(updatedObj, updatedIpk);
    setEditingProgress(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="text-emerald-700" size={24} />
            Monitoring Prestasi & Kegiatan Dakwah Mahasiswa KIP
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau keberlanjutan beasiswa KIP Kuliah semesteran. Pastikan indeks prestasi, kehadiran perkuliahan, hafalan Quran, dan kegiatan syiar dakwah memenuhi standar kampus STID Al-Biruni.
          </p>
        </div>
        
        {/* Info standards badge */}
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 font-medium self-start md:self-auto shrink-0">
          📌 <strong>Syarat Minimum:</strong> IPK &ge; 3.00 | Presensi &ge; 85%
        </div>
      </div>

      {/* Editor Modal / Form overlay */}
      {editingProgress && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-2xl w-full overflow-hidden">
            <div className="bg-emerald-900 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm">Perbarui Status Akademik & Dakwah</h3>
                <p className="text-[10px] text-emerald-200">Mahasiswa: {editingProgress.studentNama} ({editingProgress.studentNim})</p>
              </div>
              <button 
                onClick={() => setEditingProgress(null)}
                className="text-emerald-100 hover:text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">IPS (Semester Ini)</label>
                  <input 
                    type="number" step="0.01" min="0" max="4" required
                    value={ipsInput}
                    onChange={e => setIpsInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">IPK (Kumulatif)</label>
                  <input 
                    type="number" step="0.01" min="0" max="4" required
                    value={ipkInput}
                    onChange={e => setIpkInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kehadiran (%)</label>
                  <input 
                    type="number" min="0" max="100" required
                    value={kehadiranInput}
                    onChange={e => setKehadiranInput(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rekomendasi Status</label>
                  <select
                    value={statusEvaluasi}
                    onChange={e => setStatusEvaluasi(e.target.value as AcademicProgress['statusEvaluasi'])}
                    className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                  >
                    <option value="Layak">Layak</option>
                    <option value="Pembinaan">Pembinaan</option>
                    <option value="Ditangguhkan">Ditangguhkan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Perkembangan Setoran Quran</label>
                  <input 
                    type="text" 
                    value={hafalanInput}
                    onChange={e => setHafalanInput(e.target.value)}
                    placeholder="Contoh: Juz 30 Selesai, Setoran Juz 1 Surat Al-Baqarah"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kegiatan Syiar Dakwah & Organisasi (Per baris)</label>
                  <textarea 
                    rows={3}
                    value={kegiatanInput}
                    onChange={e => setKegiatanInput(e.target.value)}
                    placeholder="Contoh:&#10;Khatib Masjid Babakan&#10;Pengurus Lembaga Dakwah Kampus"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Evaluasi / Catatan Khusus Pembimbing Akademik</label>
                <textarea 
                  rows={2}
                  value={catatanDosen}
                  onChange={e => setCatatanDosen(e.target.value)}
                  placeholder="Catatan perkembangan belajar, motivasi, atau kedisplinan..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                />
              </div>

              <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-3 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProgress(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-850 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Save size={14} />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database Controls */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input 
              type="text"
              placeholder="Cari penerima beasiswa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Prodi */}
            <select
              value={selectedProdi}
              onChange={e => setSelectedProdi(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none w-full sm:w-auto font-medium text-slate-750"
            >
              {prodiOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt === 'Semua' ? 'Semua Prodi' : opt.split(' (')[1]?.replace(')', '') || opt}</option>
              ))}
            </select>

            {/* Status evaluasi */}
            <select
              value={selectedEvaluasi}
              onChange={e => setSelectedEvaluasi(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none w-full sm:w-auto font-medium text-slate-750"
            >
              <option value="Semua">Semua Evaluasi</option>
              <option value="Layak">Status Layak</option>
              <option value="Pembinaan">Status Pembinaan</option>
              <option value="Ditangguhkan">Status Ditangguhkan</option>
            </select>
          </div>
        </div>

        {/* Performance Table */}
        {filteredProgress.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-5">Mahasiswa</th>
                  <th className="py-3.5 px-4 text-center">Semester</th>
                  <th className="py-3.5 px-4 text-center">IPS</th>
                  <th className="py-3.5 px-4 text-center">IPK</th>
                  <th className="py-3.5 px-4 text-center">Presensi</th>
                  <th className="py-3.5 px-4">Perkembangan Tahfidz</th>
                  <th className="py-3.5 px-4 text-center">Status Kelayakan</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProgress.map((prog) => {
                  const hasGpaWarning = prog.ipk < 3.0;
                  const hasAttendanceWarning = prog.kehadiran < 85;
                  
                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & NIM */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">{prog.studentNama}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{prog.studentNim} • {prog.prodi.split(' (')[1]?.replace(')', '') || prog.prodi}</div>
                      </td>
                      {/* Semester */}
                      <td className="py-4 px-4 text-center font-medium text-slate-700">
                        Semester {prog.semester}
                      </td>
                      {/* IPS */}
                      <td className="py-4 px-4 text-center font-medium text-slate-800">
                        {prog.ips.toFixed(2)}
                      </td>
                      {/* IPK with status warning */}
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                          hasGpaWarning 
                            ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
                            : 'text-slate-900'
                        }`}>
                          {prog.ipk.toFixed(2)}
                        </span>
                      </td>
                      {/* Attendance % */}
                      <td className="py-4 px-4 text-center">
                        <span className={`font-semibold ${
                          hasAttendanceWarning ? 'text-red-600 font-bold' : 'text-slate-800'
                        }`}>
                          {prog.kehadiran}%
                        </span>
                      </td>
                      {/* Hafalan Quran Summary */}
                      <td className="py-4 px-4 text-slate-600 max-w-[200px] truncate" title={prog.hafalanQuran}>
                        <div className="flex items-center gap-1">
                          <BookOpen size={13} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{prog.hafalanQuran || 'Belum diisi'}</span>
                        </div>
                      </td>
                      {/* Evaluation Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          prog.statusEvaluasi === 'Layak' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          prog.statusEvaluasi === 'Pembinaan' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {prog.statusEvaluasi === 'Layak' && <CheckCircle2 size={12} />}
                          {prog.statusEvaluasi === 'Pembinaan' && <AlertTriangle size={12} />}
                          {prog.statusEvaluasi === 'Ditangguhkan' && <ShieldAlert size={12} />}
                          {prog.statusEvaluasi}
                        </span>
                      </td>
                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleStartEdit(prog)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                        >
                          Perbarui Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <AlertTriangle size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700 text-sm">Tidak ada data evaluasi akademik</p>
            <p className="text-xs mt-1">Gunakan kotak pencarian atau pastikan telah ada mahasiswa dengan status Diterima atau Pengganti.</p>
          </div>
        )}
      </div>
    </div>
  );
}
