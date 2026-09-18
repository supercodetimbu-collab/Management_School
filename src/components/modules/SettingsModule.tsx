import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Shield,
  Database,
  History,
  Download,
  Upload,
  RefreshCw,
  Building,
  CheckCircle2,
  Calendar,
  Save,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    schoolProfile,
    updateSchoolProfile,
    activeAcademicYear,
    setActiveAcademicYear,
    auditLogs,
    exportFullDatabaseJSON,
    importFullDatabaseJSON,
    resetToDemoData,
    logAction,
  } = useSiakadData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'backup' | 'audit' | 'academic'>('profile');
  const [profileForm, setProfileForm] = useState(schoolProfile);
  const [academicForm, setAcademicForm] = useState(activeAcademicYear);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(profileForm);
    logAction('UPDATE_PROFILE', 'Pengaturan', 'Memperbarui profil data sekolah', currentUser!);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveAcademicYear(academicForm.id);
    logAction('UPDATE_ACADEMIC_YEAR', 'Pengaturan', `Mengubah tahun ajaran ke ${academicForm.name}`, currentUser!);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importFullDatabaseJSON(content);
      if (success) {
        alert('Database SIAKAD berhasil dipulihkan!');
        window.location.reload();
      } else {
        alert('Format file JSON cadangan tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('PERINGATAN: Seluruh data lokal akan dikembalikan ke data awal demo. Lanjutkan?')) {
      resetToDemoData();
      alert('Sistem berhasil di-reset ke data bawaan demo!');
      window.location.reload();
    }
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.module.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Pengaturan Sistem & Master Data</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi profil institusi, cadangan database, dan jejak audit aktivitas
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Sekolah
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'academic' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tahun Ajaran
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'backup' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Backup & Restore
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'audit' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan berhasil disimpan ke sistem!</span>
        </div>
      )}

      {/* Profile Form Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4">
            Identitas Resmi Satuan Pendidikan
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Satuan Pendidikan *</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Pokok Sekolah Nasional (NPSN) *</label>
                <input
                  type="text"
                  required
                  value={profileForm.npsn}
                  onChange={(e) => setProfileForm({ ...profileForm, npsn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Akreditasi Sekolah</label>
                <input
                  type="text"
                  value={profileForm.accreditation}
                  onChange={(e) => setProfileForm({ ...profileForm, accreditation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi Sekolah</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah *</label>
                <input
                  type="text"
                  required
                  value={profileForm.principalName}
                  onChange={(e) => setProfileForm({ ...profileForm, principalName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP Kepala Sekolah *</label>
                <input
                  type="text"
                  required
                  value={profileForm.principalNip}
                  onChange={(e) => setProfileForm({ ...profileForm, principalNip: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Academic Year Tab */}
      {activeTab === 'academic' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs max-w-xl">
          <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4">
            Pengaturan Tahun Ajaran & Semester Aktif
          </h3>

          <form onSubmit={handleSaveAcademic} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran</label>
              <input
                type="text"
                value={academicForm.name}
                onChange={(e) => setAcademicForm({ ...academicForm, name: e.target.value })}
                placeholder="2026/2027"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester Aktif</label>
              <select
                value={academicForm.semester}
                onChange={(e) => setAcademicForm({ ...academicForm, semester: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
              >
                Terapkan Tahun Ajaran
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Backup & Restore Tab */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Cadangkan Database (Backup JSON)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh salinan lengkap seluruh data siswa, guru, kelas, jadwal, nilai, presensi, dan keuangan ke
              dalam satu file JSON terenkripsi lokal.
            </p>
            <button
              onClick={exportFullDatabaseJSON}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas Backup</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Pulihkan Database (Restore JSON)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unggah file JSON cadangan sebelumnya untuk mengembalikan seluruh kondisi sistem SIAKAD seperti
              sedia kala.
            </p>
            <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih File Backup JSON</span>
              <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
            </label>
          </div>

          <div className="md:col-span-2 bg-red-50/60 p-6 rounded-3xl border border-red-200 space-y-2">
            <h3 className="text-sm font-bold text-red-900">Reset ke Data Default Demo Sekolah</h3>
            <p className="text-xs text-red-700">
              Akan menghapus modifikasi lokal dan mengembalikan siswa, guru, kelas, dan jadwal ke data awal demo.
            </p>
            <button
              onClick={handleResetData}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Reset Data Demo Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Audit Trail / Log Aktivitas Sistem</h3>
              <p className="text-xs text-slate-500">Merekam setiap aksi penambahan, perubahan, dan otentikasi</p>
            </div>
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Cari aktivitas..."
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Pengguna</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Modul</th>
                  <th className="py-3 px-4">Deskripsi Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{log.userName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-teal-700">{log.module}</td>
                    <td className="py-2.5 px-4 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
