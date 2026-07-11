import React, { useState, useRef } from 'react';
import { 
  FileText, Printer, CheckCircle, AlertTriangle, 
  Download, Send, Settings, BookOpen, Award, Check,
  Upload, Trash2, Image
} from 'lucide-react';
import { StudentApplicant, Disbursement, AcademicProgress, ProgramStudi, LetterheadConfig } from '../types';
import { localDb } from '../data/mockData';

interface EvaluasiPelaporanProps {
  applicants: StudentApplicant[];
  disbursements: Disbursement[];
  progressList: AcademicProgress[];
  prodis?: ProgramStudi[];
}

export default function EvaluasiPelaporan({
  applicants,
  disbursements,
  progressList,
  prodis = []
}: EvaluasiPelaporanProps) {
  const activeStudents = applicants.filter(s => s.status === 'Diterima');

  const [selectedProdi, setSelectedProdi] = useState('Semua');
  const [tahunAkademik, setTahunAkademik] = useState('2025/2026');
  const [semesterGanjilGenap, setSemesterGanjilGenap] = useState('Ganjil');
  
  // Custom official notes for the print report
  const [officialNote, setOfficialNote] = useState(
    'Berdasarkan hasil monitoring dan evaluasi komite beasiswa STID Al-Biruni Babakan Ciwaringin Cirebon, mayoritas mahasiswa penerima KIP Kuliah mempertahankan prestasi akademik di atas standar minimum (IPK >= 3.00) dan aktif berkontribusi dalam program pembinaan dakwah masyarakat. Terhadap mahasiswa yang memiliki kendala prestasi, telah dijadwalkan pembinaan intensif khusus.'
  );
  
  const [pejabatNama, setPejabatNama] = useState('H. Ahmad Syarifuddin, M.A.');
  const [pejabatJabatan, setPejabatJabatan] = useState('Wakil Ketua III Bidang Kemahasiswaan');

  // Letterhead custom states
  const [showKopSettings, setShowKopSettings] = useState(false);
  const [letterhead, setLetterhead] = useState<LetterheadConfig>(() => localDb.getLetterhead());

  const handleUpdateLetterhead = (field: keyof LetterheadConfig, value: string) => {
    const updated = { ...letterhead, [field]: value };
    setLetterhead(updated);
    localDb.saveLetterhead(updated);
  };


  // Filter student progress based on selected prodi
  const filteredActiveStudents = activeStudents.filter(s => {
    return selectedProdi === 'Semua' || s.prodi === selectedProdi;
  });

  // Calculate stats for the selected prodi subset
  const subsetCount = filteredActiveStudents.length;
  const avgGpa = subsetCount > 0 
    ? filteredActiveStudents.reduce((acc, s) => acc + s.ipk, 0) / subsetCount 
    : 0;

  const bimbinganCount = filteredActiveStudents.filter(s => {
    const prog = progressList.find(p => p.studentId === s.id);
    return s.ipk < 3.0 || prog?.statusEvaluasi === 'Pembinaan';
  }).length;

  const totalFundsUkt = disbursements
    .filter(d => filteredActiveStudents.some(s => s.id === d.studentId))
    .reduce((acc, d) => acc + d.nominalUkt, 0);

  const totalFundsBiayaHidup = disbursements
    .filter(d => filteredActiveStudents.some(s => s.id === d.studentId))
    .reduce((acc, d) => acc + d.nominalBiayaHidup, 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Settings and configuration */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm no-print">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-emerald-700" size={24} />
              Evaluasi Akhir & Pelaporan Beasiswa KIP Kuliah
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Konfigurasikan laporan resmi penerimaan KIP Kuliah untuk keperluan pelaporan ke LLDIKTI / Kopertais dan jajaran Rektorat STID Al-Biruni.
            </p>
          </div>
          
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all self-start md:self-auto"
          >
            <Printer size={15} />
            Cetak Dokumen Laporan
          </button>
        </div>

        {/* Configuration settings form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-150">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter Program Studi</label>
            <select
              value={selectedProdi}
              onChange={e => setSelectedProdi(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-slate-50 font-semibold"
            >
              <option value="Semua">Semua Program Studi</option>
              {prodis.map(p => (
                <option key={p.id} value={p.nama}>{p.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tahun Akademik</label>
            <input 
              type="text"
              value={tahunAkademik}
              onChange={e => setTahunAkademik(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-slate-50 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Semester Pelaporan</label>
            <select
              value={semesterGanjilGenap}
              onChange={e => setSemesterGanjilGenap(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-slate-50 font-semibold"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Penandatangan Laporan</label>
            <input 
              type="text"
              value={pejabatNama}
              onChange={e => setPejabatNama(e.target.value)}
              placeholder="Nama Lengkap Pejabat"
              className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-slate-50 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jabatan Penandatangan</label>
            <input 
              type="text"
              value={pejabatJabatan}
              onChange={e => setPejabatJabatan(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-slate-50 font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Opini / Rekomendasi Rektorat</label>
            <textarea 
              rows={1.5}
              value={officialNote}
              onChange={e => setOfficialNote(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-slate-50"
            />
          </div>
        </div>

        {/* Dynamic Letterhead Editing Form */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <button
            onClick={() => setShowKopSettings(!showKopSettings)}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <Settings size={14} className={showKopSettings ? 'animate-spin' : ''} />
            {showKopSettings ? 'Sembunyikan Pengaturan KOP Surat' : 'Ubah KOP Surat Resmi'}
          </button>
          
          {showKopSettings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Yayasan / Lembaga</label>
                <input 
                  type="text"
                  value={letterhead.institutionName}
                  onChange={e => handleUpdateLetterhead('institutionName', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-white font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Perguruan Tinggi</label>
                <input 
                  type="text"
                  value={letterhead.collegeName}
                  onChange={e => handleUpdateLetterhead('collegeName', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-white font-semibold text-slate-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                <input 
                  type="text"
                  value={letterhead.address}
                  onChange={e => handleUpdateLetterhead('address', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-white font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kontak (Email, Web, Telp)</label>
                <input 
                  type="text"
                  value={letterhead.contact}
                  onChange={e => handleUpdateLetterhead('contact', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-white text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Keterangan Tambahan / Akreditasi</label>
                <input 
                  type="text"
                  value={letterhead.extraInfo}
                  onChange={e => handleUpdateLetterhead('extraInfo', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-white text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Logo Inisial (Bila Tanpa Gambar)</label>
                <input 
                  type="text"
                  maxLength={5}
                  placeholder="AB"
                  value={letterhead.logoText || ''}
                  onChange={e => handleUpdateLetterhead('logoText', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none bg-white text-slate-800 font-bold uppercase"
                />
              </div>
              <div className="md:col-span-2 border-t border-slate-200/60 pt-3 mt-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Unggah Gambar Logo KOP Surat Resmi</label>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Current Image Logo Preview or Default Initials preview */}
                  <div className="p-2 border border-slate-200 rounded-xl bg-white">
                    {letterhead.logoUrl ? (
                      <div className="w-16 h-16 flex items-center justify-center overflow-hidden bg-slate-50 rounded-lg border border-slate-100">
                        <img src={letterhead.logoUrl} className="w-16 h-16 object-contain" alt="Preview Logo" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0">
                        <span className="text-xl font-serif">{letterhead.logoText || 'AB'}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 flex-1 min-w-[200px]">
                    <p className="text-[11px] text-slate-400">
                      Format didukung: PNG, JPG, JPEG, SVG. Maksimal ukuran 2MB. Gambar disimpan dan disinkronisasikan ke semua kop surat seleksi mahasiswa dan pelaporan.
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer">
                        <Upload size={12} />
                        Unggah Logo Baru
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert("Ukuran file logo tidak boleh melebihi 2MB.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target?.result as string;
                                handleUpdateLetterhead('logoUrl', base64);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden" 
                        />
                      </label>

                      {letterhead.logoUrl && (
                        <button
                          type="button"
                          onClick={() => handleUpdateLetterhead('logoUrl', '')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Hapus Gambar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* REPORT PAPER PREVIEW (PRINT COMPATIBLE) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-8 md:p-12 font-serif text-slate-800 space-y-6 max-w-4xl mx-auto print-card">
        {/* Kop Surat (Letterhead) */}
        <div className="flex items-center gap-6 border-b-4 border-emerald-800 pb-5">
          {letterhead.logoUrl ? (
            <div className="w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden">
              <img src={letterhead.logoUrl} className="w-16 h-16 object-contain" alt="Logo" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0">
              <span className="text-2xl font-serif">{letterhead.logoText || 'AB'}</span>
            </div>
          )}
          <div className="space-y-1 flex-1">
            <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase font-sans leading-none">{letterhead.institutionName}</h2>
            <h1 className="text-base md:text-lg font-serif font-extrabold uppercase tracking-wide text-emerald-950 leading-tight mt-1">{letterhead.collegeName}</h1>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed mt-1">
              {letterhead.address}
            </p>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              {letterhead.contact} {letterhead.extraInfo ? ` • ${letterhead.extraInfo}` : ''}
            </p>
          </div>
        </div>


        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-sm md:text-base font-bold uppercase underline tracking-wide">
            LAPORAN EVALUASI & REALISASI BEASISWA KIP KULIAH
          </h3>
          <p className="text-xs font-sans font-medium text-slate-500">
            Tahun Akademik {tahunAkademik} Semester {semesterGanjilGenap} • Program Studi: {selectedProdi}
          </p>
        </div>

        {/* High level Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-200 font-sans">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Penerima Aktif</span>
            <strong className="text-xl text-slate-800 font-bold block mt-1">{subsetCount} Mahasiswa</strong>
          </div>
          <div className="text-center border-l border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Rerata IPK</span>
            <strong className="text-xl text-emerald-700 font-bold block mt-1">{avgGpa.toFixed(2)}</strong>
          </div>
          <div className="text-center border-l border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Butuh Pembinaan</span>
            <strong className="text-xl text-amber-600 font-bold block mt-1">{bimbinganCount} Mahasiswa</strong>
          </div>
          <div className="text-center border-l border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Anggaran UKT</span>
            <strong className="text-sm md:text-base text-slate-800 font-bold block mt-2 font-mono">{formatRupiah(totalFundsUkt)}</strong>
          </div>
        </div>

        {/* Narrative / Opinion section */}
        <div className="space-y-2 text-xs leading-relaxed text-justify">
          <h4 className="font-bold uppercase text-slate-900 font-sans text-[11px] tracking-wider">I. Ringkasan Evaluasi Komite Kemahasiswaan</h4>
          <p className="indent-8 text-slate-700">
            {officialNote}
          </p>
        </div>

        {/* Comprehensive table of students */}
        <div className="space-y-3">
          <h4 className="font-bold uppercase text-slate-900 font-sans text-[11px] tracking-wider">II. Lampiran Daftar Prestasi Akademik & Pencairan Dana</h4>
          
          {filteredActiveStudents.length > 0 ? (
            <table className="w-full text-left text-[10px] font-sans border border-slate-200">
              <thead>
                <tr className="bg-slate-150 font-bold border-b border-slate-200 text-slate-700">
                  <th className="py-2 px-3 border-r border-slate-200">NIM</th>
                  <th className="py-2 px-3 border-r border-slate-200">Nama Penerima</th>
                  <th className="py-2 px-2 text-center border-r border-slate-200">IPK</th>
                  <th className="py-2 px-2 text-center border-r border-slate-200">Kehadiran</th>
                  <th className="py-2 px-3 border-r border-slate-200">UKT ({formatRupiah(2400000)})</th>
                  <th className="py-2 px-3">Biaya Hidup ({formatRupiah(5700000)})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredActiveStudents.map((student) => {
                  const prog = progressList.find(p => p.studentId === student.id);
                  const dis = disbursements.find(d => d.studentId === student.id);
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono border-r border-slate-200">{student.nim}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">{student.nama}</td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-bold">{student.ipk.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center border-r border-slate-200">{prog?.kehadiran ?? 100}%</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-600">{dis?.statusUkt || 'Belum Proses'}</td>
                      <td className="py-2 px-3 font-medium text-slate-600">{dis?.statusBiayaHidup || 'Belum Proses'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-6 border border-dashed border-slate-200 text-slate-400 text-xs font-sans">
              Tidak ada mahasiswa aktif KIP Kuliah terdaftar di program studi ini.
            </div>
          )}
        </div>

        {/* Footer / Sign-off Block */}
        <div className="pt-8 flex justify-end font-sans text-xs">
          <div className="text-center space-y-16 w-64">
            <div>
              <p>Cirebon, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold text-slate-700">{pejabatJabatan}</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 underline">{pejabatNama}</p>
              <p className="text-[10px] text-slate-400">NIDN / NIP STID Al-Biruni</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
