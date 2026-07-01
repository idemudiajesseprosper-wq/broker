"use client";

import { BadgeDollarSign, Landmark, ShieldCheck, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

export default function WithdrawPage() {
  const toast = useToast();
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    accountName: "",
    accountNumber: "",
    amount: "",
    bankName: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [accountResponse, userResponse, transactionResponse] =
        await Promise.all([
          fetch("/api/account"),
          fetch("/api/auth/me"),
          fetch("/api/transactions/history?type=withdrawal&limit=6"),
        ]);

      if (!accountResponse.ok || !userResponse.ok || !transactionResponse.ok) {
        throw new Error("Unable to load withdrawal details");
      }

      const [accountData, userData, transactionData] = await Promise.all([
        accountResponse.json(),
        userResponse.json(),
        transactionResponse.json(),
      ]);

      setAccount(accountData.account);
      setUser(userData.user);
      setTransactions(transactionData.transactions || []);
    } catch (error) {
      toast.error("Withdrawal page unavailable", error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
    const refreshTimer = window.setInterval(loadData, 30000);

    return () => window.clearInterval(refreshTimer);
  }, [loadData]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleWithdraw(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/transactions/withdraw", {
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to submit withdrawal",
        );
      }

      toast.success("Withdrawal submitted", data.message);
      setForm({ accountName: "", accountNumber: "", amount: "", bankName: "" });
      await loadData();
    } catch (error) {
      toast.error("Withdrawal failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading withdrawal workspace..." />;
  }

  const kycApproved = user?.kycStatus === "approved";

  return (
    <div>
      <PageHeader
        description="Submit payout requests, track approval status, and keep your bank details accurate."
        title="Withdraw Funds"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          accent="#4ADE80"
          detail="Eligible for requests"
          icon={Wallet}
          label="Available Balance"
          value={formatCurrency(account?.balance)}
        />
        <StatCard
          accent="#F5A623"
          detail="Lifetime withdrawals"
          icon={BadgeDollarSign}
          label="Total Withdrawn"
          value={formatCurrency(account?.totalWithdrawn)}
        />
        <StatCard
          accent={kycApproved ? "#4ADE80" : "#F5A623"}
          detail={kycApproved ? "Withdrawals enabled" : "Approval required"}
          icon={ShieldCheck}
          label="KYC Status"
          value={user?.kycStatus?.replaceAll("_", " ") || "pending"}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#4ADE80]/10 text-[#4ADE80]">
              <Landmark className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Request Withdrawal
              </h2>
              <p className="text-sm text-white/42">
                Minimum withdrawal is $20.
              </p>
            </div>
          </div>

          {!kycApproved ? (
            <div className="mt-6 rounded-md border border-[#F5A623]/25 bg-[#F5A623]/10 p-4 text-sm leading-6 text-[#F5A623]">
              KYC approval is required before withdrawals can be processed.
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleWithdraw}>
            <Input
              min="20"
              onChange={(event) => updateField("amount", event.target.value)}
              placeholder="Amount in USD"
              required
              step="0.01"
              type="number"
              value={form.amount}
            />
            <Input
              onChange={(event) => updateField("bankName", event.target.value)}
              placeholder="Bank name"
              required
              value={form.bankName}
            />
            <Input
              onChange={(event) =>
                updateField("accountNumber", event.target.value)
              }
              placeholder="Account number"
              required
              value={form.accountNumber}
            />
            <Input
              onChange={(event) =>
                updateField("accountName", event.target.value)
              }
              placeholder="Account name"
              required
              value={form.accountName}
            />
            <Button
              className="h-11 w-full bg-[#F5A623] text-[#050508] hover:bg-[#E8C84A]"
              disabled={submitting || !kycApproved}
              type="submit"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </DashboardCard>

        <DashboardCard>
          <h2 className="text-lg font-semibold text-white">
            Withdrawal Process
          </h2>
          <div className="mt-5 space-y-3">
            {[
              ["Submit", "Send your payout amount and bank details."],
              ["Review", "The operations team checks balance and KYC status."],
              [
                "Processing",
                "Approved requests are processed within 24 hours.",
              ],
            ].map(([title, detail], index) => (
              <div
                className="rounded-md border border-white/8 bg-black/15 p-4"
                key={title}
              >
                <p className="text-sm font-semibold text-white">
                  {index + 1}. {title}
                </p>
                <p className="mt-1 text-sm leading-6 text-white/45">{detail}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard className="mt-6">
        <h2 className="text-lg font-semibold text-white">Recent Withdrawals</h2>
        {transactions.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-white/35">
                <tr>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Bank</th>
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
                      {transaction.bankDetails?.bankName || "Bank pending"}
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
              description="Withdrawal requests and payout statuses will appear here."
              title="No withdrawals yet"
            />
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
