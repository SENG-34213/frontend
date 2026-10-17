import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  FileText,
  Users,
  Shield,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Examination, NavigationTab } from '../types';
import { mockExaminations, mockCourses, mockStudents } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';

interface ExamManagementViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const ExamManagementView: React.FC<ExamManagementViewProps> = ({ onNavigate }) => {
  const [exams, setExams] = useState<Examination[]>(mockExaminations);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard state
  const [wizardCourseId, setWizardCourseId] = useState(mockCourses[0]?.id || '');
  const [wizardTitle, setWizardTitle] = useState('');
  const [wizardType, setWizardType] = useState<'Midterm' | 'Final' | 'Practical Exam'>('Midterm');
  const [wizardDate, setWizardDate] = useState('2026-11-15');
  const [wizardTime, setWizardTime] = useState('10:00 AM');
  const [wizardDuration, setWizardDuration] = useState('120');
  const [wizardRoom, setWizardRoom] = useState('Alan Turing Auditorium');
  const [wizardWeight, setWizardWeight] = useState('30');

  const handleFinishWizard = (e: React.FormEvent) => {
    e.preventDefault();
    const course = mockCourses.find((c) => c.id === wizardCourseId) || mockCourses[0];
    const newExam: Examination = {
      id: `exm-${Date.now()}`,
      courseId: course.id,
      courseCode: course.code,
      title: wizardTitle || `${course.code} ${wizardType} Examination`,
      examType: wizardType,
      scheduledDate: wizardDate,
      startTime: wizardTime,
      durationMinutes: Number(wizardDuration) || 120,
      roomOrPlatform: wizardRoom,
      totalMarks: 100,
      weightagePercent: Number(wizardWeight) || 30,
      status: 'Scheduled',
      enrolledStudents: course.enrolledCount,
      gradedStudents: 0,
    };

    setExams([newExam, ...exams]);
    setIsWizardOpen(false);
    setWizardStep(1);
    setWizardTitle('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Examination Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administer formal midterms and final comprehensive examinations, room logistics, and grading protocols.
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule New Exam</span>
        </button>
      </div>

      {/* 5-Step Exam Creation Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-700">
                    Step {wizardStep} of 5
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {wizardStep === 1 && '1. Basic Course & Exam Type'}
                    {wizardStep === 2 && '2. Proctoring & Exam Duration'}
                    {wizardStep === 3 && '3. Content Format & Question Blueprint'}
                    {wizardStep === 4 && '4. Scheduling & Venue Logistics'}
                    {wizardStep === 5 && '5. Review & Publish Schedule'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {/* Step indicator bar */}
              <div className="flex gap-1.5 mt-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      s <= wizardStep ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Wizard Body */}
            <div className="p-6 space-y-4">
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Course
                    </label>
                    <select
                      value={wizardCourseId}
                      onChange={(e) => setWizardCourseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                    >
                      {mockCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Exam Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Midterm', 'Final', 'Practical Exam'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setWizardType(t)}
                          className={`p-3 text-xs font-semibold rounded-lg border text-center transition-colors ${
                            wizardType === t
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Exam Formal Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Midterm Examination: Core Data Structures"
                      value={wizardTitle}
                      onChange={(e) => setWizardTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        value={wizardDuration}
                        onChange={(e) => setWizardDuration(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Course Grade Weight (%)
                      </label>
                      <input
                        type="number"
                        value={wizardWeight}
                        onChange={(e) => setWizardWeight(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">Proctoring Mode</span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input type="checkbox" defaultChecked className="text-indigo-600" />
                      <span>Require physical faculty proctor verification</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input type="checkbox" defaultChecked className="text-indigo-600" />
                      <span>Lockdown browser mode enabled</span>
                    </label>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-900">Question Blueprint Format</h4>
                    <p className="text-xs text-slate-500">
                      Standard university examination blueprint comprising Section A (Objective MCQ, 30 marks), Section B (Algorithmic Proofs, 40 marks), and Section C (Code Implementation, 30 marks).
                    </p>
                  </div>
                  <div className="text-xs text-slate-600">
                    Question paper blueprint will be finalized in the Mentify Examination Vault 48 hours prior to start.
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={wizardDate}
                        onChange={(e) => setWizardDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="text"
                        value={wizardTime}
                        onChange={(e) => setWizardTime(e.target.value)}
                        placeholder="10:00 AM"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lecture Hall / Venue
                    </label>
                    <input
                      type="text"
                      value={wizardRoom}
                      onChange={(e) => setWizardRoom(e.target.value)}
                      placeholder="e.g. Turing Hall Theatre A"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Review Examination Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><strong>Title:</strong> {wizardTitle || 'Midterm Examination'}</div>
                    <div><strong>Type:</strong> {wizardType}</div>
                    <div><strong>Date:</strong> {wizardDate} at {wizardTime}</div>
                    <div><strong>Duration:</strong> {wizardDuration} minutes</div>
                    <div><strong>Weight:</strong> {wizardWeight}% of final grade</div>
                    <div><strong>Location:</strong> {wizardRoom}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {wizardStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirm & Publish Exam</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Exams List */}
      <div className="space-y-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {exam.courseCode}
                </span>
                <span className="text-xs font-semibold text-slate-500">{exam.examType}</span>
                <StatusBadge status={exam.status} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{exam.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.scheduledDate} at {exam.startTime}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.durationMinutes} Minutes</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.roomOrPlatform}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-right text-xs">
                <span className="text-slate-400 block text-[10px]">Registered Candidates</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {exam.enrolledStudents} students
                </span>
              </div>

              <button
                onClick={() => onNavigate('grades')}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>View Results Sheet</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
