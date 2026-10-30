import React from 'react';
import { Award, BookOpen, CheckCircle2 } from 'lucide-react';
import { TeacherProfile } from '../../types';
import { Badge } from '../ui/Badge';

export interface TeacherCardProps {
  teacher: TeacherProfile;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({ teacher }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-xl dark:hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between">
      <div>
        {/* Avatar & Header */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={teacher.avatarUrl}
              alt={teacher.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 dark:border-indigo-900/60 shadow-xs"
              loading="lazy"
            />
            {teacher.verified && (
              <span
                className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 text-indigo-600 shadow-2xs"
                title="Verified Educator"
              >
                <CheckCircle2 className="w-4 h-4 fill-indigo-600 text-white" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug truncate">{teacher.name}</h4>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 line-clamp-1">{teacher.title}</p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                {teacher.experienceYears}+ Yrs Exp.
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                {teacher.coursesCount} Active Courses
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
          {teacher.bio}
        </p>

        {/* Subjects */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {teacher.subjects.map((sub, idx) => (
            <Badge key={idx} variant="neutral" size="sm">
              {sub}
            </Badge>
          ))}
        </div>
      </div>

      {/* Qualifications */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
          Credentials
        </span>
        <ul className="space-y-1">
          {teacher.qualifications.slice(0, 2).map((q, idx) => (
            <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <span className="line-clamp-1">{q}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
