import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'subtle' | 'dot' | 'clean';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'subtle',
  size = 'sm',
}) => {
  const normalized = status.toLowerCase();

  let colorClasses = 'text-slate-600 bg-slate-100 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (
    normalized.includes('active') ||
    normalized.includes('published') ||
    normalized.includes('approved') ||
    normalized.includes('present') ||
    normalized.includes('excelling') ||
    normalized.includes('completed')
  ) {
    colorClasses = 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60';
    dotColor = 'bg-emerald-500';
  } else if (
    normalized.includes('pending') ||
    normalized.includes('grading') ||
    normalized.includes('draft') ||
    normalized.includes('late') ||
    normalized.includes('scheduled')
  ) {
    colorClasses = 'text-amber-700 bg-amber-50/80 border-amber-200/60';
    dotColor = 'bg-amber-500';
  } else if (
    normalized.includes('risk') ||
    normalized.includes('absent') ||
    normalized.includes('rejected') ||
    normalized.includes('closed') ||
    normalized.includes('archived')
  ) {
    colorClasses = 'text-rose-700 bg-rose-50/80 border-rose-200/60';
    dotColor = 'bg-rose-500';
  } else if (
    normalized.includes('submitted') ||
    normalized.includes('lecture') ||
    normalized.includes('lab')
  ) {
    colorClasses = 'text-indigo-700 bg-indigo-50/80 border-indigo-200/60';
    dotColor = 'bg-indigo-500';
  }

  if (variant === 'clean') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span>{status}</span>
      </span>
    );
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${sizeClasses} ${colorClasses} whitespace-nowrap shrink-0`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};
