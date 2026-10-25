import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Plus,
  Lock,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  X,
  Send,
  RefreshCw,
  Unlock,
  Ban,
  Trash2,
  Eye,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RoleBadge } from "../components/RoleBadge";
import { StatusBadge } from "../components/StatusBadge";
import { UserAvatar } from "../components/UserAvatar";
import { DetailDrawer } from "../components/DetailDrawer";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { EmptyState } from "../../../../shared/ui/EmptyState";
import { AdministratorProfile, AdminRole } from "../types";
import type { RegisterAdministratorRequest } from "../api/usersApi";

interface AdminManagementProps {
  administrators: AdministratorProfile[];
  currentRole: AdminRole;
  onAddAdministrator: (admin: AdministratorProfile) => void;
  onRegisterAdministrator: (request: RegisterAdministratorRequest) => Promise<AdministratorProfile>;
  onResendInvitation: (email: string, role: string) => Promise<void>;
  onUpdateUserStatus: (userId: string, active: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onUnlockUser: (userId: string) => Promise<void>;
  showRegistrationWizardDirectly?: boolean;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({
  administrators,
  currentRole,
  onAddAdministrator,
  onRegisterAdministrator,
  onResendInvitation,
  onUpdateUserStatus,
  onDeleteUser,
  onUnlockUser,
  showRegistrationWizardDirectly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<AdministratorProfile | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(showRegistrationWizardDirectly);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [createdAdminCode, setCreatedAdminCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [unlockingUserId, setUnlockingUserId] = useState<string | null>(null);
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdministratorProfile | null>(null);

  const handleStatusChange = async (userId: string, active: boolean) => {
    setMutatingUserId(userId);
    try {
      await onUpdateUserStatus(userId, active);
    } finally {
      setMutatingUserId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const administrator = deleteTarget;
    setMutatingUserId(administrator.id);
    try {
      await onDeleteUser(administrator.id);
      setDeleteTarget(null);
    } finally {
      setMutatingUserId(null);
    }
  };

  const handleResend = async (email: string, role: string) => {
    setResendingEmail(email);
    try {
      await onResendInvitation(email, role);
    } finally {
      setResendingEmail(null);
    }
  };

  const handleUnlock = async (userId: string) => {
    setUnlockingUserId(userId);
    try {
      await onUnlockUser(userId);
    } finally {
      setUnlockingUserId(null);
    }
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "1988-03-10",
    nic: "",
    department: "Curriculum & Assessment Accreditation",
    addressLine1: "",
    city: "San Jose",
    district: "Santa Clara",
    postalCode: "95112",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Strict role check
  if (currentRole !== "SUPER_ADMIN") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Administrator Management"
          description="Institutional governance and administrative credentials provisioning."
          breadcrumbs={[{ label: "Admin" }, { label: "Administrators" }]}
        />

        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Super Administrator Authorization Required
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Only super administrators can view administrator directories or create new
              administrator accounts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredAdmins = administrators.filter((a) => {
    return (
      a.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.adminCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim()))
        errors.email = "Valid institutional admin email is required";
    }
    if (step === 2) {
      if (!formData.nic.trim()) errors.nic = "NIC identifier is required";
      if (!formData.department.trim()) errors.department = "Department is required";
    }
    if (step === 3) {
      if (!formData.addressLine1.trim()) errors.addressLine1 = "Address is required";
      if (!formData.city.trim()) errors.city = "City is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((p) => (p + 1) as any);
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      const createdAdmin = await onRegisterAdministrator(formData);
      onAddAdministrator(createdAdmin);
      setCreatedAdminCode(createdAdmin.adminCode);
      setCurrentStep(4);
    } catch (error) {
      setFormErrors({
        api: error instanceof Error ? error.message : "Unable to register administrator.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "1988-03-10",
      nic: "",
      department: "Curriculum & Assessment Accreditation",
      addressLine1: "",
      city: "San Jose",
      district: "Santa Clara",
      postalCode: "95112",
    });
    setFormErrors({});
    setIsSubmitting(false);
    setCurrentStep(1);
    setIsWizardOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrator Management"
        description="Institutional governance, administrator credential provisioning, and role delegation (SUPER_ADMIN Only)."
        breadcrumbs={[
          { label: "Admin" },
          { label: "User Management" },
          { label: "Administrators" },
        ]}
        actions={
          <button
            onClick={() => {
              setCurrentStep(1);
              setIsWizardOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Administrator</span>
          </button>
        }
      />

      {/* Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by administrator name, email, or code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums">
          {filteredAdmins.length} administrators
        </span>
      </div>

      {/* Directory Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Admin Code</th>
                <th className="py-3 px-4 font-semibold">Administrator Name</th>
                <th className="py-3 px-4 font-semibold">Role Tier</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Account Status</th>
                <th className="py-3 px-4 font-semibold">Registered</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <EmptyState
                      compact
                      icon={ShieldCheck}
                      title="No administrators found"
                      description="No administrator records match the selected filters."
                      className="border-0 py-0"
                    />
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {admin.adminCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={`${admin.firstName} ${admin.lastName}`} size="md" />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {admin.firstName} {admin.lastName}
                          </span>
                          <span className="text-slate-400">{admin.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RoleBadge role={admin.role} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {admin.department}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={admin.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedAdmin(admin)}
                          className="group relative rounded p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                          title="View administrator details"
                          aria-label={`View details for ${admin.firstName} ${admin.lastName}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            View details
                          </span>
                        </button>
                        {admin.status === "INVITED" && (
                          <button
                            disabled={resendingEmail === admin.email}
                            onClick={() => void handleResend(admin.email, "ADMIN")}
                            className="px-2 py-1 rounded text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium flex items-center gap-1 disabled:cursor-wait disabled:opacity-60"
                          >
                            {resendingEmail === admin.email ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            {resendingEmail === admin.email ? "Sending..." : "Resend"}
                          </button>
                        )}
                        {admin.accountLocked && (
                          <button
                            disabled={unlockingUserId === admin.id}
                            onClick={() => void handleUnlock(admin.id)}
                            className="group relative rounded p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            title="Unlock account immediately"
                            aria-label={`Unlock ${admin.firstName} ${admin.lastName}`}
                          >
                            <Unlock
                              className={`h-3.5 w-3.5 ${unlockingUserId === admin.id ? "animate-pulse" : ""}`}
                            />
                            <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                              Unlock account
                            </span>
                          </button>
                        )}
                        {admin.role !== "SUPER_ADMIN" &&
                          (admin.status === "ACTIVE" || admin.status === "SUSPENDED") && (
                            <button
                              disabled={mutatingUserId === admin.id}
                              onClick={() =>
                                void handleStatusChange(admin.id, admin.status === "SUSPENDED")
                              }
                              className="group relative rounded p-1.5 text-amber-600 hover:bg-amber-50 disabled:cursor-wait disabled:opacity-60 dark:text-amber-400 dark:hover:bg-amber-950/40"
                              title={
                                admin.status === "ACTIVE" ? "Suspend account" : "Activate account"
                              }
                              aria-label={
                                admin.status === "ACTIVE"
                                  ? `Suspend ${admin.firstName} ${admin.lastName}`
                                  : `Activate ${admin.firstName} ${admin.lastName}`
                              }
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                {admin.status === "ACTIVE" ? "Suspend account" : "Activate account"}
                              </span>
                            </button>
                          )}
                        {admin.role !== "SUPER_ADMIN" && (
                          <button
                            disabled={mutatingUserId === admin.id}
                            onClick={() => setDeleteTarget(admin)}
                            className="group relative rounded p-1.5 text-rose-600 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            title="Delete user"
                            aria-label={`Delete ${admin.firstName} ${admin.lastName}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                              Delete user
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION WIZARD */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Administrator Registration Wizard
                </h3>
                <p className="text-xs text-slate-500">Add a new administrator to the institution</p>
              </div>
              <button onClick={resetWizard} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.api && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {formErrors.api}
              </p>
            )}

            {currentStep < 4 && (
              <div className="py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {[
                  { step: 1, title: "Personal Info" },
                  { step: 2, title: "Department & NIC" },
                  { step: 3, title: "Address & Submit" },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStep === s.step
                          ? "bg-purple-600 text-white"
                          : currentStep > s.step
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {currentStep > s.step ? "✓" : s.step}
                    </span>
                    <span
                      className={`font-medium ${
                        currentStep === s.step
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-slate-400"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 1 && (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Ronald"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.firstName && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Sterling"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.lastName && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Admin Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ronald.sterling@mentify.edu"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.email && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      NIC Identifier *
                    </label>
                    <input
                      type="text"
                      value={formData.nic}
                      onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                      placeholder="e.g. 88390112V"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.nic && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.nic}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Administrative Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="Street address"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Administrator Registered
                </h4>
                <p className="text-xs text-slate-500">
                  The administrator account was created successfully. The invitation email is being
                  sent in the background.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Generated Admin Code:</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                      {createdAdminCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Role:</span>
                    <RoleBadge role="ADMIN" />
                  </div>
                </div>
                <button
                  onClick={resetWizard}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Return to Administrators Directory
                </button>
              </div>
            )}

            {currentStep < 4 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((p) => (p - 1) as any)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300"
                >
                  Back
                </button>
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white"
                  >
                    {isSubmitting ? "Registering..." : "Confirm & Register"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL DRAWER */}
      {selectedAdmin && (
        <DetailDrawer
          isOpen={!!selectedAdmin}
          title={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
          subtitle={`${selectedAdmin.adminCode} · ${selectedAdmin.role}`}
          onClose={() => setSelectedAdmin(null)}
          width="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <UserAvatar name={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`} size="lg" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {selectedAdmin.firstName} {selectedAdmin.lastName}
                </h4>
                <p className="text-slate-500">{selectedAdmin.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <RoleBadge role={selectedAdmin.role} />
                  <StatusBadge status={selectedAdmin.status} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-slate-400 block font-medium">Department</span>
              <span className="font-medium text-slate-900 dark:text-white block">
                {selectedAdmin.department}
              </span>
              <span className="text-slate-400 block font-medium mt-2">National Identity (NIC)</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 block">
                {selectedAdmin.nic}
              </span>
            </div>
          </div>
        </DetailDrawer>
      )}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        title="Delete administrator account?"
        description={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This action cannot be undone.`
            : ""
        }
        consequences={[
          "The administrator will no longer be able to sign in.",
          "The administrator profile will be permanently deleted.",
          "Existing audit history may remain for compliance purposes.",
        ]}
        confirmText={mutatingUserId === deleteTarget?.id ? "Deleting…" : "Delete administrator"}
        variant="danger"
        onConfirm={() => void handleDelete()}
        onCancel={() => (mutatingUserId ? undefined : setDeleteTarget(null))}
      />
    </div>
  );
};
