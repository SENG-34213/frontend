import React, { useState } from 'react';
import {
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  LineChart,
  MessageSquare,
  PlayCircle,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface HeroInteractivePreviewProps {
  onNavigate?: (path: string) => void;
}

export const HeroInteractivePreview: React.FC<HeroInteractivePreviewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'ai' | 'calendar' | 'analytics'>('chat');

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Glow backdrop effect */}
      <div className="absolute -top-12 -right-12 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main SaaS Canvas Window */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-indigo-950/30 overflow-hidden backdrop-blur-sm transition-colors">
        {/* Mock Window Top Bar */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">tit-app.edu.lk/lms-suite</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Learning Live</span>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-2 gap-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Course Chat
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            AI Coach
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Calendar & Deadlines
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Grading & Analytics
          </button>
        </div>

        {/* Tab 1: Course Chat Preview */}
        {activeTab === 'chat' && (
          <div className="p-5 sm:p-6 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-900 dark:text-white">
                  TiT AI & Course Batch Room
                </span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-bold">
                  Live
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Combined Maths 2026
              </span>
            </div>

            <div className="space-y-2.5">
              {/* User Bubble matching screenshot */}
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>04:05</span>
                  <span className="font-semibold text-slate-300">You</span>
                  <div className="w-4 h-4 rounded-full bg-slate-700 text-white font-bold text-[8px] flex items-center justify-center">
                    A
                  </div>
                </div>
                <div className="bg-indigo-600 text-white text-xs px-3.5 py-2 rounded-2xl rounded-tr-xs shadow-sm max-w-sm">
                  Summarize the current student, teacher, and course activity.
                </div>
              </div>

              {/* Assistant Bubble matching screenshot */}
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <div className="w-4 h-4 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[8px] font-black">
                    TiT
                  </div>
                  <span className="font-bold text-indigo-400">TiT AI</span>
                  <span>04:05</span>
                </div>
                <div className="bg-slate-100 dark:bg-[#131b2c] border border-slate-200 dark:border-slate-750 p-3 rounded-2xl rounded-tl-xs text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm max-w-sm">
                  Combined Maths 2026 has 94.2% attendance. Eng. S. Perera uploaded Tutorial 08 solutions to the vault.
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                342 active students • 28 senior mentors
              </span>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('features')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Open Full 3-Pane Chat <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: AI Study Coach Preview */}
        {activeTab === 'ai' && (
          <div className="p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                ST
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed max-w-sm">
                <p className="font-semibold text-slate-900 dark:text-white mb-1">A/L Pure Maths Q4 (b):</p>
                How do I prove cos 3θ without expanding triple angles directly?
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/90 dark:border-indigo-900/60 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    TiT Syllabus AI Tutor
                  </span>
                  <Badge variant="accent" size="sm">
                    Step-by-Step
                  </Badge>
                </div>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300 font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                  <p>1. Rewrite cos(3θ) = cos(2θ + θ)</p>
                  <p>2. Use cos(A+B) = cos A cos B - sin A sin B</p>
                  <p>3. Substitute sin²θ = 1 - cos²θ</p>
                  <p className="text-indigo-700 dark:text-indigo-400 font-bold">⇒ Result: 4cos³θ - 3cosθ</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Ref: G.C.E. A/L Pure Maths Syllabus Unit 3.2 (Page 44)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Calendar & Deadlines Preview */}
        {activeTab === 'calendar' && (
          <div className="p-5 sm:p-6 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">Upcoming Academic Milestones</span>
              <span className="text-[11px] font-semibold text-amber-600">November 2026 Term</span>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'A/L Combined Maths: Integration Proofs', date: 'Wednesday · 8:30 AM', type: 'Live Lecture', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
                { title: 'Mechanics Tutorial 04 Submission', date: 'Friday · 11:59 PM', type: 'Assignment Due', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
                { title: 'Physics Wave Motion MCQ Speed Drill', date: 'Sunday · 4:00 PM', type: 'Timed Quiz', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">{item.title}</h5>
                    <p className="text-[11px] text-slate-500">{item.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.badge}`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Grading & Analytics Preview */}
        {activeTab === 'analytics' && (
          <div className="p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Average</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">91.4%</span>
              </div>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl">
                <span className="text-indigo-400 block text-[10px]">Island Rank</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">Top 2.2%</span>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl">
                <span className="text-emerald-400 block text-[10px]">Est. Z-Score</span>
                <span className="text-base font-extrabold text-emerald-600">2.185</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Calculus & Mechanics Mastery</span>
                <span className="text-indigo-600 dark:text-indigo-400">94% High Distinction</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full w-[94%]" />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Audited by TiT Examination Board with official grading report cards.
            </p>
          </div>
        )}

        {/* Floating Metrics Badge & Interactive Gateway */}
        <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium">All 5 Features Live in TiT Core</span>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('features')}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              Test Interactive Suite <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
