import React, { useEffect, useState } from "react";
import { Plus, Calendar, Clock, MapPin, CheckCircle, ChevronRight } from "lucide-react";
import { Examination, NavigationTab } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import {
  cancelExam,
  completeExam,
  createExam,
  enterExamMarks,
  getCourseExams,
  getExamResults,
  getExamSummary,
  scheduleExam,
  startExamMarking,
  updateExam,
  type BackendExam,
  type ExamResultSheet,
  type ExamSummary,
} from "../api/examApi";
import type { BackendCourse } from "../api/courseApi";
import { TextInputModal } from "../components/ActionModal";
import { ExamInstructionUpload } from "../components/ExamInstructionUpload";
import { downloadExamAttachment, getExamAttachments, type ExamAttachment } from "../api/examApi";

interface ExamManagementViewProps {
  onNavigate?: (tab: NavigationTab) => void;
  backendCourses?: BackendCourse[];
  backendCoursesLoading?: boolean;
  backendCoursesError?: Error | null;
}

const examTypeLabel = (type: BackendExam["type"]): Examination["examType"] => {
  if (type === "FINAL") return "Final";
  if (type === "PRACTICAL") return "Practical Exam";
  return "Midterm";
};

const examStatusLabel = (status: BackendExam["status"]): Examination["status"] => {
  if (status === "DRAFT") return "Draft";
  if (status === "MARKING") return "Grading";
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  return "Scheduled";
};

const minutesBetween = (startTime: string, endTime: string) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  return duration > 0 ? duration : 120;
};

const toDisplayTime = (time: string) => {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  if (!Number.isFinite(hour)) return time;
  return `${hour % 12 || 12}:${minuteText ?? "00"} ${hour >= 12 ? "PM" : "AM"}`;
};

const fromDisplayTime = (time: string) => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time;
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${match[2]}:00`;
};

const mapBackendExam = (exam: BackendExam, courses: BackendCourse[]): Examination => {
  const course = courses.find((item) => item.id === exam.courseId);
  const start = exam.startTime?.slice(0, 5) || "00:00";
  return {
    id: exam.id,
    courseId: exam.courseId,
    courseCode: course?.subject || course?.courseName || exam.courseId,
    title: exam.title,
    examType: examTypeLabel(exam.type),
    scheduledDate: exam.examDate,
    startTime: toDisplayTime(start),
    durationMinutes: minutesBetween(start, exam.endTime?.slice(0, 5) || start),
    roomOrPlatform: "Venue not provided",
    totalMarks: Number(exam.totalMarks),
    weightagePercent: 0,
    status: examStatusLabel(exam.status),
    enrolledStudents: course?.numberOfStudents ?? 0,
    gradedStudents: 0,
  };
};

export const ExamManagementView: React.FC<ExamManagementViewProps> = ({
  onNavigate,
  backendCourses = [],
  backendCoursesLoading = false,
  backendCoursesError = null,
}) => {
  const [exams, setExams] = useState<Examination[]>([]);
  const [backendExams, setBackendExams] = useState<BackendExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard state
  const [wizardCourseId, setWizardCourseId] = useState("");
  const [wizardTitle, setWizardTitle] = useState("");
  const [wizardDescription, setWizardDescription] = useState("");
  const [wizardType, setWizardType] = useState<"Midterm" | "Final" | "Practical Exam">("Midterm");
  const [wizardDate, setWizardDate] = useState("2026-11-15");
  const [wizardTime, setWizardTime] = useState("10:00 AM");
  const [wizardDuration, setWizardDuration] = useState("120");
  const [wizardRoom, setWizardRoom] = useState("Alan Turing Auditorium");
  const [wizardWeight, setWizardWeight] = useState("30");
  const [resultsExam, setResultsExam] = useState<BackendExam | null>(null);
  const [resultSheet, setResultSheet] = useState<ExamResultSheet | null>(null);
  const [examSummary, setExamSummary] = useState<ExamSummary | null>(null);
  const [resultMarks, setResultMarks] = useState<Record<string, string>>({});
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [editingExam, setEditingExam] = useState<BackendExam | null>(null);
  const [instructionFile, setInstructionFile] = useState<File | null>(null);
  const [editingInstructionFile, setEditingInstructionFile] = useState<File | null>(null);
  const [editingAttachment, setEditingAttachment] = useState<ExamAttachment | null>(null);
  const [studentVisible, setStudentVisible] = useState(true);
  const [isSavingExam, setIsSavingExam] = useState(false);

  useEffect(() => {
    if (
      backendCourses.length > 0 &&
      !backendCourses.some((course) => course.id === wizardCourseId)
    ) {
      setWizardCourseId(backendCourses[0].id);
    }
  }, [backendCourses, wizardCourseId]);

  useEffect(() => {
    if (backendCoursesLoading) return;
    if (backendCoursesError) {
      setError(backendCoursesError.message);
      setIsLoading(false);
      return;
    }
    if (backendCourses.length === 0) {
      setBackendExams([]);
      setExams([]);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    Promise.all(backendCourses.map((course) => getCourseExams(course.id, controller.signal)))
      .then((responses) => {
        if (controller.signal.aborted) return;
        const liveExams = responses.flat();
        setBackendExams(liveExams);
        setExams(liveExams.map((exam) => mapBackendExam(exam, backendCourses)));
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : "Exams failed to load.");
          setBackendExams([]);
          setExams([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [backendCourses, backendCoursesError, backendCoursesLoading]);

  const replaceExam = (updated: BackendExam) => {
    setBackendExams((current) => current.map((exam) => (exam.id === updated.id ? updated : exam)));
    setExams((current) =>
      current.map((exam) =>
        exam.id === updated.id ? mapBackendExam(updated, backendCourses) : exam,
      ),
    );
  };

  const handleTransition = async (
    exam: BackendExam,
    transition: "schedule" | "start-marking" | "complete" | "cancel",
  ) => {
    try {
      const updated =
        transition === "schedule"
          ? await scheduleExam(exam.id)
          : transition === "start-marking"
            ? await startExamMarking(exam.id)
            : transition === "complete"
              ? await completeExam(exam.id)
              : await cancelExam(exam.id);
      replaceExam(updated);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Exam transition failed.");
    }
  };

  const handleEditExam = async (title: string) => {
    const exam = editingExam;
    if (!exam || exam.status !== "DRAFT") return;
    if (title === exam.title && !editingInstructionFile) {
      setEditingExam(null);
      return;
    }
    try {
      setIsSavingExam(true);
      const updated = await updateExam(
        exam.id,
        {
          title,
          description: exam.description,
          examDate: exam.examDate,
          startTime: exam.startTime,
          endTime: exam.endTime,
          totalMarks: Number(exam.totalMarks),
          passMarks: Number(exam.passMarks),
          type: exam.type,
        },
        { instructionFile: editingInstructionFile, studentVisible },
      );
      replaceExam(updated);
      setEditingExam(null);
      setEditingInstructionFile(null);
      setEditingAttachment(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Exam could not be updated.");
    } finally {
      setIsSavingExam(false);
    }
  };

  const openEditExam = async (exam: BackendExam) => {
    setEditingExam(exam);
    setEditingInstructionFile(null);
    setEditingAttachment(null);
    setStudentVisible(true);
    try {
      const attachments = await getExamAttachments(exam.id);
      const activeAttachment = attachments.find((attachment) => attachment.active) ?? null;
      setEditingAttachment(activeAttachment);
      if (activeAttachment) setStudentVisible(activeAttachment.studentVisible);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Exam attachments failed to load.",
      );
    }
  };

  const openResults = async (exam: BackendExam) => {
    setResultsExam(exam);
    setResultsLoading(true);
    setResultsError(null);
    try {
      const [sheet, summary] = await Promise.all([
        getExamResults(exam.id),
        getExamSummary(exam.id),
      ]);
      setResultSheet(sheet);
      setExamSummary(summary);
      setResultMarks(
        Object.fromEntries(
          sheet.results.map((result) => [result.studentId, result.marksObtained?.toString() ?? ""]),
        ),
      );
    } catch (requestError) {
      setResultsError(
        requestError instanceof Error ? requestError.message : "Exam results failed to load.",
      );
    } finally {
      setResultsLoading(false);
    }
  };

  const saveExamMarks = async () => {
    if (!resultsExam || !resultSheet || resultsExam.status !== "MARKING") return;
    try {
      const results = resultSheet.results.map((result) => {
        const raw = resultMarks[result.studentId];
        const marks = raw === "" ? undefined : Number(raw);
        if (
          marks !== undefined &&
          (!Number.isFinite(marks) || marks < 0 || marks > Number(resultsExam.totalMarks))
        ) {
          throw new Error(
            `Marks for ${result.studentId} must be between 0 and ${resultsExam.totalMarks}.`,
          );
        }
        return {
          studentId: result.studentId,
          attendanceStatus: result.attendanceStatus,
          ...(marks === undefined ? {} : { marksObtained: marks }),
          remarks: result.remarks,
        };
      });
      const saved = await enterExamMarks(resultsExam.id, results);
      setResultSheet((current) => (current ? { ...current, results: saved.results } : current));
    } catch (requestError) {
      setResultsError(
        requestError instanceof Error ? requestError.message : "Exam marks could not be saved.",
      );
    }
  };

  const handleFinishWizard = async (e: React.FormEvent) => {
    e.preventDefault();
    const backendCourse = backendCourses.find((item) => item.id === wizardCourseId);
    if (!backendCourse) {
      setError("Select a course before creating an exam.");
      return;
    }
    const courseCode = backendCourse.subject || backendCourse.courseName;
    const startTime = fromDisplayTime(wizardTime);
    const startDate = new Date(`1970-01-01T${startTime}`);
    const endDate = new Date(startDate.getTime() + (Number(wizardDuration) || 120) * 60_000);
    const endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(
      endDate.getMinutes(),
    ).padStart(2, "0")}:00`;

    if (backendCourse) {
      try {
        setIsSavingExam(true);
        const created = await createExam(
          {
            courseId: backendCourse.id,
            title: wizardTitle || `${courseCode} ${wizardType} Examination`,
            description: wizardDescription.trim() || undefined,
            examDate: wizardDate,
            startTime,
            endTime,
            totalMarks: 100,
            passMarks: 40,
            type:
              wizardType === "Final"
                ? "FINAL"
                : wizardType === "Practical Exam"
                  ? "PRACTICAL"
                  : "MIDTERM",
          },
          { instructionFile, studentVisible },
        );
        if (created) {
          setBackendExams((current) => [created, ...current]);
          setExams((current) => [mapBackendExam(created, backendCourses), ...current]);
          setIsWizardOpen(false);
          setWizardStep(1);
          setWizardTitle("");
          setWizardDescription("");
          setInstructionFile(null);
          return;
        }
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Exam could not be created.",
        );
        return;
      } finally {
        setIsSavingExam(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Examination Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administer formal midterms and final comprehensive examinations, room logistics, and
            grading protocols.
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule New Exam</span>
        </button>
      </div>

      {/* 5-Step Exam Creation Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-700">
                    Step {wizardStep} of 5
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {wizardStep === 1 && "1. Basic Course & Exam Type"}
                    {wizardStep === 2 && "2. Proctoring & Exam Duration"}
                    {wizardStep === 3 && "3. Content Format & Question Blueprint"}
                    {wizardStep === 4 && "4. Scheduling & Venue Logistics"}
                    {wizardStep === 5 && "5. Review & Publish Schedule"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {/* Step indicator bar */}
              <div className="flex gap-1.5 mt-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      s <= wizardStep ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Wizard Body */}
            <div className="p-6 space-y-4">
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Course
                    </label>
                    <select
                      value={wizardCourseId}
                      onChange={(e) => setWizardCourseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                    >
                      {backendCourses.length === 0 ? (
                        <option value="" disabled>
                          No courses available
                        </option>
                      ) : (
                        backendCourses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.subject || course.courseName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Exam Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Midterm", "Final", "Practical Exam"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setWizardType(t)}
                          className={`p-3 text-xs font-semibold rounded-lg border text-center transition-colors ${
                            wizardType === t
                              ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Exam Formal Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Midterm Examination: Core Data Structures"
                      value={wizardTitle}
                      onChange={(e) => setWizardTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={wizardDescription}
                      onChange={(event) => setWizardDescription(event.target.value)}
                      rows={3}
                      placeholder="Optional exam description"
                      className="w-full resize-y px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        value={wizardDuration}
                        onChange={(e) => setWizardDuration(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Course Grade Weight (%)
                      </label>
                      <input
                        type="number"
                        value={wizardWeight}
                        onChange={(e) => setWizardWeight(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">Proctoring Mode</span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input type="checkbox" defaultChecked className="text-indigo-600" />
                      <span>Require physical faculty proctor verification</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input type="checkbox" defaultChecked className="text-indigo-600" />
                      <span>Lockdown browser mode enabled</span>
                    </label>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-900">Question Blueprint Format</h4>
                    <p className="text-xs text-slate-500">
                      Standard university examination blueprint comprising Section A (Objective MCQ,
                      30 marks), Section B (Algorithmic Proofs, 40 marks), and Section C (Code
                      Implementation, 30 marks).
                    </p>
                  </div>
                  <div className="text-xs text-slate-600">
                    Question paper blueprint will be finalized in the Mentify Examination Vault 48
                    hours prior to start.
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={wizardDate}
                        onChange={(e) => setWizardDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="text"
                        value={wizardTime}
                        onChange={(e) => setWizardTime(e.target.value)}
                        placeholder="10:00 AM"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lecture Hall / Venue
                    </label>
                    <input
                      type="text"
                      value={wizardRoom}
                      onChange={(e) => setWizardRoom(e.target.value)}
                      placeholder="e.g. Turing Hall Theatre A"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <ExamInstructionUpload
                    value={instructionFile}
                    onChange={setInstructionFile}
                    disabled={isSavingExam}
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={studentVisible}
                      onChange={(event) => setStudentVisible(event.target.checked)}
                      disabled={isSavingExam}
                      className="text-indigo-600"
                    />
                    Students can view the instruction PDF
                  </label>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Review Examination Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <strong>Title:</strong> {wizardTitle || "Midterm Examination"}
                    </div>
                    <div>
                      <strong>Type:</strong> {wizardType}
                    </div>
                    <div>
                      <strong>Date:</strong> {wizardDate} at {wizardTime}
                    </div>
                    <div>
                      <strong>Duration:</strong> {wizardDuration} minutes
                    </div>
                    <div>
                      <strong>Weight:</strong> {wizardWeight}% of final grade
                    </div>
                    <div>
                      <strong>Location:</strong> {wizardRoom}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {wizardStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  disabled={isSavingExam}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isSavingExam ? "Saving..." : "Confirm & Publish Exam"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Exams List */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading exams...
        </div>
      ) : backendCourses.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No courses are assigned to you yet.
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No exams have been created for your courses yet.
        </div>
      ) : null}
      <div className="space-y-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {exam.courseCode}
                </span>
                <span className="text-xs font-semibold text-slate-500">{exam.examType}</span>
                <StatusBadge status={exam.status} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{exam.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {exam.scheduledDate} at {exam.startTime}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.durationMinutes} Minutes</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.roomOrPlatform}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-right text-xs">
                <span className="text-slate-400 block text-[10px]">Registered Candidates</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {exam.enrolledStudents} students
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {backendExams.find((item) => item.id === exam.id)?.status === "DRAFT" && (
                  <>
                    <button
                      onClick={() => {
                        const record = backendExams.find((item) => item.id === exam.id);
                        if (record) void openEditExam(record);
                      }}
                      className="px-2.5 py-1.5 text-[10px] font-medium text-slate-700 border border-slate-200 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        const record = backendExams.find((item) => item.id === exam.id);
                        if (record) void handleTransition(record, "schedule");
                      }}
                      className="px-2.5 py-1.5 text-[10px] font-medium text-indigo-700 border border-indigo-200 rounded-md"
                    >
                      Schedule
                    </button>
                  </>
                )}
                {backendExams.find((item) => item.id === exam.id)?.status === "SCHEDULED" && (
                  <button
                    onClick={() => {
                      const record = backendExams.find((item) => item.id === exam.id);
                      if (record) void handleTransition(record, "start-marking");
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-medium text-indigo-700 border border-indigo-200 rounded-md"
                  >
                    Start marking
                  </button>
                )}
                {backendExams.find((item) => item.id === exam.id)?.status === "MARKING" && (
                  <button
                    onClick={() => {
                      const record = backendExams.find((item) => item.id === exam.id);
                      if (record) void handleTransition(record, "complete");
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-medium text-emerald-700 border border-emerald-200 rounded-md"
                  >
                    Complete
                  </button>
                )}
                {(backendExams.find((item) => item.id === exam.id)?.status === "SCHEDULED" ||
                  backendExams.find((item) => item.id === exam.id)?.status === "MARKING") && (
                  <button
                    onClick={() => {
                      const record = backendExams.find((item) => item.id === exam.id);
                      if (record) void handleTransition(record, "cancel");
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-medium text-rose-700 border border-rose-200 rounded-md"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    const record = backendExams.find((item) => item.id === exam.id);
                    if (record) void openResults(record);
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>View Results Sheet</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {resultsExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{resultsExam.title} results</h2>
                {examSummary && (
                  <p className="mt-1 text-xs text-slate-500">
                    {examSummary.presentStudents} present · {examSummary.passedStudents} passed ·
                    Average {examSummary.averageMarks ?? "—"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setResultsExam(null)}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            {resultsLoading ? (
              <p className="p-8 text-center text-xs text-slate-500">Loading results...</p>
            ) : resultsError ? (
              <p className="p-8 text-center text-xs text-rose-700">{resultsError}</p>
            ) : resultSheet?.results.length ? (
              <div className="mt-4 space-y-3">
                {resultSheet.results.map((result) => (
                  <div
                    key={result.studentId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <span className="text-xs font-semibold text-slate-900">{result.studentId}</span>
                    <input
                      type="number"
                      min="0"
                      max={Number(resultsExam.totalMarks)}
                      value={resultMarks[result.studentId] ?? ""}
                      disabled={resultsExam.status !== "MARKING"}
                      onChange={(event) =>
                        setResultMarks((current) => ({
                          ...current,
                          [result.studentId]: event.target.value,
                        }))
                      }
                      className="w-24 rounded border border-slate-200 px-2 py-1 text-xs disabled:bg-slate-50"
                    />
                    <span className="text-xs text-slate-500">/ {resultsExam.totalMarks}</span>
                  </div>
                ))}
                {resultsExam.status === "MARKING" && (
                  <button
                    onClick={() => void saveExamMarks()}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Save marks
                  </button>
                )}
              </div>
            ) : (
              <p className="p-8 text-center text-xs text-slate-500">No result records available.</p>
            )}
          </div>
        </div>
      )}
      <TextInputModal
        isOpen={Boolean(editingExam)}
        title="Edit exam"
        label="Exam title"
        initialValue={editingExam?.title ?? ""}
        onClose={() => setEditingExam(null)}
        onSave={handleEditExam}
        isSubmitting={isSavingExam}
        extraContent={
          editingExam ? (
            <div className="space-y-3">
              {editingAttachment && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                  <span className="truncate text-slate-700">
                    Current PDF: {editingAttachment.originalFilename}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 font-semibold text-indigo-600"
                    onClick={() =>
                      void downloadExamAttachment(editingExam.id, editingAttachment.id).then(
                        (blob) => {
                          const url = URL.createObjectURL(blob);
                          window.open(url, "_blank", "noopener,noreferrer");
                          setTimeout(() => URL.revokeObjectURL(url), 60_000);
                        },
                      )
                    }
                  >
                    Open
                  </button>
                </div>
              )}
              <ExamInstructionUpload
                value={editingInstructionFile}
                onChange={setEditingInstructionFile}
                disabled={isSavingExam}
              />
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={studentVisible}
                  onChange={(event) => setStudentVisible(event.target.checked)}
                  disabled={isSavingExam}
                  className="text-indigo-600"
                />
                Students can view the instruction PDF
              </label>
            </div>
          ) : null
        }
      />
    </div>
  );
};
