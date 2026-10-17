import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import type {
  CommunicationGroup,
  DirectoryUser,
  GroupMember,
  LiveCourse,
} from "@/features/admin/types";

type GroupDraft = { courseId: string; name: string; description: string };

export function CommunicationGroups({
  groups,
  courses,
  students,
  loading,
  error,
  onRetry,
  onCreate,
  onAddStudent,
  onArchive,
  onUnarchive,
  onLoadMembers,
}: {
  groups: CommunicationGroup[];
  courses: LiveCourse[];
  students: DirectoryUser[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onCreate: (draft: GroupDraft) => Promise<void>;
  onAddStudent: (groupId: string, studentId: string) => Promise<void>;
  onArchive: (groupId: string) => Promise<CommunicationGroup | void>;
  onUnarchive: (groupId: string) => Promise<CommunicationGroup | void>;
  onLoadMembers: (groupId: string) => Promise<GroupMember[]>;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState<GroupDraft>({ courseId: "", name: "", description: "" });
  const [selectedGroup, setSelectedGroup] = useState<CommunicationGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<"active" | "archived" | "all">("active");
  const [archivedGroups, setArchivedGroups] = useState<CommunicationGroup[]>([]);
  const existingCourseIds = useMemo(() => new Set(groups.map((group) => group.courseId)), [groups]);
  const allGroups = useMemo(
    () => [
      ...groups,
      ...archivedGroups.filter((archived) => !groups.some((group) => group.id === archived.id)),
    ],
    [archivedGroups, groups],
  );
  const visibleGroups = useMemo(
    () =>
      allGroups.filter(
        (group) =>
          groupFilter === "all" ||
          (groupFilter === "archived" ? group.status === "ARCHIVED" : group.status !== "ARCHIVED"),
      ),
    [allGroups, groupFilter],
  );
  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    return visibleGroups.filter(
      (group) =>
        !query ||
        [group.name, group.description, group.courseId]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [search, visibleGroups]);
  const courseName = (courseId: string) =>
    courses.find((course) => course.id === courseId)?.courseName ||
    `Course ${courseId.slice(0, 8)}`;
  const studentName = (userId: string) =>
    students.find((student) => student.id === userId)?.name || `User ${userId.slice(0, 8)}`;

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await onCreate(draft);
      setDraft({ courseId: "", name: "", description: "" });
      setShowCreate(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not create the communication group.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openGroup(group: CommunicationGroup) {
    setSelectedGroup(group);
    setMembers([]);
    setMemberLoading(true);
    setFormError("");
    try {
      setMembers(await onLoadMembers(group.id));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not load group members.");
    } finally {
      setMemberLoading(false);
    }
  }

  async function addStudent() {
    if (!selectedGroup || !selectedStudentId) return;
    setSaving(true);
    setFormError("");
    try {
      await onAddStudent(selectedGroup.id, selectedStudentId);
      setMembers(await onLoadMembers(selectedGroup.id));
      setSelectedStudentId("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not add the student.");
    } finally {
      setSaving(false);
    }
  }

  async function archiveGroup() {
    if (
      !selectedGroup ||
      !window.confirm(
        `Archive ${selectedGroup.name}? Members will no longer be able to use this group.`,
      )
    )
      return;
    setSaving(true);
    setFormError("");
    try {
      const archived = await onArchive(selectedGroup.id);
      setArchivedGroups((current) => [
        ...current.filter((group) => group.id !== selectedGroup.id),
        archived || { ...selectedGroup, status: "ARCHIVED" },
      ]);
      setSelectedGroup(null);
      setGroupFilter("archived");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not archive the group.");
    } finally {
      setSaving(false);
    }
  }

  async function unarchiveGroup() {
    if (
      !selectedGroup ||
      !window.confirm(
        `Unarchive ${selectedGroup.name}? It will become available to group members again.`,
      )
    )
      return;
    setSaving(true);
    setFormError("");
    try {
      await onUnarchive(selectedGroup.id);
      setArchivedGroups((current) => current.filter((group) => group.id !== selectedGroup.id));
      setSelectedGroup(null);
      setGroupFilter("active");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not unarchive the group.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="communication-groups" aria-labelledby="communication-groups-title">
      <div className="communication-heading">
        <div>
          <span className="catalog-kicker">COMMUNICATION MANAGEMENT</span>
          <h2 id="communication-groups-title">Communication groups</h2>
          <p>Create course-based groups for teachers and students to communicate securely.</p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setFormError("");
            setShowCreate(true);
          }}
        >
          <Icon name="plus" size={16} /> Create group
        </button>
      </div>
      <div className="communication-summary">
        <div>
          <span className="communication-summary-icon violet">
            <Icon name="users" size={18} />
          </span>
          <span>
            <small>Active groups</small>
            <strong>{groups.length}</strong>
          </span>
        </div>
        <div>
          <span className="communication-summary-icon blue">
            <Icon name="book" size={18} />
          </span>
          <span>
            <small>Courses with groups</small>
            <strong>{new Set(groups.map((group) => group.courseId)).size}</strong>
          </span>
        </div>
        <div>
          <span className="communication-summary-icon green">
            <Icon name="users" size={18} />
          </span>
          <span>
            <small>Available students</small>
            <strong>{students.length}</strong>
          </span>
        </div>
      </div>
      <div className="communication-toolbar">
        <div className="communication-filters">
          <button
            type="button"
            className={groupFilter === "active" ? "active" : ""}
            onClick={() => setGroupFilter("active")}
          >
            Active <span>{groups.length}</span>
          </button>
          <button
            type="button"
            className={groupFilter === "archived" ? "active" : ""}
            onClick={() => setGroupFilter("archived")}
          >
            Archived <span>{archivedGroups.length}</span>
          </button>
          <button
            type="button"
            className={groupFilter === "all" ? "active" : ""}
            onClick={() => setGroupFilter("all")}
          >
            All <span>{allGroups.length}</span>
          </button>
        </div>
        <input
          className="course-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search groups…"
          aria-label="Search communication groups"
        />
      </div>
      {loading ? (
        <div className="catalog-state">
          <span className="spinner spinner-dark" />
          <strong>Loading communication groups…</strong>
          <p>Fetching your active groups from the communication service.</p>
        </div>
      ) : error ? (
        <div className="catalog-state catalog-error">
          <span className="empty-roster-icon">
            <Icon name="alert" size={20} />
          </span>
          <strong>Couldn’t load communication groups</strong>
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : filteredGroups.length ? (
        <>
          <div className="data-table-head communication-table-head" aria-hidden="true">
            <span>Group</span>
            <span>Course / identifier</span>
            <span>Status</span>
          </div>
          <div className="communication-group-grid">
            {filteredGroups.map((group) => (
              <article
                className={`communication-group-card ${group.status === "ARCHIVED" ? "is-archived" : ""}`}
                key={group.id}
                role="button"
                tabIndex={0}
                onClick={() => void openGroup(group)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void openGroup(group);
                  }
                }}
              >
                <div className="communication-group-icon">
                  <Icon name="users" size={21} />
                </div>
                <div className="communication-group-copy">
                  <div className="communication-group-top">
                    <h3>{group.name}</h3>
                    <span>{group.status || "ACTIVE"}</span>
                  </div>
                  <p>{group.description || "No group description provided."}</p>
                  <div className="communication-group-meta">
                    <span>
                      <Icon name="book" size={13} />
                      {courseName(group.courseId)}
                    </span>
                    <span>ID {group.id.slice(0, 8)}</span>
                  </div>
                </div>
                <Icon name="chevron" size={18} />
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
            {visibleGroups.length
              ? "No matching groups"
              : groupFilter === "archived"
                ? "No archived groups"
                : "No communication groups yet"}
          </strong>
          <p>
            {visibleGroups.length
              ? "Try another search term."
              : "Create a group for a course to start communicating with students and teachers."}
          </p>
          {groupFilter !== "archived" && !allGroups.length && (
            <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
              <Icon name="plus" size={15} /> Create the first group
            </button>
          )}
        </div>
      )}

      {showCreate && (
        <div
          className="modal-backdrop communication-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <section
            className="detail-modal communication-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-group-title"
          >
            <div className="detail-modal-heading">
              <div>
                <span className="catalog-kicker">NEW COMMUNICATION GROUP</span>
                <h2 id="create-group-title">Create a group</h2>
                <p>Each course can have one active communication group.</p>
              </div>
              <button
                className="notice-dismiss"
                type="button"
                onClick={() => setShowCreate(false)}
                aria-label="Close create group form"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <form className="detail-modal-body communication-form" onSubmit={submitCreate}>
              {formError && (
                <div className="modal-error" role="alert">
                  <Icon name="alert" size={16} />
                  <span>{formError}</span>
                </div>
              )}
              <label className="field">
                <span className="field-label">
                  Course<span className="required"> *</span>
                </span>
                <select
                  required
                  value={draft.courseId}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, courseId: event.target.value }))
                  }
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                      disabled={existingCourseIds.has(course.id)}
                    >
                      {course.courseName}
                      {existingCourseIds.has(course.id) ? " · group exists" : ""}
                    </option>
                  ))}
                </select>
                <span className="field-hint">
                  The backend automatically adds the assigned teacher and currently enrolled
                  students.
                </span>
              </label>
              <label className="field">
                <span className="field-label">
                  Group name<span className="required"> *</span>
                </span>
                <input
                  required
                  maxLength={150}
                  value={draft.name}
                  placeholder="e.g. Grade 10 Mathematics Community"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span className="field-label">Description</span>
                <textarea
                  rows={4}
                  value={draft.description}
                  placeholder="Explain what this group is used for…"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>
              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving || !courses.some((course) => !existingCourseIds.has(course.id))}
                >
                  {saving ? (
                    <>
                      <span className="spinner" /> Creating…
                    </>
                  ) : (
                    <>
                      Create group <Icon name="arrow" size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedGroup && (
        <div
          className="modal-backdrop detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedGroup(null);
          }}
        >
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-detail-title"
          >
            <div className="detail-modal-heading">
              <div>
                <span className="catalog-kicker">GROUP DETAILS</span>
                <h2 id="group-detail-title">{selectedGroup.name}</h2>
                <p>
                  {courseName(selectedGroup.courseId)} · {selectedGroup.status || "ACTIVE"}
                </p>
              </div>
              <button
                className="notice-dismiss"
                type="button"
                onClick={() => setSelectedGroup(null)}
                aria-label="Close group details"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="detail-modal-body communication-detail-body">
              {formError && (
                <div className="modal-error" role="alert">
                  <Icon name="alert" size={16} />
                  <span>{formError}</span>
                </div>
              )}
              <p className="detail-description">
                {selectedGroup.description || "No group description provided."}
              </p>
              <div className="detail-stat-grid">
                <div>
                  <small>Course</small>
                  <strong>{courseName(selectedGroup.courseId)}</strong>
                </div>
                <div>
                  <small>Status</small>
                  <strong>{selectedGroup.status || "ACTIVE"}</strong>
                </div>
                <div>
                  <small>Members</small>
                  <strong>{memberLoading ? "…" : members.length}</strong>
                </div>
              </div>
              <div className="communication-members-heading">
                <div>
                  <h3>Group members</h3>
                  <p>Students and teachers currently connected to this group.</p>
                </div>
              </div>
              {memberLoading ? (
                <div className="catalog-state compact-state">
                  <span className="spinner spinner-dark" />
                  <strong>Loading members…</strong>
                </div>
              ) : (
                <div className="communication-member-list">
                  {members.length ? (
                    members.map((member) => (
                      <div className="communication-member" key={`${member.userId}-${member.role}`}>
                        <span className="directory-avatar">
                          {studentName(member.userId).trim().charAt(0).toUpperCase()}
                        </span>
                        <span>
                          <strong>{studentName(member.userId)}</strong>
                          <small>
                            {member.role || "MEMBER"} · Joined{" "}
                            {member.joinedAt
                              ? new Date(member.joinedAt).toLocaleDateString()
                              : "recently"}
                          </small>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="catalog-state compact-state">
                      <strong>No members returned</strong>
                      <p>Members may not be available yet.</p>
                    </div>
                  )}
                </div>
              )}
              <div className="communication-member-actions">
                {selectedGroup.status !== "ARCHIVED" && (
                  <>
                    <label className="field">
                      <span className="field-label">Add a student</span>
                      <select
                        value={selectedStudentId}
                        onChange={(event) => setSelectedStudentId(event.target.value)}
                      >
                        <option value="">Select student</option>
                        {students
                          .filter(
                            (student) => !members.some((member) => member.userId === student.id),
                          )
                          .map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.name} · Grade {student.grade || "—"}
                            </option>
                          ))}
                      </select>
                    </label>
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={!selectedStudentId || saving}
                      onClick={() => void addStudent()}
                    >
                      {saving ? (
                        "Adding…"
                      ) : (
                        <>
                          <Icon name="plus" size={15} /> Add student
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
              <div className="communication-detail-footer">
                {selectedGroup.status === "ARCHIVED" ? (
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={saving}
                    onClick={() => void unarchiveGroup()}
                  >
                    <Icon name="check" size={15} /> Unarchive group
                  </button>
                ) : (
                  <button
                    className="secondary-button danger-action"
                    type="button"
                    disabled={saving}
                    onClick={() => void archiveGroup()}
                  >
                    <Icon name="close" size={15} /> Archive group
                  </button>
                )}
                <span>Group ID: {selectedGroup.id}</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
