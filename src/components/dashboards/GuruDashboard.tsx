import React, { useState, useMemo } from 'react';
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
  Megaphone,
  MapPin,
  CalendarDays,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

interface GuruDashboardProps {
  setCurrentModule: (mod: string) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ setCurrentModule }) => {
  const { currentUser } = useAuth();
  const { schedules, assignments, submissions, classes, students, announcements } = useSiakadData();

  // Find teacher's schedules
  const mySchedules = schedules.filter(
    (s) =>
      (currentUser?.id && s.teacherId === currentUser.id) ||
      (currentUser?.name && s.teacherName?.toLowerCase().includes(currentUser.name.toLowerCase())) ||
      s.teacherName?.toLowerCase().includes('hendra') ||
      s.teacherId === 'tch-01'
  );
  const teacherSchedules = mySchedules.length > 0 ? mySchedules : schedules.slice(0, 4);

  // Day detection
  const DAY_MAP = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
  const currentDayIndex = new Date().getDay();
  const currentDayName: string = DAY_MAP[currentDayIndex];

  // Distinct days where teacher has classes
  const availableDays: string[] = Array.from(new Set(teacherSchedules.map((s) => s.day as string)));

  // Selected day tab: default to currentDayName if teacher has class today, otherwise first available day or 'Hari Ini'
  const [selectedDayTab, setSelectedDayTab] = useState<string>(() => {
    return availableDays.includes(currentDayName) ? 'Hari Ini' : (availableDays[0] || 'Senin');
  });

  // Calculate duration helper
  const getDurationMinutes = (startTime: string, endTime: string): string => {
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const duration = endH * 60 + endM - (startH * 60 + startM);
      if (duration > 0) {
        return `${duration} Menit`;
      }
    } catch {
      // fallback
    }
    return '90 Menit';
  };

  // Filtered schedules according to selected tab
  const displaySchedules = useMemo(() => {
    if (selectedDayTab === 'Hari Ini') {
      return teacherSchedules.filter((s) => (s.day as string) === currentDayName);
    }
    if (selectedDayTab === 'Semua') {
      return teacherSchedules;
    }
    return teacherSchedules.filter((s) => s.day === selectedDayTab);
  }, [selectedDayTab, teacherSchedules, currentDayName]);

  // Teacher assignments
  const teacherAssignments = assignments.filter(
    (a) => !currentUser?.id || a.teacherId === currentUser?.id || a.teacherName?.toLowerCase().includes('hendra')
  );
  const displayAssignments = teacherAssignments.length > 0 ? teacherAssignments : assignments;
  const pendingGradingSubmissions = submissions.filter((s) => s.status !== 'Dinilai');

  // Homeroom students (Wali Kelas)
  const homeroomStudents = students.filter(
    (s) => s.className === 'X MIPA 1' || s.className?.toLowerCase().includes('x mipa 1')
  );
  const totalBinaan = homeroomStudents.length > 0 ? homeroomStudents.length : 32;

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

      {/* Teacher Metric Cards - Balanced, Proportional & Professional */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Jadwal Mengajar */}
        <div
          onClick={() => setCurrentModule('schedules')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-400 hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Jadwal Mengajar</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{mySchedules.length}</span>
              <span className="text-xs font-semibold text-teal-600">Sesi</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">Terdaftar minggu ini</p>
          </div>
        </div>

        {/* Siswa Binaan */}
        <div
          onClick={() => setCurrentModule('students')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Siswa Binaan</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{totalBinaan}</span>
              <span className="text-xs font-semibold text-blue-600">Siswa</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">Wali Kelas X MIPA 1</p>
          </div>
        </div>

        {/* Tugas Aktif */}
        <div
          onClick={() => setCurrentModule('assignments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-400 hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Tugas Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{displayAssignments.length}</span>
              <span className="text-xs font-semibold text-purple-600">Tugas</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">Sedang berlangsung</p>
          </div>
        </div>

        {/* Perlu Dinilai */}
        <div
          onClick={() => setCurrentModule('assignments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Perlu Dinilai</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition flex-shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{pendingGradingSubmissions.length}</span>
              <span className="text-xs font-semibold text-amber-600">Tugas</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">Menunggu pemeriksaan</p>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons for Teacher - Professional, Polished, Proportional */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100/80">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Aksi Cepat Pembelajaran</h3>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Pintasan langsung ke aktivitas utama pengajaran & administrasi guru
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/50">
            Pintasan Guru
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Action 1: Presensi Siswa */}
          <button
            type="button"
            onClick={() => setCurrentModule('attendance')}
            className="group text-left p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-teal-400 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-teal-700 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="w-6 h-6 rounded-lg bg-white sm:bg-slate-100 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 flex items-center justify-center transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-2xs sm:shadow-none">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                Presensi Siswa
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                Catat kehadiran harian kelas
              </p>
            </div>
          </button>

          {/* Action 2: Input Nilai */}
          <button
            type="button"
            onClick={() => setCurrentModule('grades')}
            className="group text-left p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="w-6 h-6 rounded-lg bg-white sm:bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-2xs sm:shadow-none">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                Input Nilai Siswa
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                Kelola nilai harian & ujian
              </p>
            </div>
          </button>

          {/* Action 3: Buat Tugas Baru */}
          <button
            type="button"
            onClick={() => setCurrentModule('assignments')}
            className="group text-left p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="w-6 h-6 rounded-lg bg-white sm:bg-slate-100 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 flex items-center justify-center transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-2xs sm:shadow-none">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                Buat Tugas Baru
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                Unggah penugasan & materi
              </p>
            </div>
          </button>

          {/* Action 4: Raport Wali Kelas */}
          <button
            type="button"
            onClick={() => setCurrentModule('report_cards')}
            className="group text-left p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-purple-400 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-purple-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="w-6 h-6 rounded-lg bg-white sm:bg-slate-100 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 flex items-center justify-center transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-2xs sm:shadow-none">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                Raport Wali Kelas
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                Leger capaian & cetak nilai
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Teaching Schedule & Pending Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Classes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-800">Jadwal Mengajar</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 border border-teal-200/60 text-teal-800">
                  {currentDayName}
                </span>
              </div>
              <button
                onClick={() => setCurrentModule('schedules')}
                className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Semua Jadwal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Day Filter Tabs */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedDayTab('Hari Ini')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                  selectedDayTab === 'Hari Ini'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Hari Ini ({currentDayName})
              </button>
              {availableDays.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDayTab(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                    selectedDayTab === d
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => setSelectedDayTab('Semua')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                  selectedDayTab === 'Semua'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({teacherSchedules.length})
              </button>
            </div>

            {/* Schedule Cards List */}
            <div className="space-y-2.5">
              {displaySchedules.length === 0 ? (
                <div className="text-center py-7 px-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <Calendar className="w-7 h-7 text-teal-600 mx-auto mb-2 opacity-70" />
                  <p className="text-xs font-bold text-slate-700">
                    Tidak ada jadwal mengajar pada hari {selectedDayTab === 'Hari Ini' ? currentDayName : selectedDayTab}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gunakan waktu luang untuk menyusun modul ajar atau memeriksa tugas siswa.
                  </p>
                  {availableDays.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        onClick={() => setSelectedDayTab(availableDays[0])}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition cursor-pointer"
                      >
                        Buka Jadwal Hari {availableDays[0]} →
                      </button>
                      <button
                        onClick={() => setSelectedDayTab('Semua')}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
                      >
                        Semua Hari
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                displaySchedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-teal-300 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      {/* Time Badge - Proportional, balanced, consistent */}
                      <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-teal-50 border border-teal-100/90 text-teal-900 flex-shrink-0 min-w-[95px] text-center">
                        <div className="flex items-center gap-1 text-xs font-bold text-teal-800">
                          <Clock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          <span>{sch.startTime} - {sch.endTime}</span>
                        </div>
                        <div className="text-[10px] font-medium text-teal-600/90 mt-0.5 flex items-center justify-center gap-1">
                          <span>{sch.day}</span>
                          <span>•</span>
                          <span>{getDurationMinutes(sch.startTime, sch.endTime)}</span>
                        </div>
                      </div>

                      {/* Subject & Class Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {sch.subjectName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200/40">
                            {sch.className}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {sch.room}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400">T.A. {sch.academicYear} ({sch.semester})</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center border-t sm:border-t-0 border-slate-200/50 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-[10px] text-slate-500 sm:hidden">
                        Ruang: {sch.room}
                      </span>
                      <button
                        onClick={() => setCurrentModule('attendance')}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Buka Presensi Kelas"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Presensi</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-800">Tugas Siswa Perlu Dinilai</h3>
                {pendingGradingSubmissions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {pendingGradingSubmissions.length} antrean
                  </span>
                )}
              </div>
              <button
                onClick={() => setCurrentModule('assignments')}
                className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Penilaian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingGradingSubmissions.length === 0 ? (
                <div className="text-center py-7 px-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                  <p className="font-semibold text-slate-700">Semua tugas telah diperiksa!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada antrean penilaian yang tertunda saat ini.</p>
                </div>
              ) : (
                pendingGradingSubmissions.slice(0, 3).map((sub) => {
                  const relatedAssignment = assignments.find((a) => a.id === sub.assignmentId);
                  return (
                    <div
                      key={sub.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-amber-300 hover:bg-white transition flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{sub.studentName}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {relatedAssignment?.title || 'Tugas Siswa'}
                        </p>
                        <p className="text-[10px] text-teal-600 font-medium mt-0.5">
                          Diserahkan: {sub.submittedAt}
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentModule('assignments')}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition shadow-2xs flex-shrink-0"
                      >
                        Beri Nilai
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
