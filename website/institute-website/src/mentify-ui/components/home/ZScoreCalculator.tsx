import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface SubjectMark {
  name: string;
  mark: number;
}

const STREAMS_CONFIG = {
  physical: {
    name: 'Physical Science (Maths)',
    subjects: ['Combined Mathematics', 'Physics', 'Chemistry'],
    mean: 52,
    stdDev: 14.5,
    faculties: [
      { name: 'University of Moratuwa - Engineering', minZ: 1.95 },
      { name: 'University of Peradeniya - Engineering', minZ: 1.82 },
      { name: 'University of Colombo - Computer Science', minZ: 1.75 },
      { name: 'University of Sri Jayewardenepura - Applied Science', minZ: 1.35 },
    ],
  },
  bio: {
    name: 'Biological Science',
    subjects: ['Biology', 'Chemistry', 'Physics'],
    mean: 49,
    stdDev: 15.2,
    faculties: [
      { name: 'University of Colombo - Faculty of Medicine', minZ: 2.12 },
      { name: 'University of Peradeniya - Faculty of Medicine', minZ: 1.98 },
      { name: 'University of Sri Jayewardenepura - Dental Science', minZ: 1.78 },
      { name: 'University of Kelaniya - Molecular Biology', minZ: 1.45 },
    ],
  },
  commerce: {
    name: 'Commerce Stream',
    subjects: ['Accounting', 'Business Studies', 'Economics'],
    mean: 55,
    stdDev: 13.8,
    faculties: [
      { name: 'University of Sri Jayewardenepura - Management', minZ: 1.85 },
      { name: 'University of Colombo - Management & Finance', minZ: 1.78 },
      { name: 'University of Kelaniya - Commerce', minZ: 1.42 },
    ],
  },
};

export const ZScoreCalculator: React.FC<{ onOpenAdmissions?: () => void }> = ({ onOpenAdmissions }) => {
  const [selectedStream, setSelectedStream] = useState<'physical' | 'bio' | 'commerce'>('physical');
  const streamData = STREAMS_CONFIG[selectedStream];

  const [marks, setMarks] = useState<Record<string, number>>({
    'Combined Mathematics': 88,
    Physics: 82,
    Chemistry: 79,
    Biology: 85,
    Accounting: 80,
    'Business Studies': 78,
    Economics: 82,
  });

  const handleMarkChange = (subject: string, val: number) => {
    setMarks((prev) => ({
      ...prev,
      [subject]: Math.max(0, Math.min(100, val)),
    }));
  };

  // Compute average score & standardized Z-Score estimate
  const currentSubjectMarks = streamData.subjects.map((s) => marks[s] ?? 75);
  const rawAverage = currentSubjectMarks.reduce((a, b) => a + b, 0) / currentSubjectMarks.length;

  // Standardized Z-Score calculation approximation based on national distributions
  const estimatedZScore = Number(
    ((rawAverage - streamData.mean) / streamData.stdDev).toFixed(3)
  );

  // Percentile estimate using standard normal approximation
  const percentile = Math.min(
    99.9,
    Math.max(50, Number((50 + (estimatedZScore / 3) * 49.9).toFixed(1)))
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
              Interactive Academic Tool
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            G.C.E. A/L Projected Z-Score & Faculty Eligibility Calculator
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Slide your target term marks to project your standard deviation Z-score and check university cutoff eligibility.
          </p>
        </div>

        {/* Stream Selector Buttons */}
        <div className="flex items-center p-1 bg-white/10 backdrop-blur-sm rounded-2xl text-xs font-semibold shrink-0">
          {(['physical', 'bio', 'commerce'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStream(st)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedStream === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {st === 'physical' ? 'Physical (Maths)' : st === 'bio' ? 'Biological' : 'Commerce'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 p-6 sm:p-8 gap-8">
        {/* Left Side: Sliders for 3 Subjects */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Target Assessment Marks ({streamData.name})
            </h4>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mean: {rawAverage.toFixed(1)}/100
            </span>
          </div>

          <div className="space-y-5">
            {streamData.subjects.map((subj) => {
              const currentVal = marks[subj] ?? 75;
              return (
                <div key={subj} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{subj}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                      {currentVal} Marks
                    </span>
                  </div>

                  <input
                    type="range"
                    min="35"
                    max="100"
                    value={currentVal}
                    onChange={(e) => handleMarkChange(subj, Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>35 (Pass threshold)</span>
                    <span>75 (Distinction A)</span>
                    <span>100 (Max)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Calculated using the Department of Examinations standardization algorithm: $Z = (X - \mu) / \sigma$.
              TiT syllabus revision courses are designed to boost raw performance above the top 5% island tier.
            </p>
          </div>
        </div>

        {/* Right Side: Projected Z-Score & Admission Eligibility */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/70 dark:from-slate-800/80 dark:via-slate-900 dark:to-indigo-950/40 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/60 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
              Simulated Forecast Result
            </span>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {estimatedZScore > 0 ? `+${estimatedZScore}` : estimatedZScore}
              </span>
              <Badge variant="success" size="md">
                Top {((100 - percentile) < 0.1 ? 0.1 : (100 - percentile)).toFixed(1)}% Band
              </Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              National Percentile Rank: ~{percentile}th Percentile across Sri Lanka.
            </p>

            {/* University Faculty Admission Matrix */}
            <div className="mt-5 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase block">
                Target Faculty Admission Feasibility:
              </span>

              {streamData.faculties.map((fac, idx) => {
                const isEligible = estimatedZScore >= fac.minZ;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isEligible ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {fac.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-mono">Cutoff: {fac.minZ}</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded ${
                          isEligible
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isEligible ? 'High Match' : 'Stretch'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAdmissions}
              className="w-full rounded-xl text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Consult TiT Faculty Counselor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
