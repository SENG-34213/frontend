import { Icon } from "./Icon";
import type { AdminSection, AdminUser } from "@/features/admin/types";

export function AdminHeader({
  activeSection,
  adminUser,
  onSettings,
  onNavigate,
}: {
  activeSection: AdminSection;
  adminUser: AdminUser | null;
  onSettings: () => void;
  onNavigate?: (section: AdminSection) => void;
}) {
  const section =
    activeSection === "dashboard"
      ? "Dashboard"
      : activeSection === "reports"
        ? "Reports & analytics"
        : activeSection === "student"
          ? "Students"
          : activeSection === "teacher"
            ? "Teachers"
            : activeSection === "course"
              ? "Courses"
              : activeSection === "grade"
                ? "Grades"
                : activeSection === "calendar"
                  ? "Sessions & Calendar"
                  : activeSection === "enrollment"
                    ? "Enrollments"
                    : activeSection === "materials"
                      ? "Materials Library"
                      : activeSection === "ai-assistant"
                        ? "AI Assistant"
                        : "Communication";
  const category =
    activeSection === "dashboard" || activeSection === "reports"
      ? "Overview"
      : activeSection === "course" ||
          activeSection === "grade" ||
          activeSection === "calendar" ||
          activeSection === "enrollment" ||
          activeSection === "materials"
        ? "Learning Ops"
        : activeSection === "communication" || activeSection === "ai-assistant"
          ? "Workspace"
          : "People";
  const subpage =
    activeSection === "course"
      ? "Curriculum"
      : activeSection === "grade"
        ? "Manage"
        : activeSection === "calendar"
          ? "Schedule"
          : activeSection === "enrollment"
            ? "Workspace"
            : activeSection === "materials"
              ? "Repository"
              : activeSection === "communication"
                ? "Groups"
                : activeSection === "ai-assistant"
                  ? "Assistant"
                  : "Directory";
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>{category}</span>
        <Icon name="chevron" size={14} />
        <span className="crumb-current">{section}</span>
        {activeSection !== "dashboard" && (
          <>
            <Icon name="chevron" size={14} />
            <span className="crumb-current">{subpage}</span>
          </>
        )}
      </div>
      <div className="topbar-right">
        <button
          type="button"
          className={`topbar-icon-button ${activeSection === "calendar" ? "active" : ""}`}
          onClick={() => onNavigate?.("calendar")}
          aria-label="Open calendar"
          title="Calendar"
        >
          <Icon name="calendar" size={17} />
        </button>
        <button
          type="button"
          className="topbar-icon-button has-notification"
          aria-label="Notifications"
          title="Notifications"
        >
          <Icon name="alert" size={17} />
          <i>3</i>
        </button>
        <button type="button" className="topbar-icon-button" aria-label="Messages" title="Messages">
          <Icon name="mail" size={17} />
        </button>
        <button
          type="button"
          className="topbar-icon-button"
          onClick={onSettings}
          aria-label="Open settings"
          title="Settings"
        >
          <Icon name="settings" size={17} />
        </button>
        <span className="secure-indicator">
          <span className="secure-dot" />
          {adminUser
            ? `Signed in as ${adminUser.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}`
            : "Admin sign in required"}
        </span>
        <button
          className="top-avatar"
          aria-label={adminUser ? "Account settings" : "Sign in"}
          onClick={onSettings}
        >
          {adminUser ? `${adminUser.firstName?.[0] || "A"}${adminUser.lastName?.[0] || "D"}` : "AD"}
        </button>
      </div>
    </header>
  );
}
