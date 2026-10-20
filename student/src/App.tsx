import React, { useEffect, useState } from "react";
import { StudentLoginView } from "./components/auth/StudentLoginView";
import { logoutStudent, restoreStudentAuth } from "./api/auth";
import type { AuthSession } from "./auth/authTypes";
import { StudentProvider, useStudent } from "./context/StudentContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNavbar } from "./components/layout/TopNavbar";
import { CommandPalette } from "./components/layout/CommandPalette";
import { StudentDashboard } from "./components/dashboard/StudentDashboard";
import { MyCoursesView } from "./components/courses/MyCoursesView";
import { ExploreCoursesView } from "./components/courses/ExploreCoursesView";
import { CourseDetailsView } from "./components/courses/CourseDetailsView";
import { CourseWorkspaceView } from "./components/courses/CourseWorkspaceView";
import { EnrollmentsView } from "./components/enrollments/EnrollmentsView";
import { LearningMaterialsView } from "./components/materials/LearningMaterialsView";
import { AssignmentsView } from "./components/assignments/AssignmentsView";
import { AssignmentDetailView } from "./components/assignments/AssignmentDetailView";
import { QuizzesView } from "./components/quizzes/QuizzesView";
import { QuizTakingView } from "./components/quizzes/QuizTakingView";
import { ExaminationsView } from "./components/examinations/ExaminationsView";
import { ExamTakingView } from "./components/examinations/ExamTakingView";
import { GradesView } from "./components/grades/GradesView";
import { StudentCalendarView } from "./components/calendar/StudentCalendarView";
import { MessagesView } from "./components/messages/MessagesView";
import { MentifyAIView } from "./components/ai/MentifyAIView";
import { NotificationsView } from "./components/notifications/NotificationsView";
import { ProfileView } from "./components/profile/ProfileView";
import { SettingsView } from "./components/profile/SettingsView";
import { X, CheckCircle2 } from "lucide-react";

const MainLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { currentView, isSidebarCollapsed, toastMessage } = useStudent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <StudentDashboard />;
      case "my-courses":
        return <MyCoursesView />;
      case "explore-courses":
        return <ExploreCoursesView />;
      case "course-details":
        return <CourseDetailsView />;
      case "course-workspace":
        return <CourseWorkspaceView />;
      case "enrollments":
        return <EnrollmentsView />;
      case "materials":
        return <LearningMaterialsView />;
      case "assignments":
        return <AssignmentsView />;
      case "assignment-details":
        return <AssignmentDetailView />;
      case "quizzes":
        return <QuizzesView />;
      case "quiz-taking":
        return <QuizTakingView />;
      case "examinations":
        return <ExaminationsView />;
      case "exam-taking":
        return <ExamTakingView />;
      case "grades":
        return <GradesView />;
      case "calendar":
        return <StudentCalendarView />;
      case "messages":
        return <MessagesView />;
      case "mentify-ai":
        return <MentifyAIView />;
      case "notifications":
        return <NotificationsView />;
      case "profile":
        return <ProfileView />;
      case "settings":
        return <SettingsView />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-72 max-w-[80%] flex-1 flex-col bg-white dark:bg-slate-900 shadow-2xl">
            <Sidebar />
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile navigation menu"
              className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container Area with dynamic left margin for Sidebar */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <TopNavbar onMobileMenuOpen={() => setMobileMenuOpen(true)} onLogout={onLogout} />

        <main className="flex-1 px-4 py-6 sm:px-8 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette />

      {/* Global Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 shadow-xl dark:border-indigo-900 dark:bg-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    restoreStudentAuth()
      .then(setSession)
      .finally(() => setIsRestoring(false));
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => setSession(null);
    window.addEventListener("student:session-expired", handleExpiredSession);
    return () => window.removeEventListener("student:session-expired", handleExpiredSession);
  }, []);

  if (isRestoring) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        Loading your secure workspace…
      </main>
    );
  }
  if (!session) return <StudentLoginView onLogin={setSession} />;

  return (
    <StudentProvider authUser={session.user}>
      <MainLayout
        onLogout={async () => {
          await logoutStudent();
          setSession(null);
        }}
      />
    </StudentProvider>
  );
}
