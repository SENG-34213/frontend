import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileCode,
  FileText,
  Download,
  Save,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  AlertCircle,
  Search,
  ExternalLink,
} from 'lucide-react';
import { StudentSubmission, Assignment, NavigationTab } from '../types';
import { mockSubmissions, mockAssignments } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';

interface SubmissionReviewWorkspaceProps {
  initialAssignmentId?: string;
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const SubmissionReviewWorkspace: React.FC<SubmissionReviewWorkspaceProps> = ({
  initialAssignmentId = 'asg-01',
  onBack,
  onNavigate,
}) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignmentId);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(mockSubmissions);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(
    mockSubmissions[0]?.id || ''
  );

  // Scoring states for currently selected submission
  const currentSubmission =
    submissions.find((s) => s.id === selectedSubmissionId) || submissions[0];
  const currentAssignment =
    mockAssignments.find((a) => a.id === selectedAssignmentId) || mockAssignments[0];

  const [inputScore, setInputScore] = useState<string>(
    currentSubmission?.score !== undefined ? String(currentSubmission.score) : ''
  );
  const [feedback, setFeedback] = useState<string>(currentSubmission?.feedback || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // When switching submission, update local inputs
  const handleSelectSubmission = (sub: StudentSubmission) => {
    setSelectedSubmissionId(sub.id);
    setInputScore(sub.score !== undefined ? String(sub.score) : '');
    setFeedback(sub.feedback || '');
  };

  const handleSaveGrade = (goToNext = false) => {
    const numericScore = Number(inputScore);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > currentAssignment.maxMarks) {
      alert(`Please enter a valid mark between 0 and ${currentAssignment.maxMarks}.`);
      return;
    }

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === currentSubmission.id
          ? {
              ...sub,
              score: numericScore,
              feedback,
              status: 'Graded',
            }
          : sub
      )
    );

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);

      if (goToNext) {
        const currentIndex = submissions.findIndex((s) => s.id === currentSubmission.id);
        if (currentIndex < submissions.length - 1) {
          handleSelectSubmission(submissions[currentIndex + 1]);
        }
      }
    }, 600);
  };

  const gradedCount = submissions.filter((s) => s.status === 'Graded').length;

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-slate-100 overflow-hidden -m-4 lg:-m-6">
      {/* Top Workspace Header Bar */}
      <div className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Back to Assignments"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {currentAssignment.courseCode}
              </span>
              <h1 className="text-sm font-bold text-slate-900 truncate">
                {currentAssignment.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <span>Grading Progress:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {gradedCount} / {submissions.length}
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(gradedCount / submissions.length) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onNavigate('grades')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Open Gradebook
          </button>
        </div>
      </div>

      {/* 3-Column Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Student Roster */}
        <aside className="w-64 sm:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200 bg-slate-50/70">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Submissions ({submissions.length})
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter student..."
                className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {submissions.map((sub, idx) => {
              const isSelected = sub.id === currentSubmission?.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`p-3 cursor-pointer transition-colors text-left flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                      {sub.studentName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{sub.submissionDate}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <StatusBadge status={sub.status} variant="clean" />
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {sub.score !== undefined ? `${sub.score}/${sub.maxMarks}` : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Student Work & File Preview */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden border-r border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {currentSubmission.studentName}
                </h2>
                <StatusBadge status={currentSubmission.status} />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Submitted on {currentSubmission.submissionDate}
              </p>
            </div>

            {currentSubmission.submittedFileName && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono hidden md:inline">
                  {currentSubmission.submittedFileName}
                </span>
                <button
                  onClick={() => alert(`Downloading ${currentSubmission.submittedFileName} from S3 bucket...`)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Student Written Statement */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Student Submission Notes & Architecture
              </span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                {currentSubmission.submittedContentText || 'No explanatory comments provided.'}
              </p>
            </div>

            {/* Code / Artifact Viewer */}
            {currentSubmission.codeSnippet && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-900 px-4 py-2 text-slate-300 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AVLTree.java / Source File Preview</span>
                  </div>
                  <span className="text-[11px] text-slate-500">UTF-8 · 38 Test Cases Passed</span>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed select-text">
                  <code>{currentSubmission.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        </main>

        {/* Right Column: Grading Panel & Rubrics */}
        <aside className="w-80 bg-slate-50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Evaluation & Rubric Scoring
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Assignment Maximum: <strong className="font-mono text-slate-900">{currentAssignment.maxMarks} marks</strong>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Direct Score Input */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Assigned Mark (0 - {currentAssignment.maxMarks})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={currentAssignment.maxMarks}
                  value={inputScore}
                  onChange={(e) => setInputScore(e.target.value)}
                  placeholder="e.g. 95"
                  className="w-24 px-3 py-2 text-base font-bold font-mono text-indigo-700 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-xs text-slate-400">/ {currentAssignment.maxMarks} marks</span>
              </div>
            </div>

            {/* Rubric Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Rubric Criteria
              </span>
              <div className="space-y-2">
                {currentAssignment.rubricItems.map((r, i) => (
                  <div key={i} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2">
                    <span className="text-slate-700 leading-snug">{r.criterion}</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums shrink-0">
                      {r.marks}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Editor */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Written Feedback
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFeedback(
                      'Well executed implementation. Edge cases in rotation balance factors handled gracefully.'
                    )
                  }
                  className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Insert Template</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write actionable, constructive guidance for the student..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
              />

              {/* Quick comment chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {['Great test coverage', 'Review rotation tie-breakers', 'Clean code style'].map(
                  (chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFeedback((prev) => (prev ? `${prev} ${chip}.` : `${chip}.`))}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      + {chip}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-2">
            <button
              onClick={() => handleSaveGrade(true)}
              disabled={saveSuccess}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Grade Recorded! Moving next...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Next Student</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              onClick={() => handleSaveGrade(false)}
              className="w-full py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Save Grade Only
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
