"use client";

import { CreditCard, Landmark, ReceiptText, Wallet } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";

export default function DepositPage() {
  const toast = useToast();
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const quickAmounts = useMemo(() => [50, 100, 250, 500], []);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [accountResponse, transactionResponse] = await Promise.all([
        fetch("/api/account"),
        fetch("/api/transactions/history?type=deposit&limit=6"),
      ]);

      if (!accountResponse.ok || !transactionResponse.ok) {
        throw new Error("Unable to load deposit details");
      }

      const [accountData, transactionData] = await Promise.all([
        accountResponse.json(),
        transactionResponse.json(),
      ]);

      setAccount(accountData.account);
      setTransactions(transactionData.transactions || []);
    } catch (error) {
      toast.error("Deposit page unavailable", error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
    const refreshTimer = window.setInterval(loadData, 30000);

    return () => window.clearInterval(refreshTimer);
  }, [loadData]);

  async function handleDeposit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/transactions/deposit", {
        body: JSON.stringify({ amount }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to start deposit",
        );
      }

      toast.success("Deposit initialized", "Redirecting to payment checkout.");

      if (data.authorizationUrl) {
        window.location.assign(data.authorizationUrl);
      } else {
        await loadData();
      }
    } catch (error) {
      toast.error("Deposit failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading deposit workspace..." />;
  }

  return (
    <div>
      <PageHeader
        description="Fund your wallet securely, review pending deposits, and keep your investment balance ready."
        title="Deposit Funds"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          accent="#F5A623"
          detail="Available for investments"
          icon={Wallet}
          label="Wallet Balance"
          value={formatCurrency(account?.balance)}
        />
        <StatCard
          accent="#4ADE80"
          detail="Lifetime approved funding"
          icon={Landmark}
          label="Total Deposited"
          value={formatCurrency(account?.totalDeposited)}
        />
        <StatCard
          accent="#60A5FA"
          detail={account?.accountNumber || "Account pending"}
          icon={ReceiptText}
          label="Wallet ID"
          value={account?.status || "active"}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#F5A623]/10 text-[#F5A623]">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Start a Deposit
              </h2>
              <p className="text-sm text-white/42">Minimum deposit is $10.</p>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleDeposit}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-white/68"
                htmlFor="deposit-amount"
              >
                Amount in USD
              </label>
              <Input
                id="deposit-amount"
                min="10"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="100.00"
                required
                step="0.01"
                type="number"
                value={amount}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((value) => (
                <button
                  className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/68 transition hover:border-[#F5A623]/40 hover:text-white"
                  key={value}
                  onClick={() => setAmount(String(value))}
                  type="button"
                >
                  ${value}
                </button>
              ))}
            </div>
            <Button
              className="h-11 w-full bg-[#F5A623] text-[#050508] hover:bg-[#E8C84A]"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Initializing..." : "Continue to Payment"}
            </Button>
          </form>
        </DashboardCard>

        <DashboardCard>
          <h2 className="text-lg font-semibold text-white">Funding Notes</h2>
          <div className="mt-5 grid gap-3">
            {[
              "Deposits are created as pending until payment confirmation is received.",
              "Use the same email tied to your BSX account for smoother reconciliation.",
              "Approved deposits increase your wallet balance and become available for plans.",
            ].map((note, index) => (
              <div
                className="flex gap-3 rounded-md border border-white/8 bg-black/15 p-3 text-sm leading-6 text-white/52"
                key={note}
              >
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F5A623]/10 text-xs font-bold text-[#F5A623]">
                  {index + 1}
                </span>
                {note}
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard className="mt-6">
        <h2 className="text-lg font-semibold text-white">Recent Deposits</h2>
        {transactions.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-white/35">
                <tr>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Reference</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="py-4 font-semibold text-white">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 text-white/50">
                      {transaction.paystackReference || "Manual review"}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={transaction.status} />
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
              description="Your deposit records will appear here after you start funding your wallet."
              title="No deposits yet"
            />
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
