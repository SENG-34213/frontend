import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Language, MaterialCategory, MaterialItem } from '../types';
import { api, MarketplaceQueryParams } from '../lib/api/client';
import { SITE_CONFIG } from '../lib/config/site';
import { getTranslation } from '../lib/translations';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Input, Select } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/FeedbackStates';
import { MaterialCard } from '../components/marketplace/MaterialCard';
import { Drawer } from '../components/ui/Modal';

export interface MarketplacePageProps {
  currentLang: Language;
  onSelectMaterial: (material: MaterialItem) => void;
  onAddToCart: (material: MaterialItem) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  currentLang,
  onSelectMaterial,
  onAddToCart,
}) => {
  const t = (key: string) => getTranslation(currentLang, key);

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const categories: MaterialCategory[] = [
    'Model Papers',
    'Revision Packs',
    'Study Guides',
    'Question Banks',
    'Exam Papers',
    'Tutorials',
    'Notes',
    'Short Notes',
    'Worksheets',
    'Marking Schemes',
  ];

  const fetchMaterials = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const params: MarketplaceQueryParams = {
        search: search.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
        gradeId: selectedGrade !== 'all' ? selectedGrade : undefined,
        isFree: pricingFilter === 'all' ? undefined : pricingFilter === 'free',
        page,
        limit: 9,
      };

      const res = await api.getMarketplaceMaterials(params);
      if (res.success) {
        setMaterials(res.data);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalCount(res.meta?.total || res.data.length);
      } else {
        setIsError(true);
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [search, selectedCategory, selectedSubject, selectedGrade, pricingFilter, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSubject('all');
    setSelectedGrade('all');
    setPricingFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'all' ||
    selectedSubject !== 'all' ||
    selectedGrade !== 'all' ||
    pricingFilter !== 'all';

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="pt-12 sm:pt-16 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 pb-12 transition-colors">
        <Container size="md" className="text-center">
          <Badge variant="accent" size="md" className="mb-3">
            Digital Resource Hub
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('market.title')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            {t('market.subtitle')}
          </p>
        </Container>
      </section>

      <Container>
        {/* Category Pills Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Resources
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar: Search, Filters, Reset */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs mb-8 transition-colors">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <div className="sm:col-span-5 lg:col-span-4">
              <Input
                placeholder={t('market.search.placeholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-2"
              />
            </div>

            {/* Desktop Subject & Grade Dropdowns */}
            <div className="hidden lg:grid lg:col-span-5 grid-cols-2 gap-3">
              <Select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Subjects' },
                  ...SITE_CONFIG.subjects.map((s) => ({ value: s, label: s })),
                ]}
              />
              <Select
                value={pricingFilter}
                onChange={(e) => {
                  setPricingFilter(e.target.value as any);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Pricing (Free & Paid)' },
                  { value: 'free', label: 'Free Downloads Only' },
                  { value: 'paid', label: 'Premium Materials' },
                ]}
              />
            </div>

            {/* Actions */}
            <div className="sm:col-span-7 lg:col-span-3 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setMobileDrawerOpen(true)}
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                className="lg:hidden w-full sm:w-auto"
              >
                Filters {hasActiveFilters && '•'}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>
            Displaying <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong> verified educational materials
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Verification:</span>
            <Badge variant="success" size="sm" dot>
              Faculty Approved
            </Badge>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to Load Materials"
            message="Could not connect to the TiT marketplace gateway. Please try reloading."
            onRetry={fetchMaterials}
          />
        ) : materials.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {materials.map((mat) => (
                <MaterialCard
                  key={mat.id}
                  material={mat}
                  onViewDetails={onSelectMaterial}
                  onAddToCart={onAddToCart}
                  onQuickDownload={(item) => {
                    alert(`Starting download for ${item.title} (${item.fileFormat || 'PDF'})`);
                  }}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No materials found"
            description="No educational materials matched your specified subject, category, or search filters."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        )}
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Filter Marketplace Materials"
      >
        <div className="space-y-5">
          <Select
            label="Category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
          />

          <Select
            label="Subject"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Subjects' },
              ...SITE_CONFIG.subjects.map((s) => ({ value: s, label: s })),
            ]}
          />

          <Select
            label="Grade / Level"
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Grades' },
              ...SITE_CONFIG.grades.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />

          <Select
            label="Pricing"
            value={pricingFilter}
            onChange={(e) => {
              setPricingFilter(e.target.value as any);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Pricing (Free & Paid)' },
              { value: 'free', label: 'Free Only' },
              { value: 'paid', label: 'Paid Only' },
            ]}
          />

          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleResetFilters}
              className="w-1/2 justify-center"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setMobileDrawerOpen(false)}
              className="w-1/2 justify-center"
            >
              Apply
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
