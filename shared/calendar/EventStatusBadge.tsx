import React from "react";

export type EventStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

const statusContent: Record<
  EventStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 9h13" />
        <path d="M16 16h3v-3" />
      </>
    ),
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  COMPLETED: {
    label: "Completed",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300",
  },
};

export function EventStatusBadge({
  status,
  compact = false,
}: {
  status: EventStatus | string;
  compact?: boolean;
}) {
  const normalized = status.toUpperCase() as EventStatus;
  const content = statusContent[normalized] ?? statusContent.SCHEDULED;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border font-semibold ${content.className} ${compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]"}`}
      aria-label={`Event ${content.label.toLowerCase()}`}
    >
      <svg
        className={compact ? "h-3 w-3" : "h-3.5 w-3.5"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {content.icon}
      </svg>
      {content.label}
    </span>
  );
}
