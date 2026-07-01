import {
  PageHero,
  default as PublicPageShell,
  SectionCard,
} from "@/components/PublicPageShell";

const marketRows = [
  ["BTC/USD", "$68,420.50", "+2.41%", "$42.8B"],
  ["BTC/NGN", "NGN 102.6M", "+1.90%", "NGN 64.2T"],
  ["BTC Dominance", "52.1%", "+0.30%", "Live"],
];

const accessItems = [
  "Live Bitcoin pricing for investment records",
  "NGN and USD market views for local funding decisions",
  "Clear market context before selecting a plan",
];

export default function MarketsPage() {
  return (
    <PublicPageShell>
      <PageHero
        actionHref="/register"
        actionLabel="Create account"
        eyebrow="Markets"
        title="Track Bitcoin markets before you invest."
      >
        Follow the core BTC pairs, volume signals, and broker-side market
        context used across BSX Capital Exchange investment workflows.
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-20 md:grid-cols-[1.4fr_0.8fr]">
        <SectionCard className="overflow-hidden p-0">
          <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-white">
              Featured markets
            </h2>
            <p className="mt-1 text-xs text-white/40">
              Indicative prices for investor planning.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-white/35">
                <tr>
                  <th className="px-5 py-4 sm:px-6">Market</th>
                  <th className="px-5 py-4 sm:px-6">Price</th>
                  <th className="px-5 py-4 sm:px-6">Change</th>
                  <th className="px-5 py-4 sm:px-6">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {marketRows.map(([market, price, change, volume]) => (
                  <tr className="text-white/70" key={market}>
                    <td className="px-5 py-5 font-medium text-white sm:px-6">
                      {market}
                    </td>
                    <td className="px-5 py-5 sm:px-6">{price}</td>
                    <td className="px-5 py-5 text-[#4CAF50] sm:px-6">
                      {change}
                    </td>
                    <td className="px-5 py-5 sm:px-6">{volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#F5A623]">
            Market access
          </p>
          <h2 className="mt-4 text-2xl font-bold text-white">
            Built for focused Bitcoin decisions.
          </h2>
          <div className="mt-6 grid gap-3">
            {accessItems.map((item) => (
              <p
                className="rounded-md border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-sm text-white/55"
                key={item}
              >
                {item}
              </p>
            ))}
          </div>
        </SectionCard>
      </section>
    </PublicPageShell>
  );
}
