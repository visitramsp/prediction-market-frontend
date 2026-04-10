"use client";
import AuthGuard from "@/components/AuthGuard";
import WatchList from "@/components/Layout/WatchList";
import PrivacyPolicy from "@/components/Pages/privacyPolicy/page";
import React from "react";

const index = () => {
  return (
    <AuthGuard>
      <WatchList />
    </AuthGuard>
  );
};

export default index;
