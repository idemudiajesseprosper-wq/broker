import { ArrowRight, BellRing, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import BrandLockup from "@/components/Brand";

const footerGroups = [
  {
    title: "Platform",
    links: [
      ["Investment Plans", "/plans"],
      ["Markets", "/markets"],
      ["Security", "/security"],
      ["About BSX", "/about"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Create Account", "/register"],
      ["Sign In", "/login"],
      ["Verify Email", "/verify-email"],
      ["Dashboard", "/dashboard"],
    ],
  },
];

const trustItems = [
  {
    label: "Encrypted sessions",
    icon: LockKeyhole,
  },
  {
    label: "Identity-aware access",
    icon: ShieldCheck,
  },
  {
    label: "Live account alerts",
    icon: BellRing,
  },
];

export default function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[rgba(255,255,255,0.06)] bg-[#050508] px-5 pt-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5A623]/50 to-transparent" />
      <div className="absolute right-0 top-0 h-64 w-64 translate-x-24 -translate-y-24 rounded-full bg-[#F5A623]/[0.06]" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 rounded-[10px] border border-[rgba(245,166,35,0.18)] bg-[rgba(245,166,35,0.055)] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-7">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#F5A623]">
              Ready to start?
            </p>
            <h2
              className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Build your Bitcoin investment account with guided funding,
              records, and support.
            </h2>
          </div>
          <Link
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-5 py-3 text-sm font-semibold text-[#050508] transition hover:brightness-110 md:w-auto"
            href="/register"
          >
            Start investing
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[1.15fr_1fr_0.9fr]">
          <div>
            <BrandLockup />
            <p className="mt-6 max-w-md text-sm leading-7 text-[rgba(255,255,255,0.48)]">
              BSX Capital Exchange gives verified investors a focused place to
              fund wallets, choose Bitcoin plans, review activity, and manage
              account actions with clarity.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Managed plans", "Fast workflows", "Clear records"].map(
                (item) => (
                  <span
                    className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[rgba(255,255,255,0.55)]"
                    key={item}
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-8">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5A623]">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        className="text-sm text-[rgba(255,255,255,0.52)] transition hover:text-white"
                        href={href}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5A623]">
              Trust Layer
            </h3>
            <ul className="mt-5 space-y-4">
              {trustItems.map((item) => {
                const Icon = item.icon;

                return (
                  <li
                    className="flex items-center gap-3 text-sm text-[rgba(255,255,255,0.58)]"
                    key={item.label}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(245,166,35,0.1)] text-[#F5A623]">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    {item.label}
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-5 text-xs leading-6 text-[rgba(255,255,255,0.42)]">
              Keep your credentials private. Investment activity and account
              requests should always be reviewed from your secure dashboard.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.06)] py-6 text-xs text-[rgba(255,255,255,0.38)] sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 BSX Capital Exchange. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4CAF50]" />
            256-bit SSL encrypted
          </p>
        </div>
      </div>
    </footer>
  );
}
