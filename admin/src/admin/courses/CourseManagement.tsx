import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Users,
  GraduationCap,
  Calendar,
  Layers,
  FileCheck2,
  CheckCircle2,
  X,
  Eye,
  BarChart2,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { DetailDrawer } from "../components/DetailDrawer";
import {
  Course,
  TeacherProfile,
  EnrollmentRecord,
  CurriculumModule,
  LearningMaterial,
} from "../types";

interface CourseManagementProps {
  courses: Course[];
  teachers: TeacherProfile[];
  enrollments: EnrollmentRecord[];
  curriculum: CurriculumModule[];
  materials: LearningMaterial[];
  onAddCourse: (newCourse: Course) => void;
  showCreateModalDirectly?: boolean;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
  courses,
  teachers,
  enrollments,
  curriculum,
  materials,
  onAddCourse,
  showCreateModalDirectly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [detailTab, setDetailTab] = useState<
    "overview" | "curriculum" | "students" | "materials" | "performance"
  >("overview");
  const [isCreateOpen, setIsCreateOpen] = useState(showCreateModalDirectly);

  // New course form
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    teacherId: teachers[0]?.id || "",
    grade: "Grade 12",
    category: "Mathematics",
    maxCapacity: 60,
    description: "",
    startDate: "2026-09-01",
    endDate: "2027-01-25",
  });

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) return;

    const teacher = teachers.find((t) => t.id === formData.teacherId) || teachers[0];
    const newCourse: Course = {
      id: `crs-${Date.now()}`,
      code: formData.code.toUpperCase(),
      title: formData.title,
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      grade: formData.grade,
      category: formData.category,
      maxCapacity: Number(formData.maxCapacity),
      enrollmentCount: 0,
      modulesCount: 4,
      status: "ACTIVE",
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    onAddCourse(newCourse);
    setIsCreateOpen(false);
    setFormData({
      code: "",
      title: "",
      teacherId: teachers[0]?.id || "",
      grade: "Grade 12",
      category: "Mathematics",
      maxCapacity: 60,
      description: "",
      startDate: "2026-09-01",
      endDate: "2027-01-25",
    });
  };

  const courseEnrollments = selectedCourse
    ? enrollments.filter(
        (e) => e.courseId === selectedCourse.id || e.courseCode === selectedCourse.code,
      )
    : [];

  const courseMaterials = selectedCourse
    ? materials.filter((m) => m.courseCode === selectedCourse.code)
    : [];

  const courseCurriculum = selectedCourse
    ? curriculum.filter((c) => c.courseId === selectedCourse.id)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        description="Comprehensive curriculum structures, teacher assignments, student capacities, and institutional syllabi."
        breadcrumbs={[{ label: "Admin" }, { label: "Academic Management" }, { label: "Courses" }]}
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        }
      />

      {/* Search and Filters */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course title, code (e.g. MATH-401), or faculty..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Categories</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Biological Sciences">Biological Sciences</option>
            <option value="Physics">Physics</option>
            <option value="Social Studies">Social Studies</option>
          </select>

          <span className="text-xs text-slate-400 tabular-nums">
            {filteredCourses.length} active courses
          </span>
        </div>
      </div>

      {/* Courses Grid / Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Course Code</th>
                <th className="py-3 px-4 font-semibold">Title & Category</th>
                <th className="py-3 px-4 font-semibold">Assigned Faculty</th>
                <th className="py-3 px-4 font-semibold">Grade</th>
                <th className="py-3 px-4 font-semibold">Enrollment / Capacity</th>
                <th className="py-3 px-4 font-semibold">Modules</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCourses.map((course) => {
                const fillPercent = Math.round((course.enrollmentCount / course.maxCapacity) * 100);

                return (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {course.code}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {course.title}
                      </span>
                      <span className="text-[11px] text-slate-400">{course.category}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {course.teacherName}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{course.grade}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                          {course.enrollmentCount} / {course.maxCapacity}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              fillPercent > 90 ? "bg-amber-500" : "bg-indigo-600"
                            }`}
                            style={{ width: `${Math.min(fillPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 tabular-nums text-slate-600 dark:text-slate-300">
                      {course.modulesCount} modules
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={course.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setDetailTab("overview");
                        }}
                        className="px-2.5 py-1 text-xs font-medium rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE COURSE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Academic Course
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. CHEM-301"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Target Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Organic Chemistry & Polymer Synthesis"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Department Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Biological Sciences">Biological Sciences</option>
                    <option value="Physics">Physics</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Assigned Lead Faculty
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} ({t.teacherCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Max Student Capacity
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="150"
                    value={formData.maxCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxCapacity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Syllabus Overview / Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter course curriculum goals, prerequisites, and learning objectives..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE DETAILS DRAWER */}
      {selectedCourse && (
        <DetailDrawer
          isOpen={!!selectedCourse}
          title={`${selectedCourse.code}: ${selectedCourse.title}`}
          subtitle={`${selectedCourse.teacherName} · ${selectedCourse.grade}`}
          onClose={() => setSelectedCourse(null)}
          width="xl"
        >
          <div className="space-y-5">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              {(["overview", "curriculum", "students", "materials", "performance"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`flex-1 py-1.5 font-medium rounded-md capitalize transition-colors ${
                      detailTab === tab
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>

            {/* Overview */}
            {detailTab === "overview" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    Syllabus Description
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Faculty Lead</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedCourse.teacherName}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Enrollment Status</span>
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                      {selectedCourse.enrollmentCount} / {selectedCourse.maxCapacity} students
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Term Dates</span>
                    <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                      {selectedCourse.startDate} to {selectedCourse.endDate}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block mb-0.5">Category</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedCourse.category}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Curriculum */}
            {detailTab === "curriculum" && (
              <div className="space-y-3 text-xs">
                {courseCurriculum.length === 0 ? (
                  <p className="text-slate-400 py-6 text-center">
                    Standard 8-module syllabus template loaded for {selectedCourse.code}.
                  </p>
                ) : (
                  courseCurriculum.map((mod) => (
                    <div
                      key={mod.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                    >
                      <h5 className="font-semibold text-slate-900 dark:text-white">{mod.title}</h5>
                      <div className="space-y-1.5 pl-2">
                        {mod.lessons.map((les) => (
                          <div
                            key={les.id}
                            className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                          >
                            <span className="text-slate-800 dark:text-slate-200">{les.title}</span>
                            <span className="text-slate-400 tabular-nums">
                              {les.durationMinutes} mins ·{" "}
                              {les.hasQuiz ? "Quiz Attached" : "Lecture"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Students */}
            {detailTab === "students" && (
              <div className="space-y-2 text-xs">
                {courseEnrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {enr.studentName}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{enr.studentId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-emerald-600">
                        Grade: {enr.grade || "—"}
                      </span>
                      <StatusBadge status={enr.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Materials */}
            {detailTab === "materials" && (
              <div className="space-y-2 text-xs">
                {courseMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {mat.title}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {(mat.fileSizeBytes / 1024 / 1024).toFixed(1)} MB · S3 Encrypted
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {mat.fileType}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Performance */}
            {detailTab === "performance" && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Cohort Evaluation Statistics
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Mean Score</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                      88.2%
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Submission Rate</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                      94.5%
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Pass Rate</span>
                    <span className="font-bold text-emerald-600 text-sm tabular-nums">97.1%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};
