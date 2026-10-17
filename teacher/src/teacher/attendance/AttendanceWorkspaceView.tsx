import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Save,
  Check,
  Users,
  Sparkles,
} from 'lucide-react';
import { AttendanceSession, AttendanceRecord, NavigationTab } from '../types';
import { mockAttendanceSessions } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';

export const AttendanceWorkspaceView: React.FC = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>(mockAttendanceSessions);
  const [selectedSessionId, setSelectedSessionId] = useState(mockAttendanceSessions[0]?.id);
  const [saveToast, setSaveToast] = useState(false);

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const handleUpdateRecordStatus = (
    recordId: string,
    newStatus: AttendanceRecord['status']
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        const updatedRecords = s.records.map((r) =>
          r.id === recordId ? { ...r, status: newStatus } : r
        );
        const presentCount = updatedRecords.filter((r) => r.status === 'Present').length;
        const lateCount = updatedRecords.filter((r) => r.status === 'Late').length;
        const absentCount = updatedRecords.filter((r) => r.status === 'Absent').length;
        const excusedCount = updatedRecords.filter((r) => r.status === 'Excused').length;

        return {
          ...s,
          records: updatedRecords,
          presentCount,
          lateCount,
          absentCount,
          excusedCount,
        };
      })
    );
  };

  const handleMarkAllPresent = () => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        const updatedRecords = s.records.map((r) => ({
          ...r,
          status: 'Present' as const,
        }));
        return {
          ...s,
          records: updatedRecords,
          presentCount: updatedRecords.length,
          lateCount: 0,
          absentCount: 0,
          excusedCount: 0,
        };
      })
    );
  };

  const handleSaveSession = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Conduct roll call, record excused absences, and monitor university compliance requirements.
          </p>
        </div>

        {saveToast && (
          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Attendance records synchronized to SIS database!</span>
          </div>
        )}
      </div>

      {/* Session Selection / Today Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {activeSession.courseCode}
              </span>
              <StatusBadge status={activeSession.status} />
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">Room: {activeSession.room}</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {activeSession.sessionTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {activeSession.date} · {activeSession.startTime} - {activeSession.endTime}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={handleSaveSession}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Finalize</span>
            </button>
          </div>
        </div>

        {/* Live Attendance Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-800">Present</span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {activeSession.presentCount}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-800">Late</span>
            <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
              {activeSession.lateCount}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 text-center">
            <span className="text-[10px] uppercase font-bold text-rose-800">Absent</span>
            <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
              {activeSession.absentCount}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-600">Total Enrolled</span>
            <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">
              {activeSession.totalEnrolled}
            </div>
          </div>
        </div>
      </div>

      {/* Student Roll Call Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Class Roster Attendance Checklist
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {Math.round(((activeSession.presentCount + activeSession.lateCount) / activeSession.totalEnrolled) * 100)}% attendance today
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3">Student Name</th>
              <th className="px-4 py-3">Arrival Timestamp</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-5 py-3 text-right">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeSession.records.map((rec) => {
              return (
                <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900">{rec.studentName}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono">
                    {rec.timestamp || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {rec.notes || <span className="text-slate-300 italic">No notes</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex p-1 bg-slate-100 rounded-lg gap-1">
                      {(['Present', 'Late', 'Absent', 'Excused'] as const).map((mode) => {
                        const isCurrent = rec.status === mode;
                        let activeStyle = 'bg-white text-slate-900 shadow-2xs';
                        if (isCurrent && mode === 'Present') activeStyle = 'bg-emerald-600 text-white shadow-xs font-semibold';
                        if (isCurrent && mode === 'Late') activeStyle = 'bg-amber-600 text-white shadow-xs font-semibold';
                        if (isCurrent && mode === 'Absent') activeStyle = 'bg-rose-600 text-white shadow-xs font-semibold';
                        if (isCurrent && mode === 'Excused') activeStyle = 'bg-slate-700 text-white shadow-xs font-semibold';

                        return (
                          <button
                            key={mode}
                            onClick={() => handleUpdateRecordStatus(rec.id, mode)}
                            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                              isCurrent ? activeStyle : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {mode}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
