import React, { useState } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  FileText,
  BarChart3,
  Percent,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface TermScorePoint {
  term: string;
  myScore: number;
  batchAverage: number;
  percentile: number;
}

const TERM_PROGRESSION: TermScorePoint[] = [
  { term: 'Term 1 Test', myScore: 74, batchAverage: 58, percentile: 79 },
  { term: 'Monthly Drill 1', myScore: 81, batchAverage: 62, percentile: 85 },
  { term: 'Term 2 Test', myScore: 86, batchAverage: 64, percentile: 91 },
  { term: 'Mid-Year Mock', myScore: 89, batchAverage: 67, percentile: 94 },
  { term: 'Monthly Drill 2', myScore: 92, batchAverage: 69, percentile: 96 },
  { term: 'Final Term Paper', myScore: 95, batchAverage: 71, percentile: 98 },
];

const SUBJECT_MASTERY = [
  { subject: 'Pure Mathematics', mastery: 94, grade: 'A', remarks: 'Exceptional proof formulation in Calculus' },
  { subject: 'Applied Mathematics', mastery: 88, grade: 'A', remarks: 'Solid kinematics & relative velocity mechanics' },
  { subject: 'Physics (Theory & Practical)', mastery: 91, grade: 'A', remarks: 'High accuracy in wave optics & thermodynamics' },
  { subject: 'Chemistry (Physical & Organic)', mastery: 85, grade: 'A', remarks: 'Good equilibrium grasp; revise transition metals' },
];

const TOPIC_DIAGNOSTICS = [
  { topic: 'Definite & Indefinite Integration', status: 'strength', score: 96, category: 'Pure Maths' },
  { topic: 'Doppler Effect & Resonance Columns', status: 'strength', score: 94, category: 'Physics' },
  { topic: 'Electrochemistry & Redox Potentials', status: 'strength', score: 92, category: 'Chemistry' },
  { topic: 'Coordinate Geometry (Hyperbolas)', status: 'needs-work', score: 72, category: 'Pure Maths' },
  { topic: 'Rotational Dynamics & Moment of Inertia', status: 'needs-work', score: 76, category: 'Physics' },
];

export const GradingAnalyticsShowcase: React.FC = () => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(5);
  const [showReportCard, setShowReportCard] = useState<boolean>(false);

  const selectedPoint = TERM_PROGRESSION[selectedPointIndex];

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Compute SVG coordinates for the 6 points
  const getX = (index: number) => paddingX + (index / (TERM_PROGRESSION.length - 1)) * (svgWidth - 2 * paddingX);
  const getY = (score: number) => svgHeight - paddingY - ((score - 50) / 50) * (svgHeight - 2 * paddingY);

  const pointsString = TERM_PROGRESSION.map((p, i) => `${getX(i)},${getY(p.myScore)}`).join(' ');
  const batchPointsString = TERM_PROGRESSION.map((p, i) => `${getX(i)},${getY(p.batchAverage)}`).join(' ');

  const handleDownloadReport = () => {
    alert('Student Academic Progress Card (PDF) generated with TiT Faculty verification seal.');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
      {/* Top Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <LineChartIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
              Student Grading & Predictive Analytics
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Diagnostic Curves, Subject Mastery & Z-Score Forecast
          </h3>
          <p className="text-xs text-slate-300">
            Real-time tracking of term assessments, benchmark percentile comparison, and topic-level strengths.
          </p>
        </div>

        {/* Official Report Card Button */}
        <Button
          variant="primary"
          size="sm"
          className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          onClick={() => setShowReportCard(true)}
          leftIcon={<FileText className="w-3.5 h-3.5" />}
        >
          View Official Report Card
        </Button>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Overall Average
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">91.4%</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+12% vs intake</span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Island Percentile
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">Top 2.2%</span>
            <span className="text-xs font-medium text-slate-500">Tier 1</span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Predicted Z-Score
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">2.185</span>
            <span className="text-xs font-medium text-slate-500">Eng/Med Band</span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Attendance Rate
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">97.8%</span>
            <span className="text-xs font-semibold text-emerald-600">45/46 Sessions</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 p-6 gap-6">
        {/* Left: Interactive Score Progression Chart */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Assessment Progression Curve
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any milestone to inspect individual marks and cohort average
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Student Score
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Batch Average
              </span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Horizontal Grid lines */}
              {[60, 70, 80, 90, 100].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      className="text-slate-200 dark:text-slate-800"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Batch Average Line */}
              <polyline
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="5 5"
                points={batchPointsString}
              />

              {/* Student Score Gradient Area */}
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <polygon
                points={`${getX(0)},${svgHeight - paddingY} ${pointsString} ${getX(
                  TERM_PROGRESSION.length - 1
                )},${svgHeight - paddingY}`}
                fill="url(#scoreGrad)"
              />

              {/* Student Score Line */}
              <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Interactive Data Points */}
              {TERM_PROGRESSION.map((pt, i) => {
                const cx = getX(i);
                const cy = getY(pt.myScore);
                const isSelected = selectedPointIndex === i;

                return (
                  <g
                    key={i}
                    onClick={() => setSelectedPointIndex(i)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 7 : 5}
                      className={
                        isSelected
                          ? 'fill-indigo-600 stroke-white stroke-2'
                          : 'fill-white stroke-indigo-600 stroke-2 group-hover:scale-125'
                      }
                    />
                    <text
                      x={cx}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      className={`text-[10px] ${
                        isSelected
                          ? 'fill-indigo-600 font-bold'
                          : 'fill-slate-500 dark:fill-slate-400'
                      }`}
                    >
                      {pt.term}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Milestone Tooltip Bar */}
            <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {selectedPoint.term} Performance:
              </span>
              <div className="flex items-center gap-4">
                <span>
                  Your Mark:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {selectedPoint.myScore}/100
                  </strong>
                </span>
                <span>
                  Batch Average:{' '}
                  <strong className="text-slate-600 dark:text-slate-300">
                    {selectedPoint.batchAverage}/100
                  </strong>
                </span>
                <span className="text-emerald-600 font-semibold">
                  {selectedPoint.percentile}th Percentile
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Strengths & Growth Areas */}
          <div className="space-y-2 pt-2">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Curriculum Unit Drill-Down:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {TOPIC_DIAGNOSTICS.map((diag, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {diag.status === 'strength' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        {diag.topic}
                      </span>
                      <span className="text-[10px] text-slate-400">{diag.category}</span>
                    </div>
                  </div>
                  <span
                    className={`font-mono font-bold text-xs ${
                      diag.status === 'strength' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {diag.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Subject Mastery Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Subject Mastery & Letter Grades
          </h4>

          <div className="space-y-3">
            {SUBJECT_MASTERY.map((sub, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {sub.subject}
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {sub.grade}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Syllabus Mastery</span>
                    <span>{sub.mastery}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${sub.mastery}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {sub.remarks}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Report Card Modal */}
      {showReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  TiT
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    TiT Education & Academic Board
                  </h4>
                  <p className="text-[11px] text-slate-500">Official Term Academic Report Card</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportCard(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <div>
                <span className="text-slate-400 block text-[10px]">Student Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Kaveen Fernando</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Student Index:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">TIT-2026-MATH-041</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Academic Batch:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">A/L Physical Science 2026</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Projected Z-Score:</span>
                <span className="font-bold text-emerald-600">2.185 (Top 2.2% Band)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-4 font-bold text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-800">
                <div className="col-span-2">Subject</div>
                <div>Mark</div>
                <div>Grade</div>
              </div>
              {SUBJECT_MASTERY.map((sub, i) => (
                <div key={i} className="grid grid-cols-4 py-1 text-slate-700 dark:text-slate-300">
                  <div className="col-span-2 font-medium">{sub.subject}</div>
                  <div className="font-mono">{sub.mastery}%</div>
                  <div className="font-bold text-indigo-600">{sub.grade}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Verified by Head of Academic Deanery
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadReport}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
