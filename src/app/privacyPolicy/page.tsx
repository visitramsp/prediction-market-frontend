"use client";
import AuthGuard from "@/components/AuthGuard";
import PrivacyPolicy from "@/components/Pages/privacyPolicy/page";
import React from "react";

const index = () => {
  return (
    <AuthGuard>
      <PrivacyPolicy />
    </AuthGuard>
  );
};

export default index;
