import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';
import {
  FileText,
  Printer,
  Download,
  Users,
  Award,
  CheckCircle2,
  Calendar,
  Building,
  Edit3,
} from 'lucide-react';

export const ReportCardsModule: React.FC = () => {
  const { students, classes, subjects, grades, schoolProfile, activeAcademicYear, studentAttendance } =
    useSiakadData();
  const { currentUser, currentRole } = useAuth();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-01');
  const classStudents = students.filter((s) => s.classId === selectedClassId && s.status === 'Aktif');

  const [selectedStudentId, setSelectedStudentId] = useState<string>(classStudents[0]?.id || 'std-01');
  const [waliNotes, setWaliNotes] = useState(
    'Ananda memiliki semangat belajar yang tinggi dan aktif dalam kegiatan diskusi kelas. Pertahankan prestasi dan kembangkan potensi kepemimpinan.'
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || classStudents[0] || students[0];
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Student grades for this academic year
  const studentGrades = subjects.map((sub) => {
    const existing = grades.find((g) => g.studentId === selectedStudent?.id && g.subjectId === sub.id);
    return {
      code: sub.code,
      name: sub.name,
      kkm: sub.kkm,
      score: existing ? existing.finalScore : 88,
      predicate: existing ? existing.predicate : 'A',
      desc:
        existing?.description ||
        'Menunjukkan penguasaan yang sangat baik dalam memahami materi pembelajaran pokok dan mampu mengaplikasikan dalam studi kasus.',
    };
  });

  // Calculate attendance count for this student
  const studentAtt = studentAttendance.filter((a) => a.studentId === selectedStudent?.id);
  const sakit = studentAtt.filter((a) => a.status === 'Sakit').length;
  const izin = studentAtt.filter((a) => a.status === 'Izin').length;
  const alpa = studentAtt.filter((a) => a.status === 'Alpa').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">e-Rapor Kurikulum Merdeka</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Format laporan hasil belajar resmi siap cetak lengkap dengan capaian kompetensi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rapor Resmi (PDF)</span>
          </button>
        </div>
      </div>

      {/* Selector Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500">Pilih Kelas:</span>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              const firstInClass = students.find((s) => s.classId === e.target.value);
              if (firstInClass) setSelectedStudentId(firstInClass.id);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500">Pilih Siswa:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
          >
            {classStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.nis})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Report Card Printable Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto text-slate-800 print:border-none print:shadow-none print:p-0">
        {/* Kop Surat Sekolah */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center relative">
          <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
            PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA
          </h2>
          <h3 className="text-lg font-black uppercase tracking-wide text-slate-900">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </h3>
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-teal-800">
            {schoolProfile.name}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {schoolProfile.address} | Telp: {schoolProfile.phone} | Website: {schoolProfile.website}
          </p>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider underline">
            LAPORAN CAPAIAN HASIL BELAJAR PESERTA DIDIK
          </h2>
          <p className="text-xs text-slate-500">
            Tahun Ajaran {activeAcademicYear.name} - Semester {activeAcademicYear.semester}
          </p>
        </div>

        {/* Student Biodata */}
        <div className="grid grid-cols-2 gap-4 text-xs font-medium bg-slate-50 p-4 rounded-2xl mb-6 print:bg-white print:border print:border-slate-300">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-28 text-slate-500">Nama Siswa:</span>
              <strong className="text-slate-900">{selectedStudent?.name}</strong>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">NIS / NISN:</span>
              <span className="font-mono">{selectedStudent?.nis} / {selectedStudent?.nisn}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">Nama Sekolah:</span>
              <span>{schoolProfile.name}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex">
              <span className="w-28 text-slate-500">Kelas / Rombel:</span>
              <strong className="text-slate-900">{selectedClass?.name || selectedStudent?.className}</strong>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">Semester:</span>
              <span>{activeAcademicYear.semester} ({activeAcademicYear.name})</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">Wali Kelas:</span>
              <span>{selectedClass?.waliKelasName || 'Bpk. Hendra Gunawan, M.Pd'}</span>
            </div>
          </div>
        </div>

        {/* Capaian Kompetensi Mapel Table */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">A. NILAI AKADEMIK & CAPAIAN KOMPETENSI</h4>
          <div className="overflow-x-auto max-w-full rounded-lg border border-slate-300">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="bg-slate-100 font-bold uppercase text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-10 text-center">No</th>
                  <th className="p-2 border-r border-slate-300">Mata Pelajaran</th>
                  <th className="p-2 border-r border-slate-300 w-16 text-center">KKM</th>
                  <th className="p-2 border-r border-slate-300 w-20 text-center">Nilai Akhir</th>
                  <th className="p-2 border-r border-slate-300 w-16 text-center">Predikat</th>
                  <th className="p-2">Capaian Kompetensi Pembelajaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentGrades.map((g, idx) => (
                  <tr key={g.code}>
                    <td className="p-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-300 font-semibold">{g.name}</td>
                    <td className="p-2 border-r border-slate-300 text-center">{g.kkm}</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-teal-800">{g.score}</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold">{g.predicate}</td>
                    <td className="p-2 text-[11px] leading-relaxed text-slate-600">{g.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ekstrakurikuler & Kehadiran side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Ekstrakurikuler */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">B. KEGIATAN EKSTRAKURIKULER</h4>
            <div className="overflow-x-auto max-w-full rounded-lg border border-slate-300">
              <table className="w-full text-left text-xs min-w-[300px]">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Nama Ekstrakurikuler</th>
                    <th className="p-2 border-r border-slate-300 w-16 text-center">Predikat</th>
                    <th className="p-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">Pramuka Wajib</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold">A</td>
                    <td className="p-2 text-[11px]">Sangat aktif, disiplin, dan berinisiatif tinggi.</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">Robotika & Koding</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold">A</td>
                    <td className="p-2 text-[11px]">Berhasil merancang purwarupa IoT sekolah.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Kehadiran */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">C. REKAPITULASI KEHADIRAN</h4>
            <div className="overflow-x-auto max-w-full rounded-lg border border-slate-300">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">Sakit (S)</td>
                    <td className="p-2 font-bold">{sakit} hari</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">Izin (I)</td>
                    <td className="p-2 font-bold">{izin} hari</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">Tanpa Keterangan (A)</td>
                    <td className="p-2 font-bold">{alpa} hari</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Catatan Wali Kelas */}
        <div className="mb-8">
          <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">D. CATATAN WALI KELAS</h4>
          <div className="p-3 border border-slate-300 rounded-xl bg-slate-50 text-xs italic leading-relaxed text-slate-700">
            "{waliNotes}"
          </div>
        </div>

        {/* Tanda Tangan Resmi */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs pt-4 border-t border-slate-200">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-semibold mb-16">Orang Tua / Wali Murid,</p>
            <p className="font-bold underline text-slate-800">({selectedStudent?.parentName || '..........................'})</p>
          </div>

          <div>
            <p className="text-slate-500">Jakarta, 18 September 2026</p>
            <p className="font-semibold mb-16">Wali Kelas,</p>
            <p className="font-bold underline text-slate-800">{selectedClass?.waliKelasName || 'Hendra Gunawan, M.Pd'}</p>
            <p className="text-[11px] text-slate-500">NIP. 198503152010011008</p>
          </div>

          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-semibold mb-16">Kepala Sekolah,</p>
            <p className="font-bold underline text-slate-800">{schoolProfile.principalName}</p>
            <p className="text-[11px] text-slate-500">NIP. {schoolProfile.principalNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
