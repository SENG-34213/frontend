import { Icon } from "./Icon";
import type { AdminSection, AdminUser } from "@/features/admin/types";

export function AdminHeader({ activeSection, adminUser, onSettings }: { activeSection: AdminSection; adminUser: AdminUser | null; onSettings: () => void }) {
  const section = activeSection === "student" ? "Students" : activeSection === "teacher" ? "Teachers" : activeSection === "course" ? "Courses" : "Enrollments";
  return <header className="topbar"><div className="breadcrumb"><span>{activeSection === "course" || activeSection === "enrollment" ? "Academic" : "People"}</span><Icon name="chevron" size={14}/><span className="crumb-current">{section}</span><Icon name="chevron" size={14}/><span className="crumb-current">{activeSection === "course" ? "Create" : activeSection === "enrollment" ? "Enroll student" : "Register"}</span></div><div className="topbar-right"><span className="secure-indicator"><span className="secure-dot"/>{adminUser ? `Signed in as ${adminUser.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}` : "Admin sign in required"}</span><button className="top-avatar" aria-label={adminUser ? "Account settings" : "Sign in"} onClick={onSettings}>{adminUser ? `${adminUser.firstName?.[0] || "A"}${adminUser.lastName?.[0] || "D"}` : "AD"}</button></div></header>;
}
