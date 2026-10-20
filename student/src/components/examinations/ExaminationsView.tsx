import React from "react";
import {
  Award,
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const ExaminationsView: React.FC = () => {
  const { examinations, setSelectedExamId, setCurrentView } = useStudent();

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

      {/* Security & Proctor Policy Notice */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 dark:border-indigo-950 dark:bg-indigo-950/40">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-display text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
              Mentify Proctored Examination Integrity System
            </h3>
            <p className="text-xs text-indigo-900/90 dark:text-indigo-300 leading-relaxed">
              Examinations are strictly proctored under institutional university guidelines.
              Students must present a valid Mentify photo ID. Laptops must remain in secure
              fullscreen browser kiosk mode throughout the timed duration.
            </p>
          </div>
        </div>
      </div>

      {/* Examination Schedule Cards */}
      <div className="space-y-4">
        {examinations.map((exam) => {
          const isUpcoming = exam.status === "UPCOMING";
          const isCompleted = exam.status === "COMPLETED";

          return (
            <div
              key={exam.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {exam.courseCode}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-xs text-slate-500">{exam.type} EXAMINATION</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                    Weight: {exam.weightPercentage}% of Final Grade
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
                      {exam.startTime} ({exam.durationMinutes} mins)
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{exam.location}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Proctor: {exam.proctorName}</span>
                  </span>
                </div>

                {isCompleted && exam.score !== undefined && (
                  <div className="pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Official Score Published: {exam.score}/{exam.totalMarks} Marks (
                      {exam.letterGrade})
                    </span>
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
                ) : (
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Graded & Completed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
