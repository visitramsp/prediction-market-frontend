"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Users2 } from "lucide-react";
import { TrackerCommunityComparison } from "@/utils/typesInterface";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CommunityComparisonProps {
  data: TrackerCommunityComparison | null;
}

/** Scale to 0-100 based on the max of user, avg, median per metric */
const normalize = (val: number, maxVal: number) =>
  maxVal > 0 ? parseFloat(((val / maxVal) * 100).toFixed(1)) : 0;

const fmt = (v: number) =>
  v >= 10000
    ? `${(v / 1000).toFixed(1)}k`
    : v >= 1000
      ? `${(v / 1000).toFixed(1)}k`
      : Number.isInteger(v)
        ? v.toString()
        : v.toFixed(1);

const CommunityComparison = ({ data }: CommunityComparisonProps) => {
  if (!data || !data.metrics || data.metrics.length === 0) return null;

  const metrics = data.metrics;
  const categories = metrics.map((m) => m.label);

  // Normalize per-metric so radar shape is meaningful
  const maxPerMetric = metrics.map((m) =>
    Math.max(m.user, m.average, m.median, 1)
  );

  const userScaled = metrics.map((m, i) =>
    normalize(m.user, maxPerMetric[i])
  );
  const avgScaled = metrics.map((m, i) =>
    normalize(m.average, maxPerMetric[i])
  );

  // Actual values for tooltip
  const actualUser = metrics.map((m) => m.user);
  const actualAvg = metrics.map((m) => m.average);
  const actualMedian = metrics.map((m) => m.median);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "radar",
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "inherit",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 1000,
        animateGradually: { enabled: true, delay: 100 },
      },
      dropShadow: {
        enabled: true,
        blur: 6,
        left: 0,
        top: 2,
        opacity: 0.12,
      },
    },
    colors: ["#0099FF", "#FF4560"],
    stroke: {
      width: 2,
      curve: "smooth",
    },
    fill: {
      opacity: [0.25, 0.1],
    },
    markers: {
      size: 4,
      strokeWidth: 1.5,
      strokeColors: "#0f172a",
      hover: { size: 6 },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: ["#E5E7EB", "#E5E7EB", "#E5E7EB", "#E5E7EB"],
          fontSize: "11px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      show: false,
      min: 0,
      max: 105,
      tickAmount: 4,
    },
    plotOptions: {
      radar: {
        size: undefined,
        polygons: {
          strokeColors: "rgba(255,255,255,0.06)",
          connectorColors: "rgba(255,255,255,0.04)",
          fill: {
            colors: [
              "rgba(255,255,255,0.01)",
              "transparent",
            ],
          },
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      labels: { colors: "#9CA3AF" },
      fontSize: "11px",
      fontWeight: 600,
      markers: {
        size: 5,
        shape: "circle" as const,
        offsetX: -2,
      },
      itemMargin: { horizontal: 16 },
    },
    tooltip: {
      theme: "dark",
      shared: false,
      custom: ({
        seriesIndex,
        dataPointIndex,
      }: {
        series: number[][];
        seriesIndex: number;
        dataPointIndex: number;
        w: Record<string, unknown>;
      }) => {
        const label = categories[dataPointIndex];
        const uVal = actualUser[dataPointIndex];
        const aVal = actualAvg[dataPointIndex];
        const mVal = actualMedian[dataPointIndex];
        const isUser = seriesIndex === 0;

        return `<div style="padding:12px 16px;background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);border:1px solid ${isUser ? "#0099FF" : "#FF4560"}20;border-radius:12px;font-size:11px;min-width:130px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
          <div style="color:#E5E7EB;margin-bottom:8px;font-weight:700;font-size:12px;">${label}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#0099FF;${isUser ? "box-shadow:0 0 6px #0099FF60;" : ""}"></div>
            <span style="color:#9CA3AF;">You:</span>
            <span style="color:#0099FF;font-weight:700;margin-left:auto;">${fmt(uVal)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#FF4560;${!isUser ? "box-shadow:0 0 6px #FF456060;" : ""}"></div>
            <span style="color:#9CA3AF;">Avg:</span>
            <span style="color:#FF4560;font-weight:700;margin-left:auto;">${fmt(aVal)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.06);">
            <div style="width:8px;height:2px;background:#FEB019;border-radius:1px;"></div>
            <span style="color:#9CA3AF;">Median:</span>
            <span style="color:#FEB019;font-weight:600;margin-left:auto;">${fmt(mVal)}</span>
          </div>
        </div>`;
      },
    },
    dataLabels: { enabled: false },
  };

  const series = [
    { name: "You", data: userScaled },
    { name: "Community Avg", data: avgScaled },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-4 sm:p-6 overflow-hidden
        dark:bg-white/[0.02] bg-white/80
        border dark:border-white/[0.06] border-gray-200/50
        dark:shadow-[0_0_40px_-12px_rgba(0,153,255,0.05)] shadow-lg"
    >
      {/* Accent glow */}
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl bg-[#0099FF] opacity-[0.03] pointer-events-none" />

      <div className="flex items-center gap-2.5 mb-3 relative">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0099FF18, #0099FF08)",
            boxShadow: "0 0 12px #0099FF10",
          }}
        >
          <Users2 size={15} className="text-[#0099FF]" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-semibold dark:text-gray-200 text-gray-800 globalFonts">
            You vs Community
          </h3>
          <p className="text-[9px] dark:text-gray-600 text-gray-400 font-medium">
            Hover for actual values
          </p>
        </div>
      </div>

      <Chart options={options} series={series} type="radar" height={260} />

      {/* Percentage difference badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        {metrics.map((m, i) => {
          const isPositive = m.pctDiffAvg >= 0;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.08 }}
              className="flex flex-col items-center p-2.5 rounded-xl
                dark:bg-white/[0.02] bg-gray-50/60
                border dark:border-white/[0.04] border-gray-100/50
                hover:dark:border-white/[0.08] hover:border-gray-200/80
                transition-all duration-200"
            >
              <span className="text-[9px] dark:text-gray-500 text-gray-400 uppercase tracking-wider font-semibold">
                {m.label}
              </span>
              <span
                className="text-sm font-bold mt-0.5"
                style={{ color: isPositive ? "#00E396" : "#FF4560" }}
              >
                {isPositive ? "+" : ""}
                {m.pctDiffAvg.toFixed(1)}%
              </span>
              <span className="text-[8px] dark:text-gray-600 text-gray-300 mt-0.5 font-medium">
                vs avg
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CommunityComparison;
