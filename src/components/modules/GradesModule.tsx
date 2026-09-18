import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { StudentGrade } from '../../types';
import {
  Award,
  Settings,
  Download,
  CheckCircle2,
  Sliders,
  X,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

export const GradesModule: React.FC = () => {
  const {
    students,
    classes,
    subjects,
    grades,
    saveStudentGrade,
    gradeWeights,
    updateGradeWeights,
    calculateGradeScore,
    activeAcademicYear,
    logAction,
  } = useSiakadData();
  const { currentUser } = useAuth();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-01');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'sub-01');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [saveAlert, setSaveAlert] = useState(false);

  // Local weights state for modal
  const [localWeights, setLocalWeights] = useState(gradeWeights);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Filter students in this class
  const classStudents = students.filter((s) => s.classId === selectedClassId && s.status === 'Aktif');

  // Local working grades mapped by studentId
  const [studentGrades, setStudentGrades] = useState<
    Record<string, { tugas: number; ulangan: number; uts: number; uas: number; praktik: number; description: string }>
  >(() => {
    const initial: Record<string, any> = {};
    classStudents.forEach((std) => {
      const existing = grades.find(
        (g) =>
          g.studentId === std.id &&
          g.subjectId === selectedSubjectId &&
          g.academicYear === activeAcademicYear.name &&
          g.semester === activeAcademicYear.semester
      );
      initial[std.id] = {
        tugas: existing ? existing.tugas : 85,
        ulangan: existing ? existing.ulangan : 82,
        uts: existing ? existing.uts : 88,
        uas: existing ? existing.uas : 90,
        praktik: existing ? existing.praktik || 85 : 85,
        description: existing ? existing.description : 'Menunjukkan penguasaan materi yang sangat baik.',
      };
    });
    return initial;
  });

  const handleScoreChange = (
    studentId: string,
    field: 'tugas' | 'ulangan' | 'uts' | 'uas' | 'praktik',
    value: number
  ) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    setStudentGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { tugas: 80, ulangan: 80, uts: 80, uas: 80, praktik: 80, description: '' }),
        [field]: clamped,
      },
    }));
  };

  const handleSaveAllGrades = () => {
    classStudents.forEach((std) => {
      const g = studentGrades[std.id] || { tugas: 80, ulangan: 80, uts: 80, uas: 80, praktik: 80, description: '' };
      saveStudentGrade({
        studentId: std.id,
        studentName: std.name,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        subjectName: selectedSubject ? selectedSubject.name : 'Mata Pelajaran',
        academicYear: activeAcademicYear.name,
        semester: activeAcademicYear.semester,
        tugas: g.tugas,
        ulangan: g.ulangan,
        uts: g.uts,
        uas: g.uas,
        praktik: g.praktik,
        finalScore: 0, // auto computed in context
        predicate: 'B',
        attitude: 'Baik',
        description: g.description,
      });
    });

    logAction(
      'UPDATE_GRADES',
      'Nilai',
      `Menyimpan daftar nilai ${selectedSubject?.name} kelas ${selectedClass?.name}`,
      currentUser!
    );

    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  const exportGradesCSV = () => {
    const headers = 'NIS,Nama Siswa,Tugas,Ulangan,UTS,UAS,Praktik,Nilai Akhir,Predikat\n';
    const rows = classStudents
      .map((std) => {
        const g = studentGrades[std.id] || { tugas: 80, ulangan: 80, uts: 80, uas: 80, praktik: 80, description: '' };
        const calc = calculateGradeScore(g.tugas, g.ulangan, g.uts, g.uas, g.praktik);
        return `"${std.nis}","${std.name}",${g.tugas},${g.ulangan},${g.uts},${g.uas},${g.praktik},${calc.score},"${calc.predicate}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nilai_${selectedClass?.name}_${selectedSubject?.name}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Penilaian & Buku Nilai Akademik</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kalkulasi otomatis Kurikulum Merdeka (Tugas, Ulangan, UTS, UAS, Praktik) dengan predikat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLocalWeights(gradeWeights);
              setShowWeightModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Bobot Nilai</span>
          </button>

          <button
            onClick={exportGradesCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleSaveAllGrades}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Semua Nilai</span>
          </button>
        </div>
      </div>

      {saveAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Seluruh nilai siswa berhasil disimpan dan dikalkulasi secara otomatis!</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Pilih Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
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
            <span className="text-xs font-bold text-slate-500">Mata Pelajaran:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (KKM: {s.kkm})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Active Weights Badges */}
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          <span>Bobot Aktif:</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Tugas {gradeWeights.tugas}%</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Ulangan {gradeWeights.ulangan}%</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">UTS {gradeWeights.uts}%</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">UAS {gradeWeights.uas}%</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Praktik {gradeWeights.praktik}%</span>
        </div>
      </div>

      {/* Grade Table with Live Inputs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-2 text-center w-20">Tugas ({gradeWeights.tugas}%)</th>
                <th className="py-3 px-2 text-center w-20">Ulangan ({gradeWeights.ulangan}%)</th>
                <th className="py-3 px-2 text-center w-20">UTS ({gradeWeights.uts}%)</th>
                <th className="py-3 px-2 text-center w-20">UAS ({gradeWeights.uas}%)</th>
                <th className="py-3 px-2 text-center w-20">Praktik ({gradeWeights.praktik}%)</th>
                <th className="py-3 px-3 text-center w-24">Nilai Akhir</th>
                <th className="py-3 px-2 text-center w-16">Predikat</th>
                <th className="py-3 px-4">Deskripsi Capaian Pembelajaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {classStudents.map((std, idx) => {
                const g = studentGrades[std.id] || {
                  tugas: 80,
                  ulangan: 80,
                  uts: 80,
                  uas: 80,
                  praktik: 80,
                  description: '',
                };
                const calc = calculateGradeScore(g.tugas, g.ulangan, g.uts, g.uas, g.praktik);
                const isUnderKKM = calc.score < (selectedSubject?.kkm || 75);

                return (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-slate-800">{std.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">NIS: {std.nis}</p>
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={g.tugas}
                        onChange={(e) => handleScoreChange(std.id, 'tugas', Number(e.target.value))}
                        className="w-16 py-1 px-1.5 text-center text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-teal-500"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={g.ulangan}
                        onChange={(e) => handleScoreChange(std.id, 'ulangan', Number(e.target.value))}
                        className="w-16 py-1 px-1.5 text-center text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-teal-500"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={g.uts}
                        onChange={(e) => handleScoreChange(std.id, 'uts', Number(e.target.value))}
                        className="w-16 py-1 px-1.5 text-center text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-teal-500"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={g.uas}
                        onChange={(e) => handleScoreChange(std.id, 'uas', Number(e.target.value))}
                        className="w-16 py-1 px-1.5 text-center text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-teal-500"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={g.praktik}
                        onChange={(e) => handleScoreChange(std.id, 'praktik', Number(e.target.value))}
                        className="w-16 py-1 px-1.5 text-center text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-teal-500"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-sm font-black ${
                          isUnderKKM ? 'text-red-600' : 'text-teal-700'
                        }`}
                      >
                        {calc.score}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          calc.predicate === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : calc.predicate === 'B'
                            ? 'bg-blue-100 text-blue-800'
                            : calc.predicate === 'C'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {calc.predicate}
                      </span>
                    </td>

                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={g.description}
                        onChange={(e) =>
                          setStudentGrades((prev) => ({
                            ...prev,
                            [std.id]: { ...g, description: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-teal-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Weights Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Konfigurasi Bobot Penilaian</h3>
              <button onClick={() => setShowWeightModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bobot Tugas (%)</label>
                <input
                  type="number"
                  value={localWeights.tugas}
                  onChange={(e) => setLocalWeights({ ...localWeights, tugas: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bobot Ulangan Harian (%)</label>
                <input
                  type="number"
                  value={localWeights.ulangan}
                  onChange={(e) => setLocalWeights({ ...localWeights, ulangan: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bobot UTS (%)</label>
                <input
                  type="number"
                  value={localWeights.uts}
                  onChange={(e) => setLocalWeights({ ...localWeights, uts: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bobot UAS (%)</label>
                <input
                  type="number"
                  value={localWeights.uas}
                  onChange={(e) => setLocalWeights({ ...localWeights, uas: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bobot Praktik / Keterampilan (%)</label>
                <input
                  type="number"
                  value={localWeights.praktik}
                  onChange={(e) => setLocalWeights({ ...localWeights, praktik: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Total Persentase:</span>
                <span
                  className={
                    localWeights.tugas + localWeights.ulangan + localWeights.uts + localWeights.uas + (localWeights.praktik || 0) === 100
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }
                >
                  {localWeights.tugas + localWeights.ulangan + localWeights.uts + localWeights.uas + (localWeights.praktik || 0)}%
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  updateGradeWeights(localWeights);
                  setShowWeightModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
              >
                Terapkan Bobot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
