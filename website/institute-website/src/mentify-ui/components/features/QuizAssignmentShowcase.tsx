import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Upload,
  ArrowRight,
  Sparkles,
  FileText,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Evaluate the limit: lim (x→0) [sin(3x) / (2x)]:',
    options: ['3/2', '2/3', '0', 'Does not exist'],
    correctIndex: 0,
    explanation: 'Rewrite as (3/2) · [sin(3x) / (3x)]. As x→0, sin(3x)/(3x) → 1. Hence, the limit evaluates to 3/2.',
    topic: 'Pure Mathematics: Limits',
  },
  {
    id: 2,
    question: 'A sound source of frequency 500 Hz moves at 34 m/s towards a stationary listener. (Speed of sound = 340 m/s). What is the observed frequency?',
    options: ['450 Hz', '500 Hz', '555.5 Hz', '600 Hz'],
    correctIndex: 2,
    explanation: 'f′ = f₀ · [v / (v - uₛ)] = 500 · [340 / (340 - 34)] = 500 · (340 / 306) ≈ 555.5 Hz.',
    topic: 'Physics: Doppler Effect',
  },
  {
    id: 3,
    question: 'Which of the following compounds exhibits optical isomerism (enantiomers)?',
    options: [
      '2-chloropropane',
      '2-chlorobutane',
      '1-chlorobutane',
      'Dichloromethane',
    ],
    correctIndex: 1,
    explanation: 'In 2-chlorobutane, Carbon-2 is bonded to 4 different groups: -H, -CH₃, -Cl, and -CH₂CH₃, making it a chiral stereocenter.',
    topic: 'Chemistry: Stereochemistry',
  },
  {
    id: 4,
    question: 'In an elastic one-dimensional collision between two identical masses where one is initially stationary, the moving mass:',
    options: [
      'Continues forward at half its speed',
      'Comes to a complete stop',
      'Reverses direction at equal speed',
      'Adheres to the stationary mass',
    ],
    correctIndex: 1,
    explanation: 'From conservation of momentum (m·u = m·v₁ + m·v₂) and kinetic energy (e = 1), velocities swap completely. The incoming mass stops (v₁ = 0) and the stationary mass moves at velocity u.',
    topic: 'Applied Mathematics: Collisions',
  },
];

interface AssignmentItem {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  maxScore: number;
  obtainedScore?: number;
  status: 'graded' | 'submitted' | 'pending';
  feedback?: string;
  rubrics: { criterion: string; weight: string; scoreAwarded?: string }[];
}

const SAMPLE_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'as-1',
    title: 'Assignment 04: Projectile Motion on Inclined Planes',
    course: 'Combined Mathematics (Applied)',
    dueDate: 'Nov 10, 2026',
    maxScore: 100,
    obtainedScore: 92,
    status: 'graded',
    feedback: 'Excellent vector resolution along the plane. Clear coordinate assignment and rigorous quadratic root derivation.',
    rubrics: [
      { criterion: 'Vector Resolution & Free-Body Geometry', weight: '30%', scoreAwarded: '28 / 30' },
      { criterion: 'Equation of Trajectory Derivation Steps', weight: '40%', scoreAwarded: '38 / 40' },
      { criterion: 'Time of Flight & Range Simplification', weight: '30%', scoreAwarded: '26 / 30' },
    ],
  },
  {
    id: 'as-2',
    title: 'Assignment 03: Complex Numbers & De Moivre’s Theorem',
    course: 'Combined Mathematics (Pure)',
    dueDate: 'Nov 18, 2026',
    maxScore: 100,
    status: 'pending',
    rubrics: [
      { criterion: 'Polar & Exponential Form Conversions', weight: '30%' },
      { criterion: 'Proof by Mathematical Induction', weight: '40%' },
      { criterion: 'Roots of Unity Argand Diagram Sketching', weight: '30%' },
    ],
  },
];

export const QuizAssignmentShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'assignment'>('quiz');

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(180); // 3 minutes

  // Assignment upload simulator state
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isQuizSubmitted || activeTab !== 'quiz') return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsQuizSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isQuizSubmitted, activeTab]);

  const handleSelectOption = (optionIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optionIndex,
    }));
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
    setCurrentQIndex(0);
    setTimeRemaining(180);
  };

  const calculateScore = () => {
    let correct = 0;
    SAMPLE_QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct += 1;
      }
    });
    return correct;
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSimulateUpload = (id: string) => {
    setUploadingAssignmentId(id);
    setTimeout(() => {
      setUploadingAssignmentId(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  const currentQ = SAMPLE_QUIZ_QUESTIONS[currentQIndex];
  const totalCorrect = calculateScore();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
      {/* Top Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-300">
              Interactive Assessment Studio
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Timed Question Drills & Assignment Rubrics
          </h3>
          <p className="text-xs text-slate-300">
            Take instant past-paper MCQs with live grading, or inspect homework rubrics with TA step feedback.
          </p>
        </div>

        {/* Sub-mode switch tabs */}
        <div className="flex items-center p-1 bg-white/10 backdrop-blur-sm rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Live Quiz Player
          </button>
          <button
            onClick={() => setActiveTab('assignment')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'assignment'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Assignment Portal & Rubrics
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Live Quiz Player */}
      {activeTab === 'quiz' && (
        <div className="p-6">
          {!isQuizSubmitted ? (
            <div className="space-y-6">
              {/* Question Navigation & Timer Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Question:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {SAMPLE_QUIZ_QUESTIONS.map((q, idx) => {
                      const isAnswered = selectedAnswers[idx] !== undefined;
                      const isCurrent = currentQIndex === idx;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQIndex(idx)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                              : isAnswered
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Time Left: {formatTimer(timeRemaining)}</span>
                </div>
              </div>

              {/* Active Question Box */}
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {currentQ.topic}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Q{currentQIndex + 1}. {currentQ.question}
                  </h4>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQIndex] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              isSelected
                                ? 'text-indigo-900 dark:text-indigo-200 font-bold'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {option}
                          </span>
                        </div>

                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => prev - 1)}
                >
                  Previous Question
                </Button>

                <div className="flex items-center gap-2">
                  {currentQIndex < SAMPLE_QUIZ_QUESTIONS.length - 1 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setIsQuizSubmitted(true)}
                    >
                      Submit Answers & Grade
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Quiz Completed Results & Explanations */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <Badge variant="success" size="md" className="mb-2">
                    Evaluation Finished
                  </Badge>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Your Score: {totalCorrect} / {SAMPLE_QUIZ_QUESTIONS.length} ({((totalCorrect / SAMPLE_QUIZ_QUESTIONS.length) * 100).toFixed(0)}%)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Benchmark: 80th Percentile among A/L Batch 2026 participants.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestartQuiz}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Retake Drill
                </Button>
              </div>

              {/* Detailed Question Review */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Step-by-Step Marking & Rubric Rationales
                </h4>

                {SAMPLE_QUIZ_QUESTIONS.map((q, idx) => {
                  const userChoice = selectedAnswers[idx];
                  const isCorrect = userChoice === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <span className="font-bold text-slate-900 dark:text-white">
                            Q{idx + 1}. {q.question}
                          </span>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {isCorrect ? '+1.0 Mark' : '0.0 Marks'}
                        </span>
                      </div>

                      <div className="pl-6 space-y-1">
                        <p className="text-slate-600 dark:text-slate-300">
                          <span className="font-semibold">Correct Answer:</span> {q.options[q.correctIndex]}
                        </p>
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                          <span className="font-semibold">Syllabus Reason:</span> {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Assignment Submission & Rubrics Portal */}
      {activeTab === 'assignment' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAMPLE_ASSIGNMENTS.map((as) => (
              <div
                key={as.id}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {as.course}
                    </span>
                    <Badge
                      variant={as.status === 'graded' ? 'success' : 'primary'}
                      size="sm"
                    >
                      {as.status === 'graded' ? `Graded: ${as.obtainedScore}/${as.maxScore}` : 'Pending Submission'}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {as.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Due Date: {as.dueDate}
                  </p>

                  {/* Rubric Breakdown Table */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">
                      Marking Rubric Breakdown:
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {as.rubrics.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                        >
                          <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {r.criterion}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                            {r.scoreAwarded || r.weight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {as.feedback && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold block mb-0.5">Faculty Feedback:</span>
                      <p className="text-[11px] leading-relaxed">{as.feedback}</p>
                    </div>
                  )}
                </div>

                {/* Upload Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  {as.status === 'pending' ? (
                    <div>
                      <button
                        onClick={() => handleSimulateUpload(as.id)}
                        disabled={uploadingAssignmentId === as.id}
                        className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingAssignmentId === as.id
                          ? 'Uploading & Verifying PDF...'
                          : 'Simulate PDF Homework Submission'}
                      </button>
                      {uploadSuccess && (
                        <div className="mt-2 text-center text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paper Submitted for Faculty Review!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Certified by TiT Faculty TA</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">92% High Distinction</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
