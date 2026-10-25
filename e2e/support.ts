import type { Page, Route } from "@playwright/test";

export type PortalRole = "STUDENT" | "TEACHER" | "ADMIN";

export const studentUser = {
  id: "student-e2e-1",
  keycloakUserId: "student-e2e-1",
  email: "student@example.test",
  firstName: "Sam",
  lastName: "Student",
  role: "STUDENT",
  accountStatus: "ACTIVE",
};
export const teacherUser = {
  id: "teacher-e2e-1",
  keycloakUserId: "teacher-e2e-1",
  email: "teacher@example.test",
  firstName: "Taylor",
  lastName: "Teacher",
  role: "TEACHER",
  accountStatus: "ACTIVE",
  teacherProfile: { id: "teacher-e2e-1", department: "Computing" },
};
export const studentCourse = {
  id: "course-e2e-1",
  courseCode: "SENG34213",
  courseName: "System Development Project",
  subject: "Software Engineering",
  assignedTeacherId: "teacher-e2e-1",
  courseDescription: "End-to-end course fixture for the browser suite.",
  courseStatus: "PUBLISHED",
};
export const assignment = {
  id: "assignment-e2e-1",
  courseId: studentCourse.id,
  title: "Project proposal",
  description: "Submit a short project proposal.",
  instructions: "Describe the system and its intended users.",
  dueDate: "2099-12-31T23:59:00Z",
  maxMarks: 100,
  assignmentStatus: "PUBLISHED",
  submissionStatus: "PENDING",
};
export const quiz = {
  id: "quiz-e2e-1",
  courseId: studentCourse.id,
  title: "Project fundamentals",
  description: "A short project foundations check.",
  durationMinutes: 5,
  totalMarks: 1,
  startTime: "2020-01-01T00:00:00Z",
  endTime: "2099-12-31T23:59:00Z",
  status: "PUBLISHED",
  maxAttempts: 2,
  attemptsUsed: 0,
  questions: [
    {
      id: "question-e2e-1",
      questionText: "Which activity should begin a software project?",
      marks: 1,
      options: [
        { id: "option-e2e-1", optionText: "Understanding user needs" },
        { id: "option-e2e-2", optionText: "Writing code immediately" },
      ],
    },
  ],
};

const envelope = (data: unknown) => ({ statusCode: 200, message: "OK", data });
const adminAccessToken = "e30.eyJhdWQiOiJtZW50aWZ5LWFwaSJ9.signature";
async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

/** Intercepts only the app's configured API origin; portal rendering remains real. */
export async function mockPortalApi(
  page: Page,
  portal: PortalRole,
  options: { failTeacherProfile?: boolean; delayLoginMs?: number; loginRole?: PortalRole } = {},
) {
  const requests: { method: string; pathname: string; body?: unknown }[] = [];
  await page.route("http://127.0.0.1:8080/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body: unknown;
    try {
      body = request.postDataJSON();
    } catch {
      body = undefined;
    }
    requests.push({ method: request.method(), pathname: url.pathname, body });

    if (url.pathname === "/api/v1/auth/login" && request.method() === "POST") {
      if (options.delayLoginMs)
        await new Promise((resolve) => setTimeout(resolve, options.delayLoginMs));
      if (String((body as { password?: string } | undefined)?.password) === "wrong-password") {
        return fulfill(route, { statusCode: 401, message: "Invalid email or password." }, 401);
      }
      const profileRole = options.loginRole ?? portal;
      const profile =
        profileRole === "STUDENT"
          ? studentUser
          : profileRole === "TEACHER"
            ? teacherUser
            : {
                id: "admin-e2e-1",
                email: "admin@example.test",
                firstName: "Alex",
                lastName: "Admin",
                role: "ADMIN",
                accountStatus: "ACTIVE",
                emailVerified: true,
                profileComplete: true,
              };
      return fulfill(
        route,
        envelope({
          accessToken: adminAccessToken,
          refreshToken: "refresh-e2e-token",
          tokenType: "Bearer",
          expiresIn: 3600,
          refreshExpiresIn: 7200,
          profile,
        }),
      );
    }
    if (url.pathname === "/api/v1/users/me" && options.failTeacherProfile) {
      return fulfill(
        route,
        { statusCode: 503, message: "Teacher profile service unavailable." },
        503,
      );
    }
    if (url.pathname === "/api/v1/users/me")
      return fulfill(route, envelope(portal === "TEACHER" ? teacherUser : studentUser));
    if (url.pathname === "/api/v1/notifications/unread-count") return fulfill(route, envelope(0));
    if (url.pathname === "/api/v1/course/my-courses" || url.pathname === "/api/v1/course")
      return fulfill(route, envelope([studentCourse]));
    if (url.pathname === "/api/v1/enrollments/students/student-e2e-1/courses")
      return fulfill(route, envelope([studentCourse.id]));
    if (url.pathname === "/api/v1/assignments/me") return fulfill(route, envelope([assignment]));
    if (url.pathname === "/api/v1/assignments/assignment-e2e-1")
      return fulfill(route, envelope(assignment));
    if (url.pathname === "/api/v1/assignments/assignment-e2e-1/attachments")
      return fulfill(route, envelope([]));
    if (url.pathname === "/api/courses/course-e2e-1/quizzes")
      return fulfill(route, envelope([quiz]));
    if (url.pathname === "/api/quizzes/quiz-e2e-1/student") return fulfill(route, envelope(quiz));
    if (url.pathname === "/api/quizzes/quiz-e2e-1/attempts" && request.method() === "POST")
      return fulfill(
        route,
        envelope({ attemptId: "quiz-attempt-e2e-1", startedAt: new Date().toISOString() }),
      );
    if (
      url.pathname === "/api/quiz-attempts/quiz-attempt-e2e-1/submit" &&
      request.method() === "POST"
    )
      return fulfill(
        route,
        envelope({
          score: 1,
          totalMarks: 1,
          percentage: 100,
          passed: true,
          answers: [
            {
              questionId: "question-e2e-1",
              questionText: "Which activity should begin a software project?",
              selectedOptionId: "option-e2e-1",
              correctOptionId: "option-e2e-1",
              correct: true,
              awardedMarks: 1,
              questionMarks: 1,
            },
          ],
        }),
      );
    if (url.pathname === "/api/communication/groups")
      return fulfill(
        route,
        envelope([
          { id: "communication-e2e-1", courseId: studentCourse.id, name: "Course discussion" },
        ]),
      );
    if (
      url.pathname === "/api/communication/groups/communication-e2e-1/messages" &&
      request.method() === "POST"
    )
      return fulfill(
        route,
        envelope({
          id: "message-e2e-1",
          senderId: studentUser.id,
          content: (body as { content?: string })?.content || "",
          sentAt: new Date().toISOString(),
        }),
      );
    if (url.pathname.startsWith("/api/communication/groups/communication-e2e-1/messages"))
      return fulfill(route, envelope([]));
    if (url.pathname === "/api/communication/groups/communication-e2e-1/members")
      return fulfill(route, envelope([]));
    if (url.pathname === "/api/v1/submissions/my") return fulfill(route, envelope([]));
    if (url.pathname === "/api/v1/course/course-e2e-1/lookup")
      return fulfill(route, envelope(studentCourse));
    if (url.pathname === "/api/v1/users/teachers/teacher-e2e-1/lookup")
      return fulfill(
        route,
        envelope({
          id: "teacher-e2e-1",
          firstName: "Taylor",
          lastName: "Teacher",
          role: "TEACHER",
        }),
      );
    if (url.pathname === "/api/v1/teacher/dashboard")
      return fulfill(
        route,
        envelope({
          pendingReviewCount: 0,
          upcomingExamCount: 0,
          todayClassCount: 0,
          todaySchedule: [],
          pendingGrading: [],
          coursePerformance: [],
        }),
      );
    if (url.pathname === "/api/internal/users/analytics/registration-overview")
      return fulfill(
        route,
        envelope({
          totalUsers: 1,
          usersByRole: { STUDENT: 0, TEACHER: 0, ADMIN: 1 },
          usersByAccountStatus: { ACTIVE: 1, INVITED: 0 },
          recentStudents: [],
          recentTeachers: [],
        }),
      );
    if (url.pathname === "/api/v1/notifications")
      return fulfill(
        route,
        envelope({
          notifications: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
          unreadCount: 0,
        }),
      );
    if (url.pathname === "/api/ai/conversations") {
      return fulfill(
        route,
        request.method() === "POST"
          ? envelope({ id: "ai-conv-e2e", title: "New conversation" })
          : envelope([]),
      );
    }
    if (url.pathname === "/api/ai/chat")
      return fulfill(
        route,
        envelope({
          conversationId: "ai-conv-e2e",
          messageId: "ai-msg-e2e",
          message: "A clear project plan starts with user needs.",
          timestamp: new Date().toISOString(),
        }),
      );
    if (
      url.pathname.endsWith("/assignments/assignment-e2e-1/submissions") &&
      request.method() === "POST"
    )
      return fulfill(route, envelope({ id: "submission-e2e-1" }));
    if (
      url.pathname === "/api/v1/submissions/submission-e2e-1/submit" &&
      request.method() === "POST"
    )
      return fulfill(route, envelope({ id: "submission-e2e-1", status: "SUBMITTED" }));
    if (
      url.pathname.includes("/modules") ||
      url.pathname.includes("/lessons") ||
      url.pathname.endsWith("/exams/me") ||
      url.pathname.includes("/calendar/") ||
      url.pathname.includes("/notifications")
    )
      return fulfill(route, envelope([]));
    if (url.pathname.startsWith("/api/v1/")) return fulfill(route, envelope([]));
    return fulfill(route, envelope([]));
  });
  return requests;
}
