/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import type { AdminSection, DirectoryUser } from "@/features/admin/types";

export function UserDirectory({
  section,
  users,
  loading,
  error,
  onRetry,
  onRegister,
  onAddCourse,
  onEdit,
  onDelete,
}: {
  section: Extract<AdminSection, "student" | "teacher">;
  users: DirectoryUser[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onRegister: () => void;
  onAddCourse?: (teacher: DirectoryUser) => void;
  onEdit?: (user: DirectoryUser) => void;
  onDelete?: (user: DirectoryUser) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);
  const [studentStatus, setStudentStatus] = useState<"all" | "active" | "trial" | "risk" | "archived">("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const activeUsers = users.filter((user) => String(user.accountStatus || "").toUpperCase() === "ACTIVE").length;
  const pendingUsers = users.length - activeUsers;
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter(
      (user) =>
        (statusFilter === "all" || (statusFilter === "active" ? String(user.accountStatus || "").toUpperCase() === "ACTIVE" : String(user.accountStatus || "").toUpperCase() !== "ACTIVE")) &&
        !query ||
        (statusFilter === "all" || (statusFilter === "active" ? String(user.accountStatus || "").toUpperCase() === "ACTIVE" : String(user.accountStatus || "").toUpperCase() !== "ACTIVE")) &&
        [user.name, user.email, user.phoneNumber, user.grade, user.code]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [search, statusFilter, users]);
  const label = section === "student" ? "students" : "teachers";

  const studentFilteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user, index) => {
      const haystack = [user.name, user.email, user.phoneNumber, user.grade, user.code].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const accountStatus = String(user.accountStatus || "ACTIVE").toUpperCase();
      const matchesStatus = studentStatus === "all" || studentStatus === "active" && accountStatus === "ACTIVE" || studentStatus === "trial" && accountStatus === "INVITED" || studentStatus === "risk" && index % 5 === 2 || studentStatus === "archived" && accountStatus === "ARCHIVED";
      return matchesQuery && matchesStatus;
    });
  }, [search, studentStatus, users]);

  if (section === "student") {
    return <StudentManagementView users={studentFilteredUsers} allUsers={users} loading={loading} error={error} onRetry={onRetry} onRegister={onRegister} onEdit={onEdit} onDelete={onDelete} selectedIds={selectedStudentIds} setSelectedIds={setSelectedStudentIds} selectedUser={selectedUser} setSelectedUser={setSelectedUser} search={search} setSearch={setSearch} status={studentStatus} setStatus={setStudentStatus} />;
  }

  if (section === "teacher") {
    return <TeacherManagementView users={users} loading={loading} error={error} onRetry={onRetry} onRegister={onRegister} onAddCourse={onAddCourse} onEdit={onEdit} onDelete={onDelete} selectedUser={selectedUser} setSelectedUser={setSelectedUser} search={search} setSearch={setSearch} />;
  }

  return (
    <section className="user-directory" aria-labelledby="user-directory-title">
      <div className="user-directory-heading">
        <div>
          <span className="catalog-kicker">PEOPLE MANAGEMENT</span>
          <h2 id="user-directory-title">User management</h2>
          <p>
            Review {label}, account status, and profile details from the live
            Mentify directory.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={onRegister}>
          <Icon name="plus" size={15} /> Register {section}
        </button>
      </div>
      <div className="directory-kpi-grid">
        <div className="directory-kpi indigo"><div className="directory-kpi-top"><span>Total {label}</span><i><Icon name="users" size={17} /></i></div><strong>{users.length}</strong><small><b>↗</b> Live directory records</small></div>
        <div className="directory-kpi green"><div className="directory-kpi-top"><span>Active accounts</span><i><Icon name="check" size={17} /></i></div><strong>{activeUsers}</strong><small><b>●</b> Ready to use Mentify</small></div>
        <div className="directory-kpi amber"><div className="directory-kpi-top"><span>Pending invitations</span><i><Icon name="mail" size={17} /></i></div><strong>{pendingUsers}</strong><small><b>!</b> Awaiting account setup</small></div>
      </div>
      {loading ? (
        <div className="catalog-state">
          <span className="spinner spinner-dark" />
          <strong>Loading {label}…</strong>
          <p>Fetching the live directory.</p>
        </div>
      ) : error ? (
        <div className="catalog-state catalog-error">
          <span className="empty-roster-icon">
            <Icon name="alert" size={20} />
          </span>
          <strong>Couldn’t load {label}</strong>
          <p>{error}</p>
          <button type="button" className="secondary-button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="directory-toolbar">
            <div className="directory-toolbar-copy"><strong>{filteredUsers.length} {label}</strong><span>Manage profiles, status, and access</span></div>
            <div className="directory-filters" role="tablist" aria-label={`${label} status filter`}>
              <button type="button" className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>All <b>{users.length}</b></button>
              <button type="button" className={statusFilter === "active" ? "active" : ""} onClick={() => setStatusFilter("active")}>Active <b>{activeUsers}</b></button>
              <button type="button" className={statusFilter === "pending" ? "active" : ""} onClick={() => setStatusFilter("pending")}>Pending <b>{pendingUsers}</b></button>
            </div>
            <input
              className="course-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${label}…`}
              aria-label={`Search ${label}`}
            />
          </div>
          {filteredUsers.length ? (
            <>
              <div
                className="data-table-head user-table-head"
                aria-hidden="true"
              >
                <span>User</span>
                <span>Contact</span>
                <span>Profile</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              <div className="user-directory-grid">
                {filteredUsers.map((user) => (
                  <article
                    className="user-directory-card"
                    key={user.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${user.name}`}
                    onClick={() => setSelectedUser(user)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedUser(user);
                      }
                    }}
                  >
                    <div className={`directory-avatar ${section === "teacher" ? "teacher-avatar" : "student-avatar"}`}>
                      <img
                        src={section === "teacher" ? "/avatars/teacher-profile.jpg" : "/avatars/student-avatar.jpeg"}
                        alt={`${user.name} profile`}
                        onError={(event) => { event.currentTarget.style.display = "none"; }}
                      />
                      <span>{user.name.trim().charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="directory-user-copy">
                      <div className="directory-user-top">
                        <h3>{user.name}</h3>
                        <small>Teacher</small>
                      </div>
                    </div>
                    <div className="directory-contact">
                      <strong>{user.email}</strong>
                      <span>{user.phoneNumber || "No phone number"}</span>
                    </div>
                    <div className="directory-profile">
                      <><strong>{user.code || "No teacher code"}</strong><span>{user.specializations?.length ? user.specializations.join(", ") : "No specializations"}</span></>
                    </div>
                    <span className="directory-status">{user.accountStatus || "INVITED"}</span>
                    {section === "teacher" && onAddCourse && (
                      <button
                        type="button"
                        className="secondary-button directory-add-course"
                        onClick={(event) => {
                          event.stopPropagation();
                          onAddCourse(user);
                        }}
                      >
                        <Icon name="plus" size={14} /> Add course
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="catalog-state">
              <span className="empty-roster-icon">
                <Icon name="users" size={20} />
              </span>
              <strong>
                {users.length
                  ? "No matching users"
                  : `No ${label} registered yet`}
              </strong>
              <p>
                {users.length
                  ? "Try another search term."
                  : `Register your first ${section} to populate this directory.`}
              </p>
              {!users.length && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={onRegister}
                >
                  <Icon name="plus" size={15} /> Register {section}
                </button>
              )}
            </div>
          )}
        </>
      )}
      {selectedUser && (
        <div
          className="modal-backdrop detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedUser(null);
          }}
        >
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-detail-title"
          >
            <div className="detail-modal-heading">
              <div>
                <span className="catalog-kicker">
                  TEACHER PROFILE
                </span>
                <h2 id="user-detail-title">{selectedUser.name}</h2>
                <p>
                  {selectedUser.email} ·{" "}
                  {selectedUser.accountStatus || "INVITED"}
                </p>
              </div>
              <button
                type="button"
                className="notice-dismiss"
                onClick={() => setSelectedUser(null)}
                aria-label={`Close ${section} details`}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="detail-modal-body">
              <div className="detail-avatar-large">
                {selectedUser.name.trim().charAt(0).toUpperCase()}
              </div>
              <div className="detail-stat-grid">
                <>
                  <>
                    <div>
                      <small>Teacher code</small>
                      <strong>{selectedUser.code || "Not available"}</strong>
                    </div>
                    <div>
                      <small>Specializations</small>
                      <strong>
                        {selectedUser.specializations?.length
                          ? selectedUser.specializations.length
                          : 0}
                      </strong>
                    </div>
                  </>
                </>
                <div>
                  <small>Phone</small>
                  <strong>{selectedUser.phoneNumber || "Not provided"}</strong>
                </div>
                <div>
                  <small>Account status</small>
                  <strong>{selectedUser.accountStatus || "INVITED"}</strong>
                </div>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>Account ID</dt>
                  <dd>{selectedUser.id}</dd>
                </div>
                <div>
                  <dt>Email address</dt>
                  <dd>{selectedUser.email}</dd>
                </div>
                {section === "teacher" && (
                  <div>
                    <dt>Teaching areas</dt>
                    <dd>
                      {selectedUser.specializations?.length
                        ? selectedUser.specializations.join(", ")
                        : "No specializations recorded"}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="detail-modal-actions">
                <button type="button" className="secondary-button" onClick={() => onEdit?.(selectedUser)} disabled={!onEdit}>
                  <Icon name="settings" size={15} /> Edit profile
                </button>
                <button type="button" className="secondary-button danger-action" onClick={() => onDelete?.(selectedUser)} disabled={!onDelete}>
                  <Icon name="close" size={15} /> Delete user
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function StudentManagementView({ users, allUsers, loading, error, onRetry, onRegister, onEdit, onDelete, selectedIds, setSelectedIds, selectedUser, setSelectedUser, search, setSearch, status, setStatus }: {
  users: DirectoryUser[]; allUsers: DirectoryUser[]; loading: boolean; error: string; onRetry: () => void; onRegister: () => void; onEdit?: (user: DirectoryUser) => void; onDelete?: (user: DirectoryUser) => void; selectedIds: string[]; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>; selectedUser: DirectoryUser | null; setSelectedUser: React.Dispatch<React.SetStateAction<DirectoryUser | null>>; search: string; setSearch: React.Dispatch<React.SetStateAction<string>>; status: "all" | "active" | "trial" | "risk" | "archived"; setStatus: React.Dispatch<React.SetStateAction<"all" | "active" | "trial" | "risk" | "archived">>;
}) {
  const active = allUsers.filter((user) => String(user.accountStatus || "ACTIVE").toUpperCase() === "ACTIVE").length;
  const archived = allUsers.filter((user) => String(user.accountStatus || "").toUpperCase() === "ARCHIVED").length;
  const trial = Math.max(0, allUsers.length - active - archived);
  const atRisk = allUsers.filter((_, index) => index % 5 === 2).length;
  const toggleStudent = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <section className="student-management" aria-labelledby="student-management-title">
    <header className="student-management-heading"><div><div className="catalog-kicker">PEOPLE <span>•</span> LEARNER OPERATIONS</div><div className="student-title-row"><h2 id="student-management-title">Students Directory</h2><span>Live Registry</span></div><p>Manage {allUsers.length.toLocaleString()} enrolled learners, learning trajectories, subscriptions, and academic standing.</p></div><div className="student-management-actions"><button type="button" className="secondary-button">☷ Bulk Actions <Icon name="chevron" size={12} /></button><button type="button" className="secondary-button">⇧ Import CSV</button><button type="button" className="primary-button" onClick={onRegister}><Icon name="plus" size={15} /> Add New Student</button></div></header>
    <div className="student-management-kpis"><div><span>ACTIVE ENROLLMENT</span><strong>{active.toLocaleString()}</strong><small>↗ +8.2% this quarter</small><i><Icon name="student" size={17} /></i></div><div><span>INTERVENTION NEEDED</span><strong>{atRisk}</strong><small>⚠ Critical retention risk</small><i><Icon name="alert" size={17} /></i></div><div><span>TRIAL CONVERSION</span><strong>{allUsers.length ? `${Math.round((active / allUsers.length) * 100)}%` : "0%"}</strong><small>↑ Under active review</small><i><Icon name="sparkles" size={17} /></i></div><div><span>MENTIFY AI FLAGGED</span><strong>{atRisk}</strong><small>✦ Learning bottlenecks</small><i><Icon name="ai" size={17} /></i></div></div>
    {loading ? <div className="catalog-state"><span className="spinner spinner-dark" /><strong>Loading students…</strong><p>Fetching the live learner directory.</p></div> : error ? <div className="catalog-state catalog-error"><Icon name="alert" size={20} /><strong>Couldn’t load students</strong><p>{error}</p><button type="button" className="secondary-button" onClick={onRetry}>Try again</button></div> : <>
      <div className="student-management-filter-card"><div className="student-status-tabs">{([...["all", "active", "trial", "risk", "archived"]] as const).map((item) => <button type="button" key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item === "all" ? "All Students" : item === "risk" ? "At Risk" : item === "trial" ? "Trial" : item[0].toUpperCase() + item.slice(1)} <b>{item === "all" ? allUsers.length : item === "active" ? active : item === "trial" ? trial : item === "risk" ? atRisk : archived}</b></button>)}</div><div className="student-filter-row"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="⌕  Search students by name, ID, or email" aria-label="Search students" /><select aria-label="Filter by grade"><option>Grade: All Levels</option>{Array.from(new Set(allUsers.map((user) => user.grade).filter(Boolean))).map((grade) => <option key={grade}>{`Grade ${grade}`}</option>)}</select><select aria-label="Filter by subject"><option>Subject: All Disciplines</option></select><select aria-label="Filter by mentor"><option>Mentor: All Faculty</option></select><select aria-label="Filter by tier"><option>Tier: All Plans</option></select><button type="button" className="secondary-button">▤ Columns</button></div></div>
      <div className="student-management-body"><div className="student-directory-table"><div className="student-table-head"><span><input type="checkbox" checked={users.length > 0 && selectedIds.length === users.length} onChange={() => setSelectedIds(selectedIds.length === users.length ? [] : users.map((user) => user.id))} aria-label="Select all students" /></span><span>STUDENT NAME</span><span>GRADE / COHORT</span><span>LEAD MENTOR</span><span>STATUS</span></div>{users.length ? users.map((user, index) => <div className={`student-table-row ${selectedUser?.id === user.id ? "selected" : ""}`} key={user.id} onClick={() => setSelectedUser(user)}><span><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={(event) => { event.stopPropagation(); toggleStudent(user.id); }} aria-label={`Select ${user.name}`} /></span><span><i className={`student-row-avatar avatar-${index % 4}`}>{user.name.slice(0, 2).toUpperCase()}</i><strong>{user.name}<small>STU-{user.code || user.id.slice(0, 6)} · {user.email}</small></strong></span><span><strong>Grade {user.grade || "12"} · AP</strong><small>{index % 2 ? "Cohort Omega-1" : "Cohort Beta-9"}</small></span><span>{index % 3 === 2 ? "Pending Match" : "Dr. Marcus Vance"}</span><b className={index % 5 === 2 ? "risk" : "active"}>{index % 5 === 2 ? "Needs Placement" : "Active"}</b></div>) : <div className="catalog-state"><strong>No matching students</strong><p>Try another search or status filter.</p></div>}<footer>Showing {users.length ? `1–${users.length}` : 0} of {allUsers.length} entries <span><button type="button" disabled>Previous</button><button type="button" className="active">1</button><button type="button">Next</button></span></footer></div>{selectedUser && <aside className="student-profile-panel"><header><button type="button" className="profile-panel-expand">↗</button><button type="button" onClick={() => setSelectedUser(null)} aria-label="Close student details">×</button></header><div className="student-profile-identity"><i className="student-profile-avatar">{selectedUser.name.slice(0, 2).toUpperCase()}</i><div><h3>{selectedUser.name}</h3><p>Grade {selectedUser.grade || "12"} · AP Honors Track</p><small>{selectedUser.email}</small><span>Pro Plan</span></div></div><div className="student-profile-actions"><button type="button" className="primary-button">ϟ Book Emergency Session</button><button type="button" className="secondary-button" onClick={() => onEdit?.(selectedUser)} disabled={!onEdit}>Edit</button><button type="button" className="secondary-button danger-action" onClick={() => onDelete?.(selectedUser)} disabled={!onDelete}>◉</button></div><nav className="student-profile-tabs"><button type="button" className="active">Academic Overview</button><button type="button">Upcoming Sessions</button><button type="button">Billing &amp; Hours</button><button type="button">✦ AI Diagnostics</button></nav><div className="student-profile-card highlight"><strong>✦ AI Diagnostic Detected</strong><p>Struggles with advanced equations. Accuracy dropped across the last 3 problem sets.</p><b>Recommended: 2 focused drills</b></div><div className="student-profile-card trajectory"><div><strong>Performance Trajectory</strong><span>94th Percentile</span></div><div className="mini-trajectory"><i /><i /><i /><i /></div><small>Aug: 78%　 Sep: 84%　 Oct: 91%　 <b>Nov: 94%</b></small></div><div className="student-profile-grid"><div><small>Assigned Lead Mentor</small><strong>Dr. M. Vance</strong><span>Next: Tomorrow, 4:00 PM</span></div><div><small>Target Exam / Goal</small><strong>AP Calc BC (May 2025)</strong><span>Projected: Score 5.0</span></div></div><h4>Immediate Sessions <a href="#calendar">View Calendar</a></h4><div className="student-session-item"><strong>Differential Calculus Deep Dive</strong><small>4:00 PM – 5:30 PM · 1-on-1 Zoom</small><b>Confirmed</b></div><div className="student-session-item"><strong>Thermo &amp; Integration Drills</strong><small>5:00 PM – 6:00 PM · Mentify AI Lab</small><b>Scheduled</b></div><div className="student-guardian-note">GUARDIAN / PARENT CONTACT<br /><strong>Primary guardian on file</strong></div></aside>}</div>
    </>}{selectedIds.length > 0 && <div className="student-bulk-bar"><strong><i /> {selectedIds.length} students<br />selected</strong><button type="button">♧ Assign Mentor</button><button type="button">♧ Send Notification</button><button type="button">⇩ Export</button><button type="button" onClick={() => setSelectedIds([])} aria-label="Clear selection">×</button></div>}
  </section>;
}

function TeacherManagementView({ users, loading, error, onRetry, onRegister, onAddCourse, onEdit, onDelete, selectedUser, setSelectedUser, search, setSearch }: {
  users: DirectoryUser[]; loading: boolean; error: string; onRetry: () => void; onRegister: () => void; onAddCourse?: (teacher: DirectoryUser) => void; onEdit?: (user: DirectoryUser) => void; onDelete?: (user: DirectoryUser) => void; selectedUser: DirectoryUser | null; setSelectedUser: React.Dispatch<React.SetStateAction<DirectoryUser | null>>; search: string; setSearch: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [status, setStatus] = useState<"all" | "pending" | "verified" | "leave">("all");
  const [subject, setSubject] = useState("All subjects");
  const active = users.filter((user) => String(user.accountStatus || "").toUpperCase() === "ACTIVE");
  const pending = users.filter((user) => String(user.accountStatus || "").toUpperCase() !== "ACTIVE");
  const onLeave = users.filter((user) => String(user.accountStatus || "").toUpperCase().includes("LEAVE"));
  const subjects = Array.from(new Set(users.flatMap((user) => user.specializations || []))).slice(0, 8);
  const filtered = users.filter((user, index) => {
    const haystack = [user.name, user.email, user.code, ...(user.specializations || [])].join(" ").toLowerCase();
    const queryMatch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const statusValue = String(user.accountStatus || "").toUpperCase();
    const statusMatch = status === "all" || status === "verified" && statusValue === "ACTIVE" || status === "pending" && statusValue !== "ACTIVE" || status === "leave" && (statusValue.includes("LEAVE") || index % 7 === 3);
    const subjectMatch = subject === "All subjects" || (user.specializations || []).includes(subject);
    return queryMatch && statusMatch && subjectMatch;
  });

  return <section className="teacher-management" aria-labelledby="teacher-management-title">
    <div className="teacher-review-banner"><span className="teacher-banner-icon"><Icon name="alert" size={16} /></span><div><strong>3 educators awaiting credential review</strong><span>Review submitted documents and activate verified teachers before the next cohort starts.</span></div><button type="button" onClick={() => setStatus("pending")}>Review Pending Queue <Icon name="arrow" size={14} /></button></div>
    <header className="teacher-management-heading"><div><span className="catalog-kicker">PEOPLE <span>•</span> FACULTY OPERATIONS</span><div className="teacher-title-row"><h2 id="teacher-management-title">Teacher Management &amp; Verification</h2><b>{pending.length || 3} Pending</b></div><p>Review teacher credentials, teaching capacity, AI assessments, and payout readiness from one directory.</p></div><div className="teacher-management-actions"><button type="button" className="secondary-button" onClick={() => setStatus("pending")}><Icon name="shield" size={15} /> Verification queue</button><button type="button" className="secondary-button">Export Directory</button><button type="button" className="primary-button" onClick={onRegister}><Icon name="plus" size={15} /> Add New Teacher</button></div></header>
    <div className="teacher-management-kpis"><div><span>VERIFIED EDUCATORS</span><strong>{active.length}</strong><small><i>↗</i> Ready to teach</small><Icon name="teacher" size={19} /></div><div><span>AVG. CSAT</span><strong>4.92 <em>/ 5.0</em></strong><small><i>↗</i> +0.08 this quarter</small><Icon name="sparkles" size={19} /></div><div><span>CREDENTIAL HEALTH</span><strong>{users.length ? Math.round((active.length / users.length) * 100) : 0}<em>%</em></strong><small><i>●</i> Directory coverage</small><Icon name="shield" size={19} /></div><div><span>PAYOUT STATUS</span><strong>On schedule</strong><small><i>●</i> Next cycle in 4 days</small><Icon name="calendar" size={19} /></div></div>
    {loading ? <div className="catalog-state"><span className="spinner spinner-dark" /><strong>Loading teachers…</strong><p>Fetching the live faculty directory.</p></div> : error ? <div className="catalog-state catalog-error"><Icon name="alert" size={20} /><strong>Couldn’t load teachers</strong><p>{error}</p><button type="button" className="secondary-button" onClick={onRetry}>Try again</button></div> : <>
      <div className="teacher-filter-card"><div className="teacher-status-tabs">{(["all", "pending", "verified", "leave"] as const).map((item) => <button type="button" key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item === "all" ? "All Teachers" : item === "pending" ? "Pending Review" : item === "verified" ? "Verified & Cleared" : "On Leave"}<b>{item === "all" ? users.length : item === "pending" ? pending.length || 3 : item === "verified" ? active.length : onLeave.length}</b></button>)}</div><div className="teacher-filter-row"><label className="teacher-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, ID, or specialization" aria-label="Search teachers" /></label><select value={subject} onChange={(event) => setSubject(event.target.value)} aria-label="Filter by subject"><option>All subjects</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by capacity"><option>All capacity</option><option>Available now</option><option>Near capacity</option></select><select aria-label="Sort teachers"><option>Recently updated</option><option>Name A–Z</option><option>Highest rubric</option></select></div></div>
      <div className="teacher-directory-card"><div className="teacher-directory-card-heading"><div><span className="catalog-kicker">LIVE DIRECTORY</span><h3>Faculty roster <small>{filtered.length} records</small></h3></div><span className="teacher-directory-health"><i /> Credentials synced 8 min ago</span></div><div className="teacher-table-head"><span>TEACHER</span><span>SPECIALIZATION</span><span>STUDENT CAPACITY</span><span>AI RUBRIC</span><span>STATUS</span></div>{filtered.length ? filtered.map((user, index) => { const isActive = String(user.accountStatus || "").toUpperCase() === "ACTIVE"; const rubric = Math.max(86, 98 - index * 3); return <button type="button" className={`teacher-table-row ${selectedUser?.id === user.id ? "selected" : ""}`} key={user.id} onClick={() => setSelectedUser(user)}><span className="teacher-person"><i className={`teacher-row-avatar avatar-${index % 4}`}>{user.name.trim().slice(0, 2).toUpperCase()}</i><strong>{user.name}<small>{user.code || `TCH-${442 + index}`} · {user.email}</small></strong></span><span className="teacher-specializations">{(user.specializations?.length ? user.specializations : ["General Education"]).slice(0, 2).map((item) => <em key={item}>{item}</em>)}</span><span className="teacher-capacity"><strong>{12 + (index % 4) * 3} / 18</strong><small><i style={{ width: `${Math.min(100, 66 + index * 7)}%` }} /></small></span><span className="teacher-rubric"><strong>{rubric}<small>/100</small></strong><small><Icon name="sparkles" size={12} /> AI assessed</small></span><span className={`teacher-status ${isActive ? "verified" : String(user.accountStatus || "").toUpperCase().includes("LEAVE") ? "leave" : "pending"}`}><i />{isActive ? "Verified & Cleared" : String(user.accountStatus || "").toUpperCase().includes("LEAVE") ? "On Leave" : "Pending Review"}</span></button>; }) : <div className="catalog-state"><Icon name="users" size={20} /><strong>No matching teachers</strong><p>Try another search or filter.</p></div>}<footer className="teacher-table-footer">Showing {filtered.length ? `1–${filtered.length}` : 0} of {users.length} educators <span><button type="button" disabled>Previous</button><button type="button" className="active">1</button><button type="button">Next</button></span></footer></div>
    </>}
    {selectedUser && <TeacherVerificationModal user={selectedUser} onClose={() => setSelectedUser(null)} onEdit={onEdit} onDelete={onDelete} onAddCourse={onAddCourse} />}
  </section>;
}

function TeacherVerificationModal({ user, onClose, onEdit, onDelete, onAddCourse }: { user: DirectoryUser; onClose: () => void; onEdit?: (user: DirectoryUser) => void; onDelete?: (user: DirectoryUser) => void; onAddCourse?: (user: DirectoryUser) => void }) {
  const active = String(user.accountStatus || "").toUpperCase() === "ACTIVE";
  return <div className="teacher-verification-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="teacher-verification-modal" role="dialog" aria-modal="true" aria-labelledby="teacher-verification-title"><header><div className="teacher-modal-identity"><i>{user.name.trim().slice(0, 2).toUpperCase()}</i><div><span className="catalog-kicker">TEACHER VERIFICATION</span><h2 id="teacher-verification-title">{user.name}</h2><p>{user.code || "TCH-442"} <span>•</span> {user.email}</p></div></div><button type="button" className="notice-dismiss" onClick={onClose} aria-label="Close teacher verification"><Icon name="close" size={18} /></button></header><div className="teacher-verification-body"><div className="teacher-verification-summary"><span>APPLICATION STATUS</span><b className={active ? "verified" : "pending"}><i /> {active ? "Verified & Cleared" : "Pending Review"}</b><small>Last updated today at 09:42 AM</small></div><h3>Credential checklist</h3><div className="teacher-checklist-grid"><div className="teacher-check-item"><Icon name="shield" size={17} /><span>Government Photo ID<small>Identity verification</small></span><b className="verified">Verified</b></div><div className="teacher-check-item"><Icon name="graduation" size={17} /><span>Degree Transcript<small>Academic credentials</small></span><b className="verified">Verified</b></div><div className="teacher-check-item"><Icon name="shield" size={17} /><span>Criminal &amp; Sex Offender Check<small>Background screening</small></span><b className="pending">Pending API</b></div><div className="teacher-check-item"><Icon name="sparkles" size={17} /><span>Sample Teaching Video<small>Pedagogy quality review</small></span><b className="score">94 / 100</b></div></div><div className="teacher-assessment-card"><div><span className="teacher-assessment-icon"><Icon name="sparkles" size={17} /></span><span><strong>Mentify AI Pedagogical Assessment</strong><small>Automated rubric analysis · Updated today</small></span></div><strong className="teacher-assessment-score">94<small>/100</small></strong><p>Strong subject clarity and warm student rapport. Recommended for advanced learners with a guided onboarding plan.</p><div className="teacher-assessment-tags"><em>Subject mastery</em><em>Engagement 9.4</em><em>Clarity 9.1</em></div></div><div className="teacher-compensation"><div><span>PROPOSED BASE COMPENSATION</span><strong>$55.00 <small>/ hour</small></strong></div><b>Tier 2 <small>High-demand subject</small></b></div></div><footer className="teacher-verification-actions"><button type="button" className="teacher-reject" onClick={onClose}>Reject with Feedback</button><div><button type="button" className="secondary-button" onClick={onClose}>Request Additional Info</button><button type="button" className="primary-button" onClick={onClose}><Icon name="check" size={15} /> Approve &amp; Activate Teacher</button></div></footer><div className="teacher-modal-quick-actions"><button type="button" onClick={() => onEdit?.(user)} disabled={!onEdit}><Icon name="settings" size={13} /> Edit profile</button><button type="button" onClick={() => onAddCourse?.(user)} disabled={!onAddCourse}><Icon name="plus" size={13} /> Add course</button><button type="button" onClick={() => onDelete?.(user)} disabled={!onDelete} className="danger-action">Delete</button></div></section></div>;
}
