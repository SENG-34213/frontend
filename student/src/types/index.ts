export type StudentView =
  | "dashboard"
  | "my-courses"
  | "explore-courses"
  | "course-details"
  | "course-workspace"
  | "enrollments"
  | "materials"
  | "assignments"
  | "assignment-details"
  | "quizzes"
  | "quiz-taking"
  | "examinations"
  | "exam-taking"
  | "grades"
  | "calendar"
  | "messages"
  | "mentify-ai"
  | "notifications"
  | "profile"
  | "settings";

export interface StudentProfile {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatar: string;
  role: "STUDENT";
  institution: string;
  department: string;
  degreeProgram: string;
  semester: string;
  currentGpa: number;
  creditsCompleted: number;
  totalCreditsRequired: number;
  academicAdvisor: {
    name: string;
    email: string;
    office: string;
  };
  phone: string;
  bio: string;
  joinedDate: string;
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
  avatar: string;
  department: string;
  officeHours: string;
  email: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  durationMinutes: number;
  type: "video" | "reading" | "interactive" | "exercise";
  completed: boolean;
  videoUrl?: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  downloadableResources?: {
    name: string;
    size: string;
    format: string;
  }[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  instructor: Teacher;
  bannerColor: string;
  coverImage?: string;
  enrolled: boolean;
  enrollmentStatus: "ACTIVE" | "PENDING" | "COMPLETED" | "AVAILABLE";
  progressPercentage: number;
  lastAccessedLessonId?: string;
  lastAccessedLessonTitle?: string;
  credits: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  modules: CourseModule[];
  schedule: string;
  room: string;
  enrolledStudentsCount: number;
  rating: number;
  currentGrade?: string;
  currentScorePercentage?: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  status: "PENDING" | "SUBMITTED" | "GRADED" | "OVERDUE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  submittedDate?: string;
  grade?: number;
  letterGrade?: string;
  feedback?: string;
  rubricCriteria: {
    criteria: string;
    points: number;
    description: string;
  }[];
  attachments?: {
    name: string;
    size: string;
    url?: string;
  }[];
  submissionText?: string;
  submittedFiles?: {
    name: string;
    size: string;
    uploadedAt: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: "multiple-choice" | "multi-select" | "true-false";
  options: {
    id: string;
    text: string;
  }[];
  correctAnswerIds: string[];
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  description: string;
  durationMinutes: number;
  questionsCount: number;
  totalPoints: number;
  status: "AVAILABLE" | "UPCOMING" | "COMPLETED";
  dueDate: string;
  attemptsAllowed: number;
  attemptsUsed: number;
  lastScore?: number;
  lastScorePercentage?: number;
  questions: QuizQuestion[];
}

export interface Examination {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  type: "MIDTERM" | "FINAL" | "COMPREHENSIVE";
  scheduledDate: string;
  startTime: string;
  durationMinutes: number;
  location: string;
  proctorName: string;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
  totalMarks: number;
  weightPercentage: number;
  rules: string[];
  score?: number;
  scorePercentage?: number;
  letterGrade?: string;
  questions?: QuizQuestion[];
}

export interface LearningMaterial {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  description: string;
  type: "PDF" | "VIDEO" | "CODE" | "SLIDES" | "DOCUMENT";
  fileSize: string;
  uploadedDate: string;
  downloadsCount: number;
  previewUrl?: string;
  contentSnippet?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  courseCode?: string;
  courseTitle?: string;
  type: "CLASS" | "ASSIGNMENT_DUE" | "QUIZ" | "EXAM" | "OFFICE_HOURS";
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isSenderStudent: boolean;
  timestamp: string;
  text: string;
  attachments?: {
    name: string;
    size: string;
  }[];
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantTitle: string;
  participantAvatar: string;
  courseCode?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

export interface Announcement {
  id: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string;
  instructorAvatar: string;
  title: string;
  content: string;
  timestamp: string;
  priority: "NORMAL" | "URGENT";
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "DEADLINE" | "GRADE" | "ANNOUNCEMENT" | "EXAM" | "MATERIAL";
  read: boolean;
  actionView?: StudentView;
  targetId?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  codeBlock?: {
    language: string;
    code: string;
  };
}
