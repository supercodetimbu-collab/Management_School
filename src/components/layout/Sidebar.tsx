import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  HeartHandshake,
  School,
  BookOpen,
  CalendarDays,
  Clock,
  ClipboardCheck,
  Award,
  FileText,
  FileSignature,
  FileCheck,
  Megaphone,
  BarChart3,
  UserCog,
  History,
  Settings,
  Sparkles,
  HelpCircle,
  TrendingUp,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SidebarProps {
  currentModule: string;
  setCurrentModule: (mod: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, setCurrentModule }) => {
  const { currentRole } = useAuth();
  const { schoolProfile } = useSiakadData();

  // Navigation Items depending on role
  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const getSections = (): NavSection[] => {
    if (currentRole === 'superadmin') {
      return [
        {
          title: 'UTAMA',
          items: [{ id: 'dashboard', label: 'Dashboard Sistem', icon: LayoutDashboard }],
        },
        {
          title: 'DATA MASTER',
          items: [
            { id: 'students', label: 'Data Siswa', icon: GraduationCap },
            { id: 'teachers', label: 'Data Guru', icon: Users },
            { id: 'parents', label: 'Data Orang Tua', icon: HeartHandshake },
            { id: 'classes', label: 'Data Kelas', icon: School },
            { id: 'subjects', label: 'Mata Pelajaran', icon: BookOpen },
          ],
        },
        {
          title: 'AKADEMIK',
          items: [
            { id: 'academic_year', label: 'Tahun Ajaran', icon: CalendarDays },
            { id: 'schedules', label: 'Jadwal Pelajaran', icon: Clock },
            { id: 'attendance', label: 'Presensi', icon: ClipboardCheck },
            { id: 'grades', label: 'Penilaian Siswa', icon: Award },
            { id: 'assignments', label: 'Tugas', icon: FileText },
            { id: 'exams', label: 'Ujian & Evaluasi', icon: FileCheck },
            { id: 'report_cards', label: 'Raport Digital', icon: FileSignature },
            { id: 'promotions_graduations', label: 'Kenaikan & Kelulusan', icon: TrendingUp },
          ],
        },
        {
          title: 'INFORMASI & LAPORAN',
          items: [
            { id: 'chat', label: 'Ruang Obrolan Real-Time', icon: MessageSquare },
            { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
            { id: 'calendar', label: 'Kalender Akademik', icon: CalendarDays },
            { id: 'reports', label: 'Laporan Terpadu', icon: BarChart3 },
          ],
        },
        {
          title: 'SISTEM & MULTI-SEKOLAH',
          items: [
            { id: 'user_management', label: 'Manajemen Pengguna & Sekolah', icon: UserCog },
            { id: 'audit_logs', label: 'Audit Aktivitas', icon: History },
            { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
            { id: 'profile', label: 'Profil Super Admin', icon: UserIcon },
            { id: 'integration_docs', label: 'Dokumentasi Sistem', icon: HelpCircle },
          ],
        },
      ];
    }

    if (currentRole === 'admin') {
      return [
        {
          title: 'UTAMA',
          items: [{ id: 'dashboard', label: 'Dashboard Admin', icon: LayoutDashboard }],
        },
        {
          title: 'DATA MASTER',
          items: [
            { id: 'students', label: 'Data Siswa', icon: GraduationCap },
            { id: 'teachers', label: 'Data Guru', icon: Users },
            { id: 'parents', label: 'Data Orang Tua', icon: HeartHandshake },
            { id: 'classes', label: 'Data Kelas', icon: School },
            { id: 'subjects', label: 'Mata Pelajaran', icon: BookOpen },
          ],
        },
        {
          title: 'AKADEMIK',
          items: [
            { id: 'academic_year', label: 'Tahun Ajaran', icon: CalendarDays },
            { id: 'schedules', label: 'Jadwal Pelajaran', icon: Clock },
            { id: 'attendance', label: 'Presensi', icon: ClipboardCheck },
            { id: 'grades', label: 'Penilaian Siswa', icon: Award },
            { id: 'assignments', label: 'Tugas', icon: FileText },
            { id: 'exams', label: 'Ujian', icon: FileCheck },
            { id: 'report_cards', label: 'Raport Digital', icon: FileSignature },
            { id: 'promotions_graduations', label: 'Kenaikan & Kelulusan', icon: TrendingUp },
          ],
        },
        {
          title: 'INFORMASI & LAPORAN',
          items: [
            { id: 'chat', label: 'Ruang Obrolan Real-Time', icon: MessageSquare },
            { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
            { id: 'calendar', label: 'Kalender Akademik', icon: CalendarDays },
            { id: 'reports', label: 'Laporan Sekolah', icon: BarChart3 },
          ],
        },
        {
          title: 'PENGELOLAAN & AKUN',
          items: [
            { id: 'user_management', label: 'Kelola Pengguna Sekolah', icon: UserCog },
            { id: 'settings', label: 'Pengaturan Sekolah', icon: Settings },
            { id: 'profile', label: 'Profil Saya', icon: UserIcon },
            { id: 'integration_docs', label: 'Dokumentasi Sistem', icon: HelpCircle },
          ],
        },
      ];
    }

    if (currentRole === 'guru') {
      return [
        {
          title: 'MENU UTAMA',
          items: [
            { id: 'dashboard', label: 'Dashboard Guru', icon: LayoutDashboard },
            { id: 'schedules', label: 'Jadwal Mengajar', icon: Clock },
            { id: 'students', label: 'Daftar Siswa', icon: GraduationCap },
          ],
        },
        {
          title: 'PEMBELAJARAN',
          items: [
            { id: 'attendance', label: 'Presensi Siswa', icon: ClipboardCheck },
            { id: 'grades', label: 'Input Nilai Siswa', icon: Award },
            { id: 'assignments', label: 'Tugas Akademik', icon: FileText },
            { id: 'exams', label: 'Jadwal & Soal Ujian', icon: FileCheck },
            { id: 'report_cards', label: 'Raport Digital', icon: FileSignature },
          ],
        },
        {
          title: 'INFORMASI & AKUN',
          items: [
            { id: 'chat', label: 'Ruang Obrolan Real-Time', icon: MessageSquare },
            { id: 'announcements', label: 'Pengumuman Sekolah', icon: Megaphone },
            { id: 'calendar', label: 'Kalender Akademik', icon: CalendarDays },
            { id: 'profile', label: 'Profil & Akun Saya', icon: UserIcon },
          ],
        },
      ];
    }

    if (currentRole === 'siswa') {
      return [
        {
          title: 'AKADEMIK SISWA',
          items: [
            { id: 'dashboard', label: 'Beranda Siswa', icon: LayoutDashboard },
            { id: 'schedules', label: 'Jadwal Pelajaran', icon: Clock },
            { id: 'attendance', label: 'Presensi Saya', icon: ClipboardCheck },
            { id: 'grades', label: 'Nilai Akademik', icon: Award },
            { id: 'assignments', label: 'Tugas & Kuis', icon: FileText },
            { id: 'exams', label: 'Jadwal Ujian', icon: FileCheck },
            { id: 'report_cards', label: 'Raport Digital', icon: FileSignature },
          ],
        },
        {
          title: 'INFORMASI & AKUN',
          items: [
            { id: 'chat', label: 'Ruang Obrolan Siswa', icon: MessageSquare },
            { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
            { id: 'calendar', label: 'Kalender Akademik', icon: CalendarDays },
            { id: 'profile', label: 'Profil & Akun Saya', icon: UserIcon },
          ],
        },
      ];
    }

    if (currentRole === 'orangtua') {
      return [
        {
          title: 'PORTAL WALI MURID',
          items: [
            { id: 'dashboard', label: 'Beranda Anak', icon: LayoutDashboard },
            { id: 'grades', label: 'Perkembangan Nilai', icon: Award },
            { id: 'attendance', label: 'Kehadiran Anak', icon: ClipboardCheck },
            { id: 'schedules', label: 'Jadwal Pelajaran', icon: Clock },
            { id: 'assignments', label: 'Tugas Anak', icon: FileText },
            { id: 'report_cards', label: 'Raport Digital', icon: FileSignature },
          ],
        },
        {
          title: 'INFORMASI & AKUN',
          items: [
            { id: 'chat', label: 'Ruang Obrolan Wali Murid', icon: MessageSquare },
            { id: 'announcements', label: 'Pengumuman Sekolah', icon: Megaphone },
            { id: 'calendar', label: 'Kalender Akademik', icon: CalendarDays },
            { id: 'profile', label: 'Profil & Akun Saya', icon: UserIcon },
          ],
        },
      ];
    }

    // Kepala Sekolah
    return [
      {
        title: 'MONITORING EKSEKUTIF',
        items: [
          { id: 'dashboard', label: 'Dashboard Monitoring', icon: LayoutDashboard },
          { id: 'chat', label: 'Ruang Obrolan Sekolah', icon: MessageSquare },
          { id: 'students', label: 'Monitoring Siswa', icon: GraduationCap },
          { id: 'teachers', label: 'Monitoring Guru', icon: Users },
          { id: 'attendance', label: 'Rekap Presensi', icon: ClipboardCheck },
          { id: 'grades', label: 'Statistik Nilai', icon: Award },
          { id: 'reports', label: 'Laporan Sekolah', icon: BarChart3 },
          { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
          { id: 'calendar', label: 'Kalender Akademik', icon: CalendarDays },
          { id: 'profile', label: 'Profil & Akun Saya', icon: UserIcon },
        ],
      },
    ];
  };

  const sections = getSections();

  return (
    <aside className="hidden md:flex flex-col w-72 lg:w-76 xl:w-80 bg-white border border-slate-200 rounded-3xl sticky top-[5.25rem] h-[calc(100vh-6.25rem)] flex-shrink-0 shadow-xs overflow-hidden z-10">
      {/* Brand Header In Sidebar - Pinned at top */}
      <div className="p-4.5 border-b border-slate-100 flex items-center gap-3.5 bg-white flex-shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold shadow-xs flex-shrink-0">
          <School className="w-5.5 h-5.5" />
        </div>
        <div className="overflow-hidden min-w-0">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight truncate leading-tight">
            {schoolProfile.name}
          </h2>
          <p className="text-xs text-teal-600 font-semibold mt-0.5">NPSN: {schoolProfile.npsn}</p>
        </div>
      </div>

      {/* Navigation Sections - Independent Dedicated Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4.5 space-y-6 overscroll-contain sidebar-scroll scroll-smooth">
        {sections.map((section, idx) => (
          <div key={idx}>
            <p className="px-3.5 text-[11px] font-bold text-slate-400 tracking-wider mb-2 uppercase">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentModule(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white flex-shrink-0 ml-2">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* PWA Promo Card in Desktop Sidebar - Pinned at bottom */}
      <div className="p-3.5 border-t border-slate-100 bg-white flex-shrink-0">
        <PWAInstallButton variant="sidebar" />
      </div>
    </aside>
  );
};
