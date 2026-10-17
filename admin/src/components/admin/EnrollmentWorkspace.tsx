/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import type { DirectoryUser, EnrollmentRecord, LiveCourse } from "@/features/admin/types";

type EnrollmentFilter = "all" | "enrolled" | "unenrolled";

export function EnrollmentWorkspace({
  students,
  enrollments,
  courses,
  loading,
  error,
  onRetry,
  onEnroll,
  onUpdateEnrollment,
}: {
  students: DirectoryUser[];
  enrollments: EnrollmentRecord[];
  courses: LiveCourse[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onEnroll: (studentId: string, courseIds: string[]) => Promise<void>;
  onUpdateEnrollment: (enrollmentId: string, courseIds: string[]) => Promise<void>;
}) {
  const [grade, setGrade] = useState("1");
  const [filter, setFilter] = useState<EnrollmentFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<DirectoryUser | null>(null);
  const [modalMode, setModalMode] = useState<"details" | "enroll" | "remove">("details");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const enrollmentMap = useMemo(
    () => new Map(enrollments.map((item) => [item.studentId, item])),
    [enrollments],
  );
  const gradeStudents = useMemo(
    () =>
      students
        .filter((student) => (student.grade || "1") === grade)
        .filter((student) => {
          const enrolled = Boolean(enrollmentMap.get(student.id)?.courseIds?.length);
          const query = search.trim().toLowerCase();
          return (
            (filter === "all" || (filter === "enrolled" ? enrolled : !enrolled)) &&
            (!query ||
              [student.name, student.email, student.code]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(query)))
          );
        }),
    [enrollmentMap, filter, grade, search, students],
  );
  const counts = useMemo(() => {
    const scoped = students.filter((student) => (student.grade || "1") === grade);
    return {
      all: scoped.length,
      enrolled: scoped.filter((student) => enrollmentMap.get(student.id)?.courseIds?.length).length,
      unenrolled: scoped.filter((student) => !enrollmentMap.get(student.id)?.courseIds?.length)
        .length,
    };
  }, [enrollmentMap, grade, students]);
  const completion = counts.all ? Math.round((counts.enrolled / counts.all) * 100) : 0;
  const openDetails = (student: DirectoryUser) => {
    setSelectedStudent(student);
    setModalMode("details");
    setSelectedCourses([]);
    setSaveError("");
  };
  const openEnrollment = (student: DirectoryUser) => {
    setSelectedStudent(student);
    setModalMode("enroll");
    setSelectedCourses([]);
    setSaveError("");
  };
  const saveEnrollment = async () => {
    if (!selectedStudent || !selectedCourses.length) return;
    setSaving(true);
    try {
      const record = enrollmentMap.get(selectedStudent.id);
      if (modalMode === "remove" && record)
        await onUpdateEnrollment(
          record.id,
          record.courseIds.filter((courseId) => !selectedCourses.includes(courseId)),
        );
      else await onEnroll(selectedStudent.id, selectedCourses);
      setSelectedStudent(null);
      setSelectedCourses([]);
    } catch (saveErrorValue) {
      setSaveError(
        saveErrorValue instanceof Error
          ? saveErrorValue.message
          : "Could not save this enrollment.",
      );
    } finally {
      setSaving(false);
    }
  };
  const availableCourses = selectedStudent
    ? modalMode === "remove"
      ? courses.filter((course) =>
          enrollmentMap.get(selectedStudent.id)?.courseIds.includes(course.id),
        )
      : courses.filter(
          (course) => !enrollmentMap.get(selectedStudent.id)?.courseIds.includes(course.id),
        )
    : [];

  return (
    <section
      className="enrollment-workspace professional-enrollment"
      aria-labelledby="enrollment-workspace-title"
    >
      <div className="enrollment-workspace-heading">
        <div>
          <span className="catalog-kicker">ACADEMIC MANAGEMENT</span>
          <h2 id="enrollment-workspace-title">Enrollment workspace</h2>
          <p>Track student progress by grade and keep every course assignment up to date.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onRetry}>
          <Icon name="calendar" size={15} /> Refresh data
        </button>
      </div>
      {loading ? (
        <div className="catalog-state">
          <span className="spinner spinner-dark" />
          <strong>Loading enrollment data…</strong>
          <p>Fetching students, enrollments, and available courses.</p>
        </div>
      ) : error ? (
        <div className="catalog-state catalog-error">
          <span className="empty-roster-icon">
            <Icon name="alert" size={20} />
          </span>
          <strong>Couldn’t load enrollment data</strong>
          <p>{error}</p>
          <button type="button" className="secondary-button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="enrollment-grade-tabs" role="tablist" aria-label="Student grades">
            {Array.from({ length: 13 }, (_, index) => String(index + 1)).map((value) => {
              const count = students.filter((student) => (student.grade || "1") === value).length;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={grade === value}
                  className={grade === value ? "active" : ""}
                  onClick={() => {
                    setGrade(value);
                    setFilter("all");
                  }}
                >
                  <span>Grade</span>
                  <strong>{value}</strong>
                  <small>
                    {count} student{count === 1 ? "" : "s"}
                  </small>
                </button>
              );
            })}
          </div>
          <div className="enrollment-summary-grid">
            <div className="enrollment-summary-card total">
              <i>
                <Icon name="users" size={17} />
              </i>
              <small>Total students</small>
              <strong>{counts.all}</strong>
              <span>In Grade {grade}</span>
            </div>
            <div className="enrollment-summary-card enrolled">
              <i>
                <Icon name="check" size={17} />
              </i>
              <small>Enrolled</small>
              <strong>{counts.enrolled}</strong>
              <span>{completion}% complete</span>
            </div>
            <div className="enrollment-summary-card unenrolled">
              <i>
                <Icon name="alert" size={17} />
              </i>
              <small>Needs enrollment</small>
              <strong>{counts.unenrolled}</strong>
              <span>Requires action</span>
            </div>
            <div className="enrollment-summary-card courses">
              <i>
                <Icon name="book" size={17} />
              </i>
              <small>Available courses</small>
              <strong>{courses.length}</strong>
              <span>Live catalog options</span>
            </div>
          </div>
          <div className="enrollment-progress-card">
            <div>
              <span>Grade {grade} enrollment progress</span>
              <strong>{completion}%</strong>
            </div>
            <div className="enrollment-progress-track">
              <i style={{ width: `${completion}%` }} />
            </div>
            <small>
              {counts.enrolled} of {counts.all} students have at least one course assigned.
            </small>
          </div>
          <div className="enrollment-toolbar">
            <div className="enrollment-filters">
              <button
                type="button"
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All <span>{counts.all}</span>
              </button>
              <button
                type="button"
                className={filter === "enrolled" ? "active" : ""}
                onClick={() => setFilter("enrolled")}
              >
                Enrolled <span>{counts.enrolled}</span>
              </button>
              <button
                type="button"
                className={filter === "unenrolled" ? "active" : ""}
                onClick={() => setFilter("unenrolled")}
              >
                Needs action <span>{counts.unenrolled}</span>
              </button>
            </div>
            <input
              className="course-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students…"
              aria-label="Search students"
            />
          </div>
          {gradeStudents.length ? (
            <>
              <div className="data-table-head enrollment-table-head" aria-hidden="true">
                <span>Student</span>
                <span>Contact</span>
                <span>Courses</span>
                <span>Status / action</span>
              </div>
              <div className="enrollment-student-grid">
                {gradeStudents.map((student) => {
                  const record = enrollmentMap.get(student.id);
                  const enrolled = Boolean(record?.courseIds?.length);
                  return (
                    <article
                      key={student.id}
                      className={`enrollment-student-card ${enrolled ? "is-enrolled" : "is-unenrolled"}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`View enrollment details for ${student.name}`}
                      onClick={() => openDetails(student)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openDetails(student);
                        }
                      }}
                    >
                      <div className="directory-avatar student-avatar">
                        <img src="/avatars/student-avatar.jpeg" alt="" />
                        <span>{student.name.trim().charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="enrollment-student-copy">
                        <div className="directory-user-top">
                          <h3>{student.name}</h3>
                          <span
                            className={`enrollment-badge ${enrolled ? "enrolled" : "unenrolled"}`}
                          >
                            {enrolled ? "Enrolled" : "Needs action"}
                          </span>
                        </div>
                        <p>{student.email}</p>
                        <div className="directory-facts">
                          <span>{student.code || "No student ID"}</span>
                          <span>
                            {enrolled
                              ? `${record?.courseIds.length} course${record?.courseIds.length === 1 ? "" : "s"}`
                              : "No courses yet"}
                          </span>
                        </div>
                        {enrolled ? (
                          <small className="enrollment-date">
                            Enrolled {record?.enrolledOn || "recently"}
                          </small>
                        ) : (
                          <button
                            type="button"
                            className="primary-button enrollment-action"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEnrollment(student);
                            }}
                          >
                            <Icon name="plus" size={14} /> Assign courses
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="catalog-state">
              <span className="empty-roster-icon">
                <Icon name="users" size={20} />
              </span>
              <strong>No matching students</strong>
              <p>Try another grade, status filter, or search term.</p>
            </div>
          )}
        </>
      )}
      {selectedStudent && (
        <div
          className="modal-backdrop detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedStudent(null);
          }}
        >
          <section
            className="detail-modal enrollment-picker-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enrollment-picker-title"
          >
            <div className="detail-modal-heading">
              <div>
                <span className="catalog-kicker">
                  {modalMode === "details"
                    ? "ENROLLMENT DETAILS"
                    : modalMode === "remove"
                      ? "REMOVE COURSES"
                      : "ADD COURSES"}
                </span>
                <h2 id="enrollment-picker-title">{selectedStudent.name}</h2>
                <p>
                  Grade {selectedStudent.grade || grade} ·{" "}
                  {modalMode === "details"
                    ? "Current course enrollment"
                    : modalMode === "remove"
                      ? "Select courses to remove from this student."
                      : "Select one or more courses to add."}
                </p>
              </div>
              <button
                type="button"
                className="notice-dismiss"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close enrollment details"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="detail-modal-body">
              {modalMode === "details" ? (
                <>
                  <div className="enrollment-profile-banner">
                    <div className="detail-avatar-large">
                      <img src="/avatars/student-avatar.jpeg" alt="" />
                    </div>
                    <div>
                      <strong>{selectedStudent.name}</strong>
                      <span>{selectedStudent.email}</span>
                      <small>{selectedStudent.code || "Student profile"}</small>
                    </div>
                  </div>
                  <div className="enrollment-detail-summary">
                    <div>
                      <small>Enrollment status</small>
                      <strong>
                        {enrollmentMap.get(selectedStudent.id)?.courseIds.length
                          ? "Enrolled"
                          : "Unenrolled"}
                      </strong>
                    </div>
                    <div>
                      <small>Courses enrolled</small>
                      <strong>
                        {enrollmentMap.get(selectedStudent.id)?.courseIds.length || 0}
                      </strong>
                    </div>
                    <div>
                      <small>Grade</small>
                      <strong>{selectedStudent.grade || grade}</strong>
                    </div>
                  </div>
                  {enrollmentMap.get(selectedStudent.id)?.courseIds.length ? (
                    <div className="enrolled-course-detail-list">
                      {enrollmentMap.get(selectedStudent.id)!.courseIds.map((courseId) => {
                        const course = courses.find((item) => item.id === courseId);
                        return (
                          <article className="enrolled-course-detail" key={courseId}>
                            <div className="enrolled-course-icon">
                              <Icon name="book" size={18} />
                            </div>
                            <div>
                              <h3>{course?.courseName || "Course details unavailable"}</h3>
                              <p>{course?.courseDescription || `Course ID: ${courseId}`}</p>
                              <div className="directory-facts">
                                <span>{course?.subject || "General"}</span>
                                <span>{course?.online ? "Online" : "In person"}</span>
                                <span>{course?.courseStatus || "Active"}</span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="catalog-state">
                      <span className="empty-roster-icon">
                        <Icon name="book" size={20} />
                      </span>
                      <strong>No courses enrolled</strong>
                      <p>
                        This student is currently unenrolled. Use the action below to add courses.
                      </p>
                    </div>
                  )}
                  <div className="enrollment-detail-actions">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => {
                        setModalMode("enroll");
                        setSelectedCourses([]);
                        setSaveError("");
                      }}
                    >
                      <Icon name="plus" size={14} /> Add courses
                    </button>
                    {enrollmentMap.get(selectedStudent.id)?.courseIds.length ? (
                      <button
                        type="button"
                        className="secondary-button danger-action"
                        onClick={() => {
                          setModalMode("remove");
                          setSelectedCourses([]);
                          setSaveError("");
                        }}
                      >
                        <Icon name="close" size={14} /> Remove courses
                      </button>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  {saveError && (
                    <div className="modal-error" role="alert">
                      <Icon name="alert" size={16} />
                      <span>{saveError}</span>
                    </div>
                  )}
                  <div className="enrollment-course-picker">
                    {availableCourses.length ? (
                      availableCourses.map((course) => {
                        const checked = selectedCourses.includes(course.id);
                        return (
                          <label
                            key={course.id}
                            className={`enrollment-course-option ${checked ? "selected" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) =>
                                setSelectedCourses((current) =>
                                  event.target.checked
                                    ? [...current, course.id]
                                    : current.filter((id) => id !== course.id),
                                )
                              }
                            />
                            <span className="course-choice-check">
                              <Icon name="check" size={13} />
                            </span>
                            <span>
                              <strong>{course.courseName}</strong>
                              <small>
                                {course.subject || "General"} ·{" "}
                                {course.online ? "Online" : "In person"} ·{" "}
                                {course.courseFeeMonthly != null
                                  ? `Grade fee: LKR ${Number(course.courseFeeMonthly).toLocaleString()} / month`
                                  : "Fee not set"}
                              </small>
                            </span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="catalog-state">
                        <strong>
                          {modalMode === "remove"
                            ? "No courses available to remove"
                            : "No courses available to add"}
                        </strong>
                        <p>
                          {modalMode === "remove"
                            ? "This student has no matching course records."
                            : "This student is already enrolled in all available courses."}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setSelectedStudent(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={
                        !selectedCourses.length ||
                        saving ||
                        (modalMode === "remove" &&
                          selectedCourses.length >=
                            (enrollmentMap.get(selectedStudent.id)?.courseIds.length || 0))
                      }
                      onClick={() => void saveEnrollment()}
                    >
                      {saving ? (
                        <>
                          <span className="spinner" /> Saving…
                        </>
                      ) : (
                        <>
                          {modalMode === "remove" ? "Remove selected" : "Save enrollment"}{" "}
                          <Icon name="arrow" size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
