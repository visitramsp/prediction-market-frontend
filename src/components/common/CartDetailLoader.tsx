import React from "react";

const MarketSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#09090b] pt-10 lg:pt-14 text-zinc-400">
      <div className="max-w-[1450px] mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-row items-center gap-6 mb-8 animate-pulse">
          <div className="w-20 h-20 bg-zinc-800/50 rounded-2xl border border-zinc-700/30" />
          <div className="w-full">
            <div className="h-7 w-48 bg-zinc-800 rounded-lg mb-3" />
            <div className="h-4 w-1/5 bg-zinc-800/60 rounded-md mb-3" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-6 w-20 bg-zinc-800/40 border border-zinc-700/20 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="md:col-span-2 animate-pulse">
            {/* Chart Area */}
            <div className="h-72 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl mb-8 relative overflow-hidden">
              {/* Decorative line to simulate a chart background */}
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/10 to-transparent" />
            </div>

            {/* Table Header */}
            <div className="flex justify-between mb-4 px-2">
              <div className="h-4 w-32 bg-zinc-800 rounded shadow-sm" />
              <div className="flex gap-12">
                <div className="h-4 w-16 bg-zinc-800 rounded" />
                <div className="h-4 w-16 bg-zinc-800 rounded" />
                <div className="h-4 w-16 bg-zinc-800 rounded" />
              </div>
            </div>

            {/* Table Rows */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-zinc-800/40 bg-zinc-900/20 rounded-xl p-4 mb-3"
              >
                <div className="h-5 w-48 bg-zinc-800/80 rounded-md" />
                <div className="flex gap-10 items-center">
                  <div className="h-4 w-14 bg-zinc-800/60 rounded" />
                  <div className="h-4 w-14 bg-zinc-800/60 rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-zinc-800/40 rounded-lg" />
                    <div className="h-8 w-16 bg-zinc-800/40 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar (Order Book Style) */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 animate-pulse">
            <div className="flex justify-between mb-6">
              <div className="h-5 w-24 bg-zinc-800 rounded-md" />
              <div className="h-5 w-16 bg-zinc-800/50 rounded-md" />
            </div>

            {/* Sell Orders */}
            <div className="space-y-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <div className="h-4 w-16 bg-red-900/20 rounded" />
                  <div className="h-4 w-16 bg-zinc-800/40 rounded" />
                </div>
              ))}
            </div>

            {/* Spread/Current Price */}
            <div className="h-10 w-full flex items-center justify-center bg-zinc-800/30 border border-zinc-700/20 rounded-xl my-4">
              <div className="h-4 w-24 bg-green-500/20 rounded-full" />
            </div>

            {/* Buy Orders */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <div className="h-4 w-16 bg-green-900/20 rounded" />
                  <div className="h-4 w-16 bg-zinc-800/40 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Transactions Card */}
        <div className="w-full rounded-2xl mt-8 border border-zinc-800/50 bg-zinc-900/20 p-6 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-48 rounded-lg bg-zinc-800"></div>
            <div className="h-4 w-24 rounded-md bg-zinc-800/50"></div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-4 items-center p-4 rounded-2xl border border-zinc-800/30 bg-zinc-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-zinc-800"></div>
                  <div className="h-4 w-20 bg-zinc-800/60 rounded" />
                </div>
                <div className="h-4 w-28 bg-zinc-800/40 rounded mx-auto" />
                <div className="h-4 w-24 bg-zinc-800/40 rounded mx-auto" />
                <div className="h-4 w-16 bg-zinc-800/80 rounded ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSkeleton;
