import Link from "next/link";
import {
  PageHero,
  default as PublicPageShell,
  SectionCard,
} from "@/components/PublicPageShell";

const plans = [
  ["Starter", "$100 - $999", "8%", "7 days"],
  ["Growth", "$1,000 - $9,999", "15%", "14 days"],
  ["VIP", "$10,000 - $100,000", "25%", "30 days"],
];

export default function PlansPage() {
  return (
    <PublicPageShell>
      <PageHero
        actionHref="/register"
        actionLabel="Start with BSX"
        eyebrow="Investment plans"
        title="Choose a Bitcoin plan that fits your capital."
      >
        Compare structured broker plans with clear minimums, projected returns,
        and holding periods before funding your account.
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-20 md:grid-cols-3">
        {plans.map(([name, range, returnRate, duration]) => (
          <SectionCard className="flex flex-col" key={name}>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#F5A623]">
              {name}
            </p>
            <h2 className="mt-5 text-3xl font-bold text-white">{range}</h2>
            <div className="mt-6 grid gap-3 text-sm">
              <p className="flex justify-between border-b border-white/[0.06] pb-3 text-white/50">
                <span>Projected return</span>
                <span className="font-semibold text-[#4CAF50]">
                  {returnRate}
                </span>
              </p>
              <p className="flex justify-between border-b border-white/[0.06] pb-3 text-white/50">
                <span>Duration</span>
                <span className="font-semibold text-white">{duration}</span>
              </p>
              <p className="text-white/45">
                Includes verified-account funding, transparent transaction
                records, and dashboard balance tracking.
              </p>
            </div>
            <Link
              className="mt-8 inline-flex justify-center rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-5 py-3 text-sm font-semibold text-[#050508] transition hover:brightness-110"
              href="/register"
            >
              Select plan
            </Link>
          </SectionCard>
        ))}
      </section>
    </PublicPageShell>
  );
}
