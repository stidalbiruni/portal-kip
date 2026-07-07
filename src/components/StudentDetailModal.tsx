import React, { useState, useEffect } from 'react';
import { 
  X, User, MapPin, Phone, Mail, FileText, Award, Landmark, 
  CheckCircle2, AlertTriangle, ShieldAlert, GraduationCap, Calendar, Edit, Save, RotateCcw
} from 'lucide-react';
import { StudentApplicant, ProgramStudi } from '../types';

interface StudentDetailModalProps {
  student: StudentApplicant | null;
  onClose: () => void;
  onUpdateStudent?: (updatedStudent: StudentApplicant) => void;
  prodis?: ProgramStudi[];
}

export default function StudentDetailModal({
  student,
  onClose,
  onUpdateStudent,
  prodis = []
}: StudentDetailModalProps) {
  if (!student) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<StudentApplicant>({ ...student });

  useEffect(() => {
    if (student) {
      setEditForm({ ...student });
      setIsEditing(false); // Reset edit state if student prop changes
    }
  }, [student]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diterima': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Verifikasi': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pendaftaran': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cadangan': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const handleSave = () => {
    if (onUpdateStudent) {
      onUpdateStudent(editForm);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ ...student });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-emerald-950 to-emerald-800 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-lg shadow-inner shrink-0">
              {(isEditing ? editForm.nama : student.nama).charAt(0)}
            </div>
            <div className="space-y-1">
              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${getStatusColor(isEditing ? editForm.status : student.status)}`}>
                {isEditing ? editForm.status : student.status}
              </span>
              <h3 className="font-serif font-bold text-lg leading-tight">
                {isEditing ? 'Mode Edit Data Mahasiswa' : student.nama}
              </h3>
              <p className="text-xs text-emerald-200 font-mono">
                {isEditing ? `Perbarui profil atas nama: ${student.nama}` : `NIM / ID: ${student.nim} • Angkatan ${student.angkatan}`}
              </p>
            </div>
          </div>
        </div>

        {/* Content body */}
        {isEditing ? (
          <div className="p-6 space-y-5 max-h-[450px] overflow-y-auto">
            {/* Academic & Contact Section */}
            <div>
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2.5 border-b pb-1 flex items-center gap-1">
                <GraduationCap size={14} /> I. Informasi Akademik & Kontak
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editForm.nama}
                    onChange={e => setEditForm({ ...editForm, nama: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">NIM / No. Pendaftaran *</label>
                  <input
                    type="text"
                    required
                    value={editForm.nim}
                    onChange={e => setEditForm({ ...editForm, nim: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Program Studi *</label>
                  <select
                    value={editForm.prodi}
                    onChange={e => setEditForm({ ...editForm, prodi: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  >
                    {prodis.map(p => (
                      <option key={p.id} value={p.nama}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Angkatan *</label>
                    <input
                      type="text"
                      required
                      value={editForm.angkatan}
                      onChange={e => setEditForm({ ...editForm, angkatan: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Semester *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="8"
                      value={editForm.semester}
                      onChange={e => setEditForm({ ...editForm, semester: Number(e.target.value) })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">No. Kontak HP/WA *</label>
                  <input
                    type="text"
                    required
                    value={editForm.kontak}
                    onChange={e => setEditForm({ ...editForm, kontak: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Alamat Lengkap *</label>
                  <textarea
                    required
                    rows={2}
                    value={editForm.alamat}
                    onChange={e => setEditForm({ ...editForm, alamat: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Social Economy Section */}
            <div>
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2.5 border-b pb-1 flex items-center gap-1">
                <Landmark size={14} /> II. Kondisi Sosial Ekonomi Orang Tua
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Pekerjaan Ayah</label>
                  <input
                    type="text"
                    value={editForm.pekerjaanAyah}
                    onChange={e => setEditForm({ ...editForm, pekerjaanAyah: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Pekerjaan Ibu</label>
                  <input
                    type="text"
                    value={editForm.pekerjaanIbu}
                    onChange={e => setEditForm({ ...editForm, pekerjaanIbu: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Pendapatan Orang Tua (Rp/Bulan) *</label>
                  <input
                    type="number"
                    required
                    value={editForm.penghasilanOrtu}
                    onChange={e => setEditForm({ ...editForm, penghasilanOrtu: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Jumlah Tanggungan Anak *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editForm.jumlahTanggungan}
                    onChange={e => setEditForm({ ...editForm, jumlahTanggungan: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2.5 border-b pb-1 flex items-center gap-1">
                <FileText size={14} /> III. Kelengkapan Berkas Fisik
              </h4>
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.berkas.kartuKip}
                    onChange={e => setEditForm({
                      ...editForm,
                      berkas: { ...editForm.berkas, kartuKip: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Kartu Indonesia Pintar (KIP / KKS / PKH)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.berkas.sktm}
                    onChange={e => setEditForm({
                      ...editForm,
                      berkas: { ...editForm.berkas, sktm: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Surat Keterangan Tidak Mampu (SKTM)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.berkas.slipGaji}
                    onChange={e => setEditForm({
                      ...editForm,
                      berkas: { ...editForm.berkas, slipGaji: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Slip Gaji Orang Tua / Wali / Keterangan Penghasilan RT-RW</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.berkas.raport}
                    onChange={e => setEditForm({
                      ...editForm,
                      berkas: { ...editForm.berkas, raport: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Salinan Rapor Akademik (Semester 1-5)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.berkas.prestasiDoc}
                    onChange={e => setEditForm({
                      ...editForm,
                      berkas: { ...editForm.berkas, prestasiDoc: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Piagam Penghargaan / Prestasi Penunjang</span>
                </label>
              </div>
            </div>

            {/* Status & Achievements Section */}
            <div>
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2.5 border-b pb-1 flex items-center gap-1">
                <Award size={14} /> IV. Status & Riwayat Prestasi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Status Beasiswa</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as StudentApplicant['status'] })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold text-slate-800"
                  >
                    <option value="Pendaftaran">Pendaftaran</option>
                    <option value="Verifikasi">Verifikasi</option>
                    <option value="Diterima">Diterima</option>
                    <option value="Ditolak">Ditolak</option>
                    <option value="Cadangan">Cadangan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Riwayat Prestasi (Dipisah Koma)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Juara 1 MTQ, Juara 3 Pidato"
                    value={editForm.prestasi.join(', ')}
                    onChange={e => setEditForm({
                      ...editForm,
                      prestasi: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Catatan Tambahan / Rekomendasi Komite</label>
                  <textarea
                    rows={2}
                    value={editForm.catatan}
                    onChange={e => setEditForm({ ...editForm, catatan: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[450px] overflow-y-auto">
            {/* Left Panel: Personal & Family Economics */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">I. Informasi Akademik & Kontak</h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="flex items-center gap-2"><GraduationCap size={14} className="text-slate-400" /> <span className="font-semibold text-slate-800">{student.prodi}</span></p>
                  <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> <span>{student.kontak || '-'}</span></p>
                  <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> <span className="underline">{student.email || '-'}</span></p>
                  <p className="flex items-start gap-2"><MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" /> <span className="leading-snug">{student.alamat}</span></p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">II. Kondisi Sosial Ekonomi Orang Tua</h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pekerjaan Ayah:</span>
                    <span className="font-semibold">{student.pekerjaanAyah}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pekerjaan Ibu:</span>
                    <span className="font-semibold">{student.pekerjaanIbu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pendapatan Gabungan:</span>
                    <span className="font-bold text-red-600">{formatRupiah(student.penghasilanOrtu)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jumlah Tanggungan:</span>
                    <span className="font-semibold">{student.jumlahTanggungan} Anak</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Documents & Achievements */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">III. Kelengkapan Berkas Fisik</h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {Object.entries({
                    'Kartu Indonesia Pintar (KIP)': student.berkas.kartuKip,
                    'Surat Keterangan Tidak Mampu': student.berkas.sktm,
                    'Slip Gaji Orang Tua / Wali': student.berkas.slipGaji,
                    'Salinan Rapor Akademik': student.berkas.raport,
                    'Piagam Penghargaan / Prestasi': student.berkas.prestasiDoc
                  }).map(([name, isPresent], i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 text-xs">
                      <span className="text-slate-600">{name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isPresent ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isPresent ? 'Lengkap' : 'Tidak Ada'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">IV. Riwayat Prestasi</h4>
                {student.prestasi.length > 0 ? (
                  <div className="space-y-1.5">
                    {student.prestasi.map((p, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 bg-emerald-50/50 p-2 rounded border border-emerald-100/30">
                        <Award size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                        <span className="leading-tight font-medium">{p}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Tidak ada piagam prestasi formal terlampir.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes section */}
        {!isEditing && (
          <div className="bg-slate-50 p-4 border-t border-slate-100 text-xs">
            <p className="font-bold text-slate-800 mb-1">Catatan Tambahan Komite Beasiswa:</p>
            <p className="text-slate-600 leading-relaxed italic">
              "{student.catatan || 'Tidak ada catatan khusus.'}"
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            {onUpdateStudent && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Edit size={14} /> Edit Data
              </button>
            )}
            {isEditing && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSave}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save size={14} /> Simpan Perubahan
                </button>
                <button 
                  onClick={handleCancel}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Batal
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {isEditing ? 'Batal & Tutup' : 'Tutup Informasi'}
          </button>
        </div>
      </div>
    </div>
  );
}
