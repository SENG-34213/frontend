import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Send,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/FormControls';
import { SITE_CONFIG } from '../../lib/config/site';

export interface TutorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorApplicationModal: React.FC<TutorApplicationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Jaffna');
  const [medium, setMedium] = useState('Tamil');
  const [subject, setSubject] = useState('Mathematics');
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['grade-10', 'grade-11']);
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appId, setAppId] = useState('');

  if (!isOpen) return null;

  const handleGradeToggle = (gradeId: string) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId) ? prev.filter((id) => id !== gradeId) : [...prev, gradeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setAppId(`TIT-TUTOR-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/TiTJaffna-logo.jpeg"
              alt="TiT Jaffna Publication"
              className="w-12 h-12 rounded-full object-contain bg-white shadow-md ring-2 ring-indigo-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Apply as a TiT Tutor
                </h3>
                <span className="text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/80">
                  Private Tuition
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Join our digital faculty reaching students from Grade 1 to Grade 13 across Sri Lanka
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Application Submitted Successfully!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Thank you for applying to teach at TiT Online Education (Alaveddy, Jaffna). Your application reference is:
              </p>
              <div className="font-mono text-base font-extrabold text-indigo-600 dark:text-indigo-400 pt-1">
                {appId}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto pt-2">
              Our academic coordination team will contact you via WhatsApp (+94 77 015 8446) within 48 hours for syllabus onboarding.
            </p>
            <Button variant="primary" size="md" onClick={onClose} className="mt-4">
              Return to Platform
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (with Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. K. Sivakumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+94 77 XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="tutor@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {SITE_CONFIG.districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teaching Medium
                </label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Tamil">Tamil Medium</option>
                  <option value="English">English Medium</option>
                  <option value="Sinhala">Sinhala Medium</option>
                  <option value="Bilingual">Bilingual (Tamil & English)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {SITE_CONFIG.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Years of Teaching Experience
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1">1 - 2 Years</option>
                  <option value="3">3 - 5 Years</option>
                  <option value="6">6 - 10 Years</option>
                  <option value="10">10+ Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Grades (Select all that apply)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto">
                {SITE_CONFIG.grades.map((g) => {
                  const isChecked = selectedGrades.includes(g.id);
                  return (
                    <label
                      key={g.id}
                      className={`text-[11px] p-1.5 rounded-lg border cursor-pointer select-none flex items-center gap-1.5 ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleGradeToggle(g.id)}
                        className="sr-only"
                      />
                      <span>{g.shortName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Educational Qualifications & Bio *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. B.Sc. (Hons) Mathematics, 5 years teaching O/L and A/L classes in Jaffna district..."
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
