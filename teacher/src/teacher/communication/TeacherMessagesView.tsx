"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BellRing, CheckCheck, Plus, Search, Send, UserPlus, Users } from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import type { Student } from "../types";
import { useCommunicationRealtime } from "../api/communicationRealtime";
import {
  archiveCommunicationGroup,
  addStudentToCommunicationGroup,
  createCommunicationGroup,
  deleteCommunicationMessage,
  getCommunicationGroupMembers,
  getCommunicationGroups,
  getCommunicationMessages,
  sendCommunicationMessage,
  unarchiveCommunicationGroup,
  updateCommunicationMessage,
  type CommunicationGroup,
  type CommunicationGroupMember,
  type CommunicationMessage,
} from "../api/communicationApi";

interface TeacherMessagesViewProps {
  backendCourses: BackendCourse[];
  students?: Student[];
  teacherId?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function shortId(value: string) {
  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

function formatTime(value?: string) {
  return value ? new Date(value).toLocaleString() : "No messages";
}

export const TeacherMessagesView: React.FC<TeacherMessagesViewProps> = ({
  backendCourses,
  students = [],
  teacherId,
}) => {
  const [groups, setGroups] = useState<CommunicationGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [messagesByGroup, setMessagesByGroup] = useState<Record<string, CommunicationMessage[]>>(
    {},
  );
  const [membersByGroup, setMembersByGroup] = useState<Record<string, CommunicationGroupMember[]>>(
    {},
  );
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"direct" | "announcements">("direct");
  const [search, setSearch] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementTarget, setAnnouncementTarget] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [createCourseId, setCreateCourseId] = useState(backendCourses[0]?.id ?? "");
  const [createGroupName, setCreateGroupName] = useState("");
  const [createGroupDescription, setCreateGroupDescription] = useState("");
  const [studentToAdd, setStudentToAdd] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeGroup = groups.find((group) => group.id === selectedGroupId) ?? null;
  const activeMessages = messagesByGroup[selectedGroupId] ?? [];
  const visibleGroups = useMemo(
    () => groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search],
  );
  const realtime = useCommunicationRealtime(
    groups.map((group) => group.id),
    (message) => {
      setMessagesByGroup((current) => {
        const existing = current[message.groupId] ?? [];
        if (existing.some((item) => item.id === message.id)) return current;
        return { ...current, [message.groupId]: [...existing, message] };
      });
    },
  );

  useEffect(() => {
    setCreateCourseId((current) =>
      backendCourses.some((course) => course.id === current)
        ? current
        : (backendCourses[0]?.id ?? ""),
    );
  }, [backendCourses]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    getCommunicationGroups(controller.signal)
      .then((loadedGroups) => {
        if (controller.signal.aborted) return;
        setGroups(loadedGroups);
        setSelectedGroupId((current) =>
          loadedGroups.some((group) => group.id === current)
            ? current
            : (loadedGroups[0]?.id ?? ""),
        );
        setAnnouncementTarget((current) => current || loadedGroups[0]?.courseId || "");
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Communication groups failed to load.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;
    const controller = new AbortController();
    setIsMessageLoading(true);
    setActionError(null);
    Promise.all([
      getCommunicationMessages(selectedGroupId, 0, 30, controller.signal),
      getCommunicationGroupMembers(selectedGroupId, controller.signal),
    ])
      .then(([messagePage, members]) => {
        if (controller.signal.aborted) return;
        setMessagesByGroup((current) => {
          const realtimeMessages = current[selectedGroupId] ?? [];
          const historyIds = new Set(messagePage.content.map((message) => message.id));
          return {
            ...current,
            [selectedGroupId]: [
              ...messagePage.content,
              ...realtimeMessages.filter((message) => !historyIds.has(message.id)),
            ],
          };
        });
        setMembersByGroup((current) => ({ ...current, [selectedGroupId]: members }));
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setActionError(
            requestError instanceof Error ? requestError.message : "Messages failed to load.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsMessageLoading(false);
      });
    return () => controller.abort();
  }, [selectedGroupId]);

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!activeGroup || !inputText.trim()) return;
    setIsSending(true);
    setActionError(null);
    try {
      const content = inputText.trim();
      if (!realtime.sendMessage(activeGroup.id, content)) {
        const message = await sendCommunicationMessage(activeGroup.id, content);
        if (!message) throw new Error("Your message could not be sent.");
        setMessagesByGroup((current) => ({
          ...current,
          [activeGroup.id]: [...(current[activeGroup.id] ?? []), message],
        }));
      }
      setInputText("");
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Message could not be sent.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleEditMessage(message: CommunicationMessage) {
    const content = window.prompt("Edit message", message.content)?.trim();
    if (!activeGroup || !content || content === message.content) return;
    try {
      const updated = await updateCommunicationMessage(activeGroup.id, message.id, content);
      if (!updated) throw new Error("Your message could not be updated.");
      setMessagesByGroup((current) => ({
        ...current,
        [activeGroup.id]: current[activeGroup.id].map((item) =>
          item.id === updated.id ? updated : item,
        ),
      }));
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Message could not be updated.",
      );
    }
  }

  async function handleDeleteMessage(message: CommunicationMessage) {
    if (!activeGroup || !window.confirm("Delete this message for everyone?")) return;
    try {
      await deleteCommunicationMessage(activeGroup.id, message.id, "EVERYONE");
      setMessagesByGroup((current) => ({
        ...current,
        [activeGroup.id]: current[activeGroup.id].map((item) =>
          item.id === message.id ? { ...item, deletedForEveryone: true, content: "" } : item,
        ),
      }));
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Message could not be deleted.",
      );
    }
  }

  async function handleCreateGroup() {
    const course = backendCourses.find((item) => item.id === createCourseId) ?? backendCourses[0];
    if (!course) {
      setActionError("No courses are available to create a communication group.");
      return;
    }
    const name = createGroupName.trim() || `${course.courseName} Discussion`;
    try {
      const created = await createCommunicationGroup({
        courseId: course.id,
        name,
        description: createGroupDescription.trim() || undefined,
      });
      if (!created) throw new Error("The new group could not be created.");
      setGroups((current) => [created, ...current]);
      setSelectedGroupId(created.id);
      setCreateGroupName("");
      setCreateGroupDescription("");
      setIsCreateGroupOpen(false);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Group could not be created.",
      );
    }
  }

  async function handleAddStudent() {
    if (!activeGroup || !studentToAdd) return;
    setIsAddingStudent(true);
    setActionError(null);
    try {
      const member = await addStudentToCommunicationGroup(activeGroup.id, studentToAdd);
      if (member) {
        setMembersByGroup((current) => ({
          ...current,
          [activeGroup.id]: [...(current[activeGroup.id] ?? []), member],
        }));
      }
      setStudentToAdd("");
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Student could not be added.",
      );
    } finally {
      setIsAddingStudent(false);
    }
  }

  async function handleArchiveToggle() {
    if (!activeGroup) return;
    try {
      const updated =
        activeGroup.status === "ARCHIVED"
          ? await unarchiveCommunicationGroup(activeGroup.id)
          : await archiveCommunicationGroup(activeGroup.id);
      if (updated) {
        setGroups((current) => current.map((group) => (group.id === updated.id ? updated : group)));
      }
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Group status could not be updated.",
      );
    }
  }

  async function handlePublishAnnouncement(event: React.FormEvent) {
    event.preventDefault();
    const group = groups.find((item) => item.courseId === announcementTarget);
    if (!group || !announcementText.trim()) {
      setActionError("Select a course with an available communication group.");
      return;
    }
    try {
      const content = announcementText.trim();
      if (!realtime.sendMessage(group.id, content)) {
        const message = await sendCommunicationMessage(group.id, content);
        if (!message)
          throw new Error("The announcement could not be sent.");
        setMessagesByGroup((current) => ({
          ...current,
          [group.id]: [...(current[group.id] ?? []), message],
        }));
      }
      setAnnouncementSuccess(true);
      setAnnouncementText("");
      setTimeout(() => setAnnouncementSuccess(false), 2200);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Announcement could not be sent.",
      );
    }
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs -m-4 lg:-m-6">
      <div className="h-14 bg-slate-50 border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab("direct")}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${activeTab === "direct" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Direct &amp; Group Messages
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${activeTab === "announcements" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Course Broadcast Announcements
            </button>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Mentify Messaging · Secure
        </span>
      </div>

      {(error || actionError || realtime.error) && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
          {error || actionError || realtime.error}
        </div>
      )}

      {activeTab === "direct" ? (
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/40">
            <div className="p-3 border-b border-slate-200 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                aria-label="Create group"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {isCreateGroupOpen && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleCreateGroup();
                }}
                className="border-b border-slate-200 bg-white p-3 space-y-2"
              >
                <select
                  value={createCourseId}
                  onChange={(event) => setCreateCourseId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                >
                  <option value="">Select course</option>
                  {backendCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.subject || course.courseName}
                    </option>
                  ))}
                </select>
                <input
                  value={createGroupName}
                  onChange={(event) => setCreateGroupName(event.target.value)}
                  placeholder="Group name"
                  maxLength={150}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                />
                <input
                  value={createGroupDescription}
                  onChange={(event) => setCreateGroupDescription(event.target.value)}
                  placeholder="Description (optional)"
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateGroupOpen(false)}
                    className="text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {isLoading ? (
                <p className="p-6 text-center text-xs text-slate-500">Loading groups...</p>
              ) : visibleGroups.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">
                  No communication groups available.
                </p>
              ) : (
                visibleGroups.map((group) => {
                  const messages = messagesByGroup[group.id] ?? [];
                  const last = messages[messages.length - 1];
                  const selected = group.id === selectedGroupId;
                  return (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${selected ? "bg-indigo-50/70 border-l-4 border-indigo-600" : "hover:bg-slate-50"}`}
                    >
                      <div className="w-9 h-9 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0 bg-indigo-600">
                        {initials(group.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {group.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatTime(last?.sentAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {last?.content || group.description || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden bg-white">
            {activeGroup ? (
              <>
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center bg-indigo-600">
                      {initials(activeGroup.name)}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {activeGroup.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        <Users className="mr-1 inline h-3 w-3" />
                        {membersByGroup[activeGroup.id]?.length ?? 0} members · {activeGroup.status}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => void handleArchiveToggle()}
                    className="text-xs text-slate-500 hover:text-indigo-600"
                  >
                    {activeGroup.status === "ARCHIVED" ? "Unarchive" : "Archive"}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {isMessageLoading ? (
                    <p className="text-center text-xs text-slate-500">Loading messages...</p>
                  ) : activeMessages.length === 0 ? (
                    <p className="text-center text-xs text-slate-400">
                      No messages in this group yet.
                    </p>
                  ) : (
                    activeMessages.map((message) => {
                      const isMe = Boolean(teacherId && message.senderId === teacherId);
                      return (
                        <div
                          key={message.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-1 px-1">
                            {isMe ? "You" : `User ${shortId(message.senderId)}`} ·{" "}
                            {formatTime(message.sentAt)}
                            {message.edited ? " · edited" : ""}
                          </span>
                          <div
                            className={`max-w-lg p-3 rounded-xl text-xs leading-relaxed ${isMe ? "bg-indigo-600 text-white rounded-br-none shadow-xs" : "bg-slate-100 text-slate-900 rounded-bl-none"}`}
                          >
                            {message.deletedForEveryone ? "Message deleted" : message.content}
                          </div>
                          {isMe && !message.deletedForEveryone && (
                            <div className="mt-1 flex gap-2">
                              <button
                                onClick={() => void handleEditMessage(message)}
                                className="text-[10px] text-slate-400 hover:text-indigo-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => void handleDeleteMessage(message)}
                                className="text-[10px] text-slate-400 hover:text-rose-600"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                {activeGroup.status !== "ARCHIVED" && students.length > 0 && (
                  <div className="border-t border-slate-100 px-3 py-2 flex items-center gap-2">
                    <UserPlus className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={studentToAdd}
                      onChange={(event) => setStudentToAdd(event.target.value)}
                      className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1 text-[11px]"
                    >
                      <option value="">Add enrolled student...</option>
                      {students
                        .filter(
                          (student) =>
                            !membersByGroup[activeGroup.id]?.some(
                              (member) => member.userId === student.id,
                            ),
                        )
                        .map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name} ({student.email})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void handleAddStudent()}
                      disabled={!studentToAdd || isAddingStudent}
                      className="rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                )}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <input
                    disabled={activeGroup.status === "ARCHIVED" || isSending}
                    type="text"
                    placeholder="Type your message to student or course group..."
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    disabled={activeGroup.status === "ARCHIVED" || isSending}
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <p className="m-auto text-xs text-slate-400">
                Select a communication group to begin.
              </p>
            )}
          </main>
        </div>
      ) : (
        <div className="p-8 max-w-3xl mx-auto space-y-6 flex-1 overflow-y-auto">
          <div>
            <h2 className="text-base font-bold text-slate-900">Send Course Broadcast</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Announcements are sent as messages to the selected course communication group.
            </p>
          </div>
          {announcementSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Announcement published to the course group!</span>
            </div>
          )}
          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Course
              </label>
              <select
                value={announcementTarget}
                onChange={(event) => setAnnouncementTarget(event.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              >
                {backendCourses.length === 0 ? (
                  <option value="">No courses available</option>
                ) : (
                  backendCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.subject || course.courseName}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Content
              </label>
              <textarea
                rows={5}
                value={announcementText}
                onChange={(event) => setAnnouncementText(event.target.value)}
                placeholder="Write your announcement regarding schedule adjustments, midterm preparations, or office hour updates..."
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Publish Course Announcement</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
