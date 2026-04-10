"use client";

import { motion } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Film,
  FileText,
  Heart,
  Eye,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import {
  TrackerActivitySummary,
  TrackerTopPerformers,
} from "@/utils/typesInterface";

interface ActivitySummaryProps {
  data: TrackerActivitySummary;
  topPerformers: TrackerTopPerformers;
}

const ringConfig = [
  { key: "trades", label: "Trades", color: "#00E396", glow: "rgba(0,227,150,0.15)" },
  { key: "posts", label: "Posts", color: "#775DD0", glow: "rgba(119,93,208,0.15)" },
  { key: "reels", label: "Reels", color: "#00B8D9", glow: "rgba(0,184,217,0.15)" },
  { key: "followers", label: "Followers", color: "#FEB019", glow: "rgba(254,176,25,0.15)" },
];

const Ring = ({
  value,
  label,
  color,
  glow,
  delay,
}: {
  value: number;
  label: string;
  color: string;
  glow: string;
  delay: number;
}) => {
  const r = 30;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        className="relative w-[66px] h-[66px]"
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <svg className="w-full h-full" viewBox="0 0 68 68">
          {/* Background track */}
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke="currentColor"
            className="dark:text-white/[0.04] text-gray-200/50"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Animated ring */}
          <motion.circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ delay, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-sm font-bold dark:text-white text-gray-900"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.4, duration: 0.4, ease: "backOut" }}
          >
            {value}
          </motion.span>
        </div>
      </motion.div>
      <p className="text-[9px] dark:text-gray-500 text-gray-400 font-semibold uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
};

const PerformerItem = ({
  icon,
  iconColor,
  label,
  content,
  delay,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  content: React.ReactNode;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="flex items-start gap-3 py-2.5 group/item
      hover:dark:bg-white/[0.02] hover:bg-gray-50/50
      rounded-xl px-2 -mx-2 transition-colors duration-200"
  >
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
      style={{
        background: `linear-gradient(135deg, ${iconColor}18, ${iconColor}08)`,
      }}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] dark:text-gray-500 text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <div className="text-[13px] dark:text-gray-300 text-gray-600 leading-snug">
        {content}
      </div>
    </div>
  </motion.div>
);

const ActivitySummary = ({ data, topPerformers }: ActivitySummaryProps) => {
  const values: Record<string, number> = {
    trades: data.trades,
    posts: data.posts,
    reels: data.reels,
    followers: data.totalFollowers,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-4 sm:p-6 overflow-hidden
        dark:bg-white/[0.02] bg-white/80
        border dark:border-white/[0.06] border-gray-200/50
        dark:shadow-[0_0_40px_-12px_rgba(254,176,25,0.05)] shadow-lg"
    >
      {/* Accent glow */}
      <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-3xl bg-[#FEB019] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5 relative">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #FEB01918, #FEB01908)",
            boxShadow: "0 0 12px #FEB01910",
          }}
        >
          <Zap size={15} className="text-[#FEB019]" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold dark:text-gray-200 text-gray-800 globalFonts">
          Activity Summary
        </h3>
      </div>

      {/* Rings */}
      <div className="flex items-center justify-around mb-6">
        {ringConfig.map((ring, i) => (
          <div key={ring.key} className="relative">
            <Ring
              value={values[ring.key]}
              label={ring.label}
              color={ring.color}
              glow={ring.glow}
              delay={0.6 + i * 0.12}
            />
            {ring.key === "followers" && data.newFollowers !== 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 500 }}
                className={`absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full
                  border ${
                  data.newFollowers > 0
                    ? "bg-[#00E396]/10 text-[#00E396] border-[#00E396]/20"
                    : "bg-[#FF4560]/10 text-[#FF4560] border-[#FF4560]/20"
                }`}
              >
                {data.newFollowers > 0 ? "+" : ""}
                {data.newFollowers}
              </motion.span>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px dark:bg-gradient-to-r dark:from-transparent dark:via-white/[0.06] dark:to-transparent bg-gradient-to-r from-transparent via-gray-200/50 to-transparent mb-3" />

      {/* Best Performers */}
      <div className="space-y-0.5">
        <PerformerItem
          icon={<TrendingUp size={13} className="text-[#00E396]" />}
          iconColor="#00E396"
          label="Best Market"
          delay={1.1}
          content={
            topPerformers.bestMarket ? (
              <div className="flex items-center justify-between gap-2">
                <span className="line-clamp-2 leading-snug">
                  {topPerformers.bestMarket.question}
                </span>
                <span className="shrink-0 text-[10px] font-semibold dark:text-gray-400 text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-md">
                  {topPerformers.bestMarket.shares}{" "}
                  {topPerformers.bestMarket.shares === 1 ? "share" : "shares"}
                </span>
              </div>
            ) : (
              <span className="dark:text-gray-600 text-gray-400 italic text-[12px]">
                No positions yet
              </span>
            )
          }
        />

        <PerformerItem
          icon={<Film size={13} className="text-[#00B8D9]" />}
          iconColor="#00B8D9"
          label="Best Reel"
          delay={1.2}
          content={
            topPerformers.bestReel ? (
              <div className="flex items-center justify-between gap-2">
                <span className="line-clamp-2 leading-snug">
                  {topPerformers.bestReel.caption}
                </span>
                <div className="shrink-0 flex items-center gap-2 text-[10px] font-semibold dark:text-gray-400 text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <Eye size={10} />
                    {topPerformers.bestReel.viewCount}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Heart size={10} />
                    {topPerformers.bestReel.likeCount}
                  </span>
                </div>
              </div>
            ) : (
              <span className="dark:text-gray-600 text-gray-400 italic text-[12px]">
                No reels yet
              </span>
            )
          }
        />

        <PerformerItem
          icon={<FileText size={13} className="text-[#775DD0]" />}
          iconColor="#775DD0"
          label="Top Post"
          delay={1.3}
          content={
            topPerformers.topPost ? (
              <div className="flex items-center justify-between gap-2">
                <span className="line-clamp-2 leading-snug">
                  {topPerformers.topPost.title}
                </span>
                <div className="shrink-0 flex items-center gap-2 text-[10px] font-semibold dark:text-gray-400 text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <ThumbsUp size={10} />
                    {topPerformers.topPost.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle size={10} />
                    {topPerformers.topPost.comments}
                  </span>
                </div>
              </div>
            ) : (
              <span className="dark:text-gray-600 text-gray-400 italic text-[12px]">
                No posts yet
              </span>
            )
          }
        />
      </div>
    </motion.div>
  );
};

export default ActivitySummary;
