import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { Exam, ExamType } from '../../types';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
  Printer,
  ShieldCheck,
  School,
  FileText,
} from 'lucide-react';

export const ExamsModule: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const {
    exams,
    classes,
    subjects,
    teachers,
    addExam,
    updateExam,
    deleteExam,
  } = useSiakadData();

  const canManage = currentRole === 'admin' || currentRole === 'superadmin' || currentRole === 'guru';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deleteConfirmExam, setDeleteConfirmExam] = useState<Exam | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    type: ExamType;
    subjectId: string;
    classId: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    supervisorName: string;
    durationMinutes: number;
  }>({
    title: '',
    type: 'UTS',
    subjectId: subjects[0]?.id || '',
    classId: classes[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:30',
    endTime: '09:00',
    room: 'Ruang R.201',
    supervisorName: teachers[0]?.name || 'Guru Pengawas',
    durationMinutes: 90,
  });

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered exams list
  const filteredExams = exams.filter((ex) => {
    const matchSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.supervisorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType = typeFilter === 'all' || ex.type === typeFilter;
    const matchClass = classFilter === 'all' || ex.classId === classFilter;

    return matchSearch && matchType && matchClass;
  });

  // Calculate stats
  const totalExams = exams.length;
  const utsCount = exams.filter((e) => e.type === 'UTS').length;
  const uasCount = exams.filter((e) => e.type === 'UAS').length;
  const otherCount = totalExams - utsCount - uasCount;

  // Handle Add Exam
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Judul ujian wajib diisi.', 'error');
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === formData.subjectId) || subjects[0];
    const selectedClass = classes.find((c) => c.id === formData.classId) || classes[0];

    addExam({
      title: formData.title.trim(),
      type: formData.type,
      subjectId: selectedSubject ? selectedSubject.id : 'sub-01',
      subjectName: selectedSubject ? selectedSubject.name : 'Mata Pelajaran',
      classId: selectedClass ? selectedClass.id : 'cls-01',
      className: selectedClass ? selectedClass.name : 'Kelas',
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      room: formData.room.trim() || 'Ruang Ujian',
      supervisorName: formData.supervisorName.trim() || 'Pengawas Ujian',
      durationMinutes: Number(formData.durationMinutes) || 90,
    });

    showToast(`Jadwal ujian "${formData.title}" berhasil diterbitkan.`);
    setShowAddModal(false);
    setFormData({
      title: '',
      type: 'UTS',
      subjectId: subjects[0]?.id || '',
      classId: classes[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      startTime: '07:30',
      endTime: '09:00',
      room: 'Ruang R.201',
      supervisorName: teachers[0]?.name || 'Guru Pengawas',
      durationMinutes: 90,
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    updateExam(editingExam.id, {
      title: editingExam.title,
      type: editingExam.type,
      subjectId: editingExam.subjectId,
      subjectName: editingExam.subjectName,
      classId: editingExam.classId,
      className: editingExam.className,
      date: editingExam.date,
      startTime: editingExam.startTime,
      endTime: editingExam.endTime,
      room: editingExam.room,
      supervisorName: editingExam.supervisorName,
      durationMinutes: Number(editingExam.durationMinutes) || 90,
    });

    showToast(`Jadwal ujian "${editingExam.title}" berhasil diperbarui.`);
    setEditingExam(null);
  };

  // Handle Delete
  const handleDelete = (exam: Exam) => {
    deleteExam(exam.id);
    showToast(`Sesi ujian "${exam.title}" telah dihapus.`);
    setDeleteConfirmExam(null);
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  const examTypeColors: Record<ExamType, { bg: string; text: string; border: string }> = {
    UTS: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    UAS: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Ulangan Harian': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Ujian Praktik': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Ujian Akhir': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold max-w-md animate-in fade-in slide-in-from-top-4 duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p>{toastMessage.text}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Manajemen Ujian & Evaluasi Akademik</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Jadwal & Asesmen
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penjadwalan Penilaian Tengah Semester (PTS/UTS), Penilaian Akhir Semester (PAS/UAS), alokasi ruang, dan penugasan pengawas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowRulesModal(true)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Tata Tertib Ujian</span>
          </button>

          <button
            onClick={handlePrint}
            title="Cetak Jadwal Ujian"
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Cetak Jadwal</span>
          </button>

          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal Ujian</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Ujian</p>
            <p className="text-xl font-extrabold text-slate-800">{totalExams} Sesi</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PTS / UTS</p>
            <p className="text-xl font-extrabold text-slate-800">{utsCount} Sesi</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PAS / UAS</p>
            <p className="text-xl font-extrabold text-slate-800">{uasCount} Sesi</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Harian & Praktik</p>
            <p className="text-xl font-extrabold text-slate-800">{otherCount} Sesi</p>
          </div>
        </div>
      </div>

      {/* Main List & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mata pelajaran, kelas, ruang, atau pengawas..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter Tipe Ujian"
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="all">Semua Jenis Ujian</option>
              <option value="UTS">UTS / PTS</option>
              <option value="UAS">UAS / PAS</option>
              <option value="Ulangan Harian">Ulangan Harian</option>
              <option value="Ujian Praktik">Ujian Praktik</option>
              <option value="Ujian Akhir">Ujian Akhir</option>
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              aria-label="Filter Kelas"
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exams Grid / Table */}
        <div className="p-4">
          {filteredExams.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">Tidak ada jadwal ujian ditemukan</p>
              <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter tipe ujian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExams.map((exam) => {
                const color = examTypeColors[exam.type] || {
                  bg: 'bg-slate-50',
                  text: 'text-slate-700',
                  border: 'border-slate-200',
                };

                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}>
                          {exam.type}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {exam.className}
                        </span>
                      </div>

                      {/* Title & Subject */}
                      <h3 className="font-bold text-slate-800 text-sm mt-3 line-clamp-2 leading-snug">
                        {exam.title}
                      </h3>
                      <p className="text-xs font-semibold text-teal-700 mt-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{exam.subjectName}</span>
                      </p>

                      {/* Details: Date, Time, Room, Supervisor */}
                      <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-800">{exam.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>
                            {exam.startTime} - {exam.endTime} WIB ({exam.durationMinutes} menit)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-700">{exam.room}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">Pengawas: <strong className="text-slate-700">{exam.supervisorName}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (Manage) */}
                    {canManage && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setEditingExam(exam)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmExam(exam)}
                          className="px-2.5 py-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Tambah Jadwal Ujian */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Tambah Jadwal Ujian Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Sesi Ujian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PTS Ganjil - Matematika Wajib"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Ujian</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ExamType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="UTS">UTS / PTS</option>
                    <option value="UAS">UAS / PAS</option>
                    <option value="Ulangan Harian">Ulangan Harian</option>
                    <option value="Ujian Praktik">Ujian Praktik</option>
                    <option value="Ujian Akhir">Ujian Akhir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Target</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mulai</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selesai</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ruang Ujian</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ruang R.201 / Lab Komputer"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pengawas Ujian</label>
                <input
                  type="text"
                  required
                  placeholder="Nama pengawas ujian"
                  value={formData.supervisorName}
                  onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs"
                >
                  Terbitkan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Jadwal Ujian */}
      {editingExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Edit Jadwal Ujian</h3>
              </div>
              <button
                onClick={() => setEditingExam(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Sesi Ujian</label>
                <input
                  type="text"
                  required
                  value={editingExam.title}
                  onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Ujian</label>
                  <select
                    value={editingExam.type}
                    onChange={(e) => setEditingExam({ ...editingExam, type: e.target.value as ExamType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="UTS">UTS / PTS</option>
                    <option value="UAS">UAS / PAS</option>
                    <option value="Ulangan Harian">Ulangan Harian</option>
                    <option value="Ujian Praktik">Ujian Praktik</option>
                    <option value="Ujian Akhir">Ujian Akhir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={editingExam.classId}
                    onChange={(e) => {
                      const selected = classes.find((c) => c.id === e.target.value);
                      setEditingExam({
                        ...editingExam,
                        classId: e.target.value,
                        className: selected ? selected.name : editingExam.className,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={editingExam.date}
                    onChange={(e) => setEditingExam({ ...editingExam, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mulai</label>
                  <input
                    type="time"
                    required
                    value={editingExam.startTime}
                    onChange={(e) => setEditingExam({ ...editingExam, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selesai</label>
                  <input
                    type="time"
                    required
                    value={editingExam.endTime}
                    onChange={(e) => setEditingExam({ ...editingExam, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ruang</label>
                  <input
                    type="text"
                    required
                    value={editingExam.room}
                    onChange={(e) => setEditingExam({ ...editingExam, room: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pengawas</label>
                  <input
                    type="text"
                    required
                    value={editingExam.supervisorName}
                    onChange={(e) => setEditingExam({ ...editingExam, supervisorName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tata Tertib Ujian */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Tata Tertib & Prosedur Ujian</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs text-slate-600 leading-relaxed max-h-96 overflow-y-auto pr-1">
              <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100">
                <p className="font-bold text-teal-800">1. Ketepatan Waktu</p>
                <p className="mt-0.5 text-slate-600">Peserta ujian wajib hadir di ruang ujian paling lambat 15 menit sebelum waktu pengerjaan dimulai.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-800">2. Identitas Peserta</p>
                <p className="mt-0.5 text-slate-600">Membawa Kartu Tanda Peserta Ujian / NISN resmi dan meletakkannya di atas meja ujian.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-800">3. Perangkat & Larangan Kecurangan</p>
                <p className="mt-0.5 text-slate-600">Dilarang membawa alat komunikasi, contekan, kalkulator pintar (kecuali diizinkan pengawas), atau bertukar jawaban.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-800">4. Kepatuhan Pengawas</p>
                <p className="mt-0.5 text-slate-600">Peserta wajib mengikuti seluruh instruksi guru pengawas ruang ujian demi kelancaran asesmen.</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Hapus Jadwal Ujian?</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Apakah Anda yakin ingin membatalkan dan menghapus sesi ujian{' '}
              <strong className="text-slate-700">{deleteConfirmExam.title}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmExam(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmExam)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
