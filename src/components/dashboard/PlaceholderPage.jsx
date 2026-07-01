export default function PlaceholderPage({ description, title }) {
  return (
    <section className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] p-8">
      <p className="text-sm font-medium text-[#F5A623]">BSX Dashboard</p>
      <h1
        className="mt-3 text-3xl font-bold text-white"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
        {description}
      </p>
    </section>
  );
}
