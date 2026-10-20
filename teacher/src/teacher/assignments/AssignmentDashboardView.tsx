import React, { useEffect, useState } from "react";
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  ClipboardList,
  Clock,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Assignment, NavigationTab } from "../types";
import type { BackendCourse } from "../api/courseApi";
import {
  closeAssignment,
  deleteAssignment,
  getCourseAssignments,
  publishAssignment,
  updateAssignment,
  type BackendAssignment,
} from "../api/assignmentApi";
import { StatusBadge } from "../components/StatusBadge";
import { ApiError } from "../api/client";
import { ConfirmModal, TextInputModal } from "../components/ActionModal";

interface AssignmentDashboardViewProps {
  onGradeAssignment: (assignmentId: string) => void;
  onOpenCreateAssignment: () => void;
  onNavigate: (tab: NavigationTab) => void;
  backendCourses?: BackendCourse[];
  refreshToken?: number;
}

const toAssignment = (item: BackendAssignment, courses: BackendCourse[]): Assignment => {
  const course = courses.find((entry) => entry.id === item.courseId);
  const due = new Date(item.dueDate);
  return {
    id: item.id,
    courseId: item.courseId,
    courseCode: course?.subject || course?.courseName || item.courseId,
    title: item.title,
    description: item.description || item.instructions || "",
    dueDate: Number.isNaN(due.getTime()) ? item.dueDate : due.toLocaleDateString(),
    dueTime: Number.isNaN(due.getTime())
      ? ""
      : due.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    maxMarks: item.maxMarks,
    weightagePercent: 0,
    status: item.status === "PUBLISHED" ? "Active" : item.status === "CLOSED" ? "Closed" : "Draft",
    totalSubmissions: item.totalSubmissions ?? 0,
    gradedCount: item.gradedCount ?? 0,
    totalStudents: course?.numberOfStudents ?? 0,
    rubricItems: (item.rubricItems || []).map((rubric) => ({
      criterion: rubric.criterion,
      marks: rubric.marks,
    })),
  };
};

export const AssignmentDashboardView: React.FC<AssignmentDashboardViewProps> = ({
  onGradeAssignment,
  onOpenCreateAssignment,
  onNavigate,
  backendCourses = [],
  refreshToken = 0,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [backendAssignments, setBackendAssignments] = useState<BackendAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingAssignment, setEditingAssignment] = useState<BackendAssignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (backendCourses.length === 0) {
      setBackendAssignments([]);
      setAssignments([]);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    Promise.allSettled(
      backendCourses.map((course) => getCourseAssignments(course.id, controller.signal)),
    )
      .then((results) => {
        if (controller.signal.aborted) return;

        const successfulResponses = results.filter(
          (result): result is PromiseFulfilledResult<BackendAssignment[]> =>
            result.status === "fulfilled",
        );
        const failedResponses = results.filter((result) => result.status === "rejected");
        const loaded = successfulResponses.flatMap((result) => result.value);
        const nonNotFoundFailures = failedResponses.filter(
          (result) => !(result.reason instanceof ApiError && result.reason.status === 404),
        );

        setBackendAssignments(loaded);
        setAssignments(loaded.map((item) => toAssignment(item, backendCourses)));

        // A course can legitimately have no assignment resource yet. One failed
        // course must not hide assignments belonging to the other courses.
        if (successfulResponses.length > 0 || nonNotFoundFailures.length === 0) {
          setError(null);
        } else {
          const firstFailure = nonNotFoundFailures[0].reason;
          setError(
            firstFailure instanceof Error ? firstFailure.message : "Assignments failed to load.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [backendCourses, refreshToken]);

  const handleStatusChange = async (assignment: Assignment, action: "publish" | "close") => {
    try {
      const updated =
        action === "publish"
          ? await publishAssignment(assignment.id)
          : await closeAssignment(assignment.id);
      setAssignments((current) =>
        current.map((entry) =>
          entry.id === assignment.id ? toAssignment(updated, backendCourses) : entry,
        ),
      );
      setBackendAssignments((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Assignment status could not be updated.",
      );
    }
  };

  const handleEdit = async (title: string) => {
    const record = editingAssignment;
    if (!record || title.trim() === record.title) {
      setEditingAssignment(null);
      return;
    }
    try {
      const updated = await updateAssignment(record.id, {
        title: title.trim(),
        description: record.description,
        instructions: record.instructions,
        startDate: record.startDate,
        dueDate: record.dueDate,
        maxMarks: record.maxMarks,
        allowedAttempts: record.allowedAttempts,
        allowLateSubmission: record.allowLateSubmission,
        latePenaltyPercentage: record.latePenaltyPercentage,
      });
      setBackendAssignments((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      setAssignments((current) =>
        current.map((entry) =>
          entry.id === updated.id ? toAssignment(updated, backendCourses) : entry,
        ),
      );
      setEditingAssignment(null);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error ? requestError.message : "Assignment could not be updated.",
      );
    }
  };

  const handleDelete = async () => {
    const assignment = deletingAssignment;
    if (!assignment) return;
    try {
      await deleteAssignment(assignment.id);
      setBackendAssignments((current) => current.filter((entry) => entry.id !== assignment.id));
      setAssignments((current) => current.filter((entry) => entry.id !== assignment.id));
      setDeletingAssignment(null);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error ? requestError.message : "Assignment could not be deleted.",
      );
    }
  };

  const filtered = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === "All" || a.courseId === courseFilter;
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const totalSubmissions = assignments.reduce((acc, a) => acc + a.totalSubmissions, 0);
  const gradedTotal = assignments.reduce((acc, a) => acc + a.gradedCount, 0);
  const pendingTotal = totalSubmissions - gradedTotal;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Assignment Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create assessment tasks, configure rubric scoring, and evaluate student work.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("grading-workspace")}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
            <span>Grading Workspace</span>
          </button>
          <button
            onClick={onOpenCreateAssignment}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Assignments</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {assignments.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across 3 active courses</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Submissions</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {totalSubmissions}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across your active courses</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs bg-indigo-50/20">
          <span className="text-xs text-indigo-900 font-medium">Pending Review</span>
          <div className="text-2xl font-bold text-indigo-700 font-mono mt-1 tabular-nums">
            {pendingTotal}
          </div>
          <p className="text-[11px] text-indigo-600 mt-0.5">Awaiting teacher grading</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Graded & Returned</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">
            {gradedTotal}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Feedback published to students</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assignments by title or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Courses</option>
            {backendCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subject || c.courseName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Grading">Grading</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading assignments...
        </div>
      ) : backendCourses.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No courses are assigned to you yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No assignments found.
        </div>
      ) : null}
      <div className="space-y-3">
        {filtered.map((asg) => {
          const progressPercent =
            asg.totalSubmissions > 0
              ? Math.round((asg.gradedCount / asg.totalSubmissions) * 100)
              : 0;

          return (
            <div
              key={asg.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {asg.courseCode}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{asg.title}</h3>
                  <StatusBadge status={asg.status} />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {asg.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Due: {asg.dueDate} at {asg.dueTime}
                    </span>
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-700 font-medium">
                    Max: {asg.maxMarks} marks ({asg.weightagePercent}% of term)
                  </span>
                </div>
              </div>

              {/* Progress & Action */}
              <div className="flex items-center gap-6 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="w-36 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Graded:</span>
                    <span className="font-mono font-bold tabular-nums">
                      {asg.gradedCount}/{asg.totalSubmissions}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-mono">
                    {progressPercent}% Complete
                  </span>
                </div>

                <button
                  onClick={() => onGradeAssignment(asg.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Grade Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  {asg.status === "Draft" && (
                    <button
                      type="button"
                      onClick={() => void handleStatusChange(asg, "publish")}
                      className="px-2 py-1 text-[10px] font-medium text-emerald-700 border border-emerald-200 rounded-md"
                    >
                      Publish
                    </button>
                  )}
                  {asg.status === "Active" && (
                    <button
                      type="button"
                      onClick={() => void handleStatusChange(asg, "close")}
                      className="px-2 py-1 text-[10px] font-medium text-amber-700 border border-amber-200 rounded-md"
                    >
                      Close
                    </button>
                  )}
                  {asg.status === "Draft" && (
                    <button
                      type="button"
                      onClick={() => setEditingAssignment(backendAssignments.find((entry) => entry.id === asg.id) ?? null)}
                      className="px-2 py-1 text-[10px] font-medium text-slate-700 border border-slate-200 rounded-md"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeletingAssignment(asg)}
                    className="px-2 py-1 text-[10px] font-medium text-rose-700 border border-rose-200 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <TextInputModal
        isOpen={Boolean(editingAssignment)}
        title="Edit assignment"
        label="Assignment title"
        initialValue={editingAssignment?.title ?? ""}
        onClose={() => setEditingAssignment(null)}
        onSave={handleEdit}
      />
      <ConfirmModal
        isOpen={Boolean(deletingAssignment)}
        title="Delete assignment?"
        description={`Deleting “${deletingAssignment?.title ?? "this assignment"}” permanently removes it from the course.`}
        onClose={() => setDeletingAssignment(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
