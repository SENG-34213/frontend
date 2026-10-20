import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  StudentView,
  StudentProfile,
  Course,
  Assignment,
  Quiz,
  Examination,
  LearningMaterial,
  CalendarEvent,
  Conversation,
  Announcement,
  NotificationItem,
  ChatMessage,
} from "../types";
import type { StudentUserSummary } from "../auth/authTypes";
import {
  createAssignmentSubmission,
  enrollStudent,
  finalizeAssignmentSubmission,
  loadEnrollmentState,
  loadStudentWorkspace,
  listCalendarEvents,
  markAllNotificationsRead as markAllNotificationsReadApi,
  markLesson,
  markNotificationRead,
  saveQuizAnswer as saveQuizAnswerApi,
  sendAiMessage,
  startCoursePayment,
  startQuizAttempt as startQuizAttemptApi,
  finalizeQuizAttempt,
  getMaterialDownload,
  toProfile,
  uploadSubmissionFile,
} from "../api/student";

interface StudentContextType {
  currentView: StudentView;
  setCurrentView: (view: StudentView) => void;
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  courses: Course[];
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  selectedLessonId: string;
  setSelectedLessonId: (id: string) => void;
  selectedAssignmentId: string;
  setSelectedAssignmentId: (id: string) => void;
  selectedQuizId: string;
  setSelectedQuizId: (id: string) => void;
  selectedExamId: string;
  setSelectedExamId: (id: string) => void;
  enrollInCourse: (courseId: string) => void;
  markLessonComplete: (courseId: string, lessonId: string, complete?: boolean) => void;
  assignments: Assignment[];
  submitAssignment: (
    assignmentId: string,
    submissionText: string,
    files: { name: string; size: string; uploadedAt: string; file?: File }[],
  ) => void;
  quizzes: Quiz[];
  startQuizAttempt: (quizId: string) => Promise<{ attemptId: string; startedAt?: string }>;
  saveQuizAnswer: (
    attemptId: string,
    questionId: string,
    selectedOptionId: string,
  ) => Promise<void>;
  submitQuizAnswers: (
    quizId: string,
    attemptId: string,
  ) => Promise<{ score: number; maxScore: number; percentage: number; passed: boolean }>;
  examinations: Examination[];
  submitExam: (examId: string, answers: Record<string, string[]>) => void;
  materials: LearningMaterial[];
  calendarEvents: CalendarEvent[];
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;
  announcements: Announcement[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  aiChats: ChatMessage[];
  isAiLoading: boolean;
  sendAiQuery: (query: string) => Promise<void>;
  refreshCalendarEvents: (start: string, end: string) => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  selectedMaterialForPreview: LearningMaterial | null;
  setSelectedMaterialForPreview: (material: LearningMaterial | null) => void;
  downloadMaterial: (materialId: string) => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  navigateToCourseWorkspace: (courseId: string, lessonId?: string) => void;
  navigateToCourseDetails: (courseId: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{
  children: React.ReactNode;
  authUser?: StudentUserSummary;
}> = ({ children, authUser }) => {
  const [currentView, setCurrentView] = useState<StudentView>("dashboard");
  const [profile, setProfile] = useState<StudentProfile>(() =>
    authUser ? toProfile(authUser) : ({} as StudentProfile),
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [conversations] = useState<Conversation[]>([]);
  const [announcements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [aiChats, setAiChats] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedMaterialForPreview, setSelectedMaterialForPreview] =
    useState<LearningMaterial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(
      () => setToastMessage((current) => (current === message ? null : current)),
      4000,
    );
  };
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  useEffect(() => {
    if (!authUser) return;
    let active = true;
    loadStudentWorkspace(authUser)
      .then((workspace) => {
        if (!active) return;
        setProfile(workspace.profile);
        setCourses(workspace.courses);
        setAssignments(workspace.assignments);
        setQuizzes(workspace.quizzes);
        setExaminations(workspace.examinations);
        setMaterials(workspace.materials);
        setCalendarEvents(workspace.calendarEvents);
        setNotifications(workspace.notifications);
      })
      .catch((error) => {
        if (active)
          showToast(error instanceof Error ? error.message : "Could not load student data.");
      });
    return () => {
      active = false;
    };
  }, [authUser]);
  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((current) => ({ ...current, ...updates }));
    showToast("Profile changes are local until the profile update API is enabled.");
  };
  const enrollInCourse = async (courseId: string) => {
    try {
      await enrollStudent(courseId, profile.id);
      const records = await loadEnrollmentState(profile.id);
      const record = records.find((item) => item.courseIds.includes(courseId));
      const status =
        record?.status === "PAYMENT_REQUIRED"
          ? "PAYMENT_REQUIRED"
          : record?.status === "REJECTED"
            ? "REJECTED"
            : record?.status === "PENDING"
              ? "PENDING"
              : "ACTIVE";
      if (status === "PAYMENT_REQUIRED") await startCoursePayment(courseId);
      setCourses((current) =>
        current.map((course) =>
          course.id === courseId
            ? { ...course, enrolled: status !== "REJECTED", enrollmentStatus: status }
            : course,
        ),
      );
      showToast(
        status === "PAYMENT_REQUIRED"
          ? "Payment is required to complete enrollment."
          : status === "PENDING"
            ? "Enrollment request is pending approval."
            : status === "REJECTED"
              ? "Enrollment was rejected."
              : "Successfully enrolled in course!",
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Enrollment failed.");
    }
  };
  const markLessonComplete = async (courseId: string, lessonId: string, complete = true) => {
    try {
      await markLesson(courseId, lessonId, complete);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update lesson progress.");
      return;
    }
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) return course;
        let total = 0;
        let done = 0;
        const modules = course.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => {
            const completed = lesson.id === lessonId ? complete : lesson.completed;
            total += 1;
            if (completed) done += 1;
            return lesson.id === lessonId ? { ...lesson, completed } : lesson;
          }),
        }));
        return {
          ...course,
          modules,
          progressPercentage: total ? Math.round((done / total) * 100) : course.progressPercentage,
          lastAccessedLessonId: lessonId,
        };
      }),
    );
    showToast(complete ? "Lesson marked as complete!" : "Lesson status updated.");
  };
  const submitAssignment = async (
    assignmentId: string,
    submissionText: string,
    files: { name: string; size: string; uploadedAt: string; file?: File }[],
  ) => {
    try {
      const response = await createAssignmentSubmission(assignmentId, submissionText);
      const submission = response.data || {};
      const submissionId = String(submission.id || "");
      if (!submissionId) throw new Error("The backend did not return a submission id.");
      for (const item of files) if (item.file) await uploadSubmissionFile(submissionId, item.file);
      await finalizeAssignmentSubmission(submissionId);
      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id === assignmentId
            ? {
                ...assignment,
                status: "SUBMITTED",
                submissionText,
                submittedFiles: files,
                submittedDate: new Date().toISOString(),
              }
            : assignment,
        ),
      );
      showToast("Assignment submitted successfully.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Assignment submission failed.");
    }
  };
  const startQuizAttempt = async (quizId: string) => {
    const storageKey = `student:quiz-attempt:${profile.id}:${quizId}`;
    const storedAttempt = window.localStorage.getItem(storageKey);
    if (storedAttempt) {
      try {
        const parsed = JSON.parse(storedAttempt);
        if (parsed && typeof parsed === "object" && parsed.attemptId) {
          return parsed as { attemptId: string; startedAt?: string };
        }
        window.localStorage.removeItem(storageKey);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    const response = await startQuizAttemptApi(quizId);
    const attemptId = String(response.data?.attemptId || "");
    if (!attemptId) throw new Error("The backend did not return a quiz attempt id.");
    const attempt = { attemptId, startedAt: response.data?.startedAt };
    window.localStorage.setItem(storageKey, JSON.stringify(attempt));
    setQuizzes((current) =>
      current.map((item) => (item.id === quizId ? { ...item, status: "IN_PROGRESS" } : item)),
    );
    return attempt;
  };
  const saveQuizAnswer = async (
    attemptId: string,
    questionId: string,
    selectedOptionId: string,
  ) => {
    await saveQuizAnswerApi(attemptId, questionId, selectedOptionId);
  };
  const submitQuizAnswers = async (quizId: string, attemptId: string) => {
    const response = await finalizeQuizAttempt(attemptId);
    const result = response.data || {};
    const score = Number(result.score);
    const maxScore = Number(result.totalMarks);
    const percentage = Number(result.percentage);
    const storageKey = `student:quiz-attempt:${profile.id}:${quizId}`;
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(`student:quiz-answers:${attemptId}`);
    setQuizzes((current) =>
      current.map((item) =>
        item.id === quizId
          ? { ...item, status: "COMPLETED", lastScore: score, lastScorePercentage: percentage }
          : item,
      ),
    );
    showToast(`Quiz completed: ${score}/${maxScore} (${percentage}%).`);
    return { score, maxScore, percentage, passed: Boolean(result.passed) };
  };
  const refreshCalendarEvents = useCallback(
    async (start: string, end: string) => {
      const events = await listCalendarEvents(start, end);
      setCalendarEvents(
        events.map((event) => {
          const course = courses.find((item) => item.id === event.courseId);
          return { ...event, courseCode: course?.code || "", courseTitle: course?.title || "" };
        }),
      );
    },
    [courses],
  );
  const downloadMaterial = async (materialId: string) => {
    const response = await getMaterialDownload(materialId);
    const url = String(response.data?.downloadUrl || "");
    if (!url) throw new Error("The backend did not return a material download URL.");
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const submitExam = (examId: string) => {
    showToast(`Exam ${examId} submission is not supported by the current backend contract.`);
  };
  const sendMessage = () => {
    showToast("Messaging is not available until a student communication contract is connected.");
  };
  const markNotificationAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
    } catch {
      showToast("Could not mark notification as read.");
    }
  };
  const markAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch {
      showToast("Could not mark notifications as read.");
    }
  };
  const sendAiQuery = async (query: string) => {
    if (!query.trim()) return;
    setAiChats((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: query,
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsAiLoading(true);
    try {
      const response = await sendAiMessage(query);
      const data = response.data || {};
      setAiChats((current) => [
        ...current,
        {
          id: String(data.messageId || Date.now()),
          sender: "assistant",
          text: String(data.message || ""),
          timestamp: String(data.timestamp || new Date().toISOString()),
        },
      ]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "AI assistant is unavailable.");
    } finally {
      setIsAiLoading(false);
    }
  };
  const navigateToCourseWorkspace = (courseId: string, lessonId?: string) => {
    const course = courses.find((item) => item.id === courseId);
    setSelectedCourseId(courseId);
    setSelectedLessonId(
      lessonId || course?.lastAccessedLessonId || course?.modules[0]?.lessons[0]?.id || "",
    );
    setCurrentView("course-workspace");
  };
  const navigateToCourseDetails = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView("course-details");
  };
  return (
    <StudentContext.Provider
      value={{
        currentView,
        setCurrentView,
        profile,
        updateProfile,
        courses,
        selectedCourseId,
        setSelectedCourseId,
        selectedLessonId,
        setSelectedLessonId,
        selectedAssignmentId,
        setSelectedAssignmentId,
        selectedQuizId,
        setSelectedQuizId,
        selectedExamId,
        setSelectedExamId,
        enrollInCourse,
        markLessonComplete,
        assignments,
        submitAssignment,
        quizzes,
        startQuizAttempt,
        saveQuizAnswer,
        submitQuizAnswers,
        examinations,
        submitExam,
        materials,
        calendarEvents,
        refreshCalendarEvents,
        conversations,
        sendMessage,
        announcements,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        aiChats,
        isAiLoading,
        sendAiQuery,
        theme,
        toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar: () => setIsSidebarCollapsed((current) => !current),
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        selectedMaterialForPreview,
        setSelectedMaterialForPreview,
        downloadMaterial,
        toastMessage,
        showToast,
        navigateToCourseWorkspace,
        navigateToCourseDetails,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};
export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) throw new Error("useStudent must be used within a StudentProvider");
  return context;
};
