"use client";

import { motion } from "framer-motion";

interface TrackerFiltersProps {
  period: string;
  setPeriod: (p: string) => void;
}

const periods = [
  { key: "day", label: "1D" },
  { key: "week", label: "1W" },
  { key: "month", label: "1M" },
  { key: "year", label: "1Y" },
  { key: "all", label: "All" },
];

const TrackerFilters = ({ period, setPeriod }: TrackerFiltersProps) => {
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5
      rounded-xl dark:bg-white/[0.04] bg-gray-100/80
      border dark:border-white/[0.06] border-gray-200/50">
      {periods.map((p) => (
        <button
          key={p.key}
          onClick={() => setPeriod(p.key)}
          className={`relative cursor-pointer rounded-lg px-3.5 py-1.5 text-[11px] font-medium
            transition-colors duration-150 select-none ${
            period === p.key
              ? "dark:text-white text-gray-900"
              : "dark:text-gray-500 text-gray-400 dark:hover:text-gray-300 hover:text-gray-600"
          }`}
        >
          {period === p.key && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 rounded-lg
                dark:bg-white/[0.08] bg-white
                dark:shadow-none shadow-sm
                border dark:border-white/[0.08] border-gray-200/60"
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{p.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TrackerFilters;
