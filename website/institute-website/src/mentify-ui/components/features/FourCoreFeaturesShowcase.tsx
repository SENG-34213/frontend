import React, { useState, useEffect } from 'react';
import {
  Bot,
  MessageSquare,
  Calendar,
  FileCheck,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Eye,
  Info,
  ZoomIn,
  Shield,
  ArrowUpRight,
  MousePointerClick,
  Sparkle,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export type CoreFeatureId = 'ai' | 'communication' | 'calendar' | 'quiz';

export interface Hotspot {
  id: string;
  title: string;
  desc: string;
  top: string; // percentage
  left: string; // percentage
}

export interface CoreFeatureItem {
  id: CoreFeatureId;
  tabNumber: string;
  title: string;
  shortTitle: string;
  portalBadge: string;
  portalPath: string;
  category: string;
  imageSrc: string;
  altText: string;
  headline: string;
  description: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentGlow: string;
  badgeColorClass: string;
  userRole: string;
  hotspots: Hotspot[];
  specs: { label: string; value: string }[];
  keyCapabilities: string[];
}

export const CORE_FEATURES_DATA: CoreFeatureItem[] = [
  {
    id: 'ai',
    tabNumber: '01',
    title: 'TiT AI Assistant',
    shortTitle: 'AI Assistant',
    portalBadge: 'Admin Portal',
    portalPath: 'Admin / AI Assistant / School Assistant',
    category: 'School Management',
    imageSrc: '/assets/aistudio/Screenshot_2026-10-30_at_03.55.45_ebe14d69.png',
    altText: 'TiT AI Assistant chat interface showing student enrollment numbers and statistics',
    headline: 'Instant Answers & Student Information for School Admins',
    description:
      'Ask everyday questions to easily check student enrollment numbers, teacher schedules, registered accounts, and school updates without dealing with complicated paperwork.',
    accentColor: 'text-indigo-500',
    accentBg: 'bg-indigo-500/10',
    accentBorder: 'border-indigo-500',
    accentGlow: 'from-indigo-600/20 via-purple-600/10 to-transparent',
    badgeColorClass: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    userRole: 'School Principals & Teachers',
    hotspots: [
      {
        id: 'ai-1',
        title: 'Easy Questions',
        desc: 'Ask questions like "how many students are enrolled?" or check recent class signups.',
        top: '32%',
        left: '68%',
      },
      {
        id: 'ai-2',
        title: 'Clear Student Counts',
        desc: 'Instant visual view of total enrolled students, teachers, and active class batches.',
        top: '50%',
        left: '52%',
      },
      {
        id: 'ai-3',
        title: 'Quick Menu',
        desc: 'Easy shortcuts to student lists, teachers, subjects, exam schedules, and timetables.',
        top: '40%',
        left: '88%',
      },
      {
        id: 'ai-4',
        title: 'Saved Conversations',
        desc: 'Previous questions and school updates saved neatly for quick access.',
        top: '42%',
        left: '28%',
      },
    ],
    specs: [
      { label: 'Response Time', value: 'Instant' },
      { label: 'Student Records', value: 'Always Updated' },
      { label: 'Account Roles', value: 'Students, Teachers & Staff' },
      { label: 'Data Privacy', value: '100% Safe & Confidential' },
    ],
    keyCapabilities: [
      'Quick answers to school enrollment numbers and student profiles',
      'Recent student and teacher registration organized by grade',
      'Helpful shortcuts to class schedules, attendance, and exam dates',
      'Keeps student academic records strictly confidential',
    ],
  },
  {
    id: 'communication',
    tabNumber: '02',
    title: 'Direct & Group Communication',
    shortTitle: 'Communication',
    portalBadge: 'Teacher Portal',
    portalPath: 'TEACHER PORTAL > Communication > Class Messages',
    category: 'Class Discussions',
    imageSrc: '/assets/aistudio/Screenshot_2026-10-30_at_03.52.50_588ec326.png',
    altText: 'Teacher Portal messaging interface showing Grade 12 Combined Mathematics class discussions',
    headline: 'Dedicated Subject Groups & Teacher-Student Messaging',
    description:
      'Dedicated class groups for each subject and grade. Keep schoolwork organized with clean channels for Grade 12 Combined Maths, Biology, and Grade 10 Science where students can ask doubts directly and share homework notes.',
    accentColor: 'text-blue-500',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500',
    accentGlow: 'from-blue-600/20 via-cyan-600/10 to-transparent',
    badgeColorClass: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    userRole: 'Teachers & Students',
    hotspots: [
      {
        id: 'chat-1',
        title: 'Dedicated Subject Groups',
        desc: 'Separate discussion groups for Grade 12 Combined Maths, Biology, and Grade 10 Science.',
        top: '38%',
        left: '26%',
      },
      {
        id: 'chat-2',
        title: 'Direct Teacher Messages',
        desc: 'Send private questions directly to class teachers for personal homework help.',
        top: '60%',
        left: '26%',
      },
      {
        id: 'chat-3',
        title: 'Class Discussion Stream',
        desc: 'Lesson instructions, student questions, and helpful teacher guidance in real time.',
        top: '45%',
        left: '58%',
      },
      {
        id: 'chat-4',
        title: 'Notes & Worksheets',
        desc: 'Download model answers, worksheets, past papers, and class notes directly from the chat.',
        top: '90%',
        left: '70%',
      },
    ],
    specs: [
      { label: 'Class Groups', value: 'By Grade & Subject' },
      { label: 'Message Speed', value: 'Sent Instantly' },
      { label: 'Attachments', value: 'PDF Notes, Photos & Worksheets' },
      { label: 'Teacher Monitored', value: 'Supervised by Class Teachers' },
    ],
    keyCapabilities: [
      'Organized subject groups so students only see messages for their own grade',
      'Ask teachers homework questions directly with unread message alerts',
      'School announcements tab for class time changes and exam alerts',
      'Share homework solutions, worksheets, and study notes easily',
    ],
  },
  {
    id: 'calendar',
    tabNumber: '03',
    title: 'Academic Calendar',
    shortTitle: 'Academic Calendar',
    portalBadge: 'Student Portal',
    portalPath: 'Home > Timetable > Student Class Schedule',
    category: 'Class Timetable',
    imageSrc: '/assets/aistudio/Screenshot_2026-10-30_at_04.01.21_0a36d13b.png',
    altText: 'Academic Calendar showing monthly class timetable, Zoom tuition sessions, and exam dates',
    headline: 'Complete Timetable for Live Classes, Tests & Homework',
    description:
      'Never miss a live Zoom tuition class, homework submission, or practice exam. The Academic Calendar lets students view their schedule by Month, Week, or Day, with clear color tags for every subject.',
    accentColor: 'text-amber-500',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500',
    accentGlow: 'from-amber-600/20 via-orange-600/10 to-transparent',
    badgeColorClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    userRole: 'Students & Parents',
    hotspots: [
      {
        id: 'cal-1',
        title: 'View Switcher',
        desc: 'Easily switch between Month, Week, Day, and List views to plan your study routine.',
        top: '28%',
        left: '88%',
      },
      {
        id: 'cal-2',
        title: 'Date Picker',
        desc: 'Quickly jump to today or any upcoming week to see what classes are scheduled.',
        top: '45%',
        left: '28%',
      },
      {
        id: 'cal-3',
        title: 'Color-Coded Tags',
        desc: 'Clear colors for Live Classes, Homework Deadlines, Quizzes, and Term Tests.',
        top: '75%',
        left: '28%',
      },
      {
        id: 'cal-4',
        title: 'Live Class Reminder',
        desc: 'Class cards showing exact class start times, Zoom links, and teachers.',
        top: '65%',
        left: '52%',
      },
    ],
    specs: [
      { label: 'Calendar Views', value: 'Month, Week, Day, List' },
      { label: 'Event Types', value: 'Live Classes, Quizzes, Exams' },
      { label: 'Quick Search', value: 'Find Classes by Name or Teacher' },
      { label: 'Reminders', value: 'Syncs with Phone & Google Calendar' },
    ],
    keyCapabilities: [
      'Direct links to join live Zoom tuition classes with one click',
      'Filter classes to view only your upcoming tests or homework',
      'Personalized study timetable based on your enrolled subjects',
      'Clear start times and duration for all scheduled sessions',
    ],
  },
  {
    id: 'quiz',
    tabNumber: '04',
    title: 'Practice Quizzes & Tests',
    shortTitle: 'Practice Tests',
    portalBadge: 'Student Portal',
    portalPath: 'Home > Quizzes > Practice Test Workspace',
    category: 'Practice Tests',
    imageSrc: '/assets/aistudio/Screenshot_2026-10-30_at_04.05.37_5f1e7054.png',
    altText: 'Practice Test Workspace showing timed quiz with Question Checklist and live timer',
    headline: 'Real Exam Practice with Live Timer & Question Checklist',
    description:
      'Practice in real exam conditions with a live countdown timer, a question checklist to track answered questions, a flag button to revisit tricky questions, and instant marks with step-by-step answers.',
    accentColor: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500',
    accentGlow: 'from-emerald-600/20 via-teal-600/10 to-transparent',
    badgeColorClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    userRole: 'Students & Teachers',
    hotspots: [
      {
        id: 'quiz-1',
        title: 'Live Countdown Timer',
        desc: 'Clear countdown clock that helps students manage exam time and pace themselves.',
        top: '17%',
        left: '86%',
      },
      {
        id: 'quiz-2',
        title: 'Question Checklist',
        desc: 'Easy grid showing answered questions and questions you flagged to recheck.',
        top: '36%',
        left: '88%',
      },
      {
        id: 'quiz-3',
        title: 'Flag for Later Button',
        desc: 'Bookmark difficult questions so you can easily return to them before submitting.',
        top: '30%',
        left: '70%',
      },
      {
        id: 'quiz-4',
        title: 'Multiple Choice Options',
        desc: 'Questions following government syllabus standards with clear mark values.',
        top: '60%',
        left: '48%',
      },
    ],
    specs: [
      { label: 'Exam Mode', value: 'Timed Practice Test' },
      { label: 'Automatic Saving', value: 'Saves Every Answer Instantly' },
      { label: 'Question Review', value: 'Bookmark Questions to Recheck' },
      { label: 'Results', value: 'Instant Marks & Explanations' },
    ],
    keyCapabilities: [
      'Realistic exam environment helping students build speed and confidence',
      'Question palette displaying answered count and flagged questions at a glance',
      'Instant grading and step-by-step rationales matching national marking rubrics',
      'Answers are safely saved so no work is lost if your connection drops',
    ],
  },
];

export interface FourCoreFeaturesShowcaseProps {
  initialFeature?: CoreFeatureId;
  onExploreMore?: () => void;
  onOpenAdmissions?: () => void;
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

export const FourCoreFeaturesShowcase: React.FC<FourCoreFeaturesShowcaseProps> = ({
  initialFeature = 'ai',
  onExploreMore,
  onOpenAdmissions,
  title = 'Platform Core Features',
  subtitle = 'Inspect authentic, high-resolution views inside the TiT platform: Admin AI Assistant, Direct Communication, Academic Calendar, and Timed Live Assessments.',
  badgeText = 'Flagship Interfaces',
}) => {
  const [activeId, setActiveId] = useState<CoreFeatureId>(initialFeature);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<boolean>(false);

  const activeFeature =
    CORE_FEATURES_DATA.find((f) => f.id === activeId) || CORE_FEATURES_DATA[0];

  const currentIndex = CORE_FEATURES_DATA.findIndex((f) => f.id === activeId);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % CORE_FEATURES_DATA.length;
    setActiveId(CORE_FEATURES_DATA[nextIndex].id);
    setActiveHotspot(null);
  };

  const handlePrev = () => {
    const prevIndex =
      (currentIndex - 1 + CORE_FEATURES_DATA.length) % CORE_FEATURES_DATA.length;
    setActiveId(CORE_FEATURES_DATA[prevIndex].id);
    setActiveHotspot(null);
  };

  // Keyboard navigation between features
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen && e.key === 'Escape') {
        setLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  return (
    <div className="w-full space-y-10">
      {/* 1. Header Bar (Centered in the Middle) */}
      {title && (
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{badgeText}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {(onExploreMore || onOpenAdmissions) && (
            <div className="flex items-center justify-center gap-3 mt-5">
              {onExploreMore && (
                <Button variant="outline" size="sm" onClick={onExploreMore} className="text-xs">
                  Detailed Specs
                </Button>
              )}
              {onOpenAdmissions && (
                <Button variant="primary" size="sm" onClick={onOpenAdmissions} className="text-xs">
                  Enroll in Batch
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Interactive Feature Dock / Selector */}
      <div className="relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CORE_FEATURES_DATA.map((feat) => {
            const isActive = feat.id === activeId;
            const getIcon = () => {
              switch (feat.id) {
                case 'ai':
                  return <Bot className="w-5 h-5" />;
                case 'communication':
                  return <MessageSquare className="w-5 h-5" />;
                case 'calendar':
                  return <Calendar className="w-5 h-5" />;
                case 'quiz':
                  return <FileCheck className="w-5 h-5" />;
              }
            };

            return (
              <button
                key={feat.id}
                onClick={() => {
                  setActiveId(feat.id);
                  setActiveHotspot(null);
                }}
                className={`relative text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-700 shadow-xl ring-2 ring-indigo-500/30 -translate-y-1'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-md'
                }`}
              >
                {/* Active Indicator Top Line */}
                {isActive && (
                  <div className="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 rounded-b-full shadow-sm" />
                )}

                <div className="flex items-center justify-between mb-3 w-full">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? feat.accentBg + ' ' + feat.accentColor + ' shadow-sm border border-white/10'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {getIcon()}
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/10 text-slate-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {feat.tabNumber}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
                    isActive ? 'text-indigo-400' : 'text-slate-400'
                  }`}>
                    {feat.portalBadge}
                  </span>
                  <h4
                    className={`text-sm sm:text-base font-extrabold mt-0.5 ${
                      isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {feat.shortTitle}
                  </h4>
                  <p
                    className={`text-xs mt-1 line-clamp-1 ${
                      isActive ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {feat.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BIG HERO VIEWPORT: ULTRA CRISP LARGE SCREENSHOT IN MODERN DARK STUDIO CHASSIS */}
      <div className="relative group">
        {/* Ambient Gradient Glow behind viewport matching active feature color */}
        <div
          className={`absolute -inset-2 sm:-inset-4 bg-gradient-to-b ${activeFeature.accentGlow} rounded-3xl blur-2xl opacity-60 -z-10 transition-all duration-700`}
        />

        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300">
          {/* Top macOS Browser Chrome Bar */}
          <div className="px-4 sm:px-6 py-4 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            {/* Window Dots & Route */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-xs" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-xs" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-xs" />
              </div>

              {/* Breadcrumb / Path */}
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 font-mono text-[11px] text-slate-400">
                <span className="text-indigo-400 font-bold">{activeFeature.portalBadge}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-200 truncate max-w-xs">{activeFeature.portalPath}</span>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2">
              {/* Hotspot Toggle */}
              <button
                onClick={() => setShowHotspots(!showHotspots)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  showHotspots
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Toggle interactive point tags"
              >
                <MousePointerClick className="w-3.5 h-3.5" />
                <span className="hidden md:inline">
                  {showHotspots ? 'Interactive Pins ON' : 'Show Pins'}
                </span>
              </button>

              {/* Previous / Next buttons */}
              <div className="inline-flex rounded-lg bg-slate-800 border border-slate-700 p-0.5">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Previous Feature"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Next Feature"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Inspect / Zoom button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Enlarge Full Screen</span>
              </button>
            </div>
          </div>

          {/* Screenshot Display Frame - GIVEN FULL WIDTH TO BE BIG & PROPER */}
          <div className="relative w-full bg-slate-950 flex items-center justify-center p-2 sm:p-4 lg:p-6 select-none overflow-hidden">
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950">
              <img
                src={activeFeature.imageSrc}
                alt={activeFeature.altText}
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Interactive Hotspots Overlaid directly on the screenshot */}
              {showHotspots && (
                <div className="absolute inset-0 pointer-events-none">
                  {activeFeature.hotspots.map((pin) => {
                    const isSelected = activeHotspot?.id === pin.id;
                    return (
                      <div
                        key={pin.id}
                        style={{ top: pin.top, left: pin.left }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                      >
                        <button
                          onClick={() =>
                            setActiveHotspot(isSelected ? null : pin)
                          }
                          className={`group relative w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-500 text-white scale-125 ring-4 ring-indigo-400/40 shadow-lg'
                              : 'bg-slate-900/90 text-indigo-400 border border-indigo-400/60 shadow-md hover:scale-110 hover:bg-indigo-600 hover:text-white'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping absolute inset-0 m-auto opacity-75" />
                          <Info className="w-4 h-4 relative z-10" />
                        </button>

                        {/* Popup Tooltip */}
                        {isSelected && (
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-indigo-500/50 shadow-2xl z-30 animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                Feature Callout
                              </span>
                              <button
                                onClick={() => setActiveHotspot(null)}
                                className="text-slate-400 hover:text-white text-xs"
                              >
                                ✕
                              </button>
                            </div>
                            <h5 className="text-xs font-bold text-white leading-tight">
                              {pin.title}
                            </h5>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                              {pin.desc}
                            </p>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-indigo-500/50 -mt-1" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Click to Enlarge Floating Bar */}
              <div
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-slate-950/85 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-slate-700/60 shadow-2xl flex items-center justify-between sm:justify-start gap-3 cursor-pointer hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-200">
                    Live Interface: {activeFeature.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold pl-2 border-l border-slate-700">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Click to Expand</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Details Bar: Summary, Specifications & Capabilities */}
          <div className="p-6 sm:p-8 bg-slate-900/70 border-t border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Headline and Overview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {activeFeature.portalBadge}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400">
                    Target Role: <strong className="text-slate-200">{activeFeature.userRole}</strong>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {activeFeature.headline}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeFeature.description}
                </p>

                {/* Hotspot Pills */}
                {showHotspots && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Key Points in this Screenshot:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeFeature.hotspots.map((h) => {
                        const isSelected = activeHotspot?.id === h.id;
                        return (
                          <button
                            key={h.id}
                            onClick={() => setActiveHotspot(isSelected ? null : h)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-md'
                                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span>{h.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Key Specifications & Feature Highlights */}
              <div className="lg:col-span-5 space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Key Features & Highlights</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {activeFeature.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {spec.label}
                      </span>
                      <span className="text-xs font-bold text-white block mt-0.5">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {activeFeature.keyCapabilities.slice(0, 3).map((cap, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 5. FULL-SCREEN LIGHTBOX MODAL WITH ULTRA-HIGH DEFINITION PREVIEW */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-7xl w-full bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Chrome */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <Badge variant="primary" size="sm">
                  {activeFeature.portalBadge}
                </Badge>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                    {activeFeature.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{activeFeature.portalPath}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLightboxZoom(!lightboxZoom)}
                  className="text-xs text-white border-slate-700 hover:bg-slate-800"
                  leftIcon={lightboxZoom ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                >
                  {lightboxZoom ? 'Fit Window' : 'Actual Size'}
                </Button>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950 flex-1 min-h-[50vh]">
              <img
                src={activeFeature.imageSrc}
                alt={activeFeature.altText}
                className={`transition-all duration-300 rounded-xl shadow-2xl border border-slate-800 ${
                  lightboxZoom ? 'max-w-none w-[1600px]' : 'w-full max-h-[78vh] object-contain'
                }`}
              />
            </div>

            {/* Modal Footer Nav */}
            <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-semibold">{activeFeature.headline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  className="text-xs text-white border-slate-800"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  className="text-xs text-white border-slate-800"
                >
                  Next
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setLightboxOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
