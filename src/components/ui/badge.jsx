import { cn } from "@/lib/utils";

const tones = {
  active: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  approved: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  pending: "border-amber-300/30 bg-amber-400/10 text-amber-200",
  rejected: "border-rose-300/30 bg-rose-400/10 text-rose-200",
  suspended: "border-rose-300/30 bg-rose-400/10 text-rose-200",
  default: "border-white/15 bg-white/5 text-white/70",
};

export function Badge({ children, className, tone = "default" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        tones[tone] || tones.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
