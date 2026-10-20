import React, { useState } from "react";
import {
  Search,
  Sparkles,
  User,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Star,
  GraduationCap,
  Calendar,
  X,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { Course } from "../../types";

export const ExploreCoursesView: React.FC = () => {
  const { courses, enrollInCourse, navigateToCourseWorkspace } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  const categories = [
    "All",
    "Computer Science",
    "Artificial Intelligence",
    "Robotics",
    "Bioinformatics",
    "Human-Computer Interaction",
    "Cybersecurity",
  ];

  // All courses available in the institutional catalog
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredCourse = courses.find((c) => c.code === "CS 480") || courses[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Explore Course Catalog
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Discover advanced engineering electives, specialized research tracks, and university
          degree requirements
        </p>
      </div>

      {/* Featured Spotlight Banner */}
      {featuredCourse && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  Featured Elective · Fall 2026
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-300 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                  <span>{featuredCourse.rating} Rating</span>
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                {featuredCourse.code}: {featuredCourse.title}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
                {featuredCourse.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200 pt-1">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>{featuredCourse.instructor.name}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{featuredCourse.schedule}</span>
                </span>
                <span>·</span>
                <span>{featuredCourse.credits} Academic Credits</span>
              </div>
              <div className="pt-2 flex items-center gap-3">
                {featuredCourse.enrolled ? (
                  <button
                    onClick={() => navigateToCourseWorkspace(featuredCourse.id)}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Enrolled · Open Workspace</span>
                  </button>
                ) : (
                  <button
                    onClick={() => enrollInCourse(featuredCourse.id)}
                    className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 transition-colors"
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span>Enroll Now (Free with Student Plan)</span>
                  </button>
                )}
                <button
                  onClick={() => setPreviewCourse(featuredCourse)}
                  className="rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors"
                >
                  View Syllabus
                </button>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center rounded-2xl bg-indigo-800/40 border border-indigo-500/20 p-8">
              <Sparkles className="h-20 w-20 text-indigo-300" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by topic, keyword, syllabus topic or instructor..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
          >
            <div>
              {/* Card Banner */}
              <div
                className={`h-28 w-full bg-gradient-to-r ${course.bannerColor} p-4 text-white flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                    {course.code}
                  </span>
                  <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] font-semibold">
                    {course.level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/90">
                  <span>{course.category}</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                    <span>{course.rating}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                <div className="space-y-1.5 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span>Instructor:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {course.instructor.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Credits:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {course.credits} Units
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enrolled Peers:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {course.enrolledStudentsCount} students
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <button
                onClick={() => setPreviewCourse(course)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                View Syllabus
              </button>
              {course.enrolled ? (
                <button
                  onClick={() => navigateToCourseWorkspace(course.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Enrolled</span>
                </button>
              ) : (
                <button
                  onClick={() => enrollInCourse(course.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Enroll</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Course Preview Modal */}
      {previewCourse && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Course Syllabus Preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setPreviewCourse(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {previewCourse.code} · {previewCourse.category}
                </span>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {previewCourse.title}
                </h2>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                aria-label="Close dialog"
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <p className="leading-relaxed">{previewCourse.description}</p>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <div>
                  <span className="text-slate-400 font-semibold block">Instructor</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {previewCourse.instructor.name}
                  </span>
                  <span className="text-slate-400 block text-[11px]">
                    {previewCourse.instructor.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Schedule & Room</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {previewCourse.schedule}
                  </span>
                  <span className="text-slate-400 block text-[11px]">{previewCourse.room}</span>
                </div>
              </div>

              <div>
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Academic Prerequisites & Eligibility
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Open to all Computer Science, Data Science, and Engineering majors in good
                  academic standing (GPA &ge; 2.50).
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setPreviewCourse(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                {previewCourse.enrolled ? (
                  <button
                    onClick={() => {
                      navigateToCourseWorkspace(previewCourse.id);
                      setPreviewCourse(null);
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Open Learning Workspace
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      enrollInCourse(previewCourse.id);
                      setPreviewCourse(null);
                    }}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Confirm Enrollment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
