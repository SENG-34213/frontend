import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  FolderOpen,
  Calendar,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { mockCourses, mockStudents, mockAssignments, mockMaterials } from '../data/mockData';
import { NavigationTab } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab, param?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCourses = mockCourses.filter(
    (c) =>
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredStudents = mockStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.studentId.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAssignments = mockAssignments.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.courseCode.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMaterials = mockMaterials.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.courseCode.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search courses, students, assignments, materials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            ESC
          </span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick AI Suggestion */}
          <div
            onClick={() => {
              onNavigate('ai-assistant');
              onClose();
            }}
            className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-900">Ask Mentify AI</p>
                <p className="text-xs text-indigo-700/80">Draft lesson plans, generate quiz questions, or summarize content</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </div>

          {/* Courses */}
          {filteredCourses.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-xs font-semibold text-slate-400">Courses</p>
              <div className="space-y-1">
                {filteredCourses.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate('courses');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="font-semibold text-slate-900 mr-2">{c.code}</span>
                        <span className="text-slate-600">{c.title}</span>
                      </div>
                    </div>
                    <span className="text-slate-400 tabular-nums">{c.enrolledCount} students</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Students */}
          {filteredStudents.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-xs font-semibold text-slate-400">Students</p>
              <div className="space-y-1">
                {filteredStudents.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate('students');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full text-white text-[10px] font-semibold flex items-center justify-center ${s.avatarBg}`}
                      >
                        {s.initials}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">{s.name}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">{s.studentId}</span>
                      </div>
                    </div>
                    <span className="text-slate-500 tabular-nums font-mono">GPA {s.gpa.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          {filteredAssignments.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-xs font-semibold text-slate-400">Assignments & Grading</p>
              <div className="space-y-1">
                {filteredAssignments.slice(0, 3).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onNavigate('grading-workspace');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-medium text-slate-900 mr-1.5">[{a.courseCode}]</span>
                        <span className="text-slate-700">{a.title}</span>
                      </div>
                    </div>
                    <span className="text-slate-400 tabular-nums">Due {a.dueDate}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {filteredMaterials.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-xs font-semibold text-slate-400">Learning Materials</p>
              <div className="space-y-1">
                {filteredMaterials.slice(0, 2).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onNavigate('materials');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderOpen className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 truncate max-w-md">{m.title}</span>
                    </div>
                    <span className="text-slate-400 tabular-nums">{m.fileSize}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tip: Jump directly between views with the left sidebar or quick shortcuts.</span>
          <span className="font-mono text-[11px]">Mentify Enterprise v2.4</span>
        </div>
      </div>
    </div>
  );
};
