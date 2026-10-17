import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  CheckCheck,
  Users,
  BellRing,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { ConversationThread, ChatMessage } from '../types';
import { mockConversations, mockCourses } from '../data/mockData';

export const TeacherMessagesView: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationThread[]>(mockConversations);
  const [selectedThreadId, setSelectedThreadId] = useState(mockConversations[0]?.id);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'direct' | 'announcements'>('direct');

  // Announcement state
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState(mockCourses[0]?.id);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  const activeThread =
    conversations.find((c) => c.id === selectedThreadId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'tch-001',
      senderName: 'Prof. Alex Rivera',
      senderRole: 'teacher',
      content: inputText,
      timestamp: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeThread.id
          ? {
              ...c,
              lastMessage: inputText,
              lastMessageTime: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setInputText('');
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setAnnouncementSuccess(true);
    setTimeout(() => {
      setAnnouncementSuccess(false);
      setAnnouncementText('');
    }, 2200);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs -m-4 lg:-m-6">
      {/* Top Header Mode Tabs */}
      <div className="h-14 bg-slate-50 border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('direct')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                activeTab === 'direct'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Direct & Group Messages
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                activeTab === 'announcements'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Course Broadcast Announcements
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Mentify Messaging Service · TLS Encrypted
        </span>
      </div>

      {activeTab === 'direct' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Thread List */}
          <aside className="w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/40">
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.map((thread) => {
                const isSelected = thread.id === activeThread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0 ${thread.avatarBg}`}
                    >
                      {thread.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {thread.participantName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {thread.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {thread.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Chat History & Composer */}
          <main className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Conversation Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center ${activeThread.avatarBg}`}
                >
                  {activeThread.initials}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {activeThread.participantName}
                  </h3>
                  <p className="text-[11px] text-slate-500">{activeThread.participantRole}</p>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeThread.messages.map((msg) => {
                const isMe = msg.senderRole === 'teacher';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-1 px-1">
                      {msg.senderName} · {msg.timestamp}
                    </span>
                    <div
                      className={`max-w-lg p-3 rounded-xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message to student or course group..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </main>
        </div>
      ) : (
        /* Announcements Workspace */
        <div className="p-8 max-w-3xl mx-auto space-y-6 flex-1 overflow-y-auto">
          <div>
            <h2 className="text-base font-bold text-slate-900">Send Course Broadcast</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Announcements notify all enrolled students via portal alert and university email.
            </p>
          </div>

          {announcementSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Announcement published to all enrolled students!</span>
            </div>
          )}

          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Course
              </label>
              <select
                value={announcementTarget}
                onChange={(e) => setAnnouncementTarget(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              >
                {mockCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title} ({c.enrolledCount} students)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Content
              </label>
              <textarea
                rows={5}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
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
