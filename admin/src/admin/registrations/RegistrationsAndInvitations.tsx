import React, { useState } from "react";
import {
  Send,
  MailCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RoleBadge } from "../components/RoleBadge";
import { StatusBadge } from "../components/StatusBadge";
import { UserAvatar } from "../components/UserAvatar";
import { StudentProfile, TeacherProfile, AdministratorProfile } from "../types";

interface RegistrationsAndInvitationsProps {
  students: StudentProfile[];
  teachers: TeacherProfile[];
  administrators: AdministratorProfile[];
  onResendInvitation: (email: string, role: string) => Promise<void>;
}

export const RegistrationsAndInvitations: React.FC<RegistrationsAndInvitationsProps> = ({
  students,
  teachers,
  administrators,
  onResendInvitation,
}) => {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("INVITED");
  const [searchQuery, setSearchQuery] = useState("");
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  // Combine invited / recently registered accounts
  const allAccounts = [
    ...students.map((s) => ({
      id: s.id,
      code: s.studentId,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      role: "STUDENT" as const,
      status: s.status,
      date: s.createdAt,
    })),
    ...teachers.map((t) => ({
      id: t.id,
      code: t.teacherCode,
      name: `${t.firstName} ${t.lastName}`,
      email: t.email,
      role: "TEACHER" as const,
      status: t.status,
      date: t.createdAt,
    })),
    ...administrators.map((a) => ({
      id: a.id,
      code: a.adminCode,
      name: `${a.firstName} ${a.lastName}`,
      email: a.email,
      role: a.role,
      status: a.status,
      date: a.createdAt,
    })),
  ];

  const filteredAccounts = allAccounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || acc.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || acc.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleResend = async (email: string, role: string) => {
    setResendingEmail(email);
    try {
      await onResendInvitation(email, role);
    } finally {
      setResendingEmail(null);
    }
  };

  const invitedCount = allAccounts.filter((a) => a.status === "INVITED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrations & Invitations Operations"
        description="Manage new accounts, invitations, email delivery, and account activation."
        breadcrumbs={[{ label: "Admin" }, { label: "User Management" }, { label: "Registrations" }]}
      />

      {/* Operational Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Pending Account Activations</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {invitedCount}
          </div>
          <span className="text-[11px] text-amber-600">Eligible for invitation resend</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Provisioned Accounts</span>
            <UserCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {allAccounts.length}
          </div>
          <span className="text-[11px] text-slate-400">Synchronized across realms</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Activation Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            98.8%
          </div>
          <span className="text-[11px] text-emerald-600">Avg activation within 4 hours</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="INVITED">Pending Invited ({invitedCount})</option>
            <option value="ACTIVE">Active Users</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Account / Code</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Invitation Dispatched</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAccounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={acc.name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {acc.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                            {acc.code}
                          </span>
                        </div>
                        <span className="text-slate-400 block">{acc.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <RoleBadge role={acc.role} />
                  </td>

                  <td className="py-3 px-4 text-slate-500 tabular-nums">
                    {new Date(acc.date).toLocaleDateString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={acc.status} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    {acc.status === "INVITED" ? (
                      <button
                        disabled={resendingEmail === acc.email}
                        onClick={() => handleResend(acc.email, acc.role)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-medium inline-flex items-center gap-1.5 text-xs transition-colors shadow-xs"
                      >
                        {resendingEmail === acc.email ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Resend Invitation</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">Activated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
