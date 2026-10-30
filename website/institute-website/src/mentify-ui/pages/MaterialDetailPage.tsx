import React from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Lock,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import { Language, MaterialItem } from '../types';
import { Container } from '../components/ui/Container';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Breadcrumb } from '../components/ui/FeedbackStates';
import { MaterialCard } from '../components/marketplace/MaterialCard';

export interface MaterialDetailPageProps {
  currentLang: Language;
  material: MaterialItem;
  relatedMaterials: MaterialItem[];
  onBack: () => void;
  onAddToCart: (material: MaterialItem) => void;
  onSelectRelated: (material: MaterialItem) => void;
}

export const MaterialDetailPage: React.FC<MaterialDetailPageProps> = ({
  currentLang,
  material,
  relatedMaterials,
  onBack,
  onAddToCart,
  onSelectRelated,
}) => {
  return (
    <div className="space-y-12 pb-20">
      {/* Breadcrumb & Header */}
      <section className="pt-8 sm:pt-12 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 pb-10 transition-colors">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Home', onClick: onBack },
              { label: 'Marketplace', onClick: onBack },
              { label: material.title, active: true },
            ]}
          />

          <div className="max-w-4xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" size="md">
                {material.category}
              </Badge>
              <Badge variant="primary" size="md">
                {material.subject}
              </Badge>
              <Badge variant={material.free ? 'success' : 'neutral'} size="md">
                {material.free ? 'FREE RESOURCE' : 'VERIFIED PACK'}
              </Badge>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">ID: {material.materialId}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {material.title}
            </h1>
          </div>
        </Container>
      </section>

      {/* Main 2-Column Product Detail Layout */}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Cover & Deep Description */}
          <div className="lg:col-span-8 space-y-8">
            {/* Visual Cover Preview */}
            <div className="rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 max-h-96">
              <img
                src={material.thumbnailUrl}
                alt={material.title}
                className="w-full h-full object-cover max-h-96"
              />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Resource Overview</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {material.description}
              </p>
            </div>

            {/* Specification Metadata Table */}
            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">File & Document Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    File Format
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {material.fileFormat || 'PDF'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Page Count
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {material.pages || 32} Pages
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Download Size
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {material.fileSize || '5.2 MB'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Total Downloads
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {material.downloadCount ? material.downloadCount.toLocaleString() : '1,200+'}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification & Copyright Note */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                <span className="font-bold block">Academic Integrity & Verified Solutions</span>
                <p className="text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
                  Every past paper scheme and model document published on the TiT marketplace is vetted by faculty members to ensure precision and syllabus conformity.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Purchase Information Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
            <Card padding="none" className="overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl">
              <div className="p-6 space-y-5">
                {/* Price Display */}
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Resource Pricing
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    {material.free ? (
                      <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">Free Download</span>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                          {material.currency} {material.finalPrice.toLocaleString()}
                        </span>
                        {material.discountPercent && material.discountPercent > 0 && (
                          <span className="text-base text-slate-400 line-through">
                            {material.currency} {material.price.toLocaleString()}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Author Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Authored By</span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {material.authorName || 'TiT Academic Board'}
                    </h5>
                  </div>
                </div>

                {/* Download / Buy Button */}
                <div className="space-y-2">
                  {material.free ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => alert(`Initiating direct verified download for ${material.title}`)}
                      leftIcon={<Download className="w-4 h-4" />}
                      className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                    >
                      Instant Free Download
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => onAddToCart(material)}
                      leftIcon={<ShoppingBag className="w-4 h-4" />}
                      className="w-full justify-center shadow-md shadow-indigo-500/20"
                    >
                      Add Resource to Cart
                    </Button>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Safe and verified secure checkout</span>
                  </div>
                  <p>Includes immediate digital PDF access and automatic portal archive sync.</p>
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
              Back to Marketplace
            </Button>
          </div>
        </div>

        {/* Related Materials Section */}
        {relatedMaterials.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Related Learning Materials in {material.subject}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedMaterials.slice(0, 3).map((rel) => (
                <MaterialCard
                  key={rel.id}
                  material={rel}
                  onViewDetails={onSelectRelated}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
