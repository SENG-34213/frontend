import React, { useEffect, useRef, useState } from "react";
import { Download, Eye, FileText, Search, Send, User } from "lucide-react";
import { getCommunicationAttachmentDownload } from "../../api/student";
import { useStudent } from "../../context/StudentContext";
import type { Message } from "../../types";
import { EmptyState } from "../../../../shared/ui/EmptyState";

function formatMessageTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const StudentImageAttachment: React.FC<{
  groupId: string;
  messageId: string;
  attachment: NonNullable<Message["attachments"]>[number];
  onOpen: () => void;
}> = ({ groupId, messageId, attachment, onOpen }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => Boolean(attachment.id));

  useEffect(() => {
    let active = true;
    if (!attachment.id) {
      return;
    }
    getCommunicationAttachmentDownload(groupId, messageId, attachment.id)
      .then((response) => {
        if (active) setUrl(String(response.data?.downloadUrl || ""));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attachment.id, groupId, messageId]);

  if (loading) {
    return (
      <div className="mt-2 rounded-lg bg-black/10 px-2.5 py-2 text-[11px]">Loading image...</div>
    );
  }
  if (url && attachment.contentType?.startsWith("image/")) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="mt-2 block max-w-full overflow-hidden rounded-lg"
      >
        <img
          src={url}
          alt={attachment.name}
          className="max-h-56 max-w-full rounded-lg object-contain"
        />
      </button>
    );
  }
  return (
    <a
      href={url || undefined}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex w-full items-center gap-2 rounded-lg bg-black/10 px-2.5 py-2 text-left hover:bg-black/20"
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
      <Eye className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
};

const VoiceAttachment: React.FC<{
  groupId: string;
  messageId: string;
  attachment: NonNullable<Message["attachments"]>[number];
}> = ({ groupId, messageId, attachment }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (url || !attachment.id || loading) return;
    setLoading(true);
    try {
      const response = await getCommunicationAttachmentDownload(groupId, messageId, attachment.id);
      setUrl(String(response.data?.downloadUrl || ""));
    } finally {
      setLoading(false);
    }
  };

  return url ? (
    <audio className="mt-2 max-w-full" controls preload="none" src={url} />
  ) : (
    <button type="button" onClick={() => void load()} className="mt-2 text-[10px] underline">
      {loading ? "Loading voice..." : "Play voice message"}
    </button>
  );
};

export const MessagesView: React.FC = () => {
  const { conversations, sendMessage, loadMoreMessages, announcements } = useStudent();
  const [activeTab, setActiveTab] = useState<"MESSAGES" | "ANNOUNCEMENTS">("MESSAGES");
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || "conv-1");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const effectiveSelectedConvId = conversations.some(
    (conversation) => conversation.id === selectedConvId,
  )
    ? selectedConvId
    : conversations[0]?.id || "";
  const activeConv =
    conversations.find((c) => c.id === effectiveSelectedConvId) || conversations[0];

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList || !activeConv) return;
    const frame = window.requestAnimationFrame(() => {
      messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeConv?.id, activeConv?.lastMessage, activeConv?.lastMessageTime]);

  useEffect(() => {
    if (!conversations.length) return;
    if (!conversations.some((conversation) => conversation.id === selectedConvId)) {
      const firstConversation = window.setTimeout(() => setSelectedConvId(conversations[0].id), 0);
      return () => window.clearTimeout(firstConversation);
    }
  }, [conversations, selectedConvId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputText.trim();
    if (!message || !activeConv || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(activeConv.id, message);
      setInputText("");
    } finally {
      setIsSending(false);
    }
  };

  const openAttachment = async (messageId: string, attachmentId?: string) => {
    if (!activeConv || !attachmentId) return;
    try {
      const response = await getCommunicationAttachmentDownload(
        activeConv.id,
        messageId,
        attachmentId,
      );
      const url = String(response.data?.downloadUrl || "");
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // The existing student toast flow handles request failures during the next refresh.
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Messages & Course Communication
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Communicate directly with course professors, teaching assistants, and view official
            lecture announcements
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("MESSAGES")}
            className={`rounded-lg px-3.5 py-1.5 transition-colors ${
              activeTab === "MESSAGES"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Course Groups
          </button>
          <button
            onClick={() => setActiveTab("ANNOUNCEMENTS")}
            className={`rounded-lg px-3.5 py-1.5 transition-colors ${
              activeTab === "ANNOUNCEMENTS"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Announcements ({announcements.length})
          </button>
        </div>
      </div>

      {activeTab === "MESSAGES" ? (
        <div className="grid h-[calc(100dvh-11rem)] min-h-[580px] grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 lg:min-h-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
          {/* Conversation Sidebar (1 col) */}
          <div className="flex min-h-0 flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-100 p-3 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search course groups or messages..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`flex w-full items-start gap-3 border-l-4 p-3.5 text-left transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50"
                        : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 font-bold text-white text-xs">
                      {conv.participantName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white truncate">
                          {conv.participantName}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatMessageTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                        {conv.participantTitle}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
              {!filteredConversations.length && (
                <EmptyState
                  compact
                  title="No communication groups"
                  description="Course communication groups will appear here when available."
                />
              )}
            </div>
          </div>

          {/* Active Chat Conversation Area (2 cols) */}
          <div className="flex min-h-0 min-w-0 flex-col justify-between bg-white dark:bg-slate-900">
            {/* Chat Header */}
            {activeConv && (
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/30 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs">
                    {activeConv.participantName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      {activeConv.participantName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {activeConv.participantTitle || "Course communication group"}
                      {activeConv.courseCode ? ` · ${activeConv.courseCode}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message Stream */}
            <div
              ref={messageListRef}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
            >
              {activeConv && activeConv.messages.length >= 30 && (
                <button
                  type="button"
                  onClick={() => void loadMoreMessages(activeConv.id)}
                  className="mx-auto block text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Load older messages
                </button>
              )}
              {activeConv?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isSenderStudent ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                    <span>{msg.senderName}</span>
                    <span>·</span>
                    <span>{formatMessageTime(msg.timestamp)}</span>
                  </div>
                  <div
                    className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.isSenderStudent
                        ? "rounded-br-none bg-indigo-600 p-3 text-white shadow-xs"
                        : "rounded-bl-none bg-slate-100 p-3 text-slate-900 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {msg.text && <div>{msg.text}</div>}
                    {msg.attachments?.map((attachment) => {
                      const isImage = attachment.contentType?.startsWith("image/");
                      const isAudio = attachment.contentType?.startsWith("audio/");
                      return isAudio ? (
                        <VoiceAttachment
                          key={attachment.id || attachment.name}
                          groupId={activeConv.id}
                          messageId={msg.id}
                          attachment={attachment}
                        />
                      ) : isImage ? (
                        <StudentImageAttachment
                          key={attachment.id || attachment.name}
                          groupId={activeConv.id}
                          messageId={msg.id}
                          attachment={attachment}
                          onOpen={() => void openAttachment(msg.id, attachment.id)}
                        />
                      ) : (
                        <button
                          key={attachment.id || attachment.name}
                          type="button"
                          onClick={() => void openAttachment(msg.id, attachment.id)}
                          className="mt-2 flex w-full items-center gap-2 rounded-lg bg-black/10 px-2.5 py-2 text-left hover:bg-black/20"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
                          <Download className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {activeConv && !activeConv.messages.length && (
                <EmptyState
                  compact
                  title="No messages yet"
                  description="Messages sent in this group will appear here."
                />
              )}
            </div>

            {activeConv?.studentMessagingEnabled === false && (
              <div className="border-t border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-[11px] font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                Student messaging is paused for this course. You can still view previous messages.
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!activeConv || activeConv.studentMessagingEnabled === false || isSending}
                placeholder="Write your academic query or message..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={
                  !activeConv ||
                  activeConv.studentMessagingEnabled === false ||
                  !inputText.trim() ||
                  isSending
                }
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0 shadow-2xs"
              >
                <span>{isSending ? "Sending..." : "Send"}</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Announcements View */
        <div className="space-y-4">
          {!announcements.length && (
            <EmptyState
              compact
              title="No announcements"
              description="There are no announcements available right now."
            />
          )}
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {ann.courseCode} · {ann.courseTitle}
                  </span>
                  {ann.priority === "URGENT" && (
                    <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                      Urgent Announcement
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {formatMessageTime(ann.timestamp)}
                </span>
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {ann.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Posted by {ann.instructorName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
