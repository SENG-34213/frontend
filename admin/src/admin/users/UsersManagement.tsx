import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  MailCheck,
  Send,
  Eye,
  ShieldCheck,
  Ban,
  UserCheck,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RoleBadge } from "../components/RoleBadge";
import { StatusBadge } from "../components/StatusBadge";
import { UserAvatar } from "../components/UserAvatar";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { DetailDrawer } from "../components/DetailDrawer";
import {
  BaseUser,
  StudentProfile,
  TeacherProfile,
  AdministratorProfile,
  AdminRole,
  UserRole,
  AccountStatus,
} from "../types";

interface UsersManagementProps {
  students: StudentProfile[];
  teachers: TeacherProfile[];
  administrators: AdministratorProfile[];
  currentAdminRole: AdminRole;
  onUpdateUserStatus: (userId: string, newStatus: AccountStatus) => void;
  onDeleteUser: (userId: string) => Promise<void>;
  onResendInvitation: (email: string, role: string) => Promise<void>;
  onRegisterStudent: () => void;
  onRegisterTeacher: () => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  students,
  teachers,
  administrators,
  currentAdminRole,
  onUpdateUserStatus,
  onDeleteUser,
  onResendInvitation,
  onRegisterStudent,
  onRegisterTeacher,
  isLoading = false,
  error,
  onRetry,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    user: any | null;
    action: "ACTIVATE" | "DEACTIVATE" | "DELETE";
  }>({ isOpen: false, user: null, action: "DEACTIVATE" });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  const handleResend = async (email: string, role: string) => {
    setResendingEmail(email);
    try {
      await onResendInvitation(email, role);
    } finally {
      setResendingEmail(null);
    }
  };

  // Merge users for unified directory
  const allUsers = useMemo(() => {
    const list: (BaseUser & { idCode?: string; gradeOrDept?: string })[] = [];
    students.forEach((s) =>
      list.push({
        ...s,
        idCode: s.studentId,
        gradeOrDept: s.grade,
      }),
    );
    teachers.forEach((t) =>
      list.push({
        ...t,
        idCode: t.teacherCode,
        gradeOrDept: t.specializations.join(", "),
      }),
    );
    if (currentAdminRole === "SUPER_ADMIN") {
      administrators.forEach((a) =>
        list.push({
          ...a,
          idCode: a.adminCode,
          gradeOrDept: a.department,
        }),
      );
    }
    return list;
  }, [students, teachers, administrators, currentAdminRole]);

  // Filtering
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchesSearch =
        u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.idCode && u.idCode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchQuery, roleFilter, statusFilter]);

  const handleStatusChangeClick = (user: any, action: "ACTIVATE" | "DEACTIVATE") => {
    setConfirmDialog({
      isOpen: true,
      user,
      action,
    });
  };

  const handleConfirmStatusChange = () => {
    if (confirmDialog.user) {
      const newStatus: AccountStatus = confirmDialog.action === "ACTIVATE" ? "ACTIVE" : "SUSPENDED";
      onUpdateUserStatus(confirmDialog.user.id, newStatus);
      setConfirmDialog({ isOpen: false, user: null, action: "DEACTIVATE" });
    }
  };

  const handleDeleteClick = (user: any) => {
    setConfirmDialog({ isOpen: true, user, action: "DELETE" });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.user) return;

    const user = confirmDialog.user;
    setDeletingUserId(user.id);
    try {
      await onDeleteUser(user.id);
      setSelectedUser(null);
      setConfirmDialog({ isOpen: false, user: null, action: "DEACTIVATE" });
    } catch {
      // The parent displays the API error toast; keep the confirmation open so the user can retry.
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Users Management"
        description="Unified institutional directory across Spring Boot identity providers and Keycloak realms."
        breadcrumbs={[{ label: "Admin" }, { label: "User Management" }, { label: "All Users" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onRegisterStudent}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              + Register Student
            </button>
            <button
              onClick={onRegisterTeacher}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              + Register Teacher
            </button>
          </div>
        }
      />

      {isLoading && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
          Loading users from the Mentify backend…
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <span>{error}</span>
          {onRetry && (
            <button onClick={onRetry} className="font-semibold underline">
              Retry
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or institutional code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            {currentAdminRole === "SUPER_ADMIN" && <option value="ADMIN">Administrators</option>}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INVITED">Invited</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <span className="text-xs text-slate-400 pl-2 tabular-nums">
            {filteredUsers.length} total users
          </span>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Institutional Code</th>
                <th className="py-3 px-4 font-semibold">Account Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No users match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={`${user.firstName} ${user.lastName}`} size="md" />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-slate-400">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {user.idCode || "—"}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={user.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                          title="View user details"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          View
                        </button>

                        {user.status === "INVITED" && (
                          <button
                            disabled={resendingEmail === user.email}
                            onClick={() => void handleResend(user.email, user.role)}
                            className="px-2 py-1 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-medium flex items-center gap-1 disabled:cursor-wait disabled:opacity-60"
                            title="Resend invitation email"
                          >
                            {resendingEmail === user.email ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            {resendingEmail === user.email ? "Sending..." : "Resend"}
                          </button>
                        )}

                        {user.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusChangeClick(user, "DEACTIVATE")}
                            className="px-2 py-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                            title="Suspend account access"
                          >
                            Suspend
                          </button>
                        )}

                        {user.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleStatusChangeClick(user, "ACTIVATE")}
                            className="px-2 py-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium"
                            title="Re-activate account access"
                          >
                            Activate
                          </button>
                        )}

                        {user.role !== "SUPER_ADMIN" && (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            disabled={deletingUserId === user.id}
                            className="px-2 py-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium disabled:opacity-50"
                            title="Delete user account"
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Account Status Changes */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.action === "DELETE"
            ? `Delete ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}?`
            : confirmDialog.action === "DEACTIVATE"
              ? `Suspend Account for ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}?`
              : `Re-activate Account for ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}?`
        }
        description={
          confirmDialog.action === "DELETE"
            ? "This permanently removes the user account, profile, address, and linked sign-in account. This action cannot be undone."
            : confirmDialog.action === "DEACTIVATE"
              ? "Suspending this user account will revoke active Keycloak session tokens and temporarily disable access to Mentify portals and LMS coursework."
              : "Re-activating this user account will restore Keycloak authentication privileges and grant immediate access back to their assigned courses and records."
        }
        consequences={
          confirmDialog.action === "DELETE"
            ? [
                "The user will no longer be able to sign in",
                "Student, teacher, or administrator profile data will be deleted",
                "Existing records in other services may still retain this user’s history",
              ]
            : confirmDialog.action === "DEACTIVATE"
              ? [
                  "Immediate termination of active JWT tokens across all microservices",
                  "User will not be able to log in to Student or Teacher portals",
                  "Course enrollments and historical assignment data remain intact in PostgreSQL",
                ]
              : [
                  "Keycloak user status updated to enabled",
                  "User can immediately sign in with existing credentials",
                ]
        }
        confirmText={
          confirmDialog.action === "DELETE"
            ? deletingUserId
              ? "Deleting..."
              : "Delete User"
            : confirmDialog.action === "DEACTIVATE"
              ? "Suspend Account"
              : "Re-activate Account"
        }
        variant={
          confirmDialog.action === "DELETE" || confirmDialog.action === "DEACTIVATE"
            ? "danger"
            : "primary"
        }
        onConfirm={
          confirmDialog.action === "DELETE"
            ? () => void handleConfirmDelete()
            : handleConfirmStatusChange
        }
        onCancel={() => setConfirmDialog({ isOpen: false, user: null, action: "DEACTIVATE" })}
      />

      {/* User Details Slide-out Drawer */}
      {selectedUser && (
        <DetailDrawer
          isOpen={!!selectedUser}
          title={`${selectedUser.firstName} ${selectedUser.lastName}`}
          subtitle={`${selectedUser.role} · ${selectedUser.idCode || selectedUser.id}`}
          onClose={() => setSelectedUser(null)}
          width="lg"
        >
          <div className="space-y-6">
            {/* Header profile block */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <UserAvatar name={`${selectedUser.firstName} ${selectedUser.lastName}`} size="lg" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <RoleBadge role={selectedUser.role} />
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>
            </div>

            {/* Core Attributes */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Identity & Contact Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-0.5">Primary Email</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedUser.email}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-0.5">Phone Number</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedUser.phone || "Not recorded"}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-0.5">Created Date</span>
                  <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString()
                      : "Not available"}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 block mb-0.5">Last SSO Login</span>
                  <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleString()
                      : "Never logged in"}
                  </span>
                </div>
              </div>
            </div>

            {/* Role-specific details */}
            {selectedUser.role === "STUDENT" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Student Academic Profile
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Grade Level</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedUser.grade}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Attendance Mode</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedUser.attendanceMode}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Guardian Name</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedUser.guardianName}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Guardian Contact</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedUser.guardianPhone}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedUser.role === "TEACHER" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Faculty Attributes
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Teacher Code</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">
                      {selectedUser.teacherCode}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Hire Date</span>
                    <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                      {selectedUser.hireDate}
                    </span>
                  </div>
                  <div className="col-span-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-1">Approved Specializations</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUser.specializations?.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};
