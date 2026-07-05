"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  ChevronDown,
  ChevronsUp,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Timer,
  UserPlus,
  Users,
  Wallet,
  X,
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

const BTC_MARKET_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,ngn&include_24hr_change=true&include_24hr_vol=true";
const BTC_FALLBACK_START = 100000;

const PAIRS = [
  {
    symbol: "BTC/USD",
    name: "Bitcoin",
    start: BTC_FALLBACK_START,
    seed: 11,
    drift: 1,
    live: true,
  },
  { symbol: "ETH/USD", name: "Ethereum", start: 3640, seed: 27, drift: 1.3 },
  { symbol: "SOL/USD", name: "Solana", start: 168, seed: 42, drift: 1.7 },
  { symbol: "XRP/USD", name: "XRP", start: 0.62, seed: 63, drift: 0.9 },
];

const TIMEFRAMES = ["1H", "4H", "1D", "1W"];

const baseTickerItems = [
  ["DOMINANCE", "52.1%", "+0.3%"],
  ["ETH/USD", "$3,640", "+1.4%"],
  ["SOL/USD", "$168.20", "+5.1%"],
  ["XRP/USD", "$0.62", "-0.6%"],
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

const publicProofItems = [
  {
    type: "earning",
    label: "Earning",
    name: "Mohammed from UAE",
    detail: "just earned",
    amount: "$5,856",
    icon: ArrowUpRight,
    color: "#16C784",
  },
  {
    type: "withdrawal",
    label: "Withdrawal",
    name: "Ava from North Carolina",
    detail: "just withdrew",
    amount: "$2,430",
    icon: Wallet,
    color: "#F5A623",
  },
  {
    type: "earning",
    label: "Earning",
    name: "Daniel from London",
    detail: "just earned",
    amount: "$7,120",
    icon: ArrowUpRight,
    color: "#16C784",
  },
  {
    type: "withdrawal",
    label: "Withdrawal",
    name: "Sofia from Madrid",
    detail: "just withdrew",
    amount: "$2,180",
    icon: ArrowDownRight,
    color: "#38BDF8",
  },
];

const testimonials = [
  {
    name: "Am Aish",
    location: "North Carolina",
    role: "Verified client",
    photo:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=240&q=80",
    quote:
      "I came across BSX Capital Exchange while looking for a simpler way to manage Bitcoin investments. The dashboard made funding, tracking, and withdrawals easy to follow.",
    result: "$5,856 earned",
  },
  {
    name: "Mohammed A.",
    location: "UAE",
    role: "Verified investor",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    quote:
      "The process felt clear from signup to deposit. I could see my activity, follow my plan, and understand what was happening without waiting for long explanations.",
    result: "$3,420 withdrawn",
  },
  {
    name: "Sofia R.",
    location: "Madrid",
    role: "Active investor",
    photo:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
    quote:
      "I like that everything is in one place. My account records, plan details, notifications, and support access are easy to use on mobile.",
    result: "$2,180 withdrawn",
  },
  {
    name: "James W.",
    location: "Manchester",
    role: "Plan subscriber",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
    quote:
      "I wanted a cleaner way to track deposits and payouts. The portal keeps the numbers, requests, and updates in one place without feeling complicated.",
    result: "$4,760 earned",
  },
  {
    name: "Emily C.",
    location: "Toronto",
    role: "Verified client",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    quote:
      "The account history is easy to scan, and I can follow pending withdrawals without messaging support every time I need an update.",
    result: "$3,125 withdrawn",
  },
  {
    name: "Lucas M.",
    location: "Berlin",
    role: "Active client",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
    quote:
      "I appreciate how direct the dashboard feels. Funding, plan progress, and support are all clear enough to use from my phone.",
    result: "$6,240 earned",
  },
  {
    name: "Chloe T.",
    location: "Sydney",
    role: "Verified investor",
    photo:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
    quote:
      "The deposit workflow is straightforward, and the notifications help me know when account activity has been reviewed.",
    result: "$2,940 withdrawn",
  },
  {
    name: "Hannah L.",
    location: "Singapore",
    role: "Portfolio client",
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
    quote:
      "Everything I need is visible after login. I can check my balance, submit requests, and see what has already been processed.",
    result: "$5,310 earned",
  },
];

function fmt(n, d = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function formatCurrency(n, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: n >= 1000 ? 0 : 2,
    minimumFractionDigits: n >= 1000 ? 0 : 2,
    style: "currency",
  }).format(n);
}

function formatCompactCurrency(n, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(n);
}

function formatTickerChange(value) {
  if (typeof value !== "number") return "Live";
  return `${value >= 0 ? "+" : ""}${fmt(value)}%`;
}

async function fetchBitcoinMarket() {
  const response = await fetch(BTC_MARKET_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load Bitcoin market price");
  }

  const data = await response.json();
  const bitcoin = data?.bitcoin;
  const priceUsd = Number(bitcoin?.usd);

  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    throw new Error("Bitcoin market price was not valid");
  }

  return {
    change24h: Number(bitcoin?.usd_24h_change),
    priceNgn: Number(bitcoin?.ngn),
    priceUsd,
    updatedAt: new Date(),
    volume24h: Number(bitcoin?.usd_24h_vol),
  };
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
/* Public activity and assistant widgets                                  */
/* ---------------------------------------------------------------------- */

function PublicProofPopup({ item }) {
  const Icon = item.icon;

  return (
    <aside
      aria-live="polite"
      className="proof-popup fixed bottom-4 left-4 z-40 w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-md border border-[rgba(245,166,35,0.45)] bg-[#050508] shadow-[0_22px_60px_rgba(0,0,0,0.42)] sm:left-6"
    >
      <div className="flex items-center gap-4 px-4 py-3.5">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
          style={{
            backgroundColor: `${item.color}1F`,
            color: item.color,
          }}
        >
          <Icon aria-hidden="true" className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-white">
            {item.label}
          </span>
          <span className="block text-xs leading-5 text-white/70">
            {item.name} has {item.detail}{" "}
            <b className="font-bold text-white">{item.amount}</b>
          </span>
        </span>
      </div>
      <span
        className="block h-0.5 proof-timer"
        style={{ backgroundColor: item.color }}
      />
    </aside>
  );
}

function PublicChatAssistant() {
  const [isOpen, setIsOpen] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  const supportMessage =
    "Welcome 👋 Whether you have a specific question or need assistance, we're here for you. 😉 What would you like to know?";

  const openSmartsuppChat = async () => {
    setStartingChat(true);

    try {
      await fetch("/api/support/chat-start", {
        body: JSON.stringify({
          message: supportMessage,
          pageUrl: window.location.href,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    } catch (error) {
      console.error("Unable to record support chat request:", error);
    } finally {
      setStartingChat(false);
    }

    if (
      typeof window !== "undefined" &&
      typeof window.smartsupp === "function"
    ) {
      window.smartsupp("chat:open");
    }
  };

  return (
    <section className="fixed bottom-4 right-4 z-50 sm:right-6">
      {isOpen ? (
        <div className="chat-card w-[min(380px,calc(100vw-32px))] rounded-[14px] border border-white/10 bg-white p-4 text-[#171717] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#94A3B8]">
              <CircleHelp aria-hidden="true" className="h-6 w-6" />
            </span>
            <button
              aria-label="Close chat box"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-4 text-[15px] leading-6 text-slate-700">
            {supportMessage}
          </p>
          <button
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2445E8] px-5 text-sm font-semibold text-white transition hover:bg-[#1D39C4]"
            disabled={startingChat}
            onClick={openSmartsuppChat}
            type="button"
          >
            <Mail aria-hidden="true" className="h-4 w-4" />
            {startingChat ? "Starting chat..." : "Let's chat"}
          </button>
        </div>
      ) : null}
      <button
        aria-label={isOpen ? "Chat box is open" : "Open chat box"}
        className="relative mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#2445E8] text-white shadow-[0_16px_45px_rgba(36,69,232,0.42)] transition hover:bg-[#1D39C4]"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <CircleHelp className="h-7 w-7" />
        )}
        <span className="absolute -right-0.5 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EA3943] px-1 text-[10px] font-bold text-white">
          1
        </span>
      </button>
    </section>
  );
}

function TestimonialPopup({ testimonial, onClose }) {
  return (
    <aside className="testimonial-popup fixed bottom-[92px] left-4 z-40 w-[min(390px,calc(100vw-32px))] rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[#08080d] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.42)] sm:left-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-label={testimonial.name}
            className="h-12 w-12 shrink-0 rounded-full bg-cover bg-center"
            role="img"
            style={{ backgroundImage: `url(${testimonial.photo})` }}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5A623]">
              Client testimonial
            </p>
            <h3 className="font-display mt-1 truncate text-base font-bold text-white">
              {testimonial.name}
            </h3>
            <p className="text-xs text-white/42">
              {testimonial.location} - {testimonial.role}
            </p>
          </div>
        </div>
        <button
          aria-label="Close testimonial popup"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/20 hover:text-white"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/68">
        "{testimonial.quote}"
      </p>
      <p className="mt-3 font-mono text-xs font-semibold text-[#16C784]">
        {testimonial.result}
      </p>
    </aside>
  );
}

function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > 520);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      aria-label="Back to top"
      className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(245,166,35,0.34)] bg-[#08080d] text-[#F5A623] shadow-[0_14px_40px_rgba(0,0,0,0.34)] transition hover:bg-[rgba(245,166,35,0.1)] sm:right-6"
      onClick={() => window.scrollTo({ behavior: "smooth", top: 0 })}
      type="button"
    >
      <ChevronsUp aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Main page                                                              */
/* ---------------------------------------------------------------------- */

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [pairIdx, setPairIdx] = useState(0);
  const [bitcoinMarket, setBitcoinMarket] = useState(null);
  const [bitcoinMarketStatus, setBitcoinMarketStatus] = useState("loading");
  const pair = PAIRS[pairIdx];
  const pairBasePrice =
    pair.live && bitcoinMarket?.priceUsd ? bitcoinMarket.priceUsd : pair.start;

  const [candles, setCandles] = useState(() =>
    makeCandles(48, pairBasePrice, pair.seed),
  );
  const [livePrice, setLivePrice] = useState(pairBasePrice);
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(pairBasePrice);
  const openRef = useRef(pairBasePrice);

  useEffect(() => {
    let cancelled = false;

    const loadMarket = async () => {
      try {
        const market = await fetchBitcoinMarket();
        if (cancelled) return;
        setBitcoinMarket(market);
        setBitcoinMarketStatus("live");
      } catch {
        if (!cancelled) setBitcoinMarketStatus("stale");
      }
    };

    loadMarket();
    const interval = setInterval(loadMarket, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fresh = makeCandles(48, pairBasePrice, pair.seed + timeframe.length);
    setCandles(fresh);
    setLivePrice(pairBasePrice);
    prevPrice.current = pairBasePrice;
    openRef.current = pairBasePrice;
  }, [pairBasePrice, pair.seed, timeframe]);

  useEffect(() => {
    if (pair.live) return;
    const interval = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const vol = pairBasePrice * 0.0009;
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
  }, [pair.live, pairBasePrice, livePrice]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [flash]);

  const changePct = ((livePrice - openRef.current) / openRef.current) * 100;
  const isUp = changePct >= 0;

  const marketSeries = useMemo(
    () =>
      PAIRS.map((p) => {
        const base =
          p.live && bitcoinMarket?.priceUsd ? bitcoinMarket.priceUsd : p.start;
        return {
          ...p,
          data: makeSeries(60, base, p.seed + 100, p.drift),
        };
      }),
    [bitcoinMarket?.priceUsd],
  );
  const [marketTab, setMarketTab] = useState(0);
  const activeSeries = marketSeries[marketTab];
  const tickerItems = useMemo(() => {
    const btcChange = bitcoinMarket?.change24h;
    const btcItems = [
      [
        "BTC/USD",
        bitcoinMarket?.priceUsd
          ? formatCurrency(bitcoinMarket.priceUsd)
          : "Loading live price",
        formatTickerChange(btcChange),
      ],
      [
        "BTC/NGN",
        bitcoinMarket?.priceNgn
          ? formatCompactCurrency(bitcoinMarket.priceNgn, "NGN")
          : "Loading live price",
        formatTickerChange(btcChange),
      ],
    ];

    if (bitcoinMarket?.volume24h) {
      btcItems.push([
        "24H VOL",
        formatCompactCurrency(bitcoinMarket.volume24h),
        formatTickerChange(btcChange),
      ]);
    }

    return [...btcItems, ...baseTickerItems];
  }, [bitcoinMarket]);
  const [proofIndex, setProofIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [showTestimonialPopup, setShowTestimonialPopup] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProofIndex((index) => (index + 1) % publicProofItems.length);
    }, 5200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showTestimonialPopup) return;
    const interval = setInterval(() => {
      setTestimonialIndex((index) => (index + 1) % testimonials.length);
    }, 7200);
    return () => clearInterval(interval);
  }, [showTestimonialPopup]);

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
        @keyframes proofSlide { 0% { opacity: 0; transform: translate3d(-18px, 10px, 0) scale(.98); } 12%, 84% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); } 100% { opacity: 0; transform: translate3d(-10px, 8px, 0) scale(.98); } }
        .proof-popup { animation: proofSlide 5.2s cubic-bezier(.16,1,.3,1) both; }
        @keyframes proofTimer { from { transform: scaleX(1); } to { transform: scaleX(0); } }
        .proof-timer { animation: proofTimer 5.2s linear both; transform-origin: left; }
        @keyframes chatIn { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .chat-card { animation: chatIn .28s cubic-bezier(.16,1,.3,1) both; }
        @keyframes testimonialFloat { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .testimonial-popup { animation: testimonialFloat .42s cubic-bezier(.16,1,.3,1) both; }
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
      <nav className="sticky top-0 z-30 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,8,0.82)] backdrop-blur-md">
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
            <a className="transition hover:text-white" href="/plans">
              Plans
            </a>
            <a className="transition hover:text-white" href="#markets">
              Markets
            </a>
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#testimonials">
              Testimonials
            </a>
            <a className="transition hover:text-white" href="#faq">
              FAQ
            </a>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <a
              className="text-sm font-medium text-white/70 transition hover:text-white"
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
          <button
            aria-expanded={mobileNavOpen}
            aria-label="Toggle navigation"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/70 transition hover:border-[rgba(245,166,35,0.3)] hover:text-white md:hidden"
            onClick={() => setMobileNavOpen((value) => !value)}
            type="button"
          >
            {mobileNavOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
        {mobileNavOpen ? (
          <div className="border-t border-white/[0.06] bg-[#08080c] px-5 py-4 md:hidden">
            <div className="grid gap-2">
              {[
                ["Plans", "/plans"],
                ["Markets", "#markets"],
                ["Features", "#features"],
                ["Testimonials", "#testimonials"],
                ["FAQ", "#faq"],
              ].map(([label, href]) => (
                <a
                  className="rounded-md px-3 py-3 text-sm text-white/65 transition hover:bg-white/[0.04] hover:text-[#F5A623]"
                  href={href}
                  key={href}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a
                className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-3 text-center text-sm text-white/70"
                href="/login"
                onClick={() => setMobileNavOpen(false)}
              >
                Sign in
              </a>
              <a
                className="rounded-md bg-gradient-to-r from-[#F5A623] to-[#E8C84A] px-4 py-3 text-center text-sm font-semibold text-[#050508]"
                href="/register"
                onClick={() => setMobileNavOpen(false)}
              >
                Get started
              </a>
            </div>
          </div>
        ) : null}
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
                href="/plans"
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
                  {pair.live && !bitcoinMarket
                    ? "Loading live BTC..."
                    : formatCurrency(livePrice)}
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
                  {pair.live
                    ? bitcoinMarketStatus === "live"
                      ? "Live market"
                      : "Updating"
                    : "Simulated"}
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
                const pct =
                  p.live && typeof bitcoinMarket?.change24h === "number"
                    ? bitcoinMarket.change24h
                    : ((last - first) / first) * 100;
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
                {activeSeries.live && bitcoinMarket?.priceUsd
                  ? formatCurrency(bitcoinMarket.priceUsd)
                  : formatCurrency(
                      activeSeries.data[activeSeries.data.length - 1].price,
                    )}
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

      {/* Testimonials */}
      <section
        id="testimonials"
        className="border-y border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.018)] px-5 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="fade-up text-xs font-medium uppercase tracking-[0.28em] text-[#F5A623]">
                Testimonials
              </p>
              <h2
                className="fade-up font-display mt-4 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl"
                style={{ animationDelay: "0.08s" }}
              >
                What verified clients are saying.
              </h2>
            </div>
            <a
              className="inline-flex rounded-md border border-[rgba(245,166,35,0.28)] px-5 py-3 text-sm font-semibold text-[#F5A623] transition hover:bg-[rgba(245,166,35,0.1)]"
              href="/register"
            >
              Join them
            </a>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <article
                className="fade-up flex min-h-[280px] flex-col rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#08080d] p-6 transition hover:border-[rgba(245,166,35,0.3)]"
                key={testimonial.name}
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    aria-label={testimonial.name}
                    className="h-14 w-14 shrink-0 rounded-full bg-cover bg-center ring-2 ring-[rgba(245,166,35,0.24)]"
                    role="img"
                    style={{ backgroundImage: `url(${testimonial.photo})` }}
                  />
                  <span className="rounded-full bg-[rgba(22,199,132,0.12)] px-3 py-1 font-mono text-[11px] font-semibold text-[#16C784]">
                    {testimonial.result}
                  </span>
                </div>
                <p className="mt-6 text-sm leading-7 text-white/58">
                  "{testimonial.quote}"
                </p>
                <div className="mt-auto pt-6">
                  <p className="font-display text-base font-bold text-white">
                    {testimonial.name}
                  </p>
                  <p className="mt-1 text-xs text-white/38">
                    {testimonial.location} - {testimonial.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
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
      <PublicProofPopup
        item={publicProofItems[proofIndex % publicProofItems.length]}
        key={proofIndex}
      />
      {showTestimonialPopup ? (
        <TestimonialPopup
          onClose={() => setShowTestimonialPopup(false)}
          testimonial={testimonials[testimonialIndex % testimonials.length]}
        />
      ) : null}
      <BackToTopButton />
      <PublicChatAssistant />
    </main>
  );
}
