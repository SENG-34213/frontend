import React, { useEffect, useState } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import { Course, Student, StudentSubmission } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { getStudentAttendanceSummary } from "../api/studentApi";
import {
  getTeacherStudentAcademicSummary,
  type TeacherStudentAcademicSummary,
} from "../api/studentSummaryApi";

interface StudentDetailsModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSendMessage: (studentName: string) => void;
  courses: Course[];
}

type StudentTab = "overview" | "assignments" | "quizzes" | "attendance" | "notes";

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  student,
  onClose,
  onSendMessage,
  courses,
}) => {
  const [activeTab, setActiveTab] = useState<StudentTab>("overview");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackList, setFeedbackList] = useState<string[]>([
    "Strong grasp of asymptotic recurrence relations. Keep up the thorough unit testing!",
    "Recommended attending Thursday office hours for graph edge relaxation concepts.",
  ]);
  const [attendanceRate, setAttendanceRate] = useState<number | null>(
    student?.attendanceRate ?? null,
  );
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [academicSummaries, setAcademicSummaries] = useState<TeacherStudentAcademicSummary[]>([]);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicError, setAcademicError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !student) return;
    const controller = new AbortController();
    const studentCourses = courses.filter((course) =>
      student.enrolledCourseIds.includes(course.id),
    );
    setAttendanceRate(student.attendanceRate);
    setAttendanceError(null);
    setAcademicSummaries([]);
    setAcademicError(null);
    if (studentCourses.length === 0) return () => controller.abort();

    setAttendanceLoading(true);
    setAcademicLoading(true);
    Promise.all(
      studentCourses.map((course) =>
        getStudentAttendanceSummary(student.id, course.id, controller.signal),
      ),
    )
      .then((summaries) => {
        if (controller.signal.aborted) return;
        const rates = summaries
          .map((summary) => Number(summary?.attendancePercentage))
          .filter((rate) => Number.isFinite(rate));
        if (rates.length > 0) {
          setAttendanceRate(
            Math.round((rates.reduce((total, rate) => total + rate, 0) / rates.length) * 10) / 10,
          );
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setAttendanceError(
            requestError instanceof Error
              ? requestError.message
              : "Attendance summary failed to load.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAttendanceLoading(false);
      });

    Promise.all(
      studentCourses.map((course) =>
        getTeacherStudentAcademicSummary(student.id, course.id, controller.signal),
      ),
    )
      .then((summaries) => {
        if (!controller.signal.aborted) {
          setAcademicSummaries(
            summaries.filter((summary): summary is TeacherStudentAcademicSummary =>
              Boolean(summary),
            ),
          );
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setAcademicError(
            requestError instanceof Error
              ? requestError.message
              : "Academic summary failed to load.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAcademicLoading(false);
      });

    return () => controller.abort();
  }, [courses, isOpen, student]);

  if (!isOpen || !student) return null;

  const studentCourses = courses.filter((c) => student.enrolledCourseIds.includes(c.id));
  const studentSubmissions: StudentSubmission[] = [];
  const summaryAverage = (key: keyof TeacherStudentAcademicSummary) => {
    const values = academicSummaries
      .map((summary) => Number(summary[key]))
      .filter((item) => Number.isFinite(item));
    return values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : null;
  };
  const academicGradeAverage = summaryAverage("overallPercentage");

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNote.trim()) return;
    setFeedbackList([feedbackNote, ...feedbackList]);
    setFeedbackNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            {student.avatar ? (
              <img src={student.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div
                className={`w-12 h-12 rounded-full text-white font-bold text-base flex items-center justify-center shadow-xs ${student.avatarBg}`}
              >
                {student.initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{student.name}</h2>
                <StatusBadge status={student.status} />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {student.studentId} · {student.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSendMessage(student.name);
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex overflow-x-auto px-6 border-b border-slate-200 gap-4 bg-white shrink-0 scrollbar-none">
          {[
            { id: "overview", label: "Academic Overview" },
            { id: "assignments", label: "Assignments", count: studentSubmissions.length },
            { id: "attendance", label: "Attendance" },
            { id: "notes", label: "Teacher Feedback Log", count: feedbackList.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudentTab)}
              className={`py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Attendance Rate
                  </span>
                  <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
                    {attendanceRate}%
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Recent Grade Avg
                  </span>
                  <div className="text-xl font-bold text-indigo-600 font-mono mt-0.5">
                    {academicLoading
                      ? "Loading..."
                      : academicGradeAverage === null
                        ? "Unavailable"
                        : `${academicGradeAverage.toFixed(1)}%`}
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Enrolled Classes with You
                </h4>
                <div className="space-y-2">
                  {studentCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-mono font-bold text-indigo-700">
                          {c.code}
                        </span>
                        <p className="text-xs font-semibold text-slate-900">{c.title}</p>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{c.semester}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-3">
              {studentSubmissions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No submissions recorded yet for this student.
                </p>
              ) : (
                studentSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {sub.submittedFileName || "Assignment Submission"}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {sub.submittedContentText}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                      <span>Submitted: {sub.submissionDate}</span>
                      <span className="font-mono font-bold text-indigo-700">
                        {sub.score !== undefined
                          ? `${sub.score} / ${sub.maxMarks} marks`
                          : "Pending Grading"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-3">
              {attendanceError && (
                <p className="text-xs text-rose-600" role="alert">
                  {attendanceError}
                </p>
              )}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Attendance Invariant</h4>
                  <p className="text-xs text-slate-500">
                    Student exceeds minimum tuition program threshold of 75.0%.
                  </p>
                </div>
                <span className="text-lg font-bold font-mono text-emerald-600">
                  {attendanceLoading
                    ? "Loading..."
                    : attendanceRate === null
                      ? "Unavailable"
                      : `${attendanceRate}%`}
                </span>
              </div>
            </div>
          )}

          {academicError && activeTab === "overview" && (
            <p className="text-xs text-amber-700" role="status">
              {academicError}
            </p>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <form onSubmit={handleAddFeedback} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Add Teacher Guidance Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter confidential pedagogical note or follow-up..."
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Log</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {feedbackList.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 text-xs bg-slate-50/50 text-slate-700"
                  >
                    <p>{note}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Logged by the current teacher
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
