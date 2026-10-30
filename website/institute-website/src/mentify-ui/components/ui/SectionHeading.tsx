import React from 'react';
import { Badge } from './Badge';

export interface SectionHeadingProps {
  badge?: string;
  badgeVariant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'success';
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  badgeVariant = 'primary',
  title,
  subtitle,
  align = 'center',
  className = '',
}) => {
  const alignClass = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col max-w-3xl ${alignClass} ${className}`}>
      {badge && (
        <div className="mb-3">
          <Badge variant={badgeVariant} dot size="md">
            {badge}
          </Badge>
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3.5 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};
