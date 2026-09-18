// SIAKAD SEKOLAH — Core TypeScript Definitions

export type UserRole = 'superadmin' | 'admin' | 'guru' | 'siswa' | 'orangtua' | 'kepsek';

export type StudentStatus = 'Aktif' | 'Lulus' | 'Pindah' | 'Tidak Aktif';
export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Dispensasi';
export type Gender = 'L' | 'P';
export type SemesterType = 'Ganjil' | 'Genap';
export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
export type ExamType = 'Ulangan Harian' | 'UTS' | 'UAS' | 'Ujian Praktik' | 'Ujian Akhir';
export type AnnouncementTarget = 'Semua' | 'Guru' | 'Siswa' | 'Orang Tua' | 'Kelas Tertentu' | 'ALL' | 'GURU' | 'SISWA' | 'ORANG_TUA';

export type ModuleType =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'parents'
  | 'classes'
  | 'subjects'
  | 'academic_year'
  | 'schedules'
  | 'attendance'
  | 'grades'
  | 'assignments'
  | 'exams'
  | 'report_cards'
  | 'promotions_graduations'
  | 'announcements'
  | 'finance'
  | 'finances'
  | 'calendar'
  | 'reports'
  | 'user_management'
  | 'audit_logs'
  | 'settings'
  | 'profile'
  | 'integration_docs';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  linkedId?: string; // studentId for siswa/orangtua, teacherId for guru
  linkedStudentIds?: string[]; // for orangtua who have multiple children
  createdAt: string;
  updatedAt: string;
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  subtitle: string;
  logo: string;
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  principalName: string;
  principalNip: string;
  accreditation: string;
  themeColor: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  nickname?: string;
  gender: Gender;
  birthPlace: string;
  birthDate: string;
  religion: string;
  nik?: string;
  address: string;
  phone: string;
  email: string;
  photo?: string;
  classId: string;
  className: string;
  enrollmentYear: string;
  status: StudentStatus;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  nip: string;
  nuptk?: string;
  name: string;
  gender: Gender;
  birthPlace?: string;
  birthDate?: string;
  education?: string;
  subjectId?: string;
  subjectName: string;
  phone: string;
  email: string;
  address?: string;
  photo?: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif' | 'Pensiun';
  employmentType?: 'PNS' | 'PPPK' | 'Guru Tetap' | 'Honorer';
  isHomeroom?: boolean;
  homeroomClassId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Parent {
  id: string;
  name?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  phone: string;
  email: string;
  address: string;
  occupation?: string;
  relationship?: 'Ayah' | 'Ibu' | 'Wali';
  studentIds: string[];
  studentNames?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "X MIPA 1"
  gradeLevel: 'X' | 'XI' | 'XII' | '10' | '11' | '12';
  major: 'MIPA' | 'IPS' | 'Umum' | 'Bahasa' | string;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
  waliKelasId?: string;
  waliKelasName?: string;
  academicYear: string;
  roomName?: string;
  capacity: number;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  group?: 'Kelompok A (Wajib)' | 'Kelompok B (Umum)' | 'Kelompok C (Peminatan)' | string;
  category?: string;
  gradeLevel?: '10' | '11' | '12' | 'Semua';
  hoursPerWeek: number;
  teacherId: string;
  teacherName: string;
  kkm: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentBill {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  title: string;
  type: 'SPP' | 'Uang Gedung' | 'Daftar Ulang' | 'Seragam' | 'Kegiatan';
  amount: number;
  dueDate: string;
  status: 'Lunas' | 'Belum Lunas' | 'Cicilan';
  paymentMethod?: 'Tunai' | 'Transfer Bank' | 'Virtual Account';
  paidAt?: string;
  receiptNumber?: string;
  academicYear: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026/2027"
  semester: SemesterType;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface Schedule {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  startTime: string; // "07:30"
  endTime: string;   // "09:00"
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  room: string;
  academicYear: string;
  semester: SemesterType;
}

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  academicYear?: string;
  semester?: SemesterType;
  recordedBy?: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Dinas Luar';
  note?: string;
  location?: string;
}

export interface GradeWeights {
  tugas: number;    // e.g. 20
  ulangan: number;  // e.g. 20
  uts: number;      // e.g. 25
  uas: number;      // e.g. 35
  praktik?: number;
}

export interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  academicYear: string;
  semester: SemesterType;
  tugas: number;
  ulangan: number;
  uts: number;
  uas: number;
  praktik: number;
  finalScore: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  attitude?: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  description?: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  description: string;
  startDate: string;
  dueDate: string;
  attachmentName?: string;
  status: 'Aktif' | 'Selesai';
  submissionsCount?: number;
  maxScore?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  attachmentName?: string;
  fileUrl?: string;
  score?: number;
  feedback?: string;
  notes?: string;
  status: 'Diserahkan' | 'Dinilai' | 'Terlambat';
}

export interface Exam {
  id: string;
  title: string;
  type: ExamType;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  supervisorName: string;
  durationMinutes: number;
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  nisn: string;
  classId: string;
  className: string;
  academicYear: string;
  semester: SemesterType;
  homeroomNotes: string;
  promotionDecision?: 'Naik ke Kelas Berikutnya' | 'Tinggal di Kelas' | 'Lulus' | 'Belum Lulus';
  extracurriculars: { name: string; score: string; note: string }[];
  attendanceRecap: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
  };
  generatedDate: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Akademik' | 'Kegiatan' | 'Ujian' | 'Umum';
  target: AnnouncementTarget;
  targetClassId?: string;
  authorName: string;
  publishedDate: string;
  date?: string;
  isImportant?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  category: 'tugas' | 'nilai' | 'pengumuman' | 'jadwal' | 'presensi' | 'raport' | 'sistem';
  read: boolean;
  targetRole?: UserRole | 'all';
  targetUserId?: string;
  linkAction?: string;
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'semester' | 'ujian' | 'libur' | 'kegiatan' | 'raport';
  description: string;
  color?: string;
}

export interface PromotionRecord {
  id: string;
  studentId: string;
  studentName: string;
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
  decision: 'Naik Kelas' | 'Tinggal Kelas';
  academicYear: string;
  notes: string;
  processedDate: string;
}

export interface GraduationRecord {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  graduationYear: string;
  certificateNumber: string; // Nomor Ijazah
  graduationDate: string;
  notes: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemPermission {
  id: string;
  code: string;
  name: string;
  module: string;
  roles: UserRole[];
}
