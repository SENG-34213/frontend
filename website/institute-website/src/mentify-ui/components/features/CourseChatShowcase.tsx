import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCheck,
  User,
  Users,
  ShieldCheck,
  Search,
  Paperclip,
  Smile,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileText,
  Volume2,
  Bot,
  Calendar,
  LineChart,
  Check,
  Copy,
  MoreHorizontal,
  Edit3,
  Trash2,
  Menu,
  Bell,
  Sun,
  Moon,
  Layers,
  Shield,
  GraduationCap,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Mic,
  Image as ImageIcon,
  Compass,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'mentor';
  senderName: string;
  avatarLabel: string;
  time: string;
  text: string;
  structuredDetails?: string[];
  copied?: boolean;
}

interface ConversationItem {
  id: string;
  title: string;
  date: string;
  unreadCount?: number;
  category: string;
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-1',
    title: 'Summarize the current student, teacher, and co...',
    date: '24 Oct',
    category: 'Admin & Operations',
  },
  {
    id: 'conv-2',
    title: 'Combined Maths 2026 Pure & Applied Doubts',
    date: 'Today',
    unreadCount: 3,
    category: 'Course Batch',
  },
  {
    id: 'conv-3',
    title: 'Physics Masterclass: Doppler Effect Derivations',
    date: 'Yesterday',
    category: 'Course Batch',
  },
  {
    id: 'conv-4',
    title: 'Chemistry Inorganic Equilibrium & Redox',
    date: '22 Oct',
    category: 'Course Batch',
  },
  {
    id: 'conv-5',
    title: 'Attendance & Term Mock Exam Analytics',
    date: '20 Oct',
    category: 'Analytics',
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    senderName: 'You',
    avatarLabel: 'A',
    time: '04:05',
    text: 'Summarize the current student, teacher, and course activity.',
  },
  {
    id: 'msg-2',
    sender: 'assistant',
    senderName: 'TiT AI',
    avatarLabel: 'AI',
    time: '04:05',
    text: 'I need a little more context before I can answer that follow-up. Which students, class, quiz, or users do you mean?',
  },
  {
    id: 'msg-3',
    sender: 'user',
    senderName: 'You',
    avatarLabel: 'A',
    time: '04:05',
    text: 'what about the attendace',
  },
  {
    id: 'msg-4',
    sender: 'assistant',
    senderName: 'TiT AI',
    avatarLabel: 'AI',
    time: '04:05',
    text: 'Here is the current attendance summary across active enrolled course batches:\n\n• Combined Mathematics 2026: 94.2% attendance (342 students enrolled, Eng. S. Perera)\n• A/L Physics Masterclass: 91.8% attendance (289 students enrolled, Dr. S. Gunawardana)\n• A/L Chemistry Inorganic: 88.5% attendance (215 students enrolled, Mrs. K. Jayasuriya)\n• Biology NIE Curriculum Group: 92.4% attendance (178 students enrolled, Dr. N. Wickramasinghe)\n\nOverall institutional average is 91.7%, with 12 pending absence justifications submitted in registration tickets.',
    structuredDetails: [
      'Combined Maths 2026: 94.2% (Top cohort attendance)',
      'Physics Masterclass: 91.8% (Live Zoom lab session)',
      'Chemistry Inorganic: 88.5% (Module 07 Equilibrium)',
      'Biology Study Group: 92.4% (Past Paper Revision)',
    ],
  },
];

export const CourseChatShowcase: React.FC = () => {
  const [viewMode, setViewMode] = useState<'interactive' | 'screenshot'>('interactive');
  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [leftNavCollapsed, setLeftNavCollapsed] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderName: 'You',
      avatarLabel: 'A',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = `Understood. Processing your query regarding "${query}". Grounded in TiT institutional course database.`;
      let details: string[] | undefined = undefined;

      const lower = query.toLowerCase();
      if (lower.includes('math') || lower.includes('integral') || lower.includes('perera')) {
        reply = `Combined Maths 2026 batch update: Eng. S. Perera confirmed that the integration by parts mark scheme (Unit 08) allocates 1 mark for substitution, 2 marks for tabular reduction, and 1 mark for final simplification + C. Tutorial 08 solutions are live in the materials vault.`;
        details = [
          'Paper II Part B marking rubric applied',
          '342 active students notified in channel',
          'Next live lecture: Saturday 8:00 AM (Zoom + Classroom)',
        ];
      } else if (lower.includes('physics') || lower.includes('doppler')) {
        reply = `Physics Masterclass update: Dr. S. Gunawardana's Doppler effect formula derivation λ′ = (v + w - u_s)/f₀ has been pinned in the physics room with full step justifications for approaching source cases with wind.`;
        details = [
          'Syllabus Unit 03 (Oscillations & Waves)',
          '91.8% cohort live attendance verified',
          'Drill quiz available in assessments tab',
        ];
      } else if (lower.includes('people') || lower.includes('student') || lower.includes('teacher')) {
        reply = `Workspace People Overview: 1,024 verified enrolled students, 28 senior faculty mentors, and 4 system administrators currently active in the TiT Enterprise workspace. All batch permissions are synchronized.`;
        details = [
          'Combined Maths: 342 Students | Eng. S. Perera',
          'Physics Masterclass: 289 Students | Dr. S. Gunawardana',
          'Chemistry: 215 Students | Mrs. K. Jayasuriya',
          'Biology: 178 Students | Dr. N. Wickramasinghe',
        ];
      } else if (lower.includes('assessment') || lower.includes('quiz')) {
        reply = `Assessments Status: 5 timed quizzes are currently published with real-time rubric grading. Average student score across pure mathematics is 78.4%. The next mock examination countdown is scheduled for Sunday.`;
        details = [
          'Active Quiz: Integration & Differential Equations',
          'Average completion time: 24 mins',
          'Automated rubric grading active',
        ];
      } else {
        reply = `Response from TiT Enterprise Assistant: Your query "${query}" has been logged and contextualized with your enrolled course batch. Mentors and teaching assistants receive instant push alerts for tagged questions.`;
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        senderName: 'TiT AI',
        avatarLabel: 'AI',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        text: reply,
        structuredDetails: details,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    }, 850);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0b0f17] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Top App Bar & View Toggle */}
      <div className="px-4 py-3 bg-[#0d131f] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: App Title and breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLeftNavCollapsed(!leftNavCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Admin</span>
              <span>/</span>
              <span className="text-slate-300 font-medium">Ai Assistant</span>
              <span>/</span>
              <span className="text-indigo-400 font-semibold">Course Chat</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>TiT AI Assistant & Course Chat</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                Enterprise Workspace
              </span>
            </h3>
          </div>
        </div>

        {/* View Mode Switcher: Interactive UI vs Screenshot */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Live UI</span>
            </button>
            <button
              onClick={() => setViewMode('screenshot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'screenshot'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Production App Screenshot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'screenshot' ? (
        /* View Mode 2: Real Production Screenshot Display */
        <div className="p-6 sm:p-8 bg-[#090d14] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>TiT Education Official Course Chat & AI Learning Platform</span>
              </div>
              <h4 className="text-xl font-bold text-white tracking-tight">
                Production Course Chat & AI Interface
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                This screenshot shows the live platform operations of the TiT AI Assistant, course chat conversations,
                attendance summaries, and workspace context tools.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('interactive')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>Try Live Class Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Screenshot Frame with High-Fidelity Glow */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group">
            <img
              src="/assets/aistudio/Screenshot_2026-10-26_at_22.12.48_ebf071d3.png"
              alt="TiT AI Assistant and Course-wise Chat application interface"
              className="w-full h-auto object-cover rounded-2xl cursor-pointer"
              onClick={() => setScreenshotModalOpen(true)}
            />
            {/* Quick Hover Zoom overlay */}
            <div
              onClick={() => setScreenshotModalOpen(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
            >
              <div className="bg-slate-900/90 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-xl">
                <Maximize2 className="w-4 h-4 text-indigo-400" />
                <span>Click to View Full Resolution</span>
              </div>
            </div>
          </div>

          {/* Screenshot Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#0f1624] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Menu className="w-4 h-4" />
                <span>School Admin Navigation</span>
              </div>
              <p className="text-xs text-slate-300">
                Full-tier role access with Students, Teachers, Registrations (12), Courses, and Quizzes modules.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f1624] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <MessageSquare className="w-4 h-4" />
                <span>Conversational Intelligence</span>
              </div>
              <p className="text-xs text-slate-300">
                Secure assistant session handling student doubts, teacher queries, and attendance tracking in real-time.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f1624] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Compass className="w-4 h-4" />
                <span>Workspace Context Panel</span>
              </div>
              <p className="text-xs text-slate-300">
                Direct shortcuts for People, Courses, Enrollments, Assessments, Attendance, and Insights data.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* View Mode 1: Exact Interactive Replica of the UI from Screenshot */
        <div className="flex flex-col bg-[#0b0f17]">
          {/* Top App Navigation Bar matching Screenshot */}
          <div className="px-4 py-2.5 bg-[#0e1422] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left breadcrumb & brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span>Admin</span>
                <span>/</span>
                <span className="text-slate-200">Ai Assistant</span>
              </div>
              <span className="text-sm font-bold text-white tracking-tight">TiT AI Assistant</span>
            </div>

            {/* Middle search bar */}
            <div className="relative flex-1 max-w-sm hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search platform... ⌘K"
                className="w-full bg-[#131b2e] border border-slate-700/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Right quick actions & user status */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSendMessage('Quick summary of active course rooms and pending assignments')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Actions ⌄</span>
              </button>

              <div className="hidden md:flex items-center gap-2 text-slate-400 pl-2 border-l border-slate-800">
                <button className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                  <Calendar className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors relative">
                  <Bell className="w-3.5 h-3.5" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1 right-1" />
                </button>
              </div>

              {/* User Identity Pill */}
              <div className="flex items-center gap-2 bg-[#131b2e] border border-slate-700/70 rounded-xl px-2.5 py-1 text-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  SA
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-[11px] font-bold leading-none">System Administrator</div>
                  <div className="text-[9px] text-slate-400 leading-none mt-0.5">Super Administrator ⌄</div>
                </div>
              </div>
            </div>
          </div>

          {/* Subheader Banner */}
          <div className="px-6 py-4 bg-[#0d131f] border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <span>Admin</span>
                <span>/</span>
                <span>Platform Operations</span>
                <span>/</span>
                <span className="text-indigo-400 font-medium">TiT AI</span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                TiT AI Assistant & Course Chat
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Premium conversational intelligence grounded in TiT institutional data and live platform analytics.
              </p>
            </div>

            <button
              onClick={() => {
                const newTitle = `Course Batch Session #${conversations.length + 1}`;
                const newConv: ConversationItem = {
                  id: `conv-${Date.now()}`,
                  title: newTitle,
                  date: 'Today',
                  category: 'Course Batch',
                };
                setConversations([newConv, ...conversations]);
                setSelectedConvId(newConv.id);
                setMessages([
                  {
                    id: `msg-${Date.now()}`,
                    sender: 'assistant',
                    senderName: 'TiT AI',
                    avatarLabel: 'AI',
                    time: 'Just now',
                    text: `Started new conversation "${newTitle}". How can I assist you with students, courses, or analytics today?`,
                  },
                ]);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>+ New chat</span>
            </button>
          </div>

          {/* Main 3-Pane Layout matching Screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
            {/* Leftmost LMS Drawer (Collapsible) */}
            {!leftNavCollapsed && (
              <div className="hidden xl:block xl:col-span-2 border-r border-slate-800/90 bg-[#090d15] p-3 text-xs space-y-4">
                {/* Brand */}
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                      TiT
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">ADMIN</div>
                      <div className="text-[10px] text-slate-400">Enterprise Workspace</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setLeftNavCollapsed(true)}
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Super Admin Mode Pill */}
                <div className="px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 text-[11px] font-semibold flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Super Admin Mode</span>
                </div>

                {/* Nav Groups */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Overview</span>
                    </div>
                    <ul className="space-y-0.5 text-slate-400">
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </li>
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
                        <LineChart className="w-3.5 h-3.5" />
                        <span>Analytics</span>
                      </li>
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5" />
                          <span>Notifications</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">1</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <span>User Management</span>
                    </div>
                    <ul className="space-y-0.5 text-slate-400">
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Students</span>
                      </li>
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
                        <Users className="w-3.5 h-3.5" />
                        <span>Teachers</span>
                      </li>
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Administrators</span>
                      </li>
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5" />
                          <span>Registrations</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">12</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <span>Academic Management</span>
                    </div>
                    <ul className="space-y-0.5 text-slate-400">
                      <li className="px-2 py-1.5 rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 font-semibold flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Courses & Chat</span>
                      </li>
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
                        <Users className="w-3.5 h-3.5" />
                        <span>Enrollments</span>
                      </li>
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Assignments</span>
                      </li>
                      <li className="px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Quizzes</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Alex Mercer Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2.5 px-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                    N
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Alex Mercer</div>
                    <div className="text-[10px] text-slate-400">Administrator</div>
                  </div>
                </div>
              </div>
            )}

            {/* Pane 1: Conversations List */}
            <div className={`${leftNavCollapsed ? 'xl:col-span-3' : 'xl:col-span-2'} lg:col-span-3 border-r border-slate-800/90 bg-[#0c121e] p-3 flex flex-col justify-between space-y-3`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Conversations</span>
                  <button
                    onClick={() => {
                      const newConv: ConversationItem = {
                        id: `conv-${Date.now()}`,
                        title: 'New Subject Discussion Thread',
                        date: 'Today',
                        category: 'Course Batch',
                      };
                      setConversations([newConv, ...conversations]);
                      setSelectedConvId(newConv.id);
                    }}
                    className="p-1 hover:text-white rounded"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* New Conversation Button */}
                <button
                  onClick={() => {
                    const newConv: ConversationItem = {
                      id: `conv-${Date.now()}`,
                      title: 'New Course Thread',
                      date: 'Today',
                      category: 'Course Batch',
                    };
                    setConversations([newConv, ...conversations]);
                    setSelectedConvId(newConv.id);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-indigo-700/60 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>+ New conversation</span>
                </button>

                {/* Search Conversations input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search conversations"
                    className="w-full bg-[#11192b] border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Conversations Threads list */}
                <div className="space-y-1.5 overflow-y-auto max-h-[440px] pr-1">
                  {filteredConversations.map((c) => {
                    const isSelected = c.id === selectedConvId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedConvId(c.id)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer border flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#162137] border-indigo-600/80 text-white shadow-sm'
                            : 'bg-transparent border-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-slate-200">{c.title}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                            <span>{c.date}</span>
                            {c.unreadCount && (
                              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-bold text-[9px]">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Course Batch quick status */}
              <div className="p-2.5 rounded-xl bg-[#11192b] border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-slate-200 block mb-0.5">Active Channel:</span>
                <span>Combined Maths 2026 (Eng. S. Perera)</span>
              </div>
            </div>

            {/* Pane 2: Middle Chat Feed matching Screenshot */}
            <div className={`${leftNavCollapsed ? 'xl:col-span-6' : 'xl:col-span-5'} lg:col-span-6 flex flex-col justify-between bg-[#090d16] border-r border-slate-800/90`}>
              {/* Header inside Conversation Area */}
              <div className="px-4 py-3 bg-[#0d1422] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                      {activeConv.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Assistant connected</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <button className="p-1 hover:text-white rounded hover:bg-slate-800">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (messages.length > 2) {
                        setMessages(messages.slice(0, 2));
                      }
                    }}
                    className="p-1 hover:text-white rounded hover:bg-slate-800"
                    title="Clear history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:text-white rounded hover:bg-slate-800">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sub-banner: Security verification */}
              <div className="px-4 py-2 bg-[#0c121e] border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Your assistant is ready to help</span>
                </div>
                <span className="text-[10px] text-slate-500">Secure assistant session</span>
              </div>

              {/* Message Stream */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[460px] min-h-[380px]">
                {messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                    >
                      {/* Sender line */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                        {!isUser && (
                          <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
                            <Sparkles className="w-3 h-3" />
                          </div>
                        )}
                        <span className="font-semibold text-slate-300">{m.senderName}</span>
                        <span>{m.time}</span>
                        {isUser && (
                          <div className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                            {m.avatarLabel}
                          </div>
                        )}
                      </div>

                      {/* Message Bubble matching Screenshot */}
                      {isUser ? (
                        <div className="max-w-md bg-indigo-600 text-white text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-md leading-relaxed">
                          {m.text}
                        </div>
                      ) : (
                        <div className="max-w-lg bg-[#141d2e] border border-slate-750/80 text-slate-200 text-xs sm:text-sm p-4 rounded-2xl rounded-tl-xs shadow-md space-y-2.5">
                          <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                          {m.structuredDetails && (
                            <div className="pt-2 border-t border-slate-700/60 space-y-1">
                              {m.structuredDetails.map((line, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-xs text-indigo-300">
                                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                  <span>{line}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action Button: Copy Response */}
                          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                            <button
                              onClick={() => handleCopy(m.text, m.id)}
                              className="flex items-center gap-1.5 hover:text-white text-slate-400 transition-colors cursor-pointer"
                            >
                              {copiedId === m.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-medium">Copied to clipboard</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy response</span>
                                </>
                              )}
                            </button>
                            <span className="text-[10px] text-slate-500">Verified TiT Assistant</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
                    <div className="w-4 h-4 rounded bg-indigo-600/50 flex items-center justify-center animate-spin">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span>TiT AI Assistant is preparing verified response...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Interactive Input Bar */}
              <div className="p-3 bg-[#0d131f] border-t border-slate-800 space-y-2">
                {/* Prompt Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <button
                    onClick={() => handleSendMessage('what about the attendace')}
                    className="px-2.5 py-1 rounded-full bg-[#141d2e] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shrink-0 cursor-pointer transition-colors"
                  >
                    What about the attendance?
                  </button>
                  <button
                    onClick={() => handleSendMessage('Show current student doubts in Combined Maths 2026')}
                    className="px-2.5 py-1 rounded-full bg-[#141d2e] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shrink-0 cursor-pointer transition-colors"
                  >
                    Combined Maths doubts
                  </button>
                  <button
                    onClick={() => handleSendMessage('Summarize the current student, teacher, and course activity.')}
                    className="px-2.5 py-1 rounded-full bg-[#141d2e] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shrink-0 cursor-pointer transition-colors"
                  >
                    Summarize activity
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask anything about courses, doubts, past papers, or student analytics..."
                      className="w-full bg-[#121929] border border-slate-700/80 rounded-xl pl-3 pr-20 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                    />
                    <div className="absolute right-2 top-2 flex items-center gap-1 text-slate-400">
                      <button
                        type="button"
                        className="p-1 hover:text-slate-200 transition-colors"
                        title="Attach past paper or solution"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="p-1 hover:text-slate-200 transition-colors"
                        title="Voice note query"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Pane 3: Right Sidebar "WORKSPACE CONTEXT" matching Screenshot */}
            <div className="xl:col-span-3 lg:col-span-3 bg-[#0a0e17] p-4 text-xs space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Workspace Context</span>
              </div>

              {/* Status Card */}
              <div className="p-3 rounded-2xl bg-[#101726] border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Status
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ready to help</span>
                </div>
              </div>

              {/* Admin Access Card with 8 Grid Buttons */}
              <div className="p-3 rounded-2xl bg-[#101726] border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Admin Access</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Ask about the areas available in your administration workspace.
                </p>

                {/* 8-Tile Shortcut Grid matching Screenshot */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {[
                    { label: 'People', icon: <Users className="w-3.5 h-3.5 text-indigo-400" />, query: 'Show summary of verified students and teachers' },
                    { label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5 text-indigo-400" />, query: 'List active A/L syllabus courses and enrolled batches' },
                    { label: 'Enrollments', icon: <User className="w-3.5 h-3.5 text-indigo-400" />, query: 'Show enrollment status and batch capacity' },
                    { label: 'Assessments', icon: <FileText className="w-3.5 h-3.5 text-indigo-400" />, query: 'Check current timed quiz assessments and marks' },
                    { label: 'Attendance', icon: <Calendar className="w-3.5 h-3.5 text-indigo-400" />, query: 'what about the attendace' },
                    { label: 'Insights', icon: <LineChart className="w-3.5 h-3.5 text-indigo-400" />, query: 'Generate student progression and Z-score insights' },
                    { label: 'Messages', icon: <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />, query: 'Check unread doubts and messages from students' },
                    { label: 'Schedules', icon: <Clock className="w-3.5 h-3.5 text-indigo-400" />, query: 'Show upcoming live lectures and submission deadlines' },
                  ].map((tile, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(tile.query)}
                      className="flex items-center gap-1.5 p-2 rounded-xl bg-[#151f33] hover:bg-[#1a263e] border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors cursor-pointer text-left"
                    >
                      {tile.icon}
                      <span className="truncate">{tile.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Privacy Card */}
              <div className="p-3 rounded-2xl bg-[#101726] border border-slate-800 space-y-1 text-slate-400">
                <div className="text-xs font-bold text-white">Data privacy</div>
                <p className="text-[11px] leading-relaxed">
                  Your conversations stay within the information available to your administrator workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Screenshot Modal if user wants to examine the original PNG */}
      {screenshotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="relative max-w-5xl w-full bg-slate-900 rounded-3xl border border-slate-700 p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Original TiT AI Course Chat UI (Production Screenshot)</span>
              </div>
              <button
                onClick={() => setScreenshotModalOpen(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl">
              <img
                src="/assets/aistudio/Screenshot_2026-10-26_at_22.12.48_ebf071d3.png"
                alt="TiT Course Chat Screenshot full view"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
