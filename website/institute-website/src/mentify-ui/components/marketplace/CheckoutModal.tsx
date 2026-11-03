import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Lock, RefreshCw, ShieldCheck, X } from "lucide-react";
import { CartItem } from "../../types";
import { Button } from "../ui/Button";

type CheckoutStatus = "pending" | "starting" | "ready" | "processing" | "succeeded" | "failed";
type BuyerErrors = Partial<Record<"name" | "email" | "phone", string>>;

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSuccess: () => void;
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => any;
  }
}

async function loadStripeScript() {
  if (window.Stripe) return window.Stripe;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Stripe.js")), {
        once: true,
      });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Stripe.js"));
    document.head.appendChild(script);
  });
  return window.Stripe;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onSuccess,
}) => {
  const [status, setStatus] = useState<CheckoutStatus>("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerErrors, setBuyerErrors] = useState<BuyerErrors>({});
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const paymentElementInstanceRef = useRef<any>(null);
  const paymentElementRef = useRef<HTMLDivElement>(null);
  const [paymentElementVersion, setPaymentElementVersion] = useState(0);
  const item = items[0];
  const subtotal = items.reduce(
    (sum, cartItem) => sum + cartItem.material.finalPrice * cartItem.quantity,
    0,
  );
  const currency = item?.material.currency || "LKR";

  useEffect(() => {
    if (!isOpen || !elementsRef.current || !paymentElementRef.current) return;
    setIsPaymentElementReady(false);
    const element = elementsRef.current?.create("payment");
    paymentElementInstanceRef.current = element;
    element?.on("ready", () => setIsPaymentElementReady(true));
    element?.on("loaderror", (event: any) => {
      setIsPaymentElementReady(false);
      setErrorMessage(
        event?.error?.message ||
          "Stripe could not load the payment form. Check the publishable key and payment configuration.",
      );
      setStatus("failed");
    });
    element?.mount(paymentElementRef.current);
    return () => {
      try {
        setIsPaymentElementReady(false);
        element?.off?.("loaderror");
        element?.off?.("ready");
        element?.unmount();
      } catch {
        // Stripe may destroy the Element itself after a load error.
      }
      if (paymentElementInstanceRef.current === element) {
        paymentElementInstanceRef.current = null;
      }
    };
  }, [isOpen, paymentElementVersion]);

  if (!isOpen) return null;

  const validateBuyer = () => {
    const errors: BuyerErrors = {};
    if (buyerName.trim().length < 2) errors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())) {
      errors.email = "Enter a valid email address.";
    }
    const phoneDigits = buyerPhone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      errors.phone = "Enter a valid phone number.";
    }
    setBuyerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startPayment = async () => {
    if (!item || items.length !== 1) {
      setErrorMessage("Please purchase one marketplace item at a time.");
      setStatus("failed");
      return;
    }
    if (!validateBuyer()) return;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      setErrorMessage("Stripe checkout is not configured. Please contact support.");
      setStatus("failed");
      return;
    }
    setStatus("starting");
    setErrorMessage("");
    try {
      const response = await fetch("/api/payments/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.material.id,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.data?.clientSecret)
        throw new Error(payload?.message || "Unable to start the payment.");
      setPaymentId(payload.data.paymentId || null);
      const stripeFactory = await loadStripeScript();
      stripeRef.current = stripeFactory?.(publishableKey);
      if (!stripeRef.current) throw new Error("Unable to initialize Stripe checkout.");
      elementsRef.current = stripeRef.current.elements({
        clientSecret: payload.data.clientSecret,
        appearance: {
          theme: document.documentElement.classList.contains("dark") ? "night" : "stripe",
        },
      });
      setPaymentElementVersion((version) => version + 1);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to start the payment.");
      setStatus("failed");
    }
  };

  const confirmPayment = async () => {
    if (!stripeRef.current || !elementsRef.current || !isPaymentElementReady) return;
    setStatus("processing");
    try {
      const submitResult = await elementsRef.current.submit();
      if (submitResult?.error) {
        setErrorMessage(submitResult.error.message || "Please complete the payment details.");
        setStatus("ready");
        return;
      }
      const result = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        redirect: "if_required",
      });
      if (result.error) {
        setErrorMessage(result.error.message || "Your payment was declined. Please try again.");
        setStatus("failed");
        return;
      }
      if (result.paymentIntent?.status === "succeeded") {
        if (paymentId) {
          const syncResponse = await fetch(`/api/payments/marketplace/${paymentId}/sync`, {
            method: "POST",
          });
          const syncPayload = await syncResponse.json().catch(() => ({}));
          if (!syncResponse.ok || syncPayload?.data?.status !== "SUCCESS") {
            throw new Error(
              "Payment succeeded, but confirmation is still processing. Please check again shortly.",
            );
          }
        }
        setStatus("succeeded");
        onSuccess();
      } else {
        setErrorMessage(
          "Payment authorization is still pending. Please check your payment history before retrying.",
        );
        setStatus("failed");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to confirm the payment.");
      setStatus("failed");
    }
  };

  const reset = () => {
    try {
      paymentElementInstanceRef.current?.off?.("loaderror");
      paymentElementInstanceRef.current?.off?.("ready");
      paymentElementInstanceRef.current?.unmount();
    } catch {
      // Stripe may already have destroyed the Element.
    }
    paymentElementInstanceRef.current = null;
    elementsRef.current = null;
    stripeRef.current = null;
    setPaymentId(null);
    setIsPaymentElementReady(false);
    setErrorMessage("");
    setStatus("pending");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 my-auto flex max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-xl flex-col overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-h-[calc(100dvh-3rem)] sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close checkout"
        >
          <X className="h-5 w-5" />
        </button>
        {status !== "succeeded" && status !== "failed" && (
          <>
            <div className="mb-5 flex items-start gap-3 pr-8 sm:mb-6 sm:items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 sm:h-10 sm:w-10">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white sm:text-xl">
                  Secure Stripe checkout
                </h3>
                <p className="text-xs text-slate-500">Your card details are handled by Stripe.</p>
              </div>
            </div>
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/60 sm:mb-5 sm:p-4">
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 break-words font-semibold text-slate-800 dark:text-slate-200">
                  {item?.material.title || "Marketplace item"}
                </span>
                <span className="shrink-0 text-right font-bold text-indigo-600">
                  {currency} {subtotal.toLocaleString()}
                </span>
              </div>
            </div>
            {(status === "ready" || status === "processing") && (
              <div
                ref={paymentElementRef}
                className="mb-4 min-h-28 w-full overflow-hidden sm:mb-5"
              />
            )}
            {status === "pending" && (
              <div className="mb-4 space-y-3 sm:mb-5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Enter your contact details to receive your payment confirmation and digital access
                  information.
                </p>
                <input
                  value={buyerName}
                  onChange={(event) => {
                    setBuyerName(event.target.value);
                    setBuyerErrors((current) => ({ ...current, name: undefined }));
                  }}
                  onBlur={validateBuyer}
                  placeholder="Full name"
                  autoComplete="name"
                  aria-invalid={Boolean(buyerErrors.name)}
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${buyerErrors.name ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700"}`}
                />
                {buyerErrors.name && <p className="text-xs text-rose-600">{buyerErrors.name}</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="min-w-0">
                    <input
                      value={buyerEmail}
                      onChange={(event) => {
                        setBuyerEmail(event.target.value);
                        setBuyerErrors((current) => ({ ...current, email: undefined }));
                      }}
                      onBlur={validateBuyer}
                      placeholder="Email address"
                      type="email"
                      autoComplete="email"
                      aria-invalid={Boolean(buyerErrors.email)}
                      className={`w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${buyerErrors.email ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700"}`}
                    />
                    {buyerErrors.email && (
                      <p className="mt-1 text-xs text-rose-600">{buyerErrors.email}</p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <input
                      value={buyerPhone}
                      onChange={(event) => {
                        setBuyerPhone(event.target.value);
                        setBuyerErrors((current) => ({ ...current, phone: undefined }));
                      }}
                      onBlur={validateBuyer}
                      placeholder="Phone number"
                      type="tel"
                      autoComplete="tel"
                      aria-invalid={Boolean(buyerErrors.phone)}
                      className={`w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${buyerErrors.phone ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700"}`}
                    />
                    {buyerErrors.phone && (
                      <p className="mt-1 text-xs text-rose-600">{buyerErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 sm:mb-5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Payment confirmation and access are controlled by the backend webhook. Saving
                checkout details never marks an order as paid.
              </span>
            </div>
            {status === "ready" ? (
              <Button
                variant="primary"
                size="lg"
                onClick={confirmPayment}
                disabled={!isPaymentElementReady}
                className="w-full justify-center"
              >
                {isPaymentElementReady
                  ? `Pay ${currency} ${subtotal.toLocaleString()}`
                  : "Loading secure payment form…"}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                isLoading={status === "starting"}
                onClick={startPayment}
                className="w-full justify-center"
              >
                Continue to secure payment
              </Button>
            )}
          </>
        )}
        {status === "succeeded" && (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment confirmed</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your payment was confirmed by Stripe. A receipt with your purchase details will be
              sent to {buyerEmail}. Your digital material will be available shortly.
            </p>
            <Button variant="primary" size="md" onClick={onClose} className="w-full justify-center">
              Done
            </Button>
          </div>
        )}
        {status === "failed" && (
          <div className="space-y-4 py-4 text-center">
            <AlertCircle className="mx-auto h-14 w-14 text-rose-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Payment could not be completed
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {errorMessage ||
                "No charge was confirmed. Please check your payment details and try again."}
            </p>
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                className="w-full justify-center sm:w-1/2"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={reset}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                className="w-full justify-center sm:w-1/2"
              >
                Try again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
