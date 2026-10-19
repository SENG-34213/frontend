"use client";
import React, { useState } from "react";
import {
  Search,
  LayoutGrid,
  List,
  PlayCircle,
  BookOpen,
  User,
  Sparkles,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const MyCoursesView: React.FC = () => {
  const { courses, navigateToCourseWorkspace, navigateToCourseDetails, setCurrentView } =
    useStudent();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"progress" | "title" | "credits">("progress");

  // Filter only enrolled courses
  const enrolledCourses = courses.filter((c) => c.enrolled);

  const categories = [
    "All",
    "Computer Science",
    "Artificial Intelligence",
    "Software Systems",
    "Human-Computer Interaction",
    "Cybersecurity",
  ];

  const filteredCourses = enrolledCourses
    .filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "In Progress" &&
          c.progressPercentage > 0 &&
          c.progressPercentage < 100) ||
        (selectedStatus === "Completed" && c.progressPercentage === 100) ||
        (selectedStatus === "Not Started" && c.progressPercentage === 0);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "progress") return b.progressPercentage - a.progressPercentage;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "credits") return b.credits - a.credits;
      return 0;
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your enrolled academic subjects, curriculum progression, and active lecture
            modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView("explore-courses")}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Explore New Courses</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter courses by name, code, or professor..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 text-xs font-medium dark:border-slate-800">
              {["All", "In Progress", "Completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    selectedStatus === status
                      ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "progress" | "title" | "credits")}
              aria-label="Sort courses by"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="progress">Sort: Progress</option>
              <option value="title">Sort: Course Name</option>
              <option value="credits">Sort: Credits</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-slate-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${
                  viewMode === "list"
                    ? "bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course List / Grid */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 font-display text-sm font-bold text-slate-900 dark:text-white">
            No courses match your filter
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, status tab, or browse additional subjects in Explore
            Courses.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedStatus("All");
            }}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
            >
              <div>
                {/* Course Banner Artwork */}
                <div
                  className={`h-28 w-full bg-gradient-to-r ${course.bannerColor} p-4 text-white relative flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider backdrop-blur-xs font-bold">
                      {course.code}
                    </span>
                    <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
                      {course.credits} Credits
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/80">{course.category}</span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Instructor & Metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.instructor.name}</span>
                    </div>
                    {course.currentGrade && (
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        Grade: {course.currentGrade} ({course.currentScorePercentage}%)
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        Curriculum Progress
                      </span>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                        {course.progressPercentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                <button
                  onClick={() => navigateToCourseDetails(course.id)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigateToCourseWorkspace(course.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Continue</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${course.bannerColor} font-mono text-xs font-bold text-white`}
                >
                  {course.code.split(" ")[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {course.code}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{course.category}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{course.credits} Credits</span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instructor: {course.instructor.name} · {course.schedule}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="w-32 hidden sm:block">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-bold tabular-nums">{course.progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateToCourseDetails(course.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => navigateToCourseWorkspace(course.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>Workspace</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
