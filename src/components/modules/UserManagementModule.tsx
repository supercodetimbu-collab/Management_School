import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import { UserRole, UserAccount, SchoolEntity } from '../../types';
import {
  Users,
  School,
  ShieldAlert,
  UserPlus,
  Search,
  Filter,
  Ban,
  CheckCircle2,
  Trash2,
  KeyRound,
  Shield,
  Building2,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  AlertTriangle,
  X,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const UserManagementModule: React.FC = () => {
  const {
    currentUser,
    currentRole,
    accounts,
    schools,
    createSchoolWithAdmin,
    createUserAccount,
    updateUserStatus,
    deleteUserAccount,
    adminResetPassword,
    refreshAccounts,
  } = useAuth();
  const { schoolProfile } = useSiakadData();

  const isSuperAdmin = currentRole === 'superadmin';

  // Superadmin Tabs: 'schools' | 'all_users'
  const [activeTab, setActiveTab] = useState<'schools' | 'users'>(isSuperAdmin ? 'schools' : 'users');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Refresh data handler
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshAccounts();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Data semua pengguna berhasil diperbarui.', 'success');
    }, 500);
  };

  // Modals
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState<UserAccount | null>(null);
  const [blockReason, setBlockReason] = useState('Menyalahi kebijakan dan peraturan aplikasi.');
  const [showResetPassModal, setShowResetPassModal] = useState<UserAccount | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<UserAccount | null>(null);

  // Add School Form State
  const [schoolName, setSchoolName] = useState('');
  const [schoolNpsn, setSchoolNpsn] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  // Add User Form State (Admin Sekolah & Superadmin)
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('guru');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserSchoolId, setNewUserSchoolId] = useState(schools[0]?.id || 'sch-01');

  // Handle Add School
  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !schoolNpsn.trim() || !adminName.trim() || !adminUsername.trim() || !adminPassword.trim()) {
      showToast('Harap lengkapi semua kolom wajib.', 'error');
      return;
    }

    const res = createSchoolWithAdmin(
      {
        name: schoolName.trim(),
        npsn: schoolNpsn.trim(),
        address: schoolAddress.trim(),
        phone: schoolPhone.trim(),
        email: schoolEmail.trim(),
        status: 'active',
      },
      {
        name: adminName.trim(),
        username: adminUsername.trim(),
        password: adminPassword.trim(),
        email: adminEmail.trim(),
        phone: adminPhone.trim(),
      }
    );

    if (res.success) {
      showToast(res.message, 'success');
      setShowAddSchoolModal(false);
      // Reset form
      setSchoolName('');
      setSchoolNpsn('');
      setSchoolAddress('');
      setSchoolPhone('');
      setSchoolEmail('');
      setAdminName('');
      setAdminUsername('');
      setAdminPassword('');
      setAdminEmail('');
      setAdminPhone('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Handle Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()) {
      showToast('Nama lengkap, username, dan password wajib diisi.', 'error');
      return;
    }

    const targetSchool = schools.find((s) => s.id === newUserSchoolId) || schools[0];

    const res = createUserAccount({
      username: newUserUsername.trim(),
      password: newUserPassword.trim(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      phone: newUserPhone.trim(),
      schoolId: isSuperAdmin ? (targetSchool?.id || 'sch-01') : 'sch-01',
      schoolName: isSuperAdmin ? (targetSchool?.name || schoolProfile.name) : schoolProfile.name,
      status: 'active',
    });

    if (res.success) {
      showToast(res.message, 'success');
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserUsername('');
      setNewUserPassword('');
      setNewUserEmail('');
      setNewUserPhone('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Handle Block / Unblock
  const handleConfirmBlock = () => {
    if (!showBlockModal) return;
    const isCurrentlyBlocked = showBlockModal.status === 'blocked';
    const newStatus = isCurrentlyBlocked ? 'active' : 'blocked';

    const res = updateUserStatus(showBlockModal.id, newStatus, blockReason);
    if (res.success) {
      showToast(res.message, 'success');
      setShowBlockModal(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Handle Reset Password
  const handleConfirmResetPassword = () => {
    if (!showResetPassModal) return;
    if (!newResetPassword.trim() || newResetPassword.length < 5) {
      showToast('Password baru minimal 5 karakter.', 'error');
      return;
    }

    const res = adminResetPassword(showResetPassModal.id, newResetPassword);
    if (res.success) {
      showToast(`Password untuk ${showResetPassModal.name} berhasil diatur ulang.`, 'success');
      setShowResetPassModal(null);
      setNewResetPassword('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Handle Delete Account
  const handleConfirmDelete = () => {
    if (!showDeleteConfirm) return;
    const res = deleteUserAccount(showDeleteConfirm.id);
    if (res.success) {
      showToast(res.message, 'success');
      setShowDeleteConfirm(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Filtered Accounts
  const visibleAccounts = accounts.filter((acc) => {
    // If not superadmin, only show accounts belonging to user's school (and hide superadmin)
    if (!isSuperAdmin) {
      if (acc.role === 'superadmin') return false;
      if (currentUser?.schoolId && acc.schoolId && acc.schoolId !== currentUser.schoolId) {
        return false;
      }
    }

    // Role filter
    if (roleFilter !== 'all' && acc.role !== roleFilter) return false;

    // Status filter
    if (statusFilter !== 'all' && acc.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = acc.name.toLowerCase().includes(q);
      const matchUsername = acc.username.toLowerCase().includes(q);
      const matchEmail = acc.email?.toLowerCase().includes(q);
      const matchSchool = acc.schoolName?.toLowerCase().includes(q);
      return matchName || matchUsername || matchEmail || matchSchool;
    }

    return true;
  });

  const roleLabelMap: Record<UserRole, { label: string; color: string }> = {
    superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    admin: { label: 'Admin Sekolah', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    guru: { label: 'Guru / Wali', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    siswa: { label: 'Siswa', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    orangtua: { label: 'Orang Tua', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    kepsek: { label: 'Kepala Sekolah', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold max-w-md animate-in fade-in slide-in-from-top-4 duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p>{toastMessage.text}</p>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">
              {isSuperAdmin ? 'Pusat Manajemen Multi-Sekolah & Akun Global' : 'Manajemen Akun Pengguna Sekolah'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
              {isSuperAdmin ? 'Akses Superadmin' : 'Akses Admin Sekolah'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperAdmin
              ? 'Mengatur akun sekolah, admin sekolah, dan pengawasan keamanan seluruh akun di belakang layar.'
              : 'Membuat dan mengelola akun resmi untuk Kepala Sekolah, Guru, Siswa, dan Orang Tua.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Segarkan data pengguna dan sistem"
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 shadow-xs cursor-pointer ${
              isRefreshing
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-300 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
            <span>{isRefreshing ? 'Menyegarkan...' : 'Refresh Data'}</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setShowAddSchoolModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Tambah Sekolah & Admin Baru</span>
            </button>
          )}

          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSuperAdmin ? 'Tambah Akun Pengguna' : 'Tambah Akun Pengguna Sekolah'}</span>
          </button>
        </div>
      </div>

      {/* Superadmin Tab Navigation */}
      {isSuperAdmin && (
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('schools')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'schools'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Daftar Sekolah & Akun Admin ({schools.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Pengawasan Seluruh Akun Global ({accounts.length})</span>
          </button>
        </div>
      )}

      {/* TAB 1: SCHOOLS & ADMINS (Superadmin Only) */}
      {isSuperAdmin && activeTab === 'schools' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school) => {
              const adminAcc = accounts.find((a) => a.id === school.adminId) || accounts.find((a) => a.username === school.adminUsername);
              return (
                <div key={school.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                        <School className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {school.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mt-3">{school.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">NPSN: {school.npsn}</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{school.address}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Akun Admin Penanggung Jawab:</p>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                      <p className="text-xs font-bold text-slate-800">{school.adminName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">user: {school.adminUsername}</p>
                      {adminAcc && (
                        <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-200/60 text-[10px]">
                          <span className={`px-1.5 py-0.2 rounded font-semibold ${adminAcc.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {adminAcc.status === 'blocked' ? 'Akun Diblokir' : 'Akun Aktif'}
                          </span>
                          <span className="text-slate-400">• Pass tersimpan</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: USERS LIST (Admin Sekolah & Superadmin All Accounts) */}
      {(activeTab === 'users' || !isSuperAdmin) && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, username, email..."
                className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filter berdasarkan Role Akun"
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700"
              >
                <option value="all">Semua Role</option>
                {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                <option value="admin">Admin Sekolah</option>
                <option value="kepsek">Kepala Sekolah</option>
                <option value="guru">Guru / Wali</option>
                <option value="siswa">Siswa</option>
                <option value="orangtua">Orang Tua</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter berdasarkan Status Akun"
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="blocked">Diblokir</option>
              </select>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Segarkan daftar semua pengguna"
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isRefreshing
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-300 shadow-xs active:scale-95'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
                <span>{isRefreshing ? 'Menyegarkan...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Table of Users */}
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-3">Username & Akun</th>
                  <th className="py-3 px-3">Role</th>
                  {isSuperAdmin && <th className="py-3 px-3">Sekolah</th>}
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Keamanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {visibleAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="py-8 text-center text-slate-400">
                      Tidak ada akun pengguna yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  visibleAccounts.map((acc) => {
                    const isSelf = currentUser?.id === acc.id;
                    const isTargetSuperAdmin = acc.role === 'superadmin';
                    const isBlocked = acc.status === 'blocked';

                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {acc.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">{acc.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-xs text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                            @{acc.username}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleLabelMap[acc.role]?.color || 'bg-slate-100 text-slate-700'}`}>
                            {roleLabelMap[acc.role]?.label || acc.role}
                          </span>
                        </td>

                        {isSuperAdmin && (
                          <td className="py-3 px-3 text-xs text-slate-600">
                            {acc.role === 'superadmin' ? 'Global / Sistem' : (acc.schoolName || schoolProfile.name)}
                          </td>
                        )}

                        <td className="py-3 px-3">
                          {isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                              <Ban className="w-3 h-3" />
                              <span>Diblokir</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aktif</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reset Password Button */}
                            <button
                              onClick={() => setShowResetPassModal(acc)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                              title="Reset Password Pengguna"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Block / Unblock Button (except self & superadmin) */}
                            {!isTargetSuperAdmin && !isSelf && (
                              <button
                                onClick={() => setShowBlockModal(acc)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isBlocked
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-amber-600 hover:bg-amber-50'
                                }`}
                                title={isBlocked ? 'Buka Blokir Akun' : 'Blokir Akun Pengguna'}
                              >
                                {isBlocked ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </button>
                            )}

                            {/* Delete Button (except self & superadmin) */}
                            {!isTargetSuperAdmin && !isSelf && (
                              <button
                                onClick={() => setShowDeleteConfirm(acc)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Hapus Akun Permanen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Sekolah & Admin Baru (Superadmin) */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800">Daftarkan Sekolah & Admin Baru</h3>
              </div>
              <button
                onClick={() => setShowAddSchoolModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 space-y-3">
                <p className="text-xs font-bold text-purple-900">1. Data Lembaga Sekolah</p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Sekolah *</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SMA Negeri 2 Jakarta"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">NPSN Sekolah *</label>
                    <input
                      type="text"
                      value={schoolNpsn}
                      onChange={(e) => setSchoolNpsn(e.target.value)}
                      placeholder="Contoh: 20108899"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Telepon Sekolah</label>
                    <input
                      type="text"
                      value={schoolPhone}
                      onChange={(e) => setSchoolPhone(e.target.value)}
                      placeholder="021-xxxxxxx"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Alamat Sekolah</label>
                  <input
                    type="text"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    placeholder="Alamat lengkap sekolah"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="bg-teal-50/60 p-3.5 rounded-2xl border border-teal-100 space-y-3">
                <p className="text-xs font-bold text-teal-900">2. Akun Admin Sekolah Tersebut</p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap Admin *</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.Kom"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Username Admin *</label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin_sman2"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Password Admin * (min 6)</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Password login admin"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Admin</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@sekolah.sch.id"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs"
                >
                  Buat Sekolah & Akun Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Pengguna Sekolah (Admin Sekolah / Superadmin) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  {isSuperAdmin ? 'Buat Akun Pengguna Baru' : 'Buat Akun Pengguna Sekolah'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Peran / Role Pengguna *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                >
                  <option value="kepsek">Kepala Sekolah</option>
                  <option value="guru">Guru / Tenaga Pendidik</option>
                  <option value="siswa">Siswa / Peserta Didik</option>
                  <option value="orangtua">Orang Tua / Wali Siswa</option>
                  {isSuperAdmin && <option value="admin">Admin Sekolah</option>}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzan, S.Pd / Budi Santoso"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Username Login *</label>
                  <input
                    type="text"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="username_login"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Password Awal * (min 5)</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Pengguna</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="pengguna@sekolah.sch.id"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">No. Telepon / WhatsApp</label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {isSuperAdmin && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Asosiasi Sekolah</label>
                  <select
                    value={newUserSchoolId}
                    onChange={(e) => setNewUserSchoolId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.npsn})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  Buat Akun Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Blokir / Buka Blokir Akun */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {showBlockModal.status === 'blocked' ? 'Buka Blokir Akun' : 'Blokir Akses Akun'}
                </h3>
                <p className="text-[11px] text-slate-500">{showBlockModal.name} (@{showBlockModal.username})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {showBlockModal.status === 'blocked'
                ? 'Akun ini sedang diblokir. Mengaktifkan kembali akan mengizinkan pengguna untuk login ke sistem.'
                : 'Akun yang diblokir tidak akan dapat masuk (login) ke sistem SIAKAD.'}
            </p>

            {showBlockModal.status !== 'blocked' && (
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Alasan Pemblokiran:</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Alasan pemblokiran..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBlockModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmBlock}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs ${
                  showBlockModal.status === 'blocked'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {showBlockModal.status === 'blocked' ? 'Aktifkan Akun' : 'Blokir Akun Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reset Password Pengguna */}
      {showResetPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Reset Password Pengguna</h3>
                <p className="text-[11px] text-slate-500">{showResetPassModal.name} (@{showResetPassModal.username})</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password Baru (min 5 karakter)</label>
                <input
                  type="password"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetPassModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
              >
                Simpan Password Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Hapus Akun Pengguna */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hapus Akun Pengguna?</h3>
                <p className="text-[11px] text-slate-500">{showDeleteConfirm.name} (@{showDeleteConfirm.username})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Tindakan ini akan menghapus akun ini secara permanen dari sistem. Pengguna tidak akan dapat login kembali.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
