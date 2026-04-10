"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, TrendingUp, Heart, MessageCircle, Eye } from "lucide-react";
import { TrackerTopPerformers } from "@/utils/typesInterface";

interface TopPerformersProps {
  data: TrackerTopPerformers;
}

const TopPerformers = ({ data }: TopPerformersProps) => {
  const { bestAsset, mostEngagingContent } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl p-4 sm:p-6
        dark:bg-white/[0.025] bg-white/70
        border dark:border-white/[0.06] border-gray-200/50"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-[#c8aa76]/10 flex items-center justify-center">
          <Trophy size={14} className="text-[#c8aa76]" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold dark:text-gray-300 text-gray-700 globalFonts">
          Top Performers
        </h3>
      </div>

      <div className="space-y-3">
        {/* Best Asset */}
        <div className="p-3 rounded-xl dark:bg-white/[0.02] bg-gray-50/60">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp size={11} className="text-[#00E396]" />
            <p className="text-[9px] uppercase tracking-wider dark:text-gray-500 text-gray-400 font-semibold">
              Best Asset
            </p>
          </div>
          {bestAsset ? (
            <div>
              <p className="text-[11px] dark:text-gray-200 text-gray-800 font-medium truncate">
                {(bestAsset.question as string) || "Unknown Market"}
              </p>
              <p className="text-[9px] dark:text-gray-500 text-gray-400 mt-0.5">
                {(bestAsset.optionTitle as string) || "Unknown Option"} ·{" "}
                {parseFloat((bestAsset.shares as string) || "0").toFixed(1)} shares
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400">No positions yet</p>
          )}
        </div>

        {/* Most Engaging */}
        <div className="p-3 rounded-xl dark:bg-white/[0.02] bg-gray-50/60">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Flame size={11} className="text-[#FF4560]" />
            <p className="text-[9px] uppercase tracking-wider dark:text-gray-500 text-gray-400 font-semibold">
              Best Content
            </p>
          </div>
          {mostEngagingContent ? (
            <div>
              <p className="text-[11px] dark:text-gray-200 text-gray-800 font-medium truncate">
                {(mostEngagingContent.title as string) || "Untitled"}
              </p>
              <div className="flex items-center gap-2.5 mt-1">
                {(mostEngagingContent.type as string) === "reel" && (
                  <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                    <Eye size={9} />
                    {(mostEngagingContent.views as number) || 0}
                  </span>
                )}
                <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                  <Heart size={9} />
                  {(mostEngagingContent.likes as number) || 0}
                </span>
                <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                  <MessageCircle size={9} />
                  {(mostEngagingContent.comments as number) || 0}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400">No content yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TopPerformers;
