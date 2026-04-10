"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Users } from "lucide-react";
import { FollowerDataPoint } from "@/utils/typesInterface";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface FollowerGrowthChartProps {
  data: FollowerDataPoint[];
}

/** Format "2026-02-10" → "10th Feb" */
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const suffix = [11, 12, 13].includes(day)
    ? "th"
    : day % 10 === 1
      ? "st"
      : day % 10 === 2
        ? "nd"
        : day % 10 === 3
          ? "rd"
          : "th";
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${day}${suffix} ${month}`;
};

const FollowerGrowthChart = ({ data }: FollowerGrowthChartProps) => {
  const empty = !data || data.length === 0;
  const totalFollowers = !empty ? data[data.length - 1].cumulative : 0;

  // Determine dynamic scale based on data
  const values = data.map((d) => d.netChange);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const yMax = Math.ceil(maxVal * 1.3) || 5;
  const yMin = Math.floor(minVal * 1.3) || (minVal < 0 ? Math.floor(minVal * 1.3) : 0);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: { enabled: true, delay: 50 },
      },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        borderRadius: 1,
        columnWidth: "6%",
        colors: {
          ranges: [
            { from: -99999, to: -0.001, color: "#FF4560" },
            { from: 0, to: 99999, color: "#00B8D9" },
          ],
        },
      },
    },
    colors: ["#00B8D9"],
    xaxis: {
      categories: data.map((d) => formatDate(d.date)),
      labels: {
        style: { colors: "#6B7280", fontSize: "8px", fontWeight: 500 },
        rotate: -45,
        maxHeight: 60,
        hideOverlappingLabels: true,
        showDuplicates: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: Math.min(data.length, 15),
    },
    yaxis: {
      max: yMax,
      min: yMin,
      labels: {
        style: { colors: "#6B7280", fontSize: "10px", fontWeight: 500 },
        formatter: (val: number) =>
          `${val >= 0 ? "+" : ""}${Math.round(val)}`,
      },
    },
    grid: {
      borderColor: "rgba(255,255,255,0.04)",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: "dark",
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const point = data[dataPointIndex];
        if (!point) return "";
        const color = point.netChange >= 0 ? "#00B8D9" : "#FF4560";
        const sign = point.netChange >= 0 ? "+" : "";
        return `<div style="padding:8px 12px;background:#1a1a2e;border:1px solid ${color}30;border-radius:8px;font-size:11px;">
          <div style="color:#9CA3AF;margin-bottom:4px;">${formatDate(point.date)}</div>
          <div style="color:${color};font-weight:700;font-size:14px;">${sign}${point.netChange}</div>
          <div style="color:#6B7280;margin-top:2px;font-size:10px;">Total: ${point.cumulative}</div>
        </div>`;
      },
    },
    dataLabels: { enabled: false },
    annotations: {
      yaxis: [
        {
          y: 0,
          borderColor: "rgba(255,255,255,0.06)",
          strokeDashArray: 0,
          borderWidth: 1,
        },
      ],
    },
  };

  const series = [
    { name: "Net Change", data: data.map((d) => d.netChange) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-4 sm:p-6 overflow-hidden
        dark:bg-white/[0.02] bg-white/80
        border dark:border-white/[0.06] border-gray-200/50
        dark:shadow-[0_0_40px_-12px_rgba(0,184,217,0.05)] shadow-lg"
    >
      {/* Accent glow */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl bg-[#00B8D9] opacity-[0.03] pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #00B8D918, #00B8D908)",
              boxShadow: "0 0 12px #00B8D910",
            }}
          >
            <Users size={15} className="text-[#00B8D9]" />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold dark:text-gray-200 text-gray-800 globalFonts">
            Follower Growth
          </h3>
        </div>
        {!empty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg
              dark:bg-[#00B8D9]/10 bg-[#00B8D9]/5
              border dark:border-[#00B8D9]/15 border-[#00B8D9]/10"
          >
            <span className="text-sm font-bold text-[#00B8D9]">
              {totalFollowers}
            </span>
            <span className="text-[9px] text-[#00B8D9]/60 font-medium">
              total
            </span>
          </motion.div>
        )}
      </div>

      {empty ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2">
          <Users size={20} className="text-gray-600 opacity-30" />
          <p className="text-gray-500 text-[11px]">No follower data yet</p>
        </div>
      ) : (
        <Chart options={options} series={series} type="bar" height={180} />
      )}
    </motion.div>
  );
};

export default FollowerGrowthChart;
