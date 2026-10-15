import { Icon } from "./Icon";
import type { DirectoryUser, LiveCourse } from "@/features/admin/types";

export function ReportsAnalytics({
  students,
  teachers,
  courses,
  enrollmentCount,
  groupCount,
  loading,
  onRefresh,
}: {
  students: DirectoryUser[];
  teachers: DirectoryUser[];
  courses: LiveCourse[];
  enrollmentCount: number;
  groupCount: number;
  loading: boolean;
  onRefresh: () => void;
}) {
  const totalUsers = students.length + teachers.length;
  const publishedCourses = courses.filter((course) => course.isPublished || course.courseStatus === "PUBLISHED").length;
  const onlineCourses = courses.filter((course) => course.online).length;
  const metrics = [
    ["Total users", totalUsers, "Students + teachers", "indigo"],
    ["Enrollments", enrollmentCount, "Live enrollment records", "blue"],
    ["Published courses", publishedCourses, `${onlineCourses} available online`, "violet"],
    ["Communication groups", groupCount, "Active academy spaces", "green"],
  ] as const;
  const max = Math.max(students.length, teachers.length, 1);

  return (
    <section className="reports-page" aria-labelledby="reports-title">
      <div className="reports-hero">
        <div>
          <span className="catalog-kicker">ACADEMY INTELLIGENCE</span>
          <h2 id="reports-title">Reports &amp; analytics</h2>
          <p>Understand your academy at a glance with live metrics from the Mentify services.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onRefresh}>
          <Icon name="calendar" size={16} /> Refresh reports
        </button>
      </div>

      <div className="reports-metric-grid">
        {metrics.map(([label, value, note, tone]) => (
          <article className={`reports-metric ${tone}`} key={label}>
            <span>{label}</span>
            <strong>{loading ? "—" : value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>

      <div className="reports-grid">
        <section className="reports-card reports-user-card">
          <div className="reports-card-heading"><div><h3>User distribution</h3><p>Current directory records by role</p></div><span className="reports-live-dot">LIVE</span></div>
          <div className="reports-role-row"><div><span className="role-dot student"/><strong>Students</strong><b>{students.length}</b></div><div className="reports-track"><i style={{ width: `${(students.length / max) * 100}%` }}/></div></div>
          <div className="reports-role-row"><div><span className="role-dot teacher"/><strong>Teachers</strong><b>{teachers.length}</b></div><div className="reports-track"><i className="teacher-fill" style={{ width: `${(teachers.length / max) * 100}%` }}/></div></div>
          <div className="reports-insight"><Icon name="sparkles" size={17}/><span><strong>Directory insight</strong> Keep teacher coverage balanced as new courses are published.</span></div>
        </section>
        <section className="reports-card">
          <div className="reports-card-heading"><div><h3>Course portfolio</h3><p>Catalog health and delivery format</p></div><Icon name="book" size={19}/></div>
          <div className="reports-course-list"><div><span>Published</span><strong>{publishedCourses}</strong><small>Courses visible to learners</small></div><div><span>Online delivery</span><strong>{onlineCourses}</strong><small>Courses with remote access</small></div><div><span>Catalog total</span><strong>{courses.length}</strong><small>Live course records</small></div></div>
        </section>
      </div>

      <section className="reports-card reports-activity-card">
        <div className="reports-card-heading"><div><h3>Operational summary</h3><p>What to review next across the admin workspace</p></div><span className="reports-period">CURRENT SNAPSHOT</span></div>
        <div className="reports-summary-grid"><div><span className="summary-number indigo">{students.length}</span><strong>Student records</strong><small>Review profiles and enrollment status.</small></div><div><span className="summary-number violet">{teachers.length}</span><strong>Teacher records</strong><small>Assign teachers to courses from the directory.</small></div><div><span className="summary-number blue">{enrollmentCount}</span><strong>Enrollment records</strong><small>Open the enrollment workspace for updates.</small></div><div><span className="summary-number green">{groupCount}</span><strong>Community groups</strong><small>Manage course-based conversations.</small></div></div>
      </section>
    </section>
  );
}
