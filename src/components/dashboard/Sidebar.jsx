"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const sections = [
  {
    items: [
      ["▦", "Overview", "/dashboard"],
      ["↓", "Deposit", "/dashboard/deposit"],
      ["↑", "Withdraw", "/dashboard/withdraw"],
      ["⌁", "Investments", "/dashboard/investments"],
      ["▤", "Transactions", "/dashboard/transactions"],
    ],
    label: "Main",
  },
  {
    items: [
      ["▣", "KYC Verification", "/dashboard/kyc"],
      ["◉", "Profile", "/dashboard/profile"],
      ["◔", "Notifications", "/dashboard/notifications"],
    ],
    label: "Account",
  },
];

function getKycPill(status) {
  if (status === "approved") {
    return {
      className: "bg-[rgba(76,175,80,0.1)] text-[#4CAF50]",
      label: "Verified",
      symbol: "✓",
    };
  }

  if (status === "pending") {
    return {
      className: "bg-[rgba(33,150,243,0.12)] text-[#64B5F6]",
      label: "KYC Pending",
      symbol: "…",
    };
  }

  return {
    className: "bg-[rgba(245,166,35,0.1)] text-[#F5A623]",
    label: "KYC Required",
    symbol: "!",
  };
}

export default function Sidebar({ mobile = false, onNavigate }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const kyc = getKycPill(user?.kycStatus);
  const wrapperClass = mobile
    ? "flex h-full flex-col bg-[#08080c] p-4"
    : "fixed left-0 top-[60px] hidden h-[calc(100vh-60px)] w-[240px] flex-col overflow-y-auto border-r border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.015)] p-4 md:flex";

  return (
    <aside className={wrapperClass}>
      <div className="flex-1">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-4 pb-1 pt-4 text-[10px] uppercase tracking-[0.1em] text-white/20">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(([icon, label, href]) => {
                const isActive =
                  href === "/dashboard"
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-[13px] transition ${
                      isActive
                        ? "border-l-2 border-[#F5A623] bg-[rgba(245,166,35,0.1)] text-[#F5A623]"
                        : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
                    }`}
                    href={href}
                    key={href}
                    onClick={onNavigate}
                  >
                    <span className="w-4 text-center">{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-white/[0.06] pt-4">
        <Link
          className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${kyc.className}`}
          href="/dashboard/kyc"
          onClick={onNavigate}
        >
          <span className="flex items-center gap-2">
            <span>{kyc.symbol}</span>
            {kyc.label}
          </span>
          {user?.kycStatus === "not_submitted" || !user?.kycStatus ? "→" : null}
        </Link>
        <button
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/30 transition hover:bg-[rgba(229,57,53,0.08)] hover:text-[#E53935]"
          onClick={logout}
          type="button"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
