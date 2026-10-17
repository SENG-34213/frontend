import React from 'react';
import { AccountStatus } from '../types';

export type DomainStatus =
  | AccountStatus
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PUBLISHED'
  | 'DRAFT'
  | 'READY'
  | 'CLOSED'
  | 'ARCHIVED'
  | 'UPCOMING'
  | 'DROPPED'
  | 'PENDING_APPROVAL'
  | 'PROCESSING'
  | 'RESTRICTED'
  | 'RESULTS_PUBLISHED'
  | string;

interface StatusBadgeProps {
  status: DomainStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'PUBLISHED':
      case 'READY':
      case 'RESULTS_PUBLISHED':
        return {
          label:
            status === 'ACTIVE'
              ? 'Active'
              : status === 'COMPLETED'
              ? 'Completed'
              : status === 'PUBLISHED'
              ? 'Published'
              : status === 'RESULTS_PUBLISHED'
              ? 'Results Published'
              : 'Ready',
          text: 'text-emerald-700 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800',
        };
      case 'INVITED':
      case 'SCHEDULED':
      case 'PENDING_APPROVAL':
      case 'UPCOMING':
      case 'PROCESSING':
        return {
          label:
            status === 'INVITED'
              ? 'Invited'
              : status === 'PENDING_APPROVAL'
              ? 'Pending Approval'
              : status === 'UPCOMING'
              ? 'Upcoming'
              : status === 'PROCESSING'
              ? 'Processing'
              : 'Scheduled',
          text: 'text-amber-700 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          text: 'text-blue-700 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-200 dark:border-blue-800',
        };
      case 'SUSPENDED':
      case 'INACTIVE':
      case 'DROPPED':
      case 'RESTRICTED':
      case 'CLOSED':
        return {
          label:
            status === 'SUSPENDED'
              ? 'Suspended'
              : status === 'DROPPED'
              ? 'Dropped'
              : status === 'RESTRICTED'
              ? 'Restricted'
              : status === 'CLOSED'
              ? 'Closed'
              : 'Inactive',
          text: 'text-rose-700 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800',
        };
      case 'ARCHIVED':
      case 'DRAFT':
      default:
        return {
          label: status === 'ARCHIVED' ? 'Archived' : 'Draft',
          text: 'text-slate-600 dark:text-slate-400',
          bg: 'bg-slate-100 dark:bg-slate-800',
          border: 'border-slate-200 dark:border-slate-700',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
};
