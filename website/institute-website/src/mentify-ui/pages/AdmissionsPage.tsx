import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Info,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { AdmissionsFormData, Language } from '../types';
import { api } from '../lib/api/client';
import { SITE_CONFIG } from '../lib/config/site';
import { getTranslation } from '../lib/translations';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Checkbox, Input, Select, Textarea } from '../components/ui/FormControls';

export interface AdmissionsPageProps {
  currentLang: Language;
  onNavigate: (path: string) => void;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ currentLang, onNavigate }) => {
  const t = (key: string) => getTranslation(currentLang, key);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');

  // Form State
  const [formData, setFormData] = useState<AdmissionsFormData>({
    studentFullName: '',
    studentInitials: '',
    dateOfBirth: '',
    gender: 'male',
    guardianName: '',
    guardianRelation: 'Mother',
    guardianPhone: '',
    guardianEmail: '',
    studentEmail: '',
    studentPhone: '',
    district: 'Colombo',
    city: '',
    address: '',
    grade: 'al-maths',
    preferredSubjects: ['Combined Mathematics', 'Physics'],
    learningPreference: 'Hybrid',
    preferredContactMethod: 'WhatsApp',
    previousSchool: '',
    specialRequests: '',
    consentAgreed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.studentFullName.trim()) errs.studentFullName = 'Full name is required';
    if (!formData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.guardianName.trim()) errs.guardianName = 'Guardian name is required';
    if (!formData.guardianPhone.trim()) errs.guardianPhone = 'Contact phone is required';
    if (!formData.guardianEmail.trim() || !formData.guardianEmail.includes('@')) {
      errs.guardianEmail = 'A valid guardian email address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (formData.preferredSubjects.length === 0) {
      errs.preferredSubjects = 'Please select at least one preferred subject';
    }
    if (!formData.consentAgreed) {
      errs.consentAgreed = 'You must confirm and consent before submitting';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubjectToggle = (subj: string) => {
    setFormData((prev) => {
      const exists = prev.preferredSubjects.includes(subj);
      const updated = exists
        ? prev.preferredSubjects.filter((s) => s !== subj)
        : [...prev.preferredSubjects, subj];
      return { ...prev, preferredSubjects: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);
    try {
      const res = await api.submitAdmissions(formData);
      setReferenceNo(res.data.referenceNo);
      setSubmissionSuccess(true);
    } catch (err) {
      console.error(err);
      alert('An error occurred during admission submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="pt-12 sm:pt-16 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 pb-12 transition-colors">
        <Container size="md" className="text-center">
          <Badge variant="primary" size="md" className="mb-3">
            Academic Admissions {new Date().getFullYear()} / {new Date().getFullYear() + 1}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('admissions.title')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            {t('admissions.subtitle')}
          </p>
        </Container>
      </section>

      <Container size="md">
        {!submissionSuccess ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
            {/* Step Progress Indicators */}
            <div className="px-6 sm:px-10 py-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {[
                { number: 1, title: 'Student Identity', label: 'Step 1' },
                { number: 2, title: 'Parent / Guardian', label: 'Step 2' },
                { number: 3, title: 'Academic Preferences', label: 'Step 3' },
              ].map((s) => (
                <div key={s.number} className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step === s.number
                        ? 'bg-indigo-600 text-white'
                        : step > s.number
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step > s.number ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                  </span>
                  <span
                    className={`hidden sm:inline text-xs font-semibold ${
                      step === s.number ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
              {/* STEP 1: Student Details */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Profile</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Provide official details as registered in school records.</p>
                  </div>

                  <Input
                    label="Full Name of Student"
                    required
                    value={formData.studentFullName}
                    error={errors.studentFullName}
                    onChange={(e) => setFormData({ ...formData, studentFullName: e.target.value })}
                    placeholder="e.g. Kasun Dineth Jayasinghe"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Date of Birth"
                      required
                      type="date"
                      value={formData.dateOfBirth}
                      error={errors.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                    <Select
                      label="Gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Prefer not to say' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Student Contact Phone (Optional)"
                      type="tel"
                      value={formData.studentPhone}
                      onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                      placeholder="077 123 4567"
                    />
                    <Input
                      label="Student Email (Optional)"
                      type="email"
                      value={formData.studentEmail}
                      onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                      placeholder="student@example.com"
                    />
                  </div>

                  <Input
                    label="Current / Previous School"
                    value={formData.previousSchool}
                    onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                    placeholder="e.g. Royal College, Colombo 07"
                  />
                </div>
              )}

              {/* STEP 2: Parent / Guardian Details */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Parent / Guardian Contact</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Required for official admissions communication and timetable notifications.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Guardian Full Name"
                      required
                      value={formData.guardianName}
                      error={errors.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="e.g. Mr. S. Jayasinghe"
                    />
                    <Select
                      label="Relationship to Student"
                      value={formData.guardianRelation}
                      onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                      options={[
                        { value: 'Father', label: 'Father' },
                        { value: 'Mother', label: 'Mother' },
                        { value: 'Guardian', label: 'Legal Guardian' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Guardian WhatsApp / Mobile"
                      required
                      type="tel"
                      value={formData.guardianPhone}
                      error={errors.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="077 123 4567"
                    />
                    <Input
                      label="Guardian Email"
                      required
                      type="email"
                      value={formData.guardianEmail}
                      error={errors.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      placeholder="parent@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="District"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      options={SITE_CONFIG.districts.map((d) => ({ value: d, label: d }))}
                    />
                    <Input
                      label="Town / City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Nugegoda / Jaffna"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Academic Preferences & Submission */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Academic Intake Preferences</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Configure your target stream and format preferences.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Target Academic Level"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      options={SITE_CONFIG.grades.map((g) => ({ value: g.id, label: g.name }))}
                    />
                    <Select
                      label="Learning Format"
                      value={formData.learningPreference}
                      onChange={(e) => setFormData({ ...formData, learningPreference: e.target.value as any })}
                      options={[
                        { value: 'Hybrid', label: 'Hybrid (Tuition Center + Online)' },
                        { value: 'Online Live', label: 'Online Live Stream Only' },
                        { value: 'Physical Classroom', label: 'Physical Classroom (Tuition Center)' },
                      ]}
                    />
                  </div>

                  {/* Subjects Multi-Select Checkboxes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Preferred Subject Modules <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      {SITE_CONFIG.subjects.slice(0, 8).map((subj) => (
                        <Checkbox
                          key={subj}
                          label={subj}
                          checked={formData.preferredSubjects.includes(subj)}
                          onChange={() => handleSubjectToggle(subj)}
                        />
                      ))}
                    </div>
                    {errors.preferredSubjects && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.preferredSubjects}</p>
                    )}
                  </div>

                  <Textarea
                    label="Special Academic Inquiries or Requests"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Mention any specific timetable constraints or past exam results..."
                    rows={3}
                  />

                  {/* Consent & Policy Checkbox */}
                  <div className="pt-2">
                    <Checkbox
                      label="I confirm the accuracy of information and authorize TiT admissions to contact me via WhatsApp/Email."
                      description="Pre-registration is completely free and tuition fees only apply after your enrollment is confirmed."
                      checked={formData.consentAgreed}
                      onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
                    />
                    {errors.consentAgreed && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.consentAgreed}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setStep((s) => (s - 1) as any)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Previous Step
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleNext}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="shadow-md shadow-indigo-500/20"
                  >
                    Submit Official Pre-Registration
                  </Button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* Submission Success State */
          <Card padding="lg" className="text-center py-12 space-y-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-100 dark:border-emerald-900/60 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <Badge variant="success" size="md">
                Application Received
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Pre-Registration Confirmed!
              </h2>
              <div className="font-mono text-sm font-bold bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-xl inline-block text-slate-800 dark:text-slate-200">
                Ref No: {referenceNo}
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              Thank you, <strong className="text-slate-800 dark:text-slate-200">{formData.studentFullName}</strong>. Your academic intake application has been queued with the TiT Education admissions board.
            </p>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs max-w-md mx-auto space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">Next Steps:</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                1. An academic counselor will reach out via WhatsApp ({formData.guardianPhone}) within 24 hours.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                2. You will receive batch timetable schedules and class admission details.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                3. Student portal login details will be sent via WhatsApp once your class enrollment is confirmed.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button variant="primary" size="md" onClick={() => onNavigate('home')}>
                Return to Homepage
              </Button>
              <Button variant="outline" size="md" onClick={() => onNavigate('marketplace')}>
                Explore Free Revision Notes
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </div>
  );
};
