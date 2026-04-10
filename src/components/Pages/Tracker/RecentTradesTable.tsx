"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Activity, ExternalLink } from "lucide-react";
import { TrackerRecentTrade } from "@/utils/typesInterface";
import moment from "moment";

interface RecentTradesTableProps {
  data: TrackerRecentTrade[];
}

const categoryColors: Record<string, string> = {
  Sports: "#00E396",
  Crypto: "#FEB019",
  Politics: "#0099FF",
  Entertainment: "#775DD0",
  Finance: "#FF4560",
  Technology: "#00B8D9",
};

const getCategoryColor = (name: string): string => {
  return categoryColors[name] || "#546E7A";
};

const RecentTradesTable = ({ data }: RecentTradesTableProps) => {
  const isBuy = (side: string) => side === "BUY";

  const handleTradeClick = (questionId: number) => {
    window.open(`/market/${questionId}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-4 sm:p-6 flex flex-col overflow-hidden
        dark:bg-white/[0.02] bg-white/80
        border dark:border-white/[0.06] border-gray-200/50
        dark:shadow-[0_0_40px_-12px_rgba(0,153,255,0.05)] shadow-lg"
    >
      {/* Accent glow */}
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl bg-[#0099FF] opacity-[0.03] pointer-events-none" />

      <div className="flex items-center gap-2.5 mb-4 relative">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0099FF18, #0099FF08)",
            boxShadow: "0 0 12px #0099FF10",
          }}
        >
          <Activity size={15} className="text-[#0099FF]" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold dark:text-gray-200 text-gray-800 globalFonts">
          Recent Trades
        </h3>
        {data && data.length > 0 && (
          <span className="text-[9px] font-semibold dark:text-gray-600 text-gray-400 ml-auto">
            {data.length} trades
          </span>
        )}
      </div>

      {!data || data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
          <Activity size={20} className="text-gray-600 opacity-30" />
          <p className="text-gray-500 text-[11px]">No trades yet</p>
        </div>
      ) : (
        <div className="space-y-1 flex-1 overflow-y-auto max-h-60 scrollbar-hide">
          {data.map((trade, i) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => handleTradeClick(trade.questionId)}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl
                dark:hover:bg-white/[0.03] hover:bg-gray-50/80
                transition-all duration-150 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isBuy(trade.side)
                      ? "bg-[#00E396]/8 text-[#00E396]"
                      : "bg-[#FF4560]/8 text-[#FF4560]"
                  }`}
                  style={{
                    boxShadow: isBuy(trade.side)
                      ? "0 0 8px rgba(0,227,150,0.08)"
                      : "0 0 8px rgba(255,69,96,0.08)",
                  }}
                >
                  {isBuy(trade.side) ? (
                    <ArrowUpRight size={13} />
                  ) : (
                    <ArrowDownRight size={13} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-medium dark:text-gray-200 text-gray-800 line-clamp-2 leading-snug">
                      {trade.question}
                    </p>
                    <ExternalLink
                      size={9}
                      className="shrink-0 dark:text-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] dark:text-gray-500 text-gray-400">
                      {trade.option} · {moment(trade.createdAt).fromNow()}
                    </span>
                    {trade.categoryName && (
                      <span
                        className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${getCategoryColor(trade.categoryName)}10`,
                          color: getCategoryColor(trade.categoryName),
                          borderColor: `${getCategoryColor(trade.categoryName)}20`,
                        }}
                      >
                        {trade.categoryName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-[11px] font-bold ${
                    isBuy(trade.side) ? "text-[#00E396]" : "text-[#FF4560]"
                  }`}
                >
                  ${trade.cost.toFixed(2)}
                </p>
                <p className="text-[9px] dark:text-gray-500 text-gray-400 font-medium">
                  {trade.shares.toFixed(1)} sh
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RecentTradesTable;
