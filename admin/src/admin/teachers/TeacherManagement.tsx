import React, { useState } from "react";
import {
  Search,
  Plus,
  Briefcase,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  X,
  Send,
  RefreshCw,
  Trash2,
  Award,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { UserAvatar } from "../components/UserAvatar";
import { DetailDrawer } from "../components/DetailDrawer";
import { TeacherProfile, Course } from "../types";
import type { RegisterTeacherRequest } from "../api/usersApi";

interface TeacherManagementProps {
  teachers: TeacherProfile[];
  courses: Course[];
  onAddTeacher: (teacher: TeacherProfile) => void;
  onRegisterTeacher: (request: RegisterTeacherRequest) => Promise<TeacherProfile>;
  onResendInvitation: (email: string, role: string) => Promise<void>;
  showRegistrationWizardDirectly?: boolean;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  courses,
  onAddTeacher,
  onRegisterTeacher,
  onResendInvitation,
  showRegistrationWizardDirectly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(showRegistrationWizardDirectly);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [createdTeacherCode, setCreatedTeacherCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  const handleResend = async (email: string, role: string) => {
    setResendingEmail(email);
    try {
      await onResendInvitation(email, role);
    } finally {
      setResendingEmail(null);
    }
  };

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "1985-06-20",
    nic: "",
    hireDate: "2026-11-01",
    specializations: ["Applied Mathematics"],
    addressLine1: "",
    city: "San Jose",
    district: "Santa Clara",
    postalCode: "95112",
  });

  const [newSpecInput, setNewSpecInput] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleAddSpec = () => {
    if (newSpecInput.trim() && !formData.specializations.includes(newSpecInput.trim())) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, newSpecInput.trim()],
      });
      setNewSpecInput("");
    }
  };

  const handleRemoveSpec = (specToRemove: string) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter((s) => s !== specToRemove),
    });
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim()))
        errors.email = "Valid institutional faculty email is required";
    }
    if (step === 2) {
      if (!formData.nic.trim()) errors.nic = "National Identity Card (NIC) is required";
      if (formData.specializations.length === 0)
        errors.specializations = "At least one specialization is required";
    }
    if (step === 3) {
      if (!formData.addressLine1.trim()) errors.addressLine1 = "Address line 1 is required";
      if (!formData.city.trim()) errors.city = "City is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev + 1) as any);
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      const createdTeacher = await onRegisterTeacher(formData);
      onAddTeacher(createdTeacher);
      setCreatedTeacherCode(createdTeacher.teacherCode);
      setCurrentStep(5);
    } catch (error) {
      setFormErrors({
        api: error instanceof Error ? error.message : "Unable to register teacher.",
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
      dob: "1985-06-20",
      nic: "",
      hireDate: "2026-11-01",
      specializations: ["Applied Mathematics"],
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

  const assignedCourses = selectedTeacher
    ? courses.filter((c) => c.teacherId === selectedTeacher.id)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Management"
        description="Faculty directory, departmental specializations, course assignments, and credential onboarding."
        breadcrumbs={[{ label: "Admin" }, { label: "User Management" }, { label: "Teachers" }]}
        actions={
          <button
            onClick={() => {
              setCurrentStep(1);
              setIsWizardOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Teacher</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by teacher code, name, email, or specialization..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <span className="text-xs text-slate-400 tabular-nums">
          {filteredTeachers.length} active faculty members
        </span>
      </div>

      {/* Teachers Directory Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Teacher Code</th>
                <th className="py-3 px-4 font-semibold">Faculty Name & Email</th>
                <th className="py-3 px-4 font-semibold">Approved Specializations</th>
                <th className="py-3 px-4 font-semibold">Hire Date</th>
                <th className="py-3 px-4 font-semibold">Courses</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                    {teacher.teacherCode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={`${teacher.firstName} ${teacher.lastName}`}
                        avatarUrl={teacher.avatarUrl}
                        size="md"
                      />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {teacher.firstName} {teacher.lastName}
                        </span>
                        <span className="text-slate-400">{teacher.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {teacher.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 tabular-nums">{teacher.hireDate}</td>
                  <td className="py-3 px-4 tabular-nums font-medium text-slate-700 dark:text-slate-300">
                    {teacher.assignedCourseCount} active
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={teacher.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="px-2 py-1 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-medium"
                      >
                        Inspect
                      </button>
                      {teacher.status === "INVITED" && (
                        <button
                          disabled={resendingEmail === teacher.email}
                          onClick={() => void handleResend(teacher.email, "TEACHER")}
                          className="px-2 py-1 rounded text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium flex items-center gap-1 disabled:cursor-wait disabled:opacity-60"
                        >
                          {resendingEmail === teacher.email ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          {resendingEmail === teacher.email ? "Sending..." : "Resend"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TEACHER REGISTRATION WIZARD */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Teacher Registration Wizard
                </h3>
                <p className="text-xs text-slate-500">
                  Add a new teacher and their professional details
                </p>
              </div>
              <button onClick={resetWizard} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper */}
            {currentStep < 5 && (
              <div className="py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {[
                  { step: 1, title: "Personal Info" },
                  { step: 2, title: "Professional Credentials" },
                  { step: 3, title: "Address Info" },
                  { step: 4, title: "Review & Submit" },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        currentStep === s.step
                          ? "bg-indigo-600 text-white"
                          : currentStep > s.step
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {currentStep > s.step ? "✓" : s.step}
                    </span>
                    <span
                      className={`hidden sm:inline font-medium ${
                        currentStep === s.step
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="py-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step 1: Faculty Profile
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Jonathan"
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
                      placeholder="e.g. Hughes"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.lastName && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Faculty Institutional Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. jonathan.hughes@mentify.edu"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.email && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <div className="py-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step 2: Professional Details & Specializations
                </h4>
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
                      National Identity Card (NIC) *
                    </label>
                    <input
                      type="text"
                      value={formData.nic}
                      onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                      placeholder="e.g. 852940112V"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.nic && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.nic}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Official Hire Date
                    </label>
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Specializations Tag Builder */}
                  <div className="col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Subject Specializations (At least 1 required) *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSpecInput}
                        onChange={(e) => setNewSpecInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSpec();
                          }
                        }}
                        placeholder="e.g. Organic Chemistry, Quantum Mechanics"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpec}
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 min-h-12 items-center">
                      {formData.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs"
                        >
                          <span>{spec}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(spec)}
                            className="hover:text-rose-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {formErrors.specializations && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.specializations}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div className="py-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step 3: Residential Address
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="Street address or residence"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {formErrors.addressLine1 && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.addressLine1}</p>
                    )}
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
                    {formErrors.city && (
                      <p className="text-rose-500 text-[11px] mt-1">{formErrors.city}</p>
                    )}
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

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="py-4 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step 4: Confirm Faculty Provisioning
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block">Faculty Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Faculty Email:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formData.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Hire Date & NIC:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formData.hireDate} · NIC: {formData.nic}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-1">Specializations:</span>
                      <div className="flex flex-wrap gap-1">
                        {formData.specializations.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {currentStep === 5 && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Teacher Registered
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    The teacher account was created successfully. The invitation email is being sent
                    in the background.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Generated Teacher Code:</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {createdTeacherCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Status:</span>
                    <StatusBadge status="INVITED" />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={resetWizard}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Done & Return to Faculty Directory
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setFormData({
                        ...formData,
                        firstName: "",
                        lastName: "",
                        email: "",
                        nic: "",
                      });
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Register Another Teacher
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Buttons */}
            {formErrors.api && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {formErrors.api}
              </p>
            )}
            {currentStep < 5 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((p) => (p - 1) as any)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>Registering...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Onboard Teacher</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEACHER DETAILS SLIDE-OUT DRAWER */}
      {selectedTeacher && (
        <DetailDrawer
          isOpen={!!selectedTeacher}
          title={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
          subtitle={`${selectedTeacher.teacherCode} · Faculty Member`}
          onClose={() => setSelectedTeacher(null)}
          width="lg"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <UserAvatar
                name={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                avatarUrl={selectedTeacher.avatarUrl}
                size="lg"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedTeacher.firstName} {selectedTeacher.lastName}
                </h4>
                <p className="text-xs text-slate-500">{selectedTeacher.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={selectedTeacher.status} />
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                    {selectedTeacher.teacherCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Approved Specializations
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedTeacher.specializations.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assigned Courses ({assignedCourses.length})
              </h4>
              {assignedCourses.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No active courses assigned yet.</p>
              ) : (
                assignedCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {c.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {c.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {c.enrollmentCount} enrolled · {c.grade}
                      </span>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};
