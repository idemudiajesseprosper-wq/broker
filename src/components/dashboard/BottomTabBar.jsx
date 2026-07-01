"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["▦", "Home", "/dashboard"],
  ["⌁", "Invest", "/dashboard/investments"],
  ["↓", "Deposit", "/dashboard/deposit"],
  ["▤", "History", "/dashboard/transactions"],
  ["◉", "Profile", "/dashboard/profile"],
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 grid h-[60px] grid-cols-5 border-t border-[rgba(255,255,255,0.07)] bg-[#050508]/95 backdrop-blur-xl md:hidden">
      {tabs.map(([icon, label, href]) => {
        const isActive =
          href === "/dashboard"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] ${
              isActive ? "text-[#F5A623]" : "text-white/35"
            }`}
            href={href}
            key={href}
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
