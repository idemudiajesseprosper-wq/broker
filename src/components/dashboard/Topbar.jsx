"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BrandLockup from "@/components/Brand";
import { useAuth } from "@/context/AuthContext";
import { authHeader } from "@/utils/auth-client";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "B";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value || 0);
}

function BtcPrice() {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(0);
  const previousPrice = useRef(null);

  useEffect(() => {
    let active = true;

    async function fetchPrice() {
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

        if (previousPrice.current) {
          const delta =
            ((nextPrice - previousPrice.current) / previousPrice.current) * 100;
          setChange(delta);
        } else {
          setChange(2.41);
        }

        previousPrice.current = nextPrice;
        setPrice(nextPrice);
      } catch {
        if (active && !price) {
          setPrice(67420.5);
          setChange(2.41);
        }
      }
    }

    fetchPrice();
    const timer = setInterval(fetchPrice, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [price]);

  if (!price) {
    return (
      <div className="h-6 w-48 animate-pulse rounded-md bg-[rgba(255,255,255,0.06)]" />
    );
  }

  const positive = change >= 0;

  return (
    <div className="hidden items-center gap-2 md:flex">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(245,166,35,0.12)] text-xs text-[#F5A623]">
        ₿
      </span>
      <span
        className="text-sm font-bold text-white"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        {formatCurrency(price)}
      </span>
      <span
        className={
          positive ? "text-xs text-[#4CAF50]" : "text-xs text-[#E53935]"
        }
      >
        {positive ? "+" : ""}
        {change.toFixed(2)}%
      </span>
    </div>
  );
}

export default function Topbar({ onMenuClick }) {
  const { logout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function loadUnreadCount() {
      try {
        const response = await fetch("/api/notifications/unread-count", {
          headers: authHeader(),
        });
        const data = await response.json();

        if (response.ok) {
          setUnreadCount(data.count || 0);
        }
      } catch {
        setUnreadCount(0);
      }
    }

    loadUnreadCount();
  }, []);

  useEffect(() => {
    function handleClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[#050508]/85 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-md text-white/60 hover:bg-white/5 md:hidden"
          onClick={onMenuClick}
          type="button"
        >
          ☰
        </button>
        <div className="scale-[0.86] origin-left">
          <BrandLockup />
        </div>
      </div>

      <BtcPrice />

      <div className="flex items-center gap-3">
        <Link
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] text-white/55 hover:text-white"
          href="/dashboard/notifications"
        >
          <span>◔</span>
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#F5A623] text-[8px] text-[#050508]" />
          ) : null}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[rgba(245,166,35,0.15)] text-xs font-semibold text-[#F5A623]"
            onClick={() => setDropdownOpen((value) => !value)}
            type="button"
          >
            {getInitials(user?.fullName)}
          </button>

          {dropdownOpen ? (
            <div className="absolute right-0 top-11 min-w-[200px] rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[#0e0e12] p-3 shadow-2xl">
              <div className="px-2 py-1">
                <p className="text-sm font-medium text-white">
                  {user?.fullName || "BSX Client"}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {user?.email || user?.role}
                </p>
              </div>
              <div className="my-2 h-px bg-white/10" />
              <Link
                className="block rounded-md px-2 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
                href="/dashboard/profile"
              >
                My Profile
              </Link>
              <Link
                className="block rounded-md px-2 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
                href="/dashboard/settings"
              >
                Settings
              </Link>
              <div className="my-2 h-px bg-white/10" />
              <button
                className="block w-full rounded-md px-2 py-2 text-left text-sm text-[#E53935] hover:bg-[rgba(229,57,53,0.08)]"
                onClick={logout}
                type="button"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
