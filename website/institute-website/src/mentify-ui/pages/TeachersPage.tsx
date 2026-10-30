import React, { useState, useMemo } from 'react';
import { Award, BookOpen, GraduationCap, Search, ShieldCheck } from 'lucide-react';
import { Language, TeacherProfile } from '../types';
import { MOCK_TEACHERS } from '../data/mockData';
import { SITE_CONFIG } from '../lib/config/site';
import { getTranslation } from '../lib/translations';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Input, Select } from '../components/ui/FormControls';
import { Badge } from '../components/ui/Badge';
import { TeacherCard } from '../components/shared/TeacherCard';
import { EmptyState } from '../components/ui/FeedbackStates';

export interface TeachersPageProps {
  currentLang: Language;
  onNavigate: (path: string) => void;
}

export const TeachersPage: React.FC<TeachersPageProps> = ({ currentLang, onNavigate }) => {
  const t = (key: string) => getTranslation(currentLang, key);

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const filteredTeachers = useMemo(() => {
    return MOCK_TEACHERS.filter((teacher) => {
      const matchesSearch =
        search === '' ||
        teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        teacher.bio.toLowerCase().includes(search.toLowerCase()) ||
        teacher.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchesSubject =
        subjectFilter === 'all' ||
        teacher.subjects.some((s) => s.toLowerCase() === subjectFilter.toLowerCase());

      return matchesSearch && matchesSubject;
    });
  }, [search, subjectFilter]);

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <section className="pt-12 sm:pt-16 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 pb-12 transition-colors">
        <Container size="md" className="text-center">
          <Badge variant="primary" size="md" className="mb-3">
            Academic Faculty
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Distinguished Faculty & Educators
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Learn from master lecturers, national paper setters, and industry engineers dedicated to student achievement.
          </p>
        </Container>
      </section>

      <Container>
        {/* Search & Subject Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs mb-8 transition-colors">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-7 lg:col-span-8">
              <Input
                placeholder="Search teachers by name, subject, or academic background..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-2"
              />
            </div>
            <div className="sm:col-span-5 lg:col-span-4">
              <Select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Subject Specializations' },
                  ...SITE_CONFIG.subjects.map((s) => ({ value: s, label: s })),
                ]}
              />
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No faculty profiles found"
            description="No educators matched your search terms. Try clearing filters or searching for another subject."
            actionText="Reset Filter"
            onAction={() => {
              setSearch('');
              setSubjectFilter('all');
            }}
          />
        )}
      </Container>
    </div>
  );
};
