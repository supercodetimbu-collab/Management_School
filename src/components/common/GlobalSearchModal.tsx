import React, { useState, useEffect, useRef } from 'react';
import { Search, X, GraduationCap, Users, BookOpen, Clock, FileText, School } from 'lucide-react';
import { useSiakadData } from '../../context/SiakadDataContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (module: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const { students, teachers, classes, subjects, schedules, assignments } = useSiakadData();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectResult('dashboard'); // triggers search
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectResult]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingStudents = q
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nis.includes(q) ||
          s.nisn.includes(q) ||
          s.className.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchingTeachers = q
    ? teachers.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.nip.includes(q) ||
          t.subjectName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchingSubjects = q
    ? subjects.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchingAssignments = q
    ? assignments.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subjectName.toLowerCase().includes(q) ||
          a.className.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const hasResults =
    matchingStudents.length > 0 ||
    matchingTeachers.length > 0 ||
    matchingSubjects.length > 0 ||
    matchingAssignments.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari siswa, guru, kelas, mapel, tugas..."
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100">
          {!q ? (
            <div className="p-6 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Ketik nama siswa (misal: "Farhan"), NIS, nama guru ("Hendra"), atau mata pelajaran.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                {['Farhan', 'Hendra', 'Matematika', 'X MIPA 1', 'Fisika'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ditemukan hasil untuk "{query}"
            </div>
          ) : (
            <div className="space-y-4">
              {matchingStudents.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">Siswa</p>
                  <div className="space-y-1">
                    {matchingStudents.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectResult('students', s.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-teal-50/60 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{s.name}</p>
                            <p className="text-[10px] text-slate-500">NIS: {s.nis} • Kelas: {s.className}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                          Buka
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingTeachers.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">Guru</p>
                  <div className="space-y-1">
                    {matchingTeachers.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectResult('teachers', t.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-teal-50/60 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{t.name}</p>
                            <p className="text-[10px] text-slate-500">Mapel: {t.subjectName} • NIP: {t.nip}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          Buka
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingSubjects.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">Mata Pelajaran</p>
                  <div className="space-y-1">
                    {matchingSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          onSelectResult('subjects', sub.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-teal-50/60 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{sub.name}</p>
                            <p className="text-[10px] text-slate-500">Kode: {sub.code} • Guru: {sub.teacherName}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Buka
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingAssignments.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">Tugas</p>
                  <div className="space-y-1">
                    {matchingAssignments.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onSelectResult('assignments', a.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-teal-50/60 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{a.title}</p>
                            <p className="text-[10px] text-slate-500">{a.subjectName} • Deadline: {a.dueDate}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          Buka
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
