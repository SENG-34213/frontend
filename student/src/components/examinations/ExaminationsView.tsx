import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  Search,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const ExaminationsView: React.FC = () => {
  const { examinations, setSelectedExamId, setCurrentView } = useStudent();
  const [courseFilter, setCourseFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();
    return examinations.filter((exam) => {
      const matchesCourse = courseFilter === "all" || exam.courseId === courseFilter;
      const matchesSearch =
        !query ||
        [exam.title, exam.courseCode, exam.courseTitle, exam.type].some((value) =>
          value.toLowerCase().includes(query),
        );
      return matchesCourse && matchesSearch;
    });
  }, [courseFilter, examinations, search]);

  const handleStartExam = (id: string) => {
    setSelectedExamId(id);
    setCurrentView("exam-taking");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Formal Examinations Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Official proctored midterms, cumulative finals, and institutional academic assessments
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exams or courses..."
            className="w-full bg-transparent py-2.5 text-xs text-slate-700 outline-none dark:text-slate-200"
          />
        </label>
        <select
          aria-label="Filter examinations by course"
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="all">All courses</option>
          {Array.from(
            new Map(
              examinations.map((exam) => [exam.courseId, exam.courseTitle || exam.courseCode]),
            ).entries(),
          ).map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {/* Security & Proctor Policy Notice */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 dark:border-indigo-950 dark:bg-indigo-950/40">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-display text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
              TiT Proctored Examination Integrity System
            </h3>
            <p className="text-xs text-indigo-900/90 dark:text-indigo-300 leading-relaxed">
              Examinations are strictly proctored under institutional university guidelines.
              Students must present a valid TiT photo ID. Laptops must remain in secure fullscreen
              browser kiosk mode throughout the timed duration.
            </p>
          </div>
        </div>
      </div>

      {/* Examination Schedule Cards */}
      <div className="space-y-4">
        {filteredExams.map((exam) => {
          const isUpcoming =
            exam.status === "UPCOMING" &&
            Boolean(exam.questions?.length) &&
            exam.eligible !== false;
          const isCompleted = exam.status === "COMPLETED";

          return (
            <div
              key={exam.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {exam.courseCode || exam.courseTitle || "Course"}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-xs text-slate-500">{exam.type} EXAMINATION</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                    {exam.weightPercentage > 0
                      ? `Weight: ${exam.weightPercentage}% of Final Grade`
                      : `${exam.totalMarks} total marks`}
                  </span>
                </div>

                <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {exam.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>
                      {new Date(exam.scheduledDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>
                      {exam.endTime
                        ? `${exam.startTime} – ${exam.endTime}`
                        : `${exam.startTime} (${exam.durationMinutes} mins)`}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{exam.location}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Proctor: {exam.proctorName || "Assigned by course faculty"}</span>
                  </span>
                </div>

                {exam.description && (
                  <p className="max-w-3xl pt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {exam.description}
                  </p>
                )}

                {isCompleted && exam.score !== undefined && (
                  <div className="pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Official Score Published: {exam.score}/{exam.totalMarks} Marks ·{" "}
                      {exam.letterGrade || exam.resultStatus || "Graded"}
                    </span>
                  </div>
                )}

                {expandedExamId === exam.id && (
                  <div className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-slate-800/70 sm:grid-cols-2">
                    <div>
                      <span className="text-slate-400">Course</span>
                      <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                        {exam.courseTitle || exam.courseCode || "Course details unavailable"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Pass mark</span>
                      <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                        {exam.passMarks || 0} / {exam.totalMarks}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Proctor</span>
                      <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                        {exam.proctorName || "Not assigned"}
                      </p>
                    </div>
                    {exam.description && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">Instructions</span>
                        <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">
                          {exam.description}
                        </p>
                      </div>
                    )}
                    {exam.remarks && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">Teacher remarks</span>
                        <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">
                          {exam.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Column */}
              <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                {isUpcoming ? (
                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Enter Exam Session</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : exam.status === "COMPLETED" ? (
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Graded & Completed
                  </span>
                ) : exam.status === "UPCOMING" ? (
                  <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {exam.eligible ? "Exam details" : "Scheduled"}
                  </span>
                ) : exam.status === "IN_PROGRESS" ? (
                  <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    Results are being prepared
                  </span>
                ) : (
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Details unavailable
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedExamId((current) => (current === exam.id ? null : exam.id))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {expandedExamId === exam.id ? "Hide details" : "View details"}
                </button>
              </div>
            </div>
          );
        })}
        {filteredExams.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            {examinations.length === 0
              ? "No examinations are available for your enrolled courses yet."
              : "No exams match your search or course filter."}
          </div>
        )}
      </div>
    </div>
  );
};
