import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { Subject } from '../../types';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Award } from 'lucide-react';

export const SubjectsModule: React.FC = () => {
  const { subjects, teachers, addSubject, updateSubject, deleteSubject, logAction } = useSiakadData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [formData, setFormData] = useState<Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>>({
    code: '',
    name: '',
    kkm: 75,
    hoursPerWeek: 4,
    gradeLevel: '10',
    category: 'Wajib',
    teacherId: teachers[0]?.id || '',
    teacherName: teachers[0]?.name || '',
  });

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      code: 'MAPEL-' + Math.floor(100 + Math.random() * 900),
      name: '',
      kkm: 75,
      hoursPerWeek: 4,
      gradeLevel: '10',
      category: 'Wajib',
      teacherId: teachers[0]?.id || '',
      teacherName: teachers[0]?.name || '',
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditingSubject(s);
    setFormData({
      code: s.code,
      name: s.name,
      kkm: s.kkm,
      hoursPerWeek: s.hoursPerWeek,
      gradeLevel: s.gradeLevel,
      category: s.category,
      teacherId: s.teacherId,
      teacherName: s.teacherName,
    });
    setShowAddEditModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Nama mapel dan kode wajib diisi!');
      return;
    }
    const t = teachers.find((tch) => tch.id === formData.teacherId);
    const enriched = {
      ...formData,
      teacherName: t ? t.name : formData.teacherName,
    };

    if (editingSubject) {
      updateSubject(editingSubject.id, enriched);
      logAction('UPDATE_SUBJECT', 'Mapel', `Memperbarui mata pelajaran ${formData.name}`, currentUser!);
    } else {
      addSubject(enriched);
      logAction('ADD_SUBJECT', 'Mapel', `Menambahkan mata pelajaran ${formData.name}`, currentUser!);
    }
    setShowAddEditModal(false);
  };

  const handleDelete = (s: Subject) => {
    if (confirm(`Yakin ingin menghapus mata pelajaran ${s.name}?`)) {
      deleteSubject(s.id);
      logAction('DELETE_SUBJECT', 'Mapel', `Menghapus mata pelajaran ${s.name}`, currentUser!);
    }
  };

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.teacherName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Mata Pelajaran Kurikulum Merdeka</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total {subjects.length} mata pelajaran dengan penetapan Kriteria Ketuntasan Minimal (KKM)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Mapel</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-3">Nama Mata Pelajaran</th>
                <th className="py-3 px-3">Guru Koordinator</th>
                <th className="py-3 px-3">Tingkat</th>
                <th className="py-3 px-3">KKM Minimal</th>
                <th className="py-3 px-3">Beban / Minggu</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.code}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{s.name}</td>
                  <td className="py-3 px-3 text-slate-600">{s.teacherName}</td>
                  <td className="py-3 px-3">Kelas {s.gradeLevel}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800">
                      {s.kkm}
                    </span>
                  </td>
                  <td className="py-3 px-3">{s.hoursPerWeek} Jam Pelajaran</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Mapel *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">KKM Standar *</label>
                  <input
                    type="number"
                    required
                    value={formData.kkm}
                    onChange={(e) => setFormData({ ...formData, kkm: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Matematika Peminatan"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Guru Koordinator</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => {
                    const t = teachers.find((tch) => tch.id === e.target.value);
                    setFormData({
                      ...formData,
                      teacherId: e.target.value,
                      teacherName: t ? t.name : formData.teacherName,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kelas</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam / Minggu</label>
                  <input
                    type="number"
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
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
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
