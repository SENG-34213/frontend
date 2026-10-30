import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Lock,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import { CartItem, OrderPaymentStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onSuccess,
}) => {
  const [status, setStatus] = useState<OrderPaymentStatus>('pending');
  const [studentEmail, setStudentEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.material.finalPrice * item.quantity, 0);
  const currency = items[0]?.material.currency || 'LKR';
  const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleSimulatePayment = (outcome: 'success' | 'failure') => {
    setIsProcessing(true);
    setStatus('processing');

    setTimeout(() => {
      setIsProcessing(false);
      if (outcome === 'success') {
        setStatus('succeeded');
        onSuccess();
      } else {
        setStatus('failed');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status: PENDING / FORM */}
        {(status === 'pending' || status === 'processing') && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Secure Order Checkout</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Order ID: {orderId} • Encrypted Session</p>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="mb-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 max-h-48 overflow-y-auto space-y-2.5">
              {items.map((item) => (
                <div key={item.material.id} className="flex items-center justify-between text-xs">
                  <div className="flex-1 pr-3 truncate">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {item.material.title}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {item.material.category} • {item.material.subject}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">
                    {item.material.currency} {item.material.finalPrice.toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Total Amount Due:</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {currency} {subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Account binding input */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Recipient TiT / Student Email
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl border border-slate-300 dark:border-slate-700 text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Digital download entitlements and invoices are linked to this email address.
                </p>
              </div>

              {/* Safe Payment Notice */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <Shield className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Safe & Instant Access</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                  Your payment is processed through a safe, encrypted checkout. Once confirmed, digital downloads and study notes are unlocked immediately in your account.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5">
              <Button
                variant="primary"
                size="lg"
                isLoading={isProcessing}
                onClick={() => handleSimulatePayment('success')}
                className="w-full justify-center shadow-md shadow-indigo-500/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed with Gateway Payment ({currency} {subtotal.toLocaleString()})
              </Button>

              <button
                type="button"
                onClick={() => handleSimulatePayment('failure')}
                className="w-full text-center text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors py-1 cursor-pointer"
              >
                Simulate Gateway Declined Scenario (Verification Test)
              </button>
            </div>
          </div>
        )}

        {/* Status: SUCCEEDED */}
        {status === 'succeeded' && (
          <div className="text-center py-4 space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-100 dark:border-emerald-800/60">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Confirmed!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reference: {orderId}</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
              Your payment has been recorded. Entitlements have been provisioned to your TiT account. A receipt has been dispatched to {studentEmail || 'your registered email'}.
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Provisioned Downloads:</span>
              {items.map((it) => (
                <div key={it.material.id} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="truncate pr-2">{it.material.title}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    Ready
                  </span>
                </div>
              ))}
            </div>

            <Button variant="primary" size="md" onClick={onClose} className="w-full justify-center">
              Done & Return to Catalogue
            </Button>
          </div>
        )}

        {/* Status: FAILED */}
        {status === 'failed' && (
          <div className="text-center py-4 space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border-4 border-rose-100 dark:border-rose-900/60">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Unsuccessful</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Transaction Ref: {orderId}</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
              The payment gateway was unable to authorize this transaction. No charges were made to your account.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                className="w-1/2 justify-center"
              >
                Cancel Order
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStatus('pending')}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="w-1/2 justify-center"
              >
                Retry Payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
