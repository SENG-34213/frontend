import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  ClipboardList,
  UserCheck,
  GraduationCap,
  MessageSquare,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { NotificationItem, NavigationTab } from '../types';
import { mockNotifications } from '../data/mockData';

interface NotificationCenterViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const filtered = notifications.filter((n) => {
    if (filter === 'Unread') return !n.read;
    return true;
  });

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkOne = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time activity logs for student assignment submissions, enrollment requests, and messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(['All', 'Unread'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === tab
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleMarkAllAsRead}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No notifications to display</p>
            <p className="mt-0.5">You are completely up to date.</p>
          </div>
        ) : (
          filtered.map((item) => {
            let Icon = Bell;
            let iconColor = 'text-indigo-600 bg-indigo-50 border-indigo-100';

            if (item.category === 'submission') {
              Icon = ClipboardList;
              iconColor = 'text-indigo-600 bg-indigo-50 border-indigo-100';
            } else if (item.category === 'enrollment') {
              Icon = UserCheck;
              iconColor = 'text-amber-600 bg-amber-50 border-amber-100';
            } else if (item.category === 'exam') {
              Icon = GraduationCap;
              iconColor = 'text-rose-600 bg-rose-50 border-rose-100';
            } else if (item.category === 'message') {
              Icon = MessageSquare;
              iconColor = 'text-violet-600 bg-violet-50 border-violet-100';
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  handleMarkOne(item.id);
                  if (item.actionUrl) onNavigate(item.actionUrl);
                }}
                className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  !item.read ? 'bg-indigo-50/20 hover:bg-indigo-50/40' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xs sm:text-sm font-bold truncate ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.title}
                      </h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                {item.actionUrl && (
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 self-center">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
