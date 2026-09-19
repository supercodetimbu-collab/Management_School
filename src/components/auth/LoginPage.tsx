import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import {
  School,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { schoolProfile } = useSiakadData();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Silakan masukkan username atau email akun Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan password akun Anda.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Login gagal. Periksa kembali username dan password Anda.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner PWA prompt */}
      <div className="mb-4">
        <PWAInstallButton variant="header" />
      </div>

      <div className="w-full max-w-md">
        {/* School Logo & App Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white shadow-lg shadow-teal-700/20 mb-3 border-2 border-white">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">SIAKAD SEKOLAH</h1>
          <p className="text-xs font-semibold text-teal-700 mt-0.5">{schoolProfile.name}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Sistem Informasi Akademik Sekolah Terpadu</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Masuk ke Akun</h2>
              <p className="text-xs text-slate-500">Gunakan akun resmi yang dibuat oleh Admin</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sesi Aman</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username / Email Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username akun Anda"
                  autoComplete="username"
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                >
                  Bantuan Login
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke SIAKAD</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-slate-500 text-[11px] leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <p>
              Akun pengguna dibuat resmi oleh Admin Sekolah. Jika Anda belum memiliki akun atau lupa kata sandi, silakan hubungi Tata Usaha sekolah.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          © 2026 SIAKAD SEKOLAH — Seluruh Hak Cipta Dilindungi
        </p>
      </div>

      {/* Account Help Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800">Bantuan Akun & Kata Sandi</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed mb-4">
              <p>
                <strong>1. Siswa, Orang Tua, dan Guru:</strong> Akun Anda didaftarkan secara terpusat oleh <strong>Admin Sekolah</strong>. Hubungi Bagian Tata Usaha atau Operator IT sekolah Anda.
              </p>
              <p>
                <strong>2. Admin Sekolah:</strong> Dibuatkan secara khusus oleh <strong>Super Administrator</strong> bersamaan dengan pendaftaran institusi sekolah.
              </p>
              <p>
                <strong>3. Ganti Password Mandiri:</strong> Setelah berhasil masuk, Anda dapat memperbarui username dan password secara mandiri di menu <strong>Profil Saya</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
