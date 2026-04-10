import React from "react";

const LoadingCard = () => {
  return (
    <div
      className="w-full max-w-md rounded-2xl border
      bg-white border-gray-400
      dark:bg-[#15171b] dark:border-gray-700
      p-4 animate-pulse"
    >
      <div className="h-4 w-3/4 bg-gray-400 dark:bg-gray-700 rounded" />
      <div className="h-3 w-32 bg-gray-400 dark:bg-gray-700 rounded mt-2" />

      {/* YES skeleton */}
      <div className="mt-4 p-3 rounded-xl bg-gray-100 dark:bg-[#24282c]">
        <div className="flex justify-between">
          <div className="h-4 w-10 bg-gray-400 dark:bg-gray-700 rounded" />
          <div className="h-4 w-12 bg-gray-400 dark:bg-gray-700 rounded" />
        </div>
        <div className="mt-2 h-2 w-full bg-gray-400 dark:bg-gray-700 rounded" />
        <div className="mt-2 h-3 w-20 bg-gray-400 dark:bg-gray-700 rounded" />
      </div>

      {/* NO skeleton */}
      <div className="mt-3 p-3 rounded-xl bg-gray-100 dark:bg-[#24282c]">
        <div className="flex justify-between">
          <div className="h-4 w-10 bg-gray-400 dark:bg-gray-700 rounded" />
          <div className="h-4 w-12 bg-gray-400 dark:bg-gray-700 rounded" />
        </div>
        <div className="mt-2 h-2 w-full bg-gray-400 dark:bg-gray-700 rounded" />
        <div className="mt-2 h-3 w-20 bg-gray-400 dark:bg-gray-700 rounded" />
      </div>

      <div className="flex justify-between mt-4">
        <div className="flex gap-5">
          <div className="h-6 w-20 bg-gray-400 dark:bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-400 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-6 w-20 bg-gray-400 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
};

export default LoadingCard;
