"use client";
import AuthGuard from "@/components/AuthGuard";
import FAQs from "@/components/Pages/ideas/component/faqs/page";
import React from "react";

const index = () => {
  return (
    <AuthGuard>
      <FAQs />
    </AuthGuard>
  );
};

export default index;
