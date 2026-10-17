import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  Shield,
  Clock,
  Eye,
  Key,
  Database,
  Code2,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DetailDrawer } from '../components/DetailDrawer';
import { AuditEvent } from '../types';

interface AuditAndActivityProps {
  logs: AuditEvent[];
}

export const AuditAndActivity: React.FC<AuditAndActivityProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'KEYCLOAK_AUTH':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'MATERIAL_SERVICE':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'AI_SERVICE':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'USER_REGISTRATION':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs & Activity"
        description="Immutable compliance event stream across Keycloak Auth, AWS S3 Material Service, and AI inference executions."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Administration' }, { label: 'Audit & Activity' }]}
      />

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, actor email, or IP address..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="ALL">All Event Services</option>
          <option value="USER_REGISTRATION">User Registration Service</option>
          <option value="KEYCLOAK_AUTH">Keycloak Auth Realm</option>
          <option value="MATERIAL_SERVICE">AWS S3 Material Service</option>
          <option value="AI_SERVICE">Mentify AI Service</option>
          <option value="COURSE_MANAGEMENT">Course Service</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Timestamp (UTC)</th>
                <th className="py-3 px-4 font-semibold">Service Origin</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">IP Origin</th>
                <th className="py-3 px-4 font-semibold text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 tabular-nums">
                    {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getCategoryBadge(
                        log.category
                      )}`}
                    >
                      {log.category.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {log.action}
                    </span>
                    <span className="text-slate-500 text-[11px] truncate max-w-sm block">
                      {log.details}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 dark:text-slate-200 block">
                      {log.actorEmail}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {log.actorRole}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 tabular-nums">
                    {log.ipAddress}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {log.payloadJson && (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2 py-1 text-xs font-medium rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      >
                        Inspect JSON
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON PAYLOAD INSPECTOR DRAWER */}
      {selectedLog && (
        <DetailDrawer
          isOpen={!!selectedLog}
          title={selectedLog.action}
          subtitle={`${selectedLog.category} · Audit ID: ${selectedLog.id}`}
          onClose={() => setSelectedLog(null)}
          width="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Human-Readable Event:</span>
              <p className="font-medium text-slate-900 dark:text-white">{selectedLog.details}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                Raw JSON Request Payload:
              </span>
              <pre className="p-4 rounded-xl bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                {selectedLog.payloadJson}
              </pre>
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};
