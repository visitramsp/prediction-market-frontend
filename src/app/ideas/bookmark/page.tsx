"use client";
import AuthGuard from "@/components/AuthGuard";
import BookMarks from "@/components/Pages/ideas/component/bookMarks/page";
import PrivacyPolicy from "@/components/Pages/privacyPolicy/page";
import React from "react";

const index = () => {
  return (
    <AuthGuard>
      <BookMarks />
    </AuthGuard>
  );
};

export default index;
