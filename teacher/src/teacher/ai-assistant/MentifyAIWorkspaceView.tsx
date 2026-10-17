import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  FileText,
  Layers,
  ArrowRight,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  sender: 'teacher' | 'ai';
  text: string;
  timestamp: string;
}

interface MentifyAIWorkspaceViewProps {
  initialPrompt?: string;
}

const suggestedPrompts = [
  {
    title: 'Draft Quiz Questions',
    prompt: 'Generate 5 conceptual multiple-choice questions for CS-201 Data Structures on AVL Tree rotations with detailed rationales.',
    icon: HelpCircle,
  },
  {
    title: 'Explain Complex Topic',
    prompt: 'Explain the Master Theorem for divide-and-conquer recurrence relations using intuitive analogies suitable for 2nd-year undergraduates.',
    icon: Lightbulb,
  },
  {
    title: 'Lesson Plan & Objectives',
    prompt: 'Create a 50-minute interactive lesson plan for teaching Dijkstra’s Shortest Path Algorithm with a hands-on whiteboard activity.',
    icon: Layers,
  },
  {
    title: 'Rubric Criteria Formulation',
    prompt: 'Draft an evaluation rubric for a full-stack Spring Boot microservices project with idempotent event consumers and transaction outboxes.',
    icon: FileText,
  },
];

export const MentifyAIWorkspaceView: React.FC<MentifyAIWorkspaceViewProps> = ({
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello Professor Rivera! I'm Mentify AI, your dedicated curriculum and teaching assistant. 

How can I assist you today? I can help draft assessment rubrics, author randomized quiz questions, design engaging classroom activities, or summarize student performance trends across your courses.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'teacher',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let aiResponseText = '';

      // Check if GEMINI_API_KEY is available in browser process.env
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are Mentify AI, an expert educational pedagogical assistant for university professor Dr. Alex Rivera (Associate Professor of Computer Science). Answer the following teacher query with high rigor, clear structure, and academic precision:\n\n${query}`,
                },
              ],
            },
          ],
        });
        aiResponseText = response.text || 'I have analyzed your request.';
      } else {
        // High fidelity domain-specific fallback responses matching teacher workflows
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (query.toLowerCase().includes('quiz') || query.toLowerCase().includes('question')) {
          aiResponseText = `### Generated Assessment Questions for CS-201: AVL Trees

**Question 1 (Multiple Choice):**
*When inserting into an AVL tree, what sequence of rotations is required when a node is inserted into the left subtree of the right child (Right-Left case)?*
- A) Single Right Rotation
- B) Right Rotation followed by Left Rotation (Double RL Rotation) *(Correct)*
- C) Single Left Rotation
- D) Two consecutive Left Rotations
*Explanation:* In an RL heavy subtree, a right rotation on the child converts the imbalance into a symmetric RR heavy state, followed by a left rotation on the parent to restore the balance factor.

**Question 2 (Multiple Choice):**
*What is the maximum theoretical height of an AVL tree containing $n$ nodes?*
- A) $\\approx 1.00 \\log_2(n)$
- B) $\\approx 1.44 \\log_2(n)$ *(Correct)*
- C) $\\approx 2.00 \\log_2(n)$
- D) $O(\\sqrt{n})$
*Explanation:* Fibonacci trees represent the minimally populated AVL trees of height $h$, giving the bound $h \\le 1.4404 \\log_2(n + 2) - 0.328$.

**Question 3 (Conceptual Short Answer):**
*Explain why maintaining a height cache on each node is superior to computing height recursively during rotations.*
*Sample Solution:* Recursive computation requires $O(n)$ time per node visit, degrading tree operations to $O(n)$. Storing height locally allows $O(1)$ updates using $1 + \\max(\\text{left.height}, \\text{right.height})$.`;
        } else if (query.toLowerCase().includes('lesson') || query.toLowerCase().includes('dijkstra')) {
          aiResponseText = `### 50-Minute Interactive Lesson Plan: Dijkstra's Shortest Path

**Target Course:** CS-201 Data Structures & Algorithms  
**Prerequisites:** Priority Queues, Binary Min-Heaps, Adjacency Lists

#### 1. Warm-Up & Motivation (8 Mins)
- Prompt students: "How does GPS routing re-calculate turns when a road is congested?"
- Distinguish between unweighted BFS ($O(V+E)$) and non-negative weighted graphs.

#### 2. The Invariant & Greedy Choice (15 Mins)
- Core theorem: Once a vertex is extracted from the min-heap, its shortest distance is finalized.
- Derivation of the Relaxation step:
  \`if (dist[u] + weight(u, v) < dist[v]) { dist[v] = dist[u] + weight(u, v); }\`

#### 3. Live Whiteboard Step-Through (17 Mins)
- Draw a 6-node weighted graph on the projector.
- Have students track the min-priority queue state and distance array in small pairs.
- Highlight common pitfalls: Negative cycle failure and why Dijkstra fails on negative edges.

#### 4. Asymptotic Breakdown & Summary (10 Mins)
- Compare $O(V^2)$ (array) vs $O((V+E) \\log V)$ (binary heap) vs $O(E + V \\log V)$ (Fibonacci heap).`;
        } else {
          aiResponseText = `### Pedagogical Recommendations for Dr. Alex Rivera

1. **Active Retrieval Practice:** Introduce a 3-minute starter quiz at the beginning of each lecture to reinforce the previous lecture's core invariants.
2. **Project Milestone Breakdown:** For large multi-week assignments (such as the Kafka distributed order pipeline in CS-350), provide milestone checkpoints to prevent student submission bottlenecks.
3. **Targeted Office Hour Clusters:** Schedule a 30-minute group review focused on recursive stack frames for the 3 students currently flagged as At-Risk in CS-201.`;
        }
      }

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        sender: 'ai',
        text: 'I encountered a temporary connection issue. Please try again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs -m-4 lg:-m-6">
      {/* Left Sidebar: Prompts & History */}
      <aside className="w-full lg:w-72 bg-slate-50/80 border-r border-slate-200 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Mentify AI</h3>
                <p className="text-[10px] text-violet-700 font-medium">Faculty Assistant</p>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: `new-${Date.now()}`,
                    sender: 'ai',
                    text: 'Started fresh session. How can I assist your teaching today?',
                    timestamp: 'Just now',
                  },
                ])
              }
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Start New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1 mb-1">
              Suggested Teaching Prompts
            </p>
            {suggestedPrompts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200/80 bg-white hover:border-violet-300 hover:bg-violet-50/40 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2 text-slate-700 group-hover:text-violet-800 font-semibold mb-0.5">
                    <Icon className="w-3.5 h-3.5 text-violet-600" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-violet-50 border border-violet-100 rounded-lg text-xs text-violet-900 mt-4">
          <span className="font-semibold block mb-0.5">Academic Privacy Guard</span>
          <p className="text-[11px] text-violet-700 leading-snug">
            All curriculum prompts comply with institutional FERPA privacy standards.
          </p>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((m) => {
            const isUser = m.sender === 'teacher';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 shadow-2xs ${
                    isUser ? 'bg-indigo-600 text-white' : 'bg-violet-600 text-white'
                  }`}
                >
                  {isUser ? 'AR' : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div className={`space-y-1.5 ${isUser ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-700">
                      {isUser ? 'Prof. Alex Rivera' : 'Mentify AI'}
                    </span>
                    <span>·</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-200/90 text-slate-900 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-2 pt-1 px-1">
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied to clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy response</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-md">
              <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-600" />
                <span>Mentify AI is synthesizing pedagogical guidance...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Mentify AI to generate questions, explain concepts, or create lesson plans..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Query</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
