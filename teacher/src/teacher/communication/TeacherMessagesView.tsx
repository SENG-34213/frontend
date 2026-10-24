"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BellRing,
  CheckCheck,
  Download,
  FileText,
  Mic,
  Plus,
  Search,
  Send,
  Settings,
  Square,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import type { Student } from "../types";
import { useCommunicationRealtime } from "../api/communicationRealtime";
import {
  addStudentToCommunicationGroup,
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
  return value ? new Date(value).toLocaleString() : "No messages";
}

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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<"direct" | "announcements">("direct");
  const [search, setSearch] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementAttachments, setAnnouncementAttachments] = useState<File[]>([]);
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
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<CommunicationMessage | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<CommunicationMessage | null>(null);
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
        if (existing.some((item) => item.id === message.id)) return current;
        return { ...current, [message.groupId]: [...existing, message] };
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
    if (!isRecording) return;
    const timer = window.setInterval(() => setRecordingSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(
    () => () => recorderRef.current?.stream.getTracks().forEach((track) => track.stop()),
    [],
  );

  async function toggleVoiceRecording() {
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setActionError("Voice recording is not supported by this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recordingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const extension = type.includes("ogg") ? "ogg" : "webm";
        const voiceFile = new File(recordingChunksRef.current, `voice-message.${extension}`, {
          type,
        });
        setPendingAttachments((files) => [...files, voiceFile]);
        stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        setIsRecording(false);
        setRecordingSeconds(0);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecordingSeconds(0);
      setIsRecording(true);
      setActionError(null);
    } catch {
      setActionError("Microphone access is required to record a voice message.");
    }
  }

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
          [activeGroup.id]: [...(current[activeGroup.id] ?? []), message],
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

  async function openAttachment(message: CommunicationMessage, attachmentId: string) {
    if (!activeGroup) return;
    try {
      const download = await getCommunicationAttachmentDownload(
        activeGroup.id,
        message.id,
        attachmentId,
      );
      if (!download?.downloadUrl) throw new Error("The attachment could not be opened.");
      window.open(download.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Attachment could not be opened.",
      );
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

  async function handlePublishAnnouncement(event: React.FormEvent) {
    event.preventDefault();
    const group = groups.find((item) => item.courseId === announcementTarget);
    if (!group || (!announcementText.trim() && announcementAttachments.length === 0)) {
      setActionError("Select a course with an available communication group.");
      return;
    }
    setIsSending(true);
    try {
      const content = announcementText.trim();
      const attachmentIds: string[] = [];
      for (const file of announcementAttachments) {
        const attachment = await uploadCommunicationAttachment(group.id, file);
        if (!attachment) throw new Error("An announcement attachment could not be uploaded.");
        attachmentIds.push(attachment.id);
      }
      if (attachmentIds.length > 0 || !realtime.sendMessage(group.id, content)) {
        const message = await sendCommunicationMessage(group.id, content, attachmentIds);
        if (!message) throw new Error("The announcement could not be sent.");
        setMessagesByGroup((current) => ({
          ...current,
          [group.id]: [...(current[group.id] ?? []), message],
        }));
      }
      setAnnouncementSuccess(true);
      setAnnouncementText("");
      setAnnouncementAttachments([]);
      setTimeout(() => setAnnouncementSuccess(false), 2200);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Announcement could not be sent.",
      );
    } finally {
      setIsSending(false);
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
          TiT Messaging · Secure
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
                          <span className="text-[10px] text-slate-400 mb-1 px-1">
                            {isMe ? "You" : messageSenderName(message)} ·{" "}
                            {formatTime(message.sentAt)}
                            {message.edited ? " · edited" : ""}
                          </span>
                          <div
                            className={`max-w-lg p-3 rounded-xl text-xs leading-relaxed ${isMe ? "bg-indigo-600 text-white rounded-br-none shadow-xs" : "bg-slate-100 text-slate-900 rounded-bl-none"}`}
                          >
                            {message.deletedForEveryone ? "Message deleted" : message.content}
                            {!message.deletedForEveryone && message.attachments?.length > 0 && (
                              <div className="mt-2 space-y-1.5 border-t border-white/20 pt-2">
                                {message.attachments.map((attachment) => (
                                  <button
                                    key={attachment.id}
                                    type="button"
                                    onClick={() => void openAttachment(message, attachment.id)}
                                    className="flex w-full items-center gap-2 rounded-md bg-black/10 px-2 py-1.5 text-left hover:bg-black/20"
                                  >
                                    <FileText className="h-4 w-4 shrink-0" />
                                    <span className="min-w-0 flex-1 truncate">
                                      {attachment.originalFilename}
                                    </span>
                                    <span className="shrink-0 text-[10px] opacity-75">
                                      {Math.ceil(attachment.fileSize / 1024)} KB
                                    </span>
                                    <Download className="h-3.5 w-3.5 shrink-0" />
                                  </button>
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
                  <CommunicationAttachmentPicker
                    files={pendingAttachments}
                    onChange={setPendingAttachments}
                    disabled={activeGroup.status === "ARCHIVED" || isSending}
                  />
                  <button
                    type="button"
                    onClick={() => void toggleVoiceRecording()}
                    disabled={activeGroup.status === "ARCHIVED" || isSending}
                    title={isRecording ? "Stop recording" : "Record voice message"}
                    aria-label={isRecording ? "Stop recording" : "Record voice message"}
                    className={`relative shrink-0 rounded-lg p-2 ${isRecording ? "bg-rose-100 text-rose-600" : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600"}`}
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isRecording && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-rose-600">
                        {recordingSeconds}s
                      </span>
                    )}
                  </button>
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
                {availableCourses.length === 0 ? (
                  <option value="">No courses available</option>
                ) : (
                  availableCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseName}
                      {course.courseCode ? ` · ${course.courseCode}` : ""}
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
            <CommunicationAttachmentPicker
              files={announcementAttachments}
              onChange={setAnnouncementAttachments}
              disabled={isSending}
            />
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
