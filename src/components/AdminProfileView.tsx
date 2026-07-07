import React, { useState } from 'react';
import { 
  User, Mail, Phone, ShieldCheck, Save, Key, AlertTriangle, 
  CheckCircle2, Upload, Briefcase, FileSignature, Trash2 
} from 'lucide-react';

export interface AdminProfile {
  namaLengkap: string;
  email: string;
  kontak: string;
  jabatan: string;
  nip: string;
  avatarUrl: string;
  password?: string;
}

interface AdminProfileViewProps {
  profile: AdminProfile;
  onSave: (updated: AdminProfile) => void;
}

export default function AdminProfileView({ profile, onSave }: AdminProfileViewProps) {
  // Profile Form States
  const [form, setForm] = useState<AdminProfile>({
    namaLengkap: profile.namaLengkap,
    email: profile.email,
    kontak: profile.kontak,
    jabatan: profile.jabatan,
    nip: profile.nip,
    avatarUrl: profile.avatarUrl
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Avatar Upload Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileError('');
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileError('Format file harus berupa gambar.');
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        setProfileError('Ukuran foto maksimal adalah 1MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ ...prev, avatarUrl: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setForm(prev => ({ ...prev, avatarUrl: '' }));
  };

  // Submit Profile Changes
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!form.namaLengkap.trim()) {
      setProfileError('Nama Lengkap wajib diisi.');
      return;
    }
    if (!form.email.trim()) {
      setProfileError('Email wajib diisi.');
      return;
    }

    onSave({
      ...profile,
      namaLengkap: form.namaLengkap.trim(),
      email: form.email.trim(),
      kontak: form.kontak.trim(),
      jabatan: form.jabatan.trim(),
      nip: form.nip.trim(),
      avatarUrl: form.avatarUrl
    });

    setProfileSuccess('Profil Operator berhasil disimpan!');
    setTimeout(() => setProfileSuccess(''), 4000);
  };

  // Submit Password Change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    const actualPassword = profile.password || 'admin';

    if (currentPassword !== actualPassword) {
      setPasswordError('Password saat ini tidak cocok.');
      return;
    }
    if (newPassword.length < 5) {
      setPasswordError('Password baru minimal 5 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    onSave({
      ...profile,
      password: newPassword
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess('Password Operator berhasil diperbarui!');
    setTimeout(() => setPasswordSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
          <User size={18} className="text-emerald-700" />
          Pengaturan Akun & Profil Operator
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi data identitas pengelola KIP Kuliah STID Al-Biruni serta kelola keamanan kata sandi login di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PROFILE DATA EDIT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center gap-2">
              <FileSignature size={16} className="text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Lengkapi Informasi Profil</h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
              {profileSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-bold">
                  <CheckCircle2 size={15} />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-bold">
                  <AlertTriangle size={15} />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="relative">
                  {form.avatarUrl ? (
                    <img 
                      src={form.avatarUrl} 
                      alt="Avatar Preview" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg border-2 border-slate-200">
                      {form.namaLengkap ? form.namaLengkap.slice(0, 2).toUpperCase() : 'OP'}
                    </div>
                  )}
                </div>

                <div className="text-center sm:text-left space-y-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Foto Profil Pengelola</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <input 
                      type="file" 
                      id="operator-avatar" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                    />
                    <label 
                      htmlFor="operator-avatar"
                      className="cursor-pointer px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Upload size={11} /> Pilih Foto
                    </label>
                    {form.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={11} /> Hapus
                      </button>
                    )}
                  </div>
                  <span className="block text-[9px] text-slate-400">Rekomendasi rasio persegi, maks. 1MB.</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Lengkap Operator *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User size={13} />
                    </span>
                    <input 
                      type="text" required
                      value={form.namaLengkap}
                      onChange={e => setForm({ ...form, namaLengkap: e.target.value })}
                      placeholder="Contoh: H. Syarifuddin, M.A."
                      className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Operator *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail size={13} />
                    </span>
                    <input 
                      type="email" required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="Contoh: stid.cirebon@gmail.com"
                      className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">No. Kontak / WhatsApp</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone size={13} />
                    </span>
                    <input 
                      type="text"
                      value={form.kontak}
                      onChange={e => setForm({ ...form, kontak: e.target.value })}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-medium text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jabatan / Peran Pengelola</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Briefcase size={13} />
                    </span>
                    <input 
                      type="text"
                      value={form.jabatan}
                      onChange={e => setForm({ ...form, jabatan: e.target.value })}
                      placeholder="Contoh: Kepala Bagian Kemahasiswaan"
                      className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">NIP / NIDN Resmi</label>
                  <input 
                    type="text"
                    value={form.nip}
                    onChange={e => setForm({ ...form, nip: e.target.value })}
                    placeholder="Masukkan NIP / NIDN (opsional)"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-medium text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={13} /> Simpan Data Profil
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY SETTINGS */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center gap-2">
              <Key size={16} className="text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Ubah Password Login</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Password Saat Ini *</label>
                <input 
                  type="password" required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Password saat ini"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Password Baru * (Min. 5 Huruf)</label>
                <input 
                  type="password" required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Konfirmasi Password Baru *</label>
                <input 
                  type="password" required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck size={14} /> Perbarui Password
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
