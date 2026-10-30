import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Filter,
  Download,
  ExternalLink,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface CalendarEvent {
  id: string;
  title: string;
  course: string;
  category: 'lecture' | 'assignment' | 'quiz' | 'exam' | 'doubt';
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  timeRange: string;
  instructor: string;
  location: string;
  syllabusTopic: string;
  status: 'upcoming' | 'live' | 'completed';
  zoomLink?: string;
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'A/L Combined Maths: Integration by Parts Proofs',
    course: 'Combined Mathematics 2026',
    category: 'lecture',
    dateStr: '2026-11-04',
    dayNumber: 4,
    timeRange: '08:30 AM – 11:30 AM',
    instructor: 'Eng. S. Perera',
    location: 'Main Auditorium & Live HD Stream',
    syllabusTopic: 'Unit 08: Integral Calculus (NIE A/L Core)',
    status: 'upcoming',
    zoomLink: 'https://tit.edu.lk/stream/math-live',
  },
  {
    id: 'ev-2',
    title: 'Submission Due: Mechanics Tutorial 04 (Relative Velocity)',
    course: 'Combined Mathematics 2026',
    category: 'assignment',
    dateStr: '2026-11-06',
    dayNumber: 6,
    timeRange: '11:59 PM (Hard Deadline)',
    instructor: 'Eng. S. Perera',
    location: 'Student Submission Portal (PDF Upload)',
    syllabusTopic: 'Unit 14: Applied Mechanics & Kinematics',
    status: 'upcoming',
  },
  {
    id: 'ev-3',
    title: 'Physics Practical & Wave Motion MCQ Speed Drill',
    course: 'Advanced Level Physics Masterclass',
    category: 'quiz',
    dateStr: '2026-11-08',
    dayNumber: 8,
    timeRange: '04:00 PM – 05:00 PM',
    instructor: 'Dr. S. Gunawardana',
    location: 'Interactive Quiz Arena',
    syllabusTopic: 'Unit 03: Doppler Effect & Standing Waves',
    status: 'upcoming',
  },
  {
    id: 'ev-4',
    title: 'Live Lab Broadcast: Surface Tension Experiments',
    course: 'Advanced Level Physics Masterclass',
    category: 'lecture',
    dateStr: '2026-11-12',
    dayNumber: 12,
    timeRange: '09:00 AM – 12:00 PM',
    instructor: 'Dr. S. Gunawardana',
    location: 'Lab Room 2 & Dual Camera Stream',
    syllabusTopic: 'Unit 02: Properties of Matter',
    status: 'upcoming',
  },
  {
    id: 'ev-5',
    title: 'Organic Chemistry Synthesis Mechanisms Seminar',
    course: 'A/L Chemistry Inorganic & Organic',
    category: 'lecture',
    dateStr: '2026-11-15',
    dayNumber: 15,
    timeRange: '02:00 PM – 05:30 PM',
    instructor: 'Mrs. K. Jayasuriya',
    location: 'Hall 3 & Online Replay Archive',
    syllabusTopic: 'Unit 11: Organic Synthesis & Benzene Derivatives',
    status: 'upcoming',
  },
  {
    id: 'ev-6',
    title: 'Mid-Year Comprehensive Term Examination (Paper I & II)',
    course: 'All Departments (TiT Institute)',
    category: 'exam',
    dateStr: '2026-11-20',
    dayNumber: 20,
    timeRange: '08:00 AM – 01:00 PM',
    instructor: 'TiT Examination Board',
    location: 'Main Examination Halls 1–6',
    syllabusTopic: 'Complete Term 1 & 2 Syllabus Scope',
    status: 'upcoming',
  },
  {
    id: 'ev-7',
    title: 'Live Doubt Clearance & Past Paper Discussion Hour',
    course: 'Biology NIE Curriculum',
    category: 'doubt',
    dateStr: '2026-11-24',
    dayNumber: 24,
    timeRange: '06:00 PM – 07:30 PM',
    instructor: 'Dr. N. Wickramasinghe',
    location: 'Google Meet / TiT Chat Room',
    syllabusTopic: 'Unit 05: Plant Physiology & C4 Pathway',
    status: 'upcoming',
  },
];

export const AcademicCalendarShowcase: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<number>(4);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(SAMPLE_EVENTS[0]);
  const [countdown, setCountdown] = useState<string>('02h 45m 18s');

  // Simulated ticking countdown to next live lecture
  useEffect(() => {
    let secondsLeft = 2 * 3600 + 45 * 60 + 18;
    const interval = setInterval(() => {
      secondsLeft = Math.max(0, secondsLeft - 1);
      const h = Math.floor(secondsLeft / 3600);
      const m = Math.floor((secondsLeft % 3600) / 60);
      const s = secondsLeft % 60;
      setCountdown(
        `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = SAMPLE_EVENTS.filter((ev) => {
    if (selectedCourse !== 'all' && !ev.course.toLowerCase().includes(selectedCourse.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const getCategoryBadge = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'lecture':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">Live Lecture</span>;
      case 'assignment':
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">Assignment Deadline</span>;
      case 'quiz':
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">Timed Quiz</span>;
      case 'exam':
        return <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">Term Examination</span>;
      case 'doubt':
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">Doubt Clinic</span>;
    }
  };

  const handleDownloadICS = (ev: CalendarEvent) => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TiT Education//Academic Calendar//EN\nBEGIN:VEVENT\nSUMMARY:${ev.title}\nDESCRIPTION:${ev.syllabusTopic} - Instructor: ${ev.instructor}\nLOCATION:${ev.location}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ev.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calendar days generation (November 2026: starts on Sunday, 30 days)
  const daysInMonth = 30;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
      {/* Top Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-300">
              Synchronized Academic Schedule
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Lectures, Assignment Deadlines & Mock Exam Countdown
          </h3>
          <p className="text-xs text-slate-300">
            Never miss an assessment or live practical session with automatic timezone sync and exportable calendar feeds.
          </p>
        </div>

        {/* Live Countdown Badge */}
        <div className="bg-indigo-900/60 border border-indigo-400/30 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] text-indigo-200 uppercase font-semibold">Next Live Lecture In</div>
            <div className="text-xs font-mono font-bold text-white">{countdown}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Course Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Course:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Enrolled Courses</option>
            <option value="Maths">Combined Mathematics</option>
            <option value="Physics">Physics Masterclass</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'lecture', label: 'Lectures' },
            { id: 'assignment', label: 'Assignments' },
            { id: 'quiz', label: 'Quizzes' },
            { id: 'exam', label: 'Exams' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Side: Month Grid */}
        <div className="lg:col-span-7 p-5 border-r border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              November 2026 Academic Term
            </h4>
            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">Nov 2026</span>
              <button
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysArray.map((day) => {
              const eventsOnDay = filteredEvents.filter((e) => e.dayNumber === day);
              const isSelected = selectedDate === day;
              const hasEvents = eventsOnDay.length > 0;

              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDate(day);
                    if (eventsOnDay.length > 0) {
                      setSelectedEvent(eventsOnDay[0]);
                    }
                  }}
                  className={`min-h-[56px] p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : hasEvents
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {day}
                  </span>

                  {hasEvents && (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {eventsOnDay.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] font-semibold px-1 py-0.5 rounded truncate ${
                            ev.category === 'lecture'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : ev.category === 'assignment'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : ev.category === 'quiz'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {eventsOnDay.length > 2 && (
                        <span className="text-[8px] text-slate-400">+{eventsOnDay.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Live Lecture
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Assignment Due
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Timed Quiz
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Term Exam
            </span>
          </div>
        </div>

        {/* Right Side: Selected Day / Event Details Inspector */}
        <div className="lg:col-span-5 p-5 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Scheduled Session Details
              </h4>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Nov {selectedDate}, 2026
              </span>
            </div>

            {selectedEvent ? (
              <div className="space-y-4">
                <div>
                  <div className="mb-2">{getCategoryBadge(selectedEvent.category)}</div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                    {selectedEvent.course}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-white">Time Slot</span>
                      <span>{selectedEvent.timeRange}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-white">Syllabus Scope</span>
                      <span>{selectedEvent.syllabusTopic}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <Video className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-white">Venue / Access</span>
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No scheduled academic event on November {selectedDate}. Select another date with event dots.
              </div>
            )}
          </div>

          {selectedEvent && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 rounded-xl text-xs"
                onClick={() => handleDownloadICS(selectedEvent)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Add to Calendar (.ics)
              </Button>
              {selectedEvent.zoomLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs"
                  onClick={() => window.open(selectedEvent.zoomLink, '_blank')}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Join Stream
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
