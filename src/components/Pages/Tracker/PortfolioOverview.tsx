"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, BarChart3, Percent } from "lucide-react";
import { TrackerPortfolio } from "@/utils/typesInterface";

interface PortfolioOverviewProps {
  data: TrackerPortfolio | null;
}

const fmt = (val: number) =>
  `$${Math.abs(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const cards = [
  {
    key: "balance",
    label: "Balance",
    icon: Wallet,
    accent: "#0099FF",
    getValue: (d: TrackerPortfolio) => fmt(d.balance),
    getAccent: () => "#0099FF",
  },
  {
    key: "invested",
    label: "Invested",
    icon: BarChart3,
    accent: "#FEB019",
    getValue: (d: TrackerPortfolio) => fmt(d.investedAmount),
    getAccent: () => "#FEB019",
  },
  {
    key: "pnl",
    label: "Total P&L",
    icon: TrendingUp,
    accent: "#00E396",
    getValue: (d: TrackerPortfolio) => {
      const prefix = d.totalPnL >= 0 ? "+$" : "-$";
      return `${prefix}${Math.abs(d.totalPnL).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    getAccent: (d: TrackerPortfolio) =>
      d.totalPnL >= 0 ? "#00E396" : "#FF4560",
  },
  {
    key: "roi",
    label: "% ROI",
    icon: Percent,
    accent: "#775DD0",
    getValue: (d: TrackerPortfolio) =>
      `${d.roi >= 0 ? "+" : ""}${d.roi.toFixed(1)}%`,
    getAccent: (d: TrackerPortfolio) =>
      d.roi >= 0 ? "#00E396" : "#FF4560",
  },
];

const PortfolioOverview = ({ data }: PortfolioOverviewProps) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const accent = card.getAccent ? card.getAccent(data) : card.accent;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.08,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative rounded-2xl p-4 sm:p-5 overflow-hidden
              dark:bg-white/[0.02] bg-white/80
              border dark:border-white/[0.06] border-gray-200/50
              hover:dark:border-white/[0.1] hover:border-gray-300/60
              dark:shadow-[0_0_30px_-10px_rgba(0,0,0,0.3)] shadow-lg
              transition-all duration-300"
          >
            {/* Subtle glow on hover */}
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none"
              style={{ background: accent }}
            />
            <div className="flex items-center gap-2 mb-2.5 relative">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
                  boxShadow: `0 0 8px ${accent}08`,
                }}
              >
                <Icon size={13} style={{ color: accent }} />
              </div>
              <span className="text-[10px] dark:text-gray-500 text-gray-400 font-semibold uppercase tracking-wide">
                {card.label}
              </span>
            </div>
            <p
              className="text-lg sm:text-xl font-bold tracking-tight relative"
              style={{ color: accent }}
            >
              {card.getValue(data)}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PortfolioOverview;
