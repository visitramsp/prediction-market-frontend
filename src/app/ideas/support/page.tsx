"use client";
import AuthGuard from "@/components/AuthGuard";
import Supports from "@/components/Pages/ideas/component/supports/page";
import React from "react";

const index = () => {
  return (
    <AuthGuard>
      <Supports />
    </AuthGuard>
  );
};

export default index;
