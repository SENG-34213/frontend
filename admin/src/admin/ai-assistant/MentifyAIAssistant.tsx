import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Copy,
  RotateCcw,
  Check,
  Bot,
  User,
  Plus,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Award,
  Shield,
  CornerDownLeft,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const MentifyAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "assistant",
      content:
        "Hello Alex! I am **Mentify AI**, your institutional administrative assistant. I have real-time visibility into your Spring Boot microservices, Keycloak authentication realms, course enrollment ratios, and attendance trends. How can I assist you with platform oversight today?",
      timestamp: "07:00 AM",
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const suggestedPrompts = [
    {
      label: "Summarize platform registration growth",
      icon: TrendingUp,
      prompt:
        "Provide a structured summary of student and teacher registration velocity for October 2026.",
    },
    {
      label: "Review quiz performance variance",
      icon: Award,
      prompt: "Analyze quiz score variances across Advanced Calculus and Data Structures.",
    },
    {
      label: "Check upcoming exam hall conflicts",
      icon: HelpCircle,
      prompt: "Are there any overlapping examination venues scheduled between Oct 25 and Nov 04?",
    },
    {
      label: "Audit Keycloak token rotation logs",
      icon: Shield,
      prompt: "Summarize the recent Keycloak SSO security events and password invitation states.",
    },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsThinking(true);

    // Domain intelligence response simulation
    setTimeout(() => {
      let responseText = "";

      if (
        prompt.toLowerCase().includes("registration") ||
        prompt.toLowerCase().includes("growth")
      ) {
        responseText = `### 📊 Institutional Registration Synthesis
Based on data from the **Spring Boot User Service**:
- **Total Registered Students**: 1,420 (up +8.4% term-over-term).
- **Active Faculty Members**: 84 verified teachers across 4 departments.
- **Pending Keycloak Invitations**: 12 accounts (including 2 teachers and 10 students) awaiting password activation.
- **Recommendation**: Dispatched reminder notifications are recommended for \`amara.okonkwo@mentify.edu\` and \`priya.nambiar@mentify.edu\` before the upcoming enrollment lockout on Monday.`;
      } else if (
        prompt.toLowerCase().includes("quiz") ||
        prompt.toLowerCase().includes("performance")
      ) {
        responseText = `### 🎯 Quiz Evaluation & Score Analytics
- **MATH-401 (Advanced Calculus)**: Mean score of **84.5%** with a **92.4% pass rate**. Students performed exceptionally on Lagrange error bounds.
- **CS-302 (Data Structures & Algorithms)**: Mean score of **78.2%** with **86.0% pass rate**. Dynamic programming recurrences showed a slight dip in quartile 1.
- **PHYS-402 (Quantum Foundations)**: Highest pass rate at **94.7%** (average score 88.0%).
- **Curriculum Note**: Consider scheduling an optional clinic session for CS-302 recursive tree balancing prior to the practical coding assessment.`;
      } else if (
        prompt.toLowerCase().includes("exam") ||
        prompt.toLowerCase().includes("conflict")
      ) {
        responseText = `### 🏛️ Examination Timetable Verification
I inspected all **9 scheduled examinations** for Fall 2026:
- **MATH-401 Midterm**: Oct 25, 09:00 AM – 11:30 AM in *Science Hall Auditorium B* (68 candidates).
- **CS-302 Practical Coding Exam**: Oct 29, 01:30 PM – 04:00 PM in *Turing Lab 304* (82 candidates).
- **BIO-204 Theory Examination**: Nov 04, 10:00 AM – 12:00 PM in *BioTech Seminar Hall 101* (54 candidates).
- **Status**: ✅ **Zero room conflicts or proctor overlaps detected**. Capacities are within certified safety limits.`;
      } else {
        responseText = `### 💡 Administrative Assessment
Here is the operational perspective for: "${prompt}"

1. **Microservices Status**: All 6 services (User, Course, Enrollment, Assessment, Material, AI) are operating nominally with sub-25ms PostgreSQL query latencies.
2. **Access Control**: Role-based access control (RBAC) enforced via Keycloak realm \`mentify-prod\`.
3. **Action Items**: No critical security anomalies detected in the last 24 hours. 4 administrative capacity approvals await your review in Course Management.`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 900);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        content: "New administrative workspace session initiated. How can I help you, Alex?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentify AI Assistant"
        description="Enterprise AI intelligence agent grounded in Mentify institutional data, microservices, and educational analytics."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Platform Operations" },
          { label: "Mentify AI" },
        ]}
        actions={
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat Session</span>
          </button>
        }
      />

      {/* Main Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Suggested Queries Sidebar (1 col) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Suggested Administrative Inquiries
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instant prompts utilizing authorized institutional analytics tools
            </p>
          </div>

          <div className="space-y-2">
            {suggestedPrompts.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {p.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{p.prompt}</p>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-600 dark:text-slate-300 block">
              Authorized Capabilities:
            </span>
            <span>• Cross-table student & course queries</span>
            <br />
            <span>• Grade distribution analysis</span>
            <br />
            <span>• Examination conflict detection</span>
          </div>
        </div>

        {/* Conversation Viewport (3 cols) */}
        <div className="lg:col-span-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] shadow-xs overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => {
              const isAi = msg.sender === "assistant";

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? "" : "flex-row-reverse"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isAi ? "bg-indigo-600 text-white" : "bg-slate-700 text-white"
                    }`}
                  >
                    {isAi ? <Sparkles className="w-3.5 h-3.5" /> : "AM"}
                  </div>

                  <div
                    className={`max-w-2xl text-xs space-y-1.5 ${isAi ? "text-left" : "text-right"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {isAi ? "Mentify AI" : "Alex Mercer"}
                      </span>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-left leading-relaxed ${
                        isAi
                          ? "bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      {/* Markdown prose renderer */}
                      <div className="whitespace-pre-wrap space-y-2">{msg.content}</div>

                      {isAi && (
                        <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy response</span>
                              </>
                            )}
                          </button>
                          <span className="text-[10px] text-slate-400">
                            Model: gemini-3.8-flash · Real-time grounded
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Synthesizing microservices data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Input Bar */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask Mentify AI about students, courses, attendance, or audit metrics..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isThinking}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
