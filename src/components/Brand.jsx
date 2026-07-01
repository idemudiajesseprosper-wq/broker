import Link from "next/link";

export function LogoMark({ centered = false }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#F5A623] to-[#E8C84A] text-lg font-black text-[#050508] shadow-[0_0_30px_rgba(245,166,35,0.25)] ${centered ? "mx-auto" : ""}`}
      style={{ fontFamily: "var(--font-syne)" }}
    >
      B
    </div>
  );
}

export default function BrandLockup() {
  return (
    <Link className="flex items-center gap-3" href="/">
      <LogoMark />
      <span className="leading-none">
        <span
          className="block text-sm font-extrabold tracking-wide text-white"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          BSX Capital
        </span>
        <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.28em] text-[#F5A623]">
          Exchange
        </span>
      </span>
    </Link>
  );
}
