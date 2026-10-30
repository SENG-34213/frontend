import React from 'react';
import { Calendar, Clock, MapPin, Star, User } from 'lucide-react';
import { CourseItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface CourseCardProps {
  course: CourseItem;
  onViewDetails: (course: CourseItem) => void;
  onApply?: (course: CourseItem) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onViewDetails, onApply }) => {
  const availabilityVariants: Record<string, 'success' | 'warning' | 'neutral' | 'error'> = {
    'Enrollment Open': 'success',
    'Limited Seats': 'warning',
    Waitlist: 'neutral',
    Closed: 'error',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-xl dark:hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden group">
      {/* Thumbnail Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          <Badge variant="primary" size="sm" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-indigo-700 dark:text-indigo-300 shadow-2xs">
            {course.subject}
          </Badge>
          <Badge
            variant={availabilityVariants[course.availability] || 'neutral'}
            size="sm"
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shadow-2xs"
            dot
          >
            {course.availability}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
          <span className="font-semibold bg-slate-900/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
            {course.grade}
          </span>
          <span className="flex items-center gap-1 font-medium bg-slate-900/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            {course.learningFormat}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.subtitle}
          </p>

          {/* Teacher metadata */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={course.teacher.avatarUrl}
                alt={course.teacher.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{course.teacher.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[170px]">{course.teacher.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{course.teacher.rating}</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{course.schedule}</span>
          </div>
        </div>

        {/* Batch Info and Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Tuition Batch</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(course)}
            className="text-xs px-3.5 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};
