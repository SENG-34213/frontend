"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, FileText, Plus, Search, Send, Settings, Users, X } from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import type { Student } from "../types";
import { useCommunicationRealtime } from "../api/communicationRealtime";
import {
  archiveCommunicationGroup,
  createCommunicationGroup,
  deleteCommunicationMessage,
  getCommunicationGroupMembers,
  getCommunicationGroups,
  getCommunicationMessages,
  getCommunicationAttachmentDownload,
  sendCommunicationMessage,
  uploadCommunicationAttachment,
  unarchiveCommunicationGroup,
  updateCommunicationGroup,
  updateCommunicationMessage,
  type CommunicationAttachment,
  type CommunicationGroup,
  type CommunicationGroupMember,
  type CommunicationMessage,
} from "../api/communicationApi";
import { CommunicationAttachmentPicker } from "../components/CommunicationAttachmentPicker";
import { ConfirmModal, TextInputModal } from "../components/ActionModal";

interface TeacherMessagesViewProps {
  backendCourses: BackendCourse[];
  students?: Student[];
  teacherId?: string;
  teacherName?: string;
  teacherProfileId?: string;
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

function formatTime(value?: string) {
  return value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
    : "No messages";
}

function mergeMessages(...messageLists: CommunicationMessage[][]) {
  const unique = new Map<string, CommunicationMessage>();
  messageLists.flat().forEach((message) => {
    const existing = unique.get(message.id);
    unique.set(
      message.id,
      existing
        ? {
            ...existing,
            ...message,
            // Realtime events can omit attachments. Keep the complete
            // attachment list returned by the REST response.
            attachments: message.attachments?.length
              ? message.attachments
              : (existing.attachments ?? []),
          }
        : message,
    );
  });
  return Array.from(unique.values()).sort(
    (left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime(),
  );
}

const ChatAttachmentPreview: React.FC<{
  groupId: string;
  messageId: string;
  attachment: CommunicationAttachment;
  onOpen: () => void;
}> = ({ groupId, messageId, attachment, onOpen }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setUrl(null);
    setError(false);
    getCommunicationAttachmentDownload(groupId, messageId, attachment.id)
      .then((download) => {
        if (!controller.signal.aborted) setUrl(download?.downloadUrl || null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [attachment.id, groupId, messageId]);

  if (error) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-2 rounded-lg bg-black/10 px-2.5 py-2 text-left text-[11px] hover:bg-black/20"
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{attachment.originalFilename}</span>
        <Eye className="h-3.5 w-3.5 shrink-0" />
      </button>
    );
  }

  if (!url) {
    return (
      <div className="rounded-lg bg-black/10 px-2.5 py-2 text-[11px] opacity-75">
        Loading preview for {attachment.originalFilename}...
      </div>
    );
  }

  if (attachment.contentType.startsWith("image/")) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="block max-w-full overflow-hidden rounded-lg"
      >
        <img
          src={url}
          alt={attachment.originalFilename}
          className="max-h-56 max-w-full rounded-lg object-contain"
        />
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex w-full items-center gap-2 rounded-lg bg-black/10 px-2.5 py-2 text-left text-[11px] hover:bg-black/20"
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{attachment.originalFilename}</span>
      <span className="shrink-0 opacity-75">{Math.ceil(attachment.fileSize / 1024)} KB</span>
      <Eye className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
};

export const TeacherMessagesView: React.FC<TeacherMessagesViewProps> = ({
  backendCourses,
  students = [],
  teacherId,
  teacherName = "Teacher",
  teacherProfileId,
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
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [createCourseId, setCreateCourseId] = useState(backendCourses[0]?.id ?? "");
  const [createGroupName, setCreateGroupName] = useState("");
  const [createGroupDescription, setCreateGroupDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<CommunicationMessage | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<CommunicationMessage | null>(null);
  const [preview, setPreview] = useState<{
    attachment: CommunicationAttachment;
    url: string;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [groupSettingsName, setGroupSettingsName] = useState("");
  const [groupSettingsDescription, setGroupSettingsDescription] = useState("");
  const [isGroupSettingsSaving, setIsGroupSettingsSaving] = useState(false);

  const activeGroup = groups.find((group) => group.id === selectedGroupId) ?? null;
  const activeMessages = messagesByGroup[selectedGroupId] ?? [];
  const availableCourses = useMemo(() => {
    const teacherIds = new Set([teacherId, teacherProfileId].filter(Boolean));
    // The course list is already loaded from /course/my-courses, but keep an
    // explicit ownership check here as a second guard. Never fall back to all
    // courses when an assignment is missing; that could expose another
    // teacher's course in group creation or announcements.
    return backendCourses.filter(
      (course) => Boolean(course.assignedTeacherId) && teacherIds.has(course.assignedTeacherId),
    );
  }, [backendCourses, teacherId, teacherProfileId]);
  const visibleGroups = useMemo(
    () => groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search],
  );
  const realtime = useCommunicationRealtime(
    groups.map((group) => group.id),
    (message) => {
      setMessagesByGroup((current) => {
        const existing = current[message.groupId] ?? [];
        const merged = mergeMessages(existing, [message]);
        if (merged.length === existing.length) return current;
        return { ...current, [message.groupId]: merged };
      });
    },
  );

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList || isMessageLoading) return;
    const frame = window.requestAnimationFrame(() => {
      messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedGroupId, activeMessages.length, isMessageLoading]);

  useEffect(() => {
    setCreateCourseId((current) =>
      availableCourses.some((course) => course.id === current)
        ? current
        : (availableCourses[0]?.id ?? ""),
    );
  }, [availableCourses]);

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
          return {
            ...current,
            [selectedGroupId]: mergeMessages(messagePage.content, realtimeMessages),
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
    if (!activeGroup || (!inputText.trim() && pendingAttachments.length === 0)) return;
    setIsSending(true);
    setActionError(null);
    try {
      const content = inputText.trim();
      const attachmentIds: string[] = [];
      for (let index = 0; index < pendingAttachments.length; index += 1) {
        setUploadStatus(`Uploading attachment ${index + 1} of ${pendingAttachments.length}...`);
        const attachment = await uploadCommunicationAttachment(
          activeGroup.id,
          pendingAttachments[index],
        );
        if (!attachment) throw new Error("An attachment could not be uploaded.");
        attachmentIds.push(attachment.id);
      }

      if (attachmentIds.length > 0 || !realtime.sendMessage(activeGroup.id, content)) {
        const message = await sendCommunicationMessage(activeGroup.id, content, attachmentIds);
        if (!message) throw new Error("Your message could not be sent.");
        setMessagesByGroup((current) => ({
          ...current,
          [activeGroup.id]: mergeMessages(current[activeGroup.id] ?? [], [message]),
        }));
      }
      setInputText("");
      setPendingAttachments([]);
      setUploadStatus(null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Message could not be sent.",
      );
      setUploadStatus(null);
    } finally {
      setIsSending(false);
    }
  }

  async function previewAttachment(
    message: CommunicationMessage,
    attachment: CommunicationAttachment,
  ) {
    if (!activeGroup) return;
    setIsPreviewLoading(true);
    setActionError(null);
    try {
      const download = await getCommunicationAttachmentDownload(
        activeGroup.id,
        message.id,
        attachment.id,
      );
      if (!download?.downloadUrl) throw new Error("The attachment could not be previewed.");
      setPreview({ attachment, url: download.downloadUrl });
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Attachment could not be previewed.",
      );
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleEditMessage(content: string) {
    const message = editingMessage;
    if (!activeGroup || !message || !content || content === message.content) {
      setEditingMessage(null);
      return;
    }
    try {
      const updated = await updateCommunicationMessage(activeGroup.id, message.id, content);
      if (!updated) throw new Error("Your message could not be updated.");
      setMessagesByGroup((current) => ({
        ...current,
        [activeGroup.id]: current[activeGroup.id].map((item) =>
          item.id === updated.id ? updated : item,
        ),
      }));
      setEditingMessage(null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Message could not be updated.",
      );
    }
  }

  async function handleDeleteMessage() {
    const message = deletingMessage;
    if (!activeGroup || !message) return;
    try {
      await deleteCommunicationMessage(activeGroup.id, message.id, "EVERYONE");
      setMessagesByGroup((current) => ({
        ...current,
        [activeGroup.id]: current[activeGroup.id].map((item) =>
          item.id === message.id ? { ...item, deletedForEveryone: true, content: "" } : item,
        ),
      }));
      setDeletingMessage(null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Message could not be deleted.",
      );
    }
  }

  function memberName(member: CommunicationGroupMember) {
    if (member.userId === teacherId) return teacherName;
    return students.find((item) => item.id === member.userId)?.name || "Group member";
  }

  function messageSenderName(message: CommunicationMessage) {
    if (teacherId && message.senderId === teacherId) return "You";
    if (message.senderName?.trim()) return message.senderName;
    return students.find((student) => student.id === message.senderId)?.name || "Group member";
  }

  function openGroupSettings() {
    if (!activeGroup) return;
    setShowMembers(false);
    setGroupSettingsName(activeGroup.name);
    setGroupSettingsDescription(activeGroup.description ?? "");
    setShowGroupSettings((value) => !value);
  }

  async function saveGroupSettings() {
    if (!activeGroup || !groupSettingsName.trim()) return;
    setIsGroupSettingsSaving(true);
    try {
      const updated = await updateCommunicationGroup(activeGroup.id, {
        name: groupSettingsName.trim(),
        description: groupSettingsDescription.trim() || undefined,
        studentMessagingEnabled: activeGroup.studentMessagingEnabled !== false,
      });
      if (!updated) throw new Error("Group settings could not be saved.");
      setGroups((current) => current.map((group) => (group.id === updated.id ? updated : group)));
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Group settings could not be saved.",
      );
    } finally {
      setIsGroupSettingsSaving(false);
    }
  }

  async function toggleStudentMessaging() {
    if (!activeGroup) return;
    setIsGroupSettingsSaving(true);
    try {
      const updated = await updateCommunicationGroup(activeGroup.id, {
        name: activeGroup.name,
        description: activeGroup.description,
        studentMessagingEnabled: activeGroup.studentMessagingEnabled === false,
      });
      if (!updated) throw new Error("Student messaging access could not be updated.");
      setGroups((current) => current.map((group) => (group.id === updated.id ? updated : group)));
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Student messaging access could not be updated.",
      );
    } finally {
      setIsGroupSettingsSaving(false);
    }
  }

  async function toggleGroupArchive() {
    if (!activeGroup) return;
    setIsGroupSettingsSaving(true);
    try {
      const updated =
        activeGroup.status === "ARCHIVED"
          ? await unarchiveCommunicationGroup(activeGroup.id)
          : await archiveCommunicationGroup(activeGroup.id);
      if (updated)
        setGroups((current) => current.map((group) => (group.id === updated.id ? updated : group)));
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Group status could not be updated.",
      );
    } finally {
      setIsGroupSettingsSaving(false);
    }
  }

  async function handleCreateGroup() {
    const course =
      availableCourses.find((item) => item.id === createCourseId) ?? availableCourses[0];
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

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs -m-4 lg:-m-6">
      <div className="h-14 bg-slate-50 border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold text-slate-700">
            Direct &amp; Group Messages
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          TiT Messaging · Secure
        </span>
      </div>

      {(error || actionError || realtime.error) && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
          {error || actionError || realtime.error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
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
                disabled={availableCourses.length === 0}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Create group"
                title={
                  availableCourses.length === 0 ? "No courses assigned to you" : "Create group"
                }
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
                  {availableCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseName}
                      {course.courseCode ? ` · ${course.courseCode}` : ""}
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

          <main
            className={`relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white transition-[padding] duration-200 ${showMembers || showGroupSettings ? "pr-64" : ""}`}
          >
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGroupSettings(false);
                        setShowMembers((value) => !value);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600"
                    >
                      <Users className="h-3.5 w-3.5" />
                      View users
                    </button>
                    <button
                      type="button"
                      onClick={openGroupSettings}
                      className={`inline-flex items-center gap-1 text-xs ${showGroupSettings ? "text-indigo-700" : "text-slate-500 hover:text-indigo-600"}`}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </button>
                  </div>
                </div>
                <div ref={messageListRef} className="flex-1 overflow-y-auto p-6 space-y-4">
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
                          <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                            <span>{isMe ? "You" : messageSenderName(message)}</span>
                            <span>·</span>
                            <span>{formatTime(message.sentAt)}</span>
                            {message.edited && (
                              <>
                                <span>·</span>
                                <span>edited</span>
                              </>
                            )}
                          </div>
                          <div
                            className={`max-w-lg p-3 rounded-xl text-xs leading-relaxed ${isMe ? "bg-indigo-600 text-white rounded-br-none shadow-xs" : "bg-slate-100 text-slate-900 rounded-bl-none"}`}
                          >
                            {message.deletedForEveryone ? "Message deleted" : message.content}
                            {!message.deletedForEveryone && message.attachments?.length > 0 && (
                              <div className="mt-2 space-y-1.5 border-t border-white/20 pt-2">
                                {message.attachments.map((attachment, attachmentIndex) => (
                                  <ChatAttachmentPreview
                                    key={`${message.id}-${attachment.id}-${attachmentIndex}`}
                                    groupId={message.groupId}
                                    messageId={message.id}
                                    attachment={attachment}
                                    onOpen={() => void previewAttachment(message, attachment)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {!message.deletedForEveryone && (
                            <div className="mt-1 flex gap-2">
                              {isMe && (
                                <button
                                  type="button"
                                  onClick={() => setEditingMessage(message)}
                                  className="text-[10px] text-slate-400 hover:text-indigo-600"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setDeletingMessage(message)}
                                className="text-[10px] text-slate-400 hover:text-rose-600"
                              >
                                Delete for everyone
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
                  <CommunicationAttachmentPicker
                    files={pendingAttachments}
                    onChange={setPendingAttachments}
                    disabled={activeGroup.status === "ARCHIVED" || isSending}
                  />
                  <input
                    disabled={activeGroup.status === "ARCHIVED" || isSending}
                    type="text"
                    placeholder="Type your message to student or course group..."
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    disabled={
                      activeGroup.status === "ARCHIVED" ||
                      isSending ||
                      (!inputText.trim() && pendingAttachments.length === 0)
                    }
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
                {uploadStatus && (
                  <div className="border-t border-slate-100 px-3 py-1 text-[10px] text-indigo-600">
                    {uploadStatus}
                  </div>
                )}
                {showMembers && (
                  <aside className="absolute inset-y-0 right-0 z-10 flex w-64 flex-col border-l border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Group users</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {membersByGroup[activeGroup.id]?.length ?? 0} people in this conversation
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMembers(false)}
                        aria-label="Close users panel"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto p-3">
                      {(membersByGroup[activeGroup.id] ?? []).map((member) => {
                        const name = memberName(member);
                        const student = students.find((item) => item.id === member.userId);
                        return (
                          <div
                            key={member.userId}
                            className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                              {initials(name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-semibold text-slate-800">
                                {name}
                              </p>
                              <p className="truncate text-[10px] text-slate-400">
                                {student?.email || "Communication member"}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-700">
                              {member.role.toLowerCase()}
                            </span>
                          </div>
                        );
                      })}
                      {!membersByGroup[activeGroup.id]?.length && (
                        <p className="py-8 text-center text-xs text-slate-400">No users found.</p>
                      )}
                    </div>
                    <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                      Members are managed through course enrollment.
                    </div>
                  </aside>
                )}
                {showGroupSettings && (
                  <aside className="absolute inset-y-0 right-0 z-10 flex w-64 flex-col border-l border-indigo-100 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50 px-4 py-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Group settings</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          Manage this conversation
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGroupSettings(false)}
                        aria-label="Close group settings"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Group name
                        <input
                          value={groupSettingsName}
                          onChange={(event) => setGroupSettingsName(event.target.value)}
                          maxLength={150}
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal text-slate-800 outline-none focus:border-indigo-500"
                        />
                      </label>
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Description
                        <textarea
                          value={groupSettingsDescription}
                          onChange={(event) => setGroupSettingsDescription(event.target.value)}
                          rows={4}
                          maxLength={2000}
                          className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal text-slate-800 outline-none focus:border-indigo-500"
                        />
                      </label>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold text-slate-800">
                          Student messaging
                        </p>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                          {activeGroup.studentMessagingEnabled === false
                            ? "Students are currently unable to send messages."
                            : "Students can currently send messages in this group."}
                        </p>
                        <button
                          type="button"
                          onClick={() => void toggleStudentMessaging()}
                          disabled={isGroupSettingsSaving}
                          className={`mt-3 w-full rounded-lg px-3 py-2 text-[11px] font-semibold disabled:opacity-50 ${activeGroup.studentMessagingEnabled === false ? "bg-emerald-600 text-white" : "bg-rose-100 text-rose-700"}`}
                        >
                          {activeGroup.studentMessagingEnabled === false
                            ? "Allow student messages"
                            : "Pause student messages"}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-slate-200 bg-slate-50 p-3">
                      <button
                        type="button"
                        onClick={() => void saveGroupSettings()}
                        disabled={isGroupSettingsSaving || !groupSettingsName.trim()}
                        className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
                      >
                        {isGroupSettingsSaving ? "Saving..." : "Save group settings"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleGroupArchive()}
                        disabled={isGroupSettingsSaving}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 disabled:opacity-50"
                      >
                        {activeGroup.status === "ARCHIVED" ? "Unarchive group" : "Archive group"}
                      </button>
                    </div>
                  </aside>
                )}
              </>
            ) : (
              <p className="m-auto text-xs text-slate-400">
                Select a communication group to begin.
              </p>
            )}
          </main>
        </div>
      </div>
      {preview && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[min(90vh,48rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {preview.attachment.originalFilename}
                </p>
                <p className="text-[11px] text-slate-500">
                  {Math.ceil(preview.attachment.fileSize / 1024)} KB · Document preview
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(preview.url, "_blank", "noopener,noreferrer")}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Open full view
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close attachment preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="min-h-64 flex-1 overflow-auto bg-slate-100 p-4">
              {preview.attachment.contentType === "application/pdf" ? (
                <iframe
                  src={preview.url}
                  title={preview.attachment.originalFilename}
                  className="h-[min(70vh,38rem)] w-full rounded-lg border border-slate-200 bg-white"
                />
              ) : preview.attachment.contentType.startsWith("image/") ? (
                <img
                  src={preview.url}
                  alt={preview.attachment.originalFilename}
                  className="mx-auto max-h-[min(70vh,38rem)] max-w-full rounded-lg object-contain"
                />
              ) : preview.attachment.contentType.startsWith("video/") ? (
                <video
                  src={preview.url}
                  controls
                  className="mx-auto max-h-[min(70vh,38rem)] max-w-full"
                />
              ) : preview.attachment.contentType.startsWith("audio/") ? (
                <div className="flex min-h-64 items-center justify-center">
                  <audio src={preview.url} controls />
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <FileText className="h-10 w-10 text-indigo-500" />
                  <p className="text-sm font-semibold text-slate-800">
                    {preview.attachment.originalFilename}
                  </p>
                  <p className="max-w-sm text-xs text-slate-500">
                    This document type cannot be rendered directly in the browser. Open the full
                    view to preview or download it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <TextInputModal
        isOpen={Boolean(editingMessage)}
        title="Edit message"
        label="Message"
        initialValue={editingMessage?.content ?? ""}
        multiline
        onClose={() => setEditingMessage(null)}
        onSave={handleEditMessage}
      />
      <ConfirmModal
        isOpen={Boolean(deletingMessage)}
        title="Delete message?"
        description="This removes the message for everyone in this communication group. This action cannot be undone."
        onClose={() => setDeletingMessage(null)}
        onConfirm={handleDeleteMessage}
      />
    </div>
  );
};
