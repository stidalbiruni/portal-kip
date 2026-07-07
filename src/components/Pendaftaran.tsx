import React, { useState } from 'react';
import { 
  Plus, Search, Filter, FileText, User, MapPin, Phone, 
  Mail, BookOpen, AlertCircle, Check, X, Award, HelpCircle, ArrowLeft, Trash2,
  Folder, FolderOpen, Calendar, Database
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell
} from 'recharts';
import { StudentApplicant, DocumentStatus, ProgramStudi } from '../types';

interface PendaftaranProps {
  applicants: StudentApplicant[];
  onAddApplicant: (newApplicant: StudentApplicant) => void;
  onDeleteApplicant: (id: string) => void;
  onSelectStudent: (student: StudentApplicant) => void;
  prodis?: ProgramStudi[];
}

export default function Pendaftaran({
  applicants,
  onAddApplicant,
  onDeleteApplicant,
  onSelectStudent,
  prodis = []
}: PendaftaranProps) {
  // Local state
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProdi, setSelectedProdi] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [selectedAngkatan, setSelectedAngkatan] = useState<string>('Semua');
  
  // New applicant form state
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    prodi: 'Komunikasi Penyiaran Islam (KPI)' as StudentApplicant['prodi'],
    angkatan: '2026',
    semester: 1,
    ipk: 0.0,
    penghasilanOrtu: '',
    pekerjaanAyah: '',
    pekerjaanIbu: '',
    jumlahTanggungan: '2',
    prestasiInput: '',
    alamat: '',
    kontak: '',
    email: '',
    catatan: '',
  });

  const [berkasStatus, setBerkasStatus] = useState<DocumentStatus>({
    kartuKip: false,
    sktm: false,
    slipGaji: false,
    raport: false,
    prestasiDoc: false,
  });

  // Sync default prodi when prodis list loaded/changed
  React.useEffect(() => {
    if (prodis.length > 0 && !prodis.some(p => p.nama === formData.prodi)) {
      setFormData(prev => ({ ...prev, prodi: prodis[0].nama }));
    }
  }, [prodis, formData.prodi]);

  // Filters
  const prodiOptions = [
    'Semua',
    ...prodis.map(p => p.nama)
  ];

  const statusOptions = [
    'Semua',
    'Pendaftaran',
    'Verifikasi',
    'Diterima',
    'Ditolak',
    'Cadangan'
  ];

  // Dynamic generations list
  const allAngkatans = Array.from(
    new Set(applicants.map(app => app.angkatan))
  ).filter(Boolean).sort((a, b) => b.localeCompare(a));

  // Filtering Logic
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.nim.includes(searchQuery);
    const matchesProdi = selectedProdi === 'Semua' || app.prodi === selectedProdi;
    const matchesStatus = selectedStatus === 'Semua' || app.status === selectedStatus;
    const matchesAngkatan = selectedAngkatan === 'Semua' || app.angkatan === selectedAngkatan;
    
    return matchesSearch && matchesProdi && matchesStatus && matchesAngkatan;
  });

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nim) {
      alert('Nama dan NIM / Nomor Pendaftaran wajib diisi!');
      return;
    }

    const parsePrestasi = formData.prestasiInput
      .split('\n')
      .map(p => p.trim())
      .filter(p => p !== '');

    const newApp: StudentApplicant = {
      id: Math.random().toString(36).substr(2, 9),
      nama: formData.nama,
      nim: formData.nim,
      prodi: formData.prodi,
      angkatan: formData.angkatan,
      semester: Number(formData.semester),
      ipk: Number(formData.ipk) || 0.0,
      penghasilanOrtu: Number(formData.penghasilanOrtu) || 0,
      pekerjaanAyah: formData.pekerjaanAyah || 'Tidak Bekerja',
      pekerjaanIbu: formData.pekerjaanIbu || 'Ibu Rumah Tangga',
      jumlahTanggungan: Number(formData.jumlahTanggungan) || 1,
      prestasi: parsePrestasi,
      status: 'Pendaftaran',
      skorKriteria: { ekonomi: 50, akademik: 50, wawancara: 0, total: 50 },
      berkas: { ...berkasStatus },
      catatan: formData.catatan || 'Pendaftaran baru masuk via portal KIP.',
      alamat: formData.alamat,
      kontak: formData.kontak,
      email: formData.email,
    };

    onAddApplicant(newApp);
    
    // Reset Form
    setFormData({
      nama: '',
      nim: '',
      prodi: 'Komunikasi Penyiaran Islam (KPI)',
      angkatan: '2026',
      semester: 1,
      ipk: 0.0,
      penghasilanOrtu: '',
      pekerjaanAyah: '',
      pekerjaanIbu: '',
      jumlahTanggungan: '2',
      prestasiInput: '',
      alamat: '',
      kontak: '',
      email: '',
      catatan: '',
    });
    setBerkasStatus({
      kartuKip: false,
      sktm: false,
      slipGaji: false,
      raport: false,
      prestasiDoc: false,
    });
    setShowAddForm(false);
  };

  // Helper formatting for currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Database & Pendaftaran KIP Kuliah</h2>
          <p className="text-xs text-slate-500">
            Kelola pendaftaran berkas calon penerima beasiswa KIP Kuliah STID Al-Biruni Babakan Ciwaringin.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
            showAddForm 
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' 
              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
          }`}
        >
          {showAddForm ? (
            <>
              <ArrowLeft size={16} />
              Kembali ke Daftar
            </>
          ) : (
            <>
              <Plus size={16} />
              Tambah Pendaftar Baru
            </>
          )}
        </button>
      </div>

      {!showAddForm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FOLDER MAHASISWA PENERIMA BEASISWA PER ANGKATAN */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider mb-1">
                <Folder className="text-amber-500" size={18} />
                Folder Penerima Beasiswa per Angkatan
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Pilih folder angkatan di bawah untuk memfilter daftar mahasiswa di bawah secara cepat.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* All / Semua Folder */}
                <div 
                  onClick={() => setSelectedAngkatan('Semua')}
                  className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-28 ${
                    selectedAngkatan === 'Semua'
                      ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                      {selectedAngkatan === 'Semua' ? (
                        <FolderOpen size={20} className="text-emerald-600" />
                      ) : (
                        <Folder size={20} className="text-slate-500" />
                      )}
                    </div>
                    <span className="text-[10px] bg-slate-200/60 px-2 py-0.5 rounded-full font-bold text-slate-600">
                      ALL
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Semua Angkatan</h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {applicants.filter(a => a.status === 'Diterima').length} Penerima ({applicants.length} Total)
                    </p>
                  </div>
                </div>

                {/* Dinamis Folders */}
                {allAngkatans.map((yr) => {
                  const recipientsCount = applicants.filter(a => a.angkatan === yr && a.status === 'Diterima').length;
                  const totalCount = applicants.filter(a => a.angkatan === yr).length;
                  const isSelected = selectedAngkatan === yr;
                  
                  return (
                    <div 
                      key={yr}
                      onClick={() => setSelectedAngkatan(yr)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-28 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}>
                          {isSelected ? (
                            <FolderOpen size={20} />
                          ) : (
                            <Folder size={20} />
                          )}
                        </div>
                        <span className="text-[10px] bg-slate-200/60 px-2 py-0.5 rounded-full font-bold text-slate-600">
                          {yr}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 font-serif">Angkatan {yr}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-sans">
                          {recipientsCount} Penerima ({totalCount} Total)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status Filter Terpilih: <strong>{selectedAngkatan === 'Semua' ? 'Tampilkan Semua' : `Angkatan ${selectedAngkatan}`}</strong></span>
              {selectedAngkatan !== 'Semua' && (
                <button 
                  onClick={() => setSelectedAngkatan('Semua')}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* GRAFIK PENERIMA BEASISWA PER ANGKATAN */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider mb-1">
                <Database className="text-emerald-600" size={18} />
                Grafik Penerima per Angkatan
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Grafik jumlah penerima KIP Kuliah berstatus 'Diterima' per tahun angkatan.
              </p>
              
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allAngkatans.slice().reverse().map(yr => ({
                      name: yr,
                      'Penerima': applicants.filter(a => a.angkatan === yr && a.status === 'Diterima').length,
                      'Total': applicants.filter(a => a.angkatan === yr).length,
                    }))}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10 }} 
                      axisLine={false} 
                      tickLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                      labelStyle={{ fontWeight: 'bold', color: '#34d399' }}
                    />
                    <Bar dataKey="Penerima" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16}>
                      {allAngkatans.slice().reverse().map((yr, idx) => (
                        <Cell 
                          key={`cell-${idx}`} 
                          fill={selectedAngkatan === yr ? '#047857' : '#10b981'} 
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="Total" fill="#94a3b8" opacity={0.3} radius={[4, 4, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 text-[10px] mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                <span className="text-slate-500">Penerima KIP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block"></span>
                <span className="text-slate-500">Total Pendaftar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddForm ? (
        /* REGISTER APPLICANT FORM */
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-emerald-850 p-4 text-emerald-950 border-b border-emerald-100 flex items-center gap-2">
            <div className="p-1.5 bg-emerald-700 rounded text-white">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Formulir Pendaftaran Beasiswa KIP Kuliah</h3>
              <p className="text-[10px] text-emerald-800 font-medium">Input data diri dan lampiran berkas secara cermat</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Row 1: Data Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap Calon Penerima *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Muhammad Ali"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">NIM / No. Pendaftaran Masuk *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: 202610555"
                  value={formData.nim}
                  onChange={e => setFormData({ ...formData, nim: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Program Studi *</label>
                <select 
                  value={formData.prodi}
                  onChange={e => setFormData({ ...formData, prodi: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                >
                  {prodis.map(p => (
                    <option key={p.id} value={p.nama}>{p.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Akademik & Kontak */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Angkatan</label>
                <input 
                  type="text" 
                  placeholder="2026"
                  value={formData.angkatan}
                  onChange={e => setFormData({ ...formData, angkatan: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Semester</label>
                <input 
                  type="number" 
                  min="1" max="8"
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">IPK Awal / Rata-rata Nilai Rapor</label>
                <input 
                  type="number" 
                  step="0.01" min="0" max="4"
                  placeholder="Contoh: 3.50"
                  value={formData.ipk === 0 ? '' : formData.ipk}
                  onChange={e => setFormData({ ...formData, ipk: parseFloat(e.target.value) || 0.0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">No. Kontak Handphone/WA *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: 081234567"
                  value={formData.kontak}
                  onChange={e => setFormData({ ...formData, kontak: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Row 3: Kondisi Ekonomi & Wali */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Penghasilan Orang Tua (Rupiah/Bulan) *</label>
                <input 
                  type="number" 
                  required
                  placeholder="Contoh: 1500000"
                  value={formData.penghasilanOrtu}
                  onChange={e => setFormData({ ...formData, penghasilanOrtu: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pekerjaan Ayah</label>
                <input 
                  type="text" 
                  placeholder="Buruh, Tani, dsb."
                  value={formData.pekerjaanAyah}
                  onChange={e => setFormData({ ...formData, pekerjaanAyah: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pekerjaan Ibu</label>
                <input 
                  type="text" 
                  placeholder="Ibu Rumah Tangga, dsb."
                  value={formData.pekerjaanIbu}
                  onChange={e => setFormData({ ...formData, pekerjaanIbu: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jumlah Tanggungan Anak</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.jumlahTanggungan}
                  onChange={e => setFormData({ ...formData, jumlahTanggungan: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Row 4: Alamat & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Tempat Tinggal Lengkap *</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Blok / RT RW, Desa, Kecamatan, Kabupaten/Kota"
                  value={formData.alamat}
                  onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Email Mahasiswa</label>
                <input 
                  type="email" 
                  placeholder="mhs@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Checkbox Kelengkapan Berkas (Mock Drag & Drop) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Kelengkapan Lampiran Dokumen Calon Penerima (Telah Diverifikasi Fisik)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-colors text-xs text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={berkasStatus.kartuKip}
                    onChange={e => setBerkasStatus({ ...berkasStatus, kartuKip: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Kartu KIP Kuliah</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-colors text-xs text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={berkasStatus.sktm}
                    onChange={e => setBerkasStatus({ ...berkasStatus, sktm: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Surat SKTM</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-colors text-xs text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={berkasStatus.slipGaji}
                    onChange={e => setBerkasStatus({ ...berkasStatus, slipGaji: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Slip Gaji Wali</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-colors text-xs text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={berkasStatus.raport}
                    onChange={e => setBerkasStatus({ ...berkasStatus, raport: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Rapor / Transkrip</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-colors text-xs text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={berkasStatus.prestasiDoc}
                    onChange={e => setBerkasStatus({ ...berkasStatus, prestasiDoc: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Sertifikat Prestasi</span>
                </label>
              </div>
            </div>

            {/* Prestasi Inputs & Catatan Tambahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Daftar Prestasi (Pisahkan per baris)</label>
                <textarea 
                  rows={3}
                  placeholder="Contoh:&#10;Juara I Tilawah Al-Quran Tingkat Kabupaten&#10;Juara II Lomba Pidato Bahasa Arab"
                  value={formData.prestasiInput}
                  onChange={e => setFormData({ ...formData, prestasiInput: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan Khusus Kemahasiswaan</label>
                <textarea 
                  rows={3}
                  placeholder="Keterangan tambahan kelayakan ekonomi atau kepribadian dakwah..."
                  value={formData.catatan}
                  onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
            >
              Simpan & Daftarkan KIP
            </button>
          </div>
        </form>
      ) : (
        /* APPLICANT DIRECTORY & LIST */
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Controls & Searching */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Search size={16} />
              </span>
              <input 
                type="text"
                placeholder="Cari nama atau NIM..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Prodi filter */}
              <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
                <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
                  <Filter size={14} /> Prodi:
                </span>
                <select
                  value={selectedProdi}
                  onChange={e => setSelectedProdi(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600 font-medium w-full sm:w-auto"
                >
                  {prodiOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt === 'Semua' ? 'Semua Prodi' : opt.split(' (')[1]?.replace(')', '') || opt}</option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
                <span className="text-slate-500 font-medium shrink-0">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600 font-medium w-full sm:w-auto"
                >
                  {statusOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt === 'Semua' ? 'Semua Status' : opt}</option>
                  ))}
                </select>
              </div>

              {/* Angkatan filter */}
              <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
                <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
                  <Calendar size={14} /> Angkatan:
                </span>
                <select
                  value={selectedAngkatan}
                  onChange={e => setSelectedAngkatan(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600 font-medium w-full sm:w-auto"
                >
                  <option value="Semua">Semua Angkatan</option>
                  {allAngkatans.map((yr, i) => (
                    <option key={i} value={yr}>Angkatan {yr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Directory Grid / List */}
          {filteredApplicants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-5">Nama Mahasiswa</th>
                    <th className="py-3.5 px-4">Prodi & Angkatan</th>
                    <th className="py-3.5 px-4 text-right">Penghasilan Ortu</th>
                    <th className="py-3.5 px-4 text-center">Kelengkapan Berkas</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredApplicants.map((student) => {
                    // Count completeness of document berkas
                    const totalDocs = Object.keys(student.berkas).length;
                    const completeDocs = Object.values(student.berkas).filter(Boolean).length;
                    
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center font-sans text-xs shrink-0">
                              {student.nama.charAt(0)}
                            </div>
                            <div>
                              <button 
                                onClick={() => onSelectStudent(student)}
                                className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline text-left"
                              >
                                {student.nama}
                              </button>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{student.nim}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          <p className="font-medium text-slate-800 truncate max-w-[150px]">
                            {student.prodi.split(' (')[0]}
                          </p>
                          <p className="text-[10px] text-slate-400">Angkatan {student.angkatan} • Sem {student.semester}</p>
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-slate-800">
                          {formatRupiah(student.penghasilanOrtu)}
                          <p className="text-[10px] text-slate-400 font-normal">{student.pekerjaanAyah}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  completeDocs === totalDocs ? 'bg-emerald-500' :
                                  completeDocs >= 3 ? 'bg-amber-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${(completeDocs / totalDocs) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{completeDocs}/{totalDocs} Berkas</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            student.status === 'Diterima' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            student.status === 'Verifikasi' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            student.status === 'Pendaftaran' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            student.status === 'Cadangan' ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right space-x-1.5">
                          <button
                            onClick={() => onSelectStudent(student)}
                            className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                            title="Detail Mahasiswa"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus data KIP ${student.nama}?`)) {
                                onDeleteApplicant(student.id);
                              }
                            }}
                            className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
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
              <AlertCircle size={40} className="mx-auto text-slate-300 mb-3 animate-pulse" />
              <p className="font-semibold text-slate-700 text-sm">Tidak Ada Calon Penerima KIP</p>
              <p className="text-xs mt-1">Coba sesuaikan pencarian atau filter yang Anda terapkan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
