import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Layers,
  FileCheck,
  FolderOpen,
  HelpCircle,
  GraduationCap,
  Award,
  Calendar,
  Edit3,
  Archive,
  Share2,
  Plus,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Course, NavigationTab } from '../types';
import {
  mockModules,
  mockStudents,
  mockAssignments,
  mockQuizzes,
  mockExaminations,
  mockMaterials,
} from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';

interface CourseDetailsViewProps {
  course: Course;
  onBack: () => void;
  onNavigate: (tab: NavigationTab, param?: string) => void;
  onEditCourse: (course: Course) => void;
}

type CourseTab =
  | 'overview'
  | 'curriculum'
  | 'students'
  | 'materials'
  | 'assignments'
  | 'quizzes'
  | 'exams'
  | 'grades';

export const CourseDetailsView: React.FC<CourseDetailsViewProps> = ({
  course,
  onBack,
  onNavigate,
  onEditCourse,
}) => {
  const [activeTab, setActiveTab] = useState<CourseTab>('overview');

  const courseModules = mockModules.filter((m) => m.courseId === course.id);
  const enrolledStudents = mockStudents.filter((s) => s.enrolledCourseIds.includes(course.id));
  const courseAssignments = mockAssignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = mockQuizzes.filter((q) => q.courseId === course.id);
  const courseExams = mockExaminations.filter((e) => e.courseId === course.id);
  const courseMaterials = mockMaterials.filter((m) => m.courseId === course.id);

  const tabs: { id: CourseTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum', count: courseModules.length },
    { id: 'students', label: 'Students', count: enrolledStudents.length },
    { id: 'materials', label: 'Materials', count: courseMaterials.length },
    { id: 'assignments', label: 'Assignments', count: courseAssignments.length },
    { id: 'quizzes', label: 'Quizzes', count: courseQuizzes.length },
    { id: 'exams', label: 'Exams', count: courseExams.length },
    { id: 'grades', label: 'Grades' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Back Nav & Lifecycle Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditCourse(course)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Course</span>
          </button>
          <button
            onClick={() => onNavigate('curriculum')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Curriculum Builder</span>
          </button>
        </div>
      </div>

      {/* Course Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs font-mono font-bold bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded border border-indigo-400/30">
                  {course.code}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {course.semester} · {course.academicYear}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-300">{course.level} Level</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {course.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
                {course.description}
              </p>
            </div>

            <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Class Enrollment</span>
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  {course.enrolledCount} / {course.maxCapacity}
                </span>
              </div>
              <StatusBadge status={course.status} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto px-6 border-b border-slate-200 gap-6 scrollbar-none bg-slate-50/50">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-6">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold">Weekly Lecture Schedule</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">Tuesdays & Thursdays</p>
                  <p className="text-xs text-slate-500">10:00 AM - 11:30 AM (Turing 401)</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold">Grading Weight Distribution</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">Weighted Scale</p>
                  <p className="text-xs text-slate-500">30% Midterm · 40% Assignments · 30% Final</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Users className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-semibold">Active Teaching Assistant</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">Sarah Jenkins</p>
                  <p className="text-xs text-slate-500">Lead TA · s.jenkins@mentify.edu</p>
                </div>
              </div>

              {/* Quick Module Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Syllabus Modules</h3>
                  <button
                    onClick={() => setActiveTab('curriculum')}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    View All Modules
                  </button>
                </div>

                <div className="space-y-2">
                  {courseModules.map((mod) => (
                    <div
                      key={mod.id}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs font-mono">
                          {mod.order}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{mod.title}</p>
                          <p className="text-[11px] text-slate-500">{mod.description}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-600 tabular-nums">
                        {mod.lessons.length} lessons
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. CURRICULUM TAB */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Showing structured hierarchy of modules, lecture units, and lab sessions.
                </p>
                <button
                  onClick={() => onNavigate('curriculum')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Module</span>
                </button>
              </div>

              <div className="space-y-4">
                {courseModules.map((mod) => (
                  <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-indigo-700">
                          Module {mod.order}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{mod.title}</h4>
                      </div>
                      <StatusBadge status={mod.status} />
                    </div>

                    <div className="divide-y divide-slate-100">
                      {mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="p-3.5 hover:bg-slate-50/60 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-400">
                              {mod.order}.{lesson.order}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-slate-900">{lesson.title}</p>
                              <p className="text-[11px] text-slate-500">{lesson.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="font-mono tabular-nums">{lesson.durationMinutes} min</span>
                            <StatusBadge status={lesson.contentType} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. STUDENTS TAB */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {enrolledStudents.length} students officially enrolled for Fall 2026.
                </span>
                <button
                  onClick={() => onNavigate('students')}
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Open Full Directory →
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Student ID</th>
                      <th className="px-4 py-3">Attendance</th>
                      <th className="px-4 py-3">GPA</th>
                      <th className="px-4 py-3">Academic Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrolledStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-center ${st.avatarBg}`}
                            >
                              {st.initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{st.name}</p>
                              <p className="text-[11px] text-slate-400">{st.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">{st.studentId}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-700">
                          {st.attendanceRate}%
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums font-semibold text-slate-900">
                          {st.gpa.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={st.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onNavigate('students')}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            View Record
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Course syllabus files, starter code archives, and slides stored on AWS S3.
                </p>
                <button
                  onClick={() => onNavigate('materials')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Resource</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs font-mono border border-indigo-100">
                        {mat.fileType}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{mat.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{mat.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="font-mono">{mat.fileSize}</span>
                          <span>·</span>
                          <span>{mat.downloadsCount} downloads</span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={mat.visibility} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Manage homework milestones, rubric scoring, and submissions.
                </p>
                <button
                  onClick={() => onNavigate('assignments')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Assignment</span>
                </button>
              </div>

              <div className="space-y-3">
                {courseAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{asg.title}</h4>
                        <StatusBadge status={asg.status} />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{asg.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Due {asg.dueDate}</span>
                        <span>·</span>
                        <span className="text-slate-700 font-medium font-mono tabular-nums">
                          {asg.gradedCount}/{asg.totalSubmissions} graded
                        </span>
                        <span>·</span>
                        <span className="font-mono">{asg.maxMarks} marks</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('grading-workspace')}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors w-fit"
                    >
                      Grade Submissions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. QUIZZES & EXAMS & GRADES TABS */}
          {(activeTab === 'quizzes' || activeTab === 'exams' || activeTab === 'grades') && (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500 mb-3">
                Viewing dedicated assessment module for {course.code}.
              </p>
              <button
                onClick={() => onNavigate(activeTab as NavigationTab)}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Open Full {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
