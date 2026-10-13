export function TeacherNavIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    courses: 'M4 4h7v16H4z M13 4h7v16h-7z',
    students: 'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-3a6 6 0 0 1 12 0v3 M17 4a4 4 0 0 1 0 8 M18 15a5 5 0 0 1 4 5',
    calendar: 'M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4',
    notifications: 'M5 17h14l-2-4V9a5 5 0 0 0-10 0v4z M10 21h4',
    messages: 'M3 4h18v13H8l-5 4z M7 9h10 M7 13h6',
    assistant: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
    attendance: 'M4 3h16v18H4z m4 9 3 3 6-7',
    materials: 'M3 6h7l2 3h9v12H3z',
    assignments: 'M5 3h14v18H5z M9 8h6 M9 12h6 M9 16h4',
    quizzes: 'M5 3h14v18H5z M9 8h6 M10 12a2 2 0 1 1 3 2l-1 1 M12 18h.01',
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.courses}/></svg>;
}
