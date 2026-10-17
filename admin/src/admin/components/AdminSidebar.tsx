import React, { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Bell,
  Users,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  UserCheck,
  BookOpen,
  UserPlus,
  Layers,
  FileCheck2,
  HelpCircle,
  Award,
  CalendarCheck2,
  FolderLock,
  Calendar,
  MessageSquare,
  Sparkles,
  FileText,
  Activity,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  Shield,
  X,
} from "lucide-react";
import { AdminRole } from "../types";

export type AdminRoute =
  | "dashboard"
  | "analytics"
  | "notifications"
  | "users"
  | "students"
  | "teachers"
  | "administrators"
  | "registrations"
  | "courses"
  | "enrollments"
  | "academic"
  | "assignments"
  | "quizzes"
  | "examinations"
  | "grades"
  | "attendance"
  | "materials"
  | "calendar"
  | "communication"
  | "ai-assistant"
  | "reports"
  | "audit"
  | "settings"
  | "profile";

interface AdminSidebarProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  role: AdminRole;
  pendingInvitationsCount?: number;
  unreadNotificationsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentRoute,
  onNavigate,
  role,
  pendingInvitationsCount = 12,
  unreadNotificationsCount = 2,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    OVERVIEW: false,
    USER_MANAGEMENT: false,
    ACADEMIC_MANAGEMENT: false,
    PLATFORM_OPERATIONS: false,
    ADMINISTRATION: false,
  });

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navSections = [
    {
      key: "OVERVIEW",
      label: "Overview",
      items: [
        { id: "dashboard" as AdminRoute, label: "Dashboard", icon: LayoutDashboard },
        { id: "analytics" as AdminRoute, label: "Analytics", icon: BarChart3 },
        {
          id: "notifications" as AdminRoute,
          label: "Notifications",
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
        },
      ],
    },
    {
      key: "USER_MANAGEMENT",
      label: "User Management",
      items: [
        { id: "users" as AdminRoute, label: "All Users", icon: Users },
        { id: "students" as AdminRoute, label: "Students", icon: GraduationCap },
        { id: "teachers" as AdminRoute, label: "Teachers", icon: Briefcase },
        {
          id: "administrators" as AdminRoute,
          label: "Administrators",
          icon: ShieldAlert,
          superAdminOnly: true,
        },
        {
          id: "registrations" as AdminRoute,
          label: "Registrations & Invitations",
          icon: UserCheck,
          badge: pendingInvitationsCount > 0 ? pendingInvitationsCount : undefined,
        },
      ],
    },
    {
      key: "ACADEMIC_MANAGEMENT",
      label: "Academic Management",
      items: [
        { id: "courses" as AdminRoute, label: "Courses", icon: BookOpen },
        { id: "enrollments" as AdminRoute, label: "Enrollments", icon: UserPlus },
        { id: "academic" as AdminRoute, label: "Modules & Lessons", icon: Layers },
        { id: "assignments" as AdminRoute, label: "Assignments", icon: FileCheck2 },
        { id: "quizzes" as AdminRoute, label: "Quizzes", icon: HelpCircle },
        { id: "examinations" as AdminRoute, label: "Examinations", icon: Award },
        { id: "grades" as AdminRoute, label: "Grades & Results", icon: BarChart3 },
        { id: "attendance" as AdminRoute, label: "Attendance", icon: CalendarCheck2 },
      ],
    },
    {
      key: "PLATFORM_OPERATIONS",
      label: "Platform Operations",
      items: [
        { id: "materials" as AdminRoute, label: "Learning Materials", icon: FolderLock },
        { id: "calendar" as AdminRoute, label: "Calendar", icon: Calendar },
        { id: "communication" as AdminRoute, label: "Communication", icon: MessageSquare },
        { id: "ai-assistant" as AdminRoute, label: "Mentify AI", icon: Sparkles },
        { id: "reports" as AdminRoute, label: "Reports", icon: FileText },
      ],
    },
    {
      key: "ADMINISTRATION",
      label: "Administration",
      items: [
        { id: "audit" as AdminRoute, label: "Audit & Activity", icon: Activity },
        { id: "settings" as AdminRoute, label: "Settings", icon: Settings },
        { id: "profile" as AdminRoute, label: "My Profile", icon: User },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Mentify
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Enterprise Workspace</p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Banner Indicator */}
      <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {role === "SUPER_ADMIN" ? "Super Admin Mode" : "Admin Mode"}
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-500 tabular-nums">Keycloak RBAC</span>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section) => {
          // Check if section has any visible items for current role
          const visibleItems = section.items.filter(
            (item) => !item.superAdminOnly || role === "SUPER_ADMIN",
          );
          if (visibleItems.length === 0) return null;

          const isCollapsed = collapsedSections[section.key];

          return (
            <div key={section.key} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <span>{section.label}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate(item.id);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded tabular-nums ${
                              isActive
                                ? "bg-indigo-200/80 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
            AM
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              Alex Mercer
            </p>
            <p className="text-[11px] text-slate-400 truncate">alex.mercer@mentify.edu</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/50 backdrop-blur-xs">
          <div className="w-72 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
