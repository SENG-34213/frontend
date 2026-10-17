import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { EnrollmentRequest } from '../types';
import { mockEnrollmentRequests } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';

export const EnrollmentManagementView: React.FC = () => {
  const [requests, setRequests] = useState<EnrollmentRequest[]>(mockEnrollmentRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
    const target = requests.find((r) => r.id === id);
    setFeedbackMsg(`${newStatus} enrollment for ${target?.studentName || 'student'}`);
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Course Enrollments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review student registration requests, track capacity limits, and grant course access.
          </p>
        </div>

        {feedbackMsg && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Pending Requests</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1 tabular-nums">
            {pendingCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires instructor authorization</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Approved This Term</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">
            {approvedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Keycloak authorization granted</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Capacity Utilization</span>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1 tabular-nums">
            89.4%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">142 of 155 maximum seats filled</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, ID, or course code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3">Applicant</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Target Course</th>
              <th className="px-4 py-3">Requested Term</th>
              <th className="px-4 py-3">Applied Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-5 py-3 text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                  No enrollment applications found.
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-slate-900">{req.studentName}</p>
                      <p className="text-[11px] text-slate-400">{req.studentEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{req.studentId}</td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-mono font-bold text-indigo-700">{req.courseCode}</span>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{req.courseTitle}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-mono">{req.academicTerm}</td>
                  <td className="px-4 py-3.5 text-slate-500">{req.appliedDate}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAction(req.id, 'Approved')}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'Rejected')}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Decision Finalized</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
