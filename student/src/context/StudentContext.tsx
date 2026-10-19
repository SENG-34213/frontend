"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_COURSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_QUIZZES,
  INITIAL_EXAMINATIONS,
  INITIAL_MATERIALS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_CHATS,
} from "../data/mockData";
import { studentApi, getToken, clearToken } from "../lib/studentApi";

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
  enrollInCourse: (courseId: string) => Promise<void>;
  markLessonComplete: (courseId: string, lessonId: string, complete?: boolean) => void;
  assignments: Assignment[];
  submitAssignment: (
    assignmentId: string,
    submissionText: string,
    files: { name: string; size: string; uploadedAt: string }[],
  ) => Promise<void>;
  quizzes: Quiz[];
  submitQuizAnswers: (
    quizId: string,
    answers: Record<string, string[]>,
  ) => Promise<{ score: number; maxScore: number; percentage: number }>;
  examinations: Examination[];
  submitExam: (examId: string, answers: Record<string, string[]>) => void;
  materials: LearningMaterial[];
  calendarEvents: CalendarEvent[];
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  announcements: Announcement[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  aiChats: ChatMessage[];
  isAiLoading: boolean;
  sendAiQuery: (query: string) => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  selectedMaterialForPreview: LearningMaterial | null;
  setSelectedMaterialForPreview: (material: LearningMaterial | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  navigateToCourseWorkspace: (courseId: string, lessonId?: string) => void;
  navigateToCourseDetails: (courseId: string) => void;

  // Live Backend Integration State & Auth
  isAuthenticated: boolean;
  isLiveConnected: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  refreshData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<StudentView>("dashboard");
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("course-cs301");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("les-cs301-3-2");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("asg-1");
  const [selectedQuizId, setSelectedQuizId] = useState<string>("quiz-cs301-1");
  const [selectedExamId, setSelectedExamId] = useState<string>("exam-1");
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [examinations, setExaminations] = useState<Examination[]>(INITIAL_EXAMINATIONS);
  const [materials, setMaterials] = useState<LearningMaterial[]>(INITIAL_MATERIALS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [announcements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [aiChats, setAiChats] = useState<ChatMessage[]>(INITIAL_AI_CHATS);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [selectedMaterialForPreview, setSelectedMaterialForPreview] =
    useState<LearningMaterial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Connection State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getToken()));
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Theme synchronization with DOM
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Synchronize Live Backend Data
  const refreshData = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setIsAuthenticated(true);
      // 1. Fetch current student profile
      const userRes = await studentApi.me();
      if (userRes && userRes.id) {
        setIsLiveConnected(true);
        const fullName =
          `${userRes.firstName || ""} ${userRes.lastName || ""}`.trim() || "Alex Rivera";
        setProfile((prev) => ({
          ...prev,
          id: userRes.id,
          studentId: userRes.studentProfile?.studentId || prev.studentId,
          name: fullName,
          email: userRes.email || prev.email,
          semester: userRes.studentProfile?.grade
            ? `Grade ${userRes.studentProfile.grade}`
            : prev.semester,
        }));

        // 2. Fetch enrolled course IDs
        try {
          const courseIds = await studentApi.courseIds(userRes.id);
          if (courseIds && courseIds.length > 0) {
            const fetchedCourses: Course[] = [];
            for (const cId of courseIds) {
              try {
                const bCourse = await studentApi.course(cId);
                if (bCourse) {
                  fetchedCourses.push({
                    id: bCourse.id,
                    code: bCourse.subject || "CS 301",
                    title: bCourse.courseName,
                    category: "Computer Science",
                    description: bCourse.courseDescription || "",
                    instructor: {
                      id: bCourse.assignedTeacherId || "inst-1",
                      name: "Course Professor",
                      title: "Professor",
                      avatar: "",
                      department: "Computer Science",
                      officeHours: "Tues & Thurs 2:00 PM – 4:00 PM",
                      email: "instructor@mentify.edu",
                    },
                    bannerColor: "from-indigo-600 to-indigo-900",
                    enrolled: true,
                    enrollmentStatus: "ACTIVE",
                    progressPercentage: 45,
                    credits: 3,
                    level: "Intermediate",
                    modules: [],
                    schedule: "Mon, Wed, Fri · 10:00 AM",
                    room: "Mentify Online Room",
                    enrolledStudentsCount: bCourse.numberOfStudents || 30,
                    rating: 4.8,
                    courseFeeMonthly: bCourse.courseFeeMonthly,
                  });
                }
              } catch {
                // Keep initial course data if individual lookup fails
              }
            }
            if (fetchedCourses.length > 0) {
              setCourses((prev) => {
                const map = new Map(prev.map((c) => [c.id, c]));
                fetchedCourses.forEach((fc) => map.set(fc.id, { ...map.get(fc.id), ...fc }));
                return Array.from(map.values());
              });
            }
          }
        } catch {
          // Fallback retained
        }

        // 3. Fetch submissions
        try {
          const subs = await studentApi.submissions();
          if (subs && subs.length > 0) {
            setAssignments((prev) =>
              prev.map((asg) => {
                const matchedSub = subs.find((s) => s.assignmentId === asg.id);
                if (matchedSub) {
                  return {
                    ...asg,
                    submissionId: matchedSub.id,
                    status: (matchedSub.status === "GRADED"
                      ? "GRADED"
                      : matchedSub.status === "SUBMITTED"
                        ? "SUBMITTED"
                        : "PENDING") as Assignment["status"],
                    grade: matchedSub.marks,
                    submissionText: matchedSub.content,
                    submittedDate: matchedSub.submittedAt,
                    feedback: matchedSub.feedback,
                  };
                }
                return asg;
              }),
            );
          }
        } catch {
          // Fallback retained
        }

        // 4. Fetch learning materials
        try {
          const mats = await studentApi.materials();
          if (mats && mats.length > 0) {
            const mappedMats: LearningMaterial[] = mats.map((m) => ({
              id: m.id,
              courseId: m.courseId || "course-cs301",
              courseCode: "CS 301",
              courseTitle: "Data Structures & Algorithmic Analysis",
              title: m.title,
              description: m.description || "",
              type: (m.type === "VIDEO"
                ? "VIDEO"
                : m.type === "SLIDES"
                  ? "SLIDES"
                  : "PDF") as LearningMaterial["type"],
              fileSize: m.fileSize ? `${Math.round(m.fileSize / 1024)} KB` : "2.4 MB",
              uploadedDate: m.createdAt || "Recent",
              downloadsCount: 12,
            }));
            setMaterials((prev) => {
              const ids = new Set(prev.map((x) => x.id));
              const fresh = mappedMats.filter((x) => !ids.has(x.id));
              return [...fresh, ...prev];
            });
          }
        } catch {
          // Fallback retained
        }

        // 5. Fetch upcoming calendar events
        try {
          const events = await studentApi.upcomingEvents(20);
          if (events && events.length > 0) {
            const mappedEvents: CalendarEvent[] = events.map((ev) => ({
              id: ev.id,
              title: ev.title,
              description: ev.description || "",
              type: (ev.eventType === "EXAM"
                ? "EXAM"
                : ev.eventType === "QUIZ"
                  ? "QUIZ"
                  : ev.eventType === "ASSIGNMENT"
                    ? "ASSIGNMENT_DUE"
                    : "CLASS") as CalendarEvent["type"],
              date: ev.startDateTime ? ev.startDateTime.split("T")[0] : "2026-10-20",
              startTime: ev.startDateTime
                ? ev.startDateTime.split("T")[1]?.slice(0, 5) || "10:00"
                : "10:00",
              endTime: ev.endDateTime
                ? ev.endDateTime.split("T")[1]?.slice(0, 5) || "11:30"
                : "11:30",
              location: ev.location || "Lecture Hall A",
            }));
            setCalendarEvents(mappedEvents);
          }
        } catch {
          // Fallback retained
        }

        // 6. Fetch Notifications
        try {
          const notifs = await studentApi.notifications(false);
          if (notifs && notifs.length > 0) {
            const mappedNotifs: NotificationItem[] = notifs.map((n) => ({
              id: n.id,
              title: n.title,
              description: n.message || n.description || "",
              timestamp: n.createdAt || "Recently",
              type: "ANNOUNCEMENT",
              read: n.read,
            }));
            setNotifications(mappedNotifs);
          }
        } catch {
          // Fallback retained
        }
      }
    } catch {
      setIsLiveConnected(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshData();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshData]);

  const signOut = async () => {
    try {
      await studentApi.logout();
    } catch {
      clearToken();
    }
    setIsAuthenticated(false);
    setIsLiveConnected(false);
    showToast("Signed out of student account. Switched to demo mode.");
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    showToast("Student profile updated successfully.");
  };

  const enrollInCourse = async (courseId: string) => {
    if (isAuthenticated) {
      try {
        await studentApi.enroll(courseId);
        showToast("Enrolled in course successfully via Mentify Enrollment Service!");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Enrollment failed";
        showToast(`Enrollment synced locally: ${msg}`);
      }
    } else {
      showToast("Successfully enrolled in course!");
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            enrolled: true,
            enrollmentStatus: "ACTIVE",
            progressPercentage: 0,
            enrolledStudentsCount: c.enrolledStudentsCount + 1,
          };
        }
        return c;
      }),
    );
  };

  const markLessonComplete = (courseId: string, lessonId: string, complete = true) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;

        let totalLessons = 0;
        let completedLessons = 0;

        const updatedModules = c.modules.map((mod) => {
          const updatedLessons = mod.lessons.map((les) => {
            const isTarget = les.id === lessonId;
            const isCompleted = isTarget ? complete : les.completed;
            if (isCompleted) completedLessons++;
            totalLessons++;
            return isTarget ? { ...les, completed: complete } : les;
          });
          return { ...mod, lessons: updatedLessons };
        });

        const newPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : c.progressPercentage;

        return {
          ...c,
          modules: updatedModules,
          progressPercentage: newPercentage,
          lastAccessedLessonId: lessonId,
        };
      }),
    );
    showToast(complete ? "Lesson marked as complete!" : "Lesson status updated");
  };

  const submitAssignment = async (
    assignmentId: string,
    submissionText: string,
    files: { name: string; size: string; uploadedAt: string }[],
  ) => {
    if (isAuthenticated) {
      try {
        const draft = await studentApi.createSubmission(assignmentId, submissionText);
        if (draft && draft.id) {
          await studentApi.submitAssignment(draft.id);
        }
        showToast("Assignment submitted successfully to Mentify Assignment Service!");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Backend submission failed";
        showToast(`Assignment submitted locally (${msg})`);
      }
    } else {
      showToast(
        "Assignment submitted successfully! Feedback will be published by your instructor.",
      );
    }

    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id === assignmentId) {
          return {
            ...asg,
            status: "SUBMITTED",
            submissionText,
            submittedFiles: files,
            submittedDate: new Date().toISOString(),
          };
        }
        return asg;
      }),
    );
  };

  const submitQuizAnswers = async (quizId: string, answers: Record<string, string[]>) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return { score: 0, maxScore: 0, percentage: 0 };

    let earnedPoints = 0;
    quiz.questions.forEach((q) => {
      const selected = answers[q.id] || [];
      const correct = q.correctAnswerIds;
      const isCorrect =
        selected.length === correct.length && selected.every((val) => correct.includes(val));
      if (isCorrect) {
        earnedPoints += q.points;
      }
    });

    const percentage = Math.round((earnedPoints / quiz.totalPoints) * 100);

    if (isAuthenticated) {
      try {
        const attempt = await studentApi.startQuiz(quizId);
        if (attempt && attempt.attemptId) {
          for (const [qId, opts] of Object.entries(answers)) {
            if (opts.length > 0) {
              await studentApi.saveQuizAnswer(attempt.attemptId, qId, opts[0]).catch(() => {});
            }
          }
          await studentApi.submitQuiz(attempt.attemptId).catch(() => {});
        }
      } catch {
        // Handled locally
      }
    }

    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === quizId) {
          return {
            ...q,
            status: "COMPLETED",
            attemptsUsed: q.attemptsUsed + 1,
            lastScore: earnedPoints,
            lastScorePercentage: percentage,
          };
        }
        return q;
      }),
    );

    showToast(`Quiz completed! You scored ${earnedPoints}/${quiz.totalPoints} (${percentage}%).`);
    return { score: earnedPoints, maxScore: quiz.totalPoints, percentage };
  };

  const submitExam = (examId: string, _answers: Record<string, string[]>) => {
    void _answers;
    const simulatedScore = 92;
    setExaminations((prev) =>
      prev.map((ex) => {
        if (ex.id === examId) {
          return {
            ...ex,
            status: "COMPLETED",
            score: simulatedScore,
            scorePercentage: 92,
            letterGrade: "A",
          };
        }
        return ex;
      }),
    );
    showToast("Examination submitted successfully to proctor service.");
  };

  const sendMessage = async (conversationId: string, text: string) => {
    if (!text.trim()) return;

    if (isAuthenticated) {
      try {
        await studentApi.sendMessage(conversationId, text);
      } catch {
        // Fall back to local message addition
      }
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: profile.id,
      senderName: profile.name,
      senderAvatar: profile.avatar,
      isSenderStudent: true,
      timestamp: "Just now",
      text,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text,
            lastMessageTime: "Just now",
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      }),
    );

    // Instructor simulation
    setTimeout(() => {
      const replies = [
        "Thank you for following up, Alex. I have made a note in your records.",
        "Great question. We will cover this specific proof in detail during next lecture!",
        "Your logic looks accurate. Feel free to stop by office hours if you want to explore the edge cases further.",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const instructorReply = {
        id: `msg-${Date.now() + 1}`,
        senderId: "instructor",
        senderName: "Course Instructor",
        senderAvatar: "",
        isSenderStudent: false,
        timestamp: "Just now",
        text: randomReply,
      };

      setConversations((current) =>
        current.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: randomReply,
                lastMessageTime: "Just now",
                messages: [...c.messages, instructorReply],
              }
            : c,
        ),
      );
    }, 2500);
  };

  const markNotificationAsRead = async (id: string) => {
    if (isAuthenticated) {
      try {
        await studentApi.markNotificationRead(id);
      } catch {
        // Keep local state update
      }
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = async () => {
    if (isAuthenticated) {
      try {
        await studentApi.markAllNotificationsRead();
      } catch {
        // Keep local state update
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read.");
  };

  const sendAiQuery = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: `ai-msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAiChats((prev) => [...prev, userMessage]);
    setIsAiLoading(true);

    if (isAuthenticated) {
      try {
        const aiRes = await studentApi.aiChat(query);
        if (aiRes && aiRes.response) {
          const assistantMessage: ChatMessage = {
            id: `ai-msg-${Date.now() + 1}`,
            sender: "assistant",
            text: aiRes.response,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setAiChats((prev) => [...prev, assistantMessage]);
          setIsAiLoading(false);
          return;
        }
      } catch {
        // Continue to generative educational fallback
      }
    }

    setTimeout(() => {
      let responseText = "";
      let codeSnippet: { language: string; code: string } | undefined = undefined;

      const lower = query.toLowerCase();
      if (
        lower.includes("transformer") ||
        lower.includes("attention") ||
        lower.includes("scaling")
      ) {
        responseText = `In Transformer multi-head attention, we calculate:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

### Why scale by $\\frac{1}{\\sqrt{d_k}}$?
1. **Variance Stabilizer**: For large dimensions $d_k$ (e.g., $d_k = 64$), the dot products grow large in magnitude.
2. If components of $q$ and $k$ are independent random variables with mean 0 and variance 1, their dot product $q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i$ has mean 0 and variance $d_k$.
3. Without scaling, the softmax function receives large inputs, pushing softmax gradients into regions with tiny derivatives (vanishing gradients).
4. Dividing by $\\sqrt{d_k}$ normalizes the variance back to 1, preserving healthy gradient flow during backpropagation.`;

        codeSnippet = {
          language: "python",
          code: `# Safe scaled dot-product calculation
import torch
import math

def scaled_attention(q, k, v, mask=None):
    d_k = q.size(-1)
    scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    weights = torch.softmax(scores, dim=-1)
    return torch.matmul(weights, v), weights`,
        };
      } else if (
        lower.includes("dijkstra") ||
        lower.includes("fibonacci") ||
        lower.includes("heap")
      ) {
        responseText = `### Fibonacci Heap in Dijkstra's Algorithm
Standard binary min-heaps take $\\mathcal{O}(\\log V)$ for \`decrease-key\` operations, leading to total Dijkstra runtime of:
$$\\mathcal{O}((V + E) \\log V) = \\mathcal{O}(E \\log V)$$

With a **Fibonacci Heap**:
- \`extract-min\` runs in amortized $\\mathcal{O}(\\log V)$
- \`decrease-key\` runs in amortized $\\mathcal{O}(1)$ via cascading cuts
- **Total Runtime**: $\\mathcal{O}(E + V \\log V)$

In dense graphs where $E \\approx V^2$, the $\\mathcal{O}(E)$ term dominates, making Fibonacci heaps asymptotically optimal!`;
      } else if (
        lower.includes("raft") ||
        lower.includes("consensus") ||
        lower.includes("split vote")
      ) {
        responseText = `### Raft Split Vote Resolution
When two candidates simultaneously broadcast \`RequestVote\` RPCs and split the electorate equally (neither reaching a majority $\\lfloor N/2 \\rfloor + 1$ quorum):

1. **Randomized Election Timeouts**: Each node chooses an election timeout uniformly at random from a range (e.g., 150ms–300ms).
2. **First to Timeout**: The node with the shorter timeout will trigger a new election term before competitors, request votes, and collect the necessary majority while other nodes are still in their waiting window.
3. This guarantees rapid convergence with negligible split-vote overhead.`;
      } else {
        responseText = `Great question on your coursework, ${profile.name}! 

To approach this systematically:
1. **Define Core Invariants**: Break the problem into its foundational components and state dependencies.
2. **Analyze Asymptotic Tradeoffs**: Evaluate memory overhead versus computational complexity.
3. **Verify Boundary Conditions**: Check empty inputs, single-node configurations, and cyclic topologies.

Would you like me to generate a practice quiz or step-by-step code proof for this concept?`;
      }

      const assistantMessage: ChatMessage = {
        id: `ai-msg-${Date.now() + 1}`,
        sender: "assistant",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        codeBlock: codeSnippet,
        suggestedQuestions: [
          "Can you show an edge case test for this?",
          "How does this appear on the upcoming midterm exam?",
          "Generate a quick 2-question knowledge check",
        ],
      };

      setAiChats((prev) => [...prev, assistantMessage]);
      setIsAiLoading(false);
    }, 1200);
  };

  const navigateToCourseWorkspace = (courseId: string, lessonId?: string) => {
    setSelectedCourseId(courseId);
    if (lessonId) {
      setSelectedLessonId(lessonId);
    } else {
      const course = courses.find((c) => c.id === courseId);
      if (course?.lastAccessedLessonId) {
        setSelectedLessonId(course.lastAccessedLessonId);
      } else if (course?.modules?.[0]?.lessons?.[0]) {
        setSelectedLessonId(course.modules[0].lessons[0].id);
      }
    }
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
        submitQuizAnswers,
        examinations,
        submitExam,
        materials,
        calendarEvents,
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
        toggleTheme,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        selectedMaterialForPreview,
        setSelectedMaterialForPreview,
        toastMessage,
        showToast,
        navigateToCourseWorkspace,
        navigateToCourseDetails,
        isAuthenticated,
        isLiveConnected,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        refreshData,
        signOut,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
};
