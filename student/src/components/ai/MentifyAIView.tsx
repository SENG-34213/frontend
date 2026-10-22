import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Menu,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  createStudentAiConversation,
  deleteStudentAiConversation,
  fetchStudentAiConversations,
  fetchStudentAiMessages,
  renameStudentAiConversation,
  sendStudentAiMessage,
  studentAiMessageRole,
  studentAiMessageText,
  studentAiMessageTime,
  type StudentAiConversation,
  type StudentAiMessage,
} from "../../api/ai";

const suggestions = [
  [
    "Understand a concept",
    "Explain a difficult topic from one of my enrolled courses step by step.",
  ],
  ["Prepare for an exam", "Create a focused revision plan for my next assessment."],
  ["Practice questions", "Create practice questions for a topic I am currently studying."],
  [
    "Review my approach",
    "Help me check my reasoning and identify gaps without giving away the answer.",
  ],
];

function renderText(text: string) {
  return text.split("\n").map((line, index) => {
    const value = line.trim();
    if (!value) return <div key={index} className="h-1" />;
    if (value.startsWith("### "))
      return (
        <h4 key={index} className="pt-2 text-sm font-bold">
          {value.slice(4)}
        </h4>
      );
    if (/^[-*] /.test(value))
      return (
        <p key={index} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
          {value.slice(2)}
        </p>
      );
    return <p key={index}>{value}</p>;
  });
}

function AssistantMessage({ message, onCopy }: { message: StudentAiMessage; onCopy: () => void }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 max-w-3xl">
        <div className="mb-1 flex items-center gap-2 text-[11px]">
          <b>Mentify AI</b>
          <span className="text-slate-400">{studentAiMessageTime(message)}</span>
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200">
          <div className="space-y-2">{renderText(studentAiMessageText(message))}</div>
          <div className="mt-3 border-t border-slate-200 pt-2 text-[10px] text-slate-400 dark:border-slate-700">
            <button onClick={onCopy} className="flex items-center gap-1 hover:text-indigo-500">
              <Copy className="h-3 w-3" /> Copy answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: StudentAiMessage }) {
  return (
    <div className="flex items-start justify-end gap-3">
      <div className="max-w-3xl">
        <div className="mb-1 flex justify-end gap-2 text-[11px]">
          <span className="text-slate-400">{studentAiMessageTime(message)}</span>
          <b>You</b>
        </div>
        <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm leading-6 text-white">
          {studentAiMessageText(message)}
        </div>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-xs font-bold text-white">
        S
      </div>
    </div>
  );
}

export const MentifyAIView: React.FC = () => {
  const [conversations, setConversations] = useState<StudentAiConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StudentAiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
  const [rename, setRename] = useState("");
  const [copied, setCopied] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const loadIdRef = useRef(0);
  const skipNextLoadRef = useRef<string | null>(null);
  const active = conversations.find((conversation) => conversation.id === activeId);
  const filtered = useMemo(
    () =>
      conversations.filter((conversation) =>
        (conversation.title || "New conversation").toLowerCase().includes(search.toLowerCase()),
      ),
    [conversations, search],
  );

  useEffect(() => {
    void fetchStudentAiConversations()
      .then(setConversations)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Unable to load AI conversations."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    if (skipNextLoadRef.current === activeId) return;
    const requestId = ++loadIdRef.current;
    void fetchStudentAiMessages(activeId)
      .then((loaded) => {
        if (requestId === loadIdRef.current) setMessages(loaded);
      })
      .catch((reason) => {
        if (requestId === loadIdRef.current)
          setError(reason instanceof Error ? reason.message : "Unable to load this conversation.");
      });
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const newChat = () => {
    setActiveId(null);
    setMessages([]);
    setInput("");
    setError("");
    setMobileOpen(false);
  };

  const send = async (value = input) => {
    const prompt = value.trim();
    if (!prompt || sending) return;
    const clientMessageId = `student-${crypto.randomUUID()}`;
    setInput("");
    setError("");
    setMessages((current) => [
      ...current,
      { id: clientMessageId, role: "USER", content: prompt, createdAt: new Date().toISOString() },
    ]);
    setSending(true);
    let createdId: string | null = null;
    try {
      let conversation = active;
      if (!conversation) {
        conversation = await createStudentAiConversation(prompt.slice(0, 80));
        createdId = conversation.id;
        setConversations((current) => [conversation!, ...current]);
        skipNextLoadRef.current = conversation.id;
        setActiveId(conversation.id);
      }
      const result = await sendStudentAiMessage(conversation.id, prompt, clientMessageId);
      setMessages((current) => [
        ...current,
        {
          id: result.messageId,
          role: "ASSISTANT",
          content: result.message,
          createdAt: result.timestamp || new Date().toISOString(),
          toolsUsed: result.toolsUsed,
        },
      ]);
    } catch (reason) {
      setMessages((current) => current.filter((message) => message.id !== clientMessageId));
      setError(
        reason instanceof Error ? reason.message : "The AI assistant is temporarily unavailable.",
      );
    } finally {
      if (createdId && skipNextLoadRef.current === createdId) skipNextLoadRef.current = null;
      setSending(false);
    }
  };

  const renameChat = async () => {
    if (!activeId || !rename.trim()) return;
    try {
      const updated = await renameStudentAiConversation(activeId, rename.trim());
      setConversations((current) => current.map((item) => (item.id === activeId ? updated : item)));
      setDialog(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to rename this conversation.");
    }
  };

  const deleteChat = async () => {
    if (!activeId) return;
    try {
      await deleteStudentAiConversation(activeId);
      const remaining = conversations.filter((conversation) => conversation.id !== activeId);
      setConversations(remaining);
      setActiveId(remaining[0]?.id || null);
      setDialog(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete this conversation.");
    }
  };

  const conversationList = (
    <div className="space-y-2 overflow-y-auto">
      {filtered.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => {
            setActiveId(conversation.id);
            setMobileOpen(false);
            setError("");
          }}
          className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-xs ${activeId === conversation.id ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200" : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"}`}
        >
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="truncate font-medium">{conversation.title || "New conversation"}</span>
        </button>
      ))}
      {!loading && !filtered.length && (
        <p className="px-2 text-xs text-slate-400">No conversations yet.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Mentify AI Study Assistant
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ask questions about your coursework and keep every study conversation in one place.
          </p>
        </div>
        <button
          onClick={newChat}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>
      <div className="relative flex min-h-[640px] h-[calc(100vh-8.5rem)] max-h-[920px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <button
              aria-label="Close conversations"
              onClick={() => setMobileOpen(false)}
              className="flex-1 bg-slate-950/40"
            />
            <aside className="w-72 bg-slate-50 p-3 dark:bg-slate-900">
              <div className="mb-3 flex justify-between text-xs font-bold uppercase text-slate-500">
                Conversations{" "}
                <button onClick={() => setMobileOpen(false)} aria-label="Close conversation menu">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={newChat}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
              >
                <Plus className="h-4 w-4" /> New conversation
              </button>
              {conversationList}
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
              aria-label="Toggle conversations sidebar"
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
                onClick={newChat}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
              >
                <Plus className="h-4 w-4" /> New conversation
              </button>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              {conversationList}
            </div>
          )}
        </aside>
        <section className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open conversations"
                className="rounded-lg p-2 text-slate-500 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {active?.title || "New AI workspace"}
                </p>
                <p className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Student workspace
                  connected
                </p>
              </div>
            </div>
            {active && (
              <div className="flex">
                <button
                  onClick={() => {
                    setRename(active.title || "");
                    setDialog("rename");
                  }}
                  aria-label="Rename conversation"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDialog("delete")}
                  aria-label="Delete conversation"
                  className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </header>
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Connected to Mentify AI · student
            study context
          </div>
          {error && (
            <div className="mx-4 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {!messages.length && !loading ? (
              <div className="mx-auto max-w-2xl py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  How can I help you study?
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Start a conversation or choose a study prompt below.
                </p>
                <div className="mt-7 grid gap-2 sm:grid-cols-2">
                  {suggestions.map(([title, prompt]) => (
                    <button
                      key={title}
                      onClick={() => void send(prompt)}
                      className="rounded-xl border border-slate-200 p-3 text-left hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:bg-indigo-950/30"
                    >
                      <b className="block text-xs text-slate-900 dark:text-white">{title}</b>
                      <span className="mt-1 block text-[11px] text-slate-500">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-5">
                {messages.map((message) =>
                  studentAiMessageRole(message) === "user" ? (
                    <UserMessage key={message.id} message={message} />
                  ) : (
                    <AssistantMessage
                      key={message.id}
                      message={message}
                      onCopy={() => {
                        void navigator.clipboard?.writeText(studentAiMessageText(message));
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1600);
                      }}
                    />
                  ),
                )}
                {sending && (
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Sparkles className="h-4 w-4 animate-pulse text-indigo-600" /> Mentify AI is
                    thinking...
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>
          <div className="border-t border-slate-200 p-3 dark:border-slate-800 sm:p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
              className="mx-auto flex max-w-4xl items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-400 dark:border-slate-700 dark:bg-slate-800/60"
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 4000))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                rows={1}
                placeholder="Ask Mentify AI about your coursework..."
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none dark:text-white"
              />
              <span className="hidden self-end pb-2 text-[10px] text-slate-400 sm:block">
                {input.length}/4000
              </span>
              <button
                disabled={!input.trim() || sending}
                className="rounded-lg bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mx-auto mt-2 max-w-4xl text-[10px] text-slate-400">
              Enter to send · Shift + Enter for a new line · Your conversations are saved account
            </p>
          </div>
        </section>
      </div>
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
            {dialog === "rename" ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Rename conversation
                  </h3>
                  <button onClick={() => setDialog(null)} aria-label="Close dialog">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  autoFocus
                  value={rename}
                  onChange={(event) => setRename(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void renameChat();
                  }}
                  className="mt-4 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:text-white"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setDialog(null)}
                    className="rounded-lg px-3 py-2 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void renameChat()}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Delete conversation?
                </h3>
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
                    onClick={() => void deleteChat()}
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
