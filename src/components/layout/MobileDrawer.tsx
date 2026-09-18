import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import {
  X,
  LayoutDashboard,
  GraduationCap,
  Users,
  HeartHandshake,
  School,
  BookOpen,
  CalendarDays,
  Clock,
  ClipboardCheck,
  Award,
  FileText,
  FileCheck,
  FileSignature,
  Megaphone,
  BarChart3,
  UserCog,
  History,
  Settings,
  HelpCircle,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { UserRole } from '../../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentModule: string;
  setCurrentModule: (mod: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentModule,
  setCurrentModule,
}) => {
  const { currentUser, currentRole, quickLoginAsRole, logout } = useAuth();
  const { schoolProfile } = useSiakadData();

  if (!isOpen) return null;

  const navigateTo = (mod: string) => {
    setCurrentModule(mod);
    onClose();
  };

  const roleLabels: Record<UserRole, string> = {
    superadmin: 'Super Admin',
    admin: 'Admin Sekolah',
    guru: 'Guru / Wali',
    siswa: 'Siswa',
    orangtua: 'Orang Tua',
    kepsek: 'Kepala Sekolah',
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
              <School className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold truncate max-w-[170px]">{schoolProfile.name}</p>
              <p className="text-[10px] text-teal-100">SIAKAD Mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 bg-teal-50/70 border-b border-teal-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-teal-700 font-semibold uppercase">{roleLabels[currentRole]}</p>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher Pill Bar for Mobile Demo Testing */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Ganti Mode Akun Demo:
          </p>
          <div className="grid grid-cols-3 gap-1">
            {(Object.keys(roleLabels) as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  quickLoginAsRole(r);
                }}
                className={`py-1 px-1.5 rounded-md text-[10px] font-bold text-center border transition ${
                  currentRole === r
                    ? 'bg-teal-600 text-white border-teal-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
              Menu Utama
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'dashboard'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => navigateTo('schedules')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'schedules'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Jadwal Pelajaran</span>
              </button>
              <button
                onClick={() => navigateTo('attendance')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'attendance'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Presensi</span>
              </button>
              <button
                onClick={() => navigateTo('grades')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'grades'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Nilai Siswa</span>
              </button>
              <button
                onClick={() => navigateTo('assignments')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'assignments'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tugas</span>
              </button>
              <button
                onClick={() => navigateTo('exams')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'exams'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Jadwal Ujian</span>
              </button>
              <button
                onClick={() => navigateTo('report_cards')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'report_cards'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <FileSignature className="w-4 h-4" />
                <span>Raport Digital</span>
              </button>
            </div>
          </div>

          {(currentRole === 'superadmin' || currentRole === 'admin') && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Data Master & Akademik
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => navigateTo('students')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                    currentModule === 'students' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Data Siswa</span>
                </button>
                <button
                  onClick={() => navigateTo('teachers')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                    currentModule === 'teachers' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Data Guru</span>
                </button>
                <button
                  onClick={() => navigateTo('parents')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                    currentModule === 'parents' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Data Orang Tua</span>
                </button>
                <button
                  onClick={() => navigateTo('classes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                    currentModule === 'classes' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                  }`}
                >
                  <School className="w-4 h-4" />
                  <span>Data Kelas</span>
                </button>
                <button
                  onClick={() => navigateTo('subjects')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                    currentModule === 'subjects' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Mata Pelajaran</span>
                </button>
                <button
                  onClick={() => navigateTo('promotions_graduations')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                    currentModule === 'promotions_graduations' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Kenaikan & Kelulusan</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
              Informasi & Sistem
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => navigateTo('announcements')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'announcements' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>Pengumuman</span>
              </button>
              <button
                onClick={() => navigateTo('calendar')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'calendar' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Kalender Akademik</span>
              </button>
              <button
                onClick={() => navigateTo('reports')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'reports' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Laporan Akademik</span>
              </button>
              <button
                onClick={() => navigateTo('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'settings' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan Sekolah</span>
              </button>
              <button
                onClick={() => navigateTo('integration_docs')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                  currentModule === 'integration_docs' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-teal-600" />
                <span>Dokumentasi Sistem</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
          <PWAInstallButton variant="sidebar" />
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
