import React from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  HelpCircle,
  Layers,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { CourseItem, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { Container } from '../components/ui/Container';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Accordion, Breadcrumb } from '../components/ui/FeedbackStates';

export interface CourseDetailPageProps {
  currentLang: Language;
  course: CourseItem;
  onBack: () => void;
  onApply: (course: CourseItem) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  currentLang,
  course,
  onBack,
  onApply,
}) => {
  const t = (key: string) => getTranslation(currentLang, key);

  return (
    <div className="space-y-12 pb-20">
      {/* Top Breadcrumb & Hero */}
      <section className="pt-8 sm:pt-12 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 pb-12 transition-colors">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Home', onClick: onBack },
              { label: 'Courses', onClick: onBack },
              { label: course.title, active: true },
            ]}
          />

          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="md">
                {course.subject}
              </Badge>
              <Badge variant="neutral" size="md">
                {course.grade}
              </Badge>
              <Badge variant="success" size="md" dot>
                {course.availability}
              </Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono ml-1">Code: {course.code}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {course.subtitle}
            </p>
          </div>
        </Container>
      </section>

      {/* Main 2-Column Content Layout */}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Left Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Course Overview</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {course.description}
              </p>
            </section>

            {/* Learning Outcomes */}
            <section className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">What You Will Master</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {course.outcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 shadow-2xs"
                  >
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Syllabus Overview */}
            <section className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Curriculum Syllabus</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {course.syllabus.length} Academic Terms
                </span>
              </div>

              <div className="space-y-4">
                {course.syllabus.map((term, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{term.term}</h4>
                      <Badge variant="neutral" size="sm">
                        {term.weeks} Weeks Duration
                      </Badge>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {term.topics.map((topic, tIdx) => (
                        <li key={tIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructor Profile */}
            <section className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Course Instructor</h2>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-2xs">
                <img
                  src={course.teacher.avatarUrl}
                  alt={course.teacher.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 dark:border-indigo-900 shrink-0 shadow-sm"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{course.teacher.name}</h4>
                    <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {course.teacher.rating}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">{course.teacher.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Senior curriculum specialist conducting live broadcast lectures and personal doubt review sessions inside the TiT portal.
                  </p>
                </div>
              </div>
            </section>

            {/* Course FAQs */}
            {course.faqs && course.faqs.length > 0 && (
              <section className="space-y-4 pt-6 border-t border-slate-200/80">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Course FAQs</h2>
                <Accordion
                  items={course.faqs.map((faq) => ({
                    title: faq.question,
                    content: <p>{faq.answer}</p>,
                  }))}
                />
              </section>
            )}
          </div>

          {/* Sticky Enrollment Card Right Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
            <Card padding="none" className="overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl">
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white text-xs font-medium">
                  {course.learningFormat} Program
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Tuition Program Details */}
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Program Type</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Internal Academic Batch
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Conducted within our tuition institute with classroom guidance, live Zoom lectures, and comprehensive syllabus notes.
                  </p>
                </div>

                {/* Key metadata points */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Schedule:</strong> {course.schedule}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Duration:</strong> {course.duration}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Location:</strong> Alaveddy Center & Islandwide Online</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>Status:</strong> {course.availability}</span>
                  </div>
                </div>

                {/* Primary Enrollment Action */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => onApply(course)}
                    className="w-full justify-center shadow-md shadow-indigo-500/20"
                  >
                    Admissions Inquiry
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Public Syllabus Information</span>
                </div>
              </div>
            </Card>

            <Button
              variant="outline"
              size="md"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="w-full justify-center"
            >
              Back to Course Catalogue
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};
