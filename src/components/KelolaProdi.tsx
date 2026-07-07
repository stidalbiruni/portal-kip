import React, { useState } from 'react';
import { 
  BookOpen, Plus, Edit2, Trash2, Check, X, 
  Users, HelpCircle, Save, Info, AlertCircle 
} from 'lucide-react';
import { ProgramStudi, StudentApplicant } from '../types';

interface KelolaProdiProps {
  prodis: ProgramStudi[];
  applicants: StudentApplicant[];
  onAddProdi: (prodi: Omit<ProgramStudi, 'id'>) => boolean;
  onUpdateProdi: (prodi: ProgramStudi) => void;
  onDeleteProdi: (id: string) => boolean;
}

export default function KelolaProdi({
  prodis,
  applicants,
  onAddProdi,
  onUpdateProdi,
  onDeleteProdi
}: KelolaProdiProps) {
  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProdi, setEditingProdi] = useState<ProgramStudi | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Field States
  const [formState, setFormState] = useState({
    nama: '',
    kode: '',
    deskripsi: ''
  });

  // Calculate Student Count for each prodi name
  const getStudentCount = (prodiName: string) => {
    return applicants.filter(app => app.prodi === prodiName).length;
  };

  // Open Form to Create
  const handleOpenCreate = () => {
    setEditingProdi(null);
    setFormState({
      nama: '',
      kode: '',
      deskripsi: ''
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Open Form to Edit
  const handleOpenEdit = (prodi: ProgramStudi) => {
    setEditingProdi(prodi);
    setFormState({
      nama: prodi.nama,
      kode: prodi.kode,
      deskripsi: prodi.deskripsi || ''
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedNama = formState.nama.trim();
    const trimmedKode = formState.kode.trim().toUpperCase();
    const trimmedDeskripsi = formState.deskripsi.trim();

    if (!trimmedNama || !trimmedKode) {
      setErrorMsg('Nama Program Studi dan Kode wajib diisi.');
      return;
    }

    // Validation for duplicates when creating or editing kode
    const isDuplicateKode = prodis.some(
      p => p.kode === trimmedKode && (!editingProdi || p.id !== editingProdi.id)
    );
    if (isDuplicateKode) {
      setErrorMsg(`Kode Program Studi "${trimmedKode}" sudah digunakan oleh prodi lain.`);
      return;
    }

    const isDuplicateNama = prodis.some(
      p => p.nama.toLowerCase() === trimmedNama.toLowerCase() && (!editingProdi || p.id !== editingProdi.id)
    );
    if (isDuplicateNama) {
      setErrorMsg(`Nama Program Studi "${trimmedNama}" sudah ada.`);
      return;
    }

    if (editingProdi) {
      // Save edit
      onUpdateProdi({
        id: editingProdi.id,
        nama: trimmedNama,
        kode: trimmedKode,
        deskripsi: trimmedDeskripsi
      });
      setIsFormOpen(false);
    } else {
      // Add new
      const success = onAddProdi({
        nama: trimmedNama,
        kode: trimmedKode,
        deskripsi: trimmedDeskripsi
      });
      if (success) {
        setIsFormOpen(false);
      } else {
        setErrorMsg('Gagal menambahkan Program Studi.');
      }
    }
  };

  // Handle Delete
  const handleDeleteClick = (prodi: ProgramStudi) => {
    const studentCount = getStudentCount(prodi.nama);
    if (studentCount > 0) {
      alert(`Tidak dapat menghapus Program Studi "${prodi.nama}" karena masih memiliki ${studentCount} mahasiswa aktif.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus Program Studi "${prodi.nama}" (${prodi.kode})?`)) {
      onDeleteProdi(prodi.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-600" />
            Kelola Program Studi (Prodi)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi daftar Program Studi aktif penerima beasiswa STID Al-Biruni.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={14} /> Tambah Prodi Baru
        </button>
      </div>

      {/* Grid of study programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {prodis.map(prodi => {
          const studentsCount = getStudentCount(prodi.nama);
          return (
            <div 
              key={prodi.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-100">
                      {prodi.kode}
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-800 transition-colors">
                        {prodi.nama}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                        Kode Resmi: <span className="font-mono font-semibold text-slate-600">{prodi.kode}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(prodi)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Program Studi"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(prodi)}
                      className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Program Studi"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed min-h-[40px] whitespace-pre-wrap">
                  {prodi.deskripsi || 'Tidak ada deskripsi profil untuk program studi ini.'}
                </p>
              </div>

              {/* Card Footer Statistics */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium bg-slate-50/50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Users size={12} className="text-slate-400" />
                  Mahasiswa Terdaftar KIP-K:
                </span>
                <span className="font-bold text-xs text-slate-800 px-2 py-0.5 bg-white border border-slate-200 rounded-full shadow-2xs">
                  {studentsCount} Mahasiswa
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FORM MODAL (Add / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-400" />
                <h3 className="font-serif font-bold text-sm tracking-tight">
                  {editingProdi ? 'Edit Data Program Studi' : 'Tambah Program Studi Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-[11px] text-rose-700 font-semibold">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Kode Prodi */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kode Singkat Prodi *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Contoh: KPI, PMI, MD, AKS"
                  value={formState.kode}
                  onChange={e => setFormState({ ...formState, kode: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono font-bold uppercase text-slate-800"
                />
                <span className="block text-[9px] text-slate-400 mt-1">
                  Singkatan resmi program studi, digunakan sebagai identitas logo dan pelaporan.
                </span>
              </div>

              {/* Nama Prodi */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Lengkap Program Studi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Komunikasi Penyiaran Islam (KPI)"
                  value={formState.nama}
                  onChange={e => setFormState({ ...formState, nama: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold text-slate-800"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Deskripsi / Profil Singkat
                </label>
                <textarea
                  rows={3}
                  placeholder="Ketik profil singkat, keunggulan, atau prospek lulusan prodi ini..."
                  value={formState.deskripsi}
                  onChange={e => setFormState({ ...formState, deskripsi: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 text-slate-700 leading-relaxed"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Save size={14} /> Simpan Data
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
