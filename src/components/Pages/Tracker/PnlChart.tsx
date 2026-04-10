"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { PnlDataPoint } from "@/utils/typesInterface";
import { TrendingUp } from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface PnlChartProps {
  data: PnlDataPoint[];
}

const PnlChart = ({ data }: PnlChartProps) => {
  const empty = !data || data.length === 0;
  const isPositive = !empty && data[data.length - 1]?.cumulativePnl >= 0;
  const lineColor = isPositive ? "#00E396" : "#FF4560";

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      background: "transparent",
      animations: { enabled: true, easing: "easeinout", speed: 700 },
      fontFamily: "inherit",
    },
    colors: [lineColor],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] },
    },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: data.map((d) => d.date),
      labels: { style: { colors: "#6B7280", fontSize: "9px" }, rotate: -45, maxHeight: 50 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#6B7280", fontSize: "10px" },
        formatter: (val: number) => `$${val.toFixed(0)}`,
      },
    },
    grid: { borderColor: "rgba(107,114,128,0.1)", strokeDashArray: 4 },
    tooltip: {
      theme: "dark",
      y: { formatter: (val: number) => `$${val.toFixed(2)}` },
    },
    dataLabels: { enabled: false },
  };

  const series = [
    { name: "Cumulative P&L", data: data.map((d) => parseFloat(d.cumulativePnl.toFixed(2))) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-2xl p-4 sm:p-6
        dark:bg-white/[0.025] bg-white/70
        border dark:border-white/[0.06] border-gray-200/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${lineColor}12` }}>
          <TrendingUp size={14} style={{ color: lineColor }} />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold dark:text-gray-300 text-gray-700 globalFonts">
          Portfolio Growth
        </h3>
      </div>
      {empty ? (
        <div className="flex items-center justify-center h-36 text-gray-400 text-xs">
          No trading data yet
        </div>
      ) : (
        <Chart options={options} series={series} type="area" height={220} />
      )}
    </motion.div>
  );
};

export default PnlChart;
