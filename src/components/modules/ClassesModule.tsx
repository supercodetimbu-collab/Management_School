import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { ClassRoom } from '../../types';
import { School, Plus, Search, Edit2, Trash2, Users, X, Award } from 'lucide-react';

export const ClassesModule: React.FC = () => {
  const { classes, teachers, addClass, updateClass, deleteClass, students, logAction } = useSiakadData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [formData, setFormData] = useState<Omit<ClassRoom, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    gradeLevel: '10',
    major: 'MIPA',
    academicYear: '2026/2027',
    waliKelasId: teachers[0]?.id || '',
    waliKelasName: teachers[0]?.name || '',
    capacity: 36,
    status: 'Aktif',
  });

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      gradeLevel: '10',
      major: 'MIPA',
      academicYear: '2026/2027',
      waliKelasId: teachers[0]?.id || '',
      waliKelasName: teachers[0]?.name || '',
      capacity: 36,
      status: 'Aktif',
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      gradeLevel: cls.gradeLevel,
      major: cls.major,
      academicYear: cls.academicYear,
      waliKelasId: cls.waliKelasId,
      waliKelasName: cls.waliKelasName,
      capacity: cls.capacity,
      status: cls.status,
    });
    setShowAddEditModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama kelas wajib diisi!');
      return;
    }
    const t = teachers.find((tch) => tch.id === formData.waliKelasId);
    const enriched = {
      ...formData,
      waliKelasName: t ? t.name : formData.waliKelasName,
    };

    if (editingClass) {
      updateClass(editingClass.id, enriched);
      logAction('UPDATE_CLASS', 'Kelas', `Memperbarui kelas ${formData.name}`, currentUser!);
    } else {
      addClass(enriched);
      logAction('ADD_CLASS', 'Kelas', `Menambahkan kelas baru ${formData.name}`, currentUser!);
    }
    setShowAddEditModal(false);
  };

  const handleDelete = (cls: ClassRoom) => {
    if (confirm(`Yakin ingin menghapus kelas ${cls.name}?`)) {
      deleteClass(cls.id);
      logAction('DELETE_CLASS', 'Kelas', `Menghapus kelas ${cls.name}`, currentUser!);
    }
  };

  const filtered = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.waliKelasName || c.homeroomTeacherName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <School className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Data Kelas & Rombongan Belajar</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total {classes.length} rombel aktif dengan alokasi wali kelas
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Kelas</span>
        </button>
      </div>

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cls) => {
          const studentCount = students.filter((s) => s.classId === cls.id).length;
          return (
            <div
              key={cls.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-teal-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Tingkat {cls.gradeLevel} • {cls.major}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800">{cls.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Wali Kelas: <strong className="text-slate-700">{cls.waliKelasName}</strong>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>
                    Terisi: <strong>{studentCount}</strong> / {cls.capacity} Siswa
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {cls.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Rombel / Kelas *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: X MIPA 1"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peminatan / Jurusan</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="MIPA / IPS / Umum"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wali Kelas</label>
                <select
                  value={formData.waliKelasId}
                  onChange={(e) => {
                    const t = teachers.find((tch) => tch.id === e.target.value);
                    setFormData({
                      ...formData,
                      waliKelasId: e.target.value,
                      waliKelasName: t ? t.name : formData.waliKelasName,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjectName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kapasitas Maksimal</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
