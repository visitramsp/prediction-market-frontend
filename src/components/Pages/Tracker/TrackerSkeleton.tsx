"use client";

const Bone = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-2xl
      dark:bg-white/[0.02] bg-gray-200/30
      border dark:border-white/[0.04] border-gray-200/20
      dark:shadow-[0_0_30px_-10px_rgba(0,0,0,0.2)] shadow-sm ${className}`}
  />
);

const TrackerSkeleton = () => {
  return (
    <div className="space-y-5">
      {/* Row 1: 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Bone key={i} className="h-24" />
        ))}
      </div>

      {/* Row 2: ROI chart full width */}
      <Bone className="h-72" />

      {/* Row 3: Category + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Bone className="h-80" />
        <Bone className="h-80" />
      </div>

      {/* Row 4: Community + Follower */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Bone className="h-72" />
        <Bone className="h-72" />
      </div>

      {/* Row 5: Trades + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Bone className="h-64" />
        <Bone className="h-64" />
      </div>
    </div>
  );
};

export default TrackerSkeleton;
