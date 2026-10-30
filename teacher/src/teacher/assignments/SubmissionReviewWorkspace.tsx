import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileCode,
  FileText,
  Download,
  Save,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  AlertCircle,
  Search,
  ExternalLink,
} from "lucide-react";
import { StudentSubmission, Assignment, NavigationTab } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { getCourseStudentIds, getStudentProfiles } from "../api/studentApi";
import { NoticeModal } from "../components/ActionModal";
import {
  getAssignment,
  getAssignmentSubmissions,
  getSubmission,
  gradeSubmission,
  returnSubmission,
  getSubmissionFiles,
  getSubmissionFileDownload,
  releaseSubmissionGrade,
  holdSubmissionGrade,
  type BackendAssignment,
  type BackendSubmission,
} from "../api/assignmentApi";

interface SubmissionReviewWorkspaceProps {
  initialAssignmentId?: string;
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

const mapBackendAssignment = (item: BackendAssignment): Assignment => {
  const due = new Date(item.dueDate);
  return {
    id: item.id,
    courseId: item.courseId,
    courseCode: item.courseId,
    title: item.title,
    description: item.description || item.instructions || "",
    dueDate: Number.isNaN(due.getTime()) ? item.dueDate : due.toLocaleDateString(),
    dueTime: Number.isNaN(due.getTime())
      ? ""
      : due.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    maxMarks: item.maxMarks,
    weightagePercent: 0,
    allowLateSubmission: item.allowLateSubmission,
    status: item.status === "PUBLISHED" ? "Active" : item.status === "CLOSED" ? "Closed" : "Draft",
    totalSubmissions: 0,
    gradedCount: 0,
    totalStudents: 0,
    latePenaltyPercentage: item.latePenaltyPercentage,
    rubricItems: (item.rubricItems || []).map((rubric) => ({
      criterion: rubric.criterion,
      marks: rubric.marks,
    })),
  };
};

const mapBackendSubmission = (item: BackendSubmission, maxMarks = 100): StudentSubmission => {
  return {
    id: item.id,
    assignmentId: item.assignmentId,
    studentId: item.studentId,
    studentName: item.studentName || "Student name unavailable",
    studentEmail: "",
    submissionDate: item.submittedAt
      ? new Date(item.submittedAt).toLocaleString()
      : "Not submitted",
    status:
      item.status === "LATE"
        ? "Late"
        : item.status === "GRADED" || item.status === "RETURNED"
          ? "Graded"
          : "Submitted",
    score: item.marks,
      isReturned: item.status === "RETURNED",
    isLate: item.isLate,
    gradeReleased: item.gradeReleased,
    maxMarks,
    feedback: item.feedback,
    submittedContentText: item.content,
    submittedFileName: undefined,
    fileSizeBytes: undefined,
    codeSnippet: undefined,
  };
};

export const SubmissionReviewWorkspace: React.FC<SubmissionReviewWorkspaceProps> = ({
  initialAssignmentId = "",
  onBack,
  onNavigate,
}) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignmentId);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Scoring states for currently selected submission
  const currentSubmission =
    submissions.find((s) => s.id === selectedSubmissionId) || submissions[0];
  const currentAssignment = assignment;

  const [inputScore, setInputScore] = useState<string>(
    currentSubmission?.score !== undefined ? String(currentSubmission.score) : "",
  );
  const [feedback, setFeedback] = useState<string>(currentSubmission?.feedback || "");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [rubricScores, setRubricScores] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);
    setSubmissions([]);
    setSelectedSubmissionId("");
    setAssignment(null);
    Promise.all([
      getAssignment(selectedAssignmentId, controller.signal),
      getAssignmentSubmissions(selectedAssignmentId, controller.signal),
    ])
      .then(([backendAssignment, backendSubmissions]) => {
        if (backendAssignment) setAssignment(mapBackendAssignment(backendAssignment));
        const mapped = backendSubmissions.map((submission) =>
          mapBackendSubmission(submission, backendAssignment?.maxMarks ?? 100),
        );
        const duePassed = backendAssignment?.dueDate ? new Date(backendAssignment.dueDate).getTime() < Date.now() : false;
        if (duePassed && backendAssignment?.courseId) {
          void getCourseStudentIds(backendAssignment.courseId, controller.signal).then(async (studentIds) => {
            const submittedIds = new Set(mapped.map((submission) => submission.studentId));
            const missingIds = studentIds.filter((studentId) => !submittedIds.has(studentId));
            const profiles = await getStudentProfiles(missingIds, controller.signal);
            const missing = missingIds.map((studentId) => {
              const profile = profiles.find((item) => item.id === studentId);
              return {
                id: `missing-${studentId}`,
                assignmentId: selectedAssignmentId,
                studentId,
                studentName: profile?.name || "Student name unavailable",
                studentEmail: profile?.email || "",
                submissionDate: "No submission",
                status: "Pending" as const,
                maxMarks: backendAssignment.maxMarks,
              };
            });
            setSubmissions((current) => [...current, ...missing]);
          }).catch(() => undefined);
        }
        setSubmissions(mapped);
        setSelectedSubmissionId(mapped[0]?.id || "");
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(
            requestError instanceof Error ? requestError.message : "Submissions failed to load.",
          );
          setSubmissions([]);
          setAssignment(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [selectedAssignmentId]);

  // When switching submission, update local inputs
  useEffect(() => {
    setInputScore(currentSubmission?.score !== undefined ? String(currentSubmission.score) : "");
    setFeedback(currentSubmission?.feedback || "");
    setRubricScores(currentAssignment?.rubricItems.map(() => "") ?? []);
  }, [currentSubmission?.id, currentSubmission?.feedback, currentSubmission?.score]);

  const handleSelectSubmission = async (sub: StudentSubmission) => {
    setSelectedSubmissionId(sub.id);
    if (sub.id.startsWith("missing-")) return;
    try {
      const detail = await getSubmission(sub.id);
      const mapped = mapBackendSubmission(detail, currentAssignment?.maxMarks ?? 100);
      const files = await getSubmissionFiles(sub.id);
      if (files[0]) {
        mapped.submittedFileName = files[0].originalFilename;
        mapped.submittedFileId = files[0].id;
        mapped.submittedFileContentType = files[0].contentType;
        mapped.fileSizeBytes = files[0].fileSize;
        const download = await getSubmissionFileDownload(sub.id, files[0].id);
        setPreviewUrl(download.downloadUrl || download.content || "");
      } else {
        setPreviewUrl("");
      }
      setSubmissions((current) =>
        current.map((submission) => (submission.id === mapped.id ? mapped : submission)),
      );
    } catch (requestError: unknown) {
      setLoadError(
        requestError instanceof Error ? requestError.message : "Submission details failed to load.",
      );
    }
  };

  const handleSaveGrade = async (goToNext = false) => {
    if (!currentSubmission || !currentAssignment || currentSubmission.status === "Pending") return;
    const numericScore = Number(inputScore);
    const maximumAllowedScore = currentAssignment.maxMarks;
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > maximumAllowedScore) {
      setNotice({
        title: "Invalid mark",
        message: `Enter a mark between 0 and ${maximumAllowedScore}.`,
      });
      return;
    }

    try {
      const saved = await gradeSubmission(currentSubmission.id, { marks: numericScore, feedback });
      const mapped = mapBackendSubmission(saved, currentAssignment.maxMarks);
      setSubmissions((prev) => prev.map((sub) => (sub.id === currentSubmission.id ? mapped : sub)));
    } catch (requestError: unknown) {
      setLoadError(
        requestError instanceof Error ? requestError.message : "Grade could not be saved.",
      );
      return;
    }

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === currentSubmission.id
          ? {
              ...sub,
              score: numericScore,
              feedback,
              status: "Graded",
            }
          : sub,
      ),
    );

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);

      if (goToNext) {
        const currentIndex = submissions.findIndex((s) => s.id === currentSubmission.id);
        if (currentIndex < submissions.length - 1) {
          handleSelectSubmission(submissions[currentIndex + 1]);
        }
      }
    }, 600);
  };

  const handleReleaseSelected = async (all = false) => {
    const targets = (all ? submissions : submissions.filter((submission) => selectedSubmissionIds.includes(submission.id)))
      .filter((submission) => !submission.id.startsWith("missing-") && submission.score !== undefined);
    for (const submission of targets) await releaseSubmissionGrade(submission.id);
    setSubmissions((current) => current.map((submission) => targets.some((target) => target.id === submission.id)
      ? { ...submission, status: "Graded", gradeReleased: true, isReturned: true }
      : submission));
  };

  const handleHoldSelected = async () => {
    const targets = submissions.filter((submission) => selectedSubmissionIds.includes(submission.id) && !submission.id.startsWith("missing-"));
    for (const submission of targets) await holdSubmissionGrade(submission.id);
    setSubmissions((current) => current.map((submission) => targets.some((target) => target.id === submission.id)
      ? { ...submission, gradeReleased: false, isReturned: false }
      : submission));
  };

  const handleReturnSubmission = async () => {
    if (!currentSubmission || currentSubmission.isReturned) return;
    try {
      await returnSubmission(currentSubmission.id);
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === currentSubmission.id
            ? { ...submission, status: "Graded", isReturned: true }
            : submission,
        ),
      );
    } catch (requestError: unknown) {
      setLoadError(
        requestError instanceof Error ? requestError.message : "Submission could not be returned.",
      );
    }
  };

  const gradedCount = submissions.filter((s) => s.status === "Graded").length;

  if (isLoading) {
    return <div className="p-10 text-center text-sm text-slate-500">Loading submissions...</div>;
  }

  if (!currentAssignment || !currentSubmission) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        {loadError || "No submissions are available for this assignment."}
        <button onClick={onBack} className="ml-3 text-indigo-600 underline">
          Back to assignments
        </button>
      </div>
    );
  }

  const isReadOnly = currentSubmission.status === "Pending";

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-slate-100 overflow-hidden -m-4 lg:-m-6">
      {/* Top Workspace Header Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Back to Assignments"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {currentAssignment.courseCode}
              </span>
              <h1 className="text-sm font-bold text-slate-900 truncate">
                {currentAssignment.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <span>Grading Progress:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {gradedCount} / {submissions.length}
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(gradedCount / submissions.length) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onNavigate("grades")}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Open Gradebook
          </button>
        </div>
      </div>

      {loadError && (
        <div className="absolute top-16 right-4 z-10 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 shadow-sm">
          {loadError}
        </div>
      )}

      {/* 3-Column Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Student Roster */}
        <aside className="w-64 sm:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Submissions ({submissions.length})
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter student..."
                className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {submissions.map((sub) => {
              const isSelected = sub.id === currentSubmission?.id;
              const isCheckboxSelected = selectedSubmissionIds.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`p-3 cursor-pointer transition-colors text-left flex items-start gap-2 ${
                    isSelected
                      ? "bg-indigo-50/70 border-l-4 border-indigo-600"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {!sub.id.startsWith("missing-") && (
                    <input
                      type="checkbox"
                      checked={isCheckboxSelected}
                      onChange={(event) => {
                        event.stopPropagation();
                        setSelectedSubmissionIds((current) => event.target.checked
                          ? [...current, sub.id]
                          : current.filter((id) => id !== sub.id));
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isSelected ? "text-indigo-900" : "text-slate-900"}`}>
                      {sub.studentName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{sub.submissionDate}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <StatusBadge status={sub.status} variant="clean" />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {sub.score !== undefined ? `${sub.score}/${sub.maxMarks}` : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Student Work & File Preview */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden border-r border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {currentSubmission.studentName}
                </h2>
                <StatusBadge status={currentSubmission.status} />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Submitted on {currentSubmission.submissionDate}
              </p>
            </div>

            {currentSubmission.submittedFileName && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono hidden md:inline">
                  {currentSubmission.submittedFileName}
                </span>
                <button
                  onClick={async () => {
                    if (!currentSubmission.submittedFileId) return;
                    try {
                      const download = await getSubmissionFileDownload(currentSubmission.id, currentSubmission.submittedFileId);
                      if (download.downloadUrl) window.open(download.downloadUrl, "_blank", "noopener,noreferrer");
                    } catch (error) {
                      setNotice({ title: "Download unavailable", message: error instanceof Error ? error.message : "The file could not be downloaded." });
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {currentSubmission.submittedFileId && currentSubmission.submittedFileContentType?.includes("pdf") ? (
            <div className="h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <iframe
                title={`Preview of ${currentSubmission.submittedFileName}`}
                src={previewUrl}
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Student Submission Notes & Architecture
              </span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                {currentSubmission.submittedContentText || "No text answer was submitted."}
              </p>
            </div>
          )}

            {/* Code / Artifact Viewer */}
            {currentSubmission.codeSnippet && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-900 px-4 py-2 text-slate-300 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AVLTree.java / Source File Preview</span>
                  </div>
                  <span className="text-[11px] text-slate-500">UTF-8 · 38 Test Cases Passed</span>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed select-text">
                  <code>{currentSubmission.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        </main>

        {/* Right Column: Grading Panel & Rubrics */}
        <aside className="w-80 bg-slate-50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Evaluation & Rubric Scoring
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Assignment Maximum:{" "}
              <strong className="font-mono text-slate-900">
                {currentAssignment.maxMarks} marks
              </strong>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Direct Score Input */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Assigned Mark (0 - {Math.min(currentAssignment.maxMarks, 100)})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={currentAssignment.maxMarks}
                  value={inputScore}
                  onChange={(e) => setInputScore(e.target.value)}
                  disabled={isReadOnly || currentAssignment.rubricItems.length > 0}
                  placeholder="e.g. 95"
                  className="w-24 px-3 py-2 text-base font-bold font-mono text-indigo-700 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-xs text-slate-400">/ {currentAssignment.maxMarks} marks</span>
              </div>
            </div>

            {currentSubmission.isLate && Number(currentAssignment.latePenaltyPercentage || 0) > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Late penalty: {currentAssignment.latePenaltyPercentage}%
                <span className="block mt-1 font-mono font-bold">
                  Final mark: {Math.max(0, Number(inputScore || 0) * (1 - Number(currentAssignment.latePenaltyPercentage || 0) / 100)).toFixed(2)} / {currentAssignment.maxMarks}
                </span>
              </div>
            )}

            {/* Rubric Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Rubric Criteria
              </span>
              <div className="space-y-2">
                {currentAssignment.rubricItems.map((r, i) => {
                  const allotted = currentAssignment.maxMarks * r.marks / 100;
                  return (
                  <label key={i} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2">
                    <span className="text-slate-700 leading-snug">{r.criterion}<span className="block text-[10px] text-slate-400">Out of {Number(allotted.toFixed(2))} marks ({r.marks}%)</span></span>
                    <input
                      type="number"
                      min="0"
                      max={allotted}
                      value={rubricScores[i] || ""}
                      onChange={(event) => {
                        const next = [...rubricScores];
                        next[i] = event.target.value;
                        setRubricScores(next);
                        setInputScore(String(next.reduce((sum, value) => sum + (Number(value) || 0), 0)));
                      }}
                      disabled={isReadOnly}
                      className="w-16 rounded border border-slate-300 px-2 py-1 text-right font-mono text-xs"
                    />
                  </label>
                  );
                })}
              </div>
            </div>

            {/* Feedback Editor */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Written Feedback
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFeedback(
                      "Well executed implementation. Edge cases in rotation balance factors handled gracefully.",
                    )
                  }
                  className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Insert Template</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isReadOnly}
                placeholder="Write actionable, constructive guidance for the student..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
              />

              {/* Quick comment chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {["Great test coverage", "Review rotation tie-breakers", "Clean code style"].map(
                  (chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setFeedback((prev) => (prev ? `${prev} ${chip}.` : `${chip}.`))
                      }
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      + {chip}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-2">
            <button
              onClick={() => void handleSaveGrade(true)}
              disabled={saveSuccess || isReadOnly}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Grade Recorded! Moving next...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Next Student</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => void handleReleaseSelected(false)}
              disabled={selectedSubmissionIds.length === 0}
              className="w-full py-1.5 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              Release Selected Grades
            </button>
            <button
              type="button"
              onClick={() => void handleHoldSelected()}
              disabled={selectedSubmissionIds.length === 0}
              className="w-full py-1.5 px-3 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
            >
              Hold Selected Grades
            </button>
            <button
              type="button"
              onClick={() => void handleReleaseSelected(true)}
              className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Publish All Grades
            </button>
            <button
              onClick={() => void handleSaveGrade(false)}
              disabled={isReadOnly}
              className="w-full py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Save Grade Only
            </button>
            <button
              onClick={() => void handleReturnSubmission()}
              disabled={isReadOnly}
              className="w-full py-1.5 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              Return Submission
            </button>
          </div>
        </aside>
      </div>
      <NoticeModal
        isOpen={Boolean(notice)}
        title={notice?.title ?? "Notice"}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
};
