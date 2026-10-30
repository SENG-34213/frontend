import React, { useState } from "react";
import {
  X,
  BookOpen,
  Layers,
  FileCode,
  FileCheck,
  HelpCircle,
  GraduationCap,
  Calendar,
  Check,
  Upload,
  FileText,
  X as RemoveFile,
} from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import { createCourse } from "../api/courseApi";
import type { QuizDraft } from "../api/quizApi";
import { createAssignment, uploadAssignmentAttachment } from "../api/assignmentApi";
import {
  createCourseModule,
  createModuleLesson,
  getCourseModules,
  getModuleLessons,
  type CourseContentModule,
  type CourseContentLesson,
} from "../api/courseContentApi";
import { createExam } from "../api/examApi";
import { createCalendarEvent, type CalendarEventType } from "../api/calendarApi";
import { formatTeacherError } from "../utils/userFacingError";

export type QuickCreateType =
  | "course"
  | "module"
  | "lesson"
  | "assignment"
  | "quiz"
  | "exam"
  | "event";

interface QuickCreateModalProps {
  isOpen: boolean;
  type: QuickCreateType | null;
  onClose: () => void;
  onCreated: (type: QuickCreateType, item: any) => void;
  backendCourses?: BackendCourse[];
  teacherId?: string;
  onCreateQuiz?: (draft: QuizDraft) => Promise<unknown>;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  type,
  onClose,
  onCreated,
  backendCourses = [],
  onCreateQuiz,
  teacherId,
}) => {
  const [activeType, setActiveType] = useState<QuickCreateType>(type || "assignment");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  // Form states
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [courseIsOnline, setCourseIsOnline] = useState(true);
  const [courseIsVisible, setCourseIsVisible] = useState(true);
  const [courseIsPublished, setCourseIsPublished] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [assignmentStartDate, setAssignmentStartDate] = useState(
    `${new Date().toISOString().slice(0, 10)}T09:00`,
  );
  const localDateTimeNow = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  };
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [duration, setDuration] = useState("45");
  const [moduleStartDate, setModuleStartDate] = useState("");
  const [moduleEndDate, setModuleEndDate] = useState("");
  const [moduleImage, setModuleImage] = useState("");
  const [moduleSequenceOrder, setModuleSequenceOrder] = useState("1");
  const [moduleVisible, setModuleVisible] = useState(true);
  const [assignmentModuleId, setAssignmentModuleId] = useState("");
  const [assignmentModules, setAssignmentModules] = useState<CourseContentModule[]>([]);
  const [assignmentLessonId, setAssignmentLessonId] = useState("");
  const [assignmentLessons, setAssignmentLessons] = useState<CourseContentLesson[]>([]);
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [latePenaltyPercentage, setLatePenaltyPercentage] = useState("0");
  const [assignmentSubmissionType, setAssignmentSubmissionType] = useState<"TEXT" | "DOCUMENT">("TEXT");
  const [rubricItems, setRubricItems] = useState<Array<{ criterion: string; marks: string }>>([]);
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [lessonContentType, setLessonContentType] = useState("Lecture");
  const [lessonContentMarkdown, setLessonContentMarkdown] = useState("");
  const [lessonReleaseDate, setLessonReleaseDate] = useState("");
  const [lessonVisible, setLessonVisible] = useState(true);
  const [quizPassMark, setQuizPassMark] = useState("0");
  const [quizStartTime, setQuizStartTime] = useState("");
  const [quizEndTime, setQuizEndTime] = useState("");
  const [quizMaxAttempts, setQuizMaxAttempts] = useState("1");
  const [quizShowResultImmediately, setQuizShowResultImmediately] = useState(true);
  const [examStartTime, setExamStartTime] = useState("09:00");
  const [examEndTime, setExamEndTime] = useState("10:00");
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));
  const [examPassMarks, setExamPassMarks] = useState("40");
  const [examType, setExamType] = useState<"MIDTERM" | "FINAL" | "PRACTICAL" | "OTHER">("OTHER");
  const [examStudentVisible, setExamStudentVisible] = useState(true);
  const [examInstructionFile, setExamInstructionFile] = useState<File | null>(null);
  const [eventType, setEventType] = useState<CalendarEventType>("CUSTOM");
  const [eventStartDateTime, setEventStartDateTime] = useState("");
  const [eventEndDateTime, setEventEndDateTime] = useState("");
  const [eventAllDay, setEventAllDay] = useState(false);
  const [eventVisibility, setEventVisibility] = useState<"PRIVATE" | "COURSE" | "ROLE" | "GLOBAL">(
    "COURSE",
  );
  const [eventTargetRole, setEventTargetRole] = useState<"ADMIN" | "TEACHER" | "STUDENT">(
    "STUDENT",
  );
  const [eventLocation, setEventLocation] = useState("");
  const [courseGradeId, setCourseGradeId] = useState("");

  React.useEffect(() => {
    if (type) setActiveType(type);
    setFormError("");
  }, [type]);

  React.useEffect(() => {
    if (backendCourses[0] && !backendCourses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(backendCourses[0].id);
    }
  }, [activeType, backendCourses, selectedCourseId]);

  React.useEffect(() => {
    if (
      !(activeType === "assignment" || activeType === "lesson" || activeType === "module") ||
      !selectedCourseId
    )
      return;
    const controller = new AbortController();
    getCourseModules(selectedCourseId, controller.signal)
      .then((modules) => {
        setAssignmentModules(modules);
        setAssignmentModuleId((current) =>
          modules.some((module) => module.id === current) ? current : modules[0]?.id || "",
        );
      })
      .catch(() => setAssignmentModules([]));
    return () => controller.abort();
  }, [activeType, selectedCourseId]);

  React.useEffect(() => {
    if (activeType !== "assignment" || !selectedCourseId || !assignmentModuleId) {
      setAssignmentLessons([]);
      setAssignmentLessonId("");
      return;
    }
    const controller = new AbortController();
    getModuleLessons(selectedCourseId, assignmentModuleId, controller.signal)
      .then((lessons) => {
        setAssignmentLessons(lessons);
        setAssignmentLessonId((current) =>
          lessons.some((lesson) => lesson.id === current) ? current : "",
        );
      })
      .catch(() => setAssignmentLessons([]));
    return () => controller.abort();
  }, [activeType, assignmentModuleId, selectedCourseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent, publishImmediately = false) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    const requiresCourse = ["module", "lesson", "assignment", "quiz", "exam"].includes(activeType);
    if (requiresCourse && backendCourses.length === 0) {
      setIsSubmitting(false);
      setSuccessMsg("No courses available.");
      return;
    }

    if (activeType === "module" && (!moduleStartDate || !moduleEndDate)) {
      setIsSubmitting(false);
      setFormError("Please select a start date and an end date for the module.");
      return;
    }

    if (activeType === "module" && moduleEndDate < moduleStartDate) {
      setIsSubmitting(false);
      setFormError("The end date must be on or after the start date.");
      return;
    }

    if (activeType === "assignment" && assignmentStartDate > dueDate) {
      setIsSubmitting(false);
      setFormError("The due date must be on or after the start date.");
      return;
    }

    if (activeType === "assignment") {
      const now = new Date();
      const currentMinute = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16);
      if (assignmentStartDate < currentMinute) {
        setIsSubmitting(false);
        setFormError("Assignment start date and time cannot be before the current time.");
        return;
      }
      const totalPercentage = rubricItems.reduce((sum, item) => sum + (Number(item.marks) || 0), 0);
      if (totalPercentage > 100) {
        setIsSubmitting(false);
        setFormError("Rubric criteria percentages cannot exceed 100% in total.");
        return;
      }
    }

    if (activeType === "exam") {
      if (examEndTime <= examStartTime) {
        setIsSubmitting(false);
        setFormError("Exam end time must be after the start time.");
        return;
      }
      if (Number(examPassMarks) > Number(maxMarks)) {
        setIsSubmitting(false);
        setFormError("Pass marks cannot be greater than total marks.");
        return;
      }
    }

    if (activeType === "event") {
      if (!eventStartDateTime || (!eventAllDay && !eventEndDateTime)) {
        setIsSubmitting(false);
        setFormError("Select a start time and an end time for the event.");
        return;
      }
      try {
        const created = await createCalendarEvent({
          title: title.trim(),
          description: description.trim() || undefined,
          eventType,
          startDateTime: eventStartDateTime,
          endDateTime: eventAllDay ? null : eventEndDateTime,
          allDay: eventAllDay,
          courseId: selectedCourseId || null,
          visibility: eventVisibility,
          targetRole: eventVisibility === "ROLE" ? eventTargetRole : null,
          location: eventLocation.trim() || undefined,
        });
        setIsSubmitting(false);
        setSuccessMsg("Calendar event created successfully!");
        onCreated(activeType, created);
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 900);
        return;
      } catch (requestError) {
        setIsSubmitting(false);
        setFormError(
          requestError instanceof Error
            ? requestError.message
            : "Calendar event could not be created.",
        );
        return;
      }
    }

    if (activeType === "course") {
      if (!teacherId || !courseGradeId) {
        setIsSubmitting(false);
        setFormError("Course creation requires an account and grade selection.");
        return;
      }
      try {
        const created = await createCourse({
          courseName: courseTitle,
          courseDescription: description,
          courseThumbnail: courseThumbnail.trim() || undefined,
          gradeId: courseGradeId,
          assignedTeacherId: teacherId,
          subject: courseCode || courseCategory,
          isOnline: courseIsOnline,
          isVisible: courseIsVisible,
          isPublished: courseIsPublished,
        });
        setIsSubmitting(false);
        setSuccessMsg("Created COURSE successfully!");
        onCreated(activeType, created);
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 900);
        return;
      } catch (requestError) {
        setIsSubmitting(false);
        setFormError(
          formatTeacherError(requestError, "Course could not be created.", {
            courseName: courseTitle,
          }),
        );
        return;
      }
    }

    if (activeType === "module") {
      try {
        const created = await createCourseModule(selectedCourseId, {
          title,
          description,
          moduleImage: moduleImage.trim() || undefined,
          sequenceOrder: Number(moduleSequenceOrder) || assignmentModules.length + 1,
          startDate: moduleStartDate,
          endDate: moduleEndDate,
          isVisible: moduleVisible,
        });
        setIsSubmitting(false);
        setSuccessMsg("Created MODULE successfully!");
        onCreated(activeType, created);
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 900);
        return;
      } catch (requestError) {
        setIsSubmitting(false);
        setFormError(
          requestError instanceof Error ? requestError.message : "Module could not be created.",
        );
        return;
      }
    }

    if (activeType === "lesson") {
      if (!assignmentModuleId) {
        setIsSubmitting(false);
        setFormError("Select a module before creating a lesson.");
        return;
      }
      try {
        const created = await createModuleLesson(selectedCourseId, assignmentModuleId, {
          title,
          description,
          durationMinutes: Number(duration) || 45,
          contentType: lessonContentType,
          contentMarkdown: lessonContentMarkdown.trim() || undefined,
          releaseDate: lessonReleaseDate || undefined,
          isVisible: lessonVisible,
        });
        setIsSubmitting(false);
        setSuccessMsg("Created LESSON successfully!");
        onCreated(activeType, created);
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 900);
        return;
      } catch (requestError) {
        setIsSubmitting(false);
        setFormError(
          requestError instanceof Error ? requestError.message : "Lesson could not be created.",
        );
        return;
      }
    }

    if (activeType === "exam") {
      try {
        const created = await createExam(
          {
            courseId: selectedCourseId,
            title,
            description,
            examDate,
            startTime: examStartTime,
            endTime: examEndTime,
            totalMarks: Number(maxMarks) || 100,
            passMarks: Number(examPassMarks) || 0,
            type: examType,
          },
          { instructionFile: examInstructionFile, studentVisible: examStudentVisible },
        );
        setIsSubmitting(false);
        setSuccessMsg("Created EXAM successfully!");
        onCreated(activeType, created);
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 900);
        return;
      } catch (requestError) {
        setIsSubmitting(false);
        setFormError(
          requestError instanceof Error ? requestError.message : "Exam could not be created.",
        );
        return;
      }
    }

    if (activeType === "quiz" && onCreateQuiz && backendCourses.length > 0) {
      try {
        const created = await onCreateQuiz({
          courseId: selectedCourseId,
          title,
          description,
          durationMinutes: Number(duration) || 45,
          passMark: Number(quizPassMark) || 0,
          startTime: quizStartTime || undefined,
          endTime: quizEndTime || undefined,
          maxAttempts: Number(quizMaxAttempts) || 1,
          showResultImmediately: quizShowResultImmediately,
          creationMethod: "MANUAL",
        });
        setIsSubmitting(false);
        setSuccessMsg("Created QUIZ successfully!");
        onCreated(activeType, created);
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 900);
        return;
      } catch (requestError) {
        setIsSubmitting(false);
        setFormError(
          requestError instanceof Error ? requestError.message : "Quiz could not be created.",
        );
        return;
      }
    }

    if (activeType === "assignment" && backendCourses.length > 0 && assignmentModuleId) {
      try {
        const created = await createAssignment({
          courseId: selectedCourseId,
          moduleId: assignmentModuleId,
          lessonId: assignmentLessonId || undefined,
          title,
          description,
          instructions,
          startDate: `${assignmentStartDate}:00`,
          dueDate: `${dueDate}:00`,
          maxMarks: Number(maxMarks) || 100,
          allowedAttempts: 1,
          allowLateSubmission,
          latePenaltyPercentage: allowLateSubmission ? Number(latePenaltyPercentage) || 0 : 0,
          submissionType: assignmentSubmissionType,
          rubricItems: rubricItems
            .filter((item) => item.criterion.trim() && Number(item.marks) > 0)
            .map((item) => ({ criterion: item.criterion.trim(), marks: Number(item.marks) })),
          publishImmediately,
        });
        const uploadResults = await Promise.allSettled(
          assignmentFiles.map((file) => uploadAssignmentAttachment(created.id, file)),
        );
        const uploadedCount = uploadResults.filter(
          (result) => result.status === "fulfilled",
        ).length;
        const failedCount = uploadResults.length - uploadedCount;
        setIsSubmitting(false);
        setSuccessMsg(
          publishImmediately
            ? `Assignment published${uploadedCount ? ` with ${uploadedCount} document${uploadedCount === 1 ? "" : "s"}` : ""}.`
            : `Assignment saved as draft${uploadedCount ? ` with ${uploadedCount} document${uploadedCount === 1 ? "" : "s"}` : ""}.`,
        );
        setAssignmentFiles([]);
        onCreated(activeType, created);
        if (failedCount > 0) {
          setFormError(
            `Assignment created, but ${failedCount} document${failedCount === 1 ? " was" : "s were"} not uploaded. You can add them from Edit assignment.`,
          );
          return;
        }
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 900);
        return;
      } catch (requestError) {
        setIsSubmitting(false);
        setFormError(
          requestError instanceof Error
            ? requestError.message
            : "Assignment or its documents could not be created.",
        );
        return;
      }
    }

    if (activeType === "assignment" && backendCourses.length > 0 && !assignmentModuleId) {
      setIsSubmitting(false);
      setSuccessMsg("Create a module before adding an assignment.");
      return;
    }

    setIsSubmitting(false);
    setFormError("This quick-create action is not available.");
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    void handleSubmit(event, submitter?.value === "publish");
  };

  const typesList: { id: QuickCreateType; label: string; icon: React.ElementType }[] = [
    { id: "assignment", label: "Assignment", icon: FileCheck },
    { id: "quiz", label: "Quiz", icon: HelpCircle },
    { id: "lesson", label: "Lesson", icon: FileCode },
    { id: "module", label: "Module", icon: Layers },
    { id: "course", label: "Course", icon: BookOpen },
    { id: "exam", label: "Exam", icon: GraduationCap },
    { id: "event", label: "Calendar Event", icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Quick Create</h3>
            <p className="text-xs text-slate-500">
              Add teaching content directly to your curriculum
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="flex overflow-x-auto p-2 bg-slate-50/80 border-b border-slate-200 gap-1 scrollbar-none">
          {typesList.map((t) => {
            const Icon = t.icon;
            const isActive = activeType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleFormSubmit}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
        >
          {successMsg ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">{successMsg}</h4>
              <p className="text-xs text-slate-500">Updating course workspace & syncing...</p>
            </div>
          ) : (
            <>
              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
                >
                  {formError}
                </div>
              )}
              {activeType !== "course" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {backendCourses.length === 0 ? (
                      <option value="" disabled>
                        No courses available
                      </option>
                    ) : (
                      backendCourses.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {"courseName" in c ? c.subject || c.courseName : `${c.code} — ${c.title}`}
                        </option>
                      ))
                    )}
                  </select>
                  {activeType === "assignment" && (
                    <>
                      <select
                        value={assignmentModuleId}
                        onChange={(e) => setAssignmentModuleId(e.target.value)}
                        required
                        className="mt-2 w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                      >
                        <option value="" disabled>
                          {assignmentModules.length ? "Select module" : "No modules available"}
                        </option>
                        {assignmentModules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.title}
                          </option>
                        ))}
                      </select>
                      <select
                        value={assignmentLessonId}
                        onChange={(e) => setAssignmentLessonId(e.target.value)}
                        className="mt-2 w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                      >
                        <option value="">No specific lesson</option>
                        {assignmentLessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {activeType === "lesson" && (
                    <select
                      value={assignmentModuleId}
                      onChange={(e) => setAssignmentModuleId(e.target.value)}
                      required
                      className="mt-2 w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                    >
                      <option value="" disabled>
                        {assignmentModules.length ? "Select module" : "No modules available"}
                      </option>
                      {assignmentModules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {activeType === "course" ? (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Course Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CS-250"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Course Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Operating Systems & Kernel Design"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject / Department
                    </label>
                    <select
                      value={courseCategory}
                      onChange={(e) => setCourseCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option>Computer Science</option>
                      <option>Software Engineering</option>
                      <option>Artificial Intelligence</option>
                      <option>Data Science</option>
                      <option>Cybersecurity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Grade ID
                    </label>
                    <input
                      type="text"
                      value={courseGradeId}
                      onChange={(e) => setCourseGradeId(e.target.value)}
                      placeholder="Required grade UUID"
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Course thumbnail URL{" "}
                      <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={courseThumbnail}
                      onChange={(e) => setCourseThumbnail(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={courseIsOnline}
                        onChange={(e) => setCourseIsOnline(e.target.checked)}
                      />{" "}
                      Online course
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={courseIsVisible}
                        onChange={(e) => setCourseIsVisible(e.target.checked)}
                      />{" "}
                      Visible to students
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={courseIsPublished}
                        onChange={(e) => setCourseIsPublished(e.target.checked)}
                      />{" "}
                      Publish now
                    </label>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Title
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${activeType} title...`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder={`Describe objectives, requirements, and instructions for students...`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required={activeType === "course"}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              {activeType === "assignment" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Instructions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain what students need to submit..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <fieldset className="rounded-lg border border-slate-200 p-3">
                    <legend className="px-1 text-xs font-semibold text-slate-700">Submission required</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {(["TEXT", "DOCUMENT"] as const).map((submissionType) => (
                        <label key={submissionType} className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-colors ${assignmentSubmissionType === submissionType ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                          <input
                            type="radio"
                            name="assignment-submission-type"
                            value={submissionType}
                            checked={assignmentSubmissionType === submissionType}
                            onChange={() => setAssignmentSubmissionType(submissionType)}
                            className="sr-only"
                          />
                          {submissionType === "TEXT" ? "Text answer" : "Document"}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        id="allow-late-submission"
                        type="checkbox"
                        checked={allowLateSubmission}
                        onChange={(e) => setAllowLateSubmission(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="allow-late-submission"
                        className="text-xs font-semibold text-slate-700"
                      >
                        Allow late submissions
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Late penalty (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={!allowLateSubmission}
                        value={latePenaltyPercentage}
                        onChange={(e) => setLatePenaltyPercentage(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Rubric criteria
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setRubricItems((items) => [...items, { criterion: "", marks: "" }])
                        }
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        + Add criterion
                      </button>
                    </div>
                    {rubricItems.length === 0 && (
                      <p className="text-[11px] text-slate-400">
                        Optional: add criteria using percentages for grading.
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Total: {rubricItems.reduce((sum, item) => sum + (Number(item.marks) || 0), 0)}%
                      / 100%
                    </p>
                    {rubricItems.map((item, index) => (
                      <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          placeholder="Criterion"
                          value={item.criterion}
                          onChange={(e) =>
                            setRubricItems((items) =>
                              items.map((row, rowIndex) =>
                                rowIndex === index ? { ...row, criterion: e.target.value } : row,
                              ),
                            )
                          }
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Percentage"
                          value={item.marks}
                          onChange={(e) => {
                            const nextValue = Number(e.target.value);
                            const otherTotal = rubricItems.reduce(
                              (sum, row, rowIndex) =>
                                sum + (rowIndex === index ? 0 : Number(row.marks) || 0),
                              0,
                            );
                            if (nextValue < 0 || otherTotal + nextValue > 100) return;
                            setRubricItems((items) =>
                              items.map((row, rowIndex) =>
                                rowIndex === index ? { ...row, marks: e.target.value } : row,
                              ),
                            )
                          }}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 sm:w-20"
                          aria-label="Rubric percentage"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setRubricItems((items) =>
                              items.filter((_, rowIndex) => rowIndex !== index),
                            )
                          }
                          className="self-start px-2 text-xs text-rose-600 hover:text-rose-800 sm:self-auto"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Assignment documents</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Attach instructions, reference files, or submission templates.
                        </p>
                      </div>
                      <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50">
                        <Upload className="h-3.5 w-3.5" />
                        Add files
                        <input
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(event) => {
                            setAssignmentFiles((current) => [
                              ...current,
                              ...Array.from(event.target.files || []),
                            ]);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                    {assignmentFiles.length > 0 ? (
                      <div className="space-y-1.5">
                        {assignmentFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${file.lastModified}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-md border border-indigo-100 bg-white px-2.5 py-2"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <FileText className="h-4 w-4 shrink-0 text-indigo-500" />
                              <span className="truncate text-xs text-slate-700">{file.name}</span>
                              <span className="shrink-0 text-[10px] text-slate-400">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setAssignmentFiles((current) =>
                                  current.filter((_, fileIndex) => fileIndex !== index),
                                )
                              }
                              className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Remove ${file.name}`}
                              title="Remove file"
                            >
                              <RemoveFile className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">No documents selected.</p>
                    )}
                  </div>
                </>
              )}

              {activeType === "module" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Sequence order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={moduleSequenceOrder}
                        onChange={(e) => setModuleSequenceOrder(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Module image URL{" "}
                        <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={moduleImage}
                        onChange={(e) => setModuleImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Start date
                      </label>
                      <input
                        type="date"
                        value={moduleStartDate}
                        onChange={(e) => setModuleStartDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        End date
                      </label>
                      <input
                        type="date"
                        min={moduleStartDate || undefined}
                        value={moduleEndDate}
                        onChange={(e) => setModuleEndDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={moduleVisible}
                      onChange={(e) => setModuleVisible(e.target.checked)}
                    />{" "}
                    Visible to students
                  </label>
                </div>
              )}

              {activeType === "lesson" && (
                <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Content type
                      </label>
                      <select
                        value={lessonContentType}
                        onChange={(e) => setLessonContentType(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      >
                        <option>Lecture</option>
                        <option>Reading</option>
                        <option>Video</option>
                        <option>Practice</option>
                        <option>Assignment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Release date <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="date"
                        value={lessonReleaseDate}
                        onChange={(e) => setLessonReleaseDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lesson content
                    </label>
                    <textarea
                      rows={4}
                      value={lessonContentMarkdown}
                      onChange={(e) => setLessonContentMarkdown(e.target.value)}
                      placeholder="Add the lesson body or overview..."
                      className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={lessonVisible}
                      onChange={(e) => setLessonVisible(e.target.checked)}
                    />{" "}
                    Visible to students
                  </label>
                </div>
              )}

              {activeType === "assignment" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start date and time
                    </label>
                    <input
                      type="datetime-local"
                      value={assignmentStartDate}
                      min={localDateTimeNow()}
                      onChange={(e) => setAssignmentStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Due date and time
                    </label>
                    <input
                      type="datetime-local"
                      min={assignmentStartDate}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Maximum marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {activeType === "quiz" && (
                <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pass mark
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={quizPassMark}
                        onChange={(e) => setQuizPassMark(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Maximum attempts
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quizMaxAttempts}
                        onChange={(e) => setQuizMaxAttempts(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Start time <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={quizStartTime}
                        onChange={(e) => setQuizStartTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        End time <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="datetime-local"
                        min={quizStartTime || undefined}
                        value={quizEndTime}
                        onChange={(e) => setQuizEndTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={quizShowResultImmediately}
                      onChange={(e) => setQuizShowResultImmediately(e.target.checked)}
                    />{" "}
                    Show result immediately
                  </label>
                </div>
              )}

              {activeType === "exam" && (
                <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Exam date
                      </label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Start time
                      </label>
                      <input
                        type="time"
                        value={examStartTime}
                        onChange={(e) => setExamStartTime(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        End time
                      </label>
                      <input
                        type="time"
                        min={examStartTime}
                        value={examEndTime}
                        onChange={(e) => setExamEndTime(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Total marks
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pass marks
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={examPassMarks}
                        onChange={(e) => setExamPassMarks(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Exam type
                      </label>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value as typeof examType)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      >
                        <option value="MIDTERM">Midterm</option>
                        <option value="FINAL">Final</option>
                        <option value="PRACTICAL">Practical</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Instruction document{" "}
                      <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setExamInstructionFile(e.target.files?.[0] || null)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={examStudentVisible}
                      onChange={(e) => setExamStudentVisible(e.target.checked)}
                    />{" "}
                    Visible to students
                  </label>
                </div>
              )}

              {activeType === "event" && (
                <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Event type
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      >
                        <option value="CUSTOM">Custom</option>
                        <option value="CLASS">Class</option>
                        <option value="MEETING">Meeting</option>
                        <option value="HOLIDAY">Holiday</option>
                        <option value="ATTENDANCE">Attendance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Start
                      </label>
                      <input
                        type="datetime-local"
                        value={eventStartDateTime}
                        onChange={(e) => setEventStartDateTime(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">End</label>
                      <input
                        type="datetime-local"
                        min={eventStartDateTime || undefined}
                        value={eventEndDateTime}
                        onChange={(e) => setEventEndDateTime(e.target.value)}
                        disabled={eventAllDay}
                        required={!eventAllDay}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Visibility
                      </label>
                      <select
                        value={eventVisibility}
                        onChange={(e) =>
                          setEventVisibility(e.target.value as typeof eventVisibility)
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      >
                        <option value="PRIVATE">Private</option>
                        <option value="COURSE">Course</option>
                        <option value="ROLE">Role</option>
                        <option value="GLOBAL">Global</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target role
                      </label>
                      <select
                        value={eventTargetRole}
                        onChange={(e) =>
                          setEventTargetRole(e.target.value as typeof eventTargetRole)
                        }
                        disabled={eventVisibility !== "ROLE"}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:bg-slate-100"
                      >
                        <option value="STUDENT">Students</option>
                        <option value="TEACHER">Teachers</option>
                        <option value="ADMIN">Admins</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Location <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="Room or meeting link"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={eventAllDay}
                      onChange={(e) => setEventAllDay(e.target.checked)}
                    />{" "}
                    All-day event
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                {activeType === "assignment" ? (
                  <>
                    <button
                      type="submit"
                      name="assignmentAction"
                      value="draft"
                      disabled={isSubmitting}
                      className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Save Draft
                    </button>
                    <button
                      type="submit"
                      name="assignmentAction"
                      value="publish"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save & Publish"}
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Creating..."
                      : `Create ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}`}
                  </button>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
