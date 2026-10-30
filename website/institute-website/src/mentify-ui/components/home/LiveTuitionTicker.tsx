import React from 'react';
import {
  Video,
  Users,
  MessageSquare,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface LiveTuitionTickerProps {
  onNavigate: (path: string) => void;
}

export const LiveTuitionTicker: React.FC<LiveTuitionTickerProps> = ({ onNavigate }) => {
  const liveSessions = [
    {
      title: 'Combined Maths: Integration Reduction Formulas',
      mentor: 'Eng. S. Perera',
      attendees: 342,
      status: 'live',
      room: 'Studio Alpha',
      badge: 'Streaming Now',
    },
    {
      title: 'Physics: Wave Optics & Interference Experiments',
      mentor: 'Dr. S. Gunawardana',
      attendees: 289,
      status: 'upcoming',
      time: 'In 35 mins',
      room: 'Lab Broadcaster',
      badge: 'Scheduled',
    },
    {
      title: 'Chemistry: Organic Synthesis Mechanisms',
      mentor: 'Mrs. K. Jayasuriya',
      attendees: 215,
      status: 'live',
      room: 'Studio Gamma',
      badge: 'Live Q&A',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl overflow-hidden relative">
      {/* Decorative subtle backdrop lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-rose-300">
              Live Academic Network Pulse
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            2,480+ Students Currently Active in Live Tuition Sessions
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time HD lecture broadcasting, mentor doubt resolution, and synchronized study groups powering Sri Lankan exam preparation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('features')}
            className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Explore Platform Features
          </Button>
        </div>
      </div>

      {/* Grid of Active Broadcasts */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {liveSessions.map((session, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate('features')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-400/40 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1.5 ${
                    session.status === 'live'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {session.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />}
                  {session.badge}
                </span>
                <span className="text-slate-400 text-[11px]">{session.room}</span>
              </div>

              <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                {session.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1">{session.mentor}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <strong className="text-white font-medium">{session.attendees}</strong> online
              </span>
              <span className="text-indigo-300 font-semibold group-hover:underline">Join Stream</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Performance Metrics Bar */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Average Doubt Resolution: <strong>12 mins</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Verified NIE Rubric Marking: <strong>100%</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Average Z-Score Boost: <strong>+0.42</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>HD Digital Whiteboard Sync</span>
        </div>
      </div>
    </div>
  );
};
