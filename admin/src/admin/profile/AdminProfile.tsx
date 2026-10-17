import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, CheckCircle2, Key, Calendar } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { RoleBadge } from '../components/RoleBadge';
import { StatusBadge } from '../components/StatusBadge';
import { UserAvatar } from '../components/UserAvatar';
import { AdminRole } from '../types';

interface AdminProfileProps {
  role: AdminRole;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ role }) => {
  const [phone, setPhone] = useState('+1 (555) 998-1049');
  const [address, setAddress] = useState('100 Silicon Park Plaza, Cupertino, CA 95014');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Profile"
        description="Personal credentials, contact preferences, institutional role tier, and security attributes."
        breadcrumbs={[{ label: 'Admin' }, { label: 'My Profile' }]}
      />

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile contact preferences successfully saved in PostgreSQL identity store.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
          <UserAvatar name="Alex Mercer" size="xl" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Alex Mercer</h3>
            <p className="text-xs text-slate-400 mt-0.5">alex.mercer@mentify.edu</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <RoleBadge role={role} />
              <StatusBadge status="ACTIVE" />
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Admin Code:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">ADM-1049</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Operations</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Keycloak Realm:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">mentify-prod</span>
            </div>
          </div>
        </div>

        {/* Right Details & Edit Form */}
        <div className="md:col-span-2 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Administrative Profile & Contact Information
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  disabled
                  value="Alex Mercer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Institutional Email (SSO Linked)
                </label>
                <input
                  type="email"
                  disabled
                  value="alex.mercer@mentify.edu"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Emergency Phone Contact
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  National Identity Identifier (NIC)
                </label>
                <input
                  type="text"
                  disabled
                  value="861960312V"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Campus Office / Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Save Contact Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
