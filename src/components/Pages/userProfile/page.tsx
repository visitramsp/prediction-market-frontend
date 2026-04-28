"use client";

import { userBalance, userDetails } from "@/components/service/apiService/user";
import { fetchTrackerDashboard } from "@/components/service/apiService/tracker";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/components/store/store";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import UpdateProfile from "./updateProfile";
import {
  ApiResponse,
  UserBalanceData,
  UserProfileData,
  TrackerDashboard,
} from "@/utils/typesInterface";
import FollowingFollowerList from "@/components/Modal/FollowingFollowerList/page";
import { Settings, Calendar, Award, Sparkles, BarChart3 } from "lucide-react";

import TrackerFilters from "@/components/Pages/Tracker/TrackerFilters";
import TrackerSkeleton from "@/components/Pages/Tracker/TrackerSkeleton";
import PortfolioOverview from "@/components/Pages/Tracker/PortfolioOverview";
import RoiBarChart from "@/components/Pages/Tracker/RoiBarChart";
import CategoryPieChart from "@/components/Pages/Tracker/CategoryPieChart";
import RecentTradesTable from "@/components/Pages/Tracker/RecentTradesTable";
import ContentMetrics from "@/components/Pages/Tracker/ContentMetrics";
import FollowerGrowthChart from "@/components/Pages/Tracker/FollowerGrowthChart";
import CommunityComparison from "@/components/Pages/Tracker/CommunityComparison";
import ActivitySummary from "@/components/Pages/Tracker/ActivitySummary";
import { FaShare } from "react-icons/fa";
import { IoCopyOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import AddFund from "./proTabs/addFund";
import { WalletConnection } from "@/components/Layout/WalletConnection";
import { useAccount } from "wagmi";

const UserProfile = () => {
  const [user, setUser] = useState<UserProfileData[] | null>(null);
  const [balance, setBalance] = useState<UserBalanceData | null>(null);
  const [open, setOpen] = useState(false);
  const [isFollow, setIsFollow] = useState(false);
  const { isConnected } = useAccount();
  const [trackerData, setTrackerData] = useState<TrackerDashboard | null>(null);
  const [period, setPeriod] = useState("month");
  const [trackerLoading, setTrackerLoading] = useState(true);
  const [trackerError, setTrackerError] = useState("");

  // Redux user for instant display while API loads
  const authUser = useSelector((state: any) => state.user?.user);

  const userData = user?.[0] || null;
  const portFolioData = user?.[1] || null;
  const totalTrades = portFolioData?.stats?.totalTrades || "0";

  console.log(userData, "userData");

  const handleClose = () => setOpen(false);

  const getUserBalance = async () => {
    try {
      const response: ApiResponse<UserBalanceData> = await userBalance();
      if (response.success) setBalance(response.data);
      else setBalance(null);
    } catch {
      setBalance(null);
    }
  };

  const userDetailsList = async () => {
    try {
      const response: ApiResponse<UserProfileData[]> = await userDetails();
      if (response.success) setUser(response.data);
      else setUser(null);
    } catch {
      setUser(null);
    }
  };

  const loadTracker = useCallback(async () => {
    setTrackerLoading(true);
    setTrackerError("");
    try {
      const response: ApiResponse<TrackerDashboard> =
        await fetchTrackerDashboard(period);
      if (response.success) setTrackerData(response.data);
      else setTrackerError("Failed to load tracker data");
    } catch {
      setTrackerError("Something went wrong");
    } finally {
      setTrackerLoading(false);
    }
  }, [period]);

  useEffect(() => {
    getUserBalance();
    userDetailsList();
  }, []);

  useEffect(() => {
    loadTracker();
  }, [loadTracker]);

  const handleCopyRefferalLink = async () => {
    try {
      const linkOfRef = `http://localhost:3000/register/${authUser?.userId}`;
      await navigator.clipboard.writeText(linkOfRef);
      toast.success("Referral link copied!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy referral link");
    }
  };

  console.log(isConnected, "isConnected=>>>>>");

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-6 sm:pt-10 pb-16">
        {/* ── PROFILE HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl
          dark:bg-gradient-to-br dark:from-[#0b101a] dark:to-[#06080f]
          bg-gradient-to-br from-white to-gray-50/80
          border dark:border-white/[0.06] border-gray-200/60
          shadow-sm dark:shadow-none"
        >
          {/* Background Decorative Blobs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#0099FF]/[0.06] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-[#775DD0]/[0.04] blur-3xl pointer-events-none" />

          <div className="relative p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
              {/* Avatar Section */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-16 h-16 sm:w-20 sm:h-20 
                rounded-2xl overflow-hidden shadow-lg"
              >
                <Image
                  src={
                    userData?.user?.image_url ||
                    "https://5.imimg.com/data5/SELLER/Default/2023/7/329252193/LO/EW/HT/2614339/mens-wear.jpg"
                  }
                  alt="Profile"
                  width={80}
                  height={80}
                  className=" object-cover"
                />
              </motion.div>

              {/* Main Info Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold dark:text-white text-gray-900 truncate tracking-tight">
                      {userData?.user?.username ||
                        authUser?.username ||
                        "Unknown User"}
                    </h1>
                    <p className="text-[11px] dark:text-gray-500 text-gray-400 mt-0.5">
                      {userData?.user?.email || authUser?.email || "--"}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <div className="relative group inline-block">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 cursor-pointer">
                        <Sparkles size={11} />$
                        {portFolioData?.wallet?.balance +
                          (portFolioData?.wallet?.tokenBalance || 0)}
                      </span>
                      <div
                        className="
    absolute top-full left-1/2 -translate-x-1/2 mt-2
    opacity-0 group-hover:opacity-100 pointer-events-none
    transition-all duration-300 scale-95 group-hover:scale-100
    bg-white text-gray-800 dark:bg-black/80 dark:text-white
    backdrop-blur-xl border border-gray-200 dark:border-white/10
    rounded-xl px-3 py-2 shadow-xl text-xs whitespace-nowrap z-[9999]
  "
                      >
                        <div className="flex flex-col gap-1">
                          <span>
                            💰 Balance: {portFolioData?.wallet?.balance || 0}
                          </span>
                          <span>
                            🪙 Token: {portFolioData?.wallet?.tokenBalance || 0}
                          </span>
                        </div>
                        <div
                          className="
      absolute bottom-full left-1/2 -translate-x-1/2
      w-2 h-2 bg-white dark:bg-black/80 rotate-45
      border-l border-t border-gray-200 dark:border-white/10
    "
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-medium dark:bg-white/[0.05] bg-gray-100/80 dark:text-gray-400 text-gray-500 border dark:border-white/[0.06] border-gray-200/50 hover:brightness-110 transition-all"
                    >
                      <Settings size={12} /> Edit Profile
                    </button>
                  </div>
                </div>

                {/* Joined Date */}
                <span className="inline-flex items-center gap-1 text-[10px] dark:text-gray-500 text-gray-400 mt-2 uppercase tracking-wider font-semibold">
                  <Calendar size={10} />
                  Joined{" "}
                  {userData?.user?.createdAt
                    ? moment(userData.user.createdAt).format("MMM YYYY")
                    : "--"}
                </span>

                {/* Stats Bar */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <button
                    onClick={() => setIsFollow(true)}
                    className="group text-left"
                  >
                    <span className="text-sm font-bold dark:text-white text-gray-900">
                      {userData?.following || "0"}
                    </span>
                    <span className="text-[11px] dark:text-gray-500 text-gray-400 ml-1 group-hover:text-blue-400 transition-colors">
                      Following
                    </span>
                  </button>
                  <button
                    onClick={() => setIsFollow(true)}
                    className="group text-left"
                  >
                    <span className="text-sm font-bold dark:text-white text-gray-900">
                      {userData?.follower || "0"}
                    </span>
                    <span className="text-[11px] dark:text-gray-500 text-gray-400 ml-1 group-hover:text-blue-400 transition-colors">
                      Followers
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Award
                      size={12}
                      className="dark:text-[#c8aa76] text-amber-500"
                    />
                    <span className="text-sm font-bold dark:text-white text-gray-900">
                      {totalTrades}
                    </span>
                    <span className="text-[11px] dark:text-gray-500 text-gray-400">
                      Predictions
                    </span>
                  </div>
                </div>

                {/* Referral & Reward Section (Premium UI) */}
                <div className="flex flex-row items-center justify-between mt-5 pt-4 border-t dark:border-white/[0.04] border-gray-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      onClick={handleCopyRefferalLink}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer
                             dark:bg-blue-500/5 bg-blue-50 border dark:border-blue-500/20 border-blue-200/50
                             group transition-all hover:bg-blue-500/10"
                    >
                      <FaShare size={11} className="text-blue-500" />
                      <span className="text-[11px] font-bold dark:text-blue-400 text-blue-600 tracking-wide">
                        {authUser?.userId || "N/A"}
                      </span>
                      <IoCopyOutline
                        size={12}
                        className="text-blue-400 group-hover:scale-110 transition-transform"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <p className="text-[11px] font-bold dark:text-emerald-400/90 text-emerald-600 uppercase tracking-tight">
                        Invite & Earn $5.00 instantly
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    
                    <WalletConnection />
                    <AddFund
                      userId={userData?.user?.id}
                      userListFin={userDetailsList}
                      isConnected={isConnected}
                    />
                  </div>
                </div>

                {/* Bio */}
                {userData?.user?.description && (
                  <p className="text-[11px] dark:text-gray-400 text-gray-500 mt-4 leading-relaxed max-w-lg italic">
                    "{userData.user.description}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── TRACKER ── */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg dark:bg-[#0099FF]/10 bg-[#0099FF]/[0.07]
                flex items-center justify-center"
              >
                <BarChart3 size={14} className="text-[#0099FF]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold dark:text-white text-gray-900 globalFonts">
                  Activity Tracker
                </h2>
                <p className="text-[10px] dark:text-gray-500 text-gray-400 globalFonts leading-tight">
                  Your performance dashboard
                </p>
              </div>
            </div>
            <TrackerFilters period={period} setPeriod={setPeriod} />
          </div>

          <AnimatePresence mode="wait">
            {trackerLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TrackerSkeleton />
              </motion.div>
            ) : trackerError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div
                  className="w-11 h-11 rounded-xl dark:bg-white/5 bg-gray-100
                  flex items-center justify-center mb-3"
                >
                  <BarChart3
                    size={18}
                    className="dark:text-gray-500 text-gray-400"
                  />
                </div>
                <p className="dark:text-gray-400 text-gray-500 text-xs mb-2 globalFonts">
                  {trackerError}
                </p>
                <button
                  onClick={loadTracker}
                  className="text-[11px] font-medium text-[#0099FF] hover:text-[#0088dd]
                    cursor-pointer transition-colors"
                >
                  Try again
                </button>
              </motion.div>
            ) : trackerData ? (
              <motion.div
                key="data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* Row 1: 4 Portfolio Stats in a row */}
                <PortfolioOverview data={trackerData.portfolio} />

                {/* Row 2: ROI Bar Graph full width */}
                <RoiBarChart data={trackerData.roiTimeSeries} />

                {/* Row 2: Category Pie Chart + Activity Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <CategoryPieChart data={trackerData.categoryBreakdown} />
                  <ActivitySummary
                    data={trackerData.activitySummary}
                    topPerformers={trackerData.topPerformers}
                  />
                </div>

                {/* Row 3: You vs Community + Follower Growth */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <CommunityComparison data={trackerData.communityComparison} />
                  <FollowerGrowthChart data={trackerData.followerGrowth} />
                </div>

                {/* Row 4: Recent Trades + Content Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <RecentTradesTable data={trackerData.recentTrades} />
                  <ContentMetrics data={trackerData.contentMetrics} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <UpdateProfile
        isOpen={open}
        handleClose={handleClose}
        userDetails={userData}
        fetchUserDetails={userDetailsList}
      />
      <FollowingFollowerList
        handleClose={() => setIsFollow(false)}
        isOpen={isFollow}
        onClose={() => setIsFollow(false)}
        userId={userData?.user?.id}
      />
    </>
  );
};

export default UserProfile;
