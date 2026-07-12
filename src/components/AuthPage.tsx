import React, { useState } from 'react';
import { 
  GraduationCap, ShieldCheck, KeyRound, User, Mail, 
  Phone, MapPin, Eye, EyeOff, BookOpen, UserPlus, 
  ArrowRight, AlertCircle, Sparkles, CheckCircle2 
} from 'lucide-react';
import { StudentApplicant, ProgramStudi } from '../types';
import AlBiruniLogo from './AlBiruniLogo';

interface AuthPageProps {
  applicants: StudentApplicant[];
  prodis: ProgramStudi[];
  onRegisterStudent: (newStudent: Omit<StudentApplicant, 'skorKriteria' | 'berkas' | 'catatan'> & { password: string }) => boolean;
  onLoginSuccess: (role: 'admin' | 'student', studentData?: StudentApplicant) => void;
  onResetStudentPassword?: (nim: string, newPassword: string) => boolean;
}

export default function AuthPage({
  applicants,
  prodis,
  onRegisterStudent,
  onLoginSuccess,
  onResetStudentPassword
}: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login-student' | 'login-admin' | 'register'>('login-student');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<1 | 2>(1); // 1: verify, 2: reset
  const [forgotForm, setForgotForm] = useState({
    nim: '',
    verificationField: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [verifiedStudentId, setVerifiedStudentId] = useState<string | null>(null);

  // Login Form States
  const [loginForm, setLoginForm] = useState({
    nim: '',
    email: '',
    password: ''
  });

  // Register Form States
  const [registerForm, setRegisterForm] = useState({
    nama: '',
    nim: '',
    prodi: prodis[0]?.nama || 'Komunikasi Penyiaran Islam (KPI)',
    semester: 1,
    angkatan: '2026',
    email: '',
    kontak: '',
    alamat: '',
    pekerjaanAyah: '',
    pekerjaanIbu: '',
    penghasilanOrtu: '',
    jumlahTanggungan: '2',
    prestasi: '',
    password: '',
    confirmPassword: ''
  });

  // Sync prodi selection if prodis list changes
  React.useEffect(() => {
    if (prodis.length > 0 && !prodis.some(p => p.nama === registerForm.prodi)) {
      setRegisterForm(prev => ({ ...prev, prodi: prodis[0].nama }));
    }
  }, [prodis]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'login-student') {
      const trimmedNim = loginForm.nim.trim();
      const enteredPass = loginForm.password;

      if (!trimmedNim || !enteredPass) {
        setErrorMsg('NIM dan Password wajib diisi.');
        return;
      }

      // Find the student
      const student = applicants.find(app => app.nim === trimmedNim);

      if (!student) {
        setErrorMsg('NIM tidak terdaftar sebagai penerima KIP Kuliah.');
        return;
      }

      // Check password. If the student doesn't have a password yet (mock data), their default password is their NIM
      const studentPassword = student.password || student.nim;

      if (enteredPass !== studentPassword) {
        setErrorMsg('Password yang Anda masukkan salah.');
        return;
      }

      onLoginSuccess('student', student);
    } else {
      // Admin Login
      const trimmedEmail = loginForm.email.trim().toLowerCase();
      const enteredPass = loginForm.password;

      if (!trimmedEmail || !enteredPass) {
        setErrorMsg('Email dan Password wajib diisi.');
        return;
      }

      // Dynamic or Predefined Admin Credentials
      let adminEmail = 'stid.cirebon@gmail.com';
      let adminPass = 'admin';

      const savedAdminProfile = localStorage.getItem('kip_admin_profile');
      if (savedAdminProfile) {
        try {
          const parsed = JSON.parse(savedAdminProfile);
          if (parsed.email) adminEmail = parsed.email.trim().toLowerCase();
          if (parsed.password) adminPass = parsed.password;
        } catch (e) {}
      }

      if (trimmedEmail === adminEmail && enteredPass === adminPass) {
        onLoginSuccess('admin');
      } else {
        setErrorMsg('Kredensial Administrator salah.');
      }
    }
  };

  // Forgot Password handlers
  const handleVerifyAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedNim = forgotForm.nim.trim();
    const verifVal = forgotForm.verificationField.trim();

    if (!trimmedNim || !verifVal) {
      setErrorMsg('NIM dan data verifikasi wajib diisi.');
      return;
    }

    const student = applicants.find(app => app.nim === trimmedNim);

    if (!student) {
      setErrorMsg('NIM tidak terdaftar sebagai mahasiswa KIP Kuliah.');
      return;
    }

    // Verify NIK or WhatsApp/Kontak
    const matchesNik = student.nik && student.nik.trim() === verifVal;
    const matchesKontak = (student.kontak && student.kontak.trim() === verifVal) || 
                          (student.hpWa && student.hpWa.trim() === verifVal);

    if (!matchesNik && !matchesKontak) {
      setErrorMsg('Verifikasi Gagal: NIK atau Nomor WhatsApp yang dimasukkan tidak cocok dengan data pendaftaran Anda.');
      return;
    }

    setVerifiedStudentId(student.id);
    setForgotPasswordStep(2);
    setSuccessMsg('Akun terverifikasi dengan sukses! Silakan tentukan kata sandi baru Anda.');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!verifiedStudentId) return;

    const student = applicants.find(app => app.id === verifiedStudentId);
    if (!student) return;

    if (forgotForm.newPassword.length < 5) {
      setErrorMsg('Kata sandi baru minimal terdiri dari 5 karakter.');
      return;
    }

    if (forgotForm.newPassword !== forgotForm.confirmNewPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    if (onResetStudentPassword) {
      const success = onResetStudentPassword(student.nim, forgotForm.newPassword);
      if (success) {
        setSuccessMsg(`Kata sandi untuk ${student.nama} berhasil disetel ulang! Silakan masuk.`);
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setLoginForm(prev => ({ ...prev, nim: student.nim, password: forgotForm.newPassword }));
        setForgotForm({ nim: '', verificationField: '', newPassword: '', confirmNewPassword: '' });
        setVerifiedStudentId(null);
      } else {
        setErrorMsg('Gagal memperbarui kata sandi. Silakan coba beberapa saat lagi.');
      }
    } else {
      // Local fallback
      student.password = forgotForm.newPassword;
      setSuccessMsg(`Kata sandi untuk ${student.nama} berhasil disetel ulang! Silakan masuk.`);
      setShowForgotPassword(false);
      setForgotPasswordStep(1);
      setLoginForm(prev => ({ ...prev, nim: student.nim, password: forgotForm.newPassword }));
      setForgotForm({ nim: '', verificationField: '', newPassword: '', confirmNewPassword: '' });
      setVerifiedStudentId(null);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const form = registerForm;
    const trimmedNama = form.nama.trim();
    const trimmedNim = form.nim.trim();
    const trimmedEmail = form.email.trim();
    const trimmedKontak = form.kontak.trim();
    const trimmedAlamat = form.alamat.trim();
    const parsedPenghasilan = parseFloat(form.penghasilanOrtu) || 0;
    const parsedTanggungan = parseInt(form.jumlahTanggungan) || 0;

    // Validate fields
    if (!trimmedNama || !trimmedNim || !form.password || !form.confirmPassword) {
      setErrorMsg('Harap lengkapi semua bidang wajib.');
      return;
    }

    if (form.password.length < 5) {
      setErrorMsg('Password minimal terdiri dari 5 karakter.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    // Check if NIM is already registered
    const isNimTaken = applicants.some(app => app.nim === trimmedNim);
    if (isNimTaken) {
      setErrorMsg(`Mahasiswa dengan NIM ${trimmedNim} sudah terdaftar.`);
      return;
    }

    // Convert comma-separated prestasi to array
    const prestasiArray = form.prestasi
      ? form.prestasi.split(',').map(p => p.trim()).filter(Boolean)
      : [];

    // Save student
    const success = onRegisterStudent({
      id: Math.random().toString(36).substr(2, 9),
      nama: trimmedNama,
      nim: trimmedNim,
      prodi: form.prodi,
      semester: Number(form.semester),
      angkatan: form.angkatan,
      ipk: 0, // Freshly registered gets 0 or custom IPK initially
      penghasilanOrtu: parsedPenghasilan,
      pekerjaanAyah: form.pekerjaanAyah.trim() || 'Buruh',
      pekerjaanIbu: form.pekerjaanIbu.trim() || 'Ibu Rumah Tangga',
      jumlahTanggungan: parsedTanggungan,
      prestasi: prestasiArray,
      status: 'Pendaftaran', // Initial status
      kontak: trimmedKontak,
      alamat: trimmedAlamat,
      email: trimmedEmail,
      password: form.password
    });

    if (success) {
      setSuccessMsg('Pendaftaran Berhasil! Silakan masuk menggunakan NIM dan Password Anda.');
      // Auto fill NIM in login form
      setLoginForm(prev => ({ ...prev, nim: trimmedNim, password: '' }));
      setActiveTab('login-student');
      // Reset register form
      setRegisterForm({
        nama: '',
        nim: '',
        prodi: prodis[0]?.nama || 'Komunikasi Penyiaran Islam (KPI)',
        semester: 1,
        angkatan: '2026',
        email: '',
        kontak: '',
        alamat: '',
        pekerjaanAyah: '',
        pekerjaanIbu: '',
        penghasilanOrtu: '',
        jumlahTanggungan: '2',
        prestasi: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setErrorMsg('Pendaftaran gagal. Silakan coba kembali.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 animate-fade-in">
      
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-5xl w-full overflow-hidden flex flex-col md:flex-row min-h-[620px]">
        
        {/* Left Branding Panel (Hidden on mobile) */}
        <div className="md:w-5/12 bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow decorative lines */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl -ml-16 -mb-16"></div>

          {/* Logo & Institution */}
          <div className="relative space-y-3">
            <div className="w-16 h-16 bg-white rounded-full overflow-hidden flex items-center justify-center shadow-lg">
              <AlBiruniLogo className="w-full h-full" />
            </div>
            <div>
              <h2 className="font-serif font-extrabold text-lg tracking-tight text-white leading-tight">
                STID Al-Biruni
              </h2>
              <p className="text-emerald-400 font-sans text-[11px] font-bold uppercase tracking-wider">
                Portal Beasiswa KIP Kuliah
              </p>
            </div>
          </div>

          {/* Core Info / Slogan */}
          <div className="relative space-y-6 my-10 md:my-0">
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-100 leading-tight">
                Sistem Pendaftaran & Monitoring KIP-K Terpadu
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Memudahkan calon mahasiswa dan penerima beasiswa aktif mengelola berkas, memonitor status akademik, dan memantau pencairan bantuan.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center">
                  <Sparkles size={11} />
                </div>
                <span>Pendaftaran Mandiri & Cepat</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center">
                  <Sparkles size={11} />
                </div>
                <span>Monev Hafalan & Dakwah Transparan</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-5 h-5 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center">
                  <Sparkles size={11} />
                </div>
                <span>Pencairan Terjadwal & Akurat</span>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div className="relative text-[10px] text-slate-500">
            © {new Date().getFullYear()} STID Al-Biruni Babakan Ciwaringin.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              onClick={() => {
                setActiveTab('login-student');
                setErrorMsg('');
                setSuccessMsg('');
                setShowForgotPassword(false);
              }}
              className={`pb-3 text-xs font-bold tracking-tight border-b-2 px-3 transition-colors ${
                activeTab === 'login-student'
                  ? 'border-emerald-600 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Masuk Mahasiswa
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                setSuccessMsg('');
                setShowForgotPassword(false);
              }}
              className={`pb-3 text-xs font-bold tracking-tight border-b-2 px-3 transition-colors ${
                activeTab === 'register'
                  ? 'border-emerald-600 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Daftar Mahasiswa
            </button>
            <button
              onClick={() => {
                setActiveTab('login-admin');
                setErrorMsg('');
                setSuccessMsg('');
                setShowForgotPassword(false);
              }}
              className={`pb-3 text-xs font-bold tracking-tight border-b-2 px-3 transition-colors ${
                activeTab === 'login-admin'
                  ? 'border-emerald-600 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Masuk Admin
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Content */}
          {showForgotPassword ? (
            /* FORGOT PASSWORD FORM */
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound size={18} className="text-emerald-600" />
                  Atur Ulang Kata Sandi
                </h3>
                <p className="text-xs text-slate-400">
                  {forgotPasswordStep === 1 
                    ? 'Verifikasi akun Anda terlebih dahulu menggunakan data terdaftar.' 
                    : 'Tentukan kata sandi baru untuk akun KIP Kuliah Anda.'}
                </p>
              </div>

              {forgotPasswordStep === 1 ? (
                /* Step 1: Verification */
                <form onSubmit={handleVerifyAccount} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Nomor Induk Mahasiswa (NIM)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <User size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Masukkan NIM Anda"
                        value={forgotForm.nim}
                        onChange={e => setForgotForm({ ...forgotForm, nim: e.target.value })}
                        className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      NIK atau No. WhatsApp Terdaftar
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Phone size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: NIK (16 digit) atau No. HP"
                        value={forgotForm.verificationField}
                        onChange={e => setForgotForm({ ...forgotForm, verificationField: e.target.value })}
                        className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                      />
                    </div>
                    <span className="block text-[9px] text-slate-400 mt-1 leading-normal">
                      * Masukkan NIK (misal: 3209...) atau No. HP/WhatsApp Anda yang terdaftar pada sistem Beasiswa KIP Kuliah.
                    </span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      Verifikasi Akun <ArrowRight size={13} />
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Reset Password */
                <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <KeyRound size={14} />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="Minimal 5 karakter"
                        value={forgotForm.newPassword}
                        onChange={e => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                        className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <KeyRound size={14} />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="Ulangi kata sandi baru"
                        value={forgotForm.confirmNewPassword}
                        onChange={e => setForgotForm({ ...forgotForm, confirmNewPassword: e.target.value })}
                        className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordStep(1);
                        setVerifiedStudentId(null);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      Simpan Sandi Baru <ArrowRight size={13} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : activeTab !== 'register' ? (
            /* LOGIN FORM (Student & Admin) */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {activeTab === 'login-student' ? 'Selamat Datang Kembali!' : 'Akses Operator & Pengelola'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeTab === 'login-student' 
                    ? 'Silakan masuk menggunakan NIM dan Password akun KIP Anda.' 
                    : 'Gunakan akun administrator kemahasiswaan STID Al-Biruni.'}
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {activeTab === 'login-student' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Nomor Induk Mahasiswa (NIM)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <User size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Masukkan NIM (contoh: 202410101)"
                        value={loginForm.nim}
                        onChange={e => setLoginForm({ ...loginForm, nim: e.target.value })}
                        className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                      />
                    </div>
                    <span className="block text-[9px] text-slate-400 mt-1">
                      * Untuk mahasiswa bawaan/mock, password default adalah NIM masing-masing.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Email Operator
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Mail size={14} />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="operator@stid-albiruni.ac.id"
                        value={loginForm.email}
                        onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="w-full text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                      />
                    </div>

                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Kata Sandi (Password)
                    </label>
                    {activeTab === 'login-student' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setForgotPasswordStep(1);
                          setErrorMsg('');
                          setSuccessMsg('');
                          setForgotForm({ nim: '', verificationField: '', newPassword: '', confirmNewPassword: '' });
                        }}
                        className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline animate-pulse"
                      >
                        Lupa Kata Sandi?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <KeyRound size={14} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full text-xs pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                Masuk ke Sistem <ArrowRight size={13} />
              </button>
            </form>
          ) : (
            /* REGISTER FORM (Student) */
            <form onSubmit={handleRegister} className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Registrasi Mahasiswa Baru KIP-K</h3>
                <p className="text-xs text-slate-400">
                  Lengkapi formulir registrasi di bawah untuk mendaftarkan diri sebagai penerima beasiswa KIP Kuliah.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                
                {/* Section 1: Identitas Utama */}
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block mb-2">
                    1. Identitas Akademik & Akun
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Muhammad Yusuf"
                        value={registerForm.nama}
                        onChange={e => setRegisterForm({ ...registerForm, nama: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">NIM / Nomor Pendaftaran *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 202610221"
                        value={registerForm.nim}
                        onChange={e => setRegisterForm({ ...registerForm, nim: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Program Studi *</label>
                      <select
                        value={registerForm.prodi}
                        onChange={e => setRegisterForm({ ...registerForm, prodi: e.target.value })}
                        className="w-full text-xs px-2.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium text-slate-700"
                      >
                        {prodis.map(p => (
                          <option key={p.id} value={p.nama}>{p.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Semester *</label>
                        <select
                          value={registerForm.semester}
                          onChange={e => setRegisterForm({ ...registerForm, semester: Number(e.target.value) })}
                          className="w-full text-xs px-2.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Sem {sem}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Angkatan *</label>
                        <select
                          value={registerForm.angkatan}
                          onChange={e => setRegisterForm({ ...registerForm, angkatan: e.target.value })}
                          className="w-full text-xs px-2.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                        >
                          {['2023', '2024', '2025', '2026'].map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Kata Sandi (Password) *</label>
                      <input
                        type="password"
                        required
                        placeholder="Sandi minimal 5 karakter"
                        value={registerForm.password}
                        onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Konfirmasi Sandi *</label>
                      <input
                        type="password"
                        required
                        placeholder="Ulangi sandi"
                        value={registerForm.confirmPassword}
                        onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Kontak & Alamat */}
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block mb-2">
                    2. Kontak & Alamat
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Email Aktif</label>
                      <input
                        type="email"
                        placeholder="contoh@gmail.com"
                        value={registerForm.email}
                        onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">No. WhatsApp/Kontak *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 081234567890"
                        value={registerForm.kontak}
                        onChange={e => setRegisterForm({ ...registerForm, kontak: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Alamat Domisili Lengkap *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Masukkan alamat RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten/Kota"
                      value={registerForm.alamat}
                      onChange={e => setRegisterForm({ ...registerForm, alamat: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Section 3: Kondisi Ekonomi */}
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block mb-2">
                    3. Profil Orang Tua / Kondisi Ekonomi
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Pekerjaan Ayah</label>
                      <input
                        type="text"
                        placeholder="Contoh: Petani / Guru Honorer"
                        value={registerForm.pekerjaanAyah}
                        onChange={e => setRegisterForm({ ...registerForm, pekerjaanAyah: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        placeholder="Contoh: Ibu Rumah Tangga / Buruh Cuci"
                        value={registerForm.pekerjaanIbu}
                        onChange={e => setRegisterForm({ ...registerForm, pekerjaanIbu: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Penghasilan Orang Tua (Rupiah) *</label>
                      <input
                        type="number"
                        required
                        placeholder="Gabungan penghasilan bulanan, misal: 1000000"
                        value={registerForm.penghasilanOrtu}
                        onChange={e => setRegisterForm({ ...registerForm, penghasilanOrtu: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Jumlah Tanggungan Anak *</label>
                      <select
                        value={registerForm.jumlahTanggungan}
                        onChange={e => setRegisterForm({ ...registerForm, jumlahTanggungan: e.target.value })}
                        className="w-full text-xs px-2.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(count => (
                          <option key={count} value={count}>{count} Anak / Tanggungan</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Prestasi (Pisahkan dengan koma)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Juara II MTQ Kabupaten 2025, Sertifikat Tahfidz Juz 30"
                      value={registerForm.prestasi}
                      onChange={e => setRegisterForm({ ...registerForm, prestasi: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50"
                    />
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                Kirim Formulir Pendaftaran <UserPlus size={13} />
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
