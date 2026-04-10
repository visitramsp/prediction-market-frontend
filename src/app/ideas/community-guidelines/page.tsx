"use client";
import AuthGuard from "@/components/AuthGuard";
import CommunityGuidelines from "@/components/Pages/ideas/component/communityGuidelines/page";
import React from "react";

const index = () => {
  return (
    <AuthGuard>
      <CommunityGuidelines />
    </AuthGuard>
  );
};

export default index;
