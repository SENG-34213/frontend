"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { NavigationTab, Course } from "../teacher/types";
import {
  mockTeacherProfile,
  mockCourses,
  mockAssignments,
  mockConversations,
} from "../teacher/data/mockData";
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
import { EnrollmentManagementView } from "../teacher/enrollments/EnrollmentManagementView";
import { AssignmentDashboardView } from "../teacher/assignments/AssignmentDashboardView";
import { SubmissionReviewWorkspace } from "../teacher/assignments/SubmissionReviewWorkspace";
import { QuizDashboardView } from "../teacher/quizzes/QuizDashboardView";
import { ExamManagementView } from "../teacher/exams/ExamManagementView";
import { GradebookView } from "../teacher/grades/GradebookView";
import { AttendanceWorkspaceView } from "../teacher/attendance/AttendanceWorkspaceView";
import { MaterialLibraryView } from "../teacher/materials/MaterialLibraryView";
import { TeacherCalendarView } from "../teacher/calendar/TeacherCalendarView";
import { TeacherMessagesView } from "../teacher/communication/TeacherMessagesView";
import { MentifyAIWorkspaceView } from "../teacher/ai-assistant/MentifyAIWorkspaceView";
import { TeacherAnalyticsView } from "../teacher/analytics/TeacherAnalyticsView";
import { NotificationCenterView } from "../teacher/notifications/NotificationCenterView";
import { TeacherProfileView } from "../teacher/profile/TeacherProfileView";
import { TeacherSettingsView } from "../teacher/settings/TeacherSettingsView";
import { TeacherLoginView } from "../teacher/auth/TeacherLoginView";
import { getCurrentTeacher, logoutTeacher } from "../teacher/api/auth";
import { restoreTeacherSession } from "../teacher/api/client";
import type { AuthSession } from "../teacher/auth/authTypes";
import { useTeacherShellData } from "../teacher/hooks/useTeacherShellData";
import { useTeacherCourses } from "../teacher/hooks/useTeacherCourses";
import { useTeacherNotifications } from "../teacher/hooks/useTeacherNotifications";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const restoreStartedRef = useRef(false);
  const [currentTab, setCurrentTab] = useState<NavigationTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

  // Quick Create Modal state
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<QuickCreateType | null>("assignment");

  // Deep view states
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [activeGradingAssignmentId, setActiveGradingAssignmentId] = useState<string>("asg-01");
  const [aiPreloadedPrompt, setAiPreloadedPrompt] = useState<string>("");
  const shellData = useTeacherShellData(Boolean(session));
  const teacherCourses = useTeacherCourses(Boolean(session));
  const recentNotifications = useTeacherNotifications(Boolean(session), 4);

  // Course state
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  // Counts
  const pendingSubmissionsCount = mockAssignments.reduce(
    (acc, a) => acc + (a.totalSubmissions - a.gradedCount),
    0,
  );
  const unreadMessagesCount = mockConversations.reduce((acc, c) => acc + c.unreadCount, 0);
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
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  useEffect(() => {
    if (!teacherCourses.isLoading && !teacherCourses.error) {
      setCourses(
        teacherCourses.courses.map((course) => ({
          id: course.id,
          code: course.subject || "COURSE",
          title: course.courseName,
          description: course.courseDescription || "No course description available.",
          category: course.subject || "Academic Course",
          level: "Undergraduate",
          semester: "Current Semester",
          academicYear: "",
          enrolledCount: course.numberOfStudents ?? 0,
          maxCapacity: course.numberOfStudents ?? 0,
          status:
            course.courseStatus === "PUBLISHED"
              ? "Active"
              : course.courseStatus === "ARCHIVED"
                ? "Archived"
                : "Draft",
          coverTheme: "indigo",
          modulesCount: 0,
          assignmentsCount: 0,
          averageGrade: 0,
        })),
      );
    }
  }, [teacherCourses.courses, teacherCourses.error, teacherCourses.isLoading]);

  useEffect(() => {
    setNotificationUnreadCount(shellData.unreadNotificationsCount);
  }, [shellData.unreadNotificationsCount]);

  // Navigation handler
  const handleNavigate = (tab: NavigationTab, param?: string) => {
    if (tab !== "courses") {
      setSelectedCourseForDetail(null);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenGradeAssignment = (assignmentId: string) => {
    setActiveGradingAssignmentId(assignmentId);
    setCurrentTab("grading-workspace");
  };

  const handleOpenAIWithPrompt = (prompt: string) => {
    setAiPreloadedPrompt(prompt);
    setCurrentTab("ai-assistant");
  };

  const handleOpenQuickCreate = (type: QuickCreateType) => {
    setQuickCreateType(type);
    setIsQuickCreateOpen(true);
  };

  const handleItemCreated = (type: QuickCreateType, item: any) => {
    if (type === "course") {
      const newCourse: Course = {
        id: item.id,
        code: item.title.split(" ")[0] || "CS-999",
        title: item.title,
        description: item.description || "Newly created academic course syllabus.",
        category: "Computer Science",
        level: "Undergraduate",
        semester: "Fall Semester",
        academicYear: "2026-2027",
        enrolledCount: 0,
        maxCapacity: 50,
        status: "Active",
        coverTheme: "indigo",
        modulesCount: 0,
        assignmentsCount: 0,
        averageGrade: 0,
      };
      setCourses([newCourse, ...courses]);
      setSelectedCourseForDetail(newCourse);
      setCurrentTab("courses");
    } else if (type === "assignment") {
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

  if (!session) return <TeacherLoginView onLogin={setSession} />;

  if (shellData.isLoading) {
    return <div className="min-h-screen bg-slate-50" aria-label="Loading teacher workspace" />;
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

  const teacherProfile = shellData.teacherProfile ?? mockTeacherProfile;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Global Teacher Sidebar */}
      <TeacherSidebar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        teacher={teacherProfile}
        onLogout={async () => {
          await logoutTeacher();
          setSession(null);
        }}
        pendingSubmissionsCount={pendingSubmissionsCount}
        unreadMessagesCount={unreadMessagesCount}
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
              onOpenAIWithPrompt={handleOpenAIWithPrompt}
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
                onEditCourse={(c) => alert(`Editing metadata for ${c.code}...`)}
              />
            ) : (
              <CourseListView
                courses={courses}
                onSelectCourse={(c) => setSelectedCourseForDetail(c)}
                onOpenCreateCourse={() => handleOpenQuickCreate("course")}
                onNavigate={handleNavigate}
              />
            ))}

          {currentTab === "curriculum" && <CurriculumBuilderView onNavigate={handleNavigate} />}

          {currentTab === "students" && (
            <StudentDirectoryView
              onNavigate={handleNavigate}
              onSendMessage={(studentName) => setCurrentTab("messages")}
              courses={courses}
              backendCourses={teacherCourses.courses}
            />
          )}

          {currentTab === "enrollments" && (
            <EnrollmentManagementView courses={courses} backendCourses={teacherCourses.courses} />
          )}

          {currentTab === "assignments" && (
            <AssignmentDashboardView
              onGradeAssignment={handleOpenGradeAssignment}
              onOpenCreateAssignment={() => handleOpenQuickCreate("assignment")}
              onNavigate={handleNavigate}
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
              onOpenAIWithPrompt={handleOpenAIWithPrompt}
            />
          )}

          {currentTab === "exams" && (
            <ExamManagementView
              onNavigate={handleNavigate}
              backendCourses={teacherCourses.courses}
            />
          )}

          {currentTab === "grades" && <GradebookView onNavigate={handleNavigate} />}

          {currentTab === "attendance" && (
            <AttendanceWorkspaceView courses={courses} backendCourses={teacherCourses.courses} />
          )}

          {currentTab === "materials" && <MaterialLibraryView />}

          {currentTab === "calendar" && (
            <TeacherCalendarView backendCourses={teacherCourses.courses} />
          )}

          {currentTab === "messages" && <TeacherMessagesView />}

          {currentTab === "ai-assistant" && (
            <MentifyAIWorkspaceView initialPrompt={aiPreloadedPrompt} />
          )}

          {currentTab === "analytics" && <TeacherAnalyticsView onNavigate={handleNavigate} />}

          {currentTab === "notifications" && (
            <NotificationCenterView
              onNavigate={handleNavigate}
              onUnreadCountChange={setNotificationUnreadCount}
            />
          )}

          {currentTab === "profile" && (
            <TeacherProfileView teacher={teacherProfile} onNavigate={handleNavigate} />
          )}

          {currentTab === "settings" && <TeacherSettingsView teacher={teacherProfile} />}
        </main>
      </div>

      {/* Global Quick Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Quick Create Dialog */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        type={quickCreateType}
        onClose={() => setIsQuickCreateOpen(false)}
        onCreated={handleItemCreated}
      />
    </div>
  );
}
