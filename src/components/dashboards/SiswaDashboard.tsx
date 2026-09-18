import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import {
  GraduationCap,
  Clock,
  Award,
  ClipboardCheck,
  FileText,
  FileCheck,
  Megaphone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface SiswaDashboardProps {
  setCurrentModule: (mod: string) => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({ setCurrentModule }) => {
  const { currentUser } = useAuth();
  const { students, schedules, grades, assignments, announcements, activeAcademicYear } = useSiakadData();

  // Find logged in student or default to Farhan
  const myStudent =
    students.find((s) => s.id === currentUser?.id || s.name.includes('Farhan')) || students[0];

  // My schedules (matching student class)
  const mySchedules = schedules.filter((s) => s.classId === myStudent.classId);
  const todaySchedules = mySchedules.filter((s) => s.day === 'Jumat' || s.day === 'Senin');

  // My grades
  const myGrades = grades.filter((g) => g.studentId === myStudent.id);
  const avgGrade =
    myGrades.length > 0
      ? (myGrades.reduce((sum, g) => sum + g.finalScore, 0) / myGrades.length).toFixed(1)
      : '87.5';

  // My assignments
  const myAssignments = assignments.filter((a) => a.classId === myStudent.classId);

  return (
    <div className="space-y-5">
      {/* Student Profile & Quick Overview Card */}
      <div className="rounded-3xl bg-gradient-to-tr from-teal-800 via-teal-700 to-emerald-600 text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-2xl shadow-inner">
              {myStudent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  Kelas {myStudent.className}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-teal-950">
                  {myStudent.status}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black mt-1 leading-tight">{myStudent.name}</h1>
              <p className="text-xs text-teal-100 font-mono mt-0.5">
                NIS: {myStudent.nis} • NISN: {myStudent.nisn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] text-teal-100 uppercase tracking-wider block font-bold">Rata-rata Nilai</span>
              <span className="text-lg sm:text-xl font-black text-white">{avgGrade}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] text-teal-100 uppercase tracking-wider block font-bold">Kehadiran</span>
              <span className="text-lg sm:text-xl font-black text-emerald-300">97%</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative orb */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* Quick Action Bar for Mobile Touch (≥ 44px) */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => setCurrentModule('schedules')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition shadow-2xs cursor-pointer min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Jadwal</span>
        </button>

        <button
          onClick={() => setCurrentModule('grades')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition shadow-2xs cursor-pointer min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-1">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Nilai</span>
        </button>

        <button
          onClick={() => setCurrentModule('assignments')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition shadow-2xs cursor-pointer min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Tugas</span>
        </button>

        <button
          onClick={() => setCurrentModule('report_cards')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition shadow-2xs cursor-pointer min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-1">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Raport</span>
        </button>
      </div>

      {/* Today's Classes & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pelajaran Hari Ini</h3>
            </div>
            <button
              onClick={() => setCurrentModule('schedules')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Lihat Mingguan
            </button>
          </div>

          <div className="space-y-2">
            {todaySchedules.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Tidak ada jadwal pelajaran hari ini.</p>
            ) : (
              todaySchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{sch.subjectName}</p>
                    <p className="text-[11px] text-slate-500">
                      {sch.teacherName} • Ruang: {sch.room}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                    {sch.startTime} - {sch.endTime}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Tasks & Homework */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tugas Aktif</h3>
            </div>
            <button
              onClick={() => setCurrentModule('assignments')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Semua Tugas
            </button>
          </div>

          <div className="space-y-2">
            {myAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Tidak ada tugas aktif.</p>
            ) : (
              myAssignments.slice(0, 3).map((asg) => (
                <div
                  key={asg.id}
                  onClick={() => setCurrentModule('assignments')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      {asg.subjectName}
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{asg.title}</p>
                    <p className="text-[10px] text-slate-500">Tenggat: {asg.dueDate}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pengumuman Sekolah</h3>
          </div>
          <button
            onClick={() => setCurrentModule('announcements')}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            Lihat Semua
          </button>
        </div>

        <div className="space-y-2">
          {announcements.slice(0, 2).map((a) => (
            <div
              key={a.id}
              onClick={() => setCurrentModule('announcements')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition cursor-pointer"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase">{a.category}</span>
                <span className="text-[10px] text-slate-400">{a.publishedDate}</span>
              </div>
              <p className="text-xs font-bold text-slate-800">{a.title}</p>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{a.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
