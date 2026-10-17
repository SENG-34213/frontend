export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export type AccountStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "INACTIVE";

export interface BaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface StudentProfile extends BaseUser {
  role: "STUDENT";
  studentId: string; // Auto-generated e.g. STU-2026-0842
  grade: string;
  schoolName?: string;
  guardianName: string;
  guardianPhone: string;
  attendanceMode: "IN_PERSON" | "ONLINE" | "HYBRID";
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
  dob: string;
  enrolledCourseCount: number;
  averageGrade: string;
}

export interface TeacherProfile extends BaseUser {
  role: "TEACHER";
  teacherCode: string; // Auto-generated e.g. TCH-9104
  specializations: string[];
  hireDate: string;
  dob: string;
  nic: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
  assignedCourseCount: number;
  activeStudentsCount: number;
}

export interface AdministratorProfile extends BaseUser {
  role: "ADMIN" | "SUPER_ADMIN";
  adminCode: string; // Auto-generated e.g. ADM-1049
  dob: string;
  nic: string;
  addressLine1: string;
  city: string;
  district: string;
  postalCode: string;
  department: string;
  permissions: string[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  teacherId: string;
  teacherName: string;
  grade: string;
  enrollmentCount: number;
  maxCapacity: number;
  status: "ACTIVE" | "ARCHIVED" | "UPCOMING";
  description: string;
  modulesCount: number;
  category: string;
  startDate: string;
  endDate: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  enrolledDate: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING_APPROVAL" | "DROPPED";
  grade?: string;
  progressPercentage: number;
}

export interface CurriculumModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: {
    id: string;
    title: string;
    durationMinutes: number;
    hasQuiz: boolean;
    materialCount: number;
    status: "PUBLISHED" | "DRAFT";
  }[];
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  title: string;
  dueDate: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  maxPoints: number;
  status: "PUBLISHED" | "DRAFT" | "CLOSED";
}

export interface Quiz {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  title: string;
  questionCount: number;
  durationMinutes: number;
  attemptsCount: number;
  averageScore: number;
  passingRate: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
}

export interface Examination {
  id: string;
  code: string;
  title: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  examDate: string;
  startTime: string;
  endTime: string;
  hallOrPlatform: string;
  candidateCount: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "RESULTS_PUBLISHED";
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  assessmentType: "ASSIGNMENT" | "QUIZ" | "MIDTERM" | "FINAL_EXAM";
  assessmentTitle: string;
  score: number;
  maxScore: number;
  letterGrade: string;
  feedback?: string;
  gradedDate: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  timeSlot: string;
  mode: "IN_PERSON" | "ONLINE" | "HYBRID";
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  markedBy: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  courseId: string;
  courseCode: string;
  fileType: "PDF" | "VIDEO" | "SLIDES" | "DOCUMENT" | "AUDIO";
  s3Key: string;
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  status: "READY" | "PROCESSING" | "RESTRICTED";
}

export interface AcademicEvent {
  id: string;
  title: string;
  type: "CLASS" | "EXAM" | "QUIZ" | "DEADLINE" | "SESSION";
  date: string;
  time: string;
  location: string;
  courseCode?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "REGISTRATION" | "ACADEMIC" | "SECURITY" | "SYSTEM";
  timestamp: string;
  read: boolean;
  linkAction?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  category:
    | "KEYCLOAK_AUTH"
    | "USER_REGISTRATION"
    | "MATERIAL_SERVICE"
    | "AI_SERVICE"
    | "COURSE_MANAGEMENT";
  action: string;
  details: string;
  ipAddress: string;
  payloadJson?: string;
}

export interface PlatformKPIs {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  activeEnrollments: number;
  pendingInvitations: number;
  activeUsers: number;
  upcomingExams: number;
  pendingAdminActions: number;
}
