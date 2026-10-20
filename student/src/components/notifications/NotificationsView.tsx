import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  CheckCheck,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { NotificationItem } from "../../types";

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCurrentView,
    setSelectedAssignmentId,
  } = useStudent();

  const [filterType, setFilterType] = useState<string>("ALL");

  const filtered = notifications.filter((n) => {
    if (filterType === "ALL") return true;
    if (filterType === "UNREAD") return !n.read;
    return n.type === filterType;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "DEADLINE":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "GRADE":
        return <Award className="h-5 w-5 text-emerald-500" />;
      case "EXAM":
        return <Clock className="h-5 w-5 text-rose-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-indigo-500" />;
    }
  };

  const handleAction = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.actionView) {
      if (item.targetId && item.actionView === "assignments") {
        setSelectedAssignmentId(item.targetId);
        setCurrentView("assignment-details");
      } else {
        setCurrentView(item.actionView);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time updates regarding assignment due dates, published grades, and administrative
            notices
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-2xs"
        >
          <CheckCheck className="h-4 w-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        {["ALL", "UNREAD", "DEADLINE", "GRADE", "ANNOUNCEMENT", "EXAM"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`rounded-lg px-3 py-1.5 whitespace-nowrap font-medium transition-colors ${
              filterType === f
                ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
            }`}
          >
            {f === "ALL" ? "All Alerts" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Bell className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 font-display text-sm font-bold text-slate-900 dark:text-white">
              No notifications
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              You're completely up to date with your academic alerts.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAction(item)}
              className={`flex items-start justify-between gap-4 rounded-xl border p-4.5 cursor-pointer transition-all ${
                item.read
                  ? "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  : "border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/40"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="text-[11px] text-slate-400 block pt-1">{item.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs">
                  <span>Open</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
