import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  const variantStyles = {
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700',
    primary: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60',
    secondary: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60',
    accent: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60',
    error: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60',
  };

  const dotColors = {
    neutral: 'bg-slate-500',
    primary: 'bg-indigo-600',
    secondary: 'bg-blue-600',
    accent: 'bg-cyan-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {children}
    </span>
  );
};
