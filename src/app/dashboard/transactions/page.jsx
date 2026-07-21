"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ListFilter,
  ReceiptText,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DashboardCard,
  EmptyState,
  formatCurrency,
  formatDate,
  LoadingState,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/DashboardPageKit";
import { Select } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";

export default function TransactionsPage() {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 0 });
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const totals = useMemo(
    () =>
      transactions.reduce(
        (summary, transaction) => {
          const amount = Number(transaction.amount) || 0;
          if (transaction.type === "deposit") summary.deposits += amount;
          if (transaction.type === "withdrawal") summary.withdrawals += amount;
          if (transaction.status === "pending") summary.pending += 1;
          return summary;
        },
        { deposits: 0, pending: 0, withdrawals: 0 },
      ),
    [transactions],
  );

  const loadTransactions = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({ limit: "30" });
        if (type) params.set("type", type);
        if (status) params.set("status", status);

        const response = await fetch(`/api/transactions/history?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load transactions");
        }

        setTransactions(data.transactions || []);
        setMeta({
          totalCount: data.totalCount || 0,
          totalPages: data.totalPages || 0,
        });
      } catch (error) {
        if (!silent) {
          toast.error("Transactions unavailable", error.message);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [status, toast, type],
  );

  useEffect(() => {
    loadTransactions();

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        loadTransactions({ silent: true });
      }
    }

    const refreshTimer = window.setInterval(
      () => loadTransactions({ silent: true }),
      10_000,
    );
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);

    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [loadTransactions]);

  if (loading) {
    return <LoadingState label="Loading transaction history..." />;
  }

  return (
    <div>
      <PageHeader
        description="Review deposits, withdrawals, bonuses, profits, penalties, and balance adjustments in one ledger."
        title="Transaction History"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          accent="#4ADE80"
          icon={ArrowDownLeft}
          label="Deposits in View"
          value={formatCurrency(totals.deposits)}
        />
        <StatCard
          accent="#FB7185"
          icon={ArrowUpRight}
          label="Withdrawals in View"
          value={formatCurrency(totals.withdrawals)}
        />
        <StatCard
          accent="#F5A623"
          detail={`${meta.totalCount} total matching records`}
          icon={ReceiptText}
          label="Pending Items"
          value={totals.pending}
        />
      </div>

      <DashboardCard className="mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <ListFilter className="h-5 w-5 text-[#F5A623]" />
              Filters
            </div>
            <p className="mt-1 text-sm text-white/42">
              Narrow the ledger by transaction type or processing status.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:w-[420px]">
            <Select
              onChange={(event) => setType(event.target.value)}
              value={type}
            >
              <option value="">All types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="profit">Profit</option>
              <option value="bonus">Bonus</option>
              <option value="penalty">Penalty</option>
              <option value="balance_adjustment">Balance adjustment</option>
            </Select>
            <Select
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
            </Select>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Ledger</h2>
          <p className="text-sm text-white/42">{meta.totalPages} page(s)</p>
        </div>
        {transactions.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-white/35">
                <tr>
                  <th className="py-3">Type</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Reference / Note</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="py-4 font-semibold capitalize text-white">
                      {transaction.type.replaceAll("_", " ")}
                    </td>
                    <td className="py-4 text-white">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="py-4 text-white/45">
                      {transaction.note ||
                        transaction.bankDetails?.bankName ||
                        "Account activity"}
                    </td>
                    <td className="py-4 text-white/45">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              description="Try changing the filters, or create a deposit or withdrawal to start building your ledger."
              title="No transactions found"
            />
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
