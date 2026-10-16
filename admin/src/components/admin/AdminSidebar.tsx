import { Icon } from "./Icon";
import type { AdminSection, AdminUser } from "@/features/admin/types";

export function AdminSidebar({
  activeSection,
  adminUser,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onSettings,
  onSignOut,
  onSubNavigate,
}: {
  activeSection: AdminSection;
  adminUser: AdminUser | null;
  onNavigate: (section: AdminSection) => void;
  onSettings: () => void;
  onSignOut: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSubNavigate?: (section: AdminSection) => void;
}) {
  const nav = (
    section: AdminSection,
    label: string,
    icon:
      | "users"
      | "student"
      | "teacher"
      | "book"
      | "graduation"
      | "courses"
      | "calendar"
      | "enrollments"
      | "communication"
      | "ai",
  ) => (
    <>
      <a
        className={`nav-link ${activeSection === section ? "active" : ""}`}
        href="#registration"
        onClick={(event) => {
          event.preventDefault();
          onNavigate(section);
        }}
      >
        <Icon name={icon} />
        <span>{label}</span>
        {activeSection === section && (
          <span className="nav-chevron">
            <Icon name="chevron" size={16} />
          </span>
        )}
      </a>
      {activeSection === section && (
        <a
          className="nav-link sub-link selected"
          href="#registration"
          onClick={(event) => {
            event.preventDefault();
            (onSubNavigate || onNavigate)(section);
          }}
        >
          <span className="sub-dot" />
          {section === "student"
            ? "Register student"
            : section === "teacher"
              ? "Register teacher"
              : section === "course"
                ? "Create course"
                : section === "grade"
                  ? "Manage grades"
                  : section === "materials"
                    ? "Manage materials"
                    : section === "communication"
                      ? "Manage groups"
                      : section === "ai-assistant"
                        ? "Ask Mentify AI"
                        : "Enroll student"}
        </a>
      )}
    </>
  );
  return (
    <aside className="sidebar">
      <div className="sidebar-brand-row">
        <a className="brand" href="#top" aria-label="Mentify home">
          <span className="brand-mark">
            <span>m</span>
          </span>
          <span className="brand-name">
            mentify<span>.</span>
          </span>
        </a>
        <button
          type="button"
          className={`sidebar-collapse-toggle ${collapsed ? "is-collapsed" : ""}`}
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name="chevron" size={15} />
        </button>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace-picker">
        <span className="workspace-avatar">M</span>
        <span className="workspace-copy">
          <strong>Mentify Academy</strong>
          <small>Education workspace</small>
        </span>
        <span className="workspace-dots">···</span>
      </div>
      <nav className="nav-group" aria-label="Main navigation">
        <span className="nav-caption">OVERVIEW</span>
        <a
          className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
          href="#registration"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("dashboard");
          }}
        >
          <Icon name="dashboard" />
          <span>Dashboard</span>
        </a>
        <a
          className={`nav-link ${activeSection === "reports" ? "active" : ""}`}
          href="#registration"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("reports");
          }}
        >
          <Icon name="analytics" />
          <span>Reports &amp; analytics</span>
          {activeSection === "reports" && (
            <span className="nav-chevron">
              <Icon name="chevron" size={16} />
            </span>
          )}
        </a>
        <span className="nav-caption nav-caption-spaced">PEOPLE</span>
        {nav("student", "Students", "student")}
        {nav("teacher", "Teachers", "teacher")}
        <span className="nav-caption nav-caption-spaced">LEARNING</span>
        {nav("grade", "Grades", "graduation")}
        {nav("course", "Courses", "courses")}
        {nav("calendar", "Sessions & Calendar", "calendar")}
        {nav("materials", "Materials", "book")}
        {nav("enrollment", "Enrollments", "enrollments")}
        <span className="nav-caption nav-caption-spaced">COMMUNITY</span>
        {nav("communication", "Communication", "communication")}
        {nav("ai-assistant", "AI Assistant", "ai")}
      </nav>
      <div className="sidebar-bottom">
        <a
          className="nav-link"
          href="#api-settings"
          onClick={(event) => {
            event.preventDefault();
            onSettings();
          }}
        >
          <Icon name="settings" />
          <span>{adminUser ? "Account settings" : "Admin sign in"}</span>
        </a>
        <div className="profile-card">
          <div className="profile-avatar">
            {adminUser
              ? `${adminUser.firstName?.[0] || "A"}${adminUser.lastName?.[0] || "D"}`
              : "AD"}
          </div>
          <span className="profile-copy">
            <strong>
              {adminUser
                ? `${adminUser.firstName || "Admin"} ${adminUser.lastName || ""}`
                : "Admin session"}
            </strong>
            <small>{adminUser?.email || "Sign in to get started"}</small>
          </span>
          <button
            className="profile-menu"
            type="button"
            onClick={() => (adminUser ? onSignOut() : onSettings())}
            aria-label={adminUser ? "Sign out" : "Sign in"}
          >
            {adminUser ? "↗" : "···"}
          </button>
        </div>
      </div>
    </aside>
  );
}
