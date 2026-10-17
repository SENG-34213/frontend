import React, { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { EnrollmentRecord, Course, StudentProfile } from "../types";

interface EnrollmentManagementProps {
  enrollments: EnrollmentRecord[];
  courses: Course[];
  students: StudentProfile[];
  onCreateEnrollment: (studentId: string, courseIds: string[]) => Promise<unknown>;
  onUpdateEnrollmentStatus: (enrollmentId: string, status: any) => void;
}

export const EnrollmentManagement: React.FC<EnrollmentManagementProps> = ({
  enrollments,
  courses,
  students,
  onCreateEnrollment,
  onUpdateEnrollmentStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentGradeFilter, setStudentGradeFilter] = useState("ALL");
  const [studentEnrollmentFilter, setStudentEnrollmentFilter] = useState<"UNENROLLED" | "ALL">(
    "UNENROLLED",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const studentGradeLabel = (student: StudentProfile) => {
    const value = student.grade || "Not assigned";
    return /^Grade\s/i.test(value) || value === "Not assigned" ? value : `Grade ${value}`;
  };

  const hasEnrollment = (studentId: string) =>
    enrollments.some((enrollment) => enrollment.studentId === studentId);

  const availableStudentGrades = Array.from(
    new Set(students.map(studentGradeLabel).filter((grade) => grade !== "Not assigned")),
  ).sort();

  const filteredModalStudents = students.filter((student) => {
    const query = studentSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.studentId.toLowerCase().includes(query);
    const matchesGrade =
      studentGradeFilter === "ALL" || studentGradeLabel(student) === studentGradeFilter;
    const matchesEnrollment =
      studentEnrollmentFilter === "ALL" || !hasEnrollment(student.id);
    return matchesSearch && matchesGrade && matchesEnrollment;
  });

  const openEnrollModal = () => {
    const firstUnenrolledStudent = students.find((student) => !hasEnrollment(student.id));
    setSelectedStudentId(firstUnenrolledStudent?.id || students[0]?.id || "");
    setSelectedCourseIds([]);
    setStudentSearch("");
    setStudentGradeFilter("ALL");
    setStudentEnrollmentFilter("UNENROLLED");
    setFormError("");
    setIsEnrollModalOpen(true);
  };

  const handleEnroll = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedStudentId || selectedCourseIds.length === 0) {
      setFormError("Select one student and at least one course.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      await onCreateEnrollment(selectedStudentId, selectedCourseIds);
      setIsEnrollModalOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to enroll the student.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        actions={
          <button
            onClick={openEnrollModal}
            disabled={students.length === 0 || courses.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        }
      />

      {(students.length === 0 || courses.length === 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Create at least one registered student and one course before assigning enrollment.
        </div>
      )}

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

      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Enroll Student in Courses
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Assign one or more active courses to a registered student.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnroll} className="pt-5 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Find student
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {filteredModalStudents.length} matching
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 mb-3">
                  <input
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Search name, email, or student ID..."
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <select
                    value={studentGradeFilter}
                    onChange={(event) => setStudentGradeFilter(event.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="ALL">All grades</option>
                    {availableStudentGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <select
                    value={studentEnrollmentFilter}
                    onChange={(event) =>
                      setStudentEnrollmentFilter(event.target.value as "UNENROLLED" | "ALL")
                    }
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="UNENROLLED">Unenrolled only</option>
                    <option value="ALL">All students</option>
                  </select>
                </div>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredModalStudents.length === 0 ? (
                    <div className="px-3 py-5 text-center text-xs text-slate-500">
                      No students match these filters. Try “All students” or adjust the grade/search.
                    </div>
                  ) : (
                    filteredModalStudents.map((student) => {
                      const selected = selectedStudentId === student.id;
                      const enrolled = hasEnrollment(student.id);
                      return (
                        <button
                          type="button"
                          key={student.id}
                          onClick={() => setSelectedStudentId(student.id)}
                          className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                            selected
                              ? "bg-indigo-50 dark:bg-indigo-950/40"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="block text-[11px] text-slate-500 truncate">
                              {student.studentId} · {student.email}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-[11px] font-medium text-indigo-600 dark:text-indigo-300">
                              {studentGradeLabel(student)}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {enrolled ? "Already enrolled" : "Not enrolled"}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Courses
                  </label>
                  <span className="text-[11px] text-slate-400">{selectedCourseIds.length} selected</span>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {courses.map((course) => {
                    const checked = selectedCourseIds.includes(course.id);
                    return (
                      <label
                        key={course.id}
                        className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedCourseIds((previous) =>
                              checked
                                ? previous.filter((id) => id !== course.id)
                                : [...previous, course.id],
                            )
                          }
                          className="h-4 w-4 accent-indigo-600"
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {course.title}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            {course.code} · {course.gradeName || course.grade || "Grade not specified"}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{formError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white"
                >
                  {isSubmitting ? "Saving enrollment..." : "Confirm Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
