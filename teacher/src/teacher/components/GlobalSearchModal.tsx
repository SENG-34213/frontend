import React, { useState, useEffect } from "react";
import { Search, BookOpen, FileText, X, ArrowRight } from "lucide-react";
import { Course, NavigationTab, Student } from "../types";
import type { BackendAssignment } from "../api/assignmentApi";
import { searchTeacherWorkspace, type TeacherSearchResult } from "../api/teacherSearchApi";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab, param?: string) => void;
  courses: Course[];
  students: Student[];
  assignments?: BackendAssignment[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  courses,
  students,
  assignments = [],
}) => {
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<TeacherSearchResult[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setRemoteResults([]);
      setRemoteError(null);
      setRemoteLoading(false);
      return;
    }
    const controller = new AbortController();
    setRemoteLoading(true);
    setRemoteError(null);
    searchTeacherWorkspace(query.trim(), controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setRemoteResults(response.results);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setRemoteResults([]);
          setRemoteError(
            requestError instanceof Error ? requestError.message : "Search is unavailable.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRemoteLoading(false);
      });
    return () => controller.abort();
  }, [isOpen, query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCourses = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.studentId.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.courseId.toLowerCase().includes(query.toLowerCase()),
  );
  const localSearchEnabled = query.trim().length < 2;
  const remoteTab = (result: TeacherSearchResult): NavigationTab => {
    if (result.type === "course") return "courses";
    if (result.type === "student") return "students";
    if (result.type === "quiz") return "quizzes";
    if (result.type === "exam") return "exams";
    return "assignments";
  };

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
              onClick={() => setQuery("")}
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
          {query.trim().length >= 2 && (
            <div>
              <p className="px-2 pb-1.5 text-xs font-semibold text-slate-400">Search Results</p>
              {remoteLoading && (
                <p className="px-2 py-3 text-xs text-slate-400">Searching workspace...</p>
              )}
              {remoteError && <p className="px-2 py-3 text-xs text-rose-600">{remoteError}</p>}
              {!remoteLoading && !remoteError && remoteResults.length === 0 && (
                <p className="px-2 py-3 text-xs text-slate-400">No matching records found.</p>
              )}
              <div className="space-y-1">
                {remoteResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => {
                      onNavigate(remoteTab(result), result.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{result.title}</span>
                      <span className="block text-slate-500">{result.subtitle || result.type}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Courses */}
          {localSearchEnabled && filteredCourses.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-xs font-semibold text-slate-400">Courses</p>
              <div className="space-y-1">
                {filteredCourses.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate("courses");
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
          {localSearchEnabled && filteredStudents.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-xs font-semibold text-slate-400">Students</p>
              <div className="space-y-1">
                {filteredStudents.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate("students");
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
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">
                          {s.studentId}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          {localSearchEnabled && filteredAssignments.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-xs font-semibold text-slate-400">
                Assignments & Grading
              </p>
              <div className="space-y-1">
                {filteredAssignments.slice(0, 3).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onNavigate("grading-workspace");
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-medium text-slate-900 mr-1.5">[{a.courseId}]</span>
                        <span className="text-slate-700">{a.title}</span>
                      </div>
                    </div>
                    <span className="text-slate-400 tabular-nums">Due {a.dueDate}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tip: Jump directly between views with the left sidebar or quick shortcuts.</span>
          <span className="text-[11px]">Teaching workspace</span>
        </div>
      </div>
    </div>
  );
};
