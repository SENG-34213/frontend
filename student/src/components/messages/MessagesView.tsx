import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Paperclip,
  CheckCheck,
  Bell,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const MessagesView: React.FC = () => {
  const { conversations, sendMessage, announcements, profile, showToast } = useStudent();
  const [activeTab, setActiveTab] = useState<"MESSAGES" | "ANNOUNCEMENTS">("MESSAGES");
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || "conv-1");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeConv.id, inputText);
    setInputText("");
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            Direct Messages
          </button>
          <button
            onClick={() => setActiveTab("ANNOUNCEMENTS")}
            className={`rounded-lg px-3.5 py-1.5 transition-colors ${
              activeTab === "ANNOUNCEMENTS"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Course Broadcasts ({announcements.length})
          </button>
        </div>
      </div>

      {activeTab === "MESSAGES" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900 shadow-2xs min-h-[580px]">
          {/* Conversation Sidebar (1 col) */}
          <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search faculty or messages..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${
                      isSelected
                        ? "bg-indigo-50/70 dark:bg-indigo-950/50"
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
                          {conv.lastMessageTime}
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
            </div>
          </div>

          {/* Active Chat Conversation Area (2 cols) */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            {/* Chat Header */}
            {activeConv && (
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
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
                      {activeConv.participantTitle} · {activeConv.courseCode}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeConv?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isSenderStudent ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                    <span>{msg.senderName}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.isSenderStudent
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="border-t border-slate-200 p-4 dark:border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write your academic query or message..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0 shadow-2xs"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Announcements View */
        <div className="space-y-4">
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
                <span className="text-[11px] text-slate-400">{ann.timestamp}</span>
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
