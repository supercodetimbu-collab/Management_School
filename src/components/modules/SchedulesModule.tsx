import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { Schedule, DayOfWeek } from '../../types';
import { Clock, Plus, Filter, AlertTriangle, CheckCircle2, Trash2, Calendar, Printer } from 'lucide-react';

export const SchedulesModule: React.FC = () => {
  const { schedules, classes, teachers, subjects, addSchedule, deleteSchedule, logAction } =
    useSiakadData();
  const { currentUser } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Form State
  const [formData, setFormData] = useState<Omit<Schedule, 'id'>>({
    academicYear: '2026/2027',
    semester: 'Ganjil',
    classId: classes[0]?.id || 'cls-01',
    className: classes[0]?.name || 'X MIPA 1',
    subjectId: subjects[0]?.id || 'sub-01',
    subjectName: subjects[0]?.name || 'Matematika',
    teacherId: teachers[0]?.id || 'tch-01',
    teacherName: teachers[0]?.name || 'Bpk. Hendra Gunawan, M.Pd',
    day: 'Senin',
    startTime: '07:30',
    endTime: '09:00',
    room: 'R.101',
  });

  const handleOpenAdd = () => {
    setConflictWarning(null);
    setFormData({
      academicYear: '2026/2027',
      semester: 'Ganjil',
      classId: classes[0]?.id || 'cls-01',
      className: classes[0]?.name || 'X MIPA 1',
      subjectId: subjects[0]?.id || 'sub-01',
      subjectName: subjects[0]?.name || 'Matematika',
      teacherId: teachers[0]?.id || 'tch-01',
      teacherName: teachers[0]?.name || 'Bpk. Hendra Gunawan, M.Pd',
      day: 'Senin',
      startTime: '07:30',
      endTime: '09:00',
      room: 'R.101',
    });
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);

    const c = classes.find((cl) => cl.id === formData.classId);
    const sub = subjects.find((s) => s.id === formData.subjectId);
    const tch = teachers.find((t) => t.id === formData.teacherId);

    const enriched = {
      ...formData,
      className: c ? c.name : formData.className,
      subjectName: sub ? sub.name : formData.subjectName,
      teacherName: tch ? tch.name : formData.teacherName,
    };

    const res = addSchedule(enriched);
    if (!res.success) {
      setConflictWarning(res.conflictMessage || 'Jadwal bertabrakan!');
      return;
    }

    logAction('ADD_SCHEDULE', 'Jadwal', `Menambahkan jadwal ${enriched.subjectName} di ${enriched.className}`, currentUser!);
    setShowAddModal(false);
  };

  const handleDelete = (sch: Schedule) => {
    if (confirm(`Hapus jadwal ${sch.subjectName} (${sch.day} ${sch.startTime})?`)) {
      deleteSchedule(sch.id);
      logAction('DELETE_SCHEDULE', 'Jadwal', `Menghapus jadwal ${sch.subjectName}`, currentUser!);
    }
  };

  // Filtered schedules
  const filtered = schedules.filter((s) => {
    const matchClass = selectedClass === 'ALL' || s.classId === selectedClass;
    const matchDay = selectedDay === 'ALL' || s.day === selectedDay;
    return matchClass && matchDay;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Jadwal Pelajaran Terpadu</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dilengkapi sistem deteksi otomatis bentrok guru, kelas, dan ruangan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Jadwal</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Hari:</span>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setSelectedDay('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedDay === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedDay === d ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedules Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days
          .filter((d) => selectedDay === 'ALL' || selectedDay === d)
          .map((day) => {
            const daySchedules = filtered.filter((s) => s.day === day);
            return (
              <div key={day} className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 bg-teal-50 border-b border-teal-100 flex items-center justify-between">
                  <span className="font-bold text-teal-900 text-xs uppercase tracking-wider">{day}</span>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                <div className="p-3 space-y-2.5">
                  {daySchedules.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">Tidak ada jadwal</p>
                  ) : (
                    daySchedules.map((sch) => (
                      <div
                        key={sch.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-300 transition group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-100 text-teal-800">
                            {sch.startTime} - {sch.endTime}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {sch.room}
                            </span>
                            <button
                              onClick={() => handleDelete(sch)}
                              className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition p-0.5"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800">{sch.subjectName}</h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                          <span>{sch.teacherName}</span>
                          <span className="font-bold text-teal-700">{sch.className}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Schedule Modal with Anti-Conflict Alert */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100">
              Tambah Jadwal Pelajaran Baru
            </h3>

            {conflictWarning && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{conflictWarning}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Rombel</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hari</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Guru Pengajar</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ruangan</label>
                  <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                >
                  Verifikasi & Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
