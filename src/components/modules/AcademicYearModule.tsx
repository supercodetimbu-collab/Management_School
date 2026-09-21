import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { AcademicYear, SemesterType } from '../../types';
import {
  CalendarDays,
  CheckCircle2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  AlertCircle,
  Clock,
  Calendar,
  X,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';

export const AcademicYearModule: React.FC = () => {
  const { currentRole } = useAuth();
  const {
    academicYears,
    activeAcademicYear,
    setActiveAcademicYear,
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
  } = useSiakadData();

  const isManagement = currentRole === 'admin' || currentRole === 'superadmin' || currentRole === 'kepsek';

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<'all' | 'Ganjil' | 'Genap'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deleteConfirmYear, setDeleteConfirmYear] = useState<AcademicYear | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    semester: SemesterType;
    startDate: string;
    endDate: string;
    setAsActive: boolean;
  }>({
    name: '2027/2028',
    semester: 'Ganjil',
    startDate: '2027-07-15',
    endDate: '2027-12-20',
    setAsActive: false,
  });

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered list
  const filteredYears = academicYears.filter((ay) => {
    const matchSearch = ay.name.toLowerCase().includes(searchQuery.toLowerCase()) || ay.semester.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSemester = semesterFilter === 'all' || ay.semester === semesterFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? ay.isActive : !ay.isActive);
    return matchSearch && matchSemester && matchStatus;
  });

  // Handle Add
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Nama tahun ajaran wajib diisi (contoh: 2026/2027).', 'error');
      return;
    }

    if (formData.setAsActive) {
      // Set others to false
      academicYears.forEach((y) => {
        if (y.isActive) updateAcademicYear(y.id, { isActive: false });
      });
    }

    addAcademicYear({
      name: formData.name.trim(),
      semester: formData.semester,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.setAsActive || academicYears.length === 0,
    });

    showToast(`Tahun Ajaran ${formData.name} Semester ${formData.semester} berhasil ditambahkan.`);
    setShowAddModal(false);
    setFormData({
      name: '2027/2028',
      semester: 'Ganjil',
      startDate: '2027-07-15',
      endDate: '2027-12-20',
      setAsActive: false,
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingYear) return;

    updateAcademicYear(editingYear.id, {
      name: editingYear.name.trim(),
      semester: editingYear.semester,
      startDate: editingYear.startDate,
      endDate: editingYear.endDate,
    });

    showToast(`Tahun Ajaran ${editingYear.name} berhasil diperbarui.`);
    setEditingYear(null);
  };

  // Handle Switch Active
  const handleSwitchActive = (year: AcademicYear) => {
    if (year.isActive) return;
    setActiveAcademicYear(year.id);
    showToast(`Tahun Ajaran ${year.name} (${year.semester}) sekarang ditetapkan sebagai AKTIF.`);
  };

  // Handle Delete
  const handleDelete = (year: AcademicYear) => {
    if (year.isActive) {
      showToast('Tahun ajaran yang sedang aktif tidak dapat dihapus.', 'error');
      return;
    }
    deleteAcademicYear(year.id);
    showToast(`Tahun Ajaran ${year.name} Semester ${year.semester} berhasil dihapus.`);
    setDeleteConfirmYear(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
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
            <h1 className="text-xl font-bold text-slate-800">Manajemen Tahun Ajaran & Semester</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Kalender Akademik
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Atur periode tahun ajaran, semester berjalan (Ganjil/Genap), serta aktivasi kalender akademik resmi sekolah.
          </p>
        </div>

        {isManagement && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tahun Ajaran</span>
          </button>
        )}
      </div>

      {/* Active Academic Year Highlight Card */}
      {activeAcademicYear && (
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-teal-100 border border-white/25 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>TAHUN AJARAN SEDANG AKTIF & BERJALAN</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{activeAcademicYear.name}</span>
                <span className="text-base font-bold px-3 py-1 rounded-xl bg-teal-600/60 border border-teal-400/30 text-teal-100">
                  Semester {activeAcademicYear.semester}
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-teal-100/90 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-300" />
                  <span>Mulai: <strong className="text-white">{activeAcademicYear.startDate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-300" />
                  <span>Selesai: <strong className="text-white">{activeAcademicYear.endDate}</strong></span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 max-w-sm">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-200 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-teal-100 leading-relaxed">
                  Semua presensi harian, nilai raport, tugas, dan jadwal pelajaran saat ini secara otomatis terikat pada tahun ajaran aktif ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main List Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tahun ajaran atau semester..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value as any)}
              aria-label="Filter berdasarkan Semester"
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="all">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter berdasarkan Status"
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="active">Sedang Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Table of Academic Years */}
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Tahun Ajaran</th>
                <th className="py-3 px-3">Semester</th>
                <th className="py-3 px-3">Periode Kalender</th>
                <th className="py-3 px-3">Status</th>
                {isManagement && <th className="py-3 px-4 text-right">Aksi Manajemen</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredYears.length === 0 ? (
                <tr>
                  <td colSpan={isManagement ? 5 : 4} className="py-8 text-center text-slate-400">
                    Tidak ada data tahun ajaran yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredYears.map((year) => {
                  const isActive = year.isActive;
                  return (
                    <tr key={year.id} className={`hover:bg-slate-50/70 transition ${isActive ? 'bg-teal-50/30' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              isActive ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <CalendarDays className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{year.name}</p>
                            <p className="text-[11px] text-slate-400">ID: {year.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            year.semester === 'Ganjil'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          Semester {year.semester}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">
                            {year.startDate} s.d {year.endDate}
                          </span>
                          <span className="text-[11px] text-slate-400">Periode Belajar Mengajar</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {isManagement && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isActive && (
                              <button
                                onClick={() => handleSwitchActive(year)}
                                title="Jadikan Tahun Ajaran Aktif"
                                className="px-2.5 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition cursor-pointer flex items-center gap-1"
                              >
                                <Star className="w-3.5 h-3.5" />
                                <span>Aktifkan</span>
                              </button>
                            )}

                            <button
                              onClick={() => setEditingYear(year)}
                              title="Edit Data Tahun Ajaran"
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {!isActive && (
                              <button
                                onClick={() => setDeleteConfirmYear(year)}
                                title="Hapus Tahun Ajaran"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Tahun Ajaran */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Tambah Tahun Ajaran Baru</h3>
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
                  Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2026/2027 atau 2027/2028"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value as SemesterType })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.setAsActive}
                    onChange={(e) => setFormData({ ...formData, setAsActive: e.target.checked })}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Jadikan tahun ajaran ini langsung AKTIF</span>
                </label>
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
                  Simpan Tahun Ajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Tahun Ajaran */}
      {editingYear && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Edit Data Tahun Ajaran</h3>
              </div>
              <button
                onClick={() => setEditingYear(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  required
                  value={editingYear.name}
                  onChange={(e) => setEditingYear({ ...editingYear, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                <select
                  value={editingYear.semester}
                  onChange={(e) => setEditingYear({ ...editingYear, semester: e.target.value as SemesterType })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={editingYear.startDate}
                    onChange={(e) => setEditingYear({ ...editingYear, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={editingYear.endDate}
                    onChange={(e) => setEditingYear({ ...editingYear, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingYear(null)}
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

      {/* Modal: Konfirmasi Hapus */}
      {deleteConfirmYear && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Hapus Tahun Ajaran?</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus tahun ajaran{' '}
              <strong className="text-slate-700">{deleteConfirmYear.name} ({deleteConfirmYear.semester})</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmYear(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmYear)}
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
