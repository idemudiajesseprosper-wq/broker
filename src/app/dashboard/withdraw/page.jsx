"use client";

import {
  BadgeDollarSign,
  Bitcoin,
  CircleDollarSign,
  Landmark,
  Repeat2,
  Send,
  Wallet,
} from "lucide-react";
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

const withdrawalMethods = [
  {
    accent: "#F6BE3B",
    fields: [
      ["amount", "Input Amount", "Amount", "number"],
      ["walletAddress", "Wallet Address", "Wallet Address", "text"],
    ],
    icon: Bitcoin,
    label: "Bitcoin (recommended)",
    value: "Bitcoin",
  },
  {
    accent: "#E6453A",
    fields: [
      ["accountName", "Name", "Name", "text"],
      ["accountNumber", "Account number", "Account Number", "text"],
      ["bankName", "Bank", "Bank", "text"],
      ["amount", "Amount", "Input Amount", "number"],
    ],
    icon: Repeat2,
    label: "Transfer",
    value: "Transfer",
  },
  {
    accent: "#38BDF8",
    fields: [
      ["accountName", "Account Name", "Name", "text"],
      ["accountNumber", "Account number", "Account Number", "text"],
      ["address", "Address", "Address", "text"],
      ["bankName", "Bank Name", "Bank Name", "text"],
      ["routingNumber", "Routine number", "Routine Number", "text"],
      ["amount", "Amount", "Amount", "number"],
    ],
    icon: Landmark,
    label: "Wire Transfer",
    value: "Wire Transfer",
  },
  {
    accent: "#6D4BC3",
    fields: [["amount", "Input Amount", "Amount", "number"]],
    icon: Wallet,
    label: "Skrill",
    value: "Skrill",
  },
  {
    accent: "#F6D21F",
    fields: [["amount", "Input Amount", "Amount", "number"]],
    icon: Send,
    label: "Western Union",
    value: "Western Union",
  },
  {
    accent: "#1D62C9",
    fields: [
      ["walletAddress", "Email Address", "Email Address", "email"],
      ["amount", "Input Amount", "Amount", "number"],
    ],
    icon: CircleDollarSign,
    label: "Paypal",
    value: "Paypal",
  },
  {
    accent: "#7B3FF2",
    fields: [
      ["walletAddress", "Email Address", "Email Address", "email"],
      ["amount", "Input Amount", "Amount", "number"],
    ],
    icon: CircleDollarSign,
    label: "Zelle",
    value: "Zelle",
  },
  {
    accent: "#22C55E",
    fields: [
      ["walletAddress", "Cash App Tag", "Cash App Tag", "text"],
      ["amount", "Input Amount", "Amount", "number"],
    ],
    icon: CircleDollarSign,
    label: "Cash App",
    value: "Cash App",
  },
];

export default function WithdrawPage() {
  const toast = useToast();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    accountName: "",
    accountNumber: "",
    address: "",
    amount: "",
    bankName: "",
    routingNumber: "",
    walletAddress: "",
    withdrawalMethod: "",
  });
  const [activeMethod, setActiveMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const [accountResponse, transactionResponse] = await Promise.all([
          fetch("/api/account"),
          fetch("/api/transactions/history?type=withdrawal&limit=6"),
        ]);

        if (!accountResponse.ok || !transactionResponse.ok) {
          throw new Error("Unable to load withdrawal details");
        }

        const [accountData, transactionData] = await Promise.all([
          accountResponse.json(),
          transactionResponse.json(),
        ]);

        setAccount(accountData.account);
        setTransactions(transactionData.transactions || []);
      } catch (error) {
        toast.error("Withdrawal page unavailable", error.message);
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
      setForm({
        accountName: "",
        accountNumber: "",
        address: "",
        amount: "",
        bankName: "",
        routingNumber: "",
        walletAddress: "",
        withdrawalMethod: "",
      });
      setActiveMethod("");
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

  function toggleMethod(method) {
    setActiveMethod((current) => {
      const next = current === method.value ? "" : method.value;
      setForm(() => ({
        accountName: "",
        accountNumber: "",
        address: "",
        amount: "",
        bankName: "",
        routingNumber: "",
        walletAddress: "",
        withdrawalMethod: next,
      }));
      return next;
    });
  }

  return (
    <div>
      <PageHeader
        description="Select your preferred withdrawal payment option, enter your payout details, and submit for review."
        title="Withdrawal Request"
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
          accent="#60A5FA"
          detail="Balance and payout details required"
          icon={Landmark}
          label="Withdrawal Access"
          value="enabled"
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
                Select withdrawal method
              </h2>
              <p className="text-sm text-white/42">
                Minimum withdrawal is $20.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {withdrawalMethods.map((method) => {
              const Icon = method.icon;
              const selected = activeMethod === method.value;

              return (
                <div
                  className="border-b border-white/65 pb-6 last:border-b-0 last:pb-0"
                  key={method.value}
                >
                  <button
                    className={`flex min-h-20 w-full items-center justify-center gap-3 rounded-md border px-4 text-left text-lg font-medium transition ${
                      selected
                        ? "border-white/70 bg-[#47AEEF] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.22)]"
                        : "border-[#47AEEF]/35 bg-[#47AEEF] text-white hover:border-white/55"
                    }`}
                    onClick={() => toggleMethod(method)}
                    type="button"
                  >
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-white text-[#101522]"
                      style={{ color: method.accent }}
                    >
                      <Icon className="h-7 w-7" />
                    </span>
                    <span>{method.label}</span>
                  </button>

                  {selected ? (
                    <form className="mt-10 space-y-5" onSubmit={handleWithdraw}>
                      {method.fields.map(
                        ([field, label, placeholder, type]) => (
                          <div key={`${method.value}-${field}`}>
                            <label
                              className="mb-3 block text-sm font-medium text-white"
                              htmlFor={`${method.value}-${field}`}
                            >
                              {label}
                            </label>
                            <Input
                              className="h-14 rounded-sm bg-white text-base text-[#111827] placeholder:text-[#777] focus:border-[#65B75B]"
                              id={`${method.value}-${field}`}
                              min={field === "amount" ? "20" : undefined}
                              onChange={(event) =>
                                updateField(field, event.target.value)
                              }
                              placeholder={placeholder}
                              required
                              step={field === "amount" ? "0.01" : undefined}
                              type={type}
                              value={form[field]}
                            />
                          </div>
                        ),
                      )}
                      <Button
                        className="h-14 w-full bg-[#65B75B] text-lg text-white hover:bg-[#75C86A]"
                        disabled={submitting}
                        type="submit"
                      >
                        {submitting ? "Submitting..." : "Proceed"}
                      </Button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        </DashboardCard>

        <DashboardCard>
          <h2 className="text-lg font-semibold text-white">
            Withdrawal Process
          </h2>
          <div className="mt-5 space-y-3">
            {[
              ["Submit", "Send your payout amount and bank details."],
              [
                "Review",
                "The operations team checks balance and payout details.",
              ],
              [
                "Processing",
                "Approved requests are sent through your selected method.",
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
                  <th className="py-3">Method</th>
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
                      {transaction.withdrawalMethod ||
                        transaction.bankDetails?.bankName ||
                        "Method pending"}
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
