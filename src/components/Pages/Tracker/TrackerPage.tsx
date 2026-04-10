"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { fetchTrackerDashboard } from "@/components/service/apiService/tracker";
import { TrackerDashboard, ApiResponse } from "@/utils/typesInterface";

import TrackerFilters from "./TrackerFilters";
import TrackerSkeleton from "./TrackerSkeleton";
import PortfolioOverview from "./PortfolioOverview";
import RoiBarChart from "./RoiBarChart";
import CategoryPieChart from "./CategoryPieChart";
import RecentTradesTable from "./RecentTradesTable";
import ContentMetrics from "./ContentMetrics";
import FollowerGrowthChart from "./FollowerGrowthChart";
import CommunityComparison from "./CommunityComparison";
import ActivitySummary from "./ActivitySummary";

const TrackerPage = () => {
  const [data, setData] = useState<TrackerDashboard | null>(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response: ApiResponse<TrackerDashboard> =
        await fetchTrackerDashboard(period);
      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to load tracker data");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="max-w-[1450px] mx-auto px-4 pt-20 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/userProfile"
          className="w-9 h-9 rounded-xl flex items-center justify-center
            dark:bg-white/5 bg-gray-100
            dark:hover:bg-white/10 hover:bg-gray-200
            transition-colors duration-150"
        >
          <ArrowLeft size={18} className="dark:text-gray-400 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold dark:text-white text-gray-900 globalFonts">
            Profile Tracker
          </h1>
          <p className="text-xs dark:text-gray-400 text-gray-500 globalFonts">
            Your personal activity and performance dashboard
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TrackerFilters period={period} setPeriod={setPeriod} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TrackerSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-400 text-sm mb-3">{error}</p>
            <button
              onClick={loadDashboard}
              className="text-sm text-[#0099FF] hover:underline"
            >
              Try again
            </button>
          </motion.div>
        ) : data ? (
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Row 1: 4 Portfolio Stats in a row */}
            <PortfolioOverview data={data.portfolio} />

            {/* Row 2: ROI Bar Graph full width */}
            <RoiBarChart data={data.roiTimeSeries} />

            {/* Row 2: Category Pie Chart + Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart data={data.categoryBreakdown} />
              <ActivitySummary
                data={data.activitySummary}
                topPerformers={data.topPerformers}
              />
            </div>

            {/* Row 3: You vs Community + Follower Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CommunityComparison data={data.communityComparison} />
              <FollowerGrowthChart data={data.followerGrowth} />
            </div>

            {/* Row 4: Recent Trades + Content Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentTradesTable data={data.recentTrades} />
              <ContentMetrics data={data.contentMetrics} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default TrackerPage;
