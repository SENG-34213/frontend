import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Users,
  Megaphone,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { UserAvatar } from '../components/UserAvatar';

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: string;
  author: string;
  date: string;
  views: number;
}

export const CommunicationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'announcements' | 'channels'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'ann-1',
      title: 'Midterm Examination Schedule Published (Fall 2026)',
      content:
        'All examination timetables, room assignments, and student proctoring protocols for Grades 10-12 are now synchronized in the platform.',
      audience: 'All Students & Faculty',
      author: 'Alex Mercer (Platform Operations)',
      date: 'Oct 16, 2026 · 09:30 AM',
      views: 1240,
    },
    {
      id: 'ann-2',
      title: 'Scheduled LMS System Maintenance Window',
      content:
        'Keycloak SSO authentication realm will perform routine certificate rotation on Sunday at 02:00 AM UTC. No coursework disruption expected.',
      audience: 'All Users',
      author: 'Alex Mercer (Platform Operations)',
      date: 'Oct 14, 2026 · 04:15 PM',
      views: 890,
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAudience, setNewAudience] = useState('All Students & Faculty');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle,
      content: newContent,
      audience: newAudience,
      author: 'Alex Mercer (Administrator)',
      date: 'Just now',
      views: 1,
    };

    setAnnouncements([created, ...announcements]);
    setNewTitle('');
    setNewContent('');
    setIsComposerOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication & Announcements"
        description="Broadcast institutional announcements, manage course discussion channels, and oversee school communications."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Platform Operations' }, { label: 'Communication' }]}
        actions={
          <button
            onClick={() => setIsComposerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Announcement</span>
          </button>
        }
      />

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-1">
                  Target: {ann.audience}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ann.title}</h3>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">{ann.date}</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {ann.content}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Dispatched by {ann.author}</span>
              <span className="tabular-nums">{ann.views} confirmed read receipts</span>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Broadcast Institutional Announcement
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatches platform notification and banner alert to student & faculty dashboards.
            </p>

            <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Campus Library Extended Hours for Finals Week"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Target Audience
                </label>
                <select
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="All Students & Faculty">All Students & Faculty</option>
                  <option value="Grade 12 Cohort">Grade 12 Cohort</option>
                  <option value="Grade 11 Cohort">Grade 11 Cohort</option>
                  <option value="Teaching Faculty Only">Teaching Faculty Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Announcement Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Compose notice body..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
