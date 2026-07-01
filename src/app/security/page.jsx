import {
  PageHero,
  default as PublicPageShell,
  SectionCard,
} from "@/components/PublicPageShell";

const controls = [
  [
    "JWT protected routes",
    "Dashboard sessions are checked before private routes load.",
  ],
  [
    "KYC verification",
    "Identity status can control access to account actions.",
  ],
  [
    "Provider secrets",
    "MongoDB and JWT secrets stay in environment variables.",
  ],
  [
    "Webhook signing",
    "Payment callbacks can be verified before account updates.",
  ],
  ["Notifications", "Account activity can trigger email or dashboard alerts."],
  [
    "Admin controls",
    "Broker and admin roles can review sensitive account events.",
  ],
];

export default function SecurityPage() {
  return (
    <PublicPageShell>
      <PageHero
        actionHref="/register"
        actionLabel="Create secure account"
        eyebrow="Security"
        title="Protection across identity, payments, and account access."
      >
        BSX security is layered around verified users, protected sessions,
        controlled role access, and auditable account workflows.
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {controls.map(([title, description]) => (
          <SectionCard key={title}>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(76,175,80,0.12)] text-sm font-bold text-[#4CAF50]">
              OK
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/45">
              {description}
            </p>
          </SectionCard>
        ))}
      </section>
    </PublicPageShell>
  );
}
