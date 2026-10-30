import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Calendar,
  FileCheck,
  LineChart,
  Maximize2,
  X,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { CourseChatShowcase } from './CourseChatShowcase';
import { AIChatbotShowcase } from './AIChatbotShowcase';
import { AcademicCalendarShowcase } from './AcademicCalendarShowcase';
import { QuizAssignmentShowcase } from './QuizAssignmentShowcase';
import { GradingAnalyticsShowcase } from './GradingAnalyticsShowcase';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export type FeatureTabKey = 'chat' | 'ai' | 'calendar' | 'quiz' | 'analytics';

export interface InteractiveAppSuiteProps {
  initialTab?: FeatureTabKey;
  activeTab?: FeatureTabKey;
  onTabChange?: (tab: FeatureTabKey) => void;
  onOpenAdmissions?: () => void;
}

interface TabConfig {
  key: FeatureTabKey;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  tag: string;
  badge: string;
  colorClass: string;
  badgeColorClass: string;
  activeBorderClass: string;
  activeBgClass: string;
  highlights: string[];
}

const TAB_SCREENSHOTS: Record<
  FeatureTabKey,
  { src: string; title: string; subtitle: string; portal: string }
> = {
  ai: {
    src: '/assets/aistudio/Screenshot_2026-10-30_at_03.55.45_ebe14d69.png',
    title: 'TiT AI Assistant',
    subtitle: 'Admin and teacher natural language platform queries and real-time user metrics',
    portal: 'Admin Portal',
  },
  chat: {
    src: '/assets/aistudio/Screenshot_2026-10-30_at_03.52.50_588ec326.png',
    title: 'Direct & Group Communication',
    subtitle: 'Batch-isolated class chat streams (Mathematics, Biology, Science) with direct mentor responses',
    portal: 'Teacher Portal',
  },
  calendar: {
    src: '/assets/aistudio/Screenshot_2026-10-30_at_04.01.21_0a36d13b.png',
    title: 'Academic Calendar Maintenance',
    subtitle: 'Unified timetable for live classes, assignment deadlines, quizzes, and examinations',
    portal: 'Student Portal',
  },
  quiz: {
    src: '/assets/aistudio/Screenshot_2026-10-30_at_04.05.37_5f1e7054.png',
    title: 'AI Quiz & Live Assessment Workspace',
    subtitle: 'Exam-conditioned testing environment with Question Navigator, timer, and review flagging',
    portal: 'Student Portal',
  },
  analytics: {
    src: '/assets/aistudio/Screenshot_2026-10-30_at_03.55.45_ebe14d69.png',
    title: 'Diagnostic Analytics & Reports',
    subtitle: 'Institution-wide data, role breakdown, and student academic progress curves',
    portal: 'Admin Portal',
  },
};

export const InteractiveAppSuite: React.FC<InteractiveAppSuiteProps> = ({
  initialTab = 'chat',
  activeTab: controlledTab,
  onTabChange,
  onOpenAdmissions,
}) => {
  const [internalTab, setInternalTab] = useState<FeatureTabKey>(initialTab);
  const [viewMode, setViewMode] = useState<'demo' | 'screenshot'>('demo');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeTab = controlledTab ?? internalTab;

  React.useEffect(() => {
    if (initialTab) {
      setInternalTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSelect = (key: FeatureTabKey) => {
    setInternalTab(key);
    if (onTabChange) {
      onTabChange(key);
    }
  };

  const tabs: TabConfig[] = [
    {
      key: 'chat',
      label: 'Direct & Group Chat',
      sublabel: 'Mentor & peer rooms',
      icon: <MessageSquare className="w-4 h-4" />,
      tag: 'Collaboration',
      badge: 'Live Rooms',
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      badgeColorClass: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
      activeBorderClass: 'border-indigo-500 ring-2 ring-indigo-500/20',
      activeBgClass: 'bg-white dark:bg-slate-800',
      highlights: [
        'Batch-specific channels for Mathematics, Biology, Science',
        'Direct doubt tagging with verified mentor responses',
        'Peer discussion & marking scheme debates',
      ],
    },
    {
      key: 'ai',
      label: 'TiT AI Assistant',
      sublabel: 'Operations & syllabus AI',
      icon: <Bot className="w-4 h-4" />,
      tag: 'Intelligence',
      badge: '24/7 AI',
      colorClass: 'text-cyan-600 dark:text-cyan-400',
      badgeColorClass: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300',
      activeBorderClass: 'border-cyan-500 ring-2 ring-cyan-500/20',
      activeBgClass: 'bg-white dark:bg-slate-800',
      highlights: [
        'Instant answers on system stats, rosters, and syllabus steps',
        'Step-by-step calculus proofs & Doppler effect derivations',
        'Trilingual support in English, Tamil, and Sinhala',
      ],
    },
    {
      key: 'calendar',
      label: 'Academic Calendar',
      sublabel: 'Lectures, quizzes & exams',
      icon: <Calendar className="w-4 h-4" />,
      tag: 'Scheduling',
      badge: 'Live Sync',
      colorClass: 'text-amber-600 dark:text-amber-400',
      badgeColorClass: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
      activeBorderClass: 'border-amber-500 ring-2 ring-amber-500/20',
      activeBgClass: 'bg-white dark:bg-slate-800',
      highlights: [
        'Synchronized live Zoom & tuition class timetables',
        'Homework submission deadlines with countdown clocks',
        'Term test & provincial trial exam reminders with .ics export',
      ],
    },
    {
      key: 'quiz',
      label: 'Quizzes & Assessments',
      sublabel: 'Live drill & rubric grading',
      icon: <FileCheck className="w-4 h-4" />,
      tag: 'Assessments',
      badge: 'Timed Arena',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      badgeColorClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
      activeBorderClass: 'border-emerald-500 ring-2 ring-emerald-500/20',
      activeBgClass: 'bg-white dark:bg-slate-800',
      highlights: [
        'Exam-conditioned MCQ drills with live timer & Question Navigator',
        'Flag for review option to revisit uncertain questions',
        'Structured rubric marking for subjective questions',
      ],
    },
    {
      key: 'analytics',
      label: 'Grading & Analytics',
      sublabel: 'Progression curves & Z-score',
      icon: <LineChart className="w-4 h-4" />,
      tag: 'Insights',
      badge: 'Z-Score',
      colorClass: 'text-blue-600 dark:text-blue-400',
      badgeColorClass: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
      activeBorderClass: 'border-blue-500 ring-2 ring-blue-500/20',
      activeBgClass: 'bg-white dark:bg-slate-800',
      highlights: [
        'Interactive SVG assessment score progression curves',
        'A/L Z-Score simulation & university cutoff feasibility',
        'Topic-level mastery diagnostics and attendance tracking',
      ],
    },
  ];

  const currentScreenshot = TAB_SCREENSHOTS[activeTab] || TAB_SCREENSHOTS.ai;

  return (
    <div className="w-full space-y-6">
      {/* Feature Selection Bar */}
      <div className="w-full bg-slate-100/90 dark:bg-slate-900/90 p-2 sm:p-2.5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabSelect(tab.key)}
                className={`text-left p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between border ${
                  isActive
                    ? `${tab.activeBgClass} ${tab.activeBorderClass} shadow-md`
                    : 'bg-white/60 dark:bg-slate-850/60 border-transparent text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-750 shadow-2xs ' + tab.colorClass
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tab.badgeColorClass}`}
                  >
                    {tab.badge}
                  </span>
                </div>

                <div>
                  <h4
                    className={`text-xs sm:text-sm font-bold leading-tight ${
                      isActive ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {tab.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-bar: View Mode Switcher (Interactive Demo vs Real Portal Screenshot) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">View Mode:</span>
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('demo')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'demo'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Interactive Demo
            </button>
            <button
              onClick={() => setViewMode('screenshot')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'screenshot'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Real Screenshot
            </button>
          </div>
        </div>

        {viewMode === 'screenshot' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLightboxOpen(true)}
            leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Expand Screenshot
          </Button>
        )}
      </div>

      {/* Main Feature Canvas */}
      <div className="w-full transition-all duration-200">
        {viewMode === 'screenshot' ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            {/* Window bar */}
            <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="ml-2 font-mono text-indigo-400 font-semibold">{currentScreenshot.portal}</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-300">{currentScreenshot.title}</span>
              </div>
              <button
                onClick={() => setLightboxOpen(true)}
                className="text-xs text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fullscreen</span>
              </button>
            </div>

            <div
              className="p-4 sm:p-6 bg-slate-950 flex items-center justify-center cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
                <img
                  src={currentScreenshot.src}
                  alt={currentScreenshot.title}
                  className="w-full h-auto object-cover rounded-2xl group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-semibold shadow-lg border border-white/10 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span>Click to Inspect Full Resolution</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span>{currentScreenshot.subtitle}</span>
              <button
                onClick={() => setViewMode('demo')}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Switch to Interactive Demo &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'chat' && <CourseChatShowcase />}
            {activeTab === 'ai' && <AIChatbotShowcase />}
            {activeTab === 'calendar' && <AcademicCalendarShowcase />}
            {activeTab === 'quiz' && <QuizAssignmentShowcase />}
            {activeTab === 'analytics' && <GradingAnalyticsShowcase />}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <Badge variant="primary" size="sm">
                  {currentScreenshot.portal}
                </Badge>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    {currentScreenshot.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">{currentScreenshot.subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => setLightboxOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-auto p-4 flex items-center justify-center bg-slate-950">
              <img
                src={currentScreenshot.src}
                alt={currentScreenshot.title}
                className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
