import React from "react";

// ── Skeleton block ───────────────────────────────────────
const S = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-gradient-to-r from-[#111318] via-[#1a1d25] to-[#111318] bg-[length:200%_100%] animate-sweep rounded ${className}`}
  >
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
  </div>
);

// ── Sparkline ───────────────────────────────────────────
const SparkSkeleton = ({ color }: { color: string }) => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
    <polyline
      points="0,18 8,14 16,16 24,11 32,13 40,8 48,10"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-30"
    />
  </svg>
);

// ── Card ────────────────────────────────────────────────
const MarketCardSkeleton = () => {
  return (
    <div className="!w-full rounded-2xl p-[1px] bg-gradient-to-br from-white/10 to-transparent shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      {/* Inner Card */}
      <div className="relative rounded-2xl p-5 bg-gradient-to-br from-[#0d0f14] to-[#090b10] border border-white/5 backdrop-blur-xl">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-3xl" />

        {/* Title */}
        <S className="h-3 w-2/3 mb-4" />

        {/* Row */}
        <div className="flex gap-3 mb-4">
          <S className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <S className="h-3 w-full" />
            <S className="h-3 w-2/3" />
          </div>
        </div>

        {/* Meta */}
        <div className="flex justify-between mb-4">
          <S className="h-2 w-24" />
          <S className="h-2 w-16" />
        </div>

        {/* YES */}
        <div className="flex justify-between items-center py-3 ">
          <div className="flex items-center gap-3">
            <S className="h-3 w-8" />
            <SparkSkeleton color="#3b82f6" />
          </div>
          <S className="h-4 w-10 rounded-md" />
        </div>

        {/* NO */}
        {/* <div className="flex justify-between items-center py-3">
          <div className="flex items-center gap-3">
            <S className="h-3 w-8" />
            <SparkSkeleton color="#22c55e" />
          </div>
          <S className="h-4 w-10 rounded-md" />
        </div> */}
      </div>
    </div>
  );
};

// ── Main ────────────────────────────────────────────────
export default function LoadingCard() {
  return (
    <div className=" bg-[#030305]/40 flex items-center justify-center">
      <MarketCardSkeleton />

      {/* Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }

        @keyframes sweep {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }

        .animate-shimmer {
          animation: shimmer 1.6s ease-in-out infinite;
        }

        .animate-sweep {
          animation: sweep 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
