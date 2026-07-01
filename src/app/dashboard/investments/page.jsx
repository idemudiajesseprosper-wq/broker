"use client";

import { CalendarClock, LineChart, Target, Wallet } from "lucide-react";
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

export default function InvestmentsPage() {
  const toast = useToast();
  const [account, setAccount] = useState(null);
  const [plans, setPlans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState("");

  const activeInvestments = useMemo(
    () => investments.filter((investment) => investment.status === "active"),
    [investments],
  );
  const totalInvested = activeInvestments.reduce(
    (total, investment) => total + (Number(investment.amountInvested) || 0),
    0,
  );
  const expectedProfit = activeInvestments.reduce(
    (total, investment) => total + (Number(investment.profit) || 0),
    0,
  );

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [accountResponse, plansResponse, investmentResponse] =
        await Promise.all([
          fetch("/api/account"),
          fetch("/api/investments/plans"),
          fetch("/api/investments/my-investments"),
        ]);

      if (!accountResponse.ok || !plansResponse.ok || !investmentResponse.ok) {
        throw new Error("Unable to load investments");
      }

      const [accountData, plansData, investmentData] = await Promise.all([
        accountResponse.json(),
        plansResponse.json(),
        investmentResponse.json(),
      ]);

      setAccount(accountData.account);
      setPlans(plansData.plans || []);
      setInvestments(investmentData.investments || []);
    } catch (error) {
      toast.error("Investments unavailable", error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
    const refreshTimer = window.setInterval(loadData, 30000);

    return () => window.clearInterval(refreshTimer);
  }, [loadData]);

  async function subscribe(plan) {
    const amount = amounts[plan._id] || plan.minAmount;
    setSubmittingPlan(plan._id);

    try {
      const response = await fetch("/api/investments/subscribe", {
        body: JSON.stringify({ amount, planId: plan._id }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to start investment",
        );
      }

      toast.success("Investment started", `${plan.name} is now active.`);
      await loadData();
    } catch (error) {
      toast.error("Investment failed", error.message);
    } finally {
      setSubmittingPlan("");
    }
  }

  if (loading) {
    return <LoadingState label="Loading investment plans..." />;
  }

  return (
    <div>
      <PageHeader
        description="Review available plans, start new positions, and track expected returns across active investments."
        title="Investments"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          accent="#F5A623"
          detail="Ready to allocate"
          icon={Wallet}
          label="Wallet Balance"
          value={formatCurrency(account?.balance)}
        />
        <StatCard
          accent="#60A5FA"
          detail={`${activeInvestments.length} active position(s)`}
          icon={LineChart}
          label="Active Invested"
          value={formatCurrency(totalInvested)}
        />
        <StatCard
          accent="#4ADE80"
          detail="Projected active profit"
          icon={Target}
          label="Expected Profit"
          value={formatCurrency(expectedProfit)}
        />
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Available Plans</h2>
          <p className="text-sm text-white/42">{plans.length} plan(s)</p>
        </div>
        {plans.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <DashboardCard
                className="flex min-h-[330px] flex-col"
                key={plan._id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "var(--font-syne)" }}
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/45">
                      {plan.description || "Structured Bitcoin plan."}
                    </p>
                  </div>
                  <span className="rounded-md bg-[#F5A623]/10 px-3 py-1 text-sm font-bold text-[#F5A623]">
                    {plan.roiPercent}% ROI
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border border-white/8 bg-black/15 p-3">
                    <p className="text-white/35">Minimum</p>
                    <p className="mt-1 font-semibold text-white">
                      {formatCurrency(plan.minAmount)}
                    </p>
                  </div>
                  <div className="rounded-md border border-white/8 bg-black/15 p-3">
                    <p className="text-white/35">Duration</p>
                    <p className="mt-1 font-semibold text-white">
                      {plan.durationDays} days
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-6">
                  <label
                    className="mb-2 block text-sm text-white/62"
                    htmlFor={`investment-amount-${plan._id}`}
                  >
                    Investment amount
                  </label>
                  <Input
                    id={`investment-amount-${plan._id}`}
                    max={plan.maxAmount}
                    min={plan.minAmount}
                    onChange={(event) =>
                      setAmounts((current) => ({
                        ...current,
                        [plan._id]: event.target.value,
                      }))
                    }
                    placeholder={`${plan.minAmount}`}
                    step="0.01"
                    type="number"
                    value={amounts[plan._id] || ""}
                  />
                  <Button
                    className="mt-3 h-11 w-full bg-[#F5A623] text-[#050508] hover:bg-[#E8C84A]"
                    disabled={submittingPlan === plan._id}
                    onClick={() => subscribe(plan)}
                  >
                    {submittingPlan === plan._id ? "Starting..." : "Start Plan"}
                  </Button>
                </div>
              </DashboardCard>
            ))}
          </div>
        ) : (
          <EmptyState
            description="Active investment plans will appear here once the admin team publishes them."
            title="No plans available"
          />
        )}
      </section>

      <DashboardCard className="mt-6">
        <h2 className="text-lg font-semibold text-white">Your Investments</h2>
        {investments.length ? (
          <div className="mt-5 grid gap-3">
            {investments.map((investment) => (
              <div
                className="grid gap-4 rounded-md border border-white/8 bg-black/15 p-4 md:grid-cols-[1fr_auto]"
                key={investment._id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-white">
                      {investment.planId?.name || "Investment Plan"}
                    </h3>
                    <StatusBadge status={investment.status} />
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-white/45 sm:grid-cols-3">
                    <p>Invested: {formatCurrency(investment.amountInvested)}</p>
                    <p>Profit: {formatCurrency(investment.profit)}</p>
                    <p>Expected: {formatCurrency(investment.expectedReturn)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/45">
                  <CalendarClock className="h-4 w-4 text-[#F5A623]" />
                  Ends {formatDate(investment.endDate)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              description="Start a plan above to begin tracking active investments and expected returns."
              title="No investments yet"
            />
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
