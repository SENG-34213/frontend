import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  StudentView,
  StudentProfile,
  Course,
  Assignment,
  AttendanceSummary,
  Quiz,
  QuizAnswerReview,
  Examination,
  LearningMaterial,
  CalendarEvent,
  Conversation,
  Announcement,
  NotificationItem,
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
  deleteNotification as deleteNotificationApi,
  getUnreadNotificationCount,
  listCommunicationMessages,
  saveQuizAnswer as saveQuizAnswerApi,
  sendCommunicationMessage,
  toCommunicationMessage,
  startCoursePayment,
  startQuizAttempt as startQuizAttemptApi,
  finalizeQuizAttempt,
  getMaterialDownload,
  toProfile,
  uploadSubmissionFile,
  updateCurrentStudentProfile,
} from "../api/student";
import { useStudentCommunicationRealtime } from "../api/communicationRealtime";

interface StudentContextType {
  currentView: StudentView;
  setCurrentView: (view: StudentView) => void;
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
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
  ) => Promise<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    answers: QuizAnswerReview[];
  }>;
  examinations: Examination[];
  submitExam: (examId: string, answers: Record<string, string[]>) => void;
  materials: LearningMaterial[];
  calendarEvents: CalendarEvent[];
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  announcements: Announcement[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => Promise<void>;
  attendanceSummaries: AttendanceSummary[];
  attendanceOverall: AttendanceSummary | null;
  refreshCalendarEvents: (
    start: string,
    end: string,
    filters?: { type?: string; courseId?: string },
  ) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  workspaceLoading: boolean;
  workspaceError: string | null;
  retryWorkspace: () => Promise<void>;
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
  clearToast: () => void;
  navigateToCourseWorkspace: (courseId: string, lessonId?: string) => void;
  navigateToCourseDetails: (courseId: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const STUDENT_VIEWS: StudentView[] = [
  "dashboard",
  "my-courses",
  "explore-courses",
  "course-details",
  "course-workspace",
  "enrollments",
  "materials",
  "assignments",
  "assignment-details",
  "quizzes",
  "quiz-taking",
  "examinations",
  "exam-taking",
  "grades",
  "calendar",
  "messages",
  "notifications",
  "profile",
  "settings",
];

function getSavedView(userId?: string): StudentView {
  if (typeof window === "undefined" || !userId) return "dashboard";
  const savedView = window.localStorage.getItem(`student-current-view:${userId}`);
  return savedView && STUDENT_VIEWS.includes(savedView as StudentView)
    ? (savedView as StudentView)
    : "dashboard";
}

function getSavedValue(userId: string | undefined, name: string): string {
  if (typeof window === "undefined" || !userId) return "";
  return window.localStorage.getItem(`student-${name}:${userId}`) || "";
}

export const StudentProvider: React.FC<{
  children: React.ReactNode;
  authUser?: StudentUserSummary;
}> = ({ children, authUser }) => {
  const [currentView, setCurrentView] = useState<StudentView>(() => getSavedView(authUser?.id));
  const [profile, setProfile] = useState<StudentProfile>(() =>
    authUser ? toProfile(authUser) : ({} as StudentProfile),
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(() =>
    getSavedValue(authUser?.id, "course"),
  );
  const [selectedLessonId, setSelectedLessonId] = useState(() =>
    getSavedValue(authUser?.id, "lesson"),
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(() =>
    getSavedValue(authUser?.id, "assignment"),
  );
  const [selectedQuizId, setSelectedQuizId] = useState(() => getSavedValue(authUser?.id, "quiz"));
  const [selectedExamId, setSelectedExamId] = useState(() => getSavedValue(authUser?.id, "exam"));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagePages, setMessagePages] = useState<Record<string, number>>({});
  const announcements: Announcement[] = [];
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [attendanceSummaries, setAttendanceSummaries] = useState<AttendanceSummary[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem("student-theme") === "dark" ? "dark" : "light";
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedMaterialForPreview, setSelectedMaterialForPreview] =
    useState<LearningMaterial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(
      () => setToastMessage((current) => (current === message ? null : current)),
      4000,
    );
  };
  const clearToast = () => setToastMessage(null);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    window.localStorage.setItem("student-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (!authUser?.id) return;
    window.localStorage.setItem(`student-current-view:${authUser.id}`, currentView);
  }, [authUser?.id, currentView]);
  useEffect(() => {
    if (!authUser?.id) return;
    window.localStorage.setItem(`student-course:${authUser.id}`, selectedCourseId);
    window.localStorage.setItem(`student-lesson:${authUser.id}`, selectedLessonId);
    window.localStorage.setItem(`student-assignment:${authUser.id}`, selectedAssignmentId);
    window.localStorage.setItem(`student-quiz:${authUser.id}`, selectedQuizId);
    window.localStorage.setItem(`student-exam:${authUser.id}`, selectedExamId);
  }, [
    authUser?.id,
    selectedAssignmentId,
    selectedCourseId,
    selectedExamId,
    selectedLessonId,
    selectedQuizId,
  ]);
  const refreshWorkspace = useCallback(async () => {
    if (!authUser) return;
    setWorkspaceLoading(true);
    setWorkspaceError(null);
    try {
      const workspace = await loadStudentWorkspace(authUser);
      setProfile(workspace.profile);
      setCourses(workspace.courses);
      setAssignments(workspace.assignments);
      setQuizzes(workspace.quizzes);
      setExaminations(workspace.examinations);
      setMaterials(workspace.materials);
      setCalendarEvents(workspace.calendarEvents);
      setNotifications(workspace.notifications);
      setUnreadNotificationCount(workspace.unreadNotificationCount);
      setAttendanceSummaries(workspace.attendanceSummaries);
      setConversations(workspace.conversations);
      setMessagePages({});
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "Could not load student data.");
      throw error;
    } finally {
      setWorkspaceLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => refreshWorkspace())
      .catch((error) => {
        if (active)
          showToast(error instanceof Error ? error.message : "Could not load student data.");
      });
    return () => {
      active = false;
    };
  }, [refreshWorkspace]);

  // Keep the workspace current while the student portal is open. This covers
  // content created by teachers/admins in another application tab or session.
  // The visibility/focus refresh makes returning to the tab feel immediate,
  // while polling handles changes made while the tab remains open.
  useEffect(() => {
    if (!authUser?.id) return;

    let disposed = false;
    let refreshInFlight = false;

    const syncWorkspace = async () => {
      if (disposed || refreshInFlight || document.visibilityState !== "visible") return;
      refreshInFlight = true;
      try {
        await refreshWorkspace();
      } catch {
        // The initial load reports errors to the student. Background sync is
        // intentionally silent and retries on the next cycle/focus event.
      } finally {
        refreshInFlight = false;
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") void syncWorkspace();
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);
    const intervalId = window.setInterval(() => void syncWorkspace(), 15_000);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [authUser?.id, refreshWorkspace]);

  useStudentCommunicationRealtime(
    conversations.map((conversation) => conversation.id),
    (incoming) => {
      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.id !== incoming.groupId) return conversation;
          const knownSender = conversation.messages.find(
            (item) => item.senderId === incoming.senderId,
          )?.senderName;
          const senderName =
            incoming.senderId === profile.id
              ? profile.name
              : knownSender || conversation.participantName || "Course instructor";
          const message = toCommunicationMessage(
            incoming,
            profile.id,
            new Map([[incoming.senderId, senderName]]),
          );
          if (conversation.messages.some((item) => item.id === message.id)) return conversation;
          return {
            ...conversation,
            lastMessage: message.text,
            lastMessageTime: message.timestamp,
            messages: [...conversation.messages, message],
          };
        }),
      );
    },
  );
  const updateProfile = async (updates: Partial<StudentProfile>) => {
    try {
      const [firstName, ...lastNameParts] = updates.name?.trim().split(/\s+/) || [];
      await updateCurrentStudentProfile({
        firstName,
        lastName: lastNameParts.join(" ") || undefined,
        phoneNumber: updates.phone || undefined,
        bio: updates.bio || undefined,
        avatarUrl: updates.avatar || undefined,
      });
      await refreshWorkspace();
      showToast("Profile updated successfully.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Profile update failed.");
    }
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
      await refreshWorkspace();
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
      await refreshWorkspace();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update lesson progress.");
      return;
    }
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
      await refreshWorkspace();
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
    await refreshWorkspace();
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
    const answers = Array.isArray(result.answers)
      ? result.answers.map((answer: Record<string, unknown>) => ({
          questionId: String(answer.questionId ?? ""),
          questionText: String(answer.questionText ?? ""),
          explanation: answer.explanation ? String(answer.explanation) : undefined,
          selectedOptionId: answer.selectedOptionId ? String(answer.selectedOptionId) : undefined,
          selectedAnswer: answer.selectedAnswer ? String(answer.selectedAnswer) : undefined,
          correctOptionId: answer.correctOptionId ? String(answer.correctOptionId) : undefined,
          correctAnswer: answer.correctAnswer ? String(answer.correctAnswer) : undefined,
          correct: Boolean(answer.correct),
          awardedMarks: Number(answer.awardedMarks ?? 0),
          questionMarks: Number(answer.questionMarks ?? 0),
        }))
      : [];
    const completedResult = {
      score,
      maxScore,
      percentage,
      passed: Boolean(result.passed),
      answers,
    };
    const storageKey = `student:quiz-attempt:${profile.id}:${quizId}`;
    window.localStorage.setItem(
      `student:quiz-result:${profile.id}:${quizId}`,
      JSON.stringify(completedResult),
    );
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(`student:quiz-answers:${attemptId}`);
    await refreshWorkspace();
    setQuizzes((current) =>
      current.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              status: "COMPLETED",
              attemptsUsed: Math.max(quiz.attemptsUsed ?? 0, (quiz.attemptsUsed ?? 0) + 1),
              lastScore: score,
              lastScorePercentage: percentage,
            }
          : quiz,
      ),
    );
    showToast(`Quiz completed: ${score}/${maxScore} (${percentage}%).`);
    return completedResult;
  };
  const refreshCalendarEvents = useCallback(
    async (start: string, end: string, filters: { type?: string; courseId?: string } = {}) => {
      const events = await listCalendarEvents(start, end, filters);
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
  const sendMessage = async (conversationId: string, text: string) => {
    try {
      const conversation = conversations.find((item) => item.id === conversationId);
      if (conversation?.studentMessagingEnabled === false) {
        showToast("Student messaging is paused for this course.");
        return;
      }
      const response = await sendCommunicationMessage(conversationId, text);
      const data = response.data || {};
      const message = {
        id: String(data.id || ""),
        senderId: String(data.senderId || profile.id),
        senderName: profile.name || "You",
        senderAvatar: "",
        isSenderStudent: true,
        timestamp: String(data.sentAt || ""),
        text: String(data.content || text),
      };
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id !== conversationId
            ? conversation
            : conversation.messages.some((item) => item.id && item.id === message.id)
              ? conversation
              : {
                  ...conversation,
                  lastMessage: message.text,
                  lastMessageTime: message.timestamp,
                  messages: [...conversation.messages, message],
                },
        ),
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Message could not be sent.");
      throw error;
    }
  };
  const loadMoreMessages = async (conversationId: string) => {
    const page = (messagePages[conversationId] ?? 0) + 1;
    try {
      const response = await listCommunicationMessages(conversationId, page, 30);
      const raw = Array.isArray(response) ? response : (response as { data?: unknown }).data || [];
      const studentId = profile.id;
      const olderMessages = (Array.isArray(raw) ? raw : [])
        .map((item) => toCommunicationMessage(item as Record<string, unknown>, studentId))
        .reverse();
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [
                  ...olderMessages,
                  ...conversation.messages.filter(
                    (message) => !olderMessages.some((older) => older.id === message.id),
                  ),
                ],
              }
            : conversation,
        ),
      );
      setMessagePages((current) => ({ ...current, [conversationId]: page }));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load older messages.");
    }
  };
  const markNotificationAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      const count = await getUnreadNotificationCount();
      setUnreadNotificationCount(Number(count.data ?? 0));
    } catch {
      showToast("Could not mark notification as read.");
    }
  };
  const markAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadNotificationCount(0);
    } catch {
      showToast("Could not mark notifications as read.");
    }
  };
  const deleteNotification = async (id: string) => {
    try {
      await deleteNotificationApi(id);
      setNotifications((current) => current.filter((item) => item.id !== id));
      const count = await getUnreadNotificationCount();
      setUnreadNotificationCount(Number(count.data ?? 0));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete notification.");
    }
  };
  const navigateToCourseWorkspace = (courseId: string, lessonId?: string) => {
    const course = courses.find((item) => item.id === courseId);
    if (!course) {
      setCurrentView("my-courses");
      showToast("This course is no longer available in your enrolled courses.");
      return;
    }
    const courseLessons = (Array.isArray(course.modules) ? course.modules : []).flatMap((module) =>
      Array.isArray(module?.lessons)
        ? module.lessons.filter((lesson) => lesson && typeof lesson.id === "string")
        : [],
    );
    const requestedLesson = lessonId && courseLessons.find((lesson) => lesson.id === lessonId);
    const lastAccessedLesson = course.lastAccessedLessonId
      ? courseLessons.find((lesson) => lesson.id === course.lastAccessedLessonId)
      : undefined;
    setSelectedCourseId(courseId);
    setSelectedLessonId((requestedLesson || lastAccessedLesson || courseLessons[0])?.id || "");
    setCurrentView("course-workspace");
  };
  const navigateToCourseDetails = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView("course-details");
  };
  const attendanceOverall = attendanceSummaries.length
    ? (() => {
        const completedSessions = attendanceSummaries.reduce(
          (total, summary) => total + summary.completedSessions,
          0,
        );
        const attendedCount = attendanceSummaries.reduce(
          (total, summary) => total + summary.attendedCount,
          0,
        );
        return {
          studentId: profile.id,
          courseId: "",
          completedSessions,
          presentCount: attendanceSummaries.reduce(
            (total, summary) => total + summary.presentCount,
            0,
          ),
          lateCount: attendanceSummaries.reduce((total, summary) => total + summary.lateCount, 0),
          absentCount: attendanceSummaries.reduce(
            (total, summary) => total + summary.absentCount,
            0,
          ),
          attendedCount,
          attendancePercentage: completedSessions ? (attendedCount / completedSessions) * 100 : 0,
        };
      })()
    : null;
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
        refreshWorkspace,
        workspaceLoading,
        workspaceError,
        retryWorkspace: refreshWorkspace,
        conversations,
        sendMessage,
        loadMoreMessages,
        announcements,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        attendanceSummaries,
        attendanceOverall,
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
        clearToast,
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
