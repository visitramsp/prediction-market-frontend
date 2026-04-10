"use client";
import React from "react";
import Ideas from "@/components/Pages/ideas/page";
import AuthGuard from "@/components/AuthGuard";
const index = () => {
  return (
    <AuthGuard>
      <Ideas />
    </AuthGuard>
  );
};

export default index;
