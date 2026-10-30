import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-7',
    lg: 'p-8 sm:p-10',
  };

  const hoverStyle = hoverEffect
    ? 'hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300'
    : 'transition-all duration-200';

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-none ${paddingStyles[padding]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
