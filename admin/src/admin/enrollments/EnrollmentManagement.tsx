import React, { useState } from "react";
import { Search, Filter, UserCheck, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { EnrollmentRecord, Course } from "../types";

interface EnrollmentManagementProps {
  enrollments: EnrollmentRecord[];
  courses: Course[];
  onUpdateEnrollmentStatus: (enrollmentId: string, status: any) => void;
}

export const EnrollmentManagement: React.FC<EnrollmentManagementProps> = ({
  enrollments,
  courses,
  onUpdateEnrollmentStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredEnrollments = enrollments.filter((e) => {
    const matchesSearch =
      e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "ALL" || e.courseCode === courseFilter;
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment Management"
        description="Monitor student course rosters, approval states, completion velocity, and institutional quotas."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academic Management" },
          { label: "Enrollments" },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, ID, or course code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <span className="text-xs text-slate-400 tabular-nums">
            {filteredEnrollments.length} enrollments
          </span>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Course</th>
                <th className="py-3 px-4 font-semibold">Enrolled Date</th>
                <th className="py-3 px-4 font-semibold">Progress</th>
                <th className="py-3 px-4 font-semibold">Current Grade</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEnrollments.map((enr) => (
                <tr
                  key={enr.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {enr.studentName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{enr.studentId}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono block">
                      {enr.courseCode}
                    </span>
                    <span className="text-slate-500">{enr.courseTitle}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 tabular-nums">{enr.enrolledDate}</td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${enr.progressPercentage}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-slate-600 dark:text-slate-400 text-[11px]">
                        {enr.progressPercentage}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {enr.grade || "—"}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={enr.status as any} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    {enr.status === "PENDING_APPROVAL" ? (
                      <button
                        onClick={() => onUpdateEnrollmentStatus(enr.id, "ACTIVE")}
                        className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                      >
                        Approve Enrollment
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">Verified</span>
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
