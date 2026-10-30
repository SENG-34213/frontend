import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AcademicPlacementSectionProps {
  onOpenAdmissions?: () => void;
  onNavigate?: (path: string) => void;
}

export const AcademicPlacementSection: React.FC<AcademicPlacementSectionProps> = ({
  onOpenAdmissions,
  onNavigate,
}) => {
  // Form State
  const [grade, setGrade] = useState<string>('Grade 12 (A/L 2026)');
  const [stream, setStream] = useState<string>('Physical Science (Combined Maths)');
  const [studentName, setStudentName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [district, setDistrict] = useState<string>('Jaffna');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [reservationCode, setReservationCode] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};

    if (!studentName.trim()) {
      newErrors.name = 'Please enter student name';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      newErrors.phone = 'Please enter a valid phone number (min 9 digits)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const code = `TIT-${Math.floor(1000 + Math.random() * 9000)}`;
    setReservationCode(code);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setStudentName('');
    setPhone('');
    setErrors({});
  };

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header - Middle Aligned */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Academic Intakes Open · 2026 / 2027</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Secure Your Academic Placement for Upcoming Batches
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Pre-register online in under 2 minutes. Receive timetable details, syllabus previews, and personalized academic counseling for G.C.E. O/L and A/L streams.
          </p>
        </div>

        {/* Main 2-Column Placement Showcase Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            {/* Left Column: 3 Steps + Institutional Guarantees */}
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-8">
              {/* Institution Emblem & Badge */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src="/TiTJaffna-logo.jpeg"
                    alt="TiT Online Education Official Emblem"
                    className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 object-cover shadow-xs"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      TiT Online Education Admissions Desk
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Alaveddy Tuition Center & Islandwide Online Tuition
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span>2-Min Online Process</span>
                </div>
              </div>

              {/* 3 Step Guidance */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  How Online Pre-Registration Works
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      1
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Choose Your Grade & Stream
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Select from Primary (Grades 1–5), Junior Secondary (Grades 6–9), O/L (Grades 10–11), or A/L streams (Combined Maths, Biology, Commerce, Arts, Technology).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      2
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Choose Your Learning Format & Study Center
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Join interactive live Zoom classes from anywhere in Sri Lanka, or attend structured study sessions at our Alaveddy tuition center.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      3
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Receive Timetable & Study Pack Preview
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Our admissions coordinator contacts you with full weekly timetables, teacher introductions, model paper previews, and access details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Student & Parent Guarantees */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Zero Upfront Commitment</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                      Pre-registration is completely free. Tuition fees only apply once enrollment is finalized.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Small Interactive Batches</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                      Limited seats per batch ensure individual attention and direct voice question time with teachers.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>100% Syllabus Aligned</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                      Full coverage of national examination units, past papers from 2011–2025, and monthly model exams.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>Full Recorded Backups</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                      Missed a live class? 24/7 video replays and teacher lecture notes are available in your portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 2-Minute Pre-Registration Form */}
            <div className="lg:col-span-5 p-6 sm:p-10 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col justify-between">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Pre-Register in 2 Minutes
                      </h3>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        Free Reservation
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Submit your details to receive class timetables and syllabus outlines.
                    </p>
                  </div>

                  {/* Grade Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Academic Grade
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Grade 13 (A/L 2025 Revision)">Grade 13 (A/L 2025 Revision)</option>
                      <option value="Grade 12 (A/L 2026)">Grade 12 (A/L 2026)</option>
                      <option value="Grade 11 (O/L 2025/2026)">Grade 11 (O/L 2025/2026)</option>
                      <option value="Grade 10 (O/L)">Grade 10 (O/L Foundation)</option>
                      <option value="Grade 9 (Junior Secondary)">Grade 9 (Junior Secondary)</option>
                      <option value="Grade 8 (Junior Secondary)">Grade 8 (Junior Secondary)</option>
                      <option value="Grade 7 (Junior Secondary)">Grade 7 (Junior Secondary)</option>
                      <option value="Grade 6 (Junior Secondary)">Grade 6 (Junior Secondary)</option>
                      <option value="Grade 5 (Scholarship Exam)">Grade 5 (Scholarship Exam)</option>
                      <option value="Grade 1–4 (Primary Foundations)">Grade 1–4 (Primary Foundations)</option>
                    </select>
                  </div>

                  {/* Stream / Subject Focus */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Stream / Subject Focus
                    </label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Physical Science (Combined Maths)">Physical Science (Combined Maths & Physics)</option>
                      <option value="Biological Science">Biological Science (Biology & Chemistry)</option>
                      <option value="Commerce Stream">Commerce Stream (Accounting, Econ, BS)</option>
                      <option value="Technology Stream">Technology Stream (SFT, BST, ICT)</option>
                      <option value="Arts & Humanities">Arts & Humanities (Logic, Political Science, History)</option>
                      <option value="O/L Core Subjects">O/L Core (Mathematics, Science, History, Languages)</option>
                      <option value="Grade 5 Scholarship Special">Grade 5 Scholarship (Paper I IQ & Paper II)</option>
                    </select>
                  </div>


                  {/* Student Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. S. Kowshikan"
                      value={studentName}
                      onChange={(e) => {
                        setStudentName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.name && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      WhatsApp / Mobile Contact
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 077 123 4567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  {/* District */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Student District
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Jaffna">Jaffna (யாழ்ப்பாணம்)</option>
                      <option value="Kilinochchi">Kilinochchi (கிளிநொச்சி)</option>
                      <option value="Mullaitivu">Mullaitivu (முல்லைத்தீவு)</option>
                      <option value="Vavuniya">Vavuniya (வவுனியா)</option>
                      <option value="Mannar">Mannar (மன்னார்)</option>
                      <option value="Batticaloa">Batticaloa (மட்டக்களப்பு)</option>
                      <option value="Trincomalee">Trincomalee (திருகோணமலை)</option>
                      <option value="Ampara">Ampara (அம்பாறை)</option>
                      <option value="Colombo">Colombo (கொழும்பு)</option>
                      <option value="Kandy">Kandy (கண்டி)</option>
                      <option value="Galle">Galle (காலி)</option>
                      <option value="Other">Other District</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Pre-Registration</span>
                  </button>

                  <p className="text-[10px] text-slate-500 text-center">
                    No payment required now · Our Alaveddy coordinator confirms placements by phone or WhatsApp
                  </p>
                </form>
              ) : (
                /* Confirmation Card */
                <div className="py-6 space-y-5 text-center my-auto animate-in fade-in duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Placement Reserved Successfully
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Welcome, {studentName}!
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                      Your provisional seat has been reserved. Our admissions desk will send the full class timetable and syllabus preview to <strong className="text-indigo-600 dark:text-indigo-400">{phone}</strong> via WhatsApp within 2 hours.
                    </p>
                  </div>

                  {/* Reservation Details Pill Box */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Reservation Reference</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {reservationCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Grade & Stream</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{grade}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Subject Focus</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{stream}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">District</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{district}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {onOpenAdmissions && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={onOpenAdmissions}
                        className="flex-1 justify-center"
                      >
                        Open Full Admissions Portal
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      className="justify-center"
                    >
                      Register Another
                    </Button>
                  </div>
                </div>
              )}

              {/* Bottom Quick Support Strip */}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-indigo-500" />
                  <span>+94 21 222 4567</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  <span>Alaveddy, Jaffna</span>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('contact')}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Contact Desk →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
