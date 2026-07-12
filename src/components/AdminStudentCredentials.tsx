import React, { useState } from 'react';
import { 
  Key, Search, Eye, EyeOff, Copy, Check, Lock, Edit3, Save, 
  X, AlertCircle, RefreshCw, UserCheck
} from 'lucide-react';
import { StudentApplicant } from '../types';

interface AdminStudentCredentialsProps {
  applicants: StudentApplicant[];
  onUpdateApplicant: (updated: StudentApplicant) => void;
}

export default function AdminStudentCredentials({ 
  applicants, 
  onUpdateApplicant 
}: AdminStudentCredentialsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // State for editing password
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Search and filter students (only show those who have registered email/credentials)
  const filteredStudents = applicants.filter(student => {
    const matchesSearch = 
      student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nim.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEdit = (student: StudentApplicant) => {
    setEditingId(student.id);
    setNewPassword(student.password || student.nim);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewPassword('');
  };

  const savePassword = (student: StudentApplicant) => {
    if (!newPassword.trim()) return;
    
    const updated: StudentApplicant = {
      ...student,
      password: newPassword.trim()
    };
    onUpdateApplicant(updated);
    setEditingId(null);
  };

  // Helper to ensure student has a password (fallback to default to NIM if undefined)
  const getPassword = (student: StudentApplicant) => {
    return student.password || student.nim;
  };

  return (
    <div className="space-y-6" id="admin-credentials-panel">
      {/* Header section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="text-emerald-600" size={22} />
            Data Kredensial & Akun Mahasiswa
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data masuk (login) mahasiswa, lihat kata sandi, dan lakukan penyetelan ulang sandi jika diperlukan.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 w-full md:w-64 bg-slate-50 font-medium"
          />
        </div>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">Keamanan Akses Operator & Informasi Login</p>
          <p className="leading-relaxed">
            Mahasiswa yang didaftarkan secara manual oleh Admin atau diimpor secara massal otomatis dapat login menggunakan <strong>NIM</strong> mereka sebagai kata sandi (password) bawaan awal. Data sandi ditampilkan di bawah untuk memudahkan Operator membantu mahasiswa. Jaga kerahasiaan data ini.
          </p>
        </div>
      </div>

      {/* Accounts Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Mahasiswa / NIM</th>
                <th className="py-3.5 px-4">Program Studi</th>
                <th className="py-3.5 px-4">Email Login</th>
                <th className="py-3.5 px-4">Kata Sandi</th>
                <th className="py-3.5 px-5 text-right">Aksi Penyetelan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const passwordText = getPassword(student);
                  const isVisible = visiblePasswords[student.id];
                  const isEditing = editingId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & NIM */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          {student.nama}
                          {student.examResult && (
                            <span 
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-[9px] text-emerald-700 border border-emerald-100 font-bold"
                              title={`Sudah Ujian: Skor ${student.examResult.score}`}
                            >
                              <UserCheck size={10} /> Tes Ok
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIM/ID: {student.nim}</div>
                      </td>

                      {/* Study Program */}
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {student.prodi}
                      </td>

                      {/* Email address */}
                      <td className="py-4 px-4 font-mono text-slate-600 font-medium">
                        {student.email}
                      </td>

                      {/* Password Field */}
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2 max-w-xs">
                            <input
                              type="text"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="p-1 px-2 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-emerald-600 w-32 bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => savePassword(student)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm"
                              title="Simpan"
                            >
                              <Save size={13} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded"
                              title="Batal"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold tracking-wider">
                              {isVisible ? passwordText : '••••••••'}
                            </span>
                            
                            {/* Toggle visibility */}
                            <button
                              onClick={() => togglePasswordVisibility(student.id)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded"
                              title={isVisible ? "Sembunyikan Sandi" : "Tampilkan Sandi"}
                            >
                              {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>

                            {/* Copy button */}
                            <button
                              onClick={() => handleCopy(student.id, passwordText)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded"
                              title="Salin Kata Sandi"
                            >
                              {copiedId === student.id ? (
                                <Check size={13} className="text-emerald-600 animate-scaleIn" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        {!isEditing && (
                          <button
                            onClick={() => startEdit(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded transition-all shadow-sm"
                          >
                            <Edit3 size={11} /> Ubah Sandi
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada akun mahasiswa yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
