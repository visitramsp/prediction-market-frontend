import React, { Suspense } from "react";
import ReelsPage from "@/components/Pages/Reels/page";

const Reels = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[calc(100vh-64px)] bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReelsPage />
    </Suspense>
  );
};

export default Reels;
