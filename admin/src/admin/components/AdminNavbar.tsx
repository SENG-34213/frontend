import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
  UserPlus,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  BookOpen,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Menu,
  Shield,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { AdminRole, NotificationItem } from "../types";
import { AdminRoute } from "./AdminSidebar";
import { UserAvatar } from "./UserAvatar";
import type { CurrentAdminProfile } from "../api/profileApi";

interface AdminNavbarProps {
  currentRoute: AdminRoute;
  role: AdminRole;
  onNavigate: (route: AdminRoute) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onOpenMobileMenu: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onQuickAction: (action: string) => void;
  onOpenSearch: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  profile: CurrentAdminProfile | null;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentRoute,
  role,
  onNavigate,
  notifications,
  onMarkNotificationRead,
  onOpenMobileMenu,
  isSidebarCollapsed,
  onToggleSidebar,
  onQuickAction,
  onOpenSearch,
  isDarkMode,
  onToggleTheme,
  onLogout,
  profile,
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const quickActionsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const routeTitles: Record<AdminRoute, string> = {
    dashboard: "Platform Overview",
    analytics: "Analytics & Insights",
    notifications: "Notification Center",
    students: "Student Management",
    teachers: "Teacher Management",
    administrators: "Administrator Oversight",
    registrations: "Registrations & Invitations",
    courses: "Course Management",
    enrollments: "Enrollment Directory",
    academic: "Modules & Curriculum",
    assignments: "Assignment Oversight",
    quizzes: "Quiz Analytics",
    examinations: "Examination Management",
    grades: "Grade Management",
    results: "Grades & Results",
    attendance: "Attendance Management",
    materials: "Learning Materials",
    marketplace: "Digital Material Marketplace",
    calendar: "Academic Operations Calendar",
    communication: "Communication & Announcements",
    "ai-assistant": "TiT AI Assistant",
    reports: "Academic & Audit Reports",
    audit: "System Audit & Activity",
    settings: "Platform Settings",
    profile: "Admin Profile",
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Page breadcrumb title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span>Admin</span>
            <span>/</span>
            <span className="capitalize">{currentRoute.replace("-", " ")}</span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
            {routeTitles[currentRoute] || "TiT Admin"}
          </h1>
        </div>
      </div>

      {/* Middle/Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search platform...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setShowQuickActions((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Actions</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                User Provisioning
              </div>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onQuickAction("register-student");
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Register Student</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onQuickAction("register-teacher");
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Register Teacher</span>
              </button>

              {role === "SUPER_ADMIN" && (
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onQuickAction("register-admin");
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors text-left"
                >
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>Register Administrator</span>
                </button>
              )}

              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-t border-slate-100 dark:border-slate-800 mt-1">
                Academic & Operations
              </div>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onQuickAction("create-course");
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Create New Course</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onNavigate("registrations");
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>View Pending Invitations</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onNavigate("calendar");
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Open Operations Calendar</span>
              </button>
            </div>
          )}
        </div>

        {/* TiT AI Shortcut */}
        {/* Calendar Shortcut */}
        <button
          onClick={() => onNavigate("calendar")}
          className={`p-2 rounded-lg transition-colors relative ${
            currentRoute === "calendar"
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
              : "text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="Academic Calendar"
          aria-label="Open academic calendar"
        >
          <Calendar className="w-4 h-4" />
        </button>

        {/* TiT AI Shortcut */}
        <button
          onClick={() => onNavigate("ai-assistant")}
          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          title="TiT AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications((p) => !p)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 animate-in fade-in duration-150">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Platform Notifications
                  </h3>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {unreadCount} unread items
                  </span>
                </div>
                <button
                  onClick={() => onNavigate("notifications")}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onMarkNotificationRead(item.id);
                      if (item.linkAction) onNavigate(item.linkAction as AdminRoute);
                      setShowNotifications(false);
                    }}
                    className={`p-3 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      !item.read ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
          title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu((p) => !p)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <UserAvatar
              name={profile ? `${profile.firstName} ${profile.lastName}` : "Admin"}
              avatarUrl={profile?.avatarUrl}
              size="sm"
            />
            <div className="hidden xl:block text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block leading-tight">
                {profile ? `${profile.firstName} ${profile.lastName}` : "Admin"}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                {role === "SUPER_ADMIN" ? "Super Administrator" : "Administrator"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {profile ? `${profile.firstName} ${profile.lastName}` : "Admin"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{profile?.email || ""}</p>
                <p className="mt-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                  {role === "SUPER_ADMIN" ? "Super Administrator" : "Administrator"}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate("profile");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate("settings");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Settings</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
