export default function AmbientBg() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050508]"
    >
      <div className="absolute inset-0 opacity-100 [background-image:linear-gradient(rgba(245,166,35,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,166,35,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="orb-drift absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-[#F5A623] opacity-[0.18] blur-[80px]" />
      <div className="orb-drift-delayed absolute right-[10%] top-[32%] h-80 w-80 rounded-full bg-[#E8C84A] opacity-[0.16] blur-[80px]" />
      <div className="orb-drift-slow absolute bottom-[8%] left-[36%] h-64 w-64 rounded-full bg-[#C87816] opacity-[0.14] blur-[80px]" />
      <style>{`
        @keyframes orbDrift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(32px, -24px, 0) scale(1.08);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tickerScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes blinkGold {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.25;
          }
        }

        .orb-drift {
          animation: orbDrift 12s ease-in-out infinite;
        }

        .orb-drift-delayed {
          animation: orbDrift 15s ease-in-out infinite;
          animation-delay: -4s;
        }

        .orb-drift-slow {
          animation: orbDrift 18s ease-in-out infinite;
          animation-delay: -8s;
        }

        .fade-up {
          animation: fadeUp 0.7s ease both;
        }

        .ticker-track {
          animation: tickerScroll 22s linear infinite;
        }

        .blink-dot {
          animation: blinkGold 1.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
