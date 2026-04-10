"use client";

import { motion } from "framer-motion";
import { Play, Heart, MessageCircle, Share2, FileText, Eye } from "lucide-react";
import { TrackerContentMetrics } from "@/utils/typesInterface";

interface ContentMetricsProps {
  data: TrackerContentMetrics;
}

const fmtNum = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const Stat = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex items-center gap-2">
    <div
      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}10` }}
    >
      <Icon size={11} style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold dark:text-white text-gray-900">{fmtNum(value)}</p>
      <p className="text-[9px] dark:text-gray-500 text-gray-400">{label}</p>
    </div>
  </div>
);

const ContentMetrics = ({ data }: ContentMetricsProps) => {
  const reels = data.reels;
  const posts = data.posts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="rounded-2xl p-4 sm:p-6
        dark:bg-white/[0.025] bg-white/70
        border dark:border-white/[0.06] border-gray-200/50"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-[#775DD0]/10 flex items-center justify-center">
          <Play size={14} className="text-[#775DD0]" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold dark:text-gray-300 text-gray-700 globalFonts">
          Content Performance
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Reels */}
        <div>
          <p className="text-[9px] uppercase tracking-wider dark:text-gray-500 text-gray-400 mb-2.5 font-semibold">
            Reels
          </p>
          {reels ? (
            <div className="space-y-2.5">
              <Stat icon={Play} label="Total" value={reels.totalReels} color="#775DD0" />
              <Stat icon={Eye} label="Views" value={reels.totalViews} color="#00B8D9" />
              <Stat icon={Heart} label="Likes" value={reels.totalLikes} color="#FF4560" />
              <Stat icon={MessageCircle} label="Comments" value={reels.totalComments} color="#FEB019" />
              <Stat icon={Share2} label="Shares" value={reels.totalShares} color="#00E396" />
            </div>
          ) : (
            <p className="text-[10px] text-gray-400">No reel data</p>
          )}
        </div>

        {/* Posts */}
        <div>
          <p className="text-[9px] uppercase tracking-wider dark:text-gray-500 text-gray-400 mb-2.5 font-semibold">
            Posts
          </p>
          {posts ? (
            <div className="space-y-2.5">
              <Stat icon={FileText} label="Total" value={posts.totalPosts} color="#775DD0" />
              <Stat icon={Heart} label="Likes" value={posts.totalLikes} color="#FF4560" />
              <Stat icon={MessageCircle} label="Comments" value={posts.totalComments} color="#FEB019" />
            </div>
          ) : (
            <p className="text-[10px] text-gray-400">No post data</p>
          )}
        </div>
      </div>

      {/* Top Reel */}
      {reels?.topReel && (
        <div className="mt-4 pt-3.5 border-t dark:border-white/[0.06] border-gray-200/40">
          <p className="text-[9px] uppercase tracking-wider dark:text-gray-500 text-gray-400 mb-2 font-semibold">
            Top Reel
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#775DD0]/10 flex items-center justify-center shrink-0">
              <Play size={14} className="text-[#775DD0]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] dark:text-gray-200 text-gray-700 font-medium truncate">
                {(reels.topReel as Record<string, unknown>).caption as string || "Untitled Reel"}
              </p>
              <p className="text-[9px] text-gray-400">
                {fmtNum((reels.topReel as Record<string, unknown>).viewCount as number || 0)} views
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ContentMetrics;
