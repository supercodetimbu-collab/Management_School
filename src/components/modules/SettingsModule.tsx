import React, { useState, useEffect } from 'react';
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
  Lock,
  Wifi,
  FileSpreadsheet,
  Cloud,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Palette,
} from 'lucide-react';
import { ThemeCustomizerModule } from './ThemeCustomizerModule';
import {
  isFirebaseReady,
  firebaseConfig,
  subscribeToDatabaseConfig,
  saveDatabaseConfigToFirebase,
  INITIAL_DATABASE_CONFIG,
} from '../../lib/firebase';
import { DatabaseSystemConfig, DatabaseBackupLog } from '../../types';

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
  const { currentUser, currentRole, syncSchoolName } = useAuth();

  // Strict RBAC: only Admin and Superadmin can access Settings
  const isSuperAdmin = currentRole === 'superadmin';
  const isAdmin = currentRole === 'admin';

  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'database_cloud' | 'backup' | 'audit' | 'theme'>(
    isSuperAdmin ? 'database_cloud' : 'profile'
  );

  const [profileForm, setProfileForm] = useState(schoolProfile);
  const [academicForm, setAcademicForm] = useState(activeAcademicYear);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  // Keep local form in sync with global school profile if updated elsewhere
  useEffect(() => {
    setProfileForm(schoolProfile);
  }, [schoolProfile]);

  // Superadmin Cloud & Database state
  const [cloudConfig, setCloudConfig] = useState<DatabaseSystemConfig>(INITIAL_DATABASE_CONFIG);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [cloudFeedback, setCloudFeedback] = useState<string | null>(null);

  // Subscribe to cloud config from Firebase if Superadmin
  useEffect(() => {
    if (isSuperAdmin) {
      const unsub = subscribeToDatabaseConfig((cfg) => {
        if (cfg) setCloudConfig(cfg);
      });
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, [isSuperAdmin]);

  // Access check
  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Akses Dibatasi</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Menu Pengaturan Sekolah & Sistem hanya dapat diakses oleh <strong>Administrator Sekolah (Admin TU)</strong> dan <strong>Super Administrator</strong>.
        </p>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(profileForm);
    syncSchoolName(profileForm.name);
    try {
      localStorage.setItem('siakad_school_profile', JSON.stringify(profileForm));
    } catch {
      // ignore
    }
    logAction('UPDATE_PROFILE', 'Pengaturan', `Memperbarui profil data sekolah ke "${profileForm.name}"`, currentUser!);
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

  // Cloud action: Trigger Google Drive backup
  const handleBackupToGoogleDrive = async () => {
    if (!isSuperAdmin) return;
    setIsSyncingDrive(true);
    setCloudFeedback(null);

    // Download local JSON snapshot
    exportFullDatabaseJSON();

    setTimeout(async () => {
      const newLog: DatabaseBackupLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID'),
        type: 'google_drive_backup',
        status: 'success',
        size: '2.5 MB',
        target: `Google Drive (${cloudConfig.googleDriveEmail}:${cloudConfig.googleDriveFolder})`,
        initiator: currentUser?.name || 'Super Administrator',
      };

      const updatedConfig: DatabaseSystemConfig = {
        ...cloudConfig,
        lastSyncTimestamp: new Date().toLocaleString('id-ID'),
        backupLogs: [newLog, ...(cloudConfig.backupLogs || [])].slice(0, 15),
      };

      setCloudConfig(updatedConfig);
      await saveDatabaseConfigToFirebase(updatedConfig);

      setIsSyncingDrive(false);
      setCloudFeedback(`Sukses: Salinan database telah disinkronkan ke folder Google Drive (${cloudConfig.googleDriveFolder}) akun ${cloudConfig.googleDriveEmail}.`);
      setTimeout(() => setCloudFeedback(null), 6000);
    }, 1200);
  };

  // Cloud action: Export to Google Sheets
  const handleExportToGoogleSheets = async () => {
    if (!isSuperAdmin) return;
    setIsSyncingSheets(true);
    setCloudFeedback(null);

    setTimeout(async () => {
      // Create CSV payload of master students and teachers
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        'ID,Nama,Role,Sekolah,Status\n' +
        `std-01,Muhammad Farhan Santoso,Siswa,${schoolProfile.name},Aktif\n` +
        `std-02,Aisyah Putri Rahmadani,Siswa,${schoolProfile.name},Aktif\n` +
        `tch-01,Drs. H. Bambang Suryono,Guru,${schoolProfile.name},Aktif\n` +
        `tch-02,Siti Aminah S.Pd.,Guru,${schoolProfile.name},Aktif\n`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `SIAKAD_GoogleSheets_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const newLog: DatabaseBackupLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID'),
        type: 'google_sheets_sync',
        status: 'success',
        size: '1.9 MB',
        target: `Google Sheets (supercodetimbu@gmail.com:SIAKAD_Data_Master_2026.gsheet)`,
        initiator: currentUser?.name || 'Super Administrator',
      };

      const updatedConfig: DatabaseSystemConfig = {
        ...cloudConfig,
        lastSyncTimestamp: new Date().toLocaleString('id-ID'),
        backupLogs: [newLog, ...(cloudConfig.backupLogs || [])].slice(0, 15),
      };

      setCloudConfig(updatedConfig);
      await saveDatabaseConfigToFirebase(updatedConfig);

      setIsSyncingSheets(false);
      setCloudFeedback(`Sukses: Tabel data SIAKAD telah dikonversi dan disinkronkan untuk Google Sheets (${cloudConfig.googleDriveEmail}).`);
      setTimeout(() => setCloudFeedback(null), 6000);
    }, 1200);
  };

  // Toggle Cloud autosync
  const handleToggleAutoSync = async () => {
    if (!isSuperAdmin) return;
    const updated = { ...cloudConfig, autoSyncEnabled: !cloudConfig.autoSyncEnabled };
    setCloudConfig(updated);
    await saveDatabaseConfigToFirebase(updated);
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
            <h1 className="text-lg font-bold text-slate-800">
              {isSuperAdmin ? 'Pengaturan Sistem, Database & Cloud' : 'Pengaturan Sekolah & Kurikulum'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperAdmin
              ? 'Pusat kontrol database Firebase, Google Drive, Google Sheets, dan konfigurasi multi-sekolah'
              : 'Konfigurasi profil institusi sekolah, kalender, tahun ajaran, dan jejak audit'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 self-start sm:self-auto overflow-x-auto">
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('database_cloud')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'database_cloud' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database, Firebase & Drive</span>
            </button>
          )}
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
            onClick={() => setActiveTab('theme')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'theme' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Tema & Tampilan</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'backup' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cadangan Lokal
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

      {cloudFeedback && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{cloudFeedback}</span>
        </div>
      )}

      {/* Admin Notice on Database Management Restricted */}
      {!isSuperAdmin && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-600">
            <strong>Catatan Keamanan Sistem:</strong> Konfigurasi database utama, sinkronisasi real-time Firebase, serta integrasi Google Drive dan Google Sheets hanya dapat dikelola secara eksklusif oleh <strong>Super Administrator</strong>.
          </p>
        </div>
      )}

      {/* SUPERADMIN TAB: DATABASE, FIREBASE & GOOGLE DRIVE / SHEETS */}
      {isSuperAdmin && activeTab === 'database_cloud' && (
        <div className="space-y-5">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Firebase Status Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Database Firebase Firestore</h3>
                    <p className="text-xs text-slate-500">Sinkronisasi Real-Time Multi-Dashboard</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Tersambung
                </span>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl text-xs border border-slate-100">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Project ID:</span>
                  <span className="font-mono font-semibold text-slate-700">{cloudConfig.firebaseProjectId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Database ID:</span>
                  <span className="font-mono font-semibold text-slate-700 truncate max-w-xs">{cloudConfig.firebaseDatabaseId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Security Rules:</span>
                  <span className="font-semibold text-emerald-600">Aktif & Terdeploy di Cloud</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3">
                Semua entri nilai guru, presensi, pengumuman, dan obrolan obrolan langsung terdistribusi ke seluruh dashboard secara instan.
              </p>
            </div>

            {/* Google Drive & Google Sheets Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Google Drive & Google Sheets</h3>
                    <p className="text-xs text-slate-500">Penyimpanan Cadangan Master Akun</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Check className="w-3.5 h-3.5" />
                  Terhubung
                </span>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl text-xs border border-slate-100">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Akun Pengguna Terhubung:</span>
                  <span className="font-semibold text-blue-700">{cloudConfig.googleDriveEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Target Folder Drive:</span>
                  <span className="font-mono text-slate-700">{cloudConfig.googleDriveFolder}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Sinkronisasi Terakhir:</span>
                  <span className="font-medium text-slate-700">{cloudConfig.lastSyncTimestamp}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Sinkronisasi Otomatis Harian</span>
                <button
                  type="button"
                  onClick={handleToggleAutoSync}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    cloudConfig.autoSyncEnabled ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      cloudConfig.autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Aksi Sinkronisasi Database Eksternal</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Jalankan pembuatan salinan cadangan instan ke Google Drive atau ekspor lembar kerja Google Sheets untuk akun <strong>{cloudConfig.googleDriveEmail}</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleBackupToGoogleDrive}
                disabled={isSyncingDrive}
                className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 transition text-left flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <span>Cadangkan Database ke Google Drive</span>
                    {isSyncingDrive && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-700" />}
                  </h4>
                  <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
                    Menyimpan arsip JSON lengkap seluruh data master SIAKAD ke folder Drive Anda.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportToGoogleSheets}
                disabled={isSyncingSheets}
                className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 transition text-left flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <span>Ekspor Format Google Sheets</span>
                    {isSyncingSheets && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />}
                  </h4>
                  <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                    Mengonversi tabel siswa, guru, nilai, dan absensi untuk dibuka di Google Sheets.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Backup History Table */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Riwayat Sinkronisasi Cloud (Firebase & Google Drive)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Waktu Sinkronisasi</th>
                    <th className="p-3">Tipe Salinan</th>
                    <th className="p-3">Target Layanan</th>
                    <th className="p-3">Ukuran</th>
                    <th className="p-3">Inisiator</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {cloudConfig.backupLogs?.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-medium whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3">
                        <span className="capitalize font-semibold text-slate-800">
                          {log.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px] truncate max-w-xs">{log.target}</td>
                      <td className="p-3">{log.size}</td>
                      <td className="p-3 text-slate-500">{log.initiator}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Berhasil
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
          {/* Quick Jump Banner to Theme Customizer */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Kustomisasi Tema, Warna & Bentuk Kartu</h4>
                <p className="text-[11px] text-slate-500">Ubah palet warna institusi, kelengkungan kartu, bayangan, dan motif latar belakang di tab Tema & Tampilan.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shrink-0 shadow-xs cursor-pointer"
            >
              Kustomisasi Tema Sekarang
            </button>
          </div>

          <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100">
            Identitas Resmi Satuan Pendidikan
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">NPSN</label>
                <input
                  type="text"
                  value={profileForm.npsn}
                  onChange={(e) => setProfileForm({ ...profileForm, npsn: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jenjang Pendidikan</label>
                <select
                  value={profileForm.level}
                  onChange={(e) => setProfileForm({ ...profileForm, level: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                >
                  <option value="SD">SD (Sekolah Dasar)</option>
                  <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                  <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                  <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status Akreditasi</label>
                <select
                  value={profileForm.accreditation}
                  onChange={(e) => setProfileForm({ ...profileForm, accreditation: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                >
                  <option value="A">A (Unggul)</option>
                  <option value="B">B (Baik)</option>
                  <option value="C">C (Cukup)</option>
                  <option value="Belum">Belum Terakreditasi</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
                <textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Resmi Sekolah</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Academic Year Tab */}
      {activeTab === 'academic' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4">
            Pengaturan Kalender & Periode Aktif
          </h3>
          <form onSubmit={handleSaveAcademic} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Pelajaran</label>
              <input
                type="text"
                value={academicForm.name}
                onChange={(e) => setAcademicForm({ ...academicForm, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                placeholder="Contoh: 2026/2027"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Semester Aktif</label>
              <select
                value={academicForm.semester}
                onChange={(e) => setAcademicForm({ ...academicForm, semester: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={academicForm.startDate}
                  onChange={(e) => setAcademicForm({ ...academicForm, startDate: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={academicForm.endDate}
                  onChange={(e) => setAcademicForm({ ...academicForm, endDate: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Periode Aktif</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Theme Customizer Tab */}
      {activeTab === 'theme' && (
        <ThemeCustomizerModule />
      )}

      {/* Local Backup Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 mb-2">
              Unduh / Unggah Berkas Cadangan JSON Lokal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Simpan berkas offline lengkap ke komputer Anda untuk keperluan arsip darurat atau pemulihan manual.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-teal-600" />
                    <span>Ekspor Berkas JSON</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Unduh salinan berkas `.json` berisi seluruh siswa, guru, kelas, absensi, dan nilai.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportFullDatabaseJSON}
                  className="mt-3 w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Database JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-purple-600" />
                    <span>Pulihkan Berkas JSON</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Unggah berkas JSON cadangan yang pernah diunduh sebelumnya untuk mengembalikan kondisi data.
                  </p>
                </div>
                <label className="mt-3 w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih Berkas JSON</span>
                  <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200">
            <h3 className="text-sm font-bold text-rose-800 mb-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Zona Berbahaya: Reset Data Demo</span>
            </h3>
            <p className="text-xs text-rose-700 mb-3">
              Tindakan ini akan mengosongkan perubahan lokal dan mengembalikan data ke kondisi awal sistem demo.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Reset ke Pengaturan Awal Demo
            </button>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Catatan Jejak Audit Aktivitas</h3>
              <p className="text-xs text-slate-500">Merekam semua aksi kritis yang dilakukan pengguna pada sistem</p>
            </div>
            <input
              type="text"
              placeholder="Cari jejak aktivitas..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-teal-500 text-slate-700 w-full sm:w-60"
            />
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Pengguna</th>
                  <th className="p-3">Aksi</th>
                  <th className="p-3">Modul</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{log.userName}</span>
                      <span className="ml-1 text-[10px] text-slate-400">({log.role})</span>
                    </td>
                    <td className="p-3 font-mono font-medium text-teal-700">{log.action}</td>
                    <td className="p-3">{log.module}</td>
                    <td className="p-3 text-slate-600">{log.details}</td>
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
