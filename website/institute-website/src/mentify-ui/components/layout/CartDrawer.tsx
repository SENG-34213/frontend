import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Info,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { CartItem, MaterialItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.material.finalPrice * item.quantity, 0);
  const currency = items[0]?.material.currency || 'LKR';

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Cart</h3>
              <Badge variant="primary" size="sm">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Your cart is empty</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Browse our Educational Marketplace to acquire past papers, model answers, and revision guides.
                </p>
                <Button variant="outline" size="sm" onClick={onClose} className="mt-5">
                  Browse Materials
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span>Selected Resources</span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.material.id}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <img
                        src={item.material.thumbnailUrl}
                        alt={item.material.title}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {item.material.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.material.subject} • {item.material.category}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                            {item.material.free
                              ? 'FREE'
                              : `${item.material.currency} ${item.material.finalPrice.toLocaleString()}`}
                          </span>
                          <button
                            onClick={() => onRemoveItem(item.material.id)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Commerce Notice Requirement */}
                <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span>Secure Verified Learning Materials</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    Downloads are saved directly to your student account with lifetime access upon payment confirmation.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {currency} {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Platform Fee & Tax</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Included</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Estimated Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {currency} {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={onProceedCheckout}
                className="w-full justify-center shadow-md shadow-indigo-500/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Checkout
              </Button>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                256-bit Encrypted Secure Checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
