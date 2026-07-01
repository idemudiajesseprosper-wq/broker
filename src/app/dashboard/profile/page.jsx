"use client";

import { BadgeCheck, Mail, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  DashboardCard,
  formatCurrency,
  formatDate,
  LoadingState,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/DashboardPageKit";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);

    try {
      const [userResponse, accountResponse] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/account"),
      ]);

      if (!userResponse.ok || !accountResponse.ok) {
        throw new Error("Unable to load profile");
      }

      const [userData, accountData] = await Promise.all([
        userResponse.json(),
        accountResponse.json(),
      ]);

      setUser(userData.user);
      setAccount(accountData.account);
    } catch (error) {
      toast.error("Profile unavailable", error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProfile();
    const refreshTimer = window.setInterval(loadProfile, 30000);

    return () => window.clearInterval(refreshTimer);
  }, [loadProfile]);

  if (loading) {
    return <LoadingState label="Loading profile..." />;
  }

  return (
    <div>
      <PageHeader
        description="Review your identity, wallet profile, verification status, and account health."
        title="Profile"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          accent="#F5A623"
          detail={account?.accountNumber || "Wallet pending"}
          icon={Wallet}
          label="Wallet Balance"
          value={formatCurrency(account?.balance)}
        />
        <StatCard
          accent="#4ADE80"
          detail={user?.isVerified ? "Email confirmed" : "Email pending"}
          icon={BadgeCheck}
          label="Email Status"
          value={user?.isVerified ? "Verified" : "Unverified"}
        />
        <StatCard
          accent="#60A5FA"
          detail="Identity review status"
          icon={ShieldCheck}
          label="KYC"
          value={user?.kycStatus?.replaceAll("_", " ") || "not submitted"}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardCard>
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-[10px] bg-[#F5A623]/10 text-[#F5A623]">
              <UserRound className="h-8 w-8" />
            </span>
            <div>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {user?.fullName || "BSX Investor"}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/45">
                <Mail className="h-4 w-4 text-[#F5A623]" />
                {user?.email || "Email unavailable"}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-3">
            {[
              ["Role", user?.role || "client"],
              ["Account Status", account?.status || "active"],
              ["Created", formatDate(account?.createdAt)],
            ].map(([label, value]) => (
              <div
                className="flex items-center justify-between rounded-md border border-white/8 bg-black/15 p-3"
                key={label}
              >
                <span className="text-sm text-white/42">{label}</span>
                <span className="text-sm font-semibold capitalize text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard>
          <h2 className="text-lg font-semibold text-white">Account Overview</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Total Deposited", formatCurrency(account?.totalDeposited)],
              ["Total Withdrawn", formatCurrency(account?.totalWithdrawn)],
              ["Total Profit", formatCurrency(account?.totalProfit)],
              [
                "BTC Holding",
                `${Number(account?.btcHolding || 0).toFixed(8)} BTC`,
              ],
            ].map(([label, value]) => (
              <div
                className="rounded-md border border-white/8 bg-black/15 p-4"
                key={label}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-white/32">
                  {label}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md border border-[#F5A623]/20 bg-[#F5A623]/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">
                Verification summary
              </p>
              <StatusBadge status={user?.kycStatus || "not_submitted"} />
            </div>
            <p className="mt-2 text-sm leading-6 text-white/48">
              Keep your identity and contact details accurate. Withdrawals and
              investment subscriptions may require approved KYC before they can
              be completed.
            </p>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard className="mt-6">
        <h2 className="text-lg font-semibold text-white">Security Checklist</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Use a strong password that is not shared with other platforms.",
            "Confirm you are on the correct BSX Capital Exchange domain before signing in.",
            "Contact support quickly if you notice unexpected account activity.",
          ].map((item, index) => (
            <div
              className="rounded-md border border-white/8 bg-black/15 p-4 text-sm leading-6 text-white/52"
              key={item}
            >
              <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-[#F5A623]/10 text-sm font-bold text-[#F5A623]">
                {index + 1}
              </span>
              {item}
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
