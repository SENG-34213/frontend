export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export type AccountStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "INACTIVE";

export interface BaseUser {
  id: string;
  /** Keycloak subject used by services when referencing a user. */
  keycloakUserId?: string;
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

export interface Grade {
  id: string;
  name: string;
  subjectDomains?: string[];
  description?: string;
  active: boolean;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  courseCount?: number;
  // Kept for UI compatibility. The current backend does not persist these fields.
  monthlyFee?: number;
  currencyCode?: string;
}

export interface CreateCourseRequest {
  courseName: string;
  courseDescription: string;
  courseThumbnail?: string;
  gradeId: string;
  assignedTeacherId: string;
  subject: string;
  isOnline?: boolean;
  isVisible?: boolean;
  isPublished?: boolean;
  published?: boolean;
  courseEnrollmentId?: string | null;
  courseFeeMonthly?: number;
}

export interface CreateGradeRequest {
  name: string;
  subjectDomains?: string[];
  description?: string;
  monthlyFee?: number;
  currencyCode?: string;
}

export interface UpdateGradeRequest extends CreateGradeRequest {
  active?: boolean;
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
  status: "ACTIVE" | "ARCHIVED" | "UPCOMING" | "PUBLISHED" | "DRAFT";
  description: string;
  modulesCount: number;
  category: string;
  startDate: string;
  endDate: string;
  courseName?: string;
  courseDescription?: string;
  courseThumbnail?: string;
  gradeId?: string;
  assignedTeacherId?: string;
  subject?: string;
  isOnline?: boolean;
  online?: boolean;
  isVisible?: boolean;
  visible?: boolean;
  isPublished?: boolean;
  courseEnrollmentId?: string | null;
  studentCount?: number;
  numberOfStudents?: number;
  publishedDate?: string | null;
  courseStatus?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  gradeMonthlyFee?: number;
  gradeCurrencyCode?: string;
  gradeName?: string;
  teacherCode?: string;
  courseFeeMonthly?: number;
  createdAt?: string;
  updatedAt?: string;
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
  enrollmentId?: string;
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
  courseTitle?: string;
  instructorName?: string;
  instructorEmail?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  description?: string;
  eventType?: string;
  startDateTime?: string;
  endDateTime?: string | null;
  allDay?: boolean;
  courseId?: string | null;
  visibility?: EventVisibility;
  targetRole?: "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN" | null;
  canEdit?: boolean;
  canCancel?: boolean;
}

export type EventVisibility =
  | "PRIVATE"
  | "COURSE"
  | "ROLE"
  | "GLOBAL"
  | "PUBLIC_STUDENTS"
  | "FACULTY_ONLY"
  | "ADMIN_RESTRICTED";

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
