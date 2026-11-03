import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Eye,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Award,
  Sparkles,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { downloadAssignmentAttachment } from "../../api/student";
import { downloadFile } from "../../../../shared/files/downloadFile";

const formatDuration = (milliseconds: number) => {
  const totalHours = Math.max(1, Math.round(Math.abs(milliseconds) / 3_600_000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return days > 0
    ? `${days} day${days === 1 ? "" : "s"}${hours ? ` and ${hours} hour${hours === 1 ? "" : "s"}` : ""}`
    : `${hours} hour${hours === 1 ? "" : "s"}`;
};

export const AssignmentDetailView: React.FC = () => {
  const { assignments, selectedAssignmentId, submitAssignment, setCurrentView, showToast } =
    useStudent();
  const [submissionText, setSubmissionText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; size: string; uploadedAt: string; file?: File }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const assignment = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];

  useEffect(() => {
    const resetSubmissionText = window.setTimeout(() => {
      setSubmissionText(assignment?.submissionText || "");
    }, 0);
    return () => window.clearTimeout(resetSubmissionText);
  }, [assignment?.id, assignment?.submissionText]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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

  const handlePreviewAttachment = async (
    attachment: NonNullable<typeof assignment.attachments>[number],
  ) => {
    if (!attachment.id) {
      showToast("This document is not available for preview yet.");
      return;
    }
    try {
      const response = await downloadAssignmentAttachment(assignment.id, attachment.id);
      const payload = (response as { data?: { downloadUrl?: string } })?.data ?? response;
      const url = (payload as { downloadUrl?: string })?.downloadUrl;
      if (!url) throw new Error("A secure preview link was not returned.");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Document preview is unavailable.");
    }
  };

  const handleDownloadAttachment = async (
    attachment: NonNullable<typeof assignment.attachments>[number],
  ) => {
    if (!attachment.id) {
      showToast("This document is not available for download yet.");
      return;
    }
    try {
      const response = await downloadAssignmentAttachment(assignment.id, attachment.id);
      const payload = (response as { data?: { downloadUrl?: string } })?.data ?? response;
      const url = (payload as { downloadUrl?: string })?.downloadUrl;
      if (!url) throw new Error("A secure download link was not returned.");
      downloadFile(url, attachment.name);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Document download is unavailable.");
    }
  };
  const submissionClosed =
    assignment.status === "CLOSED" ||
    (new Date(assignment.dueDate).getTime() < now && !assignment.allowLateSubmission);
  const isClosedWithoutSubmission =
    assignment.status === "CLOSED" || assignment.status === "OVERDUE";
  const isNotYetOpen =
    assignment.status === "PENDING" &&
    Boolean(assignment.startDate) &&
    Date.parse(assignment.startDate || "") > now;
  const submissionTiming = assignment.submittedDate
    ? (() => {
        const submittedAt = Date.parse(assignment.submittedDate);
        const dueAt = Date.parse(assignment.dueDate);
        if (!Number.isFinite(submittedAt) || !Number.isFinite(dueAt)) return null;
        return submittedAt <= dueAt
          ? `Submitted ${formatDuration(dueAt - submittedAt)} early`
          : `Submitted ${formatDuration(submittedAt - dueAt)} late`;
      })()
    : null;
  const remaining = Date.parse(assignment.dueDate) - now;
  const canEditExistingSubmission =
    assignment.allowStudentEdits === true && assignment.status === "SUBMITTED";
  const statusLabel =
    assignment.status === "CLOSED"
      ? "Closed · Not submitted"
      : assignment.status === "OVERDUE"
        ? "Past due · Not submitted"
        : assignment.status === "PENDING"
          ? "Ready to submit"
          : assignment.status === "SUBMITTED"
            ? "Submitted · Under review"
            : "Graded · Result published";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionClosed) {
      showToast("The submission deadline has passed and late submissions are not allowed.");
      return;
    }
    if (isNotYetOpen) {
      showToast("This assignment is not open for submissions yet.");
      return;
    }
    if (assignment.submissionType === "DOCUMENT" && uploadedFiles.length === 0) {
      showToast("Attach at least one document before submitting this assignment.");
      return;
    }
    if (assignment.submissionType !== "DOCUMENT" && !submissionText.trim()) {
      showToast("Enter your answer before submitting this assignment.");
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
    <div className="mx-auto max-w-7xl space-y-7 pb-12">
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

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
        {[
          {
            number: "01",
            title: "Review brief",
            description: "Read the instructions and rubric",
            active: true,
          },
          {
            number: "02",
            title: assignment.status === "PENDING" ? "Submit your work" : "Work submitted",
            description:
              assignment.status === "PENDING"
                ? "Complete the response before the deadline"
                : "Your response is on record",
            active: !["CLOSED", "OVERDUE"].includes(assignment.status),
          },
          {
            number: "03",
            title: assignment.status === "GRADED" ? "Review result" : "Await evaluation",
            description:
              assignment.status === "GRADED"
                ? "Read your score and feedback"
                : "Your teacher will review your work",
            active: assignment.status === "GRADED",
          },
        ].map((step, index) => (
          <div
            key={step.number}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
              step.active ? "bg-indigo-50/70 dark:bg-indigo-950/30" : "opacity-60"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                step.active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {step.number}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{step.title}</p>
              <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                {step.description}
              </p>
            </div>
            {index < 2 && <span className="ml-auto hidden text-slate-300 sm:block">→</span>}
          </div>
        ))}
      </div>

      {/* Main Header Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-white p-6 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Assignment workspace</span>
              </div>
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
                      : assignment.status === "CLOSED" || assignment.status === "OVERDUE"
                        ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Deadline
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Calendar className="h-4 w-4 text-indigo-500" />
                {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Time remaining
              </span>
              <span
                className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${
                  submissionClosed ? "text-slate-500" : "text-indigo-600 dark:text-indigo-400"
                }`}
              >
                <Clock className="h-4 w-4" />
                {assignment.status === "CLOSED"
                  ? "Closed"
                  : isNotYetOpen
                    ? `Opens in ${formatDuration(Date.parse(assignment.startDate || "") - now)}`
                    : remaining > 0
                      ? `${formatDuration(remaining)} remaining`
                      : "Submission window closed"}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Submission policy
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {assignment.allowLateSubmission
                  ? assignment.latePenaltyPercentage && assignment.latePenaltyPercentage > 0
                    ? `Late submissions accepted · ${assignment.latePenaltyPercentage}% penalty`
                    : "Late submissions accepted"
                  : "No late submissions"}
              </span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            {submissionTiming && (
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {submissionTiming}
              </span>
            )}
            <span>
              {assignment.maxScore} points ·{" "}
              {assignment.submissionType === "DOCUMENT" ? "Document upload" : "Text response"}
            </span>
          </div>
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
                  Evaluation Score: {assignment.grade}/{assignment.maxScore} Points
                  {assignment.letterGrade ? ` · ${assignment.letterGrade}` : ""}
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Published on {new Date(assignment.submittedDate || "").toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {assignment.grade != null && assignment.maxScore
                ? `${Math.round((assignment.grade / assignment.maxScore) * 100)}%`
                : "—"}
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                  Read first
                </p>
                <h2 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                  Assignment specification
                </h2>
              </div>
              <FileText className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
              {assignment.instructions}
            </div>

            {/* Attachments */}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Starter files & reference datasets · {assignment.attachments.length}
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
                        type="button"
                        onClick={() => void handleDownloadAttachment(att)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                        aria-label={`Preview ${att.name}`}
                        title="Preview document"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handlePreviewAttachment(att)}
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                        aria-label={`Download ${att.name}`}
                        title="Download document"
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
            {assignment.rubricCriteria.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignment.rubricCriteria.map((rubric, index) => (
                  <div
                    key={rubric.criteria}
                    className="group flex items-start gap-3 rounded-xl border border-transparent px-2 py-3 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40 dark:hover:border-indigo-900/50 dark:hover:bg-indigo-950/20"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 font-mono text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {rubric.criteria}
                      </h4>
                      {rubric.description && (
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {rubric.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {rubric.points} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No detailed rubric was provided. Your teacher will evaluate the submission against
                the assignment instructions.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Submission Panel (1 col) */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {isClosedWithoutSubmission
                    ? "Submission unavailable"
                    : assignment.status === "PENDING"
                      ? "Submit your work"
                      : assignment.status === "SUBMITTED"
                        ? "Your submitted work"
                        : "Submission record"}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {isClosedWithoutSubmission
                    ? "This assignment can no longer receive submissions."
                    : assignment.status === "PENDING"
                      ? "Review your answer and submit it before the deadline."
                      : assignment.status === "SUBMITTED"
                        ? canEditExistingSubmission
                          ? "You can update this submission before it is graded."
                          : "Your work has been sent to your teacher for review."
                        : "Your submission and evaluation are shown below."}
                </p>
              </div>
              {!isClosedWithoutSubmission && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            </div>

            {isClosedWithoutSubmission ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Assignment closed — no submission received
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      The teacher closed this assignment before you submitted it. Submissions are no
                      longer accepted.
                    </p>
                  </div>
                </div>
              </div>
            ) : isNotYetOpen ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                      Submissions are not open yet
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-indigo-800 dark:text-indigo-300">
                      This assignment opens on{" "}
                      {new Date(assignment.startDate || "").toLocaleString()}.
                    </p>
                  </div>
                </div>
              </div>
            ) : assignment.status === "PENDING" || canEditExistingSubmission ? (
              submissionClosed ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                  This assignment is past due. Late submissions are not allowed.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                    <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                      {canEditExistingSubmission ? "Update your response" : "Ready when you are"}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-indigo-800 dark:text-indigo-300">
                      {assignment.submissionType === "DOCUMENT"
                        ? "Upload the final file you want your teacher to evaluate."
                        : "Write a clear, complete response. You can review it before submitting."}
                    </p>
                  </div>
                  {/* Drag and Drop File Upload Area */}
                  {assignment.submissionType === "DOCUMENT" && (
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
                        Document attachment required. Select at least one file to submit.
                      </p>
                    </label>
                  )}
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

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {assignment.submissionType === "DOCUMENT"
                          ? "Additional notes"
                          : "Text answer"}
                      </label>
                      {assignment.submissionType === "DOCUMENT" && (
                        <span className="text-[10px] font-medium text-slate-400">Optional</span>
                      )}
                    </div>
                    <textarea
                      aria-label={
                        assignment.submissionType === "DOCUMENT"
                          ? "Optional submission notes"
                          : "Assignment response"
                      }
                      rows={assignment.submissionType === "DOCUMENT" ? 4 : 6}
                      required={assignment.submissionType !== "DOCUMENT"}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder={
                        assignment.submissionType === "DOCUMENT"
                          ? "Add a short note for your teacher, if needed..."
                          : "Write your answer..."
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Uploading & Verifying..."
                      : canEditExistingSubmission
                        ? "Update and Resubmit Assignment"
                        : "Submit Assignment for Grading"}
                  </button>
                </form>
              )
            ) : (
              /* Already submitted review */
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submission Received Successfully</span>
                  </div>
                  <p className="text-slate-500">
                    Timestamp: {new Date(assignment.submittedDate || "").toLocaleString()}
                  </p>
                  {submissionTiming && (
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {submissionTiming}
                    </p>
                  )}
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
