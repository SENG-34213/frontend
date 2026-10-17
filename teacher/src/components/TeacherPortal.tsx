"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { NavigationTab, Course } from "../teacher/types";
import {
  mockTeacherProfile,
  mockCourses,
  mockAssignments,
  mockNotifications,
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Quick Create Modal state
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<QuickCreateType | null>("assignment");

  // Deep view states
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [activeGradingAssignmentId, setActiveGradingAssignmentId] = useState<string>("asg-01");
  const [aiPreloadedPrompt, setAiPreloadedPrompt] = useState<string>("");

  // Course state
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  // Counts
  const pendingSubmissionsCount = mockAssignments.reduce(
    (acc, a) => acc + (a.totalSubmissions - a.gradedCount),
    0,
  );
  const unreadMessagesCount = mockConversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadNotificationsCount = mockNotifications.filter((n) => !n.read).length;

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
        teacher={mockTeacherProfile}
        pendingSubmissionsCount={pendingSubmissionsCount}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
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
          teacher={mockTeacherProfile}
          unreadNotificationsCount={unreadNotificationsCount}
        />

        {/* View Routing */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {currentTab === "dashboard" && (
            <DashboardView
              onNavigate={handleNavigate}
              onGradeAssignment={handleOpenGradeAssignment}
              onOpenAIWithPrompt={handleOpenAIWithPrompt}
            />
          )}

          {currentTab === "courses" &&
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
            />
          )}

          {currentTab === "enrollments" && <EnrollmentManagementView />}

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
              onOpenCreateQuiz={() => handleOpenQuickCreate("quiz")}
              onNavigate={handleNavigate}
              onOpenAIWithPrompt={handleOpenAIWithPrompt}
            />
          )}

          {currentTab === "exams" && <ExamManagementView onNavigate={handleNavigate} />}

          {currentTab === "grades" && <GradebookView onNavigate={handleNavigate} />}

          {currentTab === "attendance" && <AttendanceWorkspaceView />}

          {currentTab === "materials" && <MaterialLibraryView />}

          {currentTab === "calendar" && <TeacherCalendarView />}

          {currentTab === "messages" && <TeacherMessagesView />}

          {currentTab === "ai-assistant" && (
            <MentifyAIWorkspaceView initialPrompt={aiPreloadedPrompt} />
          )}

          {currentTab === "analytics" && <TeacherAnalyticsView onNavigate={handleNavigate} />}

          {currentTab === "notifications" && <NotificationCenterView onNavigate={handleNavigate} />}

          {currentTab === "profile" && <TeacherProfileView onNavigate={handleNavigate} />}

          {currentTab === "settings" && <TeacherSettingsView />}
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
