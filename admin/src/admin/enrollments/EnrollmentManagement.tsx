import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Minus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Course, EnrollmentRecord, Grade, StudentProfile } from "../types";

interface EnrollmentManagementProps {
  enrollments: EnrollmentRecord[];
  courses: Course[];
  students: StudentProfile[];
  grades: Grade[];
  onCreateEnrollment: (studentId: string, courseIds: string[]) => Promise<unknown>;
  onUpdateEnrollment: (enrollmentId: string, courseIds: string[]) => Promise<unknown>;
  onDeleteEnrollment: (enrollmentId: string) => Promise<void>;
}

function normalizedGrade(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/^grade\s*/i, "");
}

function studentName(student: StudentProfile) {
  return `${student.firstName} ${student.lastName}`.trim();
}

export const EnrollmentManagement: React.FC<EnrollmentManagementProps> = ({
  enrollments,
  courses,
  students,
  grades,
  onCreateEnrollment,
  onUpdateEnrollment,
  onDeleteEnrollment,
}) => {
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedGradeId && grades.length > 0) {
      const firstGradeId = window.setTimeout(() => setSelectedGradeId(grades[0].id), 0);
      return () => window.clearTimeout(firstGradeId);
    }
  }, [grades, selectedGradeId]);

  const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);

  const gradeStudents = useMemo(
    () =>
      selectedGrade
        ? students.filter(
            (student) => normalizedGrade(student.grade) === normalizedGrade(selectedGrade.name),
          )
        : [],
    [selectedGrade, students],
  );

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    return !query
      ? gradeStudents
      : gradeStudents.filter((student) =>
          [studentName(student), student.studentId, student.email].some((value) =>
            value.toLowerCase().includes(query),
          ),
        );
  }, [gradeStudents, studentSearch]);

  const selectedStudent = gradeStudents.find((student) => student.id === selectedStudentId);

  const gradeCourses = useMemo(
    () =>
      selectedGrade
        ? courses.filter(
            (course) =>
              course.gradeId === selectedGrade.id ||
              normalizedGrade(course.gradeName || course.grade) ===
                normalizedGrade(selectedGrade.name),
          )
        : [],
    [courses, selectedGrade],
  );

  const studentEnrollmentRecords = useMemo(
    () =>
      selectedStudent
        ? enrollments.filter((enrollment) => enrollment.studentId === selectedStudent.id)
        : [],
    [enrollments, selectedStudent],
  );

  const enrolledCourseIds = useMemo(
    () => new Set(studentEnrollmentRecords.map((enrollment) => enrollment.courseId)),
    [studentEnrollmentRecords],
  );

  const enrolledCourses = gradeCourses.filter((course) => enrolledCourseIds.has(course.id));
  const availableCourses = gradeCourses.filter((course) => {
    const query = courseSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [course.title, course.code, course.subject || course.category].some((value) =>
        (value || "").toLowerCase().includes(query),
      );
    return matchesSearch && !enrolledCourseIds.has(course.id);
  });

  const workflowStep = !selectedGrade ? 1 : !selectedStudent ? 2 : 3;

  const selectGrade = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedStudentId("");
    setStudentSearch("");
    setCourseSearch("");
    setNotice("");
    setError("");
  };

  const selectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setNotice("");
    setError("");
  };

  const handleEnroll = async (courseId: string) => {
    if (!selectedStudent) return;
    const actionKey = `add:${courseId}`;
    setActiveAction(actionKey);
    setError("");
    setNotice("");
    try {
      const enrollment = studentEnrollmentRecords[0];
      if (enrollment?.enrollmentId) {
        await onUpdateEnrollment(enrollment.enrollmentId, [
          ...Array.from(enrolledCourseIds),
          courseId,
        ]);
      } else {
        await onCreateEnrollment(selectedStudent.id, [courseId]);
      }
      setNotice("Course enrolled successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The course could not be enrolled.");
    } finally {
      setActiveAction("");
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (!selectedStudent) return;
    const record = studentEnrollmentRecords.find((enrollment) => enrollment.courseId === courseId);
    if (!record?.enrollmentId) {
      setError("This enrollment is not available for updating right now.");
      return;
    }

    const actionKey = `remove:${courseId}`;
    setActiveAction(actionKey);
    setError("");
    setNotice("");
    try {
      const remainingCourseIds = Array.from(enrolledCourseIds).filter((id) => id !== courseId);
      if (remainingCourseIds.length === 0) {
        await onDeleteEnrollment(record.enrollmentId);
      } else {
        await onUpdateEnrollment(record.enrollmentId, remainingCourseIds);
      }
      setNotice("Course unenrolled successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The course could not be unenrolled.");
    } finally {
      setActiveAction("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment Workspace"
        description="A guided workspace for assigning the right learning path to every student."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academic Management" },
          { label: "Enrollments" },
        ]}
        actions={
          <div className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live catalog sync
          </div>
        }
      />

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {notice}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {grades.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Create a grade before managing student enrollments.
        </div>
      ) : (
        <>
          <nav
            className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            aria-label="Enrollment workflow"
          >
            {[
              {
                number: 1,
                title: "Choose grade",
                caption: "Set the academic context",
                icon: GraduationCap,
              },
              { number: 2, title: "Choose student", caption: "Find the learner", icon: Users },
              {
                number: 3,
                title: "Assign courses",
                caption: "Manage learning access",
                icon: BookOpen,
              },
            ].map((step, index) => {
              const completed = workflowStep > step.number;
              const active = workflowStep === step.number;
              const StepIcon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`relative flex items-center gap-2.5 px-3 py-3.5 sm:gap-3 sm:px-5 ${index < 2 ? "border-r border-slate-100 dark:border-slate-800" : ""} ${active ? "bg-indigo-50/70 dark:bg-indigo-950/20" : ""}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${completed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : active ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-[11px] font-bold sm:text-xs ${active ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      {step.title}
                    </span>
                    <span className="hidden truncate text-[10px] text-slate-400 sm:block">
                      {step.caption}
                    </span>
                  </span>
                </div>
              );
            })}
          </nav>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  1. Choose a grade
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Pick a grade to scope the student directory and course catalog below.
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                {grades.length} grades
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {grades.map((grade) => {
                const count = students.filter(
                  (student) => normalizedGrade(student.grade) === normalizedGrade(grade.name),
                ).length;
                const selected = grade.id === selectedGradeId;
                return (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() => selectGrade(grade.id)}
                    className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:from-indigo-950/40 dark:to-violet-950/30"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${selected ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"}`}
                      >
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      {selected ? (
                        <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>
                    <span className="mt-3 block text-sm font-bold text-slate-900 dark:text-white">
                      {grade.name}
                    </span>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {count} students
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${grade.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}
                      >
                        {grade.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <span className="mt-2 block text-[10px] text-slate-400">
                      {
                        courses.filter(
                          (course) =>
                            course.gradeId === grade.id ||
                            normalizedGrade(course.gradeName || course.grade) ===
                              normalizedGrade(grade.name),
                        ).length
                      }{" "}
                      courses configured
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Users className="h-5 w-5 text-indigo-600" />
                    2. Choose a student
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{selectedGrade?.name} students</span>
                    {selectedGrade && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {selectedGrade.active ? "Active grade" : "Inactive grade"}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {filteredStudents.length} found
                </span>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Search name or student ID..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
                {filteredStudents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700">
                    No students found for this grade.
                  </div>
                ) : (
                  filteredStudents.map((student) => {
                    const selected = student.id === selectedStudentId;
                    const count = enrollments.filter(
                      (enrollment) => enrollment.studentId === student.id,
                    ).length;
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => selectStudent(student.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${selected ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30" : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"}`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <UserRound className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
                            {studentName(student)}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                            {student.studentId} · {student.email}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">
                            {count} courses
                          </span>
                          <ChevronRight
                            className={`ml-auto mt-1 h-3.5 w-3.5 ${selected ? "text-indigo-600" : "text-slate-300"}`}
                          />
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-6 xl:self-start">
              {!selectedStudent ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                    <UserRound className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                    Select a student to continue
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Choose a student from {selectedGrade?.name} to view enrolled courses and manage
                    access.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                        3. Manage course access
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {studentName(selectedStudent)} · {selectedStudent.studentId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <ShieldCheck className="h-4 w-4" />
                      {enrolledCourses.length} enrolled
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Current courses
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {enrolledCourses.length} assigned
                      </span>
                    </div>
                    <div className="space-y-2">
                      {enrolledCourses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700">
                          No courses enrolled yet.
                        </div>
                      ) : (
                        enrolledCourses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600 dark:bg-slate-900 dark:text-emerald-300">
                              <BookOpen className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
                                {course.title}
                              </span>
                              <span className="block text-[11px] text-slate-500">
                                {course.code} · {course.subject || course.category}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUnenroll(course.id)}
                              disabled={activeAction === `remove:${course.id}`}
                              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300"
                            >
                              <Minus className="h-3.5 w-3.5" />
                              {activeAction === `remove:${course.id}` ? "Removing..." : "Unenroll"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                    <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Available {selectedGrade?.name} courses
                      </h4>
                      <div className="relative w-full sm:w-56">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          value={courseSearch}
                          onChange={(event) => setCourseSearch(event.target.value)}
                          placeholder="Search courses..."
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-[11px] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {availableCourses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700">
                          No additional courses are available for this grade.
                        </div>
                      ) : (
                        availableCourses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                              <BookOpen className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
                                {course.title}
                              </span>
                              <span className="block text-[11px] text-slate-500">
                                {course.code} · {course.subject || course.category}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEnroll(course.id)}
                              disabled={activeAction === `add:${course.id}`}
                              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {activeAction === `add:${course.id}` ? "Adding..." : "Enroll"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
