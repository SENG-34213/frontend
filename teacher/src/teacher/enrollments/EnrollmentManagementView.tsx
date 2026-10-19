import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Users, UserPlus, UserMinus } from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import { useTeacherStudents } from "../hooks/useTeacherStudents";
import type { Course } from "../types";
import {
  createEnrollment,
  deleteEnrollment,
  getCourseEnrollments,
  updateEnrollment,
  type BackendEnrollment,
} from "../api/enrollmentApi";

type EnrollmentManagementViewProps = { courses: Course[]; backendCourses: BackendCourse[] };

export const EnrollmentManagementView: React.FC<EnrollmentManagementViewProps> = ({
  courses,
  backendCourses,
}) => {
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState(backendCourses[0]?.id ?? "");
  const [enrollments, setEnrollments] = useState<BackendEnrollment[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const studentState = useTeacherStudents(true, backendCourses);
  useEffect(() => {
    if (!courseId && backendCourses[0]?.id) setCourseId(backendCourses[0].id);
  }, [backendCourses, courseId]);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all(backendCourses.map((course) => getCourseEnrollments(course.id, controller.signal)))
      .then((results) => setEnrollments(results.flat()))
      .catch(() => {
        if (!controller.signal.aborted) setEnrollments([]);
      });
    return () => controller.abort();
  }, [backendCourses, studentState.students.length]);
  const refreshEnrollments = () => studentState.retry();
  const handleCreate = async () => {
    if (!studentId || !courseId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await createEnrollment({ studentId, courseIds: [courseId], status: "ACTIVE" });
      setStudentId("");
      refreshEnrollments();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Unable to create enrollment.",
      );
    } finally {
      setActionLoading(false);
    }
  };
  const handleStatus = async (enrollment: BackendEnrollment) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await updateEnrollment(enrollment.id, {
        status: enrollment.status === "INACTIVE" ? "ACTIVE" : "INACTIVE",
      });
      refreshEnrollments();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Unable to update enrollment.",
      );
    } finally {
      setActionLoading(false);
    }
  };
  const handleDelete = async (enrollmentId: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await deleteEnrollment(enrollmentId);
      refreshEnrollments();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Unable to delete enrollment.",
      );
    } finally {
      setActionLoading(false);
    }
  };
  const rows = useMemo(
    () =>
      studentState.students.flatMap((student) =>
        student.enrolledCourseIds.map((courseId) => ({
          id: `${student.id}:${courseId}`,
          student,
          course: courses.find((item) => item.id === courseId),
        })),
      ),
    [courses, studentState.students],
  );
  const filtered = rows.filter(({ student, course }) =>
    `${student.name} ${student.studentId} ${student.email} ${course?.code ?? ""} ${course?.title ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Course Enrollments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View the live enrollment roster for your assigned courses.
          </p>
        </div>
        <button
          type="button"
          onClick={studentState.retry}
          className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh roster
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          [
            "Enrolled Students",
            studentState.students.length,
            "Live from enrollment service",
            "text-indigo-600",
          ],
          [
            "Assigned Courses",
            backendCourses.length,
            "Teacher-owned course rosters",
            "text-slate-900",
          ],
          ["Enrollment Records", rows.length, "Student-course memberships", "text-emerald-600"],
        ].map(([label, value, hint, color]) => (
          <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">{label}</span>
            <div className={`text-2xl font-bold ${color} font-mono mt-1 tabular-nums`}>{value}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, ID, or course..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <UserPlus className="w-4 h-4 text-indigo-600" />
          Add student enrollment
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            placeholder="Student UUID"
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
          >
            <option value="">Select course</option>
            {backendCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={actionLoading || !studentId || !courseId}
            onClick={handleCreate}
            className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
          >
            Enroll student
          </button>
        </div>
        {actionError && <p className="text-xs text-rose-700">{actionError}</p>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {studentState.error && (
          <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-xs text-rose-800">
            {studentState.error.message}
            <button onClick={studentState.retry} className="ml-3 font-semibold underline">
              Try again
            </button>
          </div>
        )}
        {studentState.isLoading ? (
          <div className="px-5 py-12 text-center text-xs text-slate-500">
            Loading enrollments...
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                    No enrollment records found.
                  </td>
                </tr>
              ) : (
                filtered.map(({ id, student, course }) => {
                  const enrollment = enrollments.find(
                    (item) =>
                      item.studentId === student.id && item.courseIds.includes(course?.id ?? ""),
                  );
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[10px] font-semibold flex items-center justify-center">
                            {student.initials}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{student.name}</p>
                            <p className="text-[11px] text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{student.studentId}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-indigo-700">
                          {course?.code ?? "Course"}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {course?.title ?? "Unavailable"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {student.attendanceRate}%
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            disabled={!enrollment || actionLoading}
                            onClick={() => enrollment && handleStatus(enrollment)}
                            className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-[11px] font-semibold disabled:opacity-50"
                          >
                            <UserMinus className="w-3 h-3" />
                            {enrollment?.status === "INACTIVE" ? "Activate" : "Deactivate"}
                          </button>
                          <button
                            type="button"
                            disabled={!enrollment || actionLoading}
                            onClick={() => enrollment && handleDelete(enrollment.id)}
                            className="text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2 py-1 text-[11px] font-semibold disabled:opacity-50"
                          >
                            Remove
                          </button>
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1 text-[11px] font-semibold">
                            <Users className="w-3 h-3" /> Enrolled
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
