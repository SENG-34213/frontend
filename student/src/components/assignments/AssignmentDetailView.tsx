import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Award,
  Sparkles,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const AssignmentDetailView: React.FC = () => {
  const { assignments, selectedAssignmentId, submitAssignment, setCurrentView, showToast } =
    useStudent();
  const [submissionText, setSubmissionText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; size: string; uploadedAt: string; file?: File }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignment = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];

  if (!assignment) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
        Assignment details are not available yet.
      </div>
    );
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const nextFiles = files.map((file) => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString(),
      file,
    }));
    setUploadedFiles((prev) => [...prev, ...nextFiles]);
    if (nextFiles.length) showToast(`${nextFiles.length} file(s) attached.`);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() && uploadedFiles.length === 0) {
      showToast("Please enter answer notes or attach at least one file before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitAssignment(assignment.id, submissionText, uploadedFiles);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView("assignments")}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Assignments</span>
        </button>
        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {assignment.courseCode} · {assignment.maxScore} Maximum Points
        </span>
      </div>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">{assignment.courseTitle}</span>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {assignment.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                assignment.status === "PENDING"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                  : assignment.status === "GRADED"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
              }`}
            >
              Status: {assignment.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>
              Due:{" "}
              {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>Late Submissions: Subject to 10% daily deduction</span>
          </span>
        </div>
      </div>

      {/* Graded Review Card (if already graded) */}
      {assignment.status === "GRADED" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="font-display text-base font-bold text-emerald-950 dark:text-emerald-200">
                  Evaluation Score: {assignment.grade}/{assignment.maxScore} Points (
                  {assignment.letterGrade})
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Published on {new Date(assignment.submittedDate || "").toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {assignment.grade}%
            </span>
          </div>

          {assignment.feedback && (
            <div className="rounded-xl border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Instructor Written Feedback
              </span>
              <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                &quot;{assignment.feedback}&quot;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Two-Column Instructions and Submission Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Instructions & Rubric (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Instructions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Assignment Specification
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
              {assignment.instructions}
            </div>

            {/* Attachments */}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Starter Files & Reference Datasets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assignment.attachments.map((att) => (
                    <div
                      key={att.name}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {att.name}
                          </p>
                          <span className="text-[10px] text-slate-400">{att.size}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`Downloaded starter file: ${att.name}`)}
                        className="rounded p-1 text-slate-400 hover:text-indigo-600"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rubric Criteria Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Assessment Rubric ({assignment.maxScore} Total Points)
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignment.rubricCriteria.map((rubric) => (
                <div key={rubric.criteria} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rubric.criteria}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {rubric.description}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {rubric.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Submission Panel (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-5">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {assignment.status === "PENDING"
                ? "Your Submission"
                : assignment.status === "SUBMITTED"
                  ? "Submitted Deliverables"
                  : "Archive of Submission"}
            </h3>

            {assignment.status === "PENDING" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Drag and Drop File Upload Area */}
                <label
                  htmlFor="assignment-files"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all dark:border-slate-700 dark:bg-slate-800/40"
                >
                  <input
                    id="assignment-files"
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                  <Upload className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to add code package or PDF report
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Select a file to attach to your submission.
                  </p>
                </label>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Attached Files ({uploadedFiles.length})
                    </span>
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={f.name}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate font-medium">{f.name}</span>
                          <span className="text-[10px] text-slate-400">{f.size}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(i)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Notes / Repository URL */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Submission Notes / Git Repository Link
                  </label>
                  <textarea
                    rows={4}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter git commit hash, repository link, or methodology notes for your grader..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Uploading & Verifying..." : "Submit Assignment for Grading"}
                </button>
              </form>
            ) : (
              /* Already submitted review */
              <div className="space-y-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submission Received Successfully</span>
                  </div>
                  <p className="text-slate-500">
                    Timestamp: {new Date(assignment.submittedDate || "").toLocaleString()}
                  </p>
                </div>

                {assignment.submittedFiles && assignment.submittedFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Archived Deliverables:
                    </span>
                    {assignment.submittedFiles.map((f) => (
                      <div
                        key={f.name}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <span className="truncate">{f.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{f.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
