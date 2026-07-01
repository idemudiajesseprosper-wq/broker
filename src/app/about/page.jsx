import {
  PageHero,
  default as PublicPageShell,
  SectionCard,
} from "@/components/PublicPageShell";

const values = [
  [
    "Verified access",
    "Client accounts are built around identity checks before full platform access.",
  ],
  [
    "Manual oversight",
    "Broker workflows keep deposits, withdrawals, and plans visible to the operations team.",
  ],
  [
    "Transparent records",
    "Users can review balances, investment activity, and account updates from the dashboard.",
  ],
];

export default function AboutPage() {
  return (
    <PublicPageShell>
      <PageHero
        actionHref="/register"
        actionLabel="Open account"
        eyebrow="About"
        title="A Bitcoin broker built around managed investing."
      >
        BSX Capital Exchange helps verified clients access structured Bitcoin
        investment plans through a focused broker portal.
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-20 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#F5A623]">
            Our position
          </p>
          <h2 className="mt-4 text-3xl font-bold text-white">
            Simple account tools for serious Bitcoin investors.
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/50">
            The platform is designed for clients who want clear plan terms,
            account verification, funding records, and broker support without a
            cluttered trading interface.
          </p>
        </SectionCard>

        <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
          {values.map(([title, description]) => (
            <SectionCard key={title}>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/45">
                {description}
              </p>
            </SectionCard>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
