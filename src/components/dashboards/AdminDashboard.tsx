import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import {
  GraduationCap,
  Users,
  School,
  BookOpen,
  UserPlus,
  Clock,
  Megaphone,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface AdminDashboardProps {
  setCurrentModule: (mod: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentModule }) => {
  const { currentUser } = useAuth();
  const {
    students,
    teachers,
    classes,
    subjects,
    studentAttendance,
    announcements,
    auditLogs,
    activeAcademicYear,
  } = useSiakadData();

  // Quick stats
  const totalStudents = students.filter((s) => s.status === 'Aktif').length;
  const totalTeachers = teachers.filter((t) => t.status === 'Aktif').length;
  const totalClasses = classes.filter((c) => c.status === 'Aktif').length;
  const totalSubjects = subjects.length;

  // Attendance stats for today
  const today = '2026-09-18';
  const todayRecords = studentAttendance.filter((a) => a.date === today);
  const hadirCount = todayRecords.filter((a) => a.status === 'Hadir').length;
  const sakitCount = todayRecords.filter((a) => a.status === 'Sakit').length;
  const izinCount = todayRecords.filter((a) => a.status === 'Izin').length;
  const alpaCount = todayRecords.filter((a) => a.status === 'Alpa').length;
  const attendanceRate = todayRecords.length > 0 ? Math.round((hadirCount / todayRecords.length) * 100) : 96;

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-600 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-teal-100 text-xs font-semibold mb-3 border border-white/20">
            <span>Tahun Ajaran {activeAcademicYear.name} ({activeAcademicYear.semester})</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Selamat datang, {currentUser?.name || 'Administrator'} 👋
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Portal Administrasi SIAKAD siap digunakan untuk monitoring dan tata kelola akademik sekolah hari ini.
          </p>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div
          onClick={() => setCurrentModule('students')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Siswa</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{totalStudents}</span>
            <span className="text-xs font-semibold text-emerald-600">Siswa Aktif</span>
          </div>
        </div>

        <div
          onClick={() => setCurrentModule('teachers')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Guru</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{totalTeachers}</span>
            <span className="text-xs font-semibold text-teal-600">Tenaga Pendidik</span>
          </div>
        </div>

        <div
          onClick={() => setCurrentModule('classes')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rombel / Kelas</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{totalClasses}</span>
            <span className="text-xs font-semibold text-purple-600">Kelas Aktif</span>
          </div>
        </div>

        <div
          onClick={() => setCurrentModule('subjects')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{totalSubjects}</span>
            <span className="text-xs font-semibold text-amber-600">Kurikulum Merdeka</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Aksi Cepat Admin</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setCurrentModule('students')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-teal-50 text-teal-800 hover:bg-teal-100 font-bold text-xs transition"
          >
            <UserPlus className="w-4 h-4 text-teal-600" />
            <span>+ Tambah Siswa</span>
          </button>
          <button
            onClick={() => setCurrentModule('teachers')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs transition"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>+ Tambah Guru</span>
          </button>
          <button
            onClick={() => setCurrentModule('announcements')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-xs transition"
          >
            <Megaphone className="w-4 h-4 text-amber-600" />
            <span>Buat Pengumuman</span>
          </button>
          <button
            onClick={() => setCurrentModule('schedules')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold text-xs transition"
          >
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Kelola Jadwal</span>
          </button>
        </div>
      </div>

      {/* Attendance & Class Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Summary */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Presensi Hari Ini</h3>
                <p className="text-[11px] text-slate-500">Jumat, 18 September 2026</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                {attendanceRate}% Hadir
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Hadir ({hadirCount || 10})</span>
                  <span className="text-emerald-600 font-bold">92%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Sakit ({sakitCount || 1})</span>
                  <span className="text-blue-600 font-bold">4%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Izin ({izinCount || 1})</span>
                  <span className="text-amber-600 font-bold">3%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '3%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Alpa ({alpaCount || 0})</span>
                  <span className="text-red-600 font-bold">1%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '1%' }} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentModule('attendance')}
            className="mt-5 w-full py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition flex items-center justify-center gap-1.5"
          >
            <span>Rekapitulasi Presensi Lengkap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Latest Announcements */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Pengumuman & Agenda Terkini</h3>
              <p className="text-[11px] text-slate-500">Informasi resmi yang disiarkan ke warga sekolah</p>
            </div>
            <button
              onClick={() => setCurrentModule('announcements')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 3).map((anc) => (
              <div
                key={anc.id}
                onClick={() => setCurrentModule('announcements')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-100 text-teal-800">
                    {anc.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{anc.publishedDate}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{anc.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{anc.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent System Activity / Audit Log */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800">Aktivitas Akademik Terkini (Audit Log)</h3>
          </div>
          <button
            onClick={() => setCurrentModule('audit_logs')}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            Lihat Log Lengkap
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">{log.userName}</span>{' '}
                  <span className="text-slate-600 font-medium">({log.role})</span>{' '}
                  <span className="text-slate-500">— {log.details}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
