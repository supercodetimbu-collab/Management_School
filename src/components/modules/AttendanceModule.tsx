import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { AttendanceStatus, StudentAttendanceRecord } from '../../types';
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  Users,
  Clock,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const {
    students,
    classes,
    teachers,
    studentAttendance,
    batchRecordStudentAttendance,
    activeAcademicYear,
    logAction,
  } = useSiakadData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'siswa' | 'guru' | 'rekap'>('siswa');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-01');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-18');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Students in selected class
  const classStudents = students.filter((s) => s.classId === selectedClassId && s.status === 'Aktif');

  // Local attendance state for current date & class
  const [currentAttendance, setCurrentAttendance] = useState<
    Record<string, { status: AttendanceStatus; notes: string; checkIn: string }>
  >(() => {
    const initial: Record<string, { status: AttendanceStatus; notes: string; checkIn: string }> = {};
    classStudents.forEach((std) => {
      const existing = studentAttendance.find((a) => a.studentId === std.id && a.date === '2026-09-18');
      initial[std.id] = {
        status: existing?.status || 'Hadir',
        notes: existing?.notes || '',
        checkIn: existing?.checkInTime || '07:15',
      };
    });
    return initial;
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setCurrentAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '', checkIn: '07:15' }),
        status,
      },
    }));
  };

  const handleMarkAllHadir = () => {
    const updated: Record<string, { status: AttendanceStatus; notes: string; checkIn: string }> = {};
    classStudents.forEach((std) => {
      updated[std.id] = {
        status: 'Hadir',
        notes: '',
        checkIn: '07:15',
      };
    });
    setCurrentAttendance(updated);
  };

  const handleSaveAttendance = () => {
    const cls = classes.find((c) => c.id === selectedClassId);
    const recordsToSave: Omit<StudentAttendanceRecord, 'id'>[] = classStudents.map((std) => {
      const att = currentAttendance[std.id] || { status: 'Hadir', notes: '', checkIn: '07:15' };
      return {
        studentId: std.id,
        studentName: std.name,
        classId: selectedClassId,
        className: cls ? cls.name : 'Kelas',
        date: selectedDate,
        status: att.status,
        checkInTime: att.status === 'Hadir' ? att.checkIn : undefined,
        notes: att.notes,
        note: att.notes,
        academicYear: activeAcademicYear.name,
        semester: activeAcademicYear.semester,
        recordedBy: currentUser?.name || 'Guru Piket',
      };
    });

    batchRecordStudentAttendance(recordsToSave);
    logAction(
      'RECORD_ATTENDANCE',
      'Presensi',
      `Menyimpan presensi ${cls?.name} pada ${selectedDate}`,
      currentUser!
    );
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Status counters
  const total = classStudents.length;
  const hadirCount = classStudents.filter((s) => (currentAttendance[s.id]?.status || 'Hadir') === 'Hadir').length;
  const sakitCount = classStudents.filter((s) => currentAttendance[s.id]?.status === 'Sakit').length;
  const izinCount = classStudents.filter((s) => currentAttendance[s.id]?.status === 'Izin').length;
  const alpaCount = classStudents.filter((s) => currentAttendance[s.id]?.status === 'Alpa').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Presensi & Kehadiran Digital</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan real-time kehadiran siswa dan dewan guru dengan rekapitulasi otomatis
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('siswa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'siswa' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Presensi Siswa
          </button>
          <button
            onClick={() => setActiveTab('guru')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'guru' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Presensi Guru
          </button>
          <button
            onClick={() => setActiveTab('rekap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'rekap' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rekap Bulanan
          </button>
        </div>
      </div>

      {activeTab === 'siswa' && (
        <div className="space-y-4">
          {/* Filter & Action Controls */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Pilih Kelas:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handleMarkAllHadir}
                className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer"
              >
                ✓ Tandai Semua Hadir
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simpan Presensi</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Hadir</span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800">
                {hadirCount} / {total}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Sakit (S)</span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-blue-100 text-blue-800">
                {sakitCount}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Izin (I)</span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-100 text-amber-800">
                {izinCount}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Alpa (A)</span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-red-100 text-red-800">
                {alpaCount}
              </span>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Data presensi berhasil disimpan ke database sekolah!</span>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-3">NIS</th>
                    <th className="py-3 px-4 text-center">Status Kehadiran</th>
                    <th className="py-3 px-3">Jam Masuk</th>
                    <th className="py-3 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {classStudents.map((std, idx) => {
                    const att = currentAttendance[std.id] || { status: 'Hadir', notes: '', checkIn: '07:15' };
                    return (
                      <tr key={std.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{std.name}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{std.nis}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                            {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as AttendanceStatus[]).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(std.id, st)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                                  att.status === st
                                    ? st === 'Hadir'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'Sakit'
                                      ? 'bg-blue-600 text-white'
                                      : st === 'Izin'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-red-600 text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {st === 'Hadir' ? 'Hadir' : st === 'Sakit' ? 'Sakit' : st === 'Izin' ? 'Izin' : 'Alpa'}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="time"
                            value={att.checkIn}
                            onChange={(e) =>
                              setCurrentAttendance((prev) => ({
                                ...prev,
                                [std.id]: { ...att, checkIn: e.target.value },
                              }))
                            }
                            className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            placeholder="Catatan..."
                            value={att.notes}
                            onChange={(e) =>
                              setCurrentAttendance((prev) => ({
                                ...prev,
                                [std.id]: { ...att, notes: e.target.value },
                              }))
                            }
                            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guru' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Kehadiran Dewan Guru Hari Ini ({selectedDate})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Guru</th>
                  <th className="py-3 px-3">Mata Pelajaran</th>
                  <th className="py-3 px-3">Jam Datang</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-800">{t.name}</td>
                    <td className="py-3 px-3 text-teal-700 font-semibold">{t.subjectName}</td>
                    <td className="py-3 px-3 font-mono">06:45 WIB</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Hadir Tepat Waktu
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rekap' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Rekapitulasi Kehadiran Bulanan (September 2026)</h3>
              <p className="text-xs text-slate-500">Persentase kehadiran per rombongan belajar</p>
            </div>
            <button
              onClick={() => alert('Rekapitulasi presensi berhasil diexport ke Excel!')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Rekap Excel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {classes.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-xs text-slate-800">{c.name}</h4>
                  <span className="text-xs font-black text-emerald-700">97.2%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '97.2%' }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Wali Kelas: {c.waliKelasName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
