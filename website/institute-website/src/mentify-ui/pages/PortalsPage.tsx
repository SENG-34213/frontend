import React from "react";
import {
  ArrowUpRight,
  GraduationCap,
  Lock,
  School,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { Language } from "../types";
import { SITE_CONFIG } from "../lib/config/site";
import { getTranslation } from "../lib/translations";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export interface PortalsPageProps {
  currentLang: Language;
}

export const PortalsPage: React.FC<PortalsPageProps> = ({ currentLang }) => {
  const t = (key: string) => getTranslation(currentLang, key);

  const portals = [
    {
      id: "student",
      title: t("portals.student.title"),
      role: "Student & Candidate Access",
      badge: "Active",
      badgeVariant: "primary" as const,
      icon: <GraduationCap className="w-8 h-8 text-indigo-600" />,
      desc: t("portals.student.desc"),
      url: SITE_CONFIG.portals.student,
      features: [
        "Live lecture video links & archives",
        "Homework assignments & marksheets",
        "Step-by-step past paper explanations",
        "Digital library and class downloads",
      ],
      btnVariant: "primary" as const,
    },
    {
      id: "teacher",
      title: t("portals.teacher.title"),
      role: "Faculty & Educator Access",
      badge: "Faculty Portal",
      badgeVariant: "secondary" as const,
      icon: <Users className="w-8 h-8 text-blue-600" />,
      desc: t("portals.teacher.desc"),
      url: SITE_CONFIG.portals.teacher,
      features: [
        "Classroom stream management & attendance",
        "Assignment evaluation & grading rubrics",
        "Marketplace digital material publishing",
        "Student test marksheets and progress reports",
      ],
      btnVariant: "secondary" as const,
    },
    {
      id: "admin",
      title: t("portals.admin.title"),
      role: "Institutional Administration",
      badge: "Protected Access",
      badgeVariant: "neutral" as const,
      icon: <School className="w-8 h-8 text-slate-800" />,
      desc: t("portals.admin.desc"),
      url: SITE_CONFIG.portals.admin,
      features: [
        "Class & subject timetable planning",
        "Teacher allocations and room management",
        "Tuition fee payment records",
        "Staff accounts & access protection",
      ],
      btnVariant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="pt-12 sm:pt-16 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 pb-12 transition-colors">
        <Container size="md" className="text-center">
          <img
            src="/TiTJaffna-logo.jpeg"
            alt="TiT Jaffna Publication"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full object-contain bg-white shadow-md ring-2 ring-indigo-500/20 mb-4"
          />
          <Badge variant="primary" size="md" className="mb-3">
            Institutional Gateway
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("portals.title")}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            {t("portals.subtitle")}
          </p>
        </Container>
      </section>

      <Container>
        {/* Three Portal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {portals.map((portal) => (
            <Card
              key={portal.id}
              hoverEffect
              padding="lg"
              className="flex flex-col justify-between border-slate-200 dark:border-slate-800 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {portal.icon}
                  </div>
                  <Badge variant={portal.badgeVariant} size="sm">
                    {portal.badge}
                  </Badge>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  {portal.role}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{portal.title}</h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {portal.desc}
                </p>

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-3">
                    Portal Capabilities:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {portal.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-block"
                >
                  <Button
                    variant={portal.btnVariant}
                    size="lg"
                    className="w-full justify-center shadow-xs"
                    rightIcon={<ArrowUpRight className="w-4 h-4" />}
                  >
                    Launch {portal.title}
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>

        {/* Security & Authentication Notice */}
        <div className="mt-12 p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 max-w-3xl mx-auto flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
            <h4 className="font-bold text-sm text-indigo-950 dark:text-white">
              Protected Access for Students, Teachers & Parents
            </h4>
            <p className="text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
              TiT portals provide safe, personalized access for every user. Students, teachers, and
              school administrators are automatically directed to their dedicated dashboard with
              private and encrypted login protection.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};
