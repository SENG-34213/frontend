import type React from "react";

type EmptyStateIcon = React.ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
}>;

const DefaultEmptyIcon: EmptyStateIcon = ({ className, "aria-hidden": ariaHidden }) => (
  <svg
    className={className}
    aria-hidden={ariaHidden}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h5l1.5 2h6.5A1.5 1.5 0 0 1 20 7.5v10A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-12Z" />
    <path d="M4 9h16" />
  </svg>
);

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: EmptyStateIcon;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = DefaultEmptyIcon,
  compact = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 text-center dark:border-slate-800 dark:bg-slate-900 ${compact ? "py-8" : "py-12"} ${className}`}
    >
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon className="h-5 w-5" aria-hidden={true} />
      </span>
      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
