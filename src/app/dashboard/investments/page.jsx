"use client";

import {
  CalendarClock,
  ChevronDown,
  Gift,
  PackageCheck,
  Target,
  Wallet,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EmptyState,
  formatCurrency,
  formatDate,
  LoadingState,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/DashboardPageKit";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";

function formatPackageMoney(value, symbol = "$") {
  return `${symbol}${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)}`;
}

function formatDuration(days) {
  if (Number(days) === 7) {
    return "One week";
  }

  if (Number(days) === 1) {
    return "One day";
  }

  return `${days || 0} days`;
}

function packageAmount(plan) {
  return Number(plan.defaultAmount || plan.minAmount || 0);
}

function PackagePlanCard({ onDeposit, plan }) {
  const symbol = "$";
  const defaultAmount = packageAmount(plan);

  return (
    <article className="rounded-[6px] border border-white/60 bg-[#151a31] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)] sm:p-8">
      <div>
        <span className="inline-flex rounded-[3px] bg-[#c8d2ff] px-2.5 py-1 text-sm text-[#47538e]">
          Plan name
        </span>
        <h2 className="mt-2 text-3xl font-medium text-white">{plan.name}</h2>
      </div>

      <div className="my-12 flex items-baseline justify-center text-white">
        <span className="mr-3 text-3xl">{symbol}</span>
        <span className="text-[72px] font-light leading-none tracking-normal">
          {new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0,
          }).format(defaultAmount)}
        </span>
      </div>

      <dl className="grid gap-4 text-[15px] text-white">
        {[
          [
            "Minimum Possible Deposit:",
            formatPackageMoney(plan.minAmount, symbol),
          ],
          [
            "Maximum Possible Deposit:",
            formatPackageMoney(plan.maxAmount, symbol),
          ],
          ["Minimum Return:", formatPackageMoney(plan.minReturn, symbol)],
          ["Maximum Return:", formatPackageMoney(plan.maxReturn, symbol)],
          ["Gift Bonus:", formatPackageMoney(plan.giftBonus, symbol)],
          ["Duration:", formatDuration(plan.durationDays)],
        ].map(([label, value]) => (
          <div className="flex items-center justify-between gap-5" key={label}>
            <dt className="text-white/90">{label}</dt>
            <dd className="text-right text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <Button
        className="mt-10 h-12 w-full rounded-full bg-[#2186f3] text-white hover:bg-[#3193ff]"
        onClick={onDeposit}
      >
        Deposit to invest
      </Button>
    </article>
  );
}

function MyPackageCard({ investment }) {
  const plan = investment.planId || {};
  const symbol = "$";

  return (
    <article className="rounded-[6px] border border-white/12 bg-[#151a31] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-[3px] bg-[#c8d2ff] px-2.5 py-1 text-sm text-[#47538e]">
            Package
          </span>
          <h2 className="mt-2 text-2xl font-medium text-white">
            {plan.name || "Investment Package"}
          </h2>
        </div>
        <StatusBadge status={investment.status} />
      </div>

      <div className="mt-6 grid gap-4 text-sm text-white/82 sm:grid-cols-3">
        <p>Invested: {formatPackageMoney(investment.amountInvested, symbol)}</p>
        <p>Profit: {formatPackageMoney(investment.profit, symbol)}</p>
        <p>Expected: {formatPackageMoney(investment.expectedReturn, symbol)}</p>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-white/45">
        <CalendarClock className="h-4 w-4 text-[#F5A623]" />
        Ends {formatDate(investment.endDate)}
      </div>
    </article>
  );
}

export default function InvestmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [account, setAccount] = useState(null);
  const [plans, setPlans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeView =
    searchParams.get("view") === "packages" ? "packages" : "plans";

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
  const packageBonus = plans.reduce(
    (total, plan) => total + (Number(plan.giftBonus) || 0),
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
        throw new Error("Unable to load packages");
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
      toast.error("Packages unavailable", error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
    const refreshTimer = window.setInterval(loadData, 30000);

    return () => window.clearInterval(refreshTimer);
  }, [loadData]);

  function setView(view) {
    router.push(`/dashboard/investments?view=${view}`);
  }

  if (loading) {
    return <LoadingState label="Loading packages..." />;
  }

  return (
    <div>
      <PageHeader
        description="Choose an investment plan, join a package, and track your active subscriptions."
        eyebrow="Trading Packages"
        title="Packages"
      />

      <div className="mb-6 grid gap-3 md:hidden">
        <p className="text-xs uppercase tracking-[0.18em] text-white/38">
          Packages menu
        </p>
        <div className="relative">
          <Select
            className="h-12 appearance-none bg-[#151a31] pr-10"
            onChange={(event) => setView(event.target.value)}
            value={activeView}
          >
            <option value="plans">Investment Plans</option>
            <option value="packages">My Packages</option>
          </Select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-white/45" />
        </div>
      </div>

      <div className="mb-6 hidden items-center gap-2 md:flex">
        {[
          ["plans", "Investment Plans"],
          ["packages", "My Packages"],
        ].map(([key, label]) => (
          <button
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeView === key
                ? "bg-[#F5A623] text-[#050508]"
                : "border border-white/10 bg-white/[0.03] text-white/58 hover:text-white"
            }`}
            key={key}
            onClick={() => setView(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          accent="#F5A623"
          detail="Available to invest"
          icon={Wallet}
          label="Wallet Balance"
          value={formatCurrency(account?.balance)}
        />
        <StatCard
          accent="#60A5FA"
          detail={`${activeInvestments.length} active package(s)`}
          icon={PackageCheck}
          label="My Packages"
          value={activeInvestments.length}
        />
        <StatCard
          accent="#4ADE80"
          detail="Projected active profit"
          icon={Target}
          label="Expected Profit"
          value={formatCurrency(expectedProfit)}
        />
        <StatCard
          accent="#F87171"
          detail="Across listed packages"
          icon={Gift}
          label="Gift Bonuses"
          value={formatCurrency(packageBonus)}
        />
      </div>

      {activeView === "plans" ? (
        <section className="mt-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-3xl font-medium text-white">
              Available packages
            </h2>
            <p className="text-sm text-white/42">{plans.length} plan(s)</p>
          </div>
          {plans.length ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {plans.map((plan) => (
                <PackagePlanCard
                  key={plan._id}
                  onDeposit={() => router.push("/dashboard/deposit")}
                  plan={plan}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="Investment packages will appear here once they are available."
              title="No packages available"
            />
          )}
        </section>
      ) : null}

      {activeView === "packages" ? (
        <section className="mt-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-3xl font-medium text-white">My Packages</h2>
            <p className="text-sm text-white/42">
              {investments.length} package(s)
            </p>
          </div>
          {investments.length ? (
            <div className="grid gap-4">
              {investments.map((investment) => (
                <MyPackageCard investment={investment} key={investment._id} />
              ))}
            </div>
          ) : (
            <div>
              <EmptyState
                description="Join an investment plan to see your active and completed packages here."
                title="No packages yet"
              />
              <Button
                className="mx-auto mt-5 flex bg-[#2186f3] text-white hover:bg-[#3193ff]"
                onClick={() => setView("plans")}
              >
                View investment plans
              </Button>
            </div>
          )}
        </section>
      ) : null}

      <p className="mt-6 text-xs text-white/25">
        Active invested amount: {formatCurrency(totalInvested)}
      </p>
    </div>
  );
}
