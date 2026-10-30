import React from 'react';
import {
  MessageSquare,
  Bot,
  Calendar,
  FileCheck,
  LineChart,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  GraduationCap,
  Clock,
  Award,
} from 'lucide-react';
import { FeatureTabKey } from '../features/InteractiveAppSuite';

export interface SimpleHowItWorksProps {
  onSelectFeature?: (tab: FeatureTabKey) => void;
  onOpenAdmissions?: () => void;
}

export const SimpleHowItWorks: React.FC<SimpleHowItWorksProps> = ({
  onSelectFeature,
  onOpenAdmissions,
}) => {
  const steps = [
    {
      step: '01',
      title: 'Join Your Subject Group Chat',
      summary:
        'When you enroll in a course (Combined Maths, Physics, Chemistry, Biology, or Commerce), you instantly join a dedicated group chat with your verified teacher and classmates.',
      featureKey: 'chat' as FeatureTabKey,
      icon: <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      tag: 'Direct Teacher Access',
      tagColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      highlightBadge: 'Real-Time Mentorship',
      samplePreview: (
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Physics A/L 2026 Batch</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Teacher Online
            </span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
              KS
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">Mr. K. Senthil:</span> "Model paper 04 questions 5 to 8 are posted. Let me know if you need hints!"
            </p>
          </div>
        </div>
      ),
    },
    {
      step: '02',
      title: 'Ask Questions & Get 24/7 AI Answers',
      summary:
        'Stuck on a tricky past-paper derivation late at night? Ask our TiT AI Tutor in English, Tamil, or Sinhala for step-by-step working aligned with official marking schemes.',
      featureKey: 'ai' as FeatureTabKey,
      icon: <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      tag: '24/7 Instant Help',
      tagColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      highlightBadge: 'Trilingual AI Tutor',
      samplePreview: (
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-300">AI Problem Solver</span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">Instant Response</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
              AI
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">TiT AI:</span> "For projectile range on flat ground, R = (u² sin 2θ) / g. Let us break down the steps..."
            </p>
          </div>
        </div>
      ),
    },
    {
      step: '03',
      title: 'Practice Quizzes & Track Your Z-Score',
      summary:
        'Stay organized with your synchronized class calendar, test yourself with timed past paper quizzes, and watch your grade progression curve and estimated Z-score rise.',
      featureKey: 'quiz' as FeatureTabKey,
      icon: <LineChart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      tag: 'Exam Readiness',
      tagColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      highlightBadge: 'Z-Score Analytics',
      samplePreview: (
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Term Progress</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Score: 92% (A)</span>
          </div>
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="text-[11px]">Estimated Z-Score: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">1.94</strong></span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">Moratuwa Qualified</span>
          </div>
        </div>
      ),
    },
  ];

  const handleTestDrive = (tab: FeatureTabKey) => {
    if (onSelectFeature) {
      onSelectFeature(tab);
    }
    const elem = document.getElementById('features-demo');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with simple plain english messaging */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple 3-Step Experience</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How TiT Works for Every Student
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          No complicated setup or confusing dashboards. Everything you need to understand your syllabus, ask questions, and pass your exams is ready in three simple steps.
        </p>
      </div>

      {/* 3 Steps Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((item, index) => (
          <div
            key={index}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top Step Number & Icon */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-3xl font-black text-slate-200 dark:text-slate-800 select-none">
                  {item.step}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.tagColor}`}>
                  {item.highlightBadge}
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {item.summary}
              </p>

              {/* Realistic Mini Preview Snippet */}
              <div className="mb-4">
                {item.samplePreview}
              </div>
            </div>

            {/* Test Drive Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleTestDrive(item.featureKey)}
                className="w-full flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1.5 transition-colors cursor-pointer group-hover:underline"
              >
                <span>Test this feature live</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Interactive Feature Shortcuts Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            5-in-1
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Try TiT Core Tools Right Here:
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Click any tool to open its live interactive simulator below
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTestDrive('chat')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
            <span>Course Chat</span>
          </button>

          <button
            type="button"
            onClick={() => handleTestDrive('ai')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 shadow-xs transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-purple-500" />
            <span>AI Study Bot</span>
          </button>

          <button
            type="button"
            onClick={() => handleTestDrive('calendar')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => handleTestDrive('quiz')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-xs transition-all cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Quizzes</span>
          </button>

          <button
            type="button"
            onClick={() => handleTestDrive('analytics')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 shadow-xs transition-all cursor-pointer"
          >
            <LineChart className="w-3.5 h-3.5 text-cyan-500" />
            <span>Grading & Rank</span>
          </button>
        </div>
      </div>
    </div>
  );
};
