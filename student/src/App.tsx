import React, { useEffect, useRef, useState } from "react";
import { StudentLoginView } from "./components/auth/StudentLoginView";
import { changeStudentPassword, logoutStudent, restoreStudentAuth } from "./api/auth";
import { clearSession } from "./auth/authStorage";
import { SetPasswordPanel } from "../../shared/auth/SetPasswordPanel";
import type { AuthSession } from "./auth/authTypes";
import { StudentProvider, useStudent } from "./context/StudentContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNavbar } from "./components/layout/TopNavbar";
import { CommandPalette } from "./components/layout/CommandPalette";
import { StudentDashboard } from "./components/dashboard/StudentDashboard";
import { MyCoursesView } from "./components/courses/MyCoursesView";
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
import { NotificationsView } from "./components/notifications/NotificationsView";
import { ProfileView } from "./components/profile/ProfileView";
import { SettingsView } from "./components/profile/SettingsView";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";

const MainLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { currentView, isSidebarCollapsed, toastMessage, clearToast, setCurrentView } =
    useStudent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const historyReadyRef = useRef(false);
  const browserBackRef = useRef(false);

  useEffect(() => {
    const validViews = new Set([
      "dashboard",
      "my-courses",
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
    ]);

    if (!historyReadyRef.current) {
      const urlView = new URLSearchParams(window.location.search).get("view");
      if (urlView && validViews.has(urlView) && urlView !== currentView) {
        setCurrentView(urlView as Parameters<typeof setCurrentView>[0]);
      } else {
        const url = new URL(window.location.href);
        url.searchParams.set("view", currentView);
        window.history.replaceState({ portal: "student", view: currentView }, "", url);
      }
      historyReadyRef.current = true;
      return;
    }

    if (browserBackRef.current) {
      browserBackRef.current = false;
      return;
    }

    const url = new URL(window.location.href);
    if (url.searchParams.get("view") === currentView) return;
    url.searchParams.set("view", currentView);
    window.history.pushState({ portal: "student", view: currentView }, "", url);
  }, [currentView, setCurrentView]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const stateView = typeof event.state?.view === "string" ? event.state.view : null;
      const urlView = new URLSearchParams(window.location.search).get("view");
      const nextView = stateView || urlView;
      if (!nextView) return;
      browserBackRef.current = true;
      setCurrentView(nextView as Parameters<typeof setCurrentView>[0]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setCurrentView]);

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <StudentDashboard />;
      case "my-courses":
        return <MyCoursesView />;
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
        <div className="pointer-events-auto fixed bottom-5 right-5 z-50 flex w-[min(calc(100vw-2.5rem),24rem)] items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl animate-in slide-in-from-bottom-3 duration-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
          {/failed|could not|unable|unavailable|error|not supported|paused|not available|invalid/i.test(
            toastMessage,
          ) ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          ) : /download|updated|saved|completed|success|marked|sent|copied/i.test(toastMessage) ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          )}
          <p className="min-w-0 flex-1 text-xs font-semibold leading-5">{toastMessage}</p>
          <button
            type="button"
            onClick={clearToast}
            className="shrink-0 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  useEffect(() => {
    restoreStudentAuth()
      .then((restoredSession) => {
        setSession(restoredSession);
        setRequiresPasswordChange(Boolean(restoredSession?.mustChangePassword));
      })
      .finally(() => setIsRestoring(false));
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => setSession(null);
    window.addEventListener("student:session-expired", handleExpiredSession);
    return () => window.removeEventListener("student:session-expired", handleExpiredSession);
  }, []);

  if (isRestoring) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        Loading your secure workspace…
      </main>
    );
  }
  if (!session) {
    return (
      <StudentLoginView
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
        roleLabel="Student"
        onSubmit={async (currentPassword, newPassword) => {
          await changeStudentPassword(currentPassword, newPassword);
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
