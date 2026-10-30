import React from 'react';
import { Download, FileText, ShoppingBag, Star, User } from 'lucide-react';
import { MaterialItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface MaterialCardProps {
  material: MaterialItem;
  onViewDetails: (material: MaterialItem) => void;
  onAddToCart?: (material: MaterialItem) => void;
  onQuickDownload?: (material: MaterialItem) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onViewDetails,
  onAddToCart,
  onQuickDownload,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-xl dark:hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden group">
      {/* Cover / Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={material.thumbnailUrl}
          alt={material.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="accent" size="sm" className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs font-semibold">
            {material.category}
          </Badge>
          {material.free ? (
            <Badge variant="success" size="sm" className="bg-emerald-500 text-white font-bold border-none">
              FREE
            </Badge>
          ) : (
            material.discountPercent && material.discountPercent > 0 && (
              <Badge variant="error" size="sm" className="bg-rose-500 text-white font-bold border-none">
                -{material.discountPercent}%
              </Badge>
            )
          )}
        </div>
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
          <span className="bg-slate-900/70 px-2 py-0.5 rounded backdrop-blur-xs">
            {material.subject}
          </span>
          {material.pages && (
            <span className="bg-slate-900/70 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
              <FileText className="w-3 h-3 text-cyan-300" />
              {material.pages} pgs
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {material.title}
          </h4>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {material.description}
          </p>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1 truncate max-w-[160px]">
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{material.authorName || 'TiT Academic Board'}</span>
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{material.rating || 4.9}</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            {material.free ? (
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">Free Download</span>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {material.currency} {material.finalPrice.toLocaleString()}
                  </span>
                  {material.discountPercent && material.discountPercent > 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                      {material.currency} {material.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(material)}
              className="text-xs px-2.5 py-1.5 h-8"
            >
              Details
            </Button>
            {material.free ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onQuickDownload?.(material)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="text-xs px-2.5 py-1.5 h-8 bg-emerald-600 hover:bg-emerald-700"
              >
                Download
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAddToCart?.(material)}
                leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                className="text-xs px-2.5 py-1.5 h-8"
              >
                Get
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
