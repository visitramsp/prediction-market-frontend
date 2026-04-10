"use client";

import AuthGuard from "@/components/AuthGuard";
import Profile from "@/components/Pages/ideas/component/profile/page";

export default function ProfileClient({ targetId }: { targetId: string }) {
  return (
    <AuthGuard>
      <Profile targetId={targetId} />
    </AuthGuard>
  );
}
