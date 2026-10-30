import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse bg-slate-200/80 dark:bg-slate-800 rounded-xl ${className}`} />;
};

export const LoadingState: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading...',
  className = 'py-16',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-100 dark:border-indigo-800/60">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-5">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  title = 'Something went wrong',
  message = 'We were unable to load the data. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/60">
      <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-950 dark:text-rose-200">{title}</h3>
      <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-4 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/40"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export const Accordion: React.FC<{
  items: { title: string; content: React.ReactNode }[];
  allowMultiple?: boolean;
}> = ({ items, allowMultiple = false }) => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggle = (idx: number) => {
    if (allowMultiple) {
      setOpenIndices((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
    } else {
      setOpenIndices((prev) => (prev.includes(idx) ? [] : [idx]));
    }
  };

  return (
    <div className="divide-y divide-slate-200/80 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
      {items.map((item, index) => {
        const isOpen = openIndices.includes(index);
        return (
          <div key={index} className="transition-colors">
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between text-left p-5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer select-none"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-base pr-4">{item.title}</span>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100/50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/40 animate-in fade-in duration-150">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Tabs: React.FC<{
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const Breadcrumb: React.FC<{
  items: { label: string; onClick?: () => void; active?: boolean }[];
}> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 flex-wrap gap-1.5" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}
          {item.active || !item.onClick ? (
            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{item.label}</span>
          ) : (
            <button
              onClick={item.onClick}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium cursor-pointer"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
