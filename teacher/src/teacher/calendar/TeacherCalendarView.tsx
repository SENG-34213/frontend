import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Filter,
  CheckCircle,
  X,
  Layers,
} from 'lucide-react';
import { CalendarEvent, NavigationTab } from '../types';
import { mockCalendarEvents, mockCourses } from '../data/mockData';

export const TeacherCalendarView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day' | 'Agenda'>('Month');
  const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  // Month state (October 2026)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const filteredEvents = events.filter((e) => {
    if (filterType === 'All') return true;
    return e.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Faculty Academic Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Coordinate lecture periods, laboratory slots, proctored exam sessions, and office hours.
          </p>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(['Month', 'Week', 'Day', 'Agenda'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const newEv: CalendarEvent = {
                id: `cal-${Date.now()}`,
                title: 'Review Session: Asymptotic Recurrence',
                type: 'Class',
                courseCode: 'CS-201',
                date: '2026-10-22',
                startTime: '2:00 PM',
                endTime: '3:30 PM',
                location: 'Turing Hall 401',
                color: 'indigo',
              };
              setEvents([...events, newEv]);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Event Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-900">October 2026</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 rounded text-slate-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
              Today
            </button>
            <button className="p-1 hover:bg-slate-100 rounded text-slate-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter types */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['All', 'Class', 'Assignment', 'Exam', 'Office Hours'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Calendar Grid & Right Upcoming Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View Area */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {viewMode === 'Month' ? (
            <div>
              {/* Day names */}
              <div className="grid grid-cols-7 text-center py-2 bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[480px]">
                {daysInMonth.map((day) => {
                  const dayString = `2026-10-${String(day).padStart(2, '0')}`;
                  const dayEvents = filteredEvents.filter((e) => e.date === dayString);
                  const isToday = day === 17;

                  return (
                    <div
                      key={day}
                      className={`p-1.5 min-h-[90px] flex flex-col justify-between transition-colors hover:bg-slate-50/50 ${
                        isToday ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono font-semibold ${
                            isToday
                              ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          {day}
                        </span>
                      </div>

                      <div className="space-y-1 mt-1">
                        {dayEvents.map((ev) => {
                          let colorStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                          if (ev.color === 'emerald') colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          if (ev.color === 'amber') colorStyle = 'bg-amber-50 text-amber-700 border-amber-200';
                          if (ev.color === 'rose') colorStyle = 'bg-rose-50 text-rose-700 border-rose-200';
                          if (ev.color === 'violet') colorStyle = 'bg-violet-50 text-violet-700 border-violet-200';

                          return (
                            <div
                              key={ev.id}
                              onClick={() => setSelectedEvent(ev)}
                              className={`p-1 text-[10px] font-semibold rounded border truncate cursor-pointer hover:opacity-90 transition-opacity ${colorStyle}`}
                              title={`${ev.title} (${ev.startTime})`}
                            >
                              {ev.courseCode ? `[${ev.courseCode}] ` : ''}
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda List View */
            <div className="p-6 divide-y divide-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Upcoming Academic Agenda
              </h3>
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="pt-4 first:pt-0 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 p-2 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold shrink-0">
                      {ev.date}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{ev.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ev.startTime} - {ev.endTime} · {ev.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-slate-500 font-mono">
                    {ev.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Today's Schedule & Selected Event Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Event Card (if clicked) */}
          {selectedEvent ? (
            <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedEvent.type}
                </span>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{selectedEvent.title}</h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedEvent.date} · {selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
              {selectedEvent.description && (
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {selectedEvent.description}
                </p>
              )}
            </div>
          ) : null}

          {/* Today's Teaching Schedule Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Today: Oct 17, 2026
            </h3>
            <div className="space-y-2">
              {events
                .filter((e) => e.date === '2026-10-17')
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{ev.title}</span>
                      <span className="font-mono text-[11px] text-indigo-600 font-bold">
                        {ev.startTime}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px] block">{ev.location}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
