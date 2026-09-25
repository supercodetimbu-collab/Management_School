import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Search,
  School,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  Menu,
  UserCog,
  X,
} from 'lucide-react';
import { UserRole } from '../../types';

interface AppHeaderProps {
  currentModule: string;
  setCurrentModule: (mod: string) => void;
  onOpenSearch?: () => void;
  onOpenMobileMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentModule,
  setCurrentModule,
  onOpenSearch,
  onOpenMobileMenu,
}) => {
  const { currentUser, currentRole, logout } = useAuth();
  const {
    schoolProfile,
    activeAcademicYear,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    liveSyncPulse,
    isFirebaseConnected,
  } = useSiakadData();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const roleLabels: Record<UserRole, { label: string; badgeColor: string }> = {
    superadmin: { label: 'Super Admin', badgeColor: 'bg-purple-100 text-purple-700 border-purple-200' },
    admin: { label: 'Admin Sekolah', badgeColor: 'bg-teal-100 text-teal-700 border-teal-200' },
    guru: { label: 'Guru / Wali', badgeColor: 'bg-blue-100 text-blue-700 border-blue-200' },
    siswa: { label: 'Siswa', badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    orangtua: { label: 'Orang Tua', badgeColor: 'bg-amber-100 text-amber-700 border-amber-200' },
    kepsek: { label: 'Kepala Sekolah', badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  };

  const getModuleTitle = (mod: string) => {
    switch (mod) {
      case 'dashboard': return 'Dashboard';
      case 'students': return 'Data Siswa';
      case 'teachers': return 'Data Guru';
      case 'parents': return 'Data Orang Tua';
      case 'classes': return 'Data Kelas';
      case 'subjects': return 'Mata Pelajaran';
      case 'academic_year': return 'Tahun Ajaran';
      case 'schedules': return 'Jadwal Pelajaran';
      case 'attendance': return 'Presensi';
      case 'grades': return 'Penilaian Siswa';
      case 'assignments': return 'Tugas Akademik';
      case 'exams': return 'Ujian & Evaluasi';
      case 'report_cards': return 'Raport Digital';
      case 'promotions_graduations': return 'Kenaikan & Kelulusan';
      case 'announcements': return 'Pengumuman';
      case 'chat': return 'Ruang Obrolan Real-Time';
      case 'calendar': return 'Kalender Akademik';
      case 'reports': return 'Laporan Sekolah';
      case 'user_management': return 'Manajemen Pengguna';
      case 'audit_logs': return 'Audit Aktivitas';
      case 'theme_customizer': return 'Tema & Tampilan Sistem';
      case 'settings': return 'Pengaturan Sistem';
      case 'profile': return 'Profil Pengguna';
      case 'integration_docs': return 'Dokumentasi Sistem';
      default: return 'SIAKAD SEKOLAH';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full max-w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1">
          {/* Left section: Mobile Page Title or Desktop Logo Branding */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="md:hidden p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl flex-shrink-0"
                aria-label="Buka Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-xs flex-shrink-0">
                <School className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 tracking-tight text-sm sm:text-base">
                    {schoolProfile.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    TA {activeAcademicYear.name} ({activeAcademicYear.semester})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Sistem Informasi Akademik Sekolah</p>
              </div>

              {/* Mobile View: Dynamic Page Title */}
              <div className="sm:hidden flex flex-col min-w-0 flex-1 overflow-hidden">
                <span className="font-bold text-slate-800 text-xs tracking-tight truncate">
                  {getModuleTitle(currentModule)}
                </span>
                <span className="text-[10px] text-teal-600 font-semibold truncate">
                  {schoolProfile.name}
                </span>
              </div>
            </div>
          </div>

          {/* Middle/Right Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            {/* Quick Global Search Trigger Button */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs transition cursor-pointer flex-shrink-0"
              title="Cari data siswa, guru, jadwal, nilai (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline ml-1.5">Cari Cepat...</span>
              <kbd className="hidden lg:inline-block ml-1.5 px-1.5 py-0.5 text-[9px] font-mono bg-white text-slate-500 rounded border border-slate-300">
                /
              </kbd>
            </button>

            {/* PWA Install Button (Hidden in compact mobile header, available in sidebar/drawer) */}
            <div className="hidden sm:block flex-shrink-0">
              <PWAInstallButton variant="header" />
            </div>

            {/* Real-time Firebase Sync Status Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition border ${
                liveSyncPulse
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
              title="Koneksi real-time Firebase Firestore aktif & tersinkronisasi otomatis"
            >
              <span className={`w-2 h-2 rounded-full ${liveSyncPulse ? 'bg-emerald-600 scale-125' : 'bg-emerald-500'} animate-pulse`} />
              <span className="hidden xl:inline font-bold">Firebase Live</span>
            </div>

            {/* Active User Role Badge (Clean display on sm+, on mobile indicated in profile avatar & drawer) */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border flex-shrink-0 ${
                roleLabels[currentRole]?.badgeColor || 'bg-slate-100 text-slate-700'
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-current flex-shrink-0"></span>
              <span className="truncate max-w-[120px] lg:max-w-none">{roleLabels[currentRole]?.label || currentRole}</span>
            </div>

            {/* Notification Bell with Badge & Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                title="Pemberitahuan & Notifikasi"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-emerald-500 rounded-full border-2 border-white shadow-xs">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Backdrop on mobile screens to dismiss cleanly */}
              {showNotifDropdown && (
                <div
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 sm:hidden animate-in fade-in duration-150"
                  onClick={() => setShowNotifDropdown(false)}
                />
              )}

              {/* Notification Popover: full-width on mobile (inset-x-3 top-16), anchored on desktop */}
              {showNotifDropdown && (
                <div className="fixed inset-x-3 top-16 sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in slide-in-from-top-2 sm:zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[calc(100vh-5.5rem)] sm:max-h-[500px]">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">Notifikasi</span>
                      {unreadNotifications.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          {unreadNotifications.length} baru
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                        >
                          Tandai dibaca
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifDropdown(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 sm:hidden cursor-pointer"
                        title="Tutup Notifikasi"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto divide-y divide-slate-100 flex-1 overscroll-contain">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-60" />
                        <p className="font-semibold text-slate-600">Belum ada notifikasi baru</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Semua pembaruan akademik akan muncul di sini</p>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.category === 'tugas') setCurrentModule('assignments');
                            else if (n.category === 'nilai') setCurrentModule('grades');
                            else if (n.category === 'pengumuman') setCurrentModule('announcements');
                            setShowNotifDropdown(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 transition cursor-pointer flex items-start gap-2.5 ${
                            !n.read ? 'bg-teal-50/50' : ''
                          }`}
                        >
                          <div
                            className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                              !n.read ? 'bg-teal-600 ring-2 ring-teal-200' : 'bg-slate-300'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-slate-800 leading-tight truncate">{n.title}</p>
                              {n.category && (
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 flex-shrink-0">
                                  {n.category}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1 line-clamp-2 break-words leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-medium">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-2 px-3 border-t border-slate-100 text-center flex-shrink-0 bg-slate-50/50">
                    <button
                      onClick={() => {
                        setCurrentModule('announcements');
                        setShowNotifDropdown(false);
                      }}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline py-1 block w-full cursor-pointer"
                    >
                      Buka Semua Pengumuman & Notifikasi →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & User Menu */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                    {currentUser?.name || 'Pengguna'}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5 leading-none">{currentRole}</p>
                </div>
                <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Mobile backdrop for user dropdown */}
              {showUserDropdown && (
                <div
                  className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-40 sm:hidden animate-in fade-in duration-150"
                  onClick={() => setShowUserDropdown(false)}
                />
              )}

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded-md bg-teal-50 text-teal-700 uppercase">
                      {currentRole}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCurrentModule('profile');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profil & Akun Saya</span>
                    </button>

                    {(currentRole === 'admin' || currentRole === 'superadmin') && (
                      <button
                        onClick={() => {
                          setCurrentModule('user_management');
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <UserCog className="w-4 h-4 text-teal-600" />
                        <span>{currentRole === 'superadmin' ? 'Pengawasan Akun Global' : 'Kelola Pengguna Sekolah'}</span>
                      </button>
                    )}

                    {currentRole === 'admin' && (
                      <button
                        onClick={() => {
                          setCurrentModule('settings');
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <School className="w-4 h-4 text-slate-400" />
                        <span>Pengaturan Sekolah</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCurrentModule('integration_docs');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-teal-700 font-medium hover:bg-teal-50 transition cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <span>Dokumentasi Sistem</span>
                    </button>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
