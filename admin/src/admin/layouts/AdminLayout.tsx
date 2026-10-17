import React, { useState, useEffect } from 'react';
import { AdminSidebar, AdminRoute } from '../components/AdminSidebar';
import { AdminNavbar } from '../components/AdminNavbar';
import { ToastContainer, ToastMessage } from '../components/ToastContainer';
import {
  AdminRole,
  StudentProfile,
  TeacherProfile,
  AdministratorProfile,
  Course,
  EnrollmentRecord,
  CurriculumModule,
  Assignment,
  Quiz,
  Examination,
  GradeRecord,
  AttendanceSession,
  LearningMaterial,
  AcademicEvent,
  NotificationItem,
  AuditEvent,
  PlatformKPIs,
} from '../types';
import { Search, X, ArrowRight, UserPlus, BookOpen, GraduationCap, Briefcase, Calendar } from 'lucide-react';

interface AdminLayoutProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  role: AdminRole;
  onRoleChange: (newRole: AdminRole) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
  onQuickAction: (action: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  onNavigate,
  role,
  onRoleChange,
  isDarkMode,
  onToggleTheme,
  notifications,
  onMarkNotificationRead,
  toasts,
  onDismissToast,
  onQuickAction,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut listener for cmd+k
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((p) => !p);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const searchIndex: { id: AdminRoute; title: string; category: string }[] = [
    { id: 'dashboard', title: 'Platform Overview Dashboard', category: 'Overview' },
    { id: 'analytics', title: 'Analytics & Trend Charts', category: 'Overview' },
    { id: 'notifications', title: 'System Notifications & Webhooks', category: 'Overview' },
    { id: 'users', title: 'All Users Management Directory', category: 'User Management' },
    { id: 'students', title: 'Student Management & Registration Wizard', category: 'User Management' },
    { id: 'teachers', title: 'Teacher Directory & Credentials', category: 'User Management' },
    { id: 'administrators', title: 'Administrator Oversight (SUPER_ADMIN)', category: 'User Management' },
    { id: 'registrations', title: 'Pending Invitations Operations', category: 'User Management' },
    { id: 'courses', title: 'Course Management & Curriculum', category: 'Academic Management' },
    { id: 'enrollments', title: 'Student Course Enrollments', category: 'Academic Management' },
    { id: 'academic', title: 'Modules & Lessons Syllabus', category: 'Academic Management' },
    { id: 'assignments', title: 'Assignment Oversight & Submissions', category: 'Academic Management' },
    { id: 'quizzes', title: 'Quiz Performance & Analytics', category: 'Academic Management' },
    { id: 'examinations', title: 'Examination Timetable & Halls', category: 'Academic Management' },
    { id: 'grades', title: 'Academic Gradebook & Marks', category: 'Academic Management' },
    { id: 'attendance', title: 'Attendance Management & Sessions', category: 'Academic Management' },
    { id: 'materials', title: 'Learning Materials (AWS S3)', category: 'Platform Operations' },
    { id: 'calendar', title: 'Operations Calendar', category: 'Platform Operations' },
    { id: 'communication', title: 'Broadcast Communication', category: 'Platform Operations' },
    { id: 'ai-assistant', title: 'Mentify AI Admin Assistant', category: 'Platform Operations' },
    { id: 'reports', title: 'Institutional Reports & Exports', category: 'Platform Operations' },
    { id: 'audit', title: 'System Audit Logs & Security Stream', category: 'Administration' },
    { id: 'settings', title: 'Platform & Keycloak Settings', category: 'Administration' },
    { id: 'profile', title: 'Alex Mercer Profile', category: 'Administration' },
  ];

  const searchResults = searchIndex.filter((item) => {
    if (item.id === 'administrators' && role !== 'SUPER_ADMIN') return false;
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AdminSidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        role={role}
        pendingInvitationsCount={12}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navbar */}
        <AdminNavbar
          currentRoute={currentRoute}
          role={role}
          onRoleChange={onRoleChange}
          onNavigate={onNavigate}
          notifications={notifications}
          onMarkNotificationRead={onMarkNotificationRead}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onQuickAction={onQuickAction}
          onOpenSearch={() => setIsSearchOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />

      {/* Global Quick Search Modal (Command Palette) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to page, tool, or registration..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching workspace destinations found.
                </div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
