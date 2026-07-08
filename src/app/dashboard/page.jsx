"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authHeader } from "@/utils/auth-client";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value) || 0);
}

function timeAgo(date) {
  const then = new Date(date).getTime();
  const seconds = Math.max(Math.floor((Date.now() - then) / 1000), 0);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Spinner() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[rgba(245,166,35,0.2)] border-t-[#F5A623]" />
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-[rgba(76,175,80,0.12)] text-[#4CAF50]"
          : "bg-[rgba(229,57,53,0.12)] text-[#E53935]"
      }`}
    >
      {active ? "Active" : "Suspended"}
    </span>
  );
}

function StatCard({ icon, label, trend, value }) {
  return (
    <article className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] p-5">
      <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(245,166,35,0.1)] text-[#F5A623]">
        {icon}
      </div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p
          className="text-[22px] font-bold text-white"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {value}
        </p>
        {trend ? <span className="text-xs text-[#4CAF50]">↗</span> : null}
      </div>
    </article>
  );
}

function AccountOverview({ account, balanceVisible, transactions }) {
  const approvedDeposits = transactions.filter(
    (transaction) =>
      transaction.type === "deposit" && transaction.status === "approved",
  );
  const approvedWithdrawals = transactions.filter(
    (transaction) =>
      transaction.type === "withdrawal" && transaction.status === "approved",
  );
  const lastDeposit = approvedDeposits[0]?.amount || 0;
  const lastWithdrawal = approvedWithdrawals[0]?.amount || 0;
  const visibleBalance = balanceVisible
    ? formatCurrency(account.balance)
    : "......";

  return (
    <section className="rounded-2xl border border-[rgba(245,166,35,0.18)] bg-[#071f39]/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <h2
        className="text-center text-base font-bold uppercase tracking-[0.16em] text-[#E8C84A]"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        Account Overview
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-[#E8C84A]/25 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">
            Active Deposits
          </p>
          <p
            className="mt-3 text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {formatCurrency(account.totalDeposited)}
          </p>
          <Link
            className="mt-4 inline-flex rounded-md bg-[#F5A623] px-4 py-2 text-xs font-semibold uppercase text-[#050508]"
            href="/dashboard/deposit"
          >
            Make a deposit
          </Link>
        </article>
        <article className="rounded-lg border border-[#E8C84A]/25 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">
            Your Balance
          </p>
          <p
            className="mt-3 text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {visibleBalance}
          </p>
          <Link
            className="mt-4 inline-flex rounded-md bg-[#F5A623] px-4 py-2 text-xs font-semibold uppercase text-[#050508]"
            href="/dashboard/withdraw"
          >
            Withdraw funds
          </Link>
        </article>
        <article className="rounded-lg border border-[#E8C84A]/25 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">
            Added Bonus
          </p>
          <p
            className="mt-3 text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {formatCurrency(account.totalBonus)}
          </p>
          <Link
            className="mt-4 inline-flex rounded-md bg-[#F5A623] px-4 py-2 text-xs font-semibold uppercase text-[#050508]"
            href="/dashboard/transactions"
          >
            My bonuses
          </Link>
        </article>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/40">
            Last Deposit
          </p>
          <p className="mt-2 text-xl font-bold text-[#E8C84A]">
            {formatCurrency(lastDeposit)}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/40">
            Withdrawal
          </p>
          <p className="mt-2 text-xl font-bold text-[#E8C84A]">
            {formatCurrency(account.totalWithdrawn || lastWithdrawal)}
          </p>
        </div>
      </div>
    </section>
  );
}

function ActionButton({ children, disabled, href, primary }) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md border border-white/10 px-5 py-3 text-sm text-white/25">
        {children}
      </span>
    );
  }

  return (
    <Link
      className={
        primary
          ? "rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-5 py-3 text-sm font-semibold text-[#050508] transition hover:brightness-110"
          : "rounded-md border border-[rgba(255,255,255,0.12)] px-5 py-3 text-sm font-medium text-white/70 transition hover:border-[rgba(245,166,35,0.35)] hover:text-white"
      }
      href={href}
    >
      {children}
    </Link>
  );
}

function BalanceCard({ account, balanceVisible, btcPrice, setBalanceVisible }) {
  const suspended = account.status === "suspended";
  const btcEquivalent = btcPrice
    ? account.balance / btcPrice
    : account.btcHolding;
  const visibleText = balanceVisible
    ? formatCurrency(account.balance)
    : "••••••";

  useEffect(() => {
    localStorage.setItem("bsx_balance_visible", String(balanceVisible));
  }, [balanceVisible]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[rgba(245,166,35,0.2)] bg-[linear-gradient(135deg,rgba(245,166,35,0.08),rgba(232,200,74,0.04))] p-6 sm:p-8">
      {suspended ? (
        <div className="absolute inset-0 z-10 flex items-end bg-[rgba(229,57,53,0.12)] p-6">
          <p className="rounded-md bg-[#050508]/90 px-4 py-2 text-sm text-[#ff8a80]">
            Your account is suspended. Contact support.
          </p>
        </div>
      ) : null}
      <div className="relative z-0">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Total Account Balance
          </p>
          <button
            className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/45 hover:text-white"
            onClick={() => setBalanceVisible((value) => !value)}
            type="button"
          >
            {balanceVisible ? "Hide" : "Show"}
          </button>
        </div>
        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p
              className="text-[36px] font-extrabold text-white sm:text-[44px]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {visibleText}
            </p>
            <p className="mt-1 text-sm text-white/35">(in USD)</p>
          </div>
          <div className="lg:text-right">
            <p
              className="text-2xl font-bold text-[#F5A623]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              ₿ {balanceVisible ? btcEquivalent.toFixed(5) : "•••••"} BTC
            </p>
            <p className="mt-1 text-sm text-white/35">at current price</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ActionButton href="/dashboard/deposit" primary>
            Deposit
          </ActionButton>
          <ActionButton disabled={suspended} href="/dashboard/withdraw">
            Withdraw
          </ActionButton>
          <ActionButton disabled={suspended} href="/dashboard/investments">
            Invest
          </ActionButton>
        </div>
      </div>
    </section>
  );
}

function BtcPriceCard({ btcPrice, priceChange, sparkline, updatedAgo }) {
  const positive = priceChange >= 0;

  return (
    <section className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-white">₿ Bitcoin (BTC)</p>
          <p className="mt-1 text-xs text-white/35">Live price</p>
        </div>
        <p className="flex items-center gap-2 text-xs text-white/35">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#4CAF50]" />
          updated {updatedAgo}s
        </p>
      </div>
      <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {formatCurrency(btcPrice)}
          </p>
          <p
            className={
              positive
                ? "mt-2 text-sm text-[#4CAF50]"
                : "mt-2 text-sm text-[#E53935]"
            }
          >
            {positive ? "↗" : "↘"} {positive ? "+" : ""}
            {formatCurrency(Math.abs((btcPrice * priceChange) / 100))}{" "}
            {positive ? "+" : ""}
            {priceChange.toFixed(2)}% today
          </p>
        </div>
        <div className="flex h-20 items-end gap-1">
          {sparkline.map((bar) => (
            <span
              className="w-2 rounded-sm bg-[#F5A623]/80"
              key={bar.id}
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TransactionRow({ transaction }) {
  const isCredit = ["deposit", "profit", "bonus"].includes(transaction.type);
  const statusStyles = {
    approved: "bg-[rgba(76,175,80,0.1)] text-[#4CAF50]",
    pending: "bg-[rgba(245,166,35,0.1)] text-[#F5A623]",
    rejected: "bg-[rgba(229,57,53,0.1)] text-[#E53935]",
  };

  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/[0.05] py-3.5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            isCredit
              ? "bg-[rgba(76,175,80,0.1)] text-[#4CAF50]"
              : "bg-[rgba(229,57,53,0.1)] text-[#E53935]"
          }`}
        >
          {isCredit ? "↓" : "↑"}
        </span>
        <div>
          <p className="capitalize text-sm text-white">{transaction.type}</p>
          <p className="text-xs text-white/35">
            {timeAgo(transaction.createdAt)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={
            isCredit ? "text-sm text-[#4CAF50]" : "text-sm text-[#E53935]"
          }
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>
        <span
          className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] capitalize ${statusStyles[transaction.status] || statusStyles.pending}`}
        >
          {transaction.status}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [account, setAccount] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [btcPrice, setBtcPrice] = useState(67420.5);
  const [priceChange, setPriceChange] = useState(2.41);
  const [sparkline, setSparkline] = useState(
    [35, 52, 44, 68, 56, 74, 49, 62, 82, 70, 88, 76].map((height, index) => ({
      height,
      id: `initial-${index}`,
    })),
  );
  const [updatedAt, setUpdatedAt] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const previousBtcPrice = useRef(null);

  const activeInvestments = useMemo(
    () => investments.filter((investment) => investment.status === "active"),
    [investments],
  );
  const activeInvestmentTotal = activeInvestments.reduce(
    (total, investment) => total + (Number(investment.amountInvested) || 0),
    0,
  );

  const loadDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      setError("");
      if (!silent) {
        setLoading(true);
      }

      try {
        const [accountResponse, investmentResponse, transactionResponse] =
          await Promise.all([
            fetch("/api/account", { headers: authHeader() }),
            fetch("/api/investments/my-investments?status=active", {
              headers: authHeader(),
            }),
            fetch("/api/transactions/history?limit=5", {
              headers: authHeader(),
            }),
          ]);

        if (
          !accountResponse.ok ||
          !investmentResponse.ok ||
          !transactionResponse.ok
        ) {
          throw new Error("Failed to load account data");
        }

        const [accountData, investmentData, transactionData] =
          await Promise.all([
            accountResponse.json(),
            investmentResponse.json(),
            transactionResponse.json(),
          ]);

        setAccount(accountData.account);
        setInvestments(investmentData.investments || []);
        setTransactions(transactionData.transactions || []);
      } catch (loadError) {
        const message = loadError.message || "Failed to load account data";
        setError(message);
        if (!silent) {
          toast.error("Dashboard unavailable", message);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [toast],
  );

  useEffect(() => {
    const storedVisibility = localStorage.getItem("bsx_balance_visible");

    if (storedVisibility !== null) {
      setBalanceVisible(storedVisibility === "true");
    }

    loadDashboardData();

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        loadDashboardData({ silent: true });
      }
    }

    const refreshTimer = window.setInterval(
      () => loadDashboardData({ silent: true }),
      10_000,
    );
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);

    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [loadDashboardData]);

  useEffect(() => {
    let active = true;

    async function loadBtcPrice() {
      try {
        const response = await fetch(
          "https://api.coindesk.com/v1/bpi/currentprice/USD.json",
          { cache: "no-store" },
        );
        const data = await response.json();
        const nextPrice = Number(data.bpi.USD.rate_float);

        if (!active) {
          return;
        }

        if (previousBtcPrice.current) {
          setPriceChange(
            ((nextPrice - previousBtcPrice.current) /
              previousBtcPrice.current) *
              100,
          );
        }

        previousBtcPrice.current = nextPrice;
        setBtcPrice(nextPrice);
        setSparkline(
          Array.from({ length: 12 }, (_, index) => ({
            height: Math.floor(24 + Math.random() * 70),
            id: `${Date.now()}-${index}`,
          })),
        );
        setUpdatedAt(Date.now());
      } catch {
        setUpdatedAt(Date.now());
      }
    }

    loadBtcPrice();
    const timer = setInterval(loadBtcPrice, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error || !account) {
    return (
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-white">Failed to load account data.</p>
          <button
            className="mt-4 rounded-md bg-[#F5A623] px-4 py-2 text-sm font-semibold text-[#050508]"
            onClick={loadDashboardData}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const firstName = user?.fullName?.split(" ")?.[0] || "Investor";

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1
            className="text-2xl font-bold text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Here&apos;s your portfolio at a glance.
          </p>
        </div>
        <StatusBadge status={account.status} />
      </section>

      <BalanceCard
        account={account}
        balanceVisible={balanceVisible}
        btcPrice={btcPrice}
        setBalanceVisible={setBalanceVisible}
      />

      <AccountOverview
        account={account}
        balanceVisible={balanceVisible}
        transactions={transactions}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <StatCard
          icon="↗"
          label="Total Profit"
          trend
          value={formatCurrency(account.totalProfit)}
        />
        <StatCard
          icon="◔"
          label="Active Investments"
          value={`${activeInvestments.length} plans`}
        />
      </section>

      <BtcPriceCard
        btcPrice={btcPrice}
        priceChange={priceChange}
        sparkline={sparkline}
        updatedAgo={Math.max(Math.floor((Date.now() - updatedAt) / 1000), 0)}
      />

      <section className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] p-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Recent Transactions
          </h2>
          <Link
            className="text-sm font-medium text-[#F5A623]"
            href="/dashboard/transactions"
          >
            View all →
          </Link>
        </div>

        {transactions.length ? (
          <div>
            {transactions.slice(0, 5).map((transaction) => (
              <TransactionRow key={transaction._id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-white/35">
              ▤
            </div>
            <p className="mt-4 font-medium text-white">No transactions yet</p>
            <p className="mt-1 text-sm text-white/40">
              Make your first deposit to get started.
            </p>
            <Link
              className="mt-5 inline-flex rounded-md bg-[#F5A623] px-4 py-2 text-sm font-semibold text-[#050508]"
              href="/dashboard/deposit"
            >
              Deposit
            </Link>
          </div>
        )}
      </section>

      <p className="text-xs text-white/25">
        Active investment exposure: {formatCurrency(activeInvestmentTotal)}
      </p>
    </div>
  );
}
