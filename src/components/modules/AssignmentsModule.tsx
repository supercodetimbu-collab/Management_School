import React, { useState } from 'react';
import { useSiakadData } from '../../context/SiakadDataContext';
import { useAuth } from '../../context/AuthContext';
import { Assignment, AssignmentSubmission } from '../../types';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  MessageSquare,
  X,
  Send,
  Eye,
  Award,
} from 'lucide-react';

export const AssignmentsModule: React.FC = () => {
  const {
    assignments,
    submissions,
    classes,
    subjects,
    students,
    addAssignment,
    submitAssignment,
    gradeSubmission,
    logAction,
  } = useSiakadData();
  const { currentUser, currentRole } = useAuth();

  const [selectedClass, setSelectedClass] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState<Assignment | null>(null);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<Assignment | null>(null);

  // Student Submission form state
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFile, setSubmissionFile] = useState('tugas_jawaban.pdf');

  // Teacher Create Assignment form state
  const [newAsg, setNewAsg] = useState({
    title: '',
    description: '',
    classId: classes[0]?.id || 'cls-01',
    className: classes[0]?.name || 'X MIPA 1',
    subjectId: subjects[0]?.id || 'sub-01',
    subjectName: subjects[0]?.name || 'Matematika',
    dueDate: '2026-09-25',
    maxScore: 100,
  });

  // Teacher Grading form state
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Bagus sekali, analisis dan penjabarannya runtut.');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsg.title.trim()) return;

    const cls = classes.find((c) => c.id === newAsg.classId);
    const sub = subjects.find((s) => s.id === newAsg.subjectId);

    addAssignment({
      title: newAsg.title,
      description: newAsg.description,
      classId: newAsg.classId,
      className: cls ? cls.name : newAsg.className,
      subjectId: newAsg.subjectId,
      subjectName: sub ? sub.name : newAsg.subjectName,
      teacherId: currentUser?.id || 'tch-01',
      teacherName: currentUser?.name || 'Bpk. Hendra Gunawan, M.Pd',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: newAsg.dueDate,
      maxScore: newAsg.maxScore,
      status: 'Aktif',
    });

    logAction('ADD_ASSIGNMENT', 'Tugas', `Membuat tugas baru: ${newAsg.title}`, currentUser!);
    setShowCreateModal(false);
    setNewAsg({
      title: '',
      description: '',
      classId: classes[0]?.id || 'cls-01',
      className: classes[0]?.name || 'X MIPA 1',
      subjectId: subjects[0]?.id || 'sub-01',
      subjectName: subjects[0]?.name || 'Matematika',
      dueDate: '2026-09-25',
      maxScore: 100,
    });
  };

  const handleSubmitStudentAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit) return;

    submitAssignment({
      assignmentId: selectedAssignmentForSubmit.id,
      studentId: currentUser?.id || 'std-01',
      studentName: currentUser?.name || 'Muhammad Farhan Santoso',
      content: submissionNotes || 'Pengumpulan tugas mandiri siswa',
      fileUrl: submissionFile,
      notes: submissionNotes,
    });

    alert('Tugas berhasil dikumpulkan ke dewan guru!');
    setSelectedAssignmentForSubmit(null);
    setSubmissionNotes('');
  };

  const handleSaveGrade = (subId: string) => {
    gradeSubmission(subId, gradeScore, gradeFeedback);
    setGradingSubId(null);
    alert('Nilai dan umpan balik tugas berhasil disimpan!');
  };

  const filtered = assignments.filter((a) => selectedClass === 'ALL' || a.classId === selectedClass);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Tugas & Evaluasi Mandiri</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengumpulan berkas, batas tenggat waktu, dan pemberian umpan balik guru
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(currentRole === 'guru' || currentRole === 'admin' || currentRole === 'superadmin') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Tugas Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((asg) => {
          const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);
          const isStudentSubmitted = submissions.some(
            (s) => s.assignmentId === asg.id && (s.studentId === currentUser?.id || s.studentName.includes('Farhan'))
          );

          return (
            <div
              key={asg.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-teal-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {asg.subjectName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                    {asg.className}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 leading-snug">{asg.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{asg.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tenggat: {asg.dueDate}</span>
                  </div>
                  <span className="font-bold text-slate-700">Maks. {asg.maxScore} Poin</span>
                </div>

                {/* Actions depending on Role */}
                {currentRole === 'siswa' ? (
                  isStudentSubmitted ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Sudah Dikumpulkan</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedAssignmentForSubmit(asg)}
                      className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Kumpulkan Tugas</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => setSelectedAssignmentForReview(asg)}
                    className="w-full py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                    <span>Periksa Jawaban Siswa ({asgSubmissions.length})</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Buat Tugas Baru</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Tugas *</label>
                <input
                  type="text"
                  required
                  value={newAsg.title}
                  onChange={(e) => setNewAsg({ ...newAsg, title: e.target.value })}
                  placeholder="Contoh: Analisis Vektor pada Gerak Lurus"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={newAsg.subjectId}
                    onChange={(e) => setNewAsg({ ...newAsg, subjectId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Sasaran</label>
                  <select
                    value={newAsg.classId}
                    onChange={(e) => setNewAsg({ ...newAsg, classId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batas Tenggat (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={newAsg.dueDate}
                    onChange={(e) => setNewAsg({ ...newAsg, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skor Maksimal</label>
                  <input
                    type="number"
                    value={newAsg.maxScore}
                    onChange={(e) => setNewAsg({ ...newAsg, maxScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Petunjuk & Instruksi Tugas</label>
                <textarea
                  rows={3}
                  value={newAsg.description}
                  onChange={(e) => setNewAsg({ ...newAsg, description: e.target.value })}
                  placeholder="Jelaskan format pengumpulan, poin pengerjaan, dan rubrik penilaian..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
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
                  Publikasikan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submissions Modal for Teachers */}
      {selectedAssignmentForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{selectedAssignmentForReview.title}</h3>
                <p className="text-xs text-slate-500">
                  Pengumpulan Siswa {selectedAssignmentForReview.className}
                </p>
              </div>
              <button onClick={() => setSelectedAssignmentForReview(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {submissions.filter((s) => s.assignmentId === selectedAssignmentForReview.id).length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">Belum ada siswa yang mengumpulkan tugas ini.</p>
              ) : (
                submissions
                  .filter((s) => s.assignmentId === selectedAssignmentForReview.id)
                  .map((sub) => (
                    <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{sub.studentName}</p>
                          <p className="text-[10px] text-slate-400">Diserahkan: {sub.submittedAt}</p>
                        </div>
                        {sub.status === 'Dinilai' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                            Nilai: {sub.score} / {selectedAssignmentForReview.maxScore}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            Menunggu Dinilai
                          </span>
                        )}
                      </div>

                      {sub.notes && (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                          "{sub.notes}"
                        </p>
                      )}

                      {sub.feedback && (
                        <p className="text-xs text-teal-800 bg-teal-50 p-2 rounded-xl">
                          <strong>Umpan Balik Guru:</strong> {sub.feedback}
                        </p>
                      )}

                      {gradingSubId === sub.id ? (
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-700">Skor (0-100):</label>
                            <input
                              type="number"
                              value={gradeScore}
                              onChange={(e) => setGradeScore(Number(e.target.value))}
                              className="w-20 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-center"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700">Umpan Balik / Catatan:</label>
                            <input
                              type="text"
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg mt-1"
                            />
                          </div>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setGradingSubId(null)}
                              className="px-3 py-1 text-xs font-bold text-slate-500"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveGrade(sub.id)}
                              className="px-3 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                            >
                              Simpan Nilai
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setGradingSubId(sub.id);
                              setGradeScore(sub.score || 85);
                              setGradeFeedback(sub.feedback || 'Bagus sekali!');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100"
                          >
                            {sub.status === 'Dinilai' ? 'Edit Nilai' : 'Beri Nilai & Feedback'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Submit Modal */}
      {selectedAssignmentForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Kumpulkan Tugas Mandiri</h3>
              <button onClick={() => setSelectedAssignmentForSubmit(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-3 p-3 bg-teal-50/60 rounded-2xl border border-teal-100">
              <p className="text-xs font-bold text-slate-800">{selectedAssignmentForSubmit.title}</p>
              <p className="text-[11px] text-teal-800">{selectedAssignmentForSubmit.subjectName}</p>
              <p className="text-[10px] text-slate-400 mt-1">Tenggat: {selectedAssignmentForSubmit.dueDate}</p>
            </div>

            <form onSubmit={handleSubmitStudentAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unggah Berkas Jawaban (PDF / Doc)</label>
                <div className="p-3 border border-slate-200 bg-slate-50 rounded-xl text-center">
                  <Upload className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-700 block">tugas_farhan_matematika.pdf</span>
                  <span className="text-[10px] text-slate-400">Siap diunggah ke portal guru</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan untuk Guru</label>
                <textarea
                  rows={2}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Tuliskan catatan pengerjaan jika ada..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForSubmit(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                >
                  Kirim Jawaban Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
