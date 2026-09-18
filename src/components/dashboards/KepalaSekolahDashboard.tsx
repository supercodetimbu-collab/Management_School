import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import {
  School,
  GraduationCap,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  Calendar,
  ClipboardCheck,
  FileText,
  Printer,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface KepalaSekolahDashboardProps {
  setCurrentModule: (mod: string) => void;
}

export const KepalaSekolahDashboard: React.FC<KepalaSekolahDashboardProps> = ({
  setCurrentModule,
}) => {
  const { currentUser } = useAuth();
  const { schoolProfile, students, teachers, classes, grades, activeAcademicYear } = useSiakadData();

  const totalStudents = students.filter((s) => s.status === 'Aktif').length;
  const totalTeachers = teachers.filter((t) => t.status === 'Aktif').length;
  const totalClasses = classes.filter((c) => c.status === 'Aktif').length;

  return (
    <div className="space-y-6">
      {/* Principal Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-800 to-teal-800 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Monitoring Eksekutif & Mutu Sekolah</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Selamat datang, {currentUser?.name || 'Dr. H. Ahmad Dahlan, M.Pd'} 🎓
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Kepala Sekolah • {schoolProfile.name}
            </p>
          </div>

          <button
            onClick={() => setCurrentModule('reports')}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <BarChart3 className="w-4 h-4 text-slate-950" />
            <span>Laporan Eksekutif Lengkap</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Peserta Didik</span>
          <p className="text-3xl font-black text-slate-800 mt-2">{totalStudents}</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% Kuota Terisi</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Tenaga Guru & Pendidik</span>
          <p className="text-3xl font-black text-slate-800 mt-2">{totalTeachers}</p>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">100% Tersertifikasi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Rata-Rata Mutu Sekolah</span>
          <p className="text-3xl font-black text-indigo-700 mt-2">87.8</p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">Predikat Akreditasi A</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Indeks Kehadiran Sekolah</span>
          <p className="text-3xl font-black text-emerald-600 mt-2">96.4%</p>
          <p className="text-[11px] text-slate-500 mt-1">Stabil di atas target nasional</p>
        </div>
      </div>

      {/* Performance by Class Table */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Capaian Akademik per Rombongan Belajar (Kelas)</h3>
            <p className="text-xs text-slate-500">Evaluasi rata-rata nilai semester aktif</p>
          </div>
          <button
            onClick={() => setCurrentModule('reports')}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            Buka Analisis Nilai →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">Wali Kelas</th>
                <th className="py-2.5 px-3">Jumlah Siswa</th>
                <th className="py-2.5 px-3">Rata-Rata Kelas</th>
                <th className="py-2.5 px-3">Tingkat Kehadiran</th>
                <th className="py-2.5 px-3">Status Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{cls.name}</td>
                  <td className="py-2.5 px-3">{cls.waliKelasName}</td>
                  <td className="py-2.5 px-3">{cls.capacity} Siswa</td>
                  <td className="py-2.5 px-3 font-bold text-teal-700">88.2</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">97%</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Sangat Baik
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
