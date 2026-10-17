import React, { useState } from 'react';
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
} from 'lucide-react';
import { mockCourses } from '../data/mockData';

export type QuickCreateType =
  | 'course'
  | 'module'
  | 'lesson'
  | 'assignment'
  | 'quiz'
  | 'exam'
  | 'event';

interface QuickCreateModalProps {
  isOpen: boolean;
  type: QuickCreateType | null;
  onClose: () => void;
  onCreated: (type: QuickCreateType, item: any) => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  type,
  onClose,
  onCreated,
}) => {
  const [activeType, setActiveType] = useState<QuickCreateType>(type || 'assignment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Computer Science');
  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [maxMarks, setMaxMarks] = useState('100');
  const [duration, setDuration] = useState('45');

  React.useEffect(() => {
    if (type) setActiveType(type);
  }, [type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(`Created ${activeType.toUpperCase()} successfully!`);

      const createdPayload = {
        id: `gen-${Date.now()}`,
        title: title || courseTitle || `${activeType} #${Math.floor(Math.random() * 900 + 100)}`,
        courseId: selectedCourseId,
        courseCode: mockCourses.find((c) => c.id === selectedCourseId)?.code || 'CS-201',
        description,
        dueDate,
        maxMarks: Number(maxMarks) || 100,
        status: 'Active',
      };

      onCreated(activeType, createdPayload);

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 900);
    }, 400);
  };

  const typesList: { id: QuickCreateType; label: string; icon: React.ElementType }[] = [
    { id: 'assignment', label: 'Assignment', icon: FileCheck },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'lesson', label: 'Lesson', icon: FileCode },
    { id: 'module', label: 'Module', icon: Layers },
    { id: 'course', label: 'Course', icon: BookOpen },
    { id: 'exam', label: 'Exam', icon: GraduationCap },
    { id: 'event', label: 'Calendar Event', icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Quick Create</h3>
            <p className="text-xs text-slate-500">Add teaching content directly to your curriculum</p>
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
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              {activeType !== 'course' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {mockCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeType === 'course' ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
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
                    <div className="col-span-2">
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
                  Description & Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder={`Describe objectives, requirements, and instructions for students...`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              {(activeType === 'assignment' || activeType === 'exam' || activeType === 'event') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {activeType === 'event' ? 'Event Date' : 'Due / Exam Date'}
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {activeType === 'event' ? 'Duration (mins)' : 'Maximum Marks'}
                    </label>
                    <input
                      type="number"
                      value={activeType === 'event' ? duration : maxMarks}
                      onChange={(e) =>
                        activeType === 'event'
                          ? setDuration(e.target.value)
                          : setMaxMarks(e.target.value)
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
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
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : `Create ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}`}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
