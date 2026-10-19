"use client";
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
    isAuthenticated,
    isLiveConnected,
    openAuthModal,
    signOut,
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
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium"
          >
            Mentify
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-400">{viewInfo.category}</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white">{viewInfo.title}</span>
        </nav>
      </div>

      {/* Zone 2: Global Search with keyboard shortcut trigger */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-400 shadow-2xs hover:border-slate-300 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500 dark:hover:border-slate-700 dark:hover:bg-slate-800 transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            <span>Search courses, assignments, materials...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Quick Action Icons & Status */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Backend Connectivity Status Badge */}
        {isLiveConnected ? (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Backend (8080)</span>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            title="Click to sign in with live backend"
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Demo Mode</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold ml-0.5">
              · Sign in
            </span>
          </button>
        )}

        {/* Calendar Shortcut */}
        <button
          onClick={() => setCurrentView("calendar")}
          aria-label="Student Calendar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
        >
          <Calendar className="h-4.5 w-4.5" />
        </button>

        {/* Mentify AI Shortcut */}
        <button
          onClick={() => setCurrentView("mentify-ai")}
          aria-label="Mentify AI Assistant"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 transition-colors"
        >
          <Sparkles className="h-4.5 w-4.5" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Open notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Notifications
                  </span>
                  {unreadNotifs.length > 0 && (
                    <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 my-1">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.actionView) setCurrentView(n.actionView);
                      setIsNotifOpen(false);
                    }}
                    className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      n.read
                        ? "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                        : "bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400">
                      {n.type === "DEADLINE" ? (
                        <AlertCircle className="h-3.5 w-3.5" />
                      ) : n.type === "GRADE" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight">{n.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {n.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                        {n.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-2 text-center dark:border-slate-800">
                <button
                  onClick={() => {
                    setCurrentView("notifications");
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
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
                  <span>
                    {isLiveConnected
                      ? `Keycloak SSO Active · ${profile.studentId}`
                      : `Demo Mode Active · ${profile.studentId}`}
                  </span>
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

                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      signOut();
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out (Switch to Demo)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      openAuthModal();
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 font-semibold"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Sign In to Backend Gateway</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
