"use client";
import AuthGuard from "@/components/AuthGuard";
import TermsAndConditions from "@/components/Pages/termsAndConditions/page";
import React from "react";

const index = () => {
  return (
    <AuthGuard>
      <TermsAndConditions />
    </AuthGuard>
  );
};

export default index;
