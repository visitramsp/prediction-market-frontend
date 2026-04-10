"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { PieChart } from "lucide-react";
import { TrackerCategoryBreakdown } from "@/utils/typesInterface";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const COLORS = [
  "#0099FF",
  "#00E396",
  "#FEB019",
  "#FF4560",
  "#775DD0",
  "#00B8D9",
  "#c8aa76",
  "#546E7A",
  "#D4526E",
  "#8D5B4C",
];

interface CategoryPieChartProps {
  data: TrackerCategoryBreakdown;
}

const CategoryPieChart = ({ data }: CategoryPieChartProps) => {
  const { categories, untradedCount } = data;
  const empty = !categories || categories.length === 0;

  const labels = categories.map((c) => c.name);
  const series = categories.map((c) => c.percentage);
  const colors = categories.map((_, i) => COLORS[i % COLORS.length]);

  if (untradedCount > 0) {
    labels.push(`Others (${untradedCount})`);
    series.push(0);
    colors.push("#2A2A3A");
  }

  const totalTrades = categories.reduce((sum, c) => sum + c.tradeCount, 0);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      background: "transparent",
      fontFamily: "inherit",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 900,
        animateGradually: { enabled: true, delay: 80 },
      },
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 8,
        opacity: 0.15,
      },
    },
    colors,
    labels,
    stroke: {
      width: 2,
      colors: ["rgba(15,23,42,0.8)"],
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        expandOnClick: true,
        donut: {
          size: "60%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "11px",
              fontWeight: 600,
              color: "#9CA3AF",
              offsetY: -6,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              color: "#E5E7EB",
              offsetY: 4,
              formatter: (val: string) => `${parseFloat(val).toFixed(1)}%`,
            },
            total: {
              show: true,
              label: "Trades",
              fontSize: "10px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => `${totalTrades}`,
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "diagonal1",
        shadeIntensity: 0.25,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [0, 100],
      },
    },
    legend: {
      position: "bottom",
      fontSize: "11px",
      fontWeight: 500,
      labels: { colors: "#9CA3AF" },
      markers: {
        size: 5,
        shape: "circle",
        offsetX: -3,
      },
      itemMargin: { horizontal: 8, vertical: 5 },
      formatter: (
        seriesName: string,
        opts: {
          seriesIndex: number;
          w: { globals: { series: number[] } };
        }
      ) => {
        const val = opts.w.globals.series[opts.seriesIndex];
        return `${seriesName} · ${val.toFixed(1)}%`;
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
      custom: ({
        seriesIndex,
        w,
      }: {
        seriesIndex: number;
        w: { globals: { series: number[]; labels: string[] } };
      }) => {
        const name = w.globals.labels[seriesIndex];
        const val = w.globals.series[seriesIndex];
        const color = colors[seriesIndex];
        const cat = categories[seriesIndex];
        const trades = cat ? cat.tradeCount : 0;
        return `<div style="padding:10px 14px;background:#1a1a2e;border:1px solid ${color}30;border-radius:10px;font-size:11px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${color};"></div>
            <span style="color:#E5E7EB;font-weight:600;">${name}</span>
          </div>
          <div style="color:${color};font-size:16px;font-weight:700;">${val.toFixed(1)}%</div>
          ${trades > 0 ? `<div style="color:#6B7280;margin-top:2px;">${trades} trade${trades !== 1 ? "s" : ""}</div>` : ""}
        </div>`;
      },
    },
    states: {
      hover: { filter: { type: "darken", value: 0.85 } },
      active: { filter: { type: "none" } },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { height: 300 },
          legend: { fontSize: "10px" },
        },
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-4 sm:p-6 overflow-hidden
        dark:bg-white/[0.02] bg-white/80
        border dark:border-white/[0.06] border-gray-200/50
        dark:shadow-[0_0_40px_-12px_rgba(119,93,208,0.06)] shadow-lg"
    >
      {/* Accent glow */}
      <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full blur-3xl bg-[#775DD0] opacity-[0.04] pointer-events-none" />

      <div className="flex items-center gap-2.5 mb-4 relative">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #775DD018, #775DD008)",
            boxShadow: "0 0 12px #775DD010",
          }}
        >
          <PieChart size={15} style={{ color: "#775DD0" }} />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold dark:text-gray-200 text-gray-800 globalFonts">
          Category Breakdown
        </h3>
      </div>

      {empty ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <PieChart size={20} className="text-gray-600 opacity-30" />
          <p className="text-gray-500 text-[11px]">No trades yet</p>
        </div>
      ) : (
        <Chart options={options} series={series} type="donut" height={340} />
      )}
    </motion.div>
  );
};

export default CategoryPieChart;
