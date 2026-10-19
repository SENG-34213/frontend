"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BellRing, CheckCheck, Plus, Search, Send, Users } from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import {
  archiveCommunicationGroup,
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
        setMessagesByGroup((current) => ({
          ...current,
          [selectedGroupId]: messagePage.content,
        }));
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
      const message = await sendCommunicationMessage(activeGroup.id, inputText.trim());
      if (!message) throw new Error("The messaging service did not return the sent message.");
      setMessagesByGroup((current) => ({
        ...current,
        [activeGroup.id]: [...(current[activeGroup.id] ?? []), message],
      }));
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
      if (!updated) throw new Error("The messaging service did not return the updated message.");
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
    const course = backendCourses[0];
    if (!course) {
      setActionError("No courses are available to create a communication group.");
      return;
    }
    const name = window.prompt("Group name", `${course.courseName} Discussion`)?.trim();
    if (!name) return;
    try {
      const created = await createCommunicationGroup({ courseId: course.id, name });
      if (!created) throw new Error("The communication service did not return the new group.");
      setGroups((current) => [created, ...current]);
      setSelectedGroupId(created.id);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Group could not be created.",
      );
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
      const message = await sendCommunicationMessage(group.id, announcementText.trim());
      if (!message) throw new Error("The announcement was not returned by the messaging service.");
      setMessagesByGroup((current) => ({
        ...current,
        [group.id]: [...(current[group.id] ?? []), message],
      }));
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
          Mentify Messaging Service · TLS Encrypted
        </span>
      </div>

      {(error || actionError) && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
          {error || actionError}
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
                onClick={() => void handleCreateGroup()}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                aria-label="Create group"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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
