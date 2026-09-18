import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';

export const StudentsModule: React.FC = () => {
  const { students, classes, addStudent, updateStudent, deleteStudent, batchImportStudents, logAction } =
    useSiakadData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>({
    nis: '',
    nisn: '',
    name: '',
    gender: 'L',
    birthPlace: 'Jakarta',
    birthDate: '2009-05-10',
    religion: 'Islam',
    address: '',
    phone: '',
    email: '',
    classId: classes[0]?.id || 'cls-01',
    className: classes[0]?.name || 'X MIPA 1',
    parentName: '',
    parentPhone: '',
    status: 'Aktif',
    enrollmentYear: '2024',
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      nis: String(Math.floor(10000 + Math.random() * 90000)),
      nisn: String(Math.floor(1000000000 + Math.random() * 9000000000)),
      name: '',
      gender: 'L',
      birthPlace: 'Jakarta',
      birthDate: '2009-01-01',
      religion: 'Islam',
      address: '',
      phone: '',
      email: '',
      classId: classes[0]?.id || 'cls-01',
      className: classes[0]?.name || 'X MIPA 1',
      parentName: '',
      parentPhone: '',
      status: 'Aktif',
      enrollmentYear: '2024',
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setFormData({
      nis: s.nis,
      nisn: s.nisn,
      name: s.name,
      gender: s.gender,
      birthPlace: s.birthPlace,
      birthDate: s.birthDate,
      religion: s.religion,
      address: s.address,
      phone: s.phone,
      email: s.email,
      classId: s.classId,
      className: s.className,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      status: s.status,
      enrollmentYear: s.enrollmentYear,
    });
    setShowAddEditModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nis.trim()) {
      alert('Nama dan NIS wajib diisi!');
      return;
    }

    const clsObj = classes.find((c) => c.id === formData.classId);
    const enrichedData = {
      ...formData,
      className: clsObj ? clsObj.name : formData.className,
    };

    if (editingStudent) {
      updateStudent(editingStudent.id, enrichedData);
      logAction('UPDATE_STUDENT', 'Siswa', `Memperbarui data siswa ${formData.name}`, currentUser!);
    } else {
      addStudent(enrichedData);
      logAction('ADD_STUDENT', 'Siswa', `Menambahkan siswa baru ${formData.name}`, currentUser!);
    }
    setShowAddEditModal(false);
  };

  const handleDelete = (s: Student) => {
    if (confirm(`Yakin ingin menghapus siswa ${s.name}?`)) {
      deleteStudent(s.id);
      logAction('DELETE_STUDENT', 'Siswa', `Menghapus data siswa ${s.name}`, currentUser!);
    }
  };

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.nisn.includes(search) ||
      s.className.toLowerCase().includes(search.toLowerCase());
    const matchClass = selectedClass === 'ALL' || s.classId === selectedClass;
    const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchSearch && matchClass && matchStatus;
  });

  const exportCSV = () => {
    const headers = 'NIS,NISN,Nama,JK,Kelas,Status,Email,No HP,Nama Orang Tua\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.nis}","${s.nisn}","${s.name}","${s.gender}","${s.className}","${s.status}","${s.email}","${s.phone}","${s.parentName}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_siswa_siakad_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Module Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Manajemen Data Siswa</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total {students.length} peserta didik terdaftar dalam sistem akademik
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-teal-600" />
            <span>Import Data</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs shadow-teal-700/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama siswa, NIS, atau NISN..."
            className="w-full pl-10 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden focus:border-teal-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Kelas:</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Lulus">Lulus</option>
            <option value="Mutasi">Mutasi</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-3">NIS / NISN</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Gender</th>
                <th className="py-3 px-3">Orang Tua / Wali</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada siswa yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{s.name}</p>
                          <p className="text-[10px] text-slate-400">{s.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div>{s.nis}</div>
                      <div className="text-slate-400 text-[10px]">NISN: {s.nisn}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{s.className}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          s.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                        }`}
                      >
                        {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{s.parentName || '-'}</p>
                      <p className="text-[10px] text-slate-400">{s.parentPhone || '-'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'Lulus'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingStudent(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition"
                          title="Lihat Detail Siswa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Muhammad Farhan Santoso"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Rombel *</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => {
                      const c = classes.find((cl) => cl.id === e.target.value);
                      setFormData({
                        ...formData,
                        classId: e.target.value,
                        className: c ? c.name : formData.className,
                      });
                    }}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIS (Nomor Induk Siswa) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="Contoh: 20241001"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="Contoh: 0098765432"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="L"
                        checked={formData.gender === 'L'}
                        onChange={() => setFormData({ ...formData, gender: 'L' })}
                      />
                      <span>Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="P"
                        checked={formData.gender === 'P'}
                        onChange={() => setFormData({ ...formData, gender: 'P' })}
                      />
                      <span>Perempuan</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Siswa</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Mutasi">Mutasi</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Nama Ayah / Ibu / Wali"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Orang Tua</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Merdeka No. 45, RT/RW..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
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
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail View Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Detail Biodata Siswa</h3>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl font-black">
                  {viewingStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">{viewingStudent.name}</h4>
                  <p className="text-xs text-teal-700 font-semibold">Kelas: {viewingStudent.className}</p>
                  <p className="text-[11px] text-slate-400">Tahun Masuk: {viewingStudent.enrollmentYear}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-2xl">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">NIS</span>
                  <span className="font-bold text-slate-800">{viewingStudent.nis}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">NISN</span>
                  <span className="font-bold text-slate-800">{viewingStudent.nisn}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">TTL</span>
                  <span className="font-medium text-slate-800">
                    {viewingStudent.birthPlace}, {viewingStudent.birthDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Agama</span>
                  <span className="font-medium text-slate-800">{viewingStudent.religion}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Orang Tua</span>
                  <span className="font-bold text-slate-800">{viewingStudent.parentName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Kontak Ortu</span>
                  <span className="font-medium text-slate-800">{viewingStudent.parentPhone || '-'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Alamat</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                  {viewingStudent.address || 'Belum diisi'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Import Data Siswa (Excel/CSV)</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda dapat mengimpor data siswa secara massal menggunakan file format CSV atau Excel standar Dapodik/Kemdikbud.
              </p>

              <div className="p-4 border-2 border-dashed border-teal-200 bg-teal-50/50 rounded-2xl text-center">
                <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Tarik dan letakkan file CSV/Excel di sini</p>
                <p className="text-[10px] text-slate-400 mt-1">atau klik untuk memilih file dari komputer</p>
              </div>

              <button
                onClick={() => {
                  // Simulate successful batch import of 2 sample students
                  batchImportStudents([
                    {
                      nis: '20241099',
                      nisn: '0098123999',
                      name: 'Daffa Rizky Pratama',
                      gender: 'L',
                      birthPlace: 'Bandung',
                      birthDate: '2009-08-14',
                      religion: 'Islam',
                      address: 'Jl. Surya Sumantri No. 12',
                      phone: '08129998881',
                      email: 'daffa@siswa.belajar.id',
                      classId: 'cls-01',
                      className: 'X MIPA 1',
                      parentName: 'Rudi Pratama',
                      parentPhone: '08138887771',
                      status: 'Aktif',
                      enrollmentYear: '2024',
                    },
                  ]);
                  alert('Berhasil mengimpor 1 siswa sampel baru!');
                  setShowImportModal(false);
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition"
              >
                Muat Contoh Template & Eksekusi Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
