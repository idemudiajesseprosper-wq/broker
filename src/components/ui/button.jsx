import { cn } from "@/lib/utils";

const variants = {
  default: "bg-[#d7ff45] text-[#11140c] hover:bg-[#e6ff78]",
  danger: "bg-[#ff6464] text-white hover:bg-[#ff7777]",
  ghost: "bg-transparent text-white hover:bg-white/10",
  outline: "border border-white/15 bg-white/5 text-white hover:bg-white/10",
};

export function Button({
  children,
  className,
  type = "button",
  variant = "default",
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
