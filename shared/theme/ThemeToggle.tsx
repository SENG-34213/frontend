type ThemeToggleProps = {
  isDarkMode: boolean;
  onToggle: () => void;
};

function SunIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-amber-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

export function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
  const nextThemeLabel = isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode";

  return (
    <button
      type="button"
      onClick={onToggle}
      title={nextThemeLabel}
      aria-label={nextThemeLabel}
      aria-pressed={isDarkMode}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      {isDarkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
