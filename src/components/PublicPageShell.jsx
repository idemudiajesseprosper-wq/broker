import Link from "next/link";
import AmbientBg from "@/components/AmbientBg";
import PublicFooter from "@/components/PublicFooter";
import PublicNav from "@/components/PublicNav";

export function SectionCard({ children, className = "" }) {
  return (
    <article
      className={`rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] p-5 sm:p-6 ${className}`}
    >
      {children}
    </article>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
  actionHref,
  actionLabel,
}) {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-10 pt-14 text-center sm:pb-14 sm:pt-20">
      <p className="fade-up text-xs font-medium uppercase tracking-[0.28em] text-[#F5A623]">
        {eyebrow}
      </p>
      <h1
        className="fade-up mx-auto mt-5 max-w-4xl text-[34px] font-extrabold leading-tight text-white sm:text-[52px]"
        style={{ animationDelay: "0.1s", fontFamily: "var(--font-syne)" }}
      >
        {title}
      </h1>
      <p
        className="fade-up mx-auto mt-5 max-w-2xl text-sm font-light leading-7 text-white/50 sm:text-base"
        style={{ animationDelay: "0.2s" }}
      >
        {children}
      </p>
      {actionHref ? (
        <Link
          className="fade-up mt-8 inline-flex rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-5 py-3 text-sm font-semibold text-[#050508] transition hover:brightness-110"
          href={actionHref}
          style={{ animationDelay: "0.3s" }}
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}

export default function PublicPageShell({ children }) {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#050508] text-white"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <AmbientBg />
      <PublicNav />
      {children}
      <PublicFooter />
    </main>
  );
}
