import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  BookOpen,
  FileCheck2,
  HelpCircle,
  FolderArchive,
  ArrowRight,
  Sparkles,
  Calendar,
  X,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    courses,
    assignments,
    quizzes,
    materials,
    navigateToCourseWorkspace,
    navigateToCourseDetails,
    setSelectedAssignmentId,
    setCurrentView,
  } = useStudent();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === "Escape" && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filter items
  const q = query.toLowerCase().trim();

  const matchedCourses = courses
    .filter((c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      type: "course" as const,
      title: `${c.code}: ${c.title}`,
      subtitle: `${c.instructor.name} · ${c.enrolled ? `${c.progressPercentage}% Completed` : "Available to Enroll"}`,
      icon: BookOpen,
      action: () => {
        if (c.enrolled) {
          navigateToCourseWorkspace(c.id);
        } else {
          navigateToCourseDetails(c.id);
        }
      },
    }));

  const matchedAssignments = assignments
    .filter((a) => a.title.toLowerCase().includes(q) || a.courseCode.toLowerCase().includes(q))
    .slice(0, 3)
    .map((a) => ({
      id: a.id,
      type: "assignment" as const,
      title: `${a.courseCode} — ${a.title}`,
      subtitle: `Due: ${new Date(a.dueDate).toLocaleDateString()} · Status: ${a.status}`,
      icon: FileCheck2,
      action: () => {
        setSelectedAssignmentId(a.id);
        setCurrentView("assignment-details");
      },
    }));

  const matchedQuizzes = quizzes
    .filter(
      (quiz) => quiz.title.toLowerCase().includes(q) || quiz.courseCode.toLowerCase().includes(q),
    )
    .slice(0, 2)
    .map((quiz) => ({
      id: quiz.id,
      type: "quiz" as const,
      title: `${quiz.courseCode} Quiz: ${quiz.title}`,
      subtitle: `${quiz.durationMinutes} mins · ${quiz.status}`,
      icon: HelpCircle,
      action: () => {
        setCurrentView("quizzes");
      },
    }));

  const matchedMaterials = materials
    .filter((m) => m.title.toLowerCase().includes(q) || m.courseCode.toLowerCase().includes(q))
    .slice(0, 2)
    .map((m) => ({
      id: m.id,
      type: "material" as const,
      title: `${m.courseCode}: ${m.title}`,
      subtitle: `${m.type} · ${m.fileSize}`,
      icon: FolderArchive,
      action: () => {
        setCurrentView("materials");
      },
    }));

  const staticActions = [
    {
      id: "act-ai",
      type: "action" as const,
      title: "Ask Mentify AI Study Assistant",
      subtitle: "Ask concept questions, exam prep, or code explanation",
      icon: Sparkles,
      action: () => setCurrentView("mentify-ai"),
    },
    {
      id: "act-cal",
      type: "action" as const,
      title: "Open Student Calendar",
      subtitle: "Check upcoming lecture timetable and exam dates",
      icon: Calendar,
      action: () => setCurrentView("calendar"),
    },
  ];

  const results = [
    ...matchedCourses,
    ...matchedAssignments,
    ...matchedQuizzes,
    ...matchedMaterials,
    ...(q === "" ? staticActions : []),
  ];

  const handleSelect = (idx: number) => {
    const item = results[idx];
    if (item) {
      item.action();
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command search palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-16 sm:pt-24 backdrop-blur-xs"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % results.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
              } else if (e.key === "Enter") {
                e.preventDefault();
                handleSelect(selectedIndex);
              }
            }}
            placeholder="Type a command or search courses, assignments, quizzes..."
            className="ml-3 flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            aria-label="Close search"
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching courses, assessments, or materials found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{item.title}</p>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isSelected
                          ? "translate-x-0.5 text-indigo-600 dark:text-indigo-400"
                          : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                ↑
              </kbd>{" "}
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                ↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>
          <span>
            <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
              ESC
            </kbd>{" "}
            Close
          </span>
        </div>
      </div>
    </div>
  );
};
