import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import {
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  School,
  Save,
  Calendar,
} from 'lucide-react';

export const ProfileModule: React.FC = () => {
  const {
    currentUser,
    currentRole,
    updateCurrentUserProfile,
    changeSelfUsername,
    changeSelfPassword,
  } = useAuth();
  const { schoolProfile } = useSiakadData();

  const displaySchoolName =
    currentUser?.role === 'superadmin'
      ? 'Pengawasan Global (Multi-Sekolah)'
      : schoolProfile?.name || currentUser?.schoolName || 'SIAKAD Sekolah';

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Username Form State
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Nama lengkap tidak boleh kosong.');
      return;
    }

    updateCurrentUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    setProfileSuccess('Data profil Anda berhasil diperbarui!');
    setTimeout(() => setProfileSuccess(''), 3500);
  };

  const handleUpdateUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameSuccess('');
    setUsernameError('');

    if (!newUsername.trim()) {
      setUsernameError('Username tidak boleh kosong.');
      return;
    }

    const res = changeSelfUsername(newUsername);
    if (res.success) {
      setUsernameSuccess(res.message);
      setTimeout(() => setUsernameSuccess(''), 3500);
    } else {
      setUsernameError(res.message);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!oldPassword.trim()) {
      setPasswordError('Silakan masukkan password saat ini.');
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError('Silakan masukkan password baru.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    const res = changeSelfPassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordSuccess(res.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3500);
    } else {
      setPasswordError(res.message);
    }
  };

  const roleBadgeMap: Record<string, { label: string; color: string }> = {
    superadmin: { label: 'Super Administrator (Pengelola Sistem)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    admin: { label: 'Admin Sekolah (Tata Usaha)', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    guru: { label: 'Guru & Tenaga Pendidik', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    siswa: { label: 'Siswa / Peserta Didik', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    orangtua: { label: 'Orang Tua / Wali Siswa', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    kepsek: { label: 'Kepala Sekolah', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-teal-700/20 flex-shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">{currentUser?.name || 'Pengguna'}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadgeMap[currentRole]?.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {roleBadgeMap[currentRole]?.label || currentRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">@{currentUser?.username}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-teal-700">
                <School className="w-3.5 h-3.5 text-teal-600" />
                {displaySchoolName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Terdaftar: {currentUser?.createdAt || '2026-01-01'}
              </span>
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <Shield className="w-4 h-4" />
          <span>Status Akun: Aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Edit Informasi Profil */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <UserIcon className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">Informasi Profil</h2>
              <p className="text-[11px] text-slate-500">Perbarui identitas pribadi Anda</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {/* Synchronized School Data Indicator */}
          <div className="mb-4 p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                <School className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">Pangkalan Data Sekolah</p>
                <p className="text-xs font-bold text-slate-800 truncate">{displaySchoolName}</p>
              </div>
            </div>
            {schoolProfile.npsn && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white text-teal-800 border border-teal-200 flex-shrink-0">
                NPSN: {schoolProfile.npsn}
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp / Telepon</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </button>
          </form>
        </div>

        {/* Box 2: Perbarui Username Mandiri */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-teal-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Perbarui Username Mandiri</h2>
                <p className="text-[11px] text-slate-500">Username digunakan untuk masuk ke akun</p>
              </div>
            </div>

            {usernameSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{usernameSuccess}</span>
              </div>
            )}

            {usernameError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{usernameError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="text-xs font-mono font-bold">@</span>
                  </div>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="masukkan_username_baru"
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Gunakan minimal 3 karakter huruf, angka, titik, atau strip.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Perbarui Username</span>
              </button>
            </form>
          </div>

          {/* Box 3: Perbarui Password Mandiri */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <Lock className="w-5 h-5 text-teal-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Perbarui Password Mandiri</h2>
                <p className="text-[11px] text-slate-500">Ganti kata sandi secara berkala untuk keamanan</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru (min. 6 karakter)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 active:bg-black transition flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>Perbarui Password Sekarang</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
