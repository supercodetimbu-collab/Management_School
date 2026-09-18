import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { Parent } from '../../types';
import { UserCheck, Plus, Search, Phone, Mail, Edit2, Trash2, X } from 'lucide-react';

export const ParentsModule: React.FC = () => {
  const { parents, students, addParent, updateParent, deleteParent, logAction } = useSiakadData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  const [formData, setFormData] = useState<Omit<Parent, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    fatherName: '',
    motherName: '',
    phone: '',
    email: '',
    address: '',
    occupation: 'Wiraswasta',
    relationship: 'Ayah',
    studentIds: [students[0]?.id || ''],
    studentNames: [students[0]?.name || ''],
  });

  const handleOpenAdd = () => {
    setEditingParent(null);
    setFormData({
      name: '',
      fatherName: '',
      motherName: '',
      phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      email: '',
      address: 'Jl. Merdeka No. 10, Jakarta',
      occupation: 'Wiraswasta',
      relationship: 'Ayah',
      studentIds: [students[0]?.id || ''],
      studentNames: [students[0]?.name || ''],
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (p: Parent) => {
    setEditingParent(p);
    setFormData({
      name: p.name || p.fatherName || p.motherName || '',
      fatherName: p.fatherName || '',
      motherName: p.motherName || '',
      phone: p.phone,
      email: p.email,
      address: p.address,
      occupation: p.occupation || 'Wiraswasta',
      relationship: p.relationship || 'Ayah',
      studentIds: p.studentIds,
      studentNames: p.studentNames || [],
    });
    setShowAddEditModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parentName = formData.name || formData.fatherName || 'Wali Murid';
    if (!parentName.trim()) return;

    if (editingParent) {
      updateParent(editingParent.id, formData);
      logAction('UPDATE_PARENT', 'Orang Tua', `Memperbarui data orang tua ${parentName}`, currentUser!);
    } else {
      addParent(formData);
      logAction('ADD_PARENT', 'Orang Tua', `Menambahkan orang tua ${parentName}`, currentUser!);
    }
    setShowAddEditModal(false);
  };

  const handleDelete = (p: Parent) => {
    const parentName = p.name || p.fatherName || 'Wali Murid';
    if (confirm(`Hapus data orang tua ${parentName}?`)) {
      deleteParent(p.id);
      logAction('DELETE_PARENT', 'Orang Tua', `Menghapus orang tua ${parentName}`, currentUser!);
    }
  };

  const filtered = parents.filter((p) => {
    const pName = p.name || p.fatherName || p.motherName || '';
    const studentNames = p.studentNames || [];
    return (
      pName.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      studentNames.some((sn: string) => sn.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Data Orang Tua / Wali Murid</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total {parents.length} kontak wali murid terhubung dengan akun siswa
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Wali Murid</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama orang tua, siswa, atau nomor WhatsApp..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Orang Tua / Wali</th>
                <th className="py-3 px-3">Siswa Asuh</th>
                <th className="py-3 px-3">Nomor WhatsApp</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Alamat</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {p.name || p.fatherName || p.motherName || 'Wali Murid'}
                  </td>
                  <td className="py-3 px-3">
                    {(p.studentNames || []).map((sn: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 mr-1"
                      >
                        {sn}
                      </span>
                    ))}
                  </td>
                  <td className="py-3 px-3">
                    <a
                      href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{p.phone}</span>
                    </a>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{p.email || '-'}</td>
                  <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{p.address}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
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
                {editingParent ? 'Edit Orang Tua' : 'Tambah Orang Tua Baru'}
              </h3>
              <button onClick={() => setShowAddEditModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Orang Tua / Wali *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Bpk. Gunawan Santoso"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hubungkan Siswa Asuh</label>
                <select
                  value={formData.studentIds[0]}
                  onChange={(e) => {
                    const s = students.find((std) => std.id === e.target.value);
                    setFormData({
                      ...formData,
                      studentIds: [e.target.value],
                      studentNames: [s ? s.name : 'Siswa'],
                    });
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Tinggal</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
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
                  Simpan Wali Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
