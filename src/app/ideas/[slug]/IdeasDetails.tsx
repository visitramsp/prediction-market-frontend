"use client";

import AuthGuard from "@/components/AuthGuard";
import CommentPage from "@/components/Pages/ideas/component/comments/page";

export default function IdeasDetails({ targetId }: { targetId: string }) {
  return (
    <AuthGuard>
      <CommentPage />
    </AuthGuard>
  );
}
