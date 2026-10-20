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

const toLesson = (lesson: CourseContentLesson, order: number): Lesson => ({
  id: lesson.id,
  moduleId: lesson.moduleId,
  title: lesson.title,
  description: lesson.description || "",
  contentMarkdown: lesson.contentMarkdown || "",
  durationMinutes: 0,
  order,
  status: lesson.visible === false ? "Draft" : "Published",
  contentType: "Lecture",
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
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({
    "mod-1": true,
    "mod-2": true,
    "mod-3": false,
  });

  // Editor states
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingParentModule, setEditingParentModule] = useState<Module | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // New module modal / inline
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "module" | "lesson"; module: Module; lesson?: Lesson } | null>(null);

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
    maxCapacity: currentBackendCourse?.numberOfStudents || 0,
    status: "Active",
    coverTheme: "indigo",
    modulesCount: modules.length,
    assignmentsCount: 0,
    averageGrade: 0,
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
    setEditingLesson(lesson);
    setEditingParentModule(parentModule);
    setIsEditorOpen(true);
  };

  const handleSaveLesson = async (updatedLesson: Lesson, pendingFiles: File[] = []) => {
    if (!selectedCourseId || !editingParentModule) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        title: updatedLesson.title.trim(),
        description: updatedLesson.description.trim(),
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
      for (const file of pendingFiles) {
        const uploaded = await uploadLessonMaterial(
          selectedCourseId,
          editingParentModule.id,
          saved.id,
          { title: file.name.replace(/\.[^.]+$/, "") || file.name, file },
        );
        savedMaterials.push(uploaded);
      }
      const nextLesson = toLesson({ ...saved, materials: savedMaterials }, updatedLesson.order);
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
      setEditingLesson(null);
      setIsEditorOpen(false);
    } catch (requestError: unknown) {
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
    setEditingLesson(newLesson);
    setEditingParentModule(parent);
    setIsEditorOpen(true);
  };

  const handleCreateModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    if (!selectedCourseId) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        title: newModuleTitle.trim(),
        description: newModuleDesc.trim(),
        sequenceOrder: editingModule?.order || courseModules.length + 1,
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingModule(mod);
                      setNewModuleTitle(mod.title);
                      setNewModuleDesc(mod.description);
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
                    mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs font-semibold shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {lesson.order}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                                {lesson.title}
                              </h4>
                              <StatusBadge status={lesson.contentType} variant="clean" />
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {lesson.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 self-end sm:self-center">
                          <span className="flex items-center gap-1 font-mono tabular-nums text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lesson.durationMinutes} min</span>
                          </span>

                          <button
                            onClick={() => handleEditLesson(lesson, mod)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Unit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ type: "lesson", module: mod, lesson })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            aria-label={`Delete ${lesson.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
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
