import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react';
import { ContactFormData, Language } from '../types';
import { api } from '../lib/api/client';
import { SITE_CONFIG } from '../lib/config/site';
import { getTranslation } from '../lib/translations';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/FormControls';
import { Accordion, Tabs } from '../components/ui/FeedbackStates';
import { MOCK_FAQS } from '../data/mockData';

export interface ContactLegalPageProps {
  currentLang: Language;
  initialTab?: 'contact' | 'faq' | 'privacy' | 'terms';
}

export const ContactLegalPage: React.FC<ContactLegalPageProps> = ({
  currentLang,
  initialTab = 'contact',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Form State
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'admissions',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitContact(formData);
      setTicketId(res.data.ticketId);
      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      alert('An error occurred submitting your inquiry. Please try again.');
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
            Student Support & Legal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Help Center, Inquiries & Governance
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Get in touch with the TiT Education administration team or review institutional policies.
          </p>

          <div className="mt-8 flex justify-center">
            <Tabs
              tabs={[
                { id: 'contact', label: 'Contact Tuition Center' },
                { id: 'faq', label: 'Frequently Asked Questions' },
                { id: 'privacy', label: 'Privacy Policy' },
                { id: 'terms', label: 'Terms of Use' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </Container>
      </section>

      <Container>
        {/* TAB 1: CONTACT FORM & CENTER INFO */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Head Office & Tuition Center
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Reach Out to Our Team</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Have questions about upcoming intake batches, marketplace publication, or tuition billing?
                  Our academic officers are available Monday through Saturday.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">Main Center Address</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{SITE_CONFIG.contact.address}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">Direct Phone & WhatsApp</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Telephone: {SITE_CONFIG.contact.phone}</p>
                    <p className="text-slate-600 dark:text-slate-400">WhatsApp Hotline: {SITE_CONFIG.contact.whatsapp}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">Email Enquiries</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Admissions: {SITE_CONFIG.contact.supportEmail}</p>
                    <p className="text-slate-600 dark:text-slate-400">General: {SITE_CONFIG.contact.email}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">Academic Working Hours</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{SITE_CONFIG.contact.businessHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7">
              <Card padding="lg" className="shadow-lg">
                {!submitSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                      Send a Direct Message
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Full Name"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Priyantha Silva"
                      />
                      <Input
                        label="Email Address"
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Contact Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="077 123 4567"
                      />
                      <Select
                        label="Inquiry Type"
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value as any })}
                        options={[
                          { value: 'admissions', label: 'Admissions & Batch Enrollment' },
                          { value: 'marketplace', label: 'Marketplace Materials & Purchases' },
                          { value: 'courses', label: 'Course Syllabi & Timetables' },
                          { value: 'tech_support', label: 'Portal Access / Technical Support' },
                          { value: 'other', label: 'Other Inquiries' },
                        ]}
                      />
                    </div>

                    <Input
                      label="Subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Inquiry regarding 2026 Combined Maths revision batch"
                    />

                    <Textarea
                      label="Your Message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your query in detail..."
                    />

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        leftIcon={<Send className="w-4 h-4" />}
                        className="w-full justify-center shadow-md shadow-indigo-500/20"
                      >
                        Submit Support Ticket
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8 space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Message Dispatched!</h3>
                    <p className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg inline-block text-slate-700">
                      Ticket ID: {ticketId}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting TiT. A member of our academic support team will respond to {formData.email} within 1 business day.
                    </p>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setSubmitSuccess(false);
                        setFormData({
                          fullName: '',
                          email: '',
                          phone: '',
                          inquiryType: 'admissions',
                          subject: '',
                          message: '',
                        });
                      }}
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: FREQUENTLY ASKED QUESTIONS */}
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <Accordion
              items={MOCK_FAQS.map((faq) => ({
                title: faq.question,
                content: (
                  <div className="space-y-2">
                    <Badge variant="neutral" size="sm" className="mb-1">
                      {faq.category}
                    </Badge>
                    <p className="text-slate-600 leading-relaxed text-sm">{faq.answer}</p>
                  </div>
                ),
              }))}
            />
          </div>
        )}

        {/* TAB 3: PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Last Updated: October 2026</p>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">1. Information We Collect</h3>
              <p>
                TiT collects personal information necessary to facilitate academic enrollment, portal access,
                and digital resource distribution. This includes student names, guardian contact numbers, email addresses,
                geographic district, and educational stream preferences submitted during pre-registration.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">2. Secure Student & Staff Accounts</h3>
              <p>
                Student, Teacher, and Administrator accounts are protected by secure industry-standard encryption. We never store plain-text
                passwords, and logins expire automatically when sessions finish to safeguard student privacy.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">3. Learning Material Protection</h3>
              <p>
                Digital learning materials, class recordings, and assignments are hosted in private, secure cloud storage with
                personalized student access. Unapproved copying or unauthorized distribution of intellectual property is strictly prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">4. Parental Rights</h3>
              <p>
                Parents and legal guardians may request inspection, correction, or deletion of their child's pre-registration
                records by contacting {SITE_CONFIG.contact.email}.
              </p>
            </section>
          </div>
        )}

        {/* TAB 4: TERMS OF USE */}
        {activeTab === 'terms' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Use</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Effective Date: October 2026</p>
            </div>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">1. Acceptance of Terms</h3>
              <p>
                By using TiT and its associated services, you agree to comply with all institutional academic rules,
                code of conduct guidelines, and applicable intellectual property laws.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">2. Intellectual Property of Learning Materials</h3>
              <p>
                All past paper markings, model answers, revision guides, and video lectures made available on TiT
                are the intellectual property of TiT and its authoring educators. Redistribution, unauthorized
                resale, or public republication is strictly prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">3. Pre-Registration & Batch Allocations</h3>
              <p>
                Online pre-registration reserves preliminary seating consideration for upcoming academic batches. Formal
                enrollment is finalized upon admissions board review and confirmation of batch schedules.
              </p>
            </section>
          </div>
        )}
      </Container>
    </div>
  );
};
