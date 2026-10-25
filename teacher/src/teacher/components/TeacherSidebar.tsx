import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  BookOpen,
  Layers,
  Users,
  ClipboardCheck,
  FolderOpen,
  FileCheck,
  HelpCircle,
  GraduationCap,
  Award,
  BarChart3,
  MessageSquare,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import { NavigationTab, TeacherProfile } from "../types";
import { TeacherAvatar } from "./TeacherAvatar";

interface TeacherSidebarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  teacher: TeacherProfile;
  courseCount: number;
  studentCount: number;
  pendingSubmissionsCount: number;
  unreadNotificationsCount: number;
  onLogout: () => void | Promise<void>;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  aiGlow?: boolean;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  currentTab,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  teacher,
  courseCount,
  studentCount,
  pendingSubmissionsCount,
  unreadNotificationsCount,
  onLogout,
}) => {
  const teacherInitials = teacher.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navGroups: NavGroup[] = [
    {
      groupName: "OVERVIEW",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "calendar", label: "My Calendar", icon: Calendar, badge: "Today" },
        {
          id: "notifications",
          label: "Notifications",
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
          badgeColor: "bg-rose-500 text-white",
        },
      ],
    },
    {
      groupName: "TEACHING",
      items: [
        { id: "courses", label: "My Courses", icon: BookOpen, badge: courseCount },
        { id: "curriculum", label: "Course Content", icon: Layers },
        { id: "students", label: "My Students", icon: Users, badge: studentCount },
        { id: "attendance", label: "Attendance", icon: ClipboardCheck },
        { id: "materials", label: "Learning Materials", icon: FolderOpen },
      ],
    },
    {
      groupName: "ASSESSMENTS",
      items: [
        {
          id: "assignments",
          label: "Assignments",
          icon: FileCheck,
          badge: pendingSubmissionsCount > 0 ? `${pendingSubmissionsCount}` : undefined,
          badgeColor: "bg-indigo-600 text-white",
        },
        { id: "quizzes", label: "Quizzes", icon: HelpCircle },
        { id: "exams", label: "Examinations", icon: GraduationCap },
        { id: "grades", label: "Grades & Results", icon: Award },
      ],
    },
    {
      groupName: "INSIGHTS & COMMUNICATION",
      items: [
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        {
          id: "messages",
          label: "Messages",
          icon: MessageSquare,
          badgeColor: "bg-indigo-600 text-white",
        },
      ],
    },
    {
      groupName: "ACCOUNT",
      items: [
        { id: "profile", label: "My Profile", icon: User },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  const handleItemClick = (tab: NavigationTab) => {
    onNavigate(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 selection:bg-indigo-100">
      {/* Brand & Workspace Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            M
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-sm">TiT</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                  Teacher
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Faculty Workspace</p>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop) or close (mobile) */}
        <div className="hidden lg:block">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="lg:hidden">
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase select-none">
                {group.groupName}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentTab === item.id ||
                  (item.id === "assignments" && currentTab === "grading-workspace");

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                        : item.aiGlow
                          ? "text-violet-700 hover:bg-violet-50/70 hover:text-violet-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-indigo-600"
                            : item.aiGlow
                              ? "text-violet-600"
                              : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                          item.badgeColor || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Profile Footer Card */}
      <div className="p-3 border-t border-slate-200 shrink-0">
        <div
          onClick={() => handleItemClick("profile")}
          className={`flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <TeacherAvatar name={teacher.name} avatarUrl={teacher.avatarUrl} className="w-8 h-8" />
          {!isCollapsed && (
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">{teacher.name}</p>
              <p className="text-[11px] text-slate-500 font-mono truncate">{teacher.teacherCode}</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={() => void onLogout()}
            className="mt-2 w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-18" : "w-64"
        }`}
      >
        <div
          className={`fixed top-0 bottom-0 z-30 transition-all duration-200 ease-in-out ${
            isCollapsed ? "w-18" : "w-64"
          }`}
        >
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
