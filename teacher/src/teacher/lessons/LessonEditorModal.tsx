import React, { useState } from 'react';
import { X, Save, Eye, Edit3, Clock, Layers, BookOpen, Check } from 'lucide-react';
import { Lesson, Module } from '../types';

interface LessonEditorModalProps {
  isOpen: boolean;
  lesson: Lesson | null;
  module: Module | null;
  onClose: () => void;
  onSave: (updatedLesson: Lesson) => void;
}

export const LessonEditorModal: React.FC<LessonEditorModalProps> = ({
  isOpen,
  lesson,
  module,
  onClose,
  onSave,
}) => {
  if (!isOpen || !lesson) return null;

  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [durationMinutes, setDurationMinutes] = useState(lesson.durationMinutes);
  const [contentType, setContentType] = useState(lesson.contentType);
  const [status, setStatus] = useState(lesson.status);
  const [contentMarkdown, setContentMarkdown] = useState(
    lesson.contentMarkdown ||
      `### Learning Objectives\n- Master fundamental asymptotic invariants.\n- Implement core balancing rotations without memory leaks.\n- Benchmark algorithmic execution against baseline implementations.`
  );
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    const updated: Lesson = {
      ...lesson,
      title,
      description,
      durationMinutes: Number(durationMinutes),
      contentType,
      status,
      contentMarkdown,
    };
    onSave(updated);

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>{module?.title || 'Module'}</span>
              <span>·</span>
              <span className="font-semibold text-indigo-600">Lesson Editor</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{title || 'Edit Lesson'}</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`px-3 py-1 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  mode === 'edit'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`px-3 py-1 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  mode === 'preview'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {mode === 'edit' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab Exercise</option>
                    <option value="Reading">Reading Material</option>
                    <option value="Discussion">Class Discussion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Publishing Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Published">Published to Students</option>
                    <option value="Draft">Draft (Faculty Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brief Overview
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lesson Body & Objectives (Markdown Supported)
                </label>
                <textarea
                  rows={8}
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </>
          ) : (
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {contentType} · {durationMinutes} Minutes
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">{title}</h2>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              </div>

              <div className="prose prose-sm max-w-none text-xs text-slate-700 space-y-2 whitespace-pre-line leading-relaxed font-sans">
                {contentMarkdown}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Changes sync automatically with Spring Boot curriculum service
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Lesson</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
