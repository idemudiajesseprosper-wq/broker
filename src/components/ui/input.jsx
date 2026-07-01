import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#d7ff45]/60",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ children, className, ...props }) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-white/10 bg-[#111316] px-3 text-sm text-white outline-none transition focus:border-[#d7ff45]/60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
