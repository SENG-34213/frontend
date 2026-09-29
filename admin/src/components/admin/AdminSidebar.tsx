import { Icon } from "./Icon";
import type { AdminSection, AdminUser } from "@/features/admin/types";

export function AdminSidebar({ activeSection, adminUser, onNavigate, onSettings, onSignOut }: {
  activeSection: AdminSection; adminUser: AdminUser | null; onNavigate: (section: AdminSection) => void;
  onSettings: () => void; onSignOut: () => void;
}) {
  const nav = (section: AdminSection, label: string, icon: "users" | "book" | "calendar" | "mail") => <>
    <a className={`nav-link ${activeSection === section ? "active" : ""}`} href="#registration" onClick={(event) => { event.preventDefault(); onNavigate(section); }}><Icon name={icon}/><span>{label}</span>{activeSection === section && <span className="nav-chevron"><Icon name="chevron" size={16}/></span>}</a>
    {activeSection === section && <a className="nav-link sub-link selected" href="#registration"><span className="sub-dot"/>{section === "student" ? "Register student" : section === "teacher" ? "Register teacher" : section === "course" ? "Create course" : section === "grade" ? "Manage grades" : section === "communication" ? "Manage groups" : "Enroll student"}</a>}
  </>;
  return <aside className="sidebar">
    <a className="brand" href="#top" aria-label="Mentify home"><span className="brand-mark"><span>m</span></span><span className="brand-name">mentify<span>.</span></span></a>
    <div className="workspace-label">WORKSPACE</div><div className="workspace-picker"><span className="workspace-avatar">M</span><span className="workspace-copy"><strong>Mentify Academy</strong><small>Education workspace</small></span><span className="workspace-dots">···</span></div>
    <nav className="nav-group" aria-label="Main navigation"><span className="nav-caption">OVERVIEW</span><a className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`} href="#registration" onClick={(event) => { event.preventDefault(); onNavigate("dashboard"); }}><Icon name="grid"/><span>Dashboard</span></a><span className="nav-caption nav-caption-spaced">PEOPLE</span>{nav("student", "Students", "users")}{nav("teacher", "Teachers", "users")}<span className="nav-caption nav-caption-spaced">LEARNING</span>{nav("grade", "Grades", "book")}{nav("course", "Courses", "book")}{nav("enrollment", "Enrollments", "calendar")}<span className="nav-caption nav-caption-spaced">COMMUNITY</span>{nav("communication", "Communication", "mail")}</nav>
    <div className="sidebar-bottom"><a className="nav-link" href="#api-settings" onClick={(event) => { event.preventDefault(); onSettings(); }}><Icon name="settings"/><span>{adminUser ? "Account settings" : "Admin sign in"}</span></a><div className="profile-card"><div className="profile-avatar">{adminUser ? `${adminUser.firstName?.[0] || "A"}${adminUser.lastName?.[0] || "D"}` : "AD"}</div><span className="profile-copy"><strong>{adminUser ? `${adminUser.firstName || "Admin"} ${adminUser.lastName || ""}` : "Admin session"}</strong><small>{adminUser?.email || "Sign in to get started"}</small></span><button className="profile-menu" type="button" onClick={() => adminUser ? onSignOut() : onSettings()} aria-label={adminUser ? "Sign out" : "Sign in"}>{adminUser ? "↗" : "···"}</button></div></div>
  </aside>;
}
