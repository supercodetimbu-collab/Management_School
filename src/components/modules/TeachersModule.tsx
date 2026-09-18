import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { Teacher } from '../../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  X,
  Phone,
  Mail,
  Award,
} from 'lucide-react';

export const TeachersModule: React.FC = () => {
  const { teachers, subjects, addTeacher, updateTeacher, deleteTeacher, logAction } = useSiakadData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState<Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>>({
    nip: '',
    name: '',
    gender: 'L',
    email: '',
    phone: '',
    subjectId: subjects[0]?.id || 'sub-01',
    subjectName: subjects[0]?.name || 'Matematika',
    status: 'Aktif',
    employmentType: 'PNS',
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      nip: '1985' + String(Math.floor(10000000000000 + Math.random() * 90000000000000)),
      name: '',
      gender: 'L',
      email: '',
      phone: '',
      subjectId: subjects[0]?.id || 'sub-01',
      subjectName: subjects[0]?.name || 'Matematika',
      status: 'Aktif',
      employmentType: 'PNS',
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      nip: t.nip,
      name: t.name,
      gender: t.gender,
      email: t.email,
      phone: t.phone,
      subjectId: t.subjectId,
      subjectName: t.subjectName,
      status: t.status,
      employmentType: t.employmentType,
    });
    setShowAddEditModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama guru wajib diisi!');
      return;
    }
    const subObj = subjects.find((s) => s.id === formData.subjectId);
    const enriched = {
      ...formData,
      subjectName: subObj ? subObj.name : formData.subjectName,
    };

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, enriched);
      logAction('UPDATE_TEACHER', 'Guru', `Memperbarui data guru ${formData.name}`, currentUser!);
    } else {
      addTeacher(enriched);
      logAction('ADD_TEACHER', 'Guru', `Menambahkan guru baru ${formData.name}`, currentUser!);
    }
    setShowAddEditModal(false);
  };

  const handleDelete = (t: Teacher) => {
    if (confirm(`Yakin ingin menghapus data guru ${t.name}?`)) {
      deleteTeacher(t.id);
      logAction('DELETE_TEACHER', 'Guru', `Menghapus guru ${t.name}`, currentUser!);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.nip.includes(search) ||
      t.subjectName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Data Guru & Tenaga Pendidik</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total {teachers.length} guru pengampu mata pelajaran terdaftar
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Guru</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama guru, NIP, atau mata pelajaran..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
        >
          <option value="ALL">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Cuti">Cuti</option>
          <option value="Pensiun">Pensiun</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Guru</th>
                <th className="py-3 px-3">NIP</th>
                <th className="py-3 px-3">Mapel Ampuan</th>
                <th className="py-3 px-3">Status Kepegawaian</th>
                <th className="py-3 px-3">Kontak</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                      {t.name.charAt(0)}
                    </div>
                    <span>{t.name}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">{t.nip}</td>
                  <td className="py-3 px-3 font-semibold text-teal-700">{t.subjectName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {t.employmentType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px]">
                    <div>{t.phone}</div>
                    <div className="text-slate-400">{t.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setViewingTeacher(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
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

      {/* Add / Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Bpk. Hendra Gunawan, M.Pd"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIP *</label>
                  <input
                    type="text"
                    required
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran Ampuan</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => {
                      const s = subjects.find((sub) => sub.id === e.target.value);
                      setFormData({
                        ...formData,
                        subjectId: e.target.value,
                        subjectName: s ? s.name : formData.subjectName,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Guru Tetap">Guru Tetap</option>
                    <option value="Honorer">Honorer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Aktif</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Pensiun">Pensiun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Detail Tenaga Pendidik</h3>
              <button onClick={() => setViewingTeacher(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {viewingTeacher.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{viewingTeacher.name}</h4>
                  <p className="text-teal-700 font-semibold">{viewingTeacher.subjectName}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">NIP:</span>
                  <span className="font-mono font-bold text-slate-800">{viewingTeacher.nip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Kepegawaian:</span>
                  <span className="font-semibold text-slate-800">{viewingTeacher.employmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-slate-800">{viewingTeacher.email || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No. WhatsApp:</span>
                  <span className="font-semibold text-slate-800">{viewingTeacher.phone || '-'}</span>
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingTeacher(null)}
                className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
