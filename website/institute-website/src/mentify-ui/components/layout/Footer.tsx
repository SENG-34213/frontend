import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  ChevronRight,
  MessageCircle,
  GraduationCap,
  BookOpen,
  Video,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { SITE_CONFIG } from '../../lib/config/site';

export interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenResults?: () => void;
  onOpenTutorApply?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenResults,
  onOpenTutorApply,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-20 pb-16 relative overflow-hidden">
      {/* Subtle background ambient lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Institutional Identity Banner */}
        <div className="pb-14 border-b border-slate-800/80">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4">
                <img
                  src="/TiTJaffna-logo.jpeg"
                  alt="Official Emblem"
                  className="w-14 h-14 rounded-full object-contain bg-white shadow-md ring-2 ring-indigo-500/30 shrink-0"
                />
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Alaveddy, Jaffna
                  </h3>
                  <p className="text-xs text-indigo-400 mt-0.5 font-medium">
                    Islandwide Online & Classroom Learning
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">
                Empowering students across Sri Lanka from Grade 1 through Grade 13 with structured syllabus guidance,
                interactive live Zoom tuition, comprehensive study notes, model papers, and official student performance tracking.
              </p>
            </div>

            {/* Quick Contact & WhatsApp Pill */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 lg:self-center shrink-0">
              <a
                href={`https://wa.me/94770158446?text=${encodeURIComponent('Hello, I would like to inquire about academic batches.')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Chat on WhatsApp</span>
              </a>

              {onOpenResults && (
                <button
                  type="button"
                  onClick={onOpenResults}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-500/50 text-amber-300 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Check Exam Results</span>
                </button>
              )}
            </div>
          </div>

          {/* Institutional Highlights Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800/50 text-slate-300 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Grades 1 – 13</p>
                <p className="text-slate-400 text-[11px]">Primary, O/L & A/L</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Live Zoom Lectures</p>
                <p className="text-slate-400 text-[11px]">Plus video archives</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">500+ Study Resources</p>
                <p className="text-slate-400 text-[11px]">Model papers & notes</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Alaveddy, Jaffna</p>
                <p className="text-slate-400 text-[11px]">Islandwide access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content & Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 py-14 border-b border-slate-800/80">
          {/* Col 1: Academic Batches */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Academic Batches
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('courses')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Grade 5 Scholarship Batches</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('courses')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Primary Learning (Grades 1–4)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('courses')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Junior Secondary (Grades 6–9)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('courses')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>G.C.E. O/L Examination Prep</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('courses')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>G.C.E. A/L Specialized Streams</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Study Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Study Resources
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('marketplace')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Model Papers & Marking Schemes</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('marketplace')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Comprehensive Revision Notes</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('marketplace')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Past Paper IQ & Theory Drills</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('features')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Interactive Learning Tools</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admissions')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Pre-Register for Upcoming Batches</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Student & Tutor Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Portals & Verification
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                {onOpenResults ? (
                  <button
                    type="button"
                    onClick={onOpenResults}
                    className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-2 group font-medium text-left"
                  >
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Check Student Exam Marks</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('portals')}
                    className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-2 text-left"
                  >
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Student Result Verification</span>
                  </button>
                )}
              </li>
              <li>
                {onOpenTutorApply && (
                  <button
                    type="button"
                    onClick={onOpenTutorApply}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-2 group font-medium text-left"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Apply as a Tutor</span>
                  </button>
                )}
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('portals')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Student Portal Login</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('portals')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Teacher & Tutor Portal</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('faq')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Frequently Asked Questions</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Center Details & Contact Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              Tuition Center Desk
            </h4>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold text-white">Alaveddy Center</p>
                  <p className="text-slate-400">Alaveddy, Jaffna, Sri Lanka</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold text-white">Phone & WhatsApp Hotline</p>
                  <a
                    href="tel:+94770158446"
                    className="text-slate-400 hover:text-indigo-400 transition-colors block"
                  >
                    +94 77 015 8446
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold text-white">Electronic Inquiries</p>
                  <a
                    href={`mailto:${SITE_CONFIG.contact.email}`}
                    className="text-slate-400 hover:text-indigo-400 transition-colors block"
                  >
                    {SITE_CONFIG.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold text-white">Operational Timings</p>
                  <p className="text-slate-400">Monday – Sunday: 8:00 AM – 8:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Generous Height and Balanced Structure */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-6">
          <div className="text-center md:text-left space-y-1">
            <p className="text-slate-400 font-medium">
              © {new Date().getFullYear()} All rights reserved.
            </p>
            <p className="text-slate-500 text-[11px]">
              Alaveddy, Jaffna, Sri Lanka · Empowering Islandwide Academic Excellence
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs">
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => onNavigate('terms')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Admissions Help Desk
            </button>
            <span className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => onNavigate('portals')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
            >
              Portal Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
