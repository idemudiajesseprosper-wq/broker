import { cn } from "@/lib/utils";

export function Card({ children, className }) {
  return (
    <section
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
