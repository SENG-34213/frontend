import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  GraduationCap,
  FolderArchive,
  FileCheck2,
  HelpCircle,
  Award,
  BarChart3,
  Calendar,
  MessageSquare,
  Sparkles,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { StudentView } from "../../types";

interface NavItem {
  id: StudentView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlight?: boolean;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isSidebarCollapsed,
    toggleSidebar,
    assignments,
    conversations,
    notifications,
    profile,
  } = useStudent();

  const pendingAssignmentsCount = assignments.filter((a) => a.status === "PENDING").length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const navGroups: NavGroup[] = [
    {
      groupName: "Learning",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "my-courses", label: "My Courses", icon: BookOpen },
        { id: "explore-courses", label: "Explore Courses", icon: Compass },
        { id: "enrollments", label: "My Enrollments", icon: GraduationCap },
        { id: "materials", label: "Learning Materials", icon: FolderArchive },
      ],
    },
    {
      groupName: "Assessments",
      items: [
        {
          id: "assignments",
          label: "Assignments",
          icon: FileCheck2,
          badge: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : undefined,
        },
        { id: "quizzes", label: "Quizzes", icon: HelpCircle },
        { id: "examinations", label: "Examinations", icon: Award },
        { id: "grades", label: "Grades & Results", icon: BarChart3 },
      ],
    },
    {
      groupName: "Collaboration",
      items: [
        { id: "calendar", label: "My Calendar", icon: Calendar },
        {
          id: "messages",
          label: "Messages",
          icon: MessageSquare,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
        },
        {
          id: "mentify-ai",
          label: "Mentify AI",
          icon: Sparkles,
          highlight: true,
        },
        {
          id: "notifications",
          label: "Notifications",
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
        },
      ],
    },
    {
      groupName: "Account",
      items: [
        { id: "profile", label: "Student Profile", icon: User },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        <button
          onClick={() => setCurrentView("dashboard")}
          className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
            <span className="font-display text-xl font-bold tracking-tight">M</span>
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Mentify
              </span>
              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                Student Portal
              </span>
            </div>
          )}
        </button>

        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            {!isSidebarCollapsed && (
              <h3 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {group.groupName}
              </h3>
            )}
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentView === item.id ||
                  (item.id === "my-courses" &&
                    (currentView === "course-details" || currentView === "course-workspace")) ||
                  (item.id === "assignments" && currentView === "assignment-details") ||
                  (item.id === "quizzes" && currentView === "quiz-taking") ||
                  (item.id === "examinations" && currentView === "exam-taking");

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                        : item.highlight
                          ? "text-indigo-600 hover:bg-indigo-50/70 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : item.highlight
                            ? "text-indigo-500 dark:text-indigo-400"
                            : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {/* Notification or Count Badges */}
                    {item.badge !== undefined && (
                      <span
                        className={`${
                          isSidebarCollapsed
                            ? "absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600"
                            : "ml-auto rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                        }`}
                      >
                        {!isSidebarCollapsed && item.badge}
                      </span>
                    )}

                    {/* Subtle active pill indicator on left edge */}
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Footer / SSO Session status */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          onClick={() => setCurrentView("profile")}
          className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {profile.name}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{profile.studentId}</span>
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
