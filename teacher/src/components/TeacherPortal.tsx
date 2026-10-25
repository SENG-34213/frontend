"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { NavigationTab, Course } from "../teacher/types";
import { TeacherSidebar } from "../teacher/components/TeacherSidebar";
import { TeacherNavbar } from "../teacher/components/TeacherNavbar";
import { GlobalSearchModal } from "../teacher/components/GlobalSearchModal";
import { QuickCreateModal, QuickCreateType } from "../teacher/components/QuickCreateModal";

// Views
import { DashboardView } from "../teacher/dashboard/DashboardView";
import { CourseListView } from "../teacher/courses/CourseListView";
import { CourseDetailsView } from "../teacher/courses/CourseDetailsView";
import { CurriculumBuilderView } from "../teacher/modules/CurriculumBuilderView";
import { StudentDirectoryView } from "../teacher/students/StudentDirectoryView";
import { AssignmentDashboardView } from "../teacher/assignments/AssignmentDashboardView";
import { SubmissionReviewWorkspace } from "../teacher/assignments/SubmissionReviewWorkspace";
import { QuizDashboardView } from "../teacher/quizzes/QuizDashboardView";
import { ExamManagementView } from "../teacher/exams/ExamManagementView";
import { GradebookView } from "../teacher/grades/GradebookView";
import { AttendanceWorkspaceView } from "../teacher/attendance/AttendanceWorkspaceView";
import { MaterialLibraryView } from "../teacher/materials/MaterialLibraryView";
import { TeacherCalendarView } from "../teacher/calendar/TeacherCalendarView";
import { TeacherMessagesView } from "../teacher/communication/TeacherMessagesView";
import { TeacherAnalyticsView } from "../teacher/analytics/TeacherAnalyticsView";
import { NotificationCenterView } from "../teacher/notifications/NotificationCenterView";
import { TeacherProfileView } from "../teacher/profile/TeacherProfileView";
import { TeacherSettingsView } from "../teacher/settings/TeacherSettingsView";
import { TeacherLoginView } from "../teacher/auth/TeacherLoginView";
import { changeTeacherPassword, getCurrentTeacher, logoutTeacher } from "../teacher/api/auth";
import { SetPasswordPanel } from "../../../shared/auth/SetPasswordPanel";
import { clearSession } from "../teacher/auth/authStorage";
import { restoreTeacherSession } from "../teacher/api/client";
import type { AuthSession } from "../teacher/auth/authTypes";
import { useTeacherShellData } from "../teacher/hooks/useTeacherShellData";
import { useTeacherCourses } from "../teacher/hooks/useTeacherCourses";
import { useTeacherNotifications } from "../teacher/hooks/useTeacherNotifications";
import { createQuiz } from "../teacher/api/quizApi";
import { mapBackendCourse, type BackendCourse } from "../teacher/api/courseApi";
import { useTeacherStudents } from "../teacher/hooks/useTeacherStudents";
import { getCourseAssignments, type BackendAssignment } from "../teacher/api/assignmentApi";
import { getTeacherDashboard, type TeacherDashboardData } from "../teacher/api/dashboardApi";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const restoreStartedRef = useRef(false);
  const [currentTab, setCurrentTab] = useState<NavigationTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [assignmentRefreshToken, setAssignmentRefreshToken] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("mentify_teacher_theme") === "dark";
  });
  const historyReadyRef = useRef(false);
  const browserBackRef = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("mentify_teacher_theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const validTabs = new Set<NavigationTab>([
      "dashboard",
      "calendar",
      "notifications",
      "courses",
      "curriculum",
      "students",
      "attendance",
      "materials",
      "assignments",
      "grading-workspace",
      "quizzes",
      "exams",
      "grades",
      "analytics",
      "messages",
      "profile",
      "settings",
    ]);
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    const savedTab = window.localStorage.getItem("teacher-current-tab");
    if (urlTab && validTabs.has(urlTab as NavigationTab)) {
      setCurrentTab(urlTab as NavigationTab);
    } else if (savedTab && validTabs.has(savedTab as NavigationTab)) {
      setCurrentTab(savedTab as NavigationTab);
    }
  }, []);

  useEffect(() => {
    if (!historyReadyRef.current) {
      const url = new URL(window.location.href);
      // Keep legacy ?tab=... links working, but remove the implementation detail
      // from the visible URL after the initial view has been resolved.
      url.searchParams.delete("tab");
      window.history.replaceState({ portal: "teacher", tab: currentTab }, "", url);
      historyReadyRef.current = true;
      return;
    }

    if (browserBackRef.current) {
      browserBackRef.current = false;
      return;
    }

    const url = new URL(window.location.href);
    if (window.history.state?.tab === currentTab) return;
    url.searchParams.delete("tab");
    window.history.pushState({ portal: "teacher", tab: currentTab }, "", url);
  }, [currentTab]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const stateTab = typeof event.state?.tab === "string" ? event.state.tab : null;
      const urlTab = new URLSearchParams(window.location.search).get("tab");
      const nextTab = stateTab || urlTab;
      if (!nextTab) return;
      browserBackRef.current = true;
      if (urlTab) {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("tab");
        window.history.replaceState({ portal: "teacher", tab: nextTab }, "", cleanUrl);
      }
      setCurrentTab(nextTab as NavigationTab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Quick Create Modal state
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<QuickCreateType | null>("assignment");

  // Deep view states
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [activeGradingAssignmentId, setActiveGradingAssignmentId] = useState<string>("");
  const shellData = useTeacherShellData(Boolean(session));
  const teacherCourses = useTeacherCourses(Boolean(session));
  const teacherStudents = useTeacherStudents(Boolean(session), teacherCourses.courses);
  const [searchAssignments, setSearchAssignments] = useState<BackendAssignment[]>([]);
  const recentNotifications = useTeacherNotifications(Boolean(session), 4);
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);

  // Course state
  const [courses, setCourses] = useState<Course[]>([]);

  // Counts
  const pendingSubmissionsCount = dashboardData?.pendingReviewCount ?? 0;

  useEffect(() => {
    if (!session) {
      setDashboardData(null);
      return;
    }
    const controller = new AbortController();
    getTeacherDashboard(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setDashboardData(data ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setDashboardData(null);
      });
    return () => controller.abort();
  }, [session]);
  useEffect(() => {
    if (restoreStartedRef.current) return;
    restoreStartedRef.current = true;

    restoreTeacherSession()
      .then(async (restoredSession) => {
        if (!restoredSession) {
          setSession(null);
          return;
        }

        // Verify the stored/renewed session before exposing the teacher workspace.
        // This prevents a stale session for another role from reaching the shell.
        await getCurrentTeacher();
        setSession(restoredSession);
        setRequiresPasswordChange(Boolean(restoredSession.mustChangePassword));
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  useEffect(() => {
    if (teacherCourses.error) {
      setCourses([]);
      return;
    }
    if (!teacherCourses.isLoading) {
      const validStudentCountByCourse = new Map<string, number>();
      teacherStudents.students.forEach((student) => {
        student.enrolledCourseIds.forEach((courseId) => {
          validStudentCountByCourse.set(
            courseId,
            (validStudentCountByCourse.get(courseId) ?? 0) + 1,
          );
        });
      });

      setCourses(
        teacherCourses.courses.map((backendCourse) => ({
          ...mapBackendCourse(backendCourse),
          // Use only students with a resolved profile and real student ID.
          // During roster loading, do not expose the backend's raw count.
          enrolledCount: teacherStudents.isLoading
            ? 0
            : (validStudentCountByCourse.get(backendCourse.id) ?? 0),
        })),
      );
    }
  }, [
    teacherCourses.courses,
    teacherCourses.error,
    teacherCourses.isLoading,
    teacherStudents.isLoading,
    teacherStudents.students,
  ]);

  useEffect(() => {
    const handleExpiredSession = () => {
      setSession(null);
      setRequiresPasswordChange(false);
    };
    window.addEventListener("teacher:session-expired", handleExpiredSession);
    return () => window.removeEventListener("teacher:session-expired", handleExpiredSession);
  }, []);

  useEffect(() => {
    setNotificationUnreadCount(shellData.unreadNotificationsCount);
  }, [shellData.unreadNotificationsCount]);

  useEffect(() => {
    if (!isSearchOpen || !teacherCourses.courses.length) return;
    const controller = new AbortController();
    Promise.allSettled(
      teacherCourses.courses.map((course) => getCourseAssignments(course.id, controller.signal)),
    )
      .then((results) =>
        setSearchAssignments(
          results
            .filter(
              (result): result is PromiseFulfilledResult<BackendAssignment[]> =>
                result.status === "fulfilled",
            )
            .flatMap((result) => result.value),
        ),
      )
      .catch(() => {
        if (!controller.signal.aborted) setSearchAssignments([]);
      });
    return () => controller.abort();
  }, [isSearchOpen, teacherCourses.courses]);

  // Navigation handler
  const handleNavigate = (tab: NavigationTab, param?: string) => {
    if (tab !== "courses") {
      setSelectedCourseForDetail(null);
    }
    setCurrentTab(tab);
    window.localStorage.setItem("teacher-current-tab", tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenGradeAssignment = (assignmentId: string) => {
    setActiveGradingAssignmentId(assignmentId);
    setCurrentTab("grading-workspace");
  };

  const handleOpenQuickCreate = (type: QuickCreateType) => {
    setQuickCreateType(type);
    setIsQuickCreateOpen(true);
  };

  const handleItemCreated = (type: QuickCreateType, item: any) => {
    if (type === "course") {
      const isPublished = item?.isPublished === true || item?.courseStatus === "PUBLISHED";
      if (!isPublished) {
        setCurrentTab("courses");
        return;
      }
      const newCourse: Course = mapBackendCourse(item as BackendCourse);
      setCourses([newCourse, ...courses]);
      setSelectedCourseForDetail(newCourse);
      setCurrentTab("courses");
    } else if (type === "assignment") {
      setAssignmentRefreshToken((current) => current + 1);
      setCurrentTab("assignments");
    } else if (type === "quiz") {
      setCurrentTab("quizzes");
    } else if (type === "lesson" || type === "module") {
      setCurrentTab("curriculum");
    } else if (type === "event") {
      setCurrentTab("calendar");
    }
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-slate-50" aria-label="Loading teacher session" />;
  }

  if (!session) {
    return (
      <TeacherLoginView
        onLogin={(nextSession) => {
          setSession(nextSession);
          setRequiresPasswordChange(Boolean(nextSession.mustChangePassword));
        }}
      />
    );
  }

  if (requiresPasswordChange) {
    return (
      <SetPasswordPanel
        email={session.user.email}
        roleLabel="Teacher"
        onSubmit={async (currentPassword, newPassword) => {
          await changeTeacherPassword(currentPassword, newPassword);
          clearSession();
          setRequiresPasswordChange(false);
          setSession(null);
        }}
        onCancel={() => {
          clearSession();
          setRequiresPasswordChange(false);
          setSession(null);
        }}
      />
    );
  }

  if (shellData.error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">
            Workspace unavailable
          </p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">
            We could not load your teacher profile.
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{shellData.error.message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={shellData.retry}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Try again
            </button>
            <button
              onClick={async () => {
                await logoutTeacher();
                setSession(null);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (shellData.isLoading || !shellData.teacherProfile) {
    return (
      <div
        className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400"
        aria-label="Loading teacher workspace"
      >
        Loading teacher workspace…
      </div>
    );
  }

  const teacherProfile = shellData.teacherProfile;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 flex">
      {/* 1. Global Teacher Sidebar */}
      <TeacherSidebar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        teacher={teacherProfile}
        courseCount={teacherCourses.courses.length}
        studentCount={teacherStudents.students.length}
        onLogout={async () => {
          await logoutTeacher();
          setSession(null);
        }}
        pendingSubmissionsCount={pendingSubmissionsCount}
        unreadNotificationsCount={notificationUnreadCount}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <TeacherNavbar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickCreate={handleOpenQuickCreate}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((current) => !current)}
          teacher={teacherProfile}
          onLogout={async () => {
            await logoutTeacher();
            setSession(null);
          }}
          unreadNotificationsCount={notificationUnreadCount}
        />

        {/* View Routing */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {shellData.notificationError && (
            <div
              role="status"
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              Notifications are temporarily unavailable. The rest of your workspace is still
              available.
            </div>
          )}
          {currentTab === "dashboard" && (
            <DashboardView
              teacher={teacherProfile}
              onNavigate={handleNavigate}
              onGradeAssignment={handleOpenGradeAssignment}
              recentNotifications={recentNotifications.notifications}
              notificationsLoading={recentNotifications.isLoading}
            />
          )}

          {currentTab === "courses" && teacherCourses.error && (
            <section className="mx-auto max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
              <h1 className="text-lg font-bold text-rose-900">Courses are unavailable</h1>
              <p className="mt-2 text-sm text-rose-700">{teacherCourses.error.message}</p>
              <button
                onClick={teacherCourses.retry}
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Try again
              </button>
            </section>
          )}

          {currentTab === "courses" && teacherCourses.isLoading && (
            <div className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Loading your courses...
            </div>
          )}

          {currentTab === "courses" &&
            !teacherCourses.isLoading &&
            !teacherCourses.error &&
            (selectedCourseForDetail ? (
              <CourseDetailsView
                course={selectedCourseForDetail}
                onBack={() => setSelectedCourseForDetail(null)}
                onNavigate={handleNavigate}
              />
            ) : (
              <CourseListView
                courses={courses}
                onSelectCourse={(c) => setSelectedCourseForDetail(c)}
                onOpenCreateCourse={() => handleOpenQuickCreate("course")}
                onNavigate={handleNavigate}
              />
            ))}

          {currentTab === "curriculum" && (
            <CurriculumBuilderView
              onNavigate={handleNavigate}
              backendCourses={teacherCourses.courses}
            />
          )}

          {currentTab === "students" && (
            <StudentDirectoryView
              onSendMessage={(studentName) => setCurrentTab("messages")}
              courses={courses}
              backendCourses={teacherCourses.courses}
            />
          )}

          {currentTab === "assignments" && (
            <AssignmentDashboardView
              onGradeAssignment={handleOpenGradeAssignment}
              onOpenCreateAssignment={() => handleOpenQuickCreate("assignment")}
              backendCourses={teacherCourses.courses}
              refreshToken={assignmentRefreshToken}
            />
          )}

          {currentTab === "grading-workspace" && (
            <SubmissionReviewWorkspace
              initialAssignmentId={activeGradingAssignmentId}
              onBack={() => setCurrentTab("assignments")}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === "quizzes" && (
            <QuizDashboardView
              teacherCourses={courses}
              onOpenCreateQuiz={() => handleOpenQuickCreate("quiz")}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === "exams" && (
            <ExamManagementView
              onNavigate={handleNavigate}
              backendCourses={teacherCourses.courses}
              backendCoursesLoading={teacherCourses.isLoading}
              backendCoursesError={teacherCourses.error}
            />
          )}

          {currentTab === "grades" && (
            <GradebookView onNavigate={handleNavigate} courses={teacherCourses.courses} />
          )}

          {currentTab === "attendance" && (
            <AttendanceWorkspaceView
              courses={courses}
              backendCourses={teacherCourses.courses}
              students={teacherStudents.students}
            />
          )}

          {currentTab === "materials" && (
            <MaterialLibraryView backendCourses={teacherCourses.courses} />
          )}

          {currentTab === "calendar" && (
            <TeacherCalendarView backendCourses={teacherCourses.courses} teacher={teacherProfile} />
          )}

          {currentTab === "messages" && (
            <TeacherMessagesView
              backendCourses={teacherCourses.courses}
              students={teacherStudents.students}
              teacherId={session.user.keycloakUserId ?? teacherProfile.id}
              teacherName={teacherProfile.name}
              teacherProfileId={teacherProfile.id}
            />
          )}

          {currentTab === "analytics" && (
            <TeacherAnalyticsView onNavigate={handleNavigate} courses={teacherCourses.courses} />
          )}

          {currentTab === "notifications" && (
            <NotificationCenterView
              onNavigate={handleNavigate}
              onUnreadCountChange={setNotificationUnreadCount}
            />
          )}

          {currentTab === "profile" && (
            <TeacherProfileView
              teacher={teacherProfile}
              courses={courses}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === "settings" && (
            <TeacherSettingsView
              teacher={teacherProfile}
              courses={courses}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode((current) => !current)}
              onLogout={async () => {
                await logoutTeacher();
                setSession(null);
              }}
            />
          )}
        </main>
      </div>

      {/* Global Quick Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
        courses={courses}
        students={teacherStudents.students}
        assignments={searchAssignments}
      />

      {/* Quick Create Dialog */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        type={quickCreateType}
        onClose={() => setIsQuickCreateOpen(false)}
        onCreated={handleItemCreated}
        backendCourses={teacherCourses.courses}
        teacherId={session?.user.id}
        onCreateQuiz={createQuiz}
      />
    </div>
  );
}
