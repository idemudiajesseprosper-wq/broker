"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  ChevronDown,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Timer,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PublicFooter from "@/components/PublicFooter";

/* ---------------------------------------------------------------------- */
/* Simulated market data engine                                           */
/* ---------------------------------------------------------------------- */

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makeCandles(n, start, seed) {
  const rand = seededRandom(seed);
  let price = start;
  const arr = [];
  for (let i = 0; i < n; i++) {
    const open = price;
    const vol = start * 0.0055;
    const close = open + (rand() - 0.49) * vol;
    const high = Math.max(open, close) + rand() * vol * 0.6;
    const low = Math.min(open, close) - rand() * vol * 0.6;
    arr.push({ open, close, high, low, i });
    price = close;
  }
  return arr;
}

function makeSeries(n, start, seed, drift = 1) {
  const rand = seededRandom(seed);
  let price = start;
  const arr = [];
  for (let i = 0; i < n; i++) {
    price += (rand() - 0.46) * start * 0.004 * drift;
    arr.push({ t: i, price: Math.max(price, start * 0.6) });
  }
  return arr;
}

const PAIRS = [
  { symbol: "BTC/USD", name: "Bitcoin", start: 68420, seed: 11, drift: 1 },
  { symbol: "ETH/USD", name: "Ethereum", start: 3640, seed: 27, drift: 1.3 },
  { symbol: "SOL/USD", name: "Solana", start: 168, seed: 42, drift: 1.7 },
  { symbol: "XRP/USD", name: "XRP", start: 0.62, seed: 63, drift: 0.9 },
];

const TIMEFRAMES = ["1H", "4H", "1D", "1W"];

const tickerItems = [
  ["BTC/USD", "$68,420", "+2.8%"],
  ["ETH/USD", "$3,640", "+1.4%"],
  ["SOL/USD", "$168.20", "+5.1%"],
  ["XRP/USD", "$0.62", "-0.6%"],
  ["BTC/NGN", "NGN 102.6M", "+1.9%"],
  ["24H VOL", "$42.8B", "+6.4%"],
  ["DOMINANCE", "52.1%", "+0.3%"],
];

const stats = [
  ["$248M+", "Total volume traded"],
  ["12,400+", "Active investors"],
  ["98.7%", "Withdrawal success rate"],
];

const features = [
  [
    "K",
    "KYC-verified accounts",
    "Trade through protected accounts with document-backed identity checks.",
  ],
  [
    "R",
    "Fixed return plans",
    "Choose structured Bitcoin investment plans with clear terms and durations.",
  ],
  [
    "W",
    "Fast withdrawals",
    "Submit withdrawal requests with transparent processing and status tracking.",
  ],
  [
    "B",
    "Live BTC pricing",
    "Investment entries use live Bitcoin pricing for accurate position records.",
  ],
  [
    "M",
    "Mobile-first portal",
    "Manage balances, KYC, deposits, and plans from any modern device.",
  ],
  [
    "S",
    "Dedicated support",
    "Get direct assistance for account, funding, and investment questions.",
  ],
];

const howItWorks = [
  {
    title: "Register",
    description:
      "Create your BSX Capital Exchange account with your basic details and secure login credentials.",
    detail: "A few minutes",
  },
  {
    title: "Verify account",
    description:
      "Complete identity checks when required so your account is protected and ready for deposits.",
    detail: "KYC by activity",
  },
  {
    title: "Fund your wallet",
    description:
      "Add funds through the available deposit options and track each payment from your dashboard.",
    detail: "Transparent records",
  },
  {
    title: "Start investing",
    description:
      "Choose a Bitcoin investment plan, monitor active positions, and follow your returns in one place.",
    detail: "Clear terms",
  },
];

const platformFeatures = [
  {
    title: "Personal dashboard",
    description:
      "See balances, active plans, account status, and recent activity from one organized investor workspace.",
    detail: "Portfolio snapshot",
    icon: LayoutDashboard,
    accent: "#38BDF8",
    size: "md:col-span-2 lg:col-span-2",
  },
  {
    title: "Deposit funds",
    description:
      "Start deposits from your dashboard and keep each funding request tied to a clear transaction record.",
    detail: "Simple funding flow",
    icon: Wallet,
    accent: "#F5A623",
    size: "",
  },
  {
    title: "Withdrawal requests",
    description:
      "Request withdrawals, follow processing updates, and keep payout activity visible from submission to completion.",
    detail: "Status tracking",
    icon: ArrowUpRight,
    accent: "#16C784",
    size: "",
  },
  {
    title: "Transaction history",
    description:
      "Review deposits, withdrawals, investment entries, and account movements without digging through messages.",
    detail: "Clean records",
    icon: ReceiptText,
    accent: "#A78BFA",
    size: "",
  },
  {
    title: "Referral program",
    description:
      "Share your invite link, track referred users, and monitor eligible referral rewards from your account.",
    detail: "Growth rewards",
    icon: Users,
    accent: "#FB7185",
    size: "md:col-span-2 lg:col-span-1",
  },
  {
    title: "Live notifications",
    description:
      "Receive timely account alerts for important activity such as funding updates, plan changes, and requests.",
    detail: "Never miss updates",
    icon: BellRing,
    accent: "#22D3EE",
    size: "",
  },
  {
    title: "Account security",
    description:
      "Protect account access with identity-aware workflows, secure sessions, and guarded account actions.",
    detail: "Built for trust",
    icon: ShieldCheck,
    accent: "#FACC15",
    size: "",
  },
  {
    title: "Mobile friendly",
    description:
      "Manage your wallet, plans, notifications, and account settings from modern phones and tablets.",
    detail: "Works anywhere",
    icon: Smartphone,
    accent: "#60A5FA",
    size: "md:col-span-2",
  },
];

const faqs = [
  {
    question: "How do I register?",
    answer:
      "Create an account from the registration page, add your basic details, and confirm your access credentials. Once your profile is created, you can continue to verification when it is required for your account.",
    icon: UserPlus,
    accent: "#38BDF8",
  },
  {
    question: "How do I deposit?",
    answer:
      "Sign in to your dashboard, open the deposit area, enter the amount you want to fund, and follow the payment instructions shown for your account. Your deposit request remains visible in your records for tracking.",
    icon: CreditCard,
    accent: "#F5A623",
  },
  {
    question: "How long do withdrawals take?",
    answer:
      "Withdrawal timing depends on account review, payout queue, and network conditions. You can submit a withdrawal request from your dashboard and monitor its status until it is completed.",
    icon: Timer,
    accent: "#16C784",
  },
  {
    question: "Is my account secure?",
    answer:
      "BSX Capital Exchange uses secure account sessions, identity-aware workflows, and protected dashboard actions to reduce unauthorized access. Keep your login details private and use accurate profile information.",
    icon: LockKeyhole,
    accent: "#A78BFA",
  },
  {
    question: "How do I contact support?",
    answer:
      "Use the available support channel from your account or public contact options to reach the team. Include the relevant transaction, deposit, withdrawal, or account details so your request can be reviewed faster.",
    icon: Mail,
    accent: "#FB7185",
  },
];

function fmt(n, d = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

/* ---------------------------------------------------------------------- */
/* Candlestick chart                                                      */
/* ---------------------------------------------------------------------- */

function CandlestickChart({ data, height = 320 }) {
  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);

  const { min, max } = useMemo(() => {
    const highs = data.map((d) => d.high);
    const lows = data.map((d) => d.low);
    const hi = Math.max(...highs);
    const lo = Math.min(...lows);
    const pad = (hi - lo) * 0.12;
    return { min: lo - pad, max: hi + pad };
  }, [data]);

  const width = 1000;
  const candleSlot = width / data.length;
  const candleW = Math.max(2, candleSlot * 0.58);

  const scaleY = (v) => height - ((v - min) / (max - min)) * height;

  const handleMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    let idx = Math.floor(x / candleSlot);
    idx = Math.max(0, Math.min(data.length - 1, idx));
    setHover(idx);
  };

  const hoverCandle = hover !== null ? data[hover] : data[data.length - 1];
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div
      ref={wrapRef}
      className="relative w-full select-none"
      style={{ height }}
      aria-label="Interactive market chart"
      role="application"
      onMouseMove={handleMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        aria-hidden="true"
      >
        {gridLines.map((g) => (
          <line
            key={g}
            x1="0"
            x2={width}
            y1={height * g}
            y2={height * g}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}
        {data.map((c, idx) => {
          const isUp = c.close >= c.open;
          const color = isUp ? "#16C784" : "#EA3943";
          const x = idx * candleSlot + candleSlot / 2;
          const bodyTop = scaleY(Math.max(c.open, c.close));
          const bodyBottom = scaleY(Math.min(c.open, c.close));
          const bodyH = Math.max(1.4, bodyBottom - bodyTop);
          const dimmed = hover !== null && hover !== idx;
          return (
            <g
              key={c.i}
              opacity={dimmed ? 0.38 : 1}
              style={{ transition: "opacity 0.15s" }}
            >
              <line
                x1={x}
                x2={x}
                y1={scaleY(c.high)}
                y2={scaleY(c.low)}
                stroke={color}
                strokeWidth="1.4"
              />
              <rect
                x={x - candleW / 2}
                y={bodyTop}
                width={candleW}
                height={bodyH}
                fill={color}
                rx="1"
              />
            </g>
          );
        })}
        {hover !== null && (
          <line
            x1={hover * candleSlot + candleSlot / 2}
            x2={hover * candleSlot + candleSlot / 2}
            y1="0"
            y2={height}
            stroke="rgba(245,166,35,0.35)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )}
      </svg>

      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(5,5,8,0.85)] px-3 py-2 font-mono text-[11px] text-white/70 backdrop-blur">
        <span>
          O <b className="text-white">{fmt(hoverCandle.open)}</b>
        </span>
        <span>
          H <b className="text-[#16C784]">{fmt(hoverCandle.high)}</b>
        </span>
        <span>
          L <b className="text-[#EA3943]">{fmt(hoverCandle.low)}</b>
        </span>
        <span>
          C <b className="text-white">{fmt(hoverCandle.close)}</b>
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Order book depth widget                                                */
/* ---------------------------------------------------------------------- */

function OrderBook({ base, seed }) {
  const rows = useMemo(() => {
    const rand = seededRandom(seed);
    const bids = [];
    const asks = [];
    let cumB = 0;
    let cumA = 0;
    for (let i = 0; i < 6; i++) {
      const bSize = rand() * 1.8 + 0.15;
      const aSize = rand() * 1.8 + 0.15;
      cumB += bSize;
      cumA += aSize;
      bids.push({
        price: base - i * base * 0.00035 - rand() * 3,
        size: bSize,
        cum: cumB,
      });
      asks.push({
        price: base + i * base * 0.00035 + rand() * 3,
        size: aSize,
        cum: cumA,
      });
    }
    const maxCum = Math.max(cumB, cumA);
    return { bids, asks, maxCum };
  }, [base, seed]);

  return (
    <div className="font-mono text-[11px]">
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/35">
        <span>Price</span>
        <span>Size</span>
      </div>
      {rows.asks
        .slice()
        .reverse()
        .map((r) => (
          <div
            key={`ask-${r.price}-${r.size}`}
            className="relative flex justify-between py-[3px]"
          >
            <span
              className="absolute right-0 top-0 h-full bg-[rgba(234,57,67,0.12)]"
              style={{ width: `${(r.cum / rows.maxCum) * 100}%` }}
            />
            <span className="relative z-10 text-[#EA3943]">
              {fmt(r.price, r.price < 10 ? 4 : 2)}
            </span>
            <span className="relative z-10 text-white/55">
              {fmt(r.size, 3)}
            </span>
          </div>
        ))}
      <div className="my-1.5 border-t border-[rgba(255,255,255,0.08)]" />
      {rows.bids.map((r) => (
        <div
          key={`bid-${r.price}-${r.size}`}
          className="relative flex justify-between py-[3px]"
        >
          <span
            className="absolute right-0 top-0 h-full bg-[rgba(22,199,132,0.12)]"
            style={{ width: `${(r.cum / rows.maxCum) * 100}%` }}
          />
          <span className="relative z-10 text-[#16C784]">
            {fmt(r.price, r.price < 10 ? 4 : 2)}
          </span>
          <span className="relative z-10 text-white/55">{fmt(r.size, 3)}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Animated count-up stat                                                 */
/* ---------------------------------------------------------------------- */

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function CountUp({ value, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [display, setDisplay] = useState(0);
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(numeric * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, numeric]);

  const formatted = value.includes(".")
    ? display.toFixed(1)
    : Math.round(display).toLocaleString("en-US");

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* Ticker tape                                                            */
/* ---------------------------------------------------------------------- */

function TickerItem({ label, value, change }) {
  const isPositive = change.startsWith("+");
  return (
    <span className="mx-8 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]">
      <span className="text-[rgba(255,255,255,0.4)]">{label}</span>
      <span className="font-medium text-white">{value}</span>
      <span className={isPositive ? "text-[#16C784]" : "text-[#EA3943]"}>
        {change}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* Trading tooltip for area chart                                         */
/* ---------------------------------------------------------------------- */

function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].value;
  return (
    <div className="rounded-md border border-[rgba(245,166,35,0.3)] bg-[rgba(5,5,8,0.92)] px-3 py-2 font-mono text-[11px] text-white shadow-lg">
      ${fmt(p)}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main page                                                              */
/* ---------------------------------------------------------------------- */

export default function LandingPage() {
  const [timeframe, setTimeframe] = useState("1D");
  const [pairIdx, setPairIdx] = useState(0);
  const pair = PAIRS[pairIdx];

  const [candles, setCandles] = useState(() =>
    makeCandles(48, pair.start, pair.seed),
  );
  const [livePrice, setLivePrice] = useState(pair.start);
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(pair.start);
  const openRef = useRef(pair.start);

  useEffect(() => {
    const fresh = makeCandles(48, pair.start, pair.seed + timeframe.length);
    setCandles(fresh);
    setLivePrice(pair.start);
    prevPrice.current = pair.start;
    openRef.current = pair.start;
  }, [pair.start, pair.seed, timeframe]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const vol = pair.start * 0.0009;
        const newClose = last.close + (Math.random() - 0.48) * vol;
        const updated = {
          ...last,
          close: newClose,
          high: Math.max(last.high, newClose),
          low: Math.min(last.low, newClose),
        };
        prevPrice.current = livePrice;
        setLivePrice(newClose);
        setFlash(newClose >= prevPrice.current ? "up" : "down");
        return [...prev.slice(0, -1), updated];
      });
    }, 1900);
    return () => clearInterval(interval);
  }, [pair.start, livePrice]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [flash]);

  const changePct = ((livePrice - openRef.current) / openRef.current) * 100;
  const isUp = changePct >= 0;

  const marketSeries = useMemo(
    () =>
      PAIRS.map((p) => ({
        ...p,
        data: makeSeries(60, p.start, p.seed + 100, p.drift),
      })),
    [],
  );
  const [marketTab, setMarketTab] = useState(0);
  const activeSeries = marketSeries[marketTab];

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#050508] text-white"
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-track { animation: tickerScroll 38s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
        @keyframes blinkDot { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
        .blink-dot { animation: blinkDot 1.6s ease-in-out infinite; }
        @keyframes flashGreen { 0% { color: #16C784; } 100% { color: inherit; } }
        @keyframes flashRed { 0% { color: #EA3943; } 100% { color: inherit; } }
        .flash-up { animation: flashGreen 0.7s ease-out; }
        .flash-down { animation: flashRed 0.7s ease-out; }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(245,166,35,0.35); } 100% { box-shadow: 0 0 0 10px rgba(245,166,35,0); } }
        .pulse-ring { animation: pulseRing 2s ease-out infinite; }
      `}</style>

      {/* Ambient background grid + glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,166,35,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute left-1/2 top-[-10%] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#F5A623] opacity-[0.06] blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,8,0.75)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#F5A623] to-[#E8C84A] font-display text-sm font-bold text-[#050508]">
              B
            </span>
            <span className="font-display text-base font-bold tracking-tight">
              BSX <span className="text-[#F5A623]">Capital</span>
            </span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a className="transition hover:text-white" href="#plans">
              Plans
            </a>
            <a className="transition hover:text-white" href="#markets">
              Markets
            </a>
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#faq">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              className="hidden text-sm font-medium text-white/70 transition hover:text-white sm:block"
              href="/login"
            >
              Sign in
            </a>
            <a
              className="rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-4 py-2 text-sm font-semibold text-[#050508] transition hover:brightness-110"
              href="/register"
            >
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          {/* Left copy */}
          <div>
            <div className="fade-up inline-flex items-center gap-2 rounded-full border border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.06)] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#F5A623]">
              <span className="blink-dot h-2 w-2 rounded-full bg-[#F5A623]" />
              Live Bitcoin markets
            </div>
            <h1
              className="fade-up font-display mt-7 text-[34px] font-extrabold leading-[1.05] text-white sm:text-[54px]"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="block">Trade Bitcoin.</span>
              <span className="block text-[#F5A623]">Build wealth.</span>
              <span className="block text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.9)]">
                On your terms.
              </span>
            </h1>
            <p
              className="fade-up mt-6 max-w-lg text-base font-light leading-7 text-[rgba(255,255,255,0.5)]"
              style={{ animationDelay: "0.2s" }}
            >
              BSX Capital Exchange gives verified investors access to managed
              Bitcoin trading plans, fast funding workflows, and transparent
              account records.
            </p>
            <div
              className="fade-up mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "0.3s" }}
            >
              <a
                className="pulse-ring w-full rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-6 py-3 text-center text-sm font-semibold text-[#050508] transition hover:brightness-110 sm:w-auto"
                href="/register"
              >
                Start investing
              </a>
              <a
                className="w-full rounded-md border border-[rgba(255,255,255,0.12)] px-6 py-3 text-center text-sm font-medium text-white/75 transition hover:border-[rgba(245,166,35,0.35)] hover:text-white sm:w-auto"
                href="#plans"
              >
                View plans
              </a>
            </div>

            <div
              className="fade-up mt-10 grid grid-cols-3 gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6"
              style={{ animationDelay: "0.35s" }}
            >
              {stats.map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-xl font-bold text-[#F5A623] sm:text-2xl">
                    <CountUp
                      value={value}
                      prefix={value.startsWith("$") ? "$" : ""}
                      suffix={value.replace(/[0-9.,]/g, "")}
                    />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/40">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: trading terminal widget */}
          <div className="fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#08080d] p-5 shadow-[0_0_60px_rgba(245,166,35,0.05)]">
              {/* Pair selector + price */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {PAIRS.map((p, idx) => (
                    <button
                      key={p.symbol}
                      onClick={() => setPairIdx(idx)}
                      type="button"
                      className={`rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition ${
                        idx === pairIdx
                          ? "bg-[rgba(245,166,35,0.15)] text-[#F5A623]"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {p.symbol}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 rounded-md border border-[rgba(255,255,255,0.08)] p-1">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      type="button"
                      className={`rounded px-2 py-1 font-mono text-[11px] font-medium transition ${
                        tf === timeframe
                          ? "bg-[#F5A623] text-[#050508]"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span
                  className={`font-mono text-3xl font-semibold ${
                    flash === "up"
                      ? "flash-up"
                      : flash === "down"
                        ? "flash-down"
                        : "text-white"
                  }`}
                >
                  ${fmt(livePrice)}
                </span>
                <span
                  className={`flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs font-semibold ${
                    isUp
                      ? "bg-[rgba(22,199,132,0.12)] text-[#16C784]"
                      : "bg-[rgba(234,57,67,0.12)] text-[#EA3943]"
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {fmt(Math.abs(changePct))}%
                </span>
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/35">
                  <Activity className="h-3 w-3 text-[#16C784]" />
                  Live
                </span>
              </div>

              {/* Candles */}
              <div className="mt-4">
                <CandlestickChart data={candles} height={260} />
              </div>

              {/* Order book + trade buttons */}
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-4 border-t border-[rgba(255,255,255,0.07)] pt-4">
                <OrderBook base={livePrice} seed={pair.seed} />
                <div className="flex flex-col justify-center gap-2">
                  <a
                    href="/register"
                    className="rounded-md bg-[rgba(22,199,132,0.14)] px-5 py-2.5 text-center font-mono text-xs font-semibold text-[#16C784] transition hover:bg-[rgba(22,199,132,0.22)]"
                  >
                    Buy
                  </a>
                  <a
                    href="/register"
                    className="rounded-md bg-[rgba(234,57,67,0.14)] px-5 py-2.5 text-center font-mono text-xs font-semibold text-[#EA3943] transition hover:bg-[rgba(234,57,67,0.22)]"
                  >
                    Sell
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker tape */}
      <section className="overflow-hidden border-y border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.018)] py-4">
        <div className="ticker-track flex w-max whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <TickerItem
              change={item[2]}
              key={`${item[0]}-${index}`}
              label={item[0]}
              value={item[1]}
            />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <p className="fade-up text-center text-xs font-medium uppercase tracking-[0.28em] text-[#F5A623]">
          How it works
        </p>
        <h2
          className="fade-up font-display mx-auto mt-4 max-w-2xl text-center text-3xl font-bold leading-tight text-white sm:text-4xl"
          style={{ animationDelay: "0.08s" }}
        >
          Simple four-step timeline.
        </h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {howItWorks.map((step, index) => (
            <li
              key={step.title}
              className="fade-up relative flex min-h-[240px] flex-col rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] p-6 transition hover:border-[rgba(245,166,35,0.45)]"
              style={{ animationDelay: `${0.08 * index}s` }}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="font-mono flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[rgba(245,166,35,0.12)] text-sm font-bold text-[#F5A623]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index < howItWorks.length - 1 && (
                  <span className="hidden h-px flex-1 bg-[rgba(245,166,35,0.25)] md:block" />
                )}
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-xs leading-6 text-[rgba(255,255,255,0.48)]">
                {step.description}
              </p>
              <p className="mt-auto pt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-[#F5A623]">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Market overview chart */}
      <section
        id="markets"
        className="border-y border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.035))] px-5 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="fade-up text-xs font-medium uppercase tracking-[0.28em] text-[#F5A623]">
                Market overview
              </p>
              <h2
                className="fade-up font-display mt-4 max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl"
                style={{ animationDelay: "0.08s" }}
              >
                Track live movement across pairs.
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {marketSeries.map((p, idx) => {
                const last = p.data[p.data.length - 1].price;
                const first = p.data[0].price;
                const pct = ((last - first) / first) * 100;
                const up = pct >= 0;
                return (
                  <button
                    key={p.symbol}
                    onClick={() => setMarketTab(idx)}
                    type="button"
                    className={`rounded-md border px-4 py-2.5 text-left transition ${
                      idx === marketTab
                        ? "border-[rgba(245,166,35,0.4)] bg-[rgba(245,166,35,0.08)]"
                        : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
                    }`}
                  >
                    <p className="font-mono text-xs font-semibold text-white">
                      {p.symbol}
                    </p>
                    <p
                      className={`font-mono text-[11px] ${up ? "text-[#16C784]" : "text-[#EA3943]"}`}
                    >
                      {up ? "+" : ""}
                      {fmt(pct)}%
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="fade-up mt-10 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#08080d] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-bold text-white">
                  {activeSeries.name}
                </p>
                <p className="font-mono text-xs text-white/40">
                  {activeSeries.symbol}
                </p>
              </div>
              <p className="font-mono text-2xl font-semibold text-white">
                ${fmt(activeSeries.data[activeSeries.data.length - 1].price)}
              </p>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activeSeries.data}
                  margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="marketFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#F5A623"
                        stopOpacity={0.35}
                      />
                      <stop offset="100%" stopColor="#F5A623" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis dataKey="t" hide />
                  <YAxis domain={["auto", "auto"]} hide />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{
                      stroke: "rgba(245,166,35,0.35)",
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#F5A623"
                    strokeWidth={2}
                    fill="url(#marketFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Platform features bento */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20">
        <p className="fade-up text-center text-xs font-medium uppercase tracking-[0.28em] text-[#F5A623]">
          Platform features
        </p>
        <h2
          className="fade-up font-display mx-auto mt-4 max-w-xl text-center text-3xl font-bold leading-tight text-white sm:text-4xl"
          style={{ animationDelay: "0.08s" }}
        >
          Everything investors need after signup.
        </h2>

        <div className="mt-12 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-4">
          {platformFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={`fade-up group relative overflow-hidden rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#08080d] p-6 transition hover:border-[rgba(245,166,35,0.3)] ${feature.size}`}
                style={{
                  animationDelay: `${0.05 * index}s`,
                  borderColor: undefined,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${feature.accent}55`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div className="relative flex h-full min-h-[220px] flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
                      style={{
                        background: `${feature.accent}1F`,
                        color: feature.accent,
                      }}
                    >
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: feature.accent }}
                    >
                      {feature.detail}
                    </span>
                  </div>
                  <h3 className="font-display mt-7 text-xl font-bold leading-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-[rgba(255,255,255,0.48)]">
                    {feature.description}
                  </p>
                  <div className="mt-auto pt-7">
                    <span className="block h-px w-full bg-[rgba(255,255,255,0.08)]" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <p className="fade-up text-center text-xs font-medium uppercase tracking-[0.28em] text-[#F5A623]">
          Why BSX Capital Exchange
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([icon, title, description], index) => (
            <article
              key={title}
              className="fade-up rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] p-6 transition hover:border-[rgba(245,166,35,0.45)]"
              style={{ animationDelay: `${0.08 * index}s` }}
            >
              <div className="font-display flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(245,166,35,0.12)] text-sm font-bold text-[#F5A623]">
                {icon}
              </div>
              <h2 className="font-display mt-5 text-lg font-bold text-white">
                {title}
              </h2>
              <p className="mt-3 text-xs leading-6 text-[rgba(255,255,255,0.4)]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="fade-up relative overflow-hidden rounded-[10px] border border-[rgba(245,166,35,0.18)] bg-[rgba(245,166,35,0.055)] p-7 lg:p-8">
            <div className="absolute right-0 top-0 h-36 w-36 translate-x-12 -translate-y-12 rounded-full bg-[#F5A623]/10" />
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[#F5A623]/15 text-[#F5A623]">
                <CircleHelp aria-hidden="true" className="h-6 w-6" />
              </span>
              <p className="mt-8 text-xs font-medium uppercase tracking-[0.28em] text-[#F5A623]">
                Frequently asked questions
              </p>
              <h2 className="font-display mt-4 max-w-sm text-3xl font-bold leading-tight text-white sm:text-4xl">
                Clear answers before you make your next move.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[rgba(255,255,255,0.52)]">
                Get quick guidance on signup, funding, withdrawals, account
                protection, and reaching support when you need help.
              </p>
              <a
                className="mt-8 inline-flex rounded-md border border-[rgba(245,166,35,0.28)] px-5 py-3 text-sm font-semibold text-[#F5A623] transition hover:bg-[rgba(245,166,35,0.1)]"
                href="/register"
              >
                Open an account
              </a>
            </div>
          </aside>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const Icon = faq.icon;
              return (
                <details
                  key={faq.question}
                  className="fade-up group rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] p-5 transition open:border-[rgba(245,166,35,0.34)] open:bg-[rgba(255,255,255,0.04)]"
                  open={index === 0}
                  style={{ animationDelay: `${0.06 * index}s` }}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
                      style={{
                        background: `${faq.accent}1F`,
                        color: faq.accent,
                      }}
                    >
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="font-display flex-1 text-base font-bold text-white">
                      {faq.question}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition group-open:rotate-180" />
                  </summary>
                  <p className="ml-[60px] mt-4 max-w-2xl text-sm leading-7 text-[rgba(255,255,255,0.5)]">
                    {faq.answer}
                  </p>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </main>
  );
}
