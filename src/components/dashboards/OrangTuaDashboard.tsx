import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiakadData } from '../../context/SiakadDataContext';
import {
  HeartHandshake,
  Award,
  ClipboardCheck,
  Clock,
  FileText,
  User,
  Phone,
  CheckCircle2,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileSignature,
} from 'lucide-react';

interface OrangTuaDashboardProps {
  setCurrentModule: (mod: string) => void;
}

export const OrangTuaDashboard: React.FC<OrangTuaDashboardProps> = ({ setCurrentModule }) => {
  const { currentUser, selectedChildId, setSelectedChildId } = useAuth();
  const { students, grades, studentAttendance, assignments, classes } = useSiakadData();

  // Find linked children
  const linkedStudentIds = currentUser?.linkedStudentIds || ['std-01', 'std-03'];
  const myChildren = students.filter((s) => linkedStudentIds.includes(s.id));
  const activeChild = myChildren.find((s) => s.id === selectedChildId) || myChildren[0] || students[0];

  // Child's grades
  const childGrades = grades.filter((g) => g.studentId === activeChild?.id);
  const avgScore =
    childGrades.length > 0
      ? (childGrades.reduce((sum, g) => sum + g.finalScore, 0) / childGrades.length).toFixed(1)
      : '88.0';

  // Child's attendance
  const childAtt = studentAttendance.filter((a) => a.studentId === activeChild?.id);
  const hadirCount = childAtt.filter((a) => a.status === 'Hadir').length;
  const attRate = childAtt.length > 0 ? Math.round((hadirCount / childAtt.length) * 100) : 98;

  // Child's class info
  const childClass = classes.find((c) => c.id === activeChild?.classId);

  return (
    <div className="space-y-5">
      {/* Parent Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-700 via-amber-600 to-teal-700 text-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
              Portal Wali Murid & Orang Tua
            </span>
            <h1 className="text-xl sm:text-2xl font-black">
              Selamat datang, {currentUser?.name || 'Bpk. Santoso Mulyo'} 👨‍👩‍👧
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-0.5">
              Pantau perkembangan akademik, kehadiran, dan aktivitas ananda secara berkala.
            </p>
          </div>

          {/* Child Selector Tabs (Multi-children support) */}
          {myChildren.length > 1 && (
            <div className="bg-black/20 p-1.5 rounded-2xl flex items-center gap-1.5 backdrop-blur-xs">
              <span className="text-[11px] font-bold text-amber-200 px-2">Pilih Anak:</span>
              {myChildren.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChildId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeChild?.id === c.id
                      ? 'bg-white text-amber-900 shadow-xs'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {c.name.split(' ')[0]} ({c.className})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Child Profile Card */}
      {activeChild && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xl">
                {activeChild.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-800">{activeChild.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
                    Kelas {activeChild.className}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  NISN: {activeChild.nisn} • NIS: {activeChild.nis}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-100 text-center">
                <span className="text-[10px] text-teal-700 font-bold uppercase block">Rata-Rata Nilai</span>
                <span className="text-lg font-black text-teal-900">{avgScore}</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">Kehadiran</span>
                <span className="text-lg font-black text-emerald-800">{attRate}%</span>
              </div>
            </div>
          </div>

          {/* Wali Kelas Contact Bar */}
          <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-teal-600" />
              <span>
                Wali Kelas: <strong className="text-slate-800">{childClass?.waliKelasName || 'Bpk. Hendra Gunawan, M.Pd'}</strong>
              </span>
            </div>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hubungi Wali Kelas</span>
            </a>
          </div>
        </div>
      )}

      {/* Child Summary Sections: Grades & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Child Grades Snippet */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Perkembangan Nilai Anak</h3>
            </div>
            <button
              onClick={() => setCurrentModule('grades')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Rincian Lengkap
            </button>
          </div>

          <div className="space-y-2.5">
            {childGrades.slice(0, 4).map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{g.subjectName}</p>
                  <p className="text-[10px] text-slate-500">
                    Tugas: {g.tugas} | UTS: {g.uts} | UAS: {g.uas}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">{g.finalScore}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      g.predicate === 'A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : g.predicate === 'B'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {g.predicate}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentModule('report_cards')}
            className="w-full mt-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FileSignature className="w-4 h-4 text-teal-600" />
            <span>Lihat Lembar Raport Digital Ananda</span>
          </button>
        </div>

        {/* Child Attendance Records */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Log Kehadiran Ananda</h3>
            </div>
            <button
              onClick={() => setCurrentModule('attendance')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Semua Presensi
            </button>
          </div>

          <div className="space-y-2.5">
            {childAtt.slice(0, 4).map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">Tanggal: {att.date}</p>
                  <p className="text-[10px] text-slate-500">
                    Masuk: {att.checkInTime || '-'} • Pulang: {att.checkOutTime || '-'}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    att.status === 'Hadir'
                      ? 'bg-emerald-100 text-emerald-800'
                      : att.status === 'Sakit'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
