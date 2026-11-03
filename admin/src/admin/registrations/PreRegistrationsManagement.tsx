import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ClipboardList, Eye, EyeOff, X } from "lucide-react";
import { EmptyState } from "../../../../shared/ui/EmptyState";
import { PageHeader } from "../components/PageHeader";
import {
  fetchPreRegistrations,
  PreRegistration,
  PreRegistrationSeenFilter,
  PreRegistrationStatus,
  updatePreRegistration,
} from "../api/preRegistrationsApi";

const STATUS_LABELS: Record<PreRegistrationStatus, string> = {
  NEW: "New",
  IN_REVIEW: "In review",
  COMPLETED: "Completed",
};

const STATUS_STYLES: Record<PreRegistrationStatus, string> = {
  NEW: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  IN_REVIEW: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

function displayGrade(grade: string) {
  return grade === "al" ? "Advanced Level" : `Grade ${grade}`;
}

function displayClassFormat(classFormat: PreRegistration["classFormat"]) {
  if (classFormat === "online") return "Online";
  if (classFormat === "onsite") return "Onsite";
  return "Flexible";
}

function displayContactMethod(method: PreRegistration["contactMethod"]) {
  return method === "whatsapp" ? "WhatsApp" : method === "phone" ? "Phone" : "Email";
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}

export function PreRegistrationsManagement() {
  const [records, setRecords] = useState<PreRegistration[]>([]);
  const [selected, setSelected] = useState<PreRegistration | null>(null);
  const [statusFilter, setStatusFilter] = useState<PreRegistrationStatus | "ALL">("ALL");
  const [seenFilter, setSeenFilter] = useState<PreRegistrationSeenFilter>("ALL");
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusDraft, setStatusDraft] = useState<PreRegistrationStatus>("NEW");
  const [remarkDraft, setRemarkDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const loadRecords = async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      try {
        const result = await fetchPreRegistrations({
          status: statusFilter,
          seen: seenFilter,
          page,
          size: 20,
        });
        if (!active) return;
        setRecords(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setError("");
      } catch (loadError: unknown) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load pre-registrations.",
          );
        }
      } finally {
        if (active && showLoading) setIsLoading(false);
      }
    };

    void loadRecords(true);
    const refreshInterval = window.setInterval(() => void loadRecords(), 10_000);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, [page, refreshKey, seenFilter, statusFilter]);

  function openDetails(record: PreRegistration) {
    setSelected(record);
    setStatusDraft(record.status);
    setRemarkDraft(record.adminRemark || "");
    setNotice("");
    if (!record.seen) {
      void updatePreRegistration(record.id, { seen: true })
        .then((updated) => {
          setSelected((current) => (current?.id === updated.id ? updated : current));
          setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)));
          setRefreshKey((current) => current + 1);
        })
        .catch((updateError: unknown) => {
          setError(
            updateError instanceof Error ? updateError.message : "Unable to mark this as seen.",
          );
        });
    }
  }

  async function saveDetails() {
    if (!selected) return;
    setIsSaving(true);
    setError("");
    try {
      const updated = await updatePreRegistration(selected.id, {
        status: statusDraft,
        seen: true,
        adminRemark: remarkDraft,
      });
      setSelected(updated);
      setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setRefreshKey((current) => current + 1);
      setNotice("Pre-registration updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this update.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleSeen() {
    if (!selected) return;
    setError("");
    try {
      const updated = await updatePreRegistration(selected.id, { seen: !selected.seen });
      setSelected(updated);
      setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setRefreshKey((current) => current + 1);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update seen state.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pre-Registrations"
        description="Review student and parent enquiries submitted through the institute website."
        breadcrumbs={[{ label: "Admin" }, { label: "Overview" }, { label: "Pre-Registrations" }]}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-500 dark:text-slate-400">
          {totalElements} {totalElements === 1 ? "submission" : "submissions"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="pre-registration-status-filter">
            Filter by workflow status
          </label>
          <select
            id="pre-registration-status-filter"
            value={statusFilter}
            onChange={(event) => {
              setIsLoading(true);
              setError("");
              setPage(0);
              setStatusFilter(event.target.value as PreRegistrationStatus | "ALL");
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="ALL">All statuses</option>
            <option value="NEW">New</option>
            <option value="IN_REVIEW">In review</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <label className="sr-only" htmlFor="pre-registration-seen-filter">
            Filter by seen status
          </label>
          <select
            id="pre-registration-seen-filter"
            value={seenFilter}
            onChange={(event) => {
              setIsLoading(true);
              setError("");
              setPage(0);
              setSeenFilter(event.target.value as PreRegistrationSeenFilter);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="ALL">Seen and unseen</option>
            <option value="UNSEEN">Unseen</option>
            <option value="SEEN">Seen</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
        >
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Loading pre-registrations...
          </div>
        ) : records.length === 0 ? (
          <div className="p-10">
            <EmptyState
              compact
              icon={ClipboardList}
              title="No pre-registrations found"
              description="New website submissions will appear here."
              className="border-0"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Academic preferences</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Workflow</th>
                  <th className="px-4 py-3 font-semibold">Seen</th>
                  <th className="px-4 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{record.name}</p>
                      <p className="mt-1 text-slate-500 dark:text-slate-400">
                        {record.role === "parent" ? "Parent / guardian" : "Student"} · {record.city}
                        , {record.district}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <p>{record.email}</p>
                      <p className="mt-1 text-slate-500 dark:text-slate-400">{record.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <p>
                        {displayGrade(record.grade)} · {displayClassFormat(record.classFormat)}
                      </p>
                      <p className="mt-1 max-w-xs truncate text-slate-500 dark:text-slate-400">
                        {record.subjects.join(", ")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {formatSubmittedAt(record.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_STYLES[record.status]}`}
                      >
                        {STATUS_LABELS[record.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 ${record.seen ? "text-slate-500 dark:text-slate-400" : "font-semibold text-indigo-700 dark:text-indigo-300"}`}
                      >
                        {record.seen ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        {record.seen ? "Seen" : "Unseen"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDetails(record)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                      >
                        <Eye className="h-3.5 w-3.5" /> View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 0 || isLoading}
              onClick={() => {
                setIsLoading(true);
                setPage((current) => current - 1);
              }}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={page + 1 >= totalPages || isLoading}
              onClick={() => {
                setIsLoading(true);
                setPage((current) => current + 1);
              }}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pre-registration-detail-title"
            className="max-h-[min(90vh,760px)] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div>
                <h2
                  id="pre-registration-detail-title"
                  className="text-base font-semibold text-slate-900 dark:text-white"
                >
                  {selected.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Submitted {formatSubmittedAt(selected.createdAt)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-x-8 gap-y-4 px-5 py-5 text-xs sm:grid-cols-2 sm:px-6">
              {[
                ["Registering as", selected.role === "parent" ? "Parent / guardian" : "Student"],
                ["Email", selected.email],
                ["Phone", selected.phone],
                ["Location", `${selected.city}, ${selected.district}`],
                ["Grade", displayGrade(selected.grade)],
                ["Preferred format", displayClassFormat(selected.classFormat)],
                ["Subjects", selected.subjects.join(", ")],
                ["Contact preference", displayContactMethod(selected.contactMethod)],
                ["Consent", selected.consent ? "Confirmed" : "Not confirmed"],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <p className="font-medium text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-1 wrap-break-word text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4 border-t border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Workflow status
                  <select
                    value={statusDraft}
                    onChange={(event) =>
                      setStatusDraft(event.target.value as PreRegistrationStatus)
                    }
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => void toggleSeen()}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {selected.seen ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    Mark as {selected.seen ? "unseen" : "seen"}
                  </button>
                </div>
              </div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Admin remark <span className="font-normal text-slate-400">(optional)</span>
                <textarea
                  value={remarkDraft}
                  onChange={(event) => setRemarkDraft(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Add an internal follow-up note..."
                  className="mt-1.5 block w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              {notice && (
                <p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">
                  {notice}
                </p>
              )}
              {error && (
                <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void saveDetails()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save updates"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
