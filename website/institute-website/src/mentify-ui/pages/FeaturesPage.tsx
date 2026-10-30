import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  Bot,
  Calendar,
  FileCheck,
  GraduationCap,
  HelpCircle,
  Layers,
  LineChart,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
  Video,
  ArrowRight,
  Maximize2,
  Check,
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  FourCoreFeaturesShowcase,
  CORE_FEATURES_DATA,
  CoreFeatureId,
} from '../components/features/FourCoreFeaturesShowcase';

export interface FeaturesPageProps {
  onNavigate: (path: string) => void;
  onOpenAdmissions: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate, onOpenAdmissions }) => {
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{
    src: string;
    title: string;
    subtitle: string;
  } | null>(null);

  const coreFeatures = [
    {
      icon: <Bot className="w-6 h-6 text-indigo-600" />,
      title: 'TiT AI Assistant',
      category: 'School Management',
      desc: 'Easy-to-use assistant for school principals and teachers to quickly check student numbers and class updates.',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: 'Class Discussions & Messaging',
      category: 'Communication',
      desc: 'Class groups for every subject and grade, where students can ask homework questions and get help from teachers.',
    },
    {
      icon: <Calendar className="w-6 h-6 text-amber-600" />,
      title: 'Academic Class Timetable',
      category: 'Timetable',
      desc: 'Live class timetables, homework due dates, and exam dates neatly organized in Month, Week, and Day views.',
    },
    {
      icon: <FileCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Practice Tests & Quizzes',
      category: 'Practice Tests',
      desc: 'Practice tests with a live timer, question checklist, bookmark button, and instant marks with step-by-step answers.',
    },
    {
      icon: <LineChart className="w-6 h-6 text-purple-600" />,
      title: 'Progress & Report Cards',
      category: 'Report Cards',
      desc: 'View term test results, subject progress reports, attendance records, and personal improvement feedback.',
    },
    {
      icon: <Video className="w-6 h-6 text-rose-600" />,
      title: 'Live Online Classrooms',
      category: 'Live Classes',
      desc: 'Live Zoom tuition classes with interactive teacher chat, digital whiteboard lessons, and replay recordings.',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
      title: 'Past Papers & Study Notes',
      category: 'Study Materials',
      desc: 'Download term test papers, provincial exam papers, and revision notes prepared by experienced teachers.',
    },
    {
      icon: <Shield className="w-6 h-6 text-slate-700" />,
      title: 'Student Safety & Privacy',
      category: 'Privacy',
      desc: 'Protected accounts keeping student details, test marks, and attendance records strictly private.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pt-8 sm:pt-12 pb-20">
      {/* Platform Features Showcase */}

      {/* 2. THE PLATFORM FEATURES SHOWCASE (PRIMARY SECTION WITH USER SCREENSHOTS) */}
      <section id="platform-features" className="scroll-mt-20">
        <Container>
          <FourCoreFeaturesShowcase
            initialFeature="ai"
            onExploreMore={() => {
              const el = document.getElementById('deep-dive-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenAdmissions={onOpenAdmissions}
            title="Core Platform Features"
            subtitle="Authentic views inside the TiT platform: Admin AI Assistant, Student & Faculty Communication, Academic Calendar, and Timed Live Assessments."
            badgeText="Flagship Interfaces"
          />
        </Container>
      </section>

      {/* 3. FEATURES DEEP-DIVE CARDS WITH EMBEDDED SCREENSHOT PREVIEWS */}
      <section id="deep-dive-grid" className="bg-slate-50/70 dark:bg-slate-950/60 py-16 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <Container>
          <SectionHeading
            badge="Features Overview"
            title="Explore Our Core Learning Features"
            subtitle="Click on any screenshot below to view the interface in full screen."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {CORE_FEATURES_DATA.map((feat) => (
              <div
                key={feat.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Top preview frame */}
                <div
                  className="relative group bg-slate-950 cursor-pointer overflow-hidden aspect-[16/10] border-b border-slate-100 dark:border-slate-800"
                  onClick={() =>
                    setSelectedLightboxImage({
                      src: feat.imageSrc,
                      title: feat.title,
                      subtitle: feat.headline,
                    })
                  }
                >
                  <img
                    src={feat.imageSrc}
                    alt={feat.altText}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Expand Screenshot</span>
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-white border border-white/10">
                    {feat.portalBadge}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {feat.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {feat.userRole}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {feat.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {feat.hotspots.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-slate-800 dark:text-slate-200">{item.title}:</strong>{' '}
                          <span>{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      onClick={() =>
                        setSelectedLightboxImage({
                          src: feat.imageSrc,
                          title: feat.title,
                          subtitle: feat.headline,
                        })
                      }
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Screenshot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex gap-1">
                      {feat.specs.slice(0, 2).map((spec, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium"
                        >
                          {spec.label}: {spec.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>



      {/* 5. Grid of All Educational Capabilities */}
      <section>
        <Container>
          <SectionHeading
            align="center"
            badge="Full Curriculum Support"
            title="Built to Help Students Excel in School and National Exams"
            subtitle="Designed to support students from Grade 1 through Grade 13 with verified teaching, past papers, and personal guidance."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {coreFeatures.map((feat, idx) => (
              <Card key={idx} hoverEffect padding="md" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center">
                      {feat.icon}
                    </div>
                    <Badge variant="neutral" size="sm">
                      {feat.category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>


      {/* 7. CTA */}
      <section>
        <Container size="md" className="text-center">
          <Card padding="lg" className="border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Experience the TiT Difference</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              Join upcoming term batches or access our open marketplace materials today.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="primary" size="lg" onClick={onOpenAdmissions}>
                Apply for Next Intake
              </Button>
              <Button variant="outline" size="lg" onClick={() => onNavigate('marketplace')}>
                Explore Marketplace
              </Button>
            </div>
          </Card>
        </Container>
      </section>

      {/* Lightbox Modal */}
      {selectedLightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <div
            className="relative max-w-6xl w-full bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="font-bold text-base leading-tight">
                  {selectedLightboxImage.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedLightboxImage.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedLightboxImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto p-4 flex items-center justify-center bg-slate-950">
              <img
                src={selectedLightboxImage.src}
                alt={selectedLightboxImage.title}
                className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
