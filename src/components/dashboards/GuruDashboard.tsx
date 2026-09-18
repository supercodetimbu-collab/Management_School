import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import {
  Clock,
  ClipboardCheck,
  Award,
  FileText,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface GuruDashboardProps {
  setCurrentModule: (mod: string) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ setCurrentModule }) => {
  const { currentUser } = useAuth();
  const { schedules, assignments, submissions, classes, students } = useSiakadData();

  // Find teacher's schedules
  const mySchedules = schedules.filter(
    (s) => s.teacherId === currentUser?.id || s.teacherName.includes('Hendra')
  );

  // Today's schedule (e.g. Jumat or all)
  const todaySchedules = mySchedules.filter((s) => s.day === 'Jumat' || s.day === 'Senin');

  // Teacher assignments
  const myAssignments = assignments.filter((a) => a.teacherId === currentUser?.id || true);
  const pendingGradingSubmissions = submissions.filter((s) => s.status === 'Diserahkan');

  return (
    <div className="space-y-6">
      {/* Teacher Greeting */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-teal-700 to-teal-800 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold mb-2">
              Tenaga Pendidik & Pengajar
            </span>
            <h1 className="text-xl sm:text-2xl font-black">
              Selamat Mengajar, {currentUser?.name || 'Bpk. Hendra Gunawan, M.Pd'} 👨‍🏫
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              Guru Mata Pelajaran Matematika • Wali Kelas X MIPA 1
            </p>
          </div>

          <button
            onClick={() => setCurrentModule('attendance')}
            className="px-4 py-2.5 rounded-xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <ClipboardCheck className="w-4 h-4 text-teal-600" />
            <span>Presensi Siswa Hari Ini</span>
          </button>
        </div>
      </div>

      {/* Teacher Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Jadwal Mengajar</span>
          <p className="text-2xl font-black text-slate-800 mt-2">{mySchedules.length} Sesi</p>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">Terdaftar minggu ini</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Siswa Binaan (Wali)</span>
          <p className="text-2xl font-black text-slate-800 mt-2">32 Siswa</p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">Kelas X MIPA 1</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Tugas Aktif</span>
          <p className="text-2xl font-black text-slate-800 mt-2">{myAssignments.length}</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Sedang berlangsung</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Perlu Dinilai</span>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingGradingSubmissions.length} Tugas</p>
          <p className="text-[11px] text-slate-500 mt-1">Menunggu pemeriksaan guru</p>
        </div>
      </div>

      {/* Quick Action Buttons for Teacher */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Aksi Cepat Pembelajaran</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setCurrentModule('attendance')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-teal-50 text-teal-800 hover:bg-teal-100 font-bold text-xs transition"
          >
            <ClipboardCheck className="w-4 h-4 text-teal-600" />
            <span>Presensi Siswa</span>
          </button>
          <button
            onClick={() => setCurrentModule('grades')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs transition"
          >
            <Award className="w-4 h-4 text-blue-600" />
            <span>Input Nilai</span>
          </button>
          <button
            onClick={() => setCurrentModule('assignments')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-xs transition"
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Buat Tugas Baru</span>
          </button>
          <button
            onClick={() => setCurrentModule('report_cards')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold text-xs transition"
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Raport Wali Kelas</span>
          </button>
        </div>
      </div>

      {/* Today's Teaching Schedule & Pending Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Classes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800">Jadwal Mengajar Hari Ini</h3>
            </div>
            <button
              onClick={() => setCurrentModule('schedules')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Semua Jadwal
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedules.map((sch) => (
              <div
                key={sch.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">{sch.subjectName}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800">
                      {sch.className}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ruang: {sch.room} • {sch.day}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 font-mono text-xs font-bold block">
                    {sch.startTime} - {sch.endTime}
                  </span>
                  <button
                    onClick={() => setCurrentModule('attendance')}
                    className="mt-1 text-[11px] font-bold text-teal-600 hover:underline"
                  >
                    Buka Presensi →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-800">Tugas Siswa Perlu Dinilai</h3>
            </div>
            <button
              onClick={() => setCurrentModule('assignments')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Buka Penilaian
            </button>
          </div>

          <div className="space-y-2.5">
            {submissions.slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{sub.studentName}</p>
                  <p className="text-[10px] text-slate-500">
                    Diserahkan: {sub.submittedAt}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentModule('assignments')}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                >
                  Beri Nilai
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
