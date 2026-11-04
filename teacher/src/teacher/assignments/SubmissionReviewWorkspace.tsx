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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { StudentSubmission, Assignment, NavigationTab } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { getCourseStudentIds, getStudentProfiles } from "../api/studentApi";
import { NoticeModal } from "../components/ActionModal";
import {
  getAssignment,
  getAssignmentSubmissions,
  getSubmission,
  getSubmissionFiles,
  getSubmissionFileDownload,
  gradeSubmission,
  returnSubmission,
  releaseSubmissionGrade,
  holdSubmissionGrade,
  type BackendAssignment,
  type BackendSubmission,
} from "../api/assignmentApi";
import { downloadFile } from "../../../../shared/files/downloadFile";
import { useVisibleAutoRefresh } from "../../../../shared/useVisibleAutoRefresh";

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
    courseCode: item.courseCode || item.courseName || "Course",
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
    // The API uses null for an ungraded submission. Keep it unset for grading
    // state, while the list can display a clear 0 until a mark is entered.
    score: item.marks ?? undefined,
    isReturned: item.status === "RETURNED",
    isLate: item.isLate,
    gradeReleased: item.gradeReleased,
    maxMarks,
    feedback: item.feedback,
    submittedContentText: item.content,
    submittedFileName: undefined,
    submittedFiles: [],
    fileSizeBytes: undefined,
    codeSnippet: undefined,
  };
};

const editableScore = (
  submission: StudentSubmission | undefined,
  assignment: Assignment | null,
) => {
  if (submission?.score === undefined) return "";
  const penalty = Number(assignment?.latePenaltyPercentage || 0);
  if (!submission.isLate || penalty <= 0 || penalty >= 100) return String(submission.score);
  return String((submission.score / (1 - penalty / 100)).toFixed(2));
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
    editableScore(currentSubmission, currentAssignment),
  );
  const [feedback, setFeedback] = useState<string>(currentSubmission?.feedback || "");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [rubricScores, setRubricScores] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [isRosterCollapsed, setIsRosterCollapsed] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    if (initialAssignmentId && initialAssignmentId !== selectedAssignmentId) {
      setSelectedAssignmentId(initialAssignmentId);
    }
  }, [initialAssignmentId, selectedAssignmentId]);

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
        const duePassed = backendAssignment?.dueDate
          ? new Date(backendAssignment.dueDate).getTime() < Date.now()
          : false;
        if (duePassed && backendAssignment?.courseId) {
          void getCourseStudentIds(backendAssignment.courseId, controller.signal)
            .then(async (studentIds) => {
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
            })
            .catch(() => undefined);
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

  useVisibleAutoRefresh(
    async () => {
      if (!selectedAssignmentId) return;
      const [backendAssignment, backendSubmissions] = await Promise.all([
        getAssignment(selectedAssignmentId),
        getAssignmentSubmissions(selectedAssignmentId),
      ]);
      if (backendAssignment) setAssignment(mapBackendAssignment(backendAssignment));
      const mapped = backendSubmissions.map((submission) =>
        mapBackendSubmission(submission, backendAssignment?.maxMarks ?? 100),
      );
      setSubmissions((current) =>
        mapped.map((submission) => {
          const previous = current.find((item) => item.id === submission.id);
          return previous ? { ...submission, submittedFiles: previous.submittedFiles } : submission;
        }),
      );
    },
    Boolean(selectedAssignmentId),
    10_000,
  );

  // When switching submission, update local inputs
  useEffect(() => {
    setInputScore(editableScore(currentSubmission, currentAssignment));
    setFeedback(currentSubmission?.feedback || "");
    setRubricScores(currentAssignment?.rubricItems.map(() => "") ?? []);
  }, [currentSubmission?.id, currentSubmission?.feedback, currentSubmission?.score]);

  useEffect(() => {
    if (!currentSubmission) return;
    let active = true;
    void getSubmissionFiles(currentSubmission.id)
      .then((files) => {
        if (!active) return;
        setSubmissions((current) =>
          current.map((submission) =>
            submission.id === currentSubmission.id
              ? {
                  ...submission,
                  submittedFiles: files.map((file) => ({
                    id: file.id,
                    name: file.originalFilename,
                  })),
                  submittedFileName: files[0]?.originalFilename,
                }
              : submission,
          ),
        );
      })
      .catch(() => {
        if (active) {
          setSubmissions((current) =>
            current.map((submission) =>
              submission.id === currentSubmission.id
                ? { ...submission, submittedFiles: [] }
                : submission,
            ),
          );
        }
      });
    return () => {
      active = false;
    };
  }, [currentSubmission?.id]);

  const handleDownloadSubmissionFile = async (file: { id: string; name: string }) => {
    if (!currentSubmission) return;
    try {
      const result = await getSubmissionFileDownload(currentSubmission.id, file.id);
      if (!result.downloadUrl)
        throw new Error("A secure submission download URL was not returned.");
      downloadFile(result.downloadUrl, file.name);
    } catch (requestError) {
      setNotice({
        title: "Download unavailable",
        message:
          requestError instanceof Error
            ? requestError.message
            : "The submission file is unavailable.",
      });
    }
  };

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

  // Hydrate the initially selected student as well as students selected from the roster.
  // The submission list contains the text/grade data, while uploaded files are a separate resource.
  useEffect(() => {
    const sub = currentSubmission;
    if (!sub || sub.id.startsWith("missing-") || sub.submittedFileName) return;
    let cancelled = false;
    void getSubmissionFiles(sub.id)
      .then(async (files) => {
        if (cancelled || !files[0]) return;
        const file = files[0];
        const download = await getSubmissionFileDownload(sub.id, file.id);
        if (cancelled) return;
        setPreviewUrl(download.downloadUrl || download.content || "");
        setSubmissions((current) =>
          current.map((submission) =>
            submission.id === sub.id
              ? {
                  ...submission,
                  submittedFileName: file.originalFilename,
                  submittedFileId: file.id,
                  submittedFileContentType: file.contentType,
                  fileSizeBytes: file.fileSize,
                }
              : submission,
          ),
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [currentSubmission?.id]);

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
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === currentSubmission.id
            ? {
                ...sub,
                ...mapped,
                submittedFileName: sub.submittedFileName,
                submittedFileId: sub.submittedFileId,
                submittedFileContentType: sub.submittedFileContentType,
                fileSizeBytes: sub.fileSizeBytes,
              }
            : sub,
        ),
      );
    } catch (requestError: unknown) {
      setNotice({
        title: "Grade could not be saved",
        message: requestError instanceof Error ? requestError.message : "Please try again.",
      });
      return;
    }

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
    const targets = (
      all
        ? submissions
        : submissions.filter((submission) => selectedSubmissionIds.includes(submission.id))
    ).filter(
      (submission) =>
        !submission.id.startsWith("missing-") &&
        submission.score !== undefined &&
        !submission.gradeReleased,
    );
    if (targets.length === 0) {
      setNotice({
        title: "No grades to release",
        message: all
          ? "There are no saved private grades available to release."
          : "Select at least one saved private grade before releasing results.",
      });
      return;
    }
    try {
      const released = await Promise.all(
        targets.map((submission) => releaseSubmissionGrade(submission.id)),
      );
      setSubmissions((current) =>
        current.map((submission) =>
          released.some((result) => result.id === submission.id)
            ? {
                ...submission,
                ...mapBackendSubmission(
                  released.find((result) => result.id === submission.id)!,
                  currentAssignment?.maxMarks ?? submission.maxMarks,
                ),
                submittedFileName: submission.submittedFileName,
                submittedFileId: submission.submittedFileId,
                submittedFileContentType: submission.submittedFileContentType,
                fileSizeBytes: submission.fileSizeBytes,
              }
            : submission,
        ),
      );
      setSelectedSubmissionIds((current) =>
        current.filter((id) => !targets.some((target) => target.id === id)),
      );
    } catch (requestError: unknown) {
      setNotice({
        title: "Release failed",
        message:
          requestError instanceof Error
            ? requestError.message
            : "Some grades could not be released.",
      });
    }
  };

  const handleHoldSelected = async () => {
    const targets = submissions.filter(
      (submission) =>
        selectedSubmissionIds.includes(submission.id) &&
        !submission.id.startsWith("missing-") &&
        submission.score !== undefined &&
        submission.gradeReleased === true,
    );
    if (targets.length === 0) {
      setNotice({
        title: "No released grades to hold",
        message: "Select released grades before choosing Hold selected.",
      });
      return;
    }
    try {
      const held = await Promise.all(
        targets.map((submission) => holdSubmissionGrade(submission.id)),
      );
      setSubmissions((current) =>
        current.map((submission) =>
          held.some((result) => result.id === submission.id)
            ? {
                ...submission,
                ...mapBackendSubmission(
                  held.find((result) => result.id === submission.id)!,
                  currentAssignment?.maxMarks ?? submission.maxMarks,
                ),
                submittedFileName: submission.submittedFileName,
                submittedFileId: submission.submittedFileId,
                submittedFileContentType: submission.submittedFileContentType,
                fileSizeBytes: submission.fileSizeBytes,
              }
            : submission,
        ),
      );
    } catch (requestError: unknown) {
      setNotice({
        title: "Hold failed",
        message:
          requestError instanceof Error ? requestError.message : "Some grades could not be held.",
      });
    }
  };

  const gradedCount = submissions.filter((s) => s.status === "Graded").length;
  const filteredSubmissions = submissions.filter((submission) =>
    submission.studentName.toLowerCase().includes(studentSearch.trim().toLowerCase()),
  );
  const currentSubmissionIndex = submissions.findIndex((s) => s.id === currentSubmission?.id);
  const isLastSubmission = currentSubmissionIndex === submissions.length - 1;
  const allStudentsGraded = submissions.length > 0 && gradedCount === submissions.length;

  if (isLoading) {
    return <div className="p-10 text-center text-sm text-slate-500">Loading submissions...</div>;
  }

  if (!currentAssignment) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        {loadError || "Assignment details are unavailable."}
        <button onClick={onBack} className="ml-3 text-indigo-600 underline">
          Back to assignments
        </button>
      </div>
    );
  }

  if (!currentSubmission) {
    return (
      <div className="-m-4 flex min-h-[calc(100vh-5rem)] flex-col overflow-hidden bg-slate-100 lg:-m-6">
        <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onBack}
              className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              title="Back to Assignments"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {currentAssignment.courseCode}
              </p>
              <h1 className="truncate text-sm font-bold text-slate-900">
                {currentAssignment.title}
              </h1>
            </div>
          </div>
          <button
            onClick={() => onNavigate("grades")}
            className="hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:block"
          >
            Open Gradebook
          </button>
        </div>

        <main className="flex flex-1 items-center justify-center p-6">
          <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <FileText className="h-8 w-8" />
            </div>
            <span className="mt-5 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              No submissions yet
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
              No students have submitted this assignment
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              There is nothing to grade yet. Student submissions will appear here as soon as they
              are received.
            </p>

            <div className="mx-auto mt-7 grid max-w-sm grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 py-3">
              <div>
                <p className="font-mono text-xl font-bold text-slate-900">0</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">Submissions</p>
              </div>
              <div>
                <p className="font-mono text-xl font-bold text-emerald-600">0%</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">Grading progress</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onBack}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back to assignments
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Refresh submissions
              </button>
            </div>
          </section>
        </main>
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
        <aside
          className={`${isRosterCollapsed ? "w-14" : "w-72"} bg-white border-r border-slate-200 flex flex-col shrink-0 transition-[width] duration-200`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 p-3">
            {!isRosterCollapsed && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Student roster
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  {submissions.length} students · {gradedCount} graded
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsRosterCollapsed((current) => !current)}
              className="ml-auto rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              title={isRosterCollapsed ? "Expand student roster" : "Collapse student roster"}
              aria-label={isRosterCollapsed ? "Expand student roster" : "Collapse student roster"}
            >
              {isRosterCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          {!isRosterCollapsed && (
            <>
              <div className="border-b border-slate-200 p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="search"
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Search students..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => {
                  const isSelected = sub.id === currentSubmission?.id;
                  const isCheckboxSelected = selectedSubmissionIds.includes(sub.id);
                  const isGraded = sub.status === "Graded" || sub.score !== undefined;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSelectSubmission(sub)}
                      className={`flex cursor-pointer items-start gap-2 p-3 text-left transition-colors ${
                        isSelected
                          ? "border-l-4 border-indigo-600 bg-indigo-50/70"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {!sub.id.startsWith("missing-") && (
                        <input
                          type="checkbox"
                          checked={isCheckboxSelected}
                          onChange={(event) => {
                            event.stopPropagation();
                            setSelectedSubmissionIds((current) =>
                              event.target.checked
                                ? [...current, sub.id]
                                : current.filter((id) => id !== sub.id),
                            );
                          }}
                          onClick={(event) => event.stopPropagation()}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`truncate text-xs font-semibold ${isSelected ? "text-indigo-900" : "text-slate-900"}`}
                          >
                            {sub.studentName}
                          </p>
                          {isGraded && (
                            <span className="relative inline-flex shrink-0" title="Grade saved">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-slate-400">{sub.submissionDate}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <StatusBadge status={sub.status} variant="clean" />
                          {sub.gradeReleased && (
                            <span className="text-[10px] font-semibold text-emerald-600">
                              Released
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {`${sub.score ?? 0}/${sub.maxMarks}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 border-t border-slate-200 bg-slate-50/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Grade visibility
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {selectedSubmissionIds.length} selected
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleReleaseSelected(true)}
                  disabled={submissions.every((submission) => submission.score === undefined)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Release all grades
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleReleaseSelected(false)}
                    disabled={selectedSubmissionIds.length === 0}
                    className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Release selected
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleHoldSelected()}
                    disabled={selectedSubmissionIds.length === 0}
                    className="rounded-lg border border-amber-200 bg-white px-2 py-2 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Hold selected
                  </button>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-400">
                  Saving a grade never releases it. Use these actions to change student visibility.
                </p>
              </div>
            </>
          )}
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
            {currentSubmission.submittedFiles?.map((file) => (
              <div key={file.id} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono hidden md:inline">
                  {file.name}
                </span>
                <button
                  onClick={() => void handleDownloadSubmissionFile(file)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1"
                  aria-label={`Download ${file.name}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {currentSubmission.submittedFileId && (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                      Submitted material
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {currentSubmission.submittedFileName || "Uploaded file"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {currentSubmission.submittedFileContentType || "Document"}
                      {currentSubmission.fileSizeBytes
                        ? ` · ${(currentSubmission.fileSizeBytes / 1024 / 1024).toFixed(2)} MB`
                        : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) window.open(previewUrl, "_blank", "noopener,noreferrer");
                  }}
                  disabled={!previewUrl}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Open file
                </button>
              </div>
            )}

            {currentSubmission.submittedFileId &&
            currentSubmission.submittedFileContentType?.includes("pdf") ? (
              <div className="h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <iframe
                  title={`Preview of ${currentSubmission.submittedFileName}`}
                  src={previewUrl}
                  className="h-full w-full"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Student notes and response
                  </span>
                  <p className="whitespace-pre-line font-sans text-xs leading-relaxed text-slate-800">
                    {currentSubmission.submittedContentText || "No additional notes were provided."}
                  </p>
                </div>
              </>
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

            {currentSubmission.isLate &&
              Number(currentAssignment.latePenaltyPercentage || 0) > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Late penalty: {currentAssignment.latePenaltyPercentage}%
                  <span className="block mt-1 font-mono font-bold">
                    Final mark:{" "}
                    {Math.max(
                      0,
                      Number(inputScore || 0) *
                        (1 - Number(currentAssignment.latePenaltyPercentage || 0) / 100),
                    ).toFixed(2)}{" "}
                    / {currentAssignment.maxMarks}
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
                  const allotted = (currentAssignment.maxMarks * r.marks) / 100;
                  return (
                    <label
                      key={i}
                      className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
                    >
                      <span className="text-slate-700 leading-snug">
                        {r.criterion}
                        <span className="block text-[10px] text-slate-400">
                          Out of {Number(allotted.toFixed(2))} marks ({r.marks}%)
                        </span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={allotted}
                        value={rubricScores[i] || ""}
                        onChange={(event) => {
                          const next = [...rubricScores];
                          next[i] = event.target.value;
                          setRubricScores(next);
                          setInputScore(
                            String(next.reduce((sum, value) => sum + (Number(value) || 0), 0)),
                          );
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
                  <span>
                    {allStudentsGraded
                      ? "All students graded"
                      : isLastSubmission
                        ? "Save Grade & Finish"
                        : "Save & Next Student"}
                  </span>
                  {!isLastSubmission && <ChevronRight className="w-3.5 h-3.5" />}
                </>
              )}
            </button>
            <p className="text-center text-[10px] leading-relaxed text-slate-400">
              This saves the grade privately for teacher review. Student results remain hidden until
              released from the roster panel.
            </p>
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
