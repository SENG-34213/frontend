import React from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TeacherCard } from '../components/shared/TeacherCard';
import { MOCK_TEACHERS } from '../data/mockData';
import { SITE_CONFIG } from '../lib/config/site';

export interface AboutPageProps {
  onNavigate: (path: string) => void;
  onOpenAdmissions: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenAdmissions }) => {
  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* Hero Header */}
      <section className="pt-12 sm:pt-16 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 pb-16 transition-colors">
        <Container size="md" className="text-center">
          <img
            src="/TiTJaffna-logo.jpeg"
            alt="TiT Jaffna Publication"
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full object-contain bg-white shadow-lg ring-4 ring-indigo-500/20 mb-6"
          />
          <Badge variant="primary" size="md" className="mb-4">
            About TiT Education
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Advancing Academic Excellence Through Intelligent Learning Technology
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            TiT connects students with distinguished educators, validated past paper resources, and
            structured curriculum pathways across Sri Lanka and international examination boards.
          </p>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card padding="lg" className="border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-900 dark:to-indigo-950/30">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                To democratize access to exceptional educators and rigorous academic resources, providing
                every student with the personalized tools, clear derivations, and continuous evaluations
                needed to excel in national and international examinations.
              </p>
            </Card>

            <Card padding="lg" className="border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-white to-blue-50/20 dark:from-slate-900 dark:to-blue-950/30">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Vision</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                To be the benchmark educational SaaS ecosystem that bridges physical classrooms and digital
                learning, empowering educators to teach with clarity and students to master complex concepts with confidence.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Educational Philosophy & Partnership */}
      <section>
        <Container>
          <div className="mb-12">
            <SectionHeading
              align="center"
              badge="Academic Heritage"
              title="TiT Online Education"
              subtitle="Rooted in Alaveddy, Jaffna, empowering students across Sri Lanka from Grade 1 to Grade 13."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                TiT was founded in Alaveddy, Jaffna, with a vision to provide every student across the island
                with direct access to premier educators. Through live Zoom classes, 500+ on-demand video archives,
                comprehensive past papers, and our official online Exam Results Portal, TiT delivers quality
                education in Tamil and English mediums from Primary to Advanced Level.
              </p>
              <div className="pt-2 space-y-3">
                {[
                  'Headquartered in Alaveddy, Jaffna, serving all 25 administrative districts',
                  'Comprehensive syllabus coverage from Grade 1 through Grade 13 (Scholarship, O/L, A/L)',
                  'Live Zoom lectures + 24/7 video replays + downloadable PDF study packs',
                  'Instant Exam Results Portal and Term Report Card verification',
                ].map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <Card padding="lg" className="bg-slate-900 text-white border-slate-800">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">Three Core Pillars</h4>
                      <p className="text-xs text-slate-400">Guiding our teaching and learning standards</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-xl bg-slate-800/80 border border-white/5">
                      <span className="text-xs font-bold text-indigo-400 block mb-1">01. Conceptual Rigor</span>
                      <p className="text-xs text-slate-300">
                        Never memorizing without comprehension. Derivations are broken down from foundational physical and mathematical theorems.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/80 border border-white/5">
                      <span className="text-xs font-bold text-cyan-400 block mb-1">02. Timed Assessment Precision</span>
                      <p className="text-xs text-slate-300">
                        Regular paper simulations cultivate examination pacing, rapid formula recall, and error-free working steps.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/80 border border-white/5">
                      <span className="text-xs font-bold text-emerald-400 block mb-1">03. Responsive Support</span>
                      <p className="text-xs text-slate-300">
                        No student is left behind with unanswered questions. AI assistance combined with human teacher office hours ensures complete clarity.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Verified Faculty Leadership */}
      <section className="bg-slate-50 dark:bg-slate-950/50 py-16 sm:py-20 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <Container>
          <SectionHeading
            badge="Verified Faculty"
            title="Academic Leadership & Department Heads"
            subtitle="Meet the experienced educators who curate syllabi and lead academic development across TiT."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {MOCK_TEACHERS.slice(0, 2).map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('teachers')}
            >
              View Full Faculty Directory
            </Button>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section>
        <Container size="md" className="text-center">
          <Card padding="lg" className="border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to Experience TiT?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              Join hundreds of motivated students already preparing with our structured courses and verified materials.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="primary" size="lg" onClick={onOpenAdmissions}>
                Enroll in Upcoming Batch
              </Button>
              <Button variant="outline" size="lg" onClick={() => onNavigate('contact')}>
                Contact Tuition Center
              </Button>
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
};
