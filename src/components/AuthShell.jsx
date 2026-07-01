import AmbientBg from "@/components/AmbientBg";
import { LogoMark } from "@/components/Brand";
import PublicNav from "@/components/PublicNav";

export default function AuthShell({
  children,
  eyebrow,
  maxWidth = "max-w-[420px]",
  showNav = false,
  subtitle,
  stickyNav = false,
  title,
}) {
  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <AmbientBg />
      {showNav ? <PublicNav sticky={stickyNav} /> : null}
      <div
        className={`relative flex ${showNav ? "min-h-[calc(100vh-76px)]" : "min-h-screen"} items-center justify-center px-5 py-10`}
      >
        <section
          className={`fade-up w-full ${maxWidth} rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9`}
        >
          <LogoMark centered />
          <div className="mt-6 text-center">
            {eyebrow ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#F5A623]">
                {eyebrow}
              </p>
            ) : null}
            <h1
              className="mt-2 text-[22px] font-bold text-white"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {title}
            </h1>
            <p className="mt-2 text-[13px] leading-5 text-[rgba(255,255,255,0.4)]">
              {subtitle}
            </p>
          </div>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
