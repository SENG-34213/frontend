import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Calendar,
  Bell,
  Sparkles,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  FileCode,
  FileCheck,
  HelpCircle,
  GraduationCap,
  CalendarDays,
  User,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { NavigationTab, TeacherProfile } from '../types';
import { QuickCreateType } from './QuickCreateModal';

interface TeacherNavbarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onOpenSearch: () => void;
  onOpenQuickCreate: (type: QuickCreateType) => void;
  onToggleMobileMenu: () => void;
  teacher: TeacherProfile;
  unreadNotificationsCount: number;
}

const tabTitles: Record<NavigationTab, { title: string; category: string }> = {
  dashboard: { title: 'Faculty Dashboard', category: 'Overview' },
  calendar: { title: 'Academic Calendar & Schedule', category: 'Overview' },
  notifications: { title: 'Notification Center', category: 'Overview' },
  courses: { title: 'My Courses', category: 'Teaching' },
  curriculum: { title: 'Course Content & Curriculum', category: 'Teaching' },
  students: { title: 'Student Directory & Records', category: 'Teaching' },
  enrollments: { title: 'Course Enrollments', category: 'Teaching' },
  attendance: { title: 'Attendance Management', category: 'Teaching' },
  materials: { title: 'Learning Materials & S3 Files', category: 'Teaching' },
  assignments: { title: 'Assignments', category: 'Assessments' },
  'grading-workspace': { title: 'Submission Review Workspace', category: 'Assessments' },
  quizzes: { title: 'Quizzes & Questions', category: 'Assessments' },
  exams: { title: 'Examination Management', category: 'Assessments' },
  grades: { title: 'Gradebook & Final Results', category: 'Assessments' },
  analytics: { title: 'Teaching Analytics & Insights', category: 'Insights' },
  messages: { title: 'Student & Faculty Messages', category: 'Communication' },
  'ai-assistant': { title: 'Mentify AI Teaching Assistant', category: 'AI Intelligence' },
  profile: { title: 'Teacher Profile', category: 'Account' },
  settings: { title: 'Account Settings & Preferences', category: 'Account' },
};

export const TeacherNavbar: React.FC<TeacherNavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenSearch,
  onOpenQuickCreate,
  onToggleMobileMenu,
  teacher,
  unreadNotificationsCount,
}) => {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const quickCreateRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target as Node)) {
        setQuickCreateOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMeta = tabTitles[currentTab] || { title: 'Teacher Portal', category: 'Teaching' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left zone: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 truncate">
          <span
            onClick={() => onNavigate('dashboard')}
            className="hover:text-slate-900 cursor-pointer font-medium"
          >
            Mentify
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400">{currentMeta.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{currentMeta.title}</span>
        </div>

        <div className="sm:hidden font-semibold text-sm text-slate-900 truncate">
          {currentMeta.title}
        </div>
      </div>

      {/* Right zone: Global Search, Quick Create, Actions, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer group"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          <span className="hidden md:inline text-slate-500">Search curriculum, students...</span>
          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400">
            ⌘K
          </span>
        </button>

        {/* Quick Create Dropdown */}
        <div className="relative" ref={quickCreateRef}>
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3 h-3 text-indigo-200" />
          </button>

          {quickCreateOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
              <p className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Quick Actions
              </p>
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  onOpenQuickCreate('course');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>New Course</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  onOpenQuickCreate('module');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <Layers className="w-4 h-4 text-violet-600" />
                <span>New Module</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  onOpenQuickCreate('lesson');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span>New Lesson</span>
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  onOpenQuickCreate('assignment');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <FileCheck className="w-4 h-4 text-amber-600" />
                <span>New Assignment</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  onOpenQuickCreate('quiz');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>New Quiz</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  onOpenQuickCreate('exam');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <GraduationCap className="w-4 h-4 text-rose-600" />
                <span>New Exam</span>
              </button>
              <button
                onClick={() => {
                  setQuickCreateOpen(false);
                  onOpenQuickCreate('event');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <CalendarDays className="w-4 h-4 text-slate-600" />
                <span>New Calendar Event</span>
              </button>
            </div>
          )}
        </div>

        {/* Calendar shortcut */}
        <button
          onClick={() => onNavigate('calendar')}
          className={`p-2 rounded-lg transition-colors ${
            currentTab === 'calendar'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="Open Academic Calendar"
        >
          <Calendar className="w-4 h-4" />
        </button>

        {/* Mentify AI Shortcut */}
        <button
          onClick={() => onNavigate('ai-assistant')}
          className={`p-2 rounded-lg transition-colors ${
            currentTab === 'ai-assistant'
              ? 'text-violet-700 bg-violet-100'
              : 'text-violet-600 hover:bg-violet-50'
          }`}
          title="Open Mentify AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Notifications Shortcut */}
        <button
          onClick={() => onNavigate('notifications')}
          className={`relative p-2 rounded-lg transition-colors ${
            currentTab === 'notifications'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
              AR
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-800">
              Dr. Alex Rivera
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{teacher.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{teacher.email}</p>
                <p className="text-[10px] text-indigo-600 font-medium mt-0.5">Faculty Member</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigate('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile & Office Hours</span>
                </button>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account & Preferences</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <div className="px-3 py-1.5 text-[11px] text-slate-400">
                  Keycloak Session: <span className="text-emerald-600 font-medium">Active (SSO)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
