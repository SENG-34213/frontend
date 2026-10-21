import React, { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileCode,
  Clock,
  Edit3,
  Trash2,
  FolderOpen,
  Check,
  AlertCircle,
  ExternalLink,
  Presentation,
  FlaskConical,
  BookMarked,
  MessagesSquare,
  CalendarDays,
  FileText,
} from "lucide-react";
import { Course, Module, Lesson, NavigationTab } from "../types";
import type { BackendCourse } from "../api/courseApi";
import {
  createCourseModule,
  createModuleLesson,
  deleteCourseModule,
  deleteModuleLesson,
  getCourseModules,
  getModuleLessons,
  getLessonMaterials,
  uploadLessonMaterial,
  updateCourseModule,
  updateModuleLesson,
  type CourseContentLesson,
  type CourseContentModule,
} from "../api/courseContentApi";
import { StatusBadge } from "../components/StatusBadge";
import { LessonEditorModal } from "../lessons/LessonEditorModal";
import { ConfirmModal } from "../components/ActionModal";

interface CurriculumBuilderViewProps {
  onNavigate: (tab: NavigationTab) => void;
  backendCourses?: BackendCourse[];
}

const lessonTypeMeta = (type: Lesson["contentType"]) => {
  switch (type) {
    case "Lab":
      return {
        Icon: FlaskConical,
        label: "Lab",
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "Reading":
      return {
        Icon: BookMarked,
        label: "Reading",
        classes: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "Discussion":
      return {
        Icon: MessagesSquare,
        label: "Discussion",
        classes: "bg-violet-50 text-violet-700 border-violet-200",
      };
    default:
      return {
        Icon: Presentation,
        label: "Lecture",
        classes: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };
  }
};

const formatDate = (value?: string) => {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "Not set"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const toLesson = (lesson: CourseContentLesson, order: number): Lesson => ({
  id: lesson.id,
  moduleId: lesson.moduleId,
  title: lesson.title,
  description: lesson.description || "",
  contentMarkdown: lesson.contentMarkdown || "",
  durationMinutes: lesson.durationMinutes ?? 1,
  order,
  status: lesson.visible === false ? "Draft" : "Published",
  contentType: (lesson.contentType as Lesson["contentType"]) || "Lecture",
  resourcesCount: lesson.materials?.length || 0,
  materials: lesson.materials,
});

const toModule = (
  module: CourseContentModule,
  lessons: Array<CourseContentLesson | Lesson>,
): Module => ({
  id: module.id,
  courseId: module.courseId,
  title: module.title,
  description: module.description || "",
  order: module.sequenceOrder,
  startDate: module.startDate || "",
  endDate: module.endDate || "",
  status: module.visible === false ? "Draft" : "Published",
  lessons: lessons.map((lesson, index) => toLesson(lesson as CourseContentLesson, index + 1)),
});

export const CurriculumBuilderView: React.FC<CurriculumBuilderViewProps> = ({
  onNavigate,
  backendCourses = [],
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(backendCourses[0]?.id || "");
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
    status: "uploading" | "complete" | "error";
  } | null>(null);
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({
    "mod-1": true,
    "mod-2": true,
    "mod-3": false,
  });
  const [expandedLessonBodyIds, setExpandedLessonBodyIds] = useState<Record<string, boolean>>({});

  // Editor states
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingParentModule, setEditingParentModule] = useState<Module | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // New module modal / inline
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  const [newModuleStartDate, setNewModuleStartDate] = useState("");
  const [newModuleEndDate, setNewModuleEndDate] = useState("");
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "module" | "lesson";
    module: Module;
    lesson?: Lesson;
  } | null>(null);

  const currentBackendCourse = backendCourses.find((course) => course.id === selectedCourseId);
  const currentCourse: Course = {
    id: selectedCourseId,
    code: currentBackendCourse?.subject || "COURSE",
    title: currentBackendCourse?.courseName || "Select a course",
    description: currentBackendCourse?.courseDescription || "",
    category: currentBackendCourse?.subject || "Academic Course",
    level: "Undergraduate",
    semester: "Current Semester",
    academicYear: "",
    enrolledCount: currentBackendCourse?.numberOfStudents || 0,
    maxCapacity: currentBackendCourse?.maxCapacity ?? 0,
    status: "Active",
    coverTheme: "indigo",
    modulesCount: modules.length,
    assignmentsCount: currentBackendCourse?.assignmentCount ?? 0,
    averageGrade: Number(currentBackendCourse?.averageGrade ?? 0),
  };
  const courseModules = modules.filter((m) => m.courseId === selectedCourseId);

  useEffect(() => {
    if (!backendCourses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(backendCourses[0]?.id || "");
    }
  }, [backendCourses, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) {
      setModules([]);
      setLessonsLoading(false);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setLessonsLoading(true);
    setError(null);
    getCourseModules(selectedCourseId, controller.signal)
      .then(async (items) => {
        const loaded = await Promise.all(
          items.map(async (item) => {
            const lessons = await getModuleLessons(selectedCourseId, item.id, controller.signal);
            const lessonsWithMaterials = await Promise.all(
              lessons.map(async (lesson) => {
                try {
                  const materials = await getLessonMaterials(
                    selectedCourseId,
                    item.id,
                    lesson.id,
                    controller.signal,
                  );
                  return { ...lesson, materials };
                } catch {
                  return lesson;
                }
              }),
            );
            return toModule(item, lessonsWithMaterials);
          }),
        );
        setModules(loaded.sort((a, b) => a.order - b.order));
        setExpandedModuleIds(Object.fromEntries(loaded.map((item) => [item.id, true])));
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error ? requestError.message : "Course content failed to load.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setLessonsLoading(false);
        }
      });
    return () => controller.abort();
  }, [selectedCourseId]);

  const toggleModule = (id: string) => {
    setExpandedModuleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditLesson = (lesson: Lesson, parentModule: Module) => {
    setUploadProgress(null);
    setEditingLesson(lesson);
    setEditingParentModule(parentModule);
    setIsEditorOpen(true);
  };

  const handleSaveLesson = async (updatedLesson: Lesson, pendingFiles: File[] = []) => {
    if (!selectedCourseId || !editingParentModule) return;
    setIsSaving(true);
    setError(null);
    try {
      const durationMinutes = Number(updatedLesson.durationMinutes);
      if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
        setError("Lesson duration must be a positive whole number of minutes.");
        setIsSaving(false);
        return;
      }
      const payload = {
        title: updatedLesson.title.trim(),
        description: updatedLesson.description.trim(),
        durationMinutes,
        contentType: updatedLesson.contentType,
        contentMarkdown: updatedLesson.contentMarkdown || "",
        isVisible: updatedLesson.status === "Published",
      };
      const saved = updatedLesson.id.startsWith("new-")
        ? await createModuleLesson(selectedCourseId, editingParentModule.id, payload)
        : await updateModuleLesson(
            selectedCourseId,
            editingParentModule.id,
            updatedLesson.id,
            payload,
          );
      const savedMaterials = [...(saved.materials || updatedLesson.materials || [])];
      if (pendingFiles.length) {
        setUploadProgress({
          current: 0,
          total: pendingFiles.length,
          fileName: "Preparing files…",
          status: "uploading",
        });
        for (const [index, file] of pendingFiles.entries()) {
          setUploadProgress({
            current: index,
            total: pendingFiles.length,
            fileName: file.name,
            status: "uploading",
          });
          try {
            const uploaded = await uploadLessonMaterial(
              selectedCourseId,
              editingParentModule.id,
              saved.id,
              { title: file.name.replace(/\.[^.]+$/, "") || file.name, file },
            );
            savedMaterials.push(uploaded);
            setUploadProgress({
              current: index + 1,
              total: pendingFiles.length,
              fileName: file.name,
              status: "complete",
            });
          } catch (uploadError) {
            throw new Error(
              `${file.name} could not be uploaded. ${uploadError instanceof Error ? uploadError.message : "Please try again."}`,
            );
          }
        }
      }
      const nextLesson = toLesson(
        { ...saved, contentType: updatedLesson.contentType, materials: savedMaterials },
        updatedLesson.order,
      );
      setModules((prev) =>
        prev.map((mod) =>
          mod.id === editingParentModule.id
            ? {
                ...mod,
                lessons: updatedLesson.id.startsWith("new-")
                  ? [...mod.lessons, nextLesson]
                  : mod.lessons.map((lesson) =>
                      lesson.id === updatedLesson.id ? nextLesson : lesson,
                    ),
              }
            : mod,
        ),
      );
      if (pendingFiles.length) {
        // Keep the editor open so the teacher can see the completed upload and download it.
        setEditingLesson(nextLesson);
        setIsEditorOpen(true);
      } else {
        setEditingLesson(null);
        setIsEditorOpen(false);
        setUploadProgress(null);
      }
    } catch (requestError: unknown) {
      if (pendingFiles.length) {
        setUploadProgress((current) => (current ? { ...current, status: "error" } : current));
      }
      setError(requestError instanceof Error ? requestError.message : "Lesson could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = (modId: string) => {
    const parent = modules.find((m) => m.id === modId);
    if (!parent) return;

    const newLesson: Lesson = {
      id: `new-${Date.now()}`,
      moduleId: modId,
      title: `New Lesson Unit ${parent.lessons.length + 1}`,
      description: "Define syllabus objectives, lab instructions, and references.",
      durationMinutes: 45,
      order: parent.lessons.length + 1,
      status: "Draft",
      contentType: "Lecture",
      resourcesCount: 1,
    };

    // Immediately open editor for this new lesson
    setUploadProgress(null);
    setEditingLesson(newLesson);
    setEditingParentModule(parent);
    setIsEditorOpen(true);
  };

  const handleCreateModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    if (!selectedCourseId) return;
    if (!newModuleStartDate || !newModuleEndDate) {
      setError("Please select a start date and an end date.");
      return;
    }
    if (newModuleEndDate < newModuleStartDate) {
      setError("The end date must be on or after the start date.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        title: newModuleTitle.trim(),
        description: newModuleDesc.trim(),
        sequenceOrder: editingModule?.order || courseModules.length + 1,
        startDate: newModuleStartDate,
        endDate: newModuleEndDate,
        isVisible: editingModule?.status !== "Draft",
      };
      const saved = editingModule
        ? await updateCourseModule(selectedCourseId, editingModule.id, payload)
        : await createCourseModule(selectedCourseId, payload);
      const nextModule = toModule(saved, editingModule?.lessons || []);
      setModules((prev) =>
        editingModule
          ? prev.map((item) => (item.id === editingModule.id ? nextModule : item))
          : [...prev, nextModule],
      );
      setExpandedModuleIds((prev) => ({ ...prev, [nextModule.id]: true }));
      setNewModuleTitle("");
      setNewModuleDesc("");
      setNewModuleStartDate("");
      setNewModuleEndDate("");
      setEditingModule(null);
      setIsCreatingModule(false);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error ? requestError.message : "Module could not be created.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModule = async (module: Module) => {
    if (!selectedCourseId) return;
    try {
      await deleteCourseModule(selectedCourseId, module.id);
      setModules((prev) => prev.filter((item) => item.id !== module.id));
      setDeleteTarget(null);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error ? requestError.message : "Module could not be deleted.",
      );
    }
  };

  const handleDeleteLesson = async (module: Module, lesson: Lesson) => {
    if (!selectedCourseId) return;
    try {
      await deleteModuleLesson(selectedCourseId, module.id, lesson.id);
      setModules((prev) =>
        prev.map((item) =>
          item.id === module.id
            ? { ...item, lessons: item.lessons.filter((entry) => entry.id !== lesson.id) }
            : item,
        ),
      );
      setDeleteTarget(null);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error ? requestError.message : "Lesson could not be deleted.",
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Curriculum Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize modules, lecture units, lab exercises, and learning assets in a hierarchical
            syllabus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Course Selector Dropdown */}
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden shadow-2xs"
          >
            {backendCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subject || "COURSE"} - {c.courseName}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setEditingModule(null);
              setNewModuleTitle("");
              setNewModuleDesc("");
              setNewModuleStartDate("");
              setNewModuleEndDate("");
              setIsCreatingModule(true);
            }}
            className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {/* New Module Card Form (if creating) */}
      {isCreatingModule && (
        <form
          onSubmit={handleCreateModuleSubmit}
          className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              {editingModule ? "Edit Syllabus Module" : "Create New Syllabus Module"}
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingModule(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Module Title</label>
              <input
                type="text"
                placeholder="e.g. Dynamic Programming & Memoization"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                autoFocus
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Scope & Objectives
              </label>
              <input
                type="text"
                placeholder="e.g. Subproblem DAGs, overlapping subproblems, Fibonacci"
                value={newModuleDesc}
                onChange={(e) => setNewModuleDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start date</label>
              <input
                type="date"
                required
                value={newModuleStartDate}
                onChange={(e) => setNewModuleStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">End date</label>
              <input
                type="date"
                required
                min={newModuleStartDate || undefined}
                value={newModuleEndDate}
                onChange={(e) => setNewModuleEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingModule(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              {isSaving ? "Saving..." : "Save Module"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {!selectedCourseId && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No courses are assigned to you yet.
        </div>
      )}
      {selectedCourseId && isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading course content...
        </div>
      )}
      {selectedCourseId && !isLoading && lessonsLoading && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
          Loading lessons...
        </div>
      )}

      {/* Course Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 font-bold font-mono flex items-center justify-center text-sm border border-indigo-100">
            {currentCourse.code}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{currentCourse.title}</h2>
            <p className="text-xs text-slate-500">
              {courseModules.length} Modules ·{" "}
              {courseModules.reduce((acc, m) => acc + m.lessons.length, 0)} Total Lessons ·{" "}
              {currentCourse.enrolledCount} Students Enrolled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("materials")}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Course Materials</span>
          </button>
        </div>
      </div>

      {/* Expandable Module Tree */}
      <div className="space-y-4">
        {courseModules.map((mod) => {
          const isExpanded = !!expandedModuleIds[mod.id];

          return (
            <div
              key={mod.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
            >
              {/* Module Header Row */}
              <div
                onClick={() => toggleModule(mod.id)}
                className="p-4 bg-slate-50/80 hover:bg-slate-100/60 transition-colors flex items-center justify-between cursor-pointer select-none border-b border-slate-200/80"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button className="text-slate-400 hover:text-slate-600">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {mod.title}
                      </h3>
                      <StatusBadge status={mod.status} />
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{mod.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono tabular-nums text-slate-500 hidden sm:inline">
                    {mod.lessons.length} lessons
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500 hidden md:inline">
                    {mod.startDate && mod.endDate
                      ? `${new Date(`${mod.startDate}T00:00:00`).toLocaleDateString()} – ${new Date(`${mod.endDate}T00:00:00`).toLocaleDateString()}`
                      : "Dates not set"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingModule(mod);
                      setNewModuleTitle(mod.title);
                      setNewModuleDesc(mod.description);
                      setNewModuleStartDate(mod.startDate);
                      setNewModuleEndDate(mod.endDate);
                      setIsCreatingModule(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                    aria-label={`Edit ${mod.title}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddLesson(mod.id);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Lesson</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: "module", module: mod });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    aria-label={`Delete ${mod.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Module Body: Lessons List */}
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {mod.lessons.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No lessons added to this module yet. Click &quot;Add Lesson&quot; to begin
                      building.
                    </div>
                  ) : (
                    mod.lessons.map((lesson) => {
                      const lessonMeta = lessonTypeMeta(lesson.contentType);
                      const TypeIcon = lessonMeta.Icon;
                      const bodyContent = lesson.contentMarkdown?.trim() || "";
                      const bodyOverview = bodyContent
                        .replace(/[#*_`>-]/g, "")
                        .replace(/\s+/g, " ")
                        .trim();
                      const isBodyExpanded = Boolean(expandedLessonBodyIds[lesson.id]);
                      return (
                        <div
                          key={lesson.id}
                          className="p-4 hover:bg-slate-50/70 transition-colors group"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs font-semibold shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                {lesson.order}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                                    {lesson.title}
                                  </h4>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${lessonMeta.classes}`}
                                  >
                                    <TypeIcon className="h-3 w-3" />
                                    {lessonMeta.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  {lesson.description || "No overview added yet."}
                                </p>
                                <div className="mt-3 grid grid-cols-1 gap-3 text-[11px] sm:grid-cols-3">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 py-1 text-indigo-700">
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="h-3.5 w-3.5" /> Opened:{" "}
                                      {formatDate(mod.startDate)}
                                    </span>
                                    <span>Due: {formatDate(mod.endDate)}</span>
                                  </div>
                                  <div className="px-1 py-1 text-slate-700">
                                    <span className="flex items-center gap-1 text-slate-700">
                                      <Clock className="h-3.5 w-3.5" /> {lesson.durationMinutes}{" "}
                                      minutes
                                    </span>
                                  </div>
                                  {lesson.materials?.length ? (
                                    <div className="px-1 py-1 text-emerald-800">
                                      <span className="flex items-center gap-1 text-emerald-800">
                                        <FileText className="h-3.5 w-3.5" />{" "}
                                        {lesson.materials.length} attached file
                                        {lesson.materials.length === 1 ? "" : "s"}
                                      </span>
                                    </div>
                                  ) : null}
                                </div>
                                <div
                                  className={`${isBodyExpanded ? "rounded-lg border border-slate-200 bg-white px-3 py-2" : ""} mt-3`}
                                >
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                    Lesson body overview
                                  </p>
                                  <p
                                    className={`${isBodyExpanded ? "whitespace-pre-wrap" : "line-clamp-2"} mt-1 text-xs leading-relaxed text-slate-600`}
                                  >
                                    {isBodyExpanded
                                      ? bodyContent
                                      : bodyOverview || "No lesson body has been added yet."}
                                  </p>
                                  {bodyOverview.length > 180 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedLessonBodyIds((current) => ({
                                          ...current,
                                          [lesson.id]: !current[lesson.id],
                                        }))
                                      }
                                      className="mt-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                      {isBodyExpanded ? "Hide full body" : "View full body"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end lg:self-start">
                              <button
                                onClick={() => handleEditLesson(lesson, mod)}
                                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Unit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({ type: "lesson", module: mod, lesson })
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                aria-label={`Delete ${lesson.title}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lesson Editor Modal */}
      <LessonEditorModal
        isOpen={isEditorOpen}
        lesson={editingLesson}
        module={editingParentModule}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveLesson}
        uploadProgress={uploadProgress}
      />
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.type ?? "item"}?`}
        description={`Deleting “${deleteTarget?.type === "lesson" ? deleteTarget.lesson?.title : deleteTarget?.module.title}” cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget?.type === "lesson" && deleteTarget.lesson
            ? handleDeleteLesson(deleteTarget.module, deleteTarget.lesson)
            : deleteTarget
              ? handleDeleteModule(deleteTarget.module)
              : undefined
        }
      />
    </div>
  );
};
