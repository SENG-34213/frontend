import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  AdminPayment,
  PaymentAnalyticsOverview,
  PaymentStatus,
  getAdminPaymentOverview,
  getAdminPayments,
  syncMarketplacePayment,
} from "../api/paymentsApi";

const money = (payment: AdminPayment) =>
  `${payment.currency} ${Number(payment.amount || 0).toLocaleString()}`;
const date = (value?: string | null) => (value ? new Date(value).toLocaleString() : "—");

export const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [overview, setOverview] = useState<PaymentAnalyticsOverview | null>(null);
  const [status, setStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const initialPage = await getAdminPayments(status === "ALL" ? undefined : status);
      const pendingMarketplacePayments = (initialPage.content || []).filter(
        (payment) => payment.status === "PENDING" && payment.paymentType === "MARKETPLACE",
      );

      if (pendingMarketplacePayments.length > 0) {
        await Promise.allSettled(
          pendingMarketplacePayments.map((payment) => syncMarketplacePayment(payment.paymentId)),
        );
      }

      const [pageResult, overviewResult] = await Promise.allSettled([
        pendingMarketplacePayments.length > 0
          ? getAdminPayments(status === "ALL" ? undefined : status)
          : Promise.resolve(initialPage),
        getAdminPaymentOverview(),
      ]);

      if (pageResult.status === "rejected") throw pageResult.reason;
      const page = pageResult.value;
      setPayments(page.content || []);
      setTotalRecords(page.totalElements || page.content?.length || 0);

      setOverview(overviewResult.status === "fulfilled" ? overviewResult.value : null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load payment records.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(), 15_000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return payments;
    return payments.filter((payment) =>
      [payment.buyerName, payment.buyerEmail, payment.productName, payment.stripePaymentIntentId]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value)),
    );
  }, [payments, query]);

  const successful =
    overview?.successfulPayments ??
    payments.filter((payment) => payment.status === "SUCCESS").length;
  const pending = payments.filter((payment) => payment.status === "PENDING").length;
  const revenueCurrency = payments.find((payment) => payment.currency)?.currency || "LKR";

  return (
    <div>
      <PageHeader
        title="Payments & Purchases"
        description="Track Stripe transactions, marketplace buyers, payment status, and customer contact details."
        actions={
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total records", totalRecords, "text-slate-900 dark:text-white"],
          ["Successful", successful, "text-emerald-600 dark:text-emerald-400"],
          ["Pending", pending, "text-amber-600 dark:text-amber-400"],
          [
            "Total revenue",
            overview ? `${revenueCurrency} ${overview.revenue.toLocaleString()}` : "—",
            "text-indigo-600 dark:text-indigo-400",
          ],
        ].map(([label, value, color]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search buyer, product, or Stripe reference"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as PaymentStatus | "ALL")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="ALL">All statuses</option>
          <option value="SUCCESS">Successful</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((payment) => (
                <tr
                  key={payment.paymentId}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {payment.buyerName || "Registered student"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.buyerEmail || payment.studentId || "—"}
                    </p>
                  </td>
                  <td className="max-w-[240px] px-5 py-4">
                    <p className="truncate font-medium text-slate-700 dark:text-slate-200">
                      {payment.productName || "Course payment"}
                    </p>
                    <p className="text-xs text-slate-400">{payment.paymentType || "COURSE"}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                    {money(payment)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                    {date(payment.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelected(payment)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {filtered.map((payment) => (
            <button
              key={payment.paymentId}
              onClick={() => setSelected(payment)}
              className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">
                    {payment.buyerName || "Registered student"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {payment.productName || "Course payment"}
                  </p>
                </div>
                <StatusBadge status={payment.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">{money(payment)}</span>
                <span className="text-slate-400">{date(payment.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">
              No payment records found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Successful guest marketplace purchases will appear here.
            </p>
          </div>
        )}
        {loading && (
          <div className="p-12 text-center text-sm text-slate-500">Loading payment records…</div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Payment details
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {selected.productName || "Course payment"}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <span className="text-sm text-slate-500">Amount</span>
              <span className="text-xl font-bold text-indigo-600">{money(selected)}</span>
            </div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Buyer</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  {selected.buyerName || "Registered student"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="mt-1 flex items-center gap-2 break-all text-slate-700 dark:text-slate-200">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  {selected.buyerEmail || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="mt-1 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  {selected.buyerPhone || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Payment date</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">
                  {date(selected.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Stripe reference</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-600 dark:text-slate-300">
                  {selected.stripePaymentIntentId || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
