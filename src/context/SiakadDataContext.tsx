import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SchoolProfile,
  Student,
  Teacher,
  Parent,
  ClassRoom,
  Subject,
  AcademicYear,
  Schedule,
  StudentAttendanceRecord,
  TeacherAttendanceRecord,
  StudentGrade,
  Assignment,
  AssignmentSubmission,
  Exam,
  Announcement,
  NotificationItem,
  AcademicCalendarEvent,
  AuditLog,
  GradeWeights,
  PromotionRecord,
  GraduationRecord,
  AttendanceStatus,
  PaymentBill,
} from '../types';
import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_GRADE_WEIGHTS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_PARENTS,
  INITIAL_STUDENTS,
  INITIAL_SCHEDULES,
  INITIAL_STUDENT_ATTENDANCE,
  INITIAL_TEACHER_ATTENDANCE,
  INITIAL_STUDENT_GRADES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_EXAMS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

interface SiakadDataContextType {
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (data: Partial<SchoolProfile>) => void;
  gradeWeights: GradeWeights;
  updateGradeWeights: (weights: GradeWeights) => void;

  academicYears: AcademicYear[];
  activeAcademicYear: AcademicYear;
  setActiveAcademicYear: (id: string) => void;
  addAcademicYear: (year: Omit<AcademicYear, 'id'>) => void;

  classes: ClassRoom[];
  addClass: (cls: Omit<ClassRoom, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClass: (id: string, cls: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;

  subjects: Subject[];
  addSubject: (subj: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubject: (id: string, subj: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  teachers: Teacher[];
  addTeacher: (tch: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTeacher: (id: string, tch: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  students: Student[];
  addStudent: (std: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudent: (id: string, std: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  batchImportStudents: (newStudents: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]) => void;

  parents: Parent[];
  addParent: (prt: Omit<Parent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateParent: (id: string, prt: Partial<Parent>) => void;
  deleteParent: (id: string) => void;

  schedules: Schedule[];
  addSchedule: (sch: Omit<Schedule, 'id'>) => { success: boolean; conflictMessage?: string };
  updateSchedule: (id: string, sch: Partial<Schedule>) => { success: boolean; conflictMessage?: string };
  deleteSchedule: (id: string) => void;
  checkScheduleConflict: (sch: Omit<Schedule, 'id'>, excludeId?: string) => string | null;

  studentAttendance: StudentAttendanceRecord[];
  recordStudentAttendance: (record: Omit<StudentAttendanceRecord, 'id'>) => void;
  batchRecordStudentAttendance: (records: Omit<StudentAttendanceRecord, 'id'>[]) => void;

  teacherAttendance: TeacherAttendanceRecord[];
  recordTeacherAttendance: (record: Omit<TeacherAttendanceRecord, 'id'>) => void;

  grades: StudentGrade[];
  saveStudentGrade: (grade: Omit<StudentGrade, 'id' | 'updatedAt'>) => void;
  calculateGradeScore: (tugas: number, ulangan: number, uts: number, uas: number, praktik?: number) => { score: number; predicate: 'A' | 'B' | 'C' | 'D' };

  assignments: Assignment[];
  addAssignment: (asg: Omit<Assignment, 'id' | 'submissionsCount'>) => void;
  updateAssignment: (id: string, asg: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  submissions: AssignmentSubmission[];
  submitAssignment: (subm: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;

  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  deleteExam: (id: string) => void;

  announcements: Announcement[];
  addAnnouncement: (anc: Omit<Announcement, 'id' | 'publishedDate'>) => void;
  deleteAnnouncement: (id: string) => void;

  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'time' | 'read'>) => void;

  calendarEvents: AcademicCalendarEvent[];
  addCalendarEvent: (event: Omit<AcademicCalendarEvent, 'id'>) => void;

  promotions: PromotionRecord[];
  recordPromotion: (promo: Omit<PromotionRecord, 'id' | 'processedDate'>) => void;

  graduations: GraduationRecord[];
  recordGraduation: (grad: Omit<GraduationRecord, 'id'>) => void;

  auditLogs: AuditLog[];
  logAction: (action: string, module: string, details: string, user: { id: string; name: string; role: any }) => void;

  bills: PaymentBill[];
  payBill: (billId: string, paymentMethod: 'Tunai' | 'Transfer Bank' | 'Virtual Account', notes?: string) => void;
  addBill: (bill: Omit<PaymentBill, 'id'>) => void;

  backupData: () => string;
  restoreData: (jsonStr: string) => boolean;
  resetDemoData: () => void;
  exportFullDatabaseJSON: () => void;
  importFullDatabaseJSON: (jsonStr: string) => boolean;
  resetToDemoData: () => void;
}

const SiakadDataContext = createContext<SiakadDataContextType | undefined>(undefined);

const STORAGE_KEY = 'siakad_master_database_v1';

export const SiakadDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or default to initial datasets
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Error reading localStorage for SIAKAD database, using defaults', err);
      }
    }
    return {
      schoolProfile: INITIAL_SCHOOL_PROFILE,
      gradeWeights: INITIAL_GRADE_WEIGHTS,
      academicYears: INITIAL_ACADEMIC_YEARS,
      classes: INITIAL_CLASSES,
      teachers: INITIAL_TEACHERS,
      subjects: INITIAL_SUBJECTS,
      parents: INITIAL_PARENTS,
      students: INITIAL_STUDENTS,
      schedules: INITIAL_SCHEDULES,
      studentAttendance: INITIAL_STUDENT_ATTENDANCE,
      teacherAttendance: INITIAL_TEACHER_ATTENDANCE,
      grades: INITIAL_STUDENT_GRADES,
      assignments: INITIAL_ASSIGNMENTS,
      submissions: INITIAL_SUBMISSIONS,
      exams: INITIAL_EXAMS,
      announcements: INITIAL_ANNOUNCEMENTS,
      notifications: INITIAL_NOTIFICATIONS,
      calendarEvents: INITIAL_CALENDAR_EVENTS,
      promotions: [] as PromotionRecord[],
      graduations: [] as GraduationRecord[],
      auditLogs: INITIAL_AUDIT_LOGS,
      bills: [
        {
          id: 'bill-01',
          studentId: 'std-01',
          studentName: 'Muhammad Farhan Santoso',
          className: 'X MIPA 1',
          title: 'SPP Bulan September 2026',
          type: 'SPP' as const,
          amount: 500000,
          dueDate: '2026-09-10',
          status: 'Lunas' as const,
          paymentMethod: 'Virtual Account' as const,
          paidAt: '2026-09-05 08:30',
          receiptNumber: 'KWT/2026/09/001',
          academicYear: '2026/2027',
        },
        {
          id: 'bill-02',
          studentId: 'std-02',
          studentName: 'Aisyah Putri Rahmadani',
          className: 'X MIPA 1',
          title: 'SPP Bulan September 2026',
          type: 'SPP' as const,
          amount: 500000,
          dueDate: '2026-09-10',
          status: 'Lunas' as const,
          paymentMethod: 'Transfer Bank' as const,
          paidAt: '2026-09-08 14:15',
          receiptNumber: 'KWT/2026/09/002',
          academicYear: '2026/2027',
        },
        {
          id: 'bill-03',
          studentId: 'std-03',
          studentName: 'Bima Satria Wicaksana',
          className: 'X MIPA 1',
          title: 'SPP Bulan September 2026',
          type: 'SPP' as const,
          amount: 500000,
          dueDate: '2026-09-10',
          status: 'Belum Lunas' as const,
          academicYear: '2026/2027',
        },
        {
          id: 'bill-04',
          studentId: 'std-01',
          studentName: 'Muhammad Farhan Santoso',
          className: 'X MIPA 1',
          title: 'Iuran Peringatan HUT RI & Ekstrakurikuler',
          type: 'Kegiatan' as const,
          amount: 150000,
          dueDate: '2026-08-15',
          status: 'Lunas' as const,
          paymentMethod: 'Tunai' as const,
          paidAt: '2026-08-12 10:00',
          receiptNumber: 'KWT/2026/08/045',
          academicYear: '2026/2027',
        },
      ] as PaymentBill[],
    };
  });

  // Automatically sync to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to sync SIAKAD database to localStorage', e);
    }
  }, [data]);

  // Log action helper
  const logAction = (action: string, module: string, details: string, user: { id: string; name: string; role: any }) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      module,
      details,
      timestamp,
    };
    setData((prev: any) => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs],
    }));
  };

  // School Profile
  const updateSchoolProfile = (profileUpdate: Partial<SchoolProfile>) => {
    setData((prev: any) => ({
      ...prev,
      schoolProfile: { ...prev.schoolProfile, ...profileUpdate },
    }));
  };

  // Grade Weights
  const updateGradeWeights = (weights: GradeWeights) => {
    setData((prev: any) => ({
      ...prev,
      gradeWeights: weights,
    }));
  };

  // Academic Years
  const activeAcademicYear = data.academicYears.find((ay: AcademicYear) => ay.isActive) || data.academicYears[0];

  const setActiveAcademicYear = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      academicYears: prev.academicYears.map((ay: AcademicYear) => ({
        ...ay,
        isActive: ay.id === id,
      })),
    }));
  };

  const addAcademicYear = (year: Omit<AcademicYear, 'id'>) => {
    const newAy: AcademicYear = {
      id: `ay-${Date.now()}`,
      ...year,
    };
    setData((prev: any) => ({
      ...prev,
      academicYears: [...prev.academicYears, newAy],
    }));
  };

  // Classes
  const addClass = (cls: Omit<ClassRoom, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newClass: ClassRoom = {
      id: `cls-${Date.now()}`,
      ...cls,
      createdAt: now,
      updatedAt: now,
    };
    setData((prev: any) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
  };

  const updateClass = (id: string, cls: Partial<ClassRoom>) => {
    const now = new Date().toISOString().split('T')[0];
    setData((prev: any) => ({
      ...prev,
      classes: prev.classes.map((c: ClassRoom) => (c.id === id ? { ...c, ...cls, updatedAt: now } : c)),
    }));
  };

  const deleteClass = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      classes: prev.classes.filter((c: ClassRoom) => c.id !== id),
    }));
  };

  // Subjects
  const addSubject = (subj: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newSubj: Subject = {
      id: `sub-${Date.now()}`,
      ...subj,
      createdAt: now,
      updatedAt: now,
    };
    setData((prev: any) => ({
      ...prev,
      subjects: [...prev.subjects, newSubj],
    }));
  };

  const updateSubject = (id: string, subj: Partial<Subject>) => {
    const now = new Date().toISOString().split('T')[0];
    setData((prev: any) => ({
      ...prev,
      subjects: prev.subjects.map((s: Subject) => (s.id === id ? { ...s, ...subj, updatedAt: now } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      subjects: prev.subjects.filter((s: Subject) => s.id !== id),
    }));
  };

  // Teachers
  const addTeacher = (tch: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      ...tch,
      createdAt: now,
      updatedAt: now,
    };
    setData((prev: any) => ({
      ...prev,
      teachers: [...prev.teachers, newTeacher],
    }));
  };

  const updateTeacher = (id: string, tch: Partial<Teacher>) => {
    const now = new Date().toISOString().split('T')[0];
    setData((prev: any) => ({
      ...prev,
      teachers: prev.teachers.map((t: Teacher) => (t.id === id ? { ...t, ...tch, updatedAt: now } : t)),
    }));
  };

  const deleteTeacher = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      teachers: prev.teachers.filter((t: Teacher) => t.id !== id),
    }));
  };

  // Students
  const addStudent = (std: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      ...std,
      createdAt: now,
      updatedAt: now,
    };
    setData((prev: any) => ({
      ...prev,
      students: [newStudent, ...prev.students],
    }));
  };

  const updateStudent = (id: string, std: Partial<Student>) => {
    const now = new Date().toISOString().split('T')[0];
    setData((prev: any) => ({
      ...prev,
      students: prev.students.map((s: Student) => (s.id === id ? { ...s, ...std, updatedAt: now } : s)),
    }));
  };

  const deleteStudent = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      students: prev.students.filter((s: Student) => s.id !== id),
    }));
  };

  const batchImportStudents = (newStudents: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const now = new Date().toISOString().split('T')[0];
    const mapped: Student[] = newStudents.map((std, idx) => ({
      id: `std-${Date.now()}-${idx}`,
      ...std,
      createdAt: now,
      updatedAt: now,
    }));
    setData((prev: any) => ({
      ...prev,
      students: [...mapped, ...prev.students],
    }));
  };

  // Parents
  const addParent = (prt: Omit<Parent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newParent: Parent = {
      id: `prt-${Date.now()}`,
      ...prt,
      createdAt: now,
      updatedAt: now,
    };
    setData((prev: any) => ({
      ...prev,
      parents: [...prev.parents, newParent],
    }));
  };

  const updateParent = (id: string, prt: Partial<Parent>) => {
    const now = new Date().toISOString().split('T')[0];
    setData((prev: any) => ({
      ...prev,
      parents: prev.parents.map((p: Parent) => (p.id === id ? { ...p, ...prt, updatedAt: now } : p)),
    }));
  };

  const deleteParent = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      parents: prev.parents.filter((p: Parent) => p.id !== id),
    }));
  };

  // Schedules with Conflict Checker
  const checkScheduleConflict = (sch: Omit<Schedule, 'id'>, excludeId?: string): string | null => {
    // Compare times
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = toMinutes(sch.startTime);
    const newEnd = toMinutes(sch.endTime);

    for (const existing of data.schedules) {
      if (excludeId && existing.id === excludeId) continue;
      if (existing.day !== sch.day) continue;

      const existStart = toMinutes(existing.startTime);
      const existEnd = toMinutes(existing.endTime);

      // Check time overlap
      const hasTimeOverlap = Math.max(newStart, existStart) < Math.min(newEnd, existEnd);
      if (hasTimeOverlap) {
        // 1. Teacher conflict
        if (existing.teacherId === sch.teacherId) {
          return `Konflik Guru: Bpk/Ibu ${existing.teacherName} sudah mengajar di kelas ${existing.className} pada hari ${existing.day} pukul ${existing.startTime} - ${existing.endTime}.`;
        }
        // 2. Class conflict
        if (existing.classId === sch.classId) {
          return `Konflik Kelas: Kelas ${existing.className} sudah memiliki jadwal pelajaran ${existing.subjectName} pada hari ${existing.day} pukul ${existing.startTime} - ${existing.endTime}.`;
        }
        // 3. Room conflict
        if (existing.room.toLowerCase().trim() === sch.room.toLowerCase().trim()) {
          return `Konflik Ruangan: Ruangan ${existing.room} sedang digunakan oleh kelas ${existing.className} pada waktu yang sama.`;
        }
      }
    }
    return null;
  };

  const addSchedule = (sch: Omit<Schedule, 'id'>) => {
    const conflict = checkScheduleConflict(sch);
    if (conflict) {
      return { success: false, conflictMessage: conflict };
    }
    const newSch: Schedule = {
      id: `sch-${Date.now()}`,
      ...sch,
    };
    setData((prev: any) => ({
      ...prev,
      schedules: [...prev.schedules, newSch],
    }));
    return { success: true };
  };

  const updateSchedule = (id: string, sch: Partial<Schedule>) => {
    const existing = data.schedules.find((s: Schedule) => s.id === id);
    if (!existing) return { success: false, conflictMessage: 'Jadwal tidak ditemukan' };
    const merged = { ...existing, ...sch };
    const conflict = checkScheduleConflict(merged, id);
    if (conflict) {
      return { success: false, conflictMessage: conflict };
    }
    setData((prev: any) => ({
      ...prev,
      schedules: prev.schedules.map((s: Schedule) => (s.id === id ? merged : s)),
    }));
    return { success: true };
  };

  const deleteSchedule = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      schedules: prev.schedules.filter((s: Schedule) => s.id !== id),
    }));
  };

  // Student Attendance
  const recordStudentAttendance = (record: Omit<StudentAttendanceRecord, 'id'>) => {
    setData((prev: any) => {
      // replace if same student & same date
      const existingIdx = prev.studentAttendance.findIndex(
        (a: StudentAttendanceRecord) => a.studentId === record.studentId && a.date === record.date
      );
      if (existingIdx >= 0) {
        const updated = [...prev.studentAttendance];
        updated[existingIdx] = { ...updated[existingIdx], ...record };
        return { ...prev, studentAttendance: updated };
      }
      return {
        ...prev,
        studentAttendance: [{ id: `att-${Date.now()}`, ...record }, ...prev.studentAttendance],
      };
    });
  };

  const batchRecordStudentAttendance = (records: Omit<StudentAttendanceRecord, 'id'>[]) => {
    setData((prev: any) => {
      let updated = [...prev.studentAttendance];
      records.forEach((rec, idx) => {
        const existingIdx = updated.findIndex((a) => a.studentId === rec.studentId && a.date === rec.date);
        if (existingIdx >= 0) {
          updated[existingIdx] = { ...updated[existingIdx], ...rec };
        } else {
          updated.unshift({ id: `att-${Date.now()}-${idx}`, ...rec });
        }
      });
      return { ...prev, studentAttendance: updated };
    });
  };

  // Teacher Attendance
  const recordTeacherAttendance = (record: Omit<TeacherAttendanceRecord, 'id'>) => {
    setData((prev: any) => ({
      ...prev,
      teacherAttendance: [{ id: `tatt-${Date.now()}`, ...record }, ...prev.teacherAttendance],
    }));
  };

  // Grades & Weights Calculation
  const calculateGradeScore = (tugas: number, ulangan: number, uts: number, uas: number, praktik = 0) => {
    const weights = data.gradeWeights;
    const totalWeights = (weights.tugas || 0) + (weights.ulangan || 0) + (weights.uts || 0) + (weights.uas || 0) + (weights.praktik || 0) || 100;
    const rawScore =
      ((tugas * (weights.tugas || 0)) +
        (ulangan * (weights.ulangan || 0)) +
        (uts * (weights.uts || 0)) +
        (uas * (weights.uas || 0)) +
        (praktik * (weights.praktik || 0))) /
      totalWeights;

    const finalScore = Number(rawScore.toFixed(1));
    let predicate: 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 88) predicate = 'A';
    else if (finalScore >= 78) predicate = 'B';
    else if (finalScore >= 68) predicate = 'C';
    else predicate = 'D';

    return { score: finalScore, predicate };
  };

  const saveStudentGrade = (grade: Omit<StudentGrade, 'id' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const calc = calculateGradeScore(grade.tugas, grade.ulangan, grade.uts, grade.uas, grade.praktik);
    const enrichedGrade: StudentGrade = {
      id: `grd-${Date.now()}`,
      ...grade,
      finalScore: calc.score,
      predicate: calc.predicate,
      updatedAt: now,
    };

    setData((prev: any) => {
      const existingIdx = prev.grades.findIndex(
        (g: StudentGrade) =>
          g.studentId === grade.studentId &&
          g.subjectId === grade.subjectId &&
          g.academicYear === grade.academicYear &&
          g.semester === grade.semester
      );
      if (existingIdx >= 0) {
        const copy = [...prev.grades];
        copy[existingIdx] = { ...copy[existingIdx], ...enrichedGrade, id: copy[existingIdx].id };
        return { ...prev, grades: copy };
      }
      return { ...prev, grades: [enrichedGrade, ...prev.grades] };
    });
  };

  // Assignments & Submissions
  const addAssignment = (asg: Omit<Assignment, 'id' | 'submissionsCount'>) => {
    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      ...asg,
      submissionsCount: 0,
    };
    setData((prev: any) => ({
      ...prev,
      assignments: [newAsg, ...prev.assignments],
    }));
  };

  const updateAssignment = (id: string, asg: Partial<Assignment>) => {
    setData((prev: any) => ({
      ...prev,
      assignments: prev.assignments.map((a: Assignment) => (a.id === id ? { ...a, ...asg } : a)),
    }));
  };

  const deleteAssignment = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      assignments: prev.assignments.filter((a: Assignment) => a.id !== id),
    }));
  };

  const submitAssignment = (subm: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newSubm: AssignmentSubmission = {
      id: `subm-${Date.now()}`,
      ...subm,
      submittedAt: formatted,
      status: 'Diserahkan',
    };

    setData((prev: any) => {
      // increment assignment count
      const updatedAssignments = prev.assignments.map((a: Assignment) =>
        a.id === subm.assignmentId ? { ...a, submissionsCount: (a.submissionsCount || 0) + 1 } : a
      );
      return {
        ...prev,
        assignments: updatedAssignments,
        submissions: [newSubm, ...prev.submissions],
      };
    });
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string) => {
    setData((prev: any) => ({
      ...prev,
      submissions: prev.submissions.map((s: AssignmentSubmission) =>
        s.id === submissionId ? { ...s, score, feedback, status: 'Dinilai' as const } : s
      ),
    }));
  };

  // Exams
  const addExam = (exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      id: `ex-${Date.now()}`,
      ...exam,
    };
    setData((prev: any) => ({
      ...prev,
      exams: [...prev.exams, newExam],
    }));
  };

  const deleteExam = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      exams: prev.exams.filter((e: Exam) => e.id !== id),
    }));
  };

  // Announcements
  const addAnnouncement = (anc: Omit<Announcement, 'id' | 'publishedDate'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newAnc: Announcement = {
      id: `anc-${Date.now()}`,
      ...anc,
      publishedDate: now,
    };
    setData((prev: any) => ({
      ...prev,
      announcements: [newAnc, ...prev.announcements],
    }));
  };

  const deleteAnnouncement = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      announcements: prev.announcements.filter((a: Announcement) => a.id !== id),
    }));
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: NotificationItem) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsAsRead = () => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: NotificationItem) => ({ ...n, read: true })),
    }));
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'time' | 'read'>) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      ...notif,
      timestamp: Date.now(),
      time: 'Baru saja',
      read: false,
    };
    setData((prev: any) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
  };

  // Academic Calendar Events
  const addCalendarEvent = (event: Omit<AcademicCalendarEvent, 'id'>) => {
    const newEvent: AcademicCalendarEvent = {
      id: `cal-${Date.now()}`,
      ...event,
    };
    setData((prev: any) => ({
      ...prev,
      calendarEvents: [...prev.calendarEvents, newEvent],
    }));
  };

  // Class Promotions
  const recordPromotion = (promo: Omit<PromotionRecord, 'id' | 'processedDate'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newPromo: PromotionRecord = {
      id: `prm-${Date.now()}`,
      ...promo,
      processedDate: now,
    };
    setData((prev: any) => {
      // update student class if naik kelas
      const updatedStudents = prev.students.map((s: Student) => {
        if (s.id === promo.studentId && promo.decision === 'Naik Kelas') {
          return { ...s, classId: promo.toClassId, className: promo.toClassName };
        }
        return s;
      });
      return {
        ...prev,
        students: updatedStudents,
        promotions: [newPromo, ...prev.promotions],
      };
    });
  };

  // Graduations
  const recordGraduation = (grad: Omit<GraduationRecord, 'id'>) => {
    const newGrad: GraduationRecord = {
      id: `grd-rec-${Date.now()}`,
      ...grad,
    };
    setData((prev: any) => {
      const updatedStudents = prev.students.map((s: Student) =>
        s.id === grad.studentId ? { ...s, status: 'Lulus' as const } : s
      );
      return {
        ...prev,
        students: updatedStudents,
        graduations: [newGrad, ...prev.graduations],
      };
    });
  };

  // Bills & Finance
  const payBill = (
    billId: string,
    paymentMethod: 'Tunai' | 'Transfer Bank' | 'Virtual Account',
    notes?: string
  ) => {
    setData((prev: any) => ({
      ...prev,
      bills: (prev.bills || []).map((b: PaymentBill) => {
        if (b.id === billId) {
          const now = new Date();
          const receipt = `KWT/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${Math.floor(
            100 + Math.random() * 900
          )}`;
          return {
            ...b,
            status: 'Lunas' as const,
            paymentMethod,
            paidAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
              now.getDate()
            ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
              now.getMinutes()
            ).padStart(2, '0')}`,
            receiptNumber: receipt,
          };
        }
        return b;
      }),
    }));
  };

  const addBill = (bill: Omit<PaymentBill, 'id'>) => {
    const newBill: PaymentBill = {
      ...bill,
      id: `bill-${Date.now()}`,
    };
    setData((prev: any) => ({
      ...prev,
      bills: [newBill, ...(prev.bills || [])],
    }));
  };

  // Backup & Restore
  const backupData = (): string => {
    return JSON.stringify(data, null, 2);
  };

  const exportFullDatabaseJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIAKAD_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.schoolProfile && parsed.students && parsed.teachers) {
        setData(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid JSON for restore', e);
      return false;
    }
  };

  const importFullDatabaseJSON = (jsonStr: string): boolean => {
    return restoreData(jsonStr);
  };

  const resetDemoData = () => {
    const freshData = {
      schoolProfile: INITIAL_SCHOOL_PROFILE,
      gradeWeights: INITIAL_GRADE_WEIGHTS,
      academicYears: INITIAL_ACADEMIC_YEARS,
      classes: INITIAL_CLASSES,
      teachers: INITIAL_TEACHERS,
      subjects: INITIAL_SUBJECTS,
      parents: INITIAL_PARENTS,
      students: INITIAL_STUDENTS,
      schedules: INITIAL_SCHEDULES,
      studentAttendance: INITIAL_STUDENT_ATTENDANCE,
      teacherAttendance: INITIAL_TEACHER_ATTENDANCE,
      grades: INITIAL_STUDENT_GRADES,
      assignments: INITIAL_ASSIGNMENTS,
      submissions: INITIAL_SUBMISSIONS,
      exams: INITIAL_EXAMS,
      announcements: INITIAL_ANNOUNCEMENTS,
      notifications: INITIAL_NOTIFICATIONS,
      calendarEvents: INITIAL_CALENDAR_EVENTS,
      promotions: [],
      graduations: [],
      auditLogs: INITIAL_AUDIT_LOGS,
      bills: [
        {
          id: 'bill-01',
          studentId: 'std-01',
          studentName: 'Muhammad Farhan Santoso',
          className: 'X MIPA 1',
          title: 'SPP Bulan September 2026',
          type: 'SPP' as const,
          amount: 500000,
          dueDate: '2026-09-10',
          status: 'Lunas' as const,
          paymentMethod: 'Virtual Account' as const,
          paidAt: '2026-09-05 08:30',
          receiptNumber: 'KWT/2026/09/001',
          academicYear: '2026/2027',
        },
        {
          id: 'bill-02',
          studentId: 'std-02',
          studentName: 'Aisyah Putri Rahmadani',
          className: 'X MIPA 1',
          title: 'SPP Bulan September 2026',
          type: 'SPP' as const,
          amount: 500000,
          dueDate: '2026-09-10',
          status: 'Lunas' as const,
          paymentMethod: 'Transfer Bank' as const,
          paidAt: '2026-09-08 14:15',
          receiptNumber: 'KWT/2026/09/002',
          academicYear: '2026/2027',
        },
      ] as PaymentBill[],
    };
    setData(freshData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
  };

  const resetToDemoData = () => {
    resetDemoData();
  };

  return (
    <SiakadDataContext.Provider
      value={{
        schoolProfile: data.schoolProfile,
        updateSchoolProfile,
        gradeWeights: data.gradeWeights,
        updateGradeWeights,

        academicYears: data.academicYears,
        activeAcademicYear,
        setActiveAcademicYear,
        addAcademicYear,

        classes: data.classes,
        addClass,
        updateClass,
        deleteClass,

        subjects: data.subjects,
        addSubject,
        updateSubject,
        deleteSubject,

        teachers: data.teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,

        students: data.students,
        addStudent,
        updateStudent,
        deleteStudent,
        batchImportStudents,

        parents: data.parents,
        addParent,
        updateParent,
        deleteParent,

        schedules: data.schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        checkScheduleConflict,

        studentAttendance: data.studentAttendance,
        recordStudentAttendance,
        batchRecordStudentAttendance,

        teacherAttendance: data.teacherAttendance,
        recordTeacherAttendance,

        grades: data.grades,
        saveStudentGrade,
        calculateGradeScore,

        assignments: data.assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,

        submissions: data.submissions,
        submitAssignment,
        gradeSubmission,

        exams: data.exams,
        addExam,
        deleteExam,

        announcements: data.announcements,
        addAnnouncement,
        deleteAnnouncement,

        notifications: data.notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,

        calendarEvents: data.calendarEvents,
        addCalendarEvent,

        promotions: data.promotions,
        recordPromotion,

        graduations: data.graduations,
        recordGraduation,

        auditLogs: data.auditLogs,
        logAction,

        bills: data.bills || [],
        payBill,
        addBill,

        backupData,
        restoreData,
        resetDemoData,
        exportFullDatabaseJSON,
        importFullDatabaseJSON,
        resetToDemoData,
      }}
    >
      {children}
    </SiakadDataContext.Provider>
  );
};

export const useSiakadData = () => {
  const context = useContext(SiakadDataContext);
  if (!context) {
    throw new Error('useSiakadData must be used within a SiakadDataProvider');
  }
  return context;
};
