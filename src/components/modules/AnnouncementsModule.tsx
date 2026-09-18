import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { Announcement } from '../../types';
import {
  Bell,
  Plus,
  Calendar,
  Users,
  Search,
  CheckCircle2,
  Trash2,
  X,
  Send,
  Pin,
} from 'lucide-react';

export const AnnouncementsModule: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement, logAction } = useSiakadData();
  const { currentUser, currentRole } = useAuth();

  const [search, setSearch] = useState('');
  const [targetFilter, setTargetFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: 'ALL' as 'ALL' | 'GURU' | 'SISWA' | 'ORANG_TUA',
    isImportant: true,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addAnnouncement({
      title: formData.title,
      content: formData.content,
      target: formData.target,
      category: 'Umum',
      authorName: currentUser?.name || 'Administrator Sekolah',
      date: new Date().toISOString().split('T')[0],
      isImportant: formData.isImportant,
    });

    logAction('ADD_ANNOUNCEMENT', 'Pengumuman', `Membuat pengumuman: ${formData.title}`, currentUser!);
    setShowCreateModal(false);
    setFormData({
      title: '',
      content: '',
      target: 'ALL',
      isImportant: true,
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Hapus pengumuman "${title}"?`)) {
      deleteAnnouncement(id);
      logAction('DELETE_ANNOUNCEMENT', 'Pengumuman', `Menghapus pengumuman: ${title}`, currentUser!);
    }
  };

  const filtered = announcements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const matchTarget = targetFilter === 'ALL' || a.target === targetFilter;
    return matchSearch && matchTarget;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Pengumuman & Notifikasi Sekolah</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Siaran informasi resmi terpadu untuk dewan guru, peserta didik, dan wali murid
          </p>
        </div>

        {(currentRole === 'admin' || currentRole === 'superadmin' || currentRole === 'kepsek') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Siaran Baru</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengumuman..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden"
          />
        </div>

        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
        >
          <option value="ALL">Semua Sasaran</option>
          <option value="GURU">Khusus Guru</option>
          <option value="SISWA">Khusus Siswa</option>
          <option value="ORANG_TUA">Khusus Orang Tua</option>
        </select>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-teal-300 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.isImportant && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                      <Pin className="w-3 h-3 text-amber-700" />
                      PENTING
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800">
                    Sasaran: {item.target}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{item.content}</p>

                <p className="text-[11px] text-slate-400 pt-1">
                  Diterbitkan oleh: <strong className="text-slate-600">{item.authorName}</strong>
                </p>
              </div>

              {(currentRole === 'admin' || currentRole === 'superadmin' || currentRole === 'kepsek') && (
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Buat Siaran Pengumuman Baru</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Jadwal Libur Awal Semester Ganjil 2026/2027"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sasaran Pengumuman</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ALL">Semua Warga Sekolah</option>
                    <option value="GURU">Khusus Dewan Guru</option>
                    <option value="SISWA">Khusus Siswa</option>
                    <option value="ORANG_TUA">Khusus Orang Tua / Wali</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isImportant}
                      onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Sematkan sebagai Penting (Pin)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Isi Lengkap Pengumuman</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tuliskan detail pengumuman sekolah secara jelas dan runtut..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                >
                  Kirimkan Siaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
