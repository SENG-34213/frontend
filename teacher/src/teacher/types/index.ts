export type NavigationTab =
  | 'dashboard'
  | 'calendar'
  | 'notifications'
  | 'courses'
  | 'curriculum'
  | 'students'
  | 'enrollments'
  | 'attendance'
  | 'materials'
  | 'assignments'
  | 'grading-workspace'
  | 'quizzes'
  | 'exams'
  | 'grades'
  | 'analytics'
  | 'messages'
  | 'ai-assistant'
  | 'profile'
  | 'settings';

export interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  teacherCode: string;
  department: string;
  email: string;
  phone: string;
  officeLocation: string;
  officeHours: string;
  avatarUrl: string;
  bio: string;
  specializations: string[];
  totalCoursesTaught: number;
  totalStudentsMentored: number;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  level: 'Undergraduate' | 'Graduate' | 'Foundational';
  semester: string;
  academicYear: string;
  enrolledCount: number;
  maxCapacity: number;
  status: 'Active' | 'Draft' | 'Archived';
  coverTheme: 'indigo' | 'emerald' | 'violet' | 'amber';
  modulesCount: number;
  assignmentsCount: number;
  nextSession?: string;
  nextSessionTime?: string;
  averageGrade: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number;
  order: number;
  status: 'Published' | 'Draft';
  contentType: 'Lecture' | 'Lab' | 'Reading' | 'Discussion';
  contentMarkdown?: string;
  resourcesCount: number;
  attachedMaterials?: string[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  status: 'Published' | 'Draft';
  lessons: Lesson[];
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatarBg: string;
  initials: string;
  enrolledCourseIds: string[];
  attendanceRate: number;
  gpa: number;
  status: 'Active' | 'At Risk' | 'Excelling';
  lastActive: string;
  submissionsPending: number;
  recentGradeAvg: number;
}

export interface EnrollmentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  academicTerm: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  maxMarks: number;
  weightagePercent: number;
  status: 'Active' | 'Grading' | 'Closed' | 'Draft';
  totalSubmissions: number;
  gradedCount: number;
  totalStudents: number;
  rubricItems: { criterion: string; marks: number }[];
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submissionDate: string;
  status: 'Submitted' | 'Late' | 'Graded' | 'Pending';
  score?: number;
  maxMarks: number;
  feedback?: string;
  submittedContentText?: string;
  submittedFileName?: string;
  fileSizeBytes?: number;
  codeSnippet?: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: 'multiple-choice' | 'multi-select' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  marks: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  status: 'Active' | 'Draft' | 'Completed';
  dueDate: string;
  attemptsCount: number;
  totalEligible: number;
  averageScorePercent: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxMarks: number;
  submittedAt: string;
  timeSpentMinutes: number;
  status: 'Completed' | 'In Progress';
}

export interface Examination {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  examType: 'Midterm' | 'Final' | 'Practical Exam';
  scheduledDate: string;
  startTime: string;
  durationMinutes: number;
  roomOrPlatform: string;
  totalMarks: number;
  weightagePercent: number;
  status: 'Scheduled' | 'Grading' | 'Published' | 'Completed';
  enrolledStudents: number;
  gradedStudents: number;
  averageScore?: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  timestamp?: string;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  sessionTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  totalEnrolled: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  status: 'Open' | 'Completed' | 'Upcoming';
  records: AttendanceRecord[];
}

export interface LearningMaterial {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  description: string;
  fileType: 'PDF' | 'ZIP' | 'DOCX' | 'VIDEO' | 'SLIDES';
  fileSize: string;
  uploadDate: string;
  s3Key: string;
  downloadsCount: number;
  visibility: 'Published' | 'Draft' | 'Scheduled';
  moduleAssociation?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Class' | 'Assignment' | 'Quiz' | 'Exam' | 'Office Hours';
  courseCode?: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
  description?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student' | 'system';
  content: string;
  timestamp: string;
  attachments?: { name: string; size: string }[];
}

export interface ConversationThread {
  id: string;
  participantName: string;
  participantRole: string;
  courseCode?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isGroup: boolean;
  avatarBg: string;
  initials: string;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'submission' | 'exam' | 'enrollment' | 'message' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: NavigationTab;
}

export interface GradebookRow {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  courseId: string;
  assignmentScores: { [assignmentId: string]: number | null };
  quizScores: { [quizId: string]: number | null };
  examScores: { [examId: string]: number | null };
  overallPercent: number;
  letterGrade: string;
}
