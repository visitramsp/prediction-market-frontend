"use client";
import React from "react";
import MessagesPage from "@/components/Pages/Chat/MessagesPage";
import AuthGuard from "@/components/AuthGuard";

const Messages = () => {
  return (
    <AuthGuard>
      <MessagesPage />
    </AuthGuard>
  );
};

export default Messages;
