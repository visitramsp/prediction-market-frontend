"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import { BASE_COLORS, prepareSeries } from "@/utils/Content";
import { RawSeries } from "@/utils/typesInterface";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface StackedAreaChartProps {
  data?: RawSeries[];
  timeIntervalValue: string;
  setTimeIntervalValue: (value: string) => void;
}

const StackedAreaChart = ({
  data = [],
  timeIntervalValue = "all",
  setTimeIntervalValue,
}: StackedAreaChartProps) => {
  const { theme } = useTheme();

  const series = prepareSeries(data);

  const colors = series.map(
    (_, index) => BASE_COLORS[index % BASE_COLORS.length],
  );

  const options: ApexOptions = {
    chart: {
      type: "line", // 🔥 Shadows hatane ke liye 'line' best hai agar niche ka rang nahi chahiye
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: true },
      animations: {
        enabled: true,
      },
    },

    colors: colors,

    dataLabels: {
      enabled: false,
    },

    // ✅ Fix 1: Saare circles aur markers ko hide kiya
    markers: {
      size: 0,
      strokeWidth: 0,
      hover: {
        size: 0,
      },
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    // ✅ Fix 2: Niche ki shadow/gradient hatane ke liye fill ko transparent ya solid line rakha
    fill: {
      type: "solid",
      opacity: 1,
    },

    legend: {
      show: false,
    },

    xaxis: {
      type: "datetime",
      crosshairs: {
        show: true,
        width: 1,
        stroke: {
          color: "#9ca3af",
          dashArray: 4,
        },
      },
      labels: {
        style: {
          colors: "#6b7280",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      opposite: true, // Scale right side par kar diya professional look ke liye
      min: 0,
      max: 1,
      labels: {
        style: { colors: "#6b7280" },
        formatter: (val: number) => `${(val * 100).toFixed(0)}%`,
      },
    },

    grid: {
      borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
      strokeDashArray: 4,
      padding: {
        right: 20,
      },
    },

    // ✅ Fix 3: Tooltip ko shared rakha taaki kahin bhi hover karne par value dikhe
    tooltip: {
      shared: true,
      intersect: false,
      followCursor: false,
      theme: theme === "dark" ? "dark" : "light",
      x: {
        format: "dd MMM HH:mm",
      },
      y: {
        formatter: (val: number) => `${(val * 100).toFixed(1)}%`,
      },
      marker: {
        show: true, // Tooltip ke andar color dot dikhega line par nahi
      },
    },
  };

  const timeInterval = ["5m", "15m", "30m", "1h", "24h", "7d", "all"];

  return (
    <div className="w-full flex flex-col relative sm:mx-0">
      {/* Filters Area */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-1 dark:bg-[#111A22] bg-gray-200 rounded-lg px-1 py-1">
          {timeInterval.map((item) => (
            <button
              key={item}
              onClick={() => setTimeIntervalValue(item)}
              className={`
                px-3 py-1 text-xs font-medium rounded-md transition-all
                ${
                  item === timeIntervalValue
                    ? "dark:bg-[#1D293D] bg-white dark:text-white text-black shadow-sm"
                    : "dark:text-gray-400 text-gray-600 hover:text-white cursor-pointer"
                }
              `}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full">
        {data?.length > 0 ? (
          <ApexChart
            type="line" // 🔥 Area se hatakar line kar diya shadow hatane ke liye
            height={250}
            series={series}
            options={options}
          />
        ) : (
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg h-56 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700">
            <span className="text-gray-500 font-medium">No Data Available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StackedAreaChart;
