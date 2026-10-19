import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  X,
  RefreshCw,
  Layers,
  Calendar,
  User,
  DollarSign,
  Info,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { DetailDrawer } from "../components/DetailDrawer";
import { Grade, CreateGradeRequest, UpdateGradeRequest } from "../types";

interface GradeManagementProps {
  grades: Grade[];
  onCreateGrade: (req: CreateGradeRequest) => Promise<Grade>;
  onUpdateGrade: (gradeId: string, req: UpdateGradeRequest) => Promise<void>;
  onDeleteGrade: (gradeId: string) => Promise<{ success: boolean; error?: string }>;
  onProceedToCourseCreation?: (gradeId?: string) => void;
}

const COMMON_CURRENCIES = [
  { code: "LKR", label: "LKR - Sri Lankan Rupee", symbol: "Rs" },
  { code: "USD", label: "USD - US Dollar", symbol: "$" },
  { code: "GBP", label: "GBP - British Pound", symbol: "£" },
  { code: "EUR", label: "EUR - Euro", symbol: "€" },
  { code: "AED", label: "AED - UAE Dirham", symbol: "AED" },
  { code: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
  { code: "CAD", label: "CAD - Canadian Dollar", symbol: "C$" },
  { code: "SGD", label: "SGD - Singapore Dollar", symbol: "S$" },
];

export const GradeManagement: React.FC<GradeManagementProps> = ({
  grades,
  onCreateGrade,
  onUpdateGrade,
  onDeleteGrade,
  onProceedToCourseCreation,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [deleteConfirmGrade, setDeleteConfirmGrade] = useState<Grade | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form State aligned with backend GradeRequest
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    monthlyFee: string;
    currencyCode: string;
    active: boolean;
  }>({
    name: "",
    description: "",
    monthlyFee: "4500.00",
    currencyCode: "LKR",
    active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [createdGradeForNav, setCreatedGradeForNav] = useState<Grade | null>(null);

  // Client-side search and filtering
  const filteredGrades = grades.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.currencyCode && g.currencyCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "ALL" ? true : statusFilter === "ACTIVE" ? g.active : !g.active;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      monthlyFee: "4500.00",
      currencyCode: "LKR",
      active: true,
    });
    setFormErrors({});
    setApiError(null);
    setIsSubmitting(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (grade: Grade) => {
    setFormData({
      name: grade.name,
      description: grade.description || "",
      monthlyFee: grade.monthlyFee !== undefined ? Number(grade.monthlyFee).toFixed(2) : "4500.00",
      currencyCode: grade.currencyCode || "LKR",
      active: grade.active,
    });
    setFormErrors({});
    setApiError(null);
    setEditingGrade(grade);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Grade Name is required.";
    } else if (formData.name.length > 100) {
      errors.name = "Grade Name cannot exceed 100 characters.";
    }

    const feeNum = parseFloat(formData.monthlyFee);
    if (isNaN(feeNum) || feeNum <= 0) {
      errors.monthlyFee = "Monthly fee is required and must be greater than zero.";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.monthlyFee.trim())) {
      errors.monthlyFee = "Monthly fee can have at most 2 decimal places.";
    }

    if (!formData.currencyCode || formData.currencyCode.trim().length !== 3) {
      errors.currencyCode = "Currency code must be a 3-letter ISO code (e.g. LKR).";
    }

    if (formData.description && formData.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload: CreateGradeRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() ? formData.description.trim() : undefined,
        monthlyFee: parseFloat(parseFloat(formData.monthlyFee).toFixed(2)),
        currencyCode: formData.currencyCode.toUpperCase(),
      };

      const created = await onCreateGrade(payload);
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      setSuccessNotice(`Grade "${created.name}" created successfully.`);
      setCreatedGradeForNav(created);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      setIsSubmitting(false);
      setApiError(
        err.message || "HTTP 400: Failed to create grade. Please check input parameters.",
      );
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade || !validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload: UpdateGradeRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() ? formData.description.trim() : undefined,
        monthlyFee: parseFloat(parseFloat(formData.monthlyFee).toFixed(2)),
        currencyCode: formData.currencyCode.toUpperCase(),
        active: formData.active,
      };

      await onUpdateGrade(editingGrade.id, payload);
      setIsSubmitting(false);
      setEditingGrade(null);
      setSuccessNotice(`Grade "${payload.name}" updated successfully.`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      setIsSubmitting(false);
      setApiError(err.message || "HTTP 400: Update failed. Ensure grade name is unique.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmGrade) return;

    setDeleteError(null);
    const result = await onDeleteGrade(deleteConfirmGrade.id);

    if (result.success) {
      setSuccessNotice(`Grade "${deleteConfirmGrade.name}" deleted.`);
      setDeleteConfirmGrade(null);
      setTimeout(() => setSuccessNotice(null), 4000);
    } else {
      setDeleteError(
        result.error ||
          `Backend error (HTTP 409 Conflict): Cannot delete ${deleteConfirmGrade.name} because it is referenced by existing course records.`,
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grade Management"
        description="Configure institutional academic grade levels used when assigning courses."
        breadcrumbs={[{ label: "Admin" }, { label: "Academic Management" }, { label: "Grades" }]}
        actions={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Grade</span>
          </button>
        }
      />

      {/* Success Notification Banner with Course Creation Quick Link */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>

          {createdGradeForNav && onProceedToCourseCreation && (
            <button
              onClick={() => onProceedToCourseCreation(createdGradeForNav.id)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <span>Proceed to Create Course with this Grade</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grades by name, description, or currency..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Grades</option>
            <option value="INACTIVE">Inactive Grades</option>
          </select>

          <span className="text-xs text-slate-400 tabular-nums pl-1">
            {filteredGrades.length} of {grades.length} grades
          </span>
        </div>
      </div>

      {/* Grades Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Grade Name & ID</th>
                <th className="py-3 px-4 font-semibold">Standard Monthly Fee</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Linked Courses</th>
                <th className="py-3 px-4 font-semibold">Created Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      No grades found.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Create an academic grade to begin assigning courses.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Grade</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => (
                  <tr
                    key={grade.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${grade.active ? "bg-emerald-500" : "bg-slate-400"}`}
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {grade.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            UUID: {grade.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Monthly Fee (Owned by Grade) */}
                    <td className="py-3 px-4">
                      <div className="inline-flex flex-col">
                        <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold tabular-nums">
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                            {grade.currencyCode || "LKR"}
                          </span>
                          <span>
                            {(grade.monthlyFee ?? 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">/ mo</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Inherited by all courses</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {grade.description || "—"}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={grade.active ? "ACTIVE" : "INACTIVE"} />
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 tabular-nums">
                      <span className="font-semibold">{grade.courseCount ?? 0}</span> courses
                    </td>

                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(grade.createdAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedGrade(grade)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View Grade Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(grade)}
                          className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded"
                          title="Edit Grade & Monthly Fee"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteConfirmGrade(grade);
                          }}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                          title="Delete Grade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE GRADE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create Academic Grade & Fee
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {apiError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {apiError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="py-4 space-y-4 text-xs">
              {/* Field 1: name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">
                    Grade Name <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {formData.name.length} / 100
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Grade 10"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {formErrors.name && (
                  <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>
                )}
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Institutional grade tier identifier used during course assignment.
                </span>
              </div>

              {/* Field 2 & 3: monthlyFee and currencyCode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Monthly Fee <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                      placeholder="4500.00"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  {formErrors.monthlyFee && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.monthlyFee}</p>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Must be &gt; 0.00 with max 2 decimal places.
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Currency <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.currencyCode}
                    onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-medium"
                  >
                    {COMMON_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                  {formErrors.currencyCode && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.currencyCode}</p>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1 block">3-letter code.</span>
                </div>
              </div>

              {/* Tuition Architecture Note */}
              <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-900 dark:text-indigo-200">
                <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Tuition Standard for this Grade Level</span>
                </div>
                <span>
                  All courses associated with <strong>{formData.name || "this grade"}</strong> will
                  automatically inherit this tuition fee of{" "}
                  <strong className="font-mono">
                    {formData.currencyCode}{" "}
                    {parseFloat(formData.monthlyFee || "0").toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                  /month.
                </span>
              </div>

              {/* Field 4: description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">
                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {formData.description.length} / 1000
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Grade 10 academic curriculum standard for secondary education"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {formErrors.description && (
                  <p className="text-rose-500 text-[11px] mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Grade...</span>
                    </>
                  ) : (
                    <span>Create Grade</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GRADE MODAL */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Grade & Tuition Fee
                </h3>
              </div>
              <button
                onClick={() => setEditingGrade(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {apiError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {apiError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Grade Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                {formErrors.name && (
                  <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Standard Monthly Fee <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  {formErrors.monthlyFee && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.monthlyFee}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Currency <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.currencyCode}
                    onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium"
                  >
                    {COMMON_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Cascade Impact Notice</span>
                </div>
                <span>
                  Modifying this fee will automatically update the inherited monthly tuition fee for
                  all <strong>{editingGrade.courseCount ?? 0} courses</strong> linked to this grade.
                </span>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Active Status
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Inactive grades cannot be assigned to new courses
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmGrade && (
        <ConfirmationDialog
          isOpen={!!deleteConfirmGrade}
          title={`Delete Grade "${deleteConfirmGrade.name}"?`}
          description={
            deleteError ||
            `Are you sure you want to delete this grade level? This calls DELETE /api/v1/course/grades/${deleteConfirmGrade.id}.`
          }
          consequences={[
            "The grade level will be permanently removed from the course service database.",
            "Backend validation will reject deletion if any existing courses are linked to this grade.",
          ]}
          confirmText="Confirm Delete"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteConfirmGrade(null);
            setDeleteError(null);
          }}
        />
      )}

      {/* GRADE DETAIL SLIDE-OVER DRAWER */}
      {selectedGrade && (
        <DetailDrawer
          isOpen={!!selectedGrade}
          title={selectedGrade.name}
          subtitle={`Grade UUID: ${selectedGrade.id}`}
          onClose={() => setSelectedGrade(null)}
          width="md"
        >
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Active Status
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedGrade.active ? "Active Standard" : "Inactive Standard"}
                </span>
              </div>
              <StatusBadge status={selectedGrade.active ? "ACTIVE" : "INACTIVE"} />
            </div>

            {/* Financial Card */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase text-[10px] block mb-1">
                Standard Tuition Schedule
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {(selectedGrade.monthlyFee ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  {selectedGrade.currencyCode || "LKR"}
                </span>
                <span className="text-xs text-slate-400">/ month per course</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Configured via Grade Management service. Inherited by all courses enrolled under{" "}
                {selectedGrade.name}.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">
                Description
              </span>
              <p className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                {selectedGrade.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Associated Courses</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                  {selectedGrade.courseCount ?? 0} courses
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Created By</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                  {selectedGrade.createdBy || "System Admin"}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Created At</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                  {new Date(selectedGrade.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Last Updated</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                  {new Date(selectedGrade.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {onProceedToCourseCreation && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setSelectedGrade(null);
                    onProceedToCourseCreation(selectedGrade.id);
                  }}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Create Course for {selectedGrade.name}</span>
                </button>
              </div>
            )}
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};
