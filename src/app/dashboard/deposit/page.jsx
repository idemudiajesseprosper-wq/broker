"use client";

import {
  Bitcoin,
  Copy,
  Landmark,
  Plus,
  ReceiptText,
  Upload,
  Wallet,
  X,
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
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";

const BTC_ADDRESS = "bc1qdx2366eljyprhp89r69zcpe9p5p0cesrgvxxxu";

export default function DepositPage() {
  const toast = useToast();
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank transfer");
  const [proofFile, setProofFile] = useState(null);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const quickAmounts = useMemo(() => [100, 500, 1000, 5000], []);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }

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
    },
    [toast],
  );

  useEffect(() => {
    loadData();
    const refreshTimer = window.setInterval(() => {
      loadData({ silent: true });
    }, 30000);

    return () => window.clearInterval(refreshTimer);
  }, [loadData]);

  function handleContinue(event) {
    event.preventDefault();

    if (!amount || Number(amount) < 10) {
      toast.error("Amount required", "Minimum deposit is $10.");
      return;
    }

    setPaymentStep(true);
    setShowDepositForm(false);
  }

  async function copyAddress() {
    await navigator.clipboard.writeText(BTC_ADDRESS);
    toast.success("BTC address copied", "Paste it into your payment wallet.");
  }

  async function handleDeposit(event) {
    event.preventDefault();

    if (!proofFile) {
      toast.error("Proof required", "Upload your payment proof after payment.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("paymentMethod", paymentMethod);
      formData.append("paymentProof", proofFile);

      const response = await fetch("/api/transactions/deposit", {
        body: formData,
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to start deposit",
        );
      }

      toast.success(
        "Payment submitted",
        "Your deposit is pending admin confirmation.",
      );
      setAmount("");
      setProofFile(null);
      setPaymentMethod("Bank transfer");
      setPaymentStep(false);
      await loadData();
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
        description="Create a manual deposit, pay to the wallet address below, and upload proof for confirmation."
        title="Your deposits"
      />

      <div className="mb-5 overflow-hidden rounded-[10px] border border-[#F5A623]/18 bg-[#F5A623]/8 p-4">
        <p className="text-sm font-semibold text-white/78">BTC Address</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-all font-mono text-sm text-white/58">
            {BTC_ADDRESS}
          </p>
          <Button
            aria-label="Copy BTC address"
            className="h-9 shrink-0 bg-white text-[#050508] hover:bg-white/85"
            onClick={copyAddress}
          >
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>
      </div>

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
          {!paymentStep ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Make new deposit
                  </h2>
                  <p className="mt-1 text-sm text-white/42">
                    Enter the amount you want to deposit.
                  </p>
                </div>
                {showDepositForm ? (
                  <button
                    aria-label="Close deposit form"
                    className="rounded-md p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                    onClick={() => setShowDepositForm(false)}
                    type="button"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : null}
              </div>

              {showDepositForm ? (
                <form className="mt-6 space-y-5" onSubmit={handleContinue}>
                  <Input
                    id="deposit-amount"
                    min="10"
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="5000"
                    required
                    step="0.01"
                    type="number"
                    value={amount}
                  />
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
                    className="h-11 bg-white px-8 text-[#050508] hover:bg-white/85"
                    type="submit"
                  >
                    Continue
                  </Button>
                </form>
              ) : (
                <Button
                  className="mt-6 h-12 bg-[#0F7CFF] px-5 text-white hover:bg-[#2d90ff]"
                  onClick={() => setShowDepositForm(true)}
                >
                  <Plus className="h-5 w-5" /> New deposit
                </Button>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white">
                Make Payment
              </h2>
              <p className="mt-5 text-sm leading-6 text-white/68">
                You are to make payment of{" "}
                <span className="font-semibold text-white">
                  {formatCurrency(amount)}
                </span>{" "}
                using your preferred mode of payment below. Screenshot the proof
                of payment.
              </p>

              <div className="mt-7 rounded-[10px] border border-white/8 bg-black/15 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-[#F5A623]/10 text-[#F5A623]">
                    <Bitcoin className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">Bitcoin</p>
                    <p className="mt-1 break-all font-mono text-xs text-white/50">
                      {BTC_ADDRESS}
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-4 h-9 bg-white text-[#050508] hover:bg-white/85"
                  onClick={copyAddress}
                >
                  <Copy className="h-4 w-4" /> Copy address
                </Button>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleDeposit}>
                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-white/68"
                    htmlFor="payment-proof"
                  >
                    Upload Payment proof after payment.
                  </label>
                  <label
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white/62 transition hover:border-[#F5A623]/45"
                    htmlFor="payment-proof"
                  >
                    <span className="inline-flex h-8 items-center gap-2 rounded-md bg-white px-3 font-semibold text-[#050508]">
                      <Upload className="h-4 w-4" /> Choose File
                    </span>
                    <span className="min-w-0 truncate">
                      {proofFile?.name || "no file selected"}
                    </span>
                  </label>
                  <input
                    accept="image/*"
                    className="sr-only"
                    id="payment-proof"
                    onChange={(event) =>
                      setProofFile(event.target.files?.[0] || null)
                    }
                    type="file"
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-white/68"
                    htmlFor="payment-method"
                  >
                    Payment Mode Used:
                  </label>
                  <Select
                    id="payment-method"
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    value={paymentMethod}
                  >
                    <option value="Bank transfer">Bank transfer</option>
                    <option value="Bitcoin">Bitcoin</option>
                  </Select>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="h-11 bg-white px-8 text-[#050508] hover:bg-white/85"
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting ? "Submitting..." : "Submit payment"}
                  </Button>
                  <Button
                    className="h-11"
                    disabled={submitting}
                    onClick={() => setPaymentStep(false)}
                    variant="outline"
                  >
                    Back
                  </Button>
                </div>
              </form>
            </>
          )}
        </DashboardCard>

        <DashboardCard>
          <h2 className="text-lg font-semibold text-white">Funding Notes</h2>
          <div className="mt-5 grid gap-3">
            {[
              "Deposits stay pending until your payment proof is confirmed.",
              "Use the BTC address shown on this page for Bitcoin payments.",
              "Choose Bank transfer when that is the payment mode you used.",
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
                      {transaction.note || "Manual review"}
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
