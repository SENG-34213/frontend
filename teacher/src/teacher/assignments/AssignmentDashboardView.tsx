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
  Send,
  Pencil,
  Trash2,
  Upload,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import { Assignment, NavigationTab } from "../types";
import type { BackendCourse } from "../api/courseApi";
import {
  closeAssignment,
  deleteAssignment,
  getCourseAssignments,
  publishAssignment,
  updateAssignment,
  deleteAssignmentAttachment,
  getAssignmentAttachmentDownload,
  listAssignmentAttachments,
  uploadAssignmentAttachment,
  type BackendAssignment,
  type AssignmentAttachment,
  type AssignmentUpdateDraft,
} from "../api/assignmentApi";
import { StatusBadge } from "../components/StatusBadge";
import { ApiError } from "../api/client";
import { ConfirmModal } from "../components/ActionModal";
import { EmptyState } from "../../../../shared/ui/EmptyState";

interface AssignmentDashboardViewProps {
  onGradeAssignment: (assignmentId: string) => void;
  onOpenCreateAssignment: () => void;
  onNavigate: (tab: NavigationTab) => void;
  backendCourses?: BackendCourse[];
  refreshToken?: number;
}

type EditRubric = { criterion: string; marks: string };

const AssignmentStudentPreview: React.FC<{
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxMarks: string;
  allowedAttempts: string;
  allowLateSubmission: boolean;
  latePenaltyPercentage: string;
  rubricItems: EditRubric[];
  attachments: AssignmentAttachment[];
  onPreviewAttachment: (attachment: AssignmentAttachment) => void;
  onClose: () => void;
}> = ({
  title,
  description,
  instructions,
  dueDate,
  maxMarks,
  allowedAttempts,
  allowLateSubmission,
  latePenaltyPercentage,
  rubricItems,
  attachments,
  onPreviewAttachment,
  onClose,
}) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
    <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
            <Eye className="h-3.5 w-3.5" />
            Student preview
          </p>
          <h2 className="mt-1 text-base font-bold text-slate-900">
            How students will see this assignment
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Close preview
        </button>
      </div>
      <div className="min-h-0 overflow-y-auto p-4 sm:p-7">
        <div className="mx-auto max-w-5xl space-y-5">
          <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white p-5 shadow-sm sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-indigo-600" />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                  Assignment
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  {title || "Untitled assignment"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  {description || "No description provided."}
                </p>
              </div>
              <span className="rounded-xl border border-indigo-100 bg-white px-3.5 py-2.5 text-xs font-bold text-indigo-700 shadow-2xs">
                {maxMarks || "0"} points
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                Due: {dueDate ? new Date(dueDate).toLocaleString() : "Not set"}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                {allowedAttempts || "1"} attempt{allowedAttempts === "1" ? "" : "s"}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                {allowLateSubmission
                  ? `Late submissions allowed · ${latePenaltyPercentage || "0"}% penalty`
                  : "Late submissions not allowed"}
              </span>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Assignment instructions</h3>
              </div>
              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700">
                {instructions || "No additional instructions provided."}
              </div>
              {attachments.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-slate-900">Reference documents</h3>
                  <div className="mt-3 space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-indigo-600" />
                          <span className="truncate text-xs font-medium text-slate-700">
                            {attachment.originalFilename}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onPreviewAttachment(attachment)}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Your submission</h3>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                  Preview
                </span>
              </div>
              <div className="mt-4 rounded-xl border-2 border-dashed border-indigo-100 bg-indigo-50/40 p-5 text-center">
                <Upload className="mx-auto h-7 w-7 text-indigo-500" />
                <p className="mt-2 text-xs font-semibold text-slate-700">Upload your work</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Students will see the submission area here.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white opacity-50"
                >
                  Submit assignment
                </button>
              </div>
            </aside>
          </div>

          {rubricItems.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h3 className="text-sm font-bold text-slate-900">Assessment rubric</h3>
              <div className="mt-3 divide-y divide-slate-100">
                {rubricItems.map((item, index) => (
                  <div
                    key={`${item.criterion}-${index}`}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="text-slate-700">{item.criterion || "Untitled criterion"}</span>
                    <span className="font-mono font-semibold text-indigo-600">
                      {item.marks || "0"} pts
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  </div>
);

const assignmentDateInput = (value?: string) => (value ? value.slice(0, 16) : "");

const AssignmentEditModal: React.FC<{
  isOpen: boolean;
  assignment: BackendAssignment | null;
  onClose: () => void;
  onSave: (draft: AssignmentUpdateDraft) => void | Promise<void>;
}> = ({ isOpen, assignment, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [allowedAttempts, setAllowedAttempts] = useState("1");
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [latePenaltyPercentage, setLatePenaltyPercentage] = useState("0");
  const [rubricItems, setRubricItems] = useState<EditRubric[]>([]);
  const [attachments, setAttachments] = useState<AssignmentAttachment[]>([]);
  const [isStudentPreviewOpen, setIsStudentPreviewOpen] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!assignment || !isOpen) return;
    setTitle(assignment.title);
    setDescription(assignment.description || "");
    setInstructions(assignment.instructions || "");
    setStartDate(assignmentDateInput(assignment.startDate));
    setDueDate(assignmentDateInput(assignment.dueDate));
    setMaxMarks(String(assignment.maxMarks));
    setAllowedAttempts(String(assignment.allowedAttempts || 1));
    setAllowLateSubmission(Boolean(assignment.allowLateSubmission));
    setLatePenaltyPercentage(String(assignment.latePenaltyPercentage || 0));
    setRubricItems(
      (assignment.rubricItems || []).map((item) => ({
        criterion: item.criterion,
        marks: String(item.marks),
      })),
    );
    setAttachments([]);
    setIsStudentPreviewOpen(false);
    setAttachmentError("");
    setFormError("");
    const controller = new AbortController();
    listAssignmentAttachments(assignment.id, controller.signal)
      .then(setAttachments)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setAttachmentError(
            error instanceof Error ? error.message : "Documents could not be loaded.",
          );
        }
      });
    return () => controller.abort();
  }, [assignment, isOpen]);

  if (!isOpen || !assignment) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return setFormError("Assignment title is required.");
    if (!startDate || !dueDate || startDate > dueDate) {
      return setFormError("The due date must be on or after the start date.");
    }
    if (Number(maxMarks) < 1 || Number(allowedAttempts) < 1) {
      return setFormError("Maximum marks and allowed attempts must be at least 1.");
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        startDate: `${startDate}:00`,
        dueDate: `${dueDate}:00`,
        maxMarks: Number(maxMarks),
        allowedAttempts: Number(allowedAttempts),
        allowLateSubmission,
        latePenaltyPercentage: allowLateSubmission ? Number(latePenaltyPercentage) || 0 : 0,
        rubricItems: rubricItems
          .filter((item) => item.criterion.trim() && Number(item.marks) > 0)
          .map((item) => ({ criterion: item.criterion.trim(), marks: Number(item.marks) })),
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Assignment could not be updated.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const downloadAttachment = async (attachment: AssignmentAttachment) => {
    try {
      const result = await getAssignmentAttachmentDownload(assignment.id, attachment.id);
      if (!result.downloadUrl) throw new Error("A secure document link was not returned.");
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = attachment.originalFilename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setAttachmentError(error instanceof Error ? error.message : "Document could not be opened.");
    }
  };

  const previewAttachment = async (attachment: AssignmentAttachment) => {
    try {
      const result = await getAssignmentAttachmentDownload(assignment.id, attachment.id);
      if (!result.downloadUrl) throw new Error("A secure document link was not returned.");
      window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setAttachmentError(
        error instanceof Error ? error.message : "Document could not be previewed.",
      );
    }
  };

  const uploadAttachments = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploadingAttachment(true);
    setAttachmentError("");
    try {
      const uploaded = [] as AssignmentAttachment[];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadAssignmentAttachment(assignment.id, file));
      }
      setAttachments((current) => [...current, ...uploaded]);
    } catch (error) {
      setAttachmentError(error instanceof Error ? error.message : "Document upload failed.");
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const removeAttachment = async (attachment: AssignmentAttachment) => {
    setAttachmentError("");
    try {
      await deleteAssignmentAttachment(assignment.id, attachment.id);
      setAttachments((current) => current.filter((item) => item.id !== attachment.id));
    } catch (error) {
      setAttachmentError(error instanceof Error ? error.message : "Document could not be removed.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs">
      <form
        onSubmit={submit}
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit assignment</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Update all assignment settings and grading criteria.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsStudentPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              <Eye className="h-3.5 w-3.5" />
              Student view
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {formError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Start date
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Due date
              <input
                type="datetime-local"
                min={startDate}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Maximum marks
              <input
                type="number"
                min="1"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Allowed attempts
              <input
                type="number"
                min="1"
                value={allowedAttempts}
                onChange={(e) => setAllowedAttempts(e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate-700">
            Description
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${fieldClass} resize-none`}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Instructions
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className={`${fieldClass} resize-none`}
            />
          </label>
          <section className="space-y-3 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-800">Assignment documents</h3>
                <p className="mt-1 text-[11px] font-normal text-slate-500">
                  Upload reference files, templates, or supporting documents.
                </p>
              </div>
              <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50">
                <Upload className="h-3.5 w-3.5" />
                {isUploadingAttachment ? "Uploading…" : "Add files"}
                <input
                  type="file"
                  multiple
                  disabled={isUploadingAttachment}
                  className="sr-only"
                  onChange={(event) => {
                    void uploadAttachments(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            {attachmentError && (
              <p className="text-xs font-normal text-rose-600">{attachmentError}</p>
            )}
            {attachments.length > 0 ? (
              <div className="space-y-1.5">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-indigo-100 bg-white px-2.5 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-indigo-500" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-700">
                          {attachment.originalFilename}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {attachment.contentType} ·{" "}
                          {(attachment.fileSize / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void previewAttachment(attachment)}
                        className="rounded p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50"
                        aria-label={`Preview ${attachment.originalFilename}`}
                        title="Preview document"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void downloadAttachment(attachment)}
                        className="rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
                        aria-label={`Download ${attachment.originalFilename}`}
                        title="Download document"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeAttachment(attachment)}
                        className="rounded p-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                        aria-label={`Remove ${attachment.originalFilename}`}
                        title="Remove document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] font-normal text-slate-400">No documents attached yet.</p>
            )}
          </section>
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={allowLateSubmission}
                onChange={(e) => setAllowLateSubmission(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />{" "}
              Allow late submissions
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Late penalty (%)
              <input
                type="number"
                min="0"
                max="100"
                disabled={!allowLateSubmission}
                value={latePenaltyPercentage}
                onChange={(e) => setLatePenaltyPercentage(e.target.value)}
                className={`${fieldClass} disabled:bg-slate-100`}
              />
            </label>
          </div>
          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Rubric criteria</span>
              <button
                type="button"
                onClick={() => setRubricItems((items) => [...items, { criterion: "", marks: "" }])}
                className="text-xs font-semibold text-indigo-600"
              >
                + Add criterion
              </button>
            </div>
            {rubricItems.map((item, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row">
                <input
                  placeholder="Criterion"
                  value={item.criterion}
                  onChange={(e) =>
                    setRubricItems((items) =>
                      items.map((row, i) =>
                        i === index ? { ...row, criterion: e.target.value } : row,
                      ),
                    )
                  }
                  className={`${fieldClass} mt-0 flex-1`}
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Marks"
                  value={item.marks}
                  onChange={(e) =>
                    setRubricItems((items) =>
                      items.map((row, i) =>
                        i === index ? { ...row, marks: e.target.value } : row,
                      ),
                    )
                  }
                  className={`${fieldClass} mt-0 sm:w-24`}
                />
                <button
                  type="button"
                  onClick={() => setRubricItems((items) => items.filter((_, i) => i !== index))}
                  className="text-left text-xs text-rose-600 sm:px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            Course, module, and lesson links are kept from the original assignment.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
      {isStudentPreviewOpen && (
        <AssignmentStudentPreview
          title={title}
          description={description}
          instructions={instructions}
          dueDate={dueDate}
          maxMarks={maxMarks}
          allowedAttempts={allowedAttempts}
          allowLateSubmission={allowLateSubmission}
          latePenaltyPercentage={latePenaltyPercentage}
          rubricItems={rubricItems}
          attachments={attachments}
          onPreviewAttachment={(attachment) => void previewAttachment(attachment)}
          onClose={() => setIsStudentPreviewOpen(false)}
        />
      )}
    </div>
  );
};

const toAssignment = (item: BackendAssignment, courses: BackendCourse[]): Assignment => {
  const course = courses.find((entry) => entry.id === item.courseId);
  const due = new Date(item.dueDate);
  const opened = new Date(item.startDate);
  return {
    id: item.id,
    courseId: item.courseId,
    courseCode: course?.courseCode || course?.courseName || item.courseId,
    title: item.title,
    description: item.description || item.instructions || "",
    openedDate: Number.isNaN(opened.getTime()) ? item.startDate : opened.toLocaleDateString(),
    openedTime: Number.isNaN(opened.getTime())
      ? ""
      : opened.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    dueDate: Number.isNaN(due.getTime()) ? item.dueDate : due.toLocaleDateString(),
    dueTime: Number.isNaN(due.getTime())
      ? ""
      : due.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    dueAt: item.dueDate,
    maxMarks: item.maxMarks,
    weightagePercent: 0,
    allowedAttempts: item.allowedAttempts,
    allowLateSubmission: item.allowLateSubmission,
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
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatCountdown = (dueAt?: string) => {
    if (!dueAt) return "Deadline unavailable";
    const remaining = new Date(dueAt).getTime() - currentTime;
    if (Number.isNaN(remaining) || remaining <= 0) return "Due now";
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m ${seconds}s remaining`;
  };

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

  const handleEdit = async (draft: AssignmentUpdateDraft) => {
    const record = editingAssignment;
    if (!record) {
      setEditingAssignment(null);
      return;
    }
    try {
      const updated = await updateAssignment(record.id, draft);
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
          <p className="text-[11px] text-slate-400 mt-0.5">
            Across {backendCourses.length} assigned courses
          </p>
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
        <EmptyState
          compact
          icon={ClipboardList}
          title="No assigned courses"
          description="Assignments will appear after a course is assigned to you."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          compact
          icon={FileCheck}
          title="No assignments found"
          description="No assignments match the current filters."
        />
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
              className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs lg:flex-row lg:gap-6"
            >
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {asg.courseCode}
                  </span>
                  <StatusBadge status={asg.status} />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900">{asg.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {asg.description || "No description provided."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Opened: {asg.openedDate || "Not set"}
                    {asg.openedTime ? ` at ${asg.openedTime}` : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Due: {asg.dueDate} at {asg.dueTime}
                  </span>
                  <span className="font-mono font-medium text-slate-700">
                    {asg.maxMarks} marks · {asg.allowedAttempts || 1} attempt
                    {asg.allowedAttempts === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="w-full shrink-0 border-t border-slate-100 pt-4 lg:w-[270px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                {asg.status === "Active" && (
                  <div className="flex items-center justify-end gap-2 text-indigo-700">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    <span
                      aria-live="polite"
                      className="font-mono text-lg font-bold tabular-nums tracking-tight"
                    >
                      {formatCountdown(asg.dueAt)}
                    </span>
                  </div>
                )}
                <div className="mt-4 space-y-3">
                  <div className="w-full space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Graded</span>
                      <span className="font-mono font-bold tabular-nums">
                        {asg.gradedCount}/{asg.totalSubmissions}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="block text-right font-mono text-[10px] text-slate-400">
                      {progressPercent}% complete
                    </span>
                  </div>

                  <button
                    onClick={() => onGradeAssignment(asg.id)}
                    className="flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 active:bg-indigo-800"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span>Grade Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {asg.status === "Draft" && (
                      <button
                        type="button"
                        onClick={() => void handleStatusChange(asg, "publish")}
                        aria-label={`Publish ${asg.title}`}
                        title="Publish assignment"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 text-emerald-700 transition-colors hover:bg-emerald-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {asg.status === "Active" && (
                      <button
                        type="button"
                        onClick={() => void handleStatusChange(asg, "close")}
                        className="rounded-md border border-amber-200 px-2 py-1 text-[10px] font-medium text-amber-700 transition-colors hover:bg-amber-50"
                      >
                        Close
                      </button>
                    )}
                    {asg.status === "Draft" && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingAssignment(
                            backendAssignments.find((entry) => entry.id === asg.id) ?? null,
                          )
                        }
                        aria-label={`Edit ${asg.title}`}
                        title="Edit assignment"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeletingAssignment(asg)}
                      aria-label={`Delete ${asg.title}`}
                      title="Delete assignment"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 text-rose-700 transition-colors hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <AssignmentEditModal
        isOpen={Boolean(editingAssignment)}
        assignment={editingAssignment}
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
