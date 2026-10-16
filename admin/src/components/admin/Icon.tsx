import type { ReactNode } from "react";

type IconName =
  | "grid"
  | "chart"
  | "dashboard"
  | "analytics"
  | "users"
  | "student"
  | "teacher"
  | "book"
  | "graduation"
  | "courses"
  | "calendar"
  | "enrollments"
  | "communication"
  | "ai"
  | "settings"
  | "plus"
  | "chevron"
  | "pin"
  | "shield"
  | "arrow"
  | "check"
  | "alert"
  | "mail"
  | "close"
  | "sparkles";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="m7 15 3-4 3 2 5-7" />
        <path d="M18 6h2v2" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    analytics: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="M7 15.5 10.5 12l3 2 4.5-6" />
        <circle cx="7" cy="15.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="13.5" cy="14" r="1" fill="currentColor" stroke="none" />
        <circle cx="18" cy="8" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
        <circle cx="9.5" cy="7" r="4" />
        <path d="M17 11a4 4 0 0 0 0-8M21 20v-1.5a4 4 0 0 0-3-3.87" />
      </>
    ),
    student: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 20v-1.2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5V20" />
        <path d="m3 8 9-4 9 4-9 4-9-4Z" />
      </>
    ),
    teacher: (
      <>
        <path d="M4 20h16" />
        <path d="M6 20V8l6-4 6 4v12" />
        <path d="M9 20v-5h6v5M9 10h.01M12 10h.01M15 10h.01" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16M8 7h8M8 11h8" />
      </>
    ),
    graduation: (
      <>
        <path d="m3 9 9-5 9 5-9 5-9-5Z" />
        <path d="M7 11.2V16c2.8 2.4 7.2 2.4 10 0v-4.8M21 10v5" />
      </>
    ),
    courses: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
        <path d="m16 16 1.5 1.5L21 14" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    enrollments: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 11h4M8 15h3" />
        <path d="m15 15 1.5 1.5L20 13" />
      </>
    ),
    communication: (
      <>
        <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2.3V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z" />
        <path d="M7 9h.01M11 9h.01M15 9h.01" />
      </>
    ),
    ai: (
      <>
        <path d="m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3Z" />
        <path d="m19 14 .6 2.4L22 17l-2.4.6L19 20l-.6-2.4L16 17l2.4-.6L19 14ZM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path
          d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4L7.5 15a8 8 0 0 1 0-1.9L6.1 12l1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 1.9Z"
          transform="translate(-1 -1) scale(1.08)"
        />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    arrow: (
      <>
        <path d="M7 17 17 7M7 7h10v10" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    alert: (
      <>
        <path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4m0 4h.01" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12M6 6l12 12" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3-1.2 4.3L7 8.5l3.8 1.2L12 14l1.2-4.3L17 8.5l-3.8-1.2L12 3Z" />
        <path d="m19 13-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7L19 13Z" />
        <path d="m5 14-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7L5 14Z" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
}
