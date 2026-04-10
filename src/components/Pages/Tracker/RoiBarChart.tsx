"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { RoiDataPoint } from "@/utils/typesInterface";
import { TrendingUp, Lock } from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Tab = "ROI" | "NASDAQ" | "S&P 500";

interface RoiBarChartProps {
  data: RoiDataPoint[];
}

const tabs: Tab[] = ["ROI", "NASDAQ", "S&P 500"];

/** Format "2026-02-10" → "10th Feb" */
const formatDateShort = (dateStr: string): string => {
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

/** Format for tooltip: "10th Feb 2026" */
const formatDateFull = (dateStr: string): string => {
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
  return `${day}${suffix} ${month} ${d.getFullYear()}`;
};

const RoiBarChart = ({ data }: RoiBarChartProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("ROI");

  const empty = !data || data.length === 0;

  // Compute latest ROI for the header badge
  const latestRoi = !empty ? data[data.length - 1].roi : 0;
  const isPositive = latestRoi >= 0;
  const mainColor = isPositive ? "#00E396" : "#FF4560";

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      background: "transparent",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 1200,
        dynamicAnimation: { speed: 500 },
        animateGradually: { enabled: true, delay: 80 },
      },
      fontFamily: "inherit",
      zoom: { enabled: false },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 0,
        blur: 6,
        opacity: 0.2,
        color: mainColor,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2.5,
      lineCap: "round",
    },
    colors: [mainColor],
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.4,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 95],
        colorStops: [
          { offset: 0, color: mainColor, opacity: 0.3 },
          { offset: 50, color: mainColor, opacity: 0.1 },
          { offset: 100, color: mainColor, opacity: 0 },
        ],
      },
    },
    markers: {
      size: 3,
      colors: [mainColor],
      strokeColors: "#0f172a",
      strokeWidth: 1.5,
      hover: {
        size: 6,
        sizeOffset: 3,
      },
      shape: "circle",
    },
    xaxis: {
      categories: data.map((d) => formatDateShort(d.period)),
      labels: {
        style: { colors: "#6B7280", fontSize: "8px", fontWeight: 500 },
        rotate: -45,
        maxHeight: 60,
        hideOverlappingLabels: true,
        showDuplicates: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: Math.min(data.length, 12),
      crosshairs: {
        show: true,
        width: 1,
        position: "back",
        stroke: { color: "#ffffff12", width: 1, dashArray: 4 },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#6B7280", fontSize: "10px", fontWeight: 500 },
        formatter: (val: number) =>
          `${val >= 0 ? "+" : ""}${val.toFixed(1)}%`,
      },
    },
    grid: {
      borderColor: "rgba(255,255,255,0.04)",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 8, right: 8 },
    },
    tooltip: {
      theme: "dark",
      custom: ({
        dataPointIndex,
      }: {
        dataPointIndex: number;
      }) => {
        const point = data[dataPointIndex];
        if (!point) return "";
        const color = point.roi >= 0 ? "#00E396" : "#FF4560";
        const sign = point.roi >= 0 ? "+" : "";
        return `<div style="padding:10px 14px;background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);border:1px solid ${color}25;border-radius:10px;font-size:11px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
          <div style="color:#9CA3AF;margin-bottom:5px;font-weight:500;">${formatDateFull(point.period)}</div>
          <div style="color:${color};font-weight:800;font-size:16px;letter-spacing:-0.3px;">${sign}${point.roi.toFixed(2)}%</div>
          <div style="color:#6B7280;margin-top:3px;font-size:10px;">Daily P&L: <span style="color:#E5E7EB;">$${point.pnl.toFixed(2)}</span></div>
        </div>`;
      },
    },
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
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  const series = [
    {
      name: "ROI",
      data: data.map((d) => parseFloat(d.roi.toFixed(2))),
    },
  ];

  const renderPlaceholder = (label: string) => (
    <div className="flex flex-col items-center justify-center h-56 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <Lock size={18} className="text-gray-500" />
      </div>
      <p className="text-[11px] text-gray-500 text-center max-w-[220px] leading-relaxed">
        Configure API key in settings to view {label} comparison
      </p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-4 sm:p-6 overflow-hidden
        dark:bg-white/[0.02] bg-white/80
        border dark:border-white/[0.06] border-gray-200/50
        dark:shadow-[0_0_40px_-12px_rgba(0,227,150,0.06)] shadow-lg"
    >
      {/* Subtle glow accent */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-[0.04] pointer-events-none"
        style={{ background: mainColor }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${mainColor}20, ${mainColor}08)`,
              boxShadow: `0 0 14px ${mainColor}12`,
            }}
          >
            <TrendingUp size={15} style={{ color: mainColor }} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold dark:text-gray-200 text-gray-800 globalFonts">
              ROI Growth
            </h3>
            {!empty && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] font-bold"
                style={{ color: mainColor }}
              >
                {isPositive ? "+" : ""}
                {latestRoi.toFixed(2)}%
              </motion.span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 rounded-xl p-1 dark:bg-white/[0.04] bg-gray-100/80 backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all duration-300
                ${
                  activeTab === tab
                    ? "dark:text-white text-gray-900"
                    : "dark:text-gray-500 text-gray-500 hover:dark:text-gray-300 hover:text-gray-700"
                }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="roiTab"
                  className="absolute inset-0 dark:bg-white/10 bg-white rounded-lg shadow-sm"
                  transition={{
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.5,
                  }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "ROI" ? (
            empty ? (
              <div className="flex flex-col items-center justify-center h-56 gap-2 text-gray-500">
                <TrendingUp size={20} className="opacity-30" />
                <p className="text-[11px]">No ROI data yet</p>
              </div>
            ) : (
              <Chart
                options={options}
                series={series}
                type="area"
                height={240}
              />
            )
          ) : activeTab === "NASDAQ" ? (
            renderPlaceholder("NASDAQ")
          ) : (
            renderPlaceholder("S&P 500")
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default RoiBarChart;
