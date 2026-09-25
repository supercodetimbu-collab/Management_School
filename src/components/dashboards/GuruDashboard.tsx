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
  School,
  RotateCw,
} from 'lucide-react';

interface GuruDashboardProps {
  setCurrentModule: (mod: string) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ setCurrentModule }) => {
  const { currentUser } = useAuth();
  const { schedules, assignments, submissions, classes, students, announcements, schoolProfile } = useSiakadData();

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

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshScreen = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Greeting */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-teal-700 to-teal-800 text-white p-5 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold">
                Tenaga Pendidik & Pengajar
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xs">
                <School className="w-3.5 h-3.5 text-white" />
                <span>{schoolProfile.name}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Selamat Mengajar, {currentUser?.name || 'Bpk. Hendra Gunawan, M.Pd'} 👨‍🏫
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              Guru Mata Pelajaran Matematika • Wali Kelas X MIPA 1 • {schoolProfile.name}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={handleRefreshScreen}
              disabled={isRefreshing}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/30 backdrop-blur-md text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-75"
              title="Segarkan tampilan layar dan sinkronkan data terbaru"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-200' : 'text-white'}`} />
              <span>{isRefreshing ? 'Menyegarkan...' : 'Refresh Layar'}</span>
            </button>

            <button
              onClick={() => setCurrentModule('attendance')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            >
              <ClipboardCheck className="w-4 h-4 text-teal-600" />
              <span>Presensi Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Metric Cards - Balanced, Proportional & Professional */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Jadwal Mengajar */}
        <div
          onClick={() => setCurrentModule('schedules')}
          className="theme-card bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Jadwal Mengajar</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white flex items-center justify-center transition flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{mySchedules.length}</span>
              <span className="text-xs font-semibold text-slate-600">Sesi</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">Terdaftar minggu ini</p>
          </div>
        </div>

        {/* Siswa Binaan */}
        <div
          onClick={() => setCurrentModule('students')}
          className="theme-card bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
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
          className="theme-card bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-400 hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
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
          className="theme-card bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
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

      {/* Akses Cepat Card - 4 Internal Action Cards Wrapped in One Master Card */}
      <div className="theme-card bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">Akses Cepat</h3>
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">Pintasan Menu Utama Pengajar</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Presensi Siswa */}
          <button
            type="button"
            onClick={() => setCurrentModule('attendance')}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-teal-50/50 border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer group flex flex-col justify-between text-left shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Presensi Harian</span>
              <div className="w-8 h-8 rounded-xl bg-teal-100/70 text-teal-700 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition flex-shrink-0">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight group-hover:text-teal-700 transition">
                  Presensi Siswa
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">Catat kehadiran kelas</p>
            </div>
          </button>

          {/* Card 2: Input Nilai Siswa */}
          <button
            type="button"
            onClick={() => setCurrentModule('grades')}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between text-left shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Penilaian</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition flex-shrink-0">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-700 transition">
                  Input Nilai Siswa
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">Kelola nilai harian & ujian</p>
            </div>
          </button>

          {/* Card 3: Buat Tugas Baru */}
          <button
            type="button"
            onClick={() => setCurrentModule('assignments')}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-purple-50/50 border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between text-left shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Penugasan</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100/70 text-purple-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight group-hover:text-purple-700 transition">
                  Buat Tugas Baru
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">Unggah materi pembelajaran</p>
            </div>
          </button>

          {/* Card 4: Raport Wali Kelas */}
          <button
            type="button"
            onClick={() => setCurrentModule('report_cards')}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between text-left shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Wali Kelas</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight group-hover:text-amber-700 transition">
                  Raport Wali Kelas
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">Leger capaian & cetak nilai</p>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Teaching Schedule & Pending Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Classes */}
        <div className="theme-card bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-800">Jadwal Mengajar</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                  {currentDayName}
                </span>
              </div>
              <button
                onClick={() => setCurrentModule('schedules')}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
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
                    ? 'bg-slate-800 text-white shadow-2xs'
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
                      ? 'bg-slate-800 text-white shadow-2xs'
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
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({teacherSchedules.length})
              </button>
            </div>

            {/* Schedule Cards List */}
            <div className="space-y-2.5">
              {displaySchedules.length === 0 ? (
                <div className="text-center py-7 px-4 bg-white rounded-2xl border border-slate-100">
                  <Calendar className="w-7 h-7 text-slate-400 mx-auto mb-2 opacity-70" />
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
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                      >
                        Buka Jadwal Hari {availableDays[0]} →
                      </button>
                      <button
                        onClick={() => setSelectedDayTab('Semua')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
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
                    className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      {/* Time Badge - Clean Slate/White */}
                      <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex-shrink-0 min-w-[95px] text-center">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                          <span>{sch.startTime} - {sch.endTime}</span>
                        </div>
                        <div className="text-[10px] font-medium text-slate-500 mt-0.5 flex items-center justify-center gap-1">
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
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
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
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
        <div className="theme-card bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
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
