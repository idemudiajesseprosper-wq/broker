import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PageHeader({ eyebrow = "BSX Dashboard", title, description }) {
  return (
    <header className="mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#F5A623]">
        {eyebrow}
      </p>
      <h1
        className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/48">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function DashboardCard({ children, className }) {
  return (
    <section
      className={cn(
        "rounded-[10px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = "#F5A623",
}) {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/38">
            {label}
          </p>
          <p
            className="mt-3 text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {value}
          </p>
          {detail ? (
            <p className="mt-2 text-xs text-white/42">{detail}</p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
            style={{
              backgroundColor: `${accent}1f`,
              color: accent,
            }}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </DashboardCard>
  );
}

export function StatusBadge({ status }) {
  const value = status || "pending";
  const styles = {
    active: "border-[#4CAF50]/25 bg-[#4CAF50]/10 text-[#86efac]",
    approved: "border-[#4CAF50]/25 bg-[#4CAF50]/10 text-[#86efac]",
    completed: "border-[#4CAF50]/25 bg-[#4CAF50]/10 text-[#86efac]",
    failed: "border-[#E53935]/25 bg-[#E53935]/10 text-[#ff8a86]",
    pending: "border-[#F5A623]/25 bg-[#F5A623]/10 text-[#F5A623]",
    rejected: "border-[#E53935]/25 bg-[#E53935]/10 text-[#ff8a86]",
    suspended: "border-[#E53935]/25 bg-[#E53935]/10 text-[#ff8a86]",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        styles[value] || "border-white/10 bg-white/5 text-white/58",
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function LoadingState({ label = "Loading dashboard data..." }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.025]">
      <div className="flex items-center gap-3 text-sm text-white/55">
        <Loader2 className="h-5 w-5 animate-spin text-[#F5A623]" />
        {label}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[10px] border border-dashed border-white/12 bg-black/15 p-8 text-center">
      <AlertCircle className="mx-auto h-8 w-8 text-[#F5A623]" />
      <h2 className="mt-4 text-base font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
        {description}
      </p>
    </div>
  );
}
