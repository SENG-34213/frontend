import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Calendar,
  Sparkles,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { StudentView } from "../../types";

interface TopNavbarProps {
  onMobileMenuOpen: () => void;
}

const VIEW_TITLES: Record<StudentView, { title: string; category: string }> = {
  dashboard: { title: "Dashboard", category: "Overview" },
  "my-courses": { title: "My Courses", category: "Learning" },
  "explore-courses": { title: "Explore Courses", category: "Course Discovery" },
  "course-details": { title: "Course Details", category: "Learning" },
  "course-workspace": { title: "Learning Workspace", category: "Classroom" },
  enrollments: { title: "My Enrollments", category: "Academic Records" },
  materials: { title: "Learning Materials", category: "Resource Library" },
  assignments: { title: "Assignments", category: "Assessments" },
  "assignment-details": { title: "Assignment Details", category: "Assessments" },
  quizzes: { title: "Quizzes", category: "Assessments" },
  "quiz-taking": { title: "Live Assessment Workspace", category: "Quizzes" },
  examinations: { title: "Examinations", category: "Assessments" },
  "exam-taking": { title: "Examination Session", category: "Examinations" },
  grades: { title: "Grades & Results", category: "Academic Records" },
  calendar: { title: "Student Calendar", category: "Planning" },
  messages: { title: "Messages & Discussions", category: "Communication" },
  "mentify-ai": { title: "Mentify AI Assistant", category: "Intelligent Study" },
  notifications: { title: "Notifications", category: "Alerts" },
  profile: { title: "Student Profile", category: "Account" },
  settings: { title: "Settings", category: "Preferences" },
};

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMobileMenuOpen }) => {
  const {
    currentView,
    setCurrentView,
    theme,
    toggleTheme,
    setIsCommandPaletteOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    profile,
    showToast,
  } = useStudent();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);
  const viewInfo = VIEW_TITLES[currentView] || { title: "Portal", category: "Mentify" };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      {/* Zone 1: Breadcrumbs & Mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"
        >
          <button
            onClick={() => setCurrentView("dashboard")}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Mentify
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="hidden sm:inline text-slate-600 dark:text-slate-300">
            {viewInfo.category}
          </span>
          <ChevronRight className="hidden sm:inline h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[240px]">
            {viewInfo.title}
          </span>
        </nav>
      </div>

      {/* Zone 2: Command Palette search trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100/80 transition-all dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Search courses, assignments, materials...</span>
          </div>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Search className="h-4.5 w-4.5" />
        </button>

        {/* Quick Calendar shortcut */}
        <button
          onClick={() => setCurrentView("calendar")}
          aria-label="Open Calendar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          title="Student Calendar"
        >
          <Calendar className="h-4.5 w-4.5" />
        </button>

        {/* Mentify AI Assistant quick button */}
        <button
          onClick={() => setCurrentView("mentify-ai")}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors dark:border-indigo-900/50 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/80"
          title="Open Mentify AI Study Assistant"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Mentify AI</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Notifications
                </span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.actionView) setCurrentView(n.actionView);
                      setIsNotifOpen(false);
                    }}
                    className={`cursor-pointer rounded-lg p-2.5 transition-colors ${
                      n.read
                        ? "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        : "bg-indigo-50/60 hover:bg-indigo-50 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {n.type === "DEADLINE" ? (
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : n.type === "GRADE" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {n.description}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                          {n.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setCurrentView("notifications");
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
        >
          {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-semibold text-white shadow-2xs">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-slate-700 dark:text-slate-200">
              {profile.name}
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{profile.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {profile.email}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Keycloak SSO Active · {profile.studentId}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentView("profile");
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Student Profile</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentView("settings");
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={() => {
                    showToast("Keycloak session is secure and active.");
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-3.5 w-3.5 text-slate-400" />
                  <span>Keycloak Session Info</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
