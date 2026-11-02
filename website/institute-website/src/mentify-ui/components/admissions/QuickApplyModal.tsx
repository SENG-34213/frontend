import React, { useState } from "react";
import { CheckCircle2, GraduationCap, Send, X } from "lucide-react";
import { CourseItem } from "../../types";
import { api } from "../../lib/api/client";
import { Button } from "../ui/Button";
import { Input, Select } from "../ui/FormControls";
import { SITE_CONFIG } from "../../lib/config/site";

export interface QuickApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse?: CourseItem | null;
}

export const QuickApplyModal: React.FC<QuickApplyModalProps> = ({
  isOpen,
  onClose,
  selectedCourse,
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [learningPreference, setLearningPreference] = useState<
    "Online Live" | "Physical Classroom" | "Hybrid"
  >("Hybrid");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.submitAdmissions({
        studentFullName: fullName,
        studentInitials: fullName
          .split(" ")
          .map((n) => n[0])
          .join("."),
        dateOfBirth: "2008-01-01",
        gender: "other",
        guardianName: "Guardian of " + fullName,
        guardianRelation: "Parent",
        guardianPhone: phone,
        guardianEmail: email,
        studentEmail: email,
        studentPhone: phone,
        district: district,
        city: district,
        address: district,
        grade: selectedCourse ? selectedCourse.grade : "A/L",
        preferredSubjects: selectedCourse ? [selectedCourse.subject] : ["Combined Mathematics"],
        learningPreference: learningPreference,
        preferredContactMethod: "WhatsApp",
        consentAgreed: true,
      });

      setReferenceNo(res.data.referenceNo);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            <div className="flex items-center gap-3.5 mb-5">
              <img
                src="/TiTJaffna-logo.jpeg"
                alt="TiT Jaffna Publication"
                className="w-12 h-12 rounded-full object-contain bg-white shadow-md ring-2 ring-indigo-500/30 shrink-0"
              />
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Course Admission Enquiry
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedCourse
                    ? selectedCourse.title
                    : "TiT Online Education · Academic Intake Pre-Registration"}
                </p>
              </div>
            </div>

            {selectedCourse && (
              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mb-5 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Selected Program:</span>
                  <span>
                    {selectedCourse.fee.currency} {selectedCourse.fee.amount.toLocaleString()}/
                    {selectedCourse.fee.period}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Format: {selectedCourse.learningFormat} • Instructor:{" "}
                  {selectedCourse.teacher.name}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Student Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dineth Wickramasinghe"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Phone / WhatsApp"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="077 123 4567"
                />
                <Input
                  label="Email Address"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="District"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  options={SITE_CONFIG.districts.map((d) => ({ value: d, label: d }))}
                />
                <Select
                  label="Preferred Format"
                  value={learningPreference}
                  onChange={(e) => setLearningPreference(e.target.value as any)}
                  options={[
                    { value: "Hybrid", label: "Hybrid (Online + In-Person Tuition)" },
                    { value: "Online Live", label: "Online Live Only" },
                    { value: "Physical Classroom", label: "Physical Classroom" },
                  ]}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="w-full justify-center shadow-md shadow-indigo-500/20"
                >
                  Submit Admission Enquiry
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-100 dark:border-emerald-900/60">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enquiry Received</h3>
            <p className="text-xs font-mono bg-slate-100 dark:bg-slate-800 py-1 px-3 rounded-lg inline-block text-slate-700 dark:text-slate-300">
              Reference: {referenceNo}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              Our academic counselors will review your intake details and message you via WhatsApp
              with registration documents and timetable schedules.
            </p>
            <Button variant="primary" size="md" onClick={onClose} className="w-full justify-center">
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
