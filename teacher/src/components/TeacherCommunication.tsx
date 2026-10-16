"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  teacherApi,
  type CommunicationGroup,
  type CommunicationMessage,
  type GroupMember,
  type TeacherCourse,
} from "../lib/teacherApi";

export default function TeacherCommunication({
  courses,
  currentUserId,
}: {
  courses: TeacherCourse[];
  currentUserId?: string;
}) {
  const [groups, setGroups] = useState<CommunicationGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CommunicationGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupCourseId, setGroupCourseId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [groupSearch, setGroupSearch] = useState("");

  const courseName = useMemo(
    () => (courseId: string) =>
      courses.find((course) => course.id === courseId)?.courseName ||
      `Course ${courseId.slice(0, 8)}`,
    [courses],
  );
  const availableCourses = useMemo(
    () => courses.filter((course) => !groups.some((group) => group.courseId === course.id)),
    [courses, groups],
  );
  const filteredGroups = useMemo(() => {
    const query = groupSearch.trim().toLowerCase();
    return groups.filter(
      (group) =>
        !query || `${group.name} ${courseName(group.courseId)}`.toLowerCase().includes(query),
    );
  }, [courseName, groupSearch, groups]);

  async function loadGroups(selectFirst = true) {
    setLoading(true);
    setError("");
    try {
      const nextGroups = await teacherApi.groups();
      setGroups(nextGroups);
      if (selectFirst && nextGroups[0]) await openGroup(nextGroups[0]);
      if (!nextGroups.length) {
        setSelectedGroup(null);
        setMembers([]);
        setMessages([]);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load communication groups.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function openGroup(group: CommunicationGroup) {
    setSelectedGroup(group);
    setDetailLoading(true);
    setError("");
    try {
      const [nextMembers, history] = await Promise.all([
        teacherApi.groupMembers(group.id),
        teacherApi.messages(group.id),
      ]);
      setMembers(nextMembers);
      setMessages(history.content || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this group.");
    } finally {
      setDetailLoading(false);
    }
  }

  // Load the current user's groups after the client session is available.
  useEffect(() => {
    // The loader updates the request state after the client session is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadGroups();
    // The loader is intentionally run once when the client session is available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    if (!groupCourseId || !groupName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const created = await teacherApi.createGroup({
        courseId: groupCourseId,
        name: groupName.trim(),
        description: groupDescription.trim(),
      });
      setGroups((current) => [...current, created]);
      setShowCreate(false);
      setGroupName("");
      setGroupDescription("");
      setGroupCourseId("");
      await openGroup(created);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not create the communication group.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!selectedGroup || !message.trim()) return;
    setSaving(true);
    setError("");
    try {
      const sent = await teacherApi.sendMessage(selectedGroup.id, message.trim());
      setMessages((current) => [...current, sent]);
      setMessage("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send the message.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="teacher-communication">
      <div className="teacher-communication-header">
        <div>
          <span className="teacher-kicker">MESSAGES</span>
          <h2>Course communication</h2>
          <p>Stay connected with your students and course community.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          disabled={!availableCourses.length}
        >
          ＋ New group
        </button>
      </div>
      {error && <div className="teacher-inline-error">{error}</div>}
      <div className="teacher-communication-grid">
        <aside className="teacher-group-list">
          <div className="teacher-group-list-heading">
            <strong>Chats</strong>
            <span>{groups.length}</span>
          </div>
          <label className="teacher-chat-search">
            <span>⌕</span>
            <input
              value={groupSearch}
              onChange={(event) => setGroupSearch(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
            />
          </label>
          {loading ? (
            <div className="teacher-state">Loading groups…</div>
          ) : filteredGroups.length ? (
            filteredGroups.map((group) => (
              <button
                type="button"
                key={group.id}
                className={selectedGroup?.id === group.id ? "active" : ""}
                onClick={() => void openGroup(group)}
              >
                <span className="teacher-group-avatar">{group.name.charAt(0).toUpperCase()}</span>
                <span>
                  <strong>{group.name}</strong>
                  <small>{courseName(group.courseId)}</small>
                </span>
                <em>{group.status === "ACTIVE" ? "●" : "○"}</em>
              </button>
            ))
          ) : (
            <div className="teacher-empty">
              <strong>{groups.length ? "No matching chats" : "No communication groups"}</strong>
              <p>
                {groups.length
                  ? "Try another search."
                  : "Create a group for one of your courses to start communicating."}
              </p>
            </div>
          )}
        </aside>
        <section className="teacher-chat-panel">
          {selectedGroup ? (
            <>
              <div className="teacher-chat-heading">
                <div className="teacher-chat-identity">
                  <span className="teacher-group-avatar large">
                    {selectedGroup.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h3>{selectedGroup.name}</h3>
                    <p>
                      {members.length} member{members.length === 1 ? "" : "s"} ·{" "}
                      {courseName(selectedGroup.courseId)}
                    </p>
                  </div>
                </div>
                <div className="teacher-chat-actions">
                  <button type="button" aria-label="View group members">
                    ♙
                  </button>
                  <button type="button" aria-label="More group options">
                    ⋮
                  </button>
                </div>
              </div>
              {detailLoading ? (
                <div className="teacher-state">Loading conversation…</div>
              ) : (
                <>
                  <div className="teacher-chat-messages">
                    {messages.length ? (
                      messages.map((item) => (
                        <article
                          key={item.id}
                          className={`teacher-chat-message ${item.senderId === currentUserId ? "mine" : ""}`}
                        >
                          <strong>
                            {item.senderId === currentUserId ? "You" : "Course member"}
                          </strong>
                          <p>{item.deletedForEveryone ? "Message deleted" : item.content}</p>
                          <small>
                            {item.sentAt
                              ? new Date(item.sentAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Now"}
                          </small>
                        </article>
                      ))
                    ) : (
                      <div className="teacher-empty">
                        <strong>No messages yet</strong>
                        <p>Send the first message to this course group.</p>
                      </div>
                    )}
                  </div>
                  <form className="teacher-message-form" onSubmit={sendMessage}>
                    <button
                      type="button"
                      className="teacher-attach-button"
                      aria-label="Add attachment"
                    >
                      ＋
                    </button>
                    <textarea
                      required
                      maxLength={5000}
                      rows={1}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Type a message"
                    />
                    <button
                      className="teacher-send-button"
                      type="submit"
                      disabled={saving || !message.trim()}
                      aria-label="Send message"
                    >
                      ➤
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <div className="teacher-empty teacher-empty-large">
              <strong>Select a conversation</strong>
              <p>Your course conversations will appear here.</p>
            </div>
          )}
        </section>
      </div>
      {showCreate && (
        <div className="teacher-create-overlay">
          <form className="teacher-create-card" onSubmit={createGroup}>
            <h3>Create communication group</h3>
            <p>Only assigned courses can be used to create a teacher group.</p>
            <label>
              Course
              <select
                required
                value={groupCourseId}
                onChange={(event) => setGroupCourseId(event.target.value)}
              >
                <option value="">Select course</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Group name
              <input
                required
                maxLength={150}
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="e.g. Grade 10 Mathematics"
              />
            </label>
            <label>
              Description
              <textarea
                rows={3}
                value={groupDescription}
                onChange={(event) => setGroupDescription(event.target.value)}
              />
            </label>
            <div>
              <button
                type="button"
                className="teacher-cancel-button"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create group"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
