"use client";
import AuthGuard from "@/components/AuthGuard";
import UserProfile from "@/components/Pages/userProfile/page";
import React from "react";

const index = () => {
  return (
    <AuthGuard>
      <UserProfile />
    </AuthGuard>
  );
};

export default index;
