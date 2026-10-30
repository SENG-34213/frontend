import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  Ellipsis,
  FileText,
  History,
  Menu,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import {
  AiConversation,
  AiMessage,
  createAiConversation,
  deleteAiConversation,
  fetchAiConversations,
  fetchAiMessages,
  messageRole,
  messageText,
  messageTime,
  sendAiMessage,
  updateAiConversation,
} from "../api/aiApi";

const suggestions = [
  ["Platform overview", "Summarize the current student, teacher, and course activity."],
  ["Registration trends", "What registration trends should the admin team review this month?"],
  ["Academic risks", "Identify academic or attendance risks that need attention."],
  ["Upcoming exams", "Check upcoming examinations for scheduling conflicts."],
];

function formatConversationDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-slate-900 dark:text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    ),
  );
}

function AiResponseContent({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split("\n").map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1" />;
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={index} className="pt-2 text-sm font-bold text-slate-900 dark:text-white">
              {renderInline(trimmed.slice(4))}
            </h4>
          );
        }
        if (/^[-*] /.test(trimmed)) {
          return (
            <div key={index} className="flex gap-2 pl-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        return <p key={index}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function AssistantMessage({ message, onCopy }: { message: AiMessage; onCopy: () => void }) {
  const text = messageText(message);
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 max-w-3xl">
        <div className="mb-1 flex items-center gap-2 text-[11px]">
          <span className="font-semibold text-slate-900 dark:text-white">TiT AI</span>
          <span className="text-slate-400">{messageTime(message)}</span>
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200">
          <AiResponseContent text={text} />
          <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2 text-[10px] text-slate-400 dark:border-slate-700">
            <button onClick={onCopy} className="flex items-center gap-1 hover:text-indigo-500">
              <Copy className="h-3 w-3" /> Copy response
            </button>
            {message.toolsUsed?.length ? <span>{message.toolsUsed.length} tools used</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: AiMessage }) {
  return (
    <div className="flex items-start justify-end gap-3">
      <div className="min-w-0 max-w-3xl">
        <div className="mb-1 flex items-center justify-end gap-2 text-[11px]">
          <span className="text-slate-400">{messageTime(message)}</span>
          <span className="font-semibold text-slate-900 dark:text-white">You</span>
        </div>
        <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm leading-6 text-white shadow-sm">
          {message.attachmentName && (
            <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-white/15 px-2 py-1 text-[11px]">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{message.attachmentName}</span>
            </div>
          )}
          <div>{messageText(message)}</div>
        </div>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-xs font-bold text-white">
        A
      </div>
    </div>
  );
}

export const MentifyAIAssistant: React.FC = () => {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const skipNextMessageLoadRef = useRef<string | null>(null);

  const activeConversation = conversations.find((item) => item.id === activeId);
  const filteredConversations = useMemo(
    () =>
      conversations.filter((item) =>
        (item.title || "New conversation").toLowerCase().includes(search.toLowerCase()),
      ),
    [conversations, search],
  );

  useEffect(() => {
    void (async () => {
      try {
        const loaded = await fetchAiConversations();
        setConversations(loaded);
        if (loaded[0]) setActiveId(loaded[0].id);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load AI conversations.",
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    if (skipNextMessageLoadRef.current === activeId) {
      skipNextMessageLoadRef.current = null;
      return;
    }

    let active = true;
    setIsLoadingMessages(true);
    setMessages([]);
    void (async () => {
      try {
        setError("");
        const loadedMessages = await fetchAiMessages(activeId);
        if (active) setMessages(loadedMessages);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load this conversation.",
          );
        }
      } finally {
        if (active) setIsLoadingMessages(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const startNewChat = () => {
    skipNextMessageLoadRef.current = null;
    setActiveId(null);
    setMessages([]);
    setIsLoadingMessages(false);
    setInput("");
    setAttachedFile(null);
    setIsDraggingFile(false);
    setError("");
    setMobileSidebarOpen(false);
  };

  const selectAttachment = (file?: File) => {
    if (!file) return;
    const supported = /\.(pdf|docx|pptx|txt)$/i.test(file.name);
    if (!supported) {
      setError("Please choose a PDF, DOCX, PPTX, or TXT document.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("This file is too large. Please choose a file smaller than 10 MB.");
      return;
    }
    setError("");
    setAttachedFile(file);
  };

  const handleSend = async (value = input) => {
    const prompt = value.trim() || (attachedFile ? "Please summarize the attached document." : "");
    if (!prompt || isSending) return;
    const fileForMessage = attachedFile;
    setInput("");
    setError("");
    const clientMessageId = `client-${crypto.randomUUID?.() || Date.now()}`;
    const optimistic: AiMessage = {
      id: clientMessageId,
      role: "USER",
      message: prompt,
      timestamp: new Date().toISOString(),
      attachmentName: fileForMessage?.name,
    };
    setMessages((current) => [...current, optimistic]);
    setIsSending(true);
    try {
      let conversation = activeConversation;
      if (!conversation) {
        conversation = await createAiConversation(prompt.slice(0, 80));
        setConversations((current) => [conversation!, ...current]);
        // The first message is already represented optimistically. Do not let
        // the conversation-selection effect replace it with an empty history
        // while the send request is still in flight.
        skipNextMessageLoadRef.current = conversation.id;
        setActiveId(conversation.id);
      }
      const response = await sendAiMessage(
        conversation.id,
        prompt,
        clientMessageId,
        fileForMessage || undefined,
      );
      setMessages((current) => [
        ...current,
        {
          id: response.messageId,
          role: "ASSISTANT",
          message: response.message,
          timestamp: response.timestamp || new Date().toISOString(),
          toolsUsed: response.toolsUsed,
        },
      ]);
      setAttachedFile(null);
    } catch (sendError) {
      setMessages((current) => current.filter((item) => item.id !== clientMessageId));
      setInput(value);
      setError(sendError instanceof Error ? sendError.message : "Unable to reach the AI service.");
    } finally {
      setIsSending(false);
    }
  };

  const handleRename = async () => {
    if (!activeId || !renameValue.trim()) return;
    try {
      const updated = await updateAiConversation(activeId, renameValue.trim());
      setConversations((current) =>
        current.map((item) => (item.id === activeId ? { ...item, ...updated } : item)),
      );
      setDialog(null);
    } catch (renameError) {
      setError(
        renameError instanceof Error ? renameError.message : "Unable to rename conversation.",
      );
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      await deleteAiConversation(activeId);
      const remaining = conversations.filter((item) => item.id !== activeId);
      setConversations(remaining);
      setActiveId(remaining[0]?.id || null);
      setDialog(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete conversation.",
      );
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="TiT AI Assistant"
        description="Premium conversational intelligence grounded in TiT platform data and live platform analytics."
        breadcrumbs={[{ label: "Admin" }, { label: "Platform Operations" }, { label: "TiT AI" }]}
        actions={
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New chat
          </button>
        }
      />

      <div className="relative flex h-[calc(100vh-8.5rem)] min-h-[640px] max-h-[920px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <button
              aria-label="Close conversations"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex-1 bg-slate-950/40"
            />
            <aside className="w-72 border-l border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Conversations
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={startNewChat}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                <Plus className="h-4 w-4" /> New conversation
              </button>
              <div className="space-y-2 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setActiveId(conversation.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left ${activeId === conversation.id ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"}`}
                  >
                    <History className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 truncate text-xs font-medium">
                      {conversation.title || "New conversation"}
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        )}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-14"} hidden shrink-0 border-r border-slate-200 bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-950 lg:block`}
        >
          <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3 dark:border-slate-800">
            {sidebarOpen && (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Conversations
              </span>
            )}
            <button
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
          {sidebarOpen && (
            <div className="p-3">
              <button
                onClick={startNewChat}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                <Plus className="h-4 w-4" /> New conversation
              </button>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900"
              />
              <div className="space-y-4 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setActiveId(conversation.id);
                      setSidebarOpen(false);
                    }}
                    className={`group flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left ${activeId === conversation.id ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"}`}
                  >
                    <History className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {conversation.title || "New conversation"}
                      <span className="mt-1 block text-[10px] font-normal text-slate-400">
                        {formatConversationDate(conversation.updatedAt || conversation.createdAt)}
                      </span>
                    </span>
                  </button>
                ))}
                {!isLoading && filteredConversations.length === 0 && (
                  <p className="px-2 text-xs text-slate-400">No conversations yet.</p>
                )}
              </div>
            </div>
          )}
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {activeConversation?.title || "New AI workspace"}
                </p>
                <p className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Assistant connected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {activeConversation && (
                <>
                  <button
                    onClick={() => {
                      setRenameValue(activeConversation.title || "");
                      setDialog("rename");
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDialog("delete")}
                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setContextOpen((open) => !open)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Ellipsis className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-2 dark:border-slate-800/80 dark:bg-slate-950/40">
            <div className="flex min-w-0 items-center gap-2 text-[11px] text-slate-500">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
              </span>
              <span className="truncate">Your assistant is ready to help</span>
            </div>
            <span className="hidden shrink-0 text-[10px] text-slate-400 sm:block">
              Secure assistant session
            </span>
          </div>

          {error && (
            <div className="mx-4 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 && !isLoading && !isLoadingMessages ? (
              <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  How can I help with TiT?
                </h2>
                <p className="mt-2 max-w-lg text-sm text-slate-500">
                  Ask about courses, users, registrations, attendance, examinations, or platform
                  operations.
                </p>
                <div className="mt-7 grid w-full gap-2 sm:grid-cols-2">
                  {suggestions.map(([title, prompt]) => (
                    <button
                      key={title}
                      onClick={() => void handleSend(prompt)}
                      className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
                    >
                      <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {title}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-500">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : isLoadingMessages && !messages.length ? (
              <div className="mx-auto flex max-w-2xl items-center justify-center py-16 text-sm text-slate-500">
                <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                Loading conversation…
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-5">
                {messages.map((message) =>
                  messageRole(message) === "user" ? (
                    <UserMessage key={message.id} message={message} />
                  ) : (
                    <AssistantMessage
                      key={message.id}
                      message={message}
                      onCopy={() => {
                        void navigator.clipboard?.writeText(messageText(message));
                        setCopied(message.id);
                        window.setTimeout(() => setCopied(null), 1600);
                      }}
                    />
                  ),
                )}
                {isSending && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/70">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:240ms]" />
                        <span className="ml-2 text-xs text-slate-500">TiT AI is thinking…</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-slate-800 sm:p-4">
            {attachedFile && (
              <div className="mx-auto mb-2 flex max-w-4xl items-center justify-between gap-3 overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-3 py-2.5 text-xs shadow-sm dark:border-indigo-900 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-800 dark:text-slate-100">
                      {attachedFile.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Ready to attach</span>
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>{(attachedFile.size / 1024 / 1024).toFixed(1)} MB</span>
                    </span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="rounded p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  aria-label="Remove attached file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={(event) => {
                if (event.currentTarget === event.target) setIsDraggingFile(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDraggingFile(false);
                selectAttachment(event.dataTransfer.files?.[0]);
              }}
              className={`relative mx-auto flex max-w-4xl items-end gap-2 rounded-xl border p-2 transition-all focus-within:border-indigo-400 dark:border-slate-700 dark:bg-slate-800/60 ${
                isDraggingFile
                  ? "border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/10 dark:bg-indigo-950/40"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {isDraggingFile && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-50/95 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/95 dark:text-indigo-300">
                  <span className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" /> Drop your document here
                  </span>
                </div>
              )}
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 4000))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                rows={1}
                placeholder="Ask TiT AI about your platform..."
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
              />
              <label
                className="cursor-pointer rounded-lg p-2.5 text-slate-500 hover:bg-slate-200 hover:text-indigo-600 dark:hover:bg-slate-700"
                title="Attach a document"
              >
                <Paperclip className="h-4 w-4" />
                <input
                  type="file"
                  accept=".pdf,.docx,.pptx,.txt"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.currentTarget.value = "";
                    selectAttachment(file);
                  }}
                />
              </label>
              <span className="hidden self-end pb-2 text-[10px] text-slate-400 sm:block">
                {input.length}/4000
              </span>
              <button
                disabled={(!input.trim() && !attachedFile) || isSending}
                className="rounded-lg bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mx-auto mt-2 max-w-4xl text-[10px] text-slate-400">
              Enter to send · Shift + Enter for a new line · Responses are based on your platform
              data
            </p>
          </div>
        </section>

        {contextOpen && (
          <aside className="hidden w-64 shrink-0 border-l border-slate-200 bg-slate-50 p-4 xl:block dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Workspace context
              </span>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready to help
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Admin access
                  </p>
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                </div>
                <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  Ask about the areas available in your administration workspace.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: "People", icon: Users },
                    { label: "Courses", icon: BookOpen },
                    { label: "Enrollments", icon: ClipboardCheck },
                    { label: "Assessments", icon: FileText },
                    { label: "Attendance", icon: CalendarDays },
                    { label: "Insights", icon: BarChart3 },
                    { label: "Messages", icon: MessageSquare },
                    { label: "Schedules", icon: CalendarDays },
                  ].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-2 text-[11px] font-medium text-slate-600 dark:bg-slate-800/70 dark:text-slate-300"
                    >
                      <Icon className="h-3.5 w-3.5 text-indigo-500" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950/30">
                <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                  Data privacy
                </p>
                <p className="mt-1 text-[11px] leading-5 text-indigo-700/80 dark:text-indigo-300/80">
                  Your conversations stay within the information available to your administrator
                  workspace.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
            {dialog === "rename" ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Rename conversation</h3>
                  <button onClick={() => setDialog(null)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleRename();
                  }}
                  className="mt-4 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setDialog(null)}
                    className="rounded-lg px-3 py-2 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleRename()}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold">Delete conversation?</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This permanently removes the conversation and its messages.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setDialog(null)}
                    className="rounded-lg px-3 py-2 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleDelete()}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {copied && (
        <div className="fixed bottom-5 right-5 flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">
          <Check className="h-4 w-4 text-emerald-400" /> Copied
        </div>
      )}
    </div>
  );
};
