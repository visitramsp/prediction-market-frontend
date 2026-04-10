"use client";

import React, { Suspense } from "react";
import Register from "@/components/Pages/auth/register";

const Reels = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[calc(100vh-64px)] bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <Register ref={""} />
    </Suspense>
  );
};

export default Reels;
