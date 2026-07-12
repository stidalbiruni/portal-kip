import React, { useState } from 'react';
import { 
  Plus, Search, Filter, FileText, User, MapPin, Phone, 
  Mail, BookOpen, AlertCircle, Check, X, Award, HelpCircle, ArrowLeft, Trash2,
  Folder, FolderOpen, Calendar, Database, Upload, Download
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import { StudentApplicant, DocumentStatus, ProgramStudi } from '../types';

interface PendaftaranProps {
  applicants: StudentApplicant[];
  onAddApplicant: (newApplicant: StudentApplicant) => void;
  onAddApplicants?: (newApplicants: StudentApplicant[]) => void;
  onDeleteApplicant: (id: string) => void;
  onSelectStudent: (student: StudentApplicant) => void;
  prodis?: ProgramStudi[];
}

export default function Pendaftaran({
  applicants,
  onAddApplicant,
  onAddApplicants,
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

  // Excel import state variables
  const [addMode, setAddMode] = useState<'manual' | 'excel'>('manual');
  const [validatedStudents, setValidatedStudents] = useState<StudentApplicant[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [excelFileName, setExcelFileName] = useState('');
  
  // New applicant form state
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    nik: '',
    hpWa: '',
    namaAyah: '',
    namaIbu: '',
    blok: '',
    desaKelurahan: '',
    rt: '',
    rw: '',
    kecamatan: '',
    kabupaten: '',
    kodePos: '',
    provinsi: '',
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
    ktp: false,
    kk: false,
    foto: false,
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
    'Cadangan',
    'Pengganti'
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

    const addressParts = [
      formData.blok ? `Blok ${formData.blok}` : '',
      formData.rt || formData.rw ? `RT ${formData.rt || '0'}/RW ${formData.rw || '0'}` : '',
      formData.desaKelurahan ? `Desa/Kelurahan ${formData.desaKelurahan}` : '',
      formData.kecamatan ? `Kec. ${formData.kecamatan}` : '',
      formData.kabupaten ? `Kab/Kota ${formData.kabupaten}` : '',
      formData.provinsi ? `Provinsi ${formData.provinsi}` : '',
      formData.kodePos ? `Kode Pos ${formData.kodePos}` : ''
    ].filter(Boolean);

    const constructedAlamat = addressParts.join(', ') || formData.alamat;

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
      alamat: constructedAlamat,
      kontak: formData.hpWa || formData.kontak,
      email: formData.email,
      nik: formData.nik,
      hpWa: formData.hpWa,
      namaAyah: formData.namaAyah,
      namaIbu: formData.namaIbu,
      alamatDetail: {
        blok: formData.blok,
        desaKelurahan: formData.desaKelurahan,
        rt: formData.rt,
        rw: formData.rw,
        kecamatan: formData.kecamatan,
        kabupaten: formData.kabupaten,
        kodePos: formData.kodePos,
        provinsi: formData.provinsi,
      }
    };

    onAddApplicant(newApp);
    
    // Reset Form
    setFormData({
      nama: '',
      nim: '',
      nik: '',
      hpWa: '',
      namaAyah: '',
      namaIbu: '',
      blok: '',
      desaKelurahan: '',
      rt: '',
      rw: '',
      kecamatan: '',
      kabupaten: '',
      kodePos: '',
      provinsi: '',
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
      ktp: false,
      kk: false,
      foto: false,
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

  // Reset Excel Import State
  const resetExcelImportState = () => {
    setValidatedStudents([]);
    setImportErrors([]);
    setExcelFileName('');
  };

  // Download Excel template
  const downloadTemplate = () => {
    const headers = [
      [
        'NIM', 
        'Nama Lengkap', 
        'NIK', 
        'Program Studi', 
        'Angkatan', 
        'Semester', 
        'IPK', 
        'No HP / WA', 
        'Email', 
        'Nama Ayah', 
        'Pekerjaan Ayah', 
        'Nama Ibu', 
        'Pekerjaan Ibu', 
        'Penghasilan Orang Tua', 
        'Jumlah Tanggungan', 
        'Blok / Jalan', 
        'RT', 
        'RW', 
        'Desa / Kelurahan', 
        'Kecamatan', 
        'Kabupaten', 
        'Provinsi', 
        'Kode Pos', 
        'Prestasi', 
        'Status'
      ]
    ];
    const sampleRows = [
      [
        '202610991', 
        'Muhammad Zaky', 
        '3209121212950001', 
        'Komunikasi Penyiaran Islam (KPI)', 
        '2026', 
        '1', 
        '3.75', 
        '081234567890', 
        'zaky@example.com', 
        'Sumarno', 
        'Petani', 
        'Aminah', 
        'Buruh', 
        '2500000', 
        '3', 
        'Blok Pesantren No. 1', 
        '002', 
        '001', 
        'Babakan', 
        'Ciwaringin', 
        'Cirebon', 
        'Jawa Barat', 
        '45167', 
        'Juara 1 Pidato B.Arab, Juara 2 Kaligrafi', 
        'Diterima'
      ],
      [
        '202610992', 
        'Zahra Humaira', 
        '3209121212950002', 
        'Pengembangan Masyarakat Islam (PMI)', 
        '2026', 
        '1', 
        '3.80', 
        '089876543210', 
        'zahra@example.com', 
        'Hasanudin', 
        'Buruh', 
        'Siti Khodijah', 
        'Ibu Rumah Tangga', 
        '1800000', 
        '4', 
        'Blok Cantilan No. 5', 
        '004', 
        '002', 
        'Babakan', 
        'Ciwaringin', 
        'Cirebon', 
        'Jawa Barat', 
        '45167', 
        'Hafal Al-Quran 5 Juz', 
        'Verifikasi'
      ]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template KIP');
    XLSX.writeFile(wb, 'template_impor_mahasiswa_kip.xlsx');
  };

  // Parse excel file
  const handleExcelUpload = (file: File) => {
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (json.length === 0) {
          setImportErrors(['File Excel kosong atau tidak dapat dibaca.']);
          setValidatedStudents([]);
          return;
        }

        const students: StudentApplicant[] = [];
        const errors: string[] = [];

        json.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1
          
          const getVal = (keys: string[]): string => {
            const foundKey = Object.keys(row).find(k => 
              keys.includes(k.toLowerCase().trim().replace(/[\s_-]/g, ''))
            );
            return foundKey ? String(row[foundKey]).trim() : '';
          };

          const nama = getVal(['nama', 'namalengkap', 'name', 'fullname', 'mahasiswa']);
          const nim = getVal(['nim', 'nomorpendaftaran', 'id', 'studentnumber', 'nimpendaftaran']);
          
          if (!nama) {
            errors.push(`Baris ${rowNum}: Kolom 'Nama' kosong.`);
            return;
          }
          if (!nim) {
            errors.push(`Baris ${rowNum}: Kolom 'NIM' kosong.`);
            return;
          }

          // Duplicate checks
          const isDuplicateInExisting = applicants.some(a => a.nim === nim);
          const isDuplicateInParsed = students.some(s => s.nim === nim);
          if (isDuplicateInExisting) {
            errors.push(`Baris ${rowNum}: NIM '${nim}' (${nama}) sudah terdaftar di database.`);
            return;
          }
          if (isDuplicateInParsed) {
            errors.push(`Baris ${rowNum}: NIM '${nim}' (${nama}) terduplikasi di file.`);
            return;
          }

          // Normalize Prodi
          const rawProdi = getVal(['prodi', 'programstudi', 'jurusan', 'department']);
          let prodi: StudentApplicant['prodi'] = 'Komunikasi Penyiaran Islam (KPI)';
          if (prodis && prodis.length > 0) {
            const matched = prodis.find(p => {
              const pName = p.nama.toLowerCase();
              const rName = rawProdi.toLowerCase();
              return pName.includes(rName) || rName.includes(pName) || 
                     (pName.includes('kpi') && rName.includes('kpi')) ||
                     (pName.includes('pmi') && rName.includes('pmi'));
            });
            if (matched) {
              prodi = matched.nama as StudentApplicant['prodi'];
            } else {
              prodi = prodis[0].nama as StudentApplicant['prodi'];
            }
          }

          const angkatan = getVal(['angkatan', 'tahun', 'year', 'tahunmasuk']) || '2026';
          const semester = parseInt(getVal(['semester', 'sem'])) || 1;
          const ipk = parseFloat(getVal(['ipk', 'gpa', 'nilai', 'ip'])) || 0.0;
          
          const rawPenghasilan = getVal(['penghasilan', 'penghasilanortu', 'penghasilanorangtua', 'income']);
          const penghasilanOrtu = rawPenghasilan 
            ? parseInt(rawPenghasilan.replace(/[^0-9]/g, '')) || 0
            : 0;

          const pekerjaanAyah = getVal(['pekerjaanayah', 'pekerjaanbapak', 'fatherjob']) || 'Tidak Bekerja';
          const pekerjaanIbu = getVal(['pekerjaanibu', 'motherjob']) || 'Ibu Rumah Tangga';
          const jumlahTanggungan = parseInt(getVal(['tanggungan', 'jumlahtanggungan', 'dependents'])) || 2;
          const kontak = getVal(['kontak', 'nohp', 'telepon', 'phone', 'hp']) || '';
          const email = getVal(['email', 'mail']) || '';
          const catatan = getVal(['catatan', 'keterangan', 'note', 'notes']) || 'Diimpor via Excel.';

          const nik = getVal(['nik', 'ktp', 'nomornik', 'idcard']) || '';
          const namaAyah = getVal(['namaayah', 'ayah', 'fathername', 'father']) || '';
          const namaIbu = getVal(['namaibu', 'ibu', 'mothername', 'mother']) || '';
          const hpWa = getVal(['hpwa', 'wa', 'whatsapp', 'nomorhp', 'phone', 'hp']) || kontak;

          const blok = getVal(['blok', 'jalan', 'house']) || '';
          const rt = getVal(['rt']) || '';
          const rw = getVal(['rw']) || '';
          const desaKelurahan = getVal(['desa', 'kelurahan', 'desakelurahan', 'village']) || '';
          const kecamatan = getVal(['kecamatan', 'kec', 'district']) || '';
          const kabupaten = getVal(['kabupaten', 'kota', 'kab', 'city']) || '';
          const provinsi = getVal(['provinsi', 'prov', 'province']) || '';
          const kodePos = getVal(['kodepos', 'pos', 'postalcode', 'zip']) || '';

          // Construct alamatDetail
          const alamatDetail = {
            blok,
            desaKelurahan,
            rt,
            rw,
            kecamatan,
            kabupaten,
            provinsi,
            kodePos
          };

          // Build a composite address string if detailed elements are found, otherwise use raw 'alamat'
          let compiledAlamat = getVal(['alamat', 'address', 'domisili']) || '';
          if (blok || desaKelurahan || kecamatan || kabupaten) {
            const addressParts = [
              blok ? `Blok ${blok}` : '',
              rt || rw ? `RT ${rt || '0'}/RW ${rw || '0'}` : '',
              desaKelurahan ? `Desa/Kelurahan ${desaKelurahan}` : '',
              kecamatan ? `Kec. ${kecamatan}` : '',
              kabupaten ? `Kab/Kota ${kabupaten}` : '',
              provinsi ? `Provinsi ${provinsi}` : '',
              kodePos ? `Kode Pos ${kodePos}` : ''
            ].filter(Boolean);
            compiledAlamat = addressParts.join(', ');
          }
          
          const rawPrestasi = getVal(['prestasi', 'achievements', 'penghargaan']);
          const prestasi = rawPrestasi 
            ? rawPrestasi.split(/[,;\n]/).map(p => p.trim()).filter(p => p !== '')
            : [];

          const rawStatus = getVal(['status', 'kipstatus', 'tahap']).toLowerCase();
          let status: StudentApplicant['status'] = 'Pendaftaran';
          if (rawStatus.includes('verifikasi')) status = 'Verifikasi';
          else if (rawStatus.includes('terima') || rawStatus.includes('diterima')) status = 'Diterima';
          else if (rawStatus.includes('tolak') || rawStatus.includes('ditolak')) status = 'Ditolak';
          else if (rawStatus.includes('cadangan')) status = 'Cadangan';
          else if (rawStatus.includes('pengganti')) status = 'Pengganti';

          students.push({
            id: Math.random().toString(36).substr(2, 9),
            nama,
            nim,
            prodi,
            angkatan,
            semester,
            ipk,
            penghasilanOrtu,
            pekerjaanAyah,
            pekerjaanIbu,
            jumlahTanggungan,
            prestasi,
            status,
            skorKriteria: { ekonomi: 50, akademik: 50, wawancara: 0, total: 50 },
            berkas: {
              kartuKip: false,
              sktm: false,
              slipGaji: false,
              raport: false,
              prestasiDoc: false,
              ktp: false,
              kk: false,
              foto: false,
            },
            catatan,
            alamat: compiledAlamat,
            kontak: hpWa || kontak,
            email,
            nik,
            hpWa,
            namaAyah,
            namaIbu,
            alamatDetail
          });
        });

        setValidatedStudents(students);
        setImportErrors(errors);
      } catch (err) {
        console.error(err);
        setImportErrors(['Gagal membaca file Excel. Pastikan file valid.']);
        setValidatedStudents([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = () => {
    if (validatedStudents.length === 0) {
      alert('Tidak ada mahasiswa valid yang siap diimpor.');
      return;
    }

    if (onAddApplicants) {
      onAddApplicants(validatedStudents);
    } else {
      validatedStudents.forEach(student => onAddApplicant(student));
    }

    alert(`Berhasil mengimpor ${validatedStudents.length} mahasiswa baru dari file Excel.`);
    resetExcelImportState();
    setShowAddForm(false);
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
                      {applicants.filter(a => a.status === 'Diterima' || a.status === 'Pengganti').length} Penerima ({applicants.length} Total)
                    </p>
                  </div>
                </div>

                {/* Dinamis Folders */}
                {allAngkatans.map((yr) => {
                  const recipientsCount = applicants.filter(a => a.angkatan === yr && (a.status === 'Diterima' || a.status === 'Pengganti')).length;
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
                Grafik jumlah penerima KIP Kuliah berstatus 'Diterima' atau 'Pengganti' per tahun angkatan.
              </p>
              
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allAngkatans.slice().reverse().map(yr => ({
                      name: yr,
                      'Penerima': applicants.filter(a => a.angkatan === yr && (a.status === 'Diterima' || a.status === 'Pengganti')).length,
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
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Form Header with Mode Switcher */}
          <div className="bg-emerald-900 p-4 text-white border-b border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-700 rounded-lg text-white">
                <User size={18} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm">Registrasi Calon Penerima KIP Kuliah</h3>
                <p className="text-[10px] text-emerald-200 font-medium">Input biodata baru satu per satu atau impor sekaligus dari Excel/CSV</p>
              </div>
            </div>
            
            {/* Mode Switcher Tabs */}
            <div className="flex bg-emerald-950 p-1 rounded-xl border border-emerald-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setAddMode('manual');
                  resetExcelImportState();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  addMode === 'manual'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Input Manual
              </button>
              <button
                type="button"
                onClick={() => setAddMode('excel')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  addMode === 'excel'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Impor Excel / CSV
              </button>
            </div>
          </div>

          {addMode === 'manual' ? (
            /* REGISTER APPLICANT FORM */
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
            {/* Row 1: Data Utama */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor NIK *</label>
                <input 
                  type="text" 
                  required
                  maxLength={16}
                  placeholder="16 Digit NIK"
                  value={formData.nik}
                  onChange={e => setFormData({ ...formData, nik: e.target.value })}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">No. HP / WhatsApp (Aktif) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: 08123456789"
                  value={formData.hpWa}
                  onChange={e => setFormData({ ...formData, hpWa: e.target.value, kontak: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Row 3: Kondisi Ekonomi & Wali */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Ayah Kandung *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nama lengkap ayah"
                  value={formData.namaAyah}
                  onChange={e => setFormData({ ...formData, namaAyah: e.target.value })}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Ibu Kandung *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nama lengkap ibu"
                  value={formData.namaIbu}
                  onChange={e => setFormData({ ...formData, namaIbu: e.target.value })}
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

            {/* Row 4: Alamat Terpisah */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Detail Pengisian Alamat Domisili</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blok / Jalan / No. Rumah *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Blok Cantilan No. 12"
                    value={formData.blok}
                    onChange={e => setFormData({ ...formData, blok: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">RT *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 003"
                    value={formData.rt}
                    onChange={e => setFormData({ ...formData, rt: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">RW *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 001"
                    value={formData.rw}
                    onChange={e => setFormData({ ...formData, rw: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Desa / Kelurahan *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Babakan"
                    value={formData.desaKelurahan}
                    onChange={e => setFormData({ ...formData, desaKelurahan: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kecamatan *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Ciwaringin"
                    value={formData.kecamatan}
                    onChange={e => setFormData({ ...formData, kecamatan: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kabupaten *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Cirebon"
                    value={formData.kabupaten}
                    onChange={e => setFormData({ ...formData, kabupaten: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Provinsi *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Jawa Barat"
                    value={formData.provinsi}
                    onChange={e => setFormData({ ...formData, provinsi: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kode Pos *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 45167"
                    value={formData.kodePos}
                    onChange={e => setFormData({ ...formData, kodePos: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-sm"
                  />
                </div>
                <div className="col-span-2 md:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alamat Email Mahasiswa</label>
                  <input 
                    type="email" 
                    placeholder="mhs@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox Kelengkapan Berkas (Mock Drag & Drop) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Kelengkapan Lampiran Dokumen Calon Penerima (Telah Diverifikasi Fisik)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
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
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-colors text-xs text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={berkasStatus.ktp}
                    onChange={e => setBerkasStatus({ ...berkasStatus, ktp: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Upload KTP</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-colors text-xs text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={berkasStatus.kk}
                    onChange={e => setBerkasStatus({ ...berkasStatus, kk: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Upload KK</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-colors text-xs text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={berkasStatus.foto}
                    onChange={e => setBerkasStatus({ ...berkasStatus, foto: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Upload Foto (Formal)</span>
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 pointer-events-auto"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm cursor-pointer"
            >
              Simpan & Daftarkan KIP
            </button>
          </div>
        </form>
      ) : (
        /* EXCEL IMPORTER INTERFACE */
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Upload Panel */}
            <div className="flex-1 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">1. Unggah File Excel / CSV</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sistem mendukung file dengan ekstensi <strong className="text-emerald-700">.xlsx, .xls, atau .csv</strong>. Pastikan file Excel Anda setidaknya memiliki kolom dengan header <strong className="text-emerald-700">Nama</strong> dan <strong className="text-emerald-700">NIM</strong>.
              </p>
              
              {/* Drag & Drop Area */}
              <label 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleExcelUpload(file);
                }}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : excelFileName 
                      ? 'border-emerald-300 bg-emerald-50/10' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full mb-3">
                  <Upload size={24} />
                </div>
                {excelFileName ? (
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800 mb-1">{excelFileName}</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Klik atau seret file baru untuk mengganti</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700 mb-1">Klik untuk memilih file atau seret file ke sini</p>
                    <p className="text-[10px] text-slate-400">Excel (.xlsx, .xls) atau CSV maks 2MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleExcelUpload(file);
                  }}
                  className="hidden" 
                />
              </label>

              {/* Template Section */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="text-slate-400" size={16} />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Belum memiliki format template?</p>
                    <p className="text-[10px] text-slate-500 font-medium">Gunakan contoh template standar kami agar data mahasiswa Anda langsung terpetakan.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <Download size={12} /> Unduh Template
                </button>
              </div>
            </div>

            {/* Guidelines Panel */}
            <div className="w-full md:w-80 bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-3">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aturan Nama Kolom (Header)</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Sistem dapat mendeteksi nama kolom secara fleksibel (tidak peka huruf besar-kecil). Berikut padanan yang didukung:
              </p>
              <ul className="space-y-2 text-[10px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700 shrink-0">Nama & NIM:</span> 
                  <span>nama lengkap, nim / nomor pendaftaran (Wajib)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700 shrink-0">NIK:</span> 
                  <span>nik, ktp, nomornik (16 digit)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700 shrink-0">Prodi:</span> 
                  <span>prodi, program studi, jurusan (KPI / PMI)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700 shrink-0">IPK:</span> 
                  <span>ipk, gpa, nilai (0.00 s/d 4.00)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700 shrink-0">Orang Tua:</span> 
                  <span>nama ayah, pekerjaan ayah, nama ibu, pekerjaan ibu, penghasilan orang tua, jumlah tanggungan</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700 shrink-0">Alamat Detail:</span> 
                  <span>blok/jalan, rt, rw, desa/kelurahan, kecamatan, kabupaten, provinsi, kode pos</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700 shrink-0">Status:</span> 
                  <span>status, tahap (Diterima, Verifikasi, dll)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Import Errors / Warnings */}
          {importErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertCircle size={16} />
                <span>Catatan Validasi Baris / Duplikasi:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-700 space-y-1">
                {importErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
              <p className="text-[10px] text-amber-500 font-medium">Baris yang bermasalah tidak akan dimasukkan. Pastikan tidak ada NIM ganda dengan database.</p>
            </div>
          )}

          {/* Preview Table */}
          {validatedStudents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. Pratinjau Data ({validatedStudents.length} Mahasiswa Siap Diimpor)
                </h4>
                <button
                  type="button"
                  onClick={resetExcelImportState}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} /> Bersihkan Data
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="px-4 py-2 text-[10px] uppercase">No</th>
                      <th className="px-4 py-2 text-[10px] uppercase">NIM</th>
                      <th className="px-4 py-2 text-[10px] uppercase">Nama Mahasiswa</th>
                      <th className="px-4 py-2 text-[10px] uppercase">Program Studi</th>
                      <th className="px-4 py-2 text-[10px] uppercase">Angkatan</th>
                      <th className="px-4 py-2 text-[10px] uppercase">IPK</th>
                      <th className="px-4 py-2 text-[10px] uppercase">Penghasilan Ortu</th>
                      <th className="px-4 py-2 text-[10px] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {validatedStudents.map((st, i) => (
                      <tr key={st.id} className="hover:bg-slate-50 bg-white">
                        <td className="px-4 py-2 font-mono text-slate-400 text-[10px]">{i + 1}</td>
                        <td className="px-4 py-2 font-mono font-bold text-slate-700">{st.nim}</td>
                        <td className="px-4 py-2 font-bold text-slate-900">{st.nama}</td>
                        <td className="px-4 py-2 text-slate-600">{st.prodi}</td>
                        <td className="px-4 py-2 text-slate-500">{st.angkatan}</td>
                        <td className="px-4 py-2 font-mono font-medium text-emerald-700">{st.ipk.toFixed(2)}</td>
                        <td className="px-4 py-2 text-slate-500">{formatRupiah(st.penghasilanOrtu)}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            st.status === 'Diterima' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            st.status === 'Pengganti' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            st.status === 'Verifikasi' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            st.status === 'Ditolak' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Action Buttons */}
              <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 font-medium">
                  Silakan periksa kembali pratinjau di atas. Klik "Konfirmasi & Impor Data" untuk menyimpan semua data mahasiswa tersebut.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetExcelImportState();
                      setShowAddForm(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} /> Konfirmasi & Impor Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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
                            student.status === 'Pengganti' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
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
