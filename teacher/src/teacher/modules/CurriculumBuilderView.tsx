import React, { useState } from 'react';
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
} from 'lucide-react';
import { Course, Module, Lesson, NavigationTab } from '../types';
import { mockCourses, mockModules } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';
import { LessonEditorModal } from '../lessons/LessonEditorModal';

interface CurriculumBuilderViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const CurriculumBuilderView: React.FC<CurriculumBuilderViewProps> = ({ onNavigate }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id || 'crs-201');
  const [modules, setModules] = useState<Module[]>(mockModules);
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({
    'mod-1': true,
    'mod-2': true,
    'mod-3': false,
  });

  // Editor states
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingParentModule, setEditingParentModule] = useState<Module | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // New module modal / inline
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const currentCourse = mockCourses.find((c) => c.id === selectedCourseId) || mockCourses[0];
  const courseModules = modules.filter((m) => m.courseId === selectedCourseId);

  const toggleModule = (id: string) => {
    setExpandedModuleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditLesson = (lesson: Lesson, parentModule: Module) => {
    setEditingLesson(lesson);
    setEditingParentModule(parentModule);
    setIsEditorOpen(true);
  };

  const handleSaveLesson = (updatedLesson: Lesson) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== updatedLesson.moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((l) => (l.id === updatedLesson.id ? updatedLesson : l)),
        };
      })
    );
  };

  const handleAddLesson = (modId: string) => {
    const parent = modules.find((m) => m.id === modId);
    if (!parent) return;

    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      moduleId: modId,
      title: `New Lesson Unit ${parent.lessons.length + 1}`,
      description: 'Define syllabus objectives, lab instructions, and references.',
      durationMinutes: 45,
      order: parent.lessons.length + 1,
      status: 'Draft',
      contentType: 'Lecture',
      resourcesCount: 1,
    };

    setModules((prev) =>
      prev.map((m) => (m.id === modId ? { ...m, lessons: [...m.lessons, newLesson] } : m))
    );

    // Immediately open editor for this new lesson
    setEditingLesson(newLesson);
    setEditingParentModule(parent);
    setIsEditorOpen(true);
  };

  const handleCreateModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    const newMod: Module = {
      id: `mod-${Date.now()}`,
      courseId: selectedCourseId,
      title: `Module ${courseModules.length + 1}: ${newModuleTitle}`,
      description: newModuleDesc || 'Curriculum unit learning objectives.',
      order: courseModules.length + 1,
      status: 'Published',
      lessons: [],
    };

    setModules((prev) => [...prev, newMod]);
    setExpandedModuleIds((prev) => ({ ...prev, [newMod.id]: true }));
    setNewModuleTitle('');
    setNewModuleDesc('');
    setIsCreatingModule(false);
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
            Organize modules, lecture units, lab exercises, and learning assets in a hierarchical syllabus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Course Selector Dropdown */}
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden shadow-2xs"
          >
            {mockCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreatingModule(true)}
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
              Create New Syllabus Module
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
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Module Title
              </label>
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
              Save Module
            </button>
          </div>
        </form>
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
              {courseModules.length} Modules · {courseModules.reduce((acc, m) => acc + m.lessons.length, 0)} Total Lessons · {currentCourse.enrolledCount} Students Enrolled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('materials')}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddLesson(mod.id);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Lesson</span>
                  </button>
                </div>
              </div>

              {/* Module Body: Lessons List */}
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {mod.lessons.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No lessons added to this module yet. Click &quot;Add Lesson&quot; to begin building.
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
    </div>
  );
};
