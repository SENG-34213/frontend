import React, { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Download,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const CourseWorkspaceView: React.FC = () => {
  const {
    courses,
    selectedCourseId,
    selectedLessonId,
    setSelectedLessonId,
    markLessonComplete,
    setCurrentView,
    sendAiQuery,
    showToast,
  } = useStudent();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [videoProgress, setVideoProgress] = useState<number>(38);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
  const [quickAiQuestion, setQuickAiQuestion] = useState("");

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === selectedLessonId);
  const currentLesson = allLessons[currentLessonIndex] || allLessons[0];

  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast("Code copied to clipboard");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleQuickAiAsk = () => {
    if (!quickAiQuestion.trim()) return;
    sendAiQuery(`In ${course.code} (${currentLesson?.title}): ${quickAiQuestion}`);
    setCurrentView("mentify-ai");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-4 pb-12">
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:px-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView("course-details")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Course Syllabus</span>
          </button>
          <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {course.code}
            </span>
            <h1 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {currentLesson?.title || "Lesson Workspace"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark Complete Toggle */}
          <button
            onClick={() =>
              markLessonComplete(course.id, currentLesson.id, !currentLesson.completed)
            }
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              currentLesson.completed
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{currentLesson.completed ? "Completed" : "Mark as Complete"}</span>
          </button>

          {/* Toggle playlist */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            title="Toggle Curriculum Sidebar"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{isSidebarOpen ? "Hide Index" : "Show Index"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Lesson Content Area (3 cols when playlist open) */}
        <div className={`space-y-6 ${isSidebarOpen ? "lg:col-span-3" : "lg:col-span-4"}`}>
          {/* Simulated Video Player */}
          {currentLesson.type === "video" && (
            <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 shadow-xl text-white">
              <div className="aspect-video w-full flex flex-col justify-between p-6 bg-gradient-to-t from-black/80 via-transparent to-black/30">
                {/* Video Top Watermark */}
                <div className="flex items-center justify-between text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-black/40 px-2 py-0.5 font-mono text-[10px]">
                      {course.code}
                    </span>
                    <span className="font-medium">{currentLesson.title}</span>
                  </div>
                  <span className="font-mono text-emerald-400">1080p HD Streaming</span>
                </div>

                {/* Center Play Button Simulator */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-xl hover:scale-105 hover:bg-indigo-500 transition-transform"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
                  </button>
                </div>

                {/* Player Bottom Bar */}
                <div className="space-y-2">
                  {/* Progress scrubber */}
                  <div
                    className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20 hover:h-2 transition-all"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const newPct = Math.round((clickX / rect.width) * 100);
                      setVideoProgress(Math.max(0, Math.min(100, newPct)));
                    }}
                  >
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="hover:text-indigo-400"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setVideoProgress(0)}
                        className="hover:text-indigo-400"
                        title="Restart"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <Volume2 className="h-4 w-4 text-white/80" />
                      <span className="font-mono text-[11px] text-white/80">
                        {Math.floor(
                          (videoProgress * currentLesson.durationMinutes * 60) / 100 / 60,
                        )}
                        :
                        {String(
                          Math.floor(
                            ((videoProgress * currentLesson.durationMinutes * 60) / 100) % 60,
                          ),
                        ).padStart(2, "0")}{" "}
                        / {currentLesson.durationMinutes}:00
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Speed selector */}
                      <button
                        onClick={() => {
                          const speeds = [1, 1.25, 1.5, 2];
                          const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                          setPlaybackSpeed(speeds[nextIdx]);
                        }}
                        className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold hover:bg-white/20"
                      >
                        {playbackSpeed}x
                      </button>
                      <Maximize2 className="h-4 w-4 text-white/80 hover:text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Content Body */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                <span>{course.code}</span>
                <span>·</span>
                <span className="capitalize">{currentLesson.type} Lecture</span>
                <span>·</span>
                <span>{currentLesson.durationMinutes} Minutes Expected</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {currentLesson.title}
              </h2>
            </div>

            {/* Markdown Body Text */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
              <div className="whitespace-pre-line text-slate-700 dark:text-slate-300 font-sans">
                {currentLesson.content}
              </div>
            </div>

            {/* Code Snippet Box (if available) */}
            {currentLesson.codeSnippet && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {currentLesson.codeSnippet.language} implementation
                  </span>
                  <button
                    onClick={() => handleCopyCode(currentLesson.codeSnippet!.code)}
                    className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {copiedCode ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
                  <code>{currentLesson.codeSnippet.code}</code>
                </pre>
              </div>
            )}

            {/* Downloadable Materials */}
            {currentLesson.downloadableResources &&
              currentLesson.downloadableResources.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Supplementary Lesson Downloads
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLesson.downloadableResources.map((res) => (
                      <div
                        key={res.name}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/60"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {res.name}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {res.format} · {res.size}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => showToast(`Downloaded: ${res.name}`)}
                          className="rounded p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Quick Mentify AI Helper Input */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Need help with {currentLesson.title}?</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quickAiQuestion}
                  onChange={(e) => setQuickAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickAiAsk()}
                  placeholder="Ask Mentify AI to explain this formula, concept, or code..."
                  className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-indigo-800 dark:bg-slate-900 dark:text-white"
                />
                <button
                  onClick={handleQuickAiAsk}
                  className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Ask AI
                </button>
              </div>
            </div>

            {/* Bottom Lesson Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              {prevLesson ? (
                <button
                  onClick={() => setSelectedLessonId(prevLesson.id)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous:</span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {prevLesson.title}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <button
                  onClick={() => setSelectedLessonId(nextLesson.id)}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs transition-colors"
                >
                  <span className="hidden sm:inline">Next:</span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {nextLesson.title}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    markLessonComplete(course.id, currentLesson.id, true);
                    setCurrentView("course-details");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Curriculum Complete · View Syllabus</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Index Sidebar (1 col) */}
        {isSidebarOpen && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Course Index
                </h3>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {course.progressPercentage}%
                </span>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                {course.modules.map((mod, modIdx) => (
                  <div key={mod.id} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Module {modIdx + 1}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {mod.title}
                    </p>

                    <div className="space-y-1 pt-1">
                      {mod.lessons.map((lesson) => {
                        const isCurrent = lesson.id === currentLesson.id;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors ${
                              isCurrent
                                ? "bg-indigo-50 text-indigo-900 font-semibold dark:bg-indigo-950/70 dark:text-indigo-200"
                                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40"
                            }`}
                          >
                            {lesson.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <div
                                className={`h-3.5 w-3.5 rounded-full border shrink-0 mt-0.5 ${
                                  isCurrent
                                    ? "border-indigo-600 bg-indigo-600"
                                    : "border-slate-300 dark:border-slate-600"
                                }`}
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs">{lesson.title}</p>
                              <span className="text-[10px] text-slate-400">
                                {lesson.durationMinutes}m · {lesson.type}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
