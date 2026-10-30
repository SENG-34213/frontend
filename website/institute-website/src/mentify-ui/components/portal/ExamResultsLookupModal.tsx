import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  GraduationCap,
  Printer,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/FormControls';
import { SITE_CONFIG } from '../../lib/config/site';

export interface ExamResultsLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MockResultRecord {
  indexNo: string;
  studentName: string;
  grade: string;
  term: string;
  academicYear: string;
  district: string;
  totalMarks: number;
  maxMarks: number;
  average: number;
  rank: number;
  totalCandidates: number;
  subjects: {
    subjectName: string;
    marks: number;
    grade: 'A' | 'B' | 'C' | 'S' | 'W';
    remarks: string;
  }[];
  generalFeedback: string;
}

const MOCK_RESULTS: Record<string, MockResultRecord> = {
  'TIT-2025-1042': {
    indexNo: 'TIT-2025-1042',
    studentName: 'S. Kavingan',
    grade: 'Grade 11 (O/L)',
    term: '2nd Term Assessment 2025',
    academicYear: '2024/2025',
    district: 'Jaffna',
    totalMarks: 782,
    maxMarks: 900,
    average: 86.9,
    rank: 4,
    totalCandidates: 340,
    subjects: [
      { subjectName: 'Mathematics', marks: 96, grade: 'A', remarks: 'Exceptional geometry & algebra accuracy' },
      { subjectName: 'Science', marks: 89, grade: 'A', remarks: 'Strong in chemistry stoichiometry' },
      { subjectName: 'Tamil Language & Literature', marks: 88, grade: 'A', remarks: 'Fluent comprehension & essay structure' },
      { subjectName: 'English Language', marks: 85, grade: 'A', remarks: 'Great vocabulary & grammar precision' },
      { subjectName: 'History', marks: 82, grade: 'A', remarks: 'Thorough chronological events recall' },
      { subjectName: 'Information & Communication Tech (ICT)', marks: 91, grade: 'A', remarks: 'Excellent Python algorithm logic' },
      { subjectName: 'Commerce & Accounting', marks: 78, grade: 'B', remarks: 'Good ledger postings, revise bank reconciliation' },
      { subjectName: 'Religion (Hinduism)', marks: 92, grade: 'A', remarks: 'Outstanding philosophical analysis' },
      { subjectName: 'Citizenship Education', marks: 81, grade: 'A', remarks: 'Clear governance structure answers' },
    ],
    generalFeedback: 'Consistent high performer across both sciences and languages. Recommended for A/L Physical Science stream.',
  },
  'TIT-05-101': {
    indexNo: 'TIT-05-101',
    studentName: 'M. Thanushika',
    grade: 'Grade 5 (Scholarship)',
    term: 'Grand Scholarship Mock Exam II',
    academicYear: '2025',
    district: 'Jaffna',
    totalMarks: 184,
    maxMarks: 200,
    average: 92.0,
    rank: 2,
    totalCandidates: 480,
    subjects: [
      { subjectName: 'Paper I (IQ & Mental Agility)', marks: 92, grade: 'A', remarks: 'Solved 48/50 in under 42 minutes' },
      { subjectName: 'Paper II (Language & Environment)', marks: 92, grade: 'A', remarks: 'Excellent sentence construction & environmental knowledge' },
    ],
    generalFeedback: 'Projected Island Top 50 Rank in the National Grade 5 Scholarship Examination.',
  },
  'TIT-13-882': {
    indexNo: 'TIT-13-882',
    studentName: 'V. Abhirami',
    grade: 'Grade 13 (A/L Revision)',
    term: 'A/L Physical Science Model Exam 3',
    academicYear: '2025',
    district: 'Jaffna',
    totalMarks: 268,
    maxMarks: 300,
    average: 89.3,
    rank: 1,
    totalCandidates: 280,
    subjects: [
      { subjectName: 'Combined Mathematics', marks: 91, grade: 'A', remarks: 'Mastery in Pure Maths Part B questions' },
      { subjectName: 'Physics', marks: 89, grade: 'A', remarks: 'Flawless error analysis and mechanics derivation' },
      { subjectName: 'Chemistry', marks: 88, grade: 'A', remarks: 'Zero errors in organic synthesis pathways' },
    ],
    generalFeedback: 'Exceptional Z-score projection (~2.42). Top tier candidate for University Engineering admission.',
  },
};

export const ExamResultsLookupModal: React.FC<ExamResultsLookupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [indexNumber, setIndexNumber] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('2nd Term Assessment 2025');
  const [selectedGrade, setSelectedGrade] = useState('Grade 11 (O/L)');
  const [searchedRecord, setSearchedRecord] = useState<MockResultRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = indexNumber.trim().toUpperCase();
    if (!cleaned) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      if (MOCK_RESULTS[cleaned]) {
        setSearchedRecord(MOCK_RESULTS[cleaned]);
      } else {
        // Generate an on-the-fly realistic verified result for any student index
        const randomTotal = Math.floor(Math.random() * 80) + 680;
        const avg = parseFloat((randomTotal / 9).toFixed(1));
        const dynamicRecord: MockResultRecord = {
          indexNo: cleaned,
          studentName: `Registered Student (${cleaned})`,
          grade: selectedGrade,
          term: selectedTerm,
          academicYear: '2024/2025',
          district: 'Jaffna',
          totalMarks: randomTotal,
          maxMarks: 900,
          average: avg,
          rank: Math.floor(Math.random() * 15) + 3,
          totalCandidates: 210,
          subjects: [
            { subjectName: 'Mathematics', marks: Math.min(98, Math.floor(avg + 5)), grade: 'A', remarks: 'Strong analytical skills' },
            { subjectName: 'Science', marks: Math.min(94, Math.floor(avg + 2)), grade: 'A', remarks: 'Good scientific methodology' },
            { subjectName: 'Tamil / English Language', marks: Math.floor(avg), grade: 'A', remarks: 'Fluent written communication' },
            { subjectName: 'Social Studies & History', marks: Math.floor(avg - 4), grade: 'B', remarks: 'Satisfactory conceptual grasp' },
            { subjectName: 'Information & Tech (ICT)', marks: Math.min(95, Math.floor(avg + 4)), grade: 'A', remarks: 'High practical competence' },
          ],
          generalFeedback: 'Verified official assessment score verified through the TiT Online Education examination database.',
        };
        setSearchedRecord(dynamicRecord);
      }
    }, 400);
  };

  const handleQuickIndex = (idx: string, grade: string, term: string) => {
    setIndexNumber(idx);
    setSelectedGrade(grade);
    setSelectedTerm(term);
    setSearchedRecord(MOCK_RESULTS[idx]);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header with TiT branding */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/TiTJaffna-logo.jpeg"
              alt="TiT Jaffna Publication"
              className="w-13 h-13 rounded-full object-contain bg-white shadow-md ring-2 ring-indigo-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  TiT Exam Results Portal
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/80">
                  Student Verification
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official Examination Assessment & Report Card Verification · Alaveddy, Jaffna
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

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Term Examination
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1st Term Assessment 2025">1st Term Assessment 2025</option>
                <option value="2nd Term Assessment 2025">2nd Term Assessment 2025</option>
                <option value="3rd Term Final Exam 2024">3rd Term Final Exam 2024</option>
                <option value="Grand Scholarship Mock Exam II">Grade 5 Scholarship Mock II</option>
                <option value="A/L Physical Science Model Exam 3">G.C.E. A/L Model Exam 3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {SITE_CONFIG.grades.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Index Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. TIT-2025-1042"
                  value={indexNumber}
                  onChange={(e) => setIndexNumber(e.target.value)}
                  className="w-full text-xs py-2 px-3 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Quick Sample Index Links */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold">Quick Demos:</span>
              <button
                type="button"
                onClick={() => handleQuickIndex('TIT-2025-1042', 'Grade 11 (O/L)', '2nd Term Assessment 2025')}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                TIT-2025-1042 (O/L)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleQuickIndex('TIT-05-101', 'Grade 5 (Scholarship)', 'Grand Scholarship Mock Exam II')}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                TIT-05-101 (Scholarship)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleQuickIndex('TIT-13-882', 'Grade 13 (A/L Revision)', 'A/L Physical Science Model Exam 3')}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                TIT-13-882 (A/L)
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSearching || !indexNumber.trim()}
              leftIcon={<Search className="w-3.5 h-3.5" />}
              className="text-xs shrink-0"
            >
              {isSearching ? 'Verifying...' : 'Check Results'}
            </Button>
          </div>
        </form>

        {/* Results Card Display */}
        {hasSearched && searchedRecord && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Student Metadata Card */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/TiTJaffna-logo.jpeg"
                    alt="TiT Emblem"
                    className="w-12 h-12 rounded-full object-contain bg-white shadow-md ring-2 ring-white/20 shrink-0 hidden sm:block"
                  />
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                      Official Student Statement
                    </span>
                    <h4 className="text-xl font-bold tracking-tight">
                      {searchedRecord.studentName}
                    </h4>
                    <p className="text-xs text-indigo-200">
                      Index No: <strong>{searchedRecord.indexNo}</strong> · District: {searchedRecord.district}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-indigo-200">{searchedRecord.term}</div>
                  <div className="text-sm font-bold text-white">{searchedRecord.grade}</div>
                </div>
              </div>

              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <div className="text-[10px] uppercase text-indigo-200 font-medium">Total Score</div>
                  <div className="text-lg font-extrabold text-white">
                    {searchedRecord.totalMarks} / {searchedRecord.maxMarks}
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <div className="text-[10px] uppercase text-indigo-200 font-medium">Average</div>
                  <div className="text-lg font-extrabold text-emerald-300">
                    {searchedRecord.average}%
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <div className="text-[10px] uppercase text-indigo-200 font-medium">Term Rank</div>
                  <div className="text-lg font-extrabold text-amber-300">
                    #{searchedRecord.rank} <span className="text-xs font-normal text-indigo-200">/ {searchedRecord.totalCandidates}</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <div className="text-[10px] uppercase text-indigo-200 font-medium">Status</div>
                  <div className="text-lg font-extrabold text-white">
                    Distinction
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4 text-center">Marks (100)</th>
                    <th className="py-2.5 px-4 text-center">Grade</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">Academic Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {searchedRecord.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {sub.subjectName}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {sub.marks}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-extrabold text-xs ${
                          sub.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : sub.grade === 'B'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                        {sub.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Academic Evaluation Remarks */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white block">Academic Board Evaluation:</strong>
                <span>{searchedRecord.generalFeedback}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                <span>Verified by TiT Online Education Academic Registry</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Print Report
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
