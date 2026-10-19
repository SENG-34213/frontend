"use client";
import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const MentifyAIView: React.FC = () => {
  const { aiChats, sendAiQuery, isAiLoading, showToast } = useStudent();
  const [inputQuery, setInputQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const samplePrompts = [
    {
      category: "Algorithms & Proofs",
      prompt:
        "Explain why Dijkstra fails with negative edge weights and how Bellman-Ford resolves it",
      course: "CS 301",
    },
    {
      category: "Machine Learning",
      prompt: "Explain why scaling by 1/sqrt(d_k) is required in multi-head Transformer attention",
      course: "CS 440",
    },
    {
      category: "Distributed Systems",
      prompt: "How does Raft resolve concurrent split votes during leader elections?",
      course: "CS 325",
    },
    {
      category: "Exam Preparation",
      prompt: "Generate 3 high-yield midterm practice questions on Red-Black Tree invariants",
      course: "CS 301",
    },
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAiLoading) return;
    const q = inputQuery;
    setInputQuery("");
    await sendAiQuery(q);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied answer to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-4 pb-12">
      {/* AI Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/70 p-5 dark:border-indigo-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Academic Intelligence Model</span>
              <span>·</span>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                Coursework Context Synchronized
              </span>
            </div>
            <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Mentify AI — Intelligent Study Companion
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Active syllabi: CS 301, CS 440, CS 325, DES 210
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900 shadow-2xs overflow-hidden min-h-[500px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {aiChats.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 max-w-3xl ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                }`}
              >
                {msg.sender === "user" ? "AR" : <Sparkles className="h-4 w-4" />}
              </div>

              <div className="space-y-3 min-w-0 flex-1">
                <div
                  className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white font-medium rounded-tr-none"
                      : "border border-slate-200 bg-slate-50/70 text-slate-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 rounded-tl-none"
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.text}</div>

                  {/* Code block if present */}
                  {msg.codeBlock && (
                    <div className="mt-4 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{msg.codeBlock.language}</span>
                        <button
                          onClick={() => handleCopy(msg.codeBlock!.code, msg.id)}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedId === msg.id ? "Copied" : "Copy Code"}</span>
                        </button>
                      </div>
                      <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-slate-200">
                        <code>{msg.codeBlock.code}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* Follow up suggested questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">Suggested:</span>
                    {msg.suggestedQuestions.map((sq) => (
                      <button
                        key={sq}
                        onClick={() => sendAiQuery(sq)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isAiLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span>Mentify AI is synthesizing lecture notes & mathematical proofs...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompt Grid (if only welcome message) */}
        {aiChats.length <= 1 && (
          <div className="border-t border-slate-100 p-4 sm:p-6 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Explore Academic Concept Queries:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {samplePrompts.map((p) => (
                <button
                  key={p.prompt}
                  onClick={() => sendAiQuery(p.prompt)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {p.course} · {p.category}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {p.prompt}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Form */}
        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isAiLoading}
            placeholder="Ask Mentify AI about your coursework, assignments, or midterm review..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={isAiLoading || !inputQuery.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-2xs shrink-0"
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
