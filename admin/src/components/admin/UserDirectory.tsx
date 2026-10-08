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
                        <small>{section === "student" ? "Student" : "Teacher"}</small>
                      </div>
                    </div>
                    <div className="directory-contact">
                      <strong>{user.email}</strong>
                      <span>{user.phoneNumber || "No phone number"}</span>
                    </div>
                    <div className="directory-profile">
                      {section === "student" ? (
                        <>
                          <strong>Grade {user.grade || "—"}</strong>
                          <span>{user.code || "No student ID"}</span>
                        </>
                      ) : (
                        <>
                          <strong>{user.code || "No teacher code"}</strong>
                          <span>{user.specializations?.length ? user.specializations.join(", ") : "No specializations"}</span>
                        </>
                      )}
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
                  {section === "student"
                    ? "STUDENT PROFILE"
                    : "TEACHER PROFILE"}
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
                {section === "student" ? (
                  <>
                    <div>
                      <small>Grade</small>
                      <strong>{selectedUser.grade || "Not assigned"}</strong>
                    </div>
                    <div>
                      <small>Student ID</small>
                      <strong>{selectedUser.code || "Not available"}</strong>
                    </div>
                  </>
                ) : (
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
                )}
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
