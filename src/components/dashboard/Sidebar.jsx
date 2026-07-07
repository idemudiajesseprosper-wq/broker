"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const sections = [
  {
    items: [
      ["▦", "Overview", "/dashboard"],
      ["↓", "Deposit", "/dashboard/deposit"],
      ["↑", "Withdraw", "/dashboard/withdraw"],
      {
        children: [
          ["•", "Investment Plans", "/dashboard/investments?view=plans"],
          ["•", "My Packages", "/dashboard/investments?view=packages"],
        ],
        icon: "⌁",
        label: "Packages",
      },
      ["▤", "Transactions", "/dashboard/transactions"],
    ],
    label: "Main",
  },
  {
    items: [
      ["◉", "Profile", "/dashboard/profile"],
      ["◔", "Notifications", "/dashboard/notifications"],
    ],
    label: "Account",
  },
];

export default function Sidebar({ mobile = false, onNavigate }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const [packagesOpen, setPackagesOpen] = useState(
    pathname.startsWith("/dashboard/investments"),
  );
  const investmentView = searchParams.get("view") || "plans";
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
              {section.items.map((item) => {
                if (!Array.isArray(item)) {
                  const isOpen =
                    packagesOpen ||
                    pathname.startsWith("/dashboard/investments");
                  const isActive = pathname.startsWith(
                    "/dashboard/investments",
                  );

                  return (
                    <div key={item.label}>
                      <button
                        className={`flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-left text-[13px] transition ${
                          isActive
                            ? "border-l-2 border-[#F5A623] bg-[rgba(245,166,35,0.1)] text-[#F5A623]"
                            : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
                        }`}
                        onClick={() => setPackagesOpen((value) => !value)}
                        type="button"
                      >
                        <span className="w-4 text-center">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        <span className="text-[10px]">
                          {isOpen ? "⌃" : "⌄"}
                        </span>
                      </button>
                      {isOpen ? (
                        <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-2">
                          {item.children.map(([icon, label, href]) => {
                            const childUrl = new URL(href, "http://localhost");
                            const childView =
                              childUrl.searchParams.get("view") || "plans";
                            const childActive =
                              pathname === childUrl.pathname &&
                              investmentView === childView;

                            return (
                              <Link
                                className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-[13px] transition ${
                                  childActive
                                    ? "bg-white/[0.06] text-white"
                                    : "text-white/38 hover:bg-white/[0.04] hover:text-white/75"
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
                      ) : null}
                    </div>
                  );
                }

                const [icon, label, href] = item;
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

      <div className="border-t border-white/[0.06] pt-4">
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
