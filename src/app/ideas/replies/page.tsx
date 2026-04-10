"use client";
import AuthGuard from "@/components/AuthGuard";
import Replies from "@/components/Pages/ideas/component/replies/page";
import React from "react";

const index = () => {
  return (
    <AuthGuard>
      <Replies />
    </AuthGuard>
  );
};

export default index;
