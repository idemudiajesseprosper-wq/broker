"use client";

import Link from "next/link";
import { useState } from "react";
import BrandLockup from "@/components/Brand";

const navLinks = [
  ["Markets", "/markets"],
  ["Plans", "/plans"],
  ["About", "/about"],
  ["Security", "/security"],
];

export default function PublicNav({ sticky = false }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className={`${sticky ? "fixed inset-x-0 top-0" : "relative"} z-50 border-b border-[rgba(245,166,35,0.12)] bg-[#050508]/80 backdrop-blur-xl`}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-5">
          <BrandLockup />
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(([label, href]) => (
              <Link
                className="text-sm text-[rgba(255,255,255,0.55)] transition hover:text-[#F5A623]"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-white/70 transition hover:border-[rgba(245,166,35,0.25)] hover:text-white"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-4 py-2 text-sm font-semibold text-[#050508] transition hover:brightness-110"
              href="/register"
            >
              Get started
            </Link>
          </div>
          <button
            aria-label="Toggle navigation"
            className="flex h-10 min-w-16 items-center justify-center rounded-md border border-white/10 px-3 text-xs font-medium text-white/70 md:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {open ? (
          <div className="border-t border-white/[0.06] bg-[#08080c] px-4 py-4 md:hidden">
            <div className="grid gap-2">
              {navLinks.map(([label, href]) => (
                <Link
                  className="rounded-md px-3 py-3 text-sm text-white/65 transition hover:bg-white/[0.04] hover:text-[#F5A623]"
                  href={href}
                  key={href}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-3 text-center text-sm text-white/70"
                href="/login"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
              <Link
                className="rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-4 py-3 text-center text-sm font-semibold text-[#050508]"
                href="/register"
                onClick={() => setOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        ) : null}
      </nav>
      {sticky ? <div aria-hidden="true" className="h-[76px]" /> : null}
    </>
  );
}
